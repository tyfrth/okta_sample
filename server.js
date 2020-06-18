require('dotenv').config();
const express = require('express');
const http = require('http');
const morgan = require('morgan');
const fetch = require("node-fetch");
const bodyParser = require('body-parser');
const request = require('request');

const appUrl = `http://localhost:${process.env.PORT}`;

const app = express();

app.set('view engine', 'ejs');
app.use(morgan('combined'));
app.use(bodyParser.urlencoded({extended: true}));


app.get('/', (req, res) => {
  res.render('home', {weather: null, error: null});
});

app.post('/', function (req, res) {
  let city = req.body.city;
  let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${process.env.API_KEY}`

  request(url, function (err, response, body) {
    if(err){
      res.render('home', {weather: null, error: 'Error, please try again'});
    } else {
      let weather = JSON.parse(body)
      if(weather.main == undefined){
        res.render('home', {weather: null, error: 'Error, please try again'});
      } else {
        let weatherText = `It's ${weather.main.temp} degrees in ${weather.name}!`;
        res.render('home', {weather: weatherText, error: null});
      }
    }
  });
})

var logoutURL = " https://dev-247908.okta.com/logout";

var headers = {
  "id_token_hint": 'oktaSignIn.authClient.tokenManager.token',
  "post_logout_redirect_uri": 'http://localhost:3000'}



function logout() {
  fetch(clientsUrl, { method: 'GET', headers: headers})
  .then((res) => {
     //return res.json()
     console.log("done logged out")
  })}

http.createServer(app).listen(process.env.PORT, () => {
  console.log(`listening on ${appUrl}`);
});