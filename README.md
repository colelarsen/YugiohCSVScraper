## YugiohCSVScraper takes a folder location and csv location to download card jpgs to the folder  

## Required: Node.js as well as a few modules you may need to download.
```
request 
fs 
https 
csv-parse 
cheerio 
node-localstorage
```

### Once running there are 5 commands
```
Enter 'download' to start download proccess
Enter 'set folder' to set the folder location
Enter 'set csv' to set the csv location
Enter 'display' to show locations
Enter 'q' or 'quit' or 'exit' to exit the program
```

### Setup
1.  Download Node.js from https://nodejs.org/en/
2.  Download YugiohCSVScraper as a zip
3.  Extract YugiohCSVScraper
4.  Open Command Prompt
5.  Navigate to YugiohCSVScraper folder location 
    (Command Prompt uses 'cd folderName' to move into a folder and 'cd ..' to move out of a folder. Press 'Tab' to autocomplete     
    folderNames)

6.  Copy and paste this line of code 
>npm install request fs https csv-parse cheerio node-localstorage

7.  (Optional) Open the config.js file with notepad and enter filepaths to csvLocation and folderLocation. Make sure to enter the file locations with double '\\' and end with '\\'
Example:
>C:\\Users\\colea\\Downloads\\Yugioh\\CSV\\
