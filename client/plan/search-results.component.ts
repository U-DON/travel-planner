import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy
} from "@angular/core";

import { Observable } from "rxjs/Observable";

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
            <div
                *ngFor="let result of searchResults | async"
                (mouseover)="_mapService.searchResultFocused.emit(result.place_id)"
                (mouseout)="_mapService.searchResultUnfocused.emit(result.place_id)"
                [class.selected]="selectedResult === result.place_id"
                class="search-result"
            >
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
    selectedResult: string = null;

    private _searchResultFocusedSubscription: any;
    private _searchResultUnfocusedSubscription: any;

    constructor (private _changeDetector: ChangeDetectorRef,
                 private _mapService: MapService)
    {
    }

    ngOnInit () {
        this.searchResults = this._mapService.searchResults$;

        this._searchResultFocusedSubscription =
            this._mapService.searchResultFocused.subscribe((placeId: string) => {
                this.selectedResult = placeId;
                this._changeDetector.markForCheck();
            });

        this._searchResultUnfocusedSubscription =
            this._mapService.searchResultUnfocused.subscribe((placeId: string) => {
                this.selectedResult = null;
                this._changeDetector.markForCheck();
            });
    }

    ngOnDestroy () {
        this._searchResultFocusedSubscription.unsubscribe();
        this._searchResultUnfocusedSubscription.unsubscribe();
    }

}
