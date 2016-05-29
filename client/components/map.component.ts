import { Component, AfterViewInit, ViewChild, ElementRef, NgZone } from "@angular/core";

import { MapService } from "../services/map.service";
import { SelectionComponent } from "./selection.component";

export class PlaceInfo {

    name: string;
    address: string;
    phoneNumber: string;
    photos: google.maps.places.PlacePhoto[];
    priceLevel: number;
    rating: number;
    types: string[];
    website: string;

    constructor (place: google.maps.places.PlaceResult) {
        this.name = place.name;
        this.address = place.formatted_address;
        this.phoneNumber = place.formatted_phone_number;
        this.photos = place.photos;
        this.priceLevel = place.price_level;
        this.rating = place.rating;
        this.types = place.types;
        this.website = place.website;
    }

    photoUrl (): string {
        let photoUrl: string = "";

        if (this.photos) {
            let photo = this.photos[0];

            // Scale photo according to its dimensions.
            if (photo.width > photo.height) {
                photoUrl = photo.getUrl({ maxHeight: 360 });
            } else {
                photoUrl = photo.getUrl({ maxWidth: 540 });
            }

            photoUrl = `url(${photoUrl})`;
        }

        return photoUrl;
    }

}

@Component({
    selector: "map",
    directives: [SelectionComponent],
    providers: [MapService],
    styles: [`
        :host {
            flex: 1;
            position: relative;
            width: 100%;
            z-index: 0;
        }
    `],
    template: `
        <form #searchControl id="search-control" class="control">
            <input #searchBox (keyup.enter)="$event.target.blur()" id="search-box" type="text" />
        </form>
        <selection
            *ngIf="selection"
            [map]="map"
            [place]="selection"
            class="control"
        >
        </selection>
        <div id="map"></div>
    `
})
export class MapComponent implements AfterViewInit {

    @ViewChild("searchControl") searchControl: ElementRef;
    @ViewChild("searchBox") searchInput: ElementRef;

    map: google.maps.Map;
    markers: google.maps.Marker[] = [];
    searchBox: google.maps.places.SearchBox;
    selection: PlaceInfo;

    constructor (private _mapService: MapService, private _zone: NgZone) {
    }

    ngAfterViewInit () {
        this._mapService.initApi().then(() => {
            this.initMap();
        });
    }

    initMap () {
        console.log("Yay, map loaded!");

        let mapOptions: google.maps.MapOptions = {
            center: new google.maps.LatLng(37.09024, -95.712891),
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            mapTypeControl: false,
            streetViewControlOptions: {
                position: google.maps.ControlPosition.TOP_RIGHT
            },
            zoom: 3,
            zoomControlOptions: {
                position: google.maps.ControlPosition.TOP_RIGHT
            }
        };

        this.map = new google.maps.Map(document.getElementById("map"), mapOptions);
        this.searchBox = new google.maps.places.SearchBox(this.searchInput.nativeElement);
        this.map.controls[google.maps.ControlPosition.LEFT_TOP].push(this.searchControl.nativeElement);

        this.map.addListener("click", () => {
            this.searchInput.nativeElement.blur();
            this._zone.run(() => {
                this.selection = null;
            });
        });

        this.searchBox.addListener("places_changed", this.onPlacesChanged.bind(this));
    }

    clearMarkers () {
        // Clear out the old markers.
        this.markers.forEach((marker: google.maps.Marker) => {
            marker.setMap(null);
        });
        this.markers = [];

    }

    createMarker (place: google.maps.places.PlaceResult) {
        let marker = new google.maps.Marker({
            map: this.map,
            position: place.geometry.location,
        })

        marker.addListener("click", () => {
            this.searchInput.nativeElement.blur();
            this._zone.run(() => {
                this.selection = new PlaceInfo(place);
            });
        });

        this.markers.push(marker);

        return marker;
    }

    onPlacesChanged () {
        // Clear current selection.
        this.selection = null;

        let places: google.maps.places.PlaceResult[] = this.searchBox.getPlaces();

        if (places.length == 0) {
            return;
        }

        this.clearMarkers();

        // For each place, get the icon, name and location.
        var bounds = new google.maps.LatLngBounds();
        places.forEach((place: google.maps.places.PlaceResult) => {
            // Create a marker for each place.
            this.createMarker(place);

            if (place.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }

            // Automatically show the place info if the search returned only one result.
            if (places.length === 1) {
                this._zone.run(() => {
                    this.selection = new PlaceInfo(place);
                });
            }
        });

        this.map.fitBounds(bounds);
    }

}

