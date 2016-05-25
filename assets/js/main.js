var initMap = function () {
    var selectionDiv = $('#selection');

    var mapOptions = {
        center: new google.maps.LatLng(37.09024, -95.712891),
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: false,
        streetViewControlOptions: {
            position: google.maps.ControlPosition.TOP_RIGHT
        },
        zoom: 3,
        zoomControlOptions: {
            position: google.maps.ControlPosition.TOP_RIGHT
        }
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
        selectionDiv.hide();
    });

    var places = new google.maps.places.PlacesService(map);

    var searchControl = document.getElementById('search-control');
    var searchInput = document.getElementById('search-box');
    var searchBox = new google.maps.places.SearchBox(searchInput);

    var selectionControl = document.getElementById('selection-control');

    map.controls[google.maps.ControlPosition.LEFT_TOP].push(searchControl);
    map.controls[google.maps.ControlPosition.LEFT_TOP].push(selectionControl);

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
                console.log(place);
                infoWindow.setContent("<h3>" + place.name + "</h3>"
                                      + place.formatted_address);
                infoWindow.open(map, this);

                var selectionPhoto = $('#selection-photo');
                var selectionInfo = $('#selection-info');
                selectionPhoto.html("");
                selectionInfo.html("");

                if (place.photos) {
                    var photo = place.photos[0];
                    var photoUrl;

                    // Scale photo according to its dimensions.
                    if (photo.width > photo.height) {
                        photoUrl = photo.getUrl({ maxHeight: 360 });
                    } else {
                        photoUrl = photo.getUrl({ maxWidth: 540 });
                    }

                    selectionPhoto.css('background-image', "url(" + photoUrl + ")");
                } else {
                    selectionPhoto.css('background-image', 'none');
                }

                selectionInfo.append($("<h2>" + place.name + "</h2>"));

                if (place.formatted_address) {
                    selectionInfo.append($("<p>" + place.formatted_address + "</p>"));
                }

                if (place.formatted_phone_number) {
                    selectionInfo.append($("<p>" + place.formatted_phone_number + "</p>"));
                }

                if (place.price_level) {
                    selectionInfo.append($("<p>" + "$".repeat(place.price_level) + "</p>"));
                }

                if (place.website) {
                    selectionInfo.append($('<a />', { href: place.website, text: "Website" }));
                }

                selectionDiv.show();
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
