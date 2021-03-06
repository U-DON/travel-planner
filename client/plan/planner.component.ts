import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnChanges,
    OnDestroy
} from "@angular/core";

import { MapValuesPipe } from "../common/map-values.pipe";
import { Plan } from "./plan";
import { PlanComponent } from "./plan.component";
import { PlanService } from "./plan.service";

@Component({
    selector: "planner",
    changeDetection: ChangeDetectionStrategy.OnPush,
    directives: [PlanComponent],
    pipes: [MapValuesPipe],
    styles: [`
        :host {
            box-shadow: 2px 0 5px rgba(0, 0, 0, 0.25);
            display: flex;
            flex-direction: column;
            height: 100vh;
            position: relative;
            width: 480px;
            z-index: 1;
        }
    `],
    template: `
        <div id="logo"><a href="/">Travelogue</a></div>
        <div id="plan-list">
            <plan
                *ngFor="let plan of plans | mapValues; let i = index"
                class="plan"
                [plan]="plan"
            >
            </plan>
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
            this.plans.set(plan.place.placeId, plan);
            return true;
        }

        return false;
    }

    removePlan (plan: Plan): boolean {
        return this.plans.delete(plan.place.placeId);
    }

}
