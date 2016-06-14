import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy
} from "@angular/core";

@Component({
    selector: "search-results",
    changeDetection: ChangeDetectionStrategy.OnPush,
    styles: [`
        :host {
            flex: 1;
        }
    `],
    template: `
        <div id="search-results">
        </div>
    `
})
export class SearchResultsComponent {
}
