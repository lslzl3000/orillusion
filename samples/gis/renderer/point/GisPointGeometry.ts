import { GeometryBase, VertexAttributeName, BoundingBox, Vector3 } from "@orillusion/core";

export class GisPointGeometry extends GeometryBase {

    constructor(quadCount: number) {
        super();
        this.buildGeometry(quadCount);
    }

    //0 1
    //2 3
    private buildGeometry(quadCount: number): void {
        let indices_arr: Uint32Array = new Uint32Array(quadCount * 6);
        let offset = 0;
        let vOffset = 0;
        for (let i = 0; i < quadCount; i++) {
            offset = i * 6;
            vOffset = i * 4;
            indices_arr[offset] = vOffset;
            indices_arr[offset + 1] = vOffset + 1;
            indices_arr[offset + 2] = vOffset + 2;
            indices_arr[offset + 3] = vOffset + 1;
            indices_arr[offset + 4] = vOffset + 3;
            indices_arr[offset + 5] = vOffset + 2;
        }

        this.setIndices(indices_arr);
        let v_index = new Float32Array(quadCount * 4);
        for (let i = 0; i < quadCount; i++) {
            offset = i * 12;
            //v index
            offset = i * 4;
            v_index[offset] = offset++;
            v_index[offset] = offset++;
            v_index[offset] = offset++;
            v_index[offset] = offset++;
        }


        this.setAttribute(VertexAttributeName.vIndex, v_index);

        this.addSubGeometry({
            indexStart: 0,
            indexCount: indices_arr.length,
            vertexStart: 0,
            vertexCount: 0,
            firstStart: 0,
            index: 0,
            topology: 0
        });

        this.bounds = new BoundingBox().setFromMinMax(new Vector3(-99999999, -99999999, -99999999), new Vector3(99999999, 99999999, 99999999));
    }

}
