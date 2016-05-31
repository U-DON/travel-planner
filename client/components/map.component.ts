import {
    AfterViewInit,
    Component,
    ElementRef,
    NgZone,
    ViewChild
} from "@angular/core";

import { MapService } from "../services/map.service";
import { SelectionComponent } from "./selection.component";

export class PlaceInfo {

    placeId: string;
    name: string;
    address: string;
    phoneNumber: string;
    photos: google.maps.places.PlacePhoto[];
    priceLevel: number;
    rating: number;
    types: string[];
    website: string;

    geometry: google.maps.places.PlaceGeometry;

    constructor (place: google.maps.places.PlaceResult) {
        this.placeId = place.place_id;
        this.name = place.name;
        this.address = place.formatted_address;
        this.phoneNumber = place.formatted_phone_number;
        this.photos = place.photos;
        this.priceLevel = place.price_level;
        this.rating = place.rating;
        this.types = place.types;
        this.website = place.website;

        this.geometry = place.geometry;
    }

    photoUrl (): string {
        let photoUrl: string = "none";

        if (this.photos && this.photos.length > 0) {
            let photo = this.photos[0];

            // Scale photo according to its dimensions.
            // TODO: Increase size of smaller images;
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

    constructor (private _zone: NgZone,
                 private _mapService: MapService)
    {
    }

    ngAfterViewInit () {
        this._mapService.initApi().then(() => {
            this.initMap();
        });
    }

    initMap () {
        console.log("Yay, map loaded!");

        // Upon getting the callback from Google Maps API,
        // set up the map and controls and their listeners.

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

        // Clear search focus, close selections, etc. when clicking on the map.
        this.map.addListener("click", () => {
            this.searchInput.nativeElement.blur();
            this._zone.run(() => {
                this.selection = null;
            });
        });

        this.searchBox.addListener("places_changed", this.onPlacesChanged.bind(this));
    }

    clearMarkers () {
        // Clear current selection.
        this._zone.run(() => {
            this.selection = null;
        });

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
            this.map.panTo(place.geometry.location);
            this._zone.run(() => {
                this.selection = new PlaceInfo(place);
            });
        });

        this.markers.push(marker);

        return marker;
    }

    onPlacesChanged () {
        let places: google.maps.places.PlaceResult[] = this.searchBox.getPlaces();

        if (places.length == 0) {
            return;
        }

        this.clearMarkers();

        var bounds = new google.maps.LatLngBounds();

        places.forEach((place: google.maps.places.PlaceResult) => {
            // Create a marker for each place.
            this.createMarker(place);

            // Accommodate this place in the current map view.
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
