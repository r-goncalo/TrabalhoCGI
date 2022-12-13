attribute vec4 vPosition;
attribute vec4 vNormal;

uniform mat4 mModelView;
uniform mat4 mNormals;
uniform mat4 mProjection;

varying vec3 fNormal;
varying vec3 posC;

void main() {
    posC = (mModelView * vPosition).xyz;

    fNormal = (mNormals * vNormal).xyz;

    gl_Position = mProjection * mModelView * vPosition;
}