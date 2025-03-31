/* * * * * * * * * * * * * *
*          MapVis          *
* * * * * * * * * * * * * */
import * as d3 from "d3";

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

export class MapVis {

    constructor(parentElement, neighbourhoodData, geoData, stationData, rackData, variable, colour, id) {
        this.parentElement = parentElement;
        this.geoData = geoData;
        this.neighbourhoodData = neighbourhoodData;
        this.stationData = stationData;
        this.bikeRackData = rackData;

        // TODO: should be part of a config object
        // define colors
        this.variable = variable;
        this.opacity = 0;
        this.colour = colour;
        this.id = id;
        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = {top: 10, right: 20, bottom: 10, left: 20};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // add title
        vis.svg.append('g')
            .attr('class', 'title')
            .attr('id', 'map-title')
            .append('text')
            .attr('id', 'map-title-text' + vis.id)
            .text(titles[vis.variable])
            .attr('transform', `translate(${vis.width / 2}, 40)`)
            .attr('text-anchor', 'middle');


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
            .attr('stroke', 'lightgrey');
        
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'mapTooltip')

        
        vis.legend = vis.svg.append("g")
            .attr('class', 'legend')
            .attr('transform', `translate(${vis.width/6}, ${vis.height/12})`)
            
		vis.legendAxis = vis.svg.append("g")
            .attr("class", "legend-axis")
            .attr('transform', `translate(${(vis.width/6) + 25}, ${vis.height/12})`)

        vis.legend.attr('transform', `translate(${vis.width - 25}, ${8*vis.height/12})`)
        vis.legendAxis.attr('transform', `translate(${vis.width - 30}, ${8*vis.height/12})`)


        vis.wrangleData(this.variable);

    }

    wrangleData(newVar) {
        let vis = this;
        vis.variable = newVar;

        d3.select("#map-title-text" + vis.id).text(titles[vis.variable]);

        vis.values = Object.values(vis.neighbourhoodData).map(d => d[vis.variable])

        vis.colorScale = d3.scaleQuantize()
        .domain([d3.min(vis.values), d3.max(vis.values)])
        .range(colours[this.colour][8]);

        // do the changing categories -> change values, change colorscale, change fill of neighbourhoods

        vis.updateVis()
    }

    updateVis() {
        let vis = this;

        // let values = Object.values(vis.countryInfo).map(d => d.value)

        // vis.legendScale = d3.scaleQuantize()
        //     .domain([d3.min(values), d3.max(values)])
        //     .range(vis.colors);

		// vis.legendAxis = d3.axisLeft(vis.legendScale)
        //     .ticks(4);
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

                    if (vis.variable === "average_income") {
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
                var id = vis.neighbourhoodData[d.properties.AREA_LONG_CODE][vis.variable];
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
                            ${vis.opacity != 100 && vis.opacity != 0 ? 
                                `<p>${titles[variable1]}: ${vis.neighbourhoodData[d.properties.AREA_LONG_CODE][variable1]}</p>` 
                                : ""}              
                            <p>${titles[vis.variable]}: ${vis.neighbourhoodData[d.properties.AREA_LONG_CODE][vis.variable]}</p>    
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
        
		// // vis.svg.select(".legend-axis").call(vis.legendAxis);
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
            .attr("r", 2)
            .attr("fill", "#CB0B7B")
            .attr("stroke", "grey")
            .attr("stroke-width", 1)
            .style("opacity", 0.6);
        
        vis.bikerack = vis.svg.selectAll("circle.bikerack")
            .data(vis.bikeRackData);

        vis.bikerack.enter()
            .append("circle")
            .attr("class", "bikerack")
            .attr("cx", d => {
                return vis.projection([d.Longitude, d.Latitude])[0]
            })
            .attr("cy", d => vis.projection([d.Longitude, d.Latitude])[1])
            .attr("r", 2)
            .attr("fill", "#672A9C")
            .attr("stroke", "grey")
            .attr("stroke-width", 1)
            .style("opacity", 0.6);
        
        // vis.bikerack = vis.svg.selectAll("path.bikerack")
        //     .data(vis.rackData.features)
        //     .enter()
        //     .append("path")
        //     .attr("d",vis.path)
        //     .attr("class", "bikerack")
        //     .attr("fill", "orange")
        //     .attr("stroke", "grey")
        //     .attr("stroke-width", 1)
        //     .style("opacity", 0.5);
    }
}