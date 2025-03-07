/* * * * * * * * * * * * * *
*          MapVis          *
* * * * * * * * * * * * * */
import * as d3 from "d3";

let titles = {
    "average_income_2020": "Average Annual Income (2020)",
    "bicycle_commuters": "Bike Commuter Proportion (2021)",
    "bikeshare_stations": "Bikeshare Stations (2025)",
    "collisions": "Bike Collisions (2006-2023)",
    "thefts": "Bike Thefts (2009-2024)"
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

    constructor(parentElement, valueData, geoData, variable, colour, id) {
        this.parentElement = parentElement;
        this.geoData = geoData;
        this.valueData = valueData;
        this.neighbourhoodData = new Object;
        this.valueData.forEach(d => {
            Object.keys(d).forEach(key => {
                if (key !== "name" && key !== "number")
                    d[key] = +d[key];
            })
            this.neighbourhoodData[d.number] = d;
        });
        
        this.valueData = JSON.parse(JSON.stringify(this.valueData));

        // define colors
        this.variable = variable;
        this.opacity = 0;
        this.colour = colour;
        this.id = id;
        this.initVis()
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
            .attr('class', 'map-title-text')
            .attr('id', 'map-title-text' + vis.id)
            .text(titles[vis.variable])
            .attr('transform', `translate(${vis.width / 2}, 40)`)
            .attr('text-anchor', 'middle');


        var projection = d3.geoMercator().fitSize([vis.width,vis.height],vis.geoData)
        var path = d3.geoPath(projection);
        
        vis.neighbourhoods = vis.svg.selectAll(".neighbourhood")
            .data(vis.geoData.features)
            .enter()
            .append("path")
            .attr("d",path)
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

        if (vis.id == 2){
            vis.legend.attr('transform', `translate(${5*vis.width/6}, ${8*vis.height/12})`)
            vis.legendAxis.attr('transform', `translate(${5*vis.width/6 - 5}, ${8*vis.height/12})`)
        }


        vis.wrangleData(this.variable);

    }

    wrangleData(newVar) {
        let vis = this;
        vis.variable = newVar;

        d3.select("#map-title-text" + vis.id).text(titles[vis.variable]);

        vis.values = Object.values(vis.valueData).map(d => d[vis.variable])

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
            .attr("y", function(d,i) { return i % 10 * 20  })
            .attr("x", function(d,i) { return 0})
            .attr("fill", function(d) { return vis.colorScale(d); })
        
        vis.text = vis.legendAxis.selectAll("text").data(vis.range)
            .enter();
        
        vis.text.append("text")
            .merge(vis.text)
            .attr("y", (d, i) => i*20 + 15)
            .attr("x", 0)
            .attr("text-anchor", () => {
                if (vis.id == 1){
                    return "start";
                }
                else{
                    return "end";
                }

            })
            .text((d, i) => {
                return "will fill in later";
            })

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
            })
        
		// // vis.svg.select(".legend-axis").call(vis.legendAxis);
    }
}