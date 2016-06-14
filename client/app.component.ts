import { Component } from "@angular/core";
import { RouteConfig, ROUTER_PROVIDERS } from "@angular/router-deprecated";

import { PlanListComponent } from "./plan/plan-list.component";
import { SearchResultsComponent } from "./plan/search-results.component";
import { PlanService } from "./plan/plan.service";
import { PlannerComponent } from "./plan/planner.component";
import { MapComponent } from "./map/map.component";

@Component({
    selector: "app",
    directives: [PlannerComponent, MapComponent],
    providers: [ROUTER_PROVIDERS, PlanService],
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
@RouteConfig([
    {
        path: "/plans",
        name: "Plans",
        component: PlanListComponent
    },
    {
        path: "/search",
        name: "Search",
        component: SearchResultsComponent,
        useAsDefault: true
    }
])
export class AppComponent {
}
