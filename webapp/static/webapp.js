window.onload = initialize;
let features;
function initialize() {
    display(1);
    getFeatures();
}

function display(x) {
    let example1 = document.getElementById("example1");
    let example2 = document.getElementById("example2");
    let exampleGraph1 = document.getElementById("exampleGraph1");
    let exampleGraph2 = document.getElementById("exampleGraph2");
    example1.classList.remove("active");
    example2.classList.remove("active");
    if(x == 2) {
        example2.classList.add("active");
        exampleGraph1.style.display = "none";
        exampleGraph2.style.display = "block";
    } else {
        example1.classList.add("active");
        exampleGraph1.style.display = "block";
        exampleGraph2.style.display = "none";
    }
}

function hideShow(x, y) {
    let itemA = document.getElementById(x);
    let itemB = document.getElementById(y);
    itemA.classList.toggle("hide");
    if(itemB.innerText === 'hide') {
        itemB.innerText = 'show';
    }
    else {
        itemB.innerText = 'hide';
    }

}

function getAPIBaseURL() {
    let baseURL = window.location.protocol + '//' + window.location.hostname + ':' + window.location.port + '/api';
    return baseURL;
}

function getFeatures() {
    let url = getAPIBaseURL() + '/features/';

    fetch(url, {method: 'get'})

    .then((response) => response.json())

    .then((featur) => {
        features = featur;
        const astronaut_feats = features.filter(feat => feat.table === 'astronauts');
        raw('/astronauts/raw/', astronaut_feats, 'rawAstronauts');
        rawForm(astronaut_feats, 'rawAstronautsForm');
        const mission_feats = features.filter(feat => feat.table === 'missions');
        raw('/missions/raw/', mission_feats, 'rawMissions');
        rawForm(mission_feats, 'rawMissionsForm');
    })

    .catch(function(error) {
        console.log(error);
    });
}

function raw(api, feats, rawID) {
    let url = getAPIBaseURL() + api;

    fetch(url, {method: 'get'})

    .then((response) => response.json())

    .then(function(things) {
        let tableBody = '<thead>\n<tr>';
        feats.forEach(feat => tableBody += '<th>' + feat.name + '</th>');
        tableBody += '</tr>\n' + '</thead>\n<tbody>\n';
        for (let k = 0; k < things.length; k++) {
            let thing = things[k];
            tableBody += '<tr>'; 
            feats.forEach(feat => tableBody += '<td>' + thing[feat.name] + '</td>')
            tableBody += '</tr>\n';
        }
        tableBody += '</tbody>';

        let rawTable = document.getElementById(rawID);
        if (rawTable) {
            rawTable.innerHTML = tableBody;
        }
    })

    .catch(function(error) {
        console.log(error);
    });
}

function rawForm(feats, rawID) {
    console.log(feats);
    let formBody = '';
    feats.forEach(feat => formBody += '<input type=checkbox name="' + feat.name + '" id="' + feat.name + feat.table + '" checked/><label for="' + feat.name + feat.table + '">' + feat.name + '</label>');
    let rawForm = document.getElementById(rawID);
    if(rawForm) {
        rawForm.innerHTML = formBody;
    }
}