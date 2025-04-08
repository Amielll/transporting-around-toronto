# transporting-around-toronto
Our story about biking in Toronto told through data visualizations. Final Project submission for CSC316.

## Project Information

### Demo
A two-minute video demoing the project can be found [here](https://drive.google.com/file/d/1A4xegE4duWqc6yf9bxhtcKd6n_MkuANR/view?usp=drive_link).

### Deployment
The project is deployed on an Azure Static Web App and can be accessed [here](https://gray-field-055999b0f.6.azurestaticapps.net/).

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
We provide the sources to all data used in this project below:
- [Toronto Bike Share](https://open.toronto.ca/dataset/bike-share-toronto/)
- [Toronto Bike Share Station Status](https://tor.publicbikesystem.net/ube/gbfs/v1/en/station_status)*
- [Toronto Cycling Network](https://open.toronto.ca/dataset/cycling-network/)
- [Toronto Bicycle Thefts](https://open.toronto.ca/dataset/bicycle-thefts/)
- [Toronto Bike Share Ridership Data](https://open.toronto.ca/dataset/bike-share-toronto-ridership-data/)

*Data returned by this API is automatically sampled every 6 hours via an Azure Function, starting from March 12, 2025 @ 8PM UTC.



### Contributors
Authors: Dihan Niloy, Amiel Nurja, Mieko Yao

Special thanks to Yunfu (Chris) Xu 
