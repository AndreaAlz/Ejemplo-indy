const indy = require('indy-sdk');
async function getCredDef(poolHandle, did, schemaId) {
    let getCredDefRequest = await indy.buildGetCredDefRequest(did, schemaId);
    let getCredDefResponse = await indy.submitRequest(poolHandle, getCredDefRequest);
    let [parseddefid,parseddef] = await indy.parseGetCredDefResponse(getCredDefResponse);
    return {parseddefid,parseddef}
}
module.exports = {
    getCredDef
}