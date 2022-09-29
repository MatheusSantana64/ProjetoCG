//Referencia pro canvas
const canvas = document.querySelector('canvas');
//Contexto WebGL do canvas
const gl = canvas.getContext('webgl');

//Verifica se navegador suporta WebGL
if (!gl) {
    throw new Error('WebGL not supported');
}

const program = initShaders(gl, 'shader/vertexShader.glsl', 'shader/fragmentShader.glsl');



//Carrega objetos (sphere.obj)
function  loadFileAJAX(name) {
    var xhr = new XMLHttpRequest(),
    okStatus = document.location.protocol === "file:" ? 0 : 200;
    xhr.open('GET', name, false);
    xhr.send(null);
    return xhr.status == okStatus ? xhr.responseText : null;
};

function loadTexture(url) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
  
    // Because images have to be downloaded over the internet
    // they might take a moment until they are ready.
    // Until then put a single pixel in the texture so we can
    // use it immediately. When the image has finished downloading
    // we'll update the texture with the contents of the image.
    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                  width, height, border, srcFormat, srcType,
                  pixel);
  
    const image = new Image();
    image.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                    srcFormat, srcType, image);
  
      // WebGL1 has different requirements for power of 2 images
      // vs non power of 2 images so check if the image is a
      // power of 2 in both dimensions.
      if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
         // Yes, it's a power of 2. Generate mips.
         gl.generateMipmap(gl.TEXTURE_2D);
      } else {
         // No, it's not a power of 2. Turn off mips and set
         // wrapping to clamp to edge
         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      }
    };
    image.src = url;
  
    return texture;
  }

  function isPowerOf2(value) {
    return value & (value - 1) === 0;
  }

const obj =  parseOBJ(loadFileAJAX('models/sphere.obj')).geometries[0].data;



const vertexData = obj.position
const uvdata = obj.texcoord;
const normalData = obj.normal;

const earthTexture = loadTexture('models/Textures/earth.jpg');
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

gl.activeTexture(gl.TEXTURE0);
gl.bindTexture(gl.TEXTURE_2D, earthTexture);

const sunColor = []
const earthColor= []



//Define as cores de cada vertice dos objetos
for (var i = 0; i < obj.position.length/3; i++){
    let a = Math.random() % .1 
    sunColor.push(0.97 - 3*a)  //R
    sunColor.push(0.84 - 2*a) //G
    sunColor.push(.1 - a) //B

    //Cores da Terra
    earthColor.push(0)  //R
    earthColor.push(Math.random() % .5) //G
    earthColor.push(.8) //B
    
}

const uniformLocations = {
    lightWorldPositionLocation : gl.getUniformLocation(program, "u_lightWorldPosition"),
    worldLocation: gl.getUniformLocation(program, "u_world"),
    worldViewProjection: gl.getUniformLocation(program, "u_worldViewProjection"),
    worldInverseTranspose: gl.getUniformLocation(program, "u_worldInverseTranspose"),
    textureID: gl.getUniformLocation(program, `textureID`),
    uUseTexture: gl.getUniformLocation(program, `uUseTexture`),
    uIsSourceOfLight: gl.getUniformLocation(program, `uIsSourceOfLight`),
    ambientLight: gl.getUniformLocation(program, `u_ambientLight`),
};

var sunPosition = [-10, 0, 0]
var sunNode = new Node(program, vertexData, sunColor, uniformLocations, normalData);
sunNode.sourceOfLight = 1;

mat4.translate(sunNode.localMatrix, sunNode.localMatrix, sunPosition);

var teste = [vertexData[0], vertexData[1], vertexData[2], 1];

var earthNode = new Node(program, vertexData, earthColor, uniformLocations, normalData);
//earthNode.texture = uvdata;
mat4.translate(earthNode.localMatrix, earthNode.localMatrix, [15, 0, 0]);
mat4.scale(earthNode.localMatrix, earthNode.localMatrix, [.4, .4, .4]);  // lua tem 27% diametro da terra

earthNode.setParent(sunNode);

var objects = [
    sunNode,
    earthNode
];



var satNodes = []
const satelite = parseOBJ(loadFileAJAX('models/Satellite.obj')).geometries;
satelite.forEach(geometry => {
    var satColor = []

    for (var i = 0; i < geometry.data.position.length/3; i++){

        satColor.push(0.3) //R
        satColor.push(0.3) //G
        satColor.push(0.3) //B

    }
    
    node = new Node(program, geometry.data.position, satColor, uniformLocations, geometry.data.normal)
    mat4.translate(node.localMatrix, node.localMatrix, [5, 0, 0]);
    mat4.scale(node.localMatrix, node.localMatrix, [.3, .3, .3]);
    mat4.rotateY(node.localMatrix, node.localMatrix, 180 * Math.PI/180)

    satNodes.push(node);
    node.setParent(earthNode)
    objects.push(node);
});


var ambientLight = .3;
var globalSpeed = .05
var deg = 0
var radius = 20;
var heightView = 0;


//Controlar Camera
window.onkeydown = e => {
    console.log(e.key)
    //Mover Camera
    if (e.key == 'ArrowLeft') {
        deg -= 1
    }else if (e.key == 'ArrowRight') {
        deg += 1
    }else if (e.key == 'ArrowUp') {
        heightView += 1
    }else if (e.key == 'ArrowDown') {
        heightView -= 1
    }else if (e.key == '6') { //Aumenta velocidade global
        globalSpeed += .05
    }
    else if (e.key == '4') { //Diminui velocidade global
        globalSpeed -= .05
    }
    else if (e.key == '5') { //Pausa (Velocidade global = 0)
        globalSpeed = 0
    }
}



requestAnimationFrame(drawScene);
var last = 0
// Draw the scene.
function drawScene() {
    requestAnimationFrame(drawScene);
    now = Date.now();

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

    
   
    
    var baseSpeed =  globalSpeed * Math.PI/180 // 365 dias
    var earthRotationSpeed = baseSpeed * 365 // 1 dia
    var revolutionspeed = earthRotationSpeed/27 // 27 dias
    var sunRotationSpeed = earthRotationSpeed/27 // 27 dias

    // atualiza as localMatrix e private de cada objeto
    //mat4.rotateY(sunNode.localMatrix, sunNode.localMatrix, baseSpeed); 
    //mat4.rotateY(sunNode.privateMatrix, sunNode.privateMatrix, sunRotationSpeed); 

    mat4.rotateY(earthNode.localMatrix, earthNode.localMatrix, revolutionspeed); 
    mat4.rotateY(earthNode.privateMatrix, earthNode.privateMatrix,   earthRotationSpeed); 



    // atualiza todas as WorldMatrix
    sunNode.updateWorldMatrix();


    // Cria matriz da camera
    var angle = deg * Math.PI / 180;
    var x = Math.sin(angle) * radius;
    var z = Math.cos(angle) * radius;
    var y = heightView;
    var cameraPosition = [x, y, z];
    var target = [0, 0, 0];
    var up = [0, 1, 0];
    var viewMatrix = mat4.create();

    mat4.lookAt(viewMatrix, cameraPosition, target, up);
    

    var viewProjectionMatrix = mat4.create();
    mat4.multiply(viewProjectionMatrix,projectionMatrix, viewMatrix);

        

    objects.forEach( (e, index) => {
        gl.useProgram(  e.programInfo,); 
        
        const positionLocation = gl.getAttribLocation(e.programInfo, `position`);
        gl.enableVertexAttribArray(positionLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, e.buffers.positionBuffer);
        gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

        const colorLocation = gl.getAttribLocation(e.programInfo, `color`);
        gl.enableVertexAttribArray(colorLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, e.buffers.colorBuffer);
        gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);
        
        const uvLocation = gl.getAttribLocation(e.programInfo, `uv`);
        gl.enableVertexAttribArray(uvLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, e.buffers.textureBuffer);
        gl.vertexAttribPointer(uvLocation, 2, gl.FLOAT, false, 0, 0);

        const normalLocation = gl.getAttribLocation(e.programInfo, `a_normal`);
        gl.enableVertexAttribArray(normalLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, e.buffers.normalBuffer);
        gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);

        var mvpMatrix = mat4.create();
        var worldInverseMatrix = mat4.create();
        var worldInverseTransposeMatrix =  mat4.create();

        mat4.multiply(mvpMatrix, viewProjectionMatrix, e.worldMatrix);
        mat4.invert(worldInverseMatrix, e.worldMatrix);
        mat4.transpose(worldInverseTransposeMatrix, worldInverseMatrix);

        
        gl.uniform1f(e.uniforms.ambientLight, ambientLight)
        gl.uniform1i(e.uniforms.uUseTexture, e.texture != null)
        gl.uniform1i(e.uniforms.uIsSourceOfLight, e.sourceOfLight)
        gl.uniform1i(e.uniforms.textureID, index)
        gl.uniform3fv(e.uniforms.lightWorldPositionLocation, sunPosition);

        gl.uniformMatrix4fv(e.uniforms.worldInverseTranspose, false, worldInverseTransposeMatrix);
        gl.uniformMatrix4fv(e.uniforms.worldLocation, false, e.worldMatrix);
        gl.uniformMatrix4fv(e.uniforms.worldViewProjection, false, mvpMatrix);
        
        gl.drawArrays(gl.TRIANGLES, 0, e.position.length / 3);
    })

    
  }
