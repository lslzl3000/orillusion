import { AtmosphericComponent, AxisObject, BitmapTexture2D, CameraUtil, Color, DEGREES_TO_RADIANS, DirectLight, Engine3D, HoverCameraController, KelvinUtil, Object3D, Scene3D, Vector3, Vector4, View3D, } from "@orillusion/core";
import { Stats } from "@orillusion/stats";
import { GisAttribute, LineType } from "./renderer/GisAttributeData";
import { GisLineRenderer } from "./renderer/line/GisLineRenderer";
import { GUIUtil } from "@samples/utils/GUIUtil";
import { GUIHelp } from "@orillusion/debug/GUIHelp";

const COUNT = 1000000;
const COLOR_COUNT = 128;
const PI2 = Math.PI * 2;
const PI_H = Math.PI / 2;
const PI_Q = Math.PI / 2 * 3;
const SIN = Math.sin;

export class Sample_GisLine {
    lightObj3D: Object3D;
    scene: Scene3D;
    view: View3D;

    loop: HTMLElement;
    async run() {

        await Engine3D.init({ beforeRender: this.update.bind(this) });

        this.scene = new Scene3D();
        this.scene.addComponent(Stats);
        let sky = this.scene.addComponent(AtmosphericComponent);
        let camera = CameraUtil.createCamera3DObject(this.scene);
        camera.perspective(60, Engine3D.aspect, 0.1, 10000.0);

        camera.object3D.addComponent(HoverCameraController).setCamera(0, -30, 2000);

        this.view = new View3D();
        this.view.scene = this.scene;
        this.view.camera = camera;

        Engine3D.startRenderView(this.view);

        GUIHelp.init();
        this.initLight();
        let line = await this.addSegments();
        line.lineMaterial.vSpeed = -0.002;
        line.lineMaterial.vScale = 0.02;
        line.lineMaterial.lineWidth = 4;
        GUIHelp.add(line.lineMaterial, 'uSpeed', -0.1, 0.1, 0.0001);
        GUIHelp.add(line.lineMaterial, 'uScale', -2, 2, 0.0001);
        GUIHelp.add(line.lineMaterial, 'vSpeed', -0.1, 0.1, 0.0001);
        GUIHelp.add(line.lineMaterial, 'vScale', -2, 2, 0.0001);
        GUIHelp.add(line.lineMaterial, 'lineWidth', 1, 10, 0.01);
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

    private async addSegments() {
        // create a object to hold line
        let obj = new Object3D();
        GUIUtil.renderTransform(obj.transform);
        this.scene.addChild(obj);
        // add GisLineRenderer with textures and count
        let line = obj.addComponent(GisLineRenderer, {
            textures: [await Engine3D.res.loadTexture('/textures/arrow.png', null, true)],
            // textures: [await Engine3D.res.loadTexture('/textures/grid_circle.png', null, true)],
            count: COUNT
        });

        let attributes = line.attributes;
        //color
        for (let i = 0; i < COLOR_COUNT; i++) {
            attributes.setColor(i, Color.randomRGB(0.9, 0.9, 0.9, 0.2, 0.2, 0.2));
        }

        // prepare data
        for (let i = 0; i < COUNT; i++) {
            // you can also use inner APIs to set buffers, but it is relatively slower for a large amount data
            let [from, to] = this.nextSegment();
            attributes.setPosition(i, from, to);
            attributes.setColorIndex(i, i % COLOR_COUNT, (i + 1) % COLOR_COUNT);
            attributes.setLineWidth(i, 2 * (1 + Math.sin(i * 0.5) * 0.9));
            attributes.setLineType(i, LineType.DASH);
        }
        return line;
    }


    update() {

    }

    overallLength = 0;
    height = -Math.sqrt(COUNT) * 3.14;
    angle = 0;
    radius = 1000;
    lastEnd: Vector4;
    width = 1;

    nextSegment(): [Vector4, Vector4] {
        let emptyRatio = 0.2;

        let radius = this.radius + Math.sin(this.height * 0.01) * 200;
        //________from point
        this.angle += emptyRatio * DEGREES_TO_RADIANS;
        let from = new Vector4(Math.sin(this.angle) * radius, this.height, Math.cos(this.angle) * radius);

        if (this.lastEnd) {
            this.overallLength += Vector3.distance(from as any, this.lastEnd as any);
        }
        from.w = this.overallLength;

        //_______to point
        this.angle += this.random(1, 0.5) * DEGREES_TO_RADIANS;
        this.height += 0.02;

        let to = new Vector4(Math.sin(this.angle) * radius, this.height, Math.cos(this.angle) * radius);
        to.w = this.overallLength = this.overallLength + Vector3.distance(from as any, to as any);

        //______return
        this.lastEnd = to;
        return [from, to];
    }

    random(value: number, base: number = 0) {
        value *= Math.random();
        value += base;
        return value;
    }

    randomNormalDistribution() {
        let u = 0.0, v = 0.0, w = 0.0, c = 0.0
        do {
            u = Math.random() * 2 - 1.0
            v = Math.random() * 2 - 1.0
            w = u * u + v * v
        } while (w == 0.0 || w >= 1.0)
        c = Math.sqrt((-2 * Math.log(w)) / w)
        return u * c
    }
}

