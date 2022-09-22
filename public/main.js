//Referencia pro canvas
const canvas = document.querySelector('canvas');
//Contexto WebGL do canvas
const gl = canvas.getContext('webgl');

//Verifica se navegador suporta WebGL
if (!gl) {
    throw new Error('WebGL not supported');
}

//Cria Vertex Shader
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

//Cria Fragment Shader
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

//Cria o programa e anexa os shaders ao programa
const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);

gl.linkProgram(program);

gl.useProgram(program);
gl.enable(gl.DEPTH_TEST);


const uniformLocations = {
    matrix: gl.getUniformLocation(program, `matrix`),
};

//Carrega objetos (sphere.obj)
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

//Define as cores de cada vertice dos objetos
for (var i = 0; i < obj.position.length; i++){
    //Cores da Terra
    earthColor.push(0)  //R
    earthColor.push(.2) //G
    earthColor.push(.9) //B
    
    //Cores da Lua
    moonColor.push(0.6) //R
    moonColor.push(0.6) //G
    moonColor.push(0.6) //B
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

//viewMatrix
const viewMatrix = mat4.create();
const projectionMatrix = mat4.create();
mat4.perspective(projectionMatrix, 
    75 * Math.PI/180, // Campo-de-visão vertical (angle, radians)
    canvas.width/canvas.height, // Aspecto Largura/Altura (W/H)
    1e-4, // Distancia de corte proxima
    1e4 // Distancia de corte distante
);
const mvMatrix = mat4.create();
const mvpMatrix = mat4.create();

//Posicao e tamanho da Terra
mat4.scale(earthMatrix, earthMatrix, [30, 30, 30]);

//Posicao e tamanho da Lua
mat4.scale(moonMatrix, moonMatrix, [10, 10, 10]);
mat4.translate(moonMatrix, moonMatrix, [0, 0, -0.3]); //PRECISA AJUSTAR!!!

//Camera
mat4.translate(viewMatrix, viewMatrix, [0, 0, -10]);

//Controlar Camera
window.onkeypress = e => {
    //Mover Camera (X Axis)
    if (e.key == 'd' || e.key == 'A') {
        mat4.translate(viewMatrix, viewMatrix, [-0.1, 0, 0]);
    } 
    else if (e.key == 'a' || e.key == 'D') {
        mat4.translate(viewMatrix, viewMatrix, [+0.1, 0, 0]);
    }
    //Mover Camera (Y Axis)
    else if (e.key == 'w' || e.key == 'W') {
        mat4.translate(viewMatrix, viewMatrix, [0, -0.1, 0]);
    } 
    else if (e.key == 's' || e.key == 'S') {
        mat4.translate(viewMatrix, viewMatrix, [0, +0.1, 0]);
    }
    //Mover Camera (Z Axis)
    else if (e.key == 'e' || e.key == 'E') {
        mat4.translate(viewMatrix, viewMatrix, [0, 0, +0.1]);
    }
    else if (e.key == 'q' || e.key == 'Q') {
        mat4.translate(viewMatrix, viewMatrix, [0, 0, -0.1]);
    }
    //Rodar Camera Vertical (90 Graus)
    else if (e.key == '9') { //Roda a camera 90 graus por cima
        mat4.rotateX(viewMatrix, viewMatrix, Math.PI/2);
    }
    else if (e.key == '7') { //Roda a camera 90 graus por baixo
        mat4.rotateX(viewMatrix, viewMatrix, -Math.PI/2);
    }
    //Rodar Camera Vertical
    else if (e.key == '8') { //Roda camera por cima
        mat4.rotateX(viewMatrix, viewMatrix, +0.1);
    } 
    else if (e.key == '2') { //Roda camera por baixo
        mat4.rotateX(viewMatrix, viewMatrix, -0.1);
    } 
    //Rodar Camera Horizontal
    else if (e.key == '4') { //Roda camera pela esquerda
        mat4.rotateY(viewMatrix, viewMatrix, +0.1);
    } 
    else if (e.key == '6') { //Roda camera pela direita
        mat4.rotateY(viewMatrix, viewMatrix, -0.1);
    }
}

var currentTime = Date.now();
var animationStartTime = currentTime;

//Funcao de animacao para mover a lua e girar a terra
function animate() {

    //Chama a animacao novamente
    requestAnimationFrame(animate);

    objectsToDraw.forEach( e => {
        //Buffer da posicao de cada objeto
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(e.position), gl.STATIC_DRAW);

        //Buffer da cor de cada objeto
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

        //Obtem horario atual
        currentTime = Date.now();

        //Rotacao da Terra
        if(e.name == 'earth'){
            mat4.rotateY(earthMatrix, earthMatrix, Math.PI/2 /100);
            mat4.multiply(mvMatrix, viewMatrix, earthMatrix);
        }

        //Movimentacao da Lua
        if(e.name == 'moon'){
            let orbitalMultipler = 5000;
            let circleRadius = 0.005;
            let elapsedTime = currentTime - animationStartTime;
            let angle = elapsedTime / orbitalMultipler*2*Math.PI % (2*Math.PI);
            let x = Math.cos(angle) * circleRadius;
            let z = Math.sin(angle) * circleRadius;

            mat4.translate(moonMatrix,moonMatrix, [x, 0, z]),
            mat4.multiply(mvMatrix, viewMatrix, moonMatrix);
        }
        
        mat4.multiply(mvpMatrix, projectionMatrix, mvMatrix);
        gl.uniformMatrix4fv(e.uniforms.matrix, false, mvpMatrix);
        gl.drawArrays(gl.TRIANGLES, 0, e.position.length / 3);
    })
}

//Executa funcao de animacao
requestAnimationFrame(animate);