import { buildProgramFromSources, loadShadersFromURLS, setupWebGL } from "../../libs/utils.js";
import { ortho, lookAt, flatten, mult } from "../../libs/MV.js";
import {modelView, loadMatrix, multRotationY, multRotationX, multRotationZ, multScale, pushMatrix, popMatrix, multTranslation } from "../../libs/stack.js";

import * as SPHERE from '../../libs/objects/sphere.js';
import * as CYLINDER from '../../libs/objects/cylinder.js';
import * as CUBE from '../../libs/objects/cube.js';


let gl;
const VP_DISTANCE = 500; //500 meters far
let time = 0;           // Global simulation time
let speed = 1/60.0;     // Speed (how many days added to time on each render pass
let mode;


//the cameras we'll have, composed of function that return a view matrix
let cameras = [];
let currentCamera;


//instanceTree will be composed by {model : function,  coord: [x, y, z], rotation : [x, y, z], scale : [x, y, z] filhos : [] }
let instanceTree = [];

//used to find instances by name
let instanceDic = {};

//activeInstances will point to members of the instanceTree that also have the function animate()
//note: the instances will be able to use "this" becase they're called from the body of the instance
let activeInstances = [];

function addInstance(nameStr, modelFun, initialCoord){

    let instance = { model : modelFun, coord : initialCoord, rotation : [0, 0, 0], scale : [1, 1, 1], filhos : []};
    instanceDic[nameStr] = instance;
    instanceTree.push(instance);

}

function addInstanceSon(nameStr, modelFun, initialCoord, parentName){

    let instanceParent = instanceDic[parentName];
    let instance = { model : modelFun, coord : initialCoord, rotation : [0, 0, 0], scale : [1, 1, 1], filhos : []};
    instanceDic[nameStr] = instance;
    instanceParent.filhos.push(instance);

}


function addActiveInstanceSon(nameStr, modelFun, animateFun, initialCoord, parentName){

    let instanceParent = instanceDic[parentName];
    let instance = { model : modelFun, coord : initialCoord, animate : animateFun, rotation : [0, 0, 0], scale : [1, 1, 1], filhos : []};
    instanceDic[nameStr] = instance;
    instanceParent.filhos.push(instance);
    activeInstances.push(instance);

}

function setInstanceScale(instanceName, newScale){

    instanceDic[instanceName].scale = newScale;

}

function scaleInstanceByValue(instanceName, value){

    instanceDic[instanceName].scale = 
        [
            instanceDic[instanceName].scale[0] * value,
            instanceDic[instanceName].scale[1] * value,
            instanceDic[instanceName].scale[2] * value,

        ];

}

function setup(shaders)
{
    
    //DO EXERCICIO 18
    let canvas = document.getElementById("gl-canvas");
    let aspect = canvas.width / canvas.height;

    gl = setupWebGL(canvas);

    let program = buildProgramFromSources(gl, shaders["shader.vert"], shaders["shader.frag"]);

    let mProjection = ortho(-VP_DISTANCE*aspect,VP_DISTANCE*aspect, -VP_DISTANCE, VP_DISTANCE,-3*VP_DISTANCE,3*VP_DISTANCE);

    let mode = gl.LINES;

    resize_canvas();
    window.addEventListener("resize", resize_canvas);
    window.addEventListener("resize", function(event) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0,0,canvas.width, canvas.height);
    });


    //DO PROJETO 1
    window.addEventListener("keydown", function(event) {
        console.log(event.key);
        switch(event.key) {
            //Descola
            case "PageUp":
                break;
            //Volta para baixo
            case "PageDown":
                break;
            //tecla W - malha de arame
            case 'W':
                break;
            //tecla S - superficies preenchidas
            case 'S':
                break;
            //A tecla 1 devera voltar a usar a projecao axonometrica
            case '1':
                break;
            //Vista de frente ou alçado principal
            case '2':
                break;
            //Vista de cima ou planta
            case '3':
                break;
            //Vista lateral direita ou alçado lateral direito
            case '4':
                break;
            //Desafio - Colocar uma camara adicional, posicionada no helicoptero e apontando para a frente
            case '5':
                break;
            case '-': //cycle through all available cameras
                currentCamera = (currentCamera + 1) % cameras.length;
                console.log("Current camera: " + currentCamera);
                break;
            


        }
    })
    
    /*

    canvas.addEventListener("mousedown", function(event) {
    });

    canvas.addEventListener("mousemove", function(event) {
        const p = getCursorPosition(canvas, event);

        console.log(p);
    });
    
    canvas.addEventListener("mouseup", function(event) {
    })

    */

    //DO EXERCICIO 18

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    SPHERE.init(gl);
    gl.enable(gl.DEPTH_TEST);   // Enables Z-buffer depth test
    
    window.requestAnimationFrame(render);
    
    function resize_canvas(event)
    {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        aspect = canvas.width / canvas.height;

        gl.viewport(0,0,canvas.width, canvas.height);
        mProjection = ortho(-VP_DISTANCE*aspect,VP_DISTANCE*aspect, -VP_DISTANCE, VP_DISTANCE,-3*VP_DISTANCE,3*VP_DISTANCE);
    }


        
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    CUBE.init(gl);
    gl.enable(gl.DEPTH_TEST);   // Enables Z-buffer depth test
    
    window.requestAnimationFrame(render);
    
    

    function defineColor(red, green, blue){

        const solidColor = gl.getUniformLocation(program, "solidColor");
        gl.uniform3f(solidColor, red, green, blue);


    }


    function uploadModelView()
    {
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "mModelView"), false, flatten(modelView()));
    }

    /*
        *****SETUP INITIAL INSTANCES***
    */

    /*
        *****SETUP REFERENCIAL***
    */

        function xGuide(){

            multTranslation([0, 0,-5]);
            multScale([1000, 5, 5]);
            uploadModelView();
            defineColor(1, 0, 0); //red
            CUBE.draw(gl, program, mode);
    
        }
    
        function yGuide(){
    
            multTranslation([0, 0,-5]);
            multScale([5, 1000, 5]);
            uploadModelView();
            defineColor(0, 0, 1);//blue
            CUBE.draw(gl, program, mode);
    
        }
    
        function zGuide(){
            multTranslation([0, 0,-5]);
            multScale([5, 5, 1000]);
            uploadModelView();
            defineColor(0, 1, 0);//green
            CUBE.draw(gl, program, mode);
        }
        
        //a refer to know the coordinates
        function referencial(){
    
            pushMatrix();
                xGuide();
            popMatrix();
            pushMatrix();
                yGuide();
            popMatrix();
            pushMatrix();
                zGuide();
            popMatrix();
            
        }

    /*
        ***** END OF SETUP REFERENCIAL***
    */



    /*
        *****SETUP HELICOPTER***
    */

    let helicopterSpeed = 0.5;
    let helicopterDistance = 300;
    
        function modelMainBody(){

            multScale([5, 3, 3]); //the main body is 20 meters, its a giant helicopter
            uploadModelView();
            defineColor(1, 0, 0); //red
            SPHERE.draw(gl, program, mode);

        }

        function modelTail(){

            multScale([6, 1, 1]); 
            uploadModelView();
            defineColor(1, 0, 0); //red
            SPHERE.draw(gl, program, mode);

        }

        function modelTailPoint(){

            multScale([2, 0.5, 0.5]); 
            uploadModelView();
            defineColor(1, 1, 1); //red
            SPHERE.draw(gl, program, mode);

        }

        function modelSpike(){

            multScale([0.2, 2, 0.2]); 
            uploadModelView();
            defineColor(1, 0, 1); 
            SPHERE.draw(gl, program, mode);

        }

        function helicopterHelice(){

            multScale([4, 0.1, 0.3]); 
            uploadModelView();
            defineColor(0, 0, 1); 
            SPHERE.draw(gl, program, mode);

        }
    
    
    let hHeliceRotSpeed = 10;

    function animateHelicopterHeliceRotation(){

        this.rotation[1] = (this.rotation[1] + hHeliceRotSpeed) % (720); 

    }


    function animateHelicopter(){


        this.coord = [helicopterDistance * Math.cos(time * helicopterSpeed),
                      this.coord[1],
                      helicopterDistance * Math.sin(time * helicopterSpeed)];

        this.rotation[0] = time * helicopterSpeed; //why isn't this working?



    }

    function setupHelicopter(){

        addActiveInstanceSon("Helicopter",
        modelMainBody,
        animateHelicopter,
        [0, 400, 0], //only the Y matters because of the animation
        "World");

            addInstanceSon("HelicopterTail",
            modelTail,
            [-4, 0, 0],
            "Helicopter");

                addInstanceSon("HelicopterTailPoint",
                modelTailPoint,
                [-3, 0.5, 0],
                "HelicopterTail");

                instanceDic["HelicopterTailPoint"].rotation[2] = -75;

            addActiveInstanceSon("HelicopterSpike",
            modelSpike,
            animateHelicopterHeliceRotation,
            [0, 2, 0],
            "Helicopter");

                addInstanceSon("HelicopterHelice1",
                helicopterHelice,
                [2, 0.5, 0],
                "HelicopterSpike");

                addInstanceSon("HelicopterHelice2",
                helicopterHelice,
                [-2, 0.5, 0],
                "HelicopterSpike");

    }
    

    /*
        *****END OF SETUP HELICOPTER***
    */
   
        
    function setupInstances(){


        addInstance("World",
                    function(){},
                    [0, 0, 0]);
    
        addInstanceSon("Ground",
                    function(){
                        multTranslation([0, -5, 0]);
                        multScale([1000, 5, 1000]);
                        uploadModelView();
                        defineColor(1, 1, 1); //white
                        CUBE.draw(gl, program, mode);
                    },
                    [0, 0, 0],
                    "World");

        addInstanceSon("Referencial",
        referencial,
        [0, 0, 0],
        "World");

        setupHelicopter();

        //the helicopter was too small, increasing its size to 3x
        scaleInstanceByValue("Helicopter", 30);

    
        console.log(instanceTree);

    }

    setupInstances();

    /*
        *****END OF SETUP INITIAL INSTANCES***
    */

    /*
        *****SETUP CAMERAS***
    */
   
    function camera0(){return {eye: [0,VP_DISTANCE,VP_DISTANCE], at: [0,0,0], up: [0,1,0]};}
    function camera1(){return {eye: [80,VP_DISTANCE,VP_DISTANCE], at: [0,0,0], up: [0,1,0]};}
    function camera3(){return {eye: [100,VP_DISTANCE * 0.5,VP_DISTANCE * 0.5], at: [0,0,0], up: [0,1,0]};}
    function camera4(){return {eye: [-100,VP_DISTANCE * 0.2,VP_DISTANCE * 0.5], at: [0,0,0], up: [0,1,0]};}

    cameras = [camera0, camera1, camera3, camera4];
    currentCamera = 1;

    /*
        *****END OF SETUP CAMERAS***
    */    


    function recursiveModelConstruction(instanceNodes){

        for(let i = 0; i < instanceNodes.length; i++){

            pushMatrix();
                multTranslation(instanceNodes[i].coord);
                multRotationX(instanceNodes[i].rotation[0]);
                multRotationY(instanceNodes[i].rotation[1]);
                multRotationZ(instanceNodes[i].rotation[2]);
                multScale(instanceNodes[i].scale);
                pushMatrix();
                    instanceNodes[i].model();
                popMatrix();
                recursiveModelConstruction(instanceNodes[i].filhos);
            popMatrix();

        }


    }


    function render()
    {

        time += speed;
        window.requestAnimationFrame(render);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        gl.useProgram(program);
        
        //ModelView Transf -> Proj Transf -> Perspective div -> Clip -> Projection along Z -> Viewport Transf


        gl.uniformMatrix4fv(gl.getUniformLocation(program, "mProjection"), false, flatten(mProjection));

        let camera = cameras[currentCamera]();
        loadMatrix(lookAt(camera.eye, camera.at, camera.up));


        recursiveModelConstruction(instanceTree);

        for(let i = 0; i < activeInstances.length; i++){

            activeInstances[i].animate();

        }


        
    }
}


const urls = ["shader.vert", "shader.frag"];
loadShadersFromURLS(urls).then(shaders => setup(shaders))