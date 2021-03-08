window.onload = initialize;
let features;
let maxAstronauts;
let maxMissions;
let currentFeatures;
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

function updateSelection() {
    let xSelector = document.getElementById('x-select');
    let ySelector = document.getElementById('y-select');
    let xTable = xSelector.value.split('.')[0];
    let yTable = ySelector.value.split('.')[0];
    currentFeatures = features.filter(feat=> feat.table === xTable || feat.table === yTable);
    let featureSelectorBody = '';
    for (let k=0; k < currentFeatures.length; k++) {
        let feature = currentFeatures[k];
        featureSelectorBody += '<option value="' + feature.table + '.' + feature.name + '">' + feature.table + '.' + feature.name + '</option>\n';
    }

    let aSelectors = document.getElementsByClassName('aSelector');
    Array.from(aSelectors).forEach(elm => elm.innerHTML = featureSelectorBody);
}

function populateFeatureSelectors() {
    let xSelector = document.getElementById('x-select');
    let ySelector = document.getElementById('y-select');
    if (xSelector && ySelector) {
        // Populate it with states from the API
        let featureSelectorBody = '';
        for (let k=0; k < features.length; k++) {
            let feature = features[k];
            featureSelectorBody += '<option value="' + feature.table + '.' + feature.name + '">' + feature.table + '.' + feature.name + '</option>\n';
        }
        xSelector.innerHTML = featureSelectorBody;
        ySelector.innerHTML = featureSelectorBody;

        // Start us out looking at Minnesota.
        xSelector.value = 'nationality.nation';
        ySelector.value = 'astronauts.original_name';
        updateSelection();
    }
}

function createFeatureChart() {
    // Set the title
    let graphTitle = document.getElementById('state-new-cases-title');
    let xSelector = document.getElementById('x-select');
    let ySelector = document.getElementById('y-select');
    let aggSelector = document.getElementById('aggregate');
    let orderSelector = document.getElementById('order');
    if (graphTitle) {
        graphTitle.innerHTML = xSelector.value + ' vs. ' + ySelector.value;
    }

    // Create the chart
    let url = getAPIBaseURL() + '/graphing/?x=' + xSelector.value + '&y=' + ySelector.value + '&aggregate=' + aggSelector.value + '&order=' + orderSelector.value;

    fetch(url, {method: 'get'})

    .then((response) => response.json())

    .then(function(days) {
        console.log(days);
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
        console.log(labels);
        console.log(newCasesData);
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
        let chart = new Chartist.Bar('#state-new-cases-chart', data, options);

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
                let caption = '<b>Date:</b> ' + label + '<br><b>New cases (' + stateName + '):</b> ' + value;
                $(toolTipSelector).html(caption);
                $(toolTipSelector).parent().css({position: 'relative'});
                // bring to front, https://stackoverflow.com/questions/3233219/is-there-a-way-in-jquery-to-bring-a-div-to-front
                $(toolTipSelector).parent().append($(toolTipSelector));

                let x = e.clientX;
                let y = e.clientY;
                $(toolTipSelector).css({top: y, left: x, position:'fixed', display: 'block'});
            });

            $('.state-new-cases-chart .ct-bar').on('mouseout', function() {
                $(toolTipSelector).css({display: 'none'});
            });
        });
    })

    // Log the error if anything went wrong during the fetch.
    .catch(function(error) {
        console.log(error);
    });
}