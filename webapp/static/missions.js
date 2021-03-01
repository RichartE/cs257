window.onload = initialize;
let missionsByName;
let missionsByYOS;
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
    let url = getAPIBaseURL() + '/missions/list/?order=' + order;
    fetch(url, {method: 'get'})

    .then((response) => response.json())

    .then((missionlist) => {
        console.log(missionlist);
        let list = '';
        missionlist.forEach(mission => list += '<div><h3>' + mission.title + '</h3><p>Selected in ' + mission.year + '</p></div>');
        if (order === 'year') {
            missionsByYOS = list;
            listNode.innerHTML = missionsByYOS;
        } else {
            missionsByName = list;
            listNode.innerHTML = missionsByName;
        }
    })

    .catch(function(error) {
        console.log(error);
    });
}

function setList(order) {
    if (order === 'year') {
        if (typeof missionsByYOS === 'undefined'){
            buildList(order);
        } else {
            listNode.innerHTML = missionsByYOS;
        }
    } else {
        if (typeof missionsByName === 'undefined') {
            buildList(order);
        } else {
            listNode.innerHTML = missionsByName;
        }
    }
}