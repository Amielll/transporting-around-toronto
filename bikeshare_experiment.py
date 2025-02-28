import pandas as pd
import requests

# --- Configuration ---
CSV_FILE = "data/bikeshare_ridership_2024-09.csv"
OUTPUT_FILE = "data/bikeshare_ridership_with_coords_2024-09.csv"
API_URL = "https://tor.publicbikesystem.net/ube/gbfs/v1/en/station_information"


response = requests.get(API_URL)
if response.status_code != 200:
    raise Exception("Station data not available!")

station_data = response.json()
stations = {s["station_id"]: (s["lat"], s["lon"]) for s in station_data["data"]["stations"]}

stations_metadata = {
    s["station_id"]: {
        "Station ID": s["station_id"],
        "Station Name": s["name"],
        "Latitude": s["lat"],
        "Longitude": s["lon"]
    }
    for s in station_data["data"]["stations"]
}
stations_metadata_df = pd.DataFrame.from_dict(stations_metadata, orient="index")
stations_metadata_df.to_csv('station_metadata.csv', index=False)

df = pd.read_csv(CSV_FILE)


def get_coordinates(station_id):
    return stations.get(str(station_id), (None, None))


# Apply coordinate mapping for Start and End stations
df["Start Latitude"], df["Start Longitude"] = zip(*df["Start Station Id"].map(get_coordinates))
df["End Latitude"], df["End Longitude"] = zip(*df["End Station Id"].map(get_coordinates))

# Remove rows where coordinates are missing
df_filtered = df.dropna(subset=["Start Latitude", "Start Longitude", "End Latitude", "End Longitude"])

# Save to a new CSV
df_filtered.to_csv(OUTPUT_FILE, index=False)
print(f"Saved new CSV with lat/long coordinates to {OUTPUT_FILE}")
