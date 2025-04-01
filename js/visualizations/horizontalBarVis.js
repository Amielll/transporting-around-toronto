import * as d3 from 'd3';

export class HorizontalBarVis {
    constructor(parentElement, title, margin, stationData, eventHandler){
        this.parentElement = parentElement;
        this.title = title;
        this.margin = margin;
        this.stationData = stationData;
        this.eventHandler = eventHandler;
        this.selectedStationId = null;
        this.initVis();
    }

    initVis() {
        let vis = this;

        // Define margins and compute dimensions based on the parent element's size
        vis.margin = { top: 20, right: 40, bottom: 20, left: 200 };
        const container = document.getElementById(vis.parentElement).getBoundingClientRect();
        vis.width = container.width - vis.margin.left - vis.margin.right;
        vis.height = container.height - vis.margin.top - vis.margin.bottom;

        // Define a fixed height for the title
        vis.titleHeight = 30;  // adjust as needed

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement)
            .append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate(${vis.margin.left}, ${vis.margin.top})`);

        // add title
        vis.svg.append('g')
            .attr('class', 'title bar-title')
            .append('text')
            .text('Bike Share Station Top 10: Total Volume')
            // Center the text horizontally and vertically within the title area
            .attr('transform', `translate(${vis.width / 2}, ${vis.titleHeight / 2})`)
            .attr('text-anchor', 'middle');

        // tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'barTooltip');

        // Create a new group for the bars and shift it down by the title height
        vis.barsGroup = vis.svg.append('g')
            .attr('class', 'bars-group')
            .attr('transform', `translate(0, ${vis.titleHeight})`);

        // y-axis only (for the station names)
        vis.yAxisGroup = vis.barsGroup.append("g")
            .attr("class", "y-axis");

        vis.wrangleData('totalVolume');
    }

    wrangleData(selectedCategory) {
        let vis = this;

        vis.selectedCategory = selectedCategory;
        vis.stationData.sort((a, b) => b[vis.selectedCategory] - a[vis.selectedCategory]);
        vis.topTenData = vis.stationData.slice(0, 10);

        this.updateVis();
    }

    updateVis() {
        let vis = this;

        // horizontal bar chart: adjust the x-scale as before
        vis.xScale = d3.scaleLinear()
            .domain([0, d3.max(vis.topTenData, d => d[vis.selectedCategory])])
            .range([0, vis.width]);

        // Adjust the y-scale to account for the reduced height for bars only.
        // The available height for bars is the total height minus the title height.
        const barsHeight = vis.height - vis.titleHeight;
        vis.yScale = d3.scaleBand()
            .domain(vis.topTenData.map(d => d.name))
            .range([0, barsHeight])
            .padding(0.2);

        // Render the y-axis using the updated yScale
        vis.yAxisGroup.transition()
            .duration(750)
            .call(d3.axisLeft(vis.yScale));

        // Data join for bars in the barsGroup
        vis.bars = vis.barsGroup.selectAll(".bar")
            .data(vis.topTenData, d => d.id);

        vis.bars.enter()
            .append("rect")
            .on("click", (event, d) => {
                vis.eventHandler.trigger("selectionChanged", d);
            })
            .merge(vis.bars)
            .transition().duration(750)
            .attr("class", d => d.id === vis.selectedStationId ? "bar selected" : "bar")
            .attr("y", d => vis.yScale(d.name))
            .attr("height", vis.yScale.bandwidth())
            .attr("x", 0)
            .attr("width", d => vis.xScale(d[vis.selectedCategory]));

        vis.bars.exit().remove();

        vis.labels = vis.barsGroup.selectAll(".bar-label")
            .data(vis.topTenData, d => d.id);

        vis.labels.enter()
            .append("text")
            .attr("class", "bar-label")
            .merge(vis.labels)
            .transition().duration(750)
            .attr("x", d => vis.xScale(d[vis.selectedCategory]) + 5) // slightly to the right of the bar
            .attr("y", d => vis.yScale(d.name) + vis.yScale.bandwidth() / 2 + 5) // vertical center + tweak
            .text(d => d[vis.selectedCategory]);

        vis.labels.exit().remove();

    }

    onSelectionChange(selectedStation) {
        let vis = this;

        if (selectedStation.id === vis.selectedStationId) {
            // this was already selected, deselect
            vis.selectedStationId = null;
        } else {
            // set new selected station
            vis.selectedStationId = selectedStation.id;
        }

        vis.updateVis();
    }

    getScales() {
        // expose scales so selectBarVis can use same spacing as this one if desired
        return {
            xScale: this.xScale,
            yScale: this.yScale,
        }
    }
}
