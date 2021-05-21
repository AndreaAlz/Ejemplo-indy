const indy = require('indy-sdk');
async function CreateCred(issuerwh,credOffer,credReq,credentialValues){
    let [credentialData] = await indy.issuerCreateCredential(
        issuerwh,
        credOffer,
        credReq,
        credentialValues,
        null,
        -1
    );
    return credentialData
}
module.exports = {
    CreateCred
}