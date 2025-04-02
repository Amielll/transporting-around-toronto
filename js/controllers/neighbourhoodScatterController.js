import {ScatterPlotVis} from "../visualizations/scatterPlotVis.js";
import {DataManager} from "../util/dataManager.js";
import * as d3 from "d3";

export class NeighbourhoodScatterController {
    constructor() {
    }

    initController() {
        let parentElement = "neighbourhood-scatterplot-vis-area";
        let dm = new DataManager();
        let {torNeighbourhoodData, torStationInfo, torBikeRackData} = dm.data;
        this.scatterVis = new ScatterPlotVis(parentElement, torNeighbourhoodData, torStationInfo, torBikeRackData);

        d3.select("#scatter-select-x").on("change", () => {
            let selectedX = d3.select("#scatter-select-x").property("value");
            let selectedY = this.scatterVis.selectedY;
            this.scatterVis.wrangleData(selectedX, selectedY);
        });

        d3.select("#scatter-select-y").on("change", () => {
            let selectedX = this.scatterVis.selectedX;
            let selectedY = d3.select("#scatter-select-y").property("value");
            this.scatterVis.wrangleData(selectedX, selectedY);
        });

    }
}