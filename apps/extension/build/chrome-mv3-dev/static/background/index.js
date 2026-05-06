(function(define){var __define; typeof define === "function" && (__define=define,define=null);
// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

(function (modules, entry, mainEntry, parcelRequireName, globalName) {
  /* eslint-disable no-undef */
  var globalObject =
    typeof globalThis !== 'undefined'
      ? globalThis
      : typeof self !== 'undefined'
      ? self
      : typeof window !== 'undefined'
      ? window
      : typeof global !== 'undefined'
      ? global
      : {};
  /* eslint-enable no-undef */

  // Save the require from previous bundle to this closure if any
  var previousRequire =
    typeof globalObject[parcelRequireName] === 'function' &&
    globalObject[parcelRequireName];

  var cache = previousRequire.cache || {};
  // Do not use `require` to prevent Webpack from trying to bundle this call
  var nodeRequire =
    typeof module !== 'undefined' &&
    typeof module.require === 'function' &&
    module.require.bind(module);

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire =
          typeof globalObject[parcelRequireName] === 'function' &&
          globalObject[parcelRequireName];
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error("Cannot find module '" + name + "'");
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = (cache[name] = new newRequire.Module(name));

      modules[name][0].call(
        module.exports,
        localRequire,
        module,
        module.exports,
        this
      );
    }

    return cache[name].exports;

    function localRequire(x) {
      var res = localRequire.resolve(x);
      return res === false ? {} : newRequire(res);
    }

    function resolve(x) {
      var id = modules[name][1][x];
      return id != null ? id : x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [
      function (require, module) {
        module.exports = exports;
      },
      {},
    ];
  };

  Object.defineProperty(newRequire, 'root', {
    get: function () {
      return globalObject[parcelRequireName];
    },
  });

  globalObject[parcelRequireName] = newRequire;

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (mainEntry) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(mainEntry);

    // CommonJS
    if (typeof exports === 'object' && typeof module !== 'undefined') {
      module.exports = mainExports;

      // RequireJS
    } else if (typeof define === 'function' && define.amd) {
      define(function () {
        return mainExports;
      });

      // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }
})({"sOyXq":[function(require,module,exports) {
var u = globalThis.process?.argv || [];
var h = ()=>globalThis.process?.env || {};
var B = new Set(u), _ = (e)=>B.has(e), G = u.filter((e)=>e.startsWith("--") && e.includes("=")).map((e)=>e.split("=")).reduce((e, [t, o])=>(e[t] = o, e), {});
var U = _("--dry-run"), g = ()=>_("--verbose") || h().VERBOSE === "true", N = g();
var m = (e = "", ...t)=>console.log(e.padEnd(9), "|", ...t);
var y = (...e)=>console.error("\uD83D\uDD34 ERROR".padEnd(9), "|", ...e), v = (...e)=>m("\uD83D\uDD35 INFO", ...e), f = (...e)=>m("\uD83D\uDFE0 WARN", ...e), M = 0, i = (...e)=>g() && m(`\u{1F7E1} ${M++}`, ...e);
var b = ()=>{
    let e = globalThis.browser?.runtime || globalThis.chrome?.runtime, t = ()=>setInterval(e.getPlatformInfo, 24e3);
    e.onStartup.addListener(t), t();
};
var n = {
    "isContentScript": false,
    "isBackground": true,
    "isReact": false,
    "runtimes": [
        "background-service-runtime"
    ],
    "host": "localhost",
    "port": 1815,
    "entryFilePath": "/home/zakharov/Documents/projects/crypto-finance-tracker/apps/extension/.plasmo/static/background/index.ts",
    "bundleId": "d7b9b2f81f818f0b",
    "envHash": "d99a5ffa57acd638",
    "verbose": "false",
    "secure": false,
    "serverPort": 40659
};
module.bundle.HMR_BUNDLE_ID = n.bundleId;
globalThis.process = {
    argv: [],
    env: {
        VERBOSE: n.verbose
    }
};
var D = module.bundle.Module;
function H(e) {
    D.call(this, e), this.hot = {
        data: module.bundle.hotData[e],
        _acceptCallbacks: [],
        _disposeCallbacks: [],
        accept: function(t) {
            this._acceptCallbacks.push(t || function() {});
        },
        dispose: function(t) {
            this._disposeCallbacks.push(t);
        }
    }, module.bundle.hotData[e] = void 0;
}
module.bundle.Module = H;
module.bundle.hotData = {};
var c = globalThis.browser || globalThis.chrome || null;
function R() {
    return !n.host || n.host === "0.0.0.0" ? location.protocol.indexOf("http") === 0 ? location.hostname : "localhost" : n.host;
}
function x() {
    return !n.host || n.host === "0.0.0.0" ? "localhost" : n.host;
}
function d() {
    return n.port || location.port;
}
var P = "__plasmo_runtime_page_", S = "__plasmo_runtime_script_";
var O = `${n.secure ? "https" : "http"}://${R()}:${d()}/`;
async function k(e = 1470) {
    for(;;)try {
        await fetch(O);
        break;
    } catch  {
        await new Promise((o)=>setTimeout(o, e));
    }
}
if (c.runtime.getManifest().manifest_version === 3) {
    let e = c.runtime.getURL("/__plasmo_hmr_proxy__?url=");
    globalThis.addEventListener("fetch", function(t) {
        let o = t.request.url;
        if (o.startsWith(e)) {
            let s = new URL(decodeURIComponent(o.slice(e.length)));
            s.hostname === n.host && s.port === `${n.port}` ? (s.searchParams.set("t", Date.now().toString()), t.respondWith(fetch(s).then((r)=>new Response(r.body, {
                    headers: {
                        "Content-Type": r.headers.get("Content-Type") ?? "text/javascript"
                    }
                })))) : t.respondWith(new Response("Plasmo HMR", {
                status: 200,
                statusText: "Testing"
            }));
        }
    });
}
function E(e, t) {
    let { modules: o } = e;
    return o ? !!o[t] : !1;
}
function C(e = d()) {
    let t = x();
    return `${n.secure || location.protocol === "https:" && !/localhost|127.0.0.1|0.0.0.0/.test(t) ? "wss" : "ws"}://${t}:${e}/`;
}
function L(e) {
    typeof e.message == "string" && y("[plasmo/parcel-runtime]: " + e.message);
}
function T(e) {
    if (typeof globalThis.WebSocket > "u") return;
    let t = new WebSocket(C(Number(d()) + 1));
    return t.addEventListener("message", async function(o) {
        let s = JSON.parse(o.data);
        await e(s);
    }), t.addEventListener("error", L), t;
}
function A(e) {
    if (typeof globalThis.WebSocket > "u") return;
    let t = new WebSocket(C());
    return t.addEventListener("message", async function(o) {
        let s = JSON.parse(o.data);
        if (s.type === "update" && await e(s.assets), s.type === "error") for (let r of s.diagnostics.ansi){
            let l = r.codeframe || r.stack;
            f("[plasmo/parcel-runtime]: " + r.message + `
` + l + `

` + r.hints.join(`
`));
        }
    }), t.addEventListener("error", L), t.addEventListener("open", ()=>{
        v(`[plasmo/parcel-runtime]: Connected to HMR server for ${n.entryFilePath}`);
    }), t.addEventListener("close", ()=>{
        f(`[plasmo/parcel-runtime]: Connection to the HMR server is closed for ${n.entryFilePath}`);
    }), t;
}
var w = module.bundle.parent, a = {
    buildReady: !1,
    bgChanged: !1,
    csChanged: !1,
    pageChanged: !1,
    scriptPorts: new Set,
    pagePorts: new Set
};
async function p(e = !1) {
    if (e || a.buildReady && a.pageChanged) {
        i("BGSW Runtime - reloading Page");
        for (let t of a.pagePorts)t.postMessage(null);
    }
    if (e || a.buildReady && (a.bgChanged || a.csChanged)) {
        i("BGSW Runtime - reloading CS");
        let t = await c?.tabs.query({
            active: !0
        });
        for (let o of a.scriptPorts){
            let s = t.some((r)=>r.id === o.sender.tab?.id);
            o.postMessage({
                __plasmo_cs_active_tab__: s
            });
        }
        c.runtime.reload();
    }
}
if (!w || !w.isParcelRequire) {
    b();
    let e = A(async (t)=>{
        i("BGSW Runtime - On HMR Update"), a.bgChanged ||= t.filter((s)=>s.envHash === n.envHash).some((s)=>E(module.bundle, s.id));
        let o = t.find((s)=>s.type === "json");
        if (o) {
            let s = new Set(t.map((l)=>l.id)), r = Object.values(o.depsByBundle).map((l)=>Object.values(l)).flat();
            a.bgChanged ||= r.every((l)=>s.has(l));
        }
        p();
    });
    e.addEventListener("open", ()=>{
        let t = setInterval(()=>e.send("ping"), 24e3);
        e.addEventListener("close", ()=>clearInterval(t));
    }), e.addEventListener("close", async ()=>{
        await k(), p(!0);
    });
}
T(async (e)=>{
    switch(i("BGSW Runtime - On Build Repackaged"), e.type){
        case "build_ready":
            a.buildReady ||= !0, p();
            break;
        case "cs_changed":
            a.csChanged ||= !0, p();
            break;
    }
});
c.runtime.onConnect.addListener(function(e) {
    let t = e.name.startsWith(P), o = e.name.startsWith(S);
    if (t || o) {
        let s = t ? a.pagePorts : a.scriptPorts;
        s.add(e), e.onDisconnect.addListener(()=>{
            s.delete(e);
        }), e.onMessage.addListener(function(r) {
            i("BGSW Runtime - On source changed", r), r.__plasmo_cs_changed__ && (a.csChanged ||= !0), r.__plasmo_page_changed__ && (a.pageChanged ||= !0), p();
        });
    }
});
c.runtime.onMessage.addListener(function(t) {
    return t.__plasmo_full_reload__ && (i("BGSW Runtime - On top-level code changed"), p()), !0;
});

},{}],"2w7px":[function(require,module,exports) {
var _background = require("../../../src/background");

},{"../../../src/background":"dvxeH"}],"dvxeH":[function(require,module,exports) {
var _background = require("../background");

},{"../background":"3lZMc"}],"3lZMc":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "STORAGE_API_TOKEN_KEY", ()=>STORAGE_API_TOKEN_KEY);
var _normalize = require("./src/lib/normalize");
var _api = require("./src/lib/api");
const STORAGE_API_TOKEN_KEY = "cryptotrackApiToken";
const LOG_PREFIX = "[CryptoTrack Card Capture]";
const STORAGE_KEY = "cardCaptures";
const SCRAPE_TIMEOUT_MS = 8000;
function withTimeout(promise, ms, message) {
    return new Promise((resolve, reject)=>{
        const timeout = setTimeout(()=>reject(new Error(message)), ms);
        promise.then((value)=>{
            clearTimeout(timeout);
            resolve(value);
        }, (error)=>{
            clearTimeout(timeout);
            reject(error);
        });
    });
}
function isCardPage(url) {
    if (!url) return false;
    try {
        const parsed = new URL(url);
        return parsed.hostname === "card.metamask.io" || parsed.hostname === "portfolio.metamask.io";
    } catch  {
        return false;
    }
}
/** Injected via `chrome.scripting.executeScript` \u2014 keep self-contained. */ function scrapeFromPage() {
    const capturedAt = new Date().toISOString();
    try {
        const cleanText = (value)=>(value ?? "").replace(/\s+/g, " ").trim();
        const textFrom = (root, selector)=>cleanText(root.querySelector(selector)?.textContent);
        const detailValue = (row, label)=>{
            const detailRows = Array.from(row.querySelectorAll(".transactionRow__details_row_container"));
            const match = detailRows.find((item)=>cleanText(item.querySelector("p:first-child")?.textContent) === label);
            if (!match) return null;
            return cleanText(match.querySelector("p:last-child")?.textContent) || null;
        };
        const fundingValue = (row, label)=>{
            const fundingRows = Array.from(row.querySelectorAll(".transactionRow__details_funding_row"));
            const match = fundingRows.find((item)=>cleanText(item.querySelector("p:first-child")?.textContent) === label);
            if (!match) return null;
            return cleanText(match.querySelector("p:last-child")?.textContent) || null;
        };
        const parseTransaction = (row)=>({
                merchant: textFrom(row, ".transactionRow__details_row_merchant"),
                time: textFrom(row, ".transactionRow__summary_title_container p:last-child"),
                amount: textFrom(row, ".transactionRow__summary_container > div:last-child p:first-child"),
                type: textFrom(row, ".transactionRow__summary_container > div:last-child p:last-child"),
                status: detailValue(row, "Status"),
                transactionId: detailValue(row, "Transaction ID"),
                date: detailValue(row, "Date"),
                cardPan: detailValue(row, "Card PAN"),
                source: fundingValue(row, "Source"),
                spent: fundingValue(row, "Spent"),
                gasFee: fundingValue(row, "Gas fee")
            });
        const list = document.querySelector(".transactionList__main_container") ?? document.querySelector("main") ?? document.body;
        if (!list) return {
            ok: false,
            error: "Could not find document body.",
            sourceUrl: location.href,
            capturedAt
        };
        const rowsFromDom = Array.from(list.querySelectorAll(".transactionRow__accordion_main_container"));
        const transactions = rowsFromDom.map(parseTransaction);
        return {
            ok: true,
            html: "",
            sourceUrl: location.href,
            capturedAt,
            transactionCount: transactions.length,
            transactions
        };
    } catch (error) {
        return {
            ok: false,
            error: error instanceof Error ? error.message : String(error),
            sourceUrl: location.href,
            capturedAt
        };
    }
}
async function getActiveTab() {
    const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });
    return tab ?? null;
}
async function askContentScript(tabId) {
    console.log(LOG_PREFIX, "asking content script to scrape tab", tabId);
    return withTimeout(chrome.tabs.sendMessage(tabId, {
        type: "SCRAPE_CARD_HTML"
    }), SCRAPE_TIMEOUT_MS, "Timed out waiting for the MetaMask page scraper.");
}
async function executeFallbackScraper(tabId) {
    console.log(LOG_PREFIX, "content script was not ready, injecting fallback scraper into tab", tabId);
    const [result] = await chrome.scripting.executeScript({
        target: {
            tabId
        },
        func: scrapeFromPage
    });
    return result?.result ?? {
        ok: false,
        error: "Script executed but returned no result.",
        capturedAt: new Date().toISOString()
    };
}
async function captureTab(tab) {
    console.log(LOG_PREFIX, "capture requested for active tab", {
        id: tab.id,
        url: tab.url
    });
    if (!tab.id) return {
        ok: false,
        error: "Active tab has no id.",
        sourceUrl: tab.url,
        capturedAt: new Date().toISOString()
    };
    if (!isCardPage(tab.url)) return {
        ok: false,
        error: "Open card.metamask.io or portfolio.metamask.io before syncing.",
        sourceUrl: tab.url,
        capturedAt: new Date().toISOString()
    };
    try {
        const result = await askContentScript(tab.id);
        console.log(LOG_PREFIX, "content script scrape finished", result.ok ? result.transactionCount : result.error);
        return result;
    } catch (error) {
        console.warn(LOG_PREFIX, "content script scrape failed, trying fallback injection", error);
        return withTimeout(executeFallbackScraper(tab.id), SCRAPE_TIMEOUT_MS, "Timed out while injecting the fallback scraper.");
    }
}
async function saveCapture(jobId, result) {
    const savedCapture = {
        ...result,
        jobId,
        savedAt: new Date().toISOString()
    };
    const current = await chrome.storage.local.get(STORAGE_KEY);
    const captures = Array.isArray(current[STORAGE_KEY]) ? current[STORAGE_KEY] : [];
    const nextCaptures = [
        savedCapture,
        ...captures
    ].slice(0, 20);
    await chrome.storage.local.set({
        [STORAGE_KEY]: nextCaptures
    });
    console.log(LOG_PREFIX, "saved capture in chrome.storage.local", {
        jobId,
        ok: savedCapture.ok,
        transactionCount: savedCapture.ok ? savedCapture.transactionCount : 0
    });
    return savedCapture;
}
async function getStoredApiToken() {
    const v = await chrome.storage.local.get(STORAGE_API_TOKEN_KEY);
    const token = v[STORAGE_API_TOKEN_KEY];
    return typeof token === "string" && token.length > 0 ? token : undefined;
}
chrome.runtime.onMessage.addListener((message, _sender, sendResponse)=>{
    if (message?.type !== "CAPTURE_CARD_HTML") return false;
    console.log(LOG_PREFIX, "capture request from popup");
    (async ()=>{
        const jobId = crypto.randomUUID();
        try {
            const tab = await getActiveTab();
            const result = tab ? await captureTab(tab) : {
                ok: false,
                error: "No active tab found.",
                capturedAt: new Date().toISOString()
            };
            await saveCapture(jobId, result);
            if (!result.ok) {
                sendResponse({
                    ok: false,
                    error: result.error,
                    jobId
                });
                return;
            }
            const token = await getStoredApiToken();
            const items = (0, _normalize.scrapedManyToParsedPayload)(result.transactions);
            const parserVersionUsed = (0, _normalize.CARD_PARSER_VERSION);
            if (!token) {
                sendResponse({
                    ok: true,
                    jobId,
                    scrapeOk: true,
                    transactionCount: result.transactionCount,
                    parsedItems: items.length,
                    synced: false,
                    message: `Scraped ${result.transactionCount} rows. Pair the extension first to push transactions.`
                });
                return;
            }
            try {
                const sync = await (0, _api.syncCardTransactions)(token, {
                    parserVersion: parserVersionUsed,
                    items
                });
                console.log(LOG_PREFIX, "API sync OK", sync);
                sendResponse({
                    ok: true,
                    jobId,
                    scrapeOk: true,
                    transactionCount: result.transactionCount,
                    synced: true,
                    inserted: sync.inserted,
                    updated: sync.updated,
                    skippedDuplicateInBatch: sync.skipped
                });
            } catch (syncErr) {
                const syncMessage = syncErr instanceof Error ? syncErr.message : String(syncErr);
                console.warn(LOG_PREFIX, "API sync failed", syncErr);
                sendResponse({
                    ok: false,
                    jobId,
                    scrapeOk: true,
                    error: syncMessage,
                    detail: `Scrape saved locally; sync failed: ${syncMessage}`
                });
            }
        } catch (outer) {
            const errMsg = outer instanceof Error ? outer.message : String(outer);
            console.error(LOG_PREFIX, "capture job failed", outer);
            await saveCapture(jobId, {
                ok: false,
                error: errMsg,
                capturedAt: new Date().toISOString()
            });
            sendResponse({
                ok: false,
                error: errMsg,
                jobId
            });
        }
    })();
    return true;
});

},{"./src/lib/normalize":"igUOy","./src/lib/api":"QLfym","@parcel/transformer-js/src/esmodule-helpers.js":"5G9Z5"}],"igUOy":[function(require,module,exports) {
/**
 * Rows from DOM scrape (`merchant`\u2026) or snapshots using `title` / nested `funding`.
 */ var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "CARD_PARSER_VERSION", ()=>CARD_PARSER_VERSION);
/** Parses DD/MM/YYYY hh:mm am/pm in local TZ, e.g. `04/05/2026 09:51 pm` */ parcelHelpers.export(exports, "ukDateTimeMeridianToIso", ()=>ukDateTimeMeridianToIso);
parcelHelpers.export(exports, "splitMoneyToken", ()=>splitMoneyToken);
parcelHelpers.export(exports, "splitCryptoSpend", ()=>splitCryptoSpend);
parcelHelpers.export(exports, "scrapedToParsedCardTx", ()=>scrapedToParsedCardTx);
parcelHelpers.export(exports, "scrapedManyToParsedPayload", ()=>scrapedManyToParsedPayload);
const CARD_PARSER_VERSION = 2;
function normalizeStatus(raw) {
    const key = (raw ?? "").trim().toUpperCase();
    switch(key){
        case "PENDING":
        case "AUTHORIZED":
            return "PENDING";
        case "COMPLETE":
        case "COMPLETED":
        case "SETTLED":
            return "SETTLED";
        case "DECLINED":
        case "CANCELLED":
        case "CANCELED":
            return "DECLINED";
        case "REFUND":
        case "REFUNDED":
            return "REFUNDED";
        default:
            return "SETTLED";
    }
}
function ukDateTimeMeridianToIso(raw) {
    const s = raw?.trim();
    if (!s) return null;
    const re = /^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{1,2}):(\d{2})\s*(am|pm)$/iu;
    const m = re.exec(s);
    if (!m) {
        const d = new Date(s);
        return Number.isNaN(d.getTime()) ? null : d.toISOString();
    }
    let hour = Number(m[4]);
    const minute = Number(m[5]);
    const ampm = m[6].toLowerCase();
    const day = Number(m[1]);
    const month = Number(m[2]);
    const year = Number(m[3]);
    if (hour < 12 && ampm === "pm") hour += 12;
    if (hour === 12 && ampm === "am") hour = 0;
    const date = new Date(year, month - 1, day, hour, minute, 0, 0);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
}
function splitMoneyToken(raw) {
    const s = raw?.trim()?.replace(/^,/u, "");
    if (!s) return null;
    const m = /^(-?\d+(?:\.\d+)?)\s+(.+)$/u.exec(s);
    if (!m) return null;
    return {
        numeric: m[1],
        currencyRaw: m[2].trim()
    };
}
function cryptoSymbolDisplay(currencyRaw) {
    const trimmed = currencyRaw.trim();
    const compact = trimmed.replace(/\s+/gu, "").toUpperCase();
    if (/\bMM?USD\b|\bMILLI\s?USD\b/iu.test(trimmed) || /M+M?USD/iu.test(compact)) return "MUSD";
    return compact.slice(0, 32);
}
function splitCryptoSpend(raw) {
    const parts = splitMoneyToken(raw?.trim());
    if (!parts) return null;
    const symbol = cryptoSymbolDisplay(parts.currencyRaw);
    return {
        numeric: parts.numeric,
        symbol
    };
}
function scrapedToParsedCardTx(row) {
    const ext = row.transactionId?.trim();
    if (!ext) return null;
    const merchantName = (row.merchant?.trim() ?? row.title?.trim() ?? "Unknown merchant").slice(0, 512);
    const composedDateTime = typeof row.date === "string" && typeof row.time === "string" ? row.date.includes(row.time.trim()) ? row.date.trim() : `${row.date.replace(/\s+.*$/u, "").trim()} ${row.time.trim()}` : row.date;
    const occurredAt = ukDateTimeMeridianToIso(composedDateTime);
    if (!occurredAt) return null;
    const fiat = splitMoneyToken(row.amount);
    if (!fiat) return null;
    const fiatCurrency = fiat.currencyRaw.slice(0, 8).toUpperCase();
    const spentRaw = row.funding?.spent ?? row.spent ?? null;
    let cryptoParsed = splitCryptoSpend(spentRaw);
    let cryptoAmount = cryptoParsed?.numeric ?? null;
    let cryptoSymbol = cryptoParsed?.symbol ?? null;
    /** Some entries only expose fiat spend */ if (cryptoAmount === null) {
        cryptoAmount = fiat.numeric;
        cryptoSymbol = fiatCurrency;
    }
    const fundingMasked = row.funding?.source?.trim() ?? row.source?.trim() ?? null;
    return {
        externalId: ext.slice(0, 512),
        occurredAt,
        merchantName,
        fiatAmount: fiat.numeric,
        fiatCurrency,
        merchantRaw: `${row.cardPan ?? ""}|${row.type ?? ""}|${row.gasFee ?? row.funding?.gasFee ?? ""}|${spentRaw ?? ""}`.replace(/\|\|+/gu, "|").slice(0, 2048) || undefined,
        cryptoAmount,
        cryptoSymbol,
        fundingSourceMasked: fundingMasked ?? null,
        status: normalizeStatus(row.status),
        parserVersion: CARD_PARSER_VERSION
    };
}
function scrapedManyToParsedPayload(rows) {
    const out = [];
    const seenExternal = new Set();
    for (const row of rows){
        const parsed = scrapedToParsedCardTx(row);
        if (!parsed) continue;
        if (seenExternal.has(parsed.externalId)) continue;
        seenExternal.add(parsed.externalId);
        out.push(parsed);
    }
    return out;
}

},{"@parcel/transformer-js/src/esmodule-helpers.js":"5G9Z5"}],"5G9Z5":[function(require,module,exports) {
exports.interopDefault = function(a) {
    return a && a.__esModule ? a : {
        default: a
    };
};
exports.defineInteropFlag = function(a) {
    Object.defineProperty(a, "__esModule", {
        value: true
    });
};
exports.exportAll = function(source, dest) {
    Object.keys(source).forEach(function(key) {
        if (key === "default" || key === "__esModule" || dest.hasOwnProperty(key)) return;
        Object.defineProperty(dest, key, {
            enumerable: true,
            get: function() {
                return source[key];
            }
        });
    });
    return dest;
};
exports.export = function(dest, destName, get) {
    Object.defineProperty(dest, destName, {
        enumerable: true,
        get: get
    });
};

},{}],"QLfym":[function(require,module,exports) {
/** Matches `@crypto-tracker/shared` ParsedCardTx / POST body without pulling built artifacts. */ var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "API_URL", ()=>API_URL);
parcelHelpers.export(exports, "pairExtension", ()=>pairExtension);
parcelHelpers.export(exports, "syncCardTransactions", ()=>syncCardTransactions);
const API_URL = undefined ?? "http://localhost:4001/api/v1";
async function pairExtension(code) {
    const controller = new AbortController();
    const timeout = globalThis.setTimeout(()=>controller.abort(), 12000);
    const res = await fetch(`${API_URL}/auth/extension/pair`, {
        method: "POST",
        headers: {
            "content-type": "application/json",
            accept: "application/json"
        },
        body: JSON.stringify({
            code: code.trim()
        }),
        signal: controller.signal
    }).finally(()=>globalThis.clearTimeout(timeout));
    const body = await res.json().catch(()=>null);
    if (!res.ok) {
        let msg = `pair failed (${res.status})`;
        const m = body?.message;
        if (Array.isArray(m)) msg = m.join("; ");
        else if (typeof m === "string") msg = m;
        else if (m !== undefined && m !== null) msg = JSON.stringify(m);
        throw new Error(msg);
    }
    const token = body?.token;
    if (!token) throw new Error("Malformed pair response.");
    return {
        token
    };
}
async function syncCardTransactions(bearerToken, payload) {
    const controller = new AbortController();
    const timeout = setTimeout(()=>controller.abort(), 15000);
    const res = await fetch(`${API_URL}/card-transactions/sync`, {
        method: "POST",
        headers: {
            "content-type": "application/json",
            accept: "application/json",
            authorization: `Bearer ${bearerToken}`
        },
        body: JSON.stringify(payload),
        signal: controller.signal
    }).finally(()=>clearTimeout(timeout));
    const body = await res.json().catch(()=>null);
    if (!res.ok) {
        let msg = `sync failed (${res.status})`;
        if (body && typeof body === "object" && body.message !== undefined) {
            const m = body.message;
            msg = typeof m === "string" ? m : JSON.stringify(m);
        }
        throw new Error(msg);
    }
    return {
        inserted: Number(body?.inserted ?? 0),
        updated: Number(body?.updated ?? 0),
        skipped: Number(body?.skipped ?? 0)
    };
}

},{"@parcel/transformer-js/src/esmodule-helpers.js":"5G9Z5"}]},["sOyXq","2w7px"], "2w7px", "parcelRequire258f")

//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QU8sTUFBTSxVQUFVLE1BQU07YUFDakMsSUFBSSxNQUFNLGFBQWEsTUFBTSxNQUFNLE1BQU0sS0FBSyxVQUFVO1FBQzdELE1BQU0sSUFBSSxNQUFNO0lBQ2xCO0lBRUEsTUFBTSxRQUFRLE1BQU07SUFDcEIsSUFBSSxDQUFDLE9BQ0gsTUFBTSxJQUFJLE1BQU07SUFHbEIsT0FBTztRQUFFO0lBQU07QUFDakI7QUFFTyxlQUFlLHFCQUNwQixXQUFtQixFQUNuQixPQUF5QjtJQUV6QixNQUFNLGFBQWEsSUFBSTtJQUN2QixNQUFNLFVBQVUsV0FBVyxJQUFNLFdBQVcsU0FBUztJQUNyRCxNQUFNLE1BQU0sTUFBTSxNQUFNLENBQUMsRUFBRSxRQUFRLHVCQUF1QixDQUFDLEVBQUU7UUFDM0QsUUFBUTtRQUNSLFNBQVM7WUFDUCxnQkFBZ0I7WUFDaEIsUUFBUTtZQUNSLGVBQWUsQ0FBQyxPQUFPLEVBQUUsWUFBWSxDQUFDO1FBQ3hDO1FBQ0EsTUFBTSxLQUFLLFVBQVU7UUFDckIsUUFBUSxXQUFXO0lBQ3JCLEdBQUcsUUFBUSxJQUFNLGFBQWE7SUFFOUIsTUFBTSxPQUFRLE1BQU0sSUFBSSxPQUFPLE1BQU0sSUFBTTtJQUkzQyxJQUFJLENBQUMsSUFBSSxJQUFJO1FBQ1gsSUFBSSxNQUFNLENBQUMsYUFBYSxFQUFFLElBQUksT0FBTyxDQUFDLENBQUM7UUFDdkMsSUFBSSxRQUFRLE9BQU8sU0FBUyxZQUFZLEtBQUssWUFBWSxXQUFXO1lBQ2xFLE1BQU0sSUFBSSxLQUFLO1lBQ2YsTUFBTSxPQUFPLE1BQU0sV0FBVyxJQUFJLEtBQUssVUFBVTtRQUNuRDtRQUNBLE1BQU0sSUFBSSxNQUFNO0lBQ2xCO0lBRUEsT0FBTztRQUNMLFVBQVUsT0FBTyxNQUFNLFlBQVk7UUFDbkMsU0FBUyxPQUFPLE1BQU0sV0FBVztRQUNqQyxTQUFTLE9BQU8sTUFBTSxXQUFXO0lBQ25DO0FBQ0YiLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy8ucG5wbS9AcGxhc21vaHErcGFyY2VsLXJ1bnRpbWVAMC4yNS4yL25vZGVfbW9kdWxlcy9AcGxhc21vaHEvcGFyY2VsLXJ1bnRpbWUvZGlzdC9ydW50aW1lLTcxYzRiZDllMjVkNTk0ZjkuanMiLCJhcHBzL2V4dGVuc2lvbi8ucGxhc21vL3N0YXRpYy9iYWNrZ3JvdW5kL2luZGV4LnRzIiwiYXBwcy9leHRlbnNpb24vc3JjL2JhY2tncm91bmQudHMiLCJhcHBzL2V4dGVuc2lvbi9iYWNrZ3JvdW5kLnRzIiwiYXBwcy9leHRlbnNpb24vc3JjL2xpYi9ub3JtYWxpemUudHMiLCJub2RlX21vZHVsZXMvLnBucG0vQHBhcmNlbCt0cmFuc2Zvcm1lci1qc0AyLjkuM19AcGFyY2VsK2NvcmVAMi45LjMvbm9kZV9tb2R1bGVzL0BwYXJjZWwvdHJhbnNmb3JtZXItanMvc3JjL2VzbW9kdWxlLWhlbHBlcnMuanMiLCJhcHBzL2V4dGVuc2lvbi9zcmMvbGliL2FwaS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgdT1nbG9iYWxUaGlzLnByb2Nlc3M/LmFyZ3Z8fFtdO3ZhciBoPSgpPT5nbG9iYWxUaGlzLnByb2Nlc3M/LmVudnx8e307dmFyIEI9bmV3IFNldCh1KSxfPWU9PkIuaGFzKGUpLEc9dS5maWx0ZXIoZT0+ZS5zdGFydHNXaXRoKFwiLS1cIikmJmUuaW5jbHVkZXMoXCI9XCIpKS5tYXAoZT0+ZS5zcGxpdChcIj1cIikpLnJlZHVjZSgoZSxbdCxvXSk9PihlW3RdPW8sZSkse30pO3ZhciBVPV8oXCItLWRyeS1ydW5cIiksZz0oKT0+XyhcIi0tdmVyYm9zZVwiKXx8aCgpLlZFUkJPU0U9PT1cInRydWVcIixOPWcoKTt2YXIgbT0oZT1cIlwiLC4uLnQpPT5jb25zb2xlLmxvZyhlLnBhZEVuZCg5KSxcInxcIiwuLi50KTt2YXIgeT0oLi4uZSk9PmNvbnNvbGUuZXJyb3IoXCJcXHV7MUY1MzR9IEVSUk9SXCIucGFkRW5kKDkpLFwifFwiLC4uLmUpLHY9KC4uLmUpPT5tKFwiXFx1ezFGNTM1fSBJTkZPXCIsLi4uZSksZj0oLi4uZSk9Pm0oXCJcXHV7MUY3RTB9IFdBUk5cIiwuLi5lKSxNPTAsaT0oLi4uZSk9PmcoKSYmbShgXFx1ezFGN0UxfSAke00rK31gLC4uLmUpO3ZhciBiPSgpPT57bGV0IGU9Z2xvYmFsVGhpcy5icm93c2VyPy5ydW50aW1lfHxnbG9iYWxUaGlzLmNocm9tZT8ucnVudGltZSx0PSgpPT5zZXRJbnRlcnZhbChlLmdldFBsYXRmb3JtSW5mbywyNGUzKTtlLm9uU3RhcnR1cC5hZGRMaXN0ZW5lcih0KSx0KCl9O3ZhciBuPXtcImlzQ29udGVudFNjcmlwdFwiOmZhbHNlLFwiaXNCYWNrZ3JvdW5kXCI6dHJ1ZSxcImlzUmVhY3RcIjpmYWxzZSxcInJ1bnRpbWVzXCI6W1wiYmFja2dyb3VuZC1zZXJ2aWNlLXJ1bnRpbWVcIl0sXCJob3N0XCI6XCJsb2NhbGhvc3RcIixcInBvcnRcIjoxODE1LFwiZW50cnlGaWxlUGF0aFwiOlwiL2hvbWUvemFraGFyb3YvRG9jdW1lbnRzL3Byb2plY3RzL2NyeXB0by1maW5hbmNlLXRyYWNrZXIvYXBwcy9leHRlbnNpb24vLnBsYXNtby9zdGF0aWMvYmFja2dyb3VuZC9pbmRleC50c1wiLFwiYnVuZGxlSWRcIjpcImQ3YjliMmY4MWY4MThmMGJcIixcImVudkhhc2hcIjpcImQ5OWE1ZmZhNTdhY2Q2MzhcIixcInZlcmJvc2VcIjpcImZhbHNlXCIsXCJzZWN1cmVcIjpmYWxzZSxcInNlcnZlclBvcnRcIjo0MDY1OX07bW9kdWxlLmJ1bmRsZS5ITVJfQlVORExFX0lEPW4uYnVuZGxlSWQ7Z2xvYmFsVGhpcy5wcm9jZXNzPXthcmd2OltdLGVudjp7VkVSQk9TRTpuLnZlcmJvc2V9fTt2YXIgRD1tb2R1bGUuYnVuZGxlLk1vZHVsZTtmdW5jdGlvbiBIKGUpe0QuY2FsbCh0aGlzLGUpLHRoaXMuaG90PXtkYXRhOm1vZHVsZS5idW5kbGUuaG90RGF0YVtlXSxfYWNjZXB0Q2FsbGJhY2tzOltdLF9kaXNwb3NlQ2FsbGJhY2tzOltdLGFjY2VwdDpmdW5jdGlvbih0KXt0aGlzLl9hY2NlcHRDYWxsYmFja3MucHVzaCh0fHxmdW5jdGlvbigpe30pfSxkaXNwb3NlOmZ1bmN0aW9uKHQpe3RoaXMuX2Rpc3Bvc2VDYWxsYmFja3MucHVzaCh0KX19LG1vZHVsZS5idW5kbGUuaG90RGF0YVtlXT12b2lkIDB9bW9kdWxlLmJ1bmRsZS5Nb2R1bGU9SDttb2R1bGUuYnVuZGxlLmhvdERhdGE9e307dmFyIGM9Z2xvYmFsVGhpcy5icm93c2VyfHxnbG9iYWxUaGlzLmNocm9tZXx8bnVsbDtmdW5jdGlvbiBSKCl7cmV0dXJuIW4uaG9zdHx8bi5ob3N0PT09XCIwLjAuMC4wXCI/bG9jYXRpb24ucHJvdG9jb2wuaW5kZXhPZihcImh0dHBcIik9PT0wP2xvY2F0aW9uLmhvc3RuYW1lOlwibG9jYWxob3N0XCI6bi5ob3N0fWZ1bmN0aW9uIHgoKXtyZXR1cm4hbi5ob3N0fHxuLmhvc3Q9PT1cIjAuMC4wLjBcIj9cImxvY2FsaG9zdFwiOm4uaG9zdH1mdW5jdGlvbiBkKCl7cmV0dXJuIG4ucG9ydHx8bG9jYXRpb24ucG9ydH12YXIgUD1cIl9fcGxhc21vX3J1bnRpbWVfcGFnZV9cIixTPVwiX19wbGFzbW9fcnVudGltZV9zY3JpcHRfXCI7dmFyIE89YCR7bi5zZWN1cmU/XCJodHRwc1wiOlwiaHR0cFwifTovLyR7UigpfToke2QoKX0vYDthc3luYyBmdW5jdGlvbiBrKGU9MTQ3MCl7Zm9yKDs7KXRyeXthd2FpdCBmZXRjaChPKTticmVha31jYXRjaHthd2FpdCBuZXcgUHJvbWlzZShvPT5zZXRUaW1lb3V0KG8sZSkpfX1pZihjLnJ1bnRpbWUuZ2V0TWFuaWZlc3QoKS5tYW5pZmVzdF92ZXJzaW9uPT09Myl7bGV0IGU9Yy5ydW50aW1lLmdldFVSTChcIi9fX3BsYXNtb19obXJfcHJveHlfXz91cmw9XCIpO2dsb2JhbFRoaXMuYWRkRXZlbnRMaXN0ZW5lcihcImZldGNoXCIsZnVuY3Rpb24odCl7bGV0IG89dC5yZXF1ZXN0LnVybDtpZihvLnN0YXJ0c1dpdGgoZSkpe2xldCBzPW5ldyBVUkwoZGVjb2RlVVJJQ29tcG9uZW50KG8uc2xpY2UoZS5sZW5ndGgpKSk7cy5ob3N0bmFtZT09PW4uaG9zdCYmcy5wb3J0PT09YCR7bi5wb3J0fWA/KHMuc2VhcmNoUGFyYW1zLnNldChcInRcIixEYXRlLm5vdygpLnRvU3RyaW5nKCkpLHQucmVzcG9uZFdpdGgoZmV0Y2gocykudGhlbihyPT5uZXcgUmVzcG9uc2Uoci5ib2R5LHtoZWFkZXJzOntcIkNvbnRlbnQtVHlwZVwiOnIuaGVhZGVycy5nZXQoXCJDb250ZW50LVR5cGVcIik/P1widGV4dC9qYXZhc2NyaXB0XCJ9fSkpKSk6dC5yZXNwb25kV2l0aChuZXcgUmVzcG9uc2UoXCJQbGFzbW8gSE1SXCIse3N0YXR1czoyMDAsc3RhdHVzVGV4dDpcIlRlc3RpbmdcIn0pKX19KX1mdW5jdGlvbiBFKGUsdCl7bGV0e21vZHVsZXM6b309ZTtyZXR1cm4gbz8hIW9bdF06ITF9ZnVuY3Rpb24gQyhlPWQoKSl7bGV0IHQ9eCgpO3JldHVybmAke24uc2VjdXJlfHxsb2NhdGlvbi5wcm90b2NvbD09PVwiaHR0cHM6XCImJiEvbG9jYWxob3N0fDEyNy4wLjAuMXwwLjAuMC4wLy50ZXN0KHQpP1wid3NzXCI6XCJ3c1wifTovLyR7dH06JHtlfS9gfWZ1bmN0aW9uIEwoZSl7dHlwZW9mIGUubWVzc2FnZT09XCJzdHJpbmdcIiYmeShcIltwbGFzbW8vcGFyY2VsLXJ1bnRpbWVdOiBcIitlLm1lc3NhZ2UpfWZ1bmN0aW9uIFQoZSl7aWYodHlwZW9mIGdsb2JhbFRoaXMuV2ViU29ja2V0PlwidVwiKXJldHVybjtsZXQgdD1uZXcgV2ViU29ja2V0KEMoTnVtYmVyKGQoKSkrMSkpO3JldHVybiB0LmFkZEV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsYXN5bmMgZnVuY3Rpb24obyl7bGV0IHM9SlNPTi5wYXJzZShvLmRhdGEpO2F3YWl0IGUocyl9KSx0LmFkZEV2ZW50TGlzdGVuZXIoXCJlcnJvclwiLEwpLHR9ZnVuY3Rpb24gQShlKXtpZih0eXBlb2YgZ2xvYmFsVGhpcy5XZWJTb2NrZXQ+XCJ1XCIpcmV0dXJuO2xldCB0PW5ldyBXZWJTb2NrZXQoQygpKTtyZXR1cm4gdC5hZGRFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLGFzeW5jIGZ1bmN0aW9uKG8pe2xldCBzPUpTT04ucGFyc2Uoby5kYXRhKTtpZihzLnR5cGU9PT1cInVwZGF0ZVwiJiZhd2FpdCBlKHMuYXNzZXRzKSxzLnR5cGU9PT1cImVycm9yXCIpZm9yKGxldCByIG9mIHMuZGlhZ25vc3RpY3MuYW5zaSl7bGV0IGw9ci5jb2RlZnJhbWV8fHIuc3RhY2s7ZihcIltwbGFzbW8vcGFyY2VsLXJ1bnRpbWVdOiBcIityLm1lc3NhZ2UrYFxuYCtsK2BcblxuYCtyLmhpbnRzLmpvaW4oYFxuYCkpfX0pLHQuYWRkRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsTCksdC5hZGRFdmVudExpc3RlbmVyKFwib3BlblwiLCgpPT57dihgW3BsYXNtby9wYXJjZWwtcnVudGltZV06IENvbm5lY3RlZCB0byBITVIgc2VydmVyIGZvciAke24uZW50cnlGaWxlUGF0aH1gKX0pLHQuYWRkRXZlbnRMaXN0ZW5lcihcImNsb3NlXCIsKCk9PntmKGBbcGxhc21vL3BhcmNlbC1ydW50aW1lXTogQ29ubmVjdGlvbiB0byB0aGUgSE1SIHNlcnZlciBpcyBjbG9zZWQgZm9yICR7bi5lbnRyeUZpbGVQYXRofWApfSksdH12YXIgdz1tb2R1bGUuYnVuZGxlLnBhcmVudCxhPXtidWlsZFJlYWR5OiExLGJnQ2hhbmdlZDohMSxjc0NoYW5nZWQ6ITEscGFnZUNoYW5nZWQ6ITEsc2NyaXB0UG9ydHM6bmV3IFNldCxwYWdlUG9ydHM6bmV3IFNldH07YXN5bmMgZnVuY3Rpb24gcChlPSExKXtpZihlfHxhLmJ1aWxkUmVhZHkmJmEucGFnZUNoYW5nZWQpe2koXCJCR1NXIFJ1bnRpbWUgLSByZWxvYWRpbmcgUGFnZVwiKTtmb3IobGV0IHQgb2YgYS5wYWdlUG9ydHMpdC5wb3N0TWVzc2FnZShudWxsKX1pZihlfHxhLmJ1aWxkUmVhZHkmJihhLmJnQ2hhbmdlZHx8YS5jc0NoYW5nZWQpKXtpKFwiQkdTVyBSdW50aW1lIC0gcmVsb2FkaW5nIENTXCIpO2xldCB0PWF3YWl0IGM/LnRhYnMucXVlcnkoe2FjdGl2ZTohMH0pO2ZvcihsZXQgbyBvZiBhLnNjcmlwdFBvcnRzKXtsZXQgcz10LnNvbWUocj0+ci5pZD09PW8uc2VuZGVyLnRhYj8uaWQpO28ucG9zdE1lc3NhZ2Uoe19fcGxhc21vX2NzX2FjdGl2ZV90YWJfXzpzfSl9Yy5ydW50aW1lLnJlbG9hZCgpfX1pZighd3x8IXcuaXNQYXJjZWxSZXF1aXJlKXtiKCk7bGV0IGU9QShhc3luYyB0PT57aShcIkJHU1cgUnVudGltZSAtIE9uIEhNUiBVcGRhdGVcIiksYS5iZ0NoYW5nZWR8fD10LmZpbHRlcihzPT5zLmVudkhhc2g9PT1uLmVudkhhc2gpLnNvbWUocz0+RShtb2R1bGUuYnVuZGxlLHMuaWQpKTtsZXQgbz10LmZpbmQocz0+cy50eXBlPT09XCJqc29uXCIpO2lmKG8pe2xldCBzPW5ldyBTZXQodC5tYXAobD0+bC5pZCkpLHI9T2JqZWN0LnZhbHVlcyhvLmRlcHNCeUJ1bmRsZSkubWFwKGw9Pk9iamVjdC52YWx1ZXMobCkpLmZsYXQoKTthLmJnQ2hhbmdlZHx8PXIuZXZlcnkobD0+cy5oYXMobCkpfXAoKX0pO2UuYWRkRXZlbnRMaXN0ZW5lcihcIm9wZW5cIiwoKT0+e2xldCB0PXNldEludGVydmFsKCgpPT5lLnNlbmQoXCJwaW5nXCIpLDI0ZTMpO2UuYWRkRXZlbnRMaXN0ZW5lcihcImNsb3NlXCIsKCk9PmNsZWFySW50ZXJ2YWwodCkpfSksZS5hZGRFdmVudExpc3RlbmVyKFwiY2xvc2VcIixhc3luYygpPT57YXdhaXQgaygpLHAoITApfSl9VChhc3luYyBlPT57c3dpdGNoKGkoXCJCR1NXIFJ1bnRpbWUgLSBPbiBCdWlsZCBSZXBhY2thZ2VkXCIpLGUudHlwZSl7Y2FzZVwiYnVpbGRfcmVhZHlcIjp7YS5idWlsZFJlYWR5fHw9ITAscCgpO2JyZWFrfWNhc2VcImNzX2NoYW5nZWRcIjp7YS5jc0NoYW5nZWR8fD0hMCxwKCk7YnJlYWt9fX0pO2MucnVudGltZS5vbkNvbm5lY3QuYWRkTGlzdGVuZXIoZnVuY3Rpb24oZSl7bGV0IHQ9ZS5uYW1lLnN0YXJ0c1dpdGgoUCksbz1lLm5hbWUuc3RhcnRzV2l0aChTKTtpZih0fHxvKXtsZXQgcz10P2EucGFnZVBvcnRzOmEuc2NyaXB0UG9ydHM7cy5hZGQoZSksZS5vbkRpc2Nvbm5lY3QuYWRkTGlzdGVuZXIoKCk9PntzLmRlbGV0ZShlKX0pLGUub25NZXNzYWdlLmFkZExpc3RlbmVyKGZ1bmN0aW9uKHIpe2koXCJCR1NXIFJ1bnRpbWUgLSBPbiBzb3VyY2UgY2hhbmdlZFwiLHIpLHIuX19wbGFzbW9fY3NfY2hhbmdlZF9fJiYoYS5jc0NoYW5nZWR8fD0hMCksci5fX3BsYXNtb19wYWdlX2NoYW5nZWRfXyYmKGEucGFnZUNoYW5nZWR8fD0hMCkscCgpfSl9fSk7Yy5ydW50aW1lLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcihmdW5jdGlvbih0KXtyZXR1cm4gdC5fX3BsYXNtb19mdWxsX3JlbG9hZF9fJiYoaShcIkJHU1cgUnVudGltZSAtIE9uIHRvcC1sZXZlbCBjb2RlIGNoYW5nZWRcIikscCgpKSwhMH0pO1xuIiwiaW1wb3J0IFwiLi4vLi4vLi4vc3JjL2JhY2tncm91bmRcIiIsImltcG9ydCAnLi4vYmFja2dyb3VuZCc7XG4iLCJpbXBvcnQge1xuICBDQVJEX1BBUlNFUl9WRVJTSU9OLFxuICBzY3JhcGVkTWFueVRvUGFyc2VkUGF5bG9hZCxcbiAgdHlwZSBTY3JhcGVkQ2FyZFRyYW5zYWN0aW9uLFxufSBmcm9tICcuL3NyYy9saWIvbm9ybWFsaXplJztcblxuaW1wb3J0IHsgc3luY0NhcmRUcmFuc2FjdGlvbnMgfSBmcm9tICcuL3NyYy9saWIvYXBpJztcblxudHlwZSBDYXB0dXJlUmVzdWx0ID1cbiAgfCB7XG4gICAgICBvazogdHJ1ZTtcbiAgICAgIGh0bWw6IHN0cmluZztcbiAgICAgIHNvdXJjZVVybDogc3RyaW5nO1xuICAgICAgY2FwdHVyZWRBdDogc3RyaW5nO1xuICAgICAgdHJhbnNhY3Rpb25Db3VudDogbnVtYmVyO1xuICAgICAgdHJhbnNhY3Rpb25zOiBTY3JhcGVkQ2FyZFRyYW5zYWN0aW9uW107XG4gICAgfVxuICB8IHtcbiAgICAgIG9rOiBmYWxzZTtcbiAgICAgIGVycm9yOiBzdHJpbmc7XG4gICAgICBzb3VyY2VVcmw/OiBzdHJpbmc7XG4gICAgICBjYXB0dXJlZEF0OiBzdHJpbmc7XG4gICAgfTtcblxudHlwZSBDYXB0dXJlTWVzc2FnZSA9IHsgdHlwZTogJ0NBUFRVUkVfQ0FSRF9IVE1MJyB9O1xudHlwZSBTY3JhcGVNZXNzYWdlID0geyB0eXBlOiAnU0NSQVBFX0NBUkRfSFRNTCcgfTtcblxudHlwZSBTdG9yZWRDYXB0dXJlID0gQ2FwdHVyZVJlc3VsdCAmIHtcbiAgam9iSWQ6IHN0cmluZztcbiAgc2F2ZWRBdDogc3RyaW5nO1xufTtcblxuLyoqIFBhaXJpbmcgdG9rZW4gaXMgc2F2ZWQgZnJvbSB0aGUgcG9wdXAuICovXG5leHBvcnQgY29uc3QgU1RPUkFHRV9BUElfVE9LRU5fS0VZID0gJ2NyeXB0b3RyYWNrQXBpVG9rZW4nO1xuXG5jb25zdCBMT0dfUFJFRklYID0gJ1tDcnlwdG9UcmFjayBDYXJkIENhcHR1cmVdJztcblxuY29uc3QgU1RPUkFHRV9LRVkgPSAnY2FyZENhcHR1cmVzJztcbmNvbnN0IFNDUkFQRV9USU1FT1VUX01TID0gOF8wMDA7XG5cbmZ1bmN0aW9uIHdpdGhUaW1lb3V0PFQ+KHByb21pc2U6IFByb21pc2U8VD4sIG1zOiBudW1iZXIsIG1lc3NhZ2U6IHN0cmluZyk6IFByb21pc2U8VD4ge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IHRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHJlamVjdChuZXcgRXJyb3IobWVzc2FnZSkpLCBtcyk7XG4gICAgcHJvbWlzZS50aGVuKFxuICAgICAgKHZhbHVlKSA9PiB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgICAgcmVzb2x2ZSh2YWx1ZSk7XG4gICAgICB9LFxuICAgICAgKGVycm9yKSA9PiB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgIH0sXG4gICAgKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGlzQ2FyZFBhZ2UodXJsOiBzdHJpbmcgfCB1bmRlZmluZWQpOiBib29sZWFuIHtcbiAgaWYgKCF1cmwpIHJldHVybiBmYWxzZTtcblxuICB0cnkge1xuICAgIGNvbnN0IHBhcnNlZCA9IG5ldyBVUkwodXJsKTtcbiAgICByZXR1cm4gcGFyc2VkLmhvc3RuYW1lID09PSAnY2FyZC5tZXRhbWFzay5pbycgfHwgcGFyc2VkLmhvc3RuYW1lID09PSAncG9ydGZvbGlvLm1ldGFtYXNrLmlvJztcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbi8qKiBJbmplY3RlZCB2aWEgYGNocm9tZS5zY3JpcHRpbmcuZXhlY3V0ZVNjcmlwdGAg4oCUIGtlZXAgc2VsZi1jb250YWluZWQuICovXG5mdW5jdGlvbiBzY3JhcGVGcm9tUGFnZSgpOiBDYXB0dXJlUmVzdWx0IHtcbiAgdHlwZSBQVCA9IFNjcmFwZWRDYXJkVHJhbnNhY3Rpb247XG5cbiAgY29uc3QgY2FwdHVyZWRBdCA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcblxuICB0cnkge1xuICAgIGNvbnN0IGNsZWFuVGV4dCA9ICh2YWx1ZTogc3RyaW5nIHwgbnVsbCB8IHVuZGVmaW5lZCk6IHN0cmluZyA9PiAodmFsdWUgPz8gJycpLnJlcGxhY2UoL1xccysvZywgJyAnKS50cmltKCk7XG4gICAgY29uc3QgdGV4dEZyb20gPSAocm9vdDogRWxlbWVudCwgc2VsZWN0b3I6IHN0cmluZyk6IHN0cmluZyA9PlxuICAgICAgY2xlYW5UZXh0KHJvb3QucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik/LnRleHRDb250ZW50KTtcbiAgICBjb25zdCBkZXRhaWxWYWx1ZSA9IChyb3c6IEVsZW1lbnQsIGxhYmVsOiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsID0+IHtcbiAgICAgIGNvbnN0IGRldGFpbFJvd3MgPSBBcnJheS5mcm9tKHJvdy5xdWVyeVNlbGVjdG9yQWxsKCcudHJhbnNhY3Rpb25Sb3dfX2RldGFpbHNfcm93X2NvbnRhaW5lcicpKTtcblxuICAgICAgY29uc3QgbWF0Y2ggPSBkZXRhaWxSb3dzLmZpbmQoXG4gICAgICAgIChpdGVtKSA9PiBjbGVhblRleHQoaXRlbS5xdWVyeVNlbGVjdG9yKCdwOmZpcnN0LWNoaWxkJyk/LnRleHRDb250ZW50KSA9PT0gbGFiZWwsXG4gICAgICApO1xuXG4gICAgICBpZiAoIW1hdGNoKSByZXR1cm4gbnVsbDtcblxuICAgICAgcmV0dXJuIGNsZWFuVGV4dChtYXRjaC5xdWVyeVNlbGVjdG9yKCdwOmxhc3QtY2hpbGQnKT8udGV4dENvbnRlbnQpIHx8IG51bGw7XG4gICAgfTtcblxuICAgIGNvbnN0IGZ1bmRpbmdWYWx1ZSA9IChyb3c6IEVsZW1lbnQsIGxhYmVsOiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsID0+IHtcbiAgICAgIGNvbnN0IGZ1bmRpbmdSb3dzID0gQXJyYXkuZnJvbShyb3cucXVlcnlTZWxlY3RvckFsbCgnLnRyYW5zYWN0aW9uUm93X19kZXRhaWxzX2Z1bmRpbmdfcm93JykpO1xuXG4gICAgICBjb25zdCBtYXRjaCA9IGZ1bmRpbmdSb3dzLmZpbmQoXG4gICAgICAgIChpdGVtKSA9PiBjbGVhblRleHQoaXRlbS5xdWVyeVNlbGVjdG9yKCdwOmZpcnN0LWNoaWxkJyk/LnRleHRDb250ZW50KSA9PT0gbGFiZWwsXG4gICAgICApO1xuXG4gICAgICBpZiAoIW1hdGNoKSByZXR1cm4gbnVsbDtcblxuICAgICAgcmV0dXJuIGNsZWFuVGV4dChtYXRjaC5xdWVyeVNlbGVjdG9yKCdwOmxhc3QtY2hpbGQnKT8udGV4dENvbnRlbnQpIHx8IG51bGw7XG4gICAgfTtcblxuICAgIGNvbnN0IHBhcnNlVHJhbnNhY3Rpb24gPSAocm93OiBFbGVtZW50KTogUFQgPT4gKHtcbiAgICAgIG1lcmNoYW50OiB0ZXh0RnJvbShyb3csICcudHJhbnNhY3Rpb25Sb3dfX2RldGFpbHNfcm93X21lcmNoYW50JyksXG5cbiAgICAgIHRpbWU6IHRleHRGcm9tKHJvdywgJy50cmFuc2FjdGlvblJvd19fc3VtbWFyeV90aXRsZV9jb250YWluZXIgcDpsYXN0LWNoaWxkJyksXG5cbiAgICAgIGFtb3VudDogdGV4dEZyb20ocm93LCAnLnRyYW5zYWN0aW9uUm93X19zdW1tYXJ5X2NvbnRhaW5lciA+IGRpdjpsYXN0LWNoaWxkIHA6Zmlyc3QtY2hpbGQnKSxcblxuICAgICAgdHlwZTogdGV4dEZyb20ocm93LCAnLnRyYW5zYWN0aW9uUm93X19zdW1tYXJ5X2NvbnRhaW5lciA+IGRpdjpsYXN0LWNoaWxkIHA6bGFzdC1jaGlsZCcpLFxuXG4gICAgICBzdGF0dXM6IGRldGFpbFZhbHVlKHJvdywgJ1N0YXR1cycpLFxuXG4gICAgICB0cmFuc2FjdGlvbklkOiBkZXRhaWxWYWx1ZShyb3csICdUcmFuc2FjdGlvbiBJRCcpLFxuXG4gICAgICBkYXRlOiBkZXRhaWxWYWx1ZShyb3csICdEYXRlJyksXG5cbiAgICAgIGNhcmRQYW46IGRldGFpbFZhbHVlKHJvdywgJ0NhcmQgUEFOJyksXG5cbiAgICAgIHNvdXJjZTogZnVuZGluZ1ZhbHVlKHJvdywgJ1NvdXJjZScpLFxuXG4gICAgICBzcGVudDogZnVuZGluZ1ZhbHVlKHJvdywgJ1NwZW50JyksXG5cbiAgICAgIGdhc0ZlZTogZnVuZGluZ1ZhbHVlKHJvdywgJ0dhcyBmZWUnKSxcbiAgICB9KTtcblxuICAgIGNvbnN0IGxpc3QgPVxuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnRyYW5zYWN0aW9uTGlzdF9fbWFpbl9jb250YWluZXInKSA/P1xuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignbWFpbicpID8/XG4gICAgICBkb2N1bWVudC5ib2R5O1xuXG4gICAgaWYgKCFsaXN0KSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBvazogZmFsc2UsXG4gICAgICAgIGVycm9yOiAnQ291bGQgbm90IGZpbmQgZG9jdW1lbnQgYm9keS4nLFxuXG4gICAgICAgIHNvdXJjZVVybDogbG9jYXRpb24uaHJlZixcbiAgICAgICAgY2FwdHVyZWRBdCxcbiAgICAgIH07XG5cbiAgICB9XG5cbiAgICBjb25zdCByb3dzRnJvbURvbSA9IEFycmF5LmZyb20obGlzdC5xdWVyeVNlbGVjdG9yQWxsKCcudHJhbnNhY3Rpb25Sb3dfX2FjY29yZGlvbl9tYWluX2NvbnRhaW5lcicpKTtcbiAgICBjb25zdCB0cmFuc2FjdGlvbnMgPSByb3dzRnJvbURvbS5tYXAocGFyc2VUcmFuc2FjdGlvbik7XG5cbiAgICByZXR1cm4ge1xuXG4gICAgICBvazogdHJ1ZSxcbiAgICAgIGh0bWw6ICcnLFxuICAgICAgc291cmNlVXJsOiBsb2NhdGlvbi5ocmVmLFxuICAgICAgY2FwdHVyZWRBdCxcbiAgICAgIHRyYW5zYWN0aW9uQ291bnQ6IHRyYW5zYWN0aW9ucy5sZW5ndGgsXG4gICAgICB0cmFuc2FjdGlvbnMsXG4gICAgfTtcblxuICB9IGNhdGNoIChlcnJvcikge1xuXG4gICAgcmV0dXJuIHtcblxuICAgICAgb2s6IGZhbHNlLFxuICAgICAgZXJyb3I6IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKSxcblxuICAgICAgc291cmNlVXJsOiBsb2NhdGlvbi5ocmVmLFxuICAgICAgY2FwdHVyZWRBdCxcbiAgICB9O1xuXG4gIH1cblxufVxuXG5hc3luYyBmdW5jdGlvbiBnZXRBY3RpdmVUYWIoKTogUHJvbWlzZTxjaHJvbWUudGFicy5UYWIgfCBudWxsPiB7XG4gIGNvbnN0IFt0YWJdID0gYXdhaXQgY2hyb21lLnRhYnMucXVlcnkoeyBhY3RpdmU6IHRydWUsIGN1cnJlbnRXaW5kb3c6IHRydWUgfSk7XG4gIHJldHVybiB0YWIgPz8gbnVsbDtcblxufVxuXG5hc3luYyBmdW5jdGlvbiBhc2tDb250ZW50U2NyaXB0KHRhYklkOiBudW1iZXIpOiBQcm9taXNlPENhcHR1cmVSZXN1bHQ+IHtcbiAgY29uc29sZS5sb2coTE9HX1BSRUZJWCwgJ2Fza2luZyBjb250ZW50IHNjcmlwdCB0byBzY3JhcGUgdGFiJywgdGFiSWQpO1xuICByZXR1cm4gd2l0aFRpbWVvdXQoXG4gICAgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UodGFiSWQsIHsgdHlwZTogJ1NDUkFQRV9DQVJEX0hUTUwnIH0gc2F0aXNmaWVzIFNjcmFwZU1lc3NhZ2UpLFxuICAgIFNDUkFQRV9USU1FT1VUX01TLFxuICAgICdUaW1lZCBvdXQgd2FpdGluZyBmb3IgdGhlIE1ldGFNYXNrIHBhZ2Ugc2NyYXBlci4nLFxuICApO1xuXG59XG5cbmFzeW5jIGZ1bmN0aW9uIGV4ZWN1dGVGYWxsYmFja1NjcmFwZXIodGFiSWQ6IG51bWJlcik6IFByb21pc2U8Q2FwdHVyZVJlc3VsdD4ge1xuICBjb25zb2xlLmxvZyhMT0dfUFJFRklYLCAnY29udGVudCBzY3JpcHQgd2FzIG5vdCByZWFkeSwgaW5qZWN0aW5nIGZhbGxiYWNrIHNjcmFwZXIgaW50byB0YWInLCB0YWJJZCk7XG5cbiAgY29uc3QgW3Jlc3VsdF0gPSBhd2FpdCBjaHJvbWUuc2NyaXB0aW5nLmV4ZWN1dGVTY3JpcHQoe1xuICAgIHRhcmdldDogeyB0YWJJZCB9LFxuICAgIGZ1bmM6IHNjcmFwZUZyb21QYWdlLFxuXG4gIH0pO1xuXG4gIHJldHVybiAoXG4gICAgcmVzdWx0Py5yZXN1bHQgPz9cbiAgICAoe1xuICAgICAgb2s6IGZhbHNlLFxuICAgICAgZXJyb3I6ICdTY3JpcHQgZXhlY3V0ZWQgYnV0IHJldHVybmVkIG5vIHJlc3VsdC4nLFxuICAgICAgY2FwdHVyZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgIH0gc2F0aXNmaWVzIENhcHR1cmVSZXN1bHQpXG5cbiAgKTtcblxufVxuXG5hc3luYyBmdW5jdGlvbiBjYXB0dXJlVGFiKHRhYjogY2hyb21lLnRhYnMuVGFiKTogUHJvbWlzZTxDYXB0dXJlUmVzdWx0PiB7XG5cbiAgY29uc29sZS5sb2coTE9HX1BSRUZJWCwgJ2NhcHR1cmUgcmVxdWVzdGVkIGZvciBhY3RpdmUgdGFiJywgeyBpZDogdGFiLmlkLCB1cmw6IHRhYi51cmwgfSk7XG5cblxuICBpZiAoIXRhYi5pZCkge1xuICAgIHJldHVybiB7XG4gICAgICBvazogZmFsc2UsXG4gICAgICBlcnJvcjogJ0FjdGl2ZSB0YWIgaGFzIG5vIGlkLicsXG5cbiAgICAgIHNvdXJjZVVybDogdGFiLnVybCxcblxuICAgICAgY2FwdHVyZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuXG4gICAgfTtcblxuICB9XG5cblxuICBpZiAoIWlzQ2FyZFBhZ2UodGFiLnVybCkpIHtcblxuICAgIHJldHVybiB7XG5cbiAgICAgIG9rOiBmYWxzZSxcbiAgICAgIGVycm9yOiAnT3BlbiBjYXJkLm1ldGFtYXNrLmlvIG9yIHBvcnRmb2xpby5tZXRhbWFzay5pbyBiZWZvcmUgc3luY2luZy4nLFxuXG4gICAgICBzb3VyY2VVcmw6IHRhYi51cmwsXG5cbiAgICAgIGNhcHR1cmVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICB9O1xuXG5cbiAgfVxuXG5cbiAgdHJ5IHtcblxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGFza0NvbnRlbnRTY3JpcHQodGFiLmlkKTtcblxuXG4gICAgY29uc29sZS5sb2coTE9HX1BSRUZJWCwgJ2NvbnRlbnQgc2NyaXB0IHNjcmFwZSBmaW5pc2hlZCcsIHJlc3VsdC5vayA/IHJlc3VsdC50cmFuc2FjdGlvbkNvdW50IDogcmVzdWx0LmVycm9yKTtcblxuXG4gICAgcmV0dXJuIHJlc3VsdDtcblxuXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG5cblxuXG4gICAgY29uc29sZS53YXJuKExPR19QUkVGSVgsICdjb250ZW50IHNjcmlwdCBzY3JhcGUgZmFpbGVkLCB0cnlpbmcgZmFsbGJhY2sgaW5qZWN0aW9uJywgZXJyb3IpO1xuXG5cblxuICAgIHJldHVybiB3aXRoVGltZW91dChcbiAgICAgIGV4ZWN1dGVGYWxsYmFja1NjcmFwZXIodGFiLmlkKSxcbiAgICAgIFNDUkFQRV9USU1FT1VUX01TLFxuICAgICAgJ1RpbWVkIG91dCB3aGlsZSBpbmplY3RpbmcgdGhlIGZhbGxiYWNrIHNjcmFwZXIuJyxcbiAgICApO1xuXG5cblxuICB9XG5cblxuXG59XG5cblxuXG5hc3luYyBmdW5jdGlvbiBzYXZlQ2FwdHVyZShqb2JJZDogc3RyaW5nLCByZXN1bHQ6IENhcHR1cmVSZXN1bHQpOiBQcm9taXNlPFN0b3JlZENhcHR1cmU+IHtcblxuXG5cbiAgY29uc3Qgc2F2ZWRDYXB0dXJlOiBTdG9yZWRDYXB0dXJlID0ge1xuICAgIC4uLnJlc3VsdCxcbiAgICBqb2JJZCxcbiAgICBzYXZlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gIH07XG5cblxuICBjb25zdCBjdXJyZW50ID0gYXdhaXQgY2hyb21lLnN0b3JhZ2UubG9jYWwuZ2V0KFNUT1JBR0VfS0VZKTtcbiAgY29uc3QgY2FwdHVyZXMgPSBBcnJheS5pc0FycmF5KGN1cnJlbnRbU1RPUkFHRV9LRVldKSA/IGN1cnJlbnRbU1RPUkFHRV9LRVldIDogW107XG5cbiAgY29uc3QgbmV4dENhcHR1cmVzID0gW3NhdmVkQ2FwdHVyZSwgLi4uY2FwdHVyZXNdLnNsaWNlKDAsIDIwKTtcblxuXG4gIGF3YWl0IGNocm9tZS5zdG9yYWdlLmxvY2FsLnNldCh7IFtTVE9SQUdFX0tFWV06IG5leHRDYXB0dXJlcyB9KTtcblxuXG4gIGNvbnNvbGUubG9nKExPR19QUkVGSVgsICdzYXZlZCBjYXB0dXJlIGluIGNocm9tZS5zdG9yYWdlLmxvY2FsJywge1xuICAgIGpvYklkLFxuICAgIG9rOiBzYXZlZENhcHR1cmUub2ssXG4gICAgdHJhbnNhY3Rpb25Db3VudDogc2F2ZWRDYXB0dXJlLm9rID8gc2F2ZWRDYXB0dXJlLnRyYW5zYWN0aW9uQ291bnQgOiAwLFxuICB9KTtcblxuXG4gIHJldHVybiBzYXZlZENhcHR1cmU7XG5cblxufVxuXG5cblxuYXN5bmMgZnVuY3Rpb24gZ2V0U3RvcmVkQXBpVG9rZW4oKTogUHJvbWlzZTxzdHJpbmcgfCB1bmRlZmluZWQ+IHtcbiAgY29uc3QgdiA9IGF3YWl0IGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldChTVE9SQUdFX0FQSV9UT0tFTl9LRVkpO1xuICBjb25zdCB0b2tlbiA9IHZbU1RPUkFHRV9BUElfVE9LRU5fS0VZXTtcbiAgcmV0dXJuIHR5cGVvZiB0b2tlbiA9PT0gJ3N0cmluZycgJiYgdG9rZW4ubGVuZ3RoID4gMCA/IHRva2VuIDogdW5kZWZpbmVkO1xuXG5cblxufVxuXG5cblxuY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKChtZXNzYWdlOiBDYXB0dXJlTWVzc2FnZSwgX3NlbmRlciwgc2VuZFJlc3BvbnNlKSA9PiB7XG4gIGlmIChtZXNzYWdlPy50eXBlICE9PSAnQ0FQVFVSRV9DQVJEX0hUTUwnKSByZXR1cm4gZmFsc2U7XG5cbiAgY29uc29sZS5sb2coTE9HX1BSRUZJWCwgJ2NhcHR1cmUgcmVxdWVzdCBmcm9tIHBvcHVwJyk7XG5cbiAgdm9pZCAoYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IGpvYklkID0gY3J5cHRvLnJhbmRvbVVVSUQoKTtcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCB0YWIgPSBhd2FpdCBnZXRBY3RpdmVUYWIoKTtcbiAgICAgIGNvbnN0IHJlc3VsdCA9XG4gICAgICAgIHRhYlxuICAgICAgICAgID8gYXdhaXQgY2FwdHVyZVRhYih0YWIpXG4gICAgICAgICAgOiAoeyBvazogZmFsc2UsIGVycm9yOiAnTm8gYWN0aXZlIHRhYiBmb3VuZC4nLCBjYXB0dXJlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkgfSBzYXRpc2ZpZXMgQ2FwdHVyZVJlc3VsdCk7XG5cbiAgICAgIGF3YWl0IHNhdmVDYXB0dXJlKGpvYklkLCByZXN1bHQpO1xuXG4gICAgICBpZiAoIXJlc3VsdC5vaykge1xuICAgICAgICBzZW5kUmVzcG9uc2UoeyBvazogZmFsc2UgYXMgY29uc3QsIGVycm9yOiByZXN1bHQuZXJyb3IsIGpvYklkIH0pO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cblxuICAgICAgY29uc3QgdG9rZW4gPSBhd2FpdCBnZXRTdG9yZWRBcGlUb2tlbigpO1xuXG5cbiAgICAgIGNvbnN0IGl0ZW1zID0gc2NyYXBlZE1hbnlUb1BhcnNlZFBheWxvYWQocmVzdWx0LnRyYW5zYWN0aW9ucyk7XG5cblxuICAgICAgY29uc3QgcGFyc2VyVmVyc2lvblVzZWQgPSBDQVJEX1BBUlNFUl9WRVJTSU9OO1xuXG4gICAgICBpZiAoIXRva2VuKSB7XG4gICAgICAgIHNlbmRSZXNwb25zZSh7XG4gICAgICAgICAgb2s6IHRydWUgYXMgY29uc3QsXG4gICAgICAgICAgam9iSWQsXG4gICAgICAgICAgc2NyYXBlT2s6IHRydWUsXG5cbiAgICAgICAgICB0cmFuc2FjdGlvbkNvdW50OiByZXN1bHQudHJhbnNhY3Rpb25Db3VudCxcbiAgICAgICAgICBwYXJzZWRJdGVtczogaXRlbXMubGVuZ3RoLFxuICAgICAgICAgIHN5bmNlZDogZmFsc2UsXG4gICAgICAgICAgbWVzc2FnZTogYFNjcmFwZWQgJHtyZXN1bHQudHJhbnNhY3Rpb25Db3VudH0gcm93cy4gUGFpciB0aGUgZXh0ZW5zaW9uIGZpcnN0IHRvIHB1c2ggdHJhbnNhY3Rpb25zLmAsXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm47XG5cblxuXG4gICAgICB9XG5cblxuXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBzeW5jID0gYXdhaXQgc3luY0NhcmRUcmFuc2FjdGlvbnModG9rZW4sIHsgcGFyc2VyVmVyc2lvbjogcGFyc2VyVmVyc2lvblVzZWQsIGl0ZW1zIH0pO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKExPR19QUkVGSVgsICdBUEkgc3luYyBPSycsIHN5bmMpO1xuXG4gICAgICAgIHNlbmRSZXNwb25zZSh7XG4gICAgICAgICAgb2s6IHRydWUgYXMgY29uc3QsXG4gICAgICAgICAgam9iSWQsXG4gICAgICAgICAgc2NyYXBlT2s6IHRydWUsXG5cbiAgICAgICAgICB0cmFuc2FjdGlvbkNvdW50OiByZXN1bHQudHJhbnNhY3Rpb25Db3VudCxcblxuICAgICAgICAgIHN5bmNlZDogdHJ1ZSxcbiAgICAgICAgICBpbnNlcnRlZDogc3luYy5pbnNlcnRlZCxcbiAgICAgICAgICB1cGRhdGVkOiBzeW5jLnVwZGF0ZWQsXG5cbiAgICAgICAgICBza2lwcGVkRHVwbGljYXRlSW5CYXRjaDogc3luYy5za2lwcGVkLFxuICAgICAgICB9KTtcblxuXG4gICAgICB9IGNhdGNoIChzeW5jRXJyKSB7XG5cblxuXG4gICAgICAgIGNvbnN0IHN5bmNNZXNzYWdlID0gc3luY0VyciBpbnN0YW5jZW9mIEVycm9yID8gc3luY0Vyci5tZXNzYWdlIDogU3RyaW5nKHN5bmNFcnIpO1xuXG5cblxuICAgICAgICBjb25zb2xlLndhcm4oTE9HX1BSRUZJWCwgJ0FQSSBzeW5jIGZhaWxlZCcsIHN5bmNFcnIpO1xuXG5cblxuICAgICAgICBzZW5kUmVzcG9uc2Uoe1xuICAgICAgICAgIG9rOiBmYWxzZSBhcyBjb25zdCxcblxuICAgICAgICAgIGpvYklkLFxuICAgICAgICAgIHNjcmFwZU9rOiB0cnVlLFxuICAgICAgICAgIGVycm9yOiBzeW5jTWVzc2FnZSxcblxuICAgICAgICAgIGRldGFpbDogYFNjcmFwZSBzYXZlZCBsb2NhbGx5OyBzeW5jIGZhaWxlZDogJHtzeW5jTWVzc2FnZX1gLFxuICAgICAgICB9KTtcblxuXG4gICAgICB9XG5cblxuICAgIH0gY2F0Y2ggKG91dGVyKSB7XG4gICAgICBjb25zdCBlcnJNc2cgPSBvdXRlciBpbnN0YW5jZW9mIEVycm9yID8gb3V0ZXIubWVzc2FnZSA6IFN0cmluZyhvdXRlcik7XG5cbiAgICAgIGNvbnNvbGUuZXJyb3IoTE9HX1BSRUZJWCwgJ2NhcHR1cmUgam9iIGZhaWxlZCcsIG91dGVyKTtcblxuICAgICAgYXdhaXQgc2F2ZUNhcHR1cmUoam9iSWQsIHtcbiAgICAgICAgb2s6IGZhbHNlLFxuXG4gICAgICAgIGVycm9yOiBlcnJNc2csXG4gICAgICAgIGNhcHR1cmVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcblxuICAgICAgfSk7XG5cblxuICAgICAgc2VuZFJlc3BvbnNlKHsgb2s6IGZhbHNlIGFzIGNvbnN0LCBlcnJvcjogZXJyTXNnLCBqb2JJZCB9KTtcbiAgICB9XG5cblxuXG4gIH0pKCk7XG5cblxuXG4gIHJldHVybiB0cnVlO1xuXG5cbn0pO1xuIiwiLyoqXG4gKiBSb3dzIGZyb20gRE9NIHNjcmFwZSAoYG1lcmNoYW50YOKApikgb3Igc25hcHNob3RzIHVzaW5nIGB0aXRsZWAgLyBuZXN0ZWQgYGZ1bmRpbmdgLlxuICovXG5cbmltcG9ydCB0eXBlIHsgQ2FyZFR4V2lyZSwgUGFyc2VkQ2FyZFdpcmUgfSBmcm9tICcuL2FwaSc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2NyYXBlZENhcmRUcmFuc2FjdGlvbiB7XG4gIG1lcmNoYW50Pzogc3RyaW5nO1xuICB0aXRsZT86IHN0cmluZztcbiAgdGltZT86IHN0cmluZztcbiAgYW1vdW50Pzogc3RyaW5nO1xuICB0eXBlPzogc3RyaW5nO1xuICBzdGF0dXM/OiBzdHJpbmcgfCBudWxsO1xuICB0cmFuc2FjdGlvbklkPzogc3RyaW5nIHwgbnVsbDtcbiAgZGF0ZT86IHN0cmluZyB8IG51bGw7XG4gIGNhcmRQYW4/OiBzdHJpbmcgfCBudWxsO1xuICBzb3VyY2U/OiBzdHJpbmcgfCBudWxsO1xuICBzcGVudD86IHN0cmluZyB8IG51bGw7XG4gIGdhc0ZlZT86IHN0cmluZyB8IG51bGw7XG4gIGZ1bmRpbmc/OiB7XG4gICAgc291cmNlPzogc3RyaW5nIHwgbnVsbDtcbiAgICBzcGVudD86IHN0cmluZyB8IG51bGw7XG4gICAgZ2FzRmVlPzogc3RyaW5nIHwgbnVsbDtcbiAgfSB8IG51bGw7XG59XG5cbmV4cG9ydCBjb25zdCBDQVJEX1BBUlNFUl9WRVJTSU9OID0gMjtcblxuZnVuY3Rpb24gbm9ybWFsaXplU3RhdHVzKHJhdzogc3RyaW5nIHwgbnVsbCB8IHVuZGVmaW5lZCk6IENhcmRUeFdpcmUge1xuICBjb25zdCBrZXkgPSAocmF3ID8/ICcnKS50cmltKCkudG9VcHBlckNhc2UoKTtcblxuICBzd2l0Y2ggKGtleSkge1xuICAgIGNhc2UgJ1BFTkRJTkcnOlxuICAgIGNhc2UgJ0FVVEhPUklaRUQnOlxuICAgICAgcmV0dXJuICdQRU5ESU5HJztcbiAgICBjYXNlICdDT01QTEVURSc6XG4gICAgY2FzZSAnQ09NUExFVEVEJzpcbiAgICBjYXNlICdTRVRUTEVEJzpcbiAgICAgIHJldHVybiAnU0VUVExFRCc7XG4gICAgY2FzZSAnREVDTElORUQnOlxuICAgIGNhc2UgJ0NBTkNFTExFRCc6XG4gICAgY2FzZSAnQ0FOQ0VMRUQnOlxuICAgICAgcmV0dXJuICdERUNMSU5FRCc7XG4gICAgY2FzZSAnUkVGVU5EJzpcbiAgICBjYXNlICdSRUZVTkRFRCc6XG4gICAgICByZXR1cm4gJ1JFRlVOREVEJztcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuICdTRVRUTEVEJztcbiAgfVxufVxuXG4vKiogUGFyc2VzIEREL01NL1lZWVkgaGg6bW0gYW0vcG0gaW4gbG9jYWwgVFosIGUuZy4gYDA0LzA1LzIwMjYgMDk6NTEgcG1gICovXG5leHBvcnQgZnVuY3Rpb24gdWtEYXRlVGltZU1lcmlkaWFuVG9Jc28ocmF3OiBzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkKTogc3RyaW5nIHwgbnVsbCB7XG5cbiAgY29uc3QgcyA9IHJhdz8udHJpbSgpO1xuXG4gIGlmICghcykgcmV0dXJuIG51bGw7XG5cbiAgY29uc3QgcmUgPSAvXihcXGR7Mn0pXFwvKFxcZHsyfSlcXC8oXFxkezR9KVxccysoXFxkezEsMn0pOihcXGR7Mn0pXFxzKihhbXxwbSkkL2l1O1xuXG4gIGNvbnN0IG0gPSByZS5leGVjKHMpO1xuXG4gIGlmICghbSkge1xuXG4gICAgY29uc3QgZCA9IG5ldyBEYXRlKHMpO1xuXG4gICAgcmV0dXJuIE51bWJlci5pc05hTihkLmdldFRpbWUoKSkgPyBudWxsIDogZC50b0lTT1N0cmluZygpO1xuXG4gIH1cblxuICBsZXQgaG91ciA9IE51bWJlcihtWzRdKTtcbiAgY29uc3QgbWludXRlID0gTnVtYmVyKG1bNV0pO1xuICBjb25zdCBhbXBtID0gbVs2XSEudG9Mb3dlckNhc2UoKTtcbiAgY29uc3QgZGF5ID0gTnVtYmVyKG1bMV0pO1xuICBjb25zdCBtb250aCA9IE51bWJlcihtWzJdKTtcbiAgY29uc3QgeWVhciA9IE51bWJlcihtWzNdKTtcblxuICBpZiAoaG91ciA8IDEyICYmIGFtcG0gPT09ICdwbScpIGhvdXIgKz0gMTI7XG5cbiAgaWYgKGhvdXIgPT09IDEyICYmIGFtcG0gPT09ICdhbScpIGhvdXIgPSAwO1xuXG4gIGNvbnN0IGRhdGUgPSBuZXcgRGF0ZSh5ZWFyLCBtb250aCAtIDEsIGRheSwgaG91ciwgbWludXRlLCAwLCAwKTtcblxuICByZXR1cm4gTnVtYmVyLmlzTmFOKGRhdGUuZ2V0VGltZSgpKSA/IG51bGwgOiBkYXRlLnRvSVNPU3RyaW5nKCk7XG5cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNwbGl0TW9uZXlUb2tlbihyYXc6IHN0cmluZyB8IG51bGwgfCB1bmRlZmluZWQpOiB7IG51bWVyaWM6IHN0cmluZzsgY3VycmVuY3lSYXc6IHN0cmluZyB9IHwgbnVsbCB7XG5cbiAgY29uc3QgcyA9IHJhdz8udHJpbSgpPy5yZXBsYWNlKC9eLC91LCAnJyk7XG4gIGlmICghcykgcmV0dXJuIG51bGw7XG5cbiAgY29uc3QgbSA9IC9eKC0/XFxkKyg/OlxcLlxcZCspPylcXHMrKC4rKSQvdS5leGVjKHMpO1xuICBpZiAoIW0pIHJldHVybiBudWxsO1xuXG4gIHJldHVybiB7IG51bWVyaWM6IG1bMV0hLCBjdXJyZW5jeVJhdzogbVsyXSEudHJpbSgpIH07XG5cbn1cblxuZnVuY3Rpb24gY3J5cHRvU3ltYm9sRGlzcGxheShjdXJyZW5jeVJhdzogc3RyaW5nKTogc3RyaW5nIHtcblxuICBjb25zdCB0cmltbWVkID0gY3VycmVuY3lSYXcudHJpbSgpO1xuICBjb25zdCBjb21wYWN0ID0gdHJpbW1lZC5yZXBsYWNlKC9cXHMrL2d1LCAnJykudG9VcHBlckNhc2UoKTtcblxuICBpZiAoL1xcYk1NP1VTRFxcYnxcXGJNSUxMSVxccz9VU0RcXGIvaXUudGVzdCh0cmltbWVkKSB8fCAvTStNP1VTRC9pdS50ZXN0KGNvbXBhY3QpKSB7XG4gICAgcmV0dXJuICdNVVNEJztcblxuICB9XG5cbiAgcmV0dXJuIGNvbXBhY3Quc2xpY2UoMCwgMzIpO1xuXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzcGxpdENyeXB0b1NwZW5kKHJhdzogc3RyaW5nIHwgbnVsbCB8IHVuZGVmaW5lZCk6IHsgbnVtZXJpYzogc3RyaW5nOyBzeW1ib2w6IHN0cmluZyB9IHwgbnVsbCB7XG5cbiAgY29uc3QgcGFydHMgPSBzcGxpdE1vbmV5VG9rZW4ocmF3Py50cmltKCkpO1xuICBpZiAoIXBhcnRzKSByZXR1cm4gbnVsbDtcblxuICBjb25zdCBzeW1ib2wgPSBjcnlwdG9TeW1ib2xEaXNwbGF5KHBhcnRzLmN1cnJlbmN5UmF3KTtcbiAgcmV0dXJuIHsgbnVtZXJpYzogcGFydHMubnVtZXJpYywgc3ltYm9sIH07XG5cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNjcmFwZWRUb1BhcnNlZENhcmRUeChyb3c6IFNjcmFwZWRDYXJkVHJhbnNhY3Rpb24pOiBQYXJzZWRDYXJkV2lyZSB8IG51bGwge1xuXG4gIGNvbnN0IGV4dCA9IHJvdy50cmFuc2FjdGlvbklkPy50cmltKCk7XG4gIGlmICghZXh0KSByZXR1cm4gbnVsbDtcblxuICBjb25zdCBtZXJjaGFudE5hbWUgPSAocm93Lm1lcmNoYW50Py50cmltKCkgPz8gcm93LnRpdGxlPy50cmltKCkgPz8gJ1Vua25vd24gbWVyY2hhbnQnKS5zbGljZSgwLCA1MTIpO1xuXG4gIGNvbnN0IGNvbXBvc2VkRGF0ZVRpbWUgPVxuICAgIHR5cGVvZiByb3cuZGF0ZSA9PT0gJ3N0cmluZycgJiYgdHlwZW9mIHJvdy50aW1lID09PSAnc3RyaW5nJ1xuXG4gICAgICA/IHJvdy5kYXRlLmluY2x1ZGVzKHJvdy50aW1lLnRyaW0oKSlcblxuICAgICAgICA/IHJvdy5kYXRlLnRyaW0oKVxuXG4gICAgICAgIDogYCR7cm93LmRhdGUucmVwbGFjZSgvXFxzKy4qJC91LCAnJykudHJpbSgpfSAke3Jvdy50aW1lLnRyaW0oKX1gXG5cbiAgICAgIDogcm93LmRhdGU7XG5cbiAgY29uc3Qgb2NjdXJyZWRBdCA9IHVrRGF0ZVRpbWVNZXJpZGlhblRvSXNvKGNvbXBvc2VkRGF0ZVRpbWUpO1xuXG4gIGlmICghb2NjdXJyZWRBdCkgcmV0dXJuIG51bGw7XG5cbiAgY29uc3QgZmlhdCA9IHNwbGl0TW9uZXlUb2tlbihyb3cuYW1vdW50KTtcbiAgaWYgKCFmaWF0KSByZXR1cm4gbnVsbDtcblxuICBjb25zdCBmaWF0Q3VycmVuY3kgPSBmaWF0LmN1cnJlbmN5UmF3LnNsaWNlKDAsIDgpLnRvVXBwZXJDYXNlKCk7XG5cbiAgY29uc3Qgc3BlbnRSYXcgPSByb3cuZnVuZGluZz8uc3BlbnQgPz8gcm93LnNwZW50ID8/IG51bGw7XG4gIGxldCBjcnlwdG9QYXJzZWQgPSBzcGxpdENyeXB0b1NwZW5kKHNwZW50UmF3KTtcblxuICBsZXQgY3J5cHRvQW1vdW50OiBzdHJpbmcgfCBudWxsID0gY3J5cHRvUGFyc2VkPy5udW1lcmljID8/IG51bGw7XG5cbiAgbGV0IGNyeXB0b1N5bWJvbDogc3RyaW5nIHwgbnVsbCA9IGNyeXB0b1BhcnNlZD8uc3ltYm9sID8/IG51bGw7XG5cbiAgLyoqIFNvbWUgZW50cmllcyBvbmx5IGV4cG9zZSBmaWF0IHNwZW5kICovXG4gIGlmIChjcnlwdG9BbW91bnQgPT09IG51bGwpIHtcbiAgICBjcnlwdG9BbW91bnQgPSBmaWF0Lm51bWVyaWM7XG5cbiAgICBjcnlwdG9TeW1ib2wgPSBmaWF0Q3VycmVuY3k7XG4gIH1cblxuICBjb25zdCBmdW5kaW5nTWFza2VkID0gcm93LmZ1bmRpbmc/LnNvdXJjZT8udHJpbSgpID8/IHJvdy5zb3VyY2U/LnRyaW0oKSA/PyBudWxsO1xuXG4gIHJldHVybiB7XG4gICAgZXh0ZXJuYWxJZDogZXh0LnNsaWNlKDAsIDUxMiksXG4gICAgb2NjdXJyZWRBdCxcbiAgICBtZXJjaGFudE5hbWUsXG4gICAgZmlhdEFtb3VudDogZmlhdC5udW1lcmljLFxuICAgIGZpYXRDdXJyZW5jeSxcbiAgICBtZXJjaGFudFJhdzpcbiAgICAgIGAke3Jvdy5jYXJkUGFuID8/ICcnfXwke3Jvdy50eXBlID8/ICcnfXwke3Jvdy5nYXNGZWUgPz8gcm93LmZ1bmRpbmc/Lmdhc0ZlZSA/PyAnJ318JHtzcGVudFJhdyA/PyAnJ31gXG4gICAgICAgIC5yZXBsYWNlKC9cXHxcXHwrL2d1LCAnfCcpXG4gICAgICAgIC5zbGljZSgwLCAyMDQ4KSB8fCB1bmRlZmluZWQsXG4gICAgY3J5cHRvQW1vdW50LFxuXG4gICAgY3J5cHRvU3ltYm9sLFxuICAgIGZ1bmRpbmdTb3VyY2VNYXNrZWQ6IGZ1bmRpbmdNYXNrZWQgPz8gbnVsbCxcblxuICAgIHN0YXR1czogbm9ybWFsaXplU3RhdHVzKHJvdy5zdGF0dXMpLFxuICAgIHBhcnNlclZlcnNpb246IENBUkRfUEFSU0VSX1ZFUlNJT04sXG4gIH07XG5cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNjcmFwZWRNYW55VG9QYXJzZWRQYXlsb2FkKHJvd3M6IFNjcmFwZWRDYXJkVHJhbnNhY3Rpb25bXSk6IFBhcnNlZENhcmRXaXJlW10ge1xuXG4gIGNvbnN0IG91dDogUGFyc2VkQ2FyZFdpcmVbXSA9IFtdO1xuICBjb25zdCBzZWVuRXh0ZXJuYWwgPSBuZXcgU2V0PHN0cmluZz4oKTtcblxuICBmb3IgKGNvbnN0IHJvdyBvZiByb3dzKSB7XG5cbiAgICBjb25zdCBwYXJzZWQgPSBzY3JhcGVkVG9QYXJzZWRDYXJkVHgocm93KTtcblxuICAgIGlmICghcGFyc2VkKSBjb250aW51ZTtcblxuICAgIGlmIChzZWVuRXh0ZXJuYWwuaGFzKHBhcnNlZC5leHRlcm5hbElkKSkgY29udGludWU7XG5cbiAgICBzZWVuRXh0ZXJuYWwuYWRkKHBhcnNlZC5leHRlcm5hbElkKTtcblxuICAgIG91dC5wdXNoKHBhcnNlZCk7XG4gIH1cblxuICByZXR1cm4gb3V0O1xuXG59XG4iLCJleHBvcnRzLmludGVyb3BEZWZhdWx0ID0gZnVuY3Rpb24gKGEpIHtcbiAgcmV0dXJuIGEgJiYgYS5fX2VzTW9kdWxlID8gYSA6IHtkZWZhdWx0OiBhfTtcbn07XG5cbmV4cG9ydHMuZGVmaW5lSW50ZXJvcEZsYWcgPSBmdW5jdGlvbiAoYSkge1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoYSwgJ19fZXNNb2R1bGUnLCB7dmFsdWU6IHRydWV9KTtcbn07XG5cbmV4cG9ydHMuZXhwb3J0QWxsID0gZnVuY3Rpb24gKHNvdXJjZSwgZGVzdCkge1xuICBPYmplY3Qua2V5cyhzb3VyY2UpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgIGlmIChrZXkgPT09ICdkZWZhdWx0JyB8fCBrZXkgPT09ICdfX2VzTW9kdWxlJyB8fCBkZXN0Lmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZGVzdCwga2V5LCB7XG4gICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBzb3VyY2Vba2V5XTtcbiAgICAgIH0sXG4gICAgfSk7XG4gIH0pO1xuXG4gIHJldHVybiBkZXN0O1xufTtcblxuZXhwb3J0cy5leHBvcnQgPSBmdW5jdGlvbiAoZGVzdCwgZGVzdE5hbWUsIGdldCkge1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZGVzdCwgZGVzdE5hbWUsIHtcbiAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgIGdldDogZ2V0LFxuICB9KTtcbn07XG4iLCIvKiogTWF0Y2hlcyBgQGNyeXB0by10cmFja2VyL3NoYXJlZGAgUGFyc2VkQ2FyZFR4IC8gUE9TVCBib2R5IHdpdGhvdXQgcHVsbGluZyBidWlsdCBhcnRpZmFjdHMuICovXG5cbmV4cG9ydCBpbnRlcmZhY2UgUGFyc2VkQ2FyZFdpcmUge1xuICBleHRlcm5hbElkOiBzdHJpbmc7XG4gIG9jY3VycmVkQXQ6IHN0cmluZztcbiAgbWVyY2hhbnROYW1lOiBzdHJpbmc7XG4gIG1lcmNoYW50UmF3Pzogc3RyaW5nIHwgbnVsbDtcbiAgZmlhdEFtb3VudDogc3RyaW5nO1xuICBmaWF0Q3VycmVuY3k6IHN0cmluZztcbiAgY3J5cHRvQW1vdW50OiBzdHJpbmcgfCBudWxsO1xuICBjcnlwdG9TeW1ib2w6IHN0cmluZyB8IG51bGw7XG4gIHN0YXR1czogQ2FyZFR4V2lyZTtcbiAgcGFyc2VyVmVyc2lvbjogbnVtYmVyO1xuICByYXdIdG1sPzogc3RyaW5nIHwgbnVsbDtcbiAgZnVuZGluZ1NvdXJjZU1hc2tlZD86IHN0cmluZyB8IG51bGw7XG59XG5cbmV4cG9ydCB0eXBlIENhcmRUeFdpcmUgPSAnUEVORElORycgfCAnU0VUVExFRCcgfCAnREVDTElORUQnIHwgJ1JFRlVOREVEJztcblxuZXhwb3J0IGludGVyZmFjZSBDYXJkU3luY0JvZHlXaXJlIHtcbiAgcGFyc2VyVmVyc2lvbjogbnVtYmVyO1xuICBpdGVtczogUGFyc2VkQ2FyZFdpcmVbXTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBDYXJkU3luY1Jlc3VsdFdpcmUge1xuICBpbnNlcnRlZDogbnVtYmVyO1xuICB1cGRhdGVkOiBudW1iZXI7XG4gIHNraXBwZWQ6IG51bWJlcjtcbn1cblxuZXhwb3J0IGNvbnN0IEFQSV9VUkwgPSBwcm9jZXNzLmVudi5QTEFTTU9fUFVCTElDX0FQSV9VUkwgPz8gJ2h0dHA6Ly9sb2NhbGhvc3Q6NDAwMS9hcGkvdjEnO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcGFpckV4dGVuc2lvbihjb2RlOiBzdHJpbmcpOiBQcm9taXNlPHsgdG9rZW46IHN0cmluZyB9PiB7XG4gIGNvbnN0IGNvbnRyb2xsZXIgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gIGNvbnN0IHRpbWVvdXQgPSBnbG9iYWxUaGlzLnNldFRpbWVvdXQoKCkgPT4gY29udHJvbGxlci5hYm9ydCgpLCAxMl8wMDApO1xuICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChgJHtBUElfVVJMfS9hdXRoL2V4dGVuc2lvbi9wYWlyYCwge1xuICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgIGhlYWRlcnM6IHsgJ2NvbnRlbnQtdHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJywgYWNjZXB0OiAnYXBwbGljYXRpb24vanNvbicgfSxcbiAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IGNvZGU6IGNvZGUudHJpbSgpIH0pLFxuICAgIHNpZ25hbDogY29udHJvbGxlci5zaWduYWwsXG4gIH0pLmZpbmFsbHkoKCkgPT4gZ2xvYmFsVGhpcy5jbGVhclRpbWVvdXQodGltZW91dCkpO1xuXG4gIGNvbnN0IGJvZHkgPSAoYXdhaXQgcmVzLmpzb24oKS5jYXRjaCgoKSA9PiBudWxsKSkgYXMge1xuICAgIHRva2VuPzogc3RyaW5nO1xuICAgIG1lc3NhZ2U/OiBzdHJpbmcgfCBzdHJpbmdbXSB8IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICB9IHwgbnVsbDtcblxuICBpZiAoIXJlcy5vaykge1xuICAgIGxldCBtc2cgPSBgcGFpciBmYWlsZWQgKCR7cmVzLnN0YXR1c30pYDtcbiAgICBjb25zdCBtID0gYm9keT8ubWVzc2FnZTtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShtKSkgbXNnID0gbS5qb2luKCc7ICcpO1xuICAgIGVsc2UgaWYgKHR5cGVvZiBtID09PSAnc3RyaW5nJykgbXNnID0gbTtcbiAgICBlbHNlIGlmIChtICE9PSB1bmRlZmluZWQgJiYgbSAhPT0gbnVsbCkgbXNnID0gSlNPTi5zdHJpbmdpZnkobSk7XG4gICAgdGhyb3cgbmV3IEVycm9yKG1zZyk7XG4gIH1cblxuICBjb25zdCB0b2tlbiA9IGJvZHk/LnRva2VuO1xuICBpZiAoIXRva2VuKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdNYWxmb3JtZWQgcGFpciByZXNwb25zZS4nKTtcbiAgfVxuXG4gIHJldHVybiB7IHRva2VuIH07XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzeW5jQ2FyZFRyYW5zYWN0aW9ucyhcbiAgYmVhcmVyVG9rZW46IHN0cmluZyxcbiAgcGF5bG9hZDogQ2FyZFN5bmNCb2R5V2lyZSxcbik6IFByb21pc2U8Q2FyZFN5bmNSZXN1bHRXaXJlPiB7XG4gIGNvbnN0IGNvbnRyb2xsZXIgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gIGNvbnN0IHRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IGNvbnRyb2xsZXIuYWJvcnQoKSwgMTVfMDAwKTtcbiAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goYCR7QVBJX1VSTH0vY2FyZC10cmFuc2FjdGlvbnMvc3luY2AsIHtcbiAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICBoZWFkZXJzOiB7XG4gICAgICAnY29udGVudC10eXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgYWNjZXB0OiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICBhdXRob3JpemF0aW9uOiBgQmVhcmVyICR7YmVhcmVyVG9rZW59YCxcbiAgICB9LFxuICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHBheWxvYWQpLFxuICAgIHNpZ25hbDogY29udHJvbGxlci5zaWduYWwsXG4gIH0pLmZpbmFsbHkoKCkgPT4gY2xlYXJUaW1lb3V0KHRpbWVvdXQpKTtcblxuICBjb25zdCBib2R5ID0gKGF3YWl0IHJlcy5qc29uKCkuY2F0Y2goKCkgPT4gbnVsbCkpIGFzXG4gICAgfCAoQ2FyZFN5bmNSZXN1bHRXaXJlICYgeyBtZXNzYWdlPzogc3RyaW5nIHwgdW5rbm93biB9KVxuICAgIHwgbnVsbDtcblxuICBpZiAoIXJlcy5vaykge1xuICAgIGxldCBtc2cgPSBgc3luYyBmYWlsZWQgKCR7cmVzLnN0YXR1c30pYDtcbiAgICBpZiAoYm9keSAmJiB0eXBlb2YgYm9keSA9PT0gJ29iamVjdCcgJiYgYm9keS5tZXNzYWdlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGNvbnN0IG0gPSBib2R5Lm1lc3NhZ2U7XG4gICAgICBtc2cgPSB0eXBlb2YgbSA9PT0gJ3N0cmluZycgPyBtIDogSlNPTi5zdHJpbmdpZnkobSk7XG4gICAgfVxuICAgIHRocm93IG5ldyBFcnJvcihtc2cpO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBpbnNlcnRlZDogTnVtYmVyKGJvZHk/Lmluc2VydGVkID8/IDApLFxuICAgIHVwZGF0ZWQ6IE51bWJlcihib2R5Py51cGRhdGVkID8/IDApLFxuICAgIHNraXBwZWQ6IE51bWJlcihib2R5Py5za2lwcGVkID8/IDApLFxuICB9O1xufVxuIl0sIm5hbWVzIjpbXSwidmVyc2lvbiI6MywiZmlsZSI6ImluZGV4LmpzLm1hcCJ9
 globalThis.define=__define;  })(globalThis.define);