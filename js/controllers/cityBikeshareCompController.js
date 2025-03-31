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
        this.monMapVis = new CityCompBikeshareMapVis('mtl-bikeshare-comp-map-area',
            mtlMapData, mtlStationData, null);
        this.monMapVis = new CityCompBikeshareMapVis('van-bikeshare-comp-map-area',
            vanMapData, vanStationData, null);

        // Sets up the listener for the toggle switch that toggles between the Vancouver and Montreal maps.
        this.setupListener();
    }

    setupListener() {
        // Sets up the listener for the toggle switch that toggles between the Vancouver and Montreal maps.
        d3.select("#city-comp-toggle")
            .on("change", () => {
                console.log("toggled");
                let checked = d3.select("#city-comp-toggle").property("checked");

                if (checked) {
                    d3.select("#van-bikeshare-comp-map-area")
                        .style("visibility", "visible");

                    d3.select("#mtl-bikeshare-comp-map-area")
                        .style("visibility", "hidden");
                } else {
                    d3.select("#van-bikeshare-comp-map-area")
                        .style("visibility", "hidden");

                    d3.select("#mtl-bikeshare-comp-map-area")
                        .style("visibility", "visible");
                }
            });
    }

}