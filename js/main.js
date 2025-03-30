import {TorBikeshareController} from "./controllers/torBikeshareController.js";
import {DataManager} from "./util/dataManager.js";
import {SingleNeighbourhoodController} from "./controllers/singleNeighbourhoodController.js";
import {MtlBikeshareController} from "./controllers/mtlBikeshareController.js";
import {TorNeighbourhoodsController} from "./controllers/torNeighbourhoodsController.js";

async function main() {
    // load data
    let dataManager = new DataManager();
    await dataManager.loadData();

    // initialize controllers
    let torNeighbourhoodsController = new TorNeighbourhoodsController();
    let torBikeshareController = new TorBikeshareController();
    let singleNeighbourhoodController = new SingleNeighbourhoodController();
    let mtlBikeshareController = new MtlBikeshareController();
    torNeighbourhoodsController.initController();
    torBikeshareController.initController();
    singleNeighbourhoodController.initController();
    mtlBikeshareController.initController();
}

// main entrypoint for the project
main()
    .then(() => console.log("Project loaded"))
    .catch((error) => console.error(error));