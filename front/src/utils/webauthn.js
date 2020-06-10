var base64js = require('base64-js')
/**
 * Transforms items in the credentialCreateOptions generated on the server
 * into byte arrays expected by the navigator.credentials.create() call
 * @param {Object} credentialCreateOptionsFromServer
 */
const transformCredentialCreateOptions = (credentialCreateOptionsFromServer) => {
    let {challenge, user} = credentialCreateOptionsFromServer;
    user.id = Uint8Array.from(
        atob(credentialCreateOptionsFromServer.user.id
            .replace(/_/g, "/")
            .replace(/-/g, "+")
            ),
        c => c.charCodeAt(0));

    challenge = Uint8Array.from(
        atob(credentialCreateOptionsFromServer.challenge
            .replace(/_/g, "/")
            .replace(/-/g, "+")
            ),
        c => c.charCodeAt(0));

    const transformedCredentialCreateOptions = Object.assign(
            {}, credentialCreateOptionsFromServer,
            {challenge, user});

    return transformedCredentialCreateOptions;
}


/** Transforms the binary data in the credential into base64 strings
* for posting to the server.
* @param {PublicKeyCredential} newAssertion
*/
const transformNewAssertionForServer = (newAssertion) => {
   const attObj = new Uint8Array(
       newAssertion.response.attestationObject);
   const clientDataJSON = new Uint8Array(
       newAssertion.response.clientDataJSON);
   const rawId = new Uint8Array(
       newAssertion.rawId);

   const registrationClientExtensions = newAssertion.getClientExtensionResults();

   return {
       id: newAssertion.id,
       rawId: b64enc(rawId),
       type: newAssertion.type,
       attestationObject: b64enc(attObj),
       clientDataJSON: b64enc(clientDataJSON),
       registrationClientExtensions: JSON.stringify(registrationClientExtensions)
   };
}

function b64enc(buf) {
    return base64js.fromByteArray(buf)
                   .replace(/\+/g, "-")
                   .replace(/\//g, "_")
                   .replace(/=/g, "");
}
const transformCredentialRequestOptions = (credentialRequestOptionsFromServer) => {
    let {challenge, allowCredentials} = credentialRequestOptionsFromServer;

    challenge = Uint8Array.from(
        atob(challenge.replace(/_/g, "/").replace(/-/g, "+")), c => c.charCodeAt(0));

    allowCredentials = allowCredentials.map(credentialDescriptor => {
        let {id} = credentialDescriptor;
        id = id.replace(/_/g, "/").replace(/-/g, "+");
        id = Uint8Array.from(atob(id), c => c.charCodeAt(0));
        return Object.assign({}, credentialDescriptor, {id});
    });

    const transformedCredentialRequestOptions = Object.assign(
        {},
        credentialRequestOptionsFromServer,
        {challenge, allowCredentials});

    return transformedCredentialRequestOptions;
};

/**
 * Encodes the binary data in the assertion into strings for posting to the server.
 * @param {PublicKeyCredential} newAssertion
 */
const transformAssertionForServer = (newAssertion) => {
    const authData = new Uint8Array(newAssertion.response.authenticatorData);
    const clientDataJSON = new Uint8Array(newAssertion.response.clientDataJSON);
    const rawId = new Uint8Array(newAssertion.rawId);
    const sig = new Uint8Array(newAssertion.response.signature);
    const assertionClientExtensions = newAssertion.getClientExtensionResults();
    const userHandle = new Uint8Array(newAssertion.response.userHandle);

    return {
        id: newAssertion.id,
        rawId: b64enc(rawId),
        type: newAssertion.type,
        authenticatorData: b64RawEnc(authData),
        clientDataJSON: b64RawEnc(clientDataJSON),
        signature: hexEncode(sig),
        assertionClientExtensions: JSON.stringify(assertionClientExtensions),
        userHandle: b64RawEnc(userHandle)
    };
};

function b64RawEnc(buf) {
    return base64js.fromByteArray(buf)
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function hexEncode(buf) {
    return Array.from(buf)
                .map(function(x) {
                    return ("0" + x.toString(16)).substr(-2);
				})
                .join("");
}
module.exports.transformNewAssertionForServer = transformNewAssertionForServer
module.exports.transformCredentialCreateOptions = transformCredentialCreateOptions;
module.exports.transformCredentialRequestOptions = transformCredentialRequestOptions
module.exports.transformAssertionForServer = transformAssertionForServer
