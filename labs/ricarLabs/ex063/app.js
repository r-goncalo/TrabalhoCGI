import {loadShadersFromURLS} from "../../libs/utils.js";
import { buildProgramFromSources, setupWebGL } from "../../libs/utils.js";
import { vec2, flatten, vec4 } from "../../libs/MV.js";

/** @type {WebGLRenderingContext} */
var gl;
var program; // shaders
var program2;

//where the pontos essenciais dos triangulos irao estar guardados
var points = [];
var vertToDraw = [];
const pointsLength = 20000; // o tamanho dos pontos
const partUpdatedPerFrame = 20000; //pontos que sofrem update a cada frame


var nextPoint = 0; //proximo index a editar do ponto
var nextDegree = 0; //proximo angulo de sentido inicial do ponto
const degreeStep = (3.14/2 + 0.01); //a cada ponto mudar angulo por este valor
const initVel = 0.001; //velocidade inicial dos pontos
const maxVel = 0.01; //velocidade maxima de cada ponto

var center = vec2(0, 0); //centro do canvas
const xLimit = 1; //o limite do canvas em x
const yLimit = 1; //o limite do canvas em y

//o documento html do canvas
const canvas = document.getElementById("gl-canvas");
const rect = canvas.getBoundingClientRect(); //o retangulo do canvas
const rscaleX = canvas.width / rect.width;
const rscaleY = canvas.height / rect.height;

//os passos dados na criacao de um triangulo
const triStep = 0.005;

//a posicao do rato
var mousePosX = 0;
var mousePosY = 0;

const whiteHoleRad = 0.05;
const whiteHoleDegStep = 0.05;
var whiteHoles = [];
var whiteHolesVert = [];

function setup(shaders){



    for(let i = 0; i < pointsLength; i++){

        ccreatePoint();

    }


    // Setup
     // canvas in html page
    //canvas.width = document.body.clientWidth;
    //canvas.height = document.body.clientHeight;
    gl = setupWebGL(canvas);


    program = buildProgramFromSources(gl, shaders["shader.vert"], shaders["shader.frag"]);
    program2 = buildProgramFromSources(gl, shaders["shader.vert"], shaders["shader2.frag"]);


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

    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertToDraw), gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLES, 0, pointsLength * 3);

    for(let i = 0; i < partUpdatedPerFrame; i++){

        updatePoint();

    }

    gl.useProgram(program2);

    for(let i = 0; i < whiteHolesVert.length; i++){

//        console.log(whiteHolesVert[i]);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(whiteHolesVert[i]), gl.STATIC_DRAW);
        gl.drawArrays(gl.LINE_LOOP, 0, whiteHolesVert[i].length);

    }





    //activates the program
    
     //needs shaders
}



function updatePoint(){

    points[nextPoint][0] += points[nextPoint][2];
    points[nextPoint][1] += points[nextPoint][3];
 
   var vels = limitVel(points[nextPoint][2] + points[nextPoint][4], 
                    points[nextPoint][3] + points[nextPoint][5],
                    points[nextPoint][6]);

    points[nextPoint][2] = vels[0];
    points[nextPoint][3] = vels[1];

//    points[nextPoint][2] += points[nextPoint][4];
//    points[nextPoint][3] += points[nextPoint][5];

//    points[nextPoint][4] = acc(points[nextPoint][0], mousePosX);
//    points[nextPoint][5] = acc(points[nextPoint][1], mousePosY);

    var accs = accWhiteHoles(points[nextPoint][0], points[nextPoint][1]);

    points[nextPoint][4] = accs[0];
    points[nextPoint][5] = accs[1];

    points[nextPoint][6] = degFromVel(points[nextPoint][2], points[nextPoint][3]);


    if(points[nextPoint][0] > xLimit || points[nextPoint][0] < -xLimit || points[nextPoint][1] > yLimit || points[nextPoint][1] < -yLimit
        || insideWhiteHole(points[nextPoint][0], points[nextPoint][1])){

        ccreatePoint();

    }else{

        updateVert(nextPoint);
        nextPoint = (nextPoint + 1) % pointsLength;

    }


}

function limitVel(vx, vi, deg){

    if(Math.abs(vx * Math.sin(deg)) + Math.abs(vi * Math.cos(deg)) <= maxVel){

        return [vx, vi]

    }else{

        return [maxVel * Math.sin(deg), maxVel * Math.cos(deg)]

    }

}

function degFromVel(vx, vi){

    if(vx != 0){

        return Math.atan( points[nextPoint][3] / points[nextPoint][2]);

    }else {

        return 0;

    }


}

function updateVert(index){


    vertToDraw[(index * 6)] = points[index][0];
    vertToDraw[(index * 6) + 1] =  points[index][1];

    vertToDraw[(index * 6) + 2] = points[index][0] + triStep;
    vertToDraw[(index * 6) + 3] = points[index][1] + triStep;

    vertToDraw[(index * 6) + 4] = points[index][0] + triStep;
    vertToDraw[(index * 6) + 5] =  points[index][1];

}

function ccreatePoint(){

    points[nextPoint] = createPoint(center[0], center [1], initVel, nextDegree);
    updateVert(nextPoint);
    
    nextDegree = (nextDegree + degreeStep) % (4 * Math.PI); 

    nextPoint = (nextPoint + 1) % pointsLength;

}

function createPoint(xi, yi, iv, deg){

    return [xi, yi, iv * Math.cos(deg), iv * Math.sin(deg), 0, 0, deg];

}

function createWhiteHole(){

    whiteHoles.push([mousePosX, mousePosY]);
    whiteHolesVert.push([]);
    
    for(let i = 0; i <=  2 * Math.PI;){

//      whiteHolesVert[whiteHolesVert.length][i * 2] = mousePosX + whiteHoleRad * Math.sin(i);
//      whiteHolesVert[whiteHolesVert.length][i * 2 + 1] = mousePosY +  whiteHoleRad * Math.cos(i);
        whiteHolesVert[whiteHolesVert.length - 1].push(vec2(mousePosX, mousePosY));
        whiteHolesVert[whiteHolesVert.length - 1].push(vec2(mousePosX + whiteHoleRad * Math.cos(i), mousePosY +  whiteHoleRad * Math.sin(i)));

        

        i += whiteHoleDegStep;
    }


}

function accWhiteHoles(xx, yy){

    let toReturn = [0, 0];

    for(let i = 0; i < whiteHoles.length; i++){

        toReturn[0] += acc(xx, whiteHoles[i][0]);
        toReturn[1] += acc(xx, whiteHoles[i][1]);

    }

    return toReturn;

}

function acc(p1, p2){

    if(p2 != p1){

//        return  (p2 - p1) *  0.0000001 / (Math.pow( p2 - p1) * Math.abs(p2 - p1));
        return (p2 - p1) * 0.00001 / Math.sqrt( Math.abs(p2 - p1) );
    
    }else {

        return 0;

    }
}

function insideWhiteHole(xx, yy){

    let toReturn = false;
    for(let i = 0; i < whiteHoles.length && !toReturn; i++){

        toReturn = distTwoPoints(xx, yy, whiteHoles[i][0], whiteHoles[i][1]) <= whiteHoleRad;

    }

    return toReturn;

}


function distTwoPoints(x1, y1, x2, y2){
    
    return Math.sqrt( Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2) );

}


function getMouseePos(e){

    mousePosX = 2*(((e.clientX - rect.left) * rscaleX) - (canvas.width/2))/canvas.width;
    mousePosY = -2*(((e.clientY - rect.top) * rscaleY) - (canvas.height/2))/canvas.height;


}


//doesn't need to specify prefix because prefix="shaders"
//.then means after completion of function
//shaders => setup(shaders) means that the previously returned value (loadShadersFromURLS) will be named shaders and then passed in the function setup 
loadShadersFromURLS(["shader.vert", "shader.frag", "shader2.frag"]).then(shaders => setup(shaders));

window.addEventListener("mousemove", getMouseePos);

window.addEventListener("mousedown", createWhiteHole);