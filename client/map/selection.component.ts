import {
    AfterViewInit,
    ChangeDetectorRef,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    Input,
    OnChanges,
    ViewChild
} from "@angular/core";

import { CommentsComponent } from "./comments.component";
import { CurrencyPipe, RatingPipe } from "../plan/pipes";
import { Plan, PlanStatus } from "../plan/plan";
import { PlanService } from "../plan/plan.service";

@Component({
    selector: "selection",
    directives: [CommentsComponent],
    pipes: [CurrencyPipe, RatingPipe],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div id="selection">
            <div #photo id="selection-photo" [ngStyle]="{'background-image': plan.place.photoUrl()}">
                <div *ngIf="loading"></div>
            </div>
            <div id="selection-content">
                <div class="plan-place">{{ plan.place.name }}</div>
                <div id="selection-info">
                    <div class="plan-summary">
                        <div *ngIf="plan.place.rating || plan.place.priceLevel" class="plan-detail-group">
                            <span *ngIf="plan.place.rating" [innerHTML]="plan.place.rating | toRating" class="plan-detail plan-rating"></span>
                            <span *ngIf="plan.place.priceLevel" [innerHTML]="plan.place.priceLevel | toCurrency" class="plan-detail plan-price"></span>
                        </div>
                    </div>
                    <div *ngIf="plan.place.address" class="plan-detail">
                        <span class="plan-detail-label"><i class="fa fa-lg fa-map-marker"></i></span>
                        <span class="plan-detail-text">{{ plan.place.address }}</span>
                    </div>
                    <div *ngIf="plan.place.phoneNumber" class="plan-detail">
                        <span class="plan-detail-label"><i class="fa fa-lg fa-phone"></i></span>
                        <span class="plan-detail-text">{{ plan.place.phoneNumber }}</span>
                    </div>
                    <div *ngIf="plan.place.website" class="plan-detail">
                        <span class="plan-detail-label"><i class="fa fa-lg fa-external-link"></i></span>
                        <span class="plan-detail-text">
                            <a [href]="plan.place.website" target="_blank">
                                {{ plan.place.website }}
                            </a>
                        </span>
                    </div>
                </div>
                <div id="selection-sections">
                    <div *ngIf="plan.status" class="selection-section-tab">
                        <i class="fa fa-lg fa-comments"></i>
                        <span>Comments</span><span *ngIf="plan.comments.length">({{ plan.comments.length }})</span>
                    </div>
                </div>
                <comments [plan]="plan"></comments>
            </div>
            <button
                id="selection-button"
                [class.plan-delete]="plan.status"
                (click)="changePlanStatus()"
                type="button"
            >
                {{ plan.status ? 'Not Interested' : 'Interested' }}
            </button>
        </div>
    `
})
export class SelectionComponent implements AfterViewInit, OnChanges {

    @Input() map: any;
    @Input() plan: Plan;

    @ViewChild("photo") photo: ElementRef;

    loading: boolean = false;
    panorama: google.maps.StreetViewPanorama;

    // Create a native element to allow Google Maps to add it to its controls.
    nativeElement: HTMLUnknownElement;

    private _planRemovedSubscription: any;

    constructor (private _changeDetector: ChangeDetectorRef,
                 private _planService: PlanService,
                 elementRef: ElementRef)
    {
        this.nativeElement = elementRef.nativeElement;

        this._planRemovedSubscription =
            this._planService.planRemoved.subscribe((plan: Plan) => {
                this._changeDetector.markForCheck();
            });
    }

    ngAfterViewInit () {
        console.log("SelectionComponent ngAfterViewInit");
        console.log("Place Types: " + this.plan.place.types);

        this.map.controls[google.maps.ControlPosition.LEFT_TOP].push(this.nativeElement);

        let panoramaOptions = {
            disableDefaultUI: true,
            visible: false
        };

        this.panorama = new google.maps.StreetViewPanorama(this.photo.nativeElement, panoramaOptions);
        this.updatePanorama();
    }

    ngOnChanges () {
        console.log("SelectionComponent ngOnChanges");
        this.updatePanorama();
    }

    updatePanorama () {
        if (!this.panorama)
            return;

        // TODO: Loading animation while processing the panorama.
        if (!this.plan.place.photos || this.plan.place.photos.length === 0) {
            let panoramaRequest = {
                location: this.plan.place.geometry.location,

                // NOTE: StreetViewSource requires a manual change
                //       to the Google Maps type definitions file.
                source: google.maps.StreetViewSource.OUTDOOR
            };

            let streetViewService: any = new google.maps.StreetViewService();
            streetViewService.getPanorama(panoramaRequest,
                                          this.handleStreetViewPanoramaData.bind(this));
        } else {
            this.panorama.setVisible(false);
        }
    }

    handleStreetViewPanoramaData (result: google.maps.StreetViewPanoramaData,
                                  status: google.maps.StreetViewStatus)
    {
        // Get the corrected POV for the StreetView used in lieu of photos for place image.
        // http://stackoverflow.com/a/8381895/1070621
        if (status === google.maps.StreetViewStatus.OK) {
            let heading =
                google.maps.geometry.spherical.computeHeading(
                    result.location.latLng,
                    this.plan.place.geometry.location
                );

            this.panorama.setOptions({
                position: result.location.latLng,
                pov: {
                    heading: heading,
                    pitch: 0
                },
                visible: true
            });
        } else {
            console.log("Could not load panorama...");
            this.panorama.setVisible(false);
            // Show default background (based on type of place).
        }
    };

    changePlanStatus () {
        if (this.plan.status === PlanStatus.NOT_INTERESTED) {
            this._planService.addPlan(this.plan);
        } else {
            this._planService.removePlan(this.plan);
        }
    }

}
