function getSession(get_session) {
    get_session.open("GET", apiURL + "/1.0/sessions", true);
    get_session.withCredentials = true;
    get_session.send();
}