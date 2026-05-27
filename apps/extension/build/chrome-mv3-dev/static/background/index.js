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
})({"lrHjL":[function(require,module,exports) {
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
    "serverPort": 43247
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
const STORAGE_API_TOKEN_KEY = "cryptotrackApiToken";
const LOG_PREFIX = "[MetaSpend Card Capture]";
const STORAGE_KEY = "cardCaptures";
/** Content-script scrape must finish quickly; sync HTTP runs in the popup (MV3 workers suspend on long fetch). */ const SCRAPE_TIMEOUT_MS = 15000;
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
        const scrapeCardBalanceSnapshot = ()=>{
            const container = document.querySelector(".cardImagery__card_svg_container");
            if (!container) return null;
            const textEls = container.querySelectorAll("svg text");
            for(let ti = 0; ti < textEls.length; ti++){
                const textEl = textEls[ti];
                const tspans = textEl.querySelectorAll("tspan");
                if (tspans.length === 0) continue;
                let amount = "";
                for(let ni = 0; ni < textEl.childNodes.length; ni++){
                    const node = textEl.childNodes[ni];
                    if (node.nodeType === Node.TEXT_NODE) amount += (node.textContent || "").trim();
                }
                amount = amount.replace(/\s/g, "");
                const currencyEl = tspans[tspans.length - 1];
                const currency = (currencyEl && currencyEl.textContent || "").trim().replace(/\s/g, "");
                if (!amount || !currency) continue;
                const normalizedAmount = amount.replace(/,/g, "");
                if (!/^\d+(\.\d+)?$/.test(normalizedAmount)) continue;
                return {
                    amount: normalizedAmount,
                    currency
                };
            }
            return null;
        };
        const snap = scrapeCardBalanceSnapshot();
        const out = {
            ok: true,
            html: "",
            sourceUrl: location.href,
            capturedAt,
            transactionCount: transactions.length,
            transactions
        };
        if (snap) out.cardBalance = snap;
        return out;
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
            if (!token) {
                sendResponse({
                    ok: true,
                    jobId,
                    scrapeOk: true,
                    transactionCount: result.transactionCount,
                    syncPayload: null,
                    scrapeOnlyMessage: `Scraped ${result.transactionCount} rows. Pair the extension first to push transactions.`
                });
                return;
            }
            const items = (0, _normalize.scrapedManyToParsedPayload)(result.transactions);
            sendResponse({
                ok: true,
                jobId,
                scrapeOk: true,
                transactionCount: result.transactionCount,
                syncPayload: {
                    parserVersion: (0, _normalize.CARD_PARSER_VERSION),
                    items,
                    ...result.ok && result.cardBalance ? {
                        cardBalanceSnapshot: result.cardBalance
                    } : {}
                },
                scrapeOnlyMessage: null
            });
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

},{"./src/lib/normalize":"igUOy","@parcel/transformer-js/src/esmodule-helpers.js":"5G9Z5"}],"igUOy":[function(require,module,exports) {
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
    const gasFeeRaw = row.funding?.gasFee ?? row.gasFee ?? null;
    const gasFeeParsed = splitCryptoSpend(gasFeeRaw);
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
        gasFeeAmount: gasFeeParsed?.numeric ?? null,
        gasFeeSymbol: gasFeeParsed?.symbol ?? null,
        gasFeeRaw: gasFeeRaw ?? null,
        spentRaw: spentRaw ?? null,
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

},{}]},["lrHjL","2w7px"], "2w7px", "parcelRequire258f")

//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LFNBQVMsU0FBVSxJQUFJLEVBQUUsUUFBUSxFQUFFLEdBQUc7SUFDNUMsT0FBTyxlQUFlLE1BQU0sVUFBVTtRQUNwQyxZQUFZO1FBQ1osS0FBSztJQUNQO0FBQ0YiLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy8ucG5wbS9AcGxhc21vaHErcGFyY2VsLXJ1bnRpbWVAMC4yNS4yL25vZGVfbW9kdWxlcy9AcGxhc21vaHEvcGFyY2VsLXJ1bnRpbWUvZGlzdC9ydW50aW1lLWYxNGYwODgxY2NkNmExMTkuanMiLCJhcHBzL2V4dGVuc2lvbi8ucGxhc21vL3N0YXRpYy9iYWNrZ3JvdW5kL2luZGV4LnRzIiwiYXBwcy9leHRlbnNpb24vc3JjL2JhY2tncm91bmQudHMiLCJhcHBzL2V4dGVuc2lvbi9iYWNrZ3JvdW5kLnRzIiwiYXBwcy9leHRlbnNpb24vc3JjL2xpYi9ub3JtYWxpemUudHMiLCJub2RlX21vZHVsZXMvLnBucG0vQHBhcmNlbCt0cmFuc2Zvcm1lci1qc0AyLjkuM19AcGFyY2VsK2NvcmVAMi45LjMvbm9kZV9tb2R1bGVzL0BwYXJjZWwvdHJhbnNmb3JtZXItanMvc3JjL2VzbW9kdWxlLWhlbHBlcnMuanMiXSwic291cmNlc0NvbnRlbnQiOlsidmFyIHU9Z2xvYmFsVGhpcy5wcm9jZXNzPy5hcmd2fHxbXTt2YXIgaD0oKT0+Z2xvYmFsVGhpcy5wcm9jZXNzPy5lbnZ8fHt9O3ZhciBCPW5ldyBTZXQodSksXz1lPT5CLmhhcyhlKSxHPXUuZmlsdGVyKGU9PmUuc3RhcnRzV2l0aChcIi0tXCIpJiZlLmluY2x1ZGVzKFwiPVwiKSkubWFwKGU9PmUuc3BsaXQoXCI9XCIpKS5yZWR1Y2UoKGUsW3Qsb10pPT4oZVt0XT1vLGUpLHt9KTt2YXIgVT1fKFwiLS1kcnktcnVuXCIpLGc9KCk9Pl8oXCItLXZlcmJvc2VcIil8fGgoKS5WRVJCT1NFPT09XCJ0cnVlXCIsTj1nKCk7dmFyIG09KGU9XCJcIiwuLi50KT0+Y29uc29sZS5sb2coZS5wYWRFbmQoOSksXCJ8XCIsLi4udCk7dmFyIHk9KC4uLmUpPT5jb25zb2xlLmVycm9yKFwiXFx1ezFGNTM0fSBFUlJPUlwiLnBhZEVuZCg5KSxcInxcIiwuLi5lKSx2PSguLi5lKT0+bShcIlxcdXsxRjUzNX0gSU5GT1wiLC4uLmUpLGY9KC4uLmUpPT5tKFwiXFx1ezFGN0UwfSBXQVJOXCIsLi4uZSksTT0wLGk9KC4uLmUpPT5nKCkmJm0oYFxcdXsxRjdFMX0gJHtNKyt9YCwuLi5lKTt2YXIgYj0oKT0+e2xldCBlPWdsb2JhbFRoaXMuYnJvd3Nlcj8ucnVudGltZXx8Z2xvYmFsVGhpcy5jaHJvbWU/LnJ1bnRpbWUsdD0oKT0+c2V0SW50ZXJ2YWwoZS5nZXRQbGF0Zm9ybUluZm8sMjRlMyk7ZS5vblN0YXJ0dXAuYWRkTGlzdGVuZXIodCksdCgpfTt2YXIgbj17XCJpc0NvbnRlbnRTY3JpcHRcIjpmYWxzZSxcImlzQmFja2dyb3VuZFwiOnRydWUsXCJpc1JlYWN0XCI6ZmFsc2UsXCJydW50aW1lc1wiOltcImJhY2tncm91bmQtc2VydmljZS1ydW50aW1lXCJdLFwiaG9zdFwiOlwibG9jYWxob3N0XCIsXCJwb3J0XCI6MTgxNSxcImVudHJ5RmlsZVBhdGhcIjpcIi9ob21lL3pha2hhcm92L0RvY3VtZW50cy9wcm9qZWN0cy9jcnlwdG8tZmluYW5jZS10cmFja2VyL2FwcHMvZXh0ZW5zaW9uLy5wbGFzbW8vc3RhdGljL2JhY2tncm91bmQvaW5kZXgudHNcIixcImJ1bmRsZUlkXCI6XCJkN2I5YjJmODFmODE4ZjBiXCIsXCJlbnZIYXNoXCI6XCJkOTlhNWZmYTU3YWNkNjM4XCIsXCJ2ZXJib3NlXCI6XCJmYWxzZVwiLFwic2VjdXJlXCI6ZmFsc2UsXCJzZXJ2ZXJQb3J0XCI6NDMyNDd9O21vZHVsZS5idW5kbGUuSE1SX0JVTkRMRV9JRD1uLmJ1bmRsZUlkO2dsb2JhbFRoaXMucHJvY2Vzcz17YXJndjpbXSxlbnY6e1ZFUkJPU0U6bi52ZXJib3NlfX07dmFyIEQ9bW9kdWxlLmJ1bmRsZS5Nb2R1bGU7ZnVuY3Rpb24gSChlKXtELmNhbGwodGhpcyxlKSx0aGlzLmhvdD17ZGF0YTptb2R1bGUuYnVuZGxlLmhvdERhdGFbZV0sX2FjY2VwdENhbGxiYWNrczpbXSxfZGlzcG9zZUNhbGxiYWNrczpbXSxhY2NlcHQ6ZnVuY3Rpb24odCl7dGhpcy5fYWNjZXB0Q2FsbGJhY2tzLnB1c2godHx8ZnVuY3Rpb24oKXt9KX0sZGlzcG9zZTpmdW5jdGlvbih0KXt0aGlzLl9kaXNwb3NlQ2FsbGJhY2tzLnB1c2godCl9fSxtb2R1bGUuYnVuZGxlLmhvdERhdGFbZV09dm9pZCAwfW1vZHVsZS5idW5kbGUuTW9kdWxlPUg7bW9kdWxlLmJ1bmRsZS5ob3REYXRhPXt9O3ZhciBjPWdsb2JhbFRoaXMuYnJvd3Nlcnx8Z2xvYmFsVGhpcy5jaHJvbWV8fG51bGw7ZnVuY3Rpb24gUigpe3JldHVybiFuLmhvc3R8fG4uaG9zdD09PVwiMC4wLjAuMFwiP2xvY2F0aW9uLnByb3RvY29sLmluZGV4T2YoXCJodHRwXCIpPT09MD9sb2NhdGlvbi5ob3N0bmFtZTpcImxvY2FsaG9zdFwiOm4uaG9zdH1mdW5jdGlvbiB4KCl7cmV0dXJuIW4uaG9zdHx8bi5ob3N0PT09XCIwLjAuMC4wXCI/XCJsb2NhbGhvc3RcIjpuLmhvc3R9ZnVuY3Rpb24gZCgpe3JldHVybiBuLnBvcnR8fGxvY2F0aW9uLnBvcnR9dmFyIFA9XCJfX3BsYXNtb19ydW50aW1lX3BhZ2VfXCIsUz1cIl9fcGxhc21vX3J1bnRpbWVfc2NyaXB0X1wiO3ZhciBPPWAke24uc2VjdXJlP1wiaHR0cHNcIjpcImh0dHBcIn06Ly8ke1IoKX06JHtkKCl9L2A7YXN5bmMgZnVuY3Rpb24gayhlPTE0NzApe2Zvcig7Oyl0cnl7YXdhaXQgZmV0Y2goTyk7YnJlYWt9Y2F0Y2h7YXdhaXQgbmV3IFByb21pc2Uobz0+c2V0VGltZW91dChvLGUpKX19aWYoYy5ydW50aW1lLmdldE1hbmlmZXN0KCkubWFuaWZlc3RfdmVyc2lvbj09PTMpe2xldCBlPWMucnVudGltZS5nZXRVUkwoXCIvX19wbGFzbW9faG1yX3Byb3h5X18/dXJsPVwiKTtnbG9iYWxUaGlzLmFkZEV2ZW50TGlzdGVuZXIoXCJmZXRjaFwiLGZ1bmN0aW9uKHQpe2xldCBvPXQucmVxdWVzdC51cmw7aWYoby5zdGFydHNXaXRoKGUpKXtsZXQgcz1uZXcgVVJMKGRlY29kZVVSSUNvbXBvbmVudChvLnNsaWNlKGUubGVuZ3RoKSkpO3MuaG9zdG5hbWU9PT1uLmhvc3QmJnMucG9ydD09PWAke24ucG9ydH1gPyhzLnNlYXJjaFBhcmFtcy5zZXQoXCJ0XCIsRGF0ZS5ub3coKS50b1N0cmluZygpKSx0LnJlc3BvbmRXaXRoKGZldGNoKHMpLnRoZW4ocj0+bmV3IFJlc3BvbnNlKHIuYm9keSx7aGVhZGVyczp7XCJDb250ZW50LVR5cGVcIjpyLmhlYWRlcnMuZ2V0KFwiQ29udGVudC1UeXBlXCIpPz9cInRleHQvamF2YXNjcmlwdFwifX0pKSkpOnQucmVzcG9uZFdpdGgobmV3IFJlc3BvbnNlKFwiUGxhc21vIEhNUlwiLHtzdGF0dXM6MjAwLHN0YXR1c1RleHQ6XCJUZXN0aW5nXCJ9KSl9fSl9ZnVuY3Rpb24gRShlLHQpe2xldHttb2R1bGVzOm99PWU7cmV0dXJuIG8/ISFvW3RdOiExfWZ1bmN0aW9uIEMoZT1kKCkpe2xldCB0PXgoKTtyZXR1cm5gJHtuLnNlY3VyZXx8bG9jYXRpb24ucHJvdG9jb2w9PT1cImh0dHBzOlwiJiYhL2xvY2FsaG9zdHwxMjcuMC4wLjF8MC4wLjAuMC8udGVzdCh0KT9cIndzc1wiOlwid3NcIn06Ly8ke3R9OiR7ZX0vYH1mdW5jdGlvbiBMKGUpe3R5cGVvZiBlLm1lc3NhZ2U9PVwic3RyaW5nXCImJnkoXCJbcGxhc21vL3BhcmNlbC1ydW50aW1lXTogXCIrZS5tZXNzYWdlKX1mdW5jdGlvbiBUKGUpe2lmKHR5cGVvZiBnbG9iYWxUaGlzLldlYlNvY2tldD5cInVcIilyZXR1cm47bGV0IHQ9bmV3IFdlYlNvY2tldChDKE51bWJlcihkKCkpKzEpKTtyZXR1cm4gdC5hZGRFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLGFzeW5jIGZ1bmN0aW9uKG8pe2xldCBzPUpTT04ucGFyc2Uoby5kYXRhKTthd2FpdCBlKHMpfSksdC5hZGRFdmVudExpc3RlbmVyKFwiZXJyb3JcIixMKSx0fWZ1bmN0aW9uIEEoZSl7aWYodHlwZW9mIGdsb2JhbFRoaXMuV2ViU29ja2V0PlwidVwiKXJldHVybjtsZXQgdD1uZXcgV2ViU29ja2V0KEMoKSk7cmV0dXJuIHQuYWRkRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIixhc3luYyBmdW5jdGlvbihvKXtsZXQgcz1KU09OLnBhcnNlKG8uZGF0YSk7aWYocy50eXBlPT09XCJ1cGRhdGVcIiYmYXdhaXQgZShzLmFzc2V0cykscy50eXBlPT09XCJlcnJvclwiKWZvcihsZXQgciBvZiBzLmRpYWdub3N0aWNzLmFuc2kpe2xldCBsPXIuY29kZWZyYW1lfHxyLnN0YWNrO2YoXCJbcGxhc21vL3BhcmNlbC1ydW50aW1lXTogXCIrci5tZXNzYWdlK2BcbmArbCtgXG5cbmArci5oaW50cy5qb2luKGBcbmApKX19KSx0LmFkZEV2ZW50TGlzdGVuZXIoXCJlcnJvclwiLEwpLHQuYWRkRXZlbnRMaXN0ZW5lcihcIm9wZW5cIiwoKT0+e3YoYFtwbGFzbW8vcGFyY2VsLXJ1bnRpbWVdOiBDb25uZWN0ZWQgdG8gSE1SIHNlcnZlciBmb3IgJHtuLmVudHJ5RmlsZVBhdGh9YCl9KSx0LmFkZEV2ZW50TGlzdGVuZXIoXCJjbG9zZVwiLCgpPT57ZihgW3BsYXNtby9wYXJjZWwtcnVudGltZV06IENvbm5lY3Rpb24gdG8gdGhlIEhNUiBzZXJ2ZXIgaXMgY2xvc2VkIGZvciAke24uZW50cnlGaWxlUGF0aH1gKX0pLHR9dmFyIHc9bW9kdWxlLmJ1bmRsZS5wYXJlbnQsYT17YnVpbGRSZWFkeTohMSxiZ0NoYW5nZWQ6ITEsY3NDaGFuZ2VkOiExLHBhZ2VDaGFuZ2VkOiExLHNjcmlwdFBvcnRzOm5ldyBTZXQscGFnZVBvcnRzOm5ldyBTZXR9O2FzeW5jIGZ1bmN0aW9uIHAoZT0hMSl7aWYoZXx8YS5idWlsZFJlYWR5JiZhLnBhZ2VDaGFuZ2VkKXtpKFwiQkdTVyBSdW50aW1lIC0gcmVsb2FkaW5nIFBhZ2VcIik7Zm9yKGxldCB0IG9mIGEucGFnZVBvcnRzKXQucG9zdE1lc3NhZ2UobnVsbCl9aWYoZXx8YS5idWlsZFJlYWR5JiYoYS5iZ0NoYW5nZWR8fGEuY3NDaGFuZ2VkKSl7aShcIkJHU1cgUnVudGltZSAtIHJlbG9hZGluZyBDU1wiKTtsZXQgdD1hd2FpdCBjPy50YWJzLnF1ZXJ5KHthY3RpdmU6ITB9KTtmb3IobGV0IG8gb2YgYS5zY3JpcHRQb3J0cyl7bGV0IHM9dC5zb21lKHI9PnIuaWQ9PT1vLnNlbmRlci50YWI/LmlkKTtvLnBvc3RNZXNzYWdlKHtfX3BsYXNtb19jc19hY3RpdmVfdGFiX186c30pfWMucnVudGltZS5yZWxvYWQoKX19aWYoIXd8fCF3LmlzUGFyY2VsUmVxdWlyZSl7YigpO2xldCBlPUEoYXN5bmMgdD0+e2koXCJCR1NXIFJ1bnRpbWUgLSBPbiBITVIgVXBkYXRlXCIpLGEuYmdDaGFuZ2VkfHw9dC5maWx0ZXIocz0+cy5lbnZIYXNoPT09bi5lbnZIYXNoKS5zb21lKHM9PkUobW9kdWxlLmJ1bmRsZSxzLmlkKSk7bGV0IG89dC5maW5kKHM9PnMudHlwZT09PVwianNvblwiKTtpZihvKXtsZXQgcz1uZXcgU2V0KHQubWFwKGw9PmwuaWQpKSxyPU9iamVjdC52YWx1ZXMoby5kZXBzQnlCdW5kbGUpLm1hcChsPT5PYmplY3QudmFsdWVzKGwpKS5mbGF0KCk7YS5iZ0NoYW5nZWR8fD1yLmV2ZXJ5KGw9PnMuaGFzKGwpKX1wKCl9KTtlLmFkZEV2ZW50TGlzdGVuZXIoXCJvcGVuXCIsKCk9PntsZXQgdD1zZXRJbnRlcnZhbCgoKT0+ZS5zZW5kKFwicGluZ1wiKSwyNGUzKTtlLmFkZEV2ZW50TGlzdGVuZXIoXCJjbG9zZVwiLCgpPT5jbGVhckludGVydmFsKHQpKX0pLGUuYWRkRXZlbnRMaXN0ZW5lcihcImNsb3NlXCIsYXN5bmMoKT0+e2F3YWl0IGsoKSxwKCEwKX0pfVQoYXN5bmMgZT0+e3N3aXRjaChpKFwiQkdTVyBSdW50aW1lIC0gT24gQnVpbGQgUmVwYWNrYWdlZFwiKSxlLnR5cGUpe2Nhc2VcImJ1aWxkX3JlYWR5XCI6e2EuYnVpbGRSZWFkeXx8PSEwLHAoKTticmVha31jYXNlXCJjc19jaGFuZ2VkXCI6e2EuY3NDaGFuZ2VkfHw9ITAscCgpO2JyZWFrfX19KTtjLnJ1bnRpbWUub25Db25uZWN0LmFkZExpc3RlbmVyKGZ1bmN0aW9uKGUpe2xldCB0PWUubmFtZS5zdGFydHNXaXRoKFApLG89ZS5uYW1lLnN0YXJ0c1dpdGgoUyk7aWYodHx8byl7bGV0IHM9dD9hLnBhZ2VQb3J0czphLnNjcmlwdFBvcnRzO3MuYWRkKGUpLGUub25EaXNjb25uZWN0LmFkZExpc3RlbmVyKCgpPT57cy5kZWxldGUoZSl9KSxlLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcihmdW5jdGlvbihyKXtpKFwiQkdTVyBSdW50aW1lIC0gT24gc291cmNlIGNoYW5nZWRcIixyKSxyLl9fcGxhc21vX2NzX2NoYW5nZWRfXyYmKGEuY3NDaGFuZ2VkfHw9ITApLHIuX19wbGFzbW9fcGFnZV9jaGFuZ2VkX18mJihhLnBhZ2VDaGFuZ2VkfHw9ITApLHAoKX0pfX0pO2MucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoZnVuY3Rpb24odCl7cmV0dXJuIHQuX19wbGFzbW9fZnVsbF9yZWxvYWRfXyYmKGkoXCJCR1NXIFJ1bnRpbWUgLSBPbiB0b3AtbGV2ZWwgY29kZSBjaGFuZ2VkXCIpLHAoKSksITB9KTtcbiIsImltcG9ydCBcIi4uLy4uLy4uL3NyYy9iYWNrZ3JvdW5kXCIiLCJpbXBvcnQgJy4uL2JhY2tncm91bmQnO1xuIiwiaW1wb3J0IHtcbiAgQ0FSRF9QQVJTRVJfVkVSU0lPTixcbiAgc2NyYXBlZE1hbnlUb1BhcnNlZFBheWxvYWQsXG4gIHR5cGUgU2NyYXBlZENhcmRUcmFuc2FjdGlvbixcbn0gZnJvbSAnLi9zcmMvbGliL25vcm1hbGl6ZSc7XG5cbnR5cGUgQ2FwdHVyZVJlc3VsdCA9XG4gIHwge1xuICAgICAgb2s6IHRydWU7XG4gICAgICBodG1sOiBzdHJpbmc7XG4gICAgICBzb3VyY2VVcmw6IHN0cmluZztcbiAgICAgIGNhcHR1cmVkQXQ6IHN0cmluZztcbiAgICAgIHRyYW5zYWN0aW9uQ291bnQ6IG51bWJlcjtcbiAgICAgIHRyYW5zYWN0aW9uczogU2NyYXBlZENhcmRUcmFuc2FjdGlvbltdO1xuICAgICAgY2FyZEJhbGFuY2U/OiB7IGFtb3VudDogc3RyaW5nOyBjdXJyZW5jeTogc3RyaW5nIH07XG4gICAgfVxuICB8IHtcbiAgICAgIG9rOiBmYWxzZTtcbiAgICAgIGVycm9yOiBzdHJpbmc7XG4gICAgICBzb3VyY2VVcmw/OiBzdHJpbmc7XG4gICAgICBjYXB0dXJlZEF0OiBzdHJpbmc7XG4gICAgfTtcblxudHlwZSBDYXB0dXJlTWVzc2FnZSA9IHsgdHlwZTogJ0NBUFRVUkVfQ0FSRF9IVE1MJyB9O1xudHlwZSBTY3JhcGVNZXNzYWdlID0geyB0eXBlOiAnU0NSQVBFX0NBUkRfSFRNTCcgfTtcblxudHlwZSBTdG9yZWRDYXB0dXJlID0gQ2FwdHVyZVJlc3VsdCAmIHtcbiAgam9iSWQ6IHN0cmluZztcbiAgc2F2ZWRBdDogc3RyaW5nO1xufTtcblxuLyoqIFBhaXJpbmcgdG9rZW4gaXMgc2F2ZWQgZnJvbSB0aGUgcG9wdXAuICovXG5leHBvcnQgY29uc3QgU1RPUkFHRV9BUElfVE9LRU5fS0VZID0gJ2NyeXB0b3RyYWNrQXBpVG9rZW4nO1xuXG5jb25zdCBMT0dfUFJFRklYID0gJ1tNZXRhU3BlbmQgQ2FyZCBDYXB0dXJlXSc7XG5cbmNvbnN0IFNUT1JBR0VfS0VZID0gJ2NhcmRDYXB0dXJlcyc7XG4vKiogQ29udGVudC1zY3JpcHQgc2NyYXBlIG11c3QgZmluaXNoIHF1aWNrbHk7IHN5bmMgSFRUUCBydW5zIGluIHRoZSBwb3B1cCAoTVYzIHdvcmtlcnMgc3VzcGVuZCBvbiBsb25nIGZldGNoKS4gKi9cbmNvbnN0IFNDUkFQRV9USU1FT1VUX01TID0gMTVfMDAwO1xuXG5mdW5jdGlvbiB3aXRoVGltZW91dDxUPihwcm9taXNlOiBQcm9taXNlPFQ+LCBtczogbnVtYmVyLCBtZXNzYWdlOiBzdHJpbmcpOiBQcm9taXNlPFQ+IHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBjb25zdCB0aW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiByZWplY3QobmV3IEVycm9yKG1lc3NhZ2UpKSwgbXMpO1xuICAgIHByb21pc2UudGhlbihcbiAgICAgICh2YWx1ZSkgPT4ge1xuICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICAgIHJlc29sdmUodmFsdWUpO1xuICAgICAgfSxcbiAgICAgIChlcnJvcikgPT4ge1xuICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICB9LFxuICAgICk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBpc0NhcmRQYWdlKHVybDogc3RyaW5nIHwgdW5kZWZpbmVkKTogYm9vbGVhbiB7XG4gIGlmICghdXJsKSByZXR1cm4gZmFsc2U7XG5cbiAgdHJ5IHtcbiAgICBjb25zdCBwYXJzZWQgPSBuZXcgVVJMKHVybCk7XG4gICAgcmV0dXJuIHBhcnNlZC5ob3N0bmFtZSA9PT0gJ2NhcmQubWV0YW1hc2suaW8nIHx8IHBhcnNlZC5ob3N0bmFtZSA9PT0gJ3BvcnRmb2xpby5tZXRhbWFzay5pbyc7XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG4vKiogSW5qZWN0ZWQgdmlhIGBjaHJvbWUuc2NyaXB0aW5nLmV4ZWN1dGVTY3JpcHRgIOKAlCBrZWVwIHNlbGYtY29udGFpbmVkLiAqL1xuZnVuY3Rpb24gc2NyYXBlRnJvbVBhZ2UoKTogQ2FwdHVyZVJlc3VsdCB7XG4gIHR5cGUgUFQgPSBTY3JhcGVkQ2FyZFRyYW5zYWN0aW9uO1xuXG4gIGNvbnN0IGNhcHR1cmVkQXQgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG5cbiAgdHJ5IHtcbiAgICBjb25zdCBjbGVhblRleHQgPSAodmFsdWU6IHN0cmluZyB8IG51bGwgfCB1bmRlZmluZWQpOiBzdHJpbmcgPT4gKHZhbHVlID8/ICcnKS5yZXBsYWNlKC9cXHMrL2csICcgJykudHJpbSgpO1xuICAgIGNvbnN0IHRleHRGcm9tID0gKHJvb3Q6IEVsZW1lbnQsIHNlbGVjdG9yOiBzdHJpbmcpOiBzdHJpbmcgPT5cbiAgICAgIGNsZWFuVGV4dChyb290LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpPy50ZXh0Q29udGVudCk7XG4gICAgY29uc3QgZGV0YWlsVmFsdWUgPSAocm93OiBFbGVtZW50LCBsYWJlbDogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCA9PiB7XG4gICAgICBjb25zdCBkZXRhaWxSb3dzID0gQXJyYXkuZnJvbShyb3cucXVlcnlTZWxlY3RvckFsbCgnLnRyYW5zYWN0aW9uUm93X19kZXRhaWxzX3Jvd19jb250YWluZXInKSk7XG5cbiAgICAgIGNvbnN0IG1hdGNoID0gZGV0YWlsUm93cy5maW5kKFxuICAgICAgICAoaXRlbSkgPT4gY2xlYW5UZXh0KGl0ZW0ucXVlcnlTZWxlY3RvcigncDpmaXJzdC1jaGlsZCcpPy50ZXh0Q29udGVudCkgPT09IGxhYmVsLFxuICAgICAgKTtcblxuICAgICAgaWYgKCFtYXRjaCkgcmV0dXJuIG51bGw7XG5cbiAgICAgIHJldHVybiBjbGVhblRleHQobWF0Y2gucXVlcnlTZWxlY3RvcigncDpsYXN0LWNoaWxkJyk/LnRleHRDb250ZW50KSB8fCBudWxsO1xuICAgIH07XG5cbiAgICBjb25zdCBmdW5kaW5nVmFsdWUgPSAocm93OiBFbGVtZW50LCBsYWJlbDogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCA9PiB7XG4gICAgICBjb25zdCBmdW5kaW5nUm93cyA9IEFycmF5LmZyb20ocm93LnF1ZXJ5U2VsZWN0b3JBbGwoJy50cmFuc2FjdGlvblJvd19fZGV0YWlsc19mdW5kaW5nX3JvdycpKTtcblxuICAgICAgY29uc3QgbWF0Y2ggPSBmdW5kaW5nUm93cy5maW5kKFxuICAgICAgICAoaXRlbSkgPT4gY2xlYW5UZXh0KGl0ZW0ucXVlcnlTZWxlY3RvcigncDpmaXJzdC1jaGlsZCcpPy50ZXh0Q29udGVudCkgPT09IGxhYmVsLFxuICAgICAgKTtcblxuICAgICAgaWYgKCFtYXRjaCkgcmV0dXJuIG51bGw7XG5cbiAgICAgIHJldHVybiBjbGVhblRleHQobWF0Y2gucXVlcnlTZWxlY3RvcigncDpsYXN0LWNoaWxkJyk/LnRleHRDb250ZW50KSB8fCBudWxsO1xuICAgIH07XG5cbiAgICBjb25zdCBwYXJzZVRyYW5zYWN0aW9uID0gKHJvdzogRWxlbWVudCk6IFBUID0+ICh7XG4gICAgICBtZXJjaGFudDogdGV4dEZyb20ocm93LCAnLnRyYW5zYWN0aW9uUm93X19kZXRhaWxzX3Jvd19tZXJjaGFudCcpLFxuXG4gICAgICB0aW1lOiB0ZXh0RnJvbShyb3csICcudHJhbnNhY3Rpb25Sb3dfX3N1bW1hcnlfdGl0bGVfY29udGFpbmVyIHA6bGFzdC1jaGlsZCcpLFxuXG4gICAgICBhbW91bnQ6IHRleHRGcm9tKHJvdywgJy50cmFuc2FjdGlvblJvd19fc3VtbWFyeV9jb250YWluZXIgPiBkaXY6bGFzdC1jaGlsZCBwOmZpcnN0LWNoaWxkJyksXG5cbiAgICAgIHR5cGU6IHRleHRGcm9tKHJvdywgJy50cmFuc2FjdGlvblJvd19fc3VtbWFyeV9jb250YWluZXIgPiBkaXY6bGFzdC1jaGlsZCBwOmxhc3QtY2hpbGQnKSxcblxuICAgICAgc3RhdHVzOiBkZXRhaWxWYWx1ZShyb3csICdTdGF0dXMnKSxcblxuICAgICAgdHJhbnNhY3Rpb25JZDogZGV0YWlsVmFsdWUocm93LCAnVHJhbnNhY3Rpb24gSUQnKSxcblxuICAgICAgZGF0ZTogZGV0YWlsVmFsdWUocm93LCAnRGF0ZScpLFxuXG4gICAgICBjYXJkUGFuOiBkZXRhaWxWYWx1ZShyb3csICdDYXJkIFBBTicpLFxuXG4gICAgICBzb3VyY2U6IGZ1bmRpbmdWYWx1ZShyb3csICdTb3VyY2UnKSxcblxuICAgICAgc3BlbnQ6IGZ1bmRpbmdWYWx1ZShyb3csICdTcGVudCcpLFxuXG4gICAgICBnYXNGZWU6IGZ1bmRpbmdWYWx1ZShyb3csICdHYXMgZmVlJyksXG4gICAgfSk7XG5cbiAgICBjb25zdCBsaXN0ID1cbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy50cmFuc2FjdGlvbkxpc3RfX21haW5fY29udGFpbmVyJykgPz9cbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ21haW4nKSA/P1xuICAgICAgZG9jdW1lbnQuYm9keTtcblxuICAgIGlmICghbGlzdCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgb2s6IGZhbHNlLFxuICAgICAgICBlcnJvcjogJ0NvdWxkIG5vdCBmaW5kIGRvY3VtZW50IGJvZHkuJyxcblxuICAgICAgICBzb3VyY2VVcmw6IGxvY2F0aW9uLmhyZWYsXG4gICAgICAgIGNhcHR1cmVkQXQsXG4gICAgICB9O1xuXG4gICAgfVxuXG4gICAgY29uc3Qgcm93c0Zyb21Eb20gPSBBcnJheS5mcm9tKGxpc3QucXVlcnlTZWxlY3RvckFsbCgnLnRyYW5zYWN0aW9uUm93X19hY2NvcmRpb25fbWFpbl9jb250YWluZXInKSk7XG4gICAgY29uc3QgdHJhbnNhY3Rpb25zID0gcm93c0Zyb21Eb20ubWFwKHBhcnNlVHJhbnNhY3Rpb24pO1xuXG4gICAgY29uc3Qgc2NyYXBlQ2FyZEJhbGFuY2VTbmFwc2hvdCA9ICgpOiB7IGFtb3VudDogc3RyaW5nOyBjdXJyZW5jeTogc3RyaW5nIH0gfCBudWxsID0+IHtcbiAgICAgIGNvbnN0IGNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jYXJkSW1hZ2VyeV9fY2FyZF9zdmdfY29udGFpbmVyJyk7XG4gICAgICBpZiAoIWNvbnRhaW5lcikgcmV0dXJuIG51bGw7XG4gICAgICBjb25zdCB0ZXh0RWxzID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoJ3N2ZyB0ZXh0Jyk7XG4gICAgICBmb3IgKGxldCB0aSA9IDA7IHRpIDwgdGV4dEVscy5sZW5ndGg7IHRpKyspIHtcbiAgICAgICAgY29uc3QgdGV4dEVsID0gdGV4dEVsc1t0aV07XG4gICAgICAgIGNvbnN0IHRzcGFucyA9IHRleHRFbC5xdWVyeVNlbGVjdG9yQWxsKCd0c3BhbicpO1xuICAgICAgICBpZiAodHNwYW5zLmxlbmd0aCA9PT0gMCkgY29udGludWU7XG4gICAgICAgIGxldCBhbW91bnQgPSAnJztcbiAgICAgICAgZm9yIChsZXQgbmkgPSAwOyBuaSA8IHRleHRFbC5jaGlsZE5vZGVzLmxlbmd0aDsgbmkrKykge1xuICAgICAgICAgIGNvbnN0IG5vZGUgPSB0ZXh0RWwuY2hpbGROb2Rlc1tuaV07XG4gICAgICAgICAgaWYgKG5vZGUubm9kZVR5cGUgPT09IE5vZGUuVEVYVF9OT0RFKSB7XG4gICAgICAgICAgICBhbW91bnQgKz0gKG5vZGUudGV4dENvbnRlbnQgfHwgJycpLnRyaW0oKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYW1vdW50ID0gYW1vdW50LnJlcGxhY2UoL1xccy9nLCAnJyk7XG4gICAgICAgIGNvbnN0IGN1cnJlbmN5RWwgPSB0c3BhbnNbdHNwYW5zLmxlbmd0aCAtIDFdO1xuICAgICAgICBjb25zdCBjdXJyZW5jeSA9ICgoY3VycmVuY3lFbCAmJiBjdXJyZW5jeUVsLnRleHRDb250ZW50KSB8fCAnJylcbiAgICAgICAgICAudHJpbSgpXG4gICAgICAgICAgLnJlcGxhY2UoL1xccy9nLCAnJyk7XG4gICAgICAgIGlmICghYW1vdW50IHx8ICFjdXJyZW5jeSkgY29udGludWU7XG4gICAgICAgIGNvbnN0IG5vcm1hbGl6ZWRBbW91bnQgPSBhbW91bnQucmVwbGFjZSgvLC9nLCAnJyk7XG4gICAgICAgIGlmICghL15cXGQrKFxcLlxcZCspPyQvLnRlc3Qobm9ybWFsaXplZEFtb3VudCkpIGNvbnRpbnVlO1xuICAgICAgICByZXR1cm4geyBhbW91bnQ6IG5vcm1hbGl6ZWRBbW91bnQsIGN1cnJlbmN5IH07XG4gICAgICB9XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9O1xuXG4gICAgY29uc3Qgc25hcCA9IHNjcmFwZUNhcmRCYWxhbmNlU25hcHNob3QoKTtcbiAgICBjb25zdCBvdXQ6IENhcHR1cmVSZXN1bHQgPSB7XG4gICAgICBvazogdHJ1ZSxcbiAgICAgIGh0bWw6ICcnLFxuICAgICAgc291cmNlVXJsOiBsb2NhdGlvbi5ocmVmLFxuICAgICAgY2FwdHVyZWRBdCxcbiAgICAgIHRyYW5zYWN0aW9uQ291bnQ6IHRyYW5zYWN0aW9ucy5sZW5ndGgsXG4gICAgICB0cmFuc2FjdGlvbnMsXG4gICAgfTtcbiAgICBpZiAoc25hcCkgb3V0LmNhcmRCYWxhbmNlID0gc25hcDtcbiAgICByZXR1cm4gb3V0O1xuXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG5cbiAgICByZXR1cm4ge1xuXG4gICAgICBvazogZmFsc2UsXG4gICAgICBlcnJvcjogZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpLFxuXG4gICAgICBzb3VyY2VVcmw6IGxvY2F0aW9uLmhyZWYsXG4gICAgICBjYXB0dXJlZEF0LFxuICAgIH07XG5cbiAgfVxuXG59XG5cbmFzeW5jIGZ1bmN0aW9uIGdldEFjdGl2ZVRhYigpOiBQcm9taXNlPGNocm9tZS50YWJzLlRhYiB8IG51bGw+IHtcbiAgY29uc3QgW3RhYl0gPSBhd2FpdCBjaHJvbWUudGFicy5xdWVyeSh7IGFjdGl2ZTogdHJ1ZSwgY3VycmVudFdpbmRvdzogdHJ1ZSB9KTtcbiAgcmV0dXJuIHRhYiA/PyBudWxsO1xuXG59XG5cbmFzeW5jIGZ1bmN0aW9uIGFza0NvbnRlbnRTY3JpcHQodGFiSWQ6IG51bWJlcik6IFByb21pc2U8Q2FwdHVyZVJlc3VsdD4ge1xuICBjb25zb2xlLmxvZyhMT0dfUFJFRklYLCAnYXNraW5nIGNvbnRlbnQgc2NyaXB0IHRvIHNjcmFwZSB0YWInLCB0YWJJZCk7XG4gIHJldHVybiB3aXRoVGltZW91dChcbiAgICBjaHJvbWUudGFicy5zZW5kTWVzc2FnZSh0YWJJZCwgeyB0eXBlOiAnU0NSQVBFX0NBUkRfSFRNTCcgfSBzYXRpc2ZpZXMgU2NyYXBlTWVzc2FnZSksXG4gICAgU0NSQVBFX1RJTUVPVVRfTVMsXG4gICAgJ1RpbWVkIG91dCB3YWl0aW5nIGZvciB0aGUgTWV0YU1hc2sgcGFnZSBzY3JhcGVyLicsXG4gICk7XG5cbn1cblxuYXN5bmMgZnVuY3Rpb24gZXhlY3V0ZUZhbGxiYWNrU2NyYXBlcih0YWJJZDogbnVtYmVyKTogUHJvbWlzZTxDYXB0dXJlUmVzdWx0PiB7XG4gIGNvbnNvbGUubG9nKExPR19QUkVGSVgsICdjb250ZW50IHNjcmlwdCB3YXMgbm90IHJlYWR5LCBpbmplY3RpbmcgZmFsbGJhY2sgc2NyYXBlciBpbnRvIHRhYicsIHRhYklkKTtcblxuICBjb25zdCBbcmVzdWx0XSA9IGF3YWl0IGNocm9tZS5zY3JpcHRpbmcuZXhlY3V0ZVNjcmlwdCh7XG4gICAgdGFyZ2V0OiB7IHRhYklkIH0sXG4gICAgZnVuYzogc2NyYXBlRnJvbVBhZ2UsXG5cbiAgfSk7XG5cbiAgcmV0dXJuIChcbiAgICByZXN1bHQ/LnJlc3VsdCA/P1xuICAgICh7XG4gICAgICBvazogZmFsc2UsXG4gICAgICBlcnJvcjogJ1NjcmlwdCBleGVjdXRlZCBidXQgcmV0dXJuZWQgbm8gcmVzdWx0LicsXG4gICAgICBjYXB0dXJlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgfSBzYXRpc2ZpZXMgQ2FwdHVyZVJlc3VsdClcblxuICApO1xuXG59XG5cbmFzeW5jIGZ1bmN0aW9uIGNhcHR1cmVUYWIodGFiOiBjaHJvbWUudGFicy5UYWIpOiBQcm9taXNlPENhcHR1cmVSZXN1bHQ+IHtcblxuICBjb25zb2xlLmxvZyhMT0dfUFJFRklYLCAnY2FwdHVyZSByZXF1ZXN0ZWQgZm9yIGFjdGl2ZSB0YWInLCB7IGlkOiB0YWIuaWQsIHVybDogdGFiLnVybCB9KTtcblxuXG4gIGlmICghdGFiLmlkKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG9rOiBmYWxzZSxcbiAgICAgIGVycm9yOiAnQWN0aXZlIHRhYiBoYXMgbm8gaWQuJyxcblxuICAgICAgc291cmNlVXJsOiB0YWIudXJsLFxuXG4gICAgICBjYXB0dXJlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG5cbiAgICB9O1xuXG4gIH1cblxuXG4gIGlmICghaXNDYXJkUGFnZSh0YWIudXJsKSkge1xuXG4gICAgcmV0dXJuIHtcblxuICAgICAgb2s6IGZhbHNlLFxuICAgICAgZXJyb3I6ICdPcGVuIGNhcmQubWV0YW1hc2suaW8gb3IgcG9ydGZvbGlvLm1ldGFtYXNrLmlvIGJlZm9yZSBzeW5jaW5nLicsXG5cbiAgICAgIHNvdXJjZVVybDogdGFiLnVybCxcblxuICAgICAgY2FwdHVyZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgIH07XG5cblxuICB9XG5cblxuICB0cnkge1xuXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgYXNrQ29udGVudFNjcmlwdCh0YWIuaWQpO1xuXG5cbiAgICBjb25zb2xlLmxvZyhMT0dfUFJFRklYLCAnY29udGVudCBzY3JpcHQgc2NyYXBlIGZpbmlzaGVkJywgcmVzdWx0Lm9rID8gcmVzdWx0LnRyYW5zYWN0aW9uQ291bnQgOiByZXN1bHQuZXJyb3IpO1xuXG5cbiAgICByZXR1cm4gcmVzdWx0O1xuXG5cbiAgfSBjYXRjaCAoZXJyb3IpIHtcblxuXG5cbiAgICBjb25zb2xlLndhcm4oTE9HX1BSRUZJWCwgJ2NvbnRlbnQgc2NyaXB0IHNjcmFwZSBmYWlsZWQsIHRyeWluZyBmYWxsYmFjayBpbmplY3Rpb24nLCBlcnJvcik7XG5cblxuXG4gICAgcmV0dXJuIHdpdGhUaW1lb3V0KFxuICAgICAgZXhlY3V0ZUZhbGxiYWNrU2NyYXBlcih0YWIuaWQpLFxuICAgICAgU0NSQVBFX1RJTUVPVVRfTVMsXG4gICAgICAnVGltZWQgb3V0IHdoaWxlIGluamVjdGluZyB0aGUgZmFsbGJhY2sgc2NyYXBlci4nLFxuICAgICk7XG5cblxuXG4gIH1cblxuXG5cbn1cblxuXG5cbmFzeW5jIGZ1bmN0aW9uIHNhdmVDYXB0dXJlKGpvYklkOiBzdHJpbmcsIHJlc3VsdDogQ2FwdHVyZVJlc3VsdCk6IFByb21pc2U8U3RvcmVkQ2FwdHVyZT4ge1xuXG5cblxuICBjb25zdCBzYXZlZENhcHR1cmU6IFN0b3JlZENhcHR1cmUgPSB7XG4gICAgLi4ucmVzdWx0LFxuICAgIGpvYklkLFxuICAgIHNhdmVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgfTtcblxuXG4gIGNvbnN0IGN1cnJlbnQgPSBhd2FpdCBjaHJvbWUuc3RvcmFnZS5sb2NhbC5nZXQoU1RPUkFHRV9LRVkpO1xuICBjb25zdCBjYXB0dXJlcyA9IEFycmF5LmlzQXJyYXkoY3VycmVudFtTVE9SQUdFX0tFWV0pID8gY3VycmVudFtTVE9SQUdFX0tFWV0gOiBbXTtcblxuICBjb25zdCBuZXh0Q2FwdHVyZXMgPSBbc2F2ZWRDYXB0dXJlLCAuLi5jYXB0dXJlc10uc2xpY2UoMCwgMjApO1xuXG5cbiAgYXdhaXQgY2hyb21lLnN0b3JhZ2UubG9jYWwuc2V0KHsgW1NUT1JBR0VfS0VZXTogbmV4dENhcHR1cmVzIH0pO1xuXG5cbiAgY29uc29sZS5sb2coTE9HX1BSRUZJWCwgJ3NhdmVkIGNhcHR1cmUgaW4gY2hyb21lLnN0b3JhZ2UubG9jYWwnLCB7XG4gICAgam9iSWQsXG4gICAgb2s6IHNhdmVkQ2FwdHVyZS5vayxcbiAgICB0cmFuc2FjdGlvbkNvdW50OiBzYXZlZENhcHR1cmUub2sgPyBzYXZlZENhcHR1cmUudHJhbnNhY3Rpb25Db3VudCA6IDAsXG4gIH0pO1xuXG5cbiAgcmV0dXJuIHNhdmVkQ2FwdHVyZTtcblxuXG59XG5cblxuXG5hc3luYyBmdW5jdGlvbiBnZXRTdG9yZWRBcGlUb2tlbigpOiBQcm9taXNlPHN0cmluZyB8IHVuZGVmaW5lZD4ge1xuICBjb25zdCB2ID0gYXdhaXQgY2hyb21lLnN0b3JhZ2UubG9jYWwuZ2V0KFNUT1JBR0VfQVBJX1RPS0VOX0tFWSk7XG4gIGNvbnN0IHRva2VuID0gdltTVE9SQUdFX0FQSV9UT0tFTl9LRVldO1xuICByZXR1cm4gdHlwZW9mIHRva2VuID09PSAnc3RyaW5nJyAmJiB0b2tlbi5sZW5ndGggPiAwID8gdG9rZW4gOiB1bmRlZmluZWQ7XG5cblxuXG59XG5cblxuXG5jaHJvbWUucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoKG1lc3NhZ2U6IENhcHR1cmVNZXNzYWdlLCBfc2VuZGVyLCBzZW5kUmVzcG9uc2UpID0+IHtcbiAgaWYgKG1lc3NhZ2U/LnR5cGUgIT09ICdDQVBUVVJFX0NBUkRfSFRNTCcpIHJldHVybiBmYWxzZTtcblxuICBjb25zb2xlLmxvZyhMT0dfUFJFRklYLCAnY2FwdHVyZSByZXF1ZXN0IGZyb20gcG9wdXAnKTtcblxuICB2b2lkIChhc3luYyAoKSA9PiB7XG4gICAgY29uc3Qgam9iSWQgPSBjcnlwdG8ucmFuZG9tVVVJRCgpO1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHRhYiA9IGF3YWl0IGdldEFjdGl2ZVRhYigpO1xuICAgICAgY29uc3QgcmVzdWx0ID1cbiAgICAgICAgdGFiXG4gICAgICAgICAgPyBhd2FpdCBjYXB0dXJlVGFiKHRhYilcbiAgICAgICAgICA6ICh7IG9rOiBmYWxzZSwgZXJyb3I6ICdObyBhY3RpdmUgdGFiIGZvdW5kLicsIGNhcHR1cmVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSB9IHNhdGlzZmllcyBDYXB0dXJlUmVzdWx0KTtcblxuICAgICAgYXdhaXQgc2F2ZUNhcHR1cmUoam9iSWQsIHJlc3VsdCk7XG5cbiAgICAgIGlmICghcmVzdWx0Lm9rKSB7XG4gICAgICAgIHNlbmRSZXNwb25zZSh7IG9rOiBmYWxzZSBhcyBjb25zdCwgZXJyb3I6IHJlc3VsdC5lcnJvciwgam9iSWQgfSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3QgdG9rZW4gPSBhd2FpdCBnZXRTdG9yZWRBcGlUb2tlbigpO1xuXG4gICAgICBpZiAoIXRva2VuKSB7XG4gICAgICAgIHNlbmRSZXNwb25zZSh7XG4gICAgICAgICAgb2s6IHRydWUgYXMgY29uc3QsXG4gICAgICAgICAgam9iSWQsXG4gICAgICAgICAgc2NyYXBlT2s6IHRydWUsXG4gICAgICAgICAgdHJhbnNhY3Rpb25Db3VudDogcmVzdWx0LnRyYW5zYWN0aW9uQ291bnQsXG4gICAgICAgICAgc3luY1BheWxvYWQ6IG51bGwsXG4gICAgICAgICAgc2NyYXBlT25seU1lc3NhZ2U6IGBTY3JhcGVkICR7cmVzdWx0LnRyYW5zYWN0aW9uQ291bnR9IHJvd3MuIFBhaXIgdGhlIGV4dGVuc2lvbiBmaXJzdCB0byBwdXNoIHRyYW5zYWN0aW9ucy5gLFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBpdGVtcyA9IHNjcmFwZWRNYW55VG9QYXJzZWRQYXlsb2FkKHJlc3VsdC50cmFuc2FjdGlvbnMpO1xuXG4gICAgICBzZW5kUmVzcG9uc2Uoe1xuICAgICAgICBvazogdHJ1ZSBhcyBjb25zdCxcbiAgICAgICAgam9iSWQsXG4gICAgICAgIHNjcmFwZU9rOiB0cnVlLFxuICAgICAgICB0cmFuc2FjdGlvbkNvdW50OiByZXN1bHQudHJhbnNhY3Rpb25Db3VudCxcbiAgICAgICAgc3luY1BheWxvYWQ6IHtcbiAgICAgICAgICBwYXJzZXJWZXJzaW9uOiBDQVJEX1BBUlNFUl9WRVJTSU9OLFxuICAgICAgICAgIGl0ZW1zLFxuICAgICAgICAgIC4uLihyZXN1bHQub2sgJiYgcmVzdWx0LmNhcmRCYWxhbmNlXG4gICAgICAgICAgICA/IHsgY2FyZEJhbGFuY2VTbmFwc2hvdDogcmVzdWx0LmNhcmRCYWxhbmNlIH1cbiAgICAgICAgICAgIDoge30pLFxuICAgICAgICB9LFxuICAgICAgICBzY3JhcGVPbmx5TWVzc2FnZTogbnVsbCxcbiAgICAgIH0pO1xuXG5cbiAgICB9IGNhdGNoIChvdXRlcikge1xuICAgICAgY29uc3QgZXJyTXNnID0gb3V0ZXIgaW5zdGFuY2VvZiBFcnJvciA/IG91dGVyLm1lc3NhZ2UgOiBTdHJpbmcob3V0ZXIpO1xuXG4gICAgICBjb25zb2xlLmVycm9yKExPR19QUkVGSVgsICdjYXB0dXJlIGpvYiBmYWlsZWQnLCBvdXRlcik7XG5cbiAgICAgIGF3YWl0IHNhdmVDYXB0dXJlKGpvYklkLCB7XG4gICAgICAgIG9rOiBmYWxzZSxcblxuICAgICAgICBlcnJvcjogZXJyTXNnLFxuICAgICAgICBjYXB0dXJlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG5cbiAgICAgIH0pO1xuXG5cbiAgICAgIHNlbmRSZXNwb25zZSh7IG9rOiBmYWxzZSBhcyBjb25zdCwgZXJyb3I6IGVyck1zZywgam9iSWQgfSk7XG4gICAgfVxuXG5cblxuICB9KSgpO1xuXG5cblxuICByZXR1cm4gdHJ1ZTtcblxuXG59KTtcbiIsIi8qKlxuICogUm93cyBmcm9tIERPTSBzY3JhcGUgKGBtZXJjaGFudGDigKYpIG9yIHNuYXBzaG90cyB1c2luZyBgdGl0bGVgIC8gbmVzdGVkIGBmdW5kaW5nYC5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7IENhcmRUeFdpcmUsIFBhcnNlZENhcmRXaXJlIH0gZnJvbSAnLi9hcGknO1xuXG5leHBvcnQgaW50ZXJmYWNlIFNjcmFwZWRDYXJkVHJhbnNhY3Rpb24ge1xuICBtZXJjaGFudD86IHN0cmluZztcbiAgdGl0bGU/OiBzdHJpbmc7XG4gIHRpbWU/OiBzdHJpbmc7XG4gIGFtb3VudD86IHN0cmluZztcbiAgdHlwZT86IHN0cmluZztcbiAgc3RhdHVzPzogc3RyaW5nIHwgbnVsbDtcbiAgdHJhbnNhY3Rpb25JZD86IHN0cmluZyB8IG51bGw7XG4gIGRhdGU/OiBzdHJpbmcgfCBudWxsO1xuICBjYXJkUGFuPzogc3RyaW5nIHwgbnVsbDtcbiAgc291cmNlPzogc3RyaW5nIHwgbnVsbDtcbiAgc3BlbnQ/OiBzdHJpbmcgfCBudWxsO1xuICBnYXNGZWU/OiBzdHJpbmcgfCBudWxsO1xuICBmdW5kaW5nPzoge1xuICAgIHNvdXJjZT86IHN0cmluZyB8IG51bGw7XG4gICAgc3BlbnQ/OiBzdHJpbmcgfCBudWxsO1xuICAgIGdhc0ZlZT86IHN0cmluZyB8IG51bGw7XG4gIH0gfCBudWxsO1xufVxuXG5leHBvcnQgY29uc3QgQ0FSRF9QQVJTRVJfVkVSU0lPTiA9IDI7XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZVN0YXR1cyhyYXc6IHN0cmluZyB8IG51bGwgfCB1bmRlZmluZWQpOiBDYXJkVHhXaXJlIHtcbiAgY29uc3Qga2V5ID0gKHJhdyA/PyAnJykudHJpbSgpLnRvVXBwZXJDYXNlKCk7XG5cbiAgc3dpdGNoIChrZXkpIHtcbiAgICBjYXNlICdQRU5ESU5HJzpcbiAgICBjYXNlICdBVVRIT1JJWkVEJzpcbiAgICAgIHJldHVybiAnUEVORElORyc7XG4gICAgY2FzZSAnQ09NUExFVEUnOlxuICAgIGNhc2UgJ0NPTVBMRVRFRCc6XG4gICAgY2FzZSAnU0VUVExFRCc6XG4gICAgICByZXR1cm4gJ1NFVFRMRUQnO1xuICAgIGNhc2UgJ0RFQ0xJTkVEJzpcbiAgICBjYXNlICdDQU5DRUxMRUQnOlxuICAgIGNhc2UgJ0NBTkNFTEVEJzpcbiAgICAgIHJldHVybiAnREVDTElORUQnO1xuICAgIGNhc2UgJ1JFRlVORCc6XG4gICAgY2FzZSAnUkVGVU5ERUQnOlxuICAgICAgcmV0dXJuICdSRUZVTkRFRCc7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiAnU0VUVExFRCc7XG4gIH1cbn1cblxuLyoqIFBhcnNlcyBERC9NTS9ZWVlZIGhoOm1tIGFtL3BtIGluIGxvY2FsIFRaLCBlLmcuIGAwNC8wNS8yMDI2IDA5OjUxIHBtYCAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVrRGF0ZVRpbWVNZXJpZGlhblRvSXNvKHJhdzogc3RyaW5nIHwgbnVsbCB8IHVuZGVmaW5lZCk6IHN0cmluZyB8IG51bGwge1xuXG4gIGNvbnN0IHMgPSByYXc/LnRyaW0oKTtcblxuICBpZiAoIXMpIHJldHVybiBudWxsO1xuXG4gIGNvbnN0IHJlID0gL14oXFxkezJ9KVxcLyhcXGR7Mn0pXFwvKFxcZHs0fSlcXHMrKFxcZHsxLDJ9KTooXFxkezJ9KVxccyooYW18cG0pJC9pdTtcblxuICBjb25zdCBtID0gcmUuZXhlYyhzKTtcblxuICBpZiAoIW0pIHtcblxuICAgIGNvbnN0IGQgPSBuZXcgRGF0ZShzKTtcblxuICAgIHJldHVybiBOdW1iZXIuaXNOYU4oZC5nZXRUaW1lKCkpID8gbnVsbCA6IGQudG9JU09TdHJpbmcoKTtcblxuICB9XG5cbiAgbGV0IGhvdXIgPSBOdW1iZXIobVs0XSk7XG4gIGNvbnN0IG1pbnV0ZSA9IE51bWJlcihtWzVdKTtcbiAgY29uc3QgYW1wbSA9IG1bNl0hLnRvTG93ZXJDYXNlKCk7XG4gIGNvbnN0IGRheSA9IE51bWJlcihtWzFdKTtcbiAgY29uc3QgbW9udGggPSBOdW1iZXIobVsyXSk7XG4gIGNvbnN0IHllYXIgPSBOdW1iZXIobVszXSk7XG5cbiAgaWYgKGhvdXIgPCAxMiAmJiBhbXBtID09PSAncG0nKSBob3VyICs9IDEyO1xuXG4gIGlmIChob3VyID09PSAxMiAmJiBhbXBtID09PSAnYW0nKSBob3VyID0gMDtcblxuICBjb25zdCBkYXRlID0gbmV3IERhdGUoeWVhciwgbW9udGggLSAxLCBkYXksIGhvdXIsIG1pbnV0ZSwgMCwgMCk7XG5cbiAgcmV0dXJuIE51bWJlci5pc05hTihkYXRlLmdldFRpbWUoKSkgPyBudWxsIDogZGF0ZS50b0lTT1N0cmluZygpO1xuXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzcGxpdE1vbmV5VG9rZW4ocmF3OiBzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkKTogeyBudW1lcmljOiBzdHJpbmc7IGN1cnJlbmN5UmF3OiBzdHJpbmcgfSB8IG51bGwge1xuXG4gIGNvbnN0IHMgPSByYXc/LnRyaW0oKT8ucmVwbGFjZSgvXiwvdSwgJycpO1xuICBpZiAoIXMpIHJldHVybiBudWxsO1xuXG4gIGNvbnN0IG0gPSAvXigtP1xcZCsoPzpcXC5cXGQrKT8pXFxzKyguKykkL3UuZXhlYyhzKTtcbiAgaWYgKCFtKSByZXR1cm4gbnVsbDtcblxuICByZXR1cm4geyBudW1lcmljOiBtWzFdISwgY3VycmVuY3lSYXc6IG1bMl0hLnRyaW0oKSB9O1xuXG59XG5cbmZ1bmN0aW9uIGNyeXB0b1N5bWJvbERpc3BsYXkoY3VycmVuY3lSYXc6IHN0cmluZyk6IHN0cmluZyB7XG5cbiAgY29uc3QgdHJpbW1lZCA9IGN1cnJlbmN5UmF3LnRyaW0oKTtcbiAgY29uc3QgY29tcGFjdCA9IHRyaW1tZWQucmVwbGFjZSgvXFxzKy9ndSwgJycpLnRvVXBwZXJDYXNlKCk7XG5cbiAgaWYgKC9cXGJNTT9VU0RcXGJ8XFxiTUlMTElcXHM/VVNEXFxiL2l1LnRlc3QodHJpbW1lZCkgfHwgL00rTT9VU0QvaXUudGVzdChjb21wYWN0KSkge1xuICAgIHJldHVybiAnTVVTRCc7XG5cbiAgfVxuXG4gIHJldHVybiBjb21wYWN0LnNsaWNlKDAsIDMyKTtcblxufVxuXG5leHBvcnQgZnVuY3Rpb24gc3BsaXRDcnlwdG9TcGVuZChyYXc6IHN0cmluZyB8IG51bGwgfCB1bmRlZmluZWQpOiB7IG51bWVyaWM6IHN0cmluZzsgc3ltYm9sOiBzdHJpbmcgfSB8IG51bGwge1xuXG4gIGNvbnN0IHBhcnRzID0gc3BsaXRNb25leVRva2VuKHJhdz8udHJpbSgpKTtcbiAgaWYgKCFwYXJ0cykgcmV0dXJuIG51bGw7XG5cbiAgY29uc3Qgc3ltYm9sID0gY3J5cHRvU3ltYm9sRGlzcGxheShwYXJ0cy5jdXJyZW5jeVJhdyk7XG4gIHJldHVybiB7IG51bWVyaWM6IHBhcnRzLm51bWVyaWMsIHN5bWJvbCB9O1xuXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzY3JhcGVkVG9QYXJzZWRDYXJkVHgocm93OiBTY3JhcGVkQ2FyZFRyYW5zYWN0aW9uKTogUGFyc2VkQ2FyZFdpcmUgfCBudWxsIHtcblxuICBjb25zdCBleHQgPSByb3cudHJhbnNhY3Rpb25JZD8udHJpbSgpO1xuICBpZiAoIWV4dCkgcmV0dXJuIG51bGw7XG5cbiAgY29uc3QgbWVyY2hhbnROYW1lID0gKHJvdy5tZXJjaGFudD8udHJpbSgpID8/IHJvdy50aXRsZT8udHJpbSgpID8/ICdVbmtub3duIG1lcmNoYW50Jykuc2xpY2UoMCwgNTEyKTtcblxuICBjb25zdCBjb21wb3NlZERhdGVUaW1lID1cbiAgICB0eXBlb2Ygcm93LmRhdGUgPT09ICdzdHJpbmcnICYmIHR5cGVvZiByb3cudGltZSA9PT0gJ3N0cmluZydcblxuICAgICAgPyByb3cuZGF0ZS5pbmNsdWRlcyhyb3cudGltZS50cmltKCkpXG5cbiAgICAgICAgPyByb3cuZGF0ZS50cmltKClcblxuICAgICAgICA6IGAke3Jvdy5kYXRlLnJlcGxhY2UoL1xccysuKiQvdSwgJycpLnRyaW0oKX0gJHtyb3cudGltZS50cmltKCl9YFxuXG4gICAgICA6IHJvdy5kYXRlO1xuXG4gIGNvbnN0IG9jY3VycmVkQXQgPSB1a0RhdGVUaW1lTWVyaWRpYW5Ub0lzbyhjb21wb3NlZERhdGVUaW1lKTtcblxuICBpZiAoIW9jY3VycmVkQXQpIHJldHVybiBudWxsO1xuXG4gIGNvbnN0IGZpYXQgPSBzcGxpdE1vbmV5VG9rZW4ocm93LmFtb3VudCk7XG4gIGlmICghZmlhdCkgcmV0dXJuIG51bGw7XG5cbiAgY29uc3QgZmlhdEN1cnJlbmN5ID0gZmlhdC5jdXJyZW5jeVJhdy5zbGljZSgwLCA4KS50b1VwcGVyQ2FzZSgpO1xuXG4gIGNvbnN0IHNwZW50UmF3ID0gcm93LmZ1bmRpbmc/LnNwZW50ID8/IHJvdy5zcGVudCA/PyBudWxsO1xuICBsZXQgY3J5cHRvUGFyc2VkID0gc3BsaXRDcnlwdG9TcGVuZChzcGVudFJhdyk7XG4gIGNvbnN0IGdhc0ZlZVJhdyA9IHJvdy5mdW5kaW5nPy5nYXNGZWUgPz8gcm93Lmdhc0ZlZSA/PyBudWxsO1xuICBjb25zdCBnYXNGZWVQYXJzZWQgPSBzcGxpdENyeXB0b1NwZW5kKGdhc0ZlZVJhdyk7XG5cbiAgbGV0IGNyeXB0b0Ftb3VudDogc3RyaW5nIHwgbnVsbCA9IGNyeXB0b1BhcnNlZD8ubnVtZXJpYyA/PyBudWxsO1xuXG4gIGxldCBjcnlwdG9TeW1ib2w6IHN0cmluZyB8IG51bGwgPSBjcnlwdG9QYXJzZWQ/LnN5bWJvbCA/PyBudWxsO1xuXG4gIC8qKiBTb21lIGVudHJpZXMgb25seSBleHBvc2UgZmlhdCBzcGVuZCAqL1xuICBpZiAoY3J5cHRvQW1vdW50ID09PSBudWxsKSB7XG4gICAgY3J5cHRvQW1vdW50ID0gZmlhdC5udW1lcmljO1xuXG4gICAgY3J5cHRvU3ltYm9sID0gZmlhdEN1cnJlbmN5O1xuICB9XG5cbiAgY29uc3QgZnVuZGluZ01hc2tlZCA9IHJvdy5mdW5kaW5nPy5zb3VyY2U/LnRyaW0oKSA/PyByb3cuc291cmNlPy50cmltKCkgPz8gbnVsbDtcblxuICByZXR1cm4ge1xuICAgIGV4dGVybmFsSWQ6IGV4dC5zbGljZSgwLCA1MTIpLFxuICAgIG9jY3VycmVkQXQsXG4gICAgbWVyY2hhbnROYW1lLFxuICAgIGZpYXRBbW91bnQ6IGZpYXQubnVtZXJpYyxcbiAgICBmaWF0Q3VycmVuY3ksXG4gICAgbWVyY2hhbnRSYXc6XG4gICAgICBgJHtyb3cuY2FyZFBhbiA/PyAnJ318JHtyb3cudHlwZSA/PyAnJ318JHtyb3cuZ2FzRmVlID8/IHJvdy5mdW5kaW5nPy5nYXNGZWUgPz8gJyd9fCR7c3BlbnRSYXcgPz8gJyd9YFxuICAgICAgICAucmVwbGFjZSgvXFx8XFx8Ky9ndSwgJ3wnKVxuICAgICAgICAuc2xpY2UoMCwgMjA0OCkgfHwgdW5kZWZpbmVkLFxuICAgIGNyeXB0b0Ftb3VudCxcblxuICAgIGNyeXB0b1N5bWJvbCxcbiAgICBnYXNGZWVBbW91bnQ6IGdhc0ZlZVBhcnNlZD8ubnVtZXJpYyA/PyBudWxsLFxuICAgIGdhc0ZlZVN5bWJvbDogZ2FzRmVlUGFyc2VkPy5zeW1ib2wgPz8gbnVsbCxcbiAgICBnYXNGZWVSYXc6IGdhc0ZlZVJhdyA/PyBudWxsLFxuICAgIHNwZW50UmF3OiBzcGVudFJhdyA/PyBudWxsLFxuICAgIGZ1bmRpbmdTb3VyY2VNYXNrZWQ6IGZ1bmRpbmdNYXNrZWQgPz8gbnVsbCxcblxuICAgIHN0YXR1czogbm9ybWFsaXplU3RhdHVzKHJvdy5zdGF0dXMpLFxuICAgIHBhcnNlclZlcnNpb246IENBUkRfUEFSU0VSX1ZFUlNJT04sXG4gIH07XG5cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNjcmFwZWRNYW55VG9QYXJzZWRQYXlsb2FkKHJvd3M6IFNjcmFwZWRDYXJkVHJhbnNhY3Rpb25bXSk6IFBhcnNlZENhcmRXaXJlW10ge1xuXG4gIGNvbnN0IG91dDogUGFyc2VkQ2FyZFdpcmVbXSA9IFtdO1xuICBjb25zdCBzZWVuRXh0ZXJuYWwgPSBuZXcgU2V0PHN0cmluZz4oKTtcblxuICBmb3IgKGNvbnN0IHJvdyBvZiByb3dzKSB7XG5cbiAgICBjb25zdCBwYXJzZWQgPSBzY3JhcGVkVG9QYXJzZWRDYXJkVHgocm93KTtcblxuICAgIGlmICghcGFyc2VkKSBjb250aW51ZTtcblxuICAgIGlmIChzZWVuRXh0ZXJuYWwuaGFzKHBhcnNlZC5leHRlcm5hbElkKSkgY29udGludWU7XG5cbiAgICBzZWVuRXh0ZXJuYWwuYWRkKHBhcnNlZC5leHRlcm5hbElkKTtcblxuICAgIG91dC5wdXNoKHBhcnNlZCk7XG4gIH1cblxuICByZXR1cm4gb3V0O1xuXG59XG4iLCJleHBvcnRzLmludGVyb3BEZWZhdWx0ID0gZnVuY3Rpb24gKGEpIHtcbiAgcmV0dXJuIGEgJiYgYS5fX2VzTW9kdWxlID8gYSA6IHtkZWZhdWx0OiBhfTtcbn07XG5cbmV4cG9ydHMuZGVmaW5lSW50ZXJvcEZsYWcgPSBmdW5jdGlvbiAoYSkge1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoYSwgJ19fZXNNb2R1bGUnLCB7dmFsdWU6IHRydWV9KTtcbn07XG5cbmV4cG9ydHMuZXhwb3J0QWxsID0gZnVuY3Rpb24gKHNvdXJjZSwgZGVzdCkge1xuICBPYmplY3Qua2V5cyhzb3VyY2UpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgIGlmIChrZXkgPT09ICdkZWZhdWx0JyB8fCBrZXkgPT09ICdfX2VzTW9kdWxlJyB8fCBkZXN0Lmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZGVzdCwga2V5LCB7XG4gICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBzb3VyY2Vba2V5XTtcbiAgICAgIH0sXG4gICAgfSk7XG4gIH0pO1xuXG4gIHJldHVybiBkZXN0O1xufTtcblxuZXhwb3J0cy5leHBvcnQgPSBmdW5jdGlvbiAoZGVzdCwgZGVzdE5hbWUsIGdldCkge1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZGVzdCwgZGVzdE5hbWUsIHtcbiAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgIGdldDogZ2V0LFxuICB9KTtcbn07XG4iXSwibmFtZXMiOltdLCJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMubWFwIn0=
 globalThis.define=__define;  })(globalThis.define);