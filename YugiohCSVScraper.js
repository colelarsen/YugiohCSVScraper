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
startProgram();
function startProgram()
{
    //Load
    if(config.folderLocation == "")
    {
        config.folderLocation = localStorage.getItem("folderLoc");
        if(config.folderLocation.charAt(config.folderLocation.length-1) != "\\")
        {
            config.folderLocation += "\\";
        }
    }
    if(config.csvLocation == "")
    {
        config.csvLocation = localStorage.getItem("csvLoc");
        if(config.csvLocation.charAt(config.csvLocation.length-1) != "\\")
        {
            config.csvLocation += "\\";
        }
    }
    console.log("Welcome to YugiohCSVScraper, Type 'help' for help. Thank you!")
    main();
}

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
        //Download cards by name
        else if(input == "download type")
        {
            cardNames = [];
            console.log("Enter card names one at a time, when finished type 'done'");
            typeCardNames();
        }
        //Sets folder location
        else if(input == "set folder")
        {
            prompt('Input folder location (the location of the folder, not inside the folder):', function (folderLoc) {
                if(folderLoc.charAt(folderLoc.length-1) != "\\")
                {
                    folderLoc += "\\";
                }
                localStorage.setItem("folderLoc", folderLoc);
                config.folderLocation = localStorage.getItem("folderLoc");
                main();
            });
        }
        //Sets csv location
        else if(input == "set csv")
        {
            prompt('Input location of csv file:', function (csvLoc) {
                if(csvLoc.charAt(csvLoc.length-1) != "\\")
                {
                        csvLoc += "\\";
                }
                localStorage.setItem("csvLoc", csvLoc);
                config.csvLocation = localStorage.getItem("csvLoc");
                main();
            });
        }
        //displays all commands
        else if(input == "help" || input == 'h')
        {
            console.log("Enter 'download' to start download proccess\n" +
            "Enter 'download type' to download via typing instead of csv" +
            "Enter 'set folder' to set the folder location\n" +
            "Enter 'set csv' to set the csv location\n" +
            "Enter 'display' to show locations\n" +
            "Enter 'q' or 'quit' or 'exit' to exit the program\n" +
            "Enter 'h' or 'help' for help while in the program\n" +
            
            "- DO NOT type double '\\' when  seting folder locations from the program\n" +
            "- Make sure to end all filepaths with a '\\' Example: 'C:\\Users\\colea\\Downloads\\Yugioh\\CSV\\'\n" +
            "- The program will ask you for the csv file name, provide just the file name without the .csv\n" +
            "- The program will ask you for the folder name. It will look in the provided folder location for a folder with the name you enter, it will save the jpgs to the folder name you provide.\n" +
            "- If a card downloads with a weird image it means the name was spelled wrong.");
            console.log("\n\nCSV FORMAT: Obtain a .csv file. This is easily done by using Google Sheets and exporting to a .csv file. Make sure to type card names in different boxes horizontally. If you want multiple copies of a card end the card name with ` x2` or ` x3` MAKE SURE TO INCLUDE A SPACE BEFORE THE `xn`.")
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

var cardNames = [];
function typeCardNames()
{
    prompt(': ', function (input) {
        if(input == "done" || input == "finished")
        {
            if(cardNames.length == 0)
            {
                console.log("No cards in list");
                typeCardNames();
            }
            else
            {
                prompt('Input folder name:', function (folderName) {
                    downloadCards(cardNames, folderName); 
                });
            }
        }
        else if(input == "help" || input == "h")
        {
            console.log("Enter 'display' or 'finished' to display current cards");
            console.log("Enter 'help' or 'h' to display commands");
            console.log("Enter 'done' to continue on the download process");
            console.log("Enter 'cancel' to cancel typing card names");
            console.log("Enter 'remove x' to remove the card at x");
            console.log("End your card names with ' x2' or ' x3' to have multiple copies downloaded");
            typeCardNames();
        }
        else if(input.startsWith("remove "))
        {
            var removeNum = input.split(" ")[1];
            cardNames.splice(removeNum, 1);
            displayCardNames();
            typeCardNames();
        }
        else if(input == "display")
        {
            displayCardNames();
            typeCardNames();
        }
        else if(input == "cancel" || input == "stop" || input == "quit" || input == "q")
        {
            console.log("Canceled 'download type'")
            main();
        }

        //Input must be a card name, check to make sure card name is valid
        else
        {
            var cardTest = urlstart + convertCardToUrl(input);
            scraper.cardTest(cardTest, (data) => {
                if(data.img == "https://ygoprodeck.com/wp-content/uploads/2018/01/card_db_twitter_Card2.jpg")
                {
                    console.log(input + "    Is not a valid card name");
                }
                else
                {
                    cardNames.push(input);
                }
                typeCardNames();
            });
            
        }
    });
}

function displayCardNames()
{
    var i = 0;
    for(i = 0; i < cardNames.length; i++)
    {
        console.log(i + ":    " + cardNames[i]);
    }
    if(cardNames.length == 0)
    {
        console.log("No cards in list");
    }
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
                var csvData = [];
                for(i = 0; i < rows.length; i++)
                {
                    var j = 0;
                    for(j = 0; j < rows[i].length; j++)
                    {
                        if(rows[i][j] != '')
                        {
                            csvData.push(rows[i][j]);
                        }
                    }
                }
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
        if(copies == -1 || copies == 0)
        {
            copies = 1;
        }
        console.log(copies + "   :   " + cardNames[i]);
        var cardAsUrl = convertCardToUrl(cardNames[i]);

        //Url of card page
        cardAsUrl = urlstart + cardAsUrl;

        //Scrape the url
        scraper.imgscrape(cardNames[i], copies, cardAsUrl, (data) => {
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
                    saveImageToDisk(data.img, folderLocal, data.name);
                }

                //Multiple copies so save image multiple times
                else
                {
                    var cardName = data.name.substring(0, data.name.length-3);
                    var counter = 0;
                    for(counter = 1; counter <= data.copies; counter++)
                    {
                        saveImageToDisk(data.img, folderLocal, cardName + "" + counter);
                    }
                }
            }
        });
    }
}

function stripString(inputString)
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
