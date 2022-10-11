precision highp float;

varying float fLeft;  //a variable for each vertex?


void main() {

  gl_FragColor = vec4(1.0, 1.0 - (fLeft * 0.8), 1.0 - (fLeft * 0.2), fLeft);

}