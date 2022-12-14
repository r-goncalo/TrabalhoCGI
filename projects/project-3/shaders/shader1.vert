uniform mat4 mModelView; //model-view transformation
uniform mat4 mNormals; //model-view transformation for normals
uniform mat4 mProjection; //projection matrix



//this attributes are used by object libraries (like cube.js)
attribute vec4 vPosition; //vertex position in modelling coordinates
attribute vec4 vNormal; //vertex normal in modelling coordinates


varying vec3 fNormal; //normal vector in camera space
varying vec3 posC;

void main() {



    //the vertex position after the transformations
    posC = (mModelView * vPosition).xyz;

    //the normal of the vector in the surface
    fNormal = normalize( (mNormals * vNormal).xyz);


    gl_Position = mProjection * mModelView * vPosition;

}