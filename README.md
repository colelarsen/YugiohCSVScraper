## YugiohCSVScraper lets you download card jpg to a specified folder. This program works well with TTS-Deck Editor to move cards into Tabletop Simulator.
-   https://www.nexusmods.com/tabletopsimulator/mods/266?tab=files
-   http://berserk-games.com/knowledgebase/custom-decks/
-   Note: This README is formatted if opened in a browser https://github.com/colelarsen/YugiohCSVScraper/edit/master/README.md
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

6.  Copy and paste this line of code (Right click to paste into command prompt)
>npm install

7.  (Optional) Open the config.js file with notepad and enter filepaths to csvLocation and folderLocation. Make sure to enter the file locations with double `\\` and end with `\\`
Example: ``C:\\Users\\colea\\Downloads\\Yugioh\\CSV\\``
8.  The program will not work if you do not set the csvLocation and the foldeLocation either through the config file or the program commands

### Running

1.  Obtain a .csv file. This is easily done by using Google Sheets and exporting to a .csv file. Make sure to type card names in different boxes horizontally. If you want multiple copies of a card end the card name with ` x2` or ` x3` **MAKE SURE TO INCLUDE A SPACE BEFORE THE `xn`.**
2.  Open Command Prompt
3.  Navigate to YugiohCSVScraper folder location 
4.  Type `node YugiohCSVScraper.js` (Again press 'Tab' to autocomplete)


#### Once running there are 7 commands
```
Enter 'download' to start download proccess
Enter 'download type' to download via typing instead of csv
Enter 'set folder' to set the folder location
Enter 'set csv' to set the csv location
Enter 'display' to show locations
Enter 'q' or 'quit' or 'exit' to exit the program
Enter 'h' or 'help' for help while in the program
```
- DO NOT type double `\` when  seting folder locations from the program
- You will need to create a folder before downloading to said folder
- Make sure to end all filepaths with a `\` Example: `C:\Users\colea\Downloads\Yugioh\CSV\`
- The program will ask you for the csv file name, provide just the file name without the .csv
- The program will ask you for the folder name. It will look in the provided folder location for a folder with the name you enter, it will save the jpgs to the folder name you provide.
- If a card downloads with a weird image it means the name was spelled wrong.
##### Download Type has 4 commands
```
Enter 'display' to display current cards
Enter 'help' or 'h' to display commands
Enter 'done' to continue on the download process
Enter 'cancel' to cancel typing card names
Enter 'remove x' to remove the card at x
```

### Notes on Command Prompt
1.  Command Prompt uses ``cd folderName`` to move into a folder and ``cd ..`` to move out of a folder. 
2.  Press 'Tab' to autocomplete folderNames
3.  Right click to 'Paste'
4.  'Ctrl+C' will kill an unresponsive program
5.  Can press 'Ctrl+C' to copy
