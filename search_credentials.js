const indy = require('indy-sdk');
async function SearchCredentialsForProof(searchHandler){
    try {
        credentials = await indy.proverFetchCredentialsForProofReq(searchHandler, 'attr1_referent', 10)
        credForAttr1 = credentials[0]['cred_info'];
    
        credentials = await indy.proverFetchCredentialsForProofReq(searchHandler, 'attr2_referent', 10)
        credForAttr2 = credentials[0]['cred_info'];
    
        credentials = await indy.proverFetchCredentialsForProofReq(searchHandler, 'attr3_referent', 10)
        credForAttr3 = credentials[0]['cred_info'];
        //credentials = await indy.proverFetchCredentialsForProofReq(searchHandler, 'predicate1_referent', 10)
        //credForPredicate1 = credentials[0]['cred_info'];
        // se cierra el acceso a la busqueda
        await indy.proverCloseCredentialsSearchForProofReq(searchHandler);
    } catch (err) {
        console.error("HOLDER: FALLO INTERNO AL BUSCAR EN LA WALLET")
        console.error(JSON.stringify(err, null, 4))
        console.error(err)
    }
    return {credForAttr1,credForAttr2,credForAttr3}    
}
module.exports = {
    SearchCredentialsForProof
}