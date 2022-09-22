const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl');

if (!gl) {
    throw new Error('WebGL not supported');
}



const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, `
precision mediump float;
attribute vec3 position;
attribute vec3 color;
varying vec3 vColor;
uniform mat4 matrix;
void main() {
    vColor = color;
    gl_Position = matrix * vec4(position, 1);
}
`);
gl.compileShader(vertexShader);

const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, `
precision mediump float;
varying vec3 vColor;
void main() {
    gl_FragColor = vec4(vColor, 1);
}
`);


gl.compileShader(fragmentShader);
console.log(gl.getShaderInfoLog(fragmentShader));

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);

gl.linkProgram(program);

gl.useProgram(program);
gl.enable(gl.DEPTH_TEST);



const uniformLocations = {
    matrix: gl.getUniformLocation(program, `matrix`),
};



function  loadFileAJAX(name) {
    var xhr = new XMLHttpRequest(),
    okStatus = document.location.protocol === "file:" ? 0 : 200;
    xhr.open('GET', name, false);
    xhr.send(null);
    return xhr.status == okStatus ? xhr.responseText : null;
};

const obj =  parseOBJ(loadFileAJAX('models/sphere.obj')).geometries[0].data;


const vertexData = obj.position

const earthColor= []
const moonColor = []

for (var i = 0; i < obj.position.length; i++){
    earthColor.push(0)
    earthColor.push(0)
    earthColor.push(Math.random())

    let a = Math.random()
    moonColor.push(a)
    moonColor.push(a)
    moonColor.push(a)

}

var objectsToDraw = [
    {
      name: 'earth',
      programInfo: program,

      uniforms: uniformLocations,
      position: vertexData,
      color: earthColor,
    },

    {
        name: 'moon',
        programInfo: program,
  
        uniforms: uniformLocations,
        position: vertexData,
        color: moonColor,
      }
  ];

const earthMatrix = mat4.create();
const moonMatrix = mat4.create();

const viewMatrix = mat4.create();
const projectionMatrix = mat4.create();
mat4.perspective(projectionMatrix, 
    75 * Math.PI/180, // vertical field-of-view (angle, radians)
    canvas.width/canvas.height, // aspect W/H
    1e-4, // near cull distance
    1e4 // far cull distance
);

const mvMatrix = mat4.create();
const mvpMatrix = mat4.create();

mat4.translate(earthMatrix, earthMatrix, [0, 0, -5]);
mat4.scale(earthMatrix, earthMatrix, [30, 30, 30])

mat4.translate(moonMatrix, moonMatrix, [0, 0, -5]);
mat4.scale(moonMatrix, moonMatrix, [10, 10, 10])


mat4.translate(viewMatrix, viewMatrix, [0, 0, 10]);
mat4.invert(viewMatrix, viewMatrix);

var currentTime = Date.now();
var animationStartTime = currentTime;

function animate() {
    currentTime = Date.now();
    
    
    requestAnimationFrame(animate);
    objectsToDraw.forEach( e => {
        
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(e.position), gl.STATIC_DRAW);

        const colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(e.color), gl.STATIC_DRAW);

        const positionLocation = gl.getAttribLocation(e.programInfo, `position`);
        gl.enableVertexAttribArray(positionLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

        const colorLocation = gl.getAttribLocation(e.programInfo, `color`);
        gl.enableVertexAttribArray(colorLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);


        if(e.name == 'earth'){
            mat4.rotateY(earthMatrix, earthMatrix, Math.PI/2 /100);
            mat4.multiply(mvMatrix, viewMatrix, earthMatrix);
        }

        if(e.name == 'moon'){
            let orbitalMultipler = 5000
            let circleRadius = 0.02
            let angle = (currentTime - animationStartTime)/orbitalMultipler*2*Math.PI % 
            (2*Math.PI);
            let x = Math.cos(angle) * circleRadius;
            let z = Math.sin(angle) * circleRadius;
            
            mat4.translate(moonMatrix,moonMatrix, [x, 0, z]),
            //mat4.scale(moonMatrix, moonMatrix, [0.5, 0.5, 0.5]);
            mat4.multiply(mvMatrix, viewMatrix, moonMatrix);
        }
        
        mat4.multiply(mvpMatrix, projectionMatrix, mvMatrix);
        gl.uniformMatrix4fv(e.uniforms.matrix, false, mvpMatrix);
        gl.drawArrays(gl.TRIANGLES, 0, e.position.length / 3);
    })

    

}

animate();