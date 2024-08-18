import { Material, Vector2, ShaderLib, Shader, PassType, Vector3, RenderShaderPass, GPUCompareFunction, GPUCullMode, Texture, BlendMode } from "@orillusion/core";
import { GisLineShader } from "./GisLineShader";

export class GisLineMaterial extends Material {
    private _screenSize: Vector2 = new Vector2(1024, 768);

    constructor() {
        super();

        ShaderLib.register('GisLineShader', GisLineShader.GisLineShader);

        let newShader = new Shader();

        this.addColorPass(newShader, PassType.COLOR);
        this.shader = newShader;

        newShader.setUniformVector2('screenSize', this._screenSize);
        this.setLineData(1, 0, 1, 0, 1);
        this.doubleSide = true;
        this.transparent = true;
        this.blendMode = BlendMode.NORMAL;
        this.depthWriteEnabled = false;
    }


    private _lineWidth: number = 1;
    public get lineWidth(): number {
        return this._lineWidth;
    }
    public set lineWidth(value: number) {
        this._lineWidth = value;
        this.setLineData(this._uScale, this._uSpeed, this._vScale, this._vSpeed, this._lineWidth);
    }

    private _uScale: number = 1;
    public get uScale(): number {
        return this._uScale;
    }
    public set uScale(value: number) {
        this._uScale = value;
        this.setLineData(this._uScale, this._uSpeed, this._vScale, this._vSpeed, this._lineWidth);

    }
    private _uSpeed: number = 0;
    public get uSpeed(): number {
        return this._uSpeed;
    }
    public set uSpeed(value: number) {
        this._uSpeed = value;
        this.setLineData(this._uScale, this._uSpeed, this._vScale, this._vSpeed, this._lineWidth);

    }
    private _vScale: number = 1;
    public get vScale(): number {
        return this._vScale;
    }
    public set vScale(value: number) {
        this._vScale = value;
        this.setLineData(this._uScale, this._uSpeed, this._vScale, this._vSpeed, this._lineWidth);

    }
    private _vSpeed: number = 0;
    public get vSpeed(): number {
        return this._vSpeed;
    }
    public set vSpeed(value: number) {
        this._vSpeed = value;
        this.setLineData(this._uScale, this._uSpeed, this._vScale, this._vSpeed, this._lineWidth);
    }

    public setScreenSize(width: number, height: number): this {
        this._screenSize.set(width, height);
        this.shader.setUniformVector2('screenSize', this._screenSize);
        return this;
    }

    private setLineData(uScale: number, uSpeed: number, vScale: number, vSpeed: number, lineWidth: number) {
        this.shader.setUniformFloat('uScale', uScale);
        this.shader.setUniformFloat('uSpeed', uSpeed);
        this.shader.setUniformFloat('vScale', vScale);
        this.shader.setUniformFloat('vSpeed', vSpeed);
        this.shader.setUniformFloat('lineWidth', lineWidth);
    }

    private addColorPass(shader: Shader, passType: PassType) {
        let shaderKey = 'GisLineShader';
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

