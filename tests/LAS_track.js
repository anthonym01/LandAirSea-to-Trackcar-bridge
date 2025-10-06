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
                config.traccar.url_webui + '/api/session',
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
        { headers: { 'ClientId': config.LandAirSea.clientToken } }
    ).then(responseLAS => {//pass data to traccar
        // Handle the successful response
        console.log('LAND AIR SEA API Response:', responseLAS.data);
        /* Example data from LAS
            username: 'something',
            devicedetails: [
                {
              deviceId: '0002060709',
              name: 'BMW 116i',
              notes: '',
              latitude: 0.4567725832264,
              longitude: -0.8930006667972,
              lastlocation: 'Da ocean',
              speed_kmh: 0,
              heading: 93,
              elevation: 279,
              group: 'Tracking',
              battery: 100,
              voltage: -1,
              isstopped: false,
              is_cell_assist: false,
              is_wired: false,
              is_led_on: true,
              has_tamper: false,
              cellularstrength: 15,
              satellitestrength: 9,
              temperature: null,
              interval: 180,
              lftminutes: 0,
              icon: 'https://portal.gps-tracking.com/imagery/mapicons/red-car/red-car-90.png',
              vin: '',
              usertime: '10/05/2025 11:01:08 PM',
              utctime: '10/06/2025 4:01:08 AM'
            }
        ]
            */

        axios.defaults.headers.common['Authorization'] = 'Bearer ' + traccarSession.token;//set traccar cookie

        console.log('Posting to Traccar for device ID:', responseLAS.data.devicedetails[1].deviceId);

        //const traccar_protocol_port = 5055;

        // Replace with your actual server URL, or use config.traccar.url if it includes the port
        //const server_base_url = config.traccar.url.replace(/:\d+/, `:${traccar_protocol_port}`);

        // translate gps data to traccar format
        const gpsData = {
            id: Number(responseLAS.data.devicedetails[1].deviceId), // The unique ID you set for the device
            lat:responseLAS.data.devicedetails[1].latitude,
            lon: responseLAS.data.devicedetails[1].longitude,
            timestamp: Date.now(), // Current time in milliseconds
            speed: responseLAS.data.devicedetails[1].speed_kmh * 0.539957, // in knots
            altitude: responseLAS.data.devicedetails[1].elevation, // in meters
            valid: true,
            batt: responseLAS.data.devicedetails[1].battery // battery level percentage
        };

        axios.get(
            `${config.traccar.url_OsmAndport}/`, // The path is just the root '/'
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
