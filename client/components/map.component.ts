import {
    AfterViewInit,
    Component,
    ElementRef,
    NgZone,
    OnDestroy,
    ViewChild
} from "@angular/core";

import { PlannerService } from "../services/planner.service";
import { Plan } from "./planner.component";
import { MapService } from "../services/map.service";
import { SelectionComponent } from "./selection.component";

namespace MapMarkerIcon {

    export const MARKER = {
        path: `
            M768 896q0 106 -75 181t-181 75t-181 -75t-75 -181t75 -181t181
            -75t181 75t75 181zM1024 896q0 -109 -33 -179l-364 -774q-16 -33 -47.5
            -52t-67.5 -19t-67.5 19t-46.5 52l-365 774q-33 70 -33 179q0 212 150
            362t362 150t362 -150t150 -362z
        `,
        fillColor: "#82ffeb",
        fillOpacity: 1,
        rotation: 180,
        scale: 0.02,
        strokeColor: "black",
        strokeOpacity: 0.5,
        strokeWeight: 1
    };

    export const STAR = {
        path: `
            M1664 889q0 -22 -26 -48l-363 -354l86 -500q1 -7 1 -20q0 -21 -10.5
            -35.5t-30.5 -14.5q-19 0 -40 12l-449 236l-449 -236q-22 -12 -40
            -12q-21 0 -31.5 14.5t-10.5 35.5q0 6 2 20l86 500l-364 354q-25 27 -25
            48q0 37 56 46l502 73l225 455q19 41 49 41t49 -41l225 -455 l502
            -73q56 -9 56 -46z
        `,
        fillColor: "#ff9c50",
        fillOpacity: 1,
        rotation: 180,
        scale: 0.02,
        strokeColor: "black",
        strokeOpacity: 0.5,
        strokeWeight: 1
    };

}

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
            [plan]="selection"
            class="control"
        >
        </selection>
        <div id="map"></div>
    `
})
export class MapComponent implements AfterViewInit, OnDestroy {

    @ViewChild("searchControl") searchControl: ElementRef;
    @ViewChild("searchBox") searchInput: ElementRef;

    private _planAddedSubscription: any;
    private _planRemovedSubscription: any;

    map: google.maps.Map;
    markers: google.maps.Marker[] = [];
    planMarkers: Map<string, google.maps.Marker> = new Map<string, google.maps.Marker>();
    searchBox: google.maps.places.SearchBox;
    selection: Plan;

    constructor (private _zone: NgZone,
                 private _mapService: MapService,
                 private _plannerService: PlannerService)
    {
        this._planAddedSubscription =
            this._plannerService.planAdded.subscribe((plan: Plan) => {
                this.createPlanMarker(plan);
            });

        this._planRemovedSubscription =
            this._plannerService.planRemoved.subscribe((plan: Plan) => {
                // Update selection to not display plan details; only place info.
                // if (plan.place.placeId === this.selection.placeId) { }
                this.planMarkers.get(plan.place.placeId).setMap(null);
                this.planMarkers.delete(plan.place.placeId);
            });
    }

    ngAfterViewInit () {
        this._mapService.initApi().then(() => {
            this.initMap();
        });
    }

    ngOnDestroy () {
        this._planAddedSubscription.unsubscribe();
        this._planRemovedSubscription.unsubscribe();
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

    createPlaceMarker (place: google.maps.places.PlaceResult) {
        // Correct the position of the icon.
        // http://stackoverflow.com/a/32483737/1070621
        let marker = new google.maps.Marker({
            icon: Object.assign({
                    anchor: new google.maps.Point(512, 0)
                }, MapMarkerIcon.MARKER),
            map: this.map,
            opacity: 0.7,
            position: place.geometry.location,
            zIndex: 1
        })

        marker.addListener("click", () => {
            this.searchInput.nativeElement.blur();
            this.map.panTo(place.geometry.location);
            this._zone.run(() => {
                this.selection = new Plan(new PlaceInfo(place));
            });
        });

        // Use another marker to indicate interaction with the main marker.
        let tempMarker: google.maps.Marker;

        marker.addListener("mouseover", () => {
            marker.setOpacity(1);
            marker.setZIndex(1000);
            tempMarker = new google.maps.Marker({
                icon: {
                    anchor: new google.maps.Point(0, 0.5),
                    path: google.maps.SymbolPath.CIRCLE,
                    fillColor: "transparent",
                    strokeColor: "#ffffff",
                    strokeOpacity: 1,
                    strokeWeight: 2,
                    scale: 25
                },
                map: this.map,
                position: place.geometry.location,
                zIndex: 999
            });
        });

        marker.addListener("mouseout", () => {
            marker.setOpacity(0.7);
            marker.setZIndex(100);
            tempMarker.setMap(null);
        });

        this.markers.push(marker);

        return marker;
    }

    createPlanMarker (plan: Plan) {
        if (this.planMarkers.has(plan.place.placeId))
            return;

        let marker = new google.maps.Marker({
            animation: google.maps.Animation.DROP,
            // Correct the position of the icon.
            // http://stackoverflow.com/a/32483737/1070621
            icon: Object.assign({
                    anchor: new google.maps.Point(832, 0)
                }, MapMarkerIcon.STAR),
            map: this.map,
            opacity: 0.7,
            position: plan.place.geometry.location,
            zIndex: 100
        });

        // Use another marker to indicate interaction with the main marker.
        let tempMarker: google.maps.Marker;

        marker.addListener("click", () => {
            this.searchInput.nativeElement.blur();
            this.map.panTo(plan.place.geometry.location);
            this._zone.run(() => {
                this.selection = plan;
            });
        });

        marker.addListener("mouseover", () => {
            marker.setOpacity(1);
            marker.setZIndex(1000);
            tempMarker = new google.maps.Marker({
                icon: {
                    anchor: new google.maps.Point(0, 0.5),
                    path: google.maps.SymbolPath.CIRCLE,
                    fillColor: "transparent",
                    strokeColor: "#ffffff",
                    strokeOpacity: 1,
                    strokeWeight: 2,
                    scale: 25
                },
                map: this.map,
                position: plan.place.geometry.location,
                zIndex: 999
            });
        });

        marker.addListener("mouseout", () => {
            marker.setOpacity(0.7);
            marker.setZIndex(100);
            tempMarker.setMap(null);
        });

        this.planMarkers.set(plan.place.placeId, marker);

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
            this.createPlaceMarker(place);

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
                    this.selection = new Plan(new PlaceInfo(place));
                });
            }
        });

        this.map.fitBounds(bounds);
    }

}
