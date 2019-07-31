#!/usr/bin/env node
const fs = require('fs');
var prompt = require('prompt');
const configPath = './appConf/config.json';
prompt.message = ""; //No message for prompt. Prompt below


//Check to see if application config is
fs.access(configPath, fs.F_OK, (err) => {
    if (err) {
        console.log("[+] Initial Config Required!\n\n");
        initConfig();
    }
    else {
        applicationSetup();
    }
})



function initConfig() {


    var configObj = {};
    //User input to decide config method
    console.log("Chose method to setup application:");
    console.log("1.) Shell");
    console.log("2.) Web Page");
    console.log("3.) Remote system");
    var choice = null;
    var prompt_choice = [{
        name: 'choice',
        validator: /^[1-3]$/,
        warning: 'Choice is not valid, it must be a number between 1 and 3'
    }];
    prompt.start();
    // Prompt and get user input then display those data in console.
    prompt.get(prompt_choice, function (err, result) {
        if (err) {
            console.log(err);
            return 1;
        }
        else {
            choice = result.choice;
            //Per choice run configuration wizard
            if (choice == '1') {
                console.log("Shell Config");
                configObj = shellConfig();
            }
            if (choice == '2') {
                console.log("Web Config");
                configObj = WebUIConfig();
            }
            if (choice == '3') {
                console.log("Remote Config");
                configObj = remoteConfig();
            }

            //Using generated config object turn it to JSON and write to file
            var configJSON = JSON.stringify(configObj);
            fs.writeFile("./appConf/config.json", configJSON, 'utf8', function (err) {
                if (err) {
                    console.log("An error occured while writing JSON Object to File.");
                    return console.log(err);
                }
                console.log("JSON config has been saved.");
            });//write to file
        }//else
    });//Read input
} //end of initConfig

function shellConfig() {
    var config = null;
    var prompt_config = [
        {
            name: 'username',
            validator: /^[a-zA-Z\s\-]+$/,
            warning: 'Username is not valid, it can only contains letters, spaces, or dashes'
        },
        {
            name: 'password',
            hidden: true
        },
        {
            name: 'email',
            hidden: false
        }
    ];

    prompt.start();
    prompt.get(prompt_attributes, function (err, result) {
        if (err) {
            console.log(err);
            return 1;
        }
        else {
            // Get user input from result object.
            config.val = result.val;
            config.val = result.val;
            config.val = result.val;
            return config;
        }
    });
} //end of shellConfig


//Load the config from file
function applicationSetup() {
    //var contents = fs.readFileSync(configPath);
    //var config = JSON.parse(contents);
    //Start application
    console.log("[+] Starting Application");
    var app = require('./index.js');
}

//module.exports = {appconf: config}
