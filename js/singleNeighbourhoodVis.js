import * as d3 from "d3";

export class SingleNeighbourhoodVis {
    constructor(parentElement, stationData, tripData, geoData, demographicData, bikeRackData, bikeLaneData) {
        this.parentElement = parentElement;
        this.stationData = stationData;
        this.tripData = tripData;
        this.geoData = geoData;
        this.demographicData = demographicData;
        this.bikeRackData = bikeRackData;
        this.bikeLaneData = bikeLaneData;


        this.neighbourhoodData = new Object;
        this.demographicData.forEach(d => {
            Object.keys(d).forEach(key => {
                if (key !== "name" && key !== "number")
                    d[key] = +d[key];
            })
            this.neighbourhoodData[d.number] = d;
        });

        this.currentNB = null;

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
                return d.properties.AREA_NAME
            })
            .attr("class", "neighbourhood")
            .attr('stroke-width', '1px')
            .attr('stroke', 'white')
            .attr('fill', 'black');
        
        // add title
        vis.svg.append('g')
            .attr('class', 'title')
            .attr('id', 'map-title')
            .append('text')
            .attr('class', 'map-title-text')
            .attr('id', 'map-title-text' + vis.id)
            .text(`Detailed Neighbourhood View:`)
            .attr('transform', `translate(${vis.width / 5}, 40)`);
    }

    wrangleData(neighbourhood){
        this.neighbourhood = neighbourhood;
        console.log(neighbourhood)
    }



    
}