import { loadShadersFromURLS, setupWebGL, buildProgramFromSources } from '../../libs/utils.js';
import { mat4, vec3, flatten, lookAt, ortho, mult, translate, rotateZ, rotateY, rotateX, scalem  } from '../../libs/MV.js';

import * as SPHERE from './js/sphere.js';
import * as CUBE from './js/cube.js';

/** @type {WebGLRenderingContext} */
let gl;

let program;

/** View and Projection matrices */
let mView;
let mProjection;

const edge = 2.0;


//array of [<types added, "CUBE" or "SPHERE">, <transformMatrix>]
let instances = [];

let mModel;

let trans = {

    pos:{x:document.getElementById("px"), y:document.getElementById("py"), z:document.getElementById("pz")},
    sca:{x:document.getElementById("sx"), y:document.getElementById("sy"), z:document.getElementById("sz")},
    rot:{x:document.getElementById("rx"), y:document.getElementById("ry"), z:document.getElementById("rz")}


}


function render(time)
{
    window.requestAnimationFrame(render);

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);

    const uCtm = gl.getUniformLocation(program, "uCtm");

    mModel = mult(translate(trans.pos.x.value, trans.pos.y.value, trans.pos.z.value),
                mult(rotateZ(trans.rot.z.value),
                    mult(rotateY(trans.rot.y.value),
                        mult(rotateX(trans.rot.z.value),
                            scalem(trans.sca.x.value, trans.sca.y.value, trans.sca.z.value)
                            )
                        )
                    )
                );
    

    for(let i = 0; i < instances.length; i++){

        gl.uniformMatrix4fv(uCtm, false, flatten(mult(mProjection, mult(mView, instances[i].matrix))));
        instances[i].draw(gl, program, gl.LINES);

    }

}



function setup(shaders)
{
    const canvas = document.getElementById('gl-canvas');

    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = window.innerHeight;

    gl = setupWebGL(canvas);
    program = buildProgramFromSources(gl, shaders['shader.vert'], shaders['shader.frag']);

    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.viewport(0,0,canvas.width, canvas.height);

    mView = lookAt(vec3(0,0,0), vec3(-1,-1,-2), vec3(0,1,0));
    setupProjection();

    SPHERE.init(gl);
    CUBE.init(gl);

    function setupProjection()
    {
        if(canvas.width < canvas.height) {
            const yLim = edge*canvas.height/canvas.width;
            mProjection = ortho(-edge, edge, -yLim, yLim, -10, 10);
        }
        else {
            const xLim = edge*canvas.width/canvas.height;
            mProjection = ortho(-xLim, xLim, -edge, edge, -10, 10);
        }

    }
    window.addEventListener("resize", function() {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = window.innerHeight;

        setupProjection();
    
        gl.viewport(0,0,canvas.width, canvas.height);
    });

    document.getElementById("add_cube").addEventListener("click", function() {

        console.log("Cube added");
        
        //instances.push("CUBE");

        //instances.push({draw:CUBE.draw, matrix:mat4()});
        addShape(CUBE);

    });

    document.getElementById("add_sphere").addEventListener("click", function() {

        console.log("Sphere added");

        //instances.push({draw:SPHERE.draw, matrix:mat4()});
        addShape(SPHERE);
        //instances.push("SPHERE");

    });

    document.getElementById("transform_container").addEventListener("change", function() {

        instances[instances.length - 1].matrix = mModel;


    });

    function addShape(type){

        resetTransValues();
        instances.push({draw:type.draw, matrix:mModel,
        trans:{

            pos:{x:0, y:0, z:0},
            sca:{x:1, y:1, z:1},
            rot:{x:1, y:0, z:0}

        
        }
        
        
        });


    }


    function resetTransValues(){



        trans.pos.x.value = 0;
        trans.pos.y.value = 0;
        trans.pos.z.value = 0;
        trans.sca.x.value = 1.0;
        trans.sca.y.value = 1.0;
        trans.sca.z.value = 1.0;
        trans.rot.x.value = 1.0;
        trans.rot.y.value = 0.0;
        trans.rot.z.value = 0.0;

        mModel = mult(translate(trans.pos.x.value, trans.pos.y.value, trans.pos.z.value),
        mult(rotateZ(trans.rot.z.value),
            mult(rotateY(trans.rot.y.value),
                mult(rotateX(trans.rot.z.value),
                    scalem(trans.sca.x.value, trans.sca.y.value, trans.sca.z.value)
                    )
                )
            )
        );

    }


    window.requestAnimationFrame(render);
}

const shaderUrls = ['shader.vert', 'shader.frag'];

loadShadersFromURLS(shaderUrls).then(shaders=>setup(shaders));