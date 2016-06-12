import {
    Component,
    ElementRef,
    Input
} from "@angular/core";

import { Plan } from "../plan/plan";

@Component({
    selector: "reviews",
    template: `
        <div id="selection-reviews">
            <div *ngIf="plan.place.reviews && plan.place.reviews.length" class="plan-reviews">
                <p *ngFor="let review of plan.place.reviews" class="plan-review">
                    {{ review.text }}
                </p>
            </div>
            <p *ngIf="!plan.place.reviews || !plan.place.reviews.length" class="empty">No reviews.</p>
        </div>
    `
})
export class ReviewsComponent {

    @Input() plan: Plan;

    constructor () {}

}
