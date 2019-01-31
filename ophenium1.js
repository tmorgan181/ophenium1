
const Discord = require('discord.js');
require('dotenv').config();

const client = new Discord.Client();
const prefix = process.env.PREFIX;

client.on('ready', () => {

  //Output connection message
  console.log(`Logged in as ${client.user.tag}!`);

  // Set bot status to "Playing Build-a-Bot"
  client.user.setActivity("Build-a-Bot");

  /*To get the channel ID, right-click on the channel in the Discord app and
  select [Copy ID]. Paste that inside the get() module as a string.*/

  /*let testChannel = client.channels.get("539642539662245888");
  testChannel.send("Connected...");*/
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
  //The rest of the words become a string to be used as arguments
  let secondaryCommands = splitCommand.slice(1).toString();

  if (primaryCommand == "help") {
    helpCommand(secondaryCommands, receivedMessage);
  } else if (primaryCommand == "shout") {
    shoutCommand(secondaryCommands, receivedMessage);
  } else {
    receivedMessage.channel.send("Sorry, I don't understand your command. " +
     "It's likely due to the fact that I'm a stupid robot, " +
     "but maybe you're the stupid one?");
  }
}

function helpCommand(secondaryCommands, receivedMessage) {
  //Here check for secondaryCommands and act based their presence and value
  if (secondaryCommands.length > 0) {
    switch (secondaryCommands) {
      case "help":
        receivedMessage.channel.send("Well you obv already know how to use it");
        break;
      case "shout":
        receivedMessage.channel.send("`shout [message]` simply makes me repeat"
         + " `[message]` in all caps. It will be sent to the channel that "
         + "calls me");
        break;
      default:
        receivedMessage.channel.send("Sorry, I don't know that command...");
    }
  } else { //if no secondaryCommands, output list of commands
    receivedMessage.channel.send("Current list of commands (used with " +
     "`@Ophenium#2737 [command] [arguments]`):" +
     "\n\n`help [command]`\t-Lists commands and their descriptions or gives a" +
     " detailed explanation of [command]\n`shout [message]`" +
     "\t-Sends [message] in all caps to the channel I was called from" +
     "\n\nFor a detailed description of a command use `help [command]`");
  }
}

function shoutCommand(secondaryCommands, receivedMessage) {

  //Check for the shouted message
  if (secondaryCommands.length == 0) {
    receivedMessage.channel.send("You didn't give me anything to shout... " +
     "Lame.");
  } else { //format issue here, output LOOKS,LIKE,THIS
    receivedMessage.channel.send(`${secondaryCommands.toUpperCase()}`);
  }
}

client.login();
