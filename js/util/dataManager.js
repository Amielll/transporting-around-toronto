import * as d3 from "d3";


export class DataManager {
    constructor() {
        if (DataManager.instance) {
            return DataManager.instance;
        }

        this.data = {};
        this.loaded = false;
        this.path = '../data';
        DataManager.instance = this;
    }

    async loadData() {
        if (this.loaded) return this.data; // Prevent reloading

        const allData = await Promise.all([
            d3.json(`${this.path}/bike_share_stations_2024-01.json`),
            d3.json(`${this.path}/bike_share_stationStatus.json`),
            d3.csv(`${this.path}/bike_share_trips_2024-01.csv`),
            d3.json(`${this.path}/Neighbourhoods.geojson`),
            d3.json(`${this.path}/montreal_station_information_cleaned.json`),
            d3.csv(`${this.path}/Montreal Trip Counts.csv`),
            d3.json(`${this.path}/montreal-neighbourhoods.geojson`),
            d3.csv(`${this.path}/neighbourhoods.csv`),
            d3.json(`${this.path}/bike_racks_data.geojson`),
            d3.json(`${this.path}/cycling-network - 4326.geojson`),
            d3.json(`${this.path}/vancouver_station_information_cleaned.json`),
            d3.json(`${this.path}/vancouver_neighbourhoods.geojson`),
            d3.csv(`${this.path}/vancouver_trips.csv`),
            d3.csv(`${this.path}/bna-city-ratings.csv`),
            d3.json(`${this.path}/cycling-network-montreal.geojson`),
            d3.json(`${this.path}/cycling-network-vancouver.geojson`)
        ]);


        this.data = {
            torStationInfo : allData[0],
            torStationStatus : allData[1],
            torTripData : allData[2],
            torStationData: this.processStationData(allData[0], allData[1], allData[2]),
            torMapData : allData[3],
            mtlStationInfo : allData[4],
            mtlTripData : allData[5],
            mtlMapData : allData[6],
            mtlStationData: this.processMontrealStationData(allData[4], {}, allData[5]),
            torNeighbourhoodData : this.processNeighbourhoodData(allData[7]),
            torBikeRackData : this.processBikeRackData(allData[8]),
            torBikeLaneData : allData[9],
            vanStationInfo: allData[10],
            vanMapData: allData[11],
            vanTripData: allData[12],
            vanStationData: this.processVancouverStationData(allData[10], {}, allData[12]),
            bnaScores : this.processScoresData(allData[13]),
            mtlBikeLaneData: allData[14],
            vanBikeLaneData: allData[15],
        }

        this.loaded = true;
    }

    processStationData(stationInfo, stationStatus, tripData) {
        let stationData = []

        stationInfo.forEach((station) => {
            let stationDataEntry = {};
            stationDataEntry.id = `${station["Station Id"]}`;
            stationDataEntry.name = station["Station Name"];
            stationDataEntry.latitude = station["Latitude"];
            stationDataEntry.longitude = station["Longitude"];

            // If city's bike status API has status information about a station, sample of it should exist in data.
            if (stationDataEntry.id in stationStatus) {
                let samples = stationStatus[stationDataEntry.id]["samples"];

                let totalBikesAvailable = samples.reduce((runningSum, s) => runningSum + s["num_bikes_available"], 0);
                let totalBikesDisabled = samples.reduce((runningSum, s) => runningSum + s["num_bikes_disabled"], 0);
                let totalDocksDisabled = samples.reduce((runningSum, s) => runningSum + s["num_docks_disabled"], 0);
                stationDataEntry.avgBikesAvailable = totalBikesAvailable / samples.length;
                stationDataEntry.avgBikesDisabled = totalBikesDisabled / samples.length;
                stationDataEntry.avgDocksDisabled = totalDocksDisabled / samples.length;

                // # of docks *could* change (e.g. city adds more), but for simplicity assume it's fixed
                // arbitrarily choose most recent sample to get # of docks for this station
                let sample = samples[samples.length - 1];
                stationDataEntry.capacity = sample['num_docks_available'] + sample['num_docks_disabled'];
            }

            let filteredStartTrips = tripData.filter(tripDataEntry => tripDataEntry["Start Station Id"] === stationDataEntry.id);
            let filteredEndTrips = tripData.filter(tripDataEntry => tripDataEntry["End Station Id"] === stationDataEntry.id);

            stationDataEntry.asStartingCount = filteredStartTrips.reduce((runningSum, trip) => runningSum + +trip['Count'], 0);
            stationDataEntry.asDestCount = filteredEndTrips.reduce((runningSum, trip) => runningSum + +trip['Count'], 0);
            stationDataEntry.totalVolume = stationDataEntry.asStartingCount + stationDataEntry.asDestCount;

            let totalDurationAsStart = filteredStartTrips.reduce((runningSum, trip) => runningSum + +trip['Total Duration'], 0);
            let totalDurationAsDest = filteredEndTrips.reduce((runningSum, trip) => runningSum + +trip['Total Duration'], 0);
            let totalDuration = totalDurationAsStart + totalDurationAsDest;

            stationDataEntry.avgDurationAsStart = totalDurationAsStart / stationDataEntry.asStartingCount;
            stationDataEntry.avgDurationAsDest = totalDurationAsStart / stationDataEntry.asDestCount;
            stationDataEntry.avgDuration = totalDuration / stationDataEntry.totalVolume;
            stationData.push(stationDataEntry);
        });

        return stationData;
    }

    processBikeRackData(bikeRackData) {
        let bikeRackPoints = [];

        bikeRackData.features.forEach((d) => {
            bikeRackPoints.push({
                ...d.properties,
                Longitude: d.geometry.coordinates[0][0],
                Latitude: d.geometry.coordinates[0][1],

            })
        });

        return bikeRackPoints;
    }

    processNeighbourhoodData(demographicData) {
        let neighbourhoodData = {};
        demographicData.forEach(d => {
            Object.keys(d).forEach(key => {
                if (key !== "name" && key !== "number")
                    d[key] = +d[key];
            })
            neighbourhoodData[d.number] = d;
        });
        return neighbourhoodData;
    }
    
    processScoresData(data){
        let cleanedData = {
            "Total": [],
            "People": [],
            "Opportunity": [],
            "Core Services" : [],
            "Recreation" : [],
            "Retail" : [],
            "Transit" : [],
        }

        data.forEach((city) => {
            Object.keys(city).forEach((key) => { 
                if (Object.keys(cleanedData).includes(key))
                    cleanedData[key].push({"value": +city[key], "city": city.City})
            })
        })

        return cleanedData;
    }

    // TODO: These functions don't have to exist if we ensure the station data entries share the same names
    // Dihan: the problem is that the MTL bikeshare rides data uses station names, not station IDs. VAN was probably fine though, yeah.
    processMontrealStationData(stationInfo, stationStatus, tripData) {
        let stationData = []

        stationInfo.forEach((station) => {
            let stationDataEntry = {};
            stationDataEntry.id = `${station["station_id"]}`;
            stationDataEntry.name = station["name"];
            stationDataEntry.latitude = station["lat"];
            stationDataEntry.longitude = station["lon"];
            stationDataEntry.capacity = station["capacity"];


            stationDataEntry.statusSamples = []
            // if (stationDataEntry.id in stationStatus) {
            //     stationDataEntry.statusSamples = stationStatus[stationDataEntry.id]["samples"];
            // }

            let filteredStartTrips = tripData.filter(tripDataEntry => tripDataEntry["Start Station Name"] === stationDataEntry.name);
            let filteredEndTrips = tripData.filter(tripDataEntry => tripDataEntry["End Station Name"] === stationDataEntry.name);

            stationDataEntry.asStartingCount = filteredStartTrips.reduce((runningSum, trip) => runningSum + +trip['Count'], 0);
            stationDataEntry.asDestCount = filteredEndTrips.reduce((runningSum, trip) => runningSum + +trip['Count'], 0);
            stationDataEntry.totalVolume = stationDataEntry.asStartingCount + stationDataEntry.asDestCount;

            let totalDurationAsStart = filteredStartTrips.reduce((runningSum, trip) => runningSum + +trip['Total Duration'], 0);
            let totalDurationAsDest = filteredEndTrips.reduce((runningSum, trip) => runningSum + +trip['Total Duration'], 0);
            let totalDuration = totalDurationAsStart + totalDurationAsDest;

            stationDataEntry.avgDurationAsStart = totalDurationAsStart / stationDataEntry.asStartingCount;
            stationDataEntry.avgDurationAsDest = totalDurationAsStart / stationDataEntry.asDestCount;
            stationDataEntry.avgDuration = totalDuration / stationDataEntry.totalVolume;
            stationData.push(stationDataEntry);
        });

        return stationData;
    }

    processVancouverStationData(stationInfo, stationStatus, tripData) {
        let stationData = []

        stationInfo.forEach((station) => {
            let stationDataEntry = {};
            stationDataEntry.id = `${station["station_id"]}`;
            stationDataEntry.name = station["name"];
            stationDataEntry.latitude = station["lat"];
            stationDataEntry.longitude = station["lon"];
            stationDataEntry.capacity = station["capacity"];
            
            stationDataEntry.statusSamples = []
            // if (stationDataEntry.id in stationStatus) {
            //     stationDataEntry.statusSamples = stationStatus[stationDataEntry.id]["samples"];
            // }

            let filteredStartTrips = tripData.filter(tripDataEntry => tripDataEntry["Start Station Id"] === stationDataEntry.name);
            let filteredEndTrips = tripData.filter(tripDataEntry => tripDataEntry["End Station Id"] === stationDataEntry.name);

            stationDataEntry.asStartingCount = filteredStartTrips.reduce((runningSum, trip) => runningSum + +trip['Count'], 0);
            stationDataEntry.asDestCount = filteredEndTrips.reduce((runningSum, trip) => runningSum + +trip['Count'], 0);
            stationDataEntry.totalVolume = stationDataEntry.asStartingCount + stationDataEntry.asDestCount;

            let totalDurationAsStart = filteredStartTrips.reduce((runningSum, trip) => runningSum + +trip['Total Duration'], 0);
            let totalDurationAsDest = filteredEndTrips.reduce((runningSum, trip) => runningSum + +trip['Total Duration'], 0);
            let totalDuration = totalDurationAsStart + totalDurationAsDest;

            stationDataEntry.avgDurationAsStart = totalDurationAsStart / stationDataEntry.asStartingCount;
            stationDataEntry.avgDurationAsDest = totalDurationAsStart / stationDataEntry.asDestCount;
            stationDataEntry.avgDuration = totalDuration / stationDataEntry.totalVolume;
            stationData.push(stationDataEntry);
        });

        return stationData;
    }
}
