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

const enum MapMarkerType {
    PLACE,
    PLAN
}

interface MapMarkerIcon {
    fillColor: string;
    fillOpacity: number;
    markerType: MapMarkerType;
    opacity: number;
    // SVG rendering of icon image represented by a path.
    // Paths are copied from the SVGs of Font Awesome's icons.
    path: string;
    rotation: number;
    scale: number;
    strokeColor: string;
    strokeOpacity: number;
    strokeWeight: number;
    // Width of SVG, which was determined separately and hard-coded.
    // This is used to re-center the icon over the map location.
    width: number;
    zIndex: number;
}

namespace MapMarkerIcon {

    export const MARKER: MapMarkerIcon = {
        fillColor: "#82ffeb",
        fillOpacity: 1,
        markerType: MapMarkerType.PLACE,
        opacity: 0.7,
        path: `
            M768 896q0 106 -75 181t-181 75t-181 -75t-75 -181t75 -181t181
            -75t181 75t75 181zM1024 896q0 -109 -33 -179l-364 -774q-16 -33 -47.5
            -52t-67.5 -19t-67.5 19t-46.5 52l-365 774q-33 70 -33 179q0 212 150
            362t362 150t362 -150t150 -362z
        `,
        rotation: 180,
        scale: 0.02,
        strokeColor: "black",
        strokeOpacity: 0.5,
        strokeWeight: 1,
        width: 1024,
        zIndex: 1
    };

    export const STAR: MapMarkerIcon = {
        fillColor: "#ff9c50",
        fillOpacity: 1,
        markerType: MapMarkerType.PLAN,
        opacity: 0.7,
        path: `
            M1664 889q0 -22 -26 -48l-363 -354l86 -500q1 -7 1 -20q0 -21 -10.5
            -35.5t-30.5 -14.5q-19 0 -40 12l-449 236l-449 -236q-22 -12 -40
            -12q-21 0 -31.5 14.5t-10.5 35.5q0 6 2 20l86 500l-364 354q-25 27 -25
            48q0 37 56 46l502 73l225 455q19 41 49 41t49 -41l225 -455 l502
            -73q56 -9 56 -46z
        `,
        rotation: 180,
        scale: 0.02,
        strokeColor: "black",
        strokeOpacity: 0.5,
        strokeWeight: 1,
        width: 1664,
        zIndex: 100
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
    placeMarkers: google.maps.Marker[] = [];
    planMarkers: Map<string, google.maps.Marker> = new Map<string, google.maps.Marker>();
    searchBox: google.maps.places.SearchBox;
    selectedMarker: google.maps.Marker;
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

        // Clear search focus, close selection, etc. when clicking on the map.
        this.map.addListener("click", () => {
            this.selectMarker(null);
        });

        this.searchBox.addListener("places_changed", this.onPlacesChanged.bind(this));
    }

    clearPlaceMarkers () {
        // Clear out the old place markers.
        // If one is currently selected, clear the selection as well.
        this.placeMarkers.forEach((marker: google.maps.Marker) => {
            if (marker === this.selectedMarker) {
                this.selectMarker(null);
            }

            marker.setMap(null);
        });
        this.placeMarkers = [];
    }

    createMarker(icon: MapMarkerIcon, plan: Plan): google.maps.Marker {
        let position = plan.place.geometry.location;

        console.log("Creating marker: " + position.toString() + " (string); " + position.toUrlValue() + " (URL value)");

        let animation = (icon.markerType === MapMarkerType.PLAN)
                      ? google.maps.Animation.DROP
                      : null;

        // Set an anchor calculated from icon's width to correct its position.
        // Moving it horizontally by half its width should center it.
        // http://stackoverflow.com/a/32483737/1070621
        let marker = new google.maps.Marker({
            animation: animation,
            icon: Object.assign({
                    anchor: new google.maps.Point(icon.width/2, 0)
                }, icon),
            map: this.map,
            opacity: icon.opacity,
            position: position,
            zIndex: icon.zIndex
        });

        // Set custom properties and event listeners on marker.
        //
        // Link marker to its corresponding plan to for easy access.
        //
        // Combine event listeners and a custom 'focused' property
        // to control marker's behavior when clicked or hovered.

        marker.set("plan", plan);
        marker.set("focused", false);

        marker.addListener("click", () => {
            this.selectMarker(marker);
        });

        marker.addListener("mouseover", () => {
            if (marker !== this.selectedMarker) {
                marker.set("focused", true);
            }
        });

        marker.addListener("mouseout", () => {
            if (marker !== this.selectedMarker) {
                marker.set("focused", false);
            }
        });

        marker.addListener("focused_changed", () => {
            if (marker.get("focused")) {
                marker.setZIndex(1000);
                marker.setOpacity(1);
            } else {
                marker.setZIndex(icon.zIndex);
                marker.setOpacity(icon.opacity);
            }
        });

        // Use another marker to indicate selection or focus of main marker.
        let focusMarker = new google.maps.Marker({
            icon: {
                anchor: new google.maps.Point(0, 0.5),
                fillColor: "transparent",
                path: google.maps.SymbolPath.CIRCLE,
                strokeColor: "#ffffff",
                strokeOpacity: 1,
                strokeWeight: 2,
                scale: 25
            },
            map: this.map,
            position: position,
            visible: false,
            zIndex: 999
        });

        // Bind focus marker's map property to main marker's so when the main
        // marker gets discarded, they both get discarded.
        focusMarker.bindTo("map", marker, "map");

        // Only display the focus marker when the main marker has focus.
        focusMarker.bindTo("visible", marker, "focused");

        return marker;
    }

    selectMarker (marker: google.maps.Marker) {
        this.searchInput.nativeElement.blur();

        if (this.selectedMarker) {
            this.selectedMarker.set("focused", false);
        }

        this.selectedMarker = marker;

        if (marker) {
            marker.set("focused", true);
            this.map.panTo(marker.getPosition());
        }

        this._zone.run(() => {
            this.selection = marker ? marker.get("plan") : null;
        });
    }

    createPlaceMarker (place: google.maps.places.PlaceResult) {
        // If this place already has a plan, connect it with the existing plan.
        let planMarker = this.planMarkers.get(place.place_id);
        let plan: Plan;

        if (planMarker) {
            plan = planMarker.get("plan");
        } else {
            plan = new Plan(new PlaceInfo(place));
        }

        let marker = this.createMarker(MapMarkerIcon.MARKER, plan);
        this.placeMarkers.push(marker);
        return marker;
    }

    createPlanMarker (plan: Plan) {
        if (this.planMarkers.has(plan.place.placeId))
            return;

        let marker = this.createMarker(MapMarkerIcon.STAR, plan);
        this.planMarkers.set(plan.place.placeId, marker);

        this.selectMarker(marker);

        return marker;
    }

    onPlacesChanged () {
        let places: google.maps.places.PlaceResult[] = this.searchBox.getPlaces();

        if (places.length == 0) {
            return;
        }

        this.clearPlaceMarkers();

        let bounds = new google.maps.LatLngBounds();

        places.forEach((place: google.maps.places.PlaceResult) => {
            this.createPlaceMarker(place);

            // Accommodate this place in the current map view.
            // Only geocodes have viewport.
            if (place.geometry.viewport) {
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
        });

        // Automatically show the place info if the search returned only one result.
        if (this.placeMarkers.length === 1) {
            this.selectMarker(this.placeMarkers[0]);
        }

        this.map.fitBounds(bounds);
    }

}
