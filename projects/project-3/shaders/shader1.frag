precision highp float;



uniform mat4 mView; //view transformation (for points)
uniform mat4 mViewNormals; //view transformation (for vectors)


uniform vec3 materialAmb;
uniform vec3 materialDif;
uniform vec3 materialSpe;
uniform float shininess;

const vec3 materialAmb1 = vec3(1.0, 0.0, 0.0);
const vec3 materialDif1 = vec3(1.0, 0.0, 0.0);
const vec3 materialSpe1 = vec3(1.0, 1.0, 1.0);
const float shininess1 = 6.0;

const int MAX_LIGHTS = 3;

uniform int nLights; //number of lights

struct Light {
    int mode; //1 pont, 2 dir, 3 spot
    bool active;
    vec3 pos;
    vec3 ia;
    vec3 id;
    vec3 is;
};

uniform Light lights[MAX_LIGHTS];



//debuging light:
const vec4 lightPosition = vec4(0.0, 1.8, 1.3, 1.0);

const vec3 lightAmb = vec3(0.2, 0.2, 0.2);
const vec3 lightDif = vec3(0.7, 0.7, 0.7);
const vec3 lightSpe = vec3(1.0, 1.0, 1.0);

//uniform int uNLights; // Effective number of lights used

//uniform LightInfo uLights[MAX_LIGHTS]; // The array of lights present in the scene
//uniform MaterialInfo uMaterial;        // The material of the object being drawn

varying vec3 fViewer; //view vector in camera space
varying vec3 fNormal; //normal vector in camera space
varying vec3 posC; //pos in camera coordinates


void main() {

    // Set the default value for gl_FragColor
    gl_FragColor = vec4(0.0, 0.0, 0.0, 0.5);

    for(int i = 0; i < MAX_LIGHTS; i++){

        //i can not be compared with non constant expression on for loop
        if(i >= nLights)
            break;

        if(lights[i].active){

            vec3 ambientColor = lightAmb * materialAmb / 255.0 ;
            vec3 diffuseColor = lightDif * materialDif / 255.0 ;
            vec3 specularColor = lightSpe * materialSpe / 255.0 ;
            
            vec3 fViewer = vec3(0, 0, 1); // Projeção paralela...
            
            vec3 fLight;
            
            if(lightPosition.w == 0.0){
                
                fLight = normalize((mViewNormals * vec4(lights[i].pos, 1)).xyz);
                
            }else{
                
                fLight = normalize((mView* vec4(lights[i].pos, 1)).xyz - posC);
                
                }
            
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

    }



}