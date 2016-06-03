import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnChanges,
    OnDestroy,
    Pipe,
    PipeTransform
} from "@angular/core";

import { Plan } from "./plan";
import { PlanService } from "./plan.service";

// Angular currently doesn't support iterating over maps except with pipes.
// https://github.com/angular/angular/issues/2246
@Pipe({
    name: "mapValues",
    pure: false
})
export class MapValuesPipe implements PipeTransform {
    transform (map: Map<any, any>, args?: any[]): Object[] {
        let array = Array.from(map.values());
        console.log("MapValuesPipe array length: " + array.length);
        return array;
    }
}

@Pipe({
    name: "toCurrency"
})
export class CurrencyPipe implements PipeTransform {
    transform (priceLevel: number): string {
        let currencyText = "<i class='fa fa-usd'></i>".repeat(priceLevel)
                         + "<span class='sr-only'>"
                         + "$".repeat(priceLevel)
                         + "</span>";

        return currencyText;
    }
}

@Pipe({
    name: "toRating"
})
export class RatingPipe implements PipeTransform {
    transform (rating: number): string {
        let stars = Math.floor(rating);
        let halfStar = (rating === stars ? 0 : 1);
        let starRating = "<i class='fa fa-star'></i>".repeat(stars)
                       + "<i class='fa fa-star-half'></i>".repeat(halfStar)
                       + "<span class='sr-only'>"
                       + rating
                       + " stars</span>";

        return starRating;
    }
}

@Component({
    selector: "planner",
    changeDetection: ChangeDetectionStrategy.OnPush,
    pipes: [MapValuesPipe, CurrencyPipe, RatingPipe],
    styles: [`
        :host {
            box-shadow: 2px 0 5px rgba(0, 0, 0, 0.25);
            display: flex;
            flex-direction: column;
            height: 100vh;
            position: relative;
            width: 720px;
            z-index: 1;
        }
    `],
    template: `
        <div id="logo">Travelogue</div>
        <div id="plan">
            <ul>
                <li *ngFor="let plan of plans | mapValues; let i = index">
                    <h2>{{ plan.place.name }}</h2>
                    <p>{{ plan.place.address }}</p>
                    <p>{{ plan.place.phoneNumber }}</p>
                    <span [innerHTML]="plan.place.priceLevel | toCurrency"></span>
                    <span [innerHTML]="plan.place.rating | toRating"></span>
                    <p>{{ plan.place.website }}</p>
                    <button (click)="_planService.removePlan(plan)" type="button">Remove Plan</button>
                </li>
            </ul>
        </div>
    `
})
export class PlannerComponent implements OnDestroy {

    plans: Map<string, Plan> = new Map<string, Plan>();

    private _planAddedSubscription: any;
    private _planRemovedSubscription: any;

    constructor (private _changeDetector: ChangeDetectorRef,
                 private _planService: PlanService)
    {
        // Trigger change detection with an observable for this PlannerComponent so
        // that the impure MapValuesPipe won't run upon every change detection.
        // http://blog.thoughtram.io/angular/2016/02/22/angular-2-change-detection-explained.html

        this._planAddedSubscription =
            this._planService.planAdded.subscribe((plan: Plan) => {
                if (this.addPlan(plan)) {
                    this._changeDetector.markForCheck();
                }
            });

        this._planRemovedSubscription =
            this._planService.planRemoved.subscribe((plan: Plan) => {
                if (this.removePlan(plan)) {
                    this._changeDetector.markForCheck();
                }
            });
    }

    ngOnDestroy () {
        this._planAddedSubscription.unsubscribe();
        this._planRemovedSubscription.unsubscribe();
    }

    addPlan (plan: Plan): boolean {
        if (!this.plans.has(plan.place.placeId)) {
            console.log("PlannerComponent adding plan");
            this.plans.set(plan.place.placeId, plan);
            return true;
        }

        return false;
    }

    removePlan (plan: Plan): boolean {
        return this.plans.delete(plan.place.placeId);
    }

}
