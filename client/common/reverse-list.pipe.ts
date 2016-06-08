import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: "reverse",
    pure: false
})
export class ReverseListPipe implements PipeTransform {
    transform (array: any[]): any[] {
        return array.slice().reverse();
    }
}
