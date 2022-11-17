import { buildProgramFromSources, loadShadersFromURLS, setupWebGL } from "../../libs/utils.js";
import { ortho, lookAt, flatten, mult, perspective } from "../../libs/MV.js";
import {modelView, loadMatrix, multRotationY, multRotationX, multRotationZ, multScale, pushMatrix, popMatrix, multTranslation } from "../../libs/stack.js";

import * as SPHERE from '../../libs/objects/sphere.js';
import * as CYLINDER from '../../libs/objects/cylinder.js';
import * as CUBE from '../../libs/objects/cube.js';


let gl;
const VP_DISTANCE = 500; //500 meters far
let time = 0;           // Global simulation time
let speed = 1/60.0;     // Speed (how many days added to time on each render pass


//the cameras we'll have, composed of instances with a camera() method
let cameras = [];
let currentCamera = 0;

//draw modes
let drawModes = [];
let currentDrawMode = 0;


//instanceTree will be composed by {name : string, model : function,  coord: [x, y, z], rotation : [x, y, z], scale : [x, y, z], filhos : [], Pai : instance }
let instanceTree = [];

//used to find instances by name
let instanceDic = {};

//activeInstances will point to members of the instanceTree that also have the function animate()
//note: the instances will be able to use "this" becase they're called from the body of the instance
let activeInstances = [];

function generateInstanceName(newName){

    let toReturn = newName;
    for(let i = 2; instanceDic[toReturn] != undefined; i++){

        toReturn = newName + "_" + i;

    }

    return toReturn;


}

//uma instancia destas tem Pai = undefined
function addInstance(nameStr, modelFun, initialCoord){

    let newName = generateInstanceName(nameStr);

    let instance = { name : newName, model : modelFun, coord : initialCoord, rotation : [0, 0, 0], scale : [1, 1, 1], filhos : []};
    instanceDic[newName] = instance;
    instanceTree.push(instance);


    return instance;

}

function addInstanceSon(nameStr, modelFun, initialCoord, parentName){

    let instanceParent = instanceDic[parentName];
    
    
    let instance = addInstance(nameStr, modelFun, initialCoord);

    instance.Pai = instanceParent;
    instanceParent.filhos.push(instance);


    return instance;

}

function addActiveInstance(nameStr, modelFun, animateFun, initialCoord){


    let instance = addInstance(nameStr, modelFun, initialCoord);
    instance.animate = animateFun;
    activeInstances.push(instance);

    return instance;


}

function addActiveInstanceSon(nameStr, modelFun, animateFun, initialCoord, parentName){

    let instance = addInstanceSon(nameStr, modelFun, initialCoord, parentName);
    instance.animate = animateFun;

    return instance;

}

function addCameraInstance(nameStr, cameraFun, initialCoord){

    let camera = addInstance(nameStr,
    function(){},
    initialCoord);
    
    camera.camera = cameraFun;
    cameras.push(camera);

    return camera;

}

function addCameraInstanceSon(nameStr, cameraFun, initialCoord, parentName){

    let camera = addInstanceSon(nameStr,
        function(){},
        initialCoord,
        parentName);
        
        camera.camera = cameraFun;
        cameras.push(camera);
    
        return camera;

}

function instanceTrueCoord(instance){

    let toReturn = [instance.coord[0], instance.coord[1], instance.coord[2]];
    
    let instanceParent = instance.Pai;

    while(instanceParent != undefined){

        toReturn = [toReturn[0] + instanceParent.coord[0], toReturn[1] + instanceParent.coord[1], toReturn[2] + instanceParent.coord[2]];
        instanceParent = instanceParent.Pai;

    }

    return toReturn;

}


function scaleInstanceByValue(instance, value){

        instance.scale = 
        [
            instance.scale[0] * value,
            instance.scale[1] * value,
            instance.scale[2] * value,

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
                currentDrawMode = (currentDrawMode + 1) % drawModes.length;
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


    //this will define the color of the sky
    gl.clearColor(0.1, 0.3, 0.8, 1.0);
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
        *****SETUP DRAW MODES***
    */

    drawModes = [gl.LINES, gl.TRIANGLES];
    currentDrawMode = 0;

    /*
        *****END OF SETUP DRAW MODES***
    */    


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
            CUBE.draw(gl, program, drawModes[currentDrawMode]);
    
        }
    
        function yGuide(){
    
            multTranslation([0, 0,-5]);
            multScale([5, 1000, 5]);
            uploadModelView();
            defineColor(0, 0, 1);//blue
            CUBE.draw(gl, program, drawModes[currentDrawMode]);
    
        }
    
        function zGuide(){
            multTranslation([0, 0,-5]);
            multScale([5, 5, 1000]);
            uploadModelView();
            defineColor(0, 1, 0);//green
            CUBE.draw(gl, program, drawModes[currentDrawMode]);
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

    
        function setupReferencial(){

            addInstance("Referencial",
            referencial,
            [0, 0, 0]);

        }

    /*
        ***** END OF SETUP REFERENCIAL***
    */


    /*
        *****SETUP GROUND***
    */


    /*
        *****SETUP BUILDINGS***
    */

        

    /*
        *****END OF SETUP BUILDINGS***
    */


    /*
        *****END OF SETUP GROUND***
    */


    /*
        *****SETUP HELICOPTER***

        An Helicopter (the main body) also as:
            distance : int
            speed : int

        It also has a camera

    */

    
        function modelMainBody(){

            multScale([5, 3, 3]); //the main body is 20 meters, its a giant helicopter
            uploadModelView();
            defineColor(1, 0, 0); //red
            SPHERE.draw(gl, program, drawModes[currentDrawMode]);

        }

        function modelTail(){

            multScale([6, 1, 1]); 
            uploadModelView();
            defineColor(1, 0, 0); //red
            SPHERE.draw(gl, program, drawModes[currentDrawMode]);

        }

        function modelTailPoint(){

            multScale([2, 0.5, 0.5]); 
            uploadModelView();
            defineColor(1, 1, 1); //red
            SPHERE.draw(gl, program, drawModes[currentDrawMode]);

        }

        function modelSpike(){

            multScale([0.2, 2, 0.2]); 
            uploadModelView();
            defineColor(1, 0, 1); 
            SPHERE.draw(gl, program, drawModes[currentDrawMode]);

        }

        function helicopterHelice(){

            multScale([4, 0.1, 0.3]); 
            uploadModelView();
            defineColor(0, 0, 1); 
            SPHERE.draw(gl, program, drawModes[currentDrawMode]);

        }
    
    
    let hHeliceRotSpeed = 10;

    function animateHelicopterHeliceRotation(){

        this.rotation[1] = (this.rotation[1] + hHeliceRotSpeed) % (720); 

    }


    function animateHelicopter(){

        let angle = (time * this.speed) % 720;
        let angleInRad = angle * (Math.PI/180);

        this.coord = [this.distance * Math.cos(angleInRad),
                      this.coord[1],
                      this.distance * Math.sin(angleInRad)];

        this.rotation[1] = 180 - angle; //why isn't this working?


    }

    function helicopterCamera(){


        return {eye: [0, 0, 0], at: instanceTrueCoord(this), up: [0,1,0]};

    }

    function setupHelicopter(helicopterDistance, helicopterSpeed, helicopterHeight){

        let helicoinstance = addActiveInstance("Helicopter",
        modelMainBody,
        animateHelicopter,
        [0, helicopterHeight, 0]);

        helicoinstance.distance = helicopterDistance;
        helicoinstance.speed = helicopterSpeed;

            let hTail = addInstanceSon("HelicopterTail",
            modelTail,
            [-4, 0, 0],
            helicoinstance.name);

                let hTailPoint = addInstanceSon("HelicopterTailPoint",
                modelTailPoint,
                [-3, 0.5, 0],
                hTail.name);

                hTailPoint.rotation[2] = -75;

            let hSpike = addActiveInstanceSon("HelicopterSpike",
            modelSpike,
            animateHelicopterHeliceRotation,
            [0, 2, 0],
            helicoinstance.name);

                addInstanceSon("HelicopterHelice1",
                helicopterHelice,
                [2, 0.5, 0],
                hSpike.name);

                addInstanceSon("HelicopterHelice2",
                helicopterHelice,
                [-2, 0.5, 0],
                hSpike.name);

            addCameraInstanceSon("HelicopterCamera",
            helicopterCamera,
            [2.6, 0.5, 0],
            helicoinstance.name);

        scaleInstanceByValue(helicoinstance, 5);

    }
    

    /*
        *****END OF SETUP HELICOPTER***
    */
   
    /*
        *****SETUP CAMERAS***
    */

        function cameraBaseFunction(){

            return {eye: [0, 0, 0], at: [this.coord[0], this.coord[1], this.coord[2]], up: [0,1,0]};

        }


        function setupBaseCameras(){

            addCameraInstance("Camera",
            cameraBaseFunction,
            [0, VP_DISTANCE, VP_DISTANCE]);

            addCameraInstance("Camera",
            cameraBaseFunction,
            [80, VP_DISTANCE, VP_DISTANCE]);

            addCameraInstance("Camera",
            cameraBaseFunction,
            [100, VP_DISTANCE * 0.5, VP_DISTANCE * 0.5]);

            addCameraInstance("Camera",
            cameraBaseFunction,
            [-100, VP_DISTANCE * 0.2, VP_DISTANCE * 0.5]);



        }

    


        function setupCameras(){

            setupBaseCameras();    
        
            currentCamera = 1;
        }
    
        /*
            *****END OF SETUP CAMERAS***
        */ 
       
            
    function setupInstances(){

        setupCameras();

        setupReferencial();

        addInstance("Ground",
                    function(){
                        multTranslation([0, -5, 0]);
                        multScale([1000, 5, 1000]);
                        uploadModelView();
                        defineColor(1, 1, 1); //white
                        CUBE.draw(gl, program, drawModes[currentDrawMode]);
                    },
                    [0, 0, 0]);



        setupHelicopter(300, 30, 400);
        
        setupHelicopter(200, 5, 200);

        console.log(instanceTree);

    }

    setupInstances();

    /*
        *****END OF SETUP INITIAL INSTANCES***
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

        let camera = cameras[currentCamera].camera();;
        loadMatrix(lookAt(camera.eye, camera.at, camera.up));


        recursiveModelConstruction(instanceTree);

        for(let i = 0; i < activeInstances.length; i++){

            activeInstances[i].animate();

        }


        
    }
}


const urls = ["shader.vert", "shader.frag"];
loadShadersFromURLS(urls).then(shaders => setup(shaders))