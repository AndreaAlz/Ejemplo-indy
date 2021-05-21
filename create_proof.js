const indy = require('indy-sdk');
async function createProof(holderwh,proofRequest,requestedCredentials,masterSecretId,schemasJson,credDefsJson,revocStatesJson){
    try {
        finalProofJson = await indy.proverCreateProof(
            holderwh,
            proofRequest,
            requestedCredentials,
            masterSecretId,
            schemasJson,
            credDefsJson,
            revocStatesJson
        );
    } catch (err) {
        console.error("HOLDER: FALLO AL GENERAR LA PRUEBA")
        console.error(JSON.stringify(err, null, 4))
        console.error(err)
    }
    return finalProofJson;
    
}
module.exports = {
    createProof
}