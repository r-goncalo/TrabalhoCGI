import { buildProgramFromSources, loadShadersFromURLS, setupWebGL } from "../../libs/utils.js";
import { ortho, lookAt, flatten, mult, rotateY, perspective, rotate, vec3, normalMatrix, cross } from "../../libs/MV.js";
import {modelView, loadMatrix, multRotationY, multRotationX, multRotationZ, multScale, pushMatrix, popMatrix, multTranslation, multMatrix } from "../../libs/stack.js";
import {
    perspective,
    lookAt,
    flatten,
    vec3,
    vec4,
    normalMatrix,
    mult,
    scale,
    rotateX,
    rotateY,
    rotateZ,
  } from "../../libs/MV.js";

import * as SPHERE from '../../libs/objects/sphere.js';
import * as CYLINDER from '../../libs/objects/cylinder.js';
import * as CUBE from '../../libs/objects/cube.js';
import * as BUNNY from '../../libs/objects/bunny.js';
import * as PYRAMID from  '../../libs/objects/pyramid.js';
import * as TORUS from  '../../libs/objects/torus.js';

import {GUI} from '../../libs/dat.gui.module.js';


let gl;
const VP_DISTANCE = 5;




function setup(shaders)
{
    
    let canvas = document.getElementById("gl-canvas");
    let aspect = canvas.width / canvas.height;
/**
 * 
 * END OF CAMERAS INFORMATION
 * 
 */


/**
 * 
 * BASIC GL STUFF
 * 
 */

    gl = setupWebGL(canvas);

    let program = buildProgramFromSources(gl, shaders["shader1.vert"], shaders["shader1.frag"]);



    gl.clearColor(56/255, 56/255, 56/255, 1.0);
    CUBE.init(gl);
    SPHERE.init(gl);
    CYLINDER.init(gl);
    BUNNY.init(gl);
    window.requestAnimationFrame(render);


/**
 * 
 * END OF BASIC GL STUFF
 * 
 */

/*  
        GUI SETUP
*/

const gui = new GUI();

let optionsController = {

    "Backface culling" : true,
    "Depth buffer" : false

};

const optionsFolder = gui.addFolder("options");
optionsFolder.add( optionsController, 'Backface culling');
optionsFolder.add( optionsController, 'Depth buffer');

//gl.enable(gl.CULL_FACE);

let camera = {
    eye: vec3(0,5,10),
    at: vec3(0,0,0),
    up: vec3(0,1,0),
    fovy : 45,
    near : 0.1,
    far: 40
};


let cameraFolder = gui.addFolder("camera");
cameraFolder.add(camera, 'fovy', 1, 100, 1);
cameraFolder.add(camera, 'near', 0.1, 20, 0.1 );
cameraFolder.add(camera, 'far', 0.1, 20, 0.1);

const eyeFolder = gui.addFolder("eye");
eyeFolder.add(camera.eye, 0).step(0.05).name("x");
eyeFolder.add(camera.eye, 1).step(0.05).name("y");
eyeFolder.add(camera.eye, 2).step(0.05).name("z");

const atFolder = gui.addFolder("At");
atFolder.add(camera.at, 0).step(0.05).name("x");
atFolder.add(camera.at, 1).step(0.05).name("y");
atFolder.add(camera.at, 2).step(0.05).name("z");

const upFolder = gui.addFolder("Up");
upFolder.add(camera.up, 0).step(0.05).name("x");
upFolder.add(camera.up, 1).step(0.05).name("y");
upFolder.add(camera.up, 2).step(0.05).name("z");

let lightsController = {};


let lights = [
    {
        ambient: [50,50,50],
        diffuse: [60, 60, 60],
        specular: [200,200,200],
        position: [0.0, 0.0, 10.0, 1.0],
        axis: [0.0, 0.0, -1.0],
        aperture: 10.0,
        cutoff: 10
    },
    {
        ambient: [500, 0.0,0.0],
        diffuse: [50, 0.0, 0.0],
        specular: [150,0.0,0.0],
        position: [-20.0, 5.0, 5.0, 1.0],
        axis: [-20.0, 5.0, 5.0],
        aperture: 180.0,
        cutoff: -1
    }
]

<<<<<<< Updated upstream
=======

/*
function createLight(){
    for(let i = 0; i < MAX_LIGHTS; i++){
        console.log(i);
        let n = i+1;
        const newLight = lightsFolder.addFolder("Light" + n);
        const p = newLight.addFolder("position");
        p.add(lights[i].position, 0).name("x").step(0.1);
        p.add(lights[i].position, 1).name("y").step(0.1);
        p.add(lights[i].position, 2).name("z").step(0.1);
        p.add(lights[i].position, 3).name("w").step(0.1);
        const inte = newLight.addFolder("intensities");
        inte.addColor(lights[i], "ambient").name("ambient");
        inte.addColor(lights[i], "diffuse").name("diffuse");
        inte.addColor(lights[i], "specular").name("specular");
        const ax = newLight.addFolder("axis");
        ax.add(lights[i].axis, 0).name("x").step(0.1);
        ax.add(lights[i].axis, 1).name("y").step(0.1);
        ax.add(lights[i].axis, 2).name("z").step(0.1);
        

        newLight.addColor(lights[i], "aperture").name("aperture");
        newLight.addColor(lights[i], "cutoff").name("cutoff");
        }
}
*/

function createLight(){

        let newLightFolder = lightsFolder.addFolder("Light" + lights.length);

        lights.push({
            active: true,
            ambient: [75, 75,100],
            diffuse: [75, 75, 100],
            specular: [150,150,175],
            position: [3.0, 5.0, 2.0, 1.0],
            axis: [-1.0, 5.0, -2.0],
            aperture: 120.0,
            cutoff: -5
        });

        let p = newLightFolder.addFolder("position");

        p.add(lights[lights.length - 1].position, 0).name("x").step(0.1);
        p.add(lights[lights.length - 1].position, 1).name("y").step(0.1);
        p.add(lights[lights.length - 1].position, 2).name("z").step(0.1);
        p.add(lights[lights.length - 1].position, 3).name("w").step(0.1);


        let inte = newLightFolder.addFolder("intensity");
        inte.addColor(lights[lights.length - 1], "ambient").name("ambient");
        inte.addColor(lights[lights.length - 1], "diffuse").name("diffuse");
        inte.addColor(lights[lights.length -1], "specular").name("specular");

        let ax = newLightFolder.addFolder("axis");
        ax.add(lights[lights.length -1].axis, 0).name("x").step(0.1);
        ax.add(lights[lights.length -1].axis, 1).name("y").step(0.1);
        ax.add(lights[lights.length -1].axis, 2).name("z").step(0.1);
        

        newLightFolder.add(lights[lights.length -1], "aperture").name("aperture");
        newLightFolder.add(lights[lights.length -1], "cutoff").name("cutoff");
   
        lightsFolder.push(newLightFolder);

}


let addlightbutton = {
    add: function () {
      if (lights.length < MAX_LIGHTS) {
          createLight();
      }

lightsFolder.add(addlightbutton, "add").name("Add a new light");

//createLight();

>>>>>>> Stashed changes

/*  
    END OF GUI SETUP
*/

/**
 * 
 * RESIZE STUFF
 * 
 */
    //let mProjection = ortho(-VP_DISTANCE*aspect,VP_DISTANCE*aspect, -VP_DISTANCE, VP_DISTANCE,-3*VP_DISTANCE,3*VP_DISTANCE);
    let mProjection = perspective(camera.fovy, aspect, camera.near, camera.far);

    resize_canvas();
    window.addEventListener("resize", resize_canvas);
    window.addEventListener("resize", function(event) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0,0,canvas.width, canvas.height);
    });

    function resize_canvas(event)
    {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        aspect = canvas.width / canvas.height;

        gl.viewport(0,0,canvas.width, canvas.height);
        let mProjection = perspective(camera.fovy, aspect, camera.near, camera.far);
    }

    /**
     * 
     * RESIZE STUFF
     * 
     */


    /**
     * DESAFIO STUFF
     * 
     */

    // Global variables to keep track of the current mouse position and whether the mouse is being clicked
let mouseX = 0;
let mouseY = 0;
let isMouseDown = false;

// Set up event listeners to track mouse movement
canvas.addEventListener("mousedown", function(event) {
  isMouseDown = true;
});

canvas.addEventListener("mousemove", function(event) {
  // Update the mouse position
  mouseX = event.clientX;
  mouseY = event.clientY;
});

canvas.addEventListener("mouseup", function(event) {
  isMouseDown = false;
});


    /*

let isDragging = false;
let lastX = null;
let lastY = null;

function handleMouseMove(event) {
    if (isDragging) {
    // Calculate the difference in mouse position since the last event
    let dx = event.clientX - lastX;
    let dy = event.clientY - lastY;

    // Update the camera's position and orientation based on the mouse movement
    let rotationX = rotateY(dx * 0.01);
    let rotationY = rotate(dy * 0.01, cross(vec3(camera.at), vec3(camera.up)));
    camera.eye = mult(rotationX, rotationY) * vec3(camera.eye);
    camera.up = mult(rotationX, rotationY) * vec3(camera.up);
    camera.at = mult(rotationX, rotationY) * vec3(camera.at);
    
    }
}
function handleMouseDown(event) {
    isDragging = true;
    lastX = event.clientX;
    lastY = event.clientY;
}

function handleMouseUp(event) {
    isDragging = false;
    lastX = event.clientX;
    lastY = event.clientY;
}

canvas.addEventListener("mousedown", handleMouseDown);
canvas.addEventListener("mousemove", handleMouseMove);
canvas.addEventListener("mouseup", handleMouseUp);

*/
/**
 * END OF DESAFIO STUFF
 */

/**
 * ********Shader Stuff*********
 */
/*

    let materials = {

        BLUE : {materialAmb : vec3(1.0, 0.0, 0.0), materialDif : vec3(1.0, 0.0, 0.0), materialSpe : vec3(1.0, 0.0, 0.0), shininess : 6.0}

    }

    function defineMaterial(material){

        uniform vec3 materialAmb;
        uniform vec3 materialDif;
        uniform vec3 materialSpe;
        uniform float shininess;

        const vmModelView = gl.getUniformLocation(program, "mModelView");
        gl.uniformMatrix4fv(vmModelView, false, flatten(modelView()));

        const vmModelView = gl.getUniformLocation(program, "mModelView");
        gl.uniformMatrix4fv(vmModelView, false, flatten(modelView()));

        const vmModelView = gl.getUniformLocation(program, "mModelView");
        gl.uniformMatrix4fv(vmModelView, false, flatten(modelView()));

    }

*/

    //puts a color in the fragment shader
    function updateModelView(){

        const vmModelView = gl.getUniformLocation(program, "mModelView");
        gl.uniformMatrix4fv(vmModelView, false, flatten(modelView()));

        const vmNormals = gl.getUniformLocation(program, "mNormals");
        gl.uniformMatrix4fv(vmModelView, false, flatten(normalMatrix(modelView())));

    }





/**
 * ********End of Shader  Stuff*********
 */





/**
 * ********SCENE*********
 */


function renderGround(){


    multScale([10, 0.5, 10]);
    updateModelView();
    //defineMaterial(materials.BROWN); 
    CUBE.draw(gl, program, gl.TRIANGLES);


}

function renderCube(){

    multScale([1, 1, 1]);
    multTranslation([0,0,0]);
    updateModelView();
    //defineMaterial(materials.PINK); 
    CUBE.draw(gl, program, gl.TRIANGLES);

}

function renderCylinder(){
    multScale([0.1, 0.1, 0.1]);
    multTranslation([-7,0.2,0])
    updateModelView();
    //defineMaterial(materials.BRIGHT_BLUE);
    CYLINDER.draw(gl, program, gl.TRIANGLES);
}

function renderSphere(){
    multScale([1, 1, 1]);
    multTranslation([5,0,0])
    updateModelView();
    //defineMaterial(materials.BLACK);
    SPHERE.draw(gl, program, gl.TRIANGLES);
}

function renderBunny(){
    multScale([5, 5, 5]);
    multTranslation([0.3,0,0])
    updateModelView();
    //defineMaterial(materials.BRIGHT_GREEN);
    BUNNY.draw(gl, program, gl.TRIANGLES);
}

function renderPrimitives(){

    pushMatrix();
        renderCube();
    popMatrix();
    pushMatrix();
        renderBunny();
    popMatrix();
    pushMatrix();
        renderCylinder();
    popMatrix();
        renderSphere();

}


function renderScene(){


    pushMatrix();
        renderGround();
    popMatrix();
        renderPrimitives();



}

/**
 * ********END OF SCENE*********
 */



    function renderCamera(){

        mProjection = perspective(camera.fovy, aspect, camera.near, camera.far);
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "mProjection"), false, flatten(mProjection));
        
        
        // In your rendering loop, check if the mouse is being clicked and update the camera's position and orientation
        if (isMouseDown) {
            // Use the mouse movement to update the camera's orientation
            let rotationX = (camera.eye[0] + mouseY) / (canvas.height / 2);
            let rotationY = (camera.eye[1] + mouseX) / (canvas.width / 2);

            let mView = lookAt(vec3(rotationX, rotationY, camera.eye[2]), camera.at, camera.up);
            gl.uniformMatrix4fv(gl.getUniformLocation(program, "mView"), false, flatten(mView));
            gl.uniformMatrix4fv(gl.getUniformLocation(program, "mViewNormals"), false, flatten(normalMatrix(mView)));

            loadMatrix(mView);
      }
      else{
            let mView = lookAt(camera.eye, camera.at, camera.up);
            gl.uniformMatrix4fv(gl.getUniformLocation(program, "mView"), false, flatten(mView));
            gl.uniformMatrix4fv(gl.getUniformLocation(program, "mViewNormals"), false, flatten(normalMatrix(mView)));

<<<<<<< Updated upstream
        loadMatrix(mView);
        //multRotationX(axoController.Gama);
        //multRotationY(axoController.Teta);
        //multTranslation(zoomController.far);
=======
            loadMatrix(mView);}

        
>>>>>>> Stashed changes
    

    }


<<<<<<< Updated upstream
=======
    function loadLights(){

        gl.uniform1i(gl.getUniformLocation(program, "nLights"), false, lights.length);

        for(let i = 0; i < lights.length; i++){

            gl.uniform4f(gl.getUniformLocation(program, "lights[" + i + "].position"), lights[i].position.x, lights[i].position.y, lights[i].position.z, lights[i].position.w);
            gl.uniform3f(gl.getUniformLocation(program, "light[" + i + "].ambient"), lights[i].ambient.x  / 255,lights[i].ambient.y / 255,lights[i].ambient.z / 255);
            gl.uniform3f(gl.getUniformLocation(program, "lights[" + i + "].diffuse"),lights[i].diffuse.x / 255, lights[i].diffuse.y / 255, lights[i].diffuse.z / 255);
            gl.uniform3f(gl.getUniformLocation(program, "lights[" + i + "].specular"), lights[i].specular.x / 255, lights[i].specular.y / 255, lights[i].specular.z / 255);
            gl.uniform3f(gl.getUniformLocation(program, "lights[" + i + "].axis"), lights[i].axis.x,  lights[i].axis.y,  lights[i].axis.z);
            gl.uniform1f(gl.getUniformLocation(program, "lights[" + i + "].aperture"), lights[i].aperture);
            gl.uniform1f(gl.getUniformLocation(program, "lights[" + i + "].cutoff"), lights[i].cutoff);
            gl.uniform1i(gl.getUniformLocation(program, "lights[" + i + "].active"), lights[i].active);
        }

    }

    

    function loadOptions(){

        if (optionsController["Backface culling"]) {

            gl.enable(gl.CULL_FACE);
            gl.cullFace(gl.BACK);

          } else {

            gl.disable(gl.CULL_FACE);

          }

          
          if (optionsController["Depth buffer"]) {

            gl.enable(gl.DEPTH_TEST);

          } else {

            gl.disable(gl.DEPTH_TEST);
          }

    }


>>>>>>> Stashed changes

    function render()
    {


        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        gl.useProgram(program);
    
<<<<<<< Updated upstream
=======
        loadOptions();

        loadLights();

   
>>>>>>> Stashed changes
        renderCamera();
        renderScene();



        window.requestAnimationFrame(render);


        
    }
}

const urls = ["shader1.vert", "shader1.frag"];
loadShadersFromURLS(urls).then(shaders => setup(shaders))



let rotate = false;
let deltaTime = 0;
const SPEED = 100;

const RGB = 255;

const GROUND_SCALE_X_Z = 3.0;
const GROUND_SCALE_Y = 0.1;
const GROUND_Y_LVL = -GROUND_SCALE_Y / 2 - 0.5;

const LIGHT_SCALE = 0.125;

const MAX_LIGHTS = 8;

let lights = [];
let lightFolders = [];

// These constants help decide if a light rotates in the X, Y or Z axis
const X_AXIS = 0;
const Y_AXIS = 1;
const Z_AXIS = 2;

function setup(shaders) {
  let canvas = document.getElementById("gl-canvas");
  let aspect = canvas.width / canvas.height;

  gl = setupWebGL(canvas);

  let program = buildProgramFromSources(
    gl,
    shaders["shader.vert"],
    shaders["shader.frag"]
  );

  // Interface

  let camera = {
    eye: vec3(5, 2.5, 5),
    at: vec3(0, 0, 0),
    up: vec3(0, 1, 0),
    fovy: 45,
    aspect: 1.0,
    near: 0.1,
    far: 20,
  };

  let options = {
    wireframe: false,
    back_face_culling: true,
    depth_buffer: true,
    lights: false,
  };

  let materialinfoground = {
    object: "Cube",
    ka: vec3(50, 50, 75),
    kd: vec3(125, 200, 215),
    ks: vec3(RGB, RGB, RGB),
    shininess: 50,
  };

  let materialinfoprimitive = {
    object: "Sphere",
    ka: vec3(50, 50, 75),
    kd: vec3(125, 200, 215),
    ks: vec3(RGB, RGB, RGB),
    shininess: 50,
  };

  let materialinfolight = {
    object: "Sphere",
    ka: vec3(RGB, RGB, RGB),
    kd: vec3(RGB, RGB, RGB),
    ks: vec3(RGB, RGB, RGB),
    shininess: 100,
  };

  let newlightinfo = {
    active: true, // default value
    directional: false, // default value
    x: 0, // default value
    y: 1, // default value
    z: 0, // default value
    ia: vec3(75, 75, 75), // default value
    id: vec3(175, 175, 175), // default value
    is: vec3(RGB, RGB, RGB), // default value
    rotationAxis: -1, // default value
  };

  const gui1 = new dat.GUI();

  const optionsGui = gui1.addFolder("Options");
  optionsGui.add(options, "wireframe");
  optionsGui.add(options, "back_face_culling");
  optionsGui.add(options, "depth_buffer");
  optionsGui.add(options, "lights");

  const cameraGui = gui1.addFolder("Camera");
  cameraGui.add(camera, "fovy").min(1).max(100).step(1).listen();
  cameraGui
    .add(camera, "aspect")
    .min(0)
    .max(10)
    .step(0.1)
    .listen().domElement.style.pointerEvents = "none";
  cameraGui
    .add(camera, "near")
    .min(0.1)
    .max(20)
    .step(0.1)
    .listen()
    .onChange(function (v) {
      camera.near = Math.min(camera.far - 0.5, v);
    });
  cameraGui
    .add(camera, "far")
    .min(0.1)
    .max(20)
    .step(0.1)
    .listen()
    .onChange(function (v) {
      camera.far = Math.min(camera.far + 0.5, v);
    });

  const eye = cameraGui.addFolder("Eye");
  eye.add(camera.eye, 0).step(0.05).name("x");
  eye.add(camera.eye, 1).step(0.05).name("y");
  eye.add(camera.eye, 2).step(0.05).name("z");

  const at = cameraGui.addFolder("At");
  at.add(camera.at, 0).step(0.05).name("x");
  at.add(camera.at, 1).step(0.05).name("y");
  at.add(camera.at, 2).step(0.05).name("z");

  const up = cameraGui.addFolder("Up");
  up.add(camera.up, 0).step(0.05).name("x");
  up.add(camera.up, 1).step(0.05).name("y");
  up.add(camera.up, 2).step(0.05).name("z");

  const lightsGui = gui1.addFolder("Lights");

  let rotatelightsbutton = {
    rotate: function () {
      if (lights.length > 0) {
        for (let i = 0; i < lights.length; i++) {
          if (lights[i].rotationAxis == -1) {
            lights[i].rotationAxis = randomInteger(0, 2);
          } else {
            window.alert("The lights are already rotating!");
            break;
          }
        }
        rotate = true;
      } else {
        window.alert("There are no lights to rotate!");
      }
    },
  };

  lightsGui.add(rotatelightsbutton, "rotate").name("Rotate lights");

  let stoprotatelightsbutton = {
    notrotate: function () {
      if (lights.length > 0) {
        for (let i = 0; i < lights.length; i++) {
          lights[i].rotationAxis = -1;
        }
        rotate = false;
      } else {
        window.alert("There are no lights!");
      }
    },
  };

  lightsGui
    .add(stoprotatelightsbutton, "notrotate")
    .name("Stop rotating lights");

  const newLight = lightsGui.addFolder("New light");
  newLight.add(newlightinfo, "active");
  newLight.add(newlightinfo, "directional");
  newLight.add(newlightinfo, "x").step(0.05);
  newLight.add(newlightinfo, "y").step(0.05);
  newLight.add(newlightinfo, "z").step(0.05);
  newLight.addColor(newlightinfo, "ia");
  newLight.addColor(newlightinfo, "id");
  newLight.addColor(newlightinfo, "is");

  let addlightbutton = {
    add: function () {
      if (lights.length < MAX_LIGHTS) {
        let light = { ...newlightinfo };
        if (rotate) {
          light.rotationAxis = randomInteger(0, 2);
        }
        lights.push(light);

        let currentLight = lights[lights.length - 1];
        const lightFolder = lightsGui.addFolder("Light " + lights.length);
        lightFolder.add(currentLight, "active");
        lightFolder.add(currentLight, "directional");
        lightFolder.add(currentLight, "x").step(0.05).listen();
        lightFolder.add(currentLight, "y").step(0.05).listen();
        lightFolder.add(currentLight, "z").step(0.05).listen();
        lightFolder.addColor(currentLight, "ia");
        lightFolder.addColor(currentLight, "id");
        lightFolder.addColor(currentLight, "is");

        lightFolders.push(lightFolder);
      } else {
        window.alert("You have reached the maximum number of lights.");
      }
    },
  };

  lightsGui.add(addlightbutton, "add").name("Add a new light");

  let removelastlightbutton = {
    remove: function () {
      if (lights.length > 0) {
        lightsGui.removeFolder(lightFolders[lights.length - 1]);
        lights.pop();
        lightFolders.pop();
        if (lights.length == 0) {
          rotate = false;
        }
      } else {
        window.alert("No lights have been added yet.");
      }
    },
  };

  lightsGui.add(removelastlightbutton, "remove").name("Remove last light");
  
  
  // Adds an initial light to the scene
  let light = { ...newlightinfo };
  if (rotate) {
    light.rotationAxis = randomInteger(0, 2);
  }
  lights.push(light);

  let currentLight = lights[lights.length - 1];
  const lightFolder = lightsGui.addFolder("Light " + lights.length);
  lightFolder.add(currentLight, "active");
  lightFolder.add(currentLight, "directional");
  lightFolder.add(currentLight, "x").step(0.05).listen();
  lightFolder.add(currentLight, "y").step(0.05).listen();
  lightFolder.add(currentLight, "z").step(0.05).listen();
  lightFolder.addColor(currentLight, "ia");
  lightFolder.addColor(currentLight, "id");
  lightFolder.addColor(currentLight, "is");

  lightFolders.push(lightFolder);
  

  const gui2 = new dat.GUI();

  const materialGui = gui2.addFolder("Material");
  materialGui.add(materialinfoprimitive, "object", [
    "Cube",
    "Cylinder",
    "Pyramid",
    "Sphere",
    "Torus",
  ]);
  materialGui.addColor(materialinfoprimitive, "ka");
  materialGui.addColor(materialinfoprimitive, "kd");
  materialGui.addColor(materialinfoprimitive, "ks");
  materialGui
    .add(materialinfoprimitive, "shininess")
    .min(0.1)
    .max(100)
    .step(0.1)
    .listen();

  // End of Interface

  let mProjection = perspective(camera.fovy, aspect, camera.near, camera.far);

  let mView = lookAt(camera.eye, camera.at, camera.up);

  mode = gl.TRIANGLES;

  resize_canvas();
  window.addEventListener("resize", resize_canvas);

  document.onwheel = function (event) {
    const sign = Math.sign(event.deltaY);

    if (event.ctrlKey == true) {
      camera.eye[2] += sign / 10;
    } else if (event.shiftKey == true) {
      camera.eye[2] += sign / 10;
      camera.at[2] += sign / 10;
    } else {
      camera.fovy += sign;
    }
  };

  gl.clearColor(0.0, 0.0, 0.0, 1.0); // void color

  CUBE.init(gl);
  CYLINDER.init(gl);
  PYRAMID.init(gl);
  SPHERE.init(gl);
  TORUS.init(gl);

  window.requestAnimationFrame(render);

  function resize_canvas(event) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    aspect = canvas.width / canvas.height;

    gl.viewport(0, 0, canvas.width, canvas.height);
    mProjection = perspective(camera.fovy, aspect, camera.near, camera.far);
  }

  function uploadModelView() {
    gl.uniformMatrix4fv(
      gl.getUniformLocation(program, "mModelView"),
      false,
      flatten(modelView())
    );
    gl.uniformMatrix4fv(
      gl.getUniformLocation(program, "mNormals"),
      false,
      flatten(normalMatrix(modelView()))
    );
  }

  function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function Ground() {
    materialInfoGround();

    pushMatrix();
    multTranslation([0, GROUND_Y_LVL, 0]);
    multScale([GROUND_SCALE_X_Z, GROUND_SCALE_Y, GROUND_SCALE_X_Z]);

    uploadModelView();

    CUBE.draw(gl, program, mode);
    popMatrix();
  }

  function Primitive() {
    materialInfoPrimitive();

    pushMatrix();
    uploadModelView();

    switch (materialinfoprimitive.object) {
      case "Cube":
        CUBE.draw(gl, program, mode);
        break;
      case "Cylinder":
        CYLINDER.draw(gl, program, mode);
        break;
      case "Pyramid":
        PYRAMID.draw(gl, program, mode);
        break;
      case "Sphere":
        SPHERE.draw(gl, program, mode);
        break;
      case "Torus":
        TORUS.draw(gl, program, mode);
        break;
    }
    popMatrix();
  }

  function Light(i) {
    materialInfoLight();

    pushMatrix();
    // Decide which axis to rotate if the "Rotate lights" button has been pressed
    const pos = vec4(lights[i].x, lights[i].y, lights[i].z, 1.0);
    let rot;

    switch (lights[i].rotationAxis) {
      case X_AXIS:
        rot = rotateX(deltaTime * SPEED);
        lights[i].x = mult(rot, pos)[0];
        lights[i].y = mult(rot, pos)[1];
        lights[i].z = mult(rot, pos)[2];
        break;
      case Y_AXIS:
        rot = rotateY(deltaTime * SPEED);
        lights[i].x = mult(rot, pos)[0];
        lights[i].y = mult(rot, pos)[1];
        lights[i].z = mult(rot, pos)[2];
        break;
      case Z_AXIS:
        rot = rotateZ(deltaTime * SPEED);
        lights[i].x = mult(rot, pos)[0];
        lights[i].y = mult(rot, pos)[1];
        lights[i].z = mult(rot, pos)[2];
        break;
      case -1:
        break;
    }

    multTranslation([lights[i].x, lights[i].y, lights[i].z]);
    multScale([LIGHT_SCALE, LIGHT_SCALE, LIGHT_SCALE]);

    uploadModelView();
    if (options.lights) {
      SPHERE.draw(gl, program, gl.LINES);
    }
    popMatrix();
  }

  function Lights() {
    for (let i = 0; i < lights.length; i++) {
      Light(i);
    }
  }

  function checkWireframe() {
    if (options.wireframe) {
      mode = gl.LINES;
    } else {
      mode = gl.TRIANGLES;
    }
  }

  function backFaceCulling() {
    if (options.back_face_culling) {
      gl.enable(gl.CULL_FACE);
      gl.cullFace(gl.BACK);
    } else {
      gl.disable(gl.CULL_FACE);
    }
  }

  function depthTest() {
    if (options.depth_buffer) {
      gl.enable(gl.DEPTH_TEST);
    } else {
      gl.disable(gl.DEPTH_TEST);
    }
  }

  function nLightsInfo() {
    const uNLights = gl.getUniformLocation(program, "uNLights");
    gl.uniform1i(uNLights, lights.length);
  }

  function lightInfo() {
    for (let i = 0; i < lights.length; i++) {
      let pos = vec3(lights[i].x, lights[i].y, lights[i].z);

      const uIsActive = gl.getUniformLocation(
        program,
        "uLight[" + i + "].active"
      );
      gl.uniform1i(uIsActive, lights[i].active);
      const uIsDirectional = gl.getUniformLocation(
        program,
        "uLight[" + i + "].directional"
      );
      gl.uniform1i(uIsDirectional, lights[i].directional);
      const uPos = gl.getUniformLocation(program, "uLight[" + i + "].pos");
      gl.uniform3fv(uPos, flatten(pos));
      const uIa = gl.getUniformLocation(program, "uLight[" + i + "].ia");
      gl.uniform3fv(uIa, flatten(scale(1 / RGB, lights[i].ia)));
      const uId = gl.getUniformLocation(program, "uLight[" + i + "].id");
      gl.uniform3fv(uId, flatten(scale(1 / RGB, lights[i].id)));
      const uIs = gl.getUniformLocation(program, "uLight[" + i + "].is");
      gl.uniform3fv(uIs, flatten(scale(1 / RGB, lights[i].is)));
    }
  }

  function materialInfoGround() {
    const uKa = gl.getUniformLocation(program, "uMaterial.ka");
    gl.uniform3fv(uKa, flatten(scale(1 / RGB, materialinfoground.ka)));
    const uKd = gl.getUniformLocation(program, "uMaterial.kd");
    gl.uniform3fv(uKd, flatten(scale(1 / RGB, materialinfoground.kd)));
    const uKs = gl.getUniformLocation(program, "uMaterial.ks");
    gl.uniform3fv(uKs, flatten(scale(1 / RGB, materialinfoground.ks)));
    const uShininess = gl.getUniformLocation(program, "uMaterial.shininess");
    gl.uniform1f(uShininess, materialinfoground.shininess);
  }

  function materialInfoPrimitive() {
    const uKa = gl.getUniformLocation(program, "uMaterial.ka");
    gl.uniform3fv(uKa, flatten(scale(1 / RGB, materialinfoprimitive.ka)));
    const uKd = gl.getUniformLocation(program, "uMaterial.kd");
    gl.uniform3fv(uKd, flatten(scale(1 / RGB, materialinfoprimitive.kd)));
    const uKs = gl.getUniformLocation(program, "uMaterial.ks");
    gl.uniform3fv(uKs, flatten(scale(1 / RGB, materialinfoprimitive.ks)));
    const uShininess = gl.getUniformLocation(program, "uMaterial.shininess");
    gl.uniform1f(uShininess, materialinfoprimitive.shininess);
  }

  function materialInfoLight() {
    const uKa = gl.getUniformLocation(program, "uMaterial.ka");
    gl.uniform3fv(uKa, flatten(scale(1 / RGB, materialinfolight.ka)));
    const uKd = gl.getUniformLocation(program, "uMaterial.kd");
    gl.uniform3fv(uKd, flatten(scale(1 / RGB, materialinfolight.kd)));
    const uKs = gl.getUniformLocation(program, "uMaterial.ks");
    gl.uniform3fv(uKs, flatten(scale(1 / RGB, materialinfolight.ks)));
    const uShininess = gl.getUniformLocation(program, "uMaterial.shininess");
    gl.uniform1f(uShininess, materialinfolight.shininess);
  }

  function render() {
    if (rotate) deltaTime = 1 / 60;

    window.requestAnimationFrame(render);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(program);

    mProjection = perspective(camera.fovy, aspect, camera.near, camera.far);

    mView = lookAt(camera.eye, camera.at, camera.up);

    loadMatrix(mView);

    gl.uniformMatrix4fv(
      gl.getUniformLocation(program, "mView"),
      false,
      flatten(mView)
    );
    gl.uniformMatrix4fv(
      gl.getUniformLocation(program, "mViewNormals"),
      false,
      flatten(normalMatrix(mView))
    );
    gl.uniformMatrix4fv(
      gl.getUniformLocation(program, "mProjection"),
      false,
      flatten(mProjection)
    );

    checkWireframe();
    backFaceCulling();
    depthTest();

    nLightsInfo();
    lightInfo();

    Ground();
    Primitive();
    Lights();
  }
}

const urls = ["shader.vert", "shader.frag"];
loadShadersFromURLS(urls).then((shaders) => setup(shaders));
