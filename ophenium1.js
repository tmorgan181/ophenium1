const Discord = require('discord.js');
require('dotenv').config();

const client = new Discord.Client();
const prefix = process.env.PREFIX;

client.on('ready', () => {

  //Output connection message
  console.log(`Logged in as ${client.user.tag}`);

  //Set bot status (Default type is "Playing")
  //Alternatively, you can set the activity to any of the following:
  //PLAYING, STREAMING, LISTENING, WATCHING
  //For example:
  //client.user.setActivity("TV", {type: "WATCHING"})*/
  client.user.setActivity("Build-a-Bot");

  /*To get the channel ID, right-click on the channel in the Discord app and
  select [Copy ID]. Paste that inside the get() function as a string.*/

  /*let testChannel = client.channels.get("539642539662245888");
  testChannel.send("Connected...");*/
});

client.on('message', (receivedMessage) => {

  //Prevent bot from responding to itself
  if (receivedMessage.author == client.user) {
    return;
  }

  //Check then process commands starting with !
  if (receivedMessage.content.startsWith("!")) {
    processCommand(receivedMessage);
  }
})

function processCommand(receivedMessage) {

  let fullCommand = receivedMessage.content.slice(1);
  let splitCommand = fullCommand.split(" "); //split message at spaces
  let primaryCommand = splitCommand[0]; //first word is primary command
  //The rest of the words become a string to be used as arguments
  let secondaryCommands = splitCommand.slice(1).toString();

  //Check primaryCommand and act accordingly
  switch (primaryCommand) {
    case (""):
    case (" "):
      receivedMessage.channel.send("You need to enter a command for me to do " +
       "anything... Try `!help` if you're stuck");
      break;
    case "help":
      helpCommand(secondaryCommands, receivedMessage);
      break;
    case "howdy":
      receivedMessage.channel.send("partner");
      break;
    case "ping":
      pingCommand(receivedMessage);
      break;
    case "shout":
      shoutCommand(secondaryCommands, receivedMessage);
      break;
    default:
      receivedMessage.channel.send("Sorry, I don't understand your command. " +
       "Make sure it's formatted as `![command] [arguments]`");
      break;
  }
}

function helpCommand(secondaryCommands, receivedMessage) {

  //Here check for secondaryCommands and act based their presence and value
  if (secondaryCommands.length > 0) {
    switch (secondaryCommands) {
      case "help":
        receivedMessage.channel.send("Well you obv already know how to use it");
        break;
      case "howdy":
        receivedMessage.channel.send("`!howdy` doesn't have any real purpose" +
         ", it just makes me say \"partner\"");
        break;
      case "ping":
        receivedMessage.channel.send("`!ping` doesn't have any real purpose" +
         ", it just makes me say \"pong!\"");
        break;
      case "shout":
        receivedMessage.channel.send("`!shout [message]` simply makes me repeat"
         + " `[message]` in all caps. It will be sent to the channel that "
         + "calls me");
        break;
      default:
        receivedMessage.channel.send("Sorry, I don't know that command...");
    }
  }
  else { //if no secondaryCommands, output list of commands
    receivedMessage.channel.send("Current list of commands (used with " +
     "`![command] [arguments]`):" +
     "\n\n`!help [command]`\t-Lists commands and their descriptions or gives " +
     " a detailed explanation of [command]" +
     "\n`!howdy`\t-Makes me say \"partner\"" +
     "\n`!ping`\t-Makes me say \"pong!\"" +
     "\n`!shout [message]` \t-Sends [message] in all caps to the channel I " +
     "was called from" +
     "\n\nFor a detailed description of one of these commands, use " +
     "`!help [command]`");
  }
}

function shoutCommand(secondaryCommands, receivedMessage) {

  //Check for the shouted message
  if (secondaryCommands.length == 0) {
    receivedMessage.channel.send("You didn't give me anything to shout...");
  }
  else { //format issue here, output LOOKS,LIKE,THIS
    receivedMessage.channel.send(`${secondaryCommands.toUpperCase()}`);
  }
}

function pingCommand(receivedMessage) {

    //Simple return message
    receivedMessage.channel.send("pong!");
}

client.login();
