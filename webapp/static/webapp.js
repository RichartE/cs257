/*Author: Etienne Richart*/

window.onload = initialize;
//all the features of the database: feature name, type, and table
let features;
//total number of entries in astronauts table
let maxAstronauts;
//total number of entries in missions table
let maxMissions;
let currentFeatHTML;
let currentTextFeatHTML;
let currentNumFeatHTML;
//for the WHERE builder, if A is numeric the opperator is one of these
let optionsNumeric = ['=', '!=', '<', '>', '<=', '>='];
//for the WHERE builder, if A is text the opperator is one of these
let optionsText = ['=', '!='];
//for the WHERE builder connector these are the options
let moreOptions = ['', 'AND', 'OR'];
//to help generate unique IDs for the inputs of the WHERE builder to connect them to labels
let whereNum = 0;
//the evaluate WHERE builder epression
let whereExpression;
let search;
// lets buildList() know if this is a missions list or astronaut list page
let listPage;
let byName;
let byYOS;
let listNode;
let nameNode;
let yosNode;

function initialize() {
    //check if we are on the home page
    let example1 = document.getElementById("example1");
    if (example1) {
        display(1);
        getFeatures();
    }
    //chack if we are on either astronauts list or missions list page
    let list = document.getElementById('list');
    if (list) {
        listNode = document.getElementById('listContainer');
        nameNode = document.getElementById('name');
        yosNode = document.getElementById('year');
        if (list.childNodes[1].innerText === 'Mission List:') {
            //tell buildList() to build a mission list
            listPage = 'missions';
            setList('year');
        } else {
            //tell buildList to build an astronaut list
            listPage = 'astronauts';
            setList('name');
        }
    }
    //initialize the search bar
    getSearch();
}

//toggle between displaying the example graphs
function display(x) {
    let example1 = document.getElementById("example1");
    let example2 = document.getElementById("example2");
    let exampleGraph1 = document.getElementById("exampleGraph1");
    let exampleGraph2 = document.getElementById("exampleGraph2");
    let examples = document.getElementById("exampleGraphs");
    example1.classList.remove("active");
    example2.classList.remove("active");
    if(x == 2) {
        example2.classList.add("active");
        exampleGraph1.style.zIndex = -1;
        exampleGraph2.style.zIndex = 2;
        examples.classList.add("rev");
    } else {
        examples.classList.remove("rev");
        example1.classList.add("active");
        exampleGraph1.style.zIndex = 2;
        exampleGraph2.style.zIndex = -1;
    }
}

//build a list of the specified order for the correct list page.
//store the list in a variable so that it does not need to be recomputed.
function buildList(order) {
    if (listPage === 'missions') {
        let url = getAPIBaseURL() + '/missions/list/?order=' + order;
        fetch(url, {method: 'get'})

        .then((response) => response.json())

        .then((missionlist) => {
            let list = '';
            missionlist.forEach(mission => list += '<div><h3>' + mission.title + '</h3><p>' + mission.year + '</p></div>');
            if (order === 'year') {
                byYOS = list;
                listNode.innerHTML = byYOS;
            } else {
                byName = list;
                listNode.innerHTML = byName;
            }
        })

        .catch(function(error) {
            console.log(error);
        });
    } else {
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
                byYOS = list;
                listNode.innerHTML = byYOS;
            } else {
                byName = list;
                listNode.innerHTML = byName;
            }
        })

        .catch(function(error) {
            console.log(error);
        });
    }
}

//sets the list to the specified order.
//adds or removes the active class in order to indicate the ordering
function setList(order) {
    if (order === 'year') {
        nameNode.classList.remove('active');
        yosNode.classList.add('active');
        if (typeof byYOS === 'undefined'){
            buildList(order);
        } else {
            listNode.innerHTML = byYOS;
        }
    } else {
        nameNode.classList.add('active');
        yosNode.classList.remove('active');
        if (typeof byName === 'undefined') {
            buildList(order);
        } else {
            listNode.innerHTML = byName;
        }
    }
}

//hides or shows the data tables on the home page
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

//hides a column of the data table on the home page
function collapseColumn(tableID, columnNumber) {
    let rows = document.getElementById(tableID).rows;
    for (i = 0; i < rows.length; i++) {
        let col = rows[i].childNodes[columnNumber];
        col.classList.toggle('hideColumn');
    }
}

//sets the max number of entries for each table,
//so that the user can use butto to quickly change the number of entries displayed.
function setMaxes() {
    maxAstronauts = document.getElementById("rawAstronauts").rows.length - 1;
    maxMissions = document.getElementById("rawMissions").rows.length - 1;
    if (maxAstronauts > 0) {
        let input = document.getElementById("displayastronautsRows");
        input.max = maxAstronauts;
        input.value = maxAstronauts;
    }
    if (maxMissions > 0) {
        let input = document.getElementById("displaymissionsRows");
        input.max = maxMissions;
        input.value = maxMissions;
    }
}

//limit the number of entries displayed in the data tables on the home page
function limitRows(tableID, inputID) {
    let rows = document.getElementById(tableID).rows;
    let numVisible = document.getElementById(inputID).value;
    for (i = 0; i < rows.length; i++) {
        if (i > numVisible) {
            rows[i].classList.add('hideColumn');
        }
        else {
            rows[i].classList.remove('hideColumn');
        }
    }
}

//puts a value into the limit input number
function setLimit(inputID, limit) {
    document.getElementById(inputID).value = limit;
}

// returns the APIBaseURL used to make calls to the API
function getAPIBaseURL() {
    let baseURL = window.location.protocol + '//' + window.location.hostname + ':' + window.location.port + '/api';
    return baseURL;
}

//get all the features in the database and use them to create datatables and graphing creator.
function getFeatures() {
    let url = getAPIBaseURL() + '/features/';

    fetch(url, {method: 'get'})

    .then((response) => response.json())

    .then((featur) => {
        //put features into a global variable so that there is no need to reask the server for the features
        features = featur;
        //get the features from the astronaut table
        const astronaut_feats = features.filter(feat => feat.table === 'astronauts');
        //build the astronauts table
        raw('/astronauts/raw/', astronaut_feats, 'rawAstronauts');
        //build the astronauts table header to limit entries, hide columns
        rawForm(astronaut_feats, 'rawAstronautsForm', 'rawAstronauts');
        //get the features from the missions table
        const mission_feats = features.filter(feat => feat.table === 'missions');
        //build the missions table
        raw('/missions/raw/', mission_feats, 'rawMissions');
        //build the missions table header to limit entries, hide columns
        rawForm(mission_feats, 'rawMissionsForm', 'rawMissions');
        populateFeatureSelectors();
    })

    .then(() => {
        let ex1URL = '/graphing/?x=nationality.nation&y=astronauts.yos&aggregate=SUM&query=astronauts.nationality = nationality.id'
        createFeatureChart(ex1URL, '#exGraph1');
        let ex2URL = '/graphing/?x=nationality.nation&y=astronauts.total_eva_hours&aggregate=SUM&order=DESC&query=astronauts.nationality = nationality.id';
        createFeatureChart(ex2URL, '#exGraph2');
        customGraph();
    })

    .catch(function(error) {
        console.log(error);
    });
}

//build the table
function raw(api, feats, rawID) {
    let url = getAPIBaseURL() + api;
    console.log(rawID);
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

function selectCallRaw(table, id, rawID) {
    let order = document.getElementById(id).value;
    let api = '/' + table + '/raw/?order=' + order;
    let feats = features.filter(feat => feat.table === table);
    raw(api, feats, rawID)
}

//build the table header to limit entries, hide columns
function rawForm(feats, rawID, rawTableID) {
    console.log(rawID);
    let formBody = '';
    let count = 0;
    let options = createOptions(feats);
    feats.forEach(feat => formBody += '<input type=checkbox name="' + feat.name + '" id="' + feat.name + feat.table + '" checked/><label class="buttonHover" for="' + feat.name + feat.table + '" onclick="collapseColumn(\'' + rawTableID +'\', ' + count++ + ')">' + feat.name + '</label>');
    formBody += '<label class="otherLabels buttonHover" for="display' + feats[0].table + 'Rows" onchange="limitRows(\'raw' + feats[0].table.charAt(0).toUpperCase() + feats[0].table.slice(1) + '\', \'display' + feats[0].table + 'Rows\')">Limit: <input type=number name="number of rows to display" id="display' + feats[0].table + 'Rows" min=0 /></label>';
    formBody += '<label class="otherLabels buttonHover"><select id="select' + feats[0].table + '" onchange="selectCallRaw(\'' + feats[0].table + '\', \'select' + feats[0].table + '\', \'' + rawID.substr(0, rawID.length - 4) + '\')">';
    options.forEach((val) => formBody += '<option>' + val + '</option>');
    formBody += '</select></label><button type="button" class="otherLabels buttonHover" onclick="setLimit(\'display' + feats[0].table + 'Rows\', 10);limitRows(\'raw' + feats[0].table.charAt(0).toUpperCase() + feats[0].table.slice(1) + '\', \'display' + feats[0].table + 'Rows\')">10</button><button type="button" class="otherLabels buttonHover" onclick="setLimit(\'display' + feats[0].table + 'Rows\', max' + feats[0].table.charAt(0).toUpperCase() + feats[0].table.slice(1) + ');limitRows(\'raw' + feats[0].table.charAt(0).toUpperCase() + feats[0].table.slice(1) + '\', \'display' + feats[0].table + 'Rows\')">Max</button>';
    let rawForm = document.getElementById(rawID);
    if(rawForm) {
        rawForm.innerHTML = formBody;
    }
}

//get all the possible searches (astronauts' English name and original name, mission title, spacecraft name)
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

//Do the search and go to the profile page
function searchSubmit() {
    let searchVal = document.getElementById('search').value;
    if (searchVal) {
        window.location.replace(getAPIBaseURL() + '/profile/?name=' + searchVal);
    }   
}

// autocomplete updated from https://www.w3schools.com/howto/howto_js_autocomplete.asp
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
                b.addEventListener("mouseover", function(e) {
                /*insert the value for the autocomplete text field:*/
                inp.value = this.getElementsByTagName("input")[0].value;
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
  inp.addEventListener("focusout", function (e) {
      let val = inp.value;
      //value is not valid search name
      if (!arr.includes(val)) {
        let searchList = document.getElementById('searchautocomplete-list');
        //if user clicks away without a valid search and there are search options available, use the first one
        if (searchList && searchList.childNodes.length != 0) {
            inp.value = searchList.childNodes[0].lastChild.value;
        } else {
            inp.value = ''
        }
      }
      closeAllLists(document);
  });
}

//create option for select input
function createOptions(feats) {
    let featureSelectorBody = [];
    for (let k = 0; k < feats.length; k++) {
        let feature = feats[k];
        featureSelectorBody.push(feature.table + '.' + feature.name);
    }
    return featureSelectorBody
}

function populateFeatureSelectors() {
    let xSelector = document.getElementById('x-select');
    let ySelector = document.getElementById('y-select');
    if (xSelector && ySelector) {
        // create option list to create new Options so that DOM properly updates
        //String options
        currentTextFeatHTML = createOptions(features.filter(feat=> feat.type === 'text' || feat.type === 'character varying'));
        //Numeric options
        currentNumFeatHTML = createOptions(features.filter(feat=> feat.type != 'text' && feat.type != 'character varying'));
        //All options
        currentFeatHTML = createOptions(features);
        //Populate x and y options
        currentFeatHTML.forEach((val, key) => {
            xSelector[key] = new Option(val, val, false, val === 'nationality.nation' ? true : false);
            ySelector[key] = new Option(val, val, false, val === 'astronauts.original_name' ? true : false);
        });
        //Add a row to the WHERE builder
        addRow();
        //Set default values to first row
        document.getElementsByClassName('aSelector')[0].value = 'astronauts.nationality';
        document.getElementsByClassName('hideIn')[0].value = 'nationality.id'
    }
}

//get the feature dictionary from features that matches the input feature
function getType(featur) {
    let [table, name] = featur.split('.');
    return features.filter((feat) => feat.table === table && feat.name === name)[0];
}

//add row to WHERE builder
function addRow() {
    let where = document.getElementById('whereBody');
    let whereRow = '';
    whereRow += '<td class="A"><select class="aSelector"></select></td><td class="Connects"><select class="cSelector"></select></td><td class="B">';
    whereRow += '<label for="' + whereNum + 'feat">Feature:&nbsp</label><input id="' + whereNum + 'feat" type="radio" name="bOptions' + whereNum + '"checked>&nbsp&nbsp<label for="' + whereNum + 'feat">Input:&nbsp</label><input id="' + whereNum + 'feat" type="radio" name="bOptions' + whereNum + '"><select class="hideIn"></select><input class="hideIn" type="text">';
    whereRow += '</td><td class="More"><select class="moreSelector"><option value=""></option><option value="AND">AND</option><option value="OR">OR</option></select><i class="fa fa-times fa-3" onclick="removeRow(\'whereRow' + whereNum + '\')" aria-hidden="true"></i></td>';
    let row = where.insertRow();
    row.setAttribute("onchange", "checkExpression()");
    row.setAttribute("id", "whereRow" + whereNum);
    row.innerHTML = whereRow;
    let elm = row.getElementsByClassName('aSelector')[0];
    //populate A with all the features
    currentFeatHTML.forEach((val, key) => elm[key] = new Option(val, val));
    whereNum++;
    let more = row.getElementsByClassName('moreSelector')[0];
    //populate more with moreOptions ('', AND, OR )
    moreOptions.forEach((val, key) => more[key] = new Option(val));
    //Validate the WHERE expression and set connector and B based on the type of A
    checkExpression();
}

//remove a row from the WHERE builder
function removeRow(rowID) {
    document.getElementById(rowID).remove();
    let more = document.getElementsByClassName('moreSelector');
    Array.from(more).forEach((selector, index) => {
        let sVal = selector.value;
        moreOptions.forEach((val, key) => selector[key] = new Option(val, val, false, sVal === val ? true : false));
        //only the last row may have the empty option for more,
        //since the preceding ones have to be connected together
        if (index != more.length - 1) {
            selector.options.remove(0);
        }
        else {
            selector.value = '';
        }
    });
}

//validate WHERE builder.
//set connector and B based on A
//build where expression
//flip between select, text and numerical input for B
function checkExpression() {
    whereExpression = '';
    let rows = document.getElementById('where').rows;
    for (i = 1; i < rows.length; i++) {
        let col = rows[i].childNodes;
        let A = col[0].firstChild.value;
        let typeA = getType(A).type;

        let Connects = col[1].firstChild;
        let valueC = Connects.value;

        let selectB = col[2].childNodes[5];
        let inputB = col[2].childNodes[6];
        let B;
        //flips between select and input based on what is checked
        if (col[2].childNodes[1].checked) {
            B = selectB.value;
        } else {
            B = inputB.value;
        }
        
        //reasigns options of connector and B &
        //input type of B based on type of A
        if (typeA === 'text' || typeA === 'character varying') {
            optionsText.forEach((val, key) => Connects[key] = new Option(val, val, false, val === valueC ? true : false));
            
            currentTextFeatHTML.forEach((val, key) => selectB[key] = new Option(val, val, false, val === B ? true : false));
            inputB.setAttribute('type', 'text');
        } else {
            optionsNumeric.forEach((val, key) => Connects[key] = new Option(val, val, false, val === valueC ? true : false));
            
            currentNumFeatHTML.forEach((val, key) => selectB[key] = new Option(val, val, false, val === B ? true : false));
            inputB.setAttribute('type', 'number');
        }

        //if the value before the above change still exists, set it to that 
        valueC = Connects.value;
        //if the value before the change still exists, set it to that
        if (col[2].childNodes[1].checked) {
            B = selectB.value;
        } else {
            B = inputB.value;
        }
        //if there is input for A, connector and B
        if (A && valueC && B) {
            let more = col[3];
            if (more.childNodes[0].value) {
                //if the last row has a more alue than there needs another row
                if (i === rows.length-1) {
                    addRow();
                    return;
                }
                //update whereExpression with 4 values
                whereExpression += A + ' ' + valueC + ' ' + B + ' ' + more.childNodes[0].value + ' ';
            } else if (i === rows.length-1) {
                //update whereExpression with 3 values
                whereExpression += A + ' ' + valueC + ' ' + B;
            } else {
                //whereExpression is invalid
                whereExpression = 'error';
            }
        } else {
            //whereExpression is invalid
            whereExpression = 'error';
        }
    }
    //update the more selector so only the last one has the '' value
    let more = document.getElementsByClassName('moreSelector');
    Array.from(more).forEach((selector, index) => {
        moreOptions.forEach((val, key) => selector[key] = new Option(val));
        if (index != more.length - 1) {
            selector.options.remove(0);
        }
    });
}

//call the graphing API thorugh the graphing UI
function customGraph() {
    checkExpression();
    if (whereExpression.startsWith('error')) {
        whereExpression = '';
    }
    // Set the title
    let graphTitle = document.getElementById('state-new-cases-title');
    let xSelector = document.getElementById('x-select');
    let ySelector = document.getElementById('y-select');
    let aggSelector = document.getElementById('aggregate');
    let orderSelector = document.getElementById('order');
    if (graphTitle) {
        graphTitle.innerHTML = xSelector.value + ' vs. ' + ySelector.value;
    }
    restOfTheURL = '/graphing/?x=' + xSelector.value + '&y=' + ySelector.value + '&aggregate=' + aggSelector.value + '&order=' + orderSelector.value + '&query=' + whereExpression;
    createFeatureChart(restOfTheURL, '#state-new-cases-chart');
}

//create a chart/graph
function createFeatureChart(restOfTheURL, chartID) {
    // Call graphi enpoint
    let url = getAPIBaseURL() + restOfTheURL;

    fetch(url, {method: 'get'})

    .then((response) => response.json())

    .then(function(days) {
        // Use the API response (days), which is a list of dictionaries like this:
        //
        //   {date: '20200315', positiveIncrease: 2345, ... }
        //
        // to assemble the data my bar-chart will need. That data looks like a
        // list of dictionaries (newCasesData). Each dictionary in the list will look
        // like this:
        //
        //   {meta:'2020-03-15', value: 2345}
        //
        // Here, meta is the date, which Chartist will use in a popup window that appears
        // if you hover over a bar in the bar chart, and value is the number of new COVID
        // cases for that date, which will, of course, determine the height of the bar
        // in the bar chart.
        //
        // In this same loop, we're also creating a list (labels) of labels to be used
        // along the x-axis of the bar chart.

        // This code assumes results are sorted in descending order by date, which is
        // indeed how the API returns the data as of this writing.
        let labels = [];
        let newCasesData = [];
        for (let k = 0; k < days.length; k++) {
            // Assumes YYYYMMDD int
            let date = days[k].x;
            labels.push(date);
            newCasesData.push({meta: date, value: days[k].y});
        }
        
        // We set some options for our bar chart. seriesBarDistance is the width of the
        // bars. axisX allows us to specify a bunch of options related to the x-axis.
        // The one we're picking is labelInterpolationFnc, which allows us to control
        // which bars have x-axis labels. Here, we're saying "write the date of the bar
        // on the x-axis every 7 days". Otherwise, the axis just gets too crowded.
        let options = { seriesBarDistance: 25,
                        axisX: { labelInterpolationFnc: function(value, index) {
                                    let numLabels = Math.min(Math.max(Math.round(1500/(window.innerWidth)*0.9), 1), 7);
                                    return index % numLabels === 0 ? value : null;
                                }
                        },
                      };

        // Here's the form in which Chartist expects its data to be specified. Not that
        // series is a list, since you might want to have two or more differently colored
        // sets of bars, or line graphs, etc. on the same chart.
        let data = { labels: labels, series: [newCasesData] };

        // Finally, we create the bar chart, and attach it to the desired <div> in our HTML.
        let chart = new Chartist.Bar(chartID, data, options);

        // HERE COMES THE MESS THAT IS TOOLTIPS! FEEL FREE TO IGNORE!
        // Tooltips are those little sometimes-informative popups that give you a little
        // information about something your mouse is hovering over. We want them on this
        // bar chart so we can get the exact number of new cases on a particular day, not
        // just an estimate (which is what you'll get from just looking at the bar's height).
        //
        // I got a lot of help from here.
        // https://stackoverflow.com/questions/34562140/how-to-show-label-when-mouse-over-bar
        //
        // Note that all of this code uses jQuery notation. I wrote everything above here
        // in vanilla Javascript, but I don't feel like rewriting the following more complicated code.

        chart.on('created', function(bar) {
            let toolTipSelector = '#state-new-cases-tooltip';
            $('.chart-container .ct-bar').on('mouseenter', function(e) {  // Set a "hover handler" for every bar in the chart
                let value = $(this).attr('ct:value'); // value and meta come ultimately from the newCasesData above
                let label = $(this).attr('ct:meta');
                let caption = '<b>X:</b> ' + label + '<br><b>Y:</b> ' + value;
                $(toolTipSelector).html(caption);
                $(toolTipSelector).parent().css({position: 'relative'});
                // bring to front, https://stackoverflow.com/questions/3233219/is-there-a-way-in-jquery-to-bring-a-div-to-front
                $(toolTipSelector).parent().append($(toolTipSelector));

                let x = e.clientX;
                let y = e.clientY;
                $(toolTipSelector).css({top: y, left: x, position:'fixed', display: 'block', zIndex: 3});
            });

            $('.ct-bar').on('mouseout', function() {
                $(toolTipSelector).css({display: 'none'});
            });
        });
    })

    // Log the error if anything went wrong during the fetch.
    .catch(function(error) {
        console.log(error);
    });
}