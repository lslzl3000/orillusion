let index = 0;
let total = 0;
let position: Float32Array;
let radius: Float32Array;
let angles: Float32Array;
let speeds: Float32Array;

let offset = 0;
let length = 0;

onmessage = e => {
    if(e.data.type == 'init'){
        index = e.data.index;
        total = e.data.total;
        radius = e.data.radius;
        angles = e.data.angles;
        speeds = e.data.speeds;
        position = e.data.position;

        length = Math.ceil(radius.length / total);
        offset = length * index;
    }else{
        for(let i = offset, l = offset + length; i < l; ++i ){
            let a = angles[i] = angles[i] > PI2 ? 0 : angles[i] + speeds[i]
            let r = radius[i]
            
            position[i * 4] = fastSin(a) * r
            position[i * 4 + 2] = fastCos(a) * r
        }
        postMessage('done')
    }
}

const PI2 = Math.PI * 2;
const PI2_INV = 1 / PI2;
const TABLE_SIZE = 2048;
const sinTable = new Float32Array(TABLE_SIZE);
const cosTable = new Float32Array(TABLE_SIZE);

for (let i = 0; i < TABLE_SIZE; i++) {
    const a = (i / TABLE_SIZE) * PI2
    sinTable[i] = Math.sin(a);
    cosTable[i] = Math.cos(a);
}

function angleIndex(x:number){
    return ~~(x * PI2_INV * TABLE_SIZE)
}
function fastSin(x:number) {
    return sinTable[angleIndex(x)];
}

function fastCos(x:number) {
    return cosTable[angleIndex(x)];
}

export {}