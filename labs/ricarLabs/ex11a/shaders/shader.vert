attribute vec4 vPosStart;
attribute vec4 vPosEnd;
uniform float uT;

void main() 
{
    gl_Position = mix(vPosStart, vPosEnd, uT); //mix function varies one and the other with vel depending on uT
}
