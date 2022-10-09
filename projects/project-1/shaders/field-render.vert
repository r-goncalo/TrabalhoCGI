precision mediump float;


// Vertex position in World Coordinates
attribute vec2 vPosition;

uniform float vXScale; //for first exercise
uniform float vYScale; //for first exercise

varying vec2 vCoord; // for first exercise


varying vec4 fColor; //for first exercise

void main() 
{
    gl_Position = vec4(vPosition, 0.0, 1.0);

    vCoord = vec2(vPosition[0] * vXScale, vPosition[1] * vYScale); 

    fColor = vec4(
                mod(vXScale, 1.0 + vCoord[0]), 
                mod(vYScale, 1.0 + vCoord[1]),
                 0, 1);
}