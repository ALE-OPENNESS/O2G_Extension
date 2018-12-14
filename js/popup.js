var browser = browser || chrome;

var port = chrome.runtime.connect({
    name: "Sample Communication"
});

port.postMessage(JSON.stringify({
    action: "status"
}));

port.onMessage.addListener(function(msg) {
    msg = JSON.parse(msg);
    switch (msg.action) {
        case "status":
            if (msg.api)
                document.getElementById("apiNewURL").value = msg.api
            if (msg.connected.status) {
                show.call({content: "block", shortcut: "block"});
            } else {
                if (msg.api) {
                    show.call({login: "block", ErrorMessage: msg.connected.error, loginError: "block"});
                } else {
                    show.call({api: "block"});
                }
            }
            break;
        case "api":
            show.call({api: "block"})
            break;
        case "logged":
            show.call({content: "block", shortcut: "block"});
            break;
        default:
            break;
    }
});

document.getElementById("logout").addEventListener("click", function () {
    port.postMessage(JSON.stringify({
        action: "logout"
    }));
    show.call({login: "block"})
});

document.getElementById("submitLogin").addEventListener("click", function () {
    show.call({loading: "block"})
    port.postMessage(JSON.stringify({
        action: "login",
        username: document.getElementById("username").value,
        password: document.getElementById("password").value,
    }));
    document.getElementById("password").value = "";
    document.getElementById("username").value = "";

    let i = 0;
    while (i < 10 && document.getElementById("content").style.display == "none") {
        i++;
        setTimeout(function() {
            port.postMessage(JSON.stringify({
                action: "logged"
            }));
        }, 1000);
    }

    if (i == 10) {
        port.postMessage(JSON.stringify({
            action: "status"
        }));
    }
});

document.getElementById("submitApi").addEventListener("click", function () {
    port.postMessage(JSON.stringify({
        action: "api",
        api: document.getElementById("apiNewURL").value
    }));
    show.call({login: "block"});
});

document.getElementById("changeURLapi").addEventListener("click", function () {
    show.call({api: "block"});
});

document.querySelector('#call').addEventListener('click', function() {
    port.postMessage(JSON.stringify({
        action: "call",
        deviceNbr: document.querySelector("#deviceNumber").value,
        callNbr: document.querySelector("#callerNumber").value
    }));
}, false);

function show() {
    document.getElementById("api").style.display = (this.api === undefined ? "none" : this.api);
    document.getElementById("login").style.display = (this.login === undefined ? "none" : this.login);
    document.getElementById("loading").style.display = (this.loading === undefined ? "none" : this.loading);
    document.getElementById("content").style.display = (this.content === undefined ? "none" : this.content);
    document.getElementById("shortcut").style.display = (this.shortcut === undefined ? "none" : this.shortcut);
    document.getElementById("loginError").style.display = (this.loginError === undefined ? "none" : this.loginError);
    document.getElementById("loginError").innerHTML =  (this.ErrorMessage === undefined ? "" : this.ErrorMessage);
}