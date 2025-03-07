let bikeshareMapVis;

let promises = [
    d3.json("data/bike_share_stations_2024-01.json"),
    d3.csv("data/bike_share_trips_2024-01.csv"),
    d3.json('data/Neighbourhoods.geojson')
];

Promise.all(promises)
    .then( function(data){ initProject(data) })
    .catch( function (err){console.log(err)} );

function initProject(allDataArray) {
    console.log(allDataArray);
    stationData = allDataArray[0];
    tripData = allDataArray[1];
    mapData = allDataArray[2];
    console.log(allDataArray);
    bikeshareMapVis = new MapVis('bikeshare-map-area', stationData, tripData, mapData);
}