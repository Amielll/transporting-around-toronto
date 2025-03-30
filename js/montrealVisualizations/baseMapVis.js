import * as d3 from "d3";

export class BaseMapVis {

    constructor(parentElement, title, margin, geoData, DOMInfo, eventHandler) {
        this.parentElement = parentElement;
        this.title = title;
        this.margin = margin;
        this.geoData = geoData;
        this.DOMInfo = DOMInfo;
        this.eventHandler = eventHandler;
    }

    initVis() {
        let vis = this;

        // Define margins and compute dimensions based on the parent element's size
        const container = document.getElementById(vis.parentElement).getBoundingClientRect();
        vis.width = container.width - vis.margin.left - vis.margin.right;
        vis.height = container.height - vis.margin.top - vis.margin.bottom;

        // Create the SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement)
            .append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr("transform", `translate(${vis.margin.left}, ${vis.margin.top})`);

        vis.mapYOffset = 40; // So that map/clipping region and title have some space in between

        // Define the clipping region
        vis.svg.append("defs")
            .append("clipPath")
            .attr("id", "bikeshareMapClip")
            .append("rect")
            .attr("width", vis.width)
            .attr("height", vis.height - vis.mapYOffset);

        console.log(this.DOMInfo.cityName);
        let cityName = this.DOMInfo.cityName;
        // Add title
        // TODO: change title
        // TODO: make cityName lower case when setting id
        vis.svg.append("g")
            .attr("class", "title")
            .attr("id",  cityName + "-bikeshare-map-title")
            .append("text")
            .text(cityName + " Bikeshare Stations")
            .attr('transform', `translate(${vis.width / 2}, 20)`)
            .attr("text-anchor", "middle");

        // Create a projection that fits the GeoJSON data
        vis.projection = d3.geoMercator()
            .fitSize([vis.width, vis.height - vis.mapYOffset], vis.geoData);
        vis.path = d3.geoPath().projection(vis.projection);

        // Set up map group
        vis.mapContainer = vis.svg.append("g")
            .attr("transform", `translate(0, ${vis.mapYOffset})`)
            .attr("clip-path", "url(#bikeshareMapClip)");

        vis.map = vis.mapContainer.append("g")
            .attr("class", "neighbourhoods");

        // Draw the map
        vis.map.selectAll("path")
            .data(vis.geoData.features)
            .enter()
            .append("path")
            .attr("d", vis.path)
            .attr("fill", "#ddd")
            .attr("stroke", "#333");
    }

    wrangleData() {}
    updateVis() {
        let vis = this;
        vis.map.selectAll("path")
            .attr("d", vis.path);
    }
}