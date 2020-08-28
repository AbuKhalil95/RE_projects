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
app.get("/new", newHandler);

// old route
app.get("/old", oldHandler);

// -------------------------------- CALLBACK FUNCTIONS --------------------------------

// home
function homeHandler(req, res) {
  res.render("index");
}

// new Map
function newHandler(req, res) {
  res.render("pages/new");
}

// old Map
function oldHandler(req, res) {
  res.render("pages/old");
}

// -------------------------------- API FUNCTIONS --------------------------------

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
function Recipe(data) {
  this.uri = encodeURIComponent(data.recipe.uri);
  this.title = data.recipe.label;
  this.image = data.recipe.image;
  this.ingredients = data.recipe.ingredientLines;
  this.totalCalories = Math.round(data.recipe.calories);
  this.servings = data.recipe.yield;
  this.instructions_url = data.recipe.url;
  this.calPerServ = Math.round(this.totalCalories / this.servings);
}