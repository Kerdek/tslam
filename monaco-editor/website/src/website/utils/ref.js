/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { action, observable } from "mobx";
export function ref(obj, prop) {
    return {
        get: () => obj[prop],
        set: (value) => (obj[prop] = value),
    };
}
export class ObservableReference {
    value;
    constructor(value) {
        this.value = value;
    }
    set(value) {
        this.value = value;
    }
    get() {
        return this.value;
    }
}
__decorate([
    observable
], ObservableReference.prototype, "value", void 0);
__decorate([
    action
], ObservableReference.prototype, "set", null);
//# sourceMappingURL=ref.js.map