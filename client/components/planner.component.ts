import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnChanges,
    OnDestroy,
    Pipe,
    PipeTransform
} from "@angular/core";

import { PlannerService } from "../services/planner.service";

import { PlaceInfo } from "./map.component";

export class Plan {

    place: PlaceInfo;

    constructor (place: PlaceInfo) {
        this.place = place;
    }

}

// Angular currently doesn't support iterating over maps except with pipes.
// https://github.com/angular/angular/issues/2246
@Pipe({
    name: "mapValues",
    pure: false })
export class MapValuesPipe implements PipeTransform {
    transform (map: Map<any, any>, args?: any[]): Object[] {
        let array = Array.from(map.values());
        console.log("MapValuesPipe array length: " + array.length);
        return array;
    }
}

@Component({
    selector: "planner",
    changeDetection: ChangeDetectionStrategy.OnPush,
    pipes: [MapValuesPipe],
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
        <div id="plan">
            <h1>Plan</h1>
            <ul>
                <li *ngFor="let plan of plans | mapValues; let i = index">
                    <h2>{{ plan.place.name }}</h2>
                    <p>{{ plan.place.address }}</p>
                    <p>{{ plan.place.phoneNumber }}</p>
                    <p>{{ "$".repeat(plan.place.priceLevel) }}</p>
                    <p>{{ plan.place.rating }}</p>
                    <p>{{ plan.place.website }}</p>
                    <button (click)="removePlan(plan)" type="button">Remove Plan</button>
                </li>
            </ul>
        </div>
    `
})
export class PlannerComponent implements OnDestroy {

    plans: Map<string, Plan> = new Map<string, Plan>();

    private _planAddedSubscription: any;

    constructor (private _changeDetector: ChangeDetectorRef,
                 private _plannerService: PlannerService)
    {
        // Trigger change detection with an observable for this PlannerComponent so
        // that the impure MapValuesPipe won't run upon every change detection.
        // http://blog.thoughtram.io/angular/2016/02/22/angular-2-change-detection-explained.html

        this._planAddedSubscription =
            this._plannerService.planAdded.subscribe((plan: Plan) => {
                if (this.addPlan(plan)) {
                    this._changeDetector.markForCheck();
                }
            });
    }

    ngOnDestroy () {
        this._planAddedSubscription.unsubscribe();
    }

    addPlan (plan: Plan): boolean {
        if (!this.plans.has(plan.place.placeId)) {
            console.log("PlannerComponent adding plan");
            this.plans.set(plan.place.placeId, plan);
            return true;
        }

        return false;
    }

    removePlan (plan: Plan) {
        this.plans.delete(plan.place.placeId);
    }

}
