/// <reference path="../typings/browser.d.ts" />

import 'reflect-metadata';
require('zone.js/dist/zone');

import { enableProdMode } from "@angular/core";
import { bootstrap } from "@angular/platform-browser-dynamic";

import { AppComponent } from "./app.component";
import { PlanService } from "./plan/plan.service";

if (process.env.ENV === "production") {
    enableProdMode();
}

bootstrap(AppComponent, [PlanService]);
