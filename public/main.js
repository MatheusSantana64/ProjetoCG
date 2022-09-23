//Referencia pro canvas
const canvas = document.querySelector('canvas');
//Contexto WebGL do canvas
const gl = canvas.getContext('webgl');

//Verifica se navegador suporta WebGL
if (!gl) {
    throw new Error('WebGL not supported');
}

const program = initShaders(gl, 'shader/vertexShader.glsl', 'shader/fragmentShader.glsl');


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


// var objectsToDraw = [
//     {
//       name: 'earth',
//       programInfo: program,

//       uniforms: uniformLocations,
//       position: vertexData,
//       color: earthColor,
//     },

//     {
//         name: 'moon',
//         programInfo: program,
  
//         uniforms: uniformLocations,
//         position: vertexData,
//         color: moonColor,
//       }
//   ];



var earthNode = new Node();
mat4.translate(earthNode.localMatrix, earthNode.localMatrix, [0, 0, 0]);
earthNode.drawInfo = {
    name: 'earth',
    uniforms: uniformLocations,
    programInfo: program,
    position: vertexData,
    color : earthColor
};

var moonNode = new Node();
mat4.translate(moonNode.localMatrix, moonNode.localMatrix, [.1, 0, 0]);  // moon .1 units from the earth
mat4.scale(moonNode.localMatrix, moonNode.localMatrix, [.3, .3, .3]);  // moon .1 units from the earth

moonNode.drawInfo = {
    name: 'moon',
    uniforms: uniformLocations,
    programInfo: program,
    position: vertexData,
    color: moonColor,
};

 // connect the celetial objects
 moonNode.setParent(earthNode);

var objects = [
    earthNode,
    moonNode,
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
mat4.translate(moonMatrix, moonMatrix, [0, 0, 0]); //PRECISA AJUSTAR!!!

//Camera
mat4.translate(viewMatrix, viewMatrix, [0, 0, -10]);

//Controlar Camera
window.onkeypress = e => {
    //Mover Camera (X Axis)
    if (e.key == 'a' || e.key == 'A') {
        mat4.translate(viewMatrix, viewMatrix, [-0.1, 0, 0]);
    } 
    else if (e.key == 'd' || e.key == 'D') {
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
    var currentTime = Date.now();
    // Update FPS if a second or more has passed since last FPS update
    if(currentTime - gl.previousFrameTimeStamp >= 1000) {
        gl.fpsCounter.innerHTML = pwgl.nbrOfFramesForFPS;
        gl.nbrOfFramesForFPS = 0;
        gl.previousFrameTimeStamp = currentTime;
    }

    //Chama a animacao novamente
    requestAnimationFrame(animate);

    objectsToDraw.forEach( e => {
        gl.useProgram(e.programInfo,); 
        
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
            //mat4.rotateY(earthMatrix, earthMatrix, Math.PI/2 /100);
            mat4.multiply(mvMatrix, viewMatrix, earthMatrix);
        }

        //Movimentacao da Lua
        if(e.name == 'moon'){
            let orbitalMultipler = 2000;
            let circleRadius = .05;
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
//requestAnimationFrame(animate);

requestAnimationFrame(drawScene);
// Draw the scene.
function drawScene() {
    requestAnimationFrame(drawScene);

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

 
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, 
        75 * Math.PI/180, // Campo-de-visão vertical (angle, radians)
        canvas.width/canvas.height, // Aspecto Largura/Altura (W/H)
        1e-4, // Distancia de corte proxima
        1e4 // Distancia de corte distante
    );

    // Cria matriz da camera
    var cameraPosition = [0, 0, 0.4];
    var target = [0, 0, 0];
    var up = [0, 1, 0];
    var viewMatrix = mat4.create();
    mat4.lookAt(viewMatrix,cameraPosition, target, up);
    

    var viewProjectionMatrix = mat4.create();
    mat4.multiply(viewProjectionMatrix,projectionMatrix, viewMatrix);

    // upda6
    mat4.rotateY(earthNode.localMatrix, earthNode.localMatrix, .07);
    mat4.rotateY(moonNode.localMatrix, moonNode.localMatrix, .5);

    // Update all world matrices in the scene graph
    earthNode.updateWorldMatrix();

        

    objects.forEach( e => {
        gl.useProgram(  e.drawInfo.programInfo,); 
        
        //Buffer da posicao de cada objeto
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(e.drawInfo.position), gl.STATIC_DRAW);

        //Buffer da cor de cada objeto
        const colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(e.drawInfo.color), gl.STATIC_DRAW);

        const positionLocation = gl.getAttribLocation(e.drawInfo.programInfo, `position`);
        gl.enableVertexAttribArray(positionLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

        const colorLocation = gl.getAttribLocation(e.drawInfo.programInfo, `color`);
        gl.enableVertexAttribArray(colorLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

        var mvpMatrix = mat4.create();
        
        mat4.multiply(mvpMatrix, viewProjectionMatrix, e.worldMatrix);
        gl.uniformMatrix4fv(e.drawInfo.uniforms.matrix, false, mvpMatrix);
        gl.drawArrays(gl.TRIANGLES, 0, e.drawInfo.position.length / 3);
    })

    
  }
