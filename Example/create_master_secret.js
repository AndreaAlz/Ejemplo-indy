const indy = require('indy-sdk');
async function createMasterSecret(holderwh){
    const masterSecretId = await indy.proverCreateMasterSecret(
        holderwh,
        null
    );
    return masterSecretId
}
module.exports = {
    createMasterSecret
}