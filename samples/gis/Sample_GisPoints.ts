import { GUIHelp } from "@orillusion/debug/GUIHelp";
import { AtmosphericComponent, AxisObject, BitmapTexture2D, CameraUtil, Color, DirectLight, Engine3D, HoverCameraController, KelvinUtil, Object3D, Scene3D, Vector3, View3D, } from "@orillusion/core";
import { Stats } from "@orillusion/stats";
import { GisSetting } from "./renderer/GisSetting";
import { GisPointRenderer } from "./renderer/point/GisPointRenderer";
import img from './grid_circle.png'
import process from './worker?worker'
/**
 *
 * @export
 * @class Sample_GisPoints
 */
export class Sample_GisPoints {
    lightObj3D: Object3D;
    scene: Scene3D;
    view: View3D;
    positionBuffer: Float32Array;
    workers: Worker[] = [];
    _run = false;
    _done: number = 0;
    _count: number = 6;
    async run() {

        await Engine3D.init({ beforeRender: () => this.update() });

        this.scene = new Scene3D();
        this.scene.addComponent(Stats);
        let sky = this.scene.addComponent(AtmosphericComponent);
        let camera = CameraUtil.createCamera3DObject(this.scene);
        camera.perspective(60, Engine3D.aspect, 0.01, 5000.0);

        camera.object3D.addComponent(HoverCameraController).setCamera(0, 0, 100);

        this.view = new View3D();
        this.view.scene = this.scene;
        this.view.camera = camera;

        Engine3D.startRenderView(this.view);

        await this.initLight();
        await this.addPoints();

        this.scene.addChild(new AxisObject(10, 0.01));

        sky.relativeTransform = this.lightObj3D.transform;
    }

    async initLight() {
        /******** light *******/
        this.lightObj3D = new Object3D();
        this.lightObj3D.rotationX = 21;
        this.lightObj3D.rotationY = 108;
        this.lightObj3D.rotationZ = 10;
        let directLight = this.lightObj3D.addComponent(DirectLight);
        directLight.lightColor = KelvinUtil.color_temperature_to_rgb(5355);
        directLight.castShadow = false;
        directLight.intensity = 10;
        this.scene.addChild(this.lightObj3D);
    }

    random(value: number, base: number = 0) {
        value *= Math.random();
        value += base;
        return value;
    }

    private async addPoints() {
        let textureList = [];
        textureList.push( await Engine3D.res.loadTexture(img) );

        let obj = new Object3D();
        this.scene.addChild(obj);

        let renderer = obj.addComponent(GisPointRenderer, textureList);

        let attributes = renderer.attrGroup;
        let position = attributes.getAttribute('vPositionBuffer');
        this.positionBuffer = position.array
        
        for (let i = 0; i < GisSetting.maxQuadCount; i++) {
            attributes.setPosition(i, new Vector3(this.random(100, -50), this.random(100, -50), this.random(100, -50)));
            attributes.setColor(i, new Color(this.random(1), this.random(1), this.random(1), 1));
            attributes.setSize(i, this.random(1, 1));
        }

        // create mutltiple workers to update positions
        for(let i = 0; i < this._count; i++){
            let p = new process();
            p.postMessage({
                type:'init', 
                index: i, 
                total: this._count, 
                position: this.positionBuffer
            })
            p.onmessage = ()=>{
                this._done ++
                if(this._done === this._count){
                    this._done = 0
                    this._run = false
                    position.isDirty = true
                    console.timeEnd('process')
                }
            }
            this.workers.push(p)
        }
    }

    update() {
        // run workers
        if(!this._run && this.workers.length){
            this._run = true
            for(let i = 0; i < this.workers.length; i++){
                this.workers[i].postMessage('run')
            }
            console.time('process')
        }
    }

}


