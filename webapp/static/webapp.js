/*Author: Etienne Richart*/

window.onload = initialize;
let features;
let maxAstronauts;
let maxMissions;
let currentFeatHTML;
let currentTextFeatHTML;
let currentNumFeatHTML;
let optionsNumeric = ['=', '!=', '<', '>', '<=', '>='];
let optionsText = ['=', '!='];
let moreOptions = ['', 'AND', 'OR'];
let whereNum = 0;
let whereExpression;
let search;
let searchover;

function initialize() {
    let example1 = document.getElementById("example1");
    if (example1) {
        display(1);
    }
    let xSelector = document.getElementById('x-select');
    if (xSelector) {
        getFeatures();
    }
    getSearch();
}

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
        col.classList.toggle('hideColumn');
    }
}

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

function setLimit(inputID, limit) {
    document.getElementById(inputID).value = limit;
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
    feats.forEach(feat => formBody += '<input type=checkbox name="' + feat.name + '" id="' + feat.name + feat.table + '" checked/><label class="buttonHover" for="' + feat.name + feat.table + '" onclick="collapseColumn(\'' + rawTableID +'\', ' + count++ + ')">' + feat.name + '</label>');
    formBody += '<label class="otherLabels buttonHover" for="display' + feats[0].table + 'Rows" onchange="limitRows(\'raw' + feats[0].table.charAt(0).toUpperCase() + feats[0].table.slice(1) + '\', \'display' + feats[0].table + 'Rows\')">Limit: <input type=number name="number of rows to display" id="display' + feats[0].table + 'Rows" min=0 /></label>';
    formBody += '<button type="button" class="otherLabels buttonHover" onclick="setLimit(\'display' + feats[0].table + 'Rows\', 10);limitRows(\'raw' + feats[0].table.charAt(0).toUpperCase() + feats[0].table.slice(1) + '\', \'display' + feats[0].table + 'Rows\')">10</button><button type="button" class="otherLabels buttonHover" onclick="setLimit(\'display' + feats[0].table + 'Rows\', max' + feats[0].table.charAt(0).toUpperCase() + feats[0].table.slice(1) + ');limitRows(\'raw' + feats[0].table.charAt(0).toUpperCase() + feats[0].table.slice(1) + '\', \'display' + feats[0].table + 'Rows\')">Max</button>';
    let rawForm = document.getElementById(rawID);
    if(rawForm) {
        rawForm.innerHTML = formBody;
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
    window.location.replace(getAPIBaseURL() + '/profile/' + searchVal);
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
      if (!arr.includes(val)) {
        let searchList = document.getElementById('searchautocomplete-list');
        if (searchList && searchList.childNodes.length != 0) {
            inp.value = searchList.childNodes[0].lastChild.value;
        } else {
            inp.value = ''
        }
      }
      closeAllLists(document);
  });
}

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
        // Populate it with states from the API
        currentTextFeatHTML = createOptions(features.filter(feat=> feat.type === 'text' || feat.type === 'character varying'));
        currentNumFeatHTML = createOptions(features.filter(feat=> feat.type != 'text' && feat.type != 'character varying'));
        currentFeatHTML = createOptions(features);
        currentFeatHTML.forEach((val, key) => {
            xSelector[key] = new Option(val, val, false, val === 'nationality.nation' ? true : false);
            ySelector[key] = new Option(val, val, false, val === 'astronauts.original_name' ? true : false);
        });
        addRow();
        document.getElementsByClassName('aSelector')[0].value = 'astronauts.nationality';
        document.getElementsByClassName('hideIn')[0].value = 'nationality.id'
    }
}

function getType(featur) {
    let [table, name] = featur.split('.');
    return features.filter((feat) => feat.table === table && feat.name === name)[0];
}

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
    currentFeatHTML.forEach((val, key) => elm[key] = new Option(val, val));
    whereNum++;
    let more = row.getElementsByClassName('moreSelector')[0];
    moreOptions.forEach((val, key) => more[key] = new Option(val));
    checkExpression();
}

function removeRow(rowID) {
    document.getElementById(rowID).remove();
    let more = document.getElementsByClassName('moreSelector');
    Array.from(more).forEach((selector, index) => {
        let sVal = selector.value;
        moreOptions.forEach((val, key) => selector[key] = new Option(val, val, false, sVal === val ? true : false));
        if (index != more.length - 1) {
            selector.options.remove(0);
        }
        else {
            selector.value = '';
        }
    });
}

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
        if (col[2].childNodes[1].checked) {
            B = selectB.value;
        } else {
            B = inputB.value;
        }
        
        if (typeA === 'text' || typeA === 'character varying') {
            optionsText.forEach((val, key) => Connects[key] = new Option(val, val, false, val === valueC ? true : false));
            
            currentTextFeatHTML.forEach((val, key) => selectB[key] = new Option(val, val, false, val === B ? true : false));
            inputB.setAttribute('type', 'text');
        } else {
            optionsNumeric.forEach((val, key) => Connects[key] = new Option(val, val, false, val === valueC ? true : false));
            
            currentNumFeatHTML.forEach((val, key) => selectB[key] = new Option(val, val, false, val === B ? true : false));
            inputB.setAttribute('type', 'number');
        }

        valueC = Connects.value;

        if (col[2].childNodes[1].checked) {
            B = selectB.value;
        } else {
            B = inputB.value;
        }

        if (A && valueC && B) {
            let more = col[3];
            if (more.childNodes[0].value) {
                if (i === rows.length-1) {
                    addRow();
                    return;
                }
                whereExpression += A + ' ' + valueC + ' ' + B + ' ' + more.childNodes[0].value + ' ';
            } else if (i === rows.length-1) {
                whereExpression += A + ' ' + valueC + ' ' + B;
            } else {
                whereExpression = 'error';
            }
        } else {
            whereExpression = 'error';
        }
    }
    let more = document.getElementsByClassName('moreSelector');
    Array.from(more).forEach((selector, index) => {
        moreOptions.forEach((val, key) => selector[key] = new Option(val));
        if (index != more.length - 1) {
            selector.options.remove(0);
        }
    });
}

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

function createFeatureChart(restOfTheURL, chartID) {
    // Create the chart
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