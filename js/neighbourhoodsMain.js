// Start application by loading the data

let valueData, geoData, choroplethVis1, choroplethVis2;

let choropleths =  [choroplethVis1, choroplethVis2];

function updateChoropleth(number){
    let newVar;
    switch (number){
        case 1:
            newVar = d3.select("#data-type1").property("value");
            break;
        case 2:
            newVar = d3.select("#data-type2").property("value");
            break;
        default:
            console.log("Error occurred");
    }
    
    choropleths[number - 1].wrangleData(newVar);
}

function changeOpacity(){
    let slider = d3.select("#vis-toggle").property("value");

    let visible1, visible2;
    if (slider == 0) {
        visible1 = "visible";
        visible2 = "hidden";
    } else if (slider == 100) {
        visible1 = "hidden";
        visible2 = "visible";
    } else {
        visible1 = "visible";
        visible2 = "visible";
    }

    console.log(slider)
    d3.select("#map-div")
        .style("visibility", visible1)
        .style("opacity", `${100-slider}%`);

    d3.select("#map-div2")
        .style("visibility", visible2)
        .style("opacity", `${slider}%`);

    choroplethVis2.opacity = slider;
}

d3.select("#data-type1").on("change", () => updateChoropleth(1));
d3.select("#data-type2").on("change", () => updateChoropleth(2));
d3.select("#vis-toggle").on("change", () => changeOpacity());

let promises = [
    d3.csv("data/neighbourhoods.csv"),
    d3.json("data/Neighbourhoods.geojson")
];

Promise.all(promises)
    .then( function(data){ initMainPage(data) })
    .catch( function (err){console.log(err)} );

// initMainPage
function initMainPage(allDataArray) {
    valueData = allDataArray[0];
    geoData = allDataArray[1];

    choroplethVis2 = new MapVis("map-div2", valueData, geoData, "bicycle_commuters", "green", 2);
    choroplethVis1 = new MapVis("map-div", valueData, geoData, "average_income_2020", "blue", 1);
    choropleths =  [choroplethVis1, choroplethVis2];
}