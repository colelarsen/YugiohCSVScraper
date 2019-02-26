var standard_input = process.stdin;
// Set input character encoding.
standard_input.setEncoding('utf-8');

//-------------Requirements----------------
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

//Loads csvLocation and folderLocation from config file or localStorage
//Transitions to prompt controller topLevelInput
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
//Most imputs will call topLevelInput() after they run as to wait for more user input
function topLevelInput()
{
    //Terminal Prompt
    prompt(':', function (input) {
        
        //download prompts for the csv file name and scans the csv to make sure it exists
        //readCSV throws and error if it cannot find the csv file
        if(input == "download")
        {
            //Waits for csv file name
            prompt('Input csv name:', function (csvName) {
                try
                {
                    //If csvName ends with '.csv' remove '.csv'
                    if(csvName.endsWith(".csv"))
                    {
                        csvName = csvName.substring(0, csvName.length-3);
                    }
                    //Reads csv data and sends it to downloadCards
                    readCSV(config.csvLocation, csvName);
                }
                //There was an error locating the csv file
                catch(err)
                {
                    console.log("Invalid csv location: " + config.csvLocation);
                    console.log("or\nInvalid csv name: " + csvName);
                    topLevelInput();
                }
            });
        }
        
        //Download cards by typing into the terminal
        //resets cardNames and calls typeCardNames
        else if(input == "download type")
        {
            cardNames = [];
            console.log("Enter card names one at a time, when finished type 'done'");
            typeCardNames();
        }
        
        //Sets folder location in localStorage and config
        //if folderLoc does not end in '\\' add '\\' to it
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
        
        //Sets csv location in localStorage and config
        //if csvLoc does not end in '\\' add '\\' to it
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
        
        //displays all commands and extra advice
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

//typeCardNames handles user input with relation to card names
//typeCardName defaults user input to being a card name.
//card names are tested for being valid before being added to the cardNames array
var cardNames = [];
function typeCardNames()
{
    prompt(': ', function (input) {
        
        //If user is finished entering card names move on to downloadCards unless the cardNames list is empty
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
        
        //Displays all functions available to the user
        else if(input == "help" || input == "h")
        {
            console.log("Enter 'display' to display current cards");
            console.log("Enter 'help' or 'h' to display commands");
            console.log("Enter 'done' or 'finished' to continue on the download process");
            console.log("Enter 'cancel' or 'quit' to cancel typing card names");
            console.log("Enter 'remove x' to remove the card at x");
            console.log("End your card names with ' x2' or ' x3' to have multiple copies downloaded");
            typeCardNames();
        }
        
        //Removes a card at 'x' and displays the current list
        else if(input.startsWith("remove "))
        {
            var removeNum = input.split(" ")[1];
            cardNames.splice(removeNum, 1);
            displayCardNames();
            typeCardNames();
        }
        
        //displays the current list of cards
        else if(input == "display")
        {
            console.log(cardNames);
            displayCardNames();
            typeCardNames();
        }
        
        //traverses back to topLevelInput
        else if(input == "cancel" || input == "stop" || input == "quit" || input == "q")
        {
            console.log("Canceled 'download type'")
            topLevelInput();
        }

        //Input defaults to a card name, check to make sure card name is valid
        else
        {
            //Call the cardTest function
            var cardTest = urlstart + scraper.convertCardToUrl(input);
            scraper.cardTest(cardTest, (data) => {
                //If the img returned is this exact link it means the card was not found in the database
                if(data.img == "https://ygoprodeck.com/wp-content/uploads/2018/01/card_db_twitter_Card2.jpg")
                {
                    //Card does not exist so do not add it to the list of cards
                    console.log(input + "    Is not a valid card name");
                }
                else
                {
                    //Add the card to cardNames
                    cardNames.push(input);
                }
                //call typeCardNames inside the return function so the user does not make more inputs before the program can check
                //if the last card entered was valid
                typeCardNames();
            });
        }
    });
}

//Display the names of cards in cardNames
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
    //read csv fileData
    fs.readFile(inputPath+filename+'.csv', function (err, fileData) {
        try
        {
            //parse fileData into a series of rows
            parse(fileData, {columns: false, trim: true}, function(err, rows) {
                
                //Combine Rows into one array csvData
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
                
                //Try to download the cards
                try
                {
                    prompt('Input folder name:', function (folderName) {
                        scraper.downloadCards(csvData, folderName, topLevelInput); 
                    });
                }
                catch(err)
                {
                    //Folder location is most likely cause of any errors in downloadCards
                    console.log("Invalid folder location: '" + config.folderLocation + "'");
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
