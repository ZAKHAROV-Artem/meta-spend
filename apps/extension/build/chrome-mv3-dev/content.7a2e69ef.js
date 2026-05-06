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
})({"7BNnx":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "config", ()=>config);
var _content = require("../content");
const config = {
    matches: [
        "https://portfolio.metamask.io/*",
        "https://card.metamask.io/*"
    ],
    run_at: "document_idle"
};

},{"../content":"efh2m","@parcel/transformer-js/src/esmodule-helpers.js":"6dfwG"}],"efh2m":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "config", ()=>config);
const LOG_PREFIX = "[CryptoTrack Card Capture]";
const config = {
    matches: [
        "https://portfolio.metamask.io/*",
        "https://card.metamask.io/*"
    ],
    run_at: "document_idle"
};
function cleanText(value) {
    return (value ?? "").replace(/\s+/g, " ").trim();
}
function textFrom(root, selector) {
    return cleanText(root.querySelector(selector)?.textContent);
}
function detailValue(row, label) {
    const detailRows = Array.from(row.querySelectorAll(".transactionRow__details_row_container"));
    const match = detailRows.find((item)=>cleanText(item.querySelector("p:first-child")?.textContent) === label);
    if (!match) return null;
    return cleanText(match.querySelector("p:last-child")?.textContent) || null;
}
function fundingValue(row, label) {
    const fundingRows = Array.from(row.querySelectorAll(".transactionRow__details_funding_row"));
    const match = fundingRows.find((item)=>cleanText(item.querySelector("p:first-child")?.textContent) === label);
    if (!match) return null;
    return cleanText(match.querySelector("p:last-child")?.textContent) || null;
}
function parseTransaction(row) {
    return {
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
    };
}
function scrapeTransactions() {
    const capturedAt = new Date().toISOString();
    console.log(LOG_PREFIX, "scraping transactions from page", location.href);
    try {
        const list = document.querySelector(".transactionList__main_container") ?? document.querySelector("main") ?? document.body;
        if (!list) return {
            ok: false,
            error: "Could not find document body.",
            sourceUrl: location.href,
            capturedAt
        };
        const rows = Array.from(list.querySelectorAll(".transactionRow__accordion_main_container"));
        const transactions = rows.map(parseTransaction);
        const result = {
            ok: true,
            html: "",
            sourceUrl: location.href,
            capturedAt,
            transactionCount: transactions.length,
            transactions
        };
        console.log(LOG_PREFIX, "scrape complete", {
            transactionCount: result.transactionCount,
            firstTransaction: result.transactions[0] ?? null
        });
        return result;
    } catch (error) {
        console.error(LOG_PREFIX, "scrape failed", error);
        return {
            ok: false,
            error: error instanceof Error ? error.message : String(error),
            sourceUrl: location.href,
            capturedAt
        };
    }
}
chrome.runtime.onMessage.addListener((message, _sender, sendResponse)=>{
    if (message?.type !== "SCRAPE_CARD_HTML") return false;
    console.log(LOG_PREFIX, "received scrape request from background worker");
    sendResponse(scrapeTransactions());
    return false;
});

},{"@parcel/transformer-js/src/esmodule-helpers.js":"6dfwG"}],"6dfwG":[function(require,module,exports) {
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

},{}]},["7BNnx"], "7BNnx", "parcelRequire258f")

//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LG9CQUFvQixPQUFPO0lBRWpELFFBQVEsSUFBSSxZQUFZO0lBR3hCLGFBQWE7SUFHYixPQUFPO0FBR1Q7OztBQ3RNQSxRQUFRLGlCQUFpQixTQUFVLENBQUM7SUFDbEMsT0FBTyxLQUFLLEVBQUUsYUFBYSxJQUFJO1FBQUMsU0FBUztJQUFDO0FBQzVDO0FBRUEsUUFBUSxvQkFBb0IsU0FBVSxDQUFDO0lBQ3JDLE9BQU8sZUFBZSxHQUFHLGNBQWM7UUFBQyxPQUFPO0lBQUk7QUFDckQ7QUFFQSxRQUFRLFlBQVksU0FBVSxNQUFNLEVBQUUsSUFBSTtJQUN4QyxPQUFPLEtBQUssUUFBUSxRQUFRLFNBQVUsR0FBRztRQUN2QyxJQUFJLFFBQVEsYUFBYSxRQUFRLGdCQUFnQixLQUFLLGVBQWUsTUFDbkU7UUFHRixPQUFPLGVBQWUsTUFBTSxLQUFLO1lBQy9CLFlBQVk7WUFDWixLQUFLO2dCQUNILE9BQU8sTUFBTSxDQUFDLElBQUk7WUFDcEI7UUFDRjtJQUNGO0lBRUEsT0FBTztBQUNUO0FBRUEsUUFBUSxTQUFTLFNBQVUsSUFBSSxFQUFFLFFBQVEsRUFBRSxHQUFHO0lBQzVDLE9BQU8sZUFBZSxNQUFNLFVBQVU7UUFDcEMsWUFBWTtRQUNaLEtBQUs7SUFDUDtBQUNGIiwic291cmNlcyI6WyJhcHBzL2V4dGVuc2lvbi9zcmMvY29udGVudC50cyIsImFwcHMvZXh0ZW5zaW9uL2NvbnRlbnQudHMiLCJub2RlX21vZHVsZXMvLnBucG0vQHBhcmNlbCt0cmFuc2Zvcm1lci1qc0AyLjkuM19AcGFyY2VsK2NvcmVAMi45LjMvbm9kZV9tb2R1bGVzL0BwYXJjZWwvdHJhbnNmb3JtZXItanMvc3JjL2VzbW9kdWxlLWhlbHBlcnMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBQbGFzbW9DU0NvbmZpZyB9IGZyb20gJ3BsYXNtbyc7XG5cbmV4cG9ydCBjb25zdCBjb25maWc6IFBsYXNtb0NTQ29uZmlnID0ge1xuICBtYXRjaGVzOiBbJ2h0dHBzOi8vcG9ydGZvbGlvLm1ldGFtYXNrLmlvLyonLCAnaHR0cHM6Ly9jYXJkLm1ldGFtYXNrLmlvLyonXSxcbiAgcnVuX2F0OiAnZG9jdW1lbnRfaWRsZScsXG59O1xuXG5pbXBvcnQgJy4uL2NvbnRlbnQnO1xuIiwiaW1wb3J0IHR5cGUgeyBQbGFzbW9DU0NvbmZpZyB9IGZyb20gJ3BsYXNtbyc7XG5cbmltcG9ydCB0eXBlIHsgU2NyYXBlZENhcmRUcmFuc2FjdGlvbiB9IGZyb20gJy4vc3JjL2xpYi9ub3JtYWxpemUnO1xuXG50eXBlIENhcHR1cmVSZXN1bHQgPVxuICB8IHtcbiAgICAgIG9rOiB0cnVlO1xuICAgICAgaHRtbDogc3RyaW5nO1xuICAgICAgc291cmNlVXJsOiBzdHJpbmc7XG4gICAgICBjYXB0dXJlZEF0OiBzdHJpbmc7XG4gICAgICB0cmFuc2FjdGlvbkNvdW50OiBudW1iZXI7XG4gICAgICB0cmFuc2FjdGlvbnM6IFNjcmFwZWRDYXJkVHJhbnNhY3Rpb25bXTtcbiAgICB9XG4gIHwge1xuICAgICAgb2s6IGZhbHNlO1xuICAgICAgZXJyb3I6IHN0cmluZztcbiAgICAgIHNvdXJjZVVybD86IHN0cmluZztcbiAgICAgIGNhcHR1cmVkQXQ6IHN0cmluZztcbiAgICB9O1xuXG50eXBlIFNjcmFwZU1lc3NhZ2UgPSB7IHR5cGU6ICdTQ1JBUEVfQ0FSRF9IVE1MJyB9O1xuXG5jb25zdCBMT0dfUFJFRklYID0gJ1tDcnlwdG9UcmFjayBDYXJkIENhcHR1cmVdJztcblxuZXhwb3J0IGNvbnN0IGNvbmZpZzogUGxhc21vQ1NDb25maWcgPSB7XG4gIG1hdGNoZXM6IFsnaHR0cHM6Ly9wb3J0Zm9saW8ubWV0YW1hc2suaW8vKicsICdodHRwczovL2NhcmQubWV0YW1hc2suaW8vKiddLFxuICBydW5fYXQ6ICdkb2N1bWVudF9pZGxlJyxcbn07XG5cbmZ1bmN0aW9uIGNsZWFuVGV4dCh2YWx1ZTogc3RyaW5nIHwgbnVsbCB8IHVuZGVmaW5lZCk6IHN0cmluZyB7XG5cbiAgcmV0dXJuICh2YWx1ZSA/PyAnJykucmVwbGFjZSgvXFxzKy9nLCAnICcpLnRyaW0oKTtcblxuXG59XG5cbmZ1bmN0aW9uIHRleHRGcm9tKHJvb3Q6IEVsZW1lbnQsIHNlbGVjdG9yOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gY2xlYW5UZXh0KHJvb3QucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik/LnRleHRDb250ZW50KTtcblxuXG59XG5cbmZ1bmN0aW9uIGRldGFpbFZhbHVlKHJvdzogRWxlbWVudCwgbGFiZWw6IHN0cmluZyk6IHN0cmluZyB8IG51bGwge1xuICBjb25zdCBkZXRhaWxSb3dzID0gQXJyYXkuZnJvbShyb3cucXVlcnlTZWxlY3RvckFsbCgnLnRyYW5zYWN0aW9uUm93X19kZXRhaWxzX3Jvd19jb250YWluZXInKSk7XG4gIGNvbnN0IG1hdGNoID0gZGV0YWlsUm93cy5maW5kKChpdGVtKSA9PiBjbGVhblRleHQoaXRlbS5xdWVyeVNlbGVjdG9yKCdwOmZpcnN0LWNoaWxkJyk/LnRleHRDb250ZW50KSA9PT0gbGFiZWwpO1xuXG4gIGlmICghbWF0Y2gpIHJldHVybiBudWxsO1xuXG4gIHJldHVybiBjbGVhblRleHQobWF0Y2gucXVlcnlTZWxlY3RvcigncDpsYXN0LWNoaWxkJyk/LnRleHRDb250ZW50KSB8fCBudWxsO1xuXG5cbn1cblxuZnVuY3Rpb24gZnVuZGluZ1ZhbHVlKHJvdzogRWxlbWVudCwgbGFiZWw6IHN0cmluZyk6IHN0cmluZyB8IG51bGwge1xuXG5cbiAgY29uc3QgZnVuZGluZ1Jvd3MgPSBBcnJheS5mcm9tKHJvdy5xdWVyeVNlbGVjdG9yQWxsKCcudHJhbnNhY3Rpb25Sb3dfX2RldGFpbHNfZnVuZGluZ19yb3cnKSk7XG4gIGNvbnN0IG1hdGNoID0gZnVuZGluZ1Jvd3MuZmluZCgoaXRlbSkgPT4gY2xlYW5UZXh0KGl0ZW0ucXVlcnlTZWxlY3RvcigncDpmaXJzdC1jaGlsZCcpPy50ZXh0Q29udGVudCkgPT09IGxhYmVsKTtcblxuICBpZiAoIW1hdGNoKSByZXR1cm4gbnVsbDtcblxuICByZXR1cm4gY2xlYW5UZXh0KG1hdGNoLnF1ZXJ5U2VsZWN0b3IoJ3A6bGFzdC1jaGlsZCcpPy50ZXh0Q29udGVudCkgfHwgbnVsbDtcblxuXG59XG5cblxuZnVuY3Rpb24gcGFyc2VUcmFuc2FjdGlvbihyb3c6IEVsZW1lbnQpOiBTY3JhcGVkQ2FyZFRyYW5zYWN0aW9uIHtcblxuXG4gIHJldHVybiB7XG5cblxuICAgIG1lcmNoYW50OiB0ZXh0RnJvbShyb3csICcudHJhbnNhY3Rpb25Sb3dfX2RldGFpbHNfcm93X21lcmNoYW50JyksXG5cblxuXG4gICAgdGltZTogdGV4dEZyb20ocm93LCAnLnRyYW5zYWN0aW9uUm93X19zdW1tYXJ5X3RpdGxlX2NvbnRhaW5lciBwOmxhc3QtY2hpbGQnKSxcblxuICAgIGFtb3VudDogdGV4dEZyb20ocm93LCAnLnRyYW5zYWN0aW9uUm93X19zdW1tYXJ5X2NvbnRhaW5lciA+IGRpdjpsYXN0LWNoaWxkIHA6Zmlyc3QtY2hpbGQnKSxcblxuICAgIHR5cGU6IHRleHRGcm9tKHJvdywgJy50cmFuc2FjdGlvblJvd19fc3VtbWFyeV9jb250YWluZXIgPiBkaXY6bGFzdC1jaGlsZCBwOmxhc3QtY2hpbGQnKSxcblxuXG5cbiAgICBzdGF0dXM6IGRldGFpbFZhbHVlKHJvdywgJ1N0YXR1cycpLFxuXG5cblxuICAgIHRyYW5zYWN0aW9uSWQ6IGRldGFpbFZhbHVlKHJvdywgJ1RyYW5zYWN0aW9uIElEJyksXG5cbiAgICBkYXRlOiBkZXRhaWxWYWx1ZShyb3csICdEYXRlJyksXG5cbiAgICBjYXJkUGFuOiBkZXRhaWxWYWx1ZShyb3csICdDYXJkIFBBTicpLFxuXG4gICAgc291cmNlOiBmdW5kaW5nVmFsdWUocm93LCAnU291cmNlJyksXG5cbiAgICBzcGVudDogZnVuZGluZ1ZhbHVlKHJvdywgJ1NwZW50JyksXG5cbiAgICBnYXNGZWU6IGZ1bmRpbmdWYWx1ZShyb3csICdHYXMgZmVlJyksXG5cbiAgfTtcblxuXG59XG5cblxuXG5cbmZ1bmN0aW9uIHNjcmFwZVRyYW5zYWN0aW9ucygpOiBDYXB0dXJlUmVzdWx0IHtcbiAgY29uc3QgY2FwdHVyZWRBdCA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgY29uc29sZS5sb2coTE9HX1BSRUZJWCwgJ3NjcmFwaW5nIHRyYW5zYWN0aW9ucyBmcm9tIHBhZ2UnLCBsb2NhdGlvbi5ocmVmKTtcblxuICB0cnkge1xuICAgIGNvbnN0IGxpc3QgPVxuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnRyYW5zYWN0aW9uTGlzdF9fbWFpbl9jb250YWluZXInKSA/P1xuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignbWFpbicpID8/XG4gICAgICBkb2N1bWVudC5ib2R5O1xuXG4gICAgaWYgKCFsaXN0KSB7XG5cblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgb2s6IGZhbHNlLFxuICAgICAgICBlcnJvcjogJ0NvdWxkIG5vdCBmaW5kIGRvY3VtZW50IGJvZHkuJyxcblxuICAgICAgICBzb3VyY2VVcmw6IGxvY2F0aW9uLmhyZWYsXG5cbiAgICAgICAgY2FwdHVyZWRBdCxcblxuICAgICAgfTtcblxuXG4gICAgfVxuXG5cblxuICAgIGNvbnN0IHJvd3MgPSBBcnJheS5mcm9tKGxpc3QucXVlcnlTZWxlY3RvckFsbCgnLnRyYW5zYWN0aW9uUm93X19hY2NvcmRpb25fbWFpbl9jb250YWluZXInKSk7XG5cbiAgICBjb25zdCB0cmFuc2FjdGlvbnMgPSByb3dzLm1hcChwYXJzZVRyYW5zYWN0aW9uKTtcblxuXG5cbiAgICBjb25zdCByZXN1bHQgPSB7XG4gICAgICBvazogdHJ1ZSxcbiAgICAgIGh0bWw6ICcnLFxuICAgICAgc291cmNlVXJsOiBsb2NhdGlvbi5ocmVmLFxuICAgICAgY2FwdHVyZWRBdCxcbiAgICAgIHRyYW5zYWN0aW9uQ291bnQ6IHRyYW5zYWN0aW9ucy5sZW5ndGgsXG4gICAgICB0cmFuc2FjdGlvbnMsXG4gICAgfSBzYXRpc2ZpZXMgQ2FwdHVyZVJlc3VsdDtcblxuXG5cbiAgICBjb25zb2xlLmxvZyhMT0dfUFJFRklYLCAnc2NyYXBlIGNvbXBsZXRlJywge1xuICAgICAgdHJhbnNhY3Rpb25Db3VudDogcmVzdWx0LnRyYW5zYWN0aW9uQ291bnQsXG4gICAgICBmaXJzdFRyYW5zYWN0aW9uOiByZXN1bHQudHJhbnNhY3Rpb25zWzBdID8/IG51bGwsXG4gICAgfSk7XG5cblxuXG4gICAgcmV0dXJuIHJlc3VsdDtcblxuXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG5cbiAgICBjb25zb2xlLmVycm9yKExPR19QUkVGSVgsICdzY3JhcGUgZmFpbGVkJywgZXJyb3IpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIG9rOiBmYWxzZSxcbiAgICAgIGVycm9yOiBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvciksXG4gICAgICBzb3VyY2VVcmw6IGxvY2F0aW9uLmhyZWYsXG5cbiAgICAgIGNhcHR1cmVkQXQsXG5cbiAgICB9O1xuXG5cbiAgfVxuXG5cblxufVxuXG5cblxuY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKChtZXNzYWdlOiBTY3JhcGVNZXNzYWdlLCBfc2VuZGVyLCBzZW5kUmVzcG9uc2UpID0+IHtcbiAgaWYgKG1lc3NhZ2U/LnR5cGUgIT09ICdTQ1JBUEVfQ0FSRF9IVE1MJykgcmV0dXJuIGZhbHNlO1xuXG4gIGNvbnNvbGUubG9nKExPR19QUkVGSVgsICdyZWNlaXZlZCBzY3JhcGUgcmVxdWVzdCBmcm9tIGJhY2tncm91bmQgd29ya2VyJyk7XG5cblxuICBzZW5kUmVzcG9uc2Uoc2NyYXBlVHJhbnNhY3Rpb25zKCkpO1xuXG5cbiAgcmV0dXJuIGZhbHNlO1xuXG5cbn0pO1xuIiwiZXhwb3J0cy5pbnRlcm9wRGVmYXVsdCA9IGZ1bmN0aW9uIChhKSB7XG4gIHJldHVybiBhICYmIGEuX19lc01vZHVsZSA/IGEgOiB7ZGVmYXVsdDogYX07XG59O1xuXG5leHBvcnRzLmRlZmluZUludGVyb3BGbGFnID0gZnVuY3Rpb24gKGEpIHtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGEsICdfX2VzTW9kdWxlJywge3ZhbHVlOiB0cnVlfSk7XG59O1xuXG5leHBvcnRzLmV4cG9ydEFsbCA9IGZ1bmN0aW9uIChzb3VyY2UsIGRlc3QpIHtcbiAgT2JqZWN0LmtleXMoc291cmNlKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICBpZiAoa2V5ID09PSAnZGVmYXVsdCcgfHwga2V5ID09PSAnX19lc01vZHVsZScgfHwgZGVzdC5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGRlc3QsIGtleSwge1xuICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gc291cmNlW2tleV07XG4gICAgICB9LFxuICAgIH0pO1xuICB9KTtcblxuICByZXR1cm4gZGVzdDtcbn07XG5cbmV4cG9ydHMuZXhwb3J0ID0gZnVuY3Rpb24gKGRlc3QsIGRlc3ROYW1lLCBnZXQpIHtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGRlc3QsIGRlc3ROYW1lLCB7XG4gICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICBnZXQ6IGdldCxcbiAgfSk7XG59O1xuIl0sIm5hbWVzIjpbXSwidmVyc2lvbiI6MywiZmlsZSI6ImNvbnRlbnQuN2EyZTY5ZWYuanMubWFwIn0=
 globalThis.define=__define;  })(globalThis.define);