import azure.functions as func
import json
import logging
import requests
from datetime import datetime

app = func.FunctionApp()

CONNECTION_STRING = "AzureWebJobsStorage"
CONTAINER_NAME = "stationsblob"
COMBINED_BLOB_NAME = "combined.json"
STATION_STATUS_URL = "https://tor.publicbikesystem.net/ube/gbfs/v1/en/station_status"

def parse_time_from_filename(filename):
    """Extracts timestamp from filename and converts to ISO format."""
    time_str = filename.split("_")[-1].split(".")[0]  # Extract YYYYmmddHH
    dt = datetime.strptime(time_str, "%Y%m%d%H")
    return dt.isoformat()

@app.function_name(name="UpdateCombinedBlobScheduler")
@app.blob_input(arg_name="inputblob",
                path="stationsblob/combined.json",
                connection="AzureWebJobsStorage")
@app.blob_output(arg_name="outputblob",
                path="stationsblob/combined.json",
                connection="AzureWebJobsStorage")
@app.timer_trigger(schedule="0 0 */6 * * *", arg_name="myTimer", run_on_startup=False)
def update_combined_blob(myTimer: func.TimerRequest, inputblob: str, outputblob: func.Out[str]):
    #logging.info("new main starting!")
    try:
        response = requests.get(STATION_STATUS_URL)
        response.raise_for_status()
        new_station_samples = response.json()["data"]["stations"]
    except requests.exceptions.RequestException as e:
        logging.error(f"API request failed: {e}")
        return

    try:
        combined_dict = json.loads(inputblob) if inputblob else {}
        timestamp = parse_time_from_filename(datetime.utcnow().strftime("%Y%m%d%H"))

        # add new sample to combined dict for each station
        for station in new_station_samples:
            if station['station_id'] not in combined_dict:
                combined_dict[station['station_id']] = {'samples' : []}

            sample = {
                'time': timestamp,
                'num_bikes_available': station['num_bikes_available'],
                'num_bikes_available_types': station['num_bikes_available_types'],
                'num_bikes_disabled': station['num_bikes_disabled'],
                'num_docks_available': station['num_docks_available'],
                'num_docks_disabled': station['num_docks_disabled'],
                'status': station['status']
            }

            combined_dict[station['station_id']]['samples'].append(sample)

        # save updated blob with new samples
        outputblob.set(json.dumps(combined_dict, indent=2))
        logging.info("Updated combined station data!")

    except Exception as e:
        logging.error(f"Failed doing file ops: {e}")


@app.function_name(name="HttpTriggerGetStationData")
@app.blob_input(arg_name="inputblob",
                path=f"{CONTAINER_NAME}/{COMBINED_BLOB_NAME}",
                connection="AzureWebJobsStorage")
@app.route(route="stationStatus", auth_level=func.AuthLevel.ANONYMOUS)
def main(req: func.HttpRequest, inputblob: str) -> func.HttpResponse:
    logging.info("Received request for combined.json")
    try:
        # Parse the blob content into JSON
        data = json.loads(inputblob)

        return func.HttpResponse(
            json.dumps(data),
            mimetype="application/json",
            status_code=200
        )

    except json.JSONDecodeError:
        logging.error("Failed to parse combined.json")
        return func.HttpResponse("Invalid JSON format in combined.json", status_code=500)

    except Exception as ex:
        logging.error(f"Error fetching combined.json: {ex}")
        return func.HttpResponse("Internal Server Error", status_code=500)