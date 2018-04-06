module.exports = function() {
    return new Promise(function(resolve) {
        var ref = require('ref');
        var FFI = require('ffi');
        var Struct = require('ref-struct');
        var sqlite3 = require('sqlite3').verbose();
        var ArrayType = require('ref-array')
        var fs = require('fs');
        var w;
        var db = new sqlite3.Database(process.env.LOCALAPPDATA + "\\Google\\Chrome\\User Data\\Default\\Cookies");
        db.on('error', function(err) {
            console.error(err);
            process.exit(1);
        });
        var byteArray = ref.refType('char')
        var DATA_BLOB = Struct({
            'CBDATA': 'ulong',
            'pbData': "string"
        })
        var baseDataPtr = ref.refType(DATA_BLOB);
        // console.log(baseDataPtr)
        var crypt32 = new FFI.Library('C:\\Windows\\System32\\crypt32.dll', {
            'CryptUnprotectData': ['bool', [baseDataPtr, 'pointer', baseDataPtr, 'pointer', 'pointer', 'long', baseDataPtr]]
        });
        db.get("SELECT * FROM cookies where host_key like '.nicovideo.jp' and name like 'user_session'", function(err, data) {
            // console.log(data)
            var decodetext = "";
            var size = 8;
            // console.log(data.encrypted_value)
            var buftmp = data.encrypted_value;
            // console.log(buftmp)
            var byteArray = ArrayType('char')
            var buf = new byteArray(buftmp.length)
            var input = new DATA_BLOB({
                'CBDATA': data.encrypted_value.length,
                'pbData': buftmp
            });
            // console.log(input)
            var str = new Buffer(buftmp.length)
            var output = new DATA_BLOB({
                CBDATA: str
            });
            crypt32.CryptUnprotectData(input.ref(), null, null, null, null, 0, output.ref())
            var SESSION = output.pbData.slice(0, output.CBDATA)
            // console.log(SESSION)
            exports.Session = SESSION;
            resolve(SESSION)
        })
        db.close()
    })
}