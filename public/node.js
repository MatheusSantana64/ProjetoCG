var Node = function() {
    this.children = [];
    this.localMatrix = mat4.create();
    this.worldMatrix = mat4.create();
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
        mat4.multiply(this.worldMatrix, matrix, this.localMatrix, );
    } else {
        // no matrix was passed in so just copy.
        mat4.copy(this.worldMatrix, this.localMatrix);
    }

    // now process all the children
    var worldMatrix = this.worldMatrix;
    this.children.forEach(function(child) {
        child.updateWorldMatrix(worldMatrix);
    });
}