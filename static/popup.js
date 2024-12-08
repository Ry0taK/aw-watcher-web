"use strict";

function renderContents() {
  chrome.storage.local.get(["lastSync", "lastSyncSuccess", "testing", "baseURL", "enabled", "domainOnly"], function (obj) {
    console.log('renderContents', obj);
    // Enabled checkbox
    let enabledCheckbox = document.getElementById('status-enabled-checkbox');
    enabledCheckbox.checked = obj.enabled;

    // Consent Button
    let showConsentBtn = document.getElementById('status-consent-btn');
    chrome.storage.local.get("consentGiven", (obj) => {
      console.log('consentGiven: ', obj.consentGiven)
      if (obj.consentGiven) {
        enabledCheckbox.removeAttribute('disabled');
        showConsentBtn.style.display = 'none';
      } else {
        enabledCheckbox.setAttribute('disabled', '');
        showConsentBtn.style.display = 'inline-block';
      }
    });

    // Connected
    let connectedColor = obj.lastSyncSuccess ? "#00AA00" : "#FF0000";
    let connectedCharacter = obj.lastSyncSuccess ? "✔" : "✖";
    let element = document.getElementById('status-connected-icon');
    element.innerHTML = connectedCharacter;
    element.style = "color: " + connectedColor + ";";

    // Testing
    if (obj.testing == true) {
      let element = document.getElementById('testing-notice');
      element.innerHTML = "Extension is running in testing mode";
      element.style = "color: #F60; font-size: 1.2em;";
    }

    // Last sync
    let lastSyncString = obj.lastSync ? new Date(obj.lastSync).toLocaleString() : "never";
    document.getElementById('status-last-sync').innerHTML = lastSyncString;

    // Server address
    const parsedBaseURL = new URL(obj.baseURL);
    const hostnameElement = document.getElementById('settings-hostname');
    hostnameElement.value = parsedBaseURL.hostname;
    const portElement = document.getElementById('settings-port');
    portElement.value = parsedBaseURL.port;

    // Domain only setting
    const domainOnlyCheckbox = document.getElementById('settings-domain-only');
    domainOnlyCheckbox.checked = obj.domainOnly;

    // Set webUI button link
    document.getElementById('webui-link').href = obj.baseURL;
  });
}

async function saveSettings(enabled, hostname, port, domainOnly) {
  const baseURL = `http://${hostname}:${port}`;
  await chrome.runtime.sendMessage({ enabled, baseURL, domainOnly });
}

function domListeners() {
  const enabledCheckbox = document.getElementById('status-enabled-checkbox');
  const hostnameElement = document.getElementById('settings-hostname');
  const portElement = document.getElementById('settings-port');
  const domainOnlyCheckbox = document.getElementById('settings-domain-only');
  // Save button
  const saveButton = document.getElementById('settings-save-btn');
  saveButton.addEventListener('click', () => {
    const enabled = enabledCheckbox.checked;
    const hostname = hostnameElement.value;
    const port = portElement.value;
    const domainOnly = domainOnlyCheckbox.checked;
    saveSettings(enabled, hostname, port, domainOnly);
  });

  let consent_button = document.getElementById('status-consent-btn');
  consent_button.addEventListener('click', () => {
    const url = chrome.runtime.getURL("../static/consent.html");
    chrome.windows.create({ url, type: "popup", height: 550, width: 416, });
  });
}

document.addEventListener('DOMContentLoaded', function () {
  renderContents();
  domListeners();
})

