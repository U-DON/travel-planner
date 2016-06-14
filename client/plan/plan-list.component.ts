import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy
} from "@angular/core";

import { MapValuesPipe } from "../common/map-values.pipe";
import { Plan } from "./plan";
import { PlanService } from "./plan.service";
import { PlanComponent } from "./plan.component";

@Component({
    selector: "plan-list",
    changeDetection: ChangeDetectionStrategy.OnPush,
    directives: [PlanComponent],
    pipes: [MapValuesPipe],
    styles: [`
        :host {
            flex: 1;
        }
    `],
    template: `
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
export class PlanListComponent {

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

    goBack () {
        window.history.back();
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
