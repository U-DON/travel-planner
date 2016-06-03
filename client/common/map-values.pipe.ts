import { Pipe, PipeTransform } from "@angular/core";

// Angular currently doesn't support iterating over maps except with pipes.
// https://github.com/angular/angular/issues/2246
@Pipe({
    name: "mapValues",
    pure: false
})
export class MapValuesPipe implements PipeTransform {
    transform (map: Map<any, any>, args?: any[]): Object[] {
        let array = Array.from(map.values());
        console.log("MapValuesPipe array length: " + array.length);
        return array;
    }
}
