import {
    ChangeDetectionStrategy,
    Component,
} from "@angular/core";

import { Observable } from "rxjs";

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
            overflow: auto;
        }
    `],
    template: `
        <div id="plan-list">
            <plan
                *ngFor="let plan of plans | async | mapValues"
                class="plan"
                [plan]="plan"
            >
            </plan>
        </div>
    `
})
export class PlanListComponent {

    plans: Observable<Map<string, Plan>>;

    constructor (private _planService: PlanService) {}

    ngOnInit () {
        this.plans = this._planService.plans$;
    }

}
