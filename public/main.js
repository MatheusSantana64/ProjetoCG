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
for (var i = 0; i < obj.position.length/3; i++){
    //Cores da Terra
    earthColor.push(0)  //R
    earthColor.push(Math.random() % .5) //G
    earthColor.push(.9) //B
    
    //Cores da Lua
    
    moonColor.push(0.6) //R
    moonColor.push(0.6) //G
    moonColor.push(0.6) //B
}


var earthNode = new Node(program, vertexData, earthColor, uniformLocations);
mat4.translate(earthNode.localMatrix, earthNode.localMatrix, [0, 0, 0]);


var moonNode = new Node(program, vertexData, moonColor, uniformLocations);
mat4.translate(moonNode.localMatrix, moonNode.localMatrix, [.1, 0, 0]);  // moon .1 units from the earth
mat4.scale(moonNode.localMatrix, moonNode.localMatrix, [.3, .3, .3]);  // 

// seta lua como nó filho da terra 
moonNode.setParent(earthNode);

var objects = [
    earthNode,
    moonNode,
];


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

var baseSpeed = .01

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
    
    let earthRotationSpeed = baseSpeed; // velocidade de rotação da terra
    let revolutionSpeed = earthRotationSpeed * 2.2 // velocidade de revolução da lua é 2.2 vezes rotação da terra
    let moonRotationSpeed = earthRotationSpeed/27 

    // atualiza as matrizes de cada objeto
    mat4.rotateY(earthNode.localMatrix, earthNode.localMatrix, revolutionSpeed); 
    mat4.rotateY(moonNode.localMatrix, moonNode.localMatrix, moonRotationSpeed);

    // atualiza aplica operação na matriz de um objeto de somente
    mat4.rotateY(earthNode.privateMatrix, earthNode.privateMatrix, earthRotationSpeed - revolutionSpeed); // reduz a velocidade de toração da terra

    // Update all world matrices in the scene graph
    earthNode.updateWorldMatrix();



        

    objects.forEach( e => {
        gl.useProgram(  e.drawInfo.programInfo,); 
        
        const positionLocation = gl.getAttribLocation(e.drawInfo.programInfo, `position`);
        gl.enableVertexAttribArray(positionLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, e.buffers.positionBuffer);
        gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

        const colorLocation = gl.getAttribLocation(e.drawInfo.programInfo, `color`);
        gl.enableVertexAttribArray(colorLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, e.buffers.colorBuffer);
        gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

        var mvpMatrix = mat4.create();
        
        mat4.multiply(mvpMatrix, viewProjectionMatrix, e.worldMatrix);
        gl.uniformMatrix4fv(e.drawInfo.uniforms.matrix, false, mvpMatrix);
        gl.drawArrays(gl.TRIANGLES, 0, e.drawInfo.position.length / 3);
    })

    
  }
