import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnChanges,
    OnDestroy,
    Pipe,
    PipeTransform
} from "@angular/core";

import { MapValuesPipe } from "../common/map-values.pipe";
import { CurrencyPipe, RatingPipe } from "./pipes";
import { Plan } from "./plan";
import { PlanService } from "./plan.service";

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
                <li
                    *ngFor="let plan of plans | mapValues; let i = index"
                    (click)="_planService.selectPlan(plan)"
                >
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
