import {
    ChangeDetectionStrategy,
    Component,
} from "@angular/core";

import { Observable } from "rxjs";

import { MapService } from "../map/map.service";
import { CurrencyPipe, RatingPipe } from "./pipes";

@Component({
    selector: "search-results",
    changeDetection: ChangeDetectionStrategy.OnPush,
    pipes: [CurrencyPipe, RatingPipe],
    styles: [`
        :host {
            flex: 1;
            overflow: auto;
        }
    `],
    template: `
        <div id="search-results">
            <div *ngFor="let result of searchResults | async" class="search-result">
                <div class="plan-place">{{ result.name }}</div>
                <div class="plan-summary">
                    <div *ngIf="result.rating || result.priceLevel" class="plan-detail-group">
                        <span *ngIf="result.rating" [innerHTML]="result.rating | toRating" class="plan-detail plan-rating"></span>
                        <span *ngIf="result.price_level" [innerHTML]="result.price_level | toCurrency" class="plan-detail plan-price"></span>
                    </div>
                    <div class="plan-detail">{{ result.formatted_address }}</div>
                </div>
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
