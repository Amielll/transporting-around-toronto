import {BaseMapVis} from "./baseMapVis.js";
import * as d3 from "d3";

export class BikeshareMapVis extends BaseMapVis {

    constructor(parentElement, geoData, eventHandler, stationData, config={}) {
        super(parentElement, geoData, eventHandler, config);
        this.stationData = stationData;
        this.selectedStationId = null;
        this.initVis();
    }

    initVis() {
        let vis = this;
        super.initVis();

        // Represent stations as dots on the map
        vis.stationDots = vis.map.selectAll("circle")
            .data(vis.stationData, d => d.id);

        // TODO: use this for toggling station dot size relative to selected variable?
        vis.radiusScale = d3.scaleLinear()
            .domain([1, 8])
            .range([3, 0.5])
            .clamp(true);

        // Zoom/pan functionality
        vis.zoomFunction = function(event) {
            vis.map.attr("transform", event.transform);
            vis.updateVis();
        }

        vis.zoom = d3.zoom()
            .scaleExtent([1,8])
            .translateExtent([[0,0], [vis.width, vis.height]])
            .on("zoom", vis.zoomFunction);

        vis.mapContainer.call(vis.zoom);

        // Next step in vis pipeline
        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        // Associate each station with the neighbourhood it's in
        vis.stationData.forEach(station => {
            const point = [station.longitude, station.latitude];
            const neighbourhoodFeature = vis.geoData.features.find(feature => d3.geoContains(feature, point));
            station.neighbourhood = neighbourhoodFeature.properties.AREA_NAME;
        });

        vis.updateVis();
    }

    updateVis() {
        let vis = this;
        super.updateVis(); // map path update

        // draw dots and set up listener
        vis.stationDots = vis.map.selectAll("circle")
            .data(vis.stationData, d => d.id);

        vis.stationDots.enter()
            .append("circle")
            .attr("class", "station")
            .attr("cx", d => vis.projection([d.longitude, d.latitude])[0])
            .attr("cy", d => vis.projection([d.longitude, d.latitude])[1])
            .attr("r", 1.5)
            .on("click", function(event, d) {
                d3.select(this).raise(); // 'this' refers to the clicked dot (not the vis)
                vis.eventHandler.trigger("selectionChanged", d);
            })
            .merge(vis.stationDots)
            .attr("class", d => d.id === vis.selectedStationId ? "station selected" : "station");
    }

    onSelectionChange(selectedStation) {
        let vis = this;

        if (selectedStation.id === vis.selectedStationId) {
            // this was already selected, deselect
            vis.selectedStationId = null;
            vis.resetZoom();
        } else {
            // set new selected station
            vis.selectedStationId = selectedStation.id;
            vis.updateZoom(selectedStation);
        }

        vis.updateVis();
    }

    updateZoom(d) {
        let vis = this;
        const [x, y] = vis.projection([d.longitude, d.latitude]);
        const scale = 8;

        const translateX = vis.width / 2 - scale * x;
        const translateY = vis.height / 2 - scale * y;

        // Apply the new transform with a smooth transition
        vis.mapContainer.transition().duration(750).call(
            vis.zoom.transform,
            d3.zoomIdentity.translate(translateX, translateY).scale(scale)
        );
    }

    resetZoom() {
        let vis = this;
        vis.mapContainer.transition().duration(750).call(
            vis.zoom.transform,
            d3.zoomIdentity
        );
    }
}