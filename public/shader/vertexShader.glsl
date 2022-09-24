precision mediump float;
attribute vec3 position;
attribute vec3 color;

attribute vec2 uv;
varying vec2 vUV;

varying vec3 vColor;
uniform mat4 matrix;
void main() {
    vUV = uv;
    vColor = color;
    gl_Position = matrix * vec4(position, 1);
}