import azure.functions as func
import datetime
import json
import logging
import requests

app = func.FunctionApp()

@app.function_name(name="StationStatusScheduler")
@app.timer_trigger(schedule="0 0 */6 * * *", arg_name="myTimer", run_on_startup=True,
              use_monitor=True)
@app.blob_output(arg_name="outputblob",
                 path="stationsblob/{datetime:yyyyMMddHHmm}.json",
                 connection="AzureWebJobsStorage")
def main(myTimer: func.TimerRequest, outputblob: func.Out[str]) -> None:
    
    station_status_url = "https://tor.publicbikesystem.net/ube/gbfs/v1/en/station_status"
    logging.info("Function triggered, calling station status URL")
    try:
        # Perform the GET request
        response = requests.get(station_status_url)
        response.raise_for_status()
        json_data = response.json()
        json_str = json.dumps(json_data, indent=4)
        outputblob.set(json_str)
        logging.info("Blob written successfully.")
    
    except requests.exceptions.RequestException as e:
        logging.error(f"GET request failed: {e}")
    except Exception as ex:
        logging.error(f"An error occurred: {ex}")


@app.function_name(name="HttpTrigger1")
@app.route(route="hello")
def test_function(req: func.HttpRequest) -> func.HttpResponse:
    return  func.HttpResponse("HttpTrigger1: Hello World!")