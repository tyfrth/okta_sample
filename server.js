require('dotenv').config();
const express = require('express');
const http = require('http');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const request = require('request');
const cors = require('cors');
const OktaJwtVerifier = require('@okta/jwt-verifier');

const app = express();

app.set('view engine', 'ejs');
app.use(morgan('combined'));
app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));

const oktaJwtVerifier = new OktaJwtVerifier({
  issuer: 'https://dev-247908.okta.com/oauth2/default', 
  clientID: `${process.env.clientID}`,
  assertClaims: {
    aud: 'api:/default'
}
});

const appUrl = `http://localhost:${process.env.PORT}`;

app.get('/', (req, res) => {
  res.render('home', {weather: null, error: null});
});

//middleware function to check for a bearer token to verify
function authenticationRequired(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const match = authHeader.match(/Bearer (.+)/);

  if (!match) {
    res.status(401);
    return next('Unauthorized');
  }

  const accessToken = match[1];
  //const audience = 'api://default';
  return oktaJwtVerifier.verifyAccessToken(accessToken)
    .then((jwt) => {
      req.jwt = jwt;
      next();
    })
    .catch((err) => {
      res.status(401).send(err.message);
    });
}

// app.get('/', authenticationRequired, (req, res) => {
//   res.render('home', {weather: null, error: null});
//   res.json(req.jwt);
// });

//for testing jwt verifier need to set redirect url in okta dash - still not working :/
// app.get('/test', authenticationRequired, (req, res) => {
//   res.render('test')
//   console.log(jwt)
// })

//post to open weather map with city param - parse json into weathertext for display
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
        let weatherText = `It's ${weather.main.temp} with ${weather.weather[0].description} in ${weather.name} - Feels like ${weather.main.feels_like}`;
        res.render('home', {weather: weatherText, error: null});
      }
    }
  });
})

http.createServer(app).listen(process.env.PORT, () => {
  console.log(`listening on ${appUrl}`);
});