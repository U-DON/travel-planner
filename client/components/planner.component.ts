import { Component } from "@angular/core";

@Component({
    selector: "planner",
    styles: [`
        :host {
            box-shadow: 2px 0 5px rgba(0, 0, 0, 0.25);
            display: flex;
            flex-direction: column;
            height: 100vh;
            position: relative;
            width: 720px;
            z-index: 1;
        }
    `],
    template: `
        <div id="plan">
            <h1>Plan</h1>
        </div>
    `
})
export class PlannerComponent {
}
