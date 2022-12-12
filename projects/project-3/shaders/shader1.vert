

uniform mat4 mModelView; //model-view transformation
uniform mat4 mNormals; //model-view transformation for normals
uniform mat4 mView; //view transformation (for points)
uniform mat4 mViewNormals; //view transformation (for vectors)
uniform mat4 mProjection; //projection matrix

//this attributes are used by object libraries (like cube.js)
attribute vec4 vPosition; //vertex position in modelling coordinates
attribute vec4 vNormal; //vertex normal in modelling coordinates

varying vec3 fNormal; //normal vector in camera space
varying vec3 fLight; //Light vector in camera space
varying vec3 fViewer; //view vector in camera space


//debuging light:
const vec4 lightPosition = vec4(0.0, 1.8, 1.3, 1.0);

const vec3 materialAmb = vec3(1.0, 0.0, 0.0);
const vec3 materialDif = vec3(1.0, 0.0, 0.0);
const vec3 materialSpe = vec3(1.0, 1.0, 1.0);
const float shininess = 6.0;

const vec3 lightAmb = vec3(0.2, 0.2, 0.2);
const vec3 lightDif = vec3(0.7, 0.7, 0.7);
const vec3 lightSpe = vec3(1.0, 1.0, 1.0);



vec3 ambientColor = lightAmb * materialAmb;
vec3 diffuseColor = lightDif * materialDif;
vec3 specularColor = lightSpe * materialSpe;


vec4 multMatVec(mat4 mat, vec4 vec){

    vec4 toReturn;

    for(int i = 0; i < 4; i++){




    }

    return toReturn;

}


void main() {

    //the vertex position after the transformations
    vec3 posC = (mModelView * vPosition).xyz;

    //the normal of the vector in the surface
    fNormal = normalize( (mNormals * vNormal).xyz);

    if(lightPosition.w == 0.0){

        fLight = normalize((mViewNormals*lightPosition).xyz);
        
    }else{

        fLight = normalize((mView*lightPosition).xyz - posC);
        
        }

    vec3 fViewer = vec3(0, 0, 1); // Projeção paralela...
    
    vec3 H = normalize(fLight + fViewer);

    float diffuseFactor = max( dot(fLight, N), 0.0 );
    vec3 diffuse = diffuseFactor * diffuseColor;

    float specularFactor = pow( max(dot(N, H), 0.0), shininess);
    vec3 specular = specularFactor * specularColor;

    if( dot(fLight,N) < 0.0 ) {

        specular = vec3(0.0, 0.0, 0.0);

    }

    gl_Position = mProjection * mModelView * vPosition;

}