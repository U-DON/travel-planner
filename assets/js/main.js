var initMap = function () {
    var selectionDiv = $('#selection');

    var mapOptions = {
        center: new google.maps.LatLng(37.09024, -95.712891),
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: false,
        zoom: 3
    };

    var map = new google.maps.Map(document.getElementById('map'), mapOptions);
    var markers = [];
    var infoWindow = new google.maps.InfoWindow();

    var setToCurrentLocation = function () {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                map.setOptions({
                    center: new google.maps.LatLng(position.coords.latitude, position.coords.longitude),
                    zoom: 15
                });
            });
        }
    }

    setToCurrentLocation();

    map.addListener('click', function () {
        infoWindow.close();
        selectionDiv.html("");
    });

    var places = new google.maps.places.PlacesService(map);

    var searchBox = new google.maps.places.SearchBox(document.getElementById('search'));

    searchBox.addListener('places_changed', function () {
        var places = searchBox.getPlaces();

        if (places.length == 0) {
            return;
        }

        // Clear out the old markers.
        markers.forEach(function (marker) {
            marker.setMap(null);
        });
        markers = [];

        // For each place, get the icon, name and location.
        var bounds = new google.maps.LatLngBounds();
        places.forEach(function (place) {
            var marker = new google.maps.Marker({
                map: map,
                position: place.geometry.location,
            })

            marker.addListener('click', function () {
                infoWindow.setContent("<h3>" + place.name + "</h3>"
                                      + place.formatted_address);
                infoWindow.open(map, this);
                selectionDiv.html("");
                selectionDiv.append($("<h2>" + place.name + "</h2>"));
                selectionDiv.append($("<p>" + place.formatted_address + "</p>"));
            });

            // Create a marker for each place.
            markers.push(marker);

            if (place.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
        });
        map.fitBounds(bounds);
    });
}
