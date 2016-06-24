import { EventEmitter, Injectable, NgZone } from "@angular/core";

import { BehaviorSubject } from "rxjs/BehaviorSubject";

const url = "https://maps.googleapis.com/maps/api/js?key=AIzaSyBm-W3Z_sdpUKMYz7iv8vxCFGAw5BRGKSE&v=3&libraries=places&callback=_onApiLoaded"

@Injectable()
export class MapService {

    private _initApi: Promise<any>;
    private _searchResults$ = new BehaviorSubject([]);

    initializing = false;
    map: google.maps.Map;
    searchBox: google.maps.places.SearchBox;
    searchResultFocused = new EventEmitter<string>();
    searchResultUnfocused = new EventEmitter<string>();

    constructor (private _zone: NgZone) {
        // Resolve Google Maps API dependencies with a Promise.
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
                let mapOptions: google.maps.MapOptions = {
                    center: new google.maps.LatLng(37.09024, -95.712891),
                    mapTypeId: google.maps.MapTypeId.ROADMAP,
                    mapTypeControl: false,
                    zoom: 3
                };

                this.map = new google.maps.Map(mapElement, mapOptions);
                resolve(this.map);
            });
        });
    }

    registerSearchBox (searchBoxElement: HTMLInputElement) {
        return new Promise((resolve, reject) => {
            this._initApi.then(() => {
                this.searchBox = new google.maps.places.SearchBox(searchBoxElement);
                this.searchBox.addListener("places_changed", this.updateSearchResults.bind(this));
                resolve(this.searchBox);
            });
        });
    }

    get searchResults$ () {
        return this._searchResults$.asObservable();
    }

    updateSearchResults () {
        this._zone.run(() => {
            this._searchResults$.next(this.searchBox.getPlaces());
        });
    }

}
