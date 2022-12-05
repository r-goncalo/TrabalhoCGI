import { buildProgramFromSources, loadShadersFromURLS, setupWebGL } from "../../libs/utils.js";
import { ortho, lookAt, flatten, mult, rotateY, perspective, rotate } from "../../libs/MV.js";
import {modelView, loadMatrix, multRotationY, multRotationX, multRotationZ, multScale, pushMatrix, popMatrix, multTranslation, multMatrix } from "../../libs/stack.js";

import * as SPHERE from '../../libs/objects/sphere.js';
import * as CYLINDER from '../../libs/objects/cylinder.js';
import * as CUBE from '../../libs/objects/cube.js';

import { color, GUI } from '../../libs/dat.gui.module.js';


let gl;
const VP_DISTANCE = 5;


let colors = {

    BLACK : [0, 0, 0],
    BROWN : [255, 128, 0]


}




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


    gl.clearColor(56/255, 56/255, 56/255, 1.0);
    CUBE.init(gl);
    gl.enable(gl.DEPTH_TEST);   // Enables Z-buffer depth test
    
    window.requestAnimationFrame(render);

    

    function uploadModelView()
    {
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "mModelView"), false, flatten(modelView()));
    }


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


    multScale([10, 1, 10]);
    uploadModelView();
    defineColor(colors.BROWN); 
    CUBE.draw(gl, program, gl.TRIANGLES);


}



function renderScene(){


    renderGround();



}

/**
 * ********END OF SCENE*********
 */


    function renderCamera(){


        loadMatrix(lookAt([0, 0, VP_DISTANCE], [0, 0, 0], [0,1,0]));
        multRotationX(axoController.Gama);
        multRotationY(axoController.Teta);
    

    }



    function render()
    {


        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        gl.useProgram(program);
        

        gl.uniformMatrix4fv(gl.getUniformLocation(program, "mProjection"), false, flatten(mProjection));


        renderCamera();
        renderScene();


        window.requestAnimationFrame(render);


        
    }
}

const urls = ["shader1.vert", "shader1.frag"];
loadShadersFromURLS(urls).then(shaders => setup(shaders))