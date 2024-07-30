let index = 0;
let total = 0;
let position: Float32Array;

let offset = 0;
let length = 0;

onmessage = e => {
    if(e.data.type == 'init'){
        index = e.data.index;
        total = e.data.total;
        position = e.data.position;

        length = Math.ceil(position.length / total);
        offset = length * index;
        console.log(index, offset, length)
    }else{
        let t = performance.now() / 1000
        for(let i = offset; i < offset + length; i+=4 ){
            let r = Math.sin( i + t)
            position[i] += r
            position[i+1] += r
            position[i+2] += r
        }
        postMessage('done')
    }
}

export {}