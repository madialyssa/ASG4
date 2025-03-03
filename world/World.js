// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  attribute vec3 a_Normal;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  varying vec4 v_VertPos;
  uniform mat4 u_ModelMatrix;
  // uniform mat4 u_NormalMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
    v_Normal = a_Normal;
    v_VertPos = u_ModelMatrix * a_Position;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  uniform vec4 u_FragColor;
  uniform vec3 u_lightPos;
  varying vec4 v_VertPos;
  uniform vec3 u_cameraPos;
  

  uniform bool u_lightOn;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform sampler2D u_Sampler3;
  uniform sampler2D u_Sampler4;
  uniform sampler2D u_Sampler5;

  uniform int u_whichTexture;
  void main() {

    if(u_whichTexture == -3){
      gl_FragColor = vec4((v_Normal+1.0)/2.0,1.0);
    }
    else if(u_whichTexture == -2){
      gl_FragColor = u_FragColor;
    }
    else if(u_whichTexture == -1){
      gl_FragColor = vec4(v_UV,1.0,1.0);
    }
    else if(u_whichTexture == 0){
      gl_FragColor = texture2D(u_Sampler0, v_UV);
    }
    else if(u_whichTexture == 1){
      gl_FragColor = texture2D(u_Sampler1, v_UV);
    }
    else if(u_whichTexture == 2){
      gl_FragColor = texture2D(u_Sampler2, v_UV);
    }
    else if(u_whichTexture == 3){
      gl_FragColor = texture2D(u_Sampler3, v_UV);
    }
    else if(u_whichTexture == 4){
      gl_FragColor = texture2D(u_Sampler4, v_UV);
    }
    else if(u_whichTexture == 5){
      gl_FragColor = texture2D(u_Sampler5, v_UV);
    }
    else{
      gl_FragColor = vec4(1,.2,.2,1);
    }

    vec3 lightVector = u_lightPos - vec3(v_VertPos);
    float r = length(lightVector);

    // Red Green Visualization
    // if(r < 1.0){
    //   gl_FragColor = vec4(1,0,0,1);
    // }
    // else if(r < 2.0){
    //   gl_FragColor = vec4(0,1,0,1);
    // }
    // gl_FragColor = vec4(vec3(gl_FragColor)/(r*r),1);

    // N dot L
    vec3 L = normalize(lightVector);
    vec3 N = normalize(v_Normal);
    float nDotL = max(dot(N,L),0.0);

    // Reflection 
    vec3 R = reflect(-L,N);

    //eye
    vec3 E = normalize(u_cameraPos - vec3(v_VertPos));

    // Specular
    float specular = pow(max(dot(E,R),0.0),64.0) * 0.8;

    vec3 diffuse = vec3(1,1,0.9) * vec3(gl_FragColor) * nDotL * 0.9;
    vec3 ambient = vec3(gl_FragColor) * 0.3;

    if(u_lightOn){
      gl_FragColor = vec4(specular+diffuse+ambient,1.0);
    }
  }`

// Global Variables
let canvas;
let gl;
let a_Position;
let a_UV;
let a_Normal;
let u_FragColor;
let u_ModelMatrix;
// let u_NormalMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_lightPos;
let u_cameraPos;
let u_lightOn;

// Texture Global Variables
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_Sampler3;
let u_Sampler4;
let u_Sampler5;

let g_camera;

function setupWebGL(){
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", {preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  
  // Enable depth testing
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
}

function connectVariablesToGLSL(){
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of a_UV
  a_UV = gl.getAttribLocation(gl.program,'a_UV');
  if(a_UV < 0){
    console.log('Failed to get the storage location of a_UV');
    return;
  }

  // Get the storage location of a_Normal
  a_Normal = gl.getAttribLocation(gl.program,'a_Normal');
  if(a_Normal < 0){
    console.log('Failed to get the storage location of a_Normal');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_lightPos
  u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
  if (!u_lightPos) {
    console.log('Failed to get the storage location of u_lightPos');
    return;
  }

  // Get the storage location of u_cameraPos
  u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
  if (!u_cameraPos) {
    console.log('Failed to get the storage location of u_cameraPos');
    return;
  }

  // Get the storage location of u_lightOn
  u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
  if (!u_lightOn) {
    console.log('Failed to get the storage location of u_lightOn');
    return;
  }

  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

    
  // Get the storage location of u_NormalMatrix
  // u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  // if (!u_NormalMatrix) {
  //   console.log('Failed to get the storage location of u_NormalMatrix');
  //   return;
  // }

  // Get the storage location of u_GlobalRotateMatrix
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }

  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }
  
  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if(!u_Sampler0){
    console.log('Failed to get the storage location of u_Sampler0');
    return;
  }

    
  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if(!u_Sampler1){
    console.log('Failed to get the storage location of u_Sampler1');
    return;
  }

  u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
  if(!u_Sampler2){
    console.log('Failed to get the storage location of u_Sampler2');
    return;
  }

  u_Sampler3 = gl.getUniformLocation(gl.program, 'u_Sampler3');
  if(!u_Sampler3){
    console.log('Failed to get the storage location of u_Sampler3');
    return;
  }
  
  u_Sampler4 = gl.getUniformLocation(gl.program, 'u_Sampler4');
  if(!u_Sampler4){
    console.log('Failed to get the storage location of u_Sampler4');
    return;
  }

  u_Sampler5 = gl.getUniformLocation(gl.program, 'u_Sampler5');
  if(!u_Sampler5){
    console.log('Failed to get the storage location of u_Sampler5');
    return;
  }

  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if(!u_whichTexture){
    console.log('Failed to get the storage location of u_whichTexture');
    return;
  }
}

// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// Globals related to UI elements
let g_selectedColor=[1.0,1.0,1.0,1.0]; // Starting color is white
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_selectedSegment = 10;

let g_globalAngle = 0;
let g_cameraAngle = 0;

let g_yellowAngle = 0;
let g_magentaAngle = 0;
let g_armAngle = 0;
let g_eyeAngle = 0;
let pokeSize = 0;


let g_yellowAnimation = false;
let g_magentaAnimation = false;
let g_armAnimation = false;
let g_eyeAnimation = false;
let g_pokeAnimation = true;
let g_normalOn = false;
let g_lightOn = true;
let g_lightPos = [0,1,-0.75];

// Set up actions for the HTML UI elements
function addActionsForHtmlUI(){
  
  // Lighting Sliders
  document.getElementById('lightSlideX').addEventListener('input',function(){g_lightPos[0] = -this.value/100; renderAllShapes();});
  document.getElementById('lightSlideY').addEventListener('input',function(){g_lightPos[1] = this.value/100; renderAllShapes();});
  document.getElementById('lightSlideZ').addEventListener('input',function(){g_lightPos[2] = -this.value/100; renderAllShapes();});
 

  // Lighting Button
  document.getElementById('lightOn').onclick = function(){g_lightOn = true;};
  document.getElementById('lightOff').onclick = function(){g_lightOn = false;};

  // Left Right Slider 
  document.getElementById('angleSlide').addEventListener('input',function(){g_globalAngle = this.value; renderAllShapes();});

  // Up Down Slider 
  document.getElementById('upDownSlide').addEventListener('input',function(){g_cameraAngle = this.value; renderAllShapes();});

  // Ear Wiggle Slider 
  document.getElementById('yellowSlide').addEventListener('input',function(){g_yellowAngle = this.value; renderAllShapes();});

  // Ear Dance Slider 
  document.getElementById('magentaSlide').addEventListener('input',function(){g_magentaAngle = this.value; renderAllShapes();});

  // Arm Slider 
  document.getElementById('armSlide').addEventListener('input',function(){g_armAngle = this.value; renderAllShapes();})
  
  // Eye Slider 
  document.getElementById('eyeSlide').addEventListener('input',function(){g_eyeAngle = this.value; renderAllShapes();})

  // Button events 
  document.getElementById('animationYellowOffButton').onclick = function(){g_yellowAnimation = false;};
  document.getElementById('animationYellowOnButton').onclick = function(){g_yellowAnimation = true;};

  document.getElementById('animationMagentaOffButton').onclick = function(){g_magentaAnimation = false;};
  document.getElementById('animationMagentaOnButton').onclick = function(){g_magentaAnimation = true;};
  
  document.getElementById('animationArmOffButton').onclick = function(){g_armAnimation = false;};
  document.getElementById('animationArmOnButton').onclick = function(){g_armAnimation = true;};
  
  document.getElementById('animationEyeOffButton').onclick = function(){g_eyeAnimation = false;};
  document.getElementById('animationEyeOnButton').onclick = function(){g_eyeAnimation = true;};
  
  // Normal On/Off
  document.getElementById('normalOn').onclick = function(){g_normalOn = true;};
  document.getElementById('normalOff').onclick = function(){g_normalOn = false;};
}

function initTextures(){

  // IMAGE 0 (SKY)
  var image0 = new Image(); // Create the image object
  if(!image0){
    console.log('Failed to create the image0 object');
    return false;
  }

  // Register the event handler to be called on loading an image
  image0.onload = function(){ sendImageToTEXTURE0(image0);};
  // Tell the browser to load an image
  image0.src = 'sky.png';


  // IMAGE 1 (DIRT)
  var image1 = new Image(); // Create the image object
  if(!image1){
    console.log('Failed to create the image1 object');
    return false;
  }

  // Register the event handler to be called on loading an image
  image1.onload = function(){ sendImageToTEXTURE1(image1);};
  // Tell the browser to load an image
  image1.src = 'dirt.jpg';

  // IMAGE 2 (GRASS)
  var image2 = new Image(); // Create the image object
  if(!image2){
    console.log('Failed to create the image2 object');
    return false;
  }

  // Register the event handler to be called on loading an image
  image2.onload = function(){ sendImageToTEXTURE2(image2);};
  // Tell the browser to load an image
  image2.src = 'grass.jpg';

  // IMAGE 3 (leaf)
  var image3 = new Image(); // Create the image object
  if(!image3){
    console.log('Failed to create the image3 object');
    return false;
  }

  // Register the event handler to be called on loading an image
  image3.onload = function(){ sendImageToTEXTURE3(image3);};
  // Tell the browser to load an image
  image3.src = 'leaf.png';

  // IMAGE 4 (BARK)
  var image4 = new Image(); // Create the image object
  if(!image4){
    console.log('Failed to create the image4 object');
    return false;
  }

  // Register the event handler to be called on loading an image
  image4.onload = function(){ sendImageToTEXTURE4(image4);};
  // Tell the browser to load an image
  image4.src = 'bark.jpg';

  // IMAGE 5 (PATH)
  var image5 = new Image(); // Create the image object
  if(!image5){
    console.log('Failed to create the image5 object');
    return false;
  }

  // Register the event handler to be called on loading an image
  image5.onload = function(){ sendImageToTEXTURE5(image5);};
  // Tell the browser to load an image
  image5.src = 'wall.png';
  


  return true;
}

function sendImageToTEXTURE0(image){

  var texture = gl.createTexture();
  if(!texture){
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis

  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE0);

  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler0,0);

  console.log('finished loadTexture');
}

function sendImageToTEXTURE1(image){

  var texture = gl.createTexture();
  if(!texture){
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis

  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE1);

  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  // Set the texture unit 1 to the sampler
  gl.uniform1i(u_Sampler1,1);

  console.log('finished loadTexture');
}

function sendImageToTEXTURE2(image){

  var texture = gl.createTexture();
  if(!texture){
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis

  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE2);

  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  // Set the texture unit 1 to the sampler
  gl.uniform1i(u_Sampler2,2);

  console.log('finished loadTexture');
}

function sendImageToTEXTURE3(image){

  var texture = gl.createTexture();
  if(!texture){
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis

  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE3);

  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  // Set the texture unit 1 to the sampler
  gl.uniform1i(u_Sampler3,3);

  console.log('finished loadTexture');
}

function sendImageToTEXTURE4(image){

  var texture = gl.createTexture();
  if(!texture){
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis

  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE4);

  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  // Set the texture unit 1 to the sampler
  gl.uniform1i(u_Sampler4,4);

  console.log('finished loadTexture');
}

function sendImageToTEXTURE5(image){

  var texture = gl.createTexture();
  if(!texture){
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis

  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE5);

  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  // Set the texture unit 1 to the sampler
  gl.uniform1i(u_Sampler5,5);

  console.log('finished loadTexture');
}

function main() {

  // Set up canvas and gl variables
  setupWebGL();

  // Set up GLSL shader programs and connect GLSL variables
  connectVariablesToGLSL();

  // Set up actions for the HTML UI elements
  addActionsForHtmlUI();

  setupEventListeners();
  
  g_camera = new Camera();
  document.onkeydown = keydown;
  initTextures();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  canvas.onmousemove = function(ev){if(ev.buttons == 1) {click(ev)}};

  // Specify the color for clearing <canvas>
  //gl.clearColor(0.1647, 0.2509, 0.4392, 1.0); 
  gl.clearColor(0, 0, 0, 1);

  // Render
  requestAnimationFrame(tick);
}


// Global Variables
var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0-g_startTime;

function tick(){
  // Print some debug information so we know we are running
  g_seconds = performance.now()/1000.0-g_startTime;
  // console.log(performance.now());

  // Update Animation Angles
  updateAnimationAngles();

  // Draw everything 
  renderAllShapes();

  // Tell the browser to update again when it has time
  requestAnimationFrame(tick);
}

// Global Variables
var g_shapesList = [];
var poke = false;
let isMouseDown = false;
let g_mouseDragging = false;

function setupEventListeners(){
  // Detect when Shift is pressed
  document.addEventListener("keydown", function (ev) {
    if (ev.key === "Shift") {
      isShiftPressed = true;
    }
  });

  // Detect when Shift is released
  document.addEventListener("keyup", function (ev) {
    if (ev.key === "Shift") {
      isShiftPressed = false;
      poke = false; // Stop animation
      renderAllShapes(); // Re-render without the animation
    }
  });

  // Detect mouse press (Shift + Click)
  canvas.addEventListener("mousedown", function (ev) {
    isMouseDown = true;

    if (ev.shiftKey) { // Check if Shift is held during click
      console.log("Shift + Click detected, triggering poke animation");
      poke = true;
      renderAllShapes(); // Begin animation
    }
  });

  // Detect mouse release
  canvas.addEventListener("mouseup", function () {
    isMouseDown = false;
    poke = false;
    pokeAnimationFrame = 0; // Reset animation
    renderAllShapes(); // Re-render to remove animation
  });
}

function click(ev) {
  // Extract the event click and return it in WebGL coordinates
  let [x,y] = convertCoordinatesEventToGL(ev);

  let point;

  // Mouse down: Start dragging
  canvas.onmousedown = function (event) {
    g_mouseDragging = true;
    [g_mouseLastX, g_mouseLastY] = convertCoordinatesEventToGL(event);
  };

  // Mouse up: Stop dragging
  canvas.onmouseup = function () {
    g_mouseDragging = false;
  };

  // Mouse move: Adjust camera angles while dragging
  canvas.onmousemove = function (event) {
      if (g_mouseDragging) {
        let [newX, newY] = convertCoordinatesEventToGL(event);
        let dx = newX - g_mouseLastX;
        let dy = newY - g_mouseLastY;

        g_globalAngle -= dx * 90; // Horizontal movement adjusts global rotation by 5 deg
        // g_cameraAngle -= dy * 180; // Vertical movement adjusts camera angle

        g_mouseLastX = newX;
        g_mouseLastY = newY;

        renderAllShapes(); // Re-render with updated angles
      }
    };

  if(g_selectedType == POINT){
    point = new Point();
  }
  else if(g_selectedType == TRIANGLE){
    point = new Triangle();
  }
  else{
    point = new Circle();
    point.segments = g_selectedSegment;
  }
  point.position = [x,y];
  point.color = g_selectedColor.slice();
  point.size = g_selectedSize;
  g_shapesList.push(point);

  //Draw every shape that is supposed to be in the canvas
  renderAllShapes();
}

function convertCoordinatesEventToGL(ev){
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return([x,y]);
}

// Update the angles of everything if currently animated
function updateAnimationAngles(){
  if(g_yellowAnimation){
    g_yellowAngle = (10* Math.sin(g_seconds));
  }

  if(g_magentaAnimation){
    g_magentaAngle = (10 * Math.sin(2*g_seconds));
  }

  if(g_armAnimation){
    g_armAngle = 10 * Math.sin(g_seconds * 2);
  }
  
  if(g_eyeAnimation){
    g_eyeAngle = 0.1 * Math.sin(g_seconds * 2); 
  }

  if (g_pokeAnimation) {
    pokeSize = 0.3 + 0.01 * Math.sin(g_seconds * 2);
  }

  g_lightPos[0] = Math.cos(g_seconds);
  
}

function keydown(ev){
  if(ev.keyCode === 87){ // W key
    g_camera.moveForward();
  }
  if(ev.keyCode === 83){ // S key
    g_camera.moveBackwards();
  }
  if(ev.keyCode === 65){ // A key
    g_camera.moveLeft();
  }
  if(ev.keyCode === 68){ // D key
    g_camera.moveRight();
  } 
  if(ev.keyCode === 81){ // Q key
    g_camera.panLeft();
    console.log('left q pressed');
  }
  if(ev.keyCode === 69){ // E key
    g_camera.panRight();
  }
  renderAllShapes();
}

function drawCube(matrix,color,textureNum){
  const cube = new Cube();
  cube.matrix = matrix;
  cube.color = color;
  cube.textureNum = textureNum;
  cube.render();
}

function drawSphere(matrix,color,radius,segments,textureNum){
  const sphere = new Sphere();
  sphere.matrix = matrix;
  sphere.color = color;
  sphere.radius = radius;
  sphere.latSegments = segments;
  sphere.lonSegments = segments;
  sphere.textureNum = textureNum;
  sphere.render();
}

function drawNewSphere(matrix, color, textureNum){
  const sphere = new newSphere();
  sphere.matrix = matrix;
  sphere.color = color;
  sphere.textureNum = textureNum;
  sphere.render();
}

function renderAllShapes(){

  // Check the time at the start of this function
  var startTime = performance.now();

  // Pass the projection matrix 
  var projMat = g_camera.projMat;
  gl.uniformMatrix4fv(u_ProjectionMatrix,false,projMat.elements);

  // Pass the view matrix
  var viewMat = g_camera.viewMat;
  viewMat.setLookAt(
    g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2],
    g_camera.at.elements[0], g_camera.at.elements[1], g_camera.at.elements[2],
    g_camera.up.elements[0], g_camera.up.elements[1], g_camera.up.elements[2]
  );
  gl.uniformMatrix4fv(u_ViewMatrix,false,viewMat.elements);

  // Pass the matrix to u_ModelMatrix attribute
  var globalRotMat=new Matrix4()
  .rotate(g_globalAngle,0,1,0)
  .rotate(-g_cameraAngle,1,0,0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Pass the light position to GLSL
  gl.uniform3f(u_lightPos,g_lightPos[0],g_lightPos[1], g_lightPos[2]);

  // Pass the camera position to GLSL
  gl.uniform3f(u_cameraPos,g_camera.eye.elements[0],g_camera.eye.elements[1], g_camera.eye.elements[2]);

  // Pass the light status
  gl.uniform1i(u_lightOn,g_lightOn);

  // Draw the light
  var light=new Cube();
  light.color = [2,2,0,1];
  light.textureNum = -2;
  light.matrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  light.matrix.scale(-0.1,-0.1,-0.1);
  light.matrix.translate(-0.5,-0.5,-0.5);
  light.render();

  drawMap();  
  drawWorld();

  // Check the time at the end of the function, and show on the web page
  var duration = performance.now() - startTime;
  sendTextToHTML(" Canvas Stats: ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "numdot");
}

// Set the text of a HTML element
function sendTextToHTML(text,htmlID){
  var htmlElm = document.getElementById(htmlID);
  if(!htmlElm){
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}

function drawMap(){

  let centerX = 16; // Totoro's X position
  let centerY = 22; 

  let baseHeight = 3; 
  let hillVariation = 3;

  for(x = 0; x < 32; x++){
    for(y = 0; y < 32; y++){

      if(x == 0 || x == 31 || y==31 || y == 0){

        // Create a smooth hilly effect using sine waves and random offsets
        let height = baseHeight + Math.floor(Math.sin(x * 0.5) * hillVariation + Math.cos(y * 0.4) * hillVariation);
        height = Math.max(2, height); 

        // Loop to stack hill blocks vertically
        for (let h = 0; h < height; h++) {
            let hillBlock = new Matrix4();
            hillBlock.translate(0, -0.5, 0);
            hillBlock.scale(.3, .3, .3);
            hillBlock.translate(x - 16, h, y - 16);
            drawCube(hillBlock, [0.3, 0.6, 0.3, 1], 5); 
        }
      }
    }
  }

  // Draw Cherry Trees
  drawTree(2,2);
  drawTree(-3,0);
  drawTree(2, -4)

  // Draw Hidden Soot Sprite
  drawSootSprite(1,1.2,0);


  let flowerColors = [
    [1, 0.75, 0.8, 1],  // Pastel pink
    [1, 0.5, 0.7, 1],   // Medium pink
    [1, 0.3, 0.6, 1],   // Darker pink
    [0.9, 0.6, 0.7, 1], // Muted pink
    [1, 0.85, 0.9, 1]   // White pink
];

  let radius = 3; 
  let numFlowers = 30;
  let scale = 0.15;

  for (let i = 0; i < numFlowers; i++) {
      let t = (i / numFlowers) * Math.PI * 2;
      let x = 16 + scale * (16 * Math.pow(Math.sin(t), 3));
      let y = 16 + scale * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));


      // Draw Stem
      let flowerStem = new Matrix4();
      flowerStem.translate(x - 16, -0.5, y - 16);
      flowerStem.scale(0.1, 0.4, 0.1);
      drawCube(flowerStem, [0, 0.55, 0, 1], -2);

      // Draw Flower Head
      let flowerHead = new Matrix4();
      flowerHead.translate(x - 16, -0.1, y - 16);
      flowerHead.scale(.15, .15, .15);

      let color = flowerColors[Math.floor(Math.random() * flowerColors.length)];
      drawCube(flowerHead, color, -2);
  }
  

}

function drawTree(treeX,treeY){

    let trunk = new Matrix4();
    trunk.translate(treeX, -0.5, treeY);
    trunk.scale(0.8, 2, 0.8);
    drawCube(trunk, [0.4, 0.2, 0, 1], 4); 

    let trunkHeight = 1.5;
    let leafBaseHeight = 2.5;

    // Citation: DRAW CHERRY TREE Leaves - ChatGPT
    let leafStartHeight = trunkHeight;
    let leafLayers = [
        { size: 2, yOffset: 0 }, 
        { size: 1.5, yOffset: 0.5 },
        { size: 1, yOffset: 1 },
    ];

    for (let layer of leafLayers) {
        let size = layer.size;
        let yOffset = leafStartHeight + layer.yOffset;

        for (let lx = -size; lx <= size; lx++) {
            for (let lz = -size; lz <= size; lz++) {
                if (Math.abs(lx) + Math.abs(lz) <= size + 0.5) {
                    let leaves = new Matrix4();

                    leaves.translate(treeX + lx, yOffset, treeY + lz);
                    leaves.scale(0.8, 0.8, 0.8);
                    drawCube(leaves, [0, 0.6, 0, 1], 3); 
                }
            }
        }
    }
}



function drawWorld(){
  
  // Sky Box
  var sky = new Matrix4();
  sky.scale(-20,-20,-20);
  sky.translate(-0.5, -0.5, -0.5);
  let skytextureNum = 0;
  if(g_normalOn) skytextureNum = -3;
  console.log("gnormalon",skytextureNum );
  // drawCube(sky, [0.53, 0.81, 0.98, 1.0], skytextureNum);
  drawCube(sky, [1, 1, 1, 1.0], skytextureNum);

  // Floor
  let body = new Matrix4();
  body.translate(0,-0.5001, 0.0);
  body.scale(20,0.01,20); 
  body.translate(-0.5,0,-0.5);
  drawCube(body, [.2, .9, .4, 1], 2);
}
function drawAnimal() {
  const gray = [0.5, 0.5, 0.5, 1.0];
  const shading_gray = [0.49, 0.49, 0.49, 1.0];
  const white = [1.0, 1.0, 1.0, 1.0];
  const leaf = [0.75, 0.86, 0.35, 1.0];
  const black = [0.0, 0.0, 0.0, 1.0];
  const beige = [0.874, 0.835, 0.718, 1.0];

  // BODY
  let bodyMatrix = new Matrix4();
  bodyMatrix.translate(-0.5, -0.5, 0); 
  bodyMatrix.scale(0.8, 1, 0.5); 
  bodyMatrix.translate(0.1, 0.0, 0); 
  drawCube(bodyMatrix, gray,-2);

  // BELLY (CHILD OF BODY)
  const bellyMatrix = new Matrix4(bodyMatrix);
  bellyMatrix.translate(0.08, 0.08, -0.05); 
  bellyMatrix.scale(0.85, 0.85, 0.5); 

  // BELLY MARKS (CHILDREN OF BELLY)
  const middleMarkMatrix = new Matrix4(bellyMatrix);
  middleMarkMatrix.translate(0.42, 0.8, -0.2);
  middleMarkMatrix.scale(0.2, 0.05, 0.9);
  drawCube(middleMarkMatrix, gray,-2);

  const leftMarkMatrix = new Matrix4(bellyMatrix);
  leftMarkMatrix.translate(0.1, 0.74, -0.21);
  leftMarkMatrix.rotate(15, 0, 0, 1);
  leftMarkMatrix.scale(0.2, 0.05, 0.9);
  drawCube(leftMarkMatrix, gray,-2);

  const rightMarkMatrix = new Matrix4(bellyMatrix);
  rightMarkMatrix.translate(0.72, 0.79, -0.2);
  rightMarkMatrix.rotate(-15, 0, 0, 1);
  rightMarkMatrix.scale(0.2, 0.05, 0.9);
  drawCube(rightMarkMatrix, gray,-2);

  // HEAD (CHILD OF BODY)
  let headMatrix = new Matrix4(bodyMatrix);
  headMatrix.translate(0.05, 1, 0);
  headMatrix.scale(0.9, 0.15, 1);
  drawCube(headMatrix, gray,-2);

  // EYES (CHILDREN OF HEAD)
  const leftEyeMatrix = new Matrix4(headMatrix);
  leftEyeMatrix.translate(0.12, 0.13, 0.26);
  leftEyeMatrix.scale(0.15, 0.6, -0.3);
  drawCube(leftEyeMatrix, white,-2);

  const rightEyeMatrix = new Matrix4(headMatrix);
  rightEyeMatrix.translate(0.72, 0.13, 0.26);
  rightEyeMatrix.scale(0.15, 0.6, -0.3);
  drawCube(rightEyeMatrix, white,-2);

  // PUPILS (CHILDREN OF EYES)
  const leftPupilMatrix = new Matrix4(leftEyeMatrix);
  leftPupilMatrix.translate(0.45, 0.45 - g_eyeAngle, 0.02);
  leftPupilMatrix.scale(0.5, 0.5, 1);
  drawCube(leftPupilMatrix, black,-2);

  const rightPupilMatrix = new Matrix4(rightEyeMatrix);
  rightPupilMatrix.translate(0.06, 0.45 - g_eyeAngle, 0.02);
  rightPupilMatrix.scale(0.5, 0.5, 1);
  drawCube(rightPupilMatrix, black,-2);

  // NOSE (CHILD OF HEAD)
  const noseMatrix = new Matrix4(headMatrix);
  noseMatrix.translate(0.43, 0.15, 0.26);
  noseMatrix.scale(0.15, 0.25, -0.3);
  drawCube(noseMatrix, black,-2);

  // EARS (CHILDREN OF HEAD)
  // LEFT EAR
  const leftEarMatrix = new Matrix4(headMatrix);
  leftEarMatrix.translate(.12, 0.8, 0);
  leftEarMatrix.scale(0.15, 0.7, 0.2);
  leftEarMatrix.rotate(-g_yellowAngle, 0, 0, 1);
  drawCube(leftEarMatrix, gray,-2);

  // LEFT TOP EAR
  const leftTopMatrix = new Matrix4(leftEarMatrix);
  leftTopMatrix.translate(-0.1, 1, 0); 
  leftTopMatrix.scale(1.2, .7, 1);
  leftTopMatrix.rotate(g_magentaAngle,0,1,0);
  drawCube(leftTopMatrix, gray,-2);

  // RIGHT EAR
  const rightEarMatrix = new Matrix4(headMatrix);
  rightEarMatrix.translate(0.73, 0.8, 0);
  rightEarMatrix.scale(0.15, 0.7, 0.2);
  rightEarMatrix.rotate(-g_yellowAngle, 0, 0, 1);
  drawCube(rightEarMatrix, gray,-2);

  // RIGHT TOP EAR
  const rightTopMatrix = new Matrix4(rightEarMatrix);
  rightTopMatrix.translate(-0.1, 1, 0);
  rightTopMatrix.scale(1.2, .7, 1);
  rightTopMatrix.rotate(g_magentaAngle,0,1,0);
  drawCube(rightTopMatrix, gray,-2);

  // HAT (CHILD OF HEAD)
  const hatBaseMatrix = new Matrix4(headMatrix);
  hatBaseMatrix.translate(0.3, 0.9, 0.1);
  hatBaseMatrix.scale(0.4, 0.35, 0.6);
  drawCube(hatBaseMatrix, leaf,-2);

  // HAT STEM
  const hatStemMatrix = new Matrix4(hatBaseMatrix);
  hatStemMatrix.translate(.40, 1, 0.4);
  hatStemMatrix.scale(0.2, 1.5, 0.15);
  drawCube(hatStemMatrix, leaf,-2);

  // RIGHT SHOULDER
  const rightShoulderMatrix = new Matrix4(bodyMatrix);
  rightShoulderMatrix.translate(1, 0.5, 0);
  rightShoulderMatrix.scale(0.2, 0.3, 0.3);
  drawCube(rightShoulderMatrix, gray,-2);

  // RIGHT ARM
  const rightArmBase = new Matrix4(rightShoulderMatrix);
  rightArmBase.translate(0, -0.6, 0);
  rightArmBase.rotate(g_armAngle, 1, 0, 0);
  rightArmBase.scale(1, 1, 1);
  drawCube(rightArmBase, gray,-2);

  // RIGHT HAND
  const rightArmSphere = new Matrix4(rightArmBase);
  rightArmSphere.translate(0.5, 0, 0.5);
  rightArmSphere.scale(2, 1, 2.4);
  drawSphere(rightArmSphere, gray, 0.25, 20);

  
  // LEFT SHOULDER
  const leftShoulderMatrix = new Matrix4(bodyMatrix);
  leftShoulderMatrix.translate(-0.2, 0.5, 0);
  leftShoulderMatrix.scale(0.2, 0.3, 0.3);
  drawCube(leftShoulderMatrix, gray,-2);
  
  //LEFT ARM
  const leftArmBase = new Matrix4(leftShoulderMatrix);
  leftArmBase.translate(0, -.6, 0);
  leftArmBase.rotate(-g_armAngle, 1, 0, 0);
  leftArmBase.scale(1, 1, 1);
  drawCube(leftArmBase, gray,-2);

  // LEFT HAND
  const leftArmSphere = new Matrix4(leftArmBase);
  leftArmSphere.translate(0.5, 0, 0.5);
  leftArmSphere.scale(2, 1,2.4);
  drawSphere(leftArmSphere, gray, 0.25, 20); 

  // LEFT FOOT
  const leftFootMatrix = new Matrix4(bodyMatrix);
  leftFootMatrix.translate(0.25, 0.2, -0.1);
  leftFootMatrix.scale(1, 1, 0.6);
  drawSphere(leftFootMatrix, shading_gray, 0.2,20);

  // RIGHT FOOT
  const rightFootMatrix = new Matrix4(bodyMatrix);
  rightFootMatrix.translate(0.75, 0.2, -0.1);
  rightFootMatrix.scale(1, 1, 0.6); 
  drawSphere(rightFootMatrix, shading_gray, 0.2,20); 

  // SPHERE BELLY
  const bellySphereMatrix = new Matrix4(bodyMatrix);
  bellySphereMatrix.translate(0.5,0.5,0.1);
  bellySphereMatrix.scale(1.6,1.6,1);
  bellySphereMatrix.rotate(90,0,0,1);
  drawSphere(bellySphereMatrix, beige, 0.3,20,-1);

  // SMILE (POKE)
  if(poke){
    console.log("poke is true");
    const smileMatrix = new Matrix4(headMatrix);
    smileMatrix.translate(0.36,-.2,-.01);
    smileMatrix.scale(pokeSize,0.2,0.2);
    drawCube(smileMatrix, white,-2);
  
    for (let i = 0; i < 5; i++) {
      const toothMatrix = new Matrix4(smileMatrix); 
      toothMatrix.translate(0.09 + i * 0.2, 0, -0.12); 
      toothMatrix.scale(0.02, 1, 0.2);
      drawCube(toothMatrix, black,-2);
    }
  }

}

function drawSootSprite(x, y, z) {
  let sootMatrix = new Matrix4();
  sootMatrix.translate(x, y, z);
  // sootMatrix.rotate(180,1,0,0);
  // sootMatrix.rotate(180,0,0,1);
  sootMatrix.scale(0.5,0.5,0.5);
  sootMatrix.translate(0,-2.49,0);
  let tex = -2;
  if(g_normalOn) tex = -3;
  drawNewSphere(sootMatrix, [0, 0, 0, 1], tex);
}
