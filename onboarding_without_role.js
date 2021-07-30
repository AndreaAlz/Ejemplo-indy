const indy = require('indy-sdk');
const wallet = require('./create_wallet.js');
const didnormal = require('./create_DID.js');
//const sendnymwithoutroletransaction = require('./send_nym_without_role.js');
const sendnymtransaction = require('./send_nym_transaction.js');

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////                   3. PROCESO ONBOARDING                      ////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
async function OnboardingWithoutRole(Actorwithrole, Holder, Verifier, VerifierWalletConfig, VerifierWalletCredential){
    //3.1 EL HOLDER SE CREA UN DID QUE UTILIZARÁ PARA COMUNICARSE CON EL OTRO ACTOR.
    const [FromHolderToDid,FromHolderToverkey] =  await didnormal.createDid(Holder.wh);

    //3.2  EL HOLDER CREA UN REQUEST PARA EL STEWARD
    //let ActornormalRequest = await indy.buildNymRequest(Holder.didForAFM, FromHolderToDid, FromHolderToverkey, null, null);
    //console.log("ACTOR NORMAL REQUEST")
    //console.log(ActornormalRequest)
    //let realRequest = await indy.appendRequestEndorser(ActornormalRequest, Actorwithrole.did)
    //console.log(" ")
    //console.log("REQUEST REAL")
    //console.log(realRequest)
    //let ActornormalsignedRequest= await indy.multiSignRequest(Holder.wh, Holder.didForAFM, realRequest ) 
    //console.log(" ")
    //console.log("Signed real request")
    //console.log(ActornormalsignedRequest)

    //3.2 EL STEWARD O TRUST ANCHOR REALIZA UNA TRANSACCIÓN NYM A LA RED PARA REGISTRAR EL DID Y VERKEY DEL HOLDER.
    //resultadoregistrodeactorsinrol = await sendnymwithoutroletransaction.SendNymWithoutRole(Actorwithrole.poolHandle,Actorwithrole.wh, Actorwithrole.did,ActornormalsignedRequest)
    //console.log("SEND NYM WITHOUT ROLE")
    //console.log(resultadoregistrodeactorsinrol)
    resultadoregistro = await sendnymtransaction.sendNym(Actorwithrole.poolHandle,Actorwithrole.wh, Actorwithrole.did,FromHolderToDid, FromHolderToverkey,null)
    
    //3.3 EL HOLDER CREA UNA SOLICITUD DE CONEXIÓN
    nonce1 = await indy.generateNonce();
    Holder.connectionRequest = {
        'did': FromHolderToDid ,
        'nonce': nonce1
    }
    //EL holder le envía la solicitud a el verifier.
    Verifier.connectionRequest = Holder.connectionRequest
  
    //3.4 EL VERIFIER SE CREA UN DID PARA COMUNICARSE CON EL HOLDER
    Verifier.wh = await wallet.createWallet(VerifierWalletConfig,VerifierWalletCredential);
    [FromVerifierToDid,FromVerifierToverkey] = await didnormal.createDid(Verifier.wh);
    

    //3.5 EL VERIFIER CREA UN CONNECTION RESPONSE
    Verifier.connectionResponse = JSON.stringify({
        'did': FromVerifierToDid,
        'verkey': FromVerifierToverkey,
        'nonce': Verifier.connectionRequest['nonce']
    })

    //3.6 EL VERIFIER CIFRA LA RESPUESTA
    //Para cifrar la respuesta primero necesita la clave pública del Holder
    Verifier.HoldersVerkeyForActornormal = await indy.keyForDid(Verifier.poolHandle,Verifier.wh, Verifier.connectionRequest['did']);
   
    //Ya puede utilizar la clave pública del Holder para cifrar la respuesta de conexión.
    Verifier.anoncryptedConnectionResponse = await indy.cryptoAnonCrypt(Verifier.HoldersVerkeyForActornormal, Buffer.from(Verifier.connectionResponse, 'utf8'));
    //El Verifier le envía la respuesta cifrada al Holder
    Holder.anoncryptedConnectionResponse = Verifier.anoncryptedConnectionResponse
    
    //3.7 EL HOLDER DESCIFRA LA RESPUESTA CON SU CLAVE PRIVADA
    Holder.decryptedConnectionResponse = JSON.parse(Buffer.from(await indy.cryptoAnonDecrypt(Holder.wh, FromHolderToverkey,  Holder.anoncryptedConnectionResponse)));
    //3.8 EL HOLDER AUTENTICA AL OTRO ACTOR
    if ( Holder.connectionRequest['nonce'] !== Holder.decryptedConnectionResponse['nonce']) {
        throw Error("Los nonces no coinciden");
    }

    //3.9 EL STEWARD ENVÍA EL DID Y VERKEY DEL VERIFIER A LA RED MEDIANTE UNA TRANSACCIÓN NYM
    resultadoregistro2 = await sendnymtransaction.sendNym(Actorwithrole.poolHandle,Actorwithrole.wh, Actorwithrole.did, Holder.decryptedConnectionResponse['did'], Holder.decryptedConnectionResponse['verkey'], null)
    return [FromHolderToDid,FromHolderToverkey,FromVerifierToDid,FromVerifierToverkey,Verifier.connectionRequest]
}
module.exports = {
    OnboardingWithoutRole
}