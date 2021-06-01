const indy = require('indy-sdk');
async function createdef(issuerWallet,issuerDid,readedSchema,credDefConfig){
    try{
        return await indy.issuerCreateAndStoreCredentialDef(
            issuerWallet,
            issuerDid,
            readedSchema,
            "tag1",
            "CL",
            credDefConfig
        );
        //return {id,def}
    } catch(e){
        throw e;
    }
}
module.exports = {
    createdef
}