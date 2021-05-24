const indy = require('indy-sdk');
const util = require('./util.js');
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

(async () => {
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////                 1. CONFIGURACIÓN DEL BLOQUE GÉNESIS                   ///////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //Activamos el modo debug para tener más información de los errores que ocurran.
    //Creamos la cofiguración para conectarnos a la red (pool).
    console.log("creando conexión con pool...")
    const poolName = "demo_pool"
    try{
        //obtenemos el fichero de la transacción génesis.
        const path = await util.getPoolGenesisTxnPath(poolName)
        console.log("path value: ",path)
        //Indicamos que vamos a utilizar el fichero anterior para la configuración.
        const config = {
            "genesis_txn": path,
        };
        //Creamos la configuración con ese fichero.
        await indy.createPoolLedgerConfig(poolName, config);
    } catch(e) {
        if(e.message !== "PoolLedgerConfigAlreadyExistsError") {
            throw e;
            console.log("El pool ya existe")
            //console.error(e);
        }
    };
    //Ajustamos la version del protocolo a usar. A partir de indy 1.4 se usa el 2.
    await indy.setProtocolVersion(2);

    //Nos conectamos a la red (pool)
    console.log("abriendo conexión con el pool con nombre: ", poolName)
    let poolHandle = await indy.openPoolLedger(poolName);
    console.log("pool handler id: ", poolHandle);


    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////               2. CREACIÓN DE WALLETS Y DIDS                  ////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //Creando wallet y DID con rol de Steward para AFM
    console.log("AFM: ");
    let AFM = await didSteward.createWalletDidSteward("AFM","0000");

    //Creando wallet y DID con rol de Steward para Tecnalia Certificación (TC)
    console.log("Tecnalia Certificación: ");
    let TC = await didSteward.createWalletDidSteward("Tecnalia Certificación","1111");

    //Creando wallet y DID sin rol para el cliente
    console.log("Cliente1: ");
    let cliente1 = await didnormal.createWalletDid("cliente1","2222");

    //Creando wallet y DID sin rol para la máquina
    console.log("Máquina1: ");
    let maquina1 = await didnormal.createWalletDid("maquina1","3333");



    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////            3. CREACIÓN DE ESQUEMAS DE CREDENCIALES           ////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
    AFMdid = AFM.did
    let AFMschema = await schemacredential.createSchema(AFMdid,schemaname,attr)
    console.log("El esquema creado por AFM es: ")
    console.log(AFMschema.schema)
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
    TCdid = TC.did
    let TCschema = await schemacredential.createSchema(TCdid,schemaname2,attr2)
    console.log("El esquema creado por Tecnalia Certificación es: ")
    console.log( TCschema.schema)


    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////            4. REGISTRO DE ESQUEMAS DE CREDENCIALES           ////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //AFM registrando su esquema
    AFMwh = AFM.wh 
    schemaAFM = AFMschema.schema
    const requestresult1 = await sendtheschema.sendSchema(poolHandle, AFMwh, AFMdid, schemaAFM);
    console.log("resultado: ")
    console.log(requestresult1)
    //TC registrando su esquema
    TCwh = TC.wh 
    schemaTC = TCschema.schema
    const requestresult2 = await sendtheschema.sendSchema(poolHandle, TCwh, TCdid, schemaTC);
    console.log("resultado: ")
    console.log(requestresult2)


    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////         5.  CREACIÓN DE DEFINICIONES DE CREDENCIALES          ///////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //5.1. OBTENER EL ESQUEMA DE CREDENCIALES
    //AFM obtiene su esquema de credenciales
    AFMschemaId = AFMschema.schemaId;
    let [,parsedAFMschema] = await gettheschema.getSchema(poolHandle,AFMdid,AFMschemaId)
    console.log("El parsed del esquema buscado es: ")
    console.log(parsedAFMschema)
    //TC obtiene su esquema de credenciales
    TCschemaId = TCschema.schemaId;
    let [,parsedTCschema] = await gettheschema.getSchema(poolHandle,TCdid,TCschemaId)
    console.log("El parsed del esquema buscado es: ")
    console.log(parsedTCschema)

    //5.2. CREAR LA DEFINICIÓN DE CREDENCIAL
    //AFM crea su definición de credencial 
    revocationAFMdef = true;
    let AFMdef = await credentialdef.createdef(AFMwh,AFMdid,parsedAFMschema)
    console.log("id de la definición: ",AFMdef.id)
    console.log("la definición de credencial creada por AFM es: ")
    console.log(AFMdef.def)
    //TC crea su definición de credencial 
    revocationTCdef = true;
    let TCdef = await credentialdef.createdef(TCwh,TCdid,parsedTCschema)
    console.log("id de la definición: ",TCdef.id)
    console.log("la definición de credencial creada por TC es: ")
    console.log(TCdef.def)


    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////        6. REGISTRO DE DEFINICIONES DE CREDENCIALES           ////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //AFM registra su definición de credencial en la red
    AFMdefinition = AFMdef.def
    const requestresult3 = await sendthedef.sendCredDef(poolHandle,AFMwh,AFMdid,AFMdefinition)
    console.log("resultado del registro de definición de credencial: ")
    console.log(requestresult3)
    //TC registra su definición de credencial en la red
    TCdefinition = TCdef.def
    const requestresult4 = await sendthedef.sendCredDef(poolHandle,TCwh,TCdid,TCdefinition)
    console.log("resultado del registro de definición de credencial: ")
    console.log(requestresult4)


    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////                 7. EMISIÓN DE UNA CREDENCIAL                 ////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //7.1. EL ISSUER CREA UNA OFERTA DE CREDENCIAL
    //AFM crea una oferta de credencial
    AFMdefinitionId = AFMdef.id
    AFMcredoffer = await createcredoffer.CreateCredOffer(AFMwh,AFMdefinitionId)
    console.log("La oferta de credencial de AFM: ")
    console.log(AFMcredoffer)
    //AFM le envía la oferta a la máquina

    //7.2. EL HOLDER CREA UNA RESPUESTA A LA OFERTA DEL ISSUER
    //7.2.1. Obtener la definición de credencial
    //La máquina obtiene la definición de credencial para poder crear la respuesta
    maquina1wh = maquina1.wh
    maquina1did = maquina1.did
    parsedAFMdef = await getthedef.getCredDef(poolHandle,maquina1did,AFMdefinitionId)
    console.log("El parsed de la definición de credencial buscada es: ")
    console.log(parsedAFMdef)
    //7.2.2. Crear un master secret
    //La máquina crea un master secret
    MasterSecretMaquina1Id = await createthemastersecret.createMasterSecret(maquina1wh)
    console.log("El id del master secret creado por la máquina1 es: ")
    console.log(MasterSecretMaquina1Id)
    //7.2.3. crear la respuesta
    //La máquina acepta la oferta de credencial y CREA UNA RESPUESTA utilizando el master secret
    def = parsedAFMdef.parseddef
    CredReqMaquina1 = await createcredreq.CreateCredRequest(maquina1wh,maquina1did,AFMcredoffer,def,MasterSecretMaquina1Id)
    console.log("La respuesta de la Máquina1 a la oferta de credencial es: ")
    console.log(CredReqMaquina1.credReq)
    //La máquina envia la respuesta a AFM, para que este la procese y emita la credencial

    //7.3. EL ISSUER CREA LA CREDENCIAL
    //AFM crea la credencial
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
    console.log("creando credencial con los datos:")
    console.log(credentialValues)
    //7.3.2. El issuer crea la credencial
    //AFM crea la credencial
    CredentialrequestMaquina1 = CredReqMaquina1.credReq
    AFMcredentialforMaquina1 = await createthecredential.CreateCred(AFMwh,AFMcredoffer,CredentialrequestMaquina1,credentialValues)
    console.log("La credencial creada por AFM para la Máquina1 es: ")
    console.log(JSON.stringify(AFMcredentialforMaquina1));
    //AFM le envía la credencial a la máquina
    //7.3.3 EL HOLDER ALMACENA LA CREDENCIAL EN SU WALLET
    //La máquina almacena la credencial en su wallet
    CredentialRequestMetadataMaquina1 = CredReqMaquina1.credReqMetadata
    StoredCredentialIdMaquina1 = await storethecredential.StoreCredential(maquina1wh,CredentialRequestMetadataMaquina1,AFMcredentialforMaquina1,def)
    console.log("Credencial de la Máquina1 guardado con el id: ")
    console.log(StoredCredentialIdMaquina1)


    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////               8. VERIFICACIÓN DE CREDENCIALES                ////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //8.1. EL VERIFIER CREA UN PROOF REQUEST
    //El cliente crea el proof request
    nonce = await indy.generateNonce();
    let proofRequest = {
        'nonce': nonce,
        'name': 'Proof-Request',
        'version': '0.2',
        'ver': '1.0',
        'requested_attributes': {
            'attr1_referent': {
                'name': 'Eje x',
                'restrictions': [{ 'cred_def_id': AFMdefinitionId }]
            },
            'attr2_referent': {
                'name': 'Eje y',
                'restrictions': [{ 'cred_def_id': AFMdefinitionId }]
            },
            'attr3_referent': {
                'name': 'Eje z',
                'restrictions': [{ 'cred_def_id': AFMdefinitionId }]
            }
        },
        'requested_predicates': {
            /*'predicate1_referent': {
                'name': 'salary',
                'p_type': '>=',
                'p_value': 5000,
                restrictions': [{ 'cred_def_id': credDefId }]
            }*/
        }
    };
    console.log("Datos del proof request")
    console.log(JSON.stringify(proofRequest, null, 4))
    //El cliente envía el proof request a la máquina

    //8.2. EL HOLDER BUSCA LAS CREDENCIALES QUE COINCIDEN CON LOS ATRIBUTOS SOLICITADOS EN EL PROOF REQUEST
    //La máquina busca las credenciales
    //8.2.1. El holder obtiene el search handler
    //La máquina utiliza el siguiente método para conseguir el search handler que necesita para buscar las credenciales
    searchandlerMaquina1 = await searchhandler.SearchHandler(maquina1wh,proofRequest)
    console.log("El handler de búsqueda obtenido es: ")
    console.log(searchandlerMaquina1)
    //8.2.2. El holder busca las credenciales
    //La máquina busca las credenciales que coinciden con los atributo solicitados
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
        poolHandle,
        maquina1did,
        credsForProof,
        'HOLDER'
    );
    console.log("El esquema y la definición de credencial obtenidas por la Máquina1 son: ")
    console.log(proverentities)
    
    //8.4. EL HOLDER PREPARA EL JSON PARA CREAR LA PRUEBA
    //La máquina prepara el JSON en el formato que obliga indy para crear la proof
    //La máquina rellena el JSON con los datos obtenidos.
    let requestedCredentials = {
        'self_attested_attributes': {},
        'requested_attributes': {
            'attr1_referent': { 'cred_id': credForAttr1a['referent'], 'revealed': true },
            'attr2_referent': { 'cred_id': credForAttr2a['referent'], 'revealed': true },
            'attr3_referent': { 'cred_id': credForAttr3a['referent'], 'revealed': true }
        },
        'requested_predicates': {
            //'predicate1_referent': { 'cred_id': credForPredicate1['referent'] },
        }
    };
    console.log("Máquina1 construyendo la prueba a partir de las siguientes credenciales: ")
    console.log(JSON.stringify(requestedCredentials, null, 4))

    //8.5. EL HOLDER CREA LA PRUEBA
    schemasJson = proverentities.schemas
    credDefsJson = proverentities.credDefs
    revocStatesJson = proverentities.revStates
    Maquina1proof = await createtheproof.createProof(maquina1wh,proofRequest,requestedCredentials,MasterSecretMaquina1Id,schemasJson,credDefsJson,revocStatesJson)
    console.log("La prueba creada por la Máquina1 es: ")
    console.log(JSON.stringify(Maquina1proof, null, 4))
    //Una vez creada se envía la prueba al verifier para que la procese.
    //El verifier, en este caso el cliente, la recibe y empieza a verificar su validez.

    //8.6. EL VERIFIER DESCARGA DE LA RED LOS DATOS QUE NECESITA PARA VERIFICAR LA PRUEBA RECIBIDA
    console.log("Contenido visible de la prueba para el cliente: ")
    console.log(JSON.stringify(Maquina1proof['requested_proof'], null, 4))
    //El cliente descarga de la red los datos que le hacen falta para verificar la prueba.
    cliente1did = cliente1.did
    verifierentities = await verifiergetentities.verifierGetEntitiesFromLedger(
        poolHandle,
        cliente1did,
        Maquina1proof['identifiers'],
        'VERIFIER',
    );
    console.log("El esquema y la definición de credencial obtenidas por el cliente1 son: ")
    console.log(verifierentities)

    //8.7. EL VERIFIER VERIFICA LA PRUEBA
    //El cliente verifica la prueba.
    schemasJsoncliente = verifierentities.schemas
    credDefsJsoncliente = verifierentities.credDefs
    revocRefDefsJson = verifierentities.revRegDefs
    revocRegsJson = verifierentities.revRegs
    isValid = await verifyproof.VerifyProof(proofRequest,Maquina1proof,schemasJsoncliente,credDefsJsoncliente,revocRefDefsJson,revocRegsJson)
    console.log('¿Es válida la prueba?: ')
    console.log(isValid)
})();