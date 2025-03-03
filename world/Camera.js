class Camera{
    constructor(){
        this.fov = 80;
        this.eye = new Vector3([0,0,-2]);
        this.at  = new Vector3([0,0,0]);
        this.up  = new Vector3([0,1,0]);
        this.viewMat = new Matrix4();
        this.viewMat.setLookAt(
            this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
            this.at.elements[0], this.at.elements[1], this.at.elements[2],
            this.up.elements[0], this.up.elements[1], this.up.elements[2]
        );
        this.projMat = new Matrix4();
        this.projMat.setPerspective(this.fov, canvas.width/canvas.height, 0.1, 1000);
    }

    moveForward(){
        var f = new Vector3([0,0,0]);
        f.set(this.at);
        f.sub(this.eye);
        f = f.normalize();

        this.eye = this.eye.add(f);
        this.at  = this.at.add(f);
    }

    moveBackwards(){
        var b = new Vector3([0,0,0]);
        b.set(this.eye);
        b.sub(this.at);
        b = b.normalize();

        this.eye = this.eye.add(b.mul(0.5));
        this.at = this.at.add(b.mul);
    }

    moveRight(){
        var f = new Vector3([0,0,0]);
        f.set(this.at);
        f.sub(this.eye);

        var s = new Vector3([0,0,0]);
        s.set(f);
        s = Vector3.cross(f,this.up);
        s = s.normalize();

        this.eye = this.eye.add(s);
        this.at = this.at.add(s);
    }

    moveLeft(){
        var f = new Vector3([0,0,0]);
        f.set(this.at);
        f.sub(this.eye);

        var s = new Vector3([0,0,0]);
        s.set(f);
        s = Vector3.cross(this.up,f);
        s = s.normalize();

        this.eye = this.eye.add(s);
        this.at = this.at.add(s);
    }

    panLeft(){
        var f = new Vector3([0,0,0]);
        f.set(this.at);
        f.sub(this.eye);

        var rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(-5, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        
        var f_prime = rotationMatrix.multiplyVector3(f);

        this.at = f_prime.add(this.eye);
    }

    panRight(){
        var f = new Vector3([0,0,0]);
        f.set(this.at);
        f.sub(this.eye);

        var rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(5, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        
        var f_prime = rotationMatrix.multiplyVector3(f);

        this.at = f_prime.add(this.eye);
    }

}