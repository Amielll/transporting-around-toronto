import * as d3 from "d3";

export class BaseMapVis {

    constructor(parentElement, geoData, eventHandler, config={}) {
        this.parentElement = parentElement;
        this.geoData = geoData;
        this.eventHandler = eventHandler;
        this.config = {
            margin: {
                top: 40,
                right: 20,
                bottom: 20,
                left: 20,
            },
            mapFill: "#ddd",
            mapStroke: "#333",
            mapStrokeWidth: "1px",
            titleMargin: 20, // Space between title and map
            title: "Map Visualization",
            ...config
        };
    }

    initVis() {
        let vis = this;
        const cfg = vis.config;

        // Define margins and compute dimensions based on the parent element's size
        const parentWidth = document.getElementById(vis.parentElement).clientWidth;
        const parentHeight = document.getElementById(vis.parentElement).clientHeight;

        vis.width = parentWidth - cfg.margin.left - cfg.margin.right;
        vis.height = parentHeight - cfg.margin.top - cfg.margin.bottom;

        // Create the SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement)
            .append("svg")
            .attr("width", vis.width + cfg.margin.left + cfg.margin.right)
            .attr("height", vis.height + cfg.margin.top + cfg.margin.bottom)
            .append("g")
            .attr("transform", `translate(${cfg.margin.left}, ${cfg.margin.top})`);

        // Define the clipping region
        vis.svg.append("defs")
            .append("clipPath")
            .attr("id", `${vis.parentElement}-map-clip)`) // use the parent element of this vis for unique id
            .append("rect")
            .attr("width", vis.width + cfg.margin.left + cfg.margin.right)
            .attr("height", vis.height + cfg.margin.top + cfg.margin.bottom);

        // Create a projection that fits the GeoJSON data
        vis.projection = d3.geoMercator()
            .fitSize([vis.width, vis.height], vis.geoData);
        vis.path = d3.geoPath().projection(vis.projection);

        // Set up map group
        vis.mapContainer = vis.svg.append("g")
            .attr("clip-path", `url(#${vis.parentElement}-map-clip)`);

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

        // Add title
        vis.titleGroup = vis.svg.append("g")
            .attr("class", "title")
            .attr("id", `${vis.parentElement}-map-title`);

        vis.titleText = vis.titleGroup.append("text")
            .text(cfg.title)
            .attr('transform', `translate(${vis.width / 2}, -${cfg.titleMargin})`)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("font-weight", "bold");
    }

    wrangleData() {}
    updateVis() {
        let vis = this;
        vis.map.selectAll("path")
            .attr("d", vis.path);
    }

    updateTitle(newTitle) {
        let vis = this;
        vis.titleText.text(newTitle);
    }
}