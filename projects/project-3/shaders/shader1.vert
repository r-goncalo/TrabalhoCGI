uniform mat4 mModelView; //model-view transformation
uniform mat4 mNormals; //model-view transformation for normals
uniform mat4 mProjection; //projection matrix
uniform mat4 mView; //view transformation (for points)
uniform mat4 mViewNormals; //view transformation (for vectors)


//this attributes are used by object libraries (like cube.js)
attribute vec4 vPosition; //vertex position in modelling coordinates
attribute vec4 vNormal; //vertex normal in modelling coordinates

const vec4 lightPosition = vec4(0.0, 1.8, 1.3, 1.0);


varying vec3 fNormal; //normal vector in camera space
varying vec3 fLight; //Light vector in camera space

void main() {



    //the vertex position after the transformations
    vec3 posC = (mModelView * vPosition).xyz;

    //the normal of the vector in the surface
    fNormal = normalize( (mNormals * vNormal).xyz);

    if(lightPosition.w == 0.0){

        fLight = normalize((mViewNormals * lightPosition).xyz);
        
    }else{

        fLight = normalize((mView*lightPosition).xyz - posC);
        
        }


    gl_Position = mProjection * mModelView * vPosition;

}