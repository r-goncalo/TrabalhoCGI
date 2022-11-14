import { buildProgramFromSources, loadShadersFromURLS, setupWebGL } from "../../libs/utils.js";
import { ortho, lookAt, flatten } from "../../libs/MV.js";
import {modelView, loadMatrix, multRotationY, multScale } from "../../libs/stack.js";


let gl;


function setup(shaders)
{
    //DO EXERCICIO 18
    let canvas = document.getElementById("gl-canvas");
    let aspect = canvas.width / canvas.height;

    gl = setupWebGL(canvas);

    let program = buildProgramFromSources(gl, shaders["shader.vert"], shaders["shader.frag"]);

    let mProjection = ortho(-VP_DISTANCE*aspect,VP_DISTANCE*aspect, -VP_DISTANCE, VP_DISTANCE,-3*VP_DISTANCE,3*VP_DISTANCE);

    mode = gl.LINES; 

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
            


        }
    })
    
    canvas.addEventListener("mousedown", function(event) {
    });

    canvas.addEventListener("mousemove", function(event) {
        const p = getCursorPosition(canvas, event);

        console.log(p);
    });

    canvas.addEventListener("mouseup", function(event) {
    })

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

    function uploadModelView()
    {
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "mModelView"), false, flatten(modelView()));
    }

    function HelicopterParts()
    {}

    function render()
    {
        if(animation) time += speed;
        window.requestAnimationFrame(render);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        gl.useProgram(program);
        
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "mProjection"), false, flatten(mProjection));

        loadMatrix(lookAt([0,VP_DISTANCE,VP_DISTANCE], [0,0,0], [0,1,0]));

        //HelicopterParts();
        //pushMatrix();
    }
}


const urls = ["shader.vert", "shader.frag"];
loadShadersFromURLS(urls).then(shaders => setup(shaders))