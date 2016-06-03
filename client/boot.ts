/// <reference path="../typings/browser.d.ts" />

import { bootstrap } from "@angular/platform-browser-dynamic";

import { AppComponent } from "./components/app.component";
import { PlanService } from "./services/plan.service";

bootstrap(AppComponent, [PlanService]);
