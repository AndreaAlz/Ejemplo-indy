const indy = require('indy-sdk');
async function GetRevocRegDelta(poolHandle, did, revRegDefId, from, to) {
    const getRevocRegDeltaRequest = await indy.buildGetRevocRegDeltaRequest(did, revRegDefId, from, to)
    const getRevocRegDeltaResponse = await indy.submitRequest(poolHandle, getRevocRegDeltaRequest)
    return  await indy.parseGetRevocRegDeltaResponse(getRevocRegDeltaResponse)
    //return {revRegDelta, timestamp}
}
module.exports = {
    GetRevocRegDelta
}