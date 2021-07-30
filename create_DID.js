//Creación de wallet y DID
const indy = require ('indy-sdk');
async function createDid(wh){
    return await indy.createAndStoreMyDid(wh,{});
    //return {did, verkey}
}
module.exports = {
    createDid
}