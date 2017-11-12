function compressImages(dirPath) {
    const Kraken = require('utils/kraken');
    const fs = require('fs');
    const wget = require('node-wget');
    const tress = require('tress');
    const kraken = new Kraken({
        api_key: '5a2005829509072d069cce4801c42968',
        api_secret: 'a67fbc9e89c0b5f87037ac9279f0cab0488e48d9'
    });

    let files;
    let q = tress(function (item, done) {
        kraken.upload(item, function (data, err) {
            if(err) {
                console.log(err)
            } else {
                if(data.success) {
                    wget({url: data.kraked_url, dest: `${dirPath}/kraked_images/${data.file_name}`}, function () {
                        done();
                    });
                }

            }
        });
    }, 10);

    fs.readdir(dirPath, function (err, items) {
        files = items.filter(function (item) {
            return item !== '.DS_Store';
        });

        for(let i = 0; i < files.length; i++) {
            q.push({
                file: fs.createReadStream(dirPath + files[i]),
                wait: true,
                resize: {
                    width: 296,
                    strategy: 'landscape'
                }
            })
        }
    });
}

module.exports = compressImages;
