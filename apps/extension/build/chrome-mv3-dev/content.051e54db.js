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
})({"efh2m":[function(require,module,exports) {
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
            html: list.outerHTML,
            sourceUrl: location.href,
            capturedAt,
            transactionCount: transactions.length,
            transactions
        };
        console.log(LOG_PREFIX, "scrape complete", {
            transactionCount: result.transactionCount,
            htmlLength: result.html.length,
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

},{}]},["efh2m"], "efh2m", "parcelRequire258f")

//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QWE7SUFHYixPQUFPO0FBR1Q7OztBQ3ZNQSxRQUFRLGlCQUFpQixTQUFVLENBQUM7SUFDbEMsT0FBTyxLQUFLLEVBQUUsYUFBYSxJQUFJO1FBQUMsU0FBUztJQUFDO0FBQzVDO0FBRUEsUUFBUSxvQkFBb0IsU0FBVSxDQUFDO0lBQ3JDLE9BQU8sZUFBZSxHQUFHLGNBQWM7UUFBQyxPQUFPO0lBQUk7QUFDckQ7QUFFQSxRQUFRLFlBQVksU0FBVSxNQUFNLEVBQUUsSUFBSTtJQUN4QyxPQUFPLEtBQUssUUFBUSxRQUFRLFNBQVUsR0FBRztRQUN2QyxJQUFJLFFBQVEsYUFBYSxRQUFRLGdCQUFnQixLQUFLLGVBQWUsTUFDbkU7UUFHRixPQUFPLGVBQWUsTUFBTSxLQUFLO1lBQy9CLFlBQVk7WUFDWixLQUFLO2dCQUNILE9BQU8sTUFBTSxDQUFDLElBQUk7WUFDcEI7UUFDRjtJQUNGO0lBRUEsT0FBTztBQUNUO0FBRUEsUUFBUSxTQUFTLFNBQVUsSUFBSSxFQUFFLFFBQVEsRUFBRSxHQUFHO0lBQzVDLE9BQU8sZUFBZSxNQUFNLFVBQVU7UUFDcEMsWUFBWTtRQUNaLEtBQUs7SUFDUDtBQUNGIiwic291cmNlcyI6WyJhcHBzL2V4dGVuc2lvbi9jb250ZW50LnRzIiwibm9kZV9tb2R1bGVzLy5wbnBtL0BwYXJjZWwrdHJhbnNmb3JtZXItanNAMi45LjNfQHBhcmNlbCtjb3JlQDIuOS4zL25vZGVfbW9kdWxlcy9AcGFyY2VsL3RyYW5zZm9ybWVyLWpzL3NyYy9lc21vZHVsZS1oZWxwZXJzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgUGxhc21vQ1NDb25maWcgfSBmcm9tICdwbGFzbW8nO1xuXG5pbXBvcnQgdHlwZSB7IFNjcmFwZWRDYXJkVHJhbnNhY3Rpb24gfSBmcm9tICcuL3NyYy9saWIvbm9ybWFsaXplJztcblxudHlwZSBDYXB0dXJlUmVzdWx0ID1cbiAgfCB7XG4gICAgICBvazogdHJ1ZTtcbiAgICAgIGh0bWw6IHN0cmluZztcbiAgICAgIHNvdXJjZVVybDogc3RyaW5nO1xuICAgICAgY2FwdHVyZWRBdDogc3RyaW5nO1xuICAgICAgdHJhbnNhY3Rpb25Db3VudDogbnVtYmVyO1xuICAgICAgdHJhbnNhY3Rpb25zOiBTY3JhcGVkQ2FyZFRyYW5zYWN0aW9uW107XG4gICAgfVxuICB8IHtcbiAgICAgIG9rOiBmYWxzZTtcbiAgICAgIGVycm9yOiBzdHJpbmc7XG4gICAgICBzb3VyY2VVcmw/OiBzdHJpbmc7XG4gICAgICBjYXB0dXJlZEF0OiBzdHJpbmc7XG4gICAgfTtcblxudHlwZSBTY3JhcGVNZXNzYWdlID0geyB0eXBlOiAnU0NSQVBFX0NBUkRfSFRNTCcgfTtcblxuY29uc3QgTE9HX1BSRUZJWCA9ICdbQ3J5cHRvVHJhY2sgQ2FyZCBDYXB0dXJlXSc7XG5cbmV4cG9ydCBjb25zdCBjb25maWc6IFBsYXNtb0NTQ29uZmlnID0ge1xuICBtYXRjaGVzOiBbJ2h0dHBzOi8vcG9ydGZvbGlvLm1ldGFtYXNrLmlvLyonLCAnaHR0cHM6Ly9jYXJkLm1ldGFtYXNrLmlvLyonXSxcbiAgcnVuX2F0OiAnZG9jdW1lbnRfaWRsZScsXG59O1xuXG5mdW5jdGlvbiBjbGVhblRleHQodmFsdWU6IHN0cmluZyB8IG51bGwgfCB1bmRlZmluZWQpOiBzdHJpbmcge1xuXG4gIHJldHVybiAodmFsdWUgPz8gJycpLnJlcGxhY2UoL1xccysvZywgJyAnKS50cmltKCk7XG5cblxufVxuXG5mdW5jdGlvbiB0ZXh0RnJvbShyb290OiBFbGVtZW50LCBzZWxlY3Rvcjogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIGNsZWFuVGV4dChyb290LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpPy50ZXh0Q29udGVudCk7XG5cblxufVxuXG5mdW5jdGlvbiBkZXRhaWxWYWx1ZShyb3c6IEVsZW1lbnQsIGxhYmVsOiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsIHtcbiAgY29uc3QgZGV0YWlsUm93cyA9IEFycmF5LmZyb20ocm93LnF1ZXJ5U2VsZWN0b3JBbGwoJy50cmFuc2FjdGlvblJvd19fZGV0YWlsc19yb3dfY29udGFpbmVyJykpO1xuICBjb25zdCBtYXRjaCA9IGRldGFpbFJvd3MuZmluZCgoaXRlbSkgPT4gY2xlYW5UZXh0KGl0ZW0ucXVlcnlTZWxlY3RvcigncDpmaXJzdC1jaGlsZCcpPy50ZXh0Q29udGVudCkgPT09IGxhYmVsKTtcblxuICBpZiAoIW1hdGNoKSByZXR1cm4gbnVsbDtcblxuICByZXR1cm4gY2xlYW5UZXh0KG1hdGNoLnF1ZXJ5U2VsZWN0b3IoJ3A6bGFzdC1jaGlsZCcpPy50ZXh0Q29udGVudCkgfHwgbnVsbDtcblxuXG59XG5cbmZ1bmN0aW9uIGZ1bmRpbmdWYWx1ZShyb3c6IEVsZW1lbnQsIGxhYmVsOiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsIHtcblxuXG4gIGNvbnN0IGZ1bmRpbmdSb3dzID0gQXJyYXkuZnJvbShyb3cucXVlcnlTZWxlY3RvckFsbCgnLnRyYW5zYWN0aW9uUm93X19kZXRhaWxzX2Z1bmRpbmdfcm93JykpO1xuICBjb25zdCBtYXRjaCA9IGZ1bmRpbmdSb3dzLmZpbmQoKGl0ZW0pID0+IGNsZWFuVGV4dChpdGVtLnF1ZXJ5U2VsZWN0b3IoJ3A6Zmlyc3QtY2hpbGQnKT8udGV4dENvbnRlbnQpID09PSBsYWJlbCk7XG5cbiAgaWYgKCFtYXRjaCkgcmV0dXJuIG51bGw7XG5cbiAgcmV0dXJuIGNsZWFuVGV4dChtYXRjaC5xdWVyeVNlbGVjdG9yKCdwOmxhc3QtY2hpbGQnKT8udGV4dENvbnRlbnQpIHx8IG51bGw7XG5cblxufVxuXG5cbmZ1bmN0aW9uIHBhcnNlVHJhbnNhY3Rpb24ocm93OiBFbGVtZW50KTogU2NyYXBlZENhcmRUcmFuc2FjdGlvbiB7XG5cblxuICByZXR1cm4ge1xuXG5cbiAgICBtZXJjaGFudDogdGV4dEZyb20ocm93LCAnLnRyYW5zYWN0aW9uUm93X19kZXRhaWxzX3Jvd19tZXJjaGFudCcpLFxuXG5cblxuICAgIHRpbWU6IHRleHRGcm9tKHJvdywgJy50cmFuc2FjdGlvblJvd19fc3VtbWFyeV90aXRsZV9jb250YWluZXIgcDpsYXN0LWNoaWxkJyksXG5cbiAgICBhbW91bnQ6IHRleHRGcm9tKHJvdywgJy50cmFuc2FjdGlvblJvd19fc3VtbWFyeV9jb250YWluZXIgPiBkaXY6bGFzdC1jaGlsZCBwOmZpcnN0LWNoaWxkJyksXG5cbiAgICB0eXBlOiB0ZXh0RnJvbShyb3csICcudHJhbnNhY3Rpb25Sb3dfX3N1bW1hcnlfY29udGFpbmVyID4gZGl2Omxhc3QtY2hpbGQgcDpsYXN0LWNoaWxkJyksXG5cblxuXG4gICAgc3RhdHVzOiBkZXRhaWxWYWx1ZShyb3csICdTdGF0dXMnKSxcblxuXG5cbiAgICB0cmFuc2FjdGlvbklkOiBkZXRhaWxWYWx1ZShyb3csICdUcmFuc2FjdGlvbiBJRCcpLFxuXG4gICAgZGF0ZTogZGV0YWlsVmFsdWUocm93LCAnRGF0ZScpLFxuXG4gICAgY2FyZFBhbjogZGV0YWlsVmFsdWUocm93LCAnQ2FyZCBQQU4nKSxcblxuICAgIHNvdXJjZTogZnVuZGluZ1ZhbHVlKHJvdywgJ1NvdXJjZScpLFxuXG4gICAgc3BlbnQ6IGZ1bmRpbmdWYWx1ZShyb3csICdTcGVudCcpLFxuXG4gICAgZ2FzRmVlOiBmdW5kaW5nVmFsdWUocm93LCAnR2FzIGZlZScpLFxuXG4gIH07XG5cblxufVxuXG5cblxuXG5mdW5jdGlvbiBzY3JhcGVUcmFuc2FjdGlvbnMoKTogQ2FwdHVyZVJlc3VsdCB7XG4gIGNvbnN0IGNhcHR1cmVkQXQgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gIGNvbnNvbGUubG9nKExPR19QUkVGSVgsICdzY3JhcGluZyB0cmFuc2FjdGlvbnMgZnJvbSBwYWdlJywgbG9jYXRpb24uaHJlZik7XG5cbiAgdHJ5IHtcbiAgICBjb25zdCBsaXN0ID1cbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy50cmFuc2FjdGlvbkxpc3RfX21haW5fY29udGFpbmVyJykgPz9cbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ21haW4nKSA/P1xuICAgICAgZG9jdW1lbnQuYm9keTtcblxuICAgIGlmICghbGlzdCkge1xuXG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIG9rOiBmYWxzZSxcbiAgICAgICAgZXJyb3I6ICdDb3VsZCBub3QgZmluZCBkb2N1bWVudCBib2R5LicsXG5cbiAgICAgICAgc291cmNlVXJsOiBsb2NhdGlvbi5ocmVmLFxuXG4gICAgICAgIGNhcHR1cmVkQXQsXG5cbiAgICAgIH07XG5cblxuICAgIH1cblxuXG5cbiAgICBjb25zdCByb3dzID0gQXJyYXkuZnJvbShsaXN0LnF1ZXJ5U2VsZWN0b3JBbGwoJy50cmFuc2FjdGlvblJvd19fYWNjb3JkaW9uX21haW5fY29udGFpbmVyJykpO1xuXG4gICAgY29uc3QgdHJhbnNhY3Rpb25zID0gcm93cy5tYXAocGFyc2VUcmFuc2FjdGlvbik7XG5cblxuXG4gICAgY29uc3QgcmVzdWx0ID0ge1xuICAgICAgb2s6IHRydWUsXG4gICAgICBodG1sOiAobGlzdCBhcyBIVE1MRWxlbWVudCkub3V0ZXJIVE1MLFxuICAgICAgc291cmNlVXJsOiBsb2NhdGlvbi5ocmVmLFxuICAgICAgY2FwdHVyZWRBdCxcbiAgICAgIHRyYW5zYWN0aW9uQ291bnQ6IHRyYW5zYWN0aW9ucy5sZW5ndGgsXG4gICAgICB0cmFuc2FjdGlvbnMsXG4gICAgfSBzYXRpc2ZpZXMgQ2FwdHVyZVJlc3VsdDtcblxuXG5cbiAgICBjb25zb2xlLmxvZyhMT0dfUFJFRklYLCAnc2NyYXBlIGNvbXBsZXRlJywge1xuICAgICAgdHJhbnNhY3Rpb25Db3VudDogcmVzdWx0LnRyYW5zYWN0aW9uQ291bnQsXG4gICAgICBodG1sTGVuZ3RoOiByZXN1bHQuaHRtbC5sZW5ndGgsXG4gICAgICBmaXJzdFRyYW5zYWN0aW9uOiByZXN1bHQudHJhbnNhY3Rpb25zWzBdID8/IG51bGwsXG4gICAgfSk7XG5cblxuXG4gICAgcmV0dXJuIHJlc3VsdDtcblxuXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG5cbiAgICBjb25zb2xlLmVycm9yKExPR19QUkVGSVgsICdzY3JhcGUgZmFpbGVkJywgZXJyb3IpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIG9rOiBmYWxzZSxcbiAgICAgIGVycm9yOiBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvciksXG4gICAgICBzb3VyY2VVcmw6IGxvY2F0aW9uLmhyZWYsXG5cbiAgICAgIGNhcHR1cmVkQXQsXG5cbiAgICB9O1xuXG5cbiAgfVxuXG5cblxufVxuXG5cblxuY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKChtZXNzYWdlOiBTY3JhcGVNZXNzYWdlLCBfc2VuZGVyLCBzZW5kUmVzcG9uc2UpID0+IHtcbiAgaWYgKG1lc3NhZ2U/LnR5cGUgIT09ICdTQ1JBUEVfQ0FSRF9IVE1MJykgcmV0dXJuIGZhbHNlO1xuXG4gIGNvbnNvbGUubG9nKExPR19QUkVGSVgsICdyZWNlaXZlZCBzY3JhcGUgcmVxdWVzdCBmcm9tIGJhY2tncm91bmQgd29ya2VyJyk7XG5cblxuICBzZW5kUmVzcG9uc2Uoc2NyYXBlVHJhbnNhY3Rpb25zKCkpO1xuXG5cbiAgcmV0dXJuIGZhbHNlO1xuXG5cbn0pO1xuIiwiZXhwb3J0cy5pbnRlcm9wRGVmYXVsdCA9IGZ1bmN0aW9uIChhKSB7XG4gIHJldHVybiBhICYmIGEuX19lc01vZHVsZSA/IGEgOiB7ZGVmYXVsdDogYX07XG59O1xuXG5leHBvcnRzLmRlZmluZUludGVyb3BGbGFnID0gZnVuY3Rpb24gKGEpIHtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGEsICdfX2VzTW9kdWxlJywge3ZhbHVlOiB0cnVlfSk7XG59O1xuXG5leHBvcnRzLmV4cG9ydEFsbCA9IGZ1bmN0aW9uIChzb3VyY2UsIGRlc3QpIHtcbiAgT2JqZWN0LmtleXMoc291cmNlKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICBpZiAoa2V5ID09PSAnZGVmYXVsdCcgfHwga2V5ID09PSAnX19lc01vZHVsZScgfHwgZGVzdC5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGRlc3QsIGtleSwge1xuICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gc291cmNlW2tleV07XG4gICAgICB9LFxuICAgIH0pO1xuICB9KTtcblxuICByZXR1cm4gZGVzdDtcbn07XG5cbmV4cG9ydHMuZXhwb3J0ID0gZnVuY3Rpb24gKGRlc3QsIGRlc3ROYW1lLCBnZXQpIHtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGRlc3QsIGRlc3ROYW1lLCB7XG4gICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICBnZXQ6IGdldCxcbiAgfSk7XG59O1xuIl0sIm5hbWVzIjpbXSwidmVyc2lvbiI6MywiZmlsZSI6ImNvbnRlbnQuMDUxZTU0ZGIuanMubWFwIn0=
 globalThis.define=__define;  })(globalThis.define);