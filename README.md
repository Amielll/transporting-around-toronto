# transporting-around-toronto
Our story about biking in Toronto told through data visualizations. Final Project submission for CSC316.

## Project Information
This project was built using [D3.js](https://d3js.org/), [Bootstrap](https://getbootstrap.com/), and vanilla JS, HTML, CSS. Deployment was on an Azure Static Web App via Github Actions. 

This web application features several interactive visualizations that each look at a certain aspect about biking in
Toronto (e.g. the Bike Share network) as well as several comparisons to Montreal and Vancouver. Most maps and charts
are clickable and update according to selected variables and various toggles. For a quick example on usage, check out
the demo below!

### Demo
A two-minute video demoing the project can be found [here](https://drive.google.com/file/d/1A4xegE4duWqc6yf9bxhtcKd6n_MkuANR/view?usp=drive_link).

### Deployment
The project can be accessed [here](https://gray-field-055999b0f.6.azurestaticapps.net/).

### Interaction Overview
- Navigate through the visualization by scrolling, using the arrow keys, or using the navigation dots (along the right side).

##### Vis 1: Bike Path City Comparison (Nav-dot 4)
- Click the buttons on the top right side to toggle the view between Montreal and Vancouver.

##### Vis 2: Bike Share Station City Comparison (Nav-dot 6)
- Click the buttons on the top right side to toggle the view between Montreal and Vancouver.
- Hover over each station dot to see the station name and capacity.

##### Vis 3: Bike Network Analysis (BNA) Scores (Nav-dot 8)
- Hover over a category (cluster of bars) to learn more about the category.
- Click on any of a city's bars or the city entry in the legend to highlight that city's scores.
- Click again on any of a city's bars or the city entry in the legend to un-highlight that city's scores and restore the original view.

##### Vis 4: Toronto Neighbourhood Choropleths (Nav-dot 11)
- Use the dropdowns to change the variable being displayed on either of the 2 maps.
- Use the checkboxes to toggle the Bike Share Station & Bike Rack dots on and off.
- Hover over a neighbourhood to see its name, and its values for the two displayed variables.

##### Vis 5: Toronto Neighbourhood Scatterplot (Nav-dot 13)
- Use the dropdowns to change the variable being displayed on the x or y axis.

##### Vis 6: Toronto Detailed Neighbourhood View (Nav-dot 15)
- Click on a neighbourhood in the mini-map in the top right corner to zoom in on that neighbourhood on the big left-hand map and display its summary.
- Click on a neighbourhood in the big left-hand map to zoom in on it and display its summary.
- Scroll on the big left-hand map to zoom in and out. 
- Use the checkboxes to toggle the Bike Share Station dots, Bike Rack dots, and Bike Paths on and off.

##### Vis 7: Toronto Detailed Neighbourhood View (Nav-dot 17)
- Use the dropdown to choose the statistic being displayed in the bar chart.
- Click on a Bike Share Station to zoom in on it and view its statistics.
- Click on a bar in the bar chart to zoom in on that corresponding Bike Share Station.
- Click again on a selected station/bar to unselect it and zoom out to view the whole map. 
- Scroll on the big left-hand map to zoom in and out. 


### Local Setup
In case the above link is no longer accessible at the time of reading this (resource may be torn down in the future), you
can alternatively build the project on your local machine. The only prerequisite is that your system has Node v18 installed
along with npm v10. Steps to get up and running locally:
1. Clone the project to your local directory
2. Install dependencies `npm install`
3. Run the local server `npm run dev`

The class responsible for loading data (`js/util/dataManager.js`) will attempt to read data from an external API to
retrieve station status data. If the API is down at the time of reading this, please use the provided file under 
`public\data\bike_share_stationStatus.json` to load a subset of that data. Otherwise, all other data used in the project
can be found directly within the `public\data` folder and should work as-is when running the project.

### Data Sources
The sources to all data used in this project are as follows:
- [Toronto Bike Share](https://open.toronto.ca/dataset/bike-share-toronto/)
- [Toronto Bike Share Station Status](https://tor.publicbikesystem.net/ube/gbfs/v1/en/station_status)*
- [Toronto Bike Paths Data](https://open.toronto.ca/dataset/cycling-network/)
- [Toronto Bicycle Thefts](https://open.toronto.ca/dataset/bicycle-thefts/)
- [Toronto Bicycle Collisions](https://data.torontopolice.on.ca/datasets/TorontoPS::cyclist-ksi/about)
- [Toronto Bike Share Ridership Data](https://open.toronto.ca/dataset/bike-share-toronto-ridership-data/)
- [Toronto Neighbourhoods GeoJson Data](https://open.toronto.ca/dataset/neighbourhoods/)
- [Toronto Demographics Data](https://open.toronto.ca/dataset/neighbourhood-profiles/)
- [Toronto Bike Racks Data](https://open.toronto.ca/dataset/bicycle-parking-racks/)
- [Montreal Bike Paths Data](https://open.canada.ca/data/en/dataset/5ea29f40-1b5b-4f34-85b3-7c67088ff536)
- [Montreal Neighbourhoods GeoJson Data](https://open.canada.ca/data/en/dataset/9797a946-9da8-41ec-8815-f6b276dec7e9)
- [Montreal Bike Share Data](https://gbfs.velobixi.com/gbfs/gbfs.json)
- [Vancouver Bike Paths Data](https://opendata.vancouver.ca/explore/dataset/bikeways/information/?disjunctive.year_of_construction&disjunctive.bike_route_name&disjunctive.bikeway_type&disjunctive.subtype)
- [Vancouver Neighbourhoods GeoJson Data](https://opendata.vancouver.ca/explore/dataset/local-area-boundary/)
- [Vancouver Bike Share Data](https://vancouver-gbfs.smoove.pro/gbfs/gbfs.json)
- [Bicycle Network Analysis Scores Data](https://cityratings.peopleforbikes.org/ratings)
*Data returned by this API is automatically sampled every 6 hours via an Azure Function, starting from March 12, 2025 @ 8PM UTC.



### Contributors
Authors: Amiel Nurja, Dihan Niloy, Mieko Yao

Special thanks to Yunfu (Chris) Xu for his contributions in ideating for our project.
