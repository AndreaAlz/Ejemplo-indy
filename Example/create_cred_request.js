const indy = require('indy-sdk');
async function CreateCredRequest(holderwh,holderdid,credOffer,def,masterSecretId){
    const [credReq, credReqMetadata] = await indy.proverCreateCredentialReq(
        holderwh,
        holderdid,
        credOffer,
        def,
        masterSecretId);
    return {credReq,credReqMetadata};
}
module.exports = {
    CreateCredRequest
}