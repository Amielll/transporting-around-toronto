import * as d3 from "d3";
import {MapVis} from "../neighbourhoodsMapVis.js";
import {DataManager} from "../util/dataManager.js";

export class TorNeighbourhoodsController {
    constructor() {
        this.choropleths = [];
    }

    initController() {
        let dm = new DataManager();
        let { torNeighbourhoodData, torMapData, torStationInfo, torBikeRackData } = dm.data;
        let choroplethVis1 = new MapVis("map-div", torNeighbourhoodData, torMapData, torStationInfo, torBikeRackData, "average_income", "blue", 1);
        let choroplethVis2 = new MapVis("map-div2", torNeighbourhoodData, torMapData, torStationInfo, torBikeRackData, "bicycle_commuters", "green", 2);

        this.choropleths = [choroplethVis1, choroplethVis2];
        this.setupListeners();
    }

    setupListeners() {
        d3.select("#data-type1").on("change", () => this.updateChoropleth(1));
        d3.select("#data-type2").on("change", () => this.updateChoropleth(2));
        d3.select("#vis-toggle").on("change", () => this.changeOpacity());
        d3.select("#toggle-bike-rack").on("change", () => {
            this.toggleDots("bikerack", d3.select("#toggle-bike-rack").property("checked"))
        });
        d3.select("#toggle-bike-share").on("change", () => {
            this.toggleDots("bikeshare", d3.select("#toggle-bike-share").property("checked"))
        });
    }

    changeOpacity(){
        let see2 = d3.select("#vis-toggle").property("checked");

        let visible1, visible2;
        if (see2 == false) {
            visible1 = "visible";
            visible2 = "hidden";
        } else {
            visible1 = "hidden";
            visible2 = "visible";
        }

        d3.select("#map-div")
            .style("visibility", visible1);

        d3.select("#map-div2")
            .style("visibility", visible2);

    }

    updateChoropleth(number){
        let newVar;
        switch (number){
            case 1:
                newVar = d3.select("#data-type1").property("value");
                break;
            case 2:
                newVar = d3.select("#data-type2").property("value");
                break;
            default:
                console.log("Error occurred");
        }

        this.choropleths[number - 1].wrangleData(newVar);
    }

    toggleDots(type, state){
        if (state == true){
            d3.selectAll(`.${type}`).style("opacity", 0.4);
        } else {
            d3.selectAll(`.${type}`).style("opacity", 0);
        }
    }
}