const fs = require('fs');
const https = require('https');
const wget = require('node-wget');
const writeBinaryPostData = require('./postData');

function sqlifyJson(path, outputFileName) {
    
    const prepearedFile = fs.readFileSync(path, 'utf-8');
    const file = fs.writeFileSync(path, prepearedFile.replace(/'/g, "''"), 'utf-8');
    const data = fs.readFileSync(path);

    let options = {
        host: 'sqlify.io',
        port: 443,
        path: '/api/file',
        method: 'POST',
        headers: {
            'Authorization': 'Bearer yge29889d82550728edfae14e8d0b38c'
        }
    };

    const req = https.request(options, function (res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log(JSON.parse(chunk));
            chunk = JSON.parse(chunk);

            let req = https.request({
                host: 'sqlify.io',
                port: 443,
                path: '/api/step/sqlify/export-sql/run',
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer yge29889d82550728edfae14e8d0b38c'
                }
            }, function (res) {
                res.setEncoding('utf8');
                res.on('data', function (chunk) {
                    chunk = JSON.parse(chunk);
                    console.log(chunk);
                    wget({url: chunk.data.output_file, dest: `./sqls/${outputFileName}.sql`}, function () {
                        console.log('file is uploaded');
                    });
                })
            });

            console.log(chunk.data.file_id);
            writeBinaryPostData(req, new Buffer(chunk.data.file_id), [
                'Content-Disposition: form-data; name="file_id";'
            ])


        });
    });

    req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });

    writeBinaryPostData(req, data, [
        'Content-Disposition: form-data; name="file"; filename="data.json"'
    ]);
}

module.exports = sqlifyJson;