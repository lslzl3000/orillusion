import { AtmosphericComponent, AxisObject, BitmapTexture2D, CameraUtil, Color, DirectLight, Engine3D, HoverCameraController, KelvinUtil, Object3D, Scene3D, Vector3, View3D, } from "@orillusion/core";
import { Stats } from "@orillusion/stats";
import { GisPointRenderer } from "./renderer/point/GisPointRenderer";
import { GisAttribute } from "./renderer/GisAttributeData";

const COUNT = 1000000;
const PI2 = Math.PI * 2;
const PI_H = Math.PI / 2;
const PI_Q = Math.PI / 2 * 3;
const SIN = Math.sin;

export class Sample_GisPoints {
    lightObj3D: Object3D;
    scene: Scene3D;
    view: View3D;

    position: GisAttribute;
    positionArray: Float32Array;
    angleArray: Float32Array;
    radiuArray: Float32Array;
    speedArray: Float32Array;

    loop: HTMLElement;
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

        // tips
        this.loop = document.createElement('h3')
        this.loop.setAttribute('style', 'position:fixed;right:10px;color:red;text-align:right')
        document.body.appendChild(this.loop)
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
        // create a object to hold points
        let obj = new Object3D();
        this.scene.addChild(obj);
        // add GisPointRenderer with textures and count
        let points = obj.addComponent(GisPointRenderer, {
            textures: [await Engine3D.res.loadTexture('/particle/dust_min.png')],
            count: COUNT
        });
        let position = this.position = points.attributes.position;
        let color = points.attributes.color;
        let size = points.attributes.size;

        this.positionArray = position.data;
        this.angleArray = new Float32Array(COUNT)
        this.radiuArray = new Float32Array(COUNT)
        this.speedArray = new Float32Array(COUNT)

        // prepare data
        for (let i = 0; i < COUNT; i++) {
            let a = this.angleArray[i] = this.random(Math.PI * 2, 0);
            let r = this.radiuArray[i] = this.normalDistribution(300, 60);
            this.speedArray[i] = this.random(0.005, 0.001)
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
    }

    update() {
        if(this.position){
            let t = performance.now()
            for(let i = 0, l = COUNT; i < l; ++i ){
                let a = this.angleArray[i] += this.speedArray[i]
                if(a > PI2)
                    a = this.angleArray[i] = 0
                let r = this.radiuArray[i]
                let x = SIN(a) * r
                let y = (r*r - x*x)**0.5 
                if (a > PI_H && a < PI_Q)
                    y = -y
                this.positionArray[i * 4] = x
                this.positionArray[i * 4 + 2] = y
            }
            this.position.isDirty = true
            this.loop.innerHTML = `Update ${COUNT} points<br>Loop in ${(performance.now() - t).toFixed(2)} ms`;
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

