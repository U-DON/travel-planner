import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    OnChanges,
    OnDestroy
} from "@angular/core";

import { CurrencyPipe, RatingPipe } from "./pipes";
import { Plan } from "./plan";
import { PlanService } from "./plan.service";

@Component({
    selector: "plan",
    changeDetection: ChangeDetectionStrategy.OnPush,
    pipes: [CurrencyPipe, RatingPipe],
    template: `
        <div class="plan-summary">
            <a
                (click)="$event.stopPropagation(); _planService.selectPlan(plan);"
                class="plan-place"
            >
                {{ plan.place.name }}
            </a>
            <div class="plan-description">
                <textarea #descriptionInput [(ngModel)]="plan.description" name="description"></textarea>
            </div>
        </div>
        <div class="plan-detail-group">
            <div class="plan-detail plan-votes">
                <input
                    (click)="vote()"
                    id="{{ plan.place.placeId }}_vote"
                    type="checkbox"
                />
                <label
                    class="plan-detail-label"
                    htmlFor="{{ plan.place.placeId }}_vote"
                >
                    <i class="fa fa-check"></i>
                </label>
                <span class="plan-detail-text">{{ plan.votes }} votes</span>
            </div>
            <div class="plan-detail">
                <button
                    (click)="$event.stopPropagation(); _planService.removePlan(plan);"
                    class="plan-remove"
                    type="button"
                >
                    <span><i class="fa fa-close"></i>&nbsp; Remove Plan</span>
                </button>
            </div>
        </div>
    `
})
export class PlanComponent {

    @Input() plan: Plan;

    voted: boolean = false;

    constructor (private _planService: PlanService) {
    }

    vote () {
        if (!this.voted) {
            this.voted = true;
            this.plan.votes++;
        } else {
            this.voted = false;
            this.plan.votes--;
        }
    }

}
