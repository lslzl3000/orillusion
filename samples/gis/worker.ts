let position: Float32Array;
let radius: Float32Array;
let angles: Float32Array;
let speeds: Float32Array;
let sincos: Float32Array;

let offset = 0;
let length = 0;

const CONUT = 1000000;
const PI = Math.PI;
const PI2 = PI * 2;
const PI_H = PI / 2;
const PI_Q = PI / 2 * 3;
const SIN = Math.sin;

onmessage = e => {
    if(e.data.type == 'init'){
        let INDEX = e.data.INDEX;
        let THREADS = e.data.THREADS;

        position = e.data.position;
        radius = e.data.radius;
        angles = e.data.angles;
        speeds = e.data.speeds;
        sincos = e.data.sincos;
        length = Math.ceil(CONUT / THREADS);
        offset = length * INDEX;
    }else{
        for(let i = offset, l = Math.min(offset + length, CONUT); i < l; ++i ){
            let a = angles[i] += speeds[i]
            if(a > PI2)
                a = angles[i] = 0
            let r = radius[i]
            let x = SIN(a) * r
            let y = (r*r - x*x)**0.5 
            if (a > PI_H && a < PI_Q)
                y = -y
            position[i * 4] = x
            position[i * 4 + 2] = y
        }
        postMessage(0)
    }
}

export {}