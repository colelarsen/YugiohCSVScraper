var standard_input = process.stdin;

// Set input character encoding.
standard_input.setEncoding('utf-8');

//JavaScript file used for actual scraping
const scraper = require('./scraper.js');
//Config file with variables user should change
const config = require('./config.js');
const request = require('request');
const fs = require('fs');
var https = require('https');
var parse = require('csv-parse');
var LocalStorage = require('node-localstorage').LocalStorage,

//Variables the user should not be able to change
localStorage = new LocalStorage('./scratch');
var urlstart = 'https://db.ygoprodeck.com/card/?search=';

//Program Start
//Load 
if(config.folderLocation == "")
{
    config.folderLocation = localStorage.getItem("folderLoc");
}
if(config.csvLocation == "")
{
    config.csvLocation = localStorage.getItem("csvLoc");
}
main();

//Handles User Input
function main()
{
    //Terminal Prompt
    prompt(':', function (input) {
        //Main function of program
        if(input == "download")
        {
            //Waits for csv file name
            prompt('Input csv name:', function (csvName) {
                try
                {
                    //Reads csv data and sends it to download
                    readCSV(config.csvLocation, csvName);
                }
                catch(err)
                {
                    console.log("Invalid csv location: " + config.csvLocation);
                    main();
                }
            });
        }
        //Sets folder location
        else if(input == "set folder")
        {
            prompt('Input folder location (the location of the folder, not inside the folder):', function (folderLoc) {
                localStorage.setItem("folderLoc", folderLoc);
                config.folderLocation = localStorage.getItem("folderLoc");
                main();
            });
        }
        //Sets csv location
        else if(input == "set csv")
        {
            prompt('Input location of csv file:', function (csvLoc) {
                localStorage.setItem("csvLoc", csvLoc);
                config.csvLocation = localStorage.getItem("csvLoc");
                main();
            });
        }
        //displays all commands
        else if(input == "help" || input == 'h')
        {
            console.log("This program takes a folder location and csv location to download card jpgs to the folder.");
            console.log("Enter 'download' to start download proccess");
            console.log("Enter 'set folder' to set the folder location");
            console.log("Enter 'set csv' to set the csv location");
            console.log("Enter 'display' to show locations");
            console.log("You can also change the folder location and csv location by going to config.js")
            main();
        }
        //displays csv location and folder location
        else if(input == "display")
        {
            console.log("\ncsv location: " + "\'" + config.csvLocation + "\'");
            console.log("folder location: " + "\'" + config.folderLocation + "\'\n");
            main();
        }
        //Exits program
        else if(input == 'q' || input == "quit" || input == "exit")
        {
            process.exit();
        }
        //If invalid command wait for new prompt
        else
        {
            main();
        }
    });
}

//Reads the csv file into 'fileData' 
//'fileData' is parsed into 'rows' which are all combined
//prompts for folder name
//Sends 'csvData', 'folderName' to downloadCards
function readCSV(inputPath, filename)
{
    fs.readFile(inputPath+filename+'.csv', function (err, fileData) {
        try
        {
            parse(fileData, {columns: false, trim: true}, function(err, rows) {
                //Combine Rows
                var i;
                for(i = 1; i < rows.length; i++)
                {
                    rows[0].concat(rows[i]);
                }
                csvData = rows[0];
                try
                {
                    prompt('Input folder name:', function (folderName) {
                        downloadCards(csvData, folderName); 
                    });
                }
                catch(err)
                {
                    console.log("Invalid folder location: \'" + config.folderLocation + "\'");
                    main();
                }
            });  
        }  
        catch(err)
        {
            console.log("Invalid csv location: \'" + config.csvLocation + "\'");
            main();
        }
    });
}

//Card names can end with or without ' Xn' or ' xn' where n is any single digit number 
//Strip the ending if it has ' Xn' or ' xn' 
//Convert all spaces to '%20'
//Return the card as the url suppliment
function convertCardToUrl(cardName)
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
}

//Card names can end with or without ' Xn' or ' xn' where n is any single digit number 
//Return n if it exists, else 0
function getCardCopies(cardName)
{
    var copies = 0;
    var cardNameLength = cardName.length;
    if((cardName.charAt(cardNameLength-2) == 'X' ||cardName.charAt(cardNameLength-2) == 'x') && cardName.charAt(cardNameLength-3) == ' ')
    {
        copies = cardName.charAt(cardNameLength-1) - 0;
    }
    return copies;
}

//For each cardName get the number of copies and the url associated
//WebScrape the image url and pass it to saveImageToDisk
//If there are multiple copies then save the image multiple times
function downloadCards(cardNames, foldername)
{
    numberOfDownloads = cardNames.length;
    var i;
    for(i = 0; i < cardNames.length; i++)
    {
        //Obtain card Info
        var copies = getCardCopies(cardNames[i]);
        console.log(copies + "   :   " + cardNames[i]);
        var cardAsUrl = convertCardToUrl(cardNames[i]);

        //Url of card page
        cardAsUrl = urlstart + cardAsUrl;

        //Scrape the url
        scraper.imgscrape(cardNames[i], copies, cardAsUrl, (data) => {
            //No copies so only save image once
            if(data.copies == 0)
            {
                saveImageToDisk(data.img, config.folderLocation + foldername + "\\", data.name);
            }

            //Multiple copies so save image multiple times
            else
            {
                var cardName = data.name.substring(0, data.name.length-3);
                var counter = 0;
                for(counter = 1; counter <= data.copies; counter++)
                {
                    saveImageToDisk(data.img, config.folderLocation + foldername + "\\", cardName + "" + counter);
                }
            }
        });
    }
}

var numberOfDownloads = 0;
var successfullyDownloaded = 0;
//Requests the given url and saves it as a .jpg file with provided filename
function saveImageToDisk(url, localPath, filename) {var fullUrl = url;
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
            main();
        }
      });
}

//Standard function for prompting the user for input
function prompt(question, callback) {
    var stdin = process.stdin,
        stdout = process.stdout;
    stdin.resume();
    stdout.write(question);

    stdin.once('data', function (data) {
        callback(data.toString().trim());
    });
}