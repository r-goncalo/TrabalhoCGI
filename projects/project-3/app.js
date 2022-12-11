import { buildProgramFromSources, loadShadersFromURLS, setupWebGL } from "../../libs/utils.js";
import { ortho, lookAt, flatten, mult, rotateY, perspective, rotate, vec3 } from "../../libs/MV.js";
import {modelView, loadMatrix, multRotationY, multRotationX, multRotationZ, multScale, pushMatrix, popMatrix, multTranslation, multMatrix } from "../../libs/stack.js";

import * as SPHERE from '../../libs/objects/sphere.js';
import * as CYLINDER from '../../libs/objects/cylinder.js';
import * as CUBE from '../../libs/objects/cube.js';
import * as BUNNY from '../../libs/objects/bunny.js';
import * as PYRAMID from  '../../libs/objects/pyramid.js';
import * as TORUS from  '../../libs/objects/torus.js';

import {GUI} from '../../libs/dat.gui.module.js';


let gl;
const VP_DISTANCE = 5;


let colors = {

    BLACK : [0, 0, 0],
    WHITE : [255, 255, 255],
    BROWN : [255, 128, 0],
    BRIGHT_RED : [255, 0, 0],
    BRIGHT_GREEN : [0, 255, 0],
    BRIGHT_BLUE : [0, 0, 255],
    PINK : [255, 102, 204]

}


function setup(shaders)
{
    
    let canvas = document.getElementById("gl-canvas");
    let aspect = canvas.width / canvas.height;


/**
 * 
 * BASIC GL STUFF
 * 
 */

    gl = setupWebGL(canvas);

    let program = buildProgramFromSources(gl, shaders["shader1.vert"], shaders["shader1.frag"]);

    let mProjection = ortho(-VP_DISTANCE*aspect,VP_DISTANCE*aspect, -VP_DISTANCE, VP_DISTANCE,-3*VP_DISTANCE,3*VP_DISTANCE);

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
        mProjection = ortho(-VP_DISTANCE*aspect,VP_DISTANCE*aspect, -VP_DISTANCE, VP_DISTANCE,-3*VP_DISTANCE,3*VP_DISTANCE);
    }


    gl.clearColor(56/255, 56/255, 56/255, 1.0);
    CUBE.init(gl);
    SPHERE.init(gl);
    CYLINDER.init(gl);
    BUNNY.init(gl);
    window.requestAnimationFrame(render);

    

    function uploadModelView()
    {
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "mModelView"), false, flatten(modelView()));
    }


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

let optionsFolder = gui.addFolder("options");
optionsFolder.add( optionsController, 'Backface culling');
optionsFolder.add( optionsController, 'Depth buffer');

gl.cullFace(gl.BACK | gl.FRONT);

let axoController = {

    Teta : 20,
    Gama : 20
};

let camera = {
    eye: vec3(0,5,10),
    at: vec3(0,0,0),
    up: vec3(0,1,0),
    fovy : 45,
    near : 0.1,
    far: 40
}

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



let axoFolder = gui.addFolder("axonometric view");
axoFolder.add( axoController, 'Teta', 0, 360, 1 );
axoFolder.add( axoController, 'Gama', 0, 360, 1 );


let cameraFolder = gui.addFolder("camera");
cameraFolder.add(camera, 'fovy', 1, 100, 1);
cameraFolder.add(camera, 'near', 0.1, 20, 0.1 );
cameraFolder.add(camera, 'far', 0.1, 20, 0.1);




/*  
    END OF GUI SETUP
*/

/**
 * *********RENDERING STUFF*******
 */

    //puts a color in the fragment shader
    function defineColor(colors){

        const solidColor = gl.getUniformLocation(program, "solidColor");
        gl.uniform3f(solidColor, colors[0]/255, colors[1]/255, colors[2]/255);


    }



/**
 * ********SCENE*********
 */


function renderGround(){


    multScale([10, 0.5, 10]);
    uploadModelView();
    defineColor(colors.BROWN); 
    CUBE.draw(gl, program, gl.TRIANGLES);


}

function renderCube(){

    multScale([2, 2, 2]);
    multTranslation([0,0,0]);
    uploadModelView();
    defineColor(colors.PINK); 
    CUBE.draw(gl, program, gl.TRIANGLES);

}

function renderCylinder(){
    multScale([0.1, 0.1, 0.1]);
    multTranslation([-7,0.2,0])
    uploadModelView();
    defineColor(colors.BRIGHT_BLUE);
    CYLINDER.draw(gl, program, gl.TRIANGLES);
}
function renderSphere(){
    multScale([1, 1, 1]);
    multTranslation([5,0,0])
    uploadModelView();
    defineColor(colors.BLACK);
    SPHERE.draw(gl, program, gl.TRIANGLES);
}
function renderBunny(){
    multScale([5, 5, 5]);
    multTranslation([0.3,0,0])
    uploadModelView();
    defineColor(colors.BRIGHT_GREEN);
    BUNNY.draw(gl, program, gl.TRIANGLES);
}

function renderPrimitives(){

    renderCube();
    renderBunny();
    renderCylinder();
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


        loadMatrix(lookAt([0, 0, VP_DISTANCE], [0, 0, 0], [0,1,0]));
        multRotationX(axoController.Gama);
        multRotationY(axoController.Teta);
        //multTranslation(zoomController.far);
    

    }



    function render()
    {


        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        gl.useProgram(program);
        

        gl.uniformMatrix4fv(gl.getUniformLocation(program, "mProjection"), false, flatten(mProjection));

        //gl.enable(gl.CULL_FACE)

        renderCamera();
        renderScene();


        window.requestAnimationFrame(render);


        
    }
}

const urls = ["shader1.vert", "shader1.frag"];
loadShadersFromURLS(urls).then(shaders => setup(shaders))
