const indy = require('indy-sdk');
async function SendRevocRegDef(poolHandle, wallet, did, revRegDef) {
    const revocRegRequest = await indy.buildRevocRegDefRequest(did, revRegDef)
    const response = await indy.signAndSubmitRequest(poolHandle, wallet, did, revocRegRequest)
    return response
}
module.exports = {
    SendRevocRegDef
}