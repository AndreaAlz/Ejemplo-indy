const indy = require('indy-sdk');
async function SendRevocRegEntry(poolHandle, wallet, did, revRegDefId, revRegEntry) {
    const revocRegEntryRequest = await indy.buildRevocRegEntryRequest(did, revRegDefId, "CL_ACCUM", revRegEntry)
    const response = await indy.signAndSubmitRequest(poolHandle, wallet, did, revocRegEntryRequest)
    return response
}
module.exports = {
    SendRevocRegEntry
}