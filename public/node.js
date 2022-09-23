var Node = function(program, position, color, uniforms) {
    this.children = [];
    this.localMatrix = mat4.create();
    this.privateMatrix = mat4.create();
    this.worldMatrix = mat4.create();
    this.drawInfo = {
        programInfo: program,
        position: position,
        color: color,
        uniforms: uniforms,
    };
    this.startBuffer()
  };
  
Node.prototype.setParent = function(parent) {
// remove us from our parent
if (this.parent) {
    var ndx = this.parent.children.indexOf(this);
    if (ndx >= 0) {
    this.parent.children.splice(ndx, 1);
    }
}

// Add us to our new parent
if (parent) {
    parent.children.push(this);
}
this.parent = parent;
};

Node.prototype.updateWorldMatrix = function(matrix) {
    if (matrix) {
        // a matrix was passed in so do the math
        mat4.multiply(this.worldMatrix, matrix, this.localMatrix);
    } else {
        // no matrix was passed in so just copy.
        mat4.copy(this.worldMatrix, this.localMatrix);
    }

    // now process all the children
    var worldMatrix = this.worldMatrix;
    this.children.forEach(function(child) {
        child.updateWorldMatrix(worldMatrix);
    });

    mat4.multiply(this.worldMatrix, this.privateMatrix, this.worldMatrix );
}

Node.prototype.startBuffer = function() {
    //Buffer da posicao de cada objeto
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.drawInfo.position), gl.STATIC_DRAW);

    //Buffer da cor de cada objeto
    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.drawInfo.color), gl.STATIC_DRAW);
    

    this.buffers = { 
        positionBuffer: positionBuffer,
        colorBuffer: colorBuffer,
    }
}
    