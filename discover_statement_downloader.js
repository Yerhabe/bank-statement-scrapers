/*var page = require('webpage').create();
//page.open('https://www.discover.com', function(status) {
page.open('https://www.google.com/search?q=dog', function(status) {
  console.log("Status: " + status);
  if(status === "success") {
    page.render('example.png');
  }
  phantom.exit();
});*/

var system = require('system');
var args = system.args;
var page = new WebPage(), testindex = 0, loadInProgress = false;


page.onConsoleMessage = function(msg) {
  console.log(msg);
};

page.onLoadStarted = function() {
  loadInProgress = true;
  console.log("load started");
};

page.onLoadFinished = function() {
  loadInProgress = false;
  console.log("load finished");
};

var steps = [
  function() {
    //Load Login Page
    page.open("https://www.discover.com");
  },
  function() {
    //Enter Credentials
    page.evaluate(function(login, password) {
      document.getElementById("login-account").value=login;
      document.getElementById("login-password").value=password;
    }, args[1], args[2]);

    //Login
    page.evaluate(function() {
      var login_form = document.getElementById("form-login");
      login_form.submit();
    });
  },
  /*function() {
    // Find "Statements" link element
    page.evaluate(function()){
    	var xpath = "a[text()='Statements']";
		var matchingElement = document.evaluate(
			xpath,
			document,
			null,
			XPathResult.FIRST_ORDERED_NODE_TYPE,
		null).singleNodeValue;
		console.log(matchingElement.text());
		console.log(matchingElement['href']);
    });
    //var myLink = document.getElementById("m_Content_submitbtn2");   
    //myLink.click();
    //page.render("example.png");*/
];


interval = setInterval(function() {
  if (!loadInProgress && typeof steps[testindex] == "function") {
    console.log("step " + (testindex + 1));
    steps[testindex]();
    testindex++;
  }
  if (typeof steps[testindex] != "function") {
    console.log("test complete!");
    phantom.exit();
  }
}, 50);