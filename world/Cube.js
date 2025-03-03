class Cube{
  constructor(){
    this.type = 'cube';
    this.color = [1.0,1.0,1.0,1.0];

    this.matrix = new Matrix4();
    this.normalMatrix = new Matrix4();
    this.textureNum = -1;
  }
  
  render(){
    var xy = this.position;
    var rgba = this.color;
    var size = this.size;
    var segment = this.segments;

    // Pass the texture number
    gl.uniform1i(u_whichTexture, this.textureNum);

    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    // Pass the matrix to u_ModelMatrix attribute
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    
    // Front of cube
    // gl.uniform1i(u_whichTexture, 1); // Enable texture debug
    drawTriangle3DUVNormal([0,0,0, 1,1,0, 1,0,0],[0,0, 1,1, 1,0], [0,0,-1, 0,0,-1, 0,0,-1]);
    drawTriangle3DUVNormal([0,0,0, 0,1,0, 1,1,0],[0,0, 0,1, 1,1], [0,0,-1, 0,0,-1, 0,0,-1]);

    // Top of cube
    // gl.uniform1i(u_whichTexture, 0); // Enable texture added code debug
    // gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);
    drawTriangle3DUVNormal([0,1,0, 1,1,1, 1,1,0], [0,0, 1,1, 1,0], [0,1,0, 0,1,0, 0,1,0]);
    drawTriangle3DUVNormal([0,1,0, 0,1,1, 1,1,1], [0,0, 0,1, 1,1], [0,1,0, 0,1,0, 0,1,0]);

    // Right face
    // gl.uniform4f(u_FragColor, rgba[0] * 0.8, rgba[1] * 0.8, rgba[2] * 0.8, rgba[3]);
    drawTriangle3DUVNormal([1,0,0, 1,1,1, 1,1,0], [0,0, 1,1, 0,1],[1,0,0, 1,0,0, 1,0,0]);
    drawTriangle3DUVNormal([1,0,0, 1,0,1, 1,1,1], [0,0, 1,0, 1,1],[1,0,0, 1,0,0, 1,0,0]);

    // Back face
    // gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    drawTriangle3DUVNormal([1,0,1, 1,1,1, 0,1,1], [0,0, 0,1, 1,1],[0,0,1, 0,0,1, 0,0,1]);
    drawTriangle3DUVNormal([1,0,1, 0,1,1, 0,0,1], [0,0, 1,1, 1,0],[0,0,1, 0,0,1, 0,0,1]);

    // Left face
    // gl.uniform4f(u_FragColor, rgba[0] * 0.7, rgba[1] * 0.7, rgba[2] * 0.7, rgba[3]);
    drawTriangle3DUVNormal([0,0,0, 0,1,1, 0,1,0], [1,0, 0,1, 1,1],[-1,0,0, -1,0,0, -1,0,0]);
    drawTriangle3DUVNormal([0,0,0, 0,0,1, 0,1,1], [1,0, 0,0, 0,1],[-1,0,0, -1,0,0, -1,0,0]);

    // Bottom face
    // gl.uniform4f(u_FragColor, rgba[0] * 0.6, rgba[1] * 0.6, rgba[2] * 0.6, rgba[3]);
    drawTriangle3DUVNormal([0,0,0, 1,0,1, 0,0,1], [0,1, 1,0, 0,0],[0,-1,0, 0,-1,0, 0,-1,0]);
    drawTriangle3DUVNormal([0,0,0, 1,0,0, 1,0,1], [0,1, 1,1, 1,0],[0,-1,0, 0,-1,0, 0,-1,0]);
  
  }

  renderfast(){
    var xy = this.position;
    var rgba = this.color;
    var size = this.size;
    var segment = this.segments;

    // Pass the texture number
    gl.uniform1i(u_whichTexture, this.textureNum);

    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    // Pass the matrix to u_ModelMatrix attribute
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    
    var allverts=[];
    var alluvs = [];
    var allnorms = [];

    // Front of cube
    // gl.uniform1i(u_whichTexture, 1); // Enable texture debug
    allverts = allverts.concat([0,0,0, 1,1,0, 1,0,0]);
    allverts = allverts.concat([0,0,0, 0,1,0, 1,1,0]);

    alluvs = alluvs.concat([0,0, 1,1, 1,0]);
    alluvs = alluvs.concat([0,0, 0,1, 1,1]);


    allnorms = allnorms.concat([0,0,1, 0,0,1, 0,0,1]);
    allnorms = allnorms.concat([0,0,1, 0,0,1, 0,0,1]);

    // Top of cube
    // gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);
    allverts = allverts.concat([0,1,0, 1,1,1, 1,1,0]);
    allverts = allverts.concat([0,1,0, 0,1,1, 1,1,1]);

    alluvs = alluvs.concat([0,0, 1,1, 1,0]);
    alluvs = alluvs.concat([0,0, 0,1, 1,1]);

    allnorms = allnorms.concat([0,1,0, 0,1,0, 0,1,0]);
    allnorms = allnorms.concat([0,1,0, 0,1,0, 0,1,0]);

    // Right face
    // gl.uniform4f(u_FragColor, rgba[0] * 0.8, rgba[1] * 0.8, rgba[2] * 0.8, rgba[3]);
    allverts = allverts.concat([1,0,0, 1,1,1, 1,1,0]);
    allverts = allverts.concat([1,0,0, 1,0,1, 1,1,1]);

    alluvs = alluvs.concat([0,0, 1,1, 0,1]);
    alluvs = alluvs.concat([0,0, 1,0, 1,1]);

    allnorms = allnorms.concat([-1,0,0, -1,0,0, -1,0,0]);
    allnorms = allnorms.concat([-1,0,0, -1,0,0, -1,0,0]);
    
    // Back face
    // gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    allverts = allverts.concat([1,0,1, 1,1,1, 0,1,1]);
    allverts = allverts.concat([1,0,1, 0,1,1, 0,0,1]);

    alluvs = alluvs.concat([0,0, 0,1, 1,1]);
    alluvs = alluvs.concat([0,0, 1,1, 1,0]);
        
    allnorms = allnorms.concat([0,0,-1, 0,0,-1, 0,0,-1]);
    allnorms = allnorms.concat([0,0,-1, 0,0,-1, 0,0,-1]);

    // Left face
    // gl.uniform4f(u_FragColor, rgba[0] * 0.6, rgba[1] * 0.6, rgba[2] * 0.6, rgba[3]);
    allverts = allverts.concat([0,0,0, 0,1,1, 0,1,0]);
    allverts = allverts.concat([0,0,0, 0,0,1, 0,1,1]);

    alluvs = alluvs.concat([1,0, 0,1, 1,1]);
    alluvs = alluvs.concat([1,0, 0,0, 0,1]);

    allnorms = allnorms.concat([1,0,0, 1,0,0, 1,0,0]);
    allnorms = allnorms.concat([1,0,0, 1,0,0, 1,0,0]);


    // Bottom face
    // gl.uniform4f(u_FragColor, rgba[0] * 0.5, rgba[1] * 0.5, rgba[2] * 0.5, rgba[3]);
    allverts = allverts.concat([0,0,0, 1,0,1, 0,0,1]);
    allverts = allverts.concat([0,0,0, 1,0,0, 1,0,1]);

    alluvs = alluvs.concat([0,1, 1,0, 0,0]);
    alluvs = alluvs.concat([0,1, 1,1, 1,0]);

    allnorms = allnorms.concat([0,-1,0, 0,-1,0, 0,-1,0]);
    allnorms = allnorms.concat([0,-1,0, 0,-1,0, 0,-1,0]);

    drawTriangle3DUVNormal(allverts,alluvs,allnorms);
  
  }
}