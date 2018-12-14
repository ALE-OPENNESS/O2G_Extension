function getAuthentitcate(xhttp) {
    xhttp.open("GET", res.key.api + "/authenticate?version=1.0", true);
    xhttp.withCredentials = true;
    xhttp.setRequestHeader ("Authorization", "Basic " + btoa(res.key.username + ":" + res.key.password));
    xhttp.send();
    return (xhttp);
}