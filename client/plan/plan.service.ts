import { EventEmitter, Injectable } from "@angular/core";

import { Subject } from "rxjs/Subject";

import { Plan, PlanStatus } from "./plan";

@Injectable()
export class PlanService {

    // Use observables to relay data between Planner and Map components.
    // http://stackoverflow.com/a/34714574/1070621
    // http://stackoverflow.com/a/34722345/1070621
    // https://angular.io/docs/ts/latest/cookbook/component-communication.html#!#bidirectional-service
    planAdded = new EventEmitter<Plan>();
    planRemoved = new EventEmitter<Plan>();
    planSelected = new EventEmitter<Plan>();

    addPlan (plan: Plan) {
        console.log("PlanService.addPlan");
        plan.status = PlanStatus.INTERESTED;
        this.planAdded.emit(plan);
    }

    selectPlan (plan: Plan) {
        console.log("PlanService.selectPlan");
        this.planSelected.emit(plan);
    }

    removePlan (plan: Plan) {
        console.log("PlanService.removePlan");
        plan.status = PlanStatus.NOT_INTERESTED;
        this.planRemoved.emit(plan);
    }

}
