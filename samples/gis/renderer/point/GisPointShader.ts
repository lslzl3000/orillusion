import { FragmentOutput, WorldMatrixUniform, GlobalUniform } from "../../../../src";

export class GisPointShader {
    private static readonly fs: string = /* wgsl */ `
        ${FragmentOutput}
        @group(1) @binding(auto)
        var baseMapSampler: sampler;
        @group(1) @binding(auto)
        var baseMap: texture_2d_array<f32>;

        var<private> fragmentOutput: FragmentOutput;
        var<private> EPSILON: f32 = 0.001;

        @fragment
        fn FragMain( 
            @location(auto) vUV: vec2<f32>,
            @location(auto) vColor4: vec4<f32>,
            @location(auto) vTextureID: f32,
            @builtin(front_facing) face: bool,
            @builtin(position) fragCoord : vec4<f32> 
        ) -> FragmentOutput {

            var uv:vec2<f32> = vUV;
            // uv = uv * vUvRec.zw + vUvRec.xy;
            var color = textureSample(baseMap, baseMapSampler, uv, u32(round(vTextureID)));

            var rgb = color.rgb;
            var alpha = color.a;

            rgb *= vColor4.rgb;
            alpha *= vColor4.a;
            if(alpha < 0.8)
            { 
                discard;
            }

            fragmentOutput.color = vec4<f32>(rgb, alpha);
            return fragmentOutput ;
        }`;

    private static readonly vs_code: string = /* wgsl */ `
        ${WorldMatrixUniform}
        ${GlobalUniform}
                
        struct MaterialUniform{
            cameraLeft:vec3<f32>,
            screenSize:vec2<f32>,
        }
        
        struct VertexOutput {
            @location(auto) vUV: vec2<f32>,
            @location(auto) vColor4: vec4<f32>,
            @location(auto) vTextureID: f32,
            
            @builtin(position) member: vec4<f32>
        };
        
         struct VertexInput{
            @builtin(instance_index) index : u32,
            @location(auto) uv: vec2<f32>,
            @location(auto) vIndex: f32,
        }

        @group(2) @binding(auto)
        var<uniform> materialUniform : MaterialUniform;

        @group(3) @binding(auto)
        var<storage, read> vPositionBuffer: array<vec4<f32>>;
        @group(3) @binding(auto)
        var<storage, read> vColorBuffer: array<vec4<f32>>;
        @group(3) @binding(auto)
        var<storage, read> vTexIndex: array<f32>;
        @group(3) @binding(auto)
        var<storage, read> vSizeBuffer: array<f32>;

        var<private> vertexOut: VertexOutput ;

        //quad: (left, bottom, right, top)
        //index: 0 1
        //index: 2 3

        fn getVertexXY(index:u32) -> vec2<f32>
        {
            var ret = vec2<f32>(0.0);
            if(index == 0 || index == 1){
                ret.y = 0.5f;
            }else{
                ret.y = -0.5f;
            }
            if(index == 0 || index == 2){
                ret.x = -0.5f;
            }else{
                ret.x = 0.5f;
            }
            return ret;
        }
    `;

    public static readonly GisPointShader: string = /* wgsl */ `

        fn calcBillboardY(offsetPos: vec3f, cameraLeft: vec3f) -> mat3x3<f32> {
            let eyePos = globalUniform.cameraWorldMatrix[3].xyz;
            let zAxis = normalize(eyePos - offsetPos.xyz);
            var xAxis = cross(cameraLeft, zAxis);
            xAxis = normalize(cross(zAxis, xAxis));
            let yAxis = normalize(cross(zAxis, xAxis));
            return mat3x3<f32>(xAxis, yAxis, zAxis);
        }

        
        ${this.vs_code}
        @vertex
        fn VertMain( vertex:VertexInput ) -> VertexOutput {
            var modelMatrix = models.matrix[vertex.index];
            
            let vertexIndex = vertex.vIndex;
            let quadIndex = u32(vertex.vIndex * 0.25);

            var localPosXY = getVertexXY(u32(vertexIndex) % 4u);
            localPosXY *= vSizeBuffer[quadIndex];

            var localPos = vec4<f32>(localPosXY.xy, vertexIndex * 0.0000001, 1.0);
            var op = vec4<f32>(0.0001);

            let isValidVertex = true;// vSpriteData.vVisible > 0.5;
            if(isValidVertex){
                var particlePos = vPositionBuffer[quadIndex];
                var worldMatrix = modelMatrix;
                var wPosition = localPos.xyz;

                var v_mat3 = calcBillboardY(particlePos.xyz, materialUniform.cameraLeft.xyz);
                wPosition = v_mat3 * wPosition;
        
                wPosition.x += particlePos.x;
                wPosition.y += particlePos.y;
                wPosition.z += particlePos.z;

                var worldPos = (worldMatrix * vec4<f32>(wPosition.xyz, 1.0));
                var viewPosition = ((globalUniform.viewMat) * worldPos);


                op = globalUniform.projMat * viewPosition;
            }

            vertexOut.member = op;
            
            vertexOut.vUV = vec2<f32>(vertex.uv);
            vertexOut.vTextureID = vTexIndex[quadIndex];
            vertexOut.vColor4 = vColorBuffer[quadIndex];

            return vertexOut;
         }
         
         ${this.fs}

        `;
}
