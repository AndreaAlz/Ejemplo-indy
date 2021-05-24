# Ejemplo-indy
## Que vas a encontrar
En el código de este repositorio encontrarás la solución a un ejemplo de SSI industrial mediante la tecnología Hyperledger Indy. Es un código únicamente para uso educativo, no debe utilizarse como base para ningún caso de uso real.

## Sobre el ejemplo
El objetivo es crear identidades digitales para las máquinas que posee una empresa y emitir credenciales asociadas a las capacidades productivas de estas. En este ejemplo en concreto, tenemos dos issuers, AFM y Tecnalia Certificación estos emitirán credenciales a las máquinas (holders). Posteriormente, el cliente (verifier) podrá solicitar ciertos atributos de la máquina que quiera verificar y realizar el proceso de verificación directamente contra la máquina sin necesidad de acudir al issuer.

## Prerequisitos
Para poder ejecutar el ejemplo se necesita tener lo siguiente instalado:
* Docker
* Libindy v1.6+
* Node v8+
* SDK
* Indy-node testnet


