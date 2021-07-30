const indy = require('indy-sdk');
async function CreateAndStoreRevReg(issuerWallet,issuerDid, rvocRegDefTag, credDefId, rvocRegDefConfig, tailsWriter){
    return await indy.issuerCreateAndStoreRevocReg(issuerWallet, issuerDid, undefined, rvocRegDefTag, credDefId, rvocRegDefConfig, tailsWriter)
    //return {revRegId,revRegDef,revRegEntry}
}
module.exports = {
    CreateAndStoreRevReg
}