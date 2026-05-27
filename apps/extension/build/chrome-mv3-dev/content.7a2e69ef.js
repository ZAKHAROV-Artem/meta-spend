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
var _scrapeCardBalance = require("./src/lib/scrape-card-balance");
const LOG_PREFIX = "[MetaSpend Card Capture]";
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
        const cardSnap = (0, _scrapeCardBalance.scrapeCardBalanceSnapshot)();
        const result = {
            ok: true,
            html: "",
            sourceUrl: location.href,
            capturedAt,
            transactionCount: transactions.length,
            transactions,
            ...cardSnap ? {
                cardBalance: cardSnap
            } : {}
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

},{"./src/lib/scrape-card-balance":"gXU4Q","@parcel/transformer-js/src/esmodule-helpers.js":"6dfwG"}],"gXU4Q":[function(require,module,exports) {
/**
 * Reads MetaMask Portfolio card preview (`685.84` + `mUSD`) from the SVG block.
 */ var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "scrapeCardBalanceSnapshot", ()=>scrapeCardBalanceSnapshot);
function scrapeCardBalanceSnapshot(doc = document) {
    const container = doc.querySelector(".cardImagery__card_svg_container");
    if (!container) return null;
    const textEls = container.querySelectorAll("svg text");
    for (const textEl of textEls){
        const tspans = textEl.querySelectorAll("tspan");
        if (tspans.length === 0) continue;
        let amount = "";
        for (const node of textEl.childNodes)if (node.nodeType === Node.TEXT_NODE) amount += (node.textContent ?? "").trim();
        amount = amount.replace(/\s/g, "");
        const currency = (tspans[tspans.length - 1]?.textContent ?? "").trim().replace(/\s/g, "");
        if (!amount || !currency) continue;
        const normalizedAmount = amount.replace(/,/g, "");
        if (!/^\d+(\.\d+)?$/.test(normalizedAmount)) continue;
        return {
            amount: normalizedAmount,
            currency
        };
    }
    return null;
}

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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzRDQUVhO0FBS2I7QUFMTyxNQUFNLFNBQXlCO0lBQ3BDLFNBQVM7UUFBQztRQUFtQztLQUE2QjtJQUMxRSxRQUFRO0FBQ1Y7Ozs7OzRDQ3FCYTtBQXZCYjtBQXFCQSxNQUFNLGFBQWE7QUFFWixNQUFNLFNBQXlCO0lBQ3BDLFNBQVM7UUFBQztRQUFtQztLQUE2QjtJQUMxRSxRQUFRO0FBQ1Y7QUFFQSxTQUFTLFVBQVUsS0FBZ0M7SUFFakQsT0FBTyxBQUFDLENBQUEsU0FBUyxFQUFDLEVBQUcsUUFBUSxRQUFRLEtBQUs7QUFHNUM7QUFFQSxTQUFTLFNBQVMsSUFBYSxFQUFFLFFBQWdCO0lBQy9DLE9BQU8sVUFBVSxLQUFLLGNBQWMsV0FBVztBQUdqRDtBQUVBLFNBQVMsWUFBWSxHQUFZLEVBQUUsS0FBYTtJQUM5QyxNQUFNLGFBQWEsTUFBTSxLQUFLLElBQUksaUJBQWlCO0lBQ25ELE1BQU0sUUFBUSxXQUFXLEtBQUssQ0FBQyxPQUFTLFVBQVUsS0FBSyxjQUFjLGtCQUFrQixpQkFBaUI7SUFFeEcsSUFBSSxDQUFDLE9BQU8sT0FBTztJQUVuQixPQUFPLFVBQVUsTUFBTSxjQUFjLGlCQUFpQixnQkFBZ0I7QUFHeEU7QUFFQSxTQUFTLGFBQWEsR0FBWSxFQUFFLEtBQWE7SUFHL0MsTUFBTSxjQUFjLE1BQU0sS0FBSyxJQUFJLGlCQUFpQjtJQUNwRCxNQUFNLFFBQVEsWUFBWSxLQUFLLENBQUMsT0FBUyxVQUFVLEtBQUssY0FBYyxrQkFBa0IsaUJBQWlCO0lBRXpHLElBQUksQ0FBQyxPQUFPLE9BQU87SUFFbkIsT0FBTyxVQUFVLE1BQU0sY0FBYyxpQkFBaUIsZ0JBQWdCO0FBR3hFO0FBR0EsU0FBUyxpQkFBaUIsR0FBWTtJQUdwQyxPQUFPO1FBR0wsVUFBVSxTQUFTLEtBQUs7UUFJeEIsTUFBTSxTQUFTLEtBQUs7UUFFcEIsUUFBUSxTQUFTLEtBQUs7UUFFdEIsTUFBTSxTQUFTLEtBQUs7UUFJcEIsUUFBUSxZQUFZLEtBQUs7UUFJekIsZUFBZSxZQUFZLEtBQUs7UUFFaEMsTUFBTSxZQUFZLEtBQUs7UUFFdkIsU0FBUyxZQUFZLEtBQUs7UUFFMUIsUUFBUSxhQUFhLEtBQUs7UUFFMUIsT0FBTyxhQUFhLEtBQUs7UUFFekIsUUFBUSxhQUFhLEtBQUs7SUFFNUI7QUFHRjtBQUtBLFNBQVM7SUFDUCxNQUFNLGFBQWEsSUFBSSxPQUFPO0lBQzlCLFFBQVEsSUFBSSxZQUFZLG1DQUFtQyxTQUFTO0lBRXBFLElBQUk7UUFDRixNQUFNLE9BQ0osU0FBUyxjQUFjLHVDQUN2QixTQUFTLGNBQWMsV0FDdkIsU0FBUztRQUVYLElBQUksQ0FBQyxNQUdILE9BQU87WUFDTCxJQUFJO1lBQ0osT0FBTztZQUVQLFdBQVcsU0FBUztZQUVwQjtRQUVGO1FBT0YsTUFBTSxPQUFPLE1BQU0sS0FBSyxLQUFLLGlCQUFpQjtRQUU5QyxNQUFNLGVBQWUsS0FBSyxJQUFJO1FBRTlCLE1BQU0sV0FBVyxDQUFBLEdBQUEsNENBQXdCO1FBRXpDLE1BQU0sU0FBUztZQUNiLElBQUk7WUFDSixNQUFNO1lBQ04sV0FBVyxTQUFTO1lBQ3BCO1lBQ0Esa0JBQWtCLGFBQWE7WUFDL0I7WUFDQSxHQUFJLFdBQVc7Z0JBQUUsYUFBYTtZQUFTLElBQUksQ0FBQyxDQUFDO1FBQy9DO1FBSUEsUUFBUSxJQUFJLFlBQVksbUJBQW1CO1lBQ3pDLGtCQUFrQixPQUFPO1lBQ3pCLGtCQUFrQixPQUFPLFlBQVksQ0FBQyxFQUFFLElBQUk7UUFDOUM7UUFJQSxPQUFPO0lBR1QsRUFBRSxPQUFPLE9BQU87UUFFZCxRQUFRLE1BQU0sWUFBWSxpQkFBaUI7UUFFM0MsT0FBTztZQUNMLElBQUk7WUFDSixPQUFPLGlCQUFpQixRQUFRLE1BQU0sVUFBVSxPQUFPO1lBQ3ZELFdBQVcsU0FBUztZQUVwQjtRQUVGO0lBR0Y7QUFJRjtBQUlBLE9BQU8sUUFBUSxVQUFVLFlBQVksQ0FBQyxTQUF3QixTQUFTO0lBQ3JFLElBQUksU0FBUyxTQUFTLG9CQUFvQixPQUFPO0lBRWpELFFBQVEsSUFBSSxZQUFZO0lBR3hCLGFBQWE7SUFHYixPQUFPO0FBR1Q7OztBQ3pNQTs7Q0FFQzs7QUFDRCwrREFBZ0I7QUFBVCxTQUFTLDBCQUEwQixNQUFnQixRQUFRO0lBSWhFLE1BQU0sWUFBWSxJQUFJLGNBQWM7SUFDcEMsSUFBSSxDQUFDLFdBQVcsT0FBTztJQUV2QixNQUFNLFVBQVUsVUFBVSxpQkFBaUI7SUFDM0MsS0FBSyxNQUFNLFVBQVUsUUFBUztRQUM1QixNQUFNLFNBQVMsT0FBTyxpQkFBaUI7UUFDdkMsSUFBSSxPQUFPLFdBQVcsR0FBRztRQUV6QixJQUFJLFNBQVM7UUFDYixLQUFLLE1BQU0sUUFBUSxPQUFPLFdBQ3hCLElBQUksS0FBSyxhQUFhLEtBQUssV0FDekIsVUFBVSxBQUFDLENBQUEsS0FBSyxlQUFlLEVBQUMsRUFBRztRQUd2QyxTQUFTLE9BQU8sUUFBUSxPQUFPO1FBQy9CLE1BQU0sV0FBVyxBQUFDLENBQUEsTUFBTSxDQUFDLE9BQU8sU0FBUyxFQUFFLEVBQUUsZUFBZSxFQUFDLEVBQUcsT0FBTyxRQUFRLE9BQU87UUFDdEYsSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVO1FBQzFCLE1BQU0sbUJBQW1CLE9BQU8sUUFBUSxNQUFNO1FBQzlDLElBQUksQ0FBQyxnQkFBZ0IsS0FBSyxtQkFBbUI7UUFFN0MsT0FBTztZQUFFLFFBQVE7WUFBa0I7UUFBUztJQUM5QztJQUVBLE9BQU87QUFDVDs7O0FDL0JBLFFBQVEsaUJBQWlCLFNBQVUsQ0FBQztJQUNsQyxPQUFPLEtBQUssRUFBRSxhQUFhLElBQUk7UUFBQyxTQUFTO0lBQUM7QUFDNUM7QUFFQSxRQUFRLG9CQUFvQixTQUFVLENBQUM7SUFDckMsT0FBTyxlQUFlLEdBQUcsY0FBYztRQUFDLE9BQU87SUFBSTtBQUNyRDtBQUVBLFFBQVEsWUFBWSxTQUFVLE1BQU0sRUFBRSxJQUFJO0lBQ3hDLE9BQU8sS0FBSyxRQUFRLFFBQVEsU0FBVSxHQUFHO1FBQ3ZDLElBQUksUUFBUSxhQUFhLFFBQVEsZ0JBQWdCLEtBQUssZUFBZSxNQUNuRTtRQUdGLE9BQU8sZUFBZSxNQUFNLEtBQUs7WUFDL0IsWUFBWTtZQUNaLEtBQUs7Z0JBQ0gsT0FBTyxNQUFNLENBQUMsSUFBSTtZQUNwQjtRQUNGO0lBQ0Y7SUFFQSxPQUFPO0FBQ1Q7QUFFQSxRQUFRLFNBQVMsU0FBVSxJQUFJLEVBQUUsUUFBUSxFQUFFLEdBQUc7SUFDNUMsT0FBTyxlQUFlLE1BQU0sVUFBVTtRQUNwQyxZQUFZO1FBQ1osS0FBSztJQUNQO0FBQ0YiLCJzb3VyY2VzIjpbImFwcHMvZXh0ZW5zaW9uL3NyYy9jb250ZW50LnRzIiwiYXBwcy9leHRlbnNpb24vY29udGVudC50cyIsImFwcHMvZXh0ZW5zaW9uL3NyYy9saWIvc2NyYXBlLWNhcmQtYmFsYW5jZS50cyIsIm5vZGVfbW9kdWxlcy8ucG5wbS9AcGFyY2VsK3RyYW5zZm9ybWVyLWpzQDIuOS4zX0BwYXJjZWwrY29yZUAyLjkuMy9ub2RlX21vZHVsZXMvQHBhcmNlbC90cmFuc2Zvcm1lci1qcy9zcmMvZXNtb2R1bGUtaGVscGVycy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IFBsYXNtb0NTQ29uZmlnIH0gZnJvbSAncGxhc21vJztcblxuZXhwb3J0IGNvbnN0IGNvbmZpZzogUGxhc21vQ1NDb25maWcgPSB7XG4gIG1hdGNoZXM6IFsnaHR0cHM6Ly9wb3J0Zm9saW8ubWV0YW1hc2suaW8vKicsICdodHRwczovL2NhcmQubWV0YW1hc2suaW8vKiddLFxuICBydW5fYXQ6ICdkb2N1bWVudF9pZGxlJyxcbn07XG5cbmltcG9ydCAnLi4vY29udGVudCc7XG4iLCJpbXBvcnQgdHlwZSB7IFBsYXNtb0NTQ29uZmlnIH0gZnJvbSAncGxhc21vJztcblxuaW1wb3J0IHR5cGUgeyBTY3JhcGVkQ2FyZFRyYW5zYWN0aW9uIH0gZnJvbSAnLi9zcmMvbGliL25vcm1hbGl6ZSc7XG5pbXBvcnQgeyBzY3JhcGVDYXJkQmFsYW5jZVNuYXBzaG90IH0gZnJvbSAnLi9zcmMvbGliL3NjcmFwZS1jYXJkLWJhbGFuY2UnO1xuXG50eXBlIENhcHR1cmVSZXN1bHQgPVxuICB8IHtcbiAgICAgIG9rOiB0cnVlO1xuICAgICAgaHRtbDogc3RyaW5nO1xuICAgICAgc291cmNlVXJsOiBzdHJpbmc7XG4gICAgICBjYXB0dXJlZEF0OiBzdHJpbmc7XG4gICAgICB0cmFuc2FjdGlvbkNvdW50OiBudW1iZXI7XG4gICAgICB0cmFuc2FjdGlvbnM6IFNjcmFwZWRDYXJkVHJhbnNhY3Rpb25bXTtcbiAgICAgIGNhcmRCYWxhbmNlPzogeyBhbW91bnQ6IHN0cmluZzsgY3VycmVuY3k6IHN0cmluZyB9O1xuICAgIH1cbiAgfCB7XG4gICAgICBvazogZmFsc2U7XG4gICAgICBlcnJvcjogc3RyaW5nO1xuICAgICAgc291cmNlVXJsPzogc3RyaW5nO1xuICAgICAgY2FwdHVyZWRBdDogc3RyaW5nO1xuICAgIH07XG5cbnR5cGUgU2NyYXBlTWVzc2FnZSA9IHsgdHlwZTogJ1NDUkFQRV9DQVJEX0hUTUwnIH07XG5cbmNvbnN0IExPR19QUkVGSVggPSAnW01ldGFTcGVuZCBDYXJkIENhcHR1cmVdJztcblxuZXhwb3J0IGNvbnN0IGNvbmZpZzogUGxhc21vQ1NDb25maWcgPSB7XG4gIG1hdGNoZXM6IFsnaHR0cHM6Ly9wb3J0Zm9saW8ubWV0YW1hc2suaW8vKicsICdodHRwczovL2NhcmQubWV0YW1hc2suaW8vKiddLFxuICBydW5fYXQ6ICdkb2N1bWVudF9pZGxlJyxcbn07XG5cbmZ1bmN0aW9uIGNsZWFuVGV4dCh2YWx1ZTogc3RyaW5nIHwgbnVsbCB8IHVuZGVmaW5lZCk6IHN0cmluZyB7XG5cbiAgcmV0dXJuICh2YWx1ZSA/PyAnJykucmVwbGFjZSgvXFxzKy9nLCAnICcpLnRyaW0oKTtcblxuXG59XG5cbmZ1bmN0aW9uIHRleHRGcm9tKHJvb3Q6IEVsZW1lbnQsIHNlbGVjdG9yOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gY2xlYW5UZXh0KHJvb3QucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik/LnRleHRDb250ZW50KTtcblxuXG59XG5cbmZ1bmN0aW9uIGRldGFpbFZhbHVlKHJvdzogRWxlbWVudCwgbGFiZWw6IHN0cmluZyk6IHN0cmluZyB8IG51bGwge1xuICBjb25zdCBkZXRhaWxSb3dzID0gQXJyYXkuZnJvbShyb3cucXVlcnlTZWxlY3RvckFsbCgnLnRyYW5zYWN0aW9uUm93X19kZXRhaWxzX3Jvd19jb250YWluZXInKSk7XG4gIGNvbnN0IG1hdGNoID0gZGV0YWlsUm93cy5maW5kKChpdGVtKSA9PiBjbGVhblRleHQoaXRlbS5xdWVyeVNlbGVjdG9yKCdwOmZpcnN0LWNoaWxkJyk/LnRleHRDb250ZW50KSA9PT0gbGFiZWwpO1xuXG4gIGlmICghbWF0Y2gpIHJldHVybiBudWxsO1xuXG4gIHJldHVybiBjbGVhblRleHQobWF0Y2gucXVlcnlTZWxlY3RvcigncDpsYXN0LWNoaWxkJyk/LnRleHRDb250ZW50KSB8fCBudWxsO1xuXG5cbn1cblxuZnVuY3Rpb24gZnVuZGluZ1ZhbHVlKHJvdzogRWxlbWVudCwgbGFiZWw6IHN0cmluZyk6IHN0cmluZyB8IG51bGwge1xuXG5cbiAgY29uc3QgZnVuZGluZ1Jvd3MgPSBBcnJheS5mcm9tKHJvdy5xdWVyeVNlbGVjdG9yQWxsKCcudHJhbnNhY3Rpb25Sb3dfX2RldGFpbHNfZnVuZGluZ19yb3cnKSk7XG4gIGNvbnN0IG1hdGNoID0gZnVuZGluZ1Jvd3MuZmluZCgoaXRlbSkgPT4gY2xlYW5UZXh0KGl0ZW0ucXVlcnlTZWxlY3RvcigncDpmaXJzdC1jaGlsZCcpPy50ZXh0Q29udGVudCkgPT09IGxhYmVsKTtcblxuICBpZiAoIW1hdGNoKSByZXR1cm4gbnVsbDtcblxuICByZXR1cm4gY2xlYW5UZXh0KG1hdGNoLnF1ZXJ5U2VsZWN0b3IoJ3A6bGFzdC1jaGlsZCcpPy50ZXh0Q29udGVudCkgfHwgbnVsbDtcblxuXG59XG5cblxuZnVuY3Rpb24gcGFyc2VUcmFuc2FjdGlvbihyb3c6IEVsZW1lbnQpOiBTY3JhcGVkQ2FyZFRyYW5zYWN0aW9uIHtcblxuXG4gIHJldHVybiB7XG5cblxuICAgIG1lcmNoYW50OiB0ZXh0RnJvbShyb3csICcudHJhbnNhY3Rpb25Sb3dfX2RldGFpbHNfcm93X21lcmNoYW50JyksXG5cblxuXG4gICAgdGltZTogdGV4dEZyb20ocm93LCAnLnRyYW5zYWN0aW9uUm93X19zdW1tYXJ5X3RpdGxlX2NvbnRhaW5lciBwOmxhc3QtY2hpbGQnKSxcblxuICAgIGFtb3VudDogdGV4dEZyb20ocm93LCAnLnRyYW5zYWN0aW9uUm93X19zdW1tYXJ5X2NvbnRhaW5lciA+IGRpdjpsYXN0LWNoaWxkIHA6Zmlyc3QtY2hpbGQnKSxcblxuICAgIHR5cGU6IHRleHRGcm9tKHJvdywgJy50cmFuc2FjdGlvblJvd19fc3VtbWFyeV9jb250YWluZXIgPiBkaXY6bGFzdC1jaGlsZCBwOmxhc3QtY2hpbGQnKSxcblxuXG5cbiAgICBzdGF0dXM6IGRldGFpbFZhbHVlKHJvdywgJ1N0YXR1cycpLFxuXG5cblxuICAgIHRyYW5zYWN0aW9uSWQ6IGRldGFpbFZhbHVlKHJvdywgJ1RyYW5zYWN0aW9uIElEJyksXG5cbiAgICBkYXRlOiBkZXRhaWxWYWx1ZShyb3csICdEYXRlJyksXG5cbiAgICBjYXJkUGFuOiBkZXRhaWxWYWx1ZShyb3csICdDYXJkIFBBTicpLFxuXG4gICAgc291cmNlOiBmdW5kaW5nVmFsdWUocm93LCAnU291cmNlJyksXG5cbiAgICBzcGVudDogZnVuZGluZ1ZhbHVlKHJvdywgJ1NwZW50JyksXG5cbiAgICBnYXNGZWU6IGZ1bmRpbmdWYWx1ZShyb3csICdHYXMgZmVlJyksXG5cbiAgfTtcblxuXG59XG5cblxuXG5cbmZ1bmN0aW9uIHNjcmFwZVRyYW5zYWN0aW9ucygpOiBDYXB0dXJlUmVzdWx0IHtcbiAgY29uc3QgY2FwdHVyZWRBdCA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgY29uc29sZS5sb2coTE9HX1BSRUZJWCwgJ3NjcmFwaW5nIHRyYW5zYWN0aW9ucyBmcm9tIHBhZ2UnLCBsb2NhdGlvbi5ocmVmKTtcblxuICB0cnkge1xuICAgIGNvbnN0IGxpc3QgPVxuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnRyYW5zYWN0aW9uTGlzdF9fbWFpbl9jb250YWluZXInKSA/P1xuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignbWFpbicpID8/XG4gICAgICBkb2N1bWVudC5ib2R5O1xuXG4gICAgaWYgKCFsaXN0KSB7XG5cblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgb2s6IGZhbHNlLFxuICAgICAgICBlcnJvcjogJ0NvdWxkIG5vdCBmaW5kIGRvY3VtZW50IGJvZHkuJyxcblxuICAgICAgICBzb3VyY2VVcmw6IGxvY2F0aW9uLmhyZWYsXG5cbiAgICAgICAgY2FwdHVyZWRBdCxcblxuICAgICAgfTtcblxuXG4gICAgfVxuXG5cblxuICAgIGNvbnN0IHJvd3MgPSBBcnJheS5mcm9tKGxpc3QucXVlcnlTZWxlY3RvckFsbCgnLnRyYW5zYWN0aW9uUm93X19hY2NvcmRpb25fbWFpbl9jb250YWluZXInKSk7XG5cbiAgICBjb25zdCB0cmFuc2FjdGlvbnMgPSByb3dzLm1hcChwYXJzZVRyYW5zYWN0aW9uKTtcblxuICAgIGNvbnN0IGNhcmRTbmFwID0gc2NyYXBlQ2FyZEJhbGFuY2VTbmFwc2hvdCgpO1xuXG4gICAgY29uc3QgcmVzdWx0ID0ge1xuICAgICAgb2s6IHRydWUsXG4gICAgICBodG1sOiAnJyxcbiAgICAgIHNvdXJjZVVybDogbG9jYXRpb24uaHJlZixcbiAgICAgIGNhcHR1cmVkQXQsXG4gICAgICB0cmFuc2FjdGlvbkNvdW50OiB0cmFuc2FjdGlvbnMubGVuZ3RoLFxuICAgICAgdHJhbnNhY3Rpb25zLFxuICAgICAgLi4uKGNhcmRTbmFwID8geyBjYXJkQmFsYW5jZTogY2FyZFNuYXAgfSA6IHt9KSxcbiAgICB9IHNhdGlzZmllcyBDYXB0dXJlUmVzdWx0O1xuXG5cblxuICAgIGNvbnNvbGUubG9nKExPR19QUkVGSVgsICdzY3JhcGUgY29tcGxldGUnLCB7XG4gICAgICB0cmFuc2FjdGlvbkNvdW50OiByZXN1bHQudHJhbnNhY3Rpb25Db3VudCxcbiAgICAgIGZpcnN0VHJhbnNhY3Rpb246IHJlc3VsdC50cmFuc2FjdGlvbnNbMF0gPz8gbnVsbCxcbiAgICB9KTtcblxuXG5cbiAgICByZXR1cm4gcmVzdWx0O1xuXG5cbiAgfSBjYXRjaCAoZXJyb3IpIHtcblxuICAgIGNvbnNvbGUuZXJyb3IoTE9HX1BSRUZJWCwgJ3NjcmFwZSBmYWlsZWQnLCBlcnJvcik7XG5cbiAgICByZXR1cm4ge1xuICAgICAgb2s6IGZhbHNlLFxuICAgICAgZXJyb3I6IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKSxcbiAgICAgIHNvdXJjZVVybDogbG9jYXRpb24uaHJlZixcblxuICAgICAgY2FwdHVyZWRBdCxcblxuICAgIH07XG5cblxuICB9XG5cblxuXG59XG5cblxuXG5jaHJvbWUucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoKG1lc3NhZ2U6IFNjcmFwZU1lc3NhZ2UsIF9zZW5kZXIsIHNlbmRSZXNwb25zZSkgPT4ge1xuICBpZiAobWVzc2FnZT8udHlwZSAhPT0gJ1NDUkFQRV9DQVJEX0hUTUwnKSByZXR1cm4gZmFsc2U7XG5cbiAgY29uc29sZS5sb2coTE9HX1BSRUZJWCwgJ3JlY2VpdmVkIHNjcmFwZSByZXF1ZXN0IGZyb20gYmFja2dyb3VuZCB3b3JrZXInKTtcblxuXG4gIHNlbmRSZXNwb25zZShzY3JhcGVUcmFuc2FjdGlvbnMoKSk7XG5cblxuICByZXR1cm4gZmFsc2U7XG5cblxufSk7XG4iLCIvKipcbiAqIFJlYWRzIE1ldGFNYXNrIFBvcnRmb2xpbyBjYXJkIHByZXZpZXcgKGA2ODUuODRgICsgYG1VU0RgKSBmcm9tIHRoZSBTVkcgYmxvY2suXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzY3JhcGVDYXJkQmFsYW5jZVNuYXBzaG90KGRvYzogRG9jdW1lbnQgPSBkb2N1bWVudCk6IHtcbiAgYW1vdW50OiBzdHJpbmc7XG4gIGN1cnJlbmN5OiBzdHJpbmc7XG59IHwgbnVsbCB7XG4gIGNvbnN0IGNvbnRhaW5lciA9IGRvYy5xdWVyeVNlbGVjdG9yKCcuY2FyZEltYWdlcnlfX2NhcmRfc3ZnX2NvbnRhaW5lcicpO1xuICBpZiAoIWNvbnRhaW5lcikgcmV0dXJuIG51bGw7XG5cbiAgY29uc3QgdGV4dEVscyA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKCdzdmcgdGV4dCcpO1xuICBmb3IgKGNvbnN0IHRleHRFbCBvZiB0ZXh0RWxzKSB7XG4gICAgY29uc3QgdHNwYW5zID0gdGV4dEVsLnF1ZXJ5U2VsZWN0b3JBbGwoJ3RzcGFuJyk7XG4gICAgaWYgKHRzcGFucy5sZW5ndGggPT09IDApIGNvbnRpbnVlO1xuXG4gICAgbGV0IGFtb3VudCA9ICcnO1xuICAgIGZvciAoY29uc3Qgbm9kZSBvZiB0ZXh0RWwuY2hpbGROb2Rlcykge1xuICAgICAgaWYgKG5vZGUubm9kZVR5cGUgPT09IE5vZGUuVEVYVF9OT0RFKSB7XG4gICAgICAgIGFtb3VudCArPSAobm9kZS50ZXh0Q29udGVudCA/PyAnJykudHJpbSgpO1xuICAgICAgfVxuICAgIH1cbiAgICBhbW91bnQgPSBhbW91bnQucmVwbGFjZSgvXFxzL2csICcnKTtcbiAgICBjb25zdCBjdXJyZW5jeSA9ICh0c3BhbnNbdHNwYW5zLmxlbmd0aCAtIDFdPy50ZXh0Q29udGVudCA/PyAnJykudHJpbSgpLnJlcGxhY2UoL1xccy9nLCAnJyk7XG4gICAgaWYgKCFhbW91bnQgfHwgIWN1cnJlbmN5KSBjb250aW51ZTtcbiAgICBjb25zdCBub3JtYWxpemVkQW1vdW50ID0gYW1vdW50LnJlcGxhY2UoLywvZywgJycpO1xuICAgIGlmICghL15cXGQrKFxcLlxcZCspPyQvLnRlc3Qobm9ybWFsaXplZEFtb3VudCkpIGNvbnRpbnVlO1xuXG4gICAgcmV0dXJuIHsgYW1vdW50OiBub3JtYWxpemVkQW1vdW50LCBjdXJyZW5jeSB9O1xuICB9XG5cbiAgcmV0dXJuIG51bGw7XG59XG4iLCJleHBvcnRzLmludGVyb3BEZWZhdWx0ID0gZnVuY3Rpb24gKGEpIHtcbiAgcmV0dXJuIGEgJiYgYS5fX2VzTW9kdWxlID8gYSA6IHtkZWZhdWx0OiBhfTtcbn07XG5cbmV4cG9ydHMuZGVmaW5lSW50ZXJvcEZsYWcgPSBmdW5jdGlvbiAoYSkge1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoYSwgJ19fZXNNb2R1bGUnLCB7dmFsdWU6IHRydWV9KTtcbn07XG5cbmV4cG9ydHMuZXhwb3J0QWxsID0gZnVuY3Rpb24gKHNvdXJjZSwgZGVzdCkge1xuICBPYmplY3Qua2V5cyhzb3VyY2UpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgIGlmIChrZXkgPT09ICdkZWZhdWx0JyB8fCBrZXkgPT09ICdfX2VzTW9kdWxlJyB8fCBkZXN0Lmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZGVzdCwga2V5LCB7XG4gICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBzb3VyY2Vba2V5XTtcbiAgICAgIH0sXG4gICAgfSk7XG4gIH0pO1xuXG4gIHJldHVybiBkZXN0O1xufTtcblxuZXhwb3J0cy5leHBvcnQgPSBmdW5jdGlvbiAoZGVzdCwgZGVzdE5hbWUsIGdldCkge1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZGVzdCwgZGVzdE5hbWUsIHtcbiAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgIGdldDogZ2V0LFxuICB9KTtcbn07XG4iXSwibmFtZXMiOltdLCJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGVudC43YTJlNjllZi5qcy5tYXAifQ==
 globalThis.define=__define;  })(globalThis.define);