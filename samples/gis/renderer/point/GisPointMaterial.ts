import { Material, Vector2, ShaderLib, Shader, PassType, Vector3, RenderShaderPass, GPUCompareFunction, GPUCullMode, Texture } from "../../../../src";
import { GisPointShader } from "./GisPointShader";

export class GisPointMaterial extends Material {
    private _screenSize: Vector2 = new Vector2(1024, 768);

    constructor() {
        super();

        ShaderLib.register('GisPointShader', GisPointShader.GisPointShader);

        let newShader = new Shader();

        this.addColorPass(newShader, PassType.COLOR);
        this.shader = newShader;

        newShader.setUniformVector2('screenSize', this._screenSize);
        this.doubleSide = true;
        this.transparent = true;
    }

    public setScreenSize(width: number, height: number): this {
        this._screenSize.set(width, height);
        this.shader.setUniformVector2('screenSize', this._screenSize);
        return this;
    }

    public setCameraLeft(left: Vector3) {
        this.shader.setUniformVector3('cameraLeft', left);
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

