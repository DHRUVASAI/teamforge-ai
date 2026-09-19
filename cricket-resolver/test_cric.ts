import axios from 'axios';
import * as cheerio from 'cheerio';

async function test() {
    const res = await axios.get('https://search.espncricinfo.com/ci/content/site/search.html?search=virat+kohli');
    console.log(res.data.substring(0, 1000));
}
test();
