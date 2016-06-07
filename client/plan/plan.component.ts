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
            <div class="plan-place">
                <a
                    (click)="$event.preventDefault(); _planService.selectPlan(plan);"
                    href="#{{ plan.place.placeId }}"
                >
                    {{ plan.place.name }}
                </a>
            </div>
            <div class="plan-description">
                <textarea
                    #description
                    [(ngModel)]="plan.description"
                    (keydown.enter)="$event.preventDefault(); description.blur();"
                    name="description"
                    placeholder="Write a description!"
                >
                </textarea>
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
            <div class="plan-detail plan-comments">
                <button class="plan-detail-label" type="button">
                    <i class="fa fa-comments"></i>
                </button>
                <span class="plan-detail-text">{{ plan.comments.length }} comments</span>
            </div>
            <div class="plan-detail">
                <button
                    (click)="_planService.removePlan(plan);"
                    class="plan-delete"
                    type="button"
                >
                    <span><i class="fa fa-close"></i>&nbsp; Not Interested</span>
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
