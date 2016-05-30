import { AfterViewInit, Component, ElementRef, Inject, Input, OnChanges, ViewChild } from "@angular/core";

@Component({
    selector: "selection",
    template: `
        <div id="selection">
            <div #photo id="selection-photo" [ngStyle]="{'background-image': place.photoUrl()}">
                <div *ngIf="loading"></div>
            </div>
            <div id="selection-info">
                <h2>{{ place.name }}</h2>
                <p>{{ place.address }}</p>
                <p>{{ place.phoneNumber }}</p>
                <p>{{ "$".repeat(place.priceLevel) }}</p>
                <p>{{ place.rating }}</p>
                <p>{{ place.website }}</p>
            </div>
            <button type="button">Add To Plan</button>
        </div>
    `
})
export class SelectionComponent implements AfterViewInit, OnChanges {

    @Input() map: any;
    @Input() place: google.maps.places.PlaceResult;
    @ViewChild("photo") photo: ElementRef;

    loading: boolean = false;
    panorama: google.maps.StreetViewPanorama;

    // Create a native element to allow Google Maps to add it to its controls.
    nativeElement: HTMLUnknownElement;

    constructor (@Inject(ElementRef) elementRef: ElementRef) {
        this.nativeElement = elementRef.nativeElement;
    }

    ngAfterViewInit () {
        console.log("SelectionComponent ngAfterViewInit");
        console.log("Place Types: " + this.place.types);

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
        if (!this.place.photos || this.place.photos.length === 0) {
            let panoramaRequest = {
                location: this.place.geometry.location,

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
                                  status: google.maps.StreetViewStatus) {
        // Get the corrected POV for the StreetView used in lieu of photos for place image.
        // http://stackoverflow.com/a/8381895/1070621
        if (status === google.maps.StreetViewStatus.OK) {
            let heading =
                google.maps.geometry.spherical.computeHeading(
                    result.location.latLng,
                    this.place.geometry.location
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

}
