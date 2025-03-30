/* * * * * * * * * * * * * *
*          MapVis          *
* * * * * * * * * * * * * */
import * as d3 from "d3";
import {BaseMapVis} from "./baseMapVis.js";

let titles = {
    "average_income": "Average Annual Income (2021)",
    "bicycle_commuters": "Bike Commuter Proportion (2021)",
    "bikeshare_stations": "Number of Bikeshare Stations (2025)",
    "bike_parking_racks": "Number of Bike Parking Racks (2025)",
    "collisions": "Bike Collisions (2009-2023)",
    "thefts": "Bike Thefts (2009-2023)"
}

let colours = {
    "green":  d3.schemeGreens,
    "purple": d3.schemePurples,
    "blue": d3.schemeBlues,
    "red": d3.schemeReds,
    "grey": d3.schemeGreys,
    "orange": d3.schemeOranges
}

export class TorNeighbourhoodsMapVis extends BaseMapVis {

    constructor(parentElement, geoData, neighbourhoodData, stationData, rackData, config={})  {
        super(parentElement, geoData, null, config);
        this.neighbourhoodData = neighbourhoodData;
        this.stationData = stationData;
        this.bikeRackData = rackData;
        this.selectedVariable = this.config.defaultVar;
        this.initVis();
    }

    initVis() {
        let vis = this;
        let cfg = vis.config;
        super.initVis();

        // add title
        vis.svg.append('g')
            .attr('class', 'title')
            .attr('id', 'map-title-group' + cfg.id)
            .append('text')
            .attr('id', 'map-title-text' + cfg.id)
            .text(titles[vis.selectedVariable])
            .attr('transform', `translate(${vis.width / 2}, 40)`)
            .attr('text-anchor', 'middle');

        // tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', vis.parentElement + 'MapTooltip')

        // legend
        vis.legend = vis.svg.append("g")
            .attr('class', 'legend')
            .attr('transform', `translate(${vis.width/6}, ${vis.height/12})`)
            
		vis.legendAxis = vis.svg.append("g")
            .attr("class", "legend-axis")
            .attr('transform', `translate(${(vis.width/6) + 25}, ${vis.height/12})`)

        vis.legend.attr('transform', `translate(${vis.width - 25}, ${8*vis.height/12})`)
        vis.legendAxis.attr('transform', `translate(${vis.width - 30}, ${8*vis.height/12})`)


        vis.wrangleData(vis.selectedVariable);
    }

    wrangleData(newVar) {
        let vis = this;
        let cfg = vis.config;
        vis.selectedVariable = newVar;

        d3.select("#map-title-text" + cfg.id).text(titles[vis.selectedVariable]);

        vis.values = Object.values(vis.neighbourhoodData).map(d => d[vis.selectedVariable])

        vis.colorScale = d3.scaleQuantize()
        .domain([d3.min(vis.values), d3.max(vis.values)])
        .range(colours[cfg.colour][8]);

        // do the changing categories -> change values, change colorscale, change fill of neighbourhoods

        vis.updateVis()
    }

    updateVis() {
        let vis = this;

        vis.range = d3.range(d3.min(vis.values), d3.max(vis.values), (d3.max(vis.values) - d3.min(vis.values)) / 8);

        vis.rect = vis.legend.selectAll("rect")
            .data(vis.range)
            .enter()

        vis.rect.append("rect")
            .merge(vis.rect)
            .attr("width",20)
            .attr("height", 20)
            .style("stroke-width", 0.5)
            .style("stroke", "black")
            .attr("y", function(d,i) { return 140 - (i % 10 * 20)  })
            .attr("x", function(d,i) { return 0})
            .attr("fill", function(d) { return vis.colorScale(d); })
        
        vis.text = vis.legendAxis.selectAll(".axis-label")
            .data(vis.range);

        vis.commaFormat = d3.format(",");
        
        vis.text
            .enter()
            .append("text")
            .attr("class", "axis-label")
            .merge(vis.text)
            .attr("y", (d, i) => 140 - (i*20 - 15))
            .attr("x", 0)
            .attr("text-anchor", () => {
                return("end");
            })
            .text((d, i) => {
                const colours = vis.colorScale.range();
                
                let tickValues = vis.colorScale.invertExtent(colours[i]);

                let start = tickValues[0]
                let end = tickValues[1]

                if (Number.isInteger(end)){
                    if (i < colours.length - 1){
                        end -= 1;
                    }
                    start = Math.round(start);
                    end = Math.round(end);

                    if (vis.selectedVariable === "average_income") {
                        return(`$${vis.commaFormat(start)} — ${vis.commaFormat(end)}`);
                    }  
                    return(`${vis.commaFormat(start)} — ${vis.commaFormat(end)}`);
                } else {
                    end -= 0.001;
                    if (start == 0){
                        return(`${start} — ${end.toFixed(3)}`);
                    }
                    return(`${start.toFixed(3)} — ${end.toFixed(3)}`);
                }
                
            });

        let variable1 = d3.select("#data-type1").property("value");
        vis.neighbourhoods
            .style("fill", function (d) {
                var id = vis.neighbourhoodData[d.properties.AREA_LONG_CODE][vis.selectedVariable];
                return vis.colorScale(id);
            })
            .on('mouseover', function(event, d){
                d3.select(this)
                    .attr('stroke-width', '3px')
                    .attr('stroke', 'black');
                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(`
                        <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 20px 20px 5px 20px;">
                            <h6>Neighbourhood: ${d.properties.AREA_NAME}</h6>
                            <p>${titles[variable1]}: ${vis.neighbourhoodData[d.properties.AREA_LONG_CODE][variable1]}</p>         
                            <p>${titles[vis.selectedVariable]}: ${vis.neighbourhoodData[d.properties.AREA_LONG_CODE][vis.selectedVariable]}</p>    
                        </div>`);
            }).on('mouseout', function(event, d){
                d3.select(this)
                    .attr('stroke-width', '1px')
                    .attr('stroke', 'lightgrey');

                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            });
        
        this.addDots();
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
            .attr("r", 3)
            .attr("fill", "red")
            .attr("stroke", "grey")
            .attr("stroke-width", 1)
            .style("opacity", 0.4);
        
        vis.bikerack = vis.svg.selectAll("circle.bikerack")
            .data(vis.bikeRackData);

        vis.bikerack.enter()
            .append("circle")
            .attr("class", "bikerack")
            .attr("cx", d => {
                return vis.projection([d.Longitude, d.Latitude])[0]
            })
            .attr("cy", d => vis.projection([d.Longitude, d.Latitude])[1])
            .attr("r", 3)
            .attr("fill", "orange")
            .attr("stroke", "grey")
            .attr("stroke-width", 1)
            .style("opacity", 0.4);
    }
}