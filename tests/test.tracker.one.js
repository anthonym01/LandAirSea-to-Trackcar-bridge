//https://docs.trackerone.vip/#tag/1.Authentication

const config = require('../configuration.json');
const axios = require('axios');
let traccarSession = null;

console.log("Test tracker.one Tracking with configuration: ", config);

async function track() {//main tracking function prototype
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

    axios.defaults.headers.common = {};//set traccar cookie later

    axios.post('https://open.trackerone.vip/api/auth',
        {
            appid: "samuelmatheson15@gmail.com",
            time: Math.floor(Date.now()), // Current Unix timestamp in seconds
            signature: "test"
        }
    ).then(responseT1 => {
        console.log("Response from tracker.one auth: ", responseT1.data);
    }).catch(error => {
        console.error('tracker.one auth error:', error.message);
    });//pass data to traccar
}

track();