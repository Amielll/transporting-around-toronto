// TODO: Figure out how to reuse this class with Mieko's MapVis class
class BikeshareMapVis {

    constructor(parentElement, stationData, bikeshareData, mapData) {
        this.parentElement = parentElement;
        this.tripData = bikeshareData;
        this.stationData = stationData;
        this.mapData = mapData;

        this.initVis()
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
            .append("g")
            .attr("transform", `translate(${vis.margin.left}, ${vis.margin.top})`);

        // Add a title.
        vis.svg.append("text")
            .attr("x", vis.width / 2)
            .attr("y", 20)
            .attr("text-anchor", "middle")
            .text("Toronto Bikeshare Station Volume");

        // Create a projection that fits the GeoJSON data.
        vis.projection = d3.geoMercator()
            .fitSize([vis.width, vis.height], vis.mapData);
        vis.path = d3.geoPath().projection(vis.projection);

        // Draw the map paths.
        vis.svg.selectAll("path")
            .data(vis.mapData.features)
            .enter()
            .append("path")
            .attr("d", vis.path)
            .attr("fill", "#ddd")
            .attr("stroke", "#333");

        // Draw initial station dots (all stations).
        vis.stationDots = vis.svg.selectAll("circle.station")
            .data(vis.stationData, d => d["Station Id"]);

        // ENTER: Append circles for each station.
        vis.stationDots.enter()
            .append("circle")
            .attr("class", "station")
            .attr("cx", d => vis.projection([d.Longitude, d.Latitude])[0])
            .attr("cy", d => vis.projection([d.Longitude, d.Latitude])[1])
            .attr("r", 4)
            .attr("fill", "red")
            .attr("stroke", "#fff")
            .attr("cursor", "pointer")
            .attr("stroke-width", 1)
            .on("click", (event, d) => {
                vis.onStationClick(d);
            })
            .append("title")
            .text(d => d["Station Name"]);
    }

    /**
     * Called when a station dot is clicked.
     * Filters the tripData for trips starting at the clicked station and
     * updates the end station dots using the enter/update/exit pattern.
     * @param {object} clickedStation - The station object that was clicked.
     */
    onStationClick(clickedStation) {
        let vis = this;

        // Filter tripData for trips starting from the clicked station.
        let filteredTrips = vis.tripData.filter(t => +t["Start Station Id"] === +clickedStation["Station Id"]);

        // For each trip, look up the corresponding end station info from stationData.
        // We also include the "Count" attribute from the trip record.
        let endStations = filteredTrips.map(t => {
            let stationInfo = vis.stationData.find(s => +s["Station Id"] === +t["End Station Id"]);
            return { ...stationInfo, Count: +t["Count"] };
        });

        // Join the endStations data with existing end station dots.
        let endDots = vis.svg.selectAll("circle.end")
            .data(endStations, d => d["Station Id"]);

        // EXIT: Remove any dots that no longer exist.
        endDots.exit().remove();

        // UPDATE: Update attributes of existing dots.
        endDots
            .attr("cx", d => vis.projection([+d.Longitude, +d.Latitude])[0])
            .attr("cy", d => vis.projection([+d.Longitude, +d.Latitude])[1])
            .attr("r", d => 4 + Math.log(d.Count))
            .select("title")
            .text(d => `${d["Station Name"]}: ${d.Count} trips`);

        // ENTER: Append new dots for new data.
        endDots.enter()
            .append("circle")
            .attr("class", "end")
            .attr("cx", d => vis.projection([d.Longitude, d.Latitude])[0])
            .attr("cy", d => vis.projection([d.Longitude, d.Latitude])[1])
            .attr("r", d => 4 + Math.log(d.Count))
            .attr("fill", "blue")
            .attr("stroke", "#fff")
            .attr("stroke-width", 1)
            .append("title")
            .text(d => `${d["Station Name"]}: ${d.Count} trips`);
    }
}