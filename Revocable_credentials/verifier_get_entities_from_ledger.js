const gettheschema = require('./get_schema.js');
const getthedef = require('./get_def.js');
const getrevregdef = require('./get_rev_reg_def.js');
const getrevreg = require('./get_rev_reg.js');
async function verifierGetEntitiesFromLedger(poolHandle, verifierdid, identifiers, actor,timestampOfProof) {
    let schemas = {};
    let credDefs = {};
    let revRegDefs = {};
    let revRegs = {};

    for(let referent of Object.keys(identifiers)) {
        let item = identifiers[referent];
        //console.log(`"${actor}" -> Get Schema from Ledger`);
        let [schemaId, schema] = await gettheschema.getSchema(poolHandle, verifierdid, item['schema_id']);
        schemas[schemaId] = schema;

        //console.log(`"${actor}" -> Get Claim Definition from Ledger`);
        let [creddefId,creddef] = await getthedef.getCredDef(poolHandle, verifierdid, item['cred_def_id']);
        credDefs[creddefId] = creddef;

        //if (item.rev_reg_seq_no) {
            revRegDefId = item["rev_reg_id"]
            revRegDef = await getrevregdef.getRevocRegDef(poolHandle,verifierdid,revRegDefId)
            revRegDefs[revRegDefId] = revRegDef
            
            revRegValue = await getrevreg.getRevocReg(poolHandle,verifierdid,revRegDefId,timestampOfProof)
            revRegs[revRegDefId] = {}
            revRegs[revRegDefId][timestampOfProof] = revRegValue
        //}
    }

    return {schemas, credDefs, revRegDefs, revRegs};
}
module.exports = {
    verifierGetEntitiesFromLedger
}