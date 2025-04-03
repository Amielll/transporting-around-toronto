import * as d3 from 'd3';

export class ScatterPlotVis {
    constructor(parentElement, neighbourhoodData, stationInfo, bikeRackData) {
        this.parentElement = parentElement;
        this.titles = {
            "average_income": "Average Annual Income (2021)",
            "bicycle_commuters": "Bike Commuter Proportion (2021)",
            "bikeshare_stations": "Number of Bikeshare Stations (2025)",
            "bike_parking_racks": "Number of Bike Parking Racks (2025)",
            "collisions": "Bike Collisions (2009-2023)",
            "thefts": "Bike Thefts (2009-2023)"
        }
        this.labels = {
            "average_income": "Average Annual Income",
            "bicycle_commuters": "Bike Commuter Proportion",
            "bikeshare_stations": "Number of Bike Stations",
            "bike_parking_racks": "Number of Bike Parking Racks",
            "collisions": "Number of Bike Collisions",
            "thefts": "Number of Bike Thefts"
        }
        this.neighbourhoodData = neighbourhoodData;
        this.stationInfo = stationInfo;
        this.bikeRackData = bikeRackData;
        this.selectedX = "";
        this.selectedY = "";
        this.values = [];
        this.initVis();
    }
    initVis() {
        let vis = this;

        // Define margins and compute dimensions based on the parent element's size
        const parentWidth = document.getElementById(vis.parentElement).clientWidth;
        const parentHeight = document.getElementById(vis.parentElement).clientHeight;
        const margin = {top: 20, right: 20, bottom: 70, left: 70};

        vis.width = parentWidth - margin.left - margin.right;
        vis.height = parentHeight - margin.top - margin.bottom;
        vis.titleHeight = 30;

        // Create the SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement)
            .append("svg")
            .attr("width", vis.width + margin.left + margin.right)
            .attr("height", vis.height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        // Add title
        vis.titleGroup = vis.svg.append("g")
            .attr("class", "title")
            .attr("id", `${vis.parentElement}-map-title`);

        vis.titleText = vis.titleGroup.append("text")
            .attr('transform', `translate(${vis.width / 2}, ${vis.titleHeight / 2})`)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("font-weight", "bold");

        // Add axes
        vis.xAxisGroup = vis.svg.append("g")
            .attr("class", "scatter-x-axis")
            .attr("transform", `translate(0, ${vis.height})`);

        vis.yAxisGroup = vis.svg.append("g")
            .attr("class", "scatter-y-axis");

        // Axis labels
        vis.xLabel = vis.svg.append("text")
            .attr("class", "axis-label x-label")
            .attr("text-anchor", "middle")
            .attr("x", vis.width / 2)
            .attr("y", vis.height + 40)
            .text(vis.selectedX); // will update later

        vis.yLabel = vis.svg.append("text")
            .attr("class", "axis-label y-label")
            .attr("text-anchor", "middle")
            .attr("transform", `rotate(-90)`)
            .attr("x", -vis.height / 2)
            .attr("y", -margin.left + 20)
            .text(vis.selectedY);

        vis.wrangleData("average_income", "bicycle_commuters");
    }
    wrangleData(selectedX, selectedY) {
        let vis = this;
        vis.selectedX = selectedX;
        vis.selectedY = selectedY;
        vis.scatterData = Object.values(vis.neighbourhoodData).map(d => ({
            x: d[vis.selectedX],
            y: d[vis.selectedY],
            name: d.name,
            id: d.num
        }));
        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        let title = `${vis.titles[vis.selectedX]} vs. ${vis.titles[vis.selectedY]}`;
        vis.titleText.text(title);

        vis.xScale = d3.scaleLinear()
            .domain(d3.extent(vis.scatterData, d => d.x))
            .range([0, vis.width])
            .nice();

        vis.yScale = d3.scaleLinear()
            .domain(d3.extent(vis.scatterData, d => d.y))
            .range([vis.height, 0])
            .nice();

        vis.xAxisGroup.transition().duration(750).call(d3.axisBottom(vis.xScale));
        vis.yAxisGroup.transition().duration(750).call(d3.axisLeft(vis.yScale));

        vis.xLabel.text(vis.labels[vis.selectedX]);
        vis.yLabel.text(vis.labels[vis.selectedY]);

        vis.circles = vis.svg.selectAll("circle")
            .data(vis.scatterData, d => d.id);

        vis.circles.enter()
            .append("circle")
            .merge(vis.circles)
            .transition().duration(750)
            .attr("cx", d => vis.xScale(d.x))
            .attr("cy", d => vis.yScale(d.y))
            .attr("r", 5)
            .attr("fill", "#672A9C");


        vis.circles.exit().remove();
    }
}