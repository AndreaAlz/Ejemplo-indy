const indy = require('indy-sdk');
const util = require('./util.js');
const poolconfig = require('./create_pool_config.js');
const wallet = require('./create_wallet.js');
const didnormal = require('./create_DID.js');
const didSteward = require('./create_DID_steward.js');
const schemacredential = require('./create_schema.js');
const sendtheschema = require('./send_schema.js');
const gettheschema = require('./get_schema.js');
const credentialdef = require('./create_def.js');
const sendthedef = require('./send_definition.js');
const createcredoffer = require('./create_cred_offer.js');
const createthemastersecret = require('./create_master_secret.js');
const getthedef = require('./get_def.js');
const createcredreq = require('./create_cred_request.js');
const encoder = require('./encode_cred_values.js');
const createthecredential = require('./create_credential.js');
const storethecredential = require('./store_credential.js');
const searchhandler = require('./search_handler.js');
const searchcredentials = require('./search_credentials.js');
const provergetentities = require('./prover_get_entities_from_ledger.js');
const createtheproof = require('./create_proof.js');
const verifiergetentities = require('./verifier_get_entities_from_ledger.js');
const verifyproof = require('./verifier_verify_proof.js');
const tailswriter = require('./tailsWriter.js');
const createandstoretherevreg = require('./create_and_store_revocation_registry.js');
const createrevocationstate = require('./create_revocation_state.js');
const sendrevregdef = require('./send_rev_reg_def.js');
const sendrevregentry = require('./send_rev_reg_entry.js');
const getrevregdef = require('./get_rev_reg_def.js');
const getrevregdelta = require('./get_rev_reg_delta.js');
const getrevreg = require('./get_rev_reg.js');
(async () => {
    const AFM = {}
    const TC = {}
    const cliente1 = {}
    const maquina1 = {}
    const actores = {"AFM": AFM ,"TC": TC, "cliente1": cliente1, "maquina1": maquina1}
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////                 1. CONFIGURACIÓN DEL BLOQUE GÉNESIS                   ///////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //Activamos el modo debug para tener más información de los errores que ocurran.
    //Creamos la cofiguración para conectarnos a la red (pool).
    console.log("CREANDO LA CONEXIÓN CON EL POOL...")
    for(let actor in actores){
        const poolName = actor
        await poolconfig.CreatePoolConfig(poolName)
        //Nos conectamos a la red (pool)
        console.log("abriendo conexión con el pool con nombre: ", poolName)
        let poolHandle = await indy.openPoolLedger(poolName);
        valor = actores[actor]
        valor.poolHandle = poolHandle
        console.log("pool handler id: ", valor.poolHandle);
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////               2. CREACIÓN DE WALLETS Y DIDS                  ////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //Creando wallet y DID con rol de Steward para AFM
    console.log(" ")
    console.log("CREANDO WALLETS Y DIDS PARA LOS ACTORES...")
    console.log("AFM: ");
    AFM.wh = await wallet.createWallet("AFM","0000");
    [AFM.did, AFM.verkey] = await didSteward.createDidSteward(AFM.wh);
    console.log("DID",AFM.did)
    console.log("VERKEY",AFM.verkey)
    //Creando wallet y DID con rol de Steward para Tecnalia Certificación (TC)
    console.log("Tecnalia Certificación: ");
    TC.wh = await wallet.createWallet("Tecnalia Certificación","1111");
    [TC.did,TC.verkey] = await didSteward.createDidSteward(TC.wh);
    console.log("DID",TC.did)
    console.log("VERKEY",TC.verkey)
    //Creando wallet y DID sin rol para el cliente
    console.log("Cliente1: ");
    cliente1.wh = await wallet.createWallet("cliente1","2222");
    [cliente1.did,cliente1.verkey] = await didnormal.createDid(cliente1.wh);
    console.log("DID",cliente1.did)
    console.log("VERKEY",cliente1.verkey)
    //Creando wallet y DID sin rol para la máquina
    console.log("Máquina1: ");
    maquina1.wh = await wallet.createWallet("maquina1","3333");
    [maquina1.did,maquina1.verkey] = await didnormal.createDid(maquina1.wh);
    console.log("DID",maquina1.did)
    console.log("VERKEY",maquina1.verkey)


    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////            3. CREACIÓN DE ESQUEMAS DE CREDENCIALES           ////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    console.log(" ")
    console.log("ISSUER CREANDO EL ESQUEMA DE CREDENCIAL...")
    //Esquema de AFM
    schemaname= 'Características1'
    attr= [
        'tipo de máquina',
        'Marca',
        'Modelo',
        'Año_de_fabricacion',
        'Marcado CE verificado por AFM',
        'Material',
        'Proceso',
        'Eje x',
        'Eje y',
        'Eje z'
    ]
    console.log (attr)
    let [schemaId,schema] = await schemacredential.createSchema(AFM.did,schemaname,attr)
    AFM.schemaId = schemaId
    AFM.schema = schema
    console.log("El esquema creado por AFM es: ")
    console.log(AFM.schema)
    //Esquema de Tecnalia Certificación
    schemaname2= 'Características2'
    attr2= [
        'tipo de máquina',
        'Marca',
        'Modelo',
        'Año_de_fabricacion',
        'Material',
        'Proceso',
        'Eje x',
        'Eje y',
        'Eje z'
    ]
    let [schemaId2, schema2] = await schemacredential.createSchema(TC.did,schemaname2,attr2)
    TC.schemaId = schemaId2
    TC.schema = schema2
    console.log("El esquema creado por Tecnalia Certificación es: ")
    console.log( TC.schema)

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////            4. REGISTRO DE ESQUEMAS DE CREDENCIALES           ////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    console.log(" ")
    console.log("ISSUER REGISTRANDO EL ESQUEMA DE CREDENCIALES EN LA RED...")
    //AFM registrando su esquema
    const requestresult1 = await sendtheschema.sendSchema(AFM.poolHandle, AFM.wh, AFM.did, AFM.schema);
    console.log("resultado del registro de la credencial creada por AFM: ")
    console.log(requestresult1)
    //TC registrando su esquema
    const requestresult2 = await sendtheschema.sendSchema(TC.poolHandle, TC.wh, TC.did, TC.schema);
    console.log("resultado del registro de la credencial creada por TC: ")
    console.log(requestresult2)


    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////         5.  CREACIÓN DE DEFINICIONES DE CREDENCIALES          ///////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //5.1. OBTENER EL ESQUEMA DE CREDENCIALES
    console.log(" ")
    console.log("ISSUER OBTENIENDO ESQUEMA DE CREDENCIAL DE LA RED...")
    //AFM obtiene su esquema de credenciales
    const [parsedschemaId, parsedschema] = await gettheschema.getSchema(AFM.poolHandle,AFM.did,AFM.schemaId)
    AFM.schemaId = parsedschemaId
    AFM.schema = parsedschema
    console.log("El parsed del esquema buscado es: ")
    console.log(AFM.schema)
    //TC obtiene su esquema de credenciales
    const [parsedschemaId2, parsedschema2] = await gettheschema.getSchema(TC.poolHandle,TC.did,TC.schemaId)
    TC.schemaId = parsedschemaId2
    TC.schema = parsedschema2
    console.log("El parsed del esquema buscado es: ")
    console.log(TC.schema)


    //5.2. CREAR LA DEFINICIÓN DE CREDENCIAL
    console.log(" ")
    console.log("ISSUER CREANDO DEFINICIÓN DE CREDENCIAL...")
    //AFM crea su definición de credencial
    const revocationAFMdef = true; //si no se quiere que la credencial sea revocable se pone false
    credDefConfigAFMdef =  {"support_revocation": revocationAFMdef}
    let [CredDefId,CredDef] = await credentialdef.createdef(AFM.wh,AFM.did,AFM.schema,credDefConfigAFMdef)
    AFM.CredDefId = CredDefId
    AFM.CredDef = CredDef
    console.log("id de la definición: ", AFM.CredDefId)
    console.log("la definición de credencial creada por AFM es: ")
    console.log(AFM.CredDef)
    //TC crea su definición de credencial
    const revocationTCdef = true;
    credDefConfigTCdef =  {"support_revocation": revocationTCdef} 
    let [CredDefId2,CredDef2] = await credentialdef.createdef(TC.wh,TC.did,TC.schema,credDefConfigTCdef)
    TC.CredDefId = CredDefId2
    TC.CredDef = CredDef2
    console.log("id de la definición: ", TC.CredDefId )
    console.log("la definición de credencial creada por TC es: ")
    console.log(TC.CredDef)


    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////        6. REGISTRO DE DEFINICIONES DE CREDENCIALES           ////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    console.log(" ")
    console.log("ISSUER REGISTRANDO DEFINICIÓN DE CREDENCIAL...")
    //AFM registra su definición de credencial en la red
    const requestresult3 = await sendthedef.sendCredDef(AFM.poolHandle,AFM.wh,AFM.did,AFM.CredDef)
    console.log("resultado del registro de definición de credencial: ")
    console.log(requestresult3)
    //TC registra su definición de credencial en la red
    const requestresult4 = await sendthedef.sendCredDef(TC.poolHandle,TC.wh,TC.did,TC.CredDef)
    console.log("resultado del registro de definición de credencial: ")
    console.log(requestresult4)

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////          7. CREACIÓN DEL REGISTRO DE REVOCACIÓN               ///////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    console.log(" ")
    console.log("ISSUER CREANDO REGISTRO DE REVOCACIÓN...")
    //AFM crea su registro de revocación
    AFM.tails = await tailswriter.Tailswriter()
    const rvocRegDefTagAFM = "tag1"
    const rvocRegDefConfigAFM = {"max_cred_num": 5, 'issuance_type': 'ISSUANCE_ON_DEMAND'}
    const [revRegId,revRegDef,revRegEntry] = await createandstoretherevreg.CreateAndStoreRevReg(AFM.wh,AFM.did,rvocRegDefTagAFM,AFM.CredDefId,rvocRegDefConfigAFM,AFM.tails)
    AFM.revregId = revRegId
    AFM.revregdef = revRegDef
    AFM.revregentry = revRegEntry
    console.log("AFM ha creado un registro de revocación con el id:",AFM.revregId)
    console.log("El registro de revocación creado por AFM es: ")
    console.log(AFM.revregdef)
    //TC crea su registro de revocación
    TC.tails = await tailswriter.Tailswriter()
    const rvocRegDefTagTC = "tag1"
    const rvocRegDefConfigTC = {"max_cred_num": 5, 'issuance_type': 'ISSUANCE_ON_DEMAND'}
    const [revRegId2,revRegDef2,revRegEntry2] = await createandstoretherevreg.CreateAndStoreRevReg(TC.wh,TC.did,rvocRegDefTagTC,TC.CredDefId,rvocRegDefConfigTC,TC.tails)
    TC.revregId = revRegId2
    TC.revregdef = revRegDef2
    TC.revregentry = revRegEntry2
    console.log("AFM ha creado un registro de revocación con el id:",TC.revregId)
    console.log("El registro de revocación creado por AFM es: ")
    console.log(TC.revregdef)


    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////       7. REGISTRO DE LA DEF Y ENTRADA DEL REGISTRO DE REVOCACIÓN        ///////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    console.log(" ")
    console.log("ISSUER REGISTRANDO DEFINICIÓN Y ENTRADA DEL REGISTRO DE REVOCACIÓN...")
    //REGISTRO DE AFM
    //AFM registra en la red la definición de su registro de revocación
    requestresult5 = await sendrevregdef.SendRevocRegDef(AFM.poolHandle,AFM.wh,AFM.did,AFM.revregdef)
    console.log("resultado del registro de definición del registro de revocación: ")
    console.log(requestresult5)
    //AFM registra en la red la entrada del registro de revocación
    requestresult6 = await sendrevregentry.SendRevocRegEntry(AFM.poolHandle,AFM.wh,AFM.did,AFM.revregId,AFM.revregentry)
    console.log("resultado del registro de la entrada del registro de revocación: ")
    console.log(requestresult6)
    //REGISTRO DE TC
    //TC registra en la red la definición de su registro de revocación
    requestresult7 = await sendrevregdef.SendRevocRegDef(TC.poolHandle,TC.wh,TC.did,TC.revregdef)
    console.log("resultado del registro de definición del registro de revocación: ")
    console.log(requestresult7)
    //TC registra en la red la entrada del registro de revocación
    requestresult8 = await sendrevregentry.SendRevocRegEntry(TC.poolHandle,TC.wh,TC.did,TC.revregId,TC.revregentry)
    console.log("resultado del registro de la entrada del registro de revocación: ")
    console.log(requestresult8)

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////                 7. EMISIÓN DE UNA CREDENCIAL                 ////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //7.1. EL ISSUER CREA UNA OFERTA DE CREDENCIAL
    //AFM crea una oferta de credencial
    console.log(" ")
    console.log("ISSUER CREANDO OFERTA DE CREDENCIAL...")
    AFM.CredOffer = await createcredoffer.CreateCredOffer(AFM.wh,AFM.CredDefId)
    console.log("La oferta de credencial de AFM: ")
    console.log(AFM.CredOffer)
    //AFM le envía la oferta a la máquina
    maquina1.CredOffer = AFM.CredOffer

    //7.2. EL HOLDER CREA UNA RESPUESTA A LA OFERTA DEL ISSUER
    //7.2.1. Obtener la definición de credencial
    //La máquina obtiene la definición de credencial para poder crear la respuesta
    //La máquina saca de la oferta de credencial recibida el id de la definición y obtiene la definición de la red usando el id.
    maquina1.credDefId = maquina1.CredOffer["cred_def_id"]
    let [parseddefid,parseddef]  = await getthedef.getCredDef(maquina1.poolHandle, maquina1.did,maquina1.credDefId)
    maquina1.CredDefId = parseddefid
    maquina1.CredDef = parseddef
    console.log("La definición de credencial buscada es: ")
    console.log(maquina1.CredDef)
    //7.2.2. Crear un master secret
    //La máquina crea un master secret
    maquina1.MasterSecretId = await createthemastersecret.createMasterSecret(maquina1.wh)
    console.log("El id del master secret creado por la máquina1 es: ")
    console.log(maquina1.MasterSecretId)
    //7.2.3. crear la respuesta
    //La máquina acepta la oferta de credencial y CREA UNA RESPUESTA utilizando el master secret
    console.log(" ")
    console.log("HOLDER CREANDO EL CREDENTIAL REQUEST...")
    const [credReq, credReqMetadata] = await createcredreq.CreateCredRequest(maquina1.wh,maquina1.did,maquina1.CredOffer,maquina1.CredDef,maquina1.MasterSecretId)
    maquina1.CredReq = credReq
    maquina1.CredReqMetadata = credReqMetadata
    console.log("La respuesta de la Máquina1 a la oferta de credencial es: ")
    console.log(maquina1.CredReq)
    //La máquina envia la respuesta a AFM, para que este la procese y emita la credencial
    AFM.CredReq = maquina1.CredReq
    

    //7.3. EL ISSUER CREA LA CREDENCIAL
    //AFM crea la credencial
    //7.3.0 AFM abre el lector de los tails 
    const tailsReaderConfigAFM = {"base_dir": util.getPathToIndyClientHome() + "/tails", "uri_pattern": ""}
    AFM.blobStorageReaderHandle = await indy.openBlobStorageReader('default', tailsReaderConfigAFM)

    //7.3.1. El issuer define los credential values
    //credential values tiene que tener la misma informacion que nuestro schema
    //codificamos los valores que queremos meter
    let credentialValues = {
        "tipo de máquina": { "raw": "Fresadora de torreta vertical", "encoded": encoder.encodeCredValue("Fresadora de torreta vertical") },
        "Marca": { "raw": "HELLER", "encoded": encoder.encodeCredValue("HELLER") },
        "Modelo": { "raw": "FTVC6", "encoded": encoder.encodeCredValue("FTVC6") },
        "Año_de_fabricacion": { "raw": "2021", "encoded": encoder.encodeCredValue("2021") },
        "Marcado CE verificado por AFM": { "raw": "Si", "encoded": encoder.encodeCredValue("Si") },
        "Material": { "raw": "Aluminio", "encoded": encoder.encodeCredValue("Aluminio") },
        "Proceso": { "raw": "corte", "encoded": encoder.encodeCredValue("corte") },
        "Eje x": { "raw": "1300", "encoded": encoder.encodeCredValue(1300) },
        "Eje y": { "raw": "320", "encoded": encoder.encodeCredValue(320) },
        "Eje z": { "raw": "450", "encoded": encoder.encodeCredValue(450) },
    };
    console.log(" ")
    console.log("ISSUER CREANDO CREDENCIAL CON LOS DATOS:")
    console.log(credentialValues)
    //7.3.2. El issuer crea la credencial
    //AFM crea la credencial
    const [credentialData,credrevId,revRegDelta] = await createthecredential.CreateCred(AFM.wh,AFM.CredOffer,AFM.CredReq,credentialValues,AFM.revregId,AFM.blobStorageReaderHandle)
    AFM.credential = credentialData
    AFM.credrevId = credrevId
    AFM.revRegDelta = revRegDelta
    console.log("La credencial creada por AFM para la Máquina1 es: ")
    console.log(JSON.stringify(AFM.credential));
    //console.log("El id del registro de revocación de la credencial creada por AFM para la Máquina1 es: ",AFM.credrevId)
    //console.log("La revocación delta de la credencial creada por AFM para la Máquina1 es:  ")
    //console.log(AFM.revRegDelta)
    //AFM hace un registro de la entrada del registro de revocación
    await sendrevregentry.SendRevocRegEntry(AFM.poolHandle,AFM.wh,AFM.did,AFM.revregId,AFM.revRegDelta)
    //AFM le envía la credencial a la máquina
    maquina1.credential = AFM.credential

    //7.3.3 EL HOLDER ALMACENA LA CREDENCIAL EN SU WALLET
    //Utilizando los datos de la credencial recibida obtiene el id de la definición del registro de revocación y lo utiliza para obtener de la red la definición del registro de revocación.
    maquina1.revRegDefId = maquina1.credential["rev_reg_id"]
    maquina1.revRegDef = await getrevregdef.getRevocRegDef(maquina1.poolHandle, maquina1.did, maquina1.revRegDefId)
    //La máquina almacena la credencial en su wallet.
    console.log(" ")
    console.log("HOLDER ALMACENANDO LA CREDENCIAL SU WALLET...")
    StoredCredentialIdMaquina1 = await storethecredential.StoreCredential(maquina1.wh, maquina1.CredReqMetadata,maquina1.credential,maquina1.CredDef,maquina1.revRegDef)
    console.log("Credencial de la Máquina1 guardado con el id: ")
    console.log(StoredCredentialIdMaquina1)

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////               8. REVOCACIÓN DE CREDENCIALES                  ////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //AFM revoca la credencial emitida a la máquina
    //revRegDeltaAfterRevocation = await indy.issuerRevokeCredential(AFM.wh, AFM.blobStorageReaderHandle, AFM.revregId, AFM.credrevId)
    //await sendrevregentry.SendRevocRegEntry(AFM.poolHandle, AFM.wh, AFM.did, AFM.revregId,revRegDeltaAfterRevocation)


    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////               8. VERIFICACIÓN DE CREDENCIALES                ////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //8.1. EL VERIFIER CREA UN PROOF REQUEST
    //El cliente crea el proof request
    console.log(" ")
    console.log("VERIFIER CREANDO PROOF REQUEST...")
    nonce = await indy.generateNonce();
    cliente1.proofRequest = {
        'nonce': nonce,
        'name': 'Proof-Request',
        'version': '0.2',
        'ver': '1.0',
        'requested_attributes': {
            'attr1_referent': {
                'name': 'Eje x',
                'restrictions': [{ 'cred_def_id': AFM.CredDefId }]
            },
            'attr2_referent': {
                'name': 'Eje y',
                'restrictions': [{ 'cred_def_id': AFM.CredDefId }]
            },
            'attr3_referent': {
                'name': 'Eje z',
                'restrictions': [{ 'cred_def_id': AFM.CredDefId }]
            }
        },
        'requested_predicates': {
            /*'predicate1_referent': {
                'name': 'salary',
                'p_type': '>=',
                'p_value': 5000,
                restrictions': [{ 'cred_def_id': credDefId }]
            }*/
        },
        "non_revoked": {/*"from": 0,*/ "to": util.getCurrentTimeInSeconds()}
    };
    console.log("Datos del proof request")
    console.log(JSON.stringify(cliente1.proofRequest, null, 4))
    //El cliente envía el proof request a la máquina
    maquina1.proofRequest = cliente1.proofRequest

    //8.2. EL HOLDER BUSCA LAS CREDENCIALES QUE COINCIDEN CON LOS ATRIBUTOS SOLICITADOS EN EL PROOF REQUEST
    //La máquina busca las credenciales
    //8.2.1. El holder obtiene el search handler
    //La máquina utiliza el siguiente método para conseguir el search handler que necesita para buscar las credenciales
    searchandlerMaquina1 = await searchhandler.SearchHandler(maquina1.wh,maquina1.proofRequest)
    console.log("El handler de búsqueda obtenido es: ")
    console.log(searchandlerMaquina1)
    //8.2.2. El holder busca las credenciales
    //La máquina busca las credenciales que coinciden con los atributo solicitados
    console.log(" ")
    console.log("HOLDER BUSCANDO LAS CREDENCIALES PARA CREAR LA PRUEBA...")
    credentials = await searchcredentials.SearchCredentialsForProof(searchandlerMaquina1)
    console.log("Credenciales que coinciden encontrados por la Máquina1: ")
    console.log(JSON.stringify(credentials, null, 4))
    
    //8.3. EL HOLDER DESCARGA DE LA RED LOS DATOS QUE NECESITA
    //La máquina descarga de la red los datos que le faltan para crear la prueba.
    console.log("Máquina1 obteniendo el esquema y la credential definition de la red")
    let credsForProof = {};
    credForAttr1a= credentials.credForAttr1
    credForAttr2a= credentials.credForAttr2
    credForAttr3a= credentials.credForAttr3
    credsForProof[`${credForAttr1a['referent']}`] = credForAttr1a;
    credsForProof[`${credForAttr2a['referent']}`] = credForAttr2a;
    credsForProof[`${credForAttr3a['referent']}`] = credForAttr3a;
    //credsForProof[`${credForPredicate1['referent']}`] = credForPredicate1;
    proverentities = await provergetentities.proverGetEntitiesFromLedger(
        maquina1.poolHandle,
        maquina1.did,
        credsForProof,
        'HOLDER'
    );
    maquina1.schemas = proverentities.schemas
    maquina1.CredDefs = proverentities.credDefs
    console.log("El esquema y la definición de credencial obtenidas por la Máquina1 son: ")
    console.log(proverentities)
    
    //8.3. EL HOLDER CREA EL ESTADO DE REVOCACIÓN
    //La máquina abre el lector de tails
    const tailsReaderConfig = {"base_dir": util.getPathToIndyClientHome() + "/tails", "uri_pattern": ""}
    maquina1.blobStorageReaderHandle = await indy.openBlobStorageReader("default", tailsReaderConfig)
    //La máquina obtiene el delta del registro de revocación.
    console.log(" ")
    console.log("HOLDER CREANDO EL ESTADO DE REVOCACIÓN...")
    const [,parsedrevRegDelta, parsedtimestamp] = await getrevregdelta.GetRevocRegDelta(maquina1.poolHandle, maquina1.did, maquina1.revRegDefId, 0/* from */, util.getCurrentTimeInSeconds()/* to */)
    maquina1.revRegDelta = parsedrevRegDelta
    maquina1.timestampOfDelta = parsedtimestamp //Tiempo en el que el issuer registro en la red el delta del registro de revocación.
    maquina1.credrevId = credForAttr1a["cred_rev_id"]
    maquina1.RevocationState = await createrevocationstate.RevState(maquina1.blobStorageReaderHandle,maquina1.revRegDef, maquina1.revRegDelta, maquina1.timestampOfDelta, maquina1.credrevId)
    console.log("El estado de revocación de la credencial emitida a la Máquina1 es:")
    console.log(maquina1.RevocationState)

    //8.4. EL HOLDER PREPARA EL JSON PARA CREAR LA PRUEBA
    //La máquina prepara el JSON en el formato que obliga indy para crear la proof
    //La máquina rellena el JSON con los datos obtenidos.
    maquina1.requestedCredentials = {
        'self_attested_attributes': {},
        'requested_attributes': {
            'attr1_referent': { 'cred_id': credForAttr1a['referent'], 'revealed': true, 'timestamp': maquina1.timestampOfDelta},
            'attr2_referent': { 'cred_id': credForAttr2a['referent'], 'revealed': true, 'timestamp': maquina1.timestampOfDelta},
            'attr3_referent': { 'cred_id': credForAttr3a['referent'], 'revealed': true, 'timestamp': maquina1.timestampOfDelta}
        },
        'requested_predicates': {
            //'predicate1_referent': { 'cred_id': credForPredicate1['referent'] },
        }
    };
    console.log("Máquina1 construyendo la prueba a partir de las siguientes credenciales: ")
    console.log(JSON.stringify(maquina1.timestampOfDelta, null, 4))

    //8.5. EL HOLDER CREA LA PRUEBA
    maquina1.revocationStates = {}
    maquina1.revocationStates[maquina1.revRegDefId]={}
    maquina1.revocationStates[maquina1.revRegDefId][maquina1.timestampOfDelta]= maquina1.RevocationState

    //revocStatesJson = proverentities.revStates
    console.log(" ")
    console.log("HOLDER CREANDO PRUEBA...")
    maquina1.proof = await createtheproof.createProof(maquina1.wh, maquina1.proofRequest,maquina1.requestedCredentials,maquina1.MasterSecretId,maquina1.schemas,maquina1.CredDefs,maquina1.revocationStates)
    console.log("La prueba creada por la Máquina1 es: ")
    console.log(JSON.stringify(maquina1.proof, null, 4))
    //Una vez creada se envía la prueba al verifier para que la procese.
    cliente1.proof = maquina1.proof
    //El verifier, en este caso el cliente, la recibe y empieza a verificar su validez.
  

    //8.6. EL VERIFIER DESCARGA DE LA RED LOS DATOS QUE NECESITA PARA VERIFICAR LA PRUEBA RECIBIDA
    console.log("Contenido visible de la prueba para el cliente: ")
    console.log(JSON.stringify(cliente1.proof['requested_proof'], null, 4))
    //Tiempos
    cliente1.timestampOfProof = cliente1.proof.identifiers[0].timestamp
    cliente1.timestampReceptionOfProof = util.getCurrentTimeInSeconds()
    //El cliente descarga de la red los datos que le hacen falta para verificar la prueba.
    cliente1did = cliente1.did
    verifierentities = await verifiergetentities.verifierGetEntitiesFromLedger(
        cliente1.poolHandle,
        cliente1.did,
        cliente1.proof['identifiers'],
        'VERIFIER',
        cliente1.timestampOfProof
    );
    cliente1.schemas = verifierentities.schemas
    cliente1.CredDefs = verifierentities.credDefs
    cliente1.revocRegDefs = verifierentities.revRegDefs
    cliente1.revocRegs = verifierentities.revRegs
    console.log("El esquema y la definición de credencial obtenidas por el cliente1 son: ")
    console.log(verifierentities)
    

    //8.7. EL VERIFIER VERIFICA LA PRUEBA
    //El cliente verifica la prueba.
    console.log(" ")
    console.log("VERIFIER VERIFICANDO LA PRUEBA ANTES DE SER REVOCADA...")
    isValid = await verifyproof.VerifyProof(cliente1.proofRequest,cliente1.proof,cliente1.schemas,cliente1.CredDefs,cliente1.revocRegDefs,cliente1.revocRegs)
    console.log('¿Es válida la prueba?: ')
    console.log(isValid)

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////             8. VERIFICACIÓN DE CREDENCIAL REVOCADA             //////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //AFM revoca la credencial emitida a la máquina
    console.log(" ")
    console.log("ISSUER REVOCANDO LA CREDENCIAL")
    AFM.revRegDeltaAfterRevocation = await indy.issuerRevokeCredential(AFM.wh, AFM.blobStorageReaderHandle, AFM.revregId, AFM.credrevId)
    await sendrevregentry.SendRevocRegEntry(AFM.poolHandle, AFM.wh, AFM.did, AFM.revregId,AFM.revRegDeltaAfterRevocation)
    //El cliente1 obtiene el registro de revocación después de que el issuer revoque la credencial (puesto que pones el tiempo actual en la siguiente función)
    console.log("EL VERIFIER OBTIENE EL REGISTRO DE REVOCACIÓN DESPUÉS DE QUE EL ISSUER REVOQUE LA CREDENCIAL...")
    cliente1.revRegDefId = cliente1.proof.identifiers[0]["rev_reg_id"]
    cliente1.revRegValue2 = await getrevreg.getRevocReg(cliente1.poolHandle,cliente1.did,cliente1.revRegDefId, util.getCurrentTimeInSeconds())
    revRegs2 = {}
    revRegs2[cliente1.revRegDefId] = {}
    revRegs2[cliente1.revRegDefId][cliente1.timestampOfProof] = cliente1.revRegValue2
    console.log("VERIFIER VERIFICANDO LA PRUEBA DE LA CREDENCIAL REVOCADA...")
    isValidAfter = await verifyproof.VerifyProof(cliente1.proofRequest,cliente1.proof,cliente1.schemas,cliente1.CredDefs,cliente1.revocRegDefs,revRegs2)
    console.log('¿Es válida la prueba?')
    console.log(isValidAfter)
    
    console.log(" ")
    console.log("VERIFIER VERIFICANDO LA PRUEBA DE LA CREDENCIAL REVOCADA UTILIZANDO EL TIEMPO DE ANTES DE SER REVOCADA...")
    cliente1.revRegValue3 = await getrevreg.getRevocReg(cliente1.poolHandle,cliente1.did,cliente1.revRegDefId, cliente1.timestampReceptionOfProof)
    revRegs3 = {}
    revRegs3[cliente1.revRegDefId] = {}
    revRegs3[cliente1.revRegDefId][cliente1.timestampOfProof] = cliente1.revRegValue3
    isValidBeforeRevocation2 = await verifyproof.VerifyProof(cliente1.proofRequest,cliente1.proof,cliente1.schemas,cliente1.CredDefs,cliente1.revocRegDefs,revRegs3)
    console.log('¿Es válida la prueba?')
    console.log(isValidBeforeRevocation2)


})();