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
})({"jD5Ts":[function(require,module,exports) {
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
    "serverPort": 41287
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
                gasFee: fundingValue(row, "Gas fee"),
                destination: fundingValue(row, "Destination") ?? detailValue(row, "Destination"),
                credited: fundingValue(row, "Credited") ?? detailValue(row, "Credited")
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
const SYMBOL_TO_ISO = {
    "\u20ac": "EUR",
    "$": "USD",
    "\xa3": "GBP",
    "\xa5": "JPY",
    "\u20bd": "RUB",
    "\u20b4": "UAH",
    "\u20a3": "CHF"
};
/** Normalizes a European comma-decimal string like "42,50" to "42.50". */ function normalizeDecimalComma(s) {
    return s.replace(/(\d),(\d)/gu, "$1.$2");
}
function splitMoneyToken(raw) {
    const s = raw?.trim()?.replace(/^,/u, "");
    if (!s) return null;
    const NUMBER_SPACE_CURRENCY = /^([+-]?\d+(?:\.\d+)?)\s+(.+)$/u;
    // 1. Try existing "NUMBER SPACE CURRENCY" format (e.g. "42.50 PLN")
    const m = NUMBER_SPACE_CURRENCY.exec(s);
    if (m) return {
        numeric: m[1].replace(/^\+/u, ""),
        currencyRaw: m[2].trim()
    };
    // 2. Normalize comma-decimal and retry (e.g. "42,50 EUR" \u2192 "42.50 EUR")
    const normalized = normalizeDecimalComma(s);
    const m2 = NUMBER_SPACE_CURRENCY.exec(normalized);
    if (m2) return {
        numeric: m2[1].replace(/^\+/u, ""),
        currencyRaw: m2[2].trim()
    };
    // 3. Try symbol-prefix format (e.g. "\u20ac42.50", "$42.50", "\u20ac42,50", "\u20ac 42.50", "-\u20ac42.50", "+\u20ac69.91")
    // Keep this char class in sync with the keys of SYMBOL_TO_ISO above.
    const SYMBOL_PREFIX = /^([+-]?)\s*([\u20ac$\u00a3\u00a5\u20bd\u20b4\u20a3])\s*(\d+(?:[.,]\d+)?)$/u;
    const m3 = SYMBOL_PREFIX.exec(s);
    if (m3) {
        const sign = m3[1] === "-" ? "-" : ""; // strip '+', it's just positive
        const symbol = m3[2];
        const numeric = normalizeDecimalComma(sign + m3[3]);
        const iso = SYMBOL_TO_ISO[symbol];
        if (!iso) return null;
        return {
            numeric,
            currencyRaw: iso
        };
    }
    return null;
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
    const credited = splitMoneyToken(row.credited);
    if (!fiat && !credited) return null;
    const native = fiat ?? credited;
    if (!native) return null;
    const fiatCurrency = native.currencyRaw.slice(0, 8).toUpperCase();
    const spentRaw = row.funding?.spent ?? row.spent ?? null;
    let cryptoParsed = splitCryptoSpend(spentRaw);
    const creditedParsed = splitCryptoSpend(row.credited);
    const gasFeeRaw = row.funding?.gasFee ?? row.gasFee ?? null;
    const gasFeeParsed = splitCryptoSpend(gasFeeRaw);
    let cryptoAmount = cryptoParsed?.numeric ?? creditedParsed?.numeric ?? null;
    let cryptoSymbol = cryptoParsed?.symbol ?? creditedParsed?.symbol ?? null;
    /** Some entries only expose fiat spend */ if (cryptoAmount === null) {
        cryptoAmount = native.numeric;
        cryptoSymbol = fiatCurrency;
    }
    const fundingMasked = row.funding?.source?.trim() ?? row.source?.trim() ?? null;
    const creditDestinationMasked = row.destination?.trim() ?? null;
    return {
        externalId: ext.slice(0, 512),
        occurredAt,
        merchantName,
        fiatAmount: native.numeric,
        fiatCurrency,
        merchantRaw: `${row.cardPan ?? ""}|${row.type ?? ""}|${row.gasFee ?? row.funding?.gasFee ?? ""}|${spentRaw ?? ""}|${row.credited ?? ""}`.replace(/\|\|+/gu, "|").slice(0, 2048) || undefined,
        cryptoAmount,
        cryptoSymbol,
        gasFeeAmount: gasFeeParsed?.numeric ?? null,
        gasFeeSymbol: gasFeeParsed?.symbol ?? null,
        gasFeeRaw: gasFeeRaw ?? null,
        spentRaw: spentRaw ?? null,
        creditedRaw: row.credited ?? null,
        fundingSourceMasked: fundingMasked ?? null,
        creditDestinationMasked,
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

},{}]},["jD5Ts","2w7px"], "2w7px", "parcelRequire258f")

//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFLO2dCQUNILE9BQU8sTUFBTSxDQUFDLElBQUk7WUFDcEI7UUFDRjtJQUNGO0lBRUEsT0FBTztBQUNUO0FBRUEsUUFBUSxTQUFTLFNBQVUsSUFBSSxFQUFFLFFBQVEsRUFBRSxHQUFHO0lBQzVDLE9BQU8sZUFBZSxNQUFNLFVBQVU7UUFDcEMsWUFBWTtRQUNaLEtBQUs7SUFDUDtBQUNGIiwic291cmNlcyI6WyJub2RlX21vZHVsZXMvLnBucG0vQHBsYXNtb2hxK3BhcmNlbC1ydW50aW1lQDAuMjUuMi9ub2RlX21vZHVsZXMvQHBsYXNtb2hxL3BhcmNlbC1ydW50aW1lL2Rpc3QvcnVudGltZS05MDEzZGJlNzMwODQxYTYzLmpzIiwiYXBwcy9leHRlbnNpb24vLnBsYXNtby9zdGF0aWMvYmFja2dyb3VuZC9pbmRleC50cyIsImFwcHMvZXh0ZW5zaW9uL3NyYy9iYWNrZ3JvdW5kLnRzIiwiYXBwcy9leHRlbnNpb24vYmFja2dyb3VuZC50cyIsImFwcHMvZXh0ZW5zaW9uL3NyYy9saWIvbm9ybWFsaXplLnRzIiwibm9kZV9tb2R1bGVzLy5wbnBtL0BwYXJjZWwrdHJhbnNmb3JtZXItanNAMi45LjNfQHBhcmNlbCtjb3JlQDIuOS4zL25vZGVfbW9kdWxlcy9AcGFyY2VsL3RyYW5zZm9ybWVyLWpzL3NyYy9lc21vZHVsZS1oZWxwZXJzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbInZhciB1PWdsb2JhbFRoaXMucHJvY2Vzcz8uYXJndnx8W107dmFyIGg9KCk9Pmdsb2JhbFRoaXMucHJvY2Vzcz8uZW52fHx7fTt2YXIgQj1uZXcgU2V0KHUpLF89ZT0+Qi5oYXMoZSksRz11LmZpbHRlcihlPT5lLnN0YXJ0c1dpdGgoXCItLVwiKSYmZS5pbmNsdWRlcyhcIj1cIikpLm1hcChlPT5lLnNwbGl0KFwiPVwiKSkucmVkdWNlKChlLFt0LG9dKT0+KGVbdF09byxlKSx7fSk7dmFyIFU9XyhcIi0tZHJ5LXJ1blwiKSxnPSgpPT5fKFwiLS12ZXJib3NlXCIpfHxoKCkuVkVSQk9TRT09PVwidHJ1ZVwiLE49ZygpO3ZhciBtPShlPVwiXCIsLi4udCk9PmNvbnNvbGUubG9nKGUucGFkRW5kKDkpLFwifFwiLC4uLnQpO3ZhciB5PSguLi5lKT0+Y29uc29sZS5lcnJvcihcIlxcdXsxRjUzNH0gRVJST1JcIi5wYWRFbmQoOSksXCJ8XCIsLi4uZSksdj0oLi4uZSk9Pm0oXCJcXHV7MUY1MzV9IElORk9cIiwuLi5lKSxmPSguLi5lKT0+bShcIlxcdXsxRjdFMH0gV0FSTlwiLC4uLmUpLE09MCxpPSguLi5lKT0+ZygpJiZtKGBcXHV7MUY3RTF9ICR7TSsrfWAsLi4uZSk7dmFyIGI9KCk9PntsZXQgZT1nbG9iYWxUaGlzLmJyb3dzZXI/LnJ1bnRpbWV8fGdsb2JhbFRoaXMuY2hyb21lPy5ydW50aW1lLHQ9KCk9PnNldEludGVydmFsKGUuZ2V0UGxhdGZvcm1JbmZvLDI0ZTMpO2Uub25TdGFydHVwLmFkZExpc3RlbmVyKHQpLHQoKX07dmFyIG49e1wiaXNDb250ZW50U2NyaXB0XCI6ZmFsc2UsXCJpc0JhY2tncm91bmRcIjp0cnVlLFwiaXNSZWFjdFwiOmZhbHNlLFwicnVudGltZXNcIjpbXCJiYWNrZ3JvdW5kLXNlcnZpY2UtcnVudGltZVwiXSxcImhvc3RcIjpcImxvY2FsaG9zdFwiLFwicG9ydFwiOjE4MTUsXCJlbnRyeUZpbGVQYXRoXCI6XCIvaG9tZS96YWtoYXJvdi9Eb2N1bWVudHMvcHJvamVjdHMvY3J5cHRvLWZpbmFuY2UtdHJhY2tlci9hcHBzL2V4dGVuc2lvbi8ucGxhc21vL3N0YXRpYy9iYWNrZ3JvdW5kL2luZGV4LnRzXCIsXCJidW5kbGVJZFwiOlwiZDdiOWIyZjgxZjgxOGYwYlwiLFwiZW52SGFzaFwiOlwiZDk5YTVmZmE1N2FjZDYzOFwiLFwidmVyYm9zZVwiOlwiZmFsc2VcIixcInNlY3VyZVwiOmZhbHNlLFwic2VydmVyUG9ydFwiOjQxMjg3fTttb2R1bGUuYnVuZGxlLkhNUl9CVU5ETEVfSUQ9bi5idW5kbGVJZDtnbG9iYWxUaGlzLnByb2Nlc3M9e2FyZ3Y6W10sZW52OntWRVJCT1NFOm4udmVyYm9zZX19O3ZhciBEPW1vZHVsZS5idW5kbGUuTW9kdWxlO2Z1bmN0aW9uIEgoZSl7RC5jYWxsKHRoaXMsZSksdGhpcy5ob3Q9e2RhdGE6bW9kdWxlLmJ1bmRsZS5ob3REYXRhW2VdLF9hY2NlcHRDYWxsYmFja3M6W10sX2Rpc3Bvc2VDYWxsYmFja3M6W10sYWNjZXB0OmZ1bmN0aW9uKHQpe3RoaXMuX2FjY2VwdENhbGxiYWNrcy5wdXNoKHR8fGZ1bmN0aW9uKCl7fSl9LGRpc3Bvc2U6ZnVuY3Rpb24odCl7dGhpcy5fZGlzcG9zZUNhbGxiYWNrcy5wdXNoKHQpfX0sbW9kdWxlLmJ1bmRsZS5ob3REYXRhW2VdPXZvaWQgMH1tb2R1bGUuYnVuZGxlLk1vZHVsZT1IO21vZHVsZS5idW5kbGUuaG90RGF0YT17fTt2YXIgYz1nbG9iYWxUaGlzLmJyb3dzZXJ8fGdsb2JhbFRoaXMuY2hyb21lfHxudWxsO2Z1bmN0aW9uIFIoKXtyZXR1cm4hbi5ob3N0fHxuLmhvc3Q9PT1cIjAuMC4wLjBcIj9sb2NhdGlvbi5wcm90b2NvbC5pbmRleE9mKFwiaHR0cFwiKT09PTA/bG9jYXRpb24uaG9zdG5hbWU6XCJsb2NhbGhvc3RcIjpuLmhvc3R9ZnVuY3Rpb24geCgpe3JldHVybiFuLmhvc3R8fG4uaG9zdD09PVwiMC4wLjAuMFwiP1wibG9jYWxob3N0XCI6bi5ob3N0fWZ1bmN0aW9uIGQoKXtyZXR1cm4gbi5wb3J0fHxsb2NhdGlvbi5wb3J0fXZhciBQPVwiX19wbGFzbW9fcnVudGltZV9wYWdlX1wiLFM9XCJfX3BsYXNtb19ydW50aW1lX3NjcmlwdF9cIjt2YXIgTz1gJHtuLnNlY3VyZT9cImh0dHBzXCI6XCJodHRwXCJ9Oi8vJHtSKCl9OiR7ZCgpfS9gO2FzeW5jIGZ1bmN0aW9uIGsoZT0xNDcwKXtmb3IoOzspdHJ5e2F3YWl0IGZldGNoKE8pO2JyZWFrfWNhdGNoe2F3YWl0IG5ldyBQcm9taXNlKG89PnNldFRpbWVvdXQobyxlKSl9fWlmKGMucnVudGltZS5nZXRNYW5pZmVzdCgpLm1hbmlmZXN0X3ZlcnNpb249PT0zKXtsZXQgZT1jLnJ1bnRpbWUuZ2V0VVJMKFwiL19fcGxhc21vX2htcl9wcm94eV9fP3VybD1cIik7Z2xvYmFsVGhpcy5hZGRFdmVudExpc3RlbmVyKFwiZmV0Y2hcIixmdW5jdGlvbih0KXtsZXQgbz10LnJlcXVlc3QudXJsO2lmKG8uc3RhcnRzV2l0aChlKSl7bGV0IHM9bmV3IFVSTChkZWNvZGVVUklDb21wb25lbnQoby5zbGljZShlLmxlbmd0aCkpKTtzLmhvc3RuYW1lPT09bi5ob3N0JiZzLnBvcnQ9PT1gJHtuLnBvcnR9YD8ocy5zZWFyY2hQYXJhbXMuc2V0KFwidFwiLERhdGUubm93KCkudG9TdHJpbmcoKSksdC5yZXNwb25kV2l0aChmZXRjaChzKS50aGVuKHI9Pm5ldyBSZXNwb25zZShyLmJvZHkse2hlYWRlcnM6e1wiQ29udGVudC1UeXBlXCI6ci5oZWFkZXJzLmdldChcIkNvbnRlbnQtVHlwZVwiKT8/XCJ0ZXh0L2phdmFzY3JpcHRcIn19KSkpKTp0LnJlc3BvbmRXaXRoKG5ldyBSZXNwb25zZShcIlBsYXNtbyBITVJcIix7c3RhdHVzOjIwMCxzdGF0dXNUZXh0OlwiVGVzdGluZ1wifSkpfX0pfWZ1bmN0aW9uIEUoZSx0KXtsZXR7bW9kdWxlczpvfT1lO3JldHVybiBvPyEhb1t0XTohMX1mdW5jdGlvbiBDKGU9ZCgpKXtsZXQgdD14KCk7cmV0dXJuYCR7bi5zZWN1cmV8fGxvY2F0aW9uLnByb3RvY29sPT09XCJodHRwczpcIiYmIS9sb2NhbGhvc3R8MTI3LjAuMC4xfDAuMC4wLjAvLnRlc3QodCk/XCJ3c3NcIjpcIndzXCJ9Oi8vJHt0fToke2V9L2B9ZnVuY3Rpb24gTChlKXt0eXBlb2YgZS5tZXNzYWdlPT1cInN0cmluZ1wiJiZ5KFwiW3BsYXNtby9wYXJjZWwtcnVudGltZV06IFwiK2UubWVzc2FnZSl9ZnVuY3Rpb24gVChlKXtpZih0eXBlb2YgZ2xvYmFsVGhpcy5XZWJTb2NrZXQ+XCJ1XCIpcmV0dXJuO2xldCB0PW5ldyBXZWJTb2NrZXQoQyhOdW1iZXIoZCgpKSsxKSk7cmV0dXJuIHQuYWRkRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIixhc3luYyBmdW5jdGlvbihvKXtsZXQgcz1KU09OLnBhcnNlKG8uZGF0YSk7YXdhaXQgZShzKX0pLHQuYWRkRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsTCksdH1mdW5jdGlvbiBBKGUpe2lmKHR5cGVvZiBnbG9iYWxUaGlzLldlYlNvY2tldD5cInVcIilyZXR1cm47bGV0IHQ9bmV3IFdlYlNvY2tldChDKCkpO3JldHVybiB0LmFkZEV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsYXN5bmMgZnVuY3Rpb24obyl7bGV0IHM9SlNPTi5wYXJzZShvLmRhdGEpO2lmKHMudHlwZT09PVwidXBkYXRlXCImJmF3YWl0IGUocy5hc3NldHMpLHMudHlwZT09PVwiZXJyb3JcIilmb3IobGV0IHIgb2Ygcy5kaWFnbm9zdGljcy5hbnNpKXtsZXQgbD1yLmNvZGVmcmFtZXx8ci5zdGFjaztmKFwiW3BsYXNtby9wYXJjZWwtcnVudGltZV06IFwiK3IubWVzc2FnZStgXG5gK2wrYFxuXG5gK3IuaGludHMuam9pbihgXG5gKSl9fSksdC5hZGRFdmVudExpc3RlbmVyKFwiZXJyb3JcIixMKSx0LmFkZEV2ZW50TGlzdGVuZXIoXCJvcGVuXCIsKCk9Pnt2KGBbcGxhc21vL3BhcmNlbC1ydW50aW1lXTogQ29ubmVjdGVkIHRvIEhNUiBzZXJ2ZXIgZm9yICR7bi5lbnRyeUZpbGVQYXRofWApfSksdC5hZGRFdmVudExpc3RlbmVyKFwiY2xvc2VcIiwoKT0+e2YoYFtwbGFzbW8vcGFyY2VsLXJ1bnRpbWVdOiBDb25uZWN0aW9uIHRvIHRoZSBITVIgc2VydmVyIGlzIGNsb3NlZCBmb3IgJHtuLmVudHJ5RmlsZVBhdGh9YCl9KSx0fXZhciB3PW1vZHVsZS5idW5kbGUucGFyZW50LGE9e2J1aWxkUmVhZHk6ITEsYmdDaGFuZ2VkOiExLGNzQ2hhbmdlZDohMSxwYWdlQ2hhbmdlZDohMSxzY3JpcHRQb3J0czpuZXcgU2V0LHBhZ2VQb3J0czpuZXcgU2V0fTthc3luYyBmdW5jdGlvbiBwKGU9ITEpe2lmKGV8fGEuYnVpbGRSZWFkeSYmYS5wYWdlQ2hhbmdlZCl7aShcIkJHU1cgUnVudGltZSAtIHJlbG9hZGluZyBQYWdlXCIpO2ZvcihsZXQgdCBvZiBhLnBhZ2VQb3J0cyl0LnBvc3RNZXNzYWdlKG51bGwpfWlmKGV8fGEuYnVpbGRSZWFkeSYmKGEuYmdDaGFuZ2VkfHxhLmNzQ2hhbmdlZCkpe2koXCJCR1NXIFJ1bnRpbWUgLSByZWxvYWRpbmcgQ1NcIik7bGV0IHQ9YXdhaXQgYz8udGFicy5xdWVyeSh7YWN0aXZlOiEwfSk7Zm9yKGxldCBvIG9mIGEuc2NyaXB0UG9ydHMpe2xldCBzPXQuc29tZShyPT5yLmlkPT09by5zZW5kZXIudGFiPy5pZCk7by5wb3N0TWVzc2FnZSh7X19wbGFzbW9fY3NfYWN0aXZlX3RhYl9fOnN9KX1jLnJ1bnRpbWUucmVsb2FkKCl9fWlmKCF3fHwhdy5pc1BhcmNlbFJlcXVpcmUpe2IoKTtsZXQgZT1BKGFzeW5jIHQ9PntpKFwiQkdTVyBSdW50aW1lIC0gT24gSE1SIFVwZGF0ZVwiKSxhLmJnQ2hhbmdlZHx8PXQuZmlsdGVyKHM9PnMuZW52SGFzaD09PW4uZW52SGFzaCkuc29tZShzPT5FKG1vZHVsZS5idW5kbGUscy5pZCkpO2xldCBvPXQuZmluZChzPT5zLnR5cGU9PT1cImpzb25cIik7aWYobyl7bGV0IHM9bmV3IFNldCh0Lm1hcChsPT5sLmlkKSkscj1PYmplY3QudmFsdWVzKG8uZGVwc0J5QnVuZGxlKS5tYXAobD0+T2JqZWN0LnZhbHVlcyhsKSkuZmxhdCgpO2EuYmdDaGFuZ2VkfHw9ci5ldmVyeShsPT5zLmhhcyhsKSl9cCgpfSk7ZS5hZGRFdmVudExpc3RlbmVyKFwib3BlblwiLCgpPT57bGV0IHQ9c2V0SW50ZXJ2YWwoKCk9PmUuc2VuZChcInBpbmdcIiksMjRlMyk7ZS5hZGRFdmVudExpc3RlbmVyKFwiY2xvc2VcIiwoKT0+Y2xlYXJJbnRlcnZhbCh0KSl9KSxlLmFkZEV2ZW50TGlzdGVuZXIoXCJjbG9zZVwiLGFzeW5jKCk9Pnthd2FpdCBrKCkscCghMCl9KX1UKGFzeW5jIGU9Pntzd2l0Y2goaShcIkJHU1cgUnVudGltZSAtIE9uIEJ1aWxkIFJlcGFja2FnZWRcIiksZS50eXBlKXtjYXNlXCJidWlsZF9yZWFkeVwiOnthLmJ1aWxkUmVhZHl8fD0hMCxwKCk7YnJlYWt9Y2FzZVwiY3NfY2hhbmdlZFwiOnthLmNzQ2hhbmdlZHx8PSEwLHAoKTticmVha319fSk7Yy5ydW50aW1lLm9uQ29ubmVjdC5hZGRMaXN0ZW5lcihmdW5jdGlvbihlKXtsZXQgdD1lLm5hbWUuc3RhcnRzV2l0aChQKSxvPWUubmFtZS5zdGFydHNXaXRoKFMpO2lmKHR8fG8pe2xldCBzPXQ/YS5wYWdlUG9ydHM6YS5zY3JpcHRQb3J0cztzLmFkZChlKSxlLm9uRGlzY29ubmVjdC5hZGRMaXN0ZW5lcigoKT0+e3MuZGVsZXRlKGUpfSksZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoZnVuY3Rpb24ocil7aShcIkJHU1cgUnVudGltZSAtIE9uIHNvdXJjZSBjaGFuZ2VkXCIsciksci5fX3BsYXNtb19jc19jaGFuZ2VkX18mJihhLmNzQ2hhbmdlZHx8PSEwKSxyLl9fcGxhc21vX3BhZ2VfY2hhbmdlZF9fJiYoYS5wYWdlQ2hhbmdlZHx8PSEwKSxwKCl9KX19KTtjLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKGZ1bmN0aW9uKHQpe3JldHVybiB0Ll9fcGxhc21vX2Z1bGxfcmVsb2FkX18mJihpKFwiQkdTVyBSdW50aW1lIC0gT24gdG9wLWxldmVsIGNvZGUgY2hhbmdlZFwiKSxwKCkpLCEwfSk7XG4iLCJpbXBvcnQgXCIuLi8uLi8uLi9zcmMvYmFja2dyb3VuZFwiIiwiaW1wb3J0ICcuLi9iYWNrZ3JvdW5kJztcbiIsImltcG9ydCB7XG4gIENBUkRfUEFSU0VSX1ZFUlNJT04sXG4gIHNjcmFwZWRNYW55VG9QYXJzZWRQYXlsb2FkLFxuICB0eXBlIFNjcmFwZWRDYXJkVHJhbnNhY3Rpb24sXG59IGZyb20gJy4vc3JjL2xpYi9ub3JtYWxpemUnO1xuXG50eXBlIENhcHR1cmVSZXN1bHQgPVxuICB8IHtcbiAgICAgIG9rOiB0cnVlO1xuICAgICAgaHRtbDogc3RyaW5nO1xuICAgICAgc291cmNlVXJsOiBzdHJpbmc7XG4gICAgICBjYXB0dXJlZEF0OiBzdHJpbmc7XG4gICAgICB0cmFuc2FjdGlvbkNvdW50OiBudW1iZXI7XG4gICAgICB0cmFuc2FjdGlvbnM6IFNjcmFwZWRDYXJkVHJhbnNhY3Rpb25bXTtcbiAgICAgIGNhcmRCYWxhbmNlPzogeyBhbW91bnQ6IHN0cmluZzsgY3VycmVuY3k6IHN0cmluZyB9O1xuICAgIH1cbiAgfCB7XG4gICAgICBvazogZmFsc2U7XG4gICAgICBlcnJvcjogc3RyaW5nO1xuICAgICAgc291cmNlVXJsPzogc3RyaW5nO1xuICAgICAgY2FwdHVyZWRBdDogc3RyaW5nO1xuICAgIH07XG5cbnR5cGUgQ2FwdHVyZU1lc3NhZ2UgPSB7IHR5cGU6ICdDQVBUVVJFX0NBUkRfSFRNTCcgfTtcbnR5cGUgU2NyYXBlTWVzc2FnZSA9IHsgdHlwZTogJ1NDUkFQRV9DQVJEX0hUTUwnIH07XG5cbnR5cGUgU3RvcmVkQ2FwdHVyZSA9IENhcHR1cmVSZXN1bHQgJiB7XG4gIGpvYklkOiBzdHJpbmc7XG4gIHNhdmVkQXQ6IHN0cmluZztcbn07XG5cbi8qKiBQYWlyaW5nIHRva2VuIGlzIHNhdmVkIGZyb20gdGhlIHBvcHVwLiAqL1xuZXhwb3J0IGNvbnN0IFNUT1JBR0VfQVBJX1RPS0VOX0tFWSA9ICdjcnlwdG90cmFja0FwaVRva2VuJztcblxuY29uc3QgTE9HX1BSRUZJWCA9ICdbTWV0YVNwZW5kIENhcmQgQ2FwdHVyZV0nO1xuXG5jb25zdCBTVE9SQUdFX0tFWSA9ICdjYXJkQ2FwdHVyZXMnO1xuLyoqIENvbnRlbnQtc2NyaXB0IHNjcmFwZSBtdXN0IGZpbmlzaCBxdWlja2x5OyBzeW5jIEhUVFAgcnVucyBpbiB0aGUgcG9wdXAgKE1WMyB3b3JrZXJzIHN1c3BlbmQgb24gbG9uZyBmZXRjaCkuICovXG5jb25zdCBTQ1JBUEVfVElNRU9VVF9NUyA9IDE1XzAwMDtcblxuZnVuY3Rpb24gd2l0aFRpbWVvdXQ8VD4ocHJvbWlzZTogUHJvbWlzZTxUPiwgbXM6IG51bWJlciwgbWVzc2FnZTogc3RyaW5nKTogUHJvbWlzZTxUPiB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY29uc3QgdGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4gcmVqZWN0KG5ldyBFcnJvcihtZXNzYWdlKSksIG1zKTtcbiAgICBwcm9taXNlLnRoZW4oXG4gICAgICAodmFsdWUpID0+IHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgICByZXNvbHZlKHZhbHVlKTtcbiAgICAgIH0sXG4gICAgICAoZXJyb3IpID0+IHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgfSxcbiAgICApO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gaXNDYXJkUGFnZSh1cmw6IHN0cmluZyB8IHVuZGVmaW5lZCk6IGJvb2xlYW4ge1xuICBpZiAoIXVybCkgcmV0dXJuIGZhbHNlO1xuXG4gIHRyeSB7XG4gICAgY29uc3QgcGFyc2VkID0gbmV3IFVSTCh1cmwpO1xuICAgIHJldHVybiBwYXJzZWQuaG9zdG5hbWUgPT09ICdjYXJkLm1ldGFtYXNrLmlvJyB8fCBwYXJzZWQuaG9zdG5hbWUgPT09ICdwb3J0Zm9saW8ubWV0YW1hc2suaW8nO1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuLyoqIEluamVjdGVkIHZpYSBgY2hyb21lLnNjcmlwdGluZy5leGVjdXRlU2NyaXB0YCDigJQga2VlcCBzZWxmLWNvbnRhaW5lZC4gKi9cbmZ1bmN0aW9uIHNjcmFwZUZyb21QYWdlKCk6IENhcHR1cmVSZXN1bHQge1xuICB0eXBlIFBUID0gU2NyYXBlZENhcmRUcmFuc2FjdGlvbjtcblxuICBjb25zdCBjYXB0dXJlZEF0ID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuXG4gIHRyeSB7XG4gICAgY29uc3QgY2xlYW5UZXh0ID0gKHZhbHVlOiBzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkKTogc3RyaW5nID0+ICh2YWx1ZSA/PyAnJykucmVwbGFjZSgvXFxzKy9nLCAnICcpLnRyaW0oKTtcbiAgICBjb25zdCB0ZXh0RnJvbSA9IChyb290OiBFbGVtZW50LCBzZWxlY3Rvcjogc3RyaW5nKTogc3RyaW5nID0+XG4gICAgICBjbGVhblRleHQocm9vdC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKT8udGV4dENvbnRlbnQpO1xuICAgIGNvbnN0IGRldGFpbFZhbHVlID0gKHJvdzogRWxlbWVudCwgbGFiZWw6IHN0cmluZyk6IHN0cmluZyB8IG51bGwgPT4ge1xuICAgICAgY29uc3QgZGV0YWlsUm93cyA9IEFycmF5LmZyb20ocm93LnF1ZXJ5U2VsZWN0b3JBbGwoJy50cmFuc2FjdGlvblJvd19fZGV0YWlsc19yb3dfY29udGFpbmVyJykpO1xuXG4gICAgICBjb25zdCBtYXRjaCA9IGRldGFpbFJvd3MuZmluZChcbiAgICAgICAgKGl0ZW0pID0+IGNsZWFuVGV4dChpdGVtLnF1ZXJ5U2VsZWN0b3IoJ3A6Zmlyc3QtY2hpbGQnKT8udGV4dENvbnRlbnQpID09PSBsYWJlbCxcbiAgICAgICk7XG5cbiAgICAgIGlmICghbWF0Y2gpIHJldHVybiBudWxsO1xuXG4gICAgICByZXR1cm4gY2xlYW5UZXh0KG1hdGNoLnF1ZXJ5U2VsZWN0b3IoJ3A6bGFzdC1jaGlsZCcpPy50ZXh0Q29udGVudCkgfHwgbnVsbDtcbiAgICB9O1xuXG4gICAgY29uc3QgZnVuZGluZ1ZhbHVlID0gKHJvdzogRWxlbWVudCwgbGFiZWw6IHN0cmluZyk6IHN0cmluZyB8IG51bGwgPT4ge1xuICAgICAgY29uc3QgZnVuZGluZ1Jvd3MgPSBBcnJheS5mcm9tKHJvdy5xdWVyeVNlbGVjdG9yQWxsKCcudHJhbnNhY3Rpb25Sb3dfX2RldGFpbHNfZnVuZGluZ19yb3cnKSk7XG5cbiAgICAgIGNvbnN0IG1hdGNoID0gZnVuZGluZ1Jvd3MuZmluZChcbiAgICAgICAgKGl0ZW0pID0+IGNsZWFuVGV4dChpdGVtLnF1ZXJ5U2VsZWN0b3IoJ3A6Zmlyc3QtY2hpbGQnKT8udGV4dENvbnRlbnQpID09PSBsYWJlbCxcbiAgICAgICk7XG5cbiAgICAgIGlmICghbWF0Y2gpIHJldHVybiBudWxsO1xuXG4gICAgICByZXR1cm4gY2xlYW5UZXh0KG1hdGNoLnF1ZXJ5U2VsZWN0b3IoJ3A6bGFzdC1jaGlsZCcpPy50ZXh0Q29udGVudCkgfHwgbnVsbDtcbiAgICB9O1xuXG4gICAgY29uc3QgcGFyc2VUcmFuc2FjdGlvbiA9IChyb3c6IEVsZW1lbnQpOiBQVCA9PiAoe1xuICAgICAgbWVyY2hhbnQ6IHRleHRGcm9tKHJvdywgJy50cmFuc2FjdGlvblJvd19fZGV0YWlsc19yb3dfbWVyY2hhbnQnKSxcblxuICAgICAgdGltZTogdGV4dEZyb20ocm93LCAnLnRyYW5zYWN0aW9uUm93X19zdW1tYXJ5X3RpdGxlX2NvbnRhaW5lciBwOmxhc3QtY2hpbGQnKSxcblxuICAgICAgYW1vdW50OiB0ZXh0RnJvbShyb3csICcudHJhbnNhY3Rpb25Sb3dfX3N1bW1hcnlfY29udGFpbmVyID4gZGl2Omxhc3QtY2hpbGQgcDpmaXJzdC1jaGlsZCcpLFxuXG4gICAgICB0eXBlOiB0ZXh0RnJvbShyb3csICcudHJhbnNhY3Rpb25Sb3dfX3N1bW1hcnlfY29udGFpbmVyID4gZGl2Omxhc3QtY2hpbGQgcDpsYXN0LWNoaWxkJyksXG5cbiAgICAgIHN0YXR1czogZGV0YWlsVmFsdWUocm93LCAnU3RhdHVzJyksXG5cbiAgICAgIHRyYW5zYWN0aW9uSWQ6IGRldGFpbFZhbHVlKHJvdywgJ1RyYW5zYWN0aW9uIElEJyksXG5cbiAgICAgIGRhdGU6IGRldGFpbFZhbHVlKHJvdywgJ0RhdGUnKSxcblxuICAgICAgY2FyZFBhbjogZGV0YWlsVmFsdWUocm93LCAnQ2FyZCBQQU4nKSxcblxuICAgICAgc291cmNlOiBmdW5kaW5nVmFsdWUocm93LCAnU291cmNlJyksXG5cbiAgICAgIHNwZW50OiBmdW5kaW5nVmFsdWUocm93LCAnU3BlbnQnKSxcblxuICAgICAgZ2FzRmVlOiBmdW5kaW5nVmFsdWUocm93LCAnR2FzIGZlZScpLFxuXG4gICAgICBkZXN0aW5hdGlvbjogZnVuZGluZ1ZhbHVlKHJvdywgJ0Rlc3RpbmF0aW9uJykgPz8gZGV0YWlsVmFsdWUocm93LCAnRGVzdGluYXRpb24nKSxcblxuICAgICAgY3JlZGl0ZWQ6IGZ1bmRpbmdWYWx1ZShyb3csICdDcmVkaXRlZCcpID8/IGRldGFpbFZhbHVlKHJvdywgJ0NyZWRpdGVkJyksXG4gICAgfSk7XG5cbiAgICBjb25zdCBsaXN0ID1cbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy50cmFuc2FjdGlvbkxpc3RfX21haW5fY29udGFpbmVyJykgPz9cbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ21haW4nKSA/P1xuICAgICAgZG9jdW1lbnQuYm9keTtcblxuICAgIGlmICghbGlzdCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgb2s6IGZhbHNlLFxuICAgICAgICBlcnJvcjogJ0NvdWxkIG5vdCBmaW5kIGRvY3VtZW50IGJvZHkuJyxcblxuICAgICAgICBzb3VyY2VVcmw6IGxvY2F0aW9uLmhyZWYsXG4gICAgICAgIGNhcHR1cmVkQXQsXG4gICAgICB9O1xuXG4gICAgfVxuXG4gICAgY29uc3Qgcm93c0Zyb21Eb20gPSBBcnJheS5mcm9tKGxpc3QucXVlcnlTZWxlY3RvckFsbCgnLnRyYW5zYWN0aW9uUm93X19hY2NvcmRpb25fbWFpbl9jb250YWluZXInKSk7XG4gICAgY29uc3QgdHJhbnNhY3Rpb25zID0gcm93c0Zyb21Eb20ubWFwKHBhcnNlVHJhbnNhY3Rpb24pO1xuXG4gICAgY29uc3Qgc2NyYXBlQ2FyZEJhbGFuY2VTbmFwc2hvdCA9ICgpOiB7IGFtb3VudDogc3RyaW5nOyBjdXJyZW5jeTogc3RyaW5nIH0gfCBudWxsID0+IHtcbiAgICAgIGNvbnN0IGNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jYXJkSW1hZ2VyeV9fY2FyZF9zdmdfY29udGFpbmVyJyk7XG4gICAgICBpZiAoIWNvbnRhaW5lcikgcmV0dXJuIG51bGw7XG4gICAgICBjb25zdCB0ZXh0RWxzID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoJ3N2ZyB0ZXh0Jyk7XG4gICAgICBmb3IgKGxldCB0aSA9IDA7IHRpIDwgdGV4dEVscy5sZW5ndGg7IHRpKyspIHtcbiAgICAgICAgY29uc3QgdGV4dEVsID0gdGV4dEVsc1t0aV07XG4gICAgICAgIGNvbnN0IHRzcGFucyA9IHRleHRFbC5xdWVyeVNlbGVjdG9yQWxsKCd0c3BhbicpO1xuICAgICAgICBpZiAodHNwYW5zLmxlbmd0aCA9PT0gMCkgY29udGludWU7XG4gICAgICAgIGxldCBhbW91bnQgPSAnJztcbiAgICAgICAgZm9yIChsZXQgbmkgPSAwOyBuaSA8IHRleHRFbC5jaGlsZE5vZGVzLmxlbmd0aDsgbmkrKykge1xuICAgICAgICAgIGNvbnN0IG5vZGUgPSB0ZXh0RWwuY2hpbGROb2Rlc1tuaV07XG4gICAgICAgICAgaWYgKG5vZGUubm9kZVR5cGUgPT09IE5vZGUuVEVYVF9OT0RFKSB7XG4gICAgICAgICAgICBhbW91bnQgKz0gKG5vZGUudGV4dENvbnRlbnQgfHwgJycpLnRyaW0oKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYW1vdW50ID0gYW1vdW50LnJlcGxhY2UoL1xccy9nLCAnJyk7XG4gICAgICAgIGNvbnN0IGN1cnJlbmN5RWwgPSB0c3BhbnNbdHNwYW5zLmxlbmd0aCAtIDFdO1xuICAgICAgICBjb25zdCBjdXJyZW5jeSA9ICgoY3VycmVuY3lFbCAmJiBjdXJyZW5jeUVsLnRleHRDb250ZW50KSB8fCAnJylcbiAgICAgICAgICAudHJpbSgpXG4gICAgICAgICAgLnJlcGxhY2UoL1xccy9nLCAnJyk7XG4gICAgICAgIGlmICghYW1vdW50IHx8ICFjdXJyZW5jeSkgY29udGludWU7XG4gICAgICAgIGNvbnN0IG5vcm1hbGl6ZWRBbW91bnQgPSBhbW91bnQucmVwbGFjZSgvLC9nLCAnJyk7XG4gICAgICAgIGlmICghL15cXGQrKFxcLlxcZCspPyQvLnRlc3Qobm9ybWFsaXplZEFtb3VudCkpIGNvbnRpbnVlO1xuICAgICAgICByZXR1cm4geyBhbW91bnQ6IG5vcm1hbGl6ZWRBbW91bnQsIGN1cnJlbmN5IH07XG4gICAgICB9XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9O1xuXG4gICAgY29uc3Qgc25hcCA9IHNjcmFwZUNhcmRCYWxhbmNlU25hcHNob3QoKTtcbiAgICBjb25zdCBvdXQ6IENhcHR1cmVSZXN1bHQgPSB7XG4gICAgICBvazogdHJ1ZSxcbiAgICAgIGh0bWw6ICcnLFxuICAgICAgc291cmNlVXJsOiBsb2NhdGlvbi5ocmVmLFxuICAgICAgY2FwdHVyZWRBdCxcbiAgICAgIHRyYW5zYWN0aW9uQ291bnQ6IHRyYW5zYWN0aW9ucy5sZW5ndGgsXG4gICAgICB0cmFuc2FjdGlvbnMsXG4gICAgfTtcbiAgICBpZiAoc25hcCkgb3V0LmNhcmRCYWxhbmNlID0gc25hcDtcbiAgICByZXR1cm4gb3V0O1xuXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG5cbiAgICByZXR1cm4ge1xuXG4gICAgICBvazogZmFsc2UsXG4gICAgICBlcnJvcjogZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpLFxuXG4gICAgICBzb3VyY2VVcmw6IGxvY2F0aW9uLmhyZWYsXG4gICAgICBjYXB0dXJlZEF0LFxuICAgIH07XG5cbiAgfVxuXG59XG5cbmFzeW5jIGZ1bmN0aW9uIGdldEFjdGl2ZVRhYigpOiBQcm9taXNlPGNocm9tZS50YWJzLlRhYiB8IG51bGw+IHtcbiAgY29uc3QgW3RhYl0gPSBhd2FpdCBjaHJvbWUudGFicy5xdWVyeSh7IGFjdGl2ZTogdHJ1ZSwgY3VycmVudFdpbmRvdzogdHJ1ZSB9KTtcbiAgcmV0dXJuIHRhYiA/PyBudWxsO1xuXG59XG5cbmFzeW5jIGZ1bmN0aW9uIGFza0NvbnRlbnRTY3JpcHQodGFiSWQ6IG51bWJlcik6IFByb21pc2U8Q2FwdHVyZVJlc3VsdD4ge1xuICBjb25zb2xlLmxvZyhMT0dfUFJFRklYLCAnYXNraW5nIGNvbnRlbnQgc2NyaXB0IHRvIHNjcmFwZSB0YWInLCB0YWJJZCk7XG4gIHJldHVybiB3aXRoVGltZW91dChcbiAgICBjaHJvbWUudGFicy5zZW5kTWVzc2FnZSh0YWJJZCwgeyB0eXBlOiAnU0NSQVBFX0NBUkRfSFRNTCcgfSBzYXRpc2ZpZXMgU2NyYXBlTWVzc2FnZSksXG4gICAgU0NSQVBFX1RJTUVPVVRfTVMsXG4gICAgJ1RpbWVkIG91dCB3YWl0aW5nIGZvciB0aGUgTWV0YU1hc2sgcGFnZSBzY3JhcGVyLicsXG4gICk7XG5cbn1cblxuYXN5bmMgZnVuY3Rpb24gZXhlY3V0ZUZhbGxiYWNrU2NyYXBlcih0YWJJZDogbnVtYmVyKTogUHJvbWlzZTxDYXB0dXJlUmVzdWx0PiB7XG4gIGNvbnNvbGUubG9nKExPR19QUkVGSVgsICdjb250ZW50IHNjcmlwdCB3YXMgbm90IHJlYWR5LCBpbmplY3RpbmcgZmFsbGJhY2sgc2NyYXBlciBpbnRvIHRhYicsIHRhYklkKTtcblxuICBjb25zdCBbcmVzdWx0XSA9IGF3YWl0IGNocm9tZS5zY3JpcHRpbmcuZXhlY3V0ZVNjcmlwdCh7XG4gICAgdGFyZ2V0OiB7IHRhYklkIH0sXG4gICAgZnVuYzogc2NyYXBlRnJvbVBhZ2UsXG5cbiAgfSk7XG5cbiAgcmV0dXJuIChcbiAgICByZXN1bHQ/LnJlc3VsdCA/P1xuICAgICh7XG4gICAgICBvazogZmFsc2UsXG4gICAgICBlcnJvcjogJ1NjcmlwdCBleGVjdXRlZCBidXQgcmV0dXJuZWQgbm8gcmVzdWx0LicsXG4gICAgICBjYXB0dXJlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgfSBzYXRpc2ZpZXMgQ2FwdHVyZVJlc3VsdClcblxuICApO1xuXG59XG5cbmFzeW5jIGZ1bmN0aW9uIGNhcHR1cmVUYWIodGFiOiBjaHJvbWUudGFicy5UYWIpOiBQcm9taXNlPENhcHR1cmVSZXN1bHQ+IHtcblxuICBjb25zb2xlLmxvZyhMT0dfUFJFRklYLCAnY2FwdHVyZSByZXF1ZXN0ZWQgZm9yIGFjdGl2ZSB0YWInLCB7IGlkOiB0YWIuaWQsIHVybDogdGFiLnVybCB9KTtcblxuXG4gIGlmICghdGFiLmlkKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG9rOiBmYWxzZSxcbiAgICAgIGVycm9yOiAnQWN0aXZlIHRhYiBoYXMgbm8gaWQuJyxcblxuICAgICAgc291cmNlVXJsOiB0YWIudXJsLFxuXG4gICAgICBjYXB0dXJlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG5cbiAgICB9O1xuXG4gIH1cblxuXG4gIGlmICghaXNDYXJkUGFnZSh0YWIudXJsKSkge1xuXG4gICAgcmV0dXJuIHtcblxuICAgICAgb2s6IGZhbHNlLFxuICAgICAgZXJyb3I6ICdPcGVuIGNhcmQubWV0YW1hc2suaW8gb3IgcG9ydGZvbGlvLm1ldGFtYXNrLmlvIGJlZm9yZSBzeW5jaW5nLicsXG5cbiAgICAgIHNvdXJjZVVybDogdGFiLnVybCxcblxuICAgICAgY2FwdHVyZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgIH07XG5cblxuICB9XG5cblxuICB0cnkge1xuXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgYXNrQ29udGVudFNjcmlwdCh0YWIuaWQpO1xuXG5cbiAgICBjb25zb2xlLmxvZyhMT0dfUFJFRklYLCAnY29udGVudCBzY3JpcHQgc2NyYXBlIGZpbmlzaGVkJywgcmVzdWx0Lm9rID8gcmVzdWx0LnRyYW5zYWN0aW9uQ291bnQgOiByZXN1bHQuZXJyb3IpO1xuXG5cbiAgICByZXR1cm4gcmVzdWx0O1xuXG5cbiAgfSBjYXRjaCAoZXJyb3IpIHtcblxuXG5cbiAgICBjb25zb2xlLndhcm4oTE9HX1BSRUZJWCwgJ2NvbnRlbnQgc2NyaXB0IHNjcmFwZSBmYWlsZWQsIHRyeWluZyBmYWxsYmFjayBpbmplY3Rpb24nLCBlcnJvcik7XG5cblxuXG4gICAgcmV0dXJuIHdpdGhUaW1lb3V0KFxuICAgICAgZXhlY3V0ZUZhbGxiYWNrU2NyYXBlcih0YWIuaWQpLFxuICAgICAgU0NSQVBFX1RJTUVPVVRfTVMsXG4gICAgICAnVGltZWQgb3V0IHdoaWxlIGluamVjdGluZyB0aGUgZmFsbGJhY2sgc2NyYXBlci4nLFxuICAgICk7XG5cblxuXG4gIH1cblxuXG5cbn1cblxuXG5cbmFzeW5jIGZ1bmN0aW9uIHNhdmVDYXB0dXJlKGpvYklkOiBzdHJpbmcsIHJlc3VsdDogQ2FwdHVyZVJlc3VsdCk6IFByb21pc2U8U3RvcmVkQ2FwdHVyZT4ge1xuXG5cblxuICBjb25zdCBzYXZlZENhcHR1cmU6IFN0b3JlZENhcHR1cmUgPSB7XG4gICAgLi4ucmVzdWx0LFxuICAgIGpvYklkLFxuICAgIHNhdmVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgfTtcblxuXG4gIGNvbnN0IGN1cnJlbnQgPSBhd2FpdCBjaHJvbWUuc3RvcmFnZS5sb2NhbC5nZXQoU1RPUkFHRV9LRVkpO1xuICBjb25zdCBjYXB0dXJlcyA9IEFycmF5LmlzQXJyYXkoY3VycmVudFtTVE9SQUdFX0tFWV0pID8gY3VycmVudFtTVE9SQUdFX0tFWV0gOiBbXTtcblxuICBjb25zdCBuZXh0Q2FwdHVyZXMgPSBbc2F2ZWRDYXB0dXJlLCAuLi5jYXB0dXJlc10uc2xpY2UoMCwgMjApO1xuXG5cbiAgYXdhaXQgY2hyb21lLnN0b3JhZ2UubG9jYWwuc2V0KHsgW1NUT1JBR0VfS0VZXTogbmV4dENhcHR1cmVzIH0pO1xuXG5cbiAgY29uc29sZS5sb2coTE9HX1BSRUZJWCwgJ3NhdmVkIGNhcHR1cmUgaW4gY2hyb21lLnN0b3JhZ2UubG9jYWwnLCB7XG4gICAgam9iSWQsXG4gICAgb2s6IHNhdmVkQ2FwdHVyZS5vayxcbiAgICB0cmFuc2FjdGlvbkNvdW50OiBzYXZlZENhcHR1cmUub2sgPyBzYXZlZENhcHR1cmUudHJhbnNhY3Rpb25Db3VudCA6IDAsXG4gIH0pO1xuXG5cbiAgcmV0dXJuIHNhdmVkQ2FwdHVyZTtcblxuXG59XG5cblxuXG5hc3luYyBmdW5jdGlvbiBnZXRTdG9yZWRBcGlUb2tlbigpOiBQcm9taXNlPHN0cmluZyB8IHVuZGVmaW5lZD4ge1xuICBjb25zdCB2ID0gYXdhaXQgY2hyb21lLnN0b3JhZ2UubG9jYWwuZ2V0KFNUT1JBR0VfQVBJX1RPS0VOX0tFWSk7XG4gIGNvbnN0IHRva2VuID0gdltTVE9SQUdFX0FQSV9UT0tFTl9LRVldO1xuICByZXR1cm4gdHlwZW9mIHRva2VuID09PSAnc3RyaW5nJyAmJiB0b2tlbi5sZW5ndGggPiAwID8gdG9rZW4gOiB1bmRlZmluZWQ7XG5cblxuXG59XG5cblxuXG5jaHJvbWUucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoKG1lc3NhZ2U6IENhcHR1cmVNZXNzYWdlLCBfc2VuZGVyLCBzZW5kUmVzcG9uc2UpID0+IHtcbiAgaWYgKG1lc3NhZ2U/LnR5cGUgIT09ICdDQVBUVVJFX0NBUkRfSFRNTCcpIHJldHVybiBmYWxzZTtcblxuICBjb25zb2xlLmxvZyhMT0dfUFJFRklYLCAnY2FwdHVyZSByZXF1ZXN0IGZyb20gcG9wdXAnKTtcblxuICB2b2lkIChhc3luYyAoKSA9PiB7XG4gICAgY29uc3Qgam9iSWQgPSBjcnlwdG8ucmFuZG9tVVVJRCgpO1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHRhYiA9IGF3YWl0IGdldEFjdGl2ZVRhYigpO1xuICAgICAgY29uc3QgcmVzdWx0ID1cbiAgICAgICAgdGFiXG4gICAgICAgICAgPyBhd2FpdCBjYXB0dXJlVGFiKHRhYilcbiAgICAgICAgICA6ICh7IG9rOiBmYWxzZSwgZXJyb3I6ICdObyBhY3RpdmUgdGFiIGZvdW5kLicsIGNhcHR1cmVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSB9IHNhdGlzZmllcyBDYXB0dXJlUmVzdWx0KTtcblxuICAgICAgYXdhaXQgc2F2ZUNhcHR1cmUoam9iSWQsIHJlc3VsdCk7XG5cbiAgICAgIGlmICghcmVzdWx0Lm9rKSB7XG4gICAgICAgIHNlbmRSZXNwb25zZSh7IG9rOiBmYWxzZSBhcyBjb25zdCwgZXJyb3I6IHJlc3VsdC5lcnJvciwgam9iSWQgfSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3QgdG9rZW4gPSBhd2FpdCBnZXRTdG9yZWRBcGlUb2tlbigpO1xuXG4gICAgICBpZiAoIXRva2VuKSB7XG4gICAgICAgIHNlbmRSZXNwb25zZSh7XG4gICAgICAgICAgb2s6IHRydWUgYXMgY29uc3QsXG4gICAgICAgICAgam9iSWQsXG4gICAgICAgICAgc2NyYXBlT2s6IHRydWUsXG4gICAgICAgICAgdHJhbnNhY3Rpb25Db3VudDogcmVzdWx0LnRyYW5zYWN0aW9uQ291bnQsXG4gICAgICAgICAgc3luY1BheWxvYWQ6IG51bGwsXG4gICAgICAgICAgc2NyYXBlT25seU1lc3NhZ2U6IGBTY3JhcGVkICR7cmVzdWx0LnRyYW5zYWN0aW9uQ291bnR9IHJvd3MuIFBhaXIgdGhlIGV4dGVuc2lvbiBmaXJzdCB0byBwdXNoIHRyYW5zYWN0aW9ucy5gLFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBpdGVtcyA9IHNjcmFwZWRNYW55VG9QYXJzZWRQYXlsb2FkKHJlc3VsdC50cmFuc2FjdGlvbnMpO1xuXG4gICAgICBzZW5kUmVzcG9uc2Uoe1xuICAgICAgICBvazogdHJ1ZSBhcyBjb25zdCxcbiAgICAgICAgam9iSWQsXG4gICAgICAgIHNjcmFwZU9rOiB0cnVlLFxuICAgICAgICB0cmFuc2FjdGlvbkNvdW50OiByZXN1bHQudHJhbnNhY3Rpb25Db3VudCxcbiAgICAgICAgc3luY1BheWxvYWQ6IHtcbiAgICAgICAgICBwYXJzZXJWZXJzaW9uOiBDQVJEX1BBUlNFUl9WRVJTSU9OLFxuICAgICAgICAgIGl0ZW1zLFxuICAgICAgICAgIC4uLihyZXN1bHQub2sgJiYgcmVzdWx0LmNhcmRCYWxhbmNlXG4gICAgICAgICAgICA/IHsgY2FyZEJhbGFuY2VTbmFwc2hvdDogcmVzdWx0LmNhcmRCYWxhbmNlIH1cbiAgICAgICAgICAgIDoge30pLFxuICAgICAgICB9LFxuICAgICAgICBzY3JhcGVPbmx5TWVzc2FnZTogbnVsbCxcbiAgICAgIH0pO1xuXG5cbiAgICB9IGNhdGNoIChvdXRlcikge1xuICAgICAgY29uc3QgZXJyTXNnID0gb3V0ZXIgaW5zdGFuY2VvZiBFcnJvciA/IG91dGVyLm1lc3NhZ2UgOiBTdHJpbmcob3V0ZXIpO1xuXG4gICAgICBjb25zb2xlLmVycm9yKExPR19QUkVGSVgsICdjYXB0dXJlIGpvYiBmYWlsZWQnLCBvdXRlcik7XG5cbiAgICAgIGF3YWl0IHNhdmVDYXB0dXJlKGpvYklkLCB7XG4gICAgICAgIG9rOiBmYWxzZSxcblxuICAgICAgICBlcnJvcjogZXJyTXNnLFxuICAgICAgICBjYXB0dXJlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG5cbiAgICAgIH0pO1xuXG5cbiAgICAgIHNlbmRSZXNwb25zZSh7IG9rOiBmYWxzZSBhcyBjb25zdCwgZXJyb3I6IGVyck1zZywgam9iSWQgfSk7XG4gICAgfVxuXG5cblxuICB9KSgpO1xuXG5cblxuICByZXR1cm4gdHJ1ZTtcblxuXG59KTtcbiIsIi8qKlxuICogUm93cyBmcm9tIERPTSBzY3JhcGUgKGBtZXJjaGFudGDigKYpIG9yIHNuYXBzaG90cyB1c2luZyBgdGl0bGVgIC8gbmVzdGVkIGBmdW5kaW5nYC5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7IENhcmRUeFdpcmUsIFBhcnNlZENhcmRXaXJlIH0gZnJvbSAnLi9hcGknO1xuXG5leHBvcnQgaW50ZXJmYWNlIFNjcmFwZWRDYXJkVHJhbnNhY3Rpb24ge1xuICBtZXJjaGFudD86IHN0cmluZztcbiAgdGl0bGU/OiBzdHJpbmc7XG4gIHRpbWU/OiBzdHJpbmc7XG4gIGFtb3VudD86IHN0cmluZztcbiAgdHlwZT86IHN0cmluZztcbiAgc3RhdHVzPzogc3RyaW5nIHwgbnVsbDtcbiAgdHJhbnNhY3Rpb25JZD86IHN0cmluZyB8IG51bGw7XG4gIGRhdGU/OiBzdHJpbmcgfCBudWxsO1xuICBjYXJkUGFuPzogc3RyaW5nIHwgbnVsbDtcbiAgc291cmNlPzogc3RyaW5nIHwgbnVsbDtcbiAgc3BlbnQ/OiBzdHJpbmcgfCBudWxsO1xuICBnYXNGZWU/OiBzdHJpbmcgfCBudWxsO1xuICBkZXN0aW5hdGlvbj86IHN0cmluZyB8IG51bGw7XG4gIGNyZWRpdGVkPzogc3RyaW5nIHwgbnVsbDtcbiAgZnVuZGluZz86IHtcbiAgICBzb3VyY2U/OiBzdHJpbmcgfCBudWxsO1xuICAgIHNwZW50Pzogc3RyaW5nIHwgbnVsbDtcbiAgICBnYXNGZWU/OiBzdHJpbmcgfCBudWxsO1xuICB9IHwgbnVsbDtcbn1cblxuZXhwb3J0IGNvbnN0IENBUkRfUEFSU0VSX1ZFUlNJT04gPSAyO1xuXG5mdW5jdGlvbiBub3JtYWxpemVTdGF0dXMocmF3OiBzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkKTogQ2FyZFR4V2lyZSB7XG4gIGNvbnN0IGtleSA9IChyYXcgPz8gJycpLnRyaW0oKS50b1VwcGVyQ2FzZSgpO1xuXG4gIHN3aXRjaCAoa2V5KSB7XG4gICAgY2FzZSAnUEVORElORyc6XG4gICAgY2FzZSAnQVVUSE9SSVpFRCc6XG4gICAgICByZXR1cm4gJ1BFTkRJTkcnO1xuICAgIGNhc2UgJ0NPTVBMRVRFJzpcbiAgICBjYXNlICdDT01QTEVURUQnOlxuICAgIGNhc2UgJ1NFVFRMRUQnOlxuICAgICAgcmV0dXJuICdTRVRUTEVEJztcbiAgICBjYXNlICdERUNMSU5FRCc6XG4gICAgY2FzZSAnQ0FOQ0VMTEVEJzpcbiAgICBjYXNlICdDQU5DRUxFRCc6XG4gICAgICByZXR1cm4gJ0RFQ0xJTkVEJztcbiAgICBjYXNlICdSRUZVTkQnOlxuICAgIGNhc2UgJ1JFRlVOREVEJzpcbiAgICAgIHJldHVybiAnUkVGVU5ERUQnO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gJ1NFVFRMRUQnO1xuICB9XG59XG5cbi8qKiBQYXJzZXMgREQvTU0vWVlZWSBoaDptbSBhbS9wbSBpbiBsb2NhbCBUWiwgZS5nLiBgMDQvMDUvMjAyNiAwOTo1MSBwbWAgKi9cbmV4cG9ydCBmdW5jdGlvbiB1a0RhdGVUaW1lTWVyaWRpYW5Ub0lzbyhyYXc6IHN0cmluZyB8IG51bGwgfCB1bmRlZmluZWQpOiBzdHJpbmcgfCBudWxsIHtcblxuICBjb25zdCBzID0gcmF3Py50cmltKCk7XG5cbiAgaWYgKCFzKSByZXR1cm4gbnVsbDtcblxuICBjb25zdCByZSA9IC9eKFxcZHsyfSlcXC8oXFxkezJ9KVxcLyhcXGR7NH0pXFxzKyhcXGR7MSwyfSk6KFxcZHsyfSlcXHMqKGFtfHBtKSQvaXU7XG5cbiAgY29uc3QgbSA9IHJlLmV4ZWMocyk7XG5cbiAgaWYgKCFtKSB7XG5cbiAgICBjb25zdCBkID0gbmV3IERhdGUocyk7XG5cbiAgICByZXR1cm4gTnVtYmVyLmlzTmFOKGQuZ2V0VGltZSgpKSA/IG51bGwgOiBkLnRvSVNPU3RyaW5nKCk7XG5cbiAgfVxuXG4gIGxldCBob3VyID0gTnVtYmVyKG1bNF0pO1xuICBjb25zdCBtaW51dGUgPSBOdW1iZXIobVs1XSk7XG4gIGNvbnN0IGFtcG0gPSBtWzZdIS50b0xvd2VyQ2FzZSgpO1xuICBjb25zdCBkYXkgPSBOdW1iZXIobVsxXSk7XG4gIGNvbnN0IG1vbnRoID0gTnVtYmVyKG1bMl0pO1xuICBjb25zdCB5ZWFyID0gTnVtYmVyKG1bM10pO1xuXG4gIGlmIChob3VyIDwgMTIgJiYgYW1wbSA9PT0gJ3BtJykgaG91ciArPSAxMjtcblxuICBpZiAoaG91ciA9PT0gMTIgJiYgYW1wbSA9PT0gJ2FtJykgaG91ciA9IDA7XG5cbiAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKHllYXIsIG1vbnRoIC0gMSwgZGF5LCBob3VyLCBtaW51dGUsIDAsIDApO1xuXG4gIHJldHVybiBOdW1iZXIuaXNOYU4oZGF0ZS5nZXRUaW1lKCkpID8gbnVsbCA6IGRhdGUudG9JU09TdHJpbmcoKTtcblxufVxuXG5jb25zdCBTWU1CT0xfVE9fSVNPOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xuICAn4oKsJzogJ0VVUicsXG4gICckJzogJ1VTRCcsXG4gICfCoyc6ICdHQlAnLFxuICAnwqUnOiAnSlBZJyxcbiAgJ+KCvSc6ICdSVUInLFxuICAn4oK0JzogJ1VBSCcsXG4gICfigqMnOiAnQ0hGJyxcbn07XG5cbi8qKiBOb3JtYWxpemVzIGEgRXVyb3BlYW4gY29tbWEtZGVjaW1hbCBzdHJpbmcgbGlrZSBcIjQyLDUwXCIgdG8gXCI0Mi41MFwiLiAqL1xuZnVuY3Rpb24gbm9ybWFsaXplRGVjaW1hbENvbW1hKHM6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBzLnJlcGxhY2UoLyhcXGQpLChcXGQpL2d1LCAnJDEuJDInKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNwbGl0TW9uZXlUb2tlbihyYXc6IHN0cmluZyB8IG51bGwgfCB1bmRlZmluZWQpOiB7IG51bWVyaWM6IHN0cmluZzsgY3VycmVuY3lSYXc6IHN0cmluZyB9IHwgbnVsbCB7XG5cbiAgY29uc3QgcyA9IHJhdz8udHJpbSgpPy5yZXBsYWNlKC9eLC91LCAnJyk7XG4gIGlmICghcykgcmV0dXJuIG51bGw7XG5cbiAgY29uc3QgTlVNQkVSX1NQQUNFX0NVUlJFTkNZID0gL14oWystXT9cXGQrKD86XFwuXFxkKyk/KVxccysoLispJC91O1xuXG4gIC8vIDEuIFRyeSBleGlzdGluZyBcIk5VTUJFUiBTUEFDRSBDVVJSRU5DWVwiIGZvcm1hdCAoZS5nLiBcIjQyLjUwIFBMTlwiKVxuICBjb25zdCBtID0gTlVNQkVSX1NQQUNFX0NVUlJFTkNZLmV4ZWMocyk7XG4gIGlmIChtKSByZXR1cm4geyBudW1lcmljOiBtWzFdIS5yZXBsYWNlKC9eXFwrL3UsICcnKSwgY3VycmVuY3lSYXc6IG1bMl0hLnRyaW0oKSB9O1xuXG4gIC8vIDIuIE5vcm1hbGl6ZSBjb21tYS1kZWNpbWFsIGFuZCByZXRyeSAoZS5nLiBcIjQyLDUwIEVVUlwiIOKGkiBcIjQyLjUwIEVVUlwiKVxuICBjb25zdCBub3JtYWxpemVkID0gbm9ybWFsaXplRGVjaW1hbENvbW1hKHMpO1xuICBjb25zdCBtMiA9IE5VTUJFUl9TUEFDRV9DVVJSRU5DWS5leGVjKG5vcm1hbGl6ZWQpO1xuICBpZiAobTIpIHJldHVybiB7IG51bWVyaWM6IG0yWzFdIS5yZXBsYWNlKC9eXFwrL3UsICcnKSwgY3VycmVuY3lSYXc6IG0yWzJdIS50cmltKCkgfTtcblxuICAvLyAzLiBUcnkgc3ltYm9sLXByZWZpeCBmb3JtYXQgKGUuZy4gXCLigqw0Mi41MFwiLCBcIiQ0Mi41MFwiLCBcIuKCrDQyLDUwXCIsIFwi4oKsIDQyLjUwXCIsIFwiLeKCrDQyLjUwXCIsIFwiK+KCrDY5LjkxXCIpXG4gIC8vIEtlZXAgdGhpcyBjaGFyIGNsYXNzIGluIHN5bmMgd2l0aCB0aGUga2V5cyBvZiBTWU1CT0xfVE9fSVNPIGFib3ZlLlxuICBjb25zdCBTWU1CT0xfUFJFRklYID0gL14oWystXT8pXFxzKihb4oKsJMKjwqXigr3igrTigqNdKVxccyooXFxkKyg/OlsuLF1cXGQrKT8pJC91O1xuICBjb25zdCBtMyA9IFNZTUJPTF9QUkVGSVguZXhlYyhzKTtcbiAgaWYgKG0zKSB7XG4gICAgY29uc3Qgc2lnbiA9IG0zWzFdID09PSAnLScgPyAnLScgOiAnJzsgIC8vIHN0cmlwICcrJywgaXQncyBqdXN0IHBvc2l0aXZlXG4gICAgY29uc3Qgc3ltYm9sID0gbTNbMl0hO1xuICAgIGNvbnN0IG51bWVyaWMgPSBub3JtYWxpemVEZWNpbWFsQ29tbWEoc2lnbiArIG0zWzNdISk7XG4gICAgY29uc3QgaXNvID0gU1lNQk9MX1RPX0lTT1tzeW1ib2xdO1xuICAgIGlmICghaXNvKSByZXR1cm4gbnVsbDtcbiAgICByZXR1cm4geyBudW1lcmljLCBjdXJyZW5jeVJhdzogaXNvIH07XG4gIH1cblxuICByZXR1cm4gbnVsbDtcblxufVxuXG5mdW5jdGlvbiBjcnlwdG9TeW1ib2xEaXNwbGF5KGN1cnJlbmN5UmF3OiBzdHJpbmcpOiBzdHJpbmcge1xuXG4gIGNvbnN0IHRyaW1tZWQgPSBjdXJyZW5jeVJhdy50cmltKCk7XG4gIGNvbnN0IGNvbXBhY3QgPSB0cmltbWVkLnJlcGxhY2UoL1xccysvZ3UsICcnKS50b1VwcGVyQ2FzZSgpO1xuXG4gIGlmICgvXFxiTU0/VVNEXFxifFxcYk1JTExJXFxzP1VTRFxcYi9pdS50ZXN0KHRyaW1tZWQpIHx8IC9NK00/VVNEL2l1LnRlc3QoY29tcGFjdCkpIHtcbiAgICByZXR1cm4gJ01VU0QnO1xuXG4gIH1cblxuICByZXR1cm4gY29tcGFjdC5zbGljZSgwLCAzMik7XG5cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNwbGl0Q3J5cHRvU3BlbmQocmF3OiBzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkKTogeyBudW1lcmljOiBzdHJpbmc7IHN5bWJvbDogc3RyaW5nIH0gfCBudWxsIHtcblxuICBjb25zdCBwYXJ0cyA9IHNwbGl0TW9uZXlUb2tlbihyYXc/LnRyaW0oKSk7XG4gIGlmICghcGFydHMpIHJldHVybiBudWxsO1xuXG4gIGNvbnN0IHN5bWJvbCA9IGNyeXB0b1N5bWJvbERpc3BsYXkocGFydHMuY3VycmVuY3lSYXcpO1xuICByZXR1cm4geyBudW1lcmljOiBwYXJ0cy5udW1lcmljLCBzeW1ib2wgfTtcblxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2NyYXBlZFRvUGFyc2VkQ2FyZFR4KHJvdzogU2NyYXBlZENhcmRUcmFuc2FjdGlvbik6IFBhcnNlZENhcmRXaXJlIHwgbnVsbCB7XG5cbiAgY29uc3QgZXh0ID0gcm93LnRyYW5zYWN0aW9uSWQ/LnRyaW0oKTtcbiAgaWYgKCFleHQpIHJldHVybiBudWxsO1xuXG4gIGNvbnN0IG1lcmNoYW50TmFtZSA9IChyb3cubWVyY2hhbnQ/LnRyaW0oKSA/PyByb3cudGl0bGU/LnRyaW0oKSA/PyAnVW5rbm93biBtZXJjaGFudCcpLnNsaWNlKDAsIDUxMik7XG5cbiAgY29uc3QgY29tcG9zZWREYXRlVGltZSA9XG4gICAgdHlwZW9mIHJvdy5kYXRlID09PSAnc3RyaW5nJyAmJiB0eXBlb2Ygcm93LnRpbWUgPT09ICdzdHJpbmcnXG5cbiAgICAgID8gcm93LmRhdGUuaW5jbHVkZXMocm93LnRpbWUudHJpbSgpKVxuXG4gICAgICAgID8gcm93LmRhdGUudHJpbSgpXG5cbiAgICAgICAgOiBgJHtyb3cuZGF0ZS5yZXBsYWNlKC9cXHMrLiokL3UsICcnKS50cmltKCl9ICR7cm93LnRpbWUudHJpbSgpfWBcblxuICAgICAgOiByb3cuZGF0ZTtcblxuICBjb25zdCBvY2N1cnJlZEF0ID0gdWtEYXRlVGltZU1lcmlkaWFuVG9Jc28oY29tcG9zZWREYXRlVGltZSk7XG5cbiAgaWYgKCFvY2N1cnJlZEF0KSByZXR1cm4gbnVsbDtcblxuICBjb25zdCBmaWF0ID0gc3BsaXRNb25leVRva2VuKHJvdy5hbW91bnQpO1xuICBjb25zdCBjcmVkaXRlZCA9IHNwbGl0TW9uZXlUb2tlbihyb3cuY3JlZGl0ZWQpO1xuICBpZiAoIWZpYXQgJiYgIWNyZWRpdGVkKSByZXR1cm4gbnVsbDtcblxuICBjb25zdCBuYXRpdmUgPSBmaWF0ID8/IGNyZWRpdGVkO1xuICBpZiAoIW5hdGl2ZSkgcmV0dXJuIG51bGw7XG5cbiAgY29uc3QgZmlhdEN1cnJlbmN5ID0gbmF0aXZlLmN1cnJlbmN5UmF3LnNsaWNlKDAsIDgpLnRvVXBwZXJDYXNlKCk7XG5cbiAgY29uc3Qgc3BlbnRSYXcgPSByb3cuZnVuZGluZz8uc3BlbnQgPz8gcm93LnNwZW50ID8/IG51bGw7XG4gIGxldCBjcnlwdG9QYXJzZWQgPSBzcGxpdENyeXB0b1NwZW5kKHNwZW50UmF3KTtcbiAgY29uc3QgY3JlZGl0ZWRQYXJzZWQgPSBzcGxpdENyeXB0b1NwZW5kKHJvdy5jcmVkaXRlZCk7XG4gIGNvbnN0IGdhc0ZlZVJhdyA9IHJvdy5mdW5kaW5nPy5nYXNGZWUgPz8gcm93Lmdhc0ZlZSA/PyBudWxsO1xuICBjb25zdCBnYXNGZWVQYXJzZWQgPSBzcGxpdENyeXB0b1NwZW5kKGdhc0ZlZVJhdyk7XG5cbiAgbGV0IGNyeXB0b0Ftb3VudDogc3RyaW5nIHwgbnVsbCA9IGNyeXB0b1BhcnNlZD8ubnVtZXJpYyA/PyBjcmVkaXRlZFBhcnNlZD8ubnVtZXJpYyA/PyBudWxsO1xuXG4gIGxldCBjcnlwdG9TeW1ib2w6IHN0cmluZyB8IG51bGwgPSBjcnlwdG9QYXJzZWQ/LnN5bWJvbCA/PyBjcmVkaXRlZFBhcnNlZD8uc3ltYm9sID8/IG51bGw7XG5cbiAgLyoqIFNvbWUgZW50cmllcyBvbmx5IGV4cG9zZSBmaWF0IHNwZW5kICovXG4gIGlmIChjcnlwdG9BbW91bnQgPT09IG51bGwpIHtcbiAgICBjcnlwdG9BbW91bnQgPSBuYXRpdmUubnVtZXJpYztcblxuICAgIGNyeXB0b1N5bWJvbCA9IGZpYXRDdXJyZW5jeTtcbiAgfVxuXG4gIGNvbnN0IGZ1bmRpbmdNYXNrZWQgPSByb3cuZnVuZGluZz8uc291cmNlPy50cmltKCkgPz8gcm93LnNvdXJjZT8udHJpbSgpID8/IG51bGw7XG4gIGNvbnN0IGNyZWRpdERlc3RpbmF0aW9uTWFza2VkID0gcm93LmRlc3RpbmF0aW9uPy50cmltKCkgPz8gbnVsbDtcblxuICByZXR1cm4ge1xuICAgIGV4dGVybmFsSWQ6IGV4dC5zbGljZSgwLCA1MTIpLFxuICAgIG9jY3VycmVkQXQsXG4gICAgbWVyY2hhbnROYW1lLFxuICAgIGZpYXRBbW91bnQ6IG5hdGl2ZS5udW1lcmljLFxuICAgIGZpYXRDdXJyZW5jeSxcbiAgICBtZXJjaGFudFJhdzpcbiAgICAgIGAke3Jvdy5jYXJkUGFuID8/ICcnfXwke3Jvdy50eXBlID8/ICcnfXwke3Jvdy5nYXNGZWUgPz8gcm93LmZ1bmRpbmc/Lmdhc0ZlZSA/PyAnJ318JHtzcGVudFJhdyA/PyAnJ318JHtyb3cuY3JlZGl0ZWQgPz8gJyd9YFxuICAgICAgICAucmVwbGFjZSgvXFx8XFx8Ky9ndSwgJ3wnKVxuICAgICAgICAuc2xpY2UoMCwgMjA0OCkgfHwgdW5kZWZpbmVkLFxuICAgIGNyeXB0b0Ftb3VudCxcblxuICAgIGNyeXB0b1N5bWJvbCxcbiAgICBnYXNGZWVBbW91bnQ6IGdhc0ZlZVBhcnNlZD8ubnVtZXJpYyA/PyBudWxsLFxuICAgIGdhc0ZlZVN5bWJvbDogZ2FzRmVlUGFyc2VkPy5zeW1ib2wgPz8gbnVsbCxcbiAgICBnYXNGZWVSYXc6IGdhc0ZlZVJhdyA/PyBudWxsLFxuICAgIHNwZW50UmF3OiBzcGVudFJhdyA/PyBudWxsLFxuICAgIGNyZWRpdGVkUmF3OiByb3cuY3JlZGl0ZWQgPz8gbnVsbCxcbiAgICBmdW5kaW5nU291cmNlTWFza2VkOiBmdW5kaW5nTWFza2VkID8/IG51bGwsXG4gICAgY3JlZGl0RGVzdGluYXRpb25NYXNrZWQsXG5cbiAgICBzdGF0dXM6IG5vcm1hbGl6ZVN0YXR1cyhyb3cuc3RhdHVzKSxcbiAgICBwYXJzZXJWZXJzaW9uOiBDQVJEX1BBUlNFUl9WRVJTSU9OLFxuICB9O1xuXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzY3JhcGVkTWFueVRvUGFyc2VkUGF5bG9hZChyb3dzOiBTY3JhcGVkQ2FyZFRyYW5zYWN0aW9uW10pOiBQYXJzZWRDYXJkV2lyZVtdIHtcblxuICBjb25zdCBvdXQ6IFBhcnNlZENhcmRXaXJlW10gPSBbXTtcbiAgY29uc3Qgc2VlbkV4dGVybmFsID0gbmV3IFNldDxzdHJpbmc+KCk7XG5cbiAgZm9yIChjb25zdCByb3cgb2Ygcm93cykge1xuXG4gICAgY29uc3QgcGFyc2VkID0gc2NyYXBlZFRvUGFyc2VkQ2FyZFR4KHJvdyk7XG5cbiAgICBpZiAoIXBhcnNlZCkgY29udGludWU7XG5cbiAgICBpZiAoc2VlbkV4dGVybmFsLmhhcyhwYXJzZWQuZXh0ZXJuYWxJZCkpIGNvbnRpbnVlO1xuXG4gICAgc2VlbkV4dGVybmFsLmFkZChwYXJzZWQuZXh0ZXJuYWxJZCk7XG5cbiAgICBvdXQucHVzaChwYXJzZWQpO1xuICB9XG5cbiAgcmV0dXJuIG91dDtcblxufVxuIiwiZXhwb3J0cy5pbnRlcm9wRGVmYXVsdCA9IGZ1bmN0aW9uIChhKSB7XG4gIHJldHVybiBhICYmIGEuX19lc01vZHVsZSA/IGEgOiB7ZGVmYXVsdDogYX07XG59O1xuXG5leHBvcnRzLmRlZmluZUludGVyb3BGbGFnID0gZnVuY3Rpb24gKGEpIHtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGEsICdfX2VzTW9kdWxlJywge3ZhbHVlOiB0cnVlfSk7XG59O1xuXG5leHBvcnRzLmV4cG9ydEFsbCA9IGZ1bmN0aW9uIChzb3VyY2UsIGRlc3QpIHtcbiAgT2JqZWN0LmtleXMoc291cmNlKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICBpZiAoa2V5ID09PSAnZGVmYXVsdCcgfHwga2V5ID09PSAnX19lc01vZHVsZScgfHwgZGVzdC5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGRlc3QsIGtleSwge1xuICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gc291cmNlW2tleV07XG4gICAgICB9LFxuICAgIH0pO1xuICB9KTtcblxuICByZXR1cm4gZGVzdDtcbn07XG5cbmV4cG9ydHMuZXhwb3J0ID0gZnVuY3Rpb24gKGRlc3QsIGRlc3ROYW1lLCBnZXQpIHtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGRlc3QsIGRlc3ROYW1lLCB7XG4gICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICBnZXQ6IGdldCxcbiAgfSk7XG59O1xuIl0sIm5hbWVzIjpbXSwidmVyc2lvbiI6MywiZmlsZSI6ImluZGV4LmpzLm1hcCJ9
 globalThis.define=__define;  })(globalThis.define);