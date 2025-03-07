"""
This helper script is used for preparing Toronto's Open Data on Bike Share
Ridership.
"""
import pandas as pd
import geojson
import json

def aggregate_station_data(ridership_data_path) -> pd.DataFrame:
    """
    Aggregate a count of all trips taken in a unique start/end station pair.
    Also aggregates an average of the trip durations for those pairs.
    """

    ridership_df = pd.read_csv(ridership_data_path, encoding='utf-8')\
        .drop(columns=['User Type', 'Start Station Name', 'End Station Name'])
    # print(list(ridership_df.columns.values))

    # Get counts of unique start/end pairs
    trips_df = ridership_df[['Start Station Id', 'End Station Id']].copy()
    trip_counts = trips_df.groupby(['Start Station Id', 'End Station Id']).size()\
        .reset_index(name='Count')

    # print(list(trip_counts.columns.values))
    trip_counts['Start Station Id'] = trip_counts['Start Station Id'].astype(int)
    trip_counts['End Station Id'] = trip_counts['End Station Id'].astype(int)

    trips_with_duration_df = ridership_df[['Start Station Id', 'End Station Id', 'Trip  Duration']].copy()
    trip_avg_duration = trips_with_duration_df \
        .groupby(['Start Station Id', 'End Station Id'])['Trip  Duration']\
        .mean() \
        .reset_index(name='Average Duration')

    trip_avg_duration['End Station Id'] = trip_avg_duration['End Station Id'].astype(int)
    trip_avg_duration['Average Duration'] = trip_avg_duration['Average Duration'].astype(int) # round to a whole second

    combined_df = trip_counts.merge(trip_avg_duration, on=['Start Station Id', 'End Station Id'])
    return combined_df


def prepare_geojson(ridership_df, stations_df):
    """
    Prepares geojson data of the bikeshare info to be fed into the D3 visualization.
    """

    # Prepare dataframe with the geographic coords + station names
    stations_start = stations_df.rename(
        columns={
            'Station Id': 'Start Station Id',
            'Station Name': 'Start Station Name',
            'Latitude': 'Start Lat',
            'Longitude': 'Start Lon'
        }
    )
    pairs_with_start = pd.merge(
        ridership_df,
        stations_start,
        on='Start Station Id',
        how='left'
    )

    stations_end = stations_df.rename(
        columns={
            'Station Id': 'End Station Id',
            'Station Name': 'End Station Name',
            'Latitude': 'End Lat',
            'Longitude': 'End Lon'
        }
    )

    pairs_with_coords = pd.merge(
        pairs_with_start,
        stations_end,
        on='End Station Id',
        how='left'
    )

    before_count = len(pairs_with_coords)

    # Drop rows with any NA values
    pairs_with_coords_clean = pairs_with_coords.dropna()
    after_count = len(pairs_with_coords_clean)
    dropped_count = before_count - after_count
    print(f"Rows before dropna: {before_count}, after dropna: {after_count}. Dropped rows: {dropped_count}")

    # Build LineString features for each trip pair from clean data
    connection_features = []
    for _, row in pairs_with_coords_clean.iterrows():
        properties = {
            'Start Station Id': row['Start Station Id'],
            'End Station Id': row['End Station Id'],
            'Start Station Name': row['Start Station Name'],
            'End Station Name': row['End Station Name'],
            'Count': row['Count'],
            'Average Duration': row['Average Duration'],
        }
        # GeoJSON uses (longitude, latitude)
        # Build a LineString using (longitude, latitude) for both start and end
        line = geojson.LineString([
            (row['Start Lon'], row['Start Lat']),
            (row['End Lon'], row['End Lat'])
        ])
        feature = geojson.Feature(geometry=line, properties=properties)
        connection_features.append(feature)

    connections_feature_collection = geojson.FeatureCollection(connection_features)

    # Build unique station points (from both start and end)
    station_points = {}
    for _, row in pairs_with_coords_clean.iterrows():
        # Add start station if not already present
        start_id = row['Start Station Id']
        if start_id not in station_points:
            station_points[start_id] = {
                'Station Id': start_id,
                'Station Name': row['Start Station Name'],
                'Latitude': row['Start Lat'],
                'Longitude': row['Start Lon']
            }
        # Add end station if not already present
        end_id = row['End Station Id']
        if end_id not in station_points:
            station_points[end_id] = {
                'Station Id': end_id,
                'Station Name': row['End Station Name'],
                'Latitude': row['End Lat'],
                'Longitude': row['End Lon']
            }

    station_features = []
    for station in station_points.values():
        point = geojson.Point((station['Longitude'], station['Latitude']))
        feature = geojson.Feature(
            geometry=point,
            properties={
                'Station Id': station['Station Id'],
                'Station Name': station['Station Name']
            }
        )
        station_features.append(feature)

    stations_feature_collection = geojson.FeatureCollection(station_features)

    # Return the GeoJSON FeatureCollection containing only lines
    return {
        'connections': connections_feature_collection,
        'stations': stations_feature_collection
    }


if __name__ == '__main__':
    RIDERSHIP_DATA_PATH = '../data/bike_share_ridership_2024-01.csv'
    STATION_INFO_DATA_PATH = '../data/station_metadata.csv'
    aggregate_ridership_df = aggregate_station_data(RIDERSHIP_DATA_PATH)
    station_info_df = pd.read_csv(STATION_INFO_DATA_PATH)

    output = prepare_geojson(aggregate_ridership_df, station_info_df)
    output_file = '../data/bike_share_geojson_2024-01.json'
    with open(output_file, 'w') as f:
        json.dump(output, f)
    print(f"GeoJSON data written to {output_file}")
