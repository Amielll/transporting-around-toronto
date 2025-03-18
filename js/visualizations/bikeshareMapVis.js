import {BaseMapVis} from "./baseMapVis.js";
import * as d3 from "d3";

export class BikeshareMapVis extends BaseMapVis {

    constructor(parentElement, title, margin, stationData, geoData, eventHandler) {
        super(parentElement, title, margin, geoData, eventHandler);
        this.stationData = stationData;
        this.initVis();
    }

    initVis() {
        let vis = this;
        super.initVis();

        // Represent stations as dots on the map
        vis.stationDots = vis.map.selectAll("circle")
            .data(vis.stationData, d => d.id);

        vis.radiusScale = d3.scaleLinear()
            .domain([1, 8])
            .range([3, 0.5])
            .clamp(true);

        // Draw station dots and set up click listener
        vis.stationDots.enter()
            .append("circle")
            .attr("class", "station")
            .attr("cx", d => vis.projection([d.longitude, d.latitude])[0])
            .attr("cy", d => vis.projection([d.longitude, d.latitude])[1])
            .attr("r", vis.radiusScale(1))
            .attr("fill", "steelblue")
            .attr("stroke", "#fff")
            .attr("cursor", "pointer")
            .attr("stroke-width", vis.radiusScale(1) / 4)
            .on("click", (event, d) => vis.eventHandler.trigger("selectionChanged", d));

        // Zoom/pan functionality
        vis.zoomFunction = function(event) {
            vis.map.attr("transform", event.transform);
            vis.map.selectAll(".station")
                .attr("r", vis.radiusScale(event.transform.k))
                .attr("stroke-width", vis.radiusScale(event.transform.k) / 4)

            vis.updateVis();
        }

        vis.zoom = d3.zoom()
            .scaleExtent([1,8])
            .translateExtent([[0,0], [vis.width, vis.height - vis.mapYOffset]])
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
        super.updateVis();
    }

    onSelectionChange(selectedStation) {
        let vis = this;

        vis.map.selectAll("circle.station")
            .transition().duration(750)
            .attr("fill", d => d.id === selectedStation.id ? "red" : "steelblue");

        vis.updateZoom(selectedStation);
    }

    updateZoom(d) {
        let vis = this;
        const [x, y] = vis.projection([d.longitude, d.latitude]);
        const scale = 8;

        const translateX = vis.width / 2 - scale * x;
        const translateY = (vis.height - vis.mapYOffset) / 2 - scale * y;

        // Apply the new transform with a smooth transition
        vis.mapContainer.transition().duration(750).call(
            vis.zoom.transform,
            d3.zoomIdentity.translate(translateX, translateY).scale(scale)
        );
    }
}