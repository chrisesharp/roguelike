import { Tile } from '../../common/tile';
import { CellGenerator } from './cell-generator';
import { FileGenerator } from './file-generator';

export interface MapGenerator {
    generateLevel(level: number): Tile[][];
}

// import { MockGenerator } from '../../../test/mock-generator';

export interface GeneratorOptions {
    maps?: string;
}

interface GeneratorTypes {
    [name: string]: (width: number, height: number, options: GeneratorOptions) => MapGenerator;
}

export const generators: GeneratorTypes = {
    CellGenerator: (width, height) => new CellGenerator(width, height),
    FileGenerator: (width, height, options) => new FileGenerator(width, height, options),
}
