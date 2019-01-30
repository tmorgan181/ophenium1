//test program from
//https://github.com/AnIdiotsGuide/discordjs-bot-guide/blob/master/other-guides/env-files.md

const Discord = require('discord.js');
require('dotenv').config();

const client = new Discord.Client();

// "process.env" accesses the environment variables for the running node process. PREFIX is the environment variable you defined in your .env file
const prefix = process.env.PREFIX;

client.on('ready', () => {

  //Output connection message
  console.log(`Logged in as ${client.user.tag}!`);

  // Set bot status too "${type} arg1"
  client.user.setActivity("Build-a-Bot");

  /*To get the channel ID, right-click on the channel in the Discord app and
  select [Copy ID]. Paste that inside the get() module as a string.*/

  let testChannel = client.channels.get("539642539662245888");
  testChannel.send("Connected...");
});

client.on('message', (receivedMessage) => {
  //Prevent bot from responding to itself
  if (receivedMessage.author == client.user) {
    return;
  }

  if (receivedMessage.content.includes(client.user.toString())) {
    processCommand(receivedMessage);
  }
})

function processCommand(receivedMessage) {

  let userLength = client.user.toString().length + 1; //get mention link
  let fullCommand = receivedMessage.content.slice(userLength);
  let splitCommand = fullCommand.split(" "); //split message at spaces
  let primaryCommand = splitCommand[0]; //first word is primary command
  let arguments = splitCommand.slice(1); //rest of words are arguments

  if (primaryCommand == "help") {
    receivedMessage.channel.send("You said help");
    //helpCommand(arguments, receivedMessage);
  } else if (primaryCommand == "shout") {
    receivedMessage.channel.send("You said shout");
    //shoutCommand(arguments, receivedMessage);
  } else {
    receivedMessage.channel.send("Sorry, I don't understand your command. " +
    "It's likely due to the fact that I'm a stupid robot, " +
    "but maybe you're the stupid one?");
  }
}
/*
function helpCommand(arguments, receivedMessage) {
  if (arguments.length > 0) {
    switch (arguments.content.toString()) { //THIS DOESN'T WORK (i think), FIX
      case "help":
        receivedMessage.channel.send("Well you obv already know how to use it");
        break;
      case "shout":
        receivedMessage.channel.send("`!shout message` simply makes me repeat " +
          "`message` in all caps.");
        break;
      default:
        receivedMessage.channel.send("Sorry, I don't know that command...");
    }
  } else {
    receivedMessage.channel.send("Current list of commands: " +
     "\n`!help [command]`\n`!shout [message]`");
  }
}

function shoutCommand(arguments, receivedMessage) {
  if (arguments.length == 0) {
    receivedMessage.channel.send("You didn't give me anything to shout... " +
     "Lame.");
  } else {
    receivedMessage.channel.send(receivedMessage.author.toString() +
     " wants to say: " + arguments.toUpperCase()); //THIS DOESN'T WORK, FIX
  }
}
*/
client.login();
