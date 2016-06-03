import { Component } from "@angular/core";

import { PlannerComponent } from "./plan/planner.component";
import { MapComponent } from "./map/map.component";

@Component({
    selector: "app",
    directives: [PlannerComponent, MapComponent],
    styles: [`
        :host {
            display: flex;
            flex-direction: row; // Flip for vertical screens?
            height: 100vh;
            margin: 0;
            padding: 0;
            width: 100vw;
        }
    `],
    template: `
        <planner></planner>
        <map></map>
    `
})
export class AppComponent {
}
