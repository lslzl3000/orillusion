import { Color, StorageGPUBuffer, Vector3 } from "@orillusion/core";

export enum LineType {
    DASH = 0,//虚线
    SOLID = 1,//实线
}

export type GisAttributeName = 'vSizeBuffer' | 'vTexIndex' | 'vColorBuffer'
    | 'vColorIndex' | 'vPositionBuffer' | 'vLineWidth' | 'vLineType';

export class GisAttribute {
    public readonly data: Float32Array;
    public readonly buffer: StorageGPUBuffer;
    public readonly name: GisAttributeName;

    public isDirty: boolean = true;
    constructor(name: GisAttributeName, count: number) {
        this.name = name;
        this.buffer = new StorageGPUBuffer(count, 0);
        this.data = new Float32Array(this.buffer.memory.shareDataBuffer);
    }
}
