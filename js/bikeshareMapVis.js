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

        // Define margins and compute dimensions based on the parent element's size.
        vis.margin = { top: 20, right: 20, bottom: 20, left: 20 };
        const container = document.getElementById(vis.parentElement).getBoundingClientRect();
        vis.width = container.width - vis.margin.left - vis.margin.right;
        vis.height = container.height - vis.margin.top - vis.margin.bottom;

        // Create the SVG drawing area.
        vis.svg = d3.select("#" + vis.parentElement)
            .append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr("transform", `translate(${vis.margin.left}, ${vis.margin.top})`);

        // Add a title
        vis.svg.append("g")
            .attr("class", "title")
            .attr("id",  "bikeshare-map-title")
            .append("text")
            .text("Toronto Bikeshare Station Volume")
            .attr('transform', `translate(${vis.width / 2}, 20)`)
            .attr("text-anchor", "middle");

        // Create a projection that fits the GeoJSON data.
        vis.projection = d3.geoMercator()
            .fitSize([vis.width, vis.height], vis.mapData);
        vis.path = d3.geoPath().projection(vis.projection);

        vis.map = vis.svg.append("g")
            .attr("class", "neighbourhood");

        // Draw the map paths.
        vis.map.selectAll("path")
            .data(vis.mapData.features)
            .enter()
            .append("path")
            .attr("d", vis.path)
            .attr("fill", "#ddd")
            .attr("stroke", "#333");

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

    }
}