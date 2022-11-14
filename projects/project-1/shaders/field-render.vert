precision highp float;


// Vertex position in World Coordinates
attribute vec2 vPosition; //coordenadas do buildquad

uniform float xScale;
uniform float yScale;

varying vec2 fPosition;

void main()
{
    gl_Position = vec4(vPosition, 0.0, 1.0);
    fPosition = vPosition * vec2(xScale, yScale);



}
