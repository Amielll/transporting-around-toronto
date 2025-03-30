import * as d3 from "d3";

export class SingleNeighbourhoodVis {
    constructor(parentElement, stationData, geoData, neighbourhoodData, bikeRackData, bikeLaneData) {
        this.parentElement = parentElement;
        this.stationData = stationData;
        this.geoData = geoData;
        this.neighbourhoodData = neighbourhoodData;
        this.bikeRackData = bikeRackData;
        this.bikeLaneData = bikeLaneData;

        this.currentNB = null;

        this.initVis();
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

        vis.projection = d3.geoMercator().fitSize([vis.width,vis.height],vis.geoData)
        vis.path = d3.geoPath(vis.projection);

        // Set up map group
        vis.mapContainer = vis.svg.append("g")
            .attr("transform", `translate(0, ${vis.mapYOffset})`)
            .attr("clip-path", "url(#bikeshareMapClip)");

        vis.map = vis.mapContainer.append("g")
            .attr("class", "neighbourhoods");

        // Draw the map
        vis.neighbourhoods = vis.map.selectAll("path")
            .data(vis.geoData.features);
        
        vis.neighbourhoods.enter()
            .append("path")
            .attr("d", vis.path)
            .attr("id", (d) => {
                return `single-nb-${d.properties.AREA_LONG_CODE}`
            })
            .attr("class", "neighbourhood-single")
            .attr('stroke-width', '0.5px')
            .attr('stroke', 'black')
            .attr('fill', '#ddd')
            .on('click', function(event, d){
                vis.updateZoom(d.properties, event);
            });

        vis.addDots()

        vis.zoomFunction = function(event) {
            console.log(event);
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

        
        d3.selectAll(`.neighbourhood-single`).style('fill', '#ddd');

        d3.select(`#single-nb-${vis.currentNB.AREA_LONG_CODE}`).transition().style("fill", "#6a9bc3");
        
        // vis.svg.transition().duration(750).call(
        //     vis.zoom.transform,
        //     d3.zoomIdentity
        //         .translate(vis.width / 2, vis.height / 2)
        //         .scale(Math.min(8, 0.9 / Math.max((x1 - x0) / vis.width, (y1 - y0) / vis.height)))
        //         .translate(-(x0 + x1) / 2, -(y0 + y1) / 2),
        //     d3.pointer(event, vis.svg.node())
        // );

        let scale = Math.min(8, 0.9 / Math.max((x1 - x0) / vis.width, (y1 - y0) / vis.height));
        let translateX = vis.width / 2 - scale * (x0 + x1) / 2;
        let translateY = vis.height / 2 - scale * (y0 + y1) / 2;

        vis.mapContainer.transition().duration(750).call(
            vis.zoom.transform,
            d3.zoomIdentity.translate(translateX, translateY).scale(scale)
        );

        d3.select("#single-neighbourhood-name")
            .html(`Detailed Neighbourhood View: <i>${vis.currentNB.AREA_NAME}</i>`);

        let neighbourhoodInfo = this.neighbourhoodData[vis.currentNB.AREA_LONG_CODE];

        this.updateSummary(neighbourhoodInfo)
        // d3.select("#nb-info").html(
        //     `<div>
        //         <h4>${vis.currentNB.AREA_NAME} (${vis.currentNB.AREA_LONG_CODE})</h4> 
        //         <p class="nb-stat"> <b>Average Income (2021):</b> $${this.moneyFormat(neighbourhoodInfo.average_income)}</p>  
        //         <p class="nb-stat"> <b>Bike Commuter Percentage (2021):</b> ${neighbourhoodInfo.collisions}</p>                     
        //         <p class="nb-stat"> <b>Bikeshare Stations:</b> ${neighbourhoodInfo.bikeshare_stations}</p>      
        //         <p class="nb-stat"> <b>Bike Racks:</b> ${neighbourhoodInfo.bike_parking_racks}</p>        
        //         <p class="nb-stat"> <b>Total Bicycle Collisions (2009-2023):</b> ${neighbourhoodInfo.collisions}</p>      
        //         <p class="nb-stat"> <b>Total Bicycle Thefts (2009-2023):</b> ${neighbourhoodInfo.thefts}</p>       
        //     </div>`);

        
    }

    updateSummary(neighbourhoodInfo) {
        let summary = d3.select("#nb-summary");
        let summaryName = d3.select("#nb-summary-name");
        let summaryIncome = d3.select("#nb-summary-income");
        let summaryCommuter = d3.select("#nb-summary-commuter");
        let summaryStations = d3.select("#nb-summary-stations");
        let summaryRacks = d3.select("#nb-summary-racks");
        let summaryCollisions = d3.select("#nb-summary-collisions");
        let summaryThefts = d3.select("#nb-summary-thefts");

        console.log(neighbourhoodInfo)
        // summary.style("display", "block");
        summaryName.text(`${neighbourhoodInfo.name} (${neighbourhoodInfo.number})`);
        summaryIncome.text(`$${d3.format(",")(neighbourhoodInfo.average_income)}`);
        summaryCommuter.text(d3.format(".00%")(neighbourhoodInfo.bicycle_commuters));
        summaryStations.text(neighbourhoodInfo.bikeshare_stations);
        summaryRacks.text(neighbourhoodInfo.bike_parking_racks);
        summaryCollisions.text(neighbourhoodInfo.collisions);
        summaryThefts.text(neighbourhoodInfo.thefts);
    }

    addDots() {
        let vis = this;
        
        vis.bikeshare = vis.map.selectAll("circle.single-bikeshare")
            .data(vis.stationData, d => d["Station Id"]);

        // ENTER: Append circles for each station.
        vis.bikeshare.enter()
            .append("circle")
            .attr("class", "single-bikeshare")
            .attr("cx", d => {
                return vis.projection([d.Longitude, d.Latitude])[0]
            })
            .attr("cy", d => vis.projection([d.Longitude, d.Latitude])[1])
            .attr("r", 1)
            .attr("fill", "red")
            .attr("stroke", "grey")
            .attr("stroke-width", 0.25)
            .style("opacity", .7);
        

        vis.bikerack = vis.map.selectAll("circle.single-bikerack")
            .data(vis.bikeRackData);

        vis.bikerack.enter()
            .append("circle")
            .attr("class", "single-bikerack")
            .attr("cx", d => {
                return vis.projection([d.Longitude, d.Latitude])[0]
            })
            .attr("cy", d => vis.projection([d.Longitude, d.Latitude])[1])
            .attr("r", 1)
            .attr("fill", "orange")
            .attr("stroke", "grey")
            .attr("stroke-width", 0.25)
            .style("opacity", .7);


        vis.lanePath = d3.geoPath().projection(vis.projection);

        vis.bikePaths = vis.map.selectAll("path.single-lanes")
            .data(vis.bikeLaneData.features.flatMap(feature => feature.geometry.coordinates))
            .enter()
            .append("path")
            .attr('d', d => vis.lanePath({ type: 'LineString', coordinates: d }))
            .attr("class", "single-lanes")
            .attr('stroke', '#006d2c')
            .attr("stroke-width", 0.5)
            .attr('fill', 'none');
    }

    
}