precision mediump float;


// Vertex position in World Coordinates
attribute vec2 vPosition;

uniform float xLimit; //for first exercise
uniform float yLimit; //for first exercise

void main() 
{
    gl_Position = vec4(vPosition, 0.0, 1.0);
}