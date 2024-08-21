import { FragmentOutput, WorldMatrixUniform, GlobalUniform } from "@orillusion/core";

export class GisLineShader {
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
            fragmentOutput.color = vec4<f32>(rgb, alpha);
            return fragmentOutput ;
        }`;

    private static readonly vs_code: string = /* wgsl */ `
        ${WorldMatrixUniform}
        ${GlobalUniform}
                
        struct MaterialUniform{
            uScale:f32,
            uSpeed:f32,
            vScale:f32,
            vSpeed:f32,
            lineWidth:f32,
            fixSize:f32,
            isTextureUp:f32,
        }
        
        struct VertexOutput {
            @location(auto) vUV: vec2<f32>,
            @location(auto) vColor4: vec4<f32>,
            @location(auto) vTextureID: f32,
            
            @builtin(position) member: vec4<f32>
        };

        struct LineSegmentData{
           startPoint: vec4<f32>,
           endPoint: vec4<f32>
        }
        
         struct VertexInput{
            @builtin(instance_index) index : u32,
            @location(auto) vIndex: f32,
        }

        @group(2) @binding(auto)
        var<uniform> materialUniform : MaterialUniform;

        @group(3) @binding(auto)
        var<storage, read> vPositionBuffer: array<LineSegmentData>;
        @group(3) @binding(auto)
        var<storage, read> vColorBuffer: array<vec4<f32>>;
        @group(3) @binding(auto)
        var<storage, read> vColorIndex: array<vec2<f32>>;
        @group(3) @binding(auto)
        var<storage, read> vTexIndex: array<f32>;
        @group(3) @binding(auto)
        var<storage, read> vLineWidth: array<f32>;
        @group(3) @binding(auto)
        var<storage, read> vLineType: array<f32>;

        var<private> vertexOut: VertexOutput ;

        //quad: (left, bottom, right, top)
        //index: 0 1
        //index: 2 3

        fn getVertexPosition_dash(index:u32, segmentIndex:u32) -> vec3<f32>
        {
            let halfWidth = materialUniform.lineWidth * vLineWidth[segmentIndex] * 0.5;
            let segmentPosData = vPositionBuffer[segmentIndex];
            let startPoint = segmentPosData.startPoint.xyz;
            let endPoint = segmentPosData.endPoint.xyz;
            let cameraPos = globalUniform.CameraPos.xyz;

            let forward = normalize(endPoint.xyz - startPoint.xyz);
            let centerPoint = (startPoint + endPoint).xyz * 0.5;
            let right = normalize(cross(normalize(centerPoint - cameraPos), forward));

            var ret = vec3<f32>(0.0);
            if(index == 0u){
                ret = startPoint - right * halfWidth;
            }else if(index == 1u){
                ret = endPoint - right * halfWidth;
            }else if(index == 2u){
                ret = startPoint + right * halfWidth;
            }else{
                ret = endPoint + right * halfWidth;
            }
            return ret;
        }

        fn getVertexPosition_solid(index:u32, segmentIndex:u32) -> vec3<f32>
        {
            let halfWidth = materialUniform.lineWidth * vLineWidth[segmentIndex] * 0.5;
            let segmentPosData = vPositionBuffer[segmentIndex];
            let startPoint = segmentPosData.startPoint.xyz;
            let endPoint = segmentPosData.endPoint.xyz;
            let cameraPos = globalUniform.CameraPos.xyz;

            let forward = normalize(endPoint.xyz - startPoint.xyz);
            let centerPoint = (startPoint + endPoint).xyz * 0.5;
            let right = normalize(cross(normalize(centerPoint - cameraPos), forward));

            var ret = vec3<f32>(0.0);
            if(index == 0u){
                ret = startPoint - right * halfWidth;
            }else if(index == 1u){
                ret = endPoint - right * halfWidth;
            }else if(index == 2u){
                ret = startPoint + right * halfWidth;
            }else{
                ret = endPoint + right * halfWidth;
            }
            return ret;
        }

        fn getVertexUV(index:u32, segmentIndex:u32) -> vec2<f32>
        {
            let segmentPosData = vPositionBuffer[segmentIndex];

            //v
            var fromV = segmentPosData.startPoint.w * materialUniform.vScale;
            let vOffset = fromV - fromV % 256.0;//压缩uv数据，数据过大，插值后会导致精度损失
            fromV -= vOffset;
            
            var endV = segmentPosData.endPoint.w * materialUniform.vScale;
            endV -= vOffset;
            
            let vMoveOffset = globalUniform.time * materialUniform.vSpeed;
            endV += vMoveOffset;
            fromV += vMoveOffset;

            //u
            let uScale = materialUniform.uScale;
            let uMoveOffset =  globalUniform.time * materialUniform.uSpeed;

            var ret = vec2<f32>(0.0);
            if(index == 0){
                ret = vec2<f32>(uMoveOffset, fromV);
            }else if(index == 1){
                ret = vec2<f32>(uMoveOffset, endV);
            }else if(index == 2){
                ret = vec2<f32>(uScale + uMoveOffset, fromV);
            }else{
                ret = vec2<f32>(uScale + uMoveOffset, endV);
            }
            return ret;
        }

        fn getVertexColor(index:u32, segmentIndex:u32) -> vec4<f32>{
            let colorStartEnd = vColorIndex[segmentIndex];

            let startColor = vColorBuffer[u32(colorStartEnd.x)];
            let endColor = vColorBuffer[u32(colorStartEnd.y)];

            var ret = vec4<f32>(0.0);
            var colorIndex = 0u;
            if(index == 0 || index == 2){
                colorIndex = u32(colorStartEnd.x);
            }else{
                colorIndex = u32(colorStartEnd.y);
            }
           return vColorBuffer[colorIndex];

        }
    `;

    public static readonly GisLineShader: string = /* wgsl */ `
        
        ${this.vs_code}
        @vertex
        fn VertMain( vertex:VertexInput ) -> VertexOutput {
            var modelMatrix = models.matrix[vertex.index];
            
            let index4u = u32(vertex.vIndex) % 4u;
            let segmentIndex = u32(vertex.vIndex * 0.25);
            let lineType = u32(vLineType[segmentIndex]);

            let localColor = getVertexColor(index4u, segmentIndex);

            var localPosition: vec3<f32>;
            if(lineType == 0u || segmentIndex == 0u){
                localPosition = getVertexPosition_dash(index4u, segmentIndex);
            }else if(lineType == 1u){
                localPosition = getVertexPosition_solid(index4u, segmentIndex);
            }

            var localUV = getVertexUV(index4u, segmentIndex);
            if(materialUniform.isTextureUp < 0.5){
                vertexOut.vUV = localUV.yx;
            }else{
                vertexOut.vUV = localUV;
            }

            let mvp = globalUniform.projMat * globalUniform.viewMat * modelMatrix;
            var op = mvp * vec4<f32>(localPosition.xyz, 1.0);
            vertexOut.member = op;
            
            vertexOut.vTextureID = vTexIndex[segmentIndex];
            vertexOut.vColor4 = localColor;
    
            return vertexOut;
        }
         
         ${this.fs}

        `;
}
