[![Version](https://img.shields.io/npm/v/std.ts.svg)](https://www.npmjs.com/package/std.ts)
[![Downloads](https://img.shields.io/npm/dm/std.ts.svg)](https://www.npmjs.com/package/std.ts)
[![Build Status](https://img.shields.io/travis/IpiVasquez/std.ts.svg)](https://travis-ci.org/IpiVasquez/std.ts)
![Maintenance](https://img.shields.io/maintenance/yes/2018.svg)
[![License](https://img.shields.io/github/license/IpiVasquez/std.ts.svg)](https://github.com/IpiVasquez/std.ts/blob/master/LICENSE)
# std.ts
TypeScript Standard Library (std.ts) is a collection of classes and functions
inspired and adapted from C++ Standard Library. Although std.ts is written in
TypeScript, it can be used without any issues on JavaScript.

JavaScript & TypeScript lack of data structures limits the developers' ability
to solve problems; where other data structures would work better with less code
assuring the developer the maximum efficiency provided by the Standard Library.

## Installation
The recommended way to install std.ts is through Node Package Manager.
```bash
$ npm install --save std.ts 
```

## Usage
```js

```

## Features
std.ts is a work in progress, hence we've only implemented the next few 
features from std library:
* Containers
    * bitset as BitSet
    * stack as Stack
    * queue as Queue
    * priority queue as PriorityQueue
* Others
    * Algorithm
        * lower bound as lowerBound
        * upper bound as upperBound

## Upcoming features
As you should know, C++ Standard Library is huge and some functions would be 
impossible to implement. The next features are the ones we think may be 
adapted to TS/JS and we'll be working and accepting suggestions on this.
* Containers
    * array
    * deque
    * forward_list
    * list
    * map
    * set
    * unordered_map
    * unordered_set
    * vector
* General
    * algorithm
    * iterator
    * tuple
    * utility
* Streams and IO
