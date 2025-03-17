import * as d3 from "d3";
import { BikeshareMapVis } from './mapVis.js';
let bikeshareMapVis, montrealBikeshareMapVis;

// TODO: Combine the main.js / neighbourhoodsMain.js load data/init visualization stuff into a single file
// TODO: Keep the helper functions like changeOpacity or whatever else comes up in respective util files
let bikesharePromises = [
    d3.json("data/bike_share_stations_2024-01.json"),
    d3.csv("data/bike_share_trips_2024-01.csv"),
    d3.json('data/Neighbourhoods.geojson'),
    d3.json("data/montreal_station_information.json"),
    d3.csv("data/DonneesOuvertes2025_0102.csv"),
    d3.json('data/montreal.geojson')
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

    let montrealStationData = allDataArray[3];
    let montrealTripData = allDataArray[4];
    let montrealMapData = allDataArray[5];
    montrealBikeshareMapVis = new BikeshareMapVis('montreal-bikeshare-map-area', montrealStationData,
        montrealTripData, montrealMapData);
}