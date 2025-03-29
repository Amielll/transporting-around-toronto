import * as d3 from "d3";

import { MontrealBikeshareMapVis } from './montrealMapVis.js';
import { TorBikeshareController } from "./controllers/torBikeshareController.js";
import {DataManager} from "./util/dataManager.js";
import {SingleNeighbourhoodController} from "./controllers/singleNeighbourhoodController.js";

let montrealBikeshareMapVis;

async function main() {
    let dataManager = new DataManager();
    await dataManager.loadData();

    let montrealStationData = dataManager.data.mtlStationData;
    let montrealTripData = dataManager.data.mtlTripData;
    let montrealMapData = dataManager.data.mtlMapData;

    let torBikeshareController = new TorBikeshareController();
    let singleNeighbourhoodController = new SingleNeighbourhoodController();

    torBikeshareController.initController();
    singleNeighbourhoodController.initController();

    montrealBikeshareMapVis = new MontrealBikeshareMapVis('montreal-bikeshare-map-area',
        montrealStationData, montrealTripData, montrealMapData);
}

main()
    .then(() => console.log("Project loaded"))
    .catch((error) => console.error(error));