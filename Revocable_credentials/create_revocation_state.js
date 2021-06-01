const indy = require('indy-sdk');
async function RevState(blobStorageReaderHandle, revRegDef, revRegDelta, timestamp, revId){
    const revState = await indy.createRevocationState(blobStorageReaderHandle, revRegDef, revRegDelta, timestamp, revId)
    return revState
}
module.exports = {
    RevState
}