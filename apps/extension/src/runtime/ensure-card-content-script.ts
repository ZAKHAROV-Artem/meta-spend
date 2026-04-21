import { isSupportedCardUrl } from '../card-page';

type PingResponse = { ok?: boolean } | undefined;
const ATTACH_RETRY_DELAYS_MS = [0, 150, 350, 700, 1200];

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function matchPatternToRegex(pattern: string): RegExp {
  // Chrome match pattern format: <scheme>://<host>/<path>
  // Example: https://card.metamask.io/*
  const parts = pattern.match(/^(\*|http|https):\/\/([^/]+)\/(.*)$/);
  if (!parts) {
    throw new Error(`Invalid match pattern: ${pattern}`);
  }

  const [, scheme, host, path] = parts;
  const schemePattern = scheme === '*' ? 'https?' : escapeRegex(scheme);
  const hostPattern = escapeRegex(host).replace(/\\\*/g, '.*');
  const pathPattern = escapeRegex(path).replace(/\\\*/g, '.*');
  return new RegExp(`^${schemePattern}:\\/\\/${hostPattern}\\/${pathPattern}$`);
}

function getContentScriptFilesForUrl(url: string): string[] {
  const manifest = chrome.runtime.getManifest();
  const files = new Set<string>();
  console.log('[ensureCardContentScript] manifest:contentScripts', {
    url,
    contentScripts: manifest.content_scripts?.map((script) => ({
      matches: script.matches ?? [],
      js: script.js ?? [],
    })),
  });

  for (const script of manifest.content_scripts ?? []) {
    const matches = script.matches ?? [];
    const matched = matches.some((pattern) => {
      try {
        return matchPatternToRegex(pattern).test(url);
      } catch (error) {
        console.warn('[ensureCardContentScript] pattern-parse-error', { pattern, error });
        return false;
      }
    });
    if (!matched) continue;

    for (const file of script.js ?? []) {
      files.add(file);
    }
  }

  return [...files];
}

async function pingContentScript(tabId: number): Promise<boolean> {
  try {
    console.log('[ensureCardContentScript] ping:send', { tabId });
    const response = (await chrome.tabs.sendMessage(tabId, { type: 'PING' })) as PingResponse;
    console.log('[ensureCardContentScript] ping:response', { tabId, response });
    return response?.ok === true;
  } catch (error) {
    console.warn('[ensureCardContentScript] ping:error', { tabId, error });
    return false;
  }
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForContentScript(tabId: number): Promise<boolean> {
  console.log('[ensureCardContentScript] wait:start', {
    tabId,
    retryDelaysMs: ATTACH_RETRY_DELAYS_MS,
  });
  for (const delayMs of ATTACH_RETRY_DELAYS_MS) {
    if (delayMs > 0) {
      console.log('[ensureCardContentScript] wait:sleep', { tabId, delayMs });
      await sleep(delayMs);
    }

    console.log('[ensureCardContentScript] wait:pingAttempt', { tabId, delayMs });
    if (await pingContentScript(tabId)) {
      console.log('[ensureCardContentScript] wait:ready', { tabId, delayMs });
      return true;
    }
  }

  console.warn('[ensureCardContentScript] wait:timeout', { tabId });
  return false;
}

export async function ensureCardContentScript(tabId: number, url: string): Promise<boolean> {
  const supported = isSupportedCardUrl(url);
  console.log('[ensureCardContentScript] start', { tabId, url, supported });
  if (!supported) {
    console.warn('[ensureCardContentScript] unsupported-url', { tabId, url });
    return false;
  }

  if (await waitForContentScript(tabId)) {
    console.log('[ensureCardContentScript] already-attached', { tabId });
    return true;
  }

  const files = getContentScriptFilesForUrl(url);
  console.log('[ensureCardContentScript] resolve-files', { tabId, files });
  if (files.length === 0) {
    console.error('[ensureCardContentScript] no-content-script-files', { tabId, url });
    return false;
  }

  try {
    console.log('[ensureCardContentScript] executeScript:start', { tabId, files });
    await chrome.scripting.executeScript({
      target: { tabId },
      files,
    });
    console.log('[ensureCardContentScript] executeScript:success', { tabId });
  } catch (error) {
    console.error('[ensureCardContentScript] executeScript:error', { tabId, files, error });
    return waitForContentScript(tabId);
  }

  // MetaMask card pages can settle a moment after injection, so keep probing briefly.
  const attached = await waitForContentScript(tabId);
  console.log('[ensureCardContentScript] end', { tabId, attached });
  return attached;
}
