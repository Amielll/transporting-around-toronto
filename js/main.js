let bikeshareMapVis;

d3.json('data/Neighbourhoods.geojson').then(data => {
    bikeshareMapVis = new MapVis('app', [], data);
})