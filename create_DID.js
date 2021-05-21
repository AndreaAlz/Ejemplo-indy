//Creación de wallet y DID
const indy = require ('indy-sdk');
async function createWalletDid(name, pass){
    const config = {
        id: name
    };
    const credential = {
        key: pass
    };
    try {
        await indy.createWallet(config,credential);
    } catch (err) {
        if (err.message !== "WalletAlreadyExistsError"){
            throw e;
        }
    }
    let wh = await indy.openWallet(config,credential);
    const [did, verkey] = await indy.createAndStoreMyDid(wh,{});
    console.log("DID: " +did);
    console.log("VERKEY: " +verkey);
    return { did, verkey, wh}
    
}
module.exports = {
    createWalletDid
}