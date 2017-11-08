const tress = require('tress');
const needle = require('needle');
const cheerio = require('cheerio');
const fs = require('fs');

let URL = 'https://developerslife.ru/random';
let results = [];
let repeatsCount = 0;

process.on('SIGINT', () => {
    postProcessResult();
    console.log('data saved');
    process.exit();
});

let q = tress(function(url, done){
    needle.get(url, {follow_max: 5}, function(err, res){
        if (err) { console.log(err) };

        let $ = cheerio.load(res.body);

        const $entryCode = $('.entry .code');
        
        let descr = $entryCode.eq(0).children('.value').text().replace(/'$/g, '').replace(/^'/g, '');
        let videoUrl = $('.entry .image video source').eq(1).attr('src');
        let gifUrl = $('.entry .image video backup_img').attr('src');
        let rating = $entryCode.eq(2).children('.value').text();
        let id = $('input.entryId').val();

        if(+rating >= 1 && !checkDuplicate(results, id) && (videoUrl !== undefined && gifUrl !== undefined)) {
            results.push({
                text: descr, 
                videoUrl: 'https:' + videoUrl, 
                gifUrl: 'https:' + gifUrl, 
                rating: +rating, 
                id: +id
            });
        }

        if(repeatsCount !== 2000) {
            console.log(id, 'count: ' + results.length);
            q.push(URL);
        }

        done();
    });
}, 10);

function checkDuplicate(arr, id) {
    let repeated = arr.filter(function (item) {
        return item.id === +id;
    });

    if(repeated.length) {
        repeatsCount++;
        console.log(`Item with ${id} is repeated. Number of repeat ${repeatsCount}`);
        return true;
    }

    return false;
}

q.drain = function () {
    postProcessResult();
};

function postProcessResult() {
    let arr = [];
    results = results.sort(function (a, b) {
        return a.rating - b.rating;
    }).reverse();
    results.filter(function(item){
        let i = arr.findIndex(x => x.id === item.id);
        if(i <= -1)
            arr.push(item);
    });
    fs.writeFileSync('./data.json', JSON.stringify(arr), 'utf-8');
    return arr;
}

q.push(URL);