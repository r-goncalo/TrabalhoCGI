precision highp float;

varying vec4 fColor;

//Varying para a escala

//Vai buscar o varying ao vertex shader para pintar cada pixel do varying das coordenadas do mundo

void main() {
    
    gl_FragColor = fColor;
    //gl_FragColor = vec4(0.1, 0.1, 0.1, 1.0); //O ultimo numero e a transparencia 
    
}