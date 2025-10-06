const credentials = require('../credentials.json');
const axios = require('axios');
console.log("Validating credentials: ", credentials.LandAirSea);

if (!credentials.LandAirSea.clientToken || credentials.LandAirSea.clientToken.length != 36) {
    console.error("Invalid clientToken. It should be a 36-character string.");
}


axios.post(
    'https://gateway.landairsea.com/Track/Validate',
    credentials.LandAirSea,
    //{ headers: { 'ClientId': credentials.LandAirSea.ClientId } }
).then(response => {
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
