import { Component, Input, OnInit } from "@angular/core";

@Component({
    selector: "search",
    template: `
        <input id="search-box" type="text" />
    `
})
export class SearchComponent implements OnInit {
    ngOnInit () {
        console.log("SearchComponent initialized!");
        /*

        searchBox.addListener('places_changed', function () {
            var places = searchBox.getPlaces();

            if (places.length == 0) {
                return;
            }

            // Clear out the old markers.
            this.markers.forEach(function (marker: any) {
                marker.setMap(null);
            });
            this.markers = [];

            // For each place, get the icon, name and location.
            var bounds = new google.maps.LatLngBounds();
            places.forEach(function (place) {
                let marker = new google.maps.Marker({
                    map: this.map,
                    position: place.geometry.location,
                })

                marker.addListener('click', function () {
                    console.log(place);
                    this.selection = place;
                });

                // Create a marker for each place.
                this.markers.push(marker);

                if (place.geometry.viewport) {
                    // Only geocodes have viewport.
                    bounds.union(place.geometry.viewport);
                } else {
                    bounds.extend(place.geometry.location);
                }
            });
            this.map.fitBounds(bounds);
        });
        */
    }
}
