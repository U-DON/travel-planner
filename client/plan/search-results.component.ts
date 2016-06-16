import {
    ChangeDetectionStrategy,
    Component,
} from "@angular/core";

import { Observable } from "rxjs";

import { MapService } from "../map/map.service";

@Component({
    selector: "search-results",
    changeDetection: ChangeDetectionStrategy.OnPush,
    styles: [`
        :host {
            flex: 1;
            overflow: auto;
        }
    `],
    template: `
        <div id="search-results">
            <div *ngFor="let result of searchResults | async">
                <p>{{ result.name }}</p>
                <p>{{ result.address }}</p>
                <p>{{ result.rating }}</p>
                <p>{{ result.price_level }}</p>
            </div>
        </div>
    `
})
export class SearchResultsComponent {

    searchResults: Observable<google.maps.places.PlaceResult[]>;

    constructor (private _mapService: MapService) {}

    ngOnInit () {
        this.searchResults = this._mapService.searchResults$;
    }

}
