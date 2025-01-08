import { ShapeType } from '../utils/geometry';

export interface BoundingBox {
    readonly xMin: number;
    readonly yMin: number;
    readonly xMax: number;
    readonly yMax: number;
}

export interface ShpHeader {
    readonly extent: BoundingBox;
    readonly type: ShapeType;
    readonly fileLength: number;
    readonly zRange: { min: number; max: number };
    readonly mRange: { min: number; max: number };
}

export interface ShxRecord {
    offset: number;
    length: number;
}

export interface GeomHeader {
    offset: number;
    recordNum: number;
    length: number;
    type: ShapeType;
}

export interface PartsInfo {
    numParts: number;
    numPoints: number;
    index: Int32Array;
}
