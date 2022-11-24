import { buildProgramFromSources, loadShadersFromURLS, setupWebGL } from "../../libs/utils.js";
import { ortho, lookAt, flatten, mult, perspective, rotate } from "../../libs/MV.js";
import {modelView, loadMatrix, multRotationY, multRotationX, multRotationZ, multScale, pushMatrix, popMatrix, multTranslation } from "../../libs/stack.js";

import * as SPHERE from '../../libs/objects/sphere.js';
import * as CYLINDER from '../../libs/objects/cylinder.js';
import * as CUBE from '../../libs/objects/cube.js';


let gl;
const VP_DISTANCE = 500; //500 meters far
let time;
let speed = 1;  //  /60.0;


//the cameras we'll have, composed of instances with a threadRenderCamera() method
let cameras = [];
let currentCamera = 0;

//draw modes
let drawModes = [];
let currentDrawMode = 0;


//instanceTree will be composed by {name : string, model : function,  coord: [x, y, z], rotation : [x, y, z], scale : [x, y, z], filhos : [], Pai : instance, color : [r, g, b] }
let instanceTree = [];

//used to find instances by name
let instanceDic = {};

//activeInstances will point to members of the instanceTree that also have the function animate()
//note: the instances will be able to use "this" becase they're called from the body of the instance
let activeInstances = [];

//these arrays are for deleting/freeing instances at the same time after animating, so there's not any problems by
//removing instances mid animation

let instancesToFree = [];

let instancesToDelete = [];

//instancesWithTheMethod react(event.key), to react when a key is pressed
let reactiveInstances = [];


function consoleloginstances(instanceArray){

    for(let i = 0; i <  instanceArray.length; i++){


        console.log(i + ": Name: " + instanceArray[i].name);

    }

}

function indexOfInstanceInArray(instanceToTest, instanceArray){


    let toReturn = -1;
    for(let i = 0; i <  instanceArray.length; i++){

        if(instanceArray[i].name == instanceToTest.name){ 
            
            toReturn = i;
            break;
        }
    }

    return toReturn;

}

function generateInstanceName(newName){

    let toReturn = newName;
    for(let i = 2; instanceDic[toReturn] != undefined; i++){

        toReturn = newName + "_" + i;

    }

    return toReturn;


}

//uma instancia destas tem Pai = undefined
function addInstance(nameStr, initialCoord){

    let newName = generateInstanceName(nameStr);

    let instance = { name : newName, coord : initialCoord, model : function(){}, rotation : [0, 0, 0], scale : [1, 1, 1], filhos : []};
    instanceDic[newName] = instance;
    instanceTree.push(instance);


    return instance;

}

function addInstanceSon(nameStr, initialCoord, parentName){

    let instanceParent = instanceDic[parentName];
    
    
    let newName = generateInstanceName(nameStr);

    let instance = { name : newName, coord : initialCoord, model : function(){}, rotation : [0, 0, 0], scale : [1, 1, 1], filhos : []};
    instanceDic[newName] = instance;

    instance.Pai = instanceParent;
    instanceParent.filhos.push(instance);


    return instance;

}

function addModeledInstance(nameStr, initialCoord, modelFun, colorArray, drawFun){

    let instance = addInstance(nameStr, initialCoord);
    instance.model = modelFun;
    instance.color = colorArray;
    instance.draw = drawFun;

    return instance;

}

function addModeledInstanceSon(nameStr, initialCoord, parentName, modelFun, colorArray, drawFun){

    let instance = addInstanceSon(nameStr, initialCoord, parentName);
    instance.model = modelFun;
    instance.color = colorArray;
    instance.draw = drawFun;


    return instance;


}

function addActiveInstance(nameStr, initialCoord, modelFun, colorArray, drawFun, animateFun){


    let instance = addModeledInstance(nameStr, initialCoord, modelFun, colorArray, drawFun);
    instance.animate = animateFun;
    activeInstances.push(instance);

    return instance;


}

function addActiveInstanceSon(nameStr, initialCoord, parentName, modelFun, colorArray, drawFun, animateFun){

    let instance = addModeledInstanceSon(nameStr, initialCoord, parentName, modelFun, colorArray, drawFun);
    instance.animate = animateFun;
    activeInstances.push(instance);

    return instance;

}

function addCameraInstance(nameStr, cameraFun, initialCoord){

    let camera = addInstance(nameStr, initialCoord);
    camera.threadRenderCamera = cameraFun;
    cameras.push(camera);

    return camera;

}

function addCameraInstanceSon(nameStr, initialCoord, parentName, cameraFun){

    let camera = addInstanceSon(nameStr,
        initialCoord, 
        parentName);
        
        camera.threadRenderCamera = cameraFun;
        cameras.push(camera);
    
        return camera;

}

function instanceTrueCoord(instance){

    let toReturn = [instance.coord[0], instance.coord[1], instance.coord[2]];
    
    let instanceParent = instance.Pai;

    while(instanceParent != undefined){

        toReturn = [toReturn[0] * instanceParent.scale[0] + instanceParent.coord[0], toReturn[1] * instanceParent.scale[1] + instanceParent.coord[1], toReturn[2]* instanceParent.scale[2] + instanceParent.coord[2]];
        instanceParent = instanceParent.Pai;

    }

    return toReturn;

}

function instanceTrueScale(instance){

    let toReturn = [instance.scale[0], instance.scale[1], instance.scale[2]];
    
    let instanceParent = instance.Pai;

    while(instanceParent != undefined){

        toReturn = [toReturn[0] * instanceParent.scale[0], toReturn[1] * instanceParent.scale[1], toReturn[2]* instanceParent.scale[2]];
        instanceParent = instanceParent.Pai;

    }

    return toReturn;

}

function makeInstanceResponsive(instance, reactFun){

    instance.react = reactFun;
    reactiveInstances.push(instance);

}

function makeInstanceActive(instance, animateFun){

    instance.animate = animateFun;
    activeInstances.push(instance);

}

function freeInstance(instanceToFree){


    let newCoord = instanceTrueCoord(instanceToFree);
    let newScale = instanceTrueScale(instanceToFree);
    
    let instanceToFreeParent = instanceToFree.Pai;


    instanceToFreeParent.filhos.splice(indexOfInstanceInArray(instanceToFree, instanceToFreeParent.filhos), 1);


    instanceToFree.Pai = undefined;
    instanceTree.push(instanceToFree);

    instanceToFree.coord = newCoord;
    instanceToFree.scale = newScale;
    

}

function deleteInstance(instanceToDelete){

    let instanceToDeleteParent = instanceToDelete.Pai;
    if(instanceToDeleteParent != undefined){

        instanceToDeleteParent.filhos.splice(indexOfInstanceInArray(instanceToDelete, instanceToDeleteParent.filhos), 1);

    }else {

        instanceTree.splice(indexOfInstanceInArray(instanceToDelete, instanceTree), 1);

    }

    if(instanceToDelete.animate != undefined){

        activeInstances.splice(indexOfInstanceInArray(instanceToDelete, activeInstances), 1);


    }

    if(instanceToDelete.react != undefined){

        reactiveInstances.splice(indexOfInstanceInArray(instanceToDelete, reactiveInstances), 1);

    }

    instanceToDelete.Pai = undefined;
    instanceDic[instanceToDelete.name] = undefined;

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
    
    let canvas = document.getElementById("gl-canvas");
    let aspect = canvas.width / canvas.height;

    gl = setupWebGL(canvas);

    let program = buildProgramFromSources(gl, shaders["shader.vert"], shaders["shader.frag"]);

    let mProjection = ortho(-VP_DISTANCE*aspect,VP_DISTANCE*aspect, -VP_DISTANCE, VP_DISTANCE,-3*VP_DISTANCE,3*VP_DISTANCE);

    resize_canvas();
    window.addEventListener("resize", resize_canvas);
    window.addEventListener("resize", function(event) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0,0,canvas.width, canvas.height);
    });


    //DO PROJETO 1
    window.addEventListener("keydown", function(event) {
        switch(event.key) {
            //Descola
            case "PageUp":
                break;
            //Volta para baixo
            case "PageDown":
                break;
            //tecla W - malha de arame
            case 'W':
                currentDrawMode = (currentDrawMode + 1) % drawModes.length;
                break;
            //tecla S - superficies preenchidas
            case 'S':
                currentDrawMode = (currentDrawMode + 1) % drawModes.length;
                break;
            //A tecla 1 devera voltar a usar a projecao axonometrica
            case '1':
                currentCamera = 1;
                break;
            //Vista de frente ou alçado principal
            case '2':
                currentCamera = 2;
                break;
            //Vista de cima ou planta
            case '3':
                currentCamera ;
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
                console.log("all the cameras: " + cameras)
                break;
            


        }

        for(let i = 0; i < reactiveInstances.length; i++){

            reactiveInstances[i].react(event.key);

        }

    })



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
    gl.clearColor(56, 56, 56, 1.0);
    CUBE.init(gl);
    gl.enable(gl.DEPTH_TEST);   // Enables Z-buffer depth test
    
    window.requestAnimationFrame(render);
    
    

    function defineColor(colors){

        const solidColor = gl.getUniformLocation(program, "solidColor");
        gl.uniform3f(solidColor, colors[0]/255, colors[1]/255, colors[2]/255);


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

        It is not an instance, is simply rendered

    */

        function xGuide(){

            multScale([1000, 5, 5]);
            uploadModelView();
            defineColor([255, 0, 0]); //red
            CUBE.draw(gl, program, drawModes[currentDrawMode]);
    
        }
    
        function yGuide(){
    
            multScale([5, 1000, 5]);
            uploadModelView();
            defineColor([0, 0, 255]);//blue
            CUBE.draw(gl, program, drawModes[currentDrawMode]);
    
        }
    
        function zGuide(){
            multScale([5, 5, 1000]);
            uploadModelView();
            defineColor([0, 255, 0]);//green
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

  

    /*
        ***** END OF SETUP REFERENCIAL***
    */


    /*
        *****SETUP GROUND***
    */

    let groundHeight = 0;

    function modelGround(){

        multScale([1000, 0.2, 1000]);

    }

    function setupGround(){

        let groundInstance = addModeledInstance("Ground",
        [0, 0, 0],
        modelGround,
        [193, 209, 119],
        CUBE.draw);

        return groundInstance;

    }

    /*
        *****SETUP BUILDINGS***
    */


    function modelBuildingBody(){

        multScale([10, 5, 10]);


    }

    function modelBuildingCeiling(){

        multScale([11, 0.5, 11]);


    }

    function modelBuildingWindow(){

        multScale([7, 1, 11]);


    }


    function createBuildingBody(buildingInstanceParent, relCoord, colorData, i, numberOfBlock){


        let buildingBodyInstance = addModeledInstanceSon("BuildingBody",
        relCoord,
        buildingInstanceParent.name,
        modelBuildingBody,
        colorData["Body"],
        CUBE.draw);

            let buildingInstanceCeiling = addModeledInstanceSon("BuildingCeiling",
            [0, 2.5, 0],
            buildingBodyInstance.name,
            modelBuildingCeiling,
            colorData["Ceiling"],
            CUBE.draw);

            //Hardcoded
            if(i!=0 && i!=numberOfBlock-1){
                let window = addModeledInstanceSon("BuildingWindow",
                [0, 2, -2],
                buildingBodyInstance.name,
                modelBuildingWindow,
                colorData["Window"],
                CUBE.draw);
        }

        return buildingBodyInstance;

    }
        

    function createBuilding(initialCoord, colorData, numberOfBlocks){

        let buildingInstance = addInstance("Building",  initialCoord);

        for(let i = 0; i < numberOfBlocks; i++){

            createBuildingBody(buildingInstance, [0, i * 4, 0], colorData, i, numberOfBlocks);

        }

        return buildingInstance;

    }


    function setupBuildings(){

        let buildInstance = createBuilding([60, 0, -80], {"Body" : [163, 126, 24], "Ceiling" : [183, 146, 48], "Window" : [500, 500, 500]}, 10);
        scaleInstanceByValue(buildInstance, 2);

        buildInstance = createBuilding([100, 0, 300], {"Body" : [163, 126, 24], "Ceiling" : [183, 146, 48], "Window" : [500, 500, 500]}, 13);
        scaleInstanceByValue(buildInstance, 1);

        buildInstance = createBuilding([-400, 0, -270], {"Body" : [163, 126, 24], "Ceiling" : [183, 146, 48], "Window" : [500, 500, 500]}, 6);
        scaleInstanceByValue(buildInstance, 5);

        buildInstance = createBuilding([-345, 0, 120], {"Body" : [163, 126, 24], "Ceiling" : [183, 146, 48], "Window" : [500, 500, 500]}, 10);
        scaleInstanceByValue(buildInstance, 10);

        buildInstance = createBuilding([-10, 0, -220], {"Body" : [163, 126, 24], "Ceiling" : [183, 146, 48], "Window" : [500, 500, 500]}, 20);
        scaleInstanceByValue(buildInstance, 3);


    }



        

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

        The color data is
            "Body" : [r, g, b]
            "Spike" : [r, g, b]
            "Helice" : [r, g, b]

    */

    /*

    ****SETUP BOXES***

    */

    let timeToLive = 1000;
    let timeToBeStuck= 2000;
    let boxSpeed = 0.2;
    let boxHeightAboveGround = 0.5;

    function modelBox(){

        multScale([0.8, 1, 0.6]);

    }

    function animateBox(deltaTime){

        if(this.stuckTimer > 0){

            this.stuckTimer -= deltaTime;
            if(this.stuckTimer <= 0)
                instancesToFree.push(this);

        }else{

            this.coord[1] = Math.max(this.coord[1] - boxSpeed * deltaTime, boxHeightAboveGround * this.scale[1]);
            this.liveTimer -= deltaTime;
            if(this.liveTimer <= 0)
                instancesToDelete.push(this);

        }



    }

    function createBox(initialCoord, color, parentInstance){

        let boxInstance = addActiveInstanceSon("Box",
        initialCoord,
        parentInstance.name,
        modelBox,
        color,
        CUBE.draw,
        animateBox);

    
        boxInstance.stuckTimer = timeToBeStuck;
        boxInstance.liveTimer = timeToLive;
    

    }

    /*

    ****END OF SETUP BOXES***

    */
    
        function modelMainBody(){

            multScale([5, 3, 3]); //the main body is 20 meters, its a giant helicopter


        }

        function modelTail(){

            multScale([6, 1, 1]); 


        }

        function modelTailPoint(){

            multScale([2, 0.5, 0.5]); 


        }

        function modelSpike(){

            multScale([0.2, 2, 0.2]); 


        }

        function modelTailSpike(){

            multScale([0.1, 0.7, 0.2]); 


        }

        function helicopterHelice(){

            multScale([4, 0.1, 0.3]); 

        }

        function helicopterTailHelice(){

            multScale([2, 0.05, 0.15]); 

        }
    
        function modelHelicopterBase(){

            multScale([0.2, 0.7, 0.2]); 


        }

        function modelHelicopterBaseBar(){

            multScale([3, 0.1, 0.1]);

        }
    


    function helicopterCamera(){ 


        loadMatrix(lookAt([0, 0, 0], [this.coord[0], -this.coord[1], this.coord[2]], [0,1,0]));

    }


    function createHelicopter(initialCoord, colorData){

        let helicoinstance = addModeledInstance("Helicopter",
        initialCoord,
        modelMainBody,
        colorData["Body"],
        SPHERE.draw);


            let hTail = addModeledInstanceSon("HelicopterTail",
            [-4, 0, 0],
            helicoinstance.name,
            modelTail,
            colorData["Body"],
            SPHERE.draw);

                let hTailPoint = addModeledInstanceSon("HelicopterTailPoint",
                [-3, 0.5, 0],
                hTail.name,
                modelTailPoint,
                colorData["Body"],
                SPHERE.draw);

                hTailPoint.rotation[2] = -75;

                let hTailSpike = addModeledInstanceSon("HelicopterTailSpike",
                [-3.2, 1.5, 0],
                hTail.name,
                modelTailSpike,
                colorData["Spike"],
                SPHERE.draw);

                addModeledInstanceSon("HelicopterTailHelice1",
                [1.05, 0.5, 0],
                hTailSpike.name,
                helicopterTailHelice,
                colorData["Helice"],
                SPHERE.draw);

                addModeledInstanceSon("HelicopterTailHelice2",
                [-1.05, 0.5, 0],
                hTailSpike.name,
                helicopterTailHelice,
                colorData["Helice"],
                SPHERE.draw);

            let hSpike = addModeledInstanceSon("HelicopterSpike",
            [0, 2, 0],
            helicoinstance.name,
            modelSpike,
            colorData["Spike"],
            SPHERE.draw);

                addModeledInstanceSon("HelicopterHelice1",
                [2, 0.5, 0],
                hSpike.name,
                helicopterHelice,
                colorData["Helice"],
                SPHERE.draw);

                addModeledInstanceSon("HelicopterHelice2",
                [-2, 0.5, 0],
                hSpike.name,
                helicopterHelice,
                colorData["Helice"],
                SPHERE.draw);

            let feet1 = addModeledInstanceSon("HelicopterFeet1",
            [-1, -2, 0.2],
            helicoinstance.name,
            modelHelicopterBase,
            colorData["Base"],
            SPHERE.draw);

            let feet2 = addModeledInstanceSon("HelicopterFeet2",
            [1, -2, 0.2],
            helicoinstance.name,
            modelHelicopterBase,
            colorData["Base"],
            SPHERE.draw); 

            feet1.rotation[2] = -10;
            feet2.rotation[2] = 10;

                let bar1 = addModeledInstanceSon("HelicopterBar1", 
                [1.1, -0.2, 0.05],
                feet1.name,
                modelHelicopterBaseBar,
                colorData["Spike"],
                CUBE.draw);

                bar1.rotation[2] = 10;


            let feet3 = addModeledInstanceSon("HelicopterFeet3",
            [-1, -2, -0.2],
            helicoinstance.name,
            modelHelicopterBase,
            colorData["Base"],
            SPHERE.draw);

                let bar2 = addModeledInstanceSon("HelicopterBar2", 
                [1.1, -0.2, -0.05],
                feet3.name,
                modelHelicopterBaseBar,
                colorData["Spike"],
                CUBE.draw);

                bar2.rotation[2] = 10;

            let feet4 = addModeledInstanceSon("HelicopterFeet4",
            [1, -2, -0.2],
            helicoinstance.name,
            modelHelicopterBase,
            colorData["Base"],
            SPHERE.draw);

            feet3.rotation[2] = -10;
            feet4.rotation[2] = 10;

            addCameraInstanceSon("HelicopterCamera",
            [2.6, 0.5, 0],
            helicoinstance.name,
            helicopterCamera);

        return helicoinstance;

    }

/*

    let hHeliceRotSpeed = 50;
    let hHeliceRotSpeedPerChange = 0.05;
    let hHeliceRotSpeedPerDrag = 0.001;
    let maxHelicopterH = 400;
    let helicopterYSpeed = 1;
    let helicopterAnglePercentageChange = 0.005;
    let helicopterMaxAngleSpeed = 3;
    let helicopterAnglePercentageDrag = 0.00001;
    let helicopterMaxInclination = -30;

    */

    let hHeliceRotSpeed = 20;
    let hHeliceRotSpeedPerChange = 0.05;
    let hHeliceRotSpeedPerDrag = 0.001;
    let maxHelicopterH = 400;
    let helicopterYSpeed = 1;
    let helicopterAnglePercentageChange = 0.005;
    let helicopterMaxAngleSpeed = 0.2;
    let helicopterAnglePercentageDrag = 0.00001;
    let helicopterMaxInclination = -30;

    function animateRotatingHelicopter(deltaTime){
        
        this.angle += (this.angleSpeedPerc) * helicopterMaxAngleSpeed * deltaTime;
        
        this.coord[0] = Math.cos(this.angle * (Math.PI/180))  * this.distance;
        this.coord[2] = Math.sin(this.angle * (Math.PI/180))* this.distance;
        
        //this is so the helicopter faces the right side (looks forward)
        this.rotation[1] = -90 - this.angle;

        this.rotation[2] = helicopterMaxInclination * this.angleSpeedPerc;

        //the helicopter suffers from drag, and will slow down
        this.angleSpeedPerc = Math.max(0, this.angleSpeedPerc - helicopterAnglePercentageDrag * deltaTime);

        //when the helicopter is not flying, the helices will slow down
        if(this.onGround){

            this.heliceSpeedPer = Math.max(0, this.heliceSpeedPer - hHeliceRotSpeedPerDrag * deltaTime);

        }

        //rotate helices
        this.filhos[0].filhos[1].rotation[1] = (this.filhos[0].filhos[1].rotation[1] + hHeliceRotSpeed * this.heliceSpeedPer * deltaTime) % (720);
        this.filhos[1].rotation[1] = (this.filhos[1].rotation[1] + hHeliceRotSpeed * this.heliceSpeedPer * deltaTime) % (720);


    }


    function helicopterReact(keyReceived){

        switch(keyReceived){

            case this.boxKey:
                if(!this.onGround)
                    createBox([0, this.filhos[2].coord[1] + this.filhos[2].filhos[0].coord[1], 0], this.boxColor, this);
                break;
            case this.moveRotKey:

                if(!this.onGround)
                    this.angleSpeedPerc = Math.min( this.angleSpeedPerc + helicopterAnglePercentageChange, 1);
                break;

             case this.moveUpKey:

                if(this.onGround){
                    this.heliceSpeedPer = this.heliceSpeedPer + hHeliceRotSpeedPerChange;
                    if(this.heliceSpeedPer >= 1){

                        this.onGround = false;
                        this.coord[1] = Math.min( this.coord[1] + helicopterYSpeed, maxHelicopterH);

                    }
                    
                }
                else
                    this.coord[1] = Math.min( this.coord[1] + helicopterYSpeed, maxHelicopterH);
                 break;

             case this.moveDownKey:

                 this.coord[1] = Math.max( this.coord[1] - helicopterYSpeed, this.coord[1] - instanceTrueCoord(this.filhos[2].filhos[0])[1]);

                 this.angleSpeedPerc = Math.max(0, this.angleSpeedPerc - helicopterAnglePercentageChange);


                 if(instanceTrueCoord(this.filhos[2].filhos[0])[1] <= 0 && this.angleSpeedPerc <= 0){
                    this.onGround = true;
                 }
                 break;

            default:

        }


    }

    function putHelicopterOnGround(helicopterInstance){

        helicopterInstance.coord[1] = 0;
        helicopterInstance.coord[1] = - instanceTrueCoord(helicopterInstance.filhos[2].filhos[0])[1];

    }

    function createAutoRotMovHelicopter(distance, initialAngle, keyData, colorData){


        let helicopterInstance = createHelicopter([distance * Math.cos(initialAngle), 0, distance * Math.sin(initialAngle)], colorData);


        helicopterInstance.onGround = true;
        helicopterInstance.heliceSpeedPer = 0;

        helicopterInstance.moveUpKey = keyData["Up"];
        helicopterInstance.moveDownKey = keyData["Down"];

        helicopterInstance.angleSpeedPerc = 0;
        helicopterInstance.moveRotKey = keyData["Rot"];

        helicopterInstance.boxKey = keyData["Box"];
        helicopterInstance.boxColor = colorData["Box"];

        helicopterInstance.distance = distance;
        helicopterInstance.angle = initialAngle;

        makeInstanceResponsive(helicopterInstance, helicopterReact);
        makeInstanceActive(helicopterInstance, animateRotatingHelicopter);


        return helicopterInstance;

    }
    

    /*
        *****END OF SETUP HELICOPTER***
    */
   
    /*
        *****SETUP CAMERAS***
    */


        //teta, gama (and VP_DISTANCE is the distance)
        let axonometricCamera = [0, 0];


        function axonometricCameraFunction(){

            loadMatrix(lookAt([0, 0, 0], [VP_DISTANCE, 0, 0], [0,1,0]));
            multRotationY(axonometricCamera[0]);
            multRotationX(axonometricCamera[1]);
            multRotationZ(axonometricCamera[1]);

        }

        function cameraBaseFunction(){

            loadMatrix(lookAt([0, 0, 0], [this.coord[0], -this.coord[1], this.coord[2]], [0,1,0]));

        }


        function setupBaseCameras(){

            
            let cameraInstance = addCameraInstance("AxonometricCamera",
            axonometricCameraFunction,
            [0, VP_DISTANCE, VP_DISTANCE]);

            addCameraInstance("Camera",
            cameraBaseFunction,
            [0, VP_DISTANCE, VP_DISTANCE]);

            addCameraInstance("Camera",
            cameraBaseFunction,
            [80, VP_DISTANCE, VP_DISTANCE]);

            addCameraInstance("Camera",
            cameraBaseFunction,
            [100, VP_DISTANCE * 0.5, -VP_DISTANCE * 0.5]);

            addCameraInstance("Camera",
            cameraBaseFunction,
            [-100, VP_DISTANCE * 0.2, VP_DISTANCE * 0.5]);

            addCameraInstance("TopDownCamera",
            cameraBaseFunction,
            [0, VP_DISTANCE, 0]);


        }

    


        function setupCameras(){

            setupBaseCameras();    
        
            currentCamera = 0;
        }
    
        /*
            *****END OF SETUP CAMERAS***
        */ 
       
            
    function setupInstances(){

        setupCameras();


        let helicoinstance = createAutoRotMovHelicopter(100, 0, { "Box" : ' ', "Rot" : 'ArrowLeft', "Up" : "ArrowUp", "Down" : "ArrowDown"}, {"Body" : [255, 0, 0], "Spike" : [255, 189, 8], "Helice" : [54, 205, 255], "Base" : [145, 145, 145], "Box" : [40, 20, 10]});        
        scaleInstanceByValue(helicoinstance, 5);
        putHelicopterOnGround(helicoinstance);

        //helicoinstance = createAutoRotMovHelicopter(150, 200, 0, { "Box" : 'b', "Rot" : 'v'}, {"Body" : [17, 191, 75], "Spike" : [255, 189, 8], "Helice" : [54, 205, 255], "Base" : [145, 145, 145], "Box" : [100, 150, 200]});        
        //scaleInstanceByValue(helicoinstance, 10);

        //helicoinstance = createHelicopter([0, 50, 0], {"Body" : [17, 191, 75], "Spike" : [255, 189, 8], "Helice" : [54, 205, 255], "Base" : [145, 145, 145], "Box" : [100, 150, 200]});
        //scaleInstanceByValue(helicoinstance, 30);


        setupGround();

        setupBuildings();

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

                    if(instanceNodes[i].color != undefined){
                        uploadModelView();
                        defineColor(instanceNodes[i].color);
                        instanceNodes[i].draw(gl, program, drawModes[currentDrawMode]);
                    }

                popMatrix();

                recursiveModelConstruction(instanceNodes[i].filhos);
            popMatrix();

        }


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
        
        //ModelView Transf -> Proj Transf -> Perspective div -> Clip -> Projection along Z -> Viewport Transf


        gl.uniformMatrix4fv(gl.getUniformLocation(program, "mProjection"), false, flatten(mProjection));

        cameras[currentCamera].threadRenderCamera();



        //renderization
        //referencial();
        recursiveModelConstruction(instanceTree);

        for(let i = 0; i < activeInstances.length; i++){

            activeInstances[i].animate(deltaTime);

        }

        for(let i = 0; i < instancesToFree.length; i++){

            freeInstance(instancesToFree[i]);

        }

        for(let i = 0; i < instancesToDelete.length; i++){

            deleteInstance(instancesToDelete[i]);

        }

        instancesToDelete = [];
        instancesToFree = [];

        window.requestAnimationFrame(render);


        
    }
}


const urls = ["shader.vert", "shader.frag"];
loadShadersFromURLS(urls).then(shaders => setup(shaders))