const indy = require('indy-sdk');
async function StoreCredential(holderwh,credReqMetadata,credentialData,def,AFMrevregdef){
    const id = await indy.proverStoreCredential(
        holderwh,
        null,
        credReqMetadata,
        credentialData,
        def,
        AFMrevregdef
    );
return id
}
module.exports = {
    StoreCredential
}