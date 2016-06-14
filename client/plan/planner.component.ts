import {
    ChangeDetectionStrategy,
    Component,
} from "@angular/core";
import { RouteConfig, ROUTER_DIRECTIVES, ROUTER_PROVIDERS } from "@angular/router-deprecated";

@Component({
    selector: "planner",
    changeDetection: ChangeDetectionStrategy.OnPush,
    directives: [ROUTER_DIRECTIVES],
    styles: [`
        :host {
            box-shadow: 2px 0 5px rgba(0, 0, 0, 0.25);
            display: flex;
            flex-direction: column;
            height: 100vh;
            position: relative;
            width: 480px;
            z-index: 1;
        }
    `],
    template: `
        <div id="logo">
            <a href="/">Travelogue</a>
        </div>
        <nav id="view-tabs">
            <a [routerLink]="['Plans']" id="itinerary-tab">
                <i class="fa fa-map"></i>&nbsp;&nbsp; Itinerary
            </a>
            <a [routerLink]="['Search']" id="search-tab">
                <i class="fa fa-globe"></i>&nbsp;&nbsp; Find Places
            </a>
        </nav>
        <div id="view-input-wrapper">
            <div id="view-input">
                <input type="text" placeholder="Where do you want to go?" />
                <i class="fa fa-lg fa-close"></i>
                <i class="fa fa fa-search"></i>
            </div>
        </div>
        <a (click)="$event.preventDefault(); goBack();" id="back" href="#back">
            <i class="fa fa-lg fa-long-arrow-left"></i>&nbsp;&nbsp; Back To Search Results
        </a>
        <plan-list></plan-list>
        <search-results></search-results>
        <router-outlet></router-outlet>
    `
})
export class PlannerComponent {

    goBack () {
        window.history.back();
    }

}
