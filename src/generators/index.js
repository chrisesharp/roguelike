"use strict";

const Generators = {};

import CellGenerator from './cell-generator.js';
Generators.CellGenerator = CellGenerator;

import FileGenerator from "./file-generator.js";
Generators.FileGenerator = FileGenerator;

import MockGenerator from "../../test/mock-generator.js";
Generators.MockGenerator = MockGenerator;

export { Generators };