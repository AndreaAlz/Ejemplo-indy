const indy = require('indy-sdk');
async function CreateCredOffer(issuerWallet,credDefId){
    const credOffer = await indy.issuerCreateCredentialOffer(
        issuerWallet,
        credDefId
    );
    return credOffer
}
module.exports = {
    CreateCredOffer
}