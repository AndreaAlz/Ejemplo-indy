const indy = require('indy-sdk');
async function sendNym(poolHandle, walletHandle, Did, newDid, newKey, role) {
    let nymRequest = await indy.buildNymRequest(Did, newDid, newKey, null, role);
    return await indy.signAndSubmitRequest(poolHandle, walletHandle, Did, nymRequest);
}
module.exports = {
    sendNym
}