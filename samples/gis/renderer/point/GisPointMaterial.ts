import { Material, Vector2, ShaderLib, Shader, PassType, Vector3, RenderShaderPass, GPUCompareFunction, GPUCullMode, Texture, DEGREES_TO_RADIANS } from "@orillusion/core";
import { GisPointShader } from "./GisPointShader";

export class GisPointMaterial extends Material {

    private _pointSize: number = 1;
    private _fixSize: boolean = true;

    constructor() {
        super();

        ShaderLib.register('GisPointShader', GisPointShader.GisPointShader);

        let newShader = new Shader();

        this.addColorPass(newShader, PassType.COLOR);
        this.shader = newShader;
        this.pointSize = 1.0;
        this.doubleSide = true;
        this.transparent = true;

        this.shader.setUniformVector3('cameraUp', Vector3.UP);
        this.shader.setUniformFloat('fov', 60);
        this.shader.setUniformFloat('fixSize', this._fixSize ? 1 : 0);
    }

    public get pointSize(): number {
        return this._pointSize;
    }
    public set pointSize(value: number) {
        this._pointSize = value;
        this.shader.setUniformFloat('pointSize', this._pointSize);
    }

    public get fixSize(): boolean {
        return this._fixSize;
    }
    public set fixSize(value: boolean) {
        this._fixSize = value;
        this.shader.setUniformFloat('fixSize', this._fixSize ? 1 : 0);
    }

    public setCameraData(up: Vector3, fov: number) {
        this.shader.setUniformVector3('cameraUp', up);
        this.shader.setUniformFloat('fov', fov * 0.5 * DEGREES_TO_RADIANS);
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

