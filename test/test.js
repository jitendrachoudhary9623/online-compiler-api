const supertest = require("supertest");
const should = require("should");

var server = supertest.agent("http://13.127.244.35:9542");

describe("Test Cases For Checking if Api is working or not", function() {
  it("check if api works or not", function(done) {
    server
      .get("/")
      .expect(200)
      .end(function(err, res) {
        res.body.working.should.equal(true);
        done();
      });
  });
});

describe("Test Cases For Compilation Route", function() {
  it("compiling a code where filename is not same as public class name", function(done) {
    server
      .post("/compile")
      .send({
        code: `import java.util.*;  
    public class addTwo{
    public static void main(String args[]){
        Scanner sc=new Scanner(System.in);
        System.out.println(addNo(sc.nextInt(),sc.nextInt()));
    }
    public static int addNo(int a,int b){
    `,
        filename: "add"
      })
      .expect("Content-type", /json/)
      .end(function(err, res) {
        res.body.success.should.equal(false);
        res.body.errors.should.equal("Invalid filename");
        done();
      });
  });

  it("should not compile a invalid code", function(done) {
    server
      .post("/compile")
      .send({
        code: `import java.util.*;  
    public class addTwo{
    public static void main(String args[]){
        Scanner sc=new Scanner(System.in);
        System.out.println(addNo(sc.nextInt(),sc.nextInt()));
    }
    public static int addNo(int a,int b){
    `,
        filename: "addTwo.java"
      })
      .expect("Content-type", /json/)
      .end(function(err, res) {
        res.body.success.should.equal(false);
        done();
      });
  });

  it("should compile a valid code", function(done) {
    server
      .post("/compile")
      .send({
        code: `import java.util.*;  
        public class addTwo{
        public static void main(String args[]){
            Scanner sc=new Scanner(System.in);
            int a=sc.nextInt();
            int b=sc.nextInt();
            System.out.println(addNo(a,b));
        }
        public static int addNo(int a,int b){
            return a+b;
        }
        }
    `,
        filename: "addTwo.java"
      })
      .expect("Content-type", /json/)
      .end(function(err, res) {
        res.body.success.should.equal(true);
        res.body.errors.should.equal("");
        done();
      });
  });

  it("filewithout extension should not compile", function(done) {
    server
      .post("/compile")
      .send({
        code: `import java.util.*;  
        public class addTwo{
        public static void main(String args[]){
            Scanner sc=new Scanner(System.in);
            int a=sc.nextInt();
            int b=sc.nextInt();
            System.out.println(addNo(a,b));
        }
        public static int addNo(int a,int b){
            return a+b;
        }
        }
    `,
        filename: "addTwo"
      })
      .expect("Content-type", /json/)
      .end(function(err, res) {
        res.body.success.should.equal(false);
        res.body.errors.should.equal("Invalid filename");
        done();
      });
  });
});

describe("Test Cases For Running Code /run Route", function() {
  it("should not be running if the file is not present", function(done) {
    server
      .post("/run")
      .send({
        filename: "add"
      })
      .expect("Content-type", /json/)
      .end(function(err, res) {
        res.body.error.should.equal(
          "File is not compiled/present please compile the file first"
        );
        done();
      });
  });
  it("Running a code without any input", function(done) {
    server
      .post("/compile")
      .send({
        code: `import java.util.*;  
      public class HelloWorld{
      public static void main(String args[]){
      System.out.println("Hello");
      }
      }
  `,
        filename: "HelloWorld.java"
      })
      .expect("Content-type", /json/)
      .end(function(err, res) {
        if (res.body.success == true) {
          server
            .post("/run")
            .send({
              filename: "HelloWorld.java",
              pgmInput: ""
            })
            .expect("Content-type", /json/)
            .end(function(err, res) {
              res.body.output.should.equal("Hello\n");
              done();
            });
        }
      });
  });
  it("Running a code with inputs - add two nos", function(done) {
    server
      .post("/compile")
      .send({
        code: `import java.util.*;  
        public class addTwo{
        public static void main(String args[]){
            Scanner sc=new Scanner(System.in);
            int a=sc.nextInt();
            int b=sc.nextInt();
            System.out.println(addNo(a,b));
        }
        public static int addNo(int a,int b){
            return a+b;
        }
        }
  `,
        filename: "addTwo.java"
      })
      .expect("Content-type", /json/)
      .end(function(err, res) {
        if (res.body.success == true) {
          server
            .post("/run")
            .send({
              filename: "addTwo.java",
              pgmInput: `2
              5`
            })
            .expect("Content-type", /json/)
            .end(function(err, res) {
              res.body.output.should.equal("7\n");
              done();
            });
        }
      });
  });
});
