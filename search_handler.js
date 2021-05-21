const indy = require('indy-sdk');
async function SearchHandler(holderwh,proofRequest){
    let searchHandler = await indy.proverSearchCredentialsForProofReq(
        holderwh,
        proofRequest,
        null
    );
    return searchHandler
}
module.exports = {
    SearchHandler
}