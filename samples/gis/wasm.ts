// by assemblyscript
// initialized 5 Float32Array (position, angle, radius, speed, sincosTable) on wasm memory
// operate memory with bytes offset
// build: asc wasm.ts --optimize --importMemory -o wasm.wasm

const TABLE_SIZE: f32 = 10000;
const PI2: f32 = Mathf.PI * 2.0;
const PI2_INV: f32 = 1.0 / PI2;
export function process(count:u32, a:u32, r:u32, s:u32, t:u32) : void {
    // directly load/store Float32Array from memory
    for( let i: u32 = 0; i < count; i++ ){
        // update angel
        let aOffset = a + i;
        let angle = load<f32>(aOffset << 2);
        let speed = load<f32>((s + i) << 2);
        angle += speed;
        if(angle > PI2){
            angle = 0.0;
        }
        store<f32>(aOffset << 2, angle) // save angle

        // find approximate sin/cos from table
        let angleIndex = <u32>(angle * PI2_INV * TABLE_SIZE) * 2;
        let sin = load<f32>((t + angleIndex) << 2);
        let cos = load<f32>((t + angleIndex + 1) << 2);
        let radius = load<f32>((r + i) << 2);

        let pOffset = i * 4;
        store<f32>(pOffset << 2, sin * radius); // save position x
        store<f32>((pOffset + 2) << 2, cos * radius); // save position z
    }
}