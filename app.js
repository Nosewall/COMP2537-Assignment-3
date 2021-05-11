"use strict";

const express = require("express");
const app = express();
const fs = require("fs");
const mysql = require("mysql");
const bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/scripts", express.static("static/scripts"));
app.use("/css", express.static("static/css"));

let port = 8000;
app.listen(port, function () {
    console.log("Nolan has been voted off port " + port);
});