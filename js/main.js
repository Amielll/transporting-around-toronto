import * as d3 from "d3";
import {TorBikeshareController} from "./controllers/torBikeshareController.js";
import {DataManager} from "./util/dataManager.js";
import {SingleNeighbourhoodController} from "./controllers/singleNeighbourhoodController.js";
import { CityBikeshareCompController } from "./controllers/cityBikeshareCompController.js";
import {TorNeighbourhoodsController} from "./controllers/torNeighbourhoodsController.js";
import { CitiesScoreController } from "./controllers/citiesScoreController.js";
import {NeighbourhoodScatterController} from "./controllers/neighbourhoodScatterController.js";
import { CityBikeLaneController } from "./controllers/cityBikeLaneController.js";

async function main() {
    // load data
    let dataManager = new DataManager();
    await dataManager.loadData();

    // initialize controllers
    let torNeighbourhoodsController = new TorNeighbourhoodsController();
    let torBikeshareController = new TorBikeshareController();
    let singleNeighbourhoodController = new SingleNeighbourhoodController();
    let cityBikeshareCompController = new CityBikeshareCompController();
    let citiesScoreController = new CitiesScoreController();
    let neighbourhoodScatterController = new NeighbourhoodScatterController();
    let cityBikeLaneController = new CityBikeLaneController();
    torNeighbourhoodsController.initController();
    torBikeshareController.initController();
    singleNeighbourhoodController.initController();
    cityBikeshareCompController.initController();
    citiesScoreController.initController();
    neighbourhoodScatterController.initController();
    cityBikeLaneController.initController();
}

// main entrypoint for the project
main()
    .then(() => {
        d3.select("#loader")
            .style("display", "none");
        d3.select("#scroller-buttons")
            .style("visibility", "visible")
        console.log("Project loaded");
    })
    .catch((error) => console.error(error));