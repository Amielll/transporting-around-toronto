import {DataManager} from "../util/dataManager.js";
import {SingleNeighbourhoodVis} from "../singleNeighbourhoodVis.js";
import {NeighbourhoodSelect} from "../singleNeighbourhoodSelect.js";
import * as d3 from "d3";

export class SingleNeighbourhoodController {
    constructor() {
    }

    initController() {
        let {torStationInfo, torMapData, torNeighbourhoodData, torBikeRackData, torBikeLaneData} = new DataManager().data;
        this.mapVis = new SingleNeighbourhoodVis('nb-vis', torStationInfo,
            torMapData, torNeighbourhoodData, torBikeRackData, torBikeLaneData);
        this.mapSelectVis = new NeighbourhoodSelect('nb-selector', torMapData, this.mapVis);
        this.setupListeners();
    }

    setupListeners() {
        d3.select("#toggle-bike-rack-single").on("change", () => {
            this.toggleDots("bikerack", d3.select("#toggle-bike-rack-single").property("checked"))
        });
        d3.select("#toggle-bike-share-single").on("change", () => {
            this.toggleDots("bikeshare", d3.select("#toggle-bike-share-single").property("checked"))
        });
        d3.select("#toggle-bike-path-single").on("change", () => {
            this.toggleDots("lanes", d3.select("#toggle-bike-path-single").property("checked"))
        });
    }

    toggleDots(type, state){
        if (state == true){
            d3.selectAll(`.single-${type}`).style("opacity", 1);
        } else {
            d3.selectAll(`.single-${type}`).style("opacity", 0);
        }
    }
}