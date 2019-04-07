(function () {
'use strict';

const API_KEY = 'm782368432-b180ca0c6525dff383603918',
      API_URL = 'https://api.uptimerobot.com/v2/getMonitors',
      POLL_TIME_IN_SECONDS = 900;

const statusLabelType = {
    INFO: 0,
    SUCCESS: 1,
    ERROR: 2
};

const serverStatus = {
    PAUSED: 0,
    NOT_CHECKED: 1,
    UP: 2,
    SEEMS_DOWN: 8,
    DOWN: 9
};

function setStatusLabel(msg, type) {
    var statusLabel = document.getElementById('tttstatus_label');

    statusLabel.innerText = msg;

    if (typeof type === 'undefined') {
        type = statusLabel = statusLabelType.INFO;
    }

    if (type === statusLabelType.SUCCESS) {
        statusLabel.className = 'status-success';
    } else if (type === statusLabelType.INFO) {
        statusLabel.className = 'status-info';
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
        var monStatus;
        if (xhr.response) {
            if (xhr.response.stat === 'ok') {
                monStatus = xhr.response.monitors[0].status;

                switch (monStatus) {
                case serverStatus.UP:
                    setStatusLabel('Online', statusLabelType.SUCCESS);
                    break;
                case serverStatus.NOT_CHECKED:
                    setStatusLabel('Server is paused.', statusLabelType.ERROR);
                    break;
                case serverStatus.NOT_CHECKED:
                    setStatusLabel('Server status not checked by API yet.',
                                   statusLabelType.INFO);
                    break;
                case serverStatus.SEEMS_DOWN:
                    setStatusLabel('Server seems down.', statusLabelType.ERROR);
                    break;
                case serverStatus.DOWN:
                    setStatusLabel('Offline', statusLabelType.ERROR);
                    break;
                default:
                    setStatusLabel('Unknown server status code: ' + monStatus);
                }
            } else if ('error' in xhr.response) {
                setStatusLabel('Request error: ' + JSON.stringify(xhr.response.error),
                               statusLabelType.ERROR);
            } else {
                setStatusLabel('No record returned for server!', statusLabelType.ERROR);
            }
        } else {
            setStatusLabel(getErrorMessage(xhr), statusLabelType.ERROR);
        }
        if (typeof callback === 'function') {
            callback();
        }
    };
    xhr.onerror = function () {
        setStatusLabel(getErrorMessage(xhr), statusLabelType.ERROR);
        if (typeof callback === 'function') {
            callback();
        }
    };
    xhr.send(stringify({api_key: API_KEY, format: 'json', logs: '0'}));
}

function pollServerStatus() {
    setStatusLabel('Checking status...', statusLabelType.INFO);
    checkServerStatus(function () {
        window.setTimeout(pollServerStatus, POLL_TIME_IN_SECONDS * 1000);
    });
}

window.addEventListener('DOMContentLoaded', function (e) {
    pollServerStatus();
}, false);

})();