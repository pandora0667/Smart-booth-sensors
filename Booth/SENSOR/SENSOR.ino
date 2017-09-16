#include <ArduinoJson.h>

int trig = 3;
int echo = 2;
int gasPin = A5;
StaticJsonBuffer<200> jsonBuffer;
JsonObject &root = jsonBuffer.createObject();  

void setup() {                
  Serial.begin(9600);
  while(!Serial){
  }
 pinMode(trig, OUTPUT);
 pinMode(echo, INPUT);
}

void loop() {
  digitalWrite(trig, LOW);
  delayMicroseconds(2);
  digitalWrite(trig, HIGH);
  delayMicroseconds(10);
  digitalWrite(trig, LOW);
  
  int smoke = analogRead(A5);
  long duration = pulseIn(echo, HIGH);

  long  distance = ((duration / 29) / 2);
  
  if( distance <= 10 )
    root["trash"] = "true";
  else
    root["trash"] = "false";

  root["smoke"] = smoke;
  root.printTo(Serial);
  Serial.println();

  delay(2000);
}
