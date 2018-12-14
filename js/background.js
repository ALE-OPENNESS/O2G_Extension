var browser = browser || chrome
var api;
var username;
var cakeNotification = "cake-notification"

var connected = {
    error: "",
    status: false,
    setStatus: function (status, error = "") {
        this.error = error;
        this.status = status;
    },
    setError: function (error) {
        this.error = error;
    }
};

browser.storage.sync.get(function (res) {
    if (res.key != undefined) {
        if (res.key.api != undefined) {
            api = res.key.api;
            username = res.key.username;
            connect();
        }
    }
})

browser.runtime.onConnect.addListener(function(port) {
    port.onMessage.addListener(function(msg) {
        msg = JSON.parse(msg);
        switch (msg.action) {
            case "login":
                setLogin(msg.username, msg.password);
                break;
            case "logout":
                logout();
                break;
            case "logged":
                if (connected.status){                    
                    port.postMessage(JSON.stringify({
                        action: "status",
                        connected: connected,
                        api: api
                    })); 
                }                   
                break;
            case "api":
                api = msg.api;
                connected.setError = "";
                browser.storage.sync.set({api: msg.api});
                break; 
            case "call":
                console.log(msg);
                call(msg);
                break;   
            case "status":
                port.postMessage(JSON.stringify({
                    action: "status",
                    connected: connected,
                    api: api
                }));
                break;      
            default:
                break;
        }
    });
})

function call(msg) {
    if (!isNaN(msg.callNbr) && !isNaN(msg.deviceNbr)) {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", api + "/1.0/telephony/basicCall", true);
        xhr.withCredentials = true;
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(JSON.stringify({
            "deviceId" : msg.deviceNbr, 
            "callee" : msg.callNbr, 
            "autoAnswer" : true
        }));

        xhr.onload = function () {
            console.log(xhr.responseText);
            if (xhr.status >= 200 && xhr.status <= 227) {
                browser.notifications.create(cakeNotification, {
                    "type": "basic",
                    "iconUrl": browser.runtime.getURL("icons/icon-256.png"),
                    "title": "New call ...",
                    "message": "Your trying to call : " + msg.callNbr
                });
            } else {
                browser.notifications.create(cakeNotification, {
                    "type": "basic",
                    "iconUrl": browser.runtime.getURL("icons/icon-256.png"),
                    "title": "New call ...",
                    "message": "There is a problem with this call : " + msg.callNbr
                });
            }
        };

        browser.notifications.create(cakeNotification, {
            "type": "basic",
            "iconUrl": browser.runtime.getURL("icons/icon-256.png"),
            "title": "New call ...",
            "message": "Your trying to call : " + msg.callNbr
        });

        setTimeout(function() {
            browser.notifications.clear(cakeNotification);
        }, 10000);
    } else {
        browser.notifications.create(cakeNotification, {
            "type": "basic",
            "iconUrl": browser.runtime.getURL("icons/icon-256.png"),
            "title": "Problem ...",
            "message": "You try to call a string :("
        });
    } 
}

function logout() {
    let xhr = new XMLHttpRequest();
    xhr.open("DELETE", api + "/1.0/sessions", true);
    xhr.withCredentials = true;
    xhr.send();
    xhr.onload = function () {
        browser.storage.sync.clear();
        connected.setStatus(false);
    };      
}

function getAuthentication(username, password) {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", api + "/authenticate?version=1.0", true);
    xhr.withCredentials = true;
    xhr.setRequestHeader ("Authorization", "Basic " + btoa(username + ":" + password));
    xhr.send();
    xhr.onload = function () {
        if (xhr.status == 200) {
            getSession(username);
            connected.setStatus(true);
        } else {
            connected.setStatus(false, "Username or password error");
        }
    };      

    xhr.onerror = function () {
        connected.setStatus(false, "API Server unreachable");
    };
}

function createSession(username) {
    let xhr = new XMLHttpRequest();
    xhr.open("POST", api + "/1.0/sessions", true);
    xhr.withCredentials = true;
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify({"applicationName" : username}));
    xhr.onload = function () {
/*         if (!(xhr.status >= 200 || xhr.status <= 227))
            connected.setError("Can't create session : " + xhr.status); */
    }
    xhr.error = function () {
        connected.setError("Error in CreateSession");
    }
}

function getSession(username) {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", api + "/1.0/sessions", true);
    xhr.withCredentials = true;
    xhr.send();
    xhr.onload = function () {
        if (xhr.status >= 200 || xhr.status <= 227)
            createSession(username);
        else 
            connected.setError("Can't get session : " + xhr.status);            
    }
    xhr.error = function () {
        connected.setError("Error in CreateSession");
    }
}

function setLogin(username, password) {
    var data = {
        username: username,
        password: password,
        api: api
    }
    browser.storage.sync.set({key: data});
    connect();
}

function connect() {
    browser.storage.sync.get( function (res) {
        if (res.key != "undefined") {
            if (res.key.username != "undefined") {
                api = res.key.api;
                (getAuthentication(res.key.username, res.key.password) ? username = res.key.username : {})
            } else {
                connected.setStatus(false);
            }
        } else {
            connected.setStatus(false);
        }
    });
};

browser.contextMenus.create({
    "title": "Click to call selection",
    "contexts": ["selection"],
    "id": "call",
});


browser.contextMenus.onClicked.addListener(function(info, tab) {
    switch (info.menuItemId) {
        case "call":
        console.log(info.selectionText);
        var retVal = prompt("Call : " + info.selectionText + " : ", "Enter your number");
        call({deviceNbr: retVal, callNbr: info.selectionText});
        break;
    }
})