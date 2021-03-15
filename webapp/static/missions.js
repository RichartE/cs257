/*Author: Etienne Richart*/

window.onload = initialize;
let missionsByName;
let missionsByYOS;
let listNode;
let nameNode;
let yosNode;
function initialize() {
    listNode = document.getElementById('listContainer');
    setList('year');
    nameNode = document.getElementById('name');
    yosNode = document.getElementById('year');
    getSearch();
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
        let list = '';
        missionlist.forEach(mission => list += '<div><h3>' + mission.title + '</h3><p>' + mission.year + '</p></div>');
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


function getSearch() {
    let url = getAPIBaseURL() + '/search/';

    fetch(url, {method: 'get'})

    .then((response) => response.json())

    .then(things => {
        search = things;
    })

    .then(() => autocomplete(document.getElementById('search'), search))
    
    .catch(function(error) {
        console.log(error);
    });
}

function searchSubmit() {
    let searchVal = document.getElementById('search').value;
    window.location.replace(getAPIBaseURL() + '/search/' + searchVal);
}

// autocomplete from https://www.w3schools.com/howto/howto_js_autocomplete.asp
function autocomplete(inp, arr) {
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    let currentFocus;
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", function(e) {
        let a, b, i, val = this.value;
        /*close any already open lists of autocompleted values*/
        closeAllLists();
        if (!val) { return false;}
        currentFocus = -1;
        /*create a DIV element that will contain the items (values):*/
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        /*append the DIV element as a child of the autocomplete container:*/
        this.parentNode.appendChild(a);
        /*for each item in the array...*/
        for (i = 0; i < arr.length; i++) {
          /*check if the item starts with the same letters as the text field value:*/
          if (arr[i].toUpperCase().startsWith(val.toUpperCase())) {
            /*create a DIV element for each matching element:*/
            b = document.createElement("DIV");
            /*make the matching letters bold:*/
            b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
            b.innerHTML += arr[i].substr(val.length);
            /*insert a input field that will hold the current array item's value:*/
            b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
            /*execute a function when someone clicks on the item value (DIV element):*/
                b.addEventListener("click", function(e) {
                /*insert the value for the autocomplete text field:*/
                inp.value = this.getElementsByTagName("input")[0].value;
                /*close the list of autocompleted values,
                (or any other open lists of autocompleted values:*/
                closeAllLists();
            });
            a.appendChild(b);
          }
        }
    });
    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", function(e) {
        let x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
          /*If the arrow DOWN key is pressed,
          increase the currentFocus letiable:*/
          currentFocus++;
          /*and and make the current item more visible:*/
          addActive(x);
        } else if (e.keyCode == 38) { //up
          /*If the arrow UP key is pressed,
          decrease the currentFocus letiable:*/
          currentFocus--;
          /*and and make the current item more visible:*/
          addActive(x);
        } else if (e.keyCode == 13) {
          /*If the ENTER key is pressed, prevent the form from being submitted,*/
          e.preventDefault();
          if (currentFocus > -1) {
            /*and simulate a click on the "active" item:*/
            if (x) x[currentFocus].click();
          }
        }
    });
    function addActive(x) {
      /*a function to classify an item as "active":*/
      if (!x) return false;
      /*start by removing the "active" class on all items:*/
      removeActive(x);
      if (currentFocus >= x.length) currentFocus = 0;
      if (currentFocus < 0) currentFocus = (x.length - 1);
      /*add class "autocomplete-active":*/
      x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
      /*a function to remove the "active" class from all autocomplete items:*/
      for (let i = 0; i < x.length; i++) {
        x[i].classList.remove("autocomplete-active");
      }
    }
    function closeAllLists(elmnt) {
      /*close all autocomplete lists in the document,
      except the one passed as an argument:*/
      let x = document.getElementsByClassName("autocomplete-items");
      for (let i = 0; i < x.length; i++) {
        if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }
  /*execute a function when someone clicks in the document:*/
  document.addEventListener("click", function (e) {
      closeAllLists(e.target);
  });
}