"use strict";

// -------------------------------- DECLARE VARIABLES --------------------------------
const express = require("express");
const cors = require("cors");
require("dotenv").config(".env");
const expressLayouts = require("express-ejs-layouts");
const pg = require("pg");

const methodOverride = require("method-override");
const client = new pg.Client(process.env.DATABASE_URL);

// initialize the server
const app = express();

// Declare a port
const PORT = process.env.PORT || 3000;

// // Declare a app id for edmam
// const APP_ID = process.env.APP_ID;


// using layouts
app.use(expressLayouts);

// Use cros
app.use(cors());

// Use super agent
const superagent = require("superagent");

// view engine setup
app.set("view engine", "ejs");

//setup public folder
app.use(express.static("public"));

//set the encode for post body request
app.use(express.urlencoded({ extended: true }));

// override http methods
app.use(methodOverride("_method"));

//set database and connect to the server
client.connect().then(() => {
  app.listen(PORT, () => {
    console.log("I am listening to port: ", PORT);
  });
});

// -------------------------------- ROUTES --------------------------------

// new route
app.get("/", homeHandler);

// new route
app.get("/map", mapHandler);

// old route
app.get("/old", oldHandler);

// -------------------------------- CALLBACK FUNCTIONS --------------------------------

// home
function homeHandler(req, res) {
  res.render("index");
}

// new Map
async function mapHandler(req, res) {
  let url = ['http://memrgis.memr.gov.jo/arcgis/rest/services/Hosted/R%D8%ABnwebel_Data2020/FeatureServer/0/query?where=1%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&distance=&units=esriSRUnit_Meter&relationParam=&outFields=objectid_1%2Cpower_plan%2Ccapacity__%2Cgeneration%2Clocation%2Cstatus%2Clenders__d%2Cproject_co%2Cmain_stati%2Ctechnology%2Cgovernorat&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=&having=&gdbVersion=&historicMoment=&returnDistinctValues=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&orderByFields=objectid_1+ASC&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&multipatchOption=xyFootprint&resultOffset=&resultRecordCount=&returnTrueCurves=false&returnCentroid=false&sqlFormat=none&resultType=&f=geojson',
             'http://memrgis.memr.gov.jo/arcgis/rest/services/Hosted/R%D8%ABnwebel_Data2020/FeatureServer/1/query?where=1%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&distance=&units=esriSRUnit_Meter&relationParam=&outFields=objectid_1%2Cpower_plan%2Ccapacity__%2Cgeneration%2Clocation%2Cstatus%2Clenders__d%2Cproject_co%2Cmain_stati%2Ctechnology%2Cgovernorat&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=&having=&gdbVersion=&historicMoment=&returnDistinctValues=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&orderByFields=objectid_1+ASC&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&multipatchOption=xyFootprint&resultOffset=&resultRecordCount=&returnTrueCurves=false&returnCentroid=false&sqlFormat=none&resultType=&f=geojson'];
  let locations = [];

  await superagent.get(url[0]).then(result => {
    result.body.features.forEach(element => {
      locations.push(new Location('Wind', element));
    });
  });

  await superagent.get(url[1]).then(result => {
    result.body.features.forEach(element => {
      locations.push(new Location('PV', element));
    });
  });

  await saveLocations(locations);
  console.log(locations);
  // for (var key in locations) {
  //   if (locations[key].type == 'PV') {
  //     console.log('Yes PV');
  //   } else {
  //     console.log('yes wind');
  //   }
  // }
  res.render("pages/map", {
    locations : JSON.stringify(locations)
  });
}
  // INSERT INTO points(coordinates) VALUES (ST_GeomFromText('POINT(10.809003 54.097834)',4326));

// old Map
function oldHandler(req, res) {
  res.render("pages/old");
}

// -------------------------------- DB FUNCTIONS --------------------------------
async function saveLocations(locations) {
  locations.forEach(point => {
    let SQL = 'INSERT INTO Locations (type, name, capacity, generation, location, status,\
      lenders, epc, main_station, technology, governorate, coordinates) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, POINT($12, $13));';
    let values = [point.type, point.name, point.capacity, point.generation, point.location, point.status, 
      point.lenders, point.epc, point.main_station, point.technology, point.governorate, point.coordinates[0], point.coordinates[1]];

    return client.query(SQL, values);    
  });
}

// //search recipe API
// function getRecipes(queryParams) {
//   let url = "https://api.edamam.com/search";
 
//   console.log('queryParams', queryParams);

//   let result = superagent
//     .get(url)
//     .query(queryParams)
//     .then((res) => {
//       console.log(`response`, res);
//       return res.body.hits.map((e) => {
//         return new Recipe(e);
//       });
//     })
//     .catch((error) => {
//       console.log('error this', error);
//     });
//   return result;
// }

// -------------------------------- CONSTRUCTORS --------------------------------
function Location(type, data) {
  this.type = type;
  this.name = data.properties.power_plan;
  this.capacity = data.properties.capacity__;
  this.generation = data.properties.generation;
  this.location = data.properties.location;
  this.status = data.properties.status;
  this.lenders = data.properties.lenders__d;
  this.epc = data.properties.project_co;
  this.main_station = data.properties.main_stati;
  this.technology = data.properties.technology;
  this.governorate = data.properties.governorat;

  this.coordinates = data.geometry && data.geometry.coordinates && data.geometry.coordinates[0] ? [data.geometry.coordinates[0], data.geometry.coordinates[1]] : [0,0];
}