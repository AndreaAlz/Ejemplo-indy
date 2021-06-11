const indy = require('indy-sdk');
const wallet = require('./create_wallet.js');
const didnormal = require('./create_DID.js');
const sendnymtransaction = require('./send_nym_transaction.js');
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////                   3. PROCESO ONBOARDING                      ////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
async function Onboarding(Actorwithrole, Actornormal, ActornormalWalletConfig, ActornormalWalletCredential){
    //3.1 EL STEWARD O TRUST ANCHOR SE CREA UN DID QUE UTILIZARÁ PARA COMUNICARSE CON EL OTRO ACTOR.
    const [FromActorwithroleToDid,FromActorwithroleToverkey] =  await didnormal.createDid(Actorwithrole.wh);
    Actorwithrole.FromStewardToDid = FromActorwithroleToDid
    Actorwithrole.FromStewardToverkey = FromActorwithroleToverkey
    
    //3.2 EL STEWARD O TRUST ANCHOR REALIZA UNA TRANSACCIÓN NYM A LA RED PARA REGISTRAR EL DID Y VERKEY CREADOS PARA EL OTRO ACTOR.
    resultadoregistro = await sendnymtransaction.sendNym(Actorwithrole.poolHandle,Actorwithrole.wh, Actorwithrole.did,Actorwithrole.FromStewardToDid, Actorwithrole.FromStewardToverkey,null)
    
    //3.3 EL STEWARD O TRUST ANCHOR CREA UNA SOLICITUD DE CONEXIÓN
    nonce1 = await indy.generateNonce();
    Actorwithrole.connectionRequest = {
        'did': Actorwithrole.FromStewardToDid ,
        'nonce': nonce1
    }
    //Steward o Trust Anchor le envía la solicitud a el otro actor.
    Actornormal.connectionRequest = Actorwithrole.connectionRequest
  
    //3.4 EL OTRO ACTOR SE CREA UN DID PARA COMUNICARSE CON EL STEWARD
    Actornormal.wh = await wallet.createWallet(ActornormalWalletConfig,ActornormalWalletCredential);
    [FromActornormalToDid,FromActornormalToverkey] = await didnormal.createDid(Actornormal.wh);
    Actornormal.FromActornormalToDid = FromActornormalToDid
    Actornormal.FromActornormalToverkey = FromActornormalToverkey

    //3.5 EL OTRO ACTOR CREA UN CONNECTION RESPONSE
    Actornormal.connectionResponse = JSON.stringify({
        'did':  Actornormal.FromActornormalToDid,
        'verkey': Actornormal.FromActornormalToverkey,
        'nonce': Actornormal.connectionRequest['nonce']
    })

    //3.6 EL OTRO ACTOR CIFRA LA RESPUESTA
    //Para cifrar la respuesta primero necesita la clave pública del Steward o Trust Anchor.
    Actornormal.ActorwithrolesVerkeyForActornormal = await indy.keyForDid(Actornormal.poolHandle,Actornormal.wh, Actornormal.connectionRequest['did']);
    //Ya puede utilizar la clave pública del Steward o Trust Anchor para cifrar la respuesta de conexión.
    Actornormal.anoncryptedConnectionResponse = await indy.cryptoAnonCrypt(Actornormal.ActorwithrolesVerkeyForActornormal, Buffer.from(Actornormal.connectionResponse, 'utf8'));
    //El actor le envía la respuesta cifrada al Steward o Trust Anchor.
    Actorwithrole.anoncryptedConnectionResponse = Actornormal.anoncryptedConnectionResponse
   
    //3.7 EL STEWARD O TRUST ANCHOR DESCIFRA LA RESPUESTA CON SU CLAVE PRIVADA
    Actorwithrole.decryptedConnectionResponse = JSON.parse(Buffer.from(await indy.cryptoAnonDecrypt(Actorwithrole.wh, Actorwithrole.FromStewardToverkey,  Actorwithrole.anoncryptedConnectionResponse)));
   
    //3.8 EL STEWARD AUTENTICA AL OTRO ACTOR
    if ( Actorwithrole.connectionRequest['nonce'] !== Actorwithrole.decryptedConnectionResponse['nonce']) {
        throw Error("Los nonces no coinciden");
    }

    //3.9 EL STEWARD ENVÍA EL DID Y VERKEY DEL OTRO ACTOR A LA RED MEDIANTE UNA TRANSACCIÓN NYM
    resultadoregistro2 = await sendnymtransaction.sendNym(Actorwithrole.poolHandle,Actorwithrole.wh, Actorwithrole.did, Actorwithrole.decryptedConnectionResponse['did'], Actorwithrole.decryptedConnectionResponse['verkey'], null)
    return [Actorwithrole.FromStewardToDid,Actorwithrole.FromStewardToverkey,Actornormal.FromActornormalToDid,Actornormal.FromActornormalToverkey,Actorwithrole.decryptedConnectionResponse]
}
module.exports = {
    Onboarding
}