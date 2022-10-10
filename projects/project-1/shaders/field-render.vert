precision mediump float;


// Vertex position in World Coordinates
attribute vec2 vPosition;

const int MAX_PLANETS=10;
uniform vec4 ufPlanets[MAX_PLANETS];




void main() 
{
    gl_Position = vec4(vPosition, 0.0, 1.0);


}
