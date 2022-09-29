precision mediump float;
varying vec3 vColor;
varying vec3 v_normal;
varying vec3 v_surfaceToLight;
varying vec3 v_surfaceToView;

varying vec2 vUV;
uniform sampler2D textureID;
uniform bool uUseTexture;
uniform bool uIsSourceOfLight;
uniform float u_ambientLight;
uniform float u_shininess;
uniform float u_specularIntensity;

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
    vec3 surfaceToViewDirection = normalize(v_surfaceToView);
    vec3 halfVector = normalize(surfaceToLightDirection + surfaceToViewDirection);

    float light = max(dot(normal, surfaceToLightDirection), u_ambientLight);
    float specular = 0.0;
    if (light > 0.0) {
        specular = pow(dot(normal, halfVector), u_shininess);
    }

    if(!uIsSourceOfLight){
        gl_FragColor.rgb *= light;

        gl_FragColor.rgb += specular * u_specularIntensity;
    }

}