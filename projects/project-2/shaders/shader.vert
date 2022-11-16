uniform mat4 mModelView;
uniform mat4 mProjection;

uniform vec3 solidColor;

attribute vec4 vPosition;
attribute vec3 vNormal;

varying vec3 fNormal;

void main() {
    gl_Position = mProjection * mModelView * vPosition;
    //fNormal = vNormal;
    fNormal = solidColor;
}