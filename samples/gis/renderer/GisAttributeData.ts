import { Color, StorageGPUBuffer, Vector3 } from "../../../src";
export type GisAttributeName = 'vSizeBuffer' | 'vTexIndex' | 'vColorBuffer' | 'vPositionBuffer';

class GisAttribute {
    public readonly array: Float32Array;
    public readonly buffer: StorageGPUBuffer;
    public readonly name: GisAttributeName;

    public isDirty: boolean = true;
    constructor(name: GisAttributeName, count: number) {
        this.name = name;
        this.buffer = new StorageGPUBuffer(count, 0);
        this.array = new Float32Array(this.buffer.memory.shareDataBuffer);
    }
}

export class GisPointAttrGroup {

    private _attrMap: Map<GisAttributeName, GisAttribute>;
    constructor(maxQuadCount: number) {
        this._attrMap = new Map();

        let attr: GisAttribute;

        attr = new GisAttribute('vSizeBuffer', maxQuadCount);
        this._attrMap.set(attr.name, attr);
        attr.array.fill(0);

        attr = new GisAttribute('vTexIndex', maxQuadCount);
        this._attrMap.set(attr.name, attr);

        attr = new GisAttribute('vColorBuffer', maxQuadCount * 4);
        this._attrMap.set(attr.name, attr);
        attr.array.fill(1);

        attr = new GisAttribute('vPositionBuffer', maxQuadCount * 4);
        this._attrMap.set(attr.name, attr);
    }

    public setAttributeDirty(name: GisAttributeName) {
        let attribute = this._attrMap.get(name);
        attribute && (attribute.isDirty = true);
    }

    public getAttribute(name: GisAttributeName) {
        return this._attrMap.get(name);
    }

    public eachAttribute() {
        return this._attrMap.values();
    }

    public setSize(index: number, value: number) {
        let attr = this._attrMap.get('vSizeBuffer');
        attr.array[index] = value;
    }

    public setPosition(index: number, value: Vector3) {
        let attr = this._attrMap.get('vPositionBuffer');
        let offset = index * 4;
        attr.array[offset++] = value.x;
        attr.array[offset++] = value.y;
        attr.array[offset++] = value.z;

        attr.isDirty = true;
    }

    public setColor(index: number, value: Color) {
        let attr = this._attrMap.get('vColorBuffer');
        let offset = index * 4;
        attr.array[offset++] = value.r;
        attr.array[offset++] = value.g;
        attr.array[offset++] = value.b;
        attr.array[offset++] = value.a;

        attr.isDirty = true;
    }

    public setTextureIndex(index: number, value: number) {
        let attr = this._attrMap.get('vTexIndex');
        attr.array[index] = value;

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