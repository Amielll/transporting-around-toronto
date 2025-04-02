import * as d3 from 'd3';

export class HorizontalBarVis {
    constructor(parentElement, title, margin, stationData, eventHandler){
        this.parentElement = parentElement;
        this.title = title;
        this.margin = margin;
        this.stationData = stationData;
        this.eventHandler = eventHandler;
        this.selectedStationId = null;
        this.selectedVariable = 'totalVolume';
        this.titles = {
            totalVolume: 'Volume of Trips at this Station (January 2024)',
            avgDuration: 'Average Trip Duration (mins) (January 2024)',
            capacity: 'Total Dock Capacity (March 2025)',
            avgBikesAvailable: 'Average Bikes Available (March 2025)',
            avgBikesDisabled: 'Average Bikes Disabled (March 2025)',
            avgDocksDisabled: 'Average Docks Disabled (March 2025)'
        }

        this.initVis();
    }

    initVis() {
        let vis = this;

        // Define margins and compute dimensions based on the parent element's size
        vis.margin = { top: 20, right: 100, bottom: 20, left: 200 };
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

        // Add title
        vis.titleGroup = vis.svg.append("g")
            .attr("class", "title")
            .attr("id", `${vis.parentElement}-map-title`);

        vis.titleText = vis.titleGroup.append("text")
            .attr('transform', `translate(${vis.width / 2}, ${vis.titleHeight / 2})`)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("font-weight", "bold");

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

    wrangleData(selectedVariable) {
        let vis = this;

        vis.selectedVariable = selectedVariable;
        vis.stationData.sort((a, b) => b[vis.selectedVariable] - a[vis.selectedVariable]);
        vis.topTenData = vis.stationData.slice(0, 10);
        this.updateVis();
    }

    updateVis() {
        let vis = this;

        let title = vis.titles[vis.selectedVariable];
        vis.titleText.text(title);

        // horizontal bar chart: adjust the x-scale as before
        vis.xScale = d3.scaleLinear()
            .domain([0, d3.max(vis.topTenData, d => d[vis.selectedVariable])])
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
            .attr("width", d => vis.xScale(d[vis.selectedVariable]));

        vis.bars.exit().remove();

        vis.labels = vis.barsGroup.selectAll(".bar-label")
            .data(vis.topTenData, d => d.id);

        vis.labels.enter()
            .append("text")
            .attr("class", "bar-label")
            .merge(vis.labels)
            .transition().duration(750)
            .attr("x", d => vis.xScale(d[vis.selectedVariable]) + 5) // slightly to the right of the bar
            .attr("y", d => vis.yScale(d.name) + vis.yScale.bandwidth() / 2 + 5) // vertical center + tweak
            .text(d => {
                if (vis.selectedVariable !== 'totalVolume' && vis.selectedVariable !== 'capacity') {
                    return d3.format(".2f")(d[vis.selectedVariable]);
                } else {
                    return d[vis.selectedVariable];
                }
            });

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
