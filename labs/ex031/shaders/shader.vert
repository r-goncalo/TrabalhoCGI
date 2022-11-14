

attribute vec4 vPosition;
//attribute vec4 vColor; could be used and would add extra complications, how would we read and write from the stream of bytes vectors with a color each?

void main()
{

gl_Position = vPosition;

}