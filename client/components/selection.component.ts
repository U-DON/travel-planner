import { AfterViewInit, Component, ElementRef, Inject, Input } from "@angular/core";

@Component({
    selector: "selection",
    template: `
        <div id="selection">
            <div id="selection-photo" [ngStyle]="{'background-image': place.photoUrl()}">
            </div>
            <div id="selection-info">
                <h2>{{ place.name }}</h2>
                <p>{{ place.address }}</p>
                <p>{{ place.phoneNumber }}</p>
                <p>{{ "$".repeat(place.priceLevel) }}</p>
                <p>{{ place.rating }}</p>
                <p>{{ place.website }}</p>
                <hr />
                <p>{{ place.types }}</p>
            </div>
            <button type="button">Add To Plan</button>
        </div>
    `
})
export class SelectionComponent implements AfterViewInit {

    @Input() map: any;
    @Input() place: google.maps.places.PlaceResult;

    // Create a native element to allow Google Maps to add it to its controls.
    nativeElement: HTMLUnknownElement;

    constructor (@Inject(ElementRef) elementRef: ElementRef) {
        this.nativeElement = elementRef.nativeElement;
    }

    ngAfterViewInit () {
        this.map.controls[google.maps.ControlPosition.LEFT_TOP].push(this.nativeElement);
    }

}
