import { MeshRenderer, BitmapTexture2D, BitmapTexture2DArray, View3D, PassType, RendererPassState, ClusterLightingBuffer } from "@orillusion/core";
import { GisLineGeometry } from "./GisLineGeometry";
import { GisLineMaterial } from "./GisLineMaterial";
import { GisLineAttrGroup } from "./GisLineAttrGroup";

export class GisLineRenderer extends MeshRenderer {
    public maxCount: number;
    public lineMaterial: GisLineMaterial;
    public pointsGeometry: GisLineGeometry;
    public attrGroup: GisLineAttrGroup;

    public init(param?: { textures: BitmapTexture2D[], count: number }): void {
        super.init?.(param);

        let { textures, count } = param;
        this.maxCount = count

        let bitmapTexture2DArray = new BitmapTexture2DArray(textures[0].width, textures[0].height, textures.length);
        bitmapTexture2DArray.setTextures(textures);

        this.lineMaterial = new GisLineMaterial();
        this.lineMaterial.baseMap = bitmapTexture2DArray;

        this.pointsGeometry = new GisLineGeometry(this.maxCount);

        this.material = this.lineMaterial;
        this.geometry = this.pointsGeometry;

        let shader = this.material.shader;
        this.attrGroup = new GisLineAttrGroup(this.maxCount);
        for (let item of this.attrGroup.getAttributes()) {
            shader.setStorageBuffer(item.name, item.buffer);
        }
    }

    public nodeUpdate(view: View3D, passType: PassType, renderPassState: RendererPassState, clusterLightingBuffer: ClusterLightingBuffer): void {
        this.attrGroup.applyAttributes();
        this.lineMaterial.setCameraData(view.camera.fov);
        super.nodeUpdate(view, passType, renderPassState, clusterLightingBuffer);
    }

    public get attributes() {
        return this.attrGroup;
    }

}