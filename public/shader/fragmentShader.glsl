precision mediump float;
varying vec3 vColor;

varying vec2 vUV;
uniform sampler2D textureID;
uniform bool uUseTexture;

void main() {
    vec4 textureColor = texture2D(textureID, vec2(vUV.s, vUV.t));
    vec4 texColor = vec4(textureColor.rgb, textureColor.a);
    vec4 vertexColor = vec4(vColor, 1); 
    if (!uUseTexture){
        gl_FragColor = vertexColor;
    }
    else{
        gl_FragColor = texColor; 
    }
}