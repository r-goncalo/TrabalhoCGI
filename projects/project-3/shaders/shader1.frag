precision highp float;



uniform mat4 mView; //view transformation (for points)
uniform mat4 mViewNormals; //view transformation (for vectors)


uniform vec3 materialAmb;
uniform vec3 materialDif;
uniform vec3 materialSpe;
uniform float shininess;

const int MAX_LIGHTS = 3;

uniform int nLights; //number of lights

struct Light {
    //int mode; //1 pont, 2 dir, 3 spot
    bool active;
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
    vec4 position;
    vec3 axis;
    float aperture;
    float cutoff;
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

    //gl_FragColor = vec4(lights[0].ambient, 1.0);

    for(int i = 0; i < 1; i++){

        //i can not be compared with non constant expression on for loop
        if(i >= nLights)
            break;

        if(lights[i].active){

            vec3 ambientColor = lights[i].ambient * materialAmb;
            vec3 diffuseColor = lights[i].diffuse * materialDif;
            vec3 specularColor = lights[i].specular * materialSpe;
            
            vec3 fViewer = vec3(0, 0, 1); // Projeção paralela...
            
            vec3 fLight;
            
            if(lights[i].position.w == 0.0){
                
                fLight = normalize((mViewNormals * lights[i].position).xyz);
                
            }else{
                
                fLight = normalize((mView * lights[i].position).xyz - posC);
                
                }
            
            vec3 normal = normalize(fNormal);
            vec3 reflection = reflect(-fLight, normal);
            vec3 V = normalize(-posC);
            
            float diffuseFactor = max( dot(fLight, normal), 0.0 );
            vec3 diffuse = diffuseFactor * diffuseColor;
            
            float specularFactor = pow( max(dot(posC, reflection), 0.0), shininess);
            vec3 specular = specularFactor * specularColor;
            
            if( dot(fLight, normal) < 0.0 ) {
                
                specular = vec3(0.0, 0.0, 0.0);
            
            }
            
                        
            gl_FragColor += vec4(ambientColor + diffuse + specular, 1.0);

            //gl_FragColor += vec4(lights[i].ambient, 1.0);

          

        }

    }

/*
            vec3 ambientColor = lightAmb * materialAmb;
            vec3 diffuseColor = lightDif * materialDif;
            vec3 specularColor = lightSpe * materialSpe;
            
            vec3 fViewer = vec3(0, 0, 1); // Projeção paralela...
            
            vec3 fLight;
            
            if(lightPosition.w == 0.0){
                
                fLight = normalize((mViewNormals * lightPosition).xyz);
                
            }else{
                
                fLight = normalize((mView * lightPosition).xyz - posC);
                
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

*/

}