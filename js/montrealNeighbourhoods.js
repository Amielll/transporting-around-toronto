// Start application by loading the data
import * as d3 from "d3";
import { MapVis } from "./visualizations/neighbourhoodsMapVis.js";

let valueData, geoData, bikeshareData, bikeRackData, choroplethVis1, choroplethVis2;

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
    let see2 = d3.select("#vis-toggle").property("checked");

    let visible1, visible2;
    if (see2 == false) {
        visible1 = "visible";
        visible2 = "hidden";
    } else {
        visible1 = "hidden";
        visible2 = "visible";
    } 

    d3.select("#map-div")
        .style("visibility", visible1);

    d3.select("#map-div2")
        .style("visibility", visible2);

}

function toggleDots(type, state){
    if (state == true){
        d3.selectAll(`.${type}`).style("opacity", 0.5);
    } else {
        d3.selectAll(`.${type}`).style("opacity", 0);
    }
}

d3.select("#data-type1").on("change", () => updateChoropleth(1));
d3.select("#data-type2").on("change", () => updateChoropleth(2));
d3.select("#vis-toggle").on("change", () => changeOpacity());
d3.select("#toggle-bike-rack").on("change", () => toggleDots("bikerack", d3.select("#toggle-bike-rack").property("checked")));
d3.select("#toggle-bike-share").on("change", () => toggleDots("bikeshare", d3.select("#toggle-bike-share").property("checked")));

let promises = [
    d3.csv("data/neighbourhoods.csv"),
    d3.json("data/Neighbourhoods.geojson"),
    d3.json("data/bike_share_stations_2024-01.json")
];

Promise.all(promises)
    .then( function(data){ initMainPage(data) })
    .catch( function (err){console.log(err)} );

// initMainPage
function initMainPage(allDataArray) {
    valueData = allDataArray[0];
    geoData = allDataArray[1];
    bikeshareData = allDataArray[2];
    bikeRackData = allDataArray[3];

    choroplethVis2 = new MapVis("map-div2", valueData, geoData, bikeshareData, bikeRackData, "bicycle_commuters", "green", 2);
    choroplethVis1 = new MapVis("map-div", valueData, geoData, bikeshareData, bikeRackData, "average_income", "blue", 1);
    choropleths =  [choroplethVis1, choroplethVis2];
}