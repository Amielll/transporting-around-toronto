import * as d3 from "d3";

export class BaseMapVis {

    constructor(parentElement, geoData, eventHandler, config={}) {
        this.parentElement = parentElement;
        this.geoData = geoData;
        this.eventHandler = eventHandler;
        this.config = {
            margin: {
                top: 20,
                right: 20,
                bottom: 20,
                left: 20,
            },
            mapFill: "#ddd",
            mapStroke: "#333",
            mapStrokeWidth: "1px",
            mapYOffset: 40, // So that map/clipping region and title have some space in between
            title: "Map Visualization",
            ...config
        };
    }

    initVis() {
        let vis = this;
        const cfg = vis.config;

        // Define margins and compute dimensions based on the parent element's size
        const container = document.getElementById(vis.parentElement).getBoundingClientRect();
        vis.width = container.width - cfg.margin.left - cfg.margin.right;
        vis.height = container.height - cfg.margin.top - cfg.margin.bottom;

        // Create the SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement)
            .append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr("transform", `translate(${cfg.margin.left}, ${cfg.margin.top})`);

        // Define the clipping region
        vis.svg.append("defs")
            .append("clipPath")
            .attr("id", `mapClip${vis.parentElement}`) // use the parent element of this vis for unique id
            .append("rect")
            .attr("width", vis.width)
            .attr("height", vis.height - cfg.mapYOffset);

        // Create a projection that fits the GeoJSON data
        vis.projection = d3.geoMercator()
            .fitSize([vis.width, vis.height - cfg.mapYOffset], vis.geoData);
        vis.path = d3.geoPath().projection(vis.projection);

        // Set up map group
        vis.mapContainer = vis.svg.append("g")
            .attr("transform", `translate(0, ${cfg.mapYOffset})`)
            .attr("clip-path", `url(#mapClip${vis.parentElement})`);

        vis.map = vis.mapContainer.append("g")
            .attr("class", "neighbourhoods");

        // Draw the map
        vis.neighbourhoods = vis.map
            .selectAll("path")
            .data(vis.geoData.features)
            .enter()
            .append("path")
            .attr("d", vis.path)
            .attr("id", (d) => {
                return vis.parentElement + d.properties.AREA_NAME
            })
            .attr("class", "neighbourhood")
            .attr("fill", cfg.mapFill)
            .attr('stroke-width', cfg.mapStrokeWidth)
            .attr("stroke", cfg.mapStroke);
    }

    wrangleData() {}
    updateVis() {
        let vis = this;
        vis.map.selectAll("path")
            .attr("d", vis.path);
    }
}