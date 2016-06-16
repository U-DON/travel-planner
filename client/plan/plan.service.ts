import { EventEmitter, Injectable } from "@angular/core";

import { BehaviorSubject } from "rxjs";

import { Plan, PlanStatus } from "./plan";

@Injectable()
export class PlanService {

    private _plans$ = new BehaviorSubject(new Map<string, Plan>());
    private _dataStore: {
        plans: Map<string, Plan>
    };

    constructor () {
        this._dataStore = {
            plans: new Map<string, Plan>()
        };
    }

    // Use observables to relay data between Planner and Map components.
    // http://stackoverflow.com/a/34714574/1070621
    // http://stackoverflow.com/a/34722345/1070621
    // https://angular.io/docs/ts/latest/cookbook/component-communication.html#!#bidirectional-service
    planAdded = new EventEmitter<Plan>();
    planRemoved = new EventEmitter<Plan>();
    planSelected = new EventEmitter<Plan>();
    planUpdated = new EventEmitter<Plan>();

    get plans$ () {
        return this._plans$.asObservable();
    }

    addPlan (plan: Plan) {
        console.log("PlanService.addPlan");
        plan.status = PlanStatus.INTERESTED;
        if (!this._dataStore.plans.has(plan.place.placeId)) {
            this._dataStore.plans.set(plan.place.placeId, plan);
        }
        this._plans$.next(this._dataStore.plans);
        this.planAdded.emit(plan);
    }

    removePlan (plan: Plan) {
        console.log("PlanService.removePlan");
        plan.status = PlanStatus.NOT_INTERESTED;
        this._dataStore.plans.delete(plan.place.placeId);
        this._plans$.next(this._dataStore.plans);
        this.planRemoved.emit(plan);
    }

    selectPlan (plan: Plan) {
        console.log("PlanService.selectPlan");
        this.planSelected.emit(plan);
    }

    commentPlan (plan: Plan, comment: string): boolean {
        if (comment === "") return false;
        plan.comments.push(comment);
        this.planUpdated.emit(plan);
        return true;
    }

}
