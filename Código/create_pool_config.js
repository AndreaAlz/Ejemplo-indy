const indy = require('indy-sdk');
const util = require('./util.js');
async function CreatePoolConfig(poolName){
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
}
module.exports = {
    CreatePoolConfig
}