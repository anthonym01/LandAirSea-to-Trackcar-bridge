const config = require('../configuration.json');
const axios = require('axios');
let traccarSession = null;

console.log("Tracking with configuration: ", config);

async function track() {

    if (!traccarSession || traccarSession == null) {
        //login to traccar
        try {
            const params = new URLSearchParams();
            params.append('email', config.traccar.username);
            params.append('password', config.traccar.password);

            // 2. Send the request with the form data
            const response = await axios.post(
                config.traccar.url + '/api/session',
                params.toString() // Pass the URL-encoded string
            );

            traccarSession = response.data;
            console.log('Traccar login successful:', traccarSession);
        } catch (error) {
            console.error('Traccar login error:', error.message);
            return; // Exit the function if login fails
        }
    }
    //reset axios headers to default
    axios.defaults.headers.common = {};//set traccar cookie later

    //Pull post from land air sea
    axios.post(
        'https://gateway.landairsea.com/Track/MyDevices',
        config.LandAirSea,
        //{ headers: { 'ClientId': config.LandAirSea.ClientId } }
    ).then(response => {//pass data to traccar
        // Handle the successful response
        console.log('LAND AIR SEA API Response:', response.data);

        axios.defaults.headers.common['Authorization'] = 'Bearer ' + traccarSession.token;//set traccar cookie
        console.log('Posting to Traccar for device ID:', response.data.devicedetails[1].deviceId);
        axios.post(config.traccar.url + '/api/devices', {

            location: {
                timestamp: "2000-01-01T00:00:00.000Z", // time in ISO format
                coords: {
                    latitude: 0.0,                       // latitude in degrees
                    longitude: 0.0,                      // longitude in degrees
                    accuracy: 0,                         // accuracy in meters
                    speed: 0,                            // speed in m/s
                    heading: 0,                          // heading in degrees
                    altitude: 0                          // altitude in meters
                },
                is_moving: false,                      // motion state
                odometer: 0,                           // device-side odometer value
                event: "motionchange",                 // event type
                battery: {
                    level: 1,                            // battery level as a decimal value from 0 to 1
                    is_charging: false                   // charging state
                },
                activity: {
                    type: 'still'                      // activity type; examples are 'still', 'walking', 'in_vehicle'
                },
                extras: {}
            },
            device_id: response.data.devicedetails[1].deviceId                     // device identifier
        }).then(responsetraccar => {
            console.log('Traccar API Response:', responsetraccar.data);
        }).catch(error => {
            console.error('Traccar Error:', error.message);
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
