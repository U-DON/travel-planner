import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Directive,
    ElementRef,
    EventEmitter,
    HostListener,
    Input,
    OnDestroy,
    Output,
    Renderer
} from "@angular/core";

import { CurrencyPipe, RatingPipe } from "./pipes";
import { Plan } from "./plan";
import { PlanService } from "./plan.service";

@Directive({
    selector: "textarea"
})
class PlanDescription {

    // Angular 2 bug causes fast typing to jump cursor to the end of input.
    // Therefore, not using [(ngModel)] for plan description.
    // https://github.com/angular/angular/issues/7822

    // Auto-resizing technique borrowed from angular2-autosize by Steve Papa.
    // https://github.com/stevepapa/angular2-autosize
    @HostListener("input", ["$event.target"])
    onInput (textArea: HTMLTextAreaElement) {
        this.resize();
    }

    nativeElement: HTMLUnknownElement;

    constructor (public renderer: Renderer, public elementRef: ElementRef) {}

    ngOnInit () {
        // Focus plan description input when it appears.
        // http://stackoverflow.com/a/34573219/1070621
        this.nativeElement = this.elementRef.nativeElement;
        this.renderer.invokeElementMethod(this.nativeElement, "focus", []);
        this.resize();
    }

    resize () {
        this.nativeElement.style.overflow = "hidden";
        this.nativeElement.style.height = "auto";
        this.nativeElement.style.height = this.nativeElement.scrollHeight + "px";
    }

}

@Component({
    selector: "plan",
    changeDetection: ChangeDetectionStrategy.OnPush,
    directives: [PlanDescription],
    pipes: [CurrencyPipe, RatingPipe],
    template: `
        <div class="plan-place">
            <a
                (click)="$event.preventDefault(); _planService.selectPlan(plan);"
                href="#{{ plan.place.placeId }}"
            >
                {{ plan.place.name }}
            </a>
        </div>
        <div class="plan-summary">
            <div class="plan-description">
                <div
                    *ngIf="!editingDescription"
                    (click)="$event.preventDefault(); editingDescription = true"
                    class="plan-detail-text"
                >
                    <p [class.empty]="!plan.description">
                        {{ plan.description ? plan.description : "Write a description!" }}
                    </p>
                </div>
                <textarea
                    #planDescription
                    *ngIf="editingDescription"
                    [ngModel]="plan.description"
                    (blur)="editingDescription = false; plan.description = planDescription.value;"
                    (keydown.enter)="$event.preventDefault(); planDescription.blur();"
                    name="description"
                    placeholder="Write a description!"
                    rows="1"
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
export class PlanComponent implements OnDestroy {

    @Input() plan: Plan;

    editingDescription: boolean = false;
    voted: boolean = false;

    private _planUpdatedSubscription: any;

    // TODO: Highlight comments button when there are unread comments.

    constructor (private _changeDetector: ChangeDetectorRef,
                 private _planService: PlanService)
    {
        this._planUpdatedSubscription =
            this._planService.planUpdated.subscribe((plan: Plan) => {
                this._changeDetector.markForCheck();
            });
    }

    ngOnDestroy () {
        this._planUpdatedSubscription.unsubscribe();
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
