import {loadShadersFromURLS} from "../../libs/utils.js";
import { buildProgramFromSources, setupWebGL } from "../../libs/utils.js";
import { vec2, flatten, vec4 } from "../../libs/MV.js";

/** @type {WebGLRenderingContext} */
var gl;
var program; // shaders
var points = [];
var vertToDraw = [];
const pointsLength = 20000;
var nextPoint = 0;
var nextDegree = 0;
const degreeStep = (3.14/2 + 0.01);
const maxVel = 0.01;
const minVel = 0.001;
const velStep = 0.0005;
var currentVel = minVel;

const partUpdatedPerFrame = 20000;
var center = vec2(0, 0);
const xLimit = 1;
const yLimit = 1;


function setup(shaders){

    for(let i = 0; i < pointsLength; i++){

        ccreatePoint();

    }


    // Setup
    const canvas = document.getElementById("gl-canvas"); // canvas in html page
    gl = setupWebGL(canvas);


    program = buildProgramFromSources(gl, shaders["shader.vert"], shaders["shader.frag"]);


    //the web gl context buffer
    const aBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, aBuffer); //the aBuffer is binded
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertToDraw), gl.STATIC_DRAW); // we write the vertices to the buffer

    const vPosition = gl.getAttribLocation(program, "vPosition"); //will be 0
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    //Setup the view port, starting in x = 0 and y = 0 with width and height equal to canvas
    gl.viewport(0, 0, canvas.width, canvas.height);

    //Setup bachground color
    gl.clearColor(0, 0, 0.0, 1.0); //color used to clean the screen

    //Call animate for the first time
    animate(); // same as window.requestAnimationFrame(animate);


}

function animate(){

    //call in next cycle of refreshing the canvas (probably entire page), so that it keeps being called
    window.requestAnimationFrame(animate);

    //cleans the frame buffer
    gl.clear(gl.COLOR_BUFFER_BIT);


    gl.useProgram(program);
    gl.drawArrays(gl.TRIANGLES, 0, pointsLength * 3);

    for(let i = 0; i < partUpdatedPerFrame; i++){

        updatePoint();

    }

    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertToDraw), gl.STATIC_DRAW);

    //activates the program
    
     //needs shaders
}



function updatePoint(){

    points[nextPoint][0] += points[nextPoint][2];
    points[nextPoint][1] += points[nextPoint][3];

    if(points[nextPoint][0] > xLimit || points[nextPoint][0] < -xLimit || points[nextPoint][1] > yLimit || points[nextPoint][1] < -yLimit){

        ccreatePoint();

    }else{

        updateVert(nextPoint);
        nextPoint = (nextPoint + 1) % pointsLength;

    }


}

function updateVert(index){


    vertToDraw[(index * 6)] = points[index][0];
    vertToDraw[(index * 6) + 1] =  points[index][1];

    vertToDraw[(index * 6) + 2] = points[index][0] + 0.01;
    vertToDraw[(index * 6) + 3] = points[index][1] + 0.01;

    vertToDraw[(index * 6) + 4] = points[index][0] + 0.01;
    vertToDraw[(index * 6) + 5] =  points[index][1];



}

function ccreatePoint(){

    points[nextPoint] = createPoint(center[0], center [1], currentVel * Math.cos(nextDegree), currentVel * Math.sin(nextDegree));
    updateVert(nextPoint);
    
    nextDegree = (nextDegree + degreeStep) % (4 * Math.PI);
    currentVel = Math.max( (currentVel + velStep) % maxVel, 0); 

    nextPoint = (nextPoint + 1) % pointsLength;

}

function createPoint(xi, yi, vxi, vyi){


    return [xi, yi, vxi, vyi];


}

//doesn't need to specify prefix because prefix="shaders"
//.then means after completion of function
//shaders => setup(shaders) means that the previously returned value (loadShadersFromURLS) will be named shaders and then passed in the function setup 
loadShadersFromURLS(["shader.vert", "shader.frag"]).then(shaders => setup(shaders));