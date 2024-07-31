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
    positionArray: Float32Array;
    workers: Worker[] = [];

    _run = false;
    _done: number = 0;
    _thread: number = navigator.hardwareConcurrency - 1;
    async run() {

        await Engine3D.init({ beforeRender: () => this.update() });

        this.scene = new Scene3D();
        this.scene.addComponent(Stats);
        let sky = this.scene.addComponent(AtmosphericComponent);
        let camera = CameraUtil.createCamera3DObject(this.scene);
        camera.perspective(60, Engine3D.aspect, 0.01, 5000.0);

        camera.object3D.addComponent(HoverCameraController).setCamera(0, -30, 400);

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
        GisSetting.maxQuadCount = 1000000;

        let textureList = [];
        textureList.push( await Engine3D.res.loadTexture(img) );

        let obj = new Object3D();
        this.scene.addChild(obj);

        let renderer = obj.addComponent(GisPointRenderer, textureList);

        let attributes = renderer.attrGroup;
        let position = attributes.getAttribute('vPositionBuffer');
        this.positionArray = position.array
        
        let raduiBuffer = new SharedArrayBuffer(GisSetting.maxQuadCount * 4)
        let angleBuffer = new SharedArrayBuffer(GisSetting.maxQuadCount * 4)
        let speedBuffer = new SharedArrayBuffer(GisSetting.maxQuadCount * 4)

        let radiuArray = new Float32Array(raduiBuffer)
        let angleArray = new Float32Array(angleBuffer)
        let speedArray = new Float32Array(speedBuffer)

        for (let i = 0; i < GisSetting.maxQuadCount; i++) {
            let r = radiuArray[i] = this.normalDistribution(300, 60);
            let a = angleArray[i] = this.random(Math.PI * 2, 0);
            speedArray[i] = this.random(0.01, 0.001)
            attributes.setPosition(i, new Vector3(Math.sin(a) * r, this.normalDistribution(0, 30), Math.cos(a) * r));
            attributes.setColor(i, new Color(this.random(1), this.random(1), this.random(1), 1));
            attributes.setSize(i, this.random(5, 1));
        }

        // create mutltiple workers to update positions
        for(let i = 0; i < this._thread; i++){
            let p = new process();
            p.postMessage({
                type:'init', 
                index: i, 
                total: this._thread, 
                position: this.positionArray,
                radius: radiuArray, 
                angles: angleArray,
                speeds: speedArray
            })
            p.onmessage = ()=>{
                this._done ++
                if(this._done === this._thread){
                    this._done = 0
                    this._run = false
                    position.isDirty = true
                    console.timeEnd('update')
                }
            }
            this.workers.push(p)
        }
    }

    update() {
        // run workers
        if(this.workers.length && !this._run){
            this._run = true
            for(let i = 0; i < this.workers.length; i++){
                this.workers[i].postMessage('run')
            }
            console.time('update')
        }
    }

    normalDistribution(mean:number, std_dev:number){
        return mean + (this.randomNormalDistribution() * std_dev)
    }
    randomNormalDistribution(){
        let u=0.0, v=0.0, w=0.0, c=0.0
        do{
            u=Math.random()*2-1.0
            v=Math.random()*2-1.0
            w=u*u+v*v
        }while(w==0.0||w>=1.0)
        c=Math.sqrt((-2*Math.log(w))/w)
        return u*c
    }
}

