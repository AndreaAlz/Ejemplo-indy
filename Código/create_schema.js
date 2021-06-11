const indy = require('indy-sdk');
function randomVersion() {
    return "1." + (new Date().getTime()%100000).toString()
}
async function createSchema(issuerDid,name,attrNames){
    const version = randomVersion();
    try{
        return await indy.issuerCreateSchema(
            issuerDid,
            name,
            version,
            attrNames
        );
    //return {schemaId,schema}
    } catch(e){
        throw e;
    }
  
}
module.exports = {
    createSchema
}