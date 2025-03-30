import * as d3 from "d3";

function highlightCity(event, city) {
    d3.selectAll(".score-bar")
    .style("opacity", (d) => {
        switch (d.city){
            case city:
                return 1
            default:
                return 0.5
        }
    })

    d3.selectAll(".score-label")
        .style("display", (d) => {
            switch (d.city){
                case city:
                    return "inline"
                default:
                    return "none"
            }
    })

    d3.selectAll(".legend-box")
        .style("opacity", 0.5)

    d3.select(`.legend-box-${city}`)
        .style("opacity", 1)
}

function removeHighlight() {
    d3.selectAll(".score-bar")
    .style("opacity", 1)

    d3.selectAll(".score-label")
        .style("display", "none")

    d3.selectAll(".legend-box")
        .style("opacity", 1)
}

export class ScoreBarVis {

    constructor(parentElement, scoreData) {
        this.parentElement = parentElement;
        this.scoreData = scoreData;

        this.definitions = {
            "People": ["Access to parts of the", "city where residents live"],
            "Opportunity": ["Access to jobs and schools"],
            "Core Services" : ["Access to places that serve basic needs,", "like hospitals and grocery stores"],
            "Recreation" : ["Access to recreational", "amenities like parks and trails"],
            "Retail" : ["Access to major shopping centers"],
            "Transit" : ["Access to major transit hubs"],
        }

        this.cities = ["Toronto", "Montreal", "Vancouver"];
        this.highlighted = "";

        this.colours = {
            "Toronto": "blue", 
            "Montreal": "red", 
            "Vancouver": "green"
        }

        this.initVis()
    }

    initVis() {
        let vis = this;

        // Define margins and compute dimensions based on the parent element's size
        vis.margin = { top: 20, right: 40, bottom: 20, left: 40 };
        const container = document.getElementById(vis.parentElement).getBoundingClientRect();
        vis.width = container.width - vis.margin.left - vis.margin.right;
        vis.height = container.height - vis.margin.top - vis.margin.bottom;

        vis.barHeight = ((vis.height - 100) / 24)
        vis.barLabelY = (vis.barHeight * 4) / 2

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement)
            .append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate(${vis.margin.left}, ${vis.margin.top})`);

        vis.barsGroup = vis.svg.append('g')
            .attr('class', 'bars-group');


        vis.xScale = d3.scaleLinear()
            .domain([0, 100])
            .range([0, vis.width * (3/5)])

        vis.xAxisGroup = vis.barsGroup.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(${vis.width / 4},${vis.height - 100})`)
            .call(d3.axisBottom(vis.xScale)
                .ticks(3));

        vis.yAxisGroup = vis.barsGroup.append("g")
            .attr("class", "y-axis");

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;
        vis.updateVis()
    }

    updateVis() {
        let vis = this;

        vis.drawLegend();

        let scoreParts = Object.keys(vis.scoreData);

        // add the bars & labels for every score category
        scoreParts.forEach((category, index) => {
            // category = category.replace(/\s+/g, '');
            let categoryTrimmed = category.replace(" ", "");

            if (category !== "Total"){

                // group for whole category
                let categoryGroup = vis.svg.append("g")
                    .attr("class", `category-group ${categoryTrimmed}-category-group`)
                    .style("pointer-events", "bounding-box")
                    .attr("transform", `translate(0, ${(index - 1) * 4 * vis.barHeight})`)
                    .on("mouseenter", (event, selected) => {
                        d3.select(`.bars-desc-${categoryTrimmed}`)
                            .style("display", "inline");
                        d3.select(`.${categoryTrimmed}-bars-label`)
                            .attr("y", vis.barLabelY / 2)
                    })
                    .on("mouseleave", (event, selected) => {
                        d3.select(`.bars-desc-${categoryTrimmed}`)
                            .style("display", "none");
                        d3.select(`.${categoryTrimmed}-bars-label`)
                            .attr("y", vis.barLabelY)
                    });

                // category name
                categoryGroup.append("text")
                    .attr("class", `bars-label ${categoryTrimmed}-bars-label`)
                    .style("text-anchor", "end")
                    .text(category)
                    .attr("x", vis.width / 4 - 10)
                    .attr("y", vis.barLabelY)

                let descGroup = categoryGroup.append("g")
                    .attr("class", `bars-desc-group bars-desc-${categoryTrimmed}`)
                    .attr("transform", `translate(${vis.width / 4 - 10}, ${vis.barLabelY})`)
                    .style("display", "none");

                // category description
                vis.definitions[category].forEach((line, lineNum) => {
                    descGroup.append("text")
                        .style("text-anchor", "end")
                        .text(line)
                        .attr("x", 0)
                        .attr("y", 20 * lineNum)
                })

                // group for the city bars
                let barGroup = categoryGroup.append("g")
                    .attr("class", `bar-group ${categoryTrimmed}-group`)
                    .attr("transform", `translate(${vis.width / 4}, 0)`);

                let bars = barGroup.selectAll(`.score-bar-${categoryTrimmed}`)
                    .data(vis.scoreData[category])

                bars.enter()
                    .append("rect")
                    .attr("class", (d) => `score-bar score-bar-${categoryTrimmed} score-bar-${d.city}`)
                    .merge(bars)
                    .attr("x", 0)
                    .attr("y", (d, i) => {
                        return i * vis.barHeight + (5 * i)
                    })
                    .attr("height", vis.barHeight)
                    .attr("width", (d, i) => {
                        return vis.xScale(d.value)
                    })
                    .attr("fill", (d) => vis.colours[d.city])
                    .on("click", (event, chosen) => {
                        if (chosen.city !== vis.highlighted){
                            highlightCity(event, chosen.city);
                            vis.highlighted = chosen.city;
                        }
                        else {
                            removeHighlight();
                            vis.highlighted = "";
                        }
                    })

                // add the labels to the bars that appear on click
                let barLabels = barGroup.selectAll(`.score-label-${categoryTrimmed}`)
                    .data(vis.scoreData[category])

                barLabels.enter()
                    .append("text")
                    .attr("class", (d) => `score-label score-label-${categoryTrimmed} score-label-${d.city}`)
                    .merge(barLabels)
                    .attr("x", (d) => vis.xScale(d.value) + 5)
                    .attr("y", (d, i) => {
                        return i * vis.barHeight + (5 * i) + (vis.barHeight / 2) + 5
                    })
                    .text((d) => d.value)
                    .style("display", "none");
            }            
        })
    }

    drawLegend(){
        let vis = this;
        let boxHeight = vis.barHeight * 2/3

        vis.legend = vis.svg.append("g")
            .attr("class", "bar-legend")
            .attr("transform", `translate(${vis.width * 3/4}, 0)`)

        vis.cities.forEach((city, index) => {
            vis.legend.append("rect")
                .attr("class", `legend-box legend-box-${city}`)
                .attr("x", 0)
                .attr("y", index * boxHeight + (index * boxHeight / 2))
                .attr("width", boxHeight)
                .attr("height", boxHeight)
                .attr("fill", vis.colours[city])
                .on("click", (event, chosen) => {
                    if (city !== vis.highlighted){
                        highlightCity(event, city);
                        vis.highlighted = city;
                    }
                    else {
                        removeHighlight();
                        vis.highlighted = "";
                    }
                })
            
            vis.legend.append("text")
                .attr("class", "legend-text")
                .attr("x", boxHeight + 5)
                .attr("y", index * boxHeight + (index * boxHeight / 2) + 16)
                .text(city)
                .on("click", (event, chosen) => {
                    if (city !== vis.highlighted){
                        highlightCity(event, city);
                        vis.highlighted = city;
                    }
                    else {
                        removeHighlight();
                        vis.highlighted = "";
                    }
                })

        })
        
    }
}

