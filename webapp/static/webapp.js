window.onload = initialize;

function initialize() {
    display(1);
    rawAstronauts();
    rawMissions();
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

function rawAstronauts() {
    let url = getAPIBaseURL() + '/astronauts/raw/';

    fetch(url, {method: 'get'})

    .then((response) => response.json())

    .then(function(astronauts) {
        let tableBody = '<thead>\n<tr>'
                        + '<th>' + 'id' + '</th>'
                        + '<th>' + 'nwnumber' + '</th>'
                        + '<th>' + 'english_name' + '</th>'
                        + '<th>' + 'original_name' + '</th>'
                        + '<th>' + 'sex' + '</th>'
                        + '<th>' + 'yob' + '</th>'
                        + '<th>' + 'nationality' + '</th>'
                        + '<th>' + 'mil_civ' + '</td>'
                        + '<th>' + 'yos' + '</th>'
                        + '<th>' + 'total_missions' + '</th>'
                        + '<th>' + 'total_mission_hours' + '</th>'
                        + '<th>' + 'total_eva_hours' + '</th>'
                        + '</tr>\n'
                        +'</thead>\n<tbody>\n';
        for (let k = 0; k < astronauts.length; k++) {
            let astronaut = astronauts[k];
            tableBody += '<tr>' 
                      + '<td>' + astronaut['id'] + '</td>'
                      + '<td>' + astronaut['nwnumber'] + '</td>' 
                      + '<td>' + astronaut['english_name'] + '</td>'
                      + '<td>' + astronaut['original_name'] + '</td>'
                      + '<td>' + astronaut['sex'] + '</td>'
                      + '<td>' + astronaut['yob'] + '</td>'
                      + '<td>' + astronaut['nationality'] + '</td>'
                      + '<td>' + astronaut['mil_civ'] + '</td>'
                      + '<td>' + astronaut['yos'] + '</td>'
                      + '<td>' + astronaut['total_missions'] + '</td>'
                      + '<td>' + astronaut['total_mission_hours'] + '</td>'
                      + '<td>' + astronaut['total_eva_hours'] + '</td>'
                      + '</tr>\n';
        }
        tableBody += '</tbody>';

        let rawAstronautTable = document.getElementById('rawAstronauts');
        if (rawAstronautTable) {
            rawAstronautTable.innerHTML = tableBody;
        }
    })

    .catch(function(error) {
        console.log(error);
    });
}

function rawMissions() {
    let url = getAPIBaseURL() + '/missions/raw/';

    fetch(url, {method: 'get'})

    .then((response) => response.json())

    .then(function(missions) {
        let tableBody = '<thead>\n<tr>'
                        + '<th>' + 'id' + '</th>'
                        + '<th>' + 'title' + '</th>'
                        + '<th>' + 'mission_year' + '</th>'
                        + '<th>' + 'ascent' + '</th>'
                        + '<th>' + 'orbit' + '</th>'
                        + '<th>' + 'decent' + '</th>'
                        + '<th>' + 'duration' + '</th>'
                        + '<th>' + 'combined_eva' + '</td>'
                        + '<th>' + 'composition' + '</th>'
                        + '</tr>\n'
                        +'</thead>\n<tbody>\n';
        for (let k = 0; k < missions.length; k++) {
            let mission = missions[k];
            tableBody += '<tr>' 
                      + '<td>' + mission['id'] + '</td>'
                      + '<td>' + mission['title'] + '</td>' 
                      + '<td>' + mission['mission_year'] + '</td>'
                      + '<td>' + mission['ascent'] + '</td>'
                      + '<td>' + mission['orbit'] + '</td>'
                      + '<td>' + mission['decent'] + '</td>'
                      + '<td>' + mission['duration'] + '</td>'
                      + '<td>' + mission['combined_eva'] + '</td>'
                      + '<td>' + mission['composition'] + '</td>'
                      + '</tr>\n';
        }
        tableBody += '</tbody>';

        let rawMissionTable = document.getElementById('rawMissions');
        if (rawMissionTable) {
            rawMissionTable.innerHTML = tableBody;
        }
    })

    .catch(function(error) {
        console.log(error);
    });
}

