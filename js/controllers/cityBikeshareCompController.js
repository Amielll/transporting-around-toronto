import {DataManager} from "../util/dataManager.js";
import * as d3 from "d3";
import { CityCompBikeshareMapVis } from "../visualizations/cityBikeshareCompMapVis.js";

export class CityBikeshareCompController {

    constructor() {
    }

    initController() {
        let {mtlStationData, mtlMapData} = new DataManager().data;
        this.mapVis = new CityCompBikeshareMapVis('montreal-bikeshare-map-area',
            mtlMapData, mtlStationData, null);
    }

}