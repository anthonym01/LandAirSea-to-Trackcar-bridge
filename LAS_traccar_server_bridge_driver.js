//'node Server.js'
//This is the server file, it will handle all requests and responses

//Server configuration
const port = 8082;// 80, 443, 8082 nginx
const express = require('express');
const app = express();
const logs = require('./modules/logger');
const axios = require('axios');
const credentials = require('./credentials.json');
//const database = require('./modules/database');

app.listen(port, () => {
    try {
        logs.initalize();//initalize logger
        logs.info('Server starting');//log server start
        logs.info('Running on port ', port);
        logs.info('Process ID: ', process.pid);
        logs.info('Process path: ', process.cwd());
        //database.initalize();//initalize database
    } catch (error) {
        logs.error('Catastrophy on server start: ', error);
    }
})//Listen for requests, this starts the server

//bind root path to /www folder
app.use(express.static('www')).listen(() => { logs.info('Static files served from ', process.cwd(), '/www'); });

app.get('/get/test', (req, res) => {//test get
    try {
        logs.info('test get');
        req.on('data', function (data) {
            logs.info('got: ', data);
            res.end(JSON.stringify({ testget: "test get data received" }));
        });
        //res.writeHead(200, { 'Content-type': 'application/json' });
        res.send(JSON.stringify({ test: 'test get is okay' }));
    } catch (error) {
        logs.error('Catastrophy on test get: ', err);
    }
});

app.post('/post/test', (req, res) => {//test post
    //receive more data than a get
    try {
        logs.info('test post to server');
        req.on('data', function (data) {
            logs.info('Posted : ', JSON.parse(data));
            res.end(JSON.stringify({ test: "test post received" }));
        });
    } catch (error) {
        logs.error('Catastrophy on test post: ', err);
    }
});

logs.info('Making API request to LandAirSea...');
logs.info('Using credentials:', credentials.LandAirSea);
axios.post('https://gateway.landairsea.com/Track/Validate', credentials.LandAirSea).then(response => {
    // Handle the successful response
    console.log('API Response:', response.data);

    // The response data will likely contain the account details, e.g.:
    /*
    {
        "accountid": 0,
        "Accountnum": "1234567890",
        // ... potentially other fields
    }
    */
}).catch(error => {
    // Handle errors (e.g., network issues, 4xx/5xx status codes)
    if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error Response Data:', error.response.data);
        console.error('Error Status:', error.response.status);
    } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
    } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
    }
});
