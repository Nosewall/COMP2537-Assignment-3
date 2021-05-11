"use strict";

const express = require("express");
const app = express();
const fs = require("fs");
const mysql = require('mysql2/promise');
const bodyParser = require("body-parser");
const session = require("express-session");
const { JSDOM } = require("jsdom");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/scripts", express.static("static/scripts"));
app.use("/css", express.static("static/css"));
app.use("/img", express.static("static/img"));

app.use(session(
    {
        secret:'extra text that no one will guess',
        name:'wazaSessionID',
        resave: false,
        saveUninitialized: true }));

app.get("/", function (req, res) {

    //Create the database if it doesn't already exist
    initDB();

    let index = fs.readFileSync("./static/html/index.html", "utf8");
    res.send(index);
});


async function initDB() {
   
    // Let's build the DB if it doesn't exist
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      multipleStatements: true
    });

    const createDBAndTables = `CREATE DATABASE IF NOT EXISTS assignment3;
        use assignment3;
        CREATE TABLE IF NOT EXISTS user (
        ID int NOT NULL AUTO_INCREMENT,
        email varchar(30),
        password varchar(30),
        PRIMARY KEY (ID));`;

    await connection.query(createDBAndTables);
    let results = await connection.query("SELECT COUNT(*) FROM user");
    let count = results[0][0]['COUNT(*)'];

    if(count < 1) {
        results = await connection.query("INSERT INTO user (email, password) values ('arron_ferguson@bcit.ca', 'admin')");
        console.log("Added one user record.");
    }
    connection.end();
}

app.get('/profile', function(req, res) {

    // check for a session first!
    if(req.session.loggedIn) {

        // DIY templating with DOM, this is only the husk of the page
        let templateFile = fs.readFileSync('./static/templates/profile.html', "utf8");
        let templateDOM = new JSDOM(templateFile);
        let $template = require("jquery")(templateDOM.window);

        // put the name in
        //$template("#profile_name").html(req.session.email);

        // insert the left column from a different file (or could be a DB or ad network, etc.)
        let left = fs.readFileSync('./static/templates/content1.html', "utf8");
        let leftDOM = new JSDOM(left);
        let $left = require("jquery")(leftDOM.window);
        // Replace! first content 1 is from profile, second is on content1
        $template("#content1").replaceWith($left("#content1"));

        // insert the left column from a different file (or could be a DB or ad network, etc.)
        let middle = fs.readFileSync('./static/templates/content2.html', "utf8");
        let middleDOM = new JSDOM(middle);
        let $middle = require("jquery")(middleDOM.window);
        // Replace!
        $template("#content2").replaceWith($middle("#content2"));


        // insert the left column from a different file (or could be a DB or ad network, etc.)
        let right = fs.readFileSync('./static/templates/content3.html', "utf8");
        let rightDOM = new JSDOM(right);
        let $right = require("jquery")(rightDOM.window);
        // Replace!
        $template("#content3").replaceWith($right("#content3"));

        res.set('Server', 'Wazubi Engine');
        res.set('X-Powered-By', 'Wazubi');
        res.send(templateDOM.serialize());

    } else {
        // not logged in - no session!
        res.redirect('/');
    }


});


// Notice that this is a 'POST'
app.post('/authenticate', function(req, res) {
    res.setHeader('Content-Type', 'application/json');


//    console.log("Email", req.body.email);
//    console.log("Password", req.body.password);


    let results = authenticate(req.body.email, req.body.password,
        function(rows) {
            //console.log(rows.password);
            if(rows == null) {
                // not found
                res.send({ status: "fail", msg: "User account not found." });
            } else {
                // authenticate the user, create a session
                req.session.loggedIn = true;
                req.session.email = rows.email;
                req.session.save(function(err) {
                    // session saved
                })
                // this will only work with non-AJAX calls
                //res.redirect("/profile");
                // have to send a message to the browser and let front-end complete
                // the action
                res.send({ status: "success", msg: "Logged in." });
            }
    });

});


function authenticate(email, pwd, callback) {

    const mysql = require('mysql2');
    const connection = mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'assignment3'
    });

    connection.query(
      "SELECT * FROM user WHERE email = ? AND password = ?", [email, pwd],
      function (error, results) {
        if (error) {
            throw error;
        }

        if(results.length > 0) {
            // email and password found
            return callback(results[0]);
        } else {
            // user not found
            return callback(null);
        }

    });

}


app.get('/logout', function(req,res){
    req.session.destroy(function(error){
        if(error) {
            console.log(error);
        }
    });
    res.redirect("/profile");
})

let port = 8000;
app.listen(port, function () {
    console.log("Nolan has been voted off port " + port);
});