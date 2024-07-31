let index = 0;
let total = 0;
let position: Float32Array;
let radius: Float32Array;
let angles: Float32Array;
let speeds: Float32Array;

let offset = 0;
let length = 0;
let TABLE_SIZE = 0;

let sincosTable: Float32Array;

onmessage = e => {
    if(e.data.type == 'init'){
        index = e.data.index;
        total = e.data.total;
        radius = e.data.radius;
        angles = e.data.angles;
        speeds = e.data.speeds;
        position = e.data.position;
        sincosTable = e.data.sincosTable;
        TABLE_SIZE = sincosTable.length / 2;

        length = Math.ceil(radius.length / total);
        offset = length * index;
    }else{
        for(let i = offset, l = offset + length; i < l; ++i ){
            let a = angles[i] = angles[i] > PI2 ? 0 : angles[i] + speeds[i]
            let r = radius[i]
            
            let aindex = findAngleIndex(a) * 2
            position[i * 4] = sincosTable[aindex] * r
            position[i * 4 + 2] = sincosTable[aindex + 1] * r
        }
        postMessage('done')
    }
}

const PI2 = Math.PI * 2;
const PI2_INV = 1 / PI2;
function findAngleIndex(x:number){
    return ~~(x * PI2_INV * TABLE_SIZE)
}

export {}