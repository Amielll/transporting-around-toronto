import * as d3 from "d3";

import { SingleNeighbourhoodVis } from "./singleNeighbourhoodVis.js";
import { NeighbourhoodSelect } from './singleNeighbourhoodSelect.js';
import { BikeshareMapVis } from './bikeshareMapVis.js';
import { BarVis } from './barVis.js';
import { MontrealBikeshareMapVis } from './montrealMapVis.js';


let bikeshareMapVis, bikeshareBarVis, montrealBikeshareMapVis, neighbourhoodSelect, singleNeighbourhoodVis;
let selectedCategory = 'totalVolume';


// TODO: Combine the main.js / neighbourhoodsMain.js load data/init visualization stuff into a single file
// TODO: Keep the helper functions like changeOpacity or whatever else comes up in respective util files
let bikesharePromises = [
    d3.json("data/bike_share_stations_2024-01.json"),
    d3.json('data/bike_share_stationStatus.json'),
    d3.csv("data/bike_share_trips_2024-01.csv"),
    d3.json('data/Neighbourhoods.geojson'),
    d3.json("data/montreal_station_information_cleaned.json"),
    d3.csv("data/Montreal Trip Counts.csv"),
    d3.json('data/montreal-neighbourhoods.geojson'),
    d3.csv("data/neighbourhoods.csv"),
    d3.json("data/bike_racks_data.geojson"),
    d3.json("data/cycling-network - 4326.geojson"),
];

Promise.all(bikesharePromises)
    .then( function(data){ initProject(data) })
    .catch( function (err){console.log(err)} );

export function toggleDots(type, state){
    if (state == true){
        d3.selectAll(`.single-${type}`).style("opacity", 1);
    } else {
        d3.selectAll(`.single-${type}`).style("opacity", 0);
    }
}

d3.select("#toggle-bike-rack-single").on("change", () => toggleDots("bikerack", d3.select("#toggle-bike-rack-single").property("checked")));
d3.select("#toggle-bike-share-single").on("change", () => toggleDots("bikeshare", d3.select("#toggle-bike-share-single").property("checked")));

function initProject(allDataArray) {
    let stationInfo = allDataArray[0];
    let stationStatus = allDataArray[1];
    let tripData = allDataArray[2];
    let mapData = allDataArray[3];
    let montrealStationData = allDataArray[4];
    let montrealTripData = allDataArray[5];
    let montrealMapData = allDataArray[6];
    let demographicData = allDataArray[7];
    let bikeRackData = allDataArray[8];
    let bikeLaneData = allDataArray[9];

    let stationData = processStationData(stationInfo, stationStatus, tripData);

    let eventHandler = {
        bind: (eventName, handler) => {
            document.body.addEventListener(eventName, handler);
        },
        trigger: (eventName, extraParameters) => {
            document.body.dispatchEvent(new CustomEvent(eventName, {
                detail: extraParameters
            }));
        }
    }

    bikeshareMapVis = new BikeshareMapVis('bikeshare-station-map-vis', stationData, mapData, eventHandler);
    bikeshareBarVis = new BarVis('bikeshare-station-bar-vis', stationData, eventHandler);
    montrealBikeshareMapVis = new MontrealBikeshareMapVis('montreal-bikeshare-map-area',
        montrealStationData, montrealTripData, montrealMapData);
    singleNeighbourhoodVis = new SingleNeighbourhoodVis('nb-vis', stationInfo, tripData, mapData, demographicData, bikeRackData, bikeLaneData);
    neighbourhoodSelect = new NeighbourhoodSelect('nb-selector', mapData, singleNeighbourhoodVis);

    eventHandler.bind("selectionChanged", function(event) {
        console.log(event);
        bikeshareBarVis.onSelectionChange(event.detail);
        bikeshareMapVis.onSelectionChange(event.detail);
        updateSummary(event.detail);
    });

    window.addEventListener("load", document.getElementById('bikeshare-station-metric').addEventListener('change', function(e) {
        console.log('Selected option:', e.target.value);
        bikeshareBarVis.wrangleData(e.target.value);
    }), false);
}

function processStationData(stationInfo, stationStatus, tripData) {
    let stationData = []

    stationInfo.forEach((station) => {
        let stationDataEntry = {};
        stationDataEntry.id = `${station["Station Id"]}`;
        stationDataEntry.name = station["Station Name"];
        stationDataEntry.latitude = station["Latitude"];
        stationDataEntry.longitude = station["Longitude"];
        stationDataEntry.statusSamples = []
        if (stationDataEntry.id in stationStatus) {
            stationDataEntry.statusSamples = stationStatus[stationDataEntry.id]["samples"];
        }

        let filteredStartTrips = tripData.filter(tripDataEntry => tripDataEntry["Start Station Id"] === stationDataEntry.id);
        let filteredEndTrips = tripData.filter(tripDataEntry => tripDataEntry["End Station Id"] === stationDataEntry.id);

        stationDataEntry.asStartingCount = filteredStartTrips.reduce((runningSum, trip) => runningSum + +trip['Count'], 0);
        stationDataEntry.asDestCount = filteredEndTrips.reduce((runningSum, trip) => runningSum + +trip['Count'], 0);
        stationDataEntry.totalVolume = stationDataEntry.asStartingCount + stationDataEntry.asDestCount;

        let totalDurationAsStart = filteredStartTrips.reduce((runningSum, trip) => runningSum + +trip['Total Duration'], 0);
        let totalDurationAsDest = filteredEndTrips.reduce((runningSum, trip) => runningSum + +trip['Total Duration'], 0);
        let totalDuration = totalDurationAsStart + totalDurationAsDest;

        stationDataEntry.avgDurationAsStart = totalDurationAsStart / stationDataEntry.asStartingCount;
        stationDataEntry.avgDurationAsDest = totalDurationAsStart / stationDataEntry.asDestCount;
        stationDataEntry.avgDuration = totalDuration / stationDataEntry.totalVolume;
        stationData.push(stationDataEntry);
    });

    return stationData;
}

function updateSummary(station) {
    let summary = d3.select("#bikeshare-station-summary");
    let summaryName = d3.select("#bikeshare-summary-station-name");
    let summaryID = d3.select("#bikeshare-summary-station-id");
    let summaryNeighbourhood = d3.select("#bikeshare-summary-station-neighbourhood");
    let summaryLocation = d3.select("#bikeshare-summary-station-location");
    summary.style("display", "block");
    summaryName.text(station.name);
    summaryID.text(station.id);
    summaryNeighbourhood.text(station.neighbourhood);
    summaryLocation.text(station.latitude + ', ' + station.longitude);
    summaryLocation.attr("href", `https://www.google.com/maps/place/${station.latitude},${station.longitude}`);
    summaryLocation.attr("target", "_blank");
}
