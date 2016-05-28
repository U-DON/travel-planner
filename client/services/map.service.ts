import { Injectable } from "@angular/core";

const url = "https://maps.googleapis.com/maps/api/js?key=AIzaSyBm-W3Z_sdpUKMYz7iv8vxCFGAw5BRGKSE&v=3&libraries=places&callback=_onApiLoaded"

@Injectable()
export class MapService {

    // Use Promise to kick off the callback when the Google Maps API is ready.
    // http://stackoverflow.com/a/34933503/1070621
    initApi () {
        return new Promise(function (resolve) {
            window["_onApiLoaded"] = function (e: any) {
                resolve();
            }

            let script = document.createElement("script");
            script.type = "text/javascript";
            script.src = url;
            document.getElementsByTagName("head")[0].appendChild(script);
        });
    }

}
