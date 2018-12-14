function createSession() {
    var create_session = new XMLHttpRequest();
    create_session.open("POST", apiURL + "/1.0/sessions", true);
    create_session.withCredentials = true;
    create_session.setRequestHeader("Content-Type", "application/json");
    create_session.send(JSON.stringify({applicationName : res.key.username}));
}