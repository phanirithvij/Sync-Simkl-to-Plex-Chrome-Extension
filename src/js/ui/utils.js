const setCssVar = (property, value) => {
  return document.body.style.setProperty(property, value);
  // return document.querySelector(':root').style.setProperty(property, value);
};

const getCssVar = (property) => {
  return document.body.style.getPropertyValue(property);
  // return document.querySelector(':root').style.getPropertyValue(property);
};

const removeWindowHash = () => {
  // https://stackoverflow.com/a/5298684
  window.history.replaceState(
    "",
    document.title,
    window.location.pathname + window.location.search
  );
};

const debounce = (func, timeout = 400) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
};

// string prototype to make it convinient
String.prototype.originUrl = function () {
  return new URL(this).origin + "/";
};

const removeItemOnce = (arr, value) => {
  var index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
};

const inPopup = () => {
  // know if the current view is a popup or a full tab
  // https://stackoverflow.com/a/8921196
  let win = chrome.extension.getViews({
    type: chrome.tabs.WindowType.POPUP, // "popup"
  })[0];
  return win !== undefined && win == window;
};

/*
  https://stackoverflow.com/a/54927497
  https://omahaproxy.appspot.com/
  https://commondatastorage.googleapis.com/chromium-browser-snapshots/index.html?prefix=Win_x64/
  https://commondatastorage.googleapis.com/chromium-browser-snapshots/index.html?prefix=Win_x64/953512/
  https://chromium.googlesource.com/chromium/src/+log/99.0.4782.1..99.0.4783.0?pretty=fuller&n=10000
  https://chromium.googlesource.com/chromium/src/+refs
  https://chromereleases.googleblog.com/

  Any version >= 99.0.4783.0 will not have this bug(in chromium)
  `chrome.tabs.update` is not working properly when handling
  popup permission flow on stable chrome versions currently this is a workaround
  tried passing current `tabID` to `oauthStart` to use it on
  `chrome.tabs.update(tabId)` but the bug can be reproduced
  works fine on chrome beta checked on version 99.0.4844.45 (latest beta)
  didn't work on 98.0.4758.102 (latest stable)
    99.0.4783.0     // works
    99.0.4782.1     // doesn't work
    98.0.4758.103+  // no downloads available
    98.0.4758.102   // Does not work
  Can use string compare as chrome follows semvers
*/
const chromeTabsUpdateBugVerCheck = () =>
  getChromeVersion().fullStr < "99.0.4783.0";

// Alerts
// https://codepen.io/quic5/pen/wWPmKO
// https://eu.simkl.in/css/tv/style_var.css?v126 search for #Alert7

const iosAlert = async function () {
  try {
    var $alert = document.querySelector("#Alert");
    $alert.parentElement.removeChild($alert);
  } catch (error) {}

  var $alert = document.createElement("span");
  $alert.innerHTML = `
    <div id="Alert">
      <div class="alert-container">
        <div class="alert-title">${arguments[1] ? arguments[1] : ""}</div>
        <div class="alert-message">${arguments[0]}</div>
        <div class="alert-actions">
          <button class="alert-action-item">OK</button>
        </div>
      </div>
    </div>
    `;
  document.querySelector("body").appendChild($alert);
  return new Promise(function (resolve) {
    // https://stackoverflow.com/a/35718902
    document
      .querySelector("#Alert button")
      .addEventListener("click", function okClickListener() {
        document
          .querySelector("#Alert button")
          .removeEventListener("click", okClickListener);
        $alert.parentElement.removeChild($alert);
        resolve();
      });
  });
};

// unused, ignore this
const isBraveBrowser = async () =>
  (navigator.brave && (await navigator.brave.isBrave())) || false;

const getChromeVersion = () => {
  // https://stackoverflow.com/a/47454708
  var pieces = navigator.userAgent.match(
    /Chrom(?:e|ium)\/([0-9]+)\.([0-9]+)\.([0-9]+)\.([0-9]+)/
  );
  if (pieces == null || pieces.length != 5) {
    return undefined;
  }
  pieces = pieces.map((piece) => parseInt(piece, 10));
  pieces.shift();
  return {
    major: pieces[0],
    minor: pieces[1],
    build: pieces[2],
    patch: pieces[3],
    fullStr: pieces.join("."),
  };
};

let _ver = getChromeVersion();
const BrowserVersion = `${_ver.major}.${_ver.minor}`;
const BrowserVersionFull = _ver.fullStr;
const OSName = navigator.userAgentData.platform;
// https://stackoverflow.com/a/25603630
const OSLanguage = navigator.languages
  ? navigator.languages[1]
  : navigator.language
  ? navigator.language.split("-")[0]
  : navigator.userLanguage
  ? navigator.userLanguage.split("-")[0]
  : "en";

const setBrowserInfo = () => {
  chrome.storage.local.set(
    {
      browserInfo: {
        browserVersion: BrowserVersion,
        browserName: "Chrome", // as of now only a chrome extension
        osName: OSName,
        osLanguage: OSLanguage,
      },
    },
    async () => {
      console.debug(
        "setBrowserInfo",
        await chrome.storage.local.get("browserInfo")
      );
    }
  );
};

setBrowserInfo();
