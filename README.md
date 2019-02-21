## YugiohCSVScraper lets you download card jpg to a specified folder. This program works well with TTS-Deck Editor to move cards into Tabletop Simulator

## Required: Node.js as well as a few modules you may need to download.
```
request 
fs 
https 
csv-parse 
cheerio 
node-localstorage
```

### Setup
1.  Download Node.js from https://nodejs.org/en/
2.  Download YugiohCSVScraper as a zip
3.  Extract YugiohCSVScraper
4.  Open Command Prompt
5.  Navigate to YugiohCSVScraper folder location 
    (Command Prompt uses ``cd folderName`` to move into a folder and ``cd ..`` to move out of a folder. Press 'Tab' to autocomplete     
    folderNames)

6.  Copy and paste this line of code 
>npm install request fs https csv-parse cheerio node-localstorage

7.  (Optional) Open the config.js file with notepad and enter filepaths to csvLocation and folderLocation. Make sure to enter the file locations with double `\\` and end with `\\`
Example: ``C:\\Users\\colea\\Downloads\\Yugioh\\CSV\\``

### Running
1.  Open Command Prompt
2.  Navigate to YugiohCSVScraper folder location 
3.  Type node YugiohCSVScraper.js (Again press 'Tab' to autocomplete)


#### Once running there are 6 commands
```
Enter 'download' to start download proccess
Enter 'set folder' to set the folder location
Enter 'set csv' to set the csv location
Enter 'display' to show locations
Enter 'q' or 'quit' or 'exit' to exit the program
Enter 'h' or 'help' for help while in the program
```
DO NOT type double `\` when  seting folder locations from the program
You will need to create a folder before downloading to said folder

### Notes on Command Prompt
1.  Command Prompt uses ``cd folderName`` to move into a folder and ``cd ..`` to move out of a folder. 
2.  Press 'Tab' to autocomplete folderNames
3.  Right click to 'Paste'
4.  'Ctrl+C' will kill an unresponsive program
5.  Can press 'Ctrl+C' to copy
