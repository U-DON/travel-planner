import {
    AfterViewChecked,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    Input,
    ViewChild
} from "@angular/core";

import { Plan, PlanStatus } from "../plan/plan";
import { PlanService } from "../plan/plan.service";

@Component({
    selector: "comments",
    template: `
        <form
            *ngIf="plan.status"
            (submit)="submitComment()"
            id="selection-comments"
        >
            <div #comments *ngIf="plan.comments.length" class="plan-comments">
                <p *ngFor="let comment of plan.comments" class="plan-comment">
                    {{ comment }}
                </p>
            </div>
            <p *ngIf="!plan.comments.length" class="empty">No comments yet.</p>
            <input type="text" placeholder="Write a comment!" [(ngModel)]="comment" />
        </form>
    `
})
export class CommentsComponent implements AfterViewChecked {

    @Input() plan: Plan;

    @ViewChild("comments") comments: ElementRef;

    comment: string = "";

    constructor (private _planService: PlanService) {
    }

    ngAfterViewChecked () {
        if (this.comments)
        {
            let commentsElement = this.comments.nativeElement;
            commentsElement.scrollTop = commentsElement.scrollHeight;
        }
    }

    submitComment () {
        if (this.comment &&
            this._planService.commentPlan(this.plan, this.comment))
        {
            this.comment = "";
        }
    }

}
