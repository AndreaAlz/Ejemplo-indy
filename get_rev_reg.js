const indy = require('indy-sdk');
async function getRevocReg(poolHandle, did, revRegDefId, timestamp_) {
    const getRevocRegRequest = await indy.buildGetRevocRegRequest(did, revRegDefId, timestamp_)
    const  getRevocRegResponse  = await indy.submitRequest(poolHandle, getRevocRegRequest)
    const [, revReg, timestamp] = await indy.parseGetRevocRegResponse(getRevocRegResponse)
    return revReg
}
module.exports = {
    getRevocReg
}
