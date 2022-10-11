precision mediump float;

attribute vec2 vPosition;
attribute float vAge;
attribute float vLife;
attribute vec2 vVelocity;

uniform float uxScale;
uniform float uyScale;

void main() {
  gl_PointSize = 4.0;
  gl_Position = vec4(vPosition[0] * uxScale, vPosition[1] * uyScale, 0.0, 1.0);
}