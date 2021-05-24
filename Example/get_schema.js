const indy = require('indy-sdk');
async function getSchema(poolHandle, readerdid, schemaId) {
    let getSchemaRequest = await indy.buildGetSchemaRequest(readerdid, schemaId);
    let getSchemaResponse = await indy.submitRequest(poolHandle, getSchemaRequest);
    const parsed = await indy.parseGetSchemaResponse(getSchemaResponse);
    return parsed;
}
module.exports = {
    getSchema
}