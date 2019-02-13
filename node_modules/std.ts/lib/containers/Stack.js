"use strict";
/**
 * @author Hector J. Vasquez <ipi.vasquez@gmail.com>
 *
 * @licence
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Stacks are a type of container adaptor, specifically designed to operate
 * in a LIFO context, where elements are inserted and extracted only from
 * one end of the container.
 */
var Stack = /** @class */ (function () {
    /**
     * Constructs stack.
     */
    function Stack() {
        this._store = [];
    }
    /**
     * Checks the size of the stack and returns value.
     * @returns The size of the stack.
     */
    Stack.prototype.size = function () {
        return this._store.length;
    };
    /**
     * Checks the top element on the stack and returns it without pop it.
     * @returns The top element on the stack.
     */
    Stack.prototype.top = function () {
        return this._store[0];
    };
    /**
     * Extract the top element from the stack and returns it.
     * @returns The top element of the stack.
     */
    Stack.prototype.pop = function () {
        return this._store.shift();
    };
    /**
     * Inserts an element to the stack.
     * @param e The element to insert to the stack.
     */
    Stack.prototype.push = function (e) {
        this._store.unshift(e);
    };
    /**
     * Tests if the stack has any elements.
     * @returns true if there are no elements on the stack, false otherwise.
     */
    Stack.prototype.empty = function () {
        return this.size() === 0;
    };
    return Stack;
}());
exports.Stack = Stack;
