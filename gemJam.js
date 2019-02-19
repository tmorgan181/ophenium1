//Ophenium I - Created by Trenton Morgan 2019
//Module for Gem Jam functions and vars

var fs = require("fs"); //var for file stream so data can be saved
var players = require("./playerData.json"); //array of Gem Jam players

//Object constructor for users in Gem Jam
function GameUser(id) {
  this.userID = id;
  this.crown = false;
  this.lastPlayed = 0;
  this.balance = 0;
  this.gems = [];
  this.items = [];
}


//Arrays of gems based on designated rarity
const commonGems = ["Quartz", "Opal", "Malachite", "Turqoise", "Jade", "Garnet",
                  "Aquamarine", "Amber"];
const uncommonGems = ["Amethyst", "Diamond", "Ruby", "Topaz", "Emerald"];
const rareGems = ["Moonstone", "Sapphire", "Black Opal","Peacock Topaz"];
const allGems = commonGems.concat(uncommonGems, rareGems);

//Rarity constants
const slagLimit = .2;
const commonLimit = .7;
const uncommonLimit = .9;
const rareLimit = 1;

//Wait time (ms)
const waitTime = 300000;

//Array of mines to visit
const mines = ["Nova Stella", "Twin Creeks", "Ebony Abyss"];

//Main function, accessible by ophenium1.js
exports.gemJam = function(args, message) {

  //Check for an argument
  if (!args.length) {
    message.channel.send("Welcome to Gem Jam! For game instructions type " +
     "'!gemJam instruct'");
    return;
  }

  let gameCommand = args[0]; //first argument is primary game command
  let gameArgs = args.slice(1); //rest of array is arguments

  //Get current player's id and check if they have a profile already
  let exists = false;
  let currentPlayer = undefined;
  players.forEach(function(i) {
    if (i.userID == message.author.id) {
      currentPlayer = i;
      exists = true;
    }
  });

  //Game commands
  switch (gameCommand.toLowerCase()) {
    case "instruct": //output game instuctions
      message.channel.send("Gem Jam is a game about collecting gems from the " +
       "mines. There are 17 in total to collect from 3 different mines. When " +
       "you go mining you have a chance of getting gems of varying rarity or " +
       "slag. Gems you recover from the mines can be sold to the Shopkeeper " +
       "for coins or kept and added to your collection. Coins can, in turn, " +
       "be used to buy cool items. Once your collection is " +
       "complete, you can claim your prize: the Crown of Wonder!\nFor a list " +
       "of game commands type `!gemJam commands` or to create a profile type " +
       "`!gemJam create`");
      break;

    case "commands": //output game commands and descriptions
      message.channel.send("Gem Jam Commands (used with `!gemJam [command]`):" +
       "\n`instruct`\t-Show game instructions\n" +
       "`commands`\t-Show game commands\n" +
       "`create`\t-Create a new profile\n" +
       "`remove`\t-Remove your profile\n" +
       "`mine [mineNumber]`\t-Go mining for gems in [mineNumber] (1: Nova " +
       "Stella, 2: Twin Creek, or 3: Ebony Abyss)\n" +
       "`collection`\t-Show your gem collection\n" +
       "`sell [gem]`\t-Sell a gem to the Shopkeeper\n" +
       "`balance`\t-Show your coin balance\n" +
       "`crownMe`\t-Reward a complete collection of gems with the " +
       "legendary Crown of Wonder\n" +
       "`shop`\t-Shop for items with coins");
      break;

    case "create": //create new player profile
      if (exists) { //check if profile has already been made
        message.channel.send("It seems you have already created a profile! For " +
         "game instructions type `!gemJam instruct`");
      }
      else { //otherwise make new profile
        currentPlayer = new GameUser(message.author.id);
        players.push(currentPlayer); //add profile to list
        let jammer = message.guild.roles.find(r => r.name === "Gem Jammer");
        message.member.addRole(jammer);
        fs.writeFileSync("playerData.json", JSON.stringify(players, null, 2),
         "utf-8"); //save changes to local file
        message.channel.send("Profile successfully created!");
      }
      break;

    case "remove": //remove existing profile
      if (exists) {
        players = players.filter(function(element) { //remove profile
          return element.userID != currentPlayer.userID });
        let jammer = message.guild.roles.find(r => r.name === "Gem Jammer");
        message.member.removeRole(jammer); //remove role
        message.channel.send("Profile successfully removed!");
        fs.writeFileSync("playerData.json", JSON.stringify(players, null, 2),
         "utf-8"); //save changes
      }
      else {
        message.channel.send("There is no profile to remove!");
      }
      break;

    case "mine": //go mining for a gem, main game function
      if (exists) { //check profile already made
        let timeSinceLast = Date.now() - currentPlayer.lastPlayed;
        if (timeSinceLast >= waitTime) { //must wait 5 minutes between plays
          let chosenMine = undefined;
          let validMine = false;
          for (let i = 1; i <= mines.length; i++) {
            if (gameArgs[0] == i && !validMine) { //check if mine name is valid
              message.channel.send(`Off to ${mines[(i - 1)]} Mine!`);
              chosenMine = mines[(i - 1)];
              validMine = true;
            }
          }
          if (validMine) {
            let discoveredGem = goMining(message, chosenMine); //get random gem
            if (discoveredGem) {
              currentPlayer.gems.push(discoveredGem);
              message.channel.send(`You found ${discoveredGem}!`);
              if (rareGems.includes(discoveredGem)) {
                message.channel.send("Wow, a rare gem! Great find!");
              }
              else if (uncommonGems.includes(discoveredGem)) {
                message.channel.send("Don't see those too often!");
              }
              else if (commonGems.includes(discoveredGem)) {
                message.channel.send("Not very rare, but still a fine gem.");
              }
              message.channel.send("It's been added to your collection.");
            }
            currentPlayer.lastPlayed = Date.now();
            fs.writeFileSync("playerData.json", JSON.stringify(players, null, 2),
             "utf-8"); //save changes
          }
          else {
            message.channel.send("I'm not sure which mine you mean. Make " +
             "sure you're using the format `!gemJam mine [mineNumber]`");
          }
        }
        else {
          message.channel.send("You must wait 5 minutes between trips to " +
           "the mines! You can go again in " +
            `${((waitTime - timeSinceLast) / 60000).toFixed(2)} minutes`);
        }
      }
      else {
        message.channel.send("You need to make a profile first! Do so with " +
         "`!gemJam create`");
      }
      break;

    case "collection": //show user's current gem collection
      if (exists) {
        let collectionString = "";
        for (let i = 0; i < currentPlayer.gems.length; i++) {
          //Prevent repeats in output
          if (!(collectionString.includes(currentPlayer.gems[i]))) {
            collectionString += (currentPlayer.gems[i] + ", ");
          }
        }
        collectionString = collectionString.slice(0, -2);
        message.channel.send("Here is your collection, " +
         `${message.author.username}:\n${collectionString}`);
      }
      else {
        message.channel.send("You need to make a profile first! Do so with " +
         "`!gemJam create`");
      }
      break;

    case "sell": //sell a gem for coins
      if (exists) {
        message.channel.send("Feature coming soon!");
      }
      else {
        message.channel.send("You need to make a profile first! Do so with " +
         "`!gemJam create`");
      }
      break;

    case "balance": //show user's coin balance
      if (exists) {
        message.channel.send(`${message.author.username}, you currently have ` +
         `${currentPlayer.balance} coins. You can get coins by selling your ` +
         "duplicate gems to the Shopkeeper (with `!gemJam sell`) and use " +
         "them to buy cool stuff (with `!gemJam shop`)");
      }
      else {
        message.channel.send("You need to make a profile first! Do so with " +
         "`!gemJam create`");
      }
      break;

    case "crownme": //give Crown of Wonder to user with full collection
      if (exists) {
        let complete = true;
        allGems.forEach(function(i) { //check if missing any gems
          if (!currentPlayer.gems.includes(i)) {
            complete = false;
          }
        });
        if (complete && !currentPlayer.crown) {
          currentPlayer.crown = true; //edit player profile
          message.member.addRole(message.guild.roles.find(r => r.name ===
           "Crown of Wonder")); //add role
          message.channel.send("Congratulations, you have completed your " +
           "collection of gems and earned the legendary Crown of Wonder! " +
           "You've been awarded the `Crown of Wonder` role.");
          fs.writeFileSync("playerData.json", JSON.stringify(players, null, 2),
           "utf-8"); //save changes
        }
        else if (currentPlayer.crown) {
          message.channel.send("All hail the Crown!");
        }
        else {
          message.channel.send("Your collection isn't complete! Keep hunting!");
        }
      }
      else {
        message.channel.send("You don't even have a profile yet! Create one " +
         "with `!gemJam create`, then get collecting!");
      }
      break;

    case "shop": //shop for items
      if (exists) {
        message.channel.send("Feature coming soon!");
      }
      else {
        message.channel.send("You need to make a profile first! Do so with " +
         "`!gemJam create`");
      }
      break;

    default: //default for unknown commands
      message.channel.send("I don't know that command... For a list of " +
       "commands type `!gemJam commands`");
  }

  return;
}

//Mining function, returns a random gem or slag
function goMining(message, chosenMine) {

  //Mining vars
  let possibleCommons = [];
  let possibleUncommons = [];
  let possibleRares = [];

  let gemType = randomGemType();
  let gemIndex = undefined;
  let discoveredGem = undefined;

  switch (chosenMine) {
    case "Nova Stella":
      possibleCommons = ["Quartz", "Opal", "Malachite", "Jade"];
      possibleUncommons = ["Topaz", "Amethyst", "Diamond"];
      possibleRares = ["Moonstone", "Peacock Topaz"];

      if (gemType == "slag") {
        message.channel.send("Drat, nothing but slag.");
        return;
      }
      else if (gemType == "common") {
        gemIndex = Math.floor(Math.random() * possibleCommons.length);
        discoveredGem = possibleCommons[gemIndex];
      }
      else if (gemType == "uncommon") {
        gemIndex = Math.floor(Math.random() * possibleUncommons.length);
        discoveredGem = possibleUncommons[gemIndex];
      }
      else if (gemType == "rare") {
        gemIndex = Math.floor(Math.random() * possibleRares.length);
        discoveredGem = possibleRares[gemIndex];
      }
      break;

    case "Twin Creeks":
      possibleCommons = ["Turqoise", "Aquamarine", "Malachite", "Jade"];
      possibleUncommons = ["Topaz", "Emerald", "Diamond"];
      possibleRares = ["Sapphire", "Peacock Topaz"];

      if (gemType == "slag") {
        message.channel.send("Drat, nothing but slag.");
        return;
      }
      else if (gemType == "common") {
        gemIndex = Math.floor(Math.random() * possibleCommons.length);
        discoveredGem = possibleCommons[gemIndex];
      }
      else if (gemType == "uncommon") {
        gemIndex = Math.floor(Math.random() * possibleUncommons.length);
        discoveredGem = possibleUncommons[gemIndex];
      }
      else if (gemType == "rare") {
        gemIndex = Math.floor(Math.random() * possibleRares.length);
        discoveredGem = possibleRares[gemIndex];
      }
      break;

    case "Ebony Abyss":
      possibleCommons = ["Quartz", "Garnet", "Amber", "Jade"];
      possibleUncommons = ["Emerald", "Amethyst", "Ruby"];
      possibleRares = ["Moonstone", "Black Opal"];

      if (gemType == "slag") {
        message.channel.send("Drat, nothing but slag.");
        return;
      }
      else if (gemType == "common") {
        gemIndex = Math.floor(Math.random() * possibleCommons.length);
        discoveredGem = possibleCommons[gemIndex];
      }
      else if (gemType == "uncommon") {
        gemIndex = Math.floor(Math.random() * possibleUncommons.length);
        discoveredGem = possibleUncommons[gemIndex];
      }
      else if (gemType == "rare") {
        gemIndex = Math.floor(Math.random() * possibleRares.length);
        discoveredGem = possibleRares[gemIndex];
      }
      break;
  }

  return discoveredGem;
}

//Select a gem type randomly based on rarity of each
function randomGemType() {
  let rand = Math.random();
  let gemType = undefined;
  if (rand >= 0 && rand < slagLimit) {
    gemType = "slag";
  }
  else if (rand >= slagLimit && rand < commonLimit) {
    gemType = "common";
  }
  else if (rand >= commonLimit && rand < uncommonLimit) {
    gemType = "uncommon";
  }
  else if (rand >= uncommonLimit && rand < rareLimit) {
    gemType = "rare";
  }
  else {
    console.log("Math.random() error");
  }

  return gemType;
}
