import {DataManager} from "../util/dataManager.js";
import * as d3 from "d3";
import { CityCompBikeshareMapVis } from "../visualizations/cityBikeshareCompMapVis.js";

export class CityBikeshareCompController {

    constructor() {
    }

    initController() {
        let {mtlStationData, mtlMapData, torStationData, torMapData,
            vanMapData, vanStationData} = new DataManager().data;

        // Sets up the Toronto, Montreal and Vancouver maps.
        this.torMapVis = new CityCompBikeshareMapVis('tor-bikeshare-comp-map-area',
            torMapData, torStationData, null);
        this.mtlMapVis = new CityCompBikeshareMapVis('mtl-bikeshare-comp-map-area',
            mtlMapData, mtlStationData, null);
        this.vanMapVis = new CityCompBikeshareMapVis('van-bikeshare-comp-map-area',
            vanMapData, vanStationData, null);

        // Sets up the listener for the toggle switch that toggles between the Vancouver and Montreal maps.
        this.setupListener();
    }

    setupListener() {
        // Sets up the listener for the toggle switch that toggles between the Vancouver and Montreal maps.
        d3.select("#mtl-city-comp-btn")
            .on("click", () => {
                d3.select("#mtl-bikeshare-comp-map-area")
                    .style("display", "block");
                d3.select("#van-bikeshare-comp-map-area")
                    .style("display", "none");
            });
        d3.select("#van-city-comp-btn")
            .on("click", () => {
                d3.select("#mtl-bikeshare-comp-map-area")
                    .style("display", "none");
                d3.select("#van-bikeshare-comp-map-area")
                    .style("display", "block")
                    .style("visibility", "visible");
            });
    }

}