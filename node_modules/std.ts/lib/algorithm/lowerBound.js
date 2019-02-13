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
var comparisons_1 = require("../util/comparisons");
/**
 * Searches for the element specified, if the element is not found, it returns
 * the element below it. The array must be sorted, the bounds of the search
 * will be delimited by begin and end as [begin, end).
 * @param array The array where the search is going to be executed.
 * @param begin The initial position where to search.
 * @param end The final position where to search.
 * @param value The value to search.
 * @param compare A function specifying how to compare the elements of the
 * array.
 * @returns The index to lower bound of value.
 */
function lowerBound(array, begin, end, value, compare) {
    if (compare === void 0) { compare = comparisons_1.defaultComparison; }
    var idx = lb(begin, end);
    var cmp = compare(value, array[idx]);
    // Adapt the result to lower bound.
    if (cmp < 0 && idx !== 0) {
        return idx - 1;
    }
    else {
        if (idx === end) {
            return idx - 1;
        }
        else {
            return idx;
        }
    }
    /**
     * Recursively searches value in array at [b, e).
     * @param b
     * @param e
     * @returns The position of value.
     */
    function lb(b, e) {
        if (b === e) {
            return b;
        }
        var v = (b + e) >> 1;
        var c = compare(value, array[v]);
        if (c === 0) {
            return v;
        }
        else if (c < 0) {
            return lb(b, v);
        }
        else {
            return lb(v + 1, e);
        }
    }
}
exports.lowerBound = lowerBound;
