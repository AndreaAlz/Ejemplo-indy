const indy = require('indy-sdk');
async function StoreCredential(holderwh,credReqMetadata,credentialData,def){
    const id = await indy.proverStoreCredential(
        holderwh,
        null,
        credReqMetadata,
        credentialData,
        def,
        null
    );
return id
}
module.exports = {
    StoreCredential
}