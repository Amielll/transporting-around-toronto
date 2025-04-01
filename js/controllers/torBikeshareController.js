import { BikeshareMapVis } from "../visualizations/bikeshareMapVis.js";
import { HorizontalBarVis } from "../visualizations/horizontalBarVis.js";

import * as d3 from "d3";
import {DataManager} from "../util/dataManager.js";
import {SelectBarVis} from "../visualizations/selectBarVis.js";

export class TorBikeshareController {

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
    }

    initController() {
        const mapParent = 'bikeshare-station-map-vis';

        const barParent = 'bikeshare-station-bar-vis';
        const barTitle = 'Toronto Bike Share Top 10: Total Volume';
        const barMargin = { top: 20, right: 40, bottom: 20, left: 200 };

        const selectParent = 'tor-bikeshare-selected-station';
        const selectMargin = {top: 20, right: 20, bottom: 20, left: 20 };

        // Initialize visualizations
        let dm = new DataManager();
        let {torMapData, torStationData} = dm.data;
        this.mapVis = new BikeshareMapVis(mapParent, torMapData, this.eventHandler, torStationData);
        this.barVis = new HorizontalBarVis(barParent, barTitle, barMargin, torStationData, this.eventHandler);

        let scales = this.barVis.getScales(); // same scales for bar alignment
        this.selectBarVis = new SelectBarVis(selectParent, selectMargin, torStationData, scales, this.eventHandler);

        // Register visualizations in event handler
        this.eventHandler.bind("selectionChanged",(event) => {
            this.mapVis.onSelectionChange(event.detail);
            this.barVis.onSelectionChange(event.detail);
            this.selectBarVis.onSelectionChange(event.detail);
            this.updateSummary(event.detail);
        });

        const selectBoxId = '#bikeshare-station-variable';
        d3.select(selectBoxId).on("change", () => {
            let selectedVar = d3.select(selectBoxId).property("value");
            this.barVis.wrangleData(selectedVar);
            // scale from bar vis update after var change, need to update selectBar with new scale
            let scales = this.barVis.getScales();
            this.selectBarVis.setScales(scales);
            this.selectBarVis.wrangleData(selectedVar);
        });
    }

    updateSummary(station) {
        let summary = d3.select("#bikeshare-station-summary");
        let summaryName = d3.select("#bikeshare-summary-station-name");
        let summaryNeighbourhood = d3.select("#bikeshare-summary-station-neighbourhood");
        let summaryLocation = d3.select("#bikeshare-summary-station-location");
        summary.style("display", "block");
        summaryName.text(station.name);
        summaryNeighbourhood.text(station.neighbourhood);
        summaryLocation.text(station.latitude + ', ' + station.longitude);
        summaryLocation.attr("href", `https://www.google.com/maps/place/${station.latitude},${station.longitude}`);
        summaryLocation.attr("target", "_blank");
    }

}