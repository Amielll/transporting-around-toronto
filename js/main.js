import * as d3 from "d3";
import { BikeshareMapVis } from './mapVis.js';
import { SingleNeighbourhoodVis } from "./singleNeighbourhoodVis.js";
import { NeighbourhoodSelect } from './singleNeighbourhoodSelect.js';
let bikeshareMapVis, singleNeighbourhoodVis;

// TODO: Combine the main.js / neighbourhoodsMain.js load data/init visualization stuff into a single file
// TODO: Keep the helper functions like changeOpacity or whatever else comes up in respective util files
let bikesharePromises = [
    d3.json("data/bike_share_stations_2024-01.json"),
    d3.csv("data/bike_share_trips_2024-01.csv"),
    d3.json('data/Neighbourhoods.geojson'),
    d3.csv("data/neighbourhoods.csv"),
    d3.json("data/bike_racks_data.geojson"),
    d3.json("data/cycling-network - 4326.geojson")
];

Promise.all(bikesharePromises)
    .then( function(data){ initProject(data) })
    .catch( function (err){console.log(err)} );

function initProject(allDataArray) {
    console.log(allDataArray);
    let stationData = allDataArray[0];
    let tripData = allDataArray[1];
    let mapData = allDataArray[2];
    let demographicData = allDataArray[3];
    let bikeRackData = allDataArray[4];
    let bikeLaneData = allDataArray[5];


    bikeshareMapVis = new BikeshareMapVis('bikeshare-map-area', stationData, tripData, mapData);
    singleNeighbourhoodVis = new SingleNeighbourhoodVis('nb-vis', stationData, tripData, mapData, demographicData, bikeRackData, bikeLaneData);
    neighbourhoodSelect = new NeighbourhoodSelect('nb-selector', mapData, singleNeighbourhoodVis);
}