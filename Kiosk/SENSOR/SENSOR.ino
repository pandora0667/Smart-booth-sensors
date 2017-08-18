#include <ArduinoJson.h>

const int gasPin = A2;
const int gasPin2 = A1;
const int infraredSensorPin = 10;
int count = 0;
StaticJsonBuffer<200> jsonBuffer;
JsonObject& root = jsonBuffer.createObject();

void setup() {
  Serial.begin(9600);
  while (!Serial) {
  }
  pinMode(infraredSensorPin, INPUT);
}

// the loop routine runs over and over again forever:
void loop() {
 int smoking = analogRead(A2);
 int smoking2 = analogRead(A1);
// Serial.print(" / ");
 if( digitalRead(infraredSensorPin) == LOW ){
   root["sensing"] = "true";
   root["smoking1"] = smoking;
   root["smoking2"] = smoking2;
   root.printTo(Serial); 
   Serial.println();
   if( smoking > 100 || smoking2 > 100) {
     count++;
     Serial.println("Smoking");
     
     if( count == 10 ) {
       Serial.println("Real Smoking");
     }
   } else {
//     Serial.println("No Smoking");
   } 
 } else { 
   count = 0;
   root["sensing"] = "false";
   root["smoking1"] = 0;
   root["smoking2"] = 0;
   root.printTo(Serial); 
   Serial.println();
 }
 
 delay(100);
 
}
