var FA = FA || {};

(function (w, d) {
    var clientId = 'XXXXXXXXXXXX.apps.googleusercontent.com';

    var GOOGLE_OAUTH2_USERINFO_SCOPE = 'https://www.googleapis.com/auth/userinfo.email';
    var GOOGLE_DRIVE_ABOUT_SCOPE = 'https://www.googleapis.com/auth/drive.metadata.readonly';

    var scopes = '';

    var encKeysObj = {};
    var decKeysObj = {};

    var ibeArray = [];
    var decKeys = [];

    var authButtonEnc;
    var authButtonDec;

    var authIdentityEnc;
    var authIdentityDec;

    var authApiUserInfo;
    var authApiDriveAbout;

    var otherIdentities;

    var jsonOutputEnc;
    var jsonInputDec;
    var jsonOutputDec;

    var encryptKeys;
    var copyKeysFromAbove;
    var decryptKeys;

    var identityEmail;

    FA.init = function () {
        authButtonEnc = d.getElementById("authButtonEnc");
        authButtonDec = d.getElementById("authButtonDec");

        //$(authButtonEnc).attr('onclick', '').click(FA.handleSignInClick);
        //$(authButtonDec).attr('onclick', '').click(FA.handleSignInClick);

        authIdentityEnc = d.getElementById("authIdentityEnc");
        authIdentityDec = d.getElementById("authIdentityDec");

        authIdentityEnc.value = "";
        authIdentityDec.value = "";

        authApiUserInfo = d.getElementById("authApiUserInfo");
        authApiDriveAbout = d.getElementById("authApiDriveAbout");

        otherIdentities = d.getElementById("otherIdentities");

        jsonOutputEnc = d.getElementById("jsonOutputEnc");
        jsonInputDec = d.getElementById("jsonInputDec");
        jsonOutputDec = d.getElementById("jsonOutputDec");

        encryptKeys = d.getElementById("encryptKeys");
        copyKeysFromAbove = d.getElementById("copyKeysFromAbove");
        decryptKeys = d.getElementById("decryptKeys");

        //test IE
        if (encryptKeys.addEventListener) {
            encryptKeys.addEventListener("click", FA.encryptKeys, false);
            copyKeysFromAbove.addEventListener("click", FA.copyKeysFromAbove, false);
            decryptKeys.addEventListener("click", FA.decryptKeys, false);
            /*if (authIdentityEnc.value.length > 0) {
             authButtonEnc.addEventListener("click", FA.handleSignOutClick, false);
             authButtonDec.addEventListener("click", FA.handleSignOutClick, false);
             } else {
             authButtonEnc.addEventListener("click", FA.handleSignInClick, false);
             authButtonDec.addEventListener("click", FA.handleSignInClick, false);
             }*/
        } else if (encryptKeys.attachEvent){
            encryptKeys.attachEvent("onclick", FA.encryptKeys);
            copyKeysFromAbove.attachEvent("onclick", FA.copyKeysFromAbove);
            decryptKeys.attachEvent("onclick", FA.decryptKeys);
            /*if (authIdentityEnc.value.length > 0) {
             authButtonEnc.attachEvent("onclick", FA.handleSignOutClick);
             authButtonDec.attachEvent("onclick", FA.handleSignOutClick);
             } else {
             authButtonEnc.attachEvent("onclick", FA.handleSignInClick);
             authButtonDec.attachEvent("onclick", FA.handleSignInClick);
             }*/
        }

        window.setTimeout(FA.doInitAuth, 1);
    };

    FA.encryptKeys = function() {
        var encKeysTxt = '';

        encKeysObj = {};

        if (authIdentityEnc.value.length > 0) {
            $.ajax({
                type: "POST",
                url: "ibe-encrypt",
                async: false,
                data: "keycnt=1" + "&identities=" + otherIdentities.value,
                success: function(msgJson) {
                    //encKeysTxt = msgJson;
                    //encKeysObj = JSON.parse(msgJson);
                    encKeysObj = msgJson;
                    encKeysTxt = JSON.stringify(encKeysObj);

                    if (encKeysObj.hasOwnProperty("error"))
                    {
                        alert(encKeysObj.error);
                        return false;
                    }

                    /*if (!encKeysObj.hasOwnProperty("keyArray") || !encKeysObj.hasOwnProperty("ivArray") || !encKeysObj.hasOwnProperty("ibeArray"))
                     {
                     alert("Error: AJAX/JSON parse.");
                     return false;
                     }*/

                    jsonOutputEnc.value = encKeysTxt;
                },
                error: function (responseData, textStatus, errorThrown) {
                    alert(errorThrown.message);
                    return false;
                }
            });
        }
    };

    FA.decryptKeys = function() {
        var decKeysTxt = '';
        var uriTooLarge = false;
        decKeys.length = 0;

        ibeArray = jsonInputDec.value;

        if (authIdentityDec.value.length > 0 && ibeArray.length > 0) {
            $.ajax({
                type: "POST",
                url: "ibe-decrypt",
                async: false,
                //data: "ibeArray=" + ibeArray.toString(),
                data: ibeArray,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function(msgJson) {
                    if (typeof msgJson == "string" && msgJson.match("414 Request-URI"))
                        uriTooLarge = true;
                    else {
                        if (typeof msgJson == "object") {
                            decKeysObj = msgJson;
                            decKeysTxt = JSON.stringify(decKeysObj); // what you do once the request is completed
                        } else {
                            alert("Error: not object.");
                            return false;
                        }
                    }

                    if (uriTooLarge) {
                        alert("Error: Too many files.");
                        return false;
                    }

                    if (decKeysObj.hasOwnProperty("error"))	{
                        alert(decKeysObj.error);
                        return false;
                    }

                    if (typeof decKeysObj == "object") {
                        /*if (decKeysObj[0].hasOwnProperty("dataKey")) {
                         for (var i = 0; decKeysObj.keyArray[i]; i++) {
                         if (decKeysObj.keyArray[i] != "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX")
                         decKeys.push(decKeysObj.keyArray[i]);
                         }*/
                    } else {
                        alert("Error: AJAX/JSON parse.");
                        return false;
                    }

                    jsonOutputDec.value = decKeysTxt;
                },
                error: function (responseData, textStatus, errorThrown) {
                    alert(errorThrown.message);
                    return false;
                }
            });
        }
    };

    FA.copyKeysFromAbove = function() {
        var identityCipherArr = [];
        var dataCipherArr = encKeysObj;

        for (var i = 0; i < dataCipherArr.length; i++) {
            delete dataCipherArr[i].dataKey;
            delete dataCipherArr[i].dataIV;
            for (var j = 0; j < dataCipherArr[i].identityCipherArr.length; j++) {
                identityCipherArr.push(dataCipherArr[i].identityCipherArr[j]);
            }
        }

        jsonInputDec.value = JSON.stringify(identityCipherArr);
    }

    FA.doInitAuth = function () {
        gapi.auth.init(FA.doCheckAuth);
    }

    FA.doCheckAuth = function () {
        if (authApiUserInfo) {
            scopes = GOOGLE_OAUTH2_USERINFO_SCOPE;
        } else {
            scopes = GOOGLE_DRIVE_ABOUT_SCOPE;
        }

        gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: true}, FA.handleAuthResult);
    }

    FA.handleAuthResult = function(authResult) {
        if (authResult && !authResult.error) {
            $(authButtonEnc).text('Sign out');
            $(authButtonDec).text('Sign out');

            if (authButtonEnc.addEventListener) {
                authButtonEnc.removeEventListener("click", FA.handleSignInClick, false);
                authButtonDec.removeEventListener("click", FA.handleSignInClick, false);
                authButtonEnc.removeEventListener("click", FA.handleSignOutClick, false);
                authButtonDec.removeEventListener("click", FA.handleSignOutClick, false);
                authButtonEnc.addEventListener("click", FA.handleSignOutClick, false);
                authButtonDec.addEventListener("click", FA.handleSignOutClick, false);
            } else if (authButtonEnc.attachEvent){
                authButtonEnc.detachEvent("onclick", FA.handleSignInClick);
                authButtonDec.detachEvent("onclick", FA.handleSignInClick);
                authButtonEnc.detachEvent("onclick", FA.handleSignOutClick);
                authButtonDec.detachEvent("onclick", FA.handleSignOutClick);
                authButtonEnc.attachEvent("onclick", FA.handleSignOutClick);
                authButtonDec.attachEvent("onclick", FA.handleSignOutClick);
            }

            FA.make_secaasSignIn(authResult.access_token);
        } else {
            $(authButtonEnc).text('Authenticate with Google');
            $(authButtonDec).text('Authenticate with Google');

            if (authButtonEnc.addEventListener) {
                authButtonEnc.removeEventListener("click", FA.handleSignInClick, false);
                authButtonDec.removeEventListener("click", FA.handleSignInClick, false);
                authButtonEnc.removeEventListener("click", FA.handleSignOutClick, false);
                authButtonDec.removeEventListener("click", FA.handleSignOutClick, false);
                authButtonEnc.addEventListener("click", FA.handleSignInClick, false);
                authButtonDec.addEventListener("click", FA.handleSignInClick, false);
            } else if (authButtonEnc.attachEvent){
                authButtonEnc.detachEvent("onclick", FA.handleSignInClick);
                authButtonDec.detachEvent("onclick", FA.handleSignInClick);
                authButtonEnc.detachEvent("onclick", FA.handleSignOutClick);
                authButtonDec.detachEvent("onclick", FA.handleSignOutClick);
                authButtonEnc.attachEvent("onclick", FA.handleSignInClick);
                authButtonDec.attachEvent("onclick", FA.handleSignInClick);
            }
        }
    }

    FA.handleSignInClick = function(event) {
        authIdentityEnc.value = "";
        authIdentityDec.value = "";

        if (authApiUserInfo.checked) {
            scopes = GOOGLE_OAUTH2_USERINFO_SCOPE;
        } else {
            scopes = GOOGLE_DRIVE_ABOUT_SCOPE;
        }

        gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: false}, FA.handleAuthResult);
        return false;
    }

    // Load the API and make an API call.  Display the results on the screen.
    FA.make_secaasSignIn = function(access_token) {
        identityEmail = {};

        var google_api = '';

        if (authApiUserInfo.checked) {
            google_api = authApiUserInfo.value;
        } else {
            google_api = authApiDriveAbout.value;
        }

        $.ajax({
            type: "POST",
            url: "login" + "?api=" + google_api,
            async: false,
            data: "access_token=" +  access_token,
            success: function(msgJson) {
                identityEmail = JSON.parse(msgJson);

                if (identityEmail.hasOwnProperty("error"))	{
                    alert(identityEmail.error);
                    return false;
                }

                if (identityEmail.hasOwnProperty("identity_email")) {
                    authIdentityEnc.value = identityEmail.identity_email;
                    authIdentityDec.value = identityEmail.identity_email;
                } else {
                    alert("Error: AJAX/JSON parse.");
                    return false;
                }
            },
            error: function (responseData, textStatus, errorThrown) {
                alert(errorThrown.message);
                return false;
            }
        });
    }

    FA.handleSignOutClick = function(event) {
        $.ajax({
            type: "GET",
            url: "logout",
            async: false,
            data: "",
            success: function(msgJson) {
                authIdentityEnc.value = "";
                authIdentityDec.value = "";

                $(authButtonEnc).text('Authenticate with Google');
                $(authButtonDec).text('Authenticate with Google');

                if (authButtonEnc.addEventListener) {
                    authButtonEnc.removeEventListener("click", FA.handleSignInClick, false);
                    authButtonDec.removeEventListener("click", FA.handleSignInClick, false);
                    authButtonEnc.removeEventListener("click", FA.handleSignOutClick, false);
                    authButtonDec.removeEventListener("click", FA.handleSignOutClick, false);
                    authButtonEnc.addEventListener("click", FA.handleSignInClick, false);
                    authButtonDec.addEventListener("click", FA.handleSignInClick, false);
                } else if (authButtonEnc.attachEvent){
                    authButtonEnc.detachEvent("onclick", FA.handleSignInClick);
                    authButtonDec.detachEvent("onclick", FA.handleSignInClick);
                    authButtonEnc.detachEvent("onclick", FA.handleSignOutClick);
                    authButtonDec.detachEvent("onclick", FA.handleSignOutClick);
                    authButtonEnc.attachEvent("onclick", FA.handleSignInClick);
                    authButtonDec.attachEvent("onclick", FA.handleSignInClick);
                }
            },
            error: function (responseData, textStatus, errorThrown) {
                alert(errorThrown.message);
                return false;
            }
        });
    }

})(window, document);

window.onload = FA.init;
