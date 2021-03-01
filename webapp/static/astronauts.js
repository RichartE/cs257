window.onload = initialize;
let astronautsByName;
let astronautsByYOS;
let listNode;
let nameNode;
let yosNode;
let countryCodes ={
    "U.S.": "us",
    "U.S.S.R/Russia" : "ru",
    "Japan": "jp",
    "Italy": "it",
    "France": "fr",
    "UAE":  "ae",
    "Kazakhstan": "kz",
    "Canada": "ca",
    "China": "cn",
    "Germany": "de",
    "Belgium": "be",
    "U.K.": "gb",
    "Saudi Arabia": "sa",
    "Bulgaria": "bg",
    "Cuba": "cu",
    "Slovakia": "sk",
    "Hungry": "hu",
    "Sweden": "se",
    "Romania": "ro",
    "Syria": "sy",
    "Australia": "au",
    "Austria": "at",
    "Czechoslovakia": "cz",
    "Korea": "kr",
    "Malysia": "my",
    "Israel": "il",
    "India": "in",
    "Brazil": "br",
    "Vietnam": "vn",
    "Netherland": "nl",
    "Mexico": "mx",
    "Denmark": "dk",
    "Mongolia": "mn", 
    "Poland": "pl",
    "Afghanistan": "af",
    "Switzerland": "ch",
    "Republic of South Africa": "za",
    "U.K./U.S.": 'us/flat/64.png" alt="U.S. flag" /> <img src="https://www.countryflags.io/gb',
    "U.S.S.R/Ukraine": "ua"
};
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
        astronautlist.forEach(astronaut => list += '<div><h3>' + astronaut.english_name + '</h3><p>Selected in ' + astronaut.yos + '</p><img src="https://www.countryflags.io/' + countryCodes[astronaut.nationality] + '/flat/64.png" alt="' + astronaut.nationality+ ' flag" /></div>');
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