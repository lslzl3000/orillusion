import { GisAttributeName, GisAttribute, LineType } from "../GisAttributeData";
import { Vector3, Color, Vector4 } from "@orillusion/core";

export class GisLineAttrGroup {
    private _attrMap: Map<GisAttributeName, GisAttribute>;
    //每一段有两个点组成
    constructor(maxSegmentCount: number, maxColorCount: number = 128) {
        this._attrMap = new Map();

        let attr: GisAttribute;

        attr = new GisAttribute('vLineWidth', maxSegmentCount);
        this._attrMap.set(attr.name, attr);
        attr.data.fill(1);

        attr = new GisAttribute('vLineType', maxSegmentCount);
        this._attrMap.set(attr.name, attr);

        attr = new GisAttribute('vTexIndex', maxSegmentCount);
        this._attrMap.set(attr.name, attr);

        //颜色下标(start end)
        attr = new GisAttribute('vColorIndex', maxSegmentCount * 2);
        this._attrMap.set(attr.name, attr);

        //[xyz, overallLength], [xyz, overallLength]
        attr = new GisAttribute('vPositionBuffer', maxSegmentCount * 8);
        this._attrMap.set(attr.name, attr);

        //有限数量的颜色，不需要每个segment独立设置颜色
        attr = new GisAttribute('vColorBuffer', maxColorCount * 4);
        this._attrMap.set(attr.name, attr);
        attr.data.fill(1);
    }

    public getAttribute(name: GisAttributeName) {
        return this._attrMap.get(name);
    }

    public getAttributes() {
        return this._attrMap.values();
    }

    public setLineWidth(index: number, value: number) {
        let attr = this._attrMap.get('vLineWidth');
        attr.data[index] = value;
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

    public setLineType(index: number, value: LineType) {
        let attr = this._attrMap.get('vLineType');
        attr.data[index] = value;
    }

    //(x,y,z, overallLength), (x,y,z, overallLength)
    public setPosition(index: number, start: Vector4, end: Vector4) {
        let attr = this._attrMap.get('vPositionBuffer');
        let offset = index * 8;
        attr.data[offset++] = start.x;
        attr.data[offset++] = start.y;
        attr.data[offset++] = start.z;
        attr.data[offset++] = start.w;

        attr.data[offset++] = end.x;
        attr.data[offset++] = end.y;
        attr.data[offset++] = end.z;
        attr.data[offset++] = end.w;

        attr.isDirty = true;
    }

    public setColorIndex(index: number, start: number, end: number) {
        let attr = this._attrMap.get('vColorIndex');
        let offset = index * 2;
        attr.data[offset++] = start;
        attr.data[offset++] = end;
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