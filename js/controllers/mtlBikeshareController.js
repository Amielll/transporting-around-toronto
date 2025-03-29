import {DataManager} from "../util/dataManager.js";
import * as d3 from "d3";
import {MontrealBikeshareMapVis} from "../montrealMapVis.js";

export class MtlBikeshareController {

    constructor() {
    }

    initController() {
        let {mtlStationData, mtlTripData, mtlMapData} = new DataManager().data;
        this.mapVis = new MontrealBikeshareMapVis('montreal-bikeshare-map-area',
            mtlStationData, mtlTripData, mtlMapData);
    }

}