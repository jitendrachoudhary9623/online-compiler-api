const express = require("express");
const app = express();
const fs = require("fs");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const codeStorageFolder = "user_codes/";
const portNo = 9542;
app.use(bodyParser.json());

app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(cors());
app.get("/", (req, res) => {
  res.status(200);
  res.json({ working: true });
});

app.post("/run", (req, res) => {
  var response = {
    output: "",
    error: ""
  };
  let file = req.body.filename.toString().split(".")[0];

  //check if file is present or not
  fs.access(req.body.filename, fs.F_OK, err => {
    if (err) {
      console.log(err);
      response = {
        output: "",
        error: "File is not compiled/present please compile the file first"
      };
      res.json(response);
    } else {
      //file exists do the proccessing
      let childProcess = require("child_process").spawn("java", [file]);
      // process.stdin.pipe(childProcess.stdin);

      var output = "";
      var error = "";
      var i = 0;
      //inputs converted to array by spliting them on new line
      var inputStreams = req.body.pgmInput.toString().split("\n");
      //providing array as input to the console
      while (i < inputStreams.length) {
        childProcess.stdin.write(inputStreams[i] + "\n");
        i++;
      }
      childProcess.stdin.end();
      childProcess.stdout.on("data", function(data) {
        output = output + data;
      });
      childProcess.stderr.on("data", function(data) {
        error = error + data;
      });
      childProcess.on("exit", data => {
        response.output = output;
        response.error = error;
        res.json(response);
      });
    }
  });
});

app.post("/compile", (req, res) => {
  var filename = req.body.filename.toString();
  console.log(filename);
  if (filename.split(".").length < 2) {
    res.send({
      errors: "Invalid filename",
      success: false
    });
    res.end();
    return;
  }
  fs.writeFile(filename, req.body.code, err => {
    if (err) console.log(err);
    let childProcess = require("child_process").spawn("javac", [filename]);
    var noOfErrors = "";
    childProcess.stdout.on("data", function(data) {});

    childProcess.stderr.on("data", function(data) {
      noOfErrors = noOfErrors + data;
    });
    childProcess.on("exit", data => {
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
app.listen(portNo, () => console.log("Application is working fine"));
