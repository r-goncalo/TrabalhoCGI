precision highp float;



uniform mat4 mView; //view transformation (for points)
uniform mat4 mViewNormals; //view transformation (for vectors)

//materials
uniform vec3 materialAmb;
uniform vec3 materialDif;
uniform vec3 materialSpe;
uniform float shininess;

const int MAX_LIGHTS = 3;

uniform int nLights; //number of lights

struct Light {
    bool active;
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
    vec4 position;
    vec3 axis;
    float aperture;
    float cutoff;
    bool spotlight;
};

uniform Light lights[MAX_LIGHTS];

varying vec3 fNormal; //normal vector in camera space
varying vec3 posC; //pos in camera coordinates


void main() {

    for(int i = 0; i < MAX_LIGHTS; i++){

        //i can not be compared with non constant expression on for loop
        if(i >= nLights)
            break;

        if(lights[i].active){


            vec3 ambientColor = lights[i].ambient * materialAmb;
            vec3 diffuseColor = lights[i].diffuse * materialDif;
            vec3 specularColor = lights[i].specular * materialSpe;
                        
            vec3 fLight;
            
            if(lights[i].position[3] == 0.0){
                
                fLight = normalize((mViewNormals * lights[i].position).xyz);
                
            }else{
                
                fLight = normalize((mView * lights[i].position).xyz - posC);
                
            }


            vec3 normal = normalize(fNormal);
            vec3 reflection = reflect(-fLight, normal);
            vec3 V = normalize(-posC);
            
            float diffuseFactor = max( dot(normal, fLight), 0.0 );
            vec3 diffuse = diffuseFactor * diffuseColor;
            
            float specularFactor = pow( max(dot(V, reflection), 0.0), shininess);
            vec3 specular = specularFactor * specularColor;
            
                if( dot(fLight, normal) < 0.0 ) {
                
                    specular = vec3(0.0, 0.0, 0.0);
            
                }

            //for spotLight
            if(lights[i].spotlight && lights[i].position[3] == 1.0){

                float lightIntensity = 0.0;

                float angle = abs(acos(dot(normalize(-1.0 *  lights[i].axis), fLight)));
                
                if(angle <= (lights[i].aperture)){

                    lightIntensity = 1.0 + pow(abs(cos(angle)), lights[i].cutoff);

                }


                                        
            gl_FragColor.xyz += (ambientColor + diffuse + specular) * lightIntensity;


            }else{

                        
            gl_FragColor.xyz += (ambientColor + diffuse + specular);


            }
            

            



        }

    }
    
}