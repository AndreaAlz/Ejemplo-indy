const indy = require('indy-sdk');
async function getCredDef(poolHandle, did, creddefId) {
    let getCredDefRequest = await indy.buildGetCredDefRequest(did, creddefId);
    let getCredDefResponse = await indy.submitRequest(poolHandle, getCredDefRequest);
    return await indy.parseGetCredDefResponse(getCredDefResponse);
    //return {parseddefid,parseddef}
}
module.exports = {
    getCredDef
}