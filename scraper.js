const request = require('request');
const cheerio = require('cheerio');
exports.imgscrape = (name, copies, url, cb) => {
    request(url, (error, resp, html) => {
        if(error)
        {
            cb({
                error: error
            });
        }
        
        let $ = cheerio.load(html);
        let $url = url;
        let $img = $('meta[property="og:image:secure_url"]').attr('content');
        let image = {
            url: $url,
            img: $img,
            name: name,
            copies: copies
        }

        cb(image);
    }); 
}