const indy = require ('indy-sdk');
async function createWallet(name, pass){
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
    return wh
}
module.exports = {
    createWallet
}