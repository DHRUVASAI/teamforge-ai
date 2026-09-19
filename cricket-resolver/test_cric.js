const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
    try {
        const res = await axios.get('https://www.espncricinfo.com/cricketers/virat-kohli-253802', {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const $ = cheerio.load(res.data);
        console.log("all metas:", $('meta').map((i, el) => $(el).attr('name') + '=' + $(el).attr('content')).get());
    } catch(e) {
        console.log(e.message);
    }
}
test();
