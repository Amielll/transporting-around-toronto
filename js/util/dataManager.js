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
        ]);


        this.data = {
            torStationInfo : allData[0],
            torStationStatus : allData[1],
            torTripData : allData[2],
            torStationData: this.processStationData(allData[0], allData[1], allData[2]),
            torMapData : allData[3],
            mtlStationData : allData[4],
            mtlTripData : allData[5],
            mtlMapData : allData[6],
            torDemographicData : allData[7],
            torBikeLaneData : allData[9],
            torBikeRackData : allData[8],
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
            stationDataEntry.statusSamples = []
            if (stationDataEntry.id in stationStatus) {
                stationDataEntry.statusSamples = stationStatus[stationDataEntry.id]["samples"];
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

}
