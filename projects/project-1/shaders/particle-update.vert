precision mediump float;

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

void main() {

   /* Update parameters according to our simple rules.*/
   vPositionOut = vPosition + vVelocity * uDeltaTime;
   vAgeOut = vAge + uDeltaTime;
   vLifeOut = vLife;

   vec2 accel = vec2(0.0);
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