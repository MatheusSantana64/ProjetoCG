precision mediump float;
varying vec3 vColor;
varying vec3 v_normal;
varying vec3 v_surfaceToLight;


varying vec2 vUV;
uniform sampler2D textureID;
uniform bool uUseTexture;
uniform bool uIsSourceOfLight;
uniform float u_ambientLight;

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

    vec3 normal = normalize(v_normal);
    vec3 surfaceToLightDirection = normalize(v_surfaceToLight);
    float light = max(dot(normal, surfaceToLightDirection), u_ambientLight);
    
    if(!uIsSourceOfLight){
        gl_FragColor.rgb *= light;
    }

}