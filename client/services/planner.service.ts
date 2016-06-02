import { EventEmitter, Injectable } from "@angular/core";

import { Subject } from "rxjs/Subject";

import { Plan, PlanStatus } from "../components/planner.component";

@Injectable()
export class PlannerService {

    // Use observables to relay data between Planner and Map components.
    // http://stackoverflow.com/a/34714574/1070621
    // http://stackoverflow.com/a/34722345/1070621
    // https://angular.io/docs/ts/latest/cookbook/component-communication.html#!#bidirectional-service
    planAdded = new EventEmitter<Plan>();
    planRemoved = new EventEmitter<Plan>();

    addPlan (plan: Plan) {
        console.log("PlannerService.addPlan");
        plan.status = PlanStatus.INTERESTED;
        this.planAdded.emit(plan);
    }

    removePlan (plan: Plan) {
        console.log("PlannerService.removePlan");
        plan.status = PlanStatus.NOT_INTERESTED;
        this.planRemoved.emit(plan);
    }

}
