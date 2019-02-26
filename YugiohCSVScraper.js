var standard_input = process.stdin;

// Set input character encoding.
standard_input.setEncoding('utf-8');

//JavaScript file used for actual scraping
const scraper = require('./scraper.js');
//Config file with variables user should change
const config = require('./config.js');
const fs = require('fs');
var parse = require('csv-parse');
var LocalStorage = require('node-localstorage').LocalStorage,
localStorage = new LocalStorage('./scratch');


//Variables the user should not be able to change
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
    topLevelInput();
}

//Handles User Input
function topLevelInput()
{
    //Terminal Prompt
    prompt(':', function (input) {
        //topLevelInput function of program
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
                    topLevelInput();
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
                topLevelInput();
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
                topLevelInput();
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
            topLevelInput();
        }
        //displays csv location and folder location
        else if(input == "display")
        {
            console.log("\ncsv location: " + "\'" + config.csvLocation + "\'");
            console.log("folder location: " + "\'" + config.folderLocation + "\'\n");
            topLevelInput();
        }
        //Exits program
        else if(input == 'q' || input == "quit" || input == "exit")
        {
            process.exit();
        }
        //If invalid command wait for new prompt
        else
        {
            topLevelInput();
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
                    scraper.downloadCards(cardNames, folderName, topLevelInput); 
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
            topLevelInput();
        }

        //Input must be a card name, check to make sure card name is valid
        else
        {
            var cardTest = urlstart + scraper.convertCardToUrl(input);
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
                        scraper.downloadCards(csvData, folderName, topLevelInput); 
                    });
                }
                catch(err)
                {
                    console.log("Invalid folder location: \'" + config.folderLocation + "\'");
                    topLevelInput();
                }
            });  
        }  
        catch(err)
        {
            console.log("Invalid csv location: \'" + config.csvLocation + "\'");
            topLevelInput();
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
