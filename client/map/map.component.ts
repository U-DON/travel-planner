import {
    AfterViewInit,
    Component,
    ElementRef,
    NgZone,
    OnDestroy,
    ViewChild
} from "@angular/core";

import { Place, Plan } from "../plan/plan";
import { PlanService } from "../plan/plan.service";
import { MapService } from "./map.service";
import { MapMarker } from "./map-marker";
import { SelectionComponent } from "./selection.component";

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
    private _planSelectedSubscription: any;
    private _planRemovedSubscription: any;

    map: google.maps.Map;
    placeMarkers: Map<string, google.maps.Marker>;
    placesService: google.maps.places.PlacesService;
    planMarkers: Map<string, google.maps.Marker>;
    searchBox: google.maps.places.SearchBox;
    selectedMarker: google.maps.Marker;
    selection: Plan;

    constructor (private _zone: NgZone,
                 private _mapService: MapService,
                 private _planService: PlanService)
    {
        this.placeMarkers = new Map<string, google.maps.Marker>();
        this.planMarkers = new Map<string, google.maps.Marker>();

        this._planAddedSubscription =
            this._planService.planAdded.subscribe((plan: Plan) => {
                this.createPlanMarker(plan);
            });

        this._planSelectedSubscription =
            this._planService.planSelected.subscribe((plan: Plan) => {
                let marker = this.planMarkers.get(plan.place.placeId);
                if (marker !== this.selectedMarker) {
                    this.selectMarker(marker);
                }
            });

        this._planRemovedSubscription =
            this._planService.planRemoved.subscribe((plan: Plan) => {
                this.planMarkers.get(plan.place.placeId).setMap(null);
                this.planMarkers.delete(plan.place.placeId);

                // Select the corresponding place marker if it's there.
                // If not, create and select a temporary place marker.
                let placeMarker = this.placeMarkers.get(plan.place.placeId);
                if (placeMarker) {
                    this.selectMarker(placeMarker);
                } else {
                    this.createTempMarker(MapMarker.TACK, plan);
                }
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
        // Upon getting the callback from Google Maps API,
        // set up the map and controls and their listeners.

        // TODO: Disable zoom and street view controls and create custom
        // controls so that control margins can be consistent.
        let mapOptions: google.maps.MapOptions = {
            center: new google.maps.LatLng(37.09024, -95.712891),
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            mapTypeControl: false,
            zoom: 3
        };

        this.map = new google.maps.Map(document.getElementById("map"), mapOptions);
        this.searchBox = new google.maps.places.SearchBox(this.searchInput.nativeElement);
        this.map.controls[google.maps.ControlPosition.LEFT_TOP].push(this.searchControl.nativeElement);

        // Clear search focus, close selection, etc. when clicking on the map.
        this.map.addListener("click", () => {
            this.selectMarker(null);
        });

        this.searchBox.addListener("places_changed", this.onPlacesChanged.bind(this));

        this.placesService = new google.maps.places.PlacesService(this.map);
    }

    clearPlaceMarkers () {
        // Clear out the old place markers.
        // If one is currently selected, clear the selection as well.
        this.placeMarkers.forEach((marker: google.maps.Marker, index: string) => {
            if (marker === this.selectedMarker) {
                this.selectMarker(null);
            }

            marker.setMap(null);
        });
        this.placeMarkers.clear();
    }

    createMarker(icon: MapMarker, plan: Plan): google.maps.Marker {
        let position = plan.place.geometry.location;

        console.log("Creating marker: " + position.toUrlValue() + " (URL value)\n"
                                        + plan.place.placeId + " (place id)");

        let animation = (icon.markerType === MapMarker.Type.PLAN)
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
                marker.setZIndex(google.maps.Marker.MAX_ZINDEX);
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
            zIndex: google.maps.Marker.MAX_ZINDEX - 1
        });

        // Bind focus marker's map property to main marker's so when the main
        // marker gets discarded, they both get discarded.
        focusMarker.bindTo("map", marker, "map");

        // Only display the focus marker when the main marker has focus.
        focusMarker.bindTo("visible", marker, "focused");

        return marker;
    }

    createPlaceMarker (place: google.maps.places.PlaceResult): google.maps.Marker {
        // If this place already has a plan, connect it with the existing plan.
        let planMarker = this.planMarkers.get(place.place_id);
        let plan = (planMarker)
                 ?  planMarker.get("plan")
                 :  new Plan(new Place(place));

        let marker = this.createMarker(MapMarker.MARKER, plan);
        this.placeMarkers.set(place.place_id, marker);
        return marker;
    }

    createPlanMarker (plan: Plan): google.maps.Marker {
        if (this.planMarkers.has(plan.place.placeId)) return;

        let marker = this.createMarker(MapMarker.STAR, plan);
        this.planMarkers.set(plan.place.placeId, marker);

        this.selectMarker(marker);

        return marker;
    }

    createTempMarker (icon: MapMarker, plan: Plan): google.maps.Marker {
        let marker = this.createMarker(MapMarker.TACK, plan);

        this.selectMarker(marker);

        // Discard this marker as soon as the user clicks away.
        marker.addListener("focused_changed", () => {
            marker.setMap(null);
            this.placeMarkers.delete(plan.place.placeId);
        });

        return marker;
    }

    selectMarker (marker: google.maps.Marker) {
        this.searchInput.nativeElement.blur();

        // TODO: Pan to the marker if it's off-screen.
        if (marker === this.selectedMarker) return;

        if (this.selectedMarker) {
            this.selectedMarker.set("focused", false);
        }

        if (marker) {
            // Fetch more details about the place associated with the plan.
            // When the information is fetched, re-select the marker.
            if (!marker.get("detailed")) {
                this.fetchPlaceDetails(marker);
                return;
            }

            marker.set("focused", true);
            this.map.panTo(marker.getPosition());
        }

        this.selectedMarker = marker;

        this._zone.run(() => {
            this.selection = marker ? marker.get("plan") : null;
        });
    }

    onPlacesChanged () {
        let places: google.maps.places.PlaceResult[] = this.searchBox.getPlaces();
        if (places.length === 0) return;

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
        if (this.placeMarkers.size === 1) {
            let marker = this.placeMarkers.values().next().value;
            this.selectMarker(marker);
        }

        this.map.fitBounds(bounds);
    }

    fetchPlaceDetails (marker: google.maps.Marker) {
        let plan = marker.get("plan");
        this.placesService.getDetails({
            placeId: plan.place.placeId
        }, (place: google.maps.places.PlaceResult,
            status: google.maps.places.PlacesServiceStatus) =>
        {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                plan.place = new Place(place);
                marker.set("detailed", true);
                this.selectMarker(marker);
            } else {
                console.error("Error fetching place details");
            }
        });
    }

}
