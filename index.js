<<<<<<< Updated upstream
const { response } = require('express');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`listening at port ${port}`));
app.use(express.static('public/'));
app.use(express.json());
require('dotenv').config();


ebirdKey = process.env.API_KEY;
var hotSpotUrl = 'https://api.ebird.org/v2/ref/hotspot/geo?';

//receive user location and forward to ebird to get a list of species common to the area
app.post('/init', async function(request, response) {
    //ebird API URL & params
    var initUrl = 'https://api.ebird.org/v2/data/obs/geo/recent/?';
    var initParams = {
        key: ebirdKey,
        lat: '',
        lng: ''
    };

    //init needs two objects to be sent in response, initialized here
    var sciNameList = {};
    var speciesList = {};

    //handle the POST
    console.log('got a request! user is at ' + request.body.lat, request.body.lng);
    initParams.lat = request.body.lat;
    initParams.lng = request.body.lng;

    //forward user location to ebird with params and prepare response
    var esc = encodeURIComponent;
    var query = Object.keys(initParams)
    .map(function(k) {return esc(k) + '=' + esc(initParams[k]);})
    .join('&');
    var nearResponse = await fetch(initUrl + query);
    speciesList = await nearResponse.json();
    console.log(`found ${speciesList.length} species near user`);
    //store the initial species list in sciNameList using speciesCodes as keys and schiName as values
    for (var i = 0; i < speciesList.length; i++) {
        var newBird = speciesList[i].speciesCode;
        sciNameList[newBird] = speciesList[i].sciName;
    };
    console.log('sending sciNameList and speciesList back to client')
    response.json({sciNameList, speciesList});
});



//receive selected species and forward to ebird to get recent nearby observations
app.post('/obs', async function(request, response) {
    //ebird API URL & params
    var target = '';
    var obsUrl = 'https://api.ebird.org/v2/data/obs/geo/recent/';
    var obsParams = {
        key: ebirdKey,
        lat: '',
        lng: ''
    };

    //handle the POST
    target = request.body.selectValue;
    console.log('got a request! user is looking for ' + request.body.selectValue);
    
    obsParams.lat = request.body.myLocation.lat;
    obsParams.lng = request.body.myLocation.lng;

    //forward user location to ebird with obsParams and forward response
    var esc = encodeURIComponent;
    var query = Object.keys(obsParams)
        .map(function(k) {return esc(k) + '=' + esc(obsParams[k]);}).join('&');
    console.log('sending ' + request.body.selectValue + ' to ebird api')
    var obsResponse = await fetch(obsUrl + target + '?&' + query);
    var obsList = await obsResponse.json();
    console.log('found ' + obsList.length + ' observations near user');
    response.json(obsList);
});



//receive sciName and forward to Wiki to get an image of selected species
app.post('/img', async function(request, response) {
    //Wikipedia API URL & params
    var pediaUrl = 'https://en.wikipedia.org/api/rest_v1/page/media-list/';
    var pediaParams = '';

    //handle the POST
    console.log('got an image request! user wants to see a picture of ' + request.body.name);
    pediaParams = request.body.name;

    //send it to Wikipedia
    console.log(`sending ${pediaParams} to wikipedia api`);
    const pediaResponse = await fetch(pediaUrl + pediaParams);
    const pediaFiles = await pediaResponse.json();

    //pick the first image in the response and set the address to imgSrc
    var imgSrc = pediaFiles.items[0].srcset[0].src;
    console.log('found ' + pediaFiles.items[0].title + ', sending to user');
    response.json(imgSrc);
});



//receive coords and fetch hotspots near them
app.post('/spots', async function(request, response) {
    //ebird API URL & params
    var spotUrl = 'https://api.ebird.org/v2/ref/hotspot/geo?';
    var spotParams = {
        key: ebirdKey,
        lat: '',
        lng: '',
        dist: '10',
        fmt: 'json'
    };

    //handle the POST
    console.log('got a hotspot request! user wants hotspots within ' + spotParams.dist + 'km of ' + request.body.viewCenter.lat, request.body.viewCenter.lng);
    spotParams.lat = request.body.viewCenter.lat;
    spotParams.lng = request.body.viewCenter.lng;

    //fetch hotspots near viewCenter
    var esc = encodeURIComponent;
    var query = Object.keys(spotParams)
    .map(function(k) {return esc(k) + '=' + esc(spotParams[k]);})
    .join('&');
    var spotResponse = await fetch(spotUrl + query);
    var spotList = await spotResponse.json();
    console.log('found ' + spotList.length + ' hotspots within viewport');
    response.json(spotList);
});



//receive coords of specific hotspot and get all species observed near it
app.post('/spotBird', async function(request, response) {
    var spotBirdUrl = 'https://api.ebird.org/v2/data/obs/geo/recent?';
    var spotBirdParams = {
        key: ebirdKey,
        lat: '',
        lng: '',
        dist: '5'
    };

    //handle the POST
    console.log('got a hotspot request! user wants birds at a hotspot');
    spotBirdParams.lat = request.body.spotBirdParams.lat;
    spotBirdParams.lng = request.body.spotBirdParams.lng;

    //bang the url & params against the ebird api
    var esc = encodeURIComponent;
    var query = Object.keys(spotBirdParams)
    .map(function(k) {return esc(k) + '=' + esc(spotBirdParams[k]);})
    .join('&');    
    console.log('asking ebird api');
    var spotBirdResponse = await fetch(spotBirdUrl + query);
    var spotBirds = await spotBirdResponse.json();
    console.log('found ' + spotBirds.length + ' species near user`s location');
    response.json(spotBirds); 

=======
const { response } = require('express');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`listening at port ${port}`));
app.use(express.static('public/'));
app.use(express.json());
require('dotenv').config();


ebirdKey = process.env.API_KEY;
var hotSpotUrl = 'https://api.ebird.org/v2/ref/hotspot/geo?';

//receive user location and forward to ebird to get a list of species common to the area
app.post('/init', async function(request, response) {
    //ebird API URL & params
    var initUrl = 'https://api.ebird.org/v2/data/obs/geo/recent/?';
    var initParams = {
        key: ebirdKey,
        lat: '',
        lng: ''
    };

    //init needs two objects to be sent in response, initialized here
    var sciNameList = {};
    var speciesList = {};

    //handle the POST
    console.log('got a request! user is at ' + request.body.lat, request.body.lng);
    initParams.lat = request.body.lat;
    initParams.lng = request.body.lng;

    //forward user location to ebird with params and prepare response
    var esc = encodeURIComponent;
    var query = Object.keys(initParams)
    .map(function(k) {return esc(k) + '=' + esc(initParams[k]);})
    .join('&');
    var nearResponse = await fetch(initUrl + query);
    speciesList = await nearResponse.json();
    console.log(`found ${speciesList.length} species near user`);
    //store the initial species list in sciNameList using speciesCodes as keys and schiName as values
    for (var i = 0; i < speciesList.length; i++) {
        var newBird = speciesList[i].speciesCode;
        sciNameList[newBird] = speciesList[i].sciName;
    };
    console.log('sending sciNameList and speciesList back to client')
    response.json({sciNameList, speciesList});
});



//receive selected species and forward to ebird to get recent nearby observations
app.post('/obs', async function(request, response) {
    //ebird API URL & params
    var target = '';
    var obsUrl = 'https://api.ebird.org/v2/data/obs/geo/recent/';
    var obsParams = {
        key: ebirdKey,
        lat: '',
        lng: ''
    };

    //handle the POST
    target = request.body.selectValue;
    console.log('got a request! user is looking for ' + request.body.selectValue);
    
    obsParams.lat = request.body.myLocation.lat;
    obsParams.lng = request.body.myLocation.lng;

    //forward user location to ebird with obsParams and forward response
    var esc = encodeURIComponent;
    var query = Object.keys(obsParams)
        .map(function(k) {return esc(k) + '=' + esc(obsParams[k]);}).join('&');
    console.log('sending ' + request.body.selectValue + ' to ebird api')
    var obsResponse = await fetch(obsUrl + target + '?&' + query);
    var obsList = await obsResponse.json();
    console.log('found ' + obsList.length + ' observations near user');
    response.json(obsList);
});



//receive sciName and forward to Wiki to get an image of selected species
app.post('/img', async function(request, response) {
    //Wikipedia API URL & params
    var pediaUrl = 'https://en.wikipedia.org/api/rest_v1/page/media-list/';
    var pediaParams = '';

    //handle the POST
    console.log('got an image request! user wants to see a picture of ' + request.body.name);
    pediaParams = request.body.name;

    //send it to Wikipedia
    console.log(`sending ${pediaParams} to wikipedia api`);
    const pediaResponse = await fetch(pediaUrl + pediaParams);
    const pediaFiles = await pediaResponse.json();

    //pick the first image in the response and set the address to imgSrc
    var imgSrc = pediaFiles.items[0].srcset[0].src;
    console.log('found ' + pediaFiles.items[0].title + ', sending to user');
    response.json(imgSrc);
});



//receive coords and fetch hotspots near them
app.post('/spots', async function(request, response) {
    //ebird API URL & params
    var spotUrl = 'https://api.ebird.org/v2/ref/hotspot/geo?';
    var spotParams = {
        key: ebirdKey,
        lat: '',
        lng: '',
        dist: '10',
        fmt: 'json'
    };

    //handle the POST
    console.log('got a hotspot request! user wants hotspots within ' + spotParams.dist + 'km of ' + request.body.viewCenter.lat, request.body.viewCenter.lng);
    spotParams.lat = request.body.viewCenter.lat;
    spotParams.lng = request.body.viewCenter.lng;

    //fetch hotspots near viewCenter
    var esc = encodeURIComponent;
    var query = Object.keys(spotParams)
    .map(function(k) {return esc(k) + '=' + esc(spotParams[k]);})
    .join('&');
    var spotResponse = await fetch(spotUrl + query);
    var spotList = await spotResponse.json();
    console.log('found ' + spotList.length + ' hotspots within viewport');
    response.json(spotList);
});



//receive coords of specific hotspot and get all species observed near it
app.post('/spotBird', async function(request, response) {
    var spotBirdUrl = 'https://api.ebird.org/v2/data/obs/geo/recent?';
    var spotBirdParams = {
        key: ebirdKey,
        lat: '',
        lng: '',
        dist: '5'
    };

    //handle the POST
    console.log('got a hotspot request! user wants birds at a hotspot');
    spotBirdParams.lat = request.body.spotBirdParams.lat;
    spotBirdParams.lng = request.body.spotBirdParams.lng;

    //bang the url & params against the ebird api
    var esc = encodeURIComponent;
    var query = Object.keys(spotBirdParams)
    .map(function(k) {return esc(k) + '=' + esc(spotBirdParams[k]);})
    .join('&');    
    console.log('asking ebird api');
    var spotBirdResponse = await fetch(spotBirdUrl + query);
    var spotBirds = await spotBirdResponse.json();
    console.log('found ' + spotBirds.length + ' species near user`s location');
    response.json(spotBirds); 

>>>>>>> Stashed changes
});