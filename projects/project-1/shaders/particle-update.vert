//precision mediump float; used by the teacher
precision highp float; //why not go further? if the computer handles it...
/* Number of seconds (possibly fractional) that has passed since the last
   update step. */
uniform float uDeltaTime; // "global" variable for all particles


uniform float randVelMin;
uniform float randVelMax;
uniform vec2 origin;
uniform float velDir;
uniform float maxDirVar;
uniform float randLifeMax;
uniform float randLifeMin;


const float distMult = 6571000.0;
const float partMass = 1.0;
const float gravConst = 0.0000000000667;

const int MAX_PLANETS = 10;
uniform vec4 uPlanets[MAX_PLANETS]; //position, radius, mass


/* Inputs. These reflect the state of a single particle before the update. */


attribute vec2 vPosition;              // actual position
attribute float vAge;                  // actual age (in seconds)
attribute float vLife;                 // when it is supposed to die 
attribute vec2 vVelocity;              // actual speed

/* Outputs. These mirror the inputs. These values will be captured into our transform feedback buffer! */
varying vec2 vPositionOut;
varying float vAgeOut;
varying float vLifeOut;
varying vec2 vVelocityOut;

// generates a pseudo random number that is a function of the argument. The argument needs to be constantly changing from call to call to generate different results
highp float rand(vec2 co)
{
    highp float a = 12.9898;
    highp float b = 78.233;
    highp float c = 43758.5453;
    highp float dt= dot(co.xy ,vec2(a,b));
    highp float sn= mod(dt,3.14);
    return fract(sin(sn) * c);
}


vec2 accToPlanet(int index){


   if(vec2( uPlanets[index][0] - vPosition[0], uPlanets[index][1] - vPosition[1]) != vec2(0.0, 0.0)){

   return normalize(vec2(uPlanets[index][0] - vPosition[0], uPlanets[index][1] - vPosition[1]))
           * gravConst * uPlanets[index][3] / ( pow(distMult *  length (vec2( uPlanets[index][0] - vPosition[0], uPlanets[index][1] - vPosition[1])), 2.0));


   }else {return vec2(0.0, 0.0);}


}

void main() {

   /* Update parameters according to our simple rules.*/
   vPositionOut = vPosition + vVelocity * uDeltaTime;
   vAgeOut = vAge + uDeltaTime;
   vLifeOut = vLife;

   vec2 accel = vec2(0.0, 0.0);

   for(int i = 0; i < MAX_PLANETS; i++){

      accel = accel + accToPlanet(i);
   }

    vVelocityOut = vVelocity + (accel * uDeltaTime);
 
 

    for(int i = 0; i<MAX_PLANETS;i++){
      if(pow( pow(uPlanets[i][0]-vPositionOut[0], 2.0) +  pow(uPlanets[i][1]-vPositionOut[1], 2.0),0.5) <= uPlanets[i][2])
      {
         vAgeOut += (vLife - vAge)/2.0 + ((vLife - vAge) * rand(accel * vPosition *  uDeltaTime) * length(accel)); //trying progressive killing
         break;
      }
   }


   if (vAgeOut >= vLifeOut) {

      vLifeOut = randLifeMin + (randLifeMax - randLifeMin) * rand(vPositionOut * vAgeOut + vVelocity);
      vAgeOut = 0.0;
      vPositionOut = origin;


      highp float _velDir = velDir + (-1.0 + 2.0 * rand(vVelocity + vPosition)) * maxDirVar;
      highp float _vel = randVelMin + (randVelMax - randVelMin) * rand(vVelocityOut * vLifeOut + vPositionOut);
      vVelocityOut = vec2(cos(_velDir) * _vel, sin(_velDir) * _vel);
   }

   
}