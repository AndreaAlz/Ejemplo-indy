const util = require('./util.js');
const indy = require('indy-sdk');
async function Tailswriter(){
    const tailsWriterConfig = {'base_dir': util.getPathToIndyClientHome() + "/tails", 'uri_pattern': ''}
    const tailsWriter = await indy.openBlobStorageWriter('default', tailsWriterConfig)
    return tailsWriter
}
module.exports = {
    Tailswriter
}