import { EventEmitter, Injectable } from "@angular/core";

const url = "https://maps.googleapis.com/maps/api/js?key=AIzaSyBm-W3Z_sdpUKMYz7iv8vxCFGAw5BRGKSE&v=3&libraries=places&callback=_onApiLoaded"

@Injectable()
export class MapService {

    private _initApi: Promise<any>;

    initializing = false;
    placesChanged = new EventEmitter<google.maps.places.PlaceResult[]>();

    constructor () {
        // Use Promise to trigger the real callback when the Google Maps API is ready.
        // http://stackoverflow.com/a/34933503/1070621
        this._initApi = new Promise((resolve, reject) => {
            if (this.initializing) return;

            this.initializing = true;

            window["_onApiLoaded"] = (e: any) => {
                resolve();
            }

            let script = document.createElement("script");
            script.type = "text/javascript";
            script.src = url;
            document.getElementsByTagName("head")[0].appendChild(script);
        });
    }

    registerMap (mapElement: HTMLDivElement) {
        return new Promise((resolve, reject) => {
            this._initApi.then(() => {
                // Create map with some default options.
                //
                // TODO: Disable zoom and street view controls and create custom
                // controls so that control margins can be consistent.
                let mapOptions: google.maps.MapOptions = {
                    center: new google.maps.LatLng(37.09024, -95.712891),
                    mapTypeId: google.maps.MapTypeId.ROADMAP,
                    mapTypeControl: false,
                    zoom: 3
                };

                let map = new google.maps.Map(mapElement, mapOptions);
                resolve(map);
            });
        });
    }

    registerSearchBox (searchBoxElement: HTMLInputElement) {
        return new Promise((resolve, reject) => {
            this._initApi.then(() => {
                let searchBox = new google.maps.places.SearchBox(searchBoxElement);
                searchBox.addListener("places_changed", () => {
                    this.placesChanged.emit(searchBox.getPlaces());
                });
                resolve(searchBox);
            });
        });
    }

}
