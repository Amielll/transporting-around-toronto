import {DataManager} from "../util/dataManager.js";
import * as d3 from "d3";
import { CityBikeLaneMapVis } from "../visualizations/cityBikeLaneMapVis.js";

export class CityBikeLaneController {

    constructor() {
    }

    initController() {
        let {mtlBikeLaneData, mtlMapData, torBikeLaneData, torMapData,
            vanBikeLaneData, vanMapData} = new DataManager().data;

        // Sets up the Toronto, Montreal and Vancouver maps.
        this.torMapVis = new CityBikeLaneMapVis('tor-bikelane-map-area',
            torMapData, torBikeLaneData, null);
        this.mtlMapVis = new CityBikeLaneMapVis('mtl-bikelane-map-area',
            mtlMapData, mtlBikeLaneData, null);
        this.vanMapVis = new CityBikeLaneMapVis('van-bikelane-map-area',
            vanMapData, vanBikeLaneData, null);

        // Sets up the listener for the toggle switch that toggles between the Vancouver and Montreal maps.
        this.setupListener();
    }

    setupListener() {
        // Sets up the listener for the toggle switch that toggles between the Vancouver and Montreal maps.
        d3.select("#mtl-lane-btn")
            .on("click", () => {
                d3.select("#mtl-bikelane-map-area")
                    .style("display", "block");
                d3.select("#van-bikelane-map-area")
                    .style("display", "none");
            });
        d3.select("#van-lane-btn")
            .on("click", () => {
                d3.select("#mtl-bikelane-map-area")
                    .style("display", "none");
                d3.select("#van-bikelane-map-area")
                    .style("display", "block")
                    .style("visibility", "visible");
            });
    }

}