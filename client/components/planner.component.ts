import { Component, OnDestroy } from "@angular/core";

import { PlannerService } from "../services/planner.service";

export class Plan {

    constructor () {
    }

}

@Component({
    selector: "planner",
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
                <li *ngFor="let plan of plans">
                    <h2>{{ plan.name }}</h2>
                    <p>{{ plan.address }}</p>
                    <p>{{ plan.phoneNumber }}</p>
                    <p>{{ "$".repeat(plan.priceLevel) }}</p>
                    <p>{{ plan.rating }}</p>
                    <p>{{ plan.website }}</p>
                </li>
            </ul>
        </div>
    `
})
export class PlannerComponent implements OnDestroy {

    plans: Plan[] = [];

    private _planAddedSubscription: any;

    constructor (private _plannerService: PlannerService) {
        this._planAddedSubscription =
            this._plannerService.planAdded.subscribe((plan: Plan) => {
                console.log("PlannerComponent adding plan");
                this.plans.push(plan);
            });
    }

    ngOnDestroy () {
        this._planAddedSubscription.unsubscribe();
    }

}
