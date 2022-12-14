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
    "Depth buffer" : true

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


const cameraFolder = gui.addFolder("camera");
cameraFolder.add(camera, 'fovy', 1, 100, 1);
cameraFolder.add(camera, 'near', 0.1, 20, 0.1 );
cameraFolder.add(camera, 'far', 0.1, MAX_VP_DISTANCE * 5, 0.1);

const eyeFolder = cameraFolder.addFolder("eye");
eyeFolder.add(camera.eye, 0).min(-MAX_VP_DISTANCE).max(MAX_VP_DISTANCE).step(0.05).name("x");
eyeFolder.add(camera.eye, 1).min(-MAX_VP_DISTANCE).max(MAX_VP_DISTANCE).step(0.05).name("y");
eyeFolder.add(camera.eye, 2).min(-MAX_VP_DISTANCE).max(MAX_VP_DISTANCE).step(0.05).name("z");

const atFolder = cameraFolder.addFolder("At");
atFolder.add(camera.at, 0).min(-MAX_VP_DISTANCE).max(MAX_VP_DISTANCE).step(0.05).name("x");
atFolder.add(camera.at, 1).min(-MAX_VP_DISTANCE).max(MAX_VP_DISTANCE).step(0.05).name("y");
atFolder.add(camera.at, 2).min(-MAX_VP_DISTANCE).max(MAX_VP_DISTANCE).step(0.05).name("z");

const upFolder = cameraFolder.addFolder("Up");
upFolder.add(camera.up, 0).min(-1).max(1).step(0.05).name("x");
upFolder.add(camera.up, 1).min(-1).max(1).step(0.05).name("y");
upFolder.add(camera.up, 2).min(-1).max(1).step(0.05).name("z");


let bunnyColor = {materialAmb : vec3(255, 255, 255), materialDif : vec3(242, 208, 106), materialSpe : vec3(114, 208, 240), shininess : 10.0};

const bunnyColorFolder = gui.addFolder("Bunny material");

const ambFolder = bunnyColorFolder.addFolder("amb");
ambFolder.add(bunnyColor.materialAmb, 0).min(0).max(255).step(0.5).name("R");
ambFolder.add(bunnyColor.materialAmb, 1).min(0).max(255).step(0.5).name("G");
ambFolder.add(bunnyColor.materialAmb, 2).min(0).max(255).step(0.5).name("B");

const difFolder = bunnyColorFolder.addFolder("dif");
difFolder.add(bunnyColor.materialDif, 0).min(0).max(255).step(0.5).name("R");
difFolder.add(bunnyColor.materialDif, 1).min(0).max(255).step(0.5).name("G");
difFolder.add(bunnyColor.materialDif, 2).min(0).max(255).step(0.5).name("B");

const speFolder = bunnyColorFolder.addFolder("spe");
speFolder.add(bunnyColor.materialSpe, 0).min(0).max(255).step(0.5).name("R");
speFolder.add(bunnyColor.materialSpe, 1).min(0).max(255).step(0.5).name("G");
speFolder.add(bunnyColor.materialSpe, 2).min(0).max(255).step(0.5).name("B");

bunnyColorFolder.add(bunnyColor, "shininess", 0, 20, 0.1);


const lightsFolder = gui.addFolder("Lights");

const MAX_LIGHTS = 3;

let lights = [];

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

        let newLightFolder = lightsFolder.addFolder("Light " + lights.length);

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
   


}

createLight();


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
        mProjection = perspective(camera.fovy, aspect, camera.near, camera.far);
    }

    /**
     * 
     * RESIZE STUFF
     * 
     */

/**
 * ********Shader Stuff*********
 */


    let materials = {

        GREEN : {materialAmb : vec3(255, 0.0, 0.0), materialDif : vec3(255, 0.0, 0.0), materialSpe : vec3(255, 0.0, 0.0), shininess : 6.0}

    }

    function defineMaterial(material){


        gl.uniform3f(gl.getUniformLocation(program, "materialAmb"), false, material.materialAmb[0]/255, material.materialAmb[1]/255, material.materialAmb[2]/255);

        gl.uniform3f(gl.getUniformLocation(program, "materialDif"), false, material.materialDif[0]/255, material.materialDif[1]/255, material.materialDif[2]/255);

        gl.uniform3f(gl.getUniformLocation(program, "materialSpe"), false, material.materialSpe[1]/255, material.materialDif[2]/255, material.materialDif[3]/255);

        gl.uniform1f(gl.getUniformLocation(program, "shininess"), false, material.shininess);

    }



    //puts a color in the fragment shader
    function updateModelView(){

        const vmModelView = gl.getUniformLocation(program, "mModelView");
        gl.uniformMatrix4fv(vmModelView, false, flatten(modelView()));

        const vmNormals = gl.getUniformLocation(program, "mNormals");
        gl.uniformMatrix4fv(vmNormals, false, flatten(normalMatrix(modelView())));

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
    defineMaterial(materials.GREEN); 
    CUBE.draw(gl, program, gl.TRIANGLES);


}

function renderCube(){

    multTranslation([3,1,-3]);
    updateModelView();
    defineMaterial(materials.GREEN); 
    CUBE.draw(gl, program, gl.TRIANGLES);

}

function renderCylinder(){
    multTranslation([-4,1,0]);
    updateModelView();
    defineMaterial(materials.GREEN);
    CYLINDER.draw(gl, program, gl.TRIANGLES);
}

function renderSphere(){
    multTranslation([3,1,4]);
    updateModelView();
    defineMaterial(materials.GREEN);
    SPHERE.draw(gl, program, gl.TRIANGLES);
}

function renderBunny(){
    multTranslation([2,1,1]);
    multScale([5, 5, 5]);
    updateModelView();
    defineMaterial(bunnyColor);
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
    

    }


    function loadLights(){

        gl.uniform1i(gl.getUniformLocation(program, "nLights"), false, lights.length);

        for(let i = 0; i < lights.length; i++){
            // Set the value of the 'lights[0].pos' uniform variable to the position of the first light
            gl.uniform4f(gl.getUniformLocation(program, "lights[" + i + "].position"), lights[i].position.x, lights[i].position.y, lights[i].position.z, lights[i].position.w);
            gl.uniform3f(gl.getUniformLocation(program, "light[" + i + "].ambient"), lights[i].ambient.x,lights[i].ambient.y,lights[i].ambient.z);
            gl.uniform3f(gl.getUniformLocation(program, "lights[" + i + "].diffuse"),lights[i].diffuse.x, lights[i].diffuse.y, lights[i].diffuse.z);
            gl.uniform3f(gl.getUniformLocation(program, "lights[" + i + "].specular"), lights[i].specular.x, lights[i].specular.y, lights[i].specular.z);
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



    function render()
    {


        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        gl.useProgram(program);
    
        loadOptions();

        loadLights();


        renderCamera();
        renderScene();


        window.requestAnimationFrame(render);

        
    }
}

const urls = ["shader1.vert", "shader1.frag"];
loadShadersFromURLS(urls).then(shaders => setup(shaders))
