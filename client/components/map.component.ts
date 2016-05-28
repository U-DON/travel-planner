import { Component, OnInit } from "@angular/core";

import { MapService } from "../services/map.service";

@Component({
    selector: "map",
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
        <div id="search-control" class="control">
            <input id="search-box" type="text" />
        </div>
        <div id="selection-control" class="control">
            <div id="selection">
                <div id="selection-photo"></div>
                <div id="selection-info"></div>
                <button type="button">Add To Plan</button>
            </div>
        </div>
        <div id="map"></div>
    `
})
export class MapComponent implements OnInit {

    constructor (private mapService: MapService) {
    }

    ngOnInit () {
        console.log("Yay, map component loaded...");

        this.mapService.initApi().then(() => {
            this.loadMap();
        });
    }

    loadMap () {
        console.log("Yay, map loaded...");

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

        let map = new google.maps.Map(document.getElementById("map"), mapOptions);

        let searchControl = document.getElementById("search-control");
        let searchInput = <HTMLInputElement>document.getElementById("search-box");
        let searchBox = new google.maps.places.SearchBox(searchInput);

        let selectionControl = document.getElementById("selection-control");

        map.controls[google.maps.ControlPosition.LEFT_TOP].push(searchControl);
        map.controls[google.maps.ControlPosition.LEFT_TOP].push(selectionControl);
    }

}

