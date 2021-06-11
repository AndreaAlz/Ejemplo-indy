//Creación de wallet y DID con rol Steward

const indy = require ('indy-sdk');
async function createDidSteward(wh){
    let stewardDidInfo = {
        'seed': '000000000000000000000000Steward1'
    };
    return await indy.createAndStoreMyDid(wh,stewardDidInfo);
    //return {did,verkey}
}
module.exports = {
    createDidSteward
}