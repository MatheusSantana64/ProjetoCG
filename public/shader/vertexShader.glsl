precision mediump float;
attribute vec3 position;
attribute vec3 color;
attribute vec3 a_normal;

attribute vec2 uv;
varying vec2 vUV;
varying vec3 v_normal;

varying vec3 vColor;

uniform vec3 u_lightWorldPosition;
uniform vec3 u_viewWorldPosition;
 
uniform mat4 u_world;
uniform mat4 u_worldViewProjection;
uniform mat4 u_worldInverseTranspose;


varying vec3 v_surfaceToLight;
varying vec3 v_surfaceToView;

void main() {
    gl_Position = u_worldViewProjection * vec4(position, 1);

    v_normal = mat3(u_worldInverseTranspose) * a_normal;

    vUV = uv;
    vColor = color;

    vec3 surfaceWorldPosition = (u_world * vec4(position, 1)).xyz;


    v_surfaceToLight = u_lightWorldPosition - surfaceWorldPosition;

    v_surfaceToView = u_viewWorldPosition - surfaceWorldPosition;

}