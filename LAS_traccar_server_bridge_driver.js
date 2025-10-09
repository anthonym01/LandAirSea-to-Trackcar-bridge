//'node Server.js'
//webpage for configuration and status
//bridge between LandAirSea API and Traccar server
//requires devices to be preconfigured in Traccar with matching device IDs

//Server configuration
const port = 8083;// 80, 443, 8083 nginx
const express = require('express');
const app = express();
const logs = require('./modules/logger');
const axios = require('axios');
const fs = require('fs');
let config = JSON.parse(fs.readFileSync('configuration.json'));
let updateinterval = null;
let traccarSession = null;

app.listen(port, () => {
    try {
        logs.initalize();//initalize logger
        logs.info('Server starting');//log server start
        setTimeout(() => {
            logs.info('Running on port ', port);
        logs.info('Process ID: ', process.pid);
        logs.info('Process path: ', process.cwd());
        }, 3000);//wait 3 seconds for splash
        
        track();
        updateinterval = setInterval(() => { track() }, 60000);
    } catch (error) {
        logs.error('Catastrophy on server start: ', error);
    }
})//Listen for requests, this starts the server

//bind root path to /www folder
app.use(express.static('www')).listen(() => { logs.info('Static files served from ', process.cwd(), '/www'); });
app.use(express.json());//for parsing application/json
app.use(express.urlencoded({ extended: true }));//for parsing application/x-www-form-urlencoded

async function track() {//main tracking function prototype

    //login to traccar if no session
    if (!traccarSession || traccarSession == null) {
        try {
            logs.info(`Attempt Traccar login to ${config.traccar.url_webui} @ ${new Date().toISOString()} with user ${config.traccar.username}`);

            const params = new URLSearchParams();
            params.append('email', config.traccar.username);
            params.append('password', config.traccar.password);

            const response = await axios.post(
                config.traccar.url_webui + '/api/session',
                params.toString() // Pass the URL-encoded string
            );

            traccarSession = response.data;
            logs.info('Traccar login successful:', traccarSession);
        } catch (error) {
            logs.error('Traccar login error:', error.message);
            logs.info('Check Traccar URL, username, and password in configuration.json, remember to include http or https in the URL along with any port number if needed.');
            return; // Exit the function if login fails
        }
    }

    //reset axios headers to default
    axios.defaults.headers.common = {};//set traccar cookie later

    //Pull post from land air sea
    logs.info(`Pulling data from LandAirSea @ ${new Date()}`);
    axios.post(
        'https://gateway.landairsea.com/Track/MyDevices',
        config.LandAirSea,
        { headers: { 'ClientId': config.LandAirSea.clientToken } }
    ).then(responseLAS => {//pass data to traccar
        /* 
        Example data from LAS:
        {
            username: 'something',
            devicedetails: [
                { deviceId, name, notes, latitude, longitude, lastlocation,            speed_kmh, heading, elevation, group, battery, voltage,              isstopped, is_cell_assist, is_wired, is_led_on, has_tamper,              cellularstrength,satellitestrength, temperature, interval,           lftminutes, icon, vin, usertime, utctime}
            ]
        } */

        //loop through devices in response
        responseLAS.data.devicedetails.forEach(device => {
            logs.info(`---------------------------------------------------------------`);
            logs.info(`@ ${new Date()}`);
            logs.info(`Device ID: ${device.deviceId}`);
            logs.info(`Lattitude: ${device.latitude}`);
            logs.info(`longitude: ${device.longitude}`);
            logs.info(`Speed (km/h): ${device.speed_kmh}`);
            logs.info(`Battery: ${device.battery}%`);
            logs.info(`voltage: ${device.voltage}V`);
            logs.info(`~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`);

            axios.defaults.headers.common['Authorization'] = 'Bearer ' + traccarSession.token;//set traccar cookie

            let charging = false;
            if (device.voltage != -1) { charging = true }

            const gpsData = {
                id: Number(device.deviceId), // The unique ID you set for the device
                lat: device.latitude,
                lon: device.longitude,
                timestamp: Date.now(), // Current time in milliseconds
                speed: device.speed_kmh * 0.539957, // in knots
                altitude: device.elevation, // in meters
                valid: true,
                batt: device.battery, // battery level percentage
                charge: charging // voltage level
            };

            //post data to traccar
            axios.get(config.traccar.url_OsmAndport, { params: gpsData }).then(responsefromTraccar => {
                logs.info(`Successfully updated GPS data for device ${gpsData.id}. Status: ${responsefromTraccar.status}`);

            }).catch(error => {
                logs.error(`Error sending GPS data: ${error.message}`);
                //attempt to login again next time
                traccarSession = null;
            });
        });
    }).catch(error => {

        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            logs.error('Error Response Data:', error.response.data);
            logs.error('Error Status:', error.response.status);
        } else if (error.request) {
            // The request was made but no response was received
            logs.error('No response received:', error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            logs.error('Error message:', error.message);
        }
    });
}