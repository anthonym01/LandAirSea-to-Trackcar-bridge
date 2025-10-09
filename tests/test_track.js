const config = require('../configuration.json');
const axios = require('axios');
let traccarSession = null;

console.log("Tracking with configuration: ", config);

async function track() {//main tracking function prototype

    //login to traccar if no session
    if (!traccarSession || traccarSession == null) {
        try {
            console.log(`Attempt Traccar login to ${config.traccar.url_webui} @ ${new Date().toISOString()} with user ${config.traccar.username}`);

            const params = new URLSearchParams();
            params.append('email', config.traccar.username);
            params.append('password', config.traccar.password);

            const response = await axios.post(
                config.traccar.url_webui + '/api/session',
                params.toString() // Pass the URL-encoded string
            );

            traccarSession = response.data;
            console.log('Traccar login successful:', traccarSession);
        } catch (error) {
            console.error('Traccar login error:', error.message);
            console.log('Check Traccar URL, username, and password in configuration.json, remember to include http or https in the URL along with any port number if needed.');
            return; // Exit the function if login fails
        }
    }

    //reset axios headers to default
    axios.defaults.headers.common = {};//set traccar cookie later

    //Pull post from land air sea
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
            console.log(`@ ${new Date().toISOString()}`);
            console.log(`----------------------------------------------------`);
            console.log(`Device ID: ${device.deviceId}`);
            console.log(`Lattitude: ${device.latitude}`);
            console.log(`longitude: ${device.longitude}`);
            console.log(`Speed (km/h): ${device.speed_kmh}`);
            console.log(`Battery: ${device.battery}%`);
            console.log(`voltage: ${device.voltage}V`);

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

            axios.get(config.traccar.url_OsmAndport, { params: gpsData }).then(responsefromTraccar => {
                console.log(`Successfully updated GPS data for device ${gpsData.id}. Status: ${responsefromTraccar.status}`);

            }).catch(error => {
                console.error(`Error sending GPS data: ${error.message}`);
            });
        });
    }).catch(error => {

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
}

track();
setInterval(() => { track() }, 60000);
