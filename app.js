var express = require('express'),
    routes = require('./routes'),
    user = require('./routes/user'),
    http = require('http'),
    https = require('https'),
    path = require('path'),
    fs = require('fs'),
    passport = require('passport'),
    random = require("node-random"),
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var GOOGLE_CLIENT_ID = "XXXXXXXXXXXX.apps.googleusercontent.com";
var GOOGLE_CLIENT_SECRET = "none";

var GOOGLE_DRIVE_ABOUT_API_URL = 'https://www.googleapis.com/drive/v2/about';
var GOOGLE_OAUTH2_USERINFO_API_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

var GOOGLE_DRIVE_ABOUT = 'driveabout';
var GOOGLE_OAUTH2_USERINFO = 'userinfo';

var DOMAIN_NAME = 'airykey.org'; // localhost.localdomain
var HTML_TITLE = 'AiryKey';

var ssl_key = fs.readFileSync('keys/ssl.key');
var ssl_cert = fs.readFileSync('keys/ssl.crt');
var ssl_ca = fs.readFileSync('keys/signing-ca-1.crt');

var options = {
    key: ssl_key,
    cert: ssl_cert,
    ca: ssl_ca
};

/////////////////
var nodejs_ibekg = require('nodejs_ibekg.node');

var ibekg = new nodejs_ibekg.Ibekg();

var crypto_info_json = ibekg.getCryptoInfo();

var crypto_info_json_obj = JSON.parse(crypto_info_json);

console.log(crypto_info_json);

var ibekgURI = "https://" + DOMAIN_NAME;

setupEngineOptions = {
    "ibekgURI": ibekgURI,
    "masterKeyStorageEntropy": "put_some_entropy"
}

createMasterKeyOptions = {
    "currentDate": "2013-10-01" // ISO 8601 gmtime - safety rewrite
}

encryptDataKeyOptions = {
    "anonymityLevel": 0
}

decryptDataKeyOptions = {
    //
}

//var dataHashArr = ['78D8ACDF067E656AC2374B0C1A457B62DC86648CCE5A74691391CA442BEC9A2A', '0DD2C1290C175AA653442D6B277CFC6DB6E998D6BDC5DFE8663DB0AA400AF9F3'];
var dataHashArr = ['78D8ACDF067E656AC2374B0C1A457B62DC86648CCE5A74691391CA442BEC9A2A'];

var nonceEntropy = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
    24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47,
    48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71,
    72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95,
    96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119,
    120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143,
    144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167,
    168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191,
    192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215,
    216, 217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 237, 238, 239,
    240, 241, 242, 243, 244, 245, 246, 247, 248, 249, 250, 251, 252, 253, 254, 255, 256, 257, 258, 259, 260, 261, 262, 263,
    264, 265, 266, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276, 277, 278, 279, 280, 281, 282, 283, 284, 285, 286, 287,
    288, 289, 290, 291, 292, 293, 294, 295, 296, 297, 298, 299, 300, 301, 302, 303, 304, 305, 306, 307, 308, 309, 310, 311,
    312, 313, 314, 315, 316, 317, 318, 319, 320, 321, 322, 323, 324, 325, 326, 327, 328, 329, 330, 331, 332, 333, 334, 335,
    336, 337, 338, 339, 340, 341, 342, 343, 344, 345, 346, 347, 348, 349, 350, 351, 352, 353, 354, 355, 356, 357, 358, 359,
    360, 361, 362, 363, 364, 365, 366, 367, 368, 369, 370, 371, 372, 373, 374, 375, 376, 377, 378, 379, 380, 381, 382, 383];

if (crypto_info_json_obj.fips_build == 'true') {
    console.log('running FIPS build');

    GetEntropy = function (entlen, callback) {
        console.log('GetEntropy called: ' + entlen);
        random.numbers({
            "number": entlen,
            //"number": 1, // Only for testing!!!
            "minimum": 0,
            "maximum": 255
        }, function (err, data) {
            if (err) {
                console.log(err);
            } else {
                callback(data);
                //callback(nonceEntropy); // Only for testing!!!
            }
        });
    }

    GetEntropy(crypto_info_json_obj.entropy_bufs_size, function (data) {
        ibekg.setupEngine(setupEngineOptions, function (entlen) {
            if (crypto_info_json_obj.entropy_bufs_size < entlen) {
                return "entropy_bufs_size < entlen";
            } else {
                return data;
            }
        });

        if (crypto_info_json_obj.masterkey_stored == 'false') {
            console.log('createMasterKey called');
            ibekg.createMasterKey(createMasterKeyOptions);
        }
    });
} else {
    console.log('calling no FIPS build');

    ibekg.setupEngine(setupEngineOptions);

    if (crypto_info_json_obj.masterkey_stored == 'false') {
        console.log('createMasterKey called');
        ibekg.createMasterKey();
    }
}
/////////////////

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

// Use the GoogleStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Google
//   profile), and invoke a callback with a user object.
passport.use(new GoogleStrategy({
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: 'https://' + DOMAIN_NAME + '/auth/google/callback'
    },
    function(accessToken, refreshToken, profile, done) {
        // asynchronous verification, for effect...
        process.nextTick(function () {

            // To keep the example simple, the user's Google profile is returned to
            // represent the logged-in user.  In a typical application, you would want
            // to associate the Google account with a user record in your database,
            // and return that user instead.
            return done(null, profile);
        });
    }
));

var MemoryStore = express.session.MemoryStore;

var app = express();
var apps = express();

app.configure(function() {
    app.set('port', process.env.PORT || 80);
    app.use(express.favicon(__dirname + '/public/favicon.ico'));
    app.use(app.router);
});

apps.configure(function() {
    apps.set('port', process.env.PORT || 443);
    apps.set('views', __dirname + '/views');
    apps.set('view engine', 'ejs');
    apps.use(express.favicon(__dirname + '/public/favicon.ico'));
    apps.use(express.logger('dev'));
    apps.use(express.bodyParser());
    apps.use(express.methodOverride());
    apps.use(express.cookieParser('1234567890'));
    apps.use(express.session({
        store: new MemoryStore(),
        secret: 'some_secret',
        key: 'session-key',
        cookie: { secure: true }
    }));
    // Initialize Passport!  Also use passport.session() middleware, to support
    // persistent login sessions (recommended).
    apps.use(passport.initialize());
    //apps.use(passport.session());
    apps.use(apps.router);
    apps.use(express.static(path.join(__dirname, 'public')));
});

// set up a route to redirect http to https
// http://en.wikipedia.org/wiki/HTTP_cookie#Secure_and_HttpOnly
// cookie: { secure: true }
app.get('*',function(req, res) {
    res.redirect('https://' + DOMAIN_NAME + req.url)
})

app.configure('development', function() {
    app.use(express.errorHandler());
});

apps.configure('development', function() {
    apps.use(express.errorHandler());
});

apps.get('/', function(req, res) {
    res.render('index', { user: req.session.email, title: HTML_TITLE});
});

apps.get('/users', user.list);

apps.post('/login', function(req, res) {
    res.header("Access-Control-Allow-Origin", req.headers.origin);
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");

    //var self = passport;
    var accessToken = req.body.access_token;
    var api_param = req.param("api");
    var google_api = GOOGLE_OAUTH2_USERINFO; // default

    if (api_param == GOOGLE_DRIVE_ABOUT) {
        google_api = GOOGLE_DRIVE_ABOUT_API_URL;
    } else {
        google_api = GOOGLE_OAUTH2_USERINFO_API_URL;
    }

    return passport._strategies.google.userProfile(google_api, accessToken, function(err, profile) {
        if (err) {
            //return self.error(err); //TypeError: Object #<Passport> has no method 'error'
            if (err.name && err.message) {
                res.send('{"error":"'.concat(err.name, ': ', err.message, '"}'));
            } else {
                res.send('{"error":"OAuth error."}');
            }
        } else {
            if (profile.emails[0].value) {
                req.session.email = profile.emails[0].value;
                res.send('{"identity_email":"'.concat(profile.emails[0].value, '"}'));
            } else {
                if (profile._json && profile._json.permissionId) {
                    var email_mockup;

                    email_mockup = profile._json.permissionId + '@' + 'drive.google.com';

                    req.session.email = email_mockup;
                    res.send('{"identity_email":"'.concat(email_mockup,
                        '", "permission_id":"'.concat(profile._json.permissionId,
                            '", "display_name":"'.concat(profile._json.name, '"}'))));
                } else {
                    res.send('{"error":"Unauthenticated identity."}');
                }
            }
        };
    });
});

apps.get('/logout', function(req, res) {
    res.header("Access-Control-Allow-Origin", req.headers.origin);
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");

    req.logout();
    req.session.email = '';
    //res.redirect('/');
    res.send('{"ok":"Unauthenticated identity."}');
});

apps.post('/ibe-encrypt', function(req, res) {
    res.header("Access-Control-Allow-Origin", req.headers.origin);
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");

    //var keyCnt = parseInt(req.body.keycnt);
    var senderId = '';
    var receiverIdArr = [];//req.body.identities;

    if (req.body.identities.length > 0) {
        receiverIdArr = req.body.identities.split(',');

        for (var i = 0; i < receiverIdArr.length; i++) {
            receiverIdArr[i] = receiverIdArr[i].trim();
        }
    }

    if (req.session.email) {
        senderId = req.session.email;
    }

    if (senderId.length > 0) {
        console.warn('calling ibekg.encryptDataKey(%s, "%s");', dataHashArr.length, receiverIdArr);
        ibekg.encryptDataKey(encryptDataKeyOptions, dataHashArr, senderId, receiverIdArr, function (err, result) {
            console.warn(result);
            if (err == null || err == 0) {
                res.send(result);
            } else {
                if (result)
                    res.send('{\"error\":\"'.concat(result.toString(), '\"}'));
                else
                    res.send('{\"error\":\"undefined error\"}');
            }
        });
    } else {
        res.send('{"error":"Unauthenticated identity."}');
    }
});

apps.post('/ibe-decrypt', function(req, res) {
    res.header("Access-Control-Allow-Origin", req.headers.origin);
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");

    var identityCipherArr = req.body; //req.body.ibeArray;
    var receiverId = '';

    if (req.session.email) {
        receiverId = req.session.email;
    }

    if (receiverId.length > 0) {
        console.warn('calling ibekg.decryptDataKey("%s", "%s");', receiverId, identityCipherArr);
        //ibekg.decrypt(authIdentityDec, ibeArray, function (err, result) {
        ibekg.decryptDataKey(decryptDataKeyOptions, receiverId, identityCipherArr, function (err, result) {
            console.warn(result);
            if (err == null || err == 0) {
                res.send(JSON.stringify(result));
            } else {
                if (result)
                    res.send('{\"error\":\"'.concat(result.toString(), '\"}'));
                else
                    res.send('{\"error\":\"undefined error\"}');
            }
        });
    } else {
        res.send('{"error":"Unauthenticated identity."}');
    }
});

http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
});

https.createServer(options, apps).listen(apps.get('port'), function(){
    console.log("Express server listening on port " + apps.get('port'));
});

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/');
}
