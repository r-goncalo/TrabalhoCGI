precision mediump float;


// Vertex position in World Coordinates
attribute vec2 vPosition;

uniform float vXLimit; //for first exercise
uniform float vYLimit; //for first exercise

varying vec2 vCoord; // for first exercise


varying vec4 fColor; //for first exercise

void main() 
{
    gl_Position = vec4(vPosition, 0.0, 1.0);
    fColor = vec4(
                mod(vXLimit, vPosition[0]), 
                mod(vYLimit, vPosition[1]),
                 0, 1);
}