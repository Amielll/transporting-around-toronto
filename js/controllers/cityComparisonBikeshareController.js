import { BikeshareMapVis } from "../montrealVisualizations/bikeshareMapVis.js";
import { HorizontalBarVis } from "../montrealVisualizations/horizontalBarVis.js";

import * as d3 from "d3";

export class CityComparisonBikeshareController {

    constructor(DOMInfo, stationData, geoData) {
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
        this.DOMInfo = DOMInfo;
        this.stationData = stationData;
        this.geoData = geoData;
        this.initController();
    }

    initController() {
        const mapParent = this.DOMInfo.mapParent;
        const mapTitle = this.DOMInfo.mapTitle;
        const mapMargin = { top: 20, right: 20, bottom: 20, left: 20 };

        const barParent = this.DOMInfo.barParent;
        const barTitle = this.DOMInfo.barTitle;
        const barMargin = { top: 20, right: 40, bottom: 20, left: 200 };

        // Initialize visualizations
        this.mapVis = new BikeshareMapVis(mapParent, mapTitle, mapMargin, this.stationData, this.geoData, this.eventHandler);
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