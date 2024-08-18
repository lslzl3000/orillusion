import { Material, Vector2, ShaderLib, Shader, PassType, Vector3, RenderShaderPass, GPUCompareFunction, GPUCullMode, Texture } from "@orillusion/core";
import { GisPointShader } from "./GisPointShader";

export class GisPointMaterial extends Material {

    private _pointSize: number = 1;

    constructor() {
        super();

        ShaderLib.register('GisPointShader', GisPointShader.GisPointShader);

        let newShader = new Shader();

        this.addColorPass(newShader, PassType.COLOR);
        this.shader = newShader;
        this.pointSize = 1.0;
        this.doubleSide = true;
        this.transparent = true;
    }

    public get pointSize(): number {
        return this._pointSize;
    }
    public set pointSize(value: number) {
        this._pointSize = value;
        this.shader.setUniformFloat('pointSize', this._pointSize);
    }

    public setCameraUp(left: Vector3) {
        this.shader.setUniformVector3('cameraUp', left);
    }

    private addColorPass(shader: Shader, passType: PassType) {
        let shaderKey = 'GisPointShader';
        let shaderPass = new RenderShaderPass(shaderKey, shaderKey);
        shaderPass.passType = passType;
        shaderPass.setShaderEntry(`VertMain`, `FragMain`);

        let shaderState = shaderPass.shaderState;
        shaderState.depthWriteEnabled = true;
        // shaderPass.blendMode = BlendMode.NORMAL;
        shaderPass.depthCompare = GPUCompareFunction.less_equal;
        shaderPass.cullMode = GPUCullMode.back;
        shader.addRenderPass(shaderPass);
    }

    public set baseMap(texture: Texture) {
        this.shader.setTexture(`baseMap`, texture);
    }

    public get baseMap() {
        return this.shader.getTexture(`baseMap`);
    }

    public set envMap(texture: Texture) { }
    public set shadowMap(texture: Texture) { }
    public set normalMap(value: Texture) { }
    public set emissiveMap(value: Texture) { }
    public set irradianceMap(value: Texture) { }
    public set irradianceDepthMap(value: Texture) { }
}

