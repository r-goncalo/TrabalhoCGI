precision highp float;

const int MAX_LIGHTS = 8;

//debuging light:
const vec4 lightPosition = vec4(0.0, 1.8, 1.3, 1.0);


uniform vec3 materialAmb;
uniform vec3 materialDif;
uniform vec3 materialSpe;
uniform float shininess;

const vec3 lightAmb = vec3(0.2, 0.2, 0.2);
const vec3 lightDif = vec3(0.7, 0.7, 0.7);
const vec3 lightSpe = vec3(1.0, 1.0, 1.0);

//uniform int uNLights; // Effective number of lights used

//uniform LightInfo uLights[MAX_LIGHTS]; // The array of lights present in the scene
//uniform MaterialInfo uMaterial;        // The material of the object being drawn

varying vec3 fViewer; //view vector in camera space
varying vec3 fLight; //Light vector in camera space
varying vec3 fNormal; //normal vector in camera space



void main() {

    vec3 ambientColor = lightAmb * materialAmb;
    vec3 diffuseColor = lightDif * materialDif;
    vec3 specularColor = lightSpe * materialSpe;

    vec3 fViewer = vec3(0, 0, 1); // Projeção paralela...
    
    vec3 H = normalize(fLight + fViewer);

    float diffuseFactor = max( dot(fLight, fNormal), 0.0 );
    vec3 diffuse = diffuseFactor * diffuseColor;

    float specularFactor = pow( max(dot(fNormal, H), 0.0), shininess);
    vec3 specular = specularFactor * specularColor;

    if( dot(fLight, fNormal) < 0.0 ) {

        specular = vec3(0.0, 0.0, 0.0);

    }


    gl_FragColor = vec4(ambientColor + diffuse + specular, 1.0);
}