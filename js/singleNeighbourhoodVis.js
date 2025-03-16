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

        vis.mapYOffset = 40; // So that map/clipping region and title have some space in between

        // Define the clipping region
        vis.svg.append("defs")
            .append("clipPath")
            .attr("id", "bikeshareMapClip")
            .append("rect")
            .attr("width", vis.width)
            .attr("height", vis.height - vis.mapYOffset);

        // add title
        vis.svg.append('g')
            .attr('class', 'title')
            .attr('id', 'map-title')
            .append('text')
            .attr('class', 'map-title-text')
            .attr('id', 'map-title-text-singleNeighbourhood')
            .text(`Detailed Neighbourhood View:`)
            .attr('transform', `translate(${vis.width / 5}, 20)`);

        vis.projection = d3.geoMercator().fitSize([vis.width,vis.height],vis.geoData)
        vis.path = d3.geoPath(vis.projection);

        // Set up map group
        vis.mapContainer = vis.svg.append("g")
            .attr("transform", `translate(0, ${vis.mapYOffset})`)
            .attr("clip-path", "url(#bikeshareMapClip)");

        vis.map = vis.mapContainer.append("g")
            .attr("class", "neighbourhoods");

        // Draw the map
        vis.map.selectAll("path")
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

        vis.addDots()

        vis.zoomFunction = function(event) {
            vis.map.attr("transform", event.transform);
            vis.map.attr("stroke-width", 1 / event.transform.k);
        }

        vis.zoom = d3.zoom()
            .scaleExtent([1, 8])
            .on("zoom", vis.zoomFunction);

        vis.mapContainer.call(vis.zoom);
    }

    updateZoom(neighbourhood, event){
        let vis = this;
        vis.currentNB = neighbourhood;
        const feature = vis.geoData.features[vis.currentNB._id - 1];
        const [[x0, y0], [x1, y1]] = vis.path.bounds(feature);

        console.log(x0, y0, x1, y1);
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