import {TorBikeshareController} from "./controllers/torBikeshareController.js";
import {DataManager} from "./util/dataManager.js";
import {SingleNeighbourhoodController} from "./controllers/singleNeighbourhoodController.js";
import { CityBikeshareCompController } from "./controllers/cityBikeshareCompController.js";
import {TorNeighbourhoodsController} from "./controllers/torNeighbourhoodsController.js";
import { CitiesScoreController } from "./controllers/citiesScoreController.js";
import {NeighbourhoodScatterController} from "./controllers/neighbourhoodScatterController.js";

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
    torNeighbourhoodsController.initController();
    torBikeshareController.initController();
    singleNeighbourhoodController.initController();
    cityBikeshareCompController.initController();
    citiesScoreController.initController();
    neighbourhoodScatterController.initController();
}

// main entrypoint for the project
main()
    .then(() => console.log("Project loaded"))
    .catch((error) => console.error(error));