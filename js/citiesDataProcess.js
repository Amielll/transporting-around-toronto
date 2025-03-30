export function torDOMInfo()
{
    let DOMInfo = {};

    DOMInfo.selectionChangeEventName = "monSelectionChanged";

    DOMInfo.mapParent = 'tor-bikeshare-comparison-vis';
    DOMInfo.mapTitle = 'Toronto Bike Share Stations';

    DOMInfo.cityName = 'Toronto';

    // TODO: The following are useless. See how to remove them.
    DOMInfo.barParent = 'mon-bikeshare-station-bar-vis';
    DOMInfo.barTitle = 'Montreal Bike Share Top 10: Total Volume';

    DOMInfo.summary = "#mon-bikeshare-station-summary";
    DOMInfo.summaryName = "#mon-bikeshare-summary-station-name";
    DOMInfo.summaryID = "#mon-bikeshare-summary-station-id";
    DOMInfo.summaryNeighbourhood = "#mon-bikeshare-summary-station-neighbourhood";
    DOMInfo.summaryLocation = "#mon-bikeshare-summary-station-location";

    DOMInfo.metric = 'mon-bikeshare-station-metric';
    
    return DOMInfo;
}

export function monDOMInfo()
{
    let DOMInfo = {};

    DOMInfo.selectionChangeEventName = "monSelectionChanged";

    DOMInfo.mapParent = 'mon-bikeshare-comparison-vis';
    DOMInfo.mapTitle = 'Montreal Bike Share Stations';

    DOMInfo.cityName = 'Montreal';

    // TODO: following are useless
    DOMInfo.barParent = 'mon-bikeshare-station-bar-vis';
    DOMInfo.barTitle = 'Montreal Bike Share Top 10: Total Volume';

    DOMInfo.summary = "#mon-bikeshare-station-summary";
    DOMInfo.summaryName = "#mon-bikeshare-summary-station-name";
    DOMInfo.summaryID = "#mon-bikeshare-summary-station-id";
    DOMInfo.summaryNeighbourhood = "#mon-bikeshare-summary-station-neighbourhood";
    DOMInfo.summaryLocation = "#mon-bikeshare-summary-station-location";

    DOMInfo.metric = 'mon-bikeshare-station-metric';
    
    return DOMInfo;
}

export function vanDOMInfo()
{
    let DOMInfo = {};

    DOMInfo.mapParent = 'van-bikeshare-comparison-vis';
    DOMInfo.mapTitle = 'Vancouver Bike Share Stations';

    DOMInfo.cityName = 'Vancouver';

    // TODO: following are useless
    DOMInfo.selectionChangeEventName = "vanSelectionChanged";

    DOMInfo.barParent = 'mon-bikeshare-station-bar-vis';
    DOMInfo.barTitle = 'Montreal Bike Share Top 10: Total Volume';

    DOMInfo.summary = "#mon-bikeshare-station-summary";
    DOMInfo.summaryName = "#mon-bikeshare-summary-station-name";
    DOMInfo.summaryID = "#mon-bikeshare-summary-station-id";
    DOMInfo.summaryNeighbourhood = "#mon-bikeshare-summary-station-neighbourhood";
    DOMInfo.summaryLocation = "#mon-bikeshare-summary-station-location";

    DOMInfo.metric = 'mon-bikeshare-station-metric';
    
    return DOMInfo;
}

export function processMontrealStationData(stationInfo, stationStatus, tripData) {
    let stationData = []

    stationInfo.forEach((station) => {
        let stationDataEntry = {};
        stationDataEntry.id = `${station["station_id"]}`;
        stationDataEntry.name = station["name"];
        stationDataEntry.latitude = station["lat"];
        stationDataEntry.longitude = station["lon"];
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

export function processVancouverStationData(stationInfo, stationStatus, tripData) {
    let stationData = []

    stationInfo.forEach((station) => {
        let stationDataEntry = {};
        stationDataEntry.id = `${station["station_id"]}`;
        stationDataEntry.name = station["name"];
        stationDataEntry.latitude = station["lat"];
        stationDataEntry.longitude = station["lon"];
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