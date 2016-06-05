import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: "toRating"
})
export class RatingPipe implements PipeTransform {
    transform (rating: number): string {
        if (rating) {
            let stars = Math.floor(rating);
            let halfStar = (rating === stars ? 0 : 1);
            let starRating = "<span title='"
                           + rating
                           + "'>"
                           + "<i class='fa fa-star'></i>".repeat(stars)
                           + "<i class='fa fa-star-half'></i>".repeat(halfStar)
                           + "<span class='sr-only'>"
                           + "Rating: "
                           + rating
                           + " stars</span></span>"

            return starRating;
        }
    }
}
