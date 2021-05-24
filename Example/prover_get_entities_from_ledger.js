const gettheschema = require('./get_schema.js');
const getthedef = require('./get_def.js');
async function proverGetEntitiesFromLedger(poolHandle, did, identifiers, actor) {
    let schemas = {};
    let credDefs = {};
    let revStates = {};

    for(let referent of Object.keys(identifiers)) {
        let item = identifiers[referent];
        console.log(`\"${actor}\" -> Get Schema from Ledger`);
        let [schemaId,schema] = await gettheschema.getSchema(poolHandle, did, item['schema_id']);
        schemas[schemaId] = schema;
        

        console.log(`\"${actor}\" -> Get Claim Definition from Ledger`);
        let parseddefinition = await getthedef.getCredDef(poolHandle, did, item['cred_def_id']);
        credDefs[parseddefinition.parseddefid] = parseddefinition.parseddef;

        if (item.rev_reg_seq_no) {
            // TODO Create Revocation States
        }
    
    }

    return {schemas,credDefs,revStates};
}
module.exports = {
    proverGetEntitiesFromLedger
}