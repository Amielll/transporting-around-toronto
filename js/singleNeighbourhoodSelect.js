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

        // Set up map group
        vis.mapContainer = vis.svg.append("g")
            //.attr("transform", `translate(0, ${vis.mapYOffset})`)
            .attr("clip-path", "url(#bikeshareMapClip)");

        vis.map = vis.mapContainer.append("g")
            .attr("class", "neighbourhoods");

        // Draw the map
        vis.neighbourhoods = vis.map.selectAll("path")
            .data(vis.geoData.features)
            .enter()
            .append("path")
            .attr("d", vis.path)
            .attr("id", (d) => {
                return `neighbourhood-${d.properties.AREA_LONG_CODE}`
            })
            .attr("fill", "#242e24")
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
        vis.map.selectAll("path")
            .attr("d", vis.path);

        
        vis.map.enter()
            .append("path")
            .attr("d", vis.path)
            .attr("id", (d) => {
                return d.properties.AREA_NAME
            })
			.merge(vis.neighbourhoods);

        vis.neighbourhoods
            .on('mouseover', function(event, d){
                vis.neighbourhoods.attr('fill', '#242e24');
                if (vis.selectedNB !== null){
                    d3.select(`#neighbourhood-${vis.selectedNB.AREA_LONG_CODE}`).attr('fill', '#F67E04');
                }
                d3.select(this)
                    .attr('fill', '#f1a354');
            })
            .on('mouseout', function(event, d){
                vis.neighbourhoods.attr('fill', '#242e24');
                if (vis.selectedNB !== null){
                    d3.select(`#neighbourhood-${vis.selectedNB.AREA_LONG_CODE}`).attr('fill', '#F67E04');
                }
            })
            .on('click', function(event, d){
                vis.neighbourhoods.attr('fill', '#242e24');
                d3.select(this)
                    .attr('fill', '#F67E04');
                vis.selectedNB = d.properties;
                vis.controlledVis.updateZoom(d.properties, event);
            })
    }
    
}