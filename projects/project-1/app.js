import { buildProgramFromSources, loadShadersFromURLS, setupWebGL } from '../../libs/utils.js';
import { vec2, vec4, flatten, subtract, dot } from '../../libs/MV.js';

// Buffers: particles before update, particles after update, quad vertices
let inParticlesBuffer, outParticlesBuffer, quadBuffer;

// Particle system constants

// Total number of particles
const N_PARTICLES = 100000;

let drawPoints = true;
let drawField = true;

let time = undefined;


//the coordinates will be considered X: -1 to 1 and Y: -1 to 1 when rendering
//we want to think of them as X: -1.5 to 1.5 (rendering square and a half) and adjust Y to mantain porpotions
//To mantain the X, it's as simple as just dividing by 1.5 the X of a point we want to draw
//this two should always have the same propotion
const xLimit = 1.5;
const xScale = 1/xLimit;
var yLimit; //calculated before first render, it's supposed to mantain the square form because squares are nice
var yScale;



//all variables bellow this comment lack due implementation in the code

var mousePos = vec2(0, 0); //probably unecessary and to remove


const MAX_PLANETS = 10;
var planets = []; // an array of vec 4 (position, radius, mass)

var timeCreatingPlanet = 0; //aux to calc rad of planet
const radiusPerTime = 0.1; //how much radius per time
var planetBeingCreated = false;
var planetBeingCreatedPos = vec2(0, 0);

const GravConst = 6.67 * Math.pow(10, -11);
const BaseDensBig = 5510;
const ScaleFactor = 6371000;
const partMass = 1;

var tvMin = 2; // the minimum life time of a particle, 'q' increases and 'a' decreases
const tvMinMin = 1;
const tvMinMax = 19;

var tvMax = 10; // the maximum life time of a partice, 'w' increases and 's' decreases
const tvMaxMin = 2;
const tvMaxMax = 20;

const tvChange = 0.01;

var origin = vec2(0, 0); // the origin of the particles, movement with SHIFT pressed changes it

var vMin = 0.1; // the minimum velocity of a new particle, SHIFT + PAGEUP increases and SHIFT + PAGEDOWN decreases
var vMax = 0.2; //maximum velocity of a new particle, PAGEUP increases and PAGEDOWN decreases
const vChange = 0.01;

var baseDeg = 0; //angle that defines crentral dir to new particles, changes  with LEFT and RIGHT
const degChange = 0.05;

var degMaxVar = Math.PI; //maximum variance of baseDeg to new particles, changes with UP and DOWN
const degMaxMin = -Math.PI;
const degMaxMax = Math.PI;
const degVarChange = 0.05;

function main(shaders)
{
    // Generate the canvas element to fill the entire page
    const canvas = document.createElement("canvas");
    document.body.appendChild(canvas);

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    yLimit = (canvas.height/canvas.width) * xLimit;
    yScale = 1/yLimit;

    /** type {WebGL2RenderingContext} */
    const gl = setupWebGL(canvas, {alpha: true});

    // Initialize GLSL programs    
    const fieldProgram = buildProgramFromSources(gl, shaders["field-render.vert"], shaders["field-render.frag"]);
    const renderProgram = buildProgramFromSources(gl, shaders["particle-render.vert"], shaders["particle-render.frag"]);
    const updateProgram = buildProgramFromSources(gl, shaders["particle-update.vert"], shaders["particle-update.frag"], ["vPositionOut", "vAgeOut", "vLifeOut", "vVelocityOut"]);

    gl.viewport(0,0,canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Enable Alpha blending
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); 

    buildQuad();
    buildParticleSystem(N_PARTICLES);

    //what should this code do when the page is resized
    window.addEventListener("resize", function(event) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0,0,canvas.width, canvas.height);

    });

    //chat should this code do when the user presses on a key
    window.addEventListener("keydown", function(event) {
        console.log(event.key);
        switch(event.key) {
            case "PageUp":

                if(event.shiftKey){

                    vMin = Math.min( vMin + vChange, vMax);
                    console.log("Min Rand Vel: " + vMin);

                }else{

                    vMax += vChange;
                    console.log("Max Rand Vel: " + vMax);

                }

                break;
            case "PageDown":

                if(event.shiftKey){

                    vMin -= vChange;
                    console.log("Min Rand Vel: " + vMin);

                }else{

                    vMax = Math.max( vMax - vChange, vMin);
                    console.log("Max Rand Vel: " + vMax);

                }

                break;
            case "ArrowUp":

                degMaxVar = Math.min(degMaxMax, degMaxVar + degVarChange);
                console.log("Deg Max Var: " + degMaxVar);

                break;
            case "ArrowDown":
                
                degMaxVar = Math.max(degMaxMin, degMaxVar - degVarChange);
                console.log("Deg Max Var: " + degMaxVar);

                break;
            case "ArrowLeft":

                baseDeg += degChange;
                console.log("Base deg: " + baseDeg);

                break;
            case "ArrowRight":

                baseDeg -= degChange;
                console.log("Base deg: " + baseDeg);

                break;
            case 'q':

                tvMin = Math.min(tvMinMax, tvMin + tvChange, tvMax);
                console.log("Min Life: " + tvMin);

                break;
            case 'a':
                tvMin = Math.max(tvMinMin, tvMin - tvChange);
                console.log("Min Life: " + tvMin);
                break;
            case 'w':
                tvMax = Math.min(tvMaxMax, tvMax + tvChange);
                console.log("Max Life: " + tvMax);
                break;
            case 's':
                tvMax = Math.max(tvMaxMin, tvMax - tvChange, tvMin);
                console.log("Max Life: " + tvMax);
                break;
            case '0':
                drawField = !drawField;
                break;
            case '9':
                drawPoints  = !drawPoints;
                break; 
            case 'Shift':

        }
    })
    
    //what shoud this code do when the mouse is pressed
    canvas.addEventListener("mousedown", function(event) {

        if(!planetBeingCreated) { startCreatingPlanet(); }

    });


    //what should this code do when the mouse is moved
    canvas.addEventListener("mousemove", function(event) {

        mousePos = getCursorPosition(canvas, event);
        //console.log("X: " + mousePos[0] + " Y: " + mousePos[1]);
        
        if(event.shiftKey){

            origin = mousePos;
            console.log("Origin: " + origin);


        }

    });

    //what should this code do when the mouse seizes to be pressed
    canvas.addEventListener("mouseup", function(event) {
        if(planetBeingCreated){ stopCreatingPlanet();}
    })

    
    function getCursorPosition(canvas, event) {
  
       
        const mx = event.offsetX;
        const my = event.offsetY;

        const x = ((mx / canvas.width * 2) - 1);
        const y = (((canvas.height - my)/canvas.height * 2) -1);

        //console.log("True X: " + mx + " True Y: " + my);

        return vec2(x,y);
    }

    window.requestAnimationFrame(animate);

    function buildQuad() {
        const vertices = [-1.0, 1.0, -1.0, -1.0, 1.0, -1.0,
                          -1.0, 1.0,  1.0, -1.0, 1.0,  1.0];
                          
        
        quadBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    }

    //creates randomly spaced particles with a life expentancy
    function buildParticleSystem(nParticles) {
        const data = [];

        for(let i=0; i<nParticles; ++i) {
            // position
            const x = (Math.random()-0.5) * xScale;
            const y = (Math.random()-0.5) * yScale;

            data.push(x); data.push(y);
            
            // age
            data.push(0.0);

            // life
            const life = 6.0 + Math.random();
            data.push(life);

            // velocity
            data.push(0.1*(Math.random()-0.5));
            data.push(0.1*(Math.random()-0.5));
        }

        inParticlesBuffer = gl.createBuffer();
        outParticlesBuffer = gl.createBuffer();

        // Input buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, inParticlesBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(data), gl.STREAM_DRAW);

        // Output buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, outParticlesBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(data), gl.STREAM_DRAW);
    }



    function animate(timestamp)
    {
        let deltaTime = 0; // the change of time since the last calculation

        if(time === undefined) {        // First time
            time = timestamp/1000;
        } 
        else {                          // All other times
            deltaTime = timestamp/1000 - time;
            time = timestamp/1000;
        }

        if(planetBeingCreated) {timeCreatingPlanet += 1;}

        window.requestAnimationFrame(animate);

        // Clear framebuffer
        gl.clear(gl.COLOR_BUFFER_BIT);

        if(drawField) drawQuad();
        updateParticles(deltaTime);
        if(drawPoints) drawParticles(outParticlesBuffer, N_PARTICLES);

        swapParticlesBuffers();
    }

    function updateParticles(deltaTime)
    {
        // Setup uniforms
        const uDeltaTime = gl.getUniformLocation(updateProgram, "uDeltaTime");
        const vRandVelMin = gl.getUniformLocation(updateProgram, "randVelMin");
        const vRandVelMax = gl.getUniformLocation(updateProgram, "randVelMax");
        const vOrigin = gl.getUniformLocation(updateProgram, "origin");
        const vVelDir = gl.getUniformLocation(updateProgram, "velDir");
        const vMaxDirVar = gl.getUniformLocation(updateProgram, "maxDirVar");
        const vRandLifeMax = gl.getUniformLocation(updateProgram, "randLifeMax");
        const vRandLifeMin = gl.getUniformLocation(updateProgram, "randLifeMin");

        gl.useProgram(updateProgram);


        gl.uniform1f(uDeltaTime, deltaTime); //puts the variance in the shader
        gl.uniform1f(vRandVelMin, vMin);
        gl.uniform1f(vRandVelMax, vMax);
        gl.uniform2fv(vOrigin, origin);
        gl.uniform1f(vVelDir, baseDeg);
        gl.uniform1f(vMaxDirVar, degMaxVar);
        gl.uniform1f(vRandLifeMax, tvMax);
        gl.uniform1f(vRandLifeMin, tvMin);

        for(let i = 0; i < planets.length; i++){

            const uPlanets = gl.getUniformLocation(updateProgram, "uPlanets[" + i + "]");
            gl.uniform4fv(uPlanets, planets[i]);
            //console.log("added planet with " + planets[i][0] + " " + planets[i][1] + " " + planets[i][2] + " " + planets[i][3]);

        }

        for(let i = planets.length; i < MAX_PLANETS; i++){

            const uPlanets = gl.getUniformLocation(updateProgram, "uPlanets[" + i + "]");
            gl.uniform4f(uPlanets, 0, 0, 0, 0);

        }
        
        // Setup attributes
        const vPosition = gl.getAttribLocation(updateProgram, "vPosition");
        const vAge = gl.getAttribLocation(updateProgram, "vAge");
        const vLife = gl.getAttribLocation(updateProgram, "vLife");
        const vVelocity = gl.getAttribLocation(updateProgram, "vVelocity");

        gl.bindBuffer(gl.ARRAY_BUFFER, inParticlesBuffer);
        
        gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 24, 0);
        gl.vertexAttribPointer(vAge, 1, gl.FLOAT, false, 24, 8);
        gl.vertexAttribPointer(vLife, 1, gl.FLOAT, false, 24, 12);
        gl.vertexAttribPointer(vVelocity, 2, gl.FLOAT, false, 24, 16);
        
        gl.enableVertexAttribArray(vPosition);
        gl.enableVertexAttribArray(vAge);
        gl.enableVertexAttribArray(vLife);
        gl.enableVertexAttribArray(vVelocity);

        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, outParticlesBuffer);
        gl.enable(gl.RASTERIZER_DISCARD);
        gl.beginTransformFeedback(gl.POINTS);
        gl.drawArrays(gl.POINTS, 0, N_PARTICLES);
        gl.endTransformFeedback();
        gl.disable(gl.RASTERIZER_DISCARD);
        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, null);
    }

    function swapParticlesBuffers()
    {
        let auxBuffer = inParticlesBuffer;
        inParticlesBuffer = outParticlesBuffer;
        outParticlesBuffer = auxBuffer;
    }

    function drawQuad() {

        gl.useProgram(fieldProgram);

        // Setup attributes
        const vPosition = gl.getAttribLocation(fieldProgram, "vPosition"); 
     
        for(let i = 0; i < planets.length; i++){

            const ufPlanets = gl.getUniformLocation(fieldProgram, "ufPlanets[" + i + "]");
            gl.uniform4fv(ufPlanets, planets);

        }

        for(let i = planets.length; i < MAX_PLANETS; i++){

            const ufPlanets = gl.getUniformLocation(fieldProgram, "ufPlanets[" + i + "]");
            gl.uniform4f(ufPlanets, 0, 0, 0, 0);

        }

        gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
        gl.enableVertexAttribArray(vPosition);
        gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
        
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    function drawParticles(buffer, nParticles)
    {

        gl.useProgram(renderProgram);

        // Setup attributes
        const vPosition = gl.getAttribLocation(renderProgram, "vPosition");

        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

        gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 24, 0);
        gl.enableVertexAttribArray(vPosition);

        gl.drawArrays(gl.POINTS, 0, nParticles);
    }


    function calcPlanetMass(radiusInReferencial){

        return Math.pow(radiusInReferencial * ScaleFactor, 3) * BaseDensBig * Math.PI * 4 / 3

    }

    function startCreatingPlanet(){

        planetBeingCreated = true;
        planetBeingCreatedPos = mousePos;
        

    }

    function stopCreatingPlanet(){

        planetBeingCreated = false;
        createPlanet(planetBeingCreatedPos, timeCreatingPlanet * radiusPerTime, calcPlanetMass(timeCreatingPlanet * radiusPerTime));
        timeCreatingPlanet = 0;
    }

    function createPlanet(position, radius, mass){

        if(planets.length < 10){

            planets.push(vec4(position[0], position[1], radius, mass));
            console.log("Planet created with Pos: " + position + " radius: " + radius + " mass: " + mass);

        }

    }

}


loadShadersFromURLS([
    "field-render.vert", "field-render.frag",
    "particle-update.vert", "particle-update.frag", 
    "particle-render.vert", "particle-render.frag"
    ]
).then(shaders=>main(shaders));