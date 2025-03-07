class MapVis {

    constructor(parentElement, bikeshareData, torontoMapData) {
        this.parentElement = parentElement;
        this.bikeshareData = bikeshareData;
        this.mapData = torontoMapData;

        this.initVis()
    }

    initVis() {
        let vis = this;

        vis.margin = {top: 20, right: 20, bottom: 20, left: 20};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        console.log(document.getElementById(vis.parentElement).getBoundingClientRect());
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
            .text('Toronto Bike Share Trip Volume')
            .attr('transform', `translate(${vis.width / 2}, 20)`)
            .attr('text-anchor', 'middle');

        // Create a projection that fits the loaded GeoJSON into the SVG dimensions
        vis.projection = d3.geoMercator()
            .fitSize([vis.width, vis.height], vis.mapData);
        vis.path = d3.geoPath().projection(vis.projection);

        // Draw each ward as an SVG path
        vis.svg.selectAll("path")
            .data(vis.mapData.features)
            .enter()
            .append("path")
            .attr("d", vis.path)
            .attr("fill", "#ddd")
            .attr("stroke", "#333");
    }
}