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
const LIGHT_SCALE = 0.1;




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

bunnyColorFolder.addColor(bunnyColor, "materialAmb").name("ambient");
bunnyColorFolder.addColor(bunnyColor, "materialDif").name("diffuse");
bunnyColorFolder.addColor(bunnyColor, "materialSpe").name("specular");

bunnyColorFolder.add(bunnyColor, "shininess", 0, 20, 0.1);


const lightsFolder = gui.addFolder("Lights");

const MAX_LIGHTS = 3;

let lights = [];

function createLight(){

    if(lights.length < MAX_LIGHTS){
        let newLightFolder = lightsFolder.addFolder("Light " + (lights.length+1));


        lights.push({
            active: true,
            ambient: [200, 200,200],
            diffuse: [200, 200, 200],
            specular: [150,150,175],
            position: [3.0, 5.0, 2.0, 1.0],
            axis: [0, 5.0, 0],
            aperture: 30.0,
            cutoff: 0.05,
            spotlight: false
        });

        let p = newLightFolder.addFolder("position");

        newLightFolder.add(lights[lights.length -1], "active");

        p.add(lights[lights.length - 1].position, 0).min(-MAX_VP_DISTANCE).max(MAX_VP_DISTANCE).step(0.05).name("x");
        p.add(lights[lights.length - 1].position, 1).min(-MAX_VP_DISTANCE).max(MAX_VP_DISTANCE).step(0.05).name("y");
        p.add(lights[lights.length - 1].position, 2).min(-MAX_VP_DISTANCE).max(MAX_VP_DISTANCE).step(0.05).name("z");
        p.add(lights[lights.length - 1].position, 3).min(0).max(1).step(1).name("w");


        let inte = newLightFolder.addFolder("intensity");
        inte.addColor(lights[lights.length - 1], "ambient").name("ambient");
        inte.addColor(lights[lights.length - 1], "diffuse").name("diffuse");
        inte.addColor(lights[lights.length -1], "specular").name("specular");

        let ax = newLightFolder.addFolder("axis");
        ax.add(lights[lights.length -1].axis, 0).min(-MAX_VP_DISTANCE).max(MAX_VP_DISTANCE).step(0.05).name("x");
        ax.add(lights[lights.length -1].axis, 1).min(-MAX_VP_DISTANCE).max(MAX_VP_DISTANCE).step(0.05).name("y");
        ax.add(lights[lights.length -1].axis, 2).min(-MAX_VP_DISTANCE).max(MAX_VP_DISTANCE).step(0.05).name("z");
        

        newLightFolder.add(lights[lights.length -1], "aperture").min(0.1).max(360).step(0.01).name("aperture");
        newLightFolder.add(lights[lights.length -1], "cutoff").min(0).max(1).step(0.01).name("cutoff");
        newLightFolder.add(lights[lights.length -1], "spotlight");
        
   }
}



lightsFolder.add({addLight: function(){createLight();}}, "addLight").name("Add a new light");


function deleteLightFun() {

    //tehre should be at least one light
    if(lights.length > 1){

       // Delete the light from the array of lights
       lights.pop();

        // Delete the folder for the selected light from the GUI
        lightsFolder.removeFolder(lightsFolder.__folders["Light " + (lights.length + 1)]);
        } 
}

const deleteLightButton = lightsFolder.add({
    deleteLight: deleteLightFun
    }, "deleteLight");
    deleteLightButton.name("Delete light");



//this creates the first light
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

        RED : {materialAmb : vec3(255, 0.0, 0.0), materialDif : vec3(255, 0.0, 0.0), materialSpe : vec3(255, 0.0, 0.0), shininess : 6.0},
        BROWN : {materialAmb : vec3(200, 119, 28), materialDif : vec3(50, 71, 82), materialSpe : vec3(255, 255, 255), shininess : 4.0},
        BLUE : {materialAmb : vec3(0, 0, 255), materialDif : vec3(0, 0, 255), materialSpe : vec3(255, 255, 255), shininess : 10.0},
        GREEN : {materialAmb : vec3(0.0, 255, 0.0), materialDif : vec3(0.0, 255, 0.0), materialSpe : vec3(255, 0.0, 0.0), shininess : 6.0},

    }

    function defineMaterial(material){

        gl.uniform3f(gl.getUniformLocation(program, "materialAmb"), material.materialAmb[0]/255, material.materialAmb[1]/255, material.materialAmb[2]/255);

        gl.uniform3f(gl.getUniformLocation(program, "materialDif"), material.materialDif[0]/255, material.materialDif[1]/255, material.materialDif[2]/255);

        gl.uniform3f(gl.getUniformLocation(program, "materialSpe"), material.materialSpe[0]/255, material.materialDif[1]/255, material.materialDif[2]/255);

        gl.uniform1f(gl.getUniformLocation(program, "shininess"), material.shininess);

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
    defineMaterial(materials.BROWN); 
    CUBE.draw(gl, program, gl.TRIANGLES);


}

function renderCube(){

    multTranslation([3, 0.7,-3]);
    updateModelView();
    defineMaterial(materials.RED); 
    CUBE.draw(gl, program, gl.TRIANGLES);

}

function renderCylinder(){
    multTranslation([-4, 2.5,0]);
    multScale([1, 5, 1]);
    defineMaterial(materials.BLUE);
    updateModelView();
    CYLINDER.draw(gl, program, gl.TRIANGLES);
}

function renderSphere(){
    multTranslation([3, 0.7,4]);
    updateModelView();
    defineMaterial(materials.GREEN);
    SPHERE.draw(gl, program, gl.TRIANGLES);
}

function renderBunny(){
    multTranslation([2, 0.2,1]);
    multScale([10, 10, 10]);
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
    pushMatrix();
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

    function loadLightInfo(i){

        gl.uniform4f(gl.getUniformLocation(program, "lights[" + i + "].position"), lights[i].position[0], lights[i].position[1], lights[i].position[2], lights[i].position[3]);

        gl.uniform3f(gl.getUniformLocation(program, "lights[" + i + "].ambient"), lights[i].ambient[0]/255, lights[i].ambient[1]/255, lights[i].ambient[2]/255);

        gl.uniform3f(gl.getUniformLocation(program, "lights[" + i + "].diffuse"), lights[i].diffuse[0]/255, lights[i].diffuse[1]/255, lights[i].diffuse[2]/255);

        gl.uniform3f(gl.getUniformLocation(program, "lights[" + i + "].specular"), lights[i].specular[0]/255, lights[i].specular[1]/255, lights[i].specular[2]/255);

        gl.uniform3f(gl.getUniformLocation(program, "lights[" + i + "].axis"), lights[i].axis[0],  lights[i].axis[1],  lights[i].axis[2]);
        gl.uniform1f(gl.getUniformLocation(program, "lights[" + i + "].aperture"), lights[i].aperture);
        gl.uniform1f(gl.getUniformLocation(program, "lights[" + i + "].cutoff"), lights[i].cutoff);
        gl.uniform1i(gl.getUniformLocation(program, "lights[" + i + "].active"), lights[i].active);
        gl.uniform1i(gl.getUniformLocation(program, "lights[" + i + "].spotlight"), lights[i].spotlight);


    }


    function loadLights(){

        gl.uniform1i(gl.getUniformLocation(program, "nLights"), lights.length);

        for(let i = 0; i < lights.length; i++){
  
            loadLightInfo(i);

        }
    }

    function drawLights(){

        for(let i = 0; i < lights.length; i++){

            loadLightInfo(i);

            pushMatrix();

                multTranslation([lights[i].position[0], lights[i].position[1], lights[i].position[2]]);
                multScale([LIGHT_SCALE, LIGHT_SCALE, LIGHT_SCALE]);
                updateModelView();
                SPHERE.draw(gl, program, gl.LINES);

            popMatrix();

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

      


        renderCamera();
        renderScene();
        loadLights();

        window.requestAnimationFrame(render);

        
    }
}

const urls = ["shader1.vert", "shader1.frag"];
loadShadersFromURLS(urls).then(shaders => setup(shaders))
