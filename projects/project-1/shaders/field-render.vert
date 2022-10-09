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

//    fColor = vec4(
//                mod(vXScale, abs(vCoord[0])), 
//                mod(vYScale, abs(vCoord[1])),
//                 0, 1);

    fColor = vec4(
                mod((1.0/vXScale) * abs(vPosition[0]), 1.0), 
                mod( (1.0/vYScale) * abs(vPosition[1]), 1.0),
                 0, 1);

}