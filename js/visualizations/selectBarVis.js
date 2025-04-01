import * as d3 from 'd3';

export class SelectBarVis {
    constructor(parentElement, margin, scales, eventHandler){
        this.parentElement = parentElement;
        this.margin = margin;
        this.eventHandler = eventHandler;
        this.selectedStationData = [];
        this.selectedVariable = 'totalVolume';
        this.setScales(scales);
        this.initVis();
    }

    initVis() {
        let vis = this;

        // Define margins and compute dimensions based on the parent element's size
        vis.margin = { top: 20, right: 40, bottom: 20, left: 200 };
        const container = document.getElementById(vis.parentElement).getBoundingClientRect();
        vis.width = container.width - vis.margin.left - vis.margin.right;
        vis.height = container.height - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement)
            .append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate(${vis.margin.left}, ${vis.margin.top})`);

        // bar group
        vis.barGroup = vis.svg.append('g')
            .attr('class', 'bars-group');

        // select station label
        vis.svg.append("text")
            .attr("class", "selected-label")
            .attr("x", -10)
            .attr("y", vis.barHeight / 2 + 5) // vertically aligned with the bar
            .text("Selected Station")
            .attr("font-size", "12px")
            .attr("text-anchor", "end")
            .attr("fill", "#333")
            .attr("font-weight", "bold");

        vis.wrangleData(vis.selectedVariable);
    }

    wrangleData(selectedVariable) {
        let vis = this;
        vis.selectedVariable = selectedVariable;
        vis.updateVis();
    }

    updateVis() {
        let vis = this;
        vis.barGroup.selectAll(".no-selection-label").remove();

        // If no station is selected, show 'None' instead of bar/warning text
        if (vis.selectedStationData.length === 0) {
            vis.barGroup.selectAll(".bar")
                .transition()
                .duration(500)
                .attr("width", 0)
                .remove();

            vis.barGroup.selectAll(".bar-label")
                .transition()
                .duration(500)
                .attr("opacity", 0)
                .remove();

            vis.barGroup.append("text")
                .attr("class", "no-selection-label")
                .attr("x", 0)
                .attr("y", vis.barHeight / 2 + 5)
                .attr("opacity", 0)
                .text("None")
                .transition()
                .delay(500) // wait for bar fade-out
                .duration(300)
                .attr("opacity", 1);

            return;
        }

        // If selected station has no data for the selected variable, show warning text instead of trying to draw bar.
        // e.g. station 7022 can be clicked on map, but has no status data
        if (vis.selectedStationData[0][vis.selectedVariable] ===  null ||
            vis.selectedStationData[0][vis.selectedVariable] === undefined) {
            vis.barGroup.selectAll(".bar")
                .transition()
                .duration(500)
                .attr("width", 0)
                .remove();

            vis.barGroup.selectAll(".bar-label")
                .transition()
                .duration(500)
                .attr("opacity", 0)
                .remove();

            vis.barGroup.append("text")
                .attr("class", "no-selection-label")
                .attr("x", 0)
                .attr("y", vis.barHeight / 2 + 5)
                .attr("opacity", 0)
                .text("No data for this station found")
                .transition()
                .delay(500) // wait for bar fade-out
                .duration(300)
                .attr("opacity", 1);

            return;
        }

        vis.bar = vis.barGroup.selectAll(".bar")
            .data(vis.selectedStationData, d => d.id);

        vis.bar.enter()
            .append("rect")
            .on("click", (event, d) => {
                vis.eventHandler.trigger("selectionChanged", d);
            })
            .merge(vis.bar)
            .transition().duration(750)
            .attr("class", "bar selected")
            .attr("height", vis.barHeight)
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", d => vis.xScale(d[vis.selectedVariable]));

        vis.bar.exit().remove();

        vis.label = vis.barGroup.selectAll(".bar-label")
            .data(vis.selectedStationData, d => d.id);

        vis.label.enter()
            .append("text")
            .attr("class", "bar-label")
            .merge(vis.label)
            .transition().duration(750)
            .attr("x", d => vis.xScale(d[vis.selectedVariable]) + 5) // slightly to the right of the bar
            .attr("y", d => vis.barHeight / 2 + 5) // vertical center + tweak
            .text(d => {
                if (vis.selectedVariable !== 'totalVolume' && vis.selectedVariable !== 'capacity') {
                    return d3.format(".2f")(d[vis.selectedVariable]);
                } else {
                    return d[vis.selectedVariable];
                }
            });


        vis.label.exit().remove();
    }

    onSelectionChange(selectedStation) {
        let vis = this;
        if (vis.selectedStationData.length === 1 && selectedStation.id === vis.selectedStationData[0].id) {
            // this was already selected, deselect
            vis.selectedStationData = [];
        } else {
            // set new selected station
            vis.selectedStationData = [selectedStation];
        }
        vis.updateVis();
    }

    setScales(scales) {
        this.xScale = scales.xScale;
        this.barHeight = scales.yScale.bandwidth();
    }
}