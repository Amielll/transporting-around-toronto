import * as d3 from "d3";

export class NeighbourhoodSelect {
    constructor(parentElement, geoData, singleNeighbourhoodVis) {
        this.parentElement = parentElement;
        this.geoData = geoData;
        this.controlledVis = singleNeighbourhoodVis;
        this.initVis()
    }

    initVis() {
        let vis = this;

        vis.margin = {top: 10, right: 20, bottom: 10, left: 20};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + this.parentElement).append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);
        
            vis.projection = d3.geoMercator().fitSize([vis.width,vis.height],vis.geoData)
        vis.path = d3.geoPath(vis.projection);
        
        vis.neighbourhoods = vis.svg.selectAll(".neighbourhood")
            .data(vis.geoData.features)
            .enter()
            .append("path")
            .attr("d", vis.path)
            .attr("id", (d) => {
                return `neighbourhood-${d.properties.AREA_LONG_CODE}`
            })
            .attr("class", "neighbourhood")
            .attr('stroke-width', '1px')
            .attr('stroke', 'lightgrey');
        
        // add title
        // vis.svg.append('g')
        //     .attr('class', 'title')
        //     .attr('id', 'map-title')
        //     .append('text')
        //     .attr('class', 'map-title-text')
        //     .attr('id', 'map-title-text' + vis.id)
        //     .text(titles[vis.variable])
        //     .attr('transform', `translate(${vis.width / 2}, 40)`)
        //     .attr('text-anchor', 'middle');
        vis.wrangleData(null)
    }

    wrangleData(neighbourhood) {
        let vis = this;
        vis.selectedNB = neighbourhood;
        vis.updateVis()
    }
    
    updateVis() {
        let vis = this;
        vis.neighbourhoods = vis.svg.selectAll(".neighbourhood")
            .data(vis.geoData.features)

        
        this.neighbourhoods.enter()
            .append("path")
            .attr("d", vis.path)
            .attr("id", (d) => {
                return d.properties.AREA_NAME
            })
			.merge(this.neighbourhoods)
            .on('mouseover', function(event, d){
                vis.neighbourhoods.attr('fill', 'black');
                if (vis.selectedNB !== null){
                    d3.select(`#neighbourhood-${vis.selectedNB.AREA_LONG_CODE}`).attr('fill', 'red');
                }
                d3.select(this)
                    .attr('fill', 'red');
            })
            .on('mouseout', function(event, d){
                vis.neighbourhoods.attr('fill', 'black');
                if (vis.selectedNB !== null){
                    d3.select(`#neighbourhood-${vis.selectedNB.AREA_LONG_CODE}`).attr('fill', 'red');
                }
            })
            .on('click', function(event, d){
                vis.neighbourhoods.attr('fill', 'black');
                d3.select(this)
                    .attr('fill', 'red');
                vis.selectedNB = d.properties;
                vis.controlledVis.wrangleData(vis.selectedNB);
            })
    }
    
}