var system = require('system');
if (system.args.length !== 4) {
  console.log('Please specify email address, password and file name of DNS records.');
  console.log('$ phantomjs ' + system.args[0] + ' <email address> <password> <file name of DNS records>');
  phantom.exit();
}

var emailAddress = system.args[1];
var password = system.args[2];

var fs = require('fs');
if (!fs.isReadable(system.args[3])) {
  console.log('Could not read DNS records from specified file.');
  console.log('exit.');
  phantom.exit();
}

var dnsRecords = fs.read(system.args[3]).replace(/\s+$/, "");
console.log('DNS records will be update with');
console.log('----------');
console.log(dnsRecords);
console.log('----------');
console.log('');

var userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:30.0) Gecko/20100101 Firefox/30.0';

var page = require('webpage').create();
page.settings.userAgent = userAgent;

var funcs = new Array();
funcs.push(function () {
  var url = 'https://secure.netowl.jp/netowl/?service=stardomain';
  page.open(url);
});

funcs.push(function () {
  page.evaluate(function(e, p) {
    document.getElementsByName('mailaddress')[0].value = e;
    document.getElementsByName('password')[0].value = p;
    document.getElementsByName('action_user_login')[0].click();
  }, emailAddress, password);
});

funcs.push(function () {
  // do nothing
});

funcs.push(function () {
  page.evaluate(function() {
    document.getElementsByName('action_user_detail_index')[0].click();
  });
});

funcs.push(function () {
  page.evaluate(function() {
    document.getElementsByName('action_user_dns_index')[0].click();
  });
});

funcs.push(function () {
  page.evaluate(function() {
    var elem = document.getElementsByClassName('submenu_04')[0].firstElementChild;
    var e = document.createEvent('Events');
    e.initEvent('click', true, false);
    elem.dispatchEvent(e);
  });
});

funcs.push(function () {
  var current = page.evaluate(function() {
    return document.getElementsByName('content')[0].value.replace(/\s+$/, "");
  });

  console.log('Current DNS records is');
  console.log('----------');
  console.log(current);
  console.log('----------');
  console.log('');

  if (dnsRecords === current) {
    console.log('DNS records is matched.');
    console.log('Updating is not needed.');
    console.log('exit.');
    phantom.exit();
  } else {
    console.log('DNS records is not matched.');
    console.log('Updating...');
  }

  page.evaluate(function(d) {
    document.getElementsByName('content')[0].value = d;
    document.getElementsByName('action_user_dns_edittxt_conf')[0].click();
  }, dnsRecords);
});

funcs.push(function () {
  page.evaluate(function() {
    document.getElementsByName('action_user_dns_edittxt_do')[0].click();
  });
});

funcs.push(function () {
  console.log('done.');
  phantom.exit();
});

page.onLoadFinished = function () {
  //console.log(page.title);
  //console.log(page.url);
  //console.log(page.content);

  if (funcs.length > 0) {
    var func = funcs.shift();
    func();
  } else {
    console.log('Function queue is empty.');
    console.log('exit.');
    phantom.exit();
  }
};

page.onLoadFinished();
