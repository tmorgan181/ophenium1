const Discord = require('discord.js');
require('dotenv').config();

const bot = new Discord.Client();
const prefix = process.env.PREFIX;

//Settings for activity
const activity = "Build-a-Bot";
const activityType = "Playing";

//Global vars for connecting to/checking voice channels
var connectedChannel = undefined;
var connectionStatus = undefined;

bot.on('ready', () => {

  //Output connection message
  console.log(`${bot.user.tag} ready`);

  //Set bot status (Default type is "Playing")
  //Alternatively, you can set the activity to any of the following:
  //PLAYING, STREAMING, LISTENING, WATCHING
  //For example:
  //bot.user.setActivity("TV", {type: "WATCHING"})*/
  bot.user.setActivity(`${activity}`, {type: `${activityType}`});
});

bot.on('message', (message) => {

  //Prevent bot from responding to itself
  if (message.author == bot.user) {
    return;
  }

  //Check then process commands starting with !
  if (message.content.startsWith("!")) {
    processCommand(message);
  }
})

function processCommand(message) {

  let fullCommand = message.content.slice(1);
  let splitCommand = fullCommand.split(" "); //split message at spaces
  let primaryCommand = splitCommand[0]; //first word is primary command
  //The rest of the words become a string to be used as arguments
  let secondaryCommands = splitCommand.slice(1).toString();

  //Check primaryCommand and act accordingly
  switch (primaryCommand) {
    case (""):
    case (" "):
      message.channel.send("You need to enter a command for me to do " +
       "anything... Try `!help` if you're stuck");
      break;

    case "help":
      helpCommand(secondaryCommands, message);
      break;

    case "howdy":
      message.channel.send("partner");
      break;

    case "join":
      //Check if calling user is in a voice channel
      if (message.member.voiceChannel) {
        //Check if bot is already connected to that channel
        if (connectedChannel != message.member.voiceChannel) {
          joinCommand(message);
        }
        else {
          message.channel.send("I'm already in your channel!")
        }
      }
      else {
        message.channel.send("You need to join a voice channel first.");
      }
      break;

    case "leave":
      //Check if bot is connected to the same voice channel
      if (message.member.voiceChannel) {
        //Check if bot is connected to the same voice channel as caller
        if (connectionStatus == "connected" &&
            message.member.voiceChannel == connectedChannel) {
          leaveCommand(message);
        }
        else {
          message.channel.send("You have to be in the same channel as me to " +
           "tell me to leave.");
        }
      }
      else {
        message.channel.send("I have to be in a voice channel to leave one!");
      }
      break;

    case "ping":
      message.channel.send("pong!");
      break;

    case "shout":
      shoutCommand(secondaryCommands, message);
      break;

    default:
      message.channel.send("Sorry, I don't understand your command. " +
       "Make sure it's formatted as `![command] [arguments]`");
      break;
  }
}

function helpCommand(secondaryCommands, message) {

  //Here check for secondaryCommands and act based on its presence and value
  if (secondaryCommands.length > 0) {
    switch (secondaryCommands) {
      case "help":
        message.channel.send("Well you obv already know how to use it :)");
        break;

      case "howdy":
        message.channel.send("`!howdy` doesn't have any real purpose" +
         ", it just makes me say \"partner\"");
        break;

      case "join":
        message.channel.send("`!join` makes me join the caller's voice " +
         "channel and can only be activated if they are in one");
        break;

      case "leave":
        message.channel.send("`!leave` makes me leave the caller's voice " +
         "channel and can only be activated if they are in the same one as " +
          "me");
        break;

      case "ping":
        message.channel.send("`!ping` doesn't have any real purpose" +
         ", it just makes me say \"pong!\"");
        break;

      case "shout":
        message.channel.send("`!shout [message]` simply makes me repeat"
         + " `[message]` in all caps. It will be sent to the channel that "
         + "calls me");
        break;

      default:
        message.channel.send("Sorry, I don't know that command...");
    }
  }
  else { //if no secondaryCommands, output list of commands
    message.channel.send("Current list of commands (used with " +
     "`![command] [arguments]`):" +
     "\n\n`!help [command]`\t-Lists commands and their descriptions or gives " +
     " a detailed explanation of [command]" +
     "\n`!howdy`\t-Makes me say \"partner\"" +
     "\n`!join`\t-Makes me join the caller's voice channel" +
     "\n`!leave`\t-Makes me leave the caller's voice channel" +
     "\n`!ping`\t-Makes me say \"pong!\"" +
     "\n`!shout [message]` \t-Sends [message] in all caps to the channel I " +
     "was called from" +
     "\n\nFor a detailed description of one of these commands, use " +
     "`!help [command]`");
  }
}

function joinCommand(message) {

  //Join channel
  message.member.voiceChannel.join()
    .then(connection => {
    });

  //Set connection status and channel
  connectionStatus = "connected";
  connectedChannel = message.member.voiceChannel;

  //Set activity to "Playing Funky Tunes"
  bot.user.setActivity("Funky Tunes");
}

function leaveCommand(message) {

  //Leave channel
  message.guild.voiceConnection.disconnect();

  //Reset connection status and channel
  connectionStatus = "disconnected";
  connectedChannel = undefined;

  //Reset activity
  bot.user.setActivity(`${activity}`, {type: `${activityType}`});
}

function shoutCommand(secondaryCommands, message) {

  //Check for the shouted message
  if (secondaryCommands.length == 0) {
    message.channel.send("You didn't give me anything to shout...");
  }
  else { //format issue here, output LOOKS,LIKE,THIS
    let newMessage = secondaryCommands.toUpperCase();
    message.channel.send(`${newMessage}`);
  }
}

bot.login();
