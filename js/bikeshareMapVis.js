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

        vis.mapYOffset = 40; // So that map/clipping region and title have some space in between

        // Define the clipping region
        vis.svg.append("defs")
            .append("clipPath")
            .attr("id", "bikeshareMapClip")
            .append("rect")
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

        vis.mapZoomScaleExtent = [1,10]; // for zooming

        // Draw the map
        vis.map.selectAll("path")
            .data(vis.mapData.features)
            .enter()
            .append("path")
            .attr("d", vis.path)
            .attr("fill", "#ddd")
            .attr("stroke", "#333");

        // Represent stations as dots on the map
        vis.stationDots = vis.map.selectAll("circle")
            .data(vis.stationData, d => d.id);

        vis.radiusScale = d3.scaleLinear() // scale dots based on zoom for now, but in future change based on metric?
            .domain(vis.mapZoomScaleExtent)
            .range([3, 0.5])
            .clamp(true);

        // draw station dots and set up click listener
        vis.stationDots.enter()
            .append("circle")
            .attr("class", "station")
            .attr("cx", d => vis.projection([d.longitude, d.latitude])[0])
            .attr("cy", d => vis.projection([d.longitude, d.latitude])[1])
            .attr("r", vis.radiusScale(1))
            .attr("fill", "red")
            .attr("stroke", "#fff")
            .attr("cursor", "pointer")
            .attr("stroke-width", vis.radiusScale(1) / 4)
            .on("click", (event, d) => {
                vis.onStationClick(d);
            });

        // zooming functionality
        vis.zoomFunction = function(event) {
            console.log(event.transform.k);
            vis.map.attr("transform", event.transform);
            vis.map.selectAll(".station")
                .attr("r", vis.radiusScale(event.transform.k))
                .attr("stroke-width", vis.radiusScale(event.transform.k) / 4)

            vis.updateVis();
        }

        vis.zoom = d3.zoom()
            .scaleExtent(vis.mapZoomScaleExtent)
            .translateExtent([[0,0], [vis.width, vis.height - vis.mapYOffset]])
            .on("zoom", vis.zoomFunction);

        vis.mapContainer.call(vis.zoom);
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

    onStationClick(station) {
        console.log(station);
        let summary = d3.select("#bikeshare-station-summary");
        let summaryName = d3.select("#bikeshare-summary-station-name");
        let summaryID = d3.select("#bikeshare-summary-station-id");
        let summaryNeighbourhood = d3.select("#bikeshare-summary-station-neighbourhood");
        summary.style("display", "block");
        summaryName.text(station.name);
        summaryID.text(station.id);
        summaryNeighbourhood.text(station.neighbourhood);

    }
}