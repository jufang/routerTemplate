var express = require('express');
var ejs     = require('ejs');
var path = require('path')
var app = express();

app.set('views', path.join(__dirname, 'views'));  

// view engine setup  
// app.set('views', path.join(__dirname, 'views'));  
// app.set('view engine', 'ejs'); 
// 设置为.html的后缀
app.engine('html',ejs.renderFile);
app.set("view engine", "html"); 

app.get('/q', function (req, res) {
  res.render('index',{title:'hello q'})
});

app.get('/template', function (req, res) {
  res.render('template',{title:'hello template'})
});


app.use(express.static('public'));

var server = app.listen(3000, function () {
  var port = server.address().port;
  console.log('Example app listening at http://127.0.0.1:%s', port);
});