(function () {
'use strict';

const API_KEY = 'm782349888-5fa54ff2def9486951528d80',
      API_URL = 'https://api.uptimerobot.com/v2/getMonitors',
      POLL_TIME_IN_SECONDS = 30;

const statusType = {
    INFO: 0,
    SUCCESS: 1,
    ERROR: 2
}

function setStatusLabel(msg, type) {
    var statusLabel = document.getElementById('status_label');

    statusLabel.innerText = msg;
    if (type === statusType.INFO) {
        statusLabel.className = 'status-info';
    } else if (type === statusType.SUCCESS) {
        statusLabel.className = 'status-success';
    } else {
        statusLabel.className = 'status-error';
    }
}

function stringify(params) {
    return Object.keys(params).map(function (key) {
        return encodeURIComponent(key) + '=' + encodeURIComponent(params[key])
    }).join('&');
}

function getErrorMessage(xhrObj) {
    var errorMsg = 'Request failed: ';

    if (xhrObj.status) {
        errorMsg += xhrObj.status + ' ' + xhrObj.statusText;
    } else {
        errorMsg += 'connection error';
    }
    return errorMsg;
}

function checkServerStatus(callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', API_URL, true);

    xhr.responseType = 'json';
    xhr.setRequestHeader('content-type', 'application/x-www-form-urlencoded');

    xhr.onload = function () {
        if (xhr.response) {
            if (xhr.response.stat === 'ok') {
                setStatusLabel("Online", statusType.SUCCESS);
            } else if ('error' in xhr.response) {
                setStatusLabel('Request error: ' + JSON.stringify(xhr.response.error),
                               statusType.ERROR);
            } else {
                setStatusLabel("Offline", statusType.ERROR);
            }
        } else {
            setStatusLabel(getErrorMessage(xhr), statusType.ERROR);
        }
        if (typeof onRecoveryAttempt === 'function') {
            callback();
        }
    };
    xhr.onerror = function () {
        setStatusLabel(getErrorMessage(xhr), statusType.ERROR);
        if (typeof onRecoveryAttempt === 'function') {
            callback();
        }
    };
    xhr.send(stringify({api_key: API_KEY, format: 'json', logs: '0'}));
}

function pollServerStatus() {
    setStatusLabel('Checking status...', statusType.INFO);
    checkServerStatus(function () {
        setTimeout(pollServerStatus, POLL_TIME_IN_SECONDS * 1000);
    });
}

window.addEventListener('DOMContentLoaded', function (e) {
    pollServerStatus();
}, false);

})();