import { MeshRenderer, BitmapTexture2D, BitmapTexture2DArray, View3D, PassType, RendererPassState, ClusterLightingBuffer } from "../../../../src";
import { GisPointAttrGroup } from "../GisAttributeData";
import { GisSetting } from "../GisSetting";
import { GisPointGeometry } from "./GisPointGeometry";
import { GisPointMaterial } from "./GisPointMaterial";

export class GisPointRenderer extends MeshRenderer {

    public pointMaterial: GisPointMaterial;
    public pointsGeometry: GisPointGeometry;
    public attrGroup: GisPointAttrGroup;

    public init(param?: any): void {
        super.init?.(param);

        let bmpList = param as BitmapTexture2D[];

        let { width, height } = bmpList[0];
        let bitmapTexture2DArray = new BitmapTexture2DArray(width, height, bmpList.length);
        bitmapTexture2DArray.setTextures(bmpList);

        this.pointMaterial = new GisPointMaterial();
        this.pointMaterial.baseMap = bitmapTexture2DArray;

        this.pointsGeometry = new GisPointGeometry(GisSetting.maxQuadCount);

        this.material = this.pointMaterial;
        this.geometry = this.pointsGeometry;

        let shader = this.material.shader;
        this.attrGroup = new GisPointAttrGroup(GisSetting.maxQuadCount);
        for (let item of this.attrGroup.eachAttribute()) {
            shader.setStorageBuffer(item.name, item.buffer);
        }
    }

    public nodeUpdate(view: View3D, passType: PassType, renderPassState: RendererPassState, clusterLightingBuffer: ClusterLightingBuffer): void {
        this.attrGroup.applyAttributes();
        this.pointMaterial.setCameraLeft(view.camera.transform.left);
        super.nodeUpdate(view, passType, renderPassState, clusterLightingBuffer);
    }

}