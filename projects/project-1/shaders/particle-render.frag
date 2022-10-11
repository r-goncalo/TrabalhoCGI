precision mediump float;

varying float fLeft;  //a variable for each vertex?


void main() {
  gl_FragColor = vec4(1.0, 0.2, 0.8, fLeft);
}