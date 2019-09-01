const express = require("express");
const app = express();
const fs = require("fs");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const codeStorageFolder = "user_codes/";
app.use(bodyParser.json());

app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(cors());
app.get("/", (req, res) => {
  res.send("Use END POINTS");
});

app.post("/run", (req, res) => {
  let file = req.body.filename.toString().split(".")[0];
  let childProcess = require("child_process").spawn("java", [file]);
  // process.stdin.pipe(childProcess.stdin);

  var output = "";
  var error = "";
  var i = 0;
  var inputStreams = req.body.pgmInput.toString().split("\n");
  console.log(inputStreams);
  while (i < inputStreams.length) {
    console.log(i + "  " + inputStreams[i] + " " + typeof inputStreams[i]);
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

function typeOfNaN(x) {
  if (Number.isNaN(x)) {
    return x;
  }
  if (isNaN(x)) {
    return parseInt(x);
  }
}
app.listen(9542, () => console.log("Application is working fine"));
