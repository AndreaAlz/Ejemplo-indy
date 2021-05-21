//Creación de wallet y DID con rol Steward

const indy = require ('indy-sdk');
async function createWalletDidSteward(name, pass){
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
    let stewardDidInfo = {
        'seed': '000000000000000000000000Steward1'
    };
    const [did, verkey] = await indy.createAndStoreMyDid(wh,stewardDidInfo);
    console.log("DID con rol de Steward: " +did);
    console.log("VERKEY: " +verkey);
    return {did, verkey, wh}
}
module.exports = {
    createWalletDidSteward
}