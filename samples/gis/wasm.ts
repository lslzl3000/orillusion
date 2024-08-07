// by assemblyscript
// initialized 5 Float32Array (position, angle, radius, speed, sincosTable) on wasm memory
// operate memory with bytes offset
// build: asc wasm.ts --optimize --importMemory -o wasm.wasm

// temp value
let angle: f32 = 0.0;
let radius : f32 = 0.0;
let speed : f32 = 0.0;
let sin: f32 = 0.0;
let cos: f32 = 0.0;
// offset
let pOffset: u32 = 0;
let aOffset: u32 = 0;
let rOffset: u32 = 0;
let sOffset: u32 = 0;

let angleIndex: u32 = 0;
let TABLE_SIZE: f32 = 10000;
let PI2: f32 = Mathf.PI * 2.0;
let PI2_INV: f32 = 1.0 / PI2;
export function process(count:u32, p:u32, a:u32, r:u32, s:u32, t:u32) : void {
    // directly load/store Float32Array from memory
    for( let i: u32 = 0; i < count; i++ ){
        aOffset = a + i;
        rOffset = r + i;
        sOffset = s + i;

        angle = load<f32>(aOffset << 2);
        radius = load<f32>(rOffset << 2);
        speed = load<f32>(sOffset << 2);

        angle += speed;
        if(angle > PI2){
            angle = 0.0;
        }
        
        // find approximate sin/cos from table
        angleIndex = <u32>(angle * PI2_INV * TABLE_SIZE) * 2;

        sin = load<f32>((t + angleIndex) << 2);
        cos = load<f32>((t + angleIndex + 1) << 2);

        pOffset = p + i * 4;
        store<f32>(pOffset << 2, sin * radius); // update position x
        store<f32>((pOffset + 2) << 2, cos * radius); // update position z
        store<f32>(aOffset << 2, angle) // update angle
    }
}