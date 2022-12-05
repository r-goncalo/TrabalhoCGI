import { buildProgramFromSources, loadShadersFromURLS, setupWebGL } from "../../libs/utils.js";
import { ortho, lookAt, flatten, mult, rotateY, perspective, rotate } from "../../libs/MV.js";
import {modelView, loadMatrix, multRotationY, multRotationX, multRotationZ, multScale, pushMatrix, popMatrix, multTranslation, multMatrix } from "../../libs/stack.js";

import * as SPHERE from '../../libs/objects/sphere.js';
import * as CYLINDER from '../../libs/objects/cylinder.js';
import * as CUBE from '../../libs/objects/cube.js';

import { GUI } from '../../libs/dat.gui.module.js';


let gl;
const VP_DISTANCE = 500; //500 meters far
let time;
let speed = 1;  //  /60.0;


function setup(shaders)
{
    
    let canvas = document.getElementById("gl-canvas");
    let aspect = canvas.width / canvas.height;


/*  
        GUI SETUP
*/

    const gui = new GUI();


    let axoController = {

        Teta : 20,
        Gama : 20


    };

    let axoFolder = gui.addFolder("axonometric view");
    axoFolder.add( axoController, 'Teta', 0, 360, 1 );
    axoFolder.add( axoController, 'Gama', 0, 360, 1 );



    let boxController = {

        fallingSpeed : 0.2,
        timeToLive : 5000,
        timeToBeStuck : 2000


    }

    let boxFolder = gui.addFolder("boxFolder");
    boxFolder.add(boxController, 'fallingSpeed', 0.01, 1, 0.01);
    boxFolder.add(boxController, 'timeToLive', 100, 20000, 100);
    boxFolder.add(boxController, 'timeToBeStuck', 100, 20000, 100);

    
    let helicopterController = {

        helicopterMaxAngleSpeed : 0.2


    }

    let heliFolder = gui.addFolder("heliFolder");
    heliFolder.add(helicopterController, 'helicopterMaxAngleSpeed', 0.05, 2, 0.05);


/*  
        END OF GUI SETUP
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


    //this will define the color of the sky
    gl.clearColor(56, 56, 56, 1.0);
    CUBE.init(gl);
    gl.enable(gl.DEPTH_TEST);   // Enables Z-buffer depth test
    
    window.requestAnimationFrame(render);

    

    function uploadModelView()
    {
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "mModelView"), false, flatten(modelView()));
    }




    function render(timestamp)
    {

        let deltaTime = 0; // the change of time since the last calculation

        if(time === undefined) {        // First time
            time = timestamp*speed;
        } 
        else {                          // All other times
            deltaTime = timestamp*speed - time;
            time = timestamp*speed;
        }

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        gl.useProgram(program);
        

        gl.uniformMatrix4fv(gl.getUniformLocation(program, "mProjection"), false, flatten(mProjection));


        window.requestAnimationFrame(render);


        
    }
}

const urls = ["shader1.vert", "shader1.frag"];
loadShadersFromURLS(urls).then(shaders => setup(shaders))