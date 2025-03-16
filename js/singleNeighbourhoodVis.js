import * as d3 from "d3";
let g;

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

        g = vis.svg.append("g");
        
        vis.neighbourhoods = g.selectAll(".neighbourhood")
            .data(vis.geoData.features)
            .enter()
            .append("path")
            .attr("d", vis.path)
            .attr("id", (d) => {
                return `single-nb-${d.properties.AREA_LONG_CODE}`
            })
            .attr("class", "neighbourhood-single")
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

        vis.addDots()
        
        vis.zoom = d3.zoom()
            .scaleExtent([1, 8])
            .on("zoom", this.zoomed);

        vis.svg.call(vis.zoom);
    }

    zoomed(event) {
        let vis = this;
        const {transform} = event;
        g.attr("transform", transform);
        g.attr("stroke-width", 1 / transform.k);
    }

    updateZoom(neighbourhood, event){
        let vis = this;
        vis.currentNB = neighbourhood;
        const [[x0, y0], [x1, y1]] = vis.path.bounds(vis.path.centroid(vis.geoData.features[vis.currentNB._id - 1]));

        d3.select(`#single-nb-${vis.currentNB.AREA_LONG_CODE}`).transition().style("fill", "red");
        vis.svg.transition().duration(750).call(
        vis.zoom.transform,
        d3.zoomIdentity
            .translate(vis.width / 2, vis.height / 2)
            .scale(Math.min(8, 0.9 / Math.max((x1 - x0) / vis.width, (y1 - y0) / vis.height)))
            .translate(-(x0 + x1) / 2, -(y0 + y1) / 2),
        d3.pointer(event, vis.svg.node())
    );
    }

    addDots() {
        let vis = this;
        
        vis.bikeshare = vis.svg.selectAll("circle.bikeshare")
            .data(vis.stationData, d => d["Station Id"]);

        // ENTER: Append circles for each station.
        vis.bikeshare.enter()
            .append("circle")
            .attr("class", "bikeshare")
            .attr("cx", d => {
                return vis.projection([d.Longitude, d.Latitude])[0]
            })
            .attr("cy", d => vis.projection([d.Longitude, d.Latitude])[1])
            .attr("r", 4)
            .attr("fill", "red")
            .attr("stroke", "grey")
            .attr("stroke-width", 1)
            .style("opacity", 0);
        
        vis.bikerack = vis.svg.selectAll("path.bikerack")
            .data(vis.bikeRackData.features)
            .enter()
            .append("path")
            .attr("d",vis.path)
            .attr("class", "bikerack")
            .attr("fill", "orange")
            .attr("stroke", "grey")
            .attr("stroke-width", 1)
            .style("opacity", 0);
    }

    
}