import * as d3 from "d3";
import { BikeshareMapVis } from './mapVis.js';
let bikeshareMapVis;

// TODO: Combine the main.js / neighbourhoodsMain.js load data/init visualization stuff into a single file
// TODO: Keep the helper functions like changeOpacity or whatever else comes up in respective util files
let bikesharePromises = [
    d3.json("data/bike_share_stations_2024-01.json"),
    d3.csv("data/bike_share_trips_2024-01.csv"),
    d3.json('data/Neighbourhoods.geojson')
];

Promise.all(bikesharePromises)
    .then( function(data){ initProject(data) })
    .catch( function (err){console.log(err)} );

function initProject(allDataArray) {
    console.log(allDataArray);
    let stationData = allDataArray[0];
    let tripData = allDataArray[1];
    let mapData = allDataArray[2];
    bikeshareMapVis = new BikeshareMapVis('bikeshare-map-area', stationData, tripData, mapData);
}