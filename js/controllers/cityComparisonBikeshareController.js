import { BikeshareMapVis } from "../montrealVisualizations/bikeshareMapVis.js";
import { HorizontalBarVis } from "../montrealVisualizations/horizontalBarVis.js";

import * as d3 from "d3";
import {DataManager} from "../util/dataManager.js";

export class CityComparisonBikeshareController {

    constructor() {
        this.eventHandler = {
            bind: (eventName, handler) => {
                document.body.addEventListener(eventName, handler);
            },
            trigger: (eventName, extraParameters) => {
                document.body.dispatchEvent(new CustomEvent(eventName, {
                    detail: extraParameters
                }));
            }
        }
        this.initController();
    }

    initController() {
        const mapMargin = { top: 20, right: 20, bottom: 20, left: 20 };
        const torConfig = {
            selectionChangeEventName: "mtlSelectionChanged",
            mapParent : 'tor-bikeshare-comparison-vis',
            mapTitle : 'Toronto Bike Share Stations',
            cityName : 'Toronto',
        };
        const mtlConfig = {
            selectionChangeEventName : "mtlSelectionChanged",
            mapParent : 'mtl-bikeshare-comparison-vis',
            mapTitle : 'Montreal Bike Share Stations',
            cityName : 'Montreal',
        };
        const vanConfig = {
            mapParent : 'van-bikeshare-comparison-vis',
            mapTitle : 'Vancouver Bike Share Stations',
            cityName : 'Vancouver',
        };

        // Initialize visualizations
        let dm = new DataManager();
        let {torStationData, torMapData, mtlStationData, mtlMapData, vanStationData, vanMapData } = dm.data;
        console.log('data', torStationData, torMapData, mtlStationData, mtlMapData, vanStationData, vanMapData);
        this.torMapVis = new BikeshareMapVis(torConfig.mapParent, torConfig.title, mapMargin, torStationData, torMapData, torConfig, this.eventHandler);
        this.mtlMapVis = new BikeshareMapVis(mtlConfig.mapParent, mtlConfig.title, mapMargin, mtlStationData, mtlMapData, mtlConfig, this.eventHandler);
        this.vanMapVis = new BikeshareMapVis(vanConfig.mapParent, vanConfig.title, mapMargin, vanStationData, vanMapData, vanConfig, this.eventHandler);

        // this.barVis = new HorizontalBarVis(barParent, barTitle, barMargin, this.stationData, this.eventHandler);

        // const stationChangeEventName = this.DOMInfo.selectionChangeEventName;
        // // Register visualizations in event handler (needs to be arrow function so that 'this' refers to controller)
        // this.eventHandler.bind(stationChangeEventName, (event) => {
        //     this.mapVis.onSelectionChange(event.detail);
        //     this.barVis.onSelectionChange(event.detail);
        //     this.updateSummary(event.detail);
        // });

        // document.addEventListener("DOMContentLoaded", () => {
        //     const selectElement = document.getElementById(this.DOMInfo.metric);
        //     selectElement.addEventListener('change', (e) => {
        //         this.barVis.wrangleData(e.target.value);
        //     });
        // });
    }

    // updateSummary(station) {
    //     let summary = d3.select(this.DOMInfo.summary);
    //     let summaryName = d3.select(this.DOMInfo.summaryName);
    //     let summaryID = d3.select(this.DOMInfo.summaryID);
    //     let summaryNeighbourhood = d3.select(this.DOMInfo.summaryNeighbourhood);
    //     let summaryLocation = d3.select(this.DOMInfo.summaryLocation);

    //     summary.style("display", "block");
    //     summaryName.text(station.name);
    //     summaryID.text(station.id);
    //     summaryNeighbourhood.text(station.neighbourhood);
    //     summaryLocation.text(station.latitude + ', ' + station.longitude);
    //     summaryLocation.attr("href", `https://www.google.com/maps/place/${station.latitude},${station.longitude}`);
    //     summaryLocation.attr("target", "_blank");
    // }

}

export function changeCompOpacity(){
    let compToggle = d3.select("#toggle-city-comp").property("checked");

    let visible1, visible2;
    if (compToggle == false) {
        visible1 = "visible";
        visible2 = "hidden";
    } else {
        visible1 = "hidden";
        visible2 = "visible";
    } 

    d3.select("#mon-bikeshare-comparison-vis")
        .style("visibility", visible1);

    d3.select("#van-bikeshare-comparison-vis")
        .style("visibility", visible2);
}