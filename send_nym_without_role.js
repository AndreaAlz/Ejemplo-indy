const indy = require('indy-sdk');
async function SendNymWithoutRole(poolHandleSteward,whSteward,DidSteward,request){
    //El Steward la firma
    let StewardSignedActornormalsSignedRequest = await indy.multiSignRequest (whSteward, DidSteward, request ) 
    console.log("FIRMADA POR EL STEWARD")
    console.log(StewardSignedActornormalsSignedRequest)
    //El Steward envía la transacción nym a la red
    //return await indy.signAndSubmitRequest ( poolHandleSteward, whSteward, DidSteward, request )
    return await indy.submitRequest (poolHandleSteward, StewardSignedActornormalsSignedRequest ) 
    
}
module.exports= {
    SendNymWithoutRole
}