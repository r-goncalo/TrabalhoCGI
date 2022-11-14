

uniform float uDx;
uniform float uDy;
attribute vec4 vPosition;

void main()
{
    gl_Position = vPosition + vec4(uDx, uDy, 0.0, 0.0);
    // gl_Position = vPosition;
    // gl_Position.x += uDx;
}