const gettheschema = require('./get_schema.js');
const getthedef = require('./get_def.js');
async function verifierGetEntitiesFromLedger(poolHandle, verifierdid, identifiers, actor) {
    let schemas = {};
    let credDefs = {};
    let revRegDefs = {};
    let revRegs = {};

    for(let referent of Object.keys(identifiers)) {
        let item = identifiers[referent];
        console.log(`"${actor}" -> Get Schema from Ledger`);
        let [schemaId, schema] = await gettheschema.getSchema(poolHandle, verifierdid, item['schema_id']);
        schemas[schemaId] = schema;

        console.log(`"${actor}" -> Get Claim Definition from Ledger`);
        let parseddefinition = await getthedef.getCredDef(poolHandle, verifierdid, item['cred_def_id']);
        credDefs[parseddefinition.parseddefid] = parseddefinition.parseddef;;

        if (item.rev_reg_seq_no) {
            // TODO Get Revocation Definitions and Revocation Registries
        }
    }

    return {schemas, credDefs, revRegDefs, revRegs};
}
module.exports = {
    verifierGetEntitiesFromLedger
}