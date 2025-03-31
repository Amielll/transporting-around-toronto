import {BaseMapVis} from "./baseMapVis.js";
import * as d3 from "d3";

export class CityCompBikeshareMapVis extends BaseMapVis {

    constructor(parentElement, geoData, stationData, eventHandler, config={}) {
        // eventHandler not used in this class.
        super(parentElement, geoData, eventHandler, config);
        this.stationData = stationData;
        this.initVis();
    }

    initVis() {
        let vis = this;
        super.initVis();

        this.updateTitle();

        // Represent stations as dots on the map
        vis.stationDots = vis.map.selectAll("circle")
            .data(vis.stationData, d => d.id);

        vis.radiusScale = d3.scaleLinear()
            .domain([1, 8])
            .range([3, 0.5])
            .clamp(true);

        // Add title
        vis.svg.append("g")
            .attr("class", "title")
            .attr("id",  `${vis.parentElement}MapTitle`)
            .append("text")
            .text(vis.config.title)
            .attr('transform', `translate(${vis.width / 2}, 20)`)
            .attr("text-anchor", "middle");
        
        vis.tooltip = d3.select("body").append('div')
                    .attr('class', "tooltip")
                    .attr('id', 'cityCompTooltip')

        // Draw station dots and set up click listener
        vis.stationDots.enter()
            .append("circle")
            .attr("class", "station")
            .attr("cx", d => vis.projection([d.longitude, d.latitude])[0])
            .attr("cy", d => vis.projection([d.longitude, d.latitude])[1])
            .attr("r", vis.radiusScale(1))
            .attr("fill", "steelblue")
            .attr("stroke", "#fff")
            .attr("cursor", "pointer")
            .attr("stroke-width", vis.radiusScale(1) / 4)
            .on('mouseover', function(event, d){
                console.log(d);
                d3.select(this)
                    .attr('stroke-width', '3px')
                    .attr('stroke', 'black');
                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(`
                        <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 20px 20px 5px 20px;">
                            <h6> Station: ${d.name} </h6>
                            Capacity: ${d.capacity}
                        </div>`);
            })
            .on('mouseout', function(event, d){
                            d3.select(this)
                                .attr('stroke-width', '1px')
                                .attr('stroke', 'lightgrey');
            
                            vis.tooltip
                                .style("opacity", 0)
                                .style("left", 0)
                                .style("top", 0)
                                .html(``);
                        });

        // Zoom/pan functionality
        vis.zoomFunction = function(event) {
            vis.map.attr("transform", event.transform);
            vis.map.selectAll(".station")
                .attr("r", vis.radiusScale(event.transform.k))
                .attr("stroke-width", vis.radiusScale(event.transform.k) / 4)

            vis.updateVis();
        }

        vis.zoom = d3.zoom()
            .scaleExtent([1,8])
            .translateExtent([[0,0], [vis.width, vis.height - vis.config.mapYOffset]])
            .on("zoom", vis.zoomFunction);

        vis.mapContainer.call(vis.zoom);

        // Next step in vis pipeline
        // Can't get this to work for Montreal.
        // vis.wrangleData();
    }

    updateTitle() {
        // Update visualization title based on which city this is.
        let cityName;

        // Determine city name based on the first three characters of the parent element.
        switch(this.parentElement.slice(0,3)) {
            case "tor":
                cityName = "Toronto";
                break;
            case "mtl":
                cityName = "Montreal";
                break;
            case "van":
                cityName = "Vancouver";
                break;
        }
        this.config.title = `${cityName} Bikeshare Stations`;
    }

    wrangleData() {
        let vis = this;

        // Associate each station with the neighbourhood it's in
        vis.stationData.forEach(station => {
            const point = [station.longitude, station.latitude];
            const neighbourhoodFeature = vis.geoData.features.find(feature => d3.geoContains(feature, point));
            station.neighbourhood = neighbourhoodFeature.properties.AREA_NAME;
        });

        vis.updateVis();
    }

    updateVis() {
        super.updateVis(); // map path update
    }

    updateZoom(d) {
        let vis = this;
        const [x, y] = vis.projection([d.longitude, d.latitude]);
        const scale = 8;

        const translateX = vis.width / 2 - scale * x;
        const translateY = (vis.height - vis.config.mapYOffset) / 2 - scale * y;

        // Apply the new transform with a smooth transition
        vis.mapContainer.transition().duration(750).call(
            vis.zoom.transform,
            d3.zoomIdentity.translate(translateX, translateY).scale(scale)
        );
    }
}