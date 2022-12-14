import { buildProgramFromSources, loadShadersFromURLS, setupWebGL } from "../../libs/utils.js";
import { ortho, lookAt, flatten, mult, rotateY, perspective, rotate, vec3, normalMatrix } from "../../libs/MV.js";
import {modelView, loadMatrix, multRotationY, multRotationX, multRotationZ, multScale, pushMatrix, popMatrix, multTranslation, multMatrix } from "../../libs/stack.js";

import * as SPHERE from '../../libs/objects/sphere.js';
import * as CYLINDER from '../../libs/objects/cylinder.js';
import * as CUBE from '../../libs/objects/cube.js';
import * as BUNNY from '../../libs/objects/bunny.js';
import * as PYRAMID from  '../../libs/objects/pyramid.js';
import * as TORUS from  '../../libs/objects/torus.js';

import {GUI} from '../../libs/dat.gui.module.js';


let gl;
const MAX_VP_DISTANCE = 20;




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
cameraFolder.add(camera, 'far', 0.1, MAX_VP_DISTANCE * 5, 0.1);

const eyeFolder = gui.addFolder("eye");
eyeFolder.add(camera.eye, 0).min(0).max(MAX_VP_DISTANCE).step(0.05).name("x");
eyeFolder.add(camera.eye, 1).min(0).max(MAX_VP_DISTANCE).step(0.05).name("y");
eyeFolder.add(camera.eye, 2).min(0).max(MAX_VP_DISTANCE).step(0.05).name("z");

const atFolder = gui.addFolder("At");
atFolder.add(camera.at, 0).min(0).max(MAX_VP_DISTANCE).step(0.05).name("x");
atFolder.add(camera.at, 1).min(0).max(MAX_VP_DISTANCE).step(0.05).name("y");
atFolder.add(camera.at, 2).min(0).max(MAX_VP_DISTANCE).step(0.05).name("z");

const upFolder = gui.addFolder("Up");
upFolder.add(camera.up, 0).min(0).max(MAX_VP_DISTANCE).step(0.05).name("x");
upFolder.add(camera.up, 1).min(0).max(MAX_VP_DISTANCE).step(0.05).name("y");
upFolder.add(camera.up, 2).min(0).max(MAX_VP_DISTANCE).step(0.05).name("z");

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
    multTranslation([5,0,-5]);
    updateModelView();
    //defineMaterial(materials.PINK); 
    CUBE.draw(gl, program, gl.TRIANGLES);

}

function renderCylinder(){
    multScale([1, 1, 1]);
    multTranslation([-5,1,0])
    updateModelView();
    //defineMaterial(materials.BRIGHT_BLUE);
    CYLINDER.draw(gl, program, gl.TRIANGLES);
}

function renderSphere(){
    multScale([1, 1, 1]);
    multTranslation([5,1,5])
    updateModelView();
    //defineMaterial(materials.BLACK);
    SPHERE.draw(gl, program, gl.TRIANGLES);
}

function renderBunny(){
    multScale([1, 1, 5]);
    multTranslation([0,1,5])
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

        let mView = lookAt(camera.eye, camera.at, camera.up);

        gl.uniformMatrix4fv(gl.getUniformLocation(program, "mView"), false, flatten(mView));
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "mViewNormals"), false, flatten(normalMatrix(mView)));

        loadMatrix(mView);
        //multRotationX(axoController.Gama);
        //multRotationY(axoController.Teta);
        //multTranslation(zoomController.far);
    

    }



    function render()
    {


        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        gl.useProgram(program);
    
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


        renderCamera();
        renderScene();


        window.requestAnimationFrame(render);

        
    }
}

const urls = ["shader1.vert", "shader1.frag"];
loadShadersFromURLS(urls).then(shaders => setup(shaders))
