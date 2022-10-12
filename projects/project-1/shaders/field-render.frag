precision highp float;

varying vec2 fPosition;


const float distMult = 6571000.0;
const float partMass = 1.0;
const float gravConst = 0.0000000000667;

const int MAX_PLANETS = 10;
uniform vec4 ufPlanets[MAX_PLANETS];

uniform float ufxScale;
uniform float ufyScale;



//Varying para a escala

//Vai buscar o varying ao vertex shader para pintar cada pixel do varying das coordenadas do mundo


vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}


void main() {

    
    //float maxLength = 0.0;
    
    vec2 acc = vec2(0.0, 0.0);
    vec2 auxA = vec2(0.0, 0.0);


    for(int i = 0; i < MAX_PLANETS; i++){


            if(vec2( ufPlanets[i][0] - fPosition[0], ufPlanets[i][1] - fPosition[1]) != vec2(0.0, 0.0)){

                auxA = normalize(vec2(ufPlanets[i][0] - fPosition[0], ufPlanets[i][1] - fPosition[1]))
                    * gravConst * ufPlanets[i][3] / pow(distMult *  length (vec2( ufPlanets[i][0] - fPosition[0], ufPlanets[i][1] - fPosition[1])), 2.0);


                acc = acc + auxA;
            
                //if(length(auxA) > maxLength){ maxLength = length(auxA);}

            }


         }

/*
    for(int i = 0; i < MAX_PLANETS; i++){


            if(vec2( (ufPlanets[i][0] - fPosition[0]), ufPlanets[i][1] - fPosition[1]) != vec2(0.0, 0.0)){

                auxA = normalize(vec2((ufPlanets[i][0] - fPosition[0])*ufxScale, (ufPlanets[i][1] - fPosition[1])*ufyScale))
                    * gravConst * ufPlanets[i][3] / pow(distMult *  length (vec2( (ufPlanets[i][0] - fPosition[0])*ufxScale, (ufPlanets[i][1] - fPosition[1])*ufyScale)), 2.0);


                acc = acc + auxA;
            
                //if(length(auxA) > maxLength){ maxLength = length(auxA);}

            }


         }

*/
/*
    for(int i = 0; i < MAX_PLANETS; i++){


            if(vec2( (ufPlanets[i][0] - fPosition[0]), ufPlanets[i][1] - fPosition[1]) != vec2(0.0, 0.0)){

                auxA = normalize(vec2((ufPlanets[i][0] - fPosition[0])/ufxScale, (ufPlanets[i][1] - fPosition[1])/ufyScale))
                    * gravConst * ufPlanets[i][3] / pow(distMult *  length (vec2( (ufPlanets[i][0] - fPosition[0])/ufxScale, (ufPlanets[i][1] - fPosition[1])/ufyScale)), 2.0);


                acc = acc + auxA;
            
                //if(length(auxA) > maxLength){ maxLength = length(auxA);}

            }


         }

*/
/*
    for(int i = 0; i < MAX_PLANETS; i++){


            if(vec2( (ufPlanets[i][0] - fPosition[0]), ufPlanets[i][1] - fPosition[1]) != vec2(0.0, 0.0)){

                auxA = normalize(vec2(ufPlanets[i][0] - fPosition[0]/ufxScale, ufPlanets[i][1] - fPosition[1]/ufyScale))
                    * gravConst * ufPlanets[i][3] / pow(distMult *  length (vec2(ufPlanets[i][0] - fPosition[0]/ufxScale, ufPlanets[i][1] - fPosition[1]/ufyScale)), 2.0);


                acc = acc + auxA;
            
                //if(length(auxA) > maxLength){ maxLength = length(auxA);}

            }


         }

         */
/*
    for(int i = 0; i < MAX_PLANETS; i++){


            if(vec2( (ufPlanets[i][0] - fPosition[0]), ufPlanets[i][1] - fPosition[1]) != vec2(0.0, 0.0)){

                auxA = normalize(vec2((ufPlanets[i][0]/ufxScale) - fPosition[0], (ufPlanets[i][1]/ufyScale) - fPosition[1]))
                    * gravConst * ufPlanets[i][3] / pow(distMult *  length (vec2((ufPlanets[i][0]/ufxScale) - fPosition[0], (ufPlanets[i][1]/ufyScale) - fPosition[1])), 2.0);


                acc = acc + auxA;
            
                //if(length(auxA) > maxLength){ maxLength = length(auxA);}

            }


         }
*/

/*
   for(int i = 0; i < MAX_PLANETS; i++){


            if(vec2( (ufPlanets[i][0] - fPosition[0]), ufPlanets[i][1] - fPosition[1]) != vec2(0.0, 0.0)){

                auxA = normalize(vec2((ufPlanets[i][0]*ufxScale) - fPosition[0], (ufPlanets[i][1]*ufyScale) - fPosition[1]))
                    * gravConst * ufPlanets[i][3] / pow(distMult *  length (vec2((ufPlanets[i][0]*ufxScale) - fPosition[0], (ufPlanets[i][1]*ufyScale) - fPosition[1])), 2.0);


                acc = acc + auxA;
            
                //if(length(auxA) > maxLength){ maxLength = length(auxA);}

            }


         
         }
*/
/*

   for(int i = 0; i < MAX_PLANETS; i++){


            if(vec2( (ufPlanets[i][0] - fPosition[0]), ufPlanets[i][1] - fPosition[1]) != vec2(0.0, 0.0)){

                auxA = normalize(vec2((ufPlanets[i][0]) - fPosition[0]*ufxScale, (ufPlanets[i][1]) - fPosition[1]*ufyScale))
                    * gravConst * ufPlanets[i][3] / pow(distMult *  length (vec2((ufPlanets[i][0]) - fPosition[0]*ufxScale, (ufPlanets[i][1]) - fPosition[1]*ufyScale)), 2.0);


                acc = acc + auxA;
            
                //if(length(auxA) > maxLength){ maxLength = length(auxA);}

            }


         }
*/

    vec3 rgbGeneratedColor = hsv2rgb(vec3(atan(acc[0], acc[1])/(radians(360.0)), 1.0, 1.0));

    //vec3 rgbGeneratedColor = hsv2rgb(vec3(ufyScale, 1.0, 1.0));
    gl_FragColor = vec4(rgbGeneratedColor, abs(sin(1.0/length(acc)) * length(acc)));
    //gl_FragColor = vec4(rgbGeneratedColor, length(acc)/maxLength);
    //gl_FragColor = vec4(0.5, 0.5, 0.5, 1.0);
    

    

/*
    if(ufPlanets[0] != vec4(0.0, 0.0, 0.0, 0.0)){

        gl_FragColor = vec4(0.5, 0.5, 0.5, 1.0);

    }else {gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);}
*/
}
