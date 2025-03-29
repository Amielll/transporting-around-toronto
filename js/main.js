import * as d3 from "d3";

import { SingleNeighbourhoodVis } from "./singleNeighbourhoodVis.js";
import { NeighbourhoodSelect } from './singleNeighbourhoodSelect.js';
import { MontrealBikeshareMapVis } from './montrealMapVis.js';
import { TorBikeshareController } from "./controllers/torBikeshareController.js";
import {DataManager} from "./util/dataManager.js";

let montrealBikeshareMapVis, neighbourhoodSelect, singleNeighbourhoodVis;

export function toggleDots(type, state){
    if (state == true){
        d3.selectAll(`.single-${type}`).style("opacity", 1);
    } else {
        d3.selectAll(`.single-${type}`).style("opacity", 0);
    }
}

d3.select("#toggle-bike-rack-single").on("change", () => toggleDots("bikerack", d3.select("#toggle-bike-rack-single").property("checked")));
d3.select("#toggle-bike-share-single").on("change", () => toggleDots("bikeshare", d3.select("#toggle-bike-share-single").property("checked")));
d3.select("#toggle-bike-path-single").on("change", () => toggleDots("lanes", d3.select("#toggle-bike-path-single").property("checked")));

async function main() {
    let dataManager = new DataManager();
    await dataManager.loadData();

    let montrealStationData = dataManager.data.mtlStationData;
    let montrealTripData = dataManager.data.mtlTripData;
    let montrealMapData = dataManager.data.mtlMapData;
    let stationInfo = dataManager.data.torStationInfo;
    let tripData = dataManager.data.torTripData;
    let mapData = dataManager.data.torMapData;
    let demographicData = dataManager.data.torDemographicData;
    let bikeRackData = dataManager.data.torBikeRackData;
    let bikeLaneData = dataManager.data.torBikeLaneData;
    let stationData = dataManager.data.torStationData;

    let torBikeshareController = new TorBikeshareController();
    torBikeshareController.initController();
    montrealBikeshareMapVis = new MontrealBikeshareMapVis('montreal-bikeshare-map-area',
        montrealStationData, montrealTripData, montrealMapData);
    singleNeighbourhoodVis = new SingleNeighbourhoodVis('nb-vis', stationInfo,
        tripData, mapData, demographicData, bikeRackData, bikeLaneData);
    neighbourhoodSelect = new NeighbourhoodSelect('nb-selector', mapData, singleNeighbourhoodVis);
}

main()
    .then(() => console.log("Project loaded"))
    .catch((error) => console.error(error));