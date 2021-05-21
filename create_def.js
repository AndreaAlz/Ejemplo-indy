const indy = require('indy-sdk');
async function createdef(issuerWallet,issuerDid,readedSchema){
    try{
    const [id, def] = await indy.issuerCreateAndStoreCredentialDef(
        issuerWallet,
        issuerDid,
        readedSchema,
        'TAG1',
        'CL',
        '{"support_revocation": false}'
        );
    return {id,def}
    } catch(e){
        throw e;
    }
}
module.exports = {
    createdef
}