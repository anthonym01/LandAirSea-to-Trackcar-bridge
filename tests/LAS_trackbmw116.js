const credentials = require('../credentials.json');
const axios = require('axios');

console.log("Validating credentials: ", credentials.LandAirSea);

if (!credentials.LandAirSea.clientToken || credentials.LandAirSea.clientToken.length != 36) {
    console.error("Invalid clientToken. It should be a 36-character string.");
}
