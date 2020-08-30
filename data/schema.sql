DROP TABLE IF EXISTS Locations;
CREATE TABLE Locations (
  id SERIAL PRIMARY KEY,
  type VARCHAR ( 255 ),
  name VARCHAR ( 255 ),
  capacity VARCHAR ( 255 ),
  generation VARCHAR ( 255 ),
  location VARCHAR ( 255 ),
  status VARCHAR ( 255 ),
  lenders VARCHAR ( 255 ),
  epc VARCHAR ( 255 ),
  main_station VARCHAR ( 255 ),
  technology VARCHAR ( 255 ),
  governorate VARCHAR ( 255 ),
  coordinates POINT
);
