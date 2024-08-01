import { AtmosphericComponent, AxisObject, BitmapTexture2D, CameraUtil, Color, DirectLight, Engine3D, HoverCameraController, KelvinUtil, Object3D, Scene3D, Vector3, View3D, } from "@orillusion/core";
import { Stats } from "@orillusion/stats";
import { GisPointRenderer } from "./renderer/point/GisPointRenderer";
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
    workers: Worker[] = [];

    _run = false;
    _res:any = null;
    _done: number = 0;
    _thread: number = navigator.hardwareConcurrency - 2;
    async run() {

        await Engine3D.init({ beforeRender: this.update.bind(this) });

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

        this.initLight();
        await this.addPoints();

        this.scene.addChild(new AxisObject(10, 0.01));

        sky.relativeTransform = this.lightObj3D.transform;
    }

    initLight() {
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

    private async addPoints() {
        let maxCount = 1000000
        let raduiBuffer = new SharedArrayBuffer(maxCount * 4)
        let angleBuffer = new SharedArrayBuffer(maxCount * 4)
        let speedBuffer = new SharedArrayBuffer(maxCount * 4)

        let radiuArray = new Float32Array(raduiBuffer)
        let angleArray = new Float32Array(angleBuffer)
        let speedArray = new Float32Array(speedBuffer)

        // create a sin/cos value table to speed up sin/cos calculation
        const TABLE_SIZE = 10000;
        let sincosBuffer = new SharedArrayBuffer(TABLE_SIZE * 2 * 4)
        let sincosTable = new Float32Array(sincosBuffer);
        for (let i = 0; i < TABLE_SIZE * 2; i+=2) {
            const a = (i / 2 / TABLE_SIZE) * Math.PI * 2
            sincosTable[i] = Math.sin(a);
            sincosTable[i+1] = Math.cos(a);
        }


        // create a object to hold points
        let obj = new Object3D();
        this.scene.addChild(obj);
        // add GisPointRenderer with textures and count
        let points = obj.addComponent(GisPointRenderer, {
            textures: [await Engine3D.res.loadTexture('/particle/dust_min.png')],
            count: maxCount
        });
        let position = points.attributes.position;
        let color = points.attributes.color;
        let size = points.attributes.size;

        // prepare data
        for (let i = 0; i < maxCount; i++) {
            let r = radiuArray[i] = this.normalDistribution(300, 60);
            let a = angleArray[i] = this.random(Math.PI * 2, 0);
            speedArray[i] = this.random(0.005, 0.001)
            // set position
            let offset = i * 4
            position.data[offset] = Math.sin(a) * r
            position.data[offset+1] = this.normalDistribution(0, 30)
            position.data[offset+2] = Math.cos(a) * r
            // set color
            color.data[offset] = this.random(1)
            color.data[offset+1] = this.random(1)
            color.data[offset+2] = this.random(1)
            // set size
            size.data[i] = this.random(5, 1)
            // update buffer
            position.isDirty = color.isDirty = size.isDirty = true
            
            // you can also use inner APIs to set buffers, but it is relatively slower for a large amount data
            // attributes.setPosition(i, new Vector3(x,y,z))
            // attributes.setColor(i, new Color(r,g,b,a))
            // attributes.setSize(i, this.random(5, 1))
        }

        // create mutltiple workers to update positions
        for(let i = 0; i < this._thread; i++){
            let p = new process();
            p.postMessage({
                type:'init', 
                index: i, 
                total: this._thread, 
                position: position.data,
                radius: radiuArray, 
                angles: angleArray,
                speeds: speedArray,
                sincosTable
            })
            p.onmessage = ()=>{
                this._done ++
                if(this._done === this._thread){
                    this._done = 0
                    position.isDirty = true
                    this._res(true)
                    console.timeEnd('update')
                }
            }
            this.workers.push(p)
        }
    }

    async update() {
        // run workers
        if(this.workers.length){
            await new Promise(res=>{
                this._res = res
                for(let i = 0; i < this._thread; i++){
                    this.workers[i].postMessage('run')
                }
                console.time('update')
            })
        }
    }

    random(value: number, base: number = 0) {
        value *= Math.random();
        value += base;
        return value;
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

