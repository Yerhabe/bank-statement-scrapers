var casper = require('casper').create();
var x = require('casper').selectXPath;
var fs = require('fs')

/* ERROR HANDLING */

// print out all the messages in the headless browser context
casper.on('remote.message', function(msg) {
    this.echo('remote message caught: ' + msg);
});

// print out all the messages in the headless browser context
casper.on("page.error", function(msg, trace) {
    this.echo("Page Error: " + msg, "ERROR");
});
/* END ERROR HANDLING */

/* NAVIGATION */
var username = casper.cli.get(0);
var password = casper.cli.get(1);
var directory = casper.cli.get(2);

//check number of arguments
if (casper.cli.args.length !== 3){
    casper.echo("ERROR!");
    casper.echo("\tusage: $ casperjs discover_statement_downloader_casper.js <username> <password> <download_directory>").exit();
}

//login
casper.start("https://www.discover.com", function() {
    this.echo(this.getTitle());
    this.fill('form#form-login', {
      'userID': username,
      'password': password,
    }, true);
});

//wait for page to load
casper.waitForSelector("li.parent-link-container.has-fly-out", function(){
  this.echo(this.getTitle());
});

//click on statements tab
casper.thenClick(x("//a[starts-with(text(),'Statements')]"), function() {
    this.echo(this.getTitle());
});

//download any new PDFs
casper.then(function() {

  //extract all the statement PDF links
  var statement_links = casper.evaluate(function() {
    var statements = document.querySelectorAll('a.view.popup');
    var href_array = [];
    for (i =0; i < statements.length; ++i){
      href_array.push(statements[i]['href']);
    }
    return href_array;
  });

  this.echo(statement_links.length);
  //download each PDF if it does not exist
  for (i = 0; i < statement_links.length; ++i) {

      var link = statement_links[i];
      var date = get_date(link);
      var year = date.substring(0,4);


      // create target directory
      var target_directory = directory + "/" + year;
      var success = fs.makeDirectory(target_directory);


      var target_filename = target_directory + "/" + date + "_statement.pdf";
      if (!fs.exists(target_filename)){
        this.echo("Downloading to ", target_filename);
        casper.download(link, target_filename);
      }
  }
});

casper.run();

function get_date(s){
  start_index = s.search("date=");
  return  s.substring(start_index+5);
}