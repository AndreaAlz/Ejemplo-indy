const indy = require('indy-sdk');
async function sendSchema(poolHandle, walletHandle, issuerDid, schema) {
    const schemaRequest = await indy.buildSchemaRequest(issuerDid, schema);
    console.log("contenido del objeto schema request:")
    console.log(JSON.stringify(schemaRequest, null, 4))
    return await indy.signAndSubmitRequest(poolHandle, walletHandle, issuerDid, schemaRequest)
}
module.exports = {
    sendSchema
}