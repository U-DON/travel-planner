/// <reference path="../typings/browser.d.ts" />

import { bootstrap } from "@angular/platform-browser-dynamic";

import { AppComponent } from "./app.component";
import { PlanService } from "./plan/plan.service";

bootstrap(AppComponent, [PlanService]);
