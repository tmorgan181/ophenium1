require('dotenv').config;
const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
    // Set bot status to: "Loving you"
    client.user.setActivity("you", {type: "Nothin but lovin'"})
})

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
  let fullCommand = receivedMessage.content.substr(1); //remove the !
  let splitCommand = fullCommand.split(" "); //split message at spaces
  let primaryCommand = splitCommand[0]; //first word after ! is command
  let arguments = splitCommand.slice(1); //all other words are args/parameters

  if (primaryCommand == "help") {
    helpCommand(arguments, receivedMessage);
  } else if (primaryCommand == "shout") {
    shoutCommand(arguments, receivedMessage);
  } else {
    receivedMessage.channel.send("Sorry, I don't understand your command. " +
    "It's likely due to the fact that I'm a stupid robot, " +
    "but maybe you're the stupid one?");
  }
}

function helpCommand(arguments, receivedMessage) {
  if (arguments.length > 0) {
    switch (arguments.content.toString()) {                                //THIS DOESN'T WORK (i think), FIX
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
     " wants me to tell you: " + arguments.toUpperCase());       //THIS DOESN'T WORK, FIX
  }
}

<<<<<<< HEAD
client.login(process.env.TOKEN);
=======
client.login("");
>>>>>>> bc929fb0aacdd81ab94f9b2ebdf17811f83047b1
