const indy = require('indy-sdk');
async function VerifyProof(proofRequest,proofData,schemasJson,credDefsJson,revocRefDefsJson,revocRegsJson){
    const isValid = await indy.verifierVerifyProof(
        proofRequest,
        proofData,
        schemasJson,
        credDefsJson,
        revocRefDefsJson,
        revocRegsJson
    );
    return isValid
}
module.exports = {
    VerifyProof
}