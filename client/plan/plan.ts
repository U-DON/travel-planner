export class Place {

    address: string;
    geometry: google.maps.places.PlaceGeometry;
    name: string;
    phoneNumber: string;
    photos: google.maps.places.PlacePhoto[];
    placeId: string;
    priceLevel: number;
    rating: number;
    types: string[];
    website: string;

    constructor (place: google.maps.places.PlaceResult) {
        this.address = place.formatted_address;
        this.geometry = place.geometry;
        this.name = place.name;
        this.phoneNumber = place.formatted_phone_number;
        this.photos = place.photos;
        this.placeId = place.place_id;
        this.priceLevel = place.price_level;
        this.rating = place.rating;
        this.types = place.types;
        this.website = place.website;
    }

    photoUrl (): string {
        let photoUrl: string = "none";

        if (this.photos && this.photos.length > 0) {
            let photo = this.photos[0];

            // Scale photo according to its dimensions.
            if (photo.width > photo.height) {
                photoUrl = photo.getUrl({ maxHeight: 320 });
            } else {
                photoUrl = photo.getUrl({ maxWidth: 480 });
            }

            photoUrl = `url(${photoUrl})`;
        }

        return photoUrl;
    }

}

export const enum PlanStatus {
    NOT_INTERESTED,
    NOT_GOING,
    INTERESTED,
    GOING
}

export class Plan {

    place: Place;
    status: PlanStatus;
    description: string;
    comments: string[];
    votes: number

    constructor (place: Place,
                 status?: PlanStatus,
                 description?: string,
                 comments?: string[],
                 votes?: number)
    {
        this.place = place;
        this.status = PlanStatus.NOT_INTERESTED;
        this.description = "";
        this.comments = [];
        this.votes = 0;
    }

}
