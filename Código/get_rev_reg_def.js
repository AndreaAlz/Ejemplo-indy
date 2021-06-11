const indy = require('indy-sdk');
async function getRevocRegDef(poolHandle, did, revRegDefId) {
    const getRevocRegDefRequest = await indy.buildGetRevocRegDefRequest(did, revRegDefId)
    const  getRevocRegDefResponse  = await indy.submitRequest(poolHandle, getRevocRegDefRequest)
    const [, revRegDef] = await indy.parseGetRevocRegDefResponse(getRevocRegDefResponse)
    return revRegDef
}
module.exports = {
    getRevocRegDef
}