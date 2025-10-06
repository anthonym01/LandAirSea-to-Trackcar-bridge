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
    ).then(responseLAS => {//pass data to traccar
        // Handle the successful response
        console.log('LAND AIR SEA API Response:', responseLAS.data);

        axios.defaults.headers.common['Authorization'] = 'Bearer ' + traccarSession.token;//set traccar cookie

        console.log('Posting to Traccar for device ID:', responseLAS.data.devicedetails[1].deviceId);

        const traccar_protocol_port = 5055;

        // Replace with your actual server URL, or use config.traccar.url if it includes the port
        const server_base_url = config.traccar.url.replace(/:\d+/, `:${traccar_protocol_port}`);

        // translate gps data to traccar format
        const gpsData = {
            id: Number(responseLAS.data.devicedetails[1].deviceId), // The unique ID you set for the device
            lat: 34.0522,
            lon: -118.2437,
            timestamp: Date.now(), // Current time in milliseconds
            speed: 20, // in knots
            altitude: 100, // in meters
            valid: true,
            batt: 95
        };

        axios.get(
            `${server_base_url}/`, // The path is just the root '/'
            {
                params: gpsData // Axios will automatically convert this object to a query string
            }
        ).then(responseTraccar => {
            console.log(`Successfully posted GPS data for device ${gpsData.id}. Status: ${responseTraccar.status}`);

        }).catch(error => {
            console.error(`Error sending GPS data: ${error.message}`);
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
