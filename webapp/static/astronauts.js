window.onload = initialize;
let astronautsByName;
let astronautsByYOS;
let listNode;
let nameNode;
let yosNode;

function initialize() {
    listNode = document.getElementById('listContainer');
    setList('name');
    nameNode = document.getElementById('name');
    yosNode = document.getElementById('year');
}

function flip() {
    nameNode.classList.toggle("active");
    yosNode.classList.toggle("active");
}

function getAPIBaseURL() {
    let baseURL = window.location.protocol + '//' + window.location.hostname + ':' + window.location.port + '/api';
    return baseURL;
}

function buildList(order) {
    let url = getAPIBaseURL() + '/astronauts/list/?order=' + order;
    fetch(url, {method: 'get'})

    .then((response) => response.json())

    .then((astronautlist) => {
        let list = '';
        astronautlist.forEach(astronaut => {
            let flags = '';
            astronaut.country_code.split("/").forEach(code => flags += '<img src="https://www.countryflags.io/' + code + '/flat/64.png" alt="' + astronaut.nationality+ ' flag" />');
            list += '<div><h3>' + astronaut.english_name + '</h3><p>Selected in ' + astronaut.yos + '</p>' + flags + '</div>';
        });
        if (order === 'year') {
            astronautsByYOS = list;
            listNode.innerHTML = astronautsByYOS;
        } else {
            astronautsByName = list;
            listNode.innerHTML = astronautsByName;
        }
    })

    .catch(function(error) {
        console.log(error);
    });
}

function setList(order) {
    if (order === 'year') {
        if (typeof astronautsByYOS === 'undefined'){
            buildList(order);
        } else {
            listNode.innerHTML = astronautsByYOS;
        }
    } else {
        if (typeof astronautsByName === 'undefined') {
            buildList(order);
        } else {
            listNode.innerHTML = astronautsByName;
        }
    }
}