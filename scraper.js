const request = require('request');
const cheerio = require('cheerio');
var urlstart = 'https://db.ygoprodeck.com/card/?search=';
const config = require('./config.js');
const fs = require('fs');

imgscrape = (name, copies, url, cb) => {
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

//Card names can end with or without ' Xn' or ' xn' where n is any single digit number 
//Return n if it exists, else 0
getCardCopies = function(cardName)
{
    var copies = -1;
    var cardNameLength = cardName.length;
    if((cardName.charAt(cardNameLength-2) == 'X' ||cardName.charAt(cardNameLength-2) == 'x') && cardName.charAt(cardNameLength-3) == ' ')
    {
        try
        {
            copies = cardName.charAt(cardNameLength-1) - 0;
        }
        catch
        {
            copies = -1;
        }
    }
    return copies;
}

stripString = function(inputString)
{
    var j;
    var substitute = "";
    for(j = 0; j < inputString.length; j++)
    {
        if(inputString.charAt(j).match(/[a-z|A-Z|0-9| ]/i))
        {
            substitute += inputString.charAt(j);
        }
    }
    return substitute;
}

var numberOfDownloads = 0;
var successfullyDownloaded = 0;
//Requests the given url and saves it as a .jpg file with provided filename
saveImageToDisk = function(url, localPath, filename, prompt) 
{
    var fullUrl = url;
    filename = filename.replace('\"','');
    filename = filename.replace('\"','');
    filename = filename.replace('\"','');
    request(url).pipe(fs.createWriteStream(localPath + filename + ".jpg"))
      .on('close', function()
      {
        successfullyDownloaded++;
        if(successfullyDownloaded == numberOfDownloads)
        {
            console.log("All Downloaded");
            prompt();
        }
      });
}




module.exports = {
    //Card names can end with or without ' Xn' or ' xn' where n is any single digit number 
    //Strip the ending if it has ' Xn' or ' xn' 
    //Convert all spaces to '%20'
    //Return the card as the url suppliment
    convertCardToUrl: function(cardName)
    {
        var cardNameLength = cardName.length;
        if((cardName.charAt(cardNameLength-2) == 'X' || cardName.charAt(cardNameLength-2) == 'x') && cardName.charAt(cardNameLength-3) == ' ')
        {
            copies = cardName.charAt(cardNameLength-1) - 0;
            cardNameLength = cardNameLength - 3;
            cardName = cardName.substring(0, cardName.length-3);
        }

        var j;
        var cardAsUrl = "";
        for(j = 0; j < cardNameLength; j++)
        {
            if(cardName.charAt(j) == ' ')
            {
                cardAsUrl += '%20';
            }
            else
            {
                cardAsUrl += cardName.charAt(j);
            }
        }
        return cardAsUrl;
    },

    //For each cardName get the number of copies and the url associated
    //WebScrape the image url and pass it to saveImageToDisk
    //If there are multiple copies then save the image multiple times
    downloadCards: function(cardNames, foldername, topLevelInput)
    {
        numberOfDownloads = cardNames.length;
        var i;
        for(i = 0; i < cardNames.length; i++)
        {
            //Obtain card Info
            var copies = getCardCopies(cardNames[i]);
            if(copies == -1 || copies == 0)
            {
                copies = 1;
            }
            console.log(copies + "   :   " + cardNames[i]);
            var cardAsUrl = module.exports.convertCardToUrl(cardNames[i]);

            //Url of card page
            cardAsUrl = urlstart + cardAsUrl;

            //Scrape the url
            imgscrape(cardNames[i], copies, cardAsUrl, (data) => {
                //No copies so only save image once
                if(data.img == "https://ygoprodeck.com/wp-content/uploads/2018/01/card_db_twitter_Card2.jpg")
                {
                    console.log(data.name + "    Is not a valid card name");
                }
                else
                {
                    //Create folder if given one does not exist
                    var folderLocal = config.folderLocation + foldername + "\\";
                    if (!fs.existsSync(folderLocal)){
                        fs.mkdirSync(folderLocal);
                    }
                    

                    data.name = stripString(data.name);
                    if(data.copies == 1)
                    {
                        saveImageToDisk(data.img, folderLocal, data.name, topLevelInput);
                    }

                    //Multiple copies so save image multiple times
                    else
                    {
                        var cardName = data.name.substring(0, data.name.length-3);
                        var counter = 0;
                        for(counter = 1; counter <= data.copies; counter++)
                        {
                            saveImageToDisk(data.img, folderLocal, cardName + "" + counter, topLevelInput);
                        }
                    }
                }
            });
        }
    },

    cardTest: (url, cb) => {
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
                img: $img,
            }
            cb(image);
        }); 
    }

}