const indy = require('indy-sdk');
async function sendCredDef(poolHandle, walletHandle, did, credDef) {
    let credDefRequest = await indy.buildCredDefRequest(did, credDef);
    return await indy.signAndSubmitRequest(poolHandle, walletHandle, did, credDefRequest);
}

module.exports = {
    sendCredDef
}