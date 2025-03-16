"""
This helper script is used for preparing Toronto's Open Data on Bike Share
Ridership.
"""
import pandas as pd
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

    trip_total_duration = trips_with_duration_df \
            .groupby(['Start Station Id', 'End Station Id'])['Trip  Duration']\
            .sum() \
            .reset_index(name='Total Duration')

    trip_total_duration['End Station Id'] = trip_total_duration['End Station Id'].astype(int)
    trip_total_duration['Total Duration'] = trip_total_duration['Total Duration'].astype(int) # round to a whole second

    combined_df = trip_counts.merge(trip_total_duration, on=['Start Station Id', 'End Station Id'])
    return combined_df


def prepare_data(ridership_df, stations_df):
    """
    Prepares data of the bikeshare info to be fed into the D3 visualization.
    """

    # Prepare dataframe with the geographic coords + station names
    stations_start = stations_df.rename(
        columns={
            'Station Id': 'Start Station Id',
            'Station Name': 'Start Station Name',
            'Latitude': 'Start Latitude',
            'Longitude': 'Start Longitude'
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
            'Latitude': 'End Latitude',
            'Longitude': 'End Longitude'
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

    # Extract unique station data (here, just Station Id and Station Name)
    station_points = {}
    station_points = {}
    for _, row in pairs_with_coords_clean.iterrows():
        # Add start station
        start_id = row['Start Station Id']
        if start_id not in station_points:
            station_points[start_id] = {
                'Station Id': start_id,
                'Station Name': row['Start Station Name'],
                'Latitude': row['Start Latitude'],
                'Longitude': row['Start Longitude']
            }
        # Add end station
        end_id = row['End Station Id']
        if end_id not in station_points:
            station_points[end_id] = {
                'Station Id': end_id,
                'Station Name': row['End Station Name'],
                'Latitude': row['End Latitude'],
                'Longitude': row['End Longitude']
            }

    station_list = list(station_points.values())

    return pairs_with_coords_clean, station_list


if __name__ == '__main__':
    RIDERSHIP_DATA_PATH = '../public/data/bike_share_ridership_2024-01.csv'
    STATION_INFO_DATA_PATH = '../public/data/station_metadata.csv'
    aggregate_ridership_df = aggregate_station_data(RIDERSHIP_DATA_PATH)
    station_info_df = pd.read_csv(STATION_INFO_DATA_PATH)

    final_df, station_list = prepare_data(aggregate_ridership_df, station_info_df)
    output_json_file = '../public/data/bike_share_stations_2024-01.json'
    output_csv_file = '../public/data/bike_share_trips_2024-01.csv'

    with open(output_json_file, 'w') as f:
        json.dump(station_list, f)
    print(f"JSON data written to {output_json_file}")

    final_df.to_csv(output_csv_file, index=False)
    print(f"CSV data written to {output_csv_file}")
