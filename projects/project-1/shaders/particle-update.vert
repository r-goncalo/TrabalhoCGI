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

const int MAX_PLANETS= 10;
uniform vec4 uPlanets[MAX_PLANETS];


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

   return vec2(abs(vPosition[0] - uPlanets[index][0]) / (pow(vPosition[0] - uPlanets[index][0], 3.0) * pow(distMult, 2.0)),
               abs(vPosition[1] - uPlanets[index][1]) / (pow(vPosition[1] - uPlanets[index][1], 3.0) * pow(distMult, 2.0)))
               * gravConst * partMass * uPlanets[index][3];

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

   vVelocityOut = vVelocity + accel * uDeltaTime;
      
   if (vAgeOut >= vLifeOut) {

      vLifeOut = randLifeMin + (randLifeMax - randLifeMin) * rand(vPositionOut);
      vAgeOut = 0.0;
      vPositionOut = origin;


      highp float _velDir = velDir + rand(vVelocity) * maxDirVar;
      highp float _vel = randVelMin + (randVelMax - randVelMin) * rand(vVelocityOut);
      vVelocityOut = vec2(cos(_velDir) * _vel, sin(_velDir) * _vel);


   }

}