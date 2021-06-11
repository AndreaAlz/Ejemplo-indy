const indy = require('indy-sdk');
const didnormal = require('./create_DID.js');
const sendnymtransaction = require('./send_nym_transaction.js');
async function GetVerinym(Actorwithrole, Actornormal, role, Actorwithroledecryptedconnectionresponse){
     //4.1 EL ACTOR CREA SU DID Y GUARDA LA INFORMACIÓN EN UN JSON
     
     let [didActornormal, verkeyActornormal] = await didnormal.createDid(Actornormal.wh);
     Actornormal.did = didActornormal
     Actornormal.verkey = verkeyActornormal
     Actornormal.didInfo = JSON.stringify({
         'did': Actornormal.did,
         'verkey': Actornormal.verkey
     });
     
     //4.2 EL ACTOR CIFRA LA INFORMACIÓN
     Actornormal.authcryptedDidInfo = await indy.cryptoAuthCrypt(Actornormal.wh, Actornormal.FromActornormalToverkey,Actornormal.ActorwithrolesVerkeyForActornormal, Buffer.from(Actornormal.didInfo, 'utf8'));
     //El actor envía la información cifrada al Steward
     Actorwithrole.authcryptedDidInfo =  Actornormal.authcryptedDidInfo
     
     //4.3 EL STEWARD DESCIFRA EL MENSAJE
     const [senderkey, authdecryptedDidInfo] = await indy.cryptoAuthDecrypt(Actorwithrole.wh, Actorwithrole.FromStewardToverkey, Buffer.from( Actorwithrole.authcryptedDidInfo));
     Actorwithrole.senderkey = senderkey
     Actorwithrole.authdecryptedDidInfo = authdecryptedDidInfo
     let authdecryptedDidInfoJson = JSON.parse(Buffer.from( Actorwithrole.authdecryptedDidInfo));
     
     
     //4.4 EL STEWARD VERIFICA QUE SE TRATA DE FABER
     //Actornormal.ActorwithrolesVerkeyForActornormal = await indy.keyForDid(Actornormal.poolHandle,Actornormal.wh, Actornormal.connectionRequest['did']);
     let ActornormalverkeyforSteward = await indy.keyForDid(Actorwithrole.poolHandle, Actorwithrole.wh,Actorwithroledecryptedconnectionresponse['did']); //¿DE DONDE SACA EL STEWARD EL DID DE AFM??
     if (ActornormalverkeyforSteward !== Actorwithrole.senderkey) {
         throw Error("Verkey is not the same");
     }
     
    
     //4.5 EL STEWARD REGISTRA EN LA RED EL DID Y VERKEY DEL ACTOR CON EL ROL TRUST ANCHOR
     resultadoregistrosteward2 = await sendnymtransaction.sendNym(Actorwithrole.poolHandle,Actorwithrole.wh, Actorwithrole.did, authdecryptedDidInfoJson['did'], authdecryptedDidInfoJson['verkey'], role)
    return [Actornormal.did,Actornormal.verkey]
    }
module.exports = {
    GetVerinym
}