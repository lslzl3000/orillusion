import { Color, StorageGPUBuffer, Vector3 } from "@orillusion/core";

export type GisAttributeName = 'vSizeBuffer' | 'vTexIndex' | 'vColorBuffer' | 'vPositionBuffer';

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

export class GisPointAttrGroup {

    private _attrMap: Map<GisAttributeName, GisAttribute>;
    constructor(maxQuadCount: number) {
        this._attrMap = new Map();

        let attr: GisAttribute;

        attr = new GisAttribute('vSizeBuffer', maxQuadCount);
        this._attrMap.set(attr.name, attr);
        attr.data.fill(0);

        attr = new GisAttribute('vTexIndex', maxQuadCount);
        this._attrMap.set(attr.name, attr);

        attr = new GisAttribute('vColorBuffer', maxQuadCount * 4);
        this._attrMap.set(attr.name, attr);
        attr.data.fill(1);

        attr = new GisAttribute('vPositionBuffer', maxQuadCount * 4);
        this._attrMap.set(attr.name, attr);
    }

    public get position(){
        return this._attrMap.get('vPositionBuffer');
    }
    public get color(){
        return this._attrMap.get('vColorBuffer');
    }
    public get size(){
        return this._attrMap.get('vSizeBuffer');
    }
    public get texture(){
        return this._attrMap.get('vTexIndex');
    }

    public getAttribute(name: GisAttributeName) {
        return this._attrMap.get(name);
    }

    public getAttributes() {
        return this._attrMap.values();
    }

    public setSize(index: number, value: number) {
        let attr = this._attrMap.get('vSizeBuffer');
        attr.data[index] = value;
    }

    public setPosition(index: number, value: Vector3) {
        let attr = this._attrMap.get('vPositionBuffer');
        let offset = index * 4;
        attr.data[offset++] = value.x;
        attr.data[offset++] = value.y;
        attr.data[offset++] = value.z;
        attr.isDirty = true;
    }

    public setColor(index: number, value: Color) {
        let attr = this._attrMap.get('vColorBuffer');
        let offset = index * 4;
        attr.data[offset++] = value.r;
        attr.data[offset++] = value.g;
        attr.data[offset++] = value.b;
        attr.data[offset++] = value.a;
        attr.isDirty = true;
    }

    public setTextureIndex(index: number, value: number) {
        let attr = this._attrMap.get('vTexIndex');
        attr.data[index] = value;
        attr.isDirty = true;
    }

    public applyAttributes() {
        for (let item of this._attrMap.values()) {
            if (item.isDirty) {
                item.isDirty = false;
                item.buffer.apply();
            }
        }
    }
}