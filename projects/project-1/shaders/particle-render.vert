precision highp float;

attribute vec2 vPosition;
attribute float vAge;
attribute float vLife;
attribute vec2 vVelocity;

varying float fLeft;

uniform float uxScale;
uniform float uyScale;

void main() {
  gl_PointSize = 0.2;
  gl_Position = vec4(vPosition[0] * uxScale, vPosition[1] * uyScale, 0.0, 1.0);
  fLeft = (vLife - vAge)/vLife;

}