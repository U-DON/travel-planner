/// <reference path="../typings/browser.d.ts" />

import { bootstrap } from "@angular/platform-browser-dynamic";

import { AppComponent } from "./components/app.component";
import { PlannerService } from "./services/planner.service";

bootstrap(AppComponent, [PlannerService]);
