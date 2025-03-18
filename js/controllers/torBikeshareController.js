import { BikeshareMapVis } from "../visualizations/bikeshareMapVis.js";
import { HorizontalBarVis } from "../visualizations/horizontalBarVis.js";

import * as d3 from "d3";

export class TorBikeshareController {

    constructor(stationData, geoData) {
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
        this.stationData = stationData;
        this.geoData = geoData;
        this.initController();
    }

    initController() {
        const mapParent = 'bikeshare-station-map-vis';
        const mapTitle = 'Toronto Bike Share Stations';
        const mapMargin = { top: 20, right: 20, bottom: 20, left: 20 };

        const barParent = 'bikeshare-station-bar-vis';
        const barTitle = 'Toronto Bike Share Top 10: Total Volume';
        const barMargin = { top: 20, right: 40, bottom: 20, left: 200 };

        // Initialize visualizations
        this.mapVis = new BikeshareMapVis(mapParent, mapTitle, mapMargin, this.stationData, this.geoData, this.eventHandler);
        this.barVis = new HorizontalBarVis(barParent, barTitle, barMargin, this.stationData, this.eventHandler);

        // Register visualizations in event handler (needs to be arrow function so that 'this' refers to controller)
        this.eventHandler.bind("selectionChanged",(event) => {
            this.mapVis.onSelectionChange(event.detail);
            this.barVis.onSelectionChange(event.detail);
            this.updateSummary(event.detail);
        });
    }

    updateSummary(station) {
        let summary = d3.select("#bikeshare-station-summary");
        let summaryName = d3.select("#bikeshare-summary-station-name");
        let summaryID = d3.select("#bikeshare-summary-station-id");
        let summaryNeighbourhood = d3.select("#bikeshare-summary-station-neighbourhood");
        let summaryLocation = d3.select("#bikeshare-summary-station-location");
        summary.style("display", "block");
        summaryName.text(station.name);
        summaryID.text(station.id);
        summaryNeighbourhood.text(station.neighbourhood);
        summaryLocation.text(station.latitude + ', ' + station.longitude);
        summaryLocation.attr("href", `https://www.google.com/maps/place/${station.latitude},${station.longitude}`);
        summaryLocation.attr("target", "_blank");
    }

}