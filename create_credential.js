const indy = require('indy-sdk');
async function CreateCred(issuerwh,credOffer,credReq,credentialValues,revRegId,blobStorageReaderHandle){
    return await indy.issuerCreateCredential(
        issuerwh,
        credOffer,
        credReq,
        credentialValues,
        revRegId,
        blobStorageReaderHandle
    );
    //return {credentialData,revId,revRegDelta}
}
module.exports = {
    CreateCred
}