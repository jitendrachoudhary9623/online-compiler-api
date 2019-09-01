const express = require("express");
const app = express();
const fs = require("fs");
const cors = require("cors");

var bodyParser = require("body-parser");
app.use(bodyParser.json());

app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(cors());
app.get("/", (req, res) => {
  res.send("Default Path");
});

app.post("/run", (req, res) => {
  file = req.body.filename.toString().split(".")[0];
  let childProcess = require("child_process").spawn("java", [file]);
  var output = "";
  var error = "";
  console.log(req.body.pgmInput);
  var i = 0;
  childProcess.stdout.on("data", function(data) {
    if (i == 0) {
      childProcess.stdin.write(req.body.pgmInput);
      childProcess.stdin.end();
      i++;
    } else {
      output = output + data;
    }
  });
  childProcess.stderr.on("data", function(data) {
    error = error + data;
  });
  childProcess.on("exit", data => {
    console.log("request complete");
    var response = {
      output: "",
      error: ""
    };
    response.output = output;
    response.error = error;
    res.json(response);
  });
});
app.post("/compile", (req, res) => {
  console.log(req.body.code);
  fs.writeFile("" + req.body.filename, req.body.code, err => {
    if (err) console.log(err);
    console.log("Successfully Written to File.");
    let childProcess = require("child_process").spawn("javac", [
      req.body.filename
    ]);
    var noOfErrors = "";
    childProcess.stdout.on("data", function(data) {
      console.log("Read Output " + data);
    });

    childProcess.stderr.on("data", function(data) {
      console.log("error " + data);
      noOfErrors = noOfErrors + data;
    });
    childProcess.on("exit", data => {
      console.log("complete " + data);
      var response = {
        errors: "",
        success: false
      };
      response.errors = noOfErrors;
      if (noOfErrors === "") {
        response.success = true;
      }
      res.json(response);
    });
  });

  //res.send({ code: req.body.code });
});
app.listen(9542, () => console.log("Application is working fine"));
