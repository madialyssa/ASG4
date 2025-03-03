class Sphere {
    constructor() {
        this.type = 'sphere';
        this.color = [1.0, 1.0, 1.0, 1.0]; 
        this.matrix = new Matrix4(); 
        this.radius = 0.5; 
        this.latSegments = 10; 
        this.lonSegments = 10;
        this.textureNum = -2;
    }

    render() {
        let rgba = this.color;
        let r = this.radius;
        let latSeg = this.latSegments;
        let lonSeg = this.lonSegments;

        // Pass the texture number
        gl.uniform1i(u_whichTexture, -2);

        

        // Pass color to shader
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass transformation matrix to shader
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        for (let lat = 0; lat < latSeg; lat++) {
            let lat0 = Math.PI * (-0.5 + (lat / latSeg));   // from -90° to 90°
            let lat1 = Math.PI * (-0.5 + ((lat + 1) / latSeg));

            let z0 = Math.sin(lat0), zr0 = Math.cos(lat0);
            let z1 = Math.sin(lat1), zr1 = Math.cos(lat1);

            for (let lon = 0; lon < lonSeg; lon++) {
                let lng0 = (2 * Math.PI * lon) / lonSeg; // 0° to 360°
                let lng1 = (2 * Math.PI * (lon + 1)) / lonSeg;

                let x0 = Math.cos(lng0);
                let y0 = Math.sin(lng0);
                let x1 = Math.cos(lng1);
                let y1 = Math.sin(lng1);

                // Convert to 3D points
                let v1 = [r * x0 * zr0, r * y0 * zr0, r * z0];
                let v2 = [r * x1 * zr0, r * y1 * zr0, r * z0];
                let v3 = [r * x0 * zr1, r * y0 * zr1, r * z1];
                let v4 = [r * x1 * zr1, r * y1 * zr1, r * z1];

                // Draw two triangles per quad
                drawTriangle3D([...v1, ...v2, ...v3]); 
                drawTriangle3D([...v3, ...v2, ...v4]); 
            }
        }
    }
}
