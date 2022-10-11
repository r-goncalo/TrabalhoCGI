precision highp float;


// Vertex position in World Coordinates
attribute vec2 vPosition;

const float distMult = 6571000.0;
const float partMass = 1.0;
const float gravConst = 0.0000000000667;

const int MAX_PLANETS=10;
uniform vec4 ufPlanets[MAX_PLANETS];

varying vec4 fColor;

vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec2 accToPlanet(int index){


   if(vec2( ufPlanets[index][0] - vPosition[0], ufPlanets[index][1] - vPosition[1]) != vec2(0.0, 0.0)){

   return normalize(vec2(ufPlanets[index][0] - vPosition[0], ufPlanets[index][1] - vPosition[1]))
           * gravConst * ufPlanets[index][3] / pow(distMult *  length (vec2( ufPlanets[index][0] - vPosition[0], ufPlanets[index][1] - vPosition[1])), 2.0);


   }else {return vec2(0.0, 0.0);}


}

void main() 
{
    gl_Position = vec4(vPosition, 0.0, 1.0);
    
    vec2 acc = vec2(0.0, 0.0);

       for(int i = 0; i < MAX_PLANETS; i++){

      acc = acc + accToPlanet(i);
   }

   vec3 rgbGeneratedColor = hsv2rgb(vec3(atan(acc[0], acc[1]), 1.0, 1.0));
   fColor = vec4(rgbGeneratedColor, length(acc));


}
