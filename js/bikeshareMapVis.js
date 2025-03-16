import * as d3 from "d3";

export class BikeshareMapVis {

    constructor(parentElement, stationData, mapData) {
        this.parentElement = parentElement;
        this.stationData = stationData;
        this.mapData = mapData;

        this.initVis();
    }

    initVis() {
        let vis = this;

        // Define margins and compute dimensions based on the parent element's size
        vis.margin = { top: 20, right: 20, bottom: 20, left: 20 };
        const container = document.getElementById(vis.parentElement).getBoundingClientRect();
        vis.width = container.width - vis.margin.left - vis.margin.right;
        vis.height = container.height - vis.margin.top - vis.margin.bottom;

        // Create the SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement)
            .append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr("transform", `translate(${vis.margin.left}, ${vis.margin.top})`);

        vis.mapYOffset = 20; // For clipping map below title section

        // Define the clipping region
        vis.svg.append("defs")
            .append("clipPath")
            .attr("id", "bikeshareMapClip")
            .append("rect")
            .attr('transform', `translate(0, ${vis.mapYOffset})`)
            .attr("width", vis.width)
            .attr("height", vis.height - vis.mapYOffset);

        // Add title
        vis.svg.append("g")
            .attr("class", "title")
            .attr("id",  "bikeshare-map-title")
            .append("text")
            .text("Toronto Bikeshare Station Volume")
            .attr('transform', `translate(${vis.width / 2}, 20)`)
            .attr("text-anchor", "middle");

        // Add tooltip
        vis.tooltip = d3.select("body")
            .append("div")
            .attr("class", "tooltip")
            .attr("id", "bikeshareMapTooltip")
            .style("opacity", 0)  // hidden by default
            .style("position", "absolute");

        // Create a projection that fits the GeoJSON data
        vis.projection = d3.geoMercator()
            .fitSize([vis.width, vis.height - vis.mapYOffset], vis.mapData);
        vis.path = d3.geoPath().projection(vis.projection);

        // Set up map group
        vis.mapContainer = vis.svg.append("g")
            .attr("transform", `translate(0, ${vis.mapYOffset})`)
            .attr("clip-path", "url(#bikeshareMapClip)");

        vis.map = vis.mapContainer.append("g")
            .attr("class", "neighbourhoods");

        // Draw the map
        vis.map.selectAll("path")
            .data(vis.mapData.features)
            .enter()
            .append("path")
            .attr("d", vis.path)
            .attr("fill", "#ddd")
            .attr("stroke", "#333");

        vis.stationDots = vis.map.selectAll("circle")
            .data(vis.stationData, d => d.id);

        vis.stationDotRadius = 3;
        vis.stationDotStrokeWidth = 1;

        vis.stationDots.enter()
            .append("circle")
            .attr("class", "station")
            .attr("cx", d => vis.projection([d.longitude, d.latitude])[0])
            .attr("cy", d => vis.projection([d.longitude, d.latitude])[1])
            .attr("r", vis.stationDotRadius)
            .attr("fill", "red")
            .attr("stroke", "#fff")
            .attr("cursor", "pointer")
            .attr("stroke-width", vis.stationDotStrokeWidth)
            .on("click", (event, d) => {
                //vis.onStationClick(d);
            });

        // zooming functionality
        vis.zoomFunction = function(event) {
            vis.map.attr("transform", event.transform);
            vis.map.selectAll(".station")
                .attr("r", vis.stationDotRadius / event.transform.k)
                .attr("stroke-width", vis.stationDotStrokeWidth / event.transform.k);

            vis.updateVis();
        }

        vis.zoom = d3.zoom()
            .scaleExtent([1, 8])
            .on("zoom", vis.zoomFunction);

        vis.map.call(vis.zoom);
        this.wrangleData();
    }

    wrangleData() {
        let vis = this;

        // Associate each station with the neighbourhood it's in
        vis.stationData.forEach(station => {
            const point = [station.longitude, station.latitude];
            const neighbourhoodFeature = vis.mapData.features.find(feature => d3.geoContains(feature, point));
            station.neighbourhood = neighbourhoodFeature.properties.AREA_NAME;
        });

        this.updateVis();
    }

    updateVis() {
        let vis = this;
        vis.map.selectAll("path")
            .attr("d", vis.path);
    }
}