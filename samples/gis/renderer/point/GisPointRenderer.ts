import { MeshRenderer, BitmapTexture2D, BitmapTexture2DArray, View3D, PassType, RendererPassState, ClusterLightingBuffer } from "@orillusion/core";
import { GisPointAttrGroup } from "../GisAttributeData";
import { GisPointGeometry } from "./GisPointGeometry";
import { GisPointMaterial } from "./GisPointMaterial";

export class GisPointRenderer extends MeshRenderer {
    public maxCount: number;
    public pointMaterial: GisPointMaterial;
    public pointsGeometry: GisPointGeometry;
    public attrGroup: GisPointAttrGroup;

    public init(param?: {textures: BitmapTexture2D[], count: number}): void {
        super.init?.(param);

        let {textures, count} = param;
        this.maxCount = count

        let bitmapTexture2DArray = new BitmapTexture2DArray(textures[0].width, textures[0].height, textures.length);
        bitmapTexture2DArray.setTextures(textures);

        this.pointMaterial = new GisPointMaterial();
        this.pointMaterial.baseMap = bitmapTexture2DArray;

        this.pointsGeometry = new GisPointGeometry(this.maxCount);

        this.material = this.pointMaterial;
        this.geometry = this.pointsGeometry;

        let shader = this.material.shader;
        this.attrGroup = new GisPointAttrGroup(this.maxCount);
        for (let item of this.attrGroup.getAttributes()) {
            shader.setStorageBuffer(item.name, item.buffer);
        }
    }

    public nodeUpdate(view: View3D, passType: PassType, renderPassState: RendererPassState, clusterLightingBuffer: ClusterLightingBuffer): void {
        this.attrGroup.applyAttributes();
        this.pointMaterial.setCameraLeft(view.camera.transform.left);
        super.nodeUpdate(view, passType, renderPassState, clusterLightingBuffer);
    }

    public get attributes(){
        return this.attrGroup;
    }
    
}