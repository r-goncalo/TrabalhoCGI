uniform mat4 mModelView; //model-view transformation
uniform mat4 mNormals; //model-view transformation for normals
uniform mat4 mView; //view transformation (for points)
uniform mViewNormals; //view transformation (for vectors)
uniform mProjection; //projection matrix

attribute vec4 vPosition; //vertex position in modelling coordinates
attribute vec3 vNormal; //vertex normal in modelling coordinates

varying vec3 fNormal; //normal vector in camera space
varying vec3 fLight; //Light vector in camera space
varying vec3 fViewer; //view vector in camera space


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


void main() {


    vec3 posC = (mModelView * vPosition).xyz;
    vec3 fLight;
    if(lightPosition.w == 0.0){
        fLight = normalize((mViewNormals*lightPosition).xyz);}
    else{
        fLight = normalize((mView*lightPosition).xyz - posC);}

    vec3 V = vec3(0,0,1); // Projeção paralela...
    vec3 H = normalize(L+V);
    vec3 N = normalize( (mNormals * vNormal).xyz);
    float diffuseFactor = max( dot(fLight,N), 0.0 );
    vec3 diffuse = diffuseFactor * diffuseColor;
    float specularFactor = pow(max(dot(N,H), 0.0), shininess);
    vec3 specular = specularFactor * specularColor;

    if( dot(fLight,N) < 0.0 ) {
    specular = vec3(0.0, 0.0, 0.0);
    }

    gl_Position = mProjection * mModelView * vPosition;

}