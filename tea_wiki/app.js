const tress = require('tress');
const needle = require('needle');
const cheerio = require('cheerio');
const gimages = require('google-images');
const wget = require('node-wget');
const fs = require('fs');
const client = new gimages('008532691615294772421:qbgapdggvqy', 'AIzaSyAz9XfWdHUZE6EbwMPrR1GiJa9VUzxH_dM');

let URL = 'https://en.wikipedia.org/wiki/';
let results = [];

let q = tress(function (url, done) {
    needle.get(url, {follow_max: 5}, function (err, res) {
        if (err) {
            console.log(err)
        }

        let $ = cheerio.load(res.body);
        let name = url.replace(URL, '').replace('_', ' ');
        client.search(name).then((res) => {
            let image;
            image = res.filter(function (elem) {
                if (elem.type === 'image/jpeg' || elem.type === 'image/png') {
                    if (elem.width >= 296 && elem.height >= 196) {
                        if (elem.url.match(/\.jpg$/)) {
                            return true;
                        }
                    }
                }
                return false;
            });

            console.log(image[0]);
            wget({url: image[0].url, dest: `./images/${name.replace(' ', '_').trim().toLowerCase()}.jpg`}, function (error, res, body) {
                if (!error) {
                    results.push({
                        name: name,
                        url: url,
                        text: $('#mw-content-text p').text().replace(/\[\w\]/g, ''),
                        image: image[0].url
                    });

                } else {
                    console.log(error)
                }
                done();

            });
        }).catch((err) => {
            console.log(err);
            done();
        });
    });
}, 10);

q.drain = function () {
    fs.writeFileSync('./data.json', JSON.stringify(results), 'utf-8');
};

const teas = JSON.parse(fs.readFileSync('./names.json', 'utf-8'));
for (let i = 0; i < teas.length; i++) {
    let url = URL + teas[i].name.replace(/ /g, '_');
    q.push(url);
}

