window.onload = initialize;
let features;
let maxAstronauts;
let maxMissions;
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

function hideShow(x, y, z) {
    let itemA = document.getElementById(x);
    let itemB = document.getElementById(y);
    let itemC = document.getElementById(z);
    itemA.classList.toggle("hide");
    itemC.classList.toggle("moveRight");
    if(itemB.innerText === 'hide') {
        itemB.innerText = 'show';
    }
    else {
        itemB.innerText = 'hide';
    }

}

function collapseColumn(tableID, columnNumber) {
    let rows = document.getElementById(tableID).rows;
    for (i = 0; i < rows.length; i++) {
        let col = rows[i].childNodes[columnNumber];
        console.log(col);
        col.classList.toggle('hideColumn');
    }
}

function setMaxes() {
    maxAstronauts = document.getElementById("rawAstronauts").rows.length - 1;
    maxMissions = document.getElementById("rawMissions").rows.length - 1;
    if (maxAstronauts > 0) {
        document.getElementById("displayastronautsRows").max = maxAstronauts;
    }
    if (maxMissions > 0) {
        document.getElementById("displaymissionsRows").max = maxMissions;
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
        rawForm(astronaut_feats, 'rawAstronautsForm', 'rawAstronauts');
        const mission_feats = features.filter(feat => feat.table === 'missions');
        raw('/missions/raw/', mission_feats, 'rawMissions');
        rawForm(mission_feats, 'rawMissionsForm', 'rawMissions');
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
            setMaxes()
        }
    })

    .catch(function(error) {
        console.log(error);
    });
}

function rawForm(feats, rawID, rawTableID) {
    let formBody = '';
    let count = 0;
    feats.forEach(feat => formBody += '<input type=checkbox name="' + feat.name + '" id="' + feat.name + feat.table + '" checked/><label for="' + feat.name + feat.table + '" onclick="collapseColumn(\'' + rawTableID +'\', ' + count++ + ')">' + feat.name + '</label>');
    formBody += '<label id="numLabel' + feats[0].table + '" for=display' + feats[0].table + 'Rows" onchange="updateNumLabel(\'display' + feats[0].table + 'Rows\', \'numLabel' + feats[0].table + '\')"><input type=number name="number of rows to display" id="display' + feats[0].table + 'Rows" min=0 value=10 /></label>';
    let rawForm = document.getElementById(rawID);
    if(rawForm) {
        rawForm.innerHTML = formBody;
    }
}