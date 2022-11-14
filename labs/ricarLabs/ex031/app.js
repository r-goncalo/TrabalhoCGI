import {loadShadersFromURLS} from "../../libs/utils.js";
import { buildProgramFromSources, setupWebGL } from "../../libs/utils.js";
import { vec2, flatten } from "../../libs/MV.js";

/** @type {WebGLRenderingContext} */
var gl;
var program; // shaders
var vertices = [];


function setup(shaders){

    //alert(shaders); //for testing

    // Setup
    const canvas = document.getElementById("gl-canvas"); // canvas in html page
    gl = setupWebGL(canvas);


    program = buildProgramFromSources(gl, shaders["shader.vert"], shaders["shader.frag"]);
    let x = 0;
    let y = 0;
    let step = 0.3;

    for(let i = 0; i < 2 * Math.PI;){

        vertices.push(Math.cos(i) * 0.3 + 0.5);
        vertices.push(Math.sin(i) * 0.3 + 0.5);
        vertices.push(0.5);
        vertices.push(0.5);
        i += 0.01;
    }

    const aBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, aBuffer); //the aBuffer is binded
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW); // we write the vertices to the buffer

    const vPosition = gl.getAttribLocation(program, "vPosition"); //will be 0
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    //Setup the view port, starting in x = 0 and y = 0 with width and height equal to canvas
    gl.viewport(0, 0, canvas.width, canvas.height);

    //Setup bachground color
    gl.clearColor(1.0, 1.0, 0.0, 1.0); //color used to clean the screen

    //Call animate for the first time
    animate(); // same as window.requestAnimationFrame(animate);


}

function animate(){

    //call in next cycle of refreshing the canvas (probably entire page), so that it keeps being called
    window.requestAnimationFrame(animate);

    //cleans the frame buffer
    gl.clear(gl.COLOR_BUFFER_BIT);

    //draw arrays vs draw elements,

    //activates the program
    gl.useProgram(program);
    gl.drawArrays(gl.LINE_LOOP, 0, vertices.length); //needs shaders
}

//doesn't need to specify prefix because prefix="shaders"
//.then means after completion of function
//shaders => setup(shaders) means that the previously returned value (loadShadersFromURLS) will be named shaders and then passed in the function setup 
loadShadersFromURLS(["shader.vert", "shader.frag"]).then(shaders => setup(shaders));