precision highp float;

varying float fLeft;  // % of time left to live


void main() {

  gl_FragColor = vec4(1.0, 1.0 - (fLeft * 0.8), 1.0 - (fLeft * 0.2), fLeft);

}