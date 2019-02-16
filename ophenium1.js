const Discord = require('discord.js');
const YTDL = require("ytdl-core");
require('dotenv').config();

const bot = new Discord.Client();
const prefix = process.env.PREFIX;

//Settings for activity
const activity = "Build-a-Bot";
const activityType = "Playing";

//Global vars for connecting to/checking voice channels
var connectedChannel = undefined;
var connectionStatus = undefined;

//Object for guild's queue, NEEDS TO BE CHANGED TO AN OBJECT CONSTRUCTOR FOR
//EACH GUILD
var servers = {
  queue: []
};

//Object constructor for users in Gem Jam
function GameUser(id) {
  this.userID = id;
  this.crown = false;
  this.balance = 0;
  this.gems = [];
  this.items = [];
}

//List of Gem Jam players
var players = [];

//Function for startup
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

//Function for received message
bot.on('message', (message) => {

  //Prevent bot from responding to itself
  if (message.author == bot.user) {
    return;
  }

  //Check then process commands starting with !
  if (message.content.startsWith("!")) {
    processCommand(message);
  }
  else {
    return;
  }
})

function processCommand(message) {

  let fullCommand = message.content.slice(1);
  let splitCommand = fullCommand.split(" "); //split message at spaces
  let primaryCommand = splitCommand[0]; //first word is primary command
  //The rest of the words become a string to be used as arguments
  let args = splitCommand.slice(1).toString();

  //Check primaryCommand and act accordingly
  switch (primaryCommand.toLowerCase()) {
    case (""):
    case (" "):
      message.channel.send("You need to enter a command for me to do " +
       "anything... Try `!help` if you're stuck");
      break;

    case "gemJam":
      gemJam(args, message);
      break;

    case "help":
      helpCommand(args, message);
      break;

    case "howdy":
      message.channel.send("partner");
      break;

    case "iloveyou":
      message.channel.send(":heart: :blush:");
      break;

    case "join":
      //Check if calling user is in a voice channel
      if (message.member.voiceChannel) {
        //Check if bot is connected to that channel as well
        if (connectedChannel != message.member.voiceChannel) {
          joinCommand(message);
        }
        else {
          message.channel.send("I'm already in your channel!")
          return;
        }
      }
      else {
        message.channel.send("You need to join a voice channel first.");
        return;
      }
      break;

    case "leave":
      //Check if bot is connected to a voice channel
      if (connectionStatus == "connected") {
        //Check if bot is connected to same channel as caller
        if (message.member.voiceChannel == connectedChannel) {
          leaveCommand(message);
        }
        else {
          message.channel.send("You have to be in the same channel as me to " +
           "tell me to leave.");
          return;
        }
      }
      else {
        message.channel.send("I have to be in a voice channel to leave one!");
        return;
      }
      break;

    case "play":
      //Check if server is defined
      if (!servers[message.guild.id]) {
        message.channel.send("Please add a song to the queue first with " +
         "`!queue [link]`");
        return;
      }
      var server = servers[message.guild.id];
      //Check if queue is empty
      if (!server.queue.length) {
        message.channel.send("The queue is empty! Add a song to it with " +
         "`!queue [link]`");
        return;
      }
      //Check if music is already playing
      if (server.dispatcher) {
        message.channel.send("I'm already playing the queue.")
        return;
      }
      if (!message.member.voiceChannel) { //check user is in voice channel
        message.channel.send("You must be in a voice channel first!")
        return;
      }
      if (connectionStatus != "connected") { //check bot is in voice channel
        message.channel.send("I must be in a voice channel first! (Make me " +
        "join yours with `!join`)");
        return;
      }
      //Check that bot and user are in same channel
      if (connectedChannel != message.member.voiceChannel) {
        message.channel.send("We must be in the same voice channel to use " +
         "this command.")
        return;
      }
      //Finally, if all checks pass, play the queue
      playCommand(server, message);
      break;

    case "queue":
      //Check if link is from Youtube
      if (!message.content.includes("www.youtube.com")) {
        message.channel.send("Please enter a link from youtube.com");
        return;
      }
      //Check if server object is defined, create it if not
      if (!servers[message.guild.id]) {
        servers[message.guild.id] = {
          queue: []
        }
      }
      var server = servers[message.guild.id];
      //Add link to end of queue array
      server.queue.push(message.content.slice(6));
      message.channel.send("Your song has been added. There are currently " +
       `${server.queue.length} songs in the queue.`);
      break;

    case "qstatus":
      //Check if a queue exists
      if (!servers[message.guild.id]) {
        message.channel.send("There is currently no queue. Create one with " +
         "`!queue [link]`");
        return;
      }
      var server = servers[message.guild.id];
      message.channel.send(`There are currently ${server.queue.length} songs ` +
       "in the queue.");
      break;

    case "clearq":
      //Check if server queue is defined
      if (!servers[message.guild.id]) {
        message.channel.send("There is no queue to clear! (Make one with " +
         "`!queue [link]`)");
        return;
      }
      var server = servers[message.guild.id];
      if (server.queue.length) {
        server.queue.length = 0;
        message.channel.send("Queue successfully cleared!");
      }
      else {
        message.channel.send("The queue is already empty!");
        return;
      }
      break;

    case "pause":
      //Check that bot and user are in same channel
      if (connectedChannel != message.member.voiceChannel) {
        message.channel.send("We must be in the same voice channel to use " +
         "this command.")
        return;
      }
      //Check if server is defined
      if (!servers[message.guild.id]) {
        message.channel.send("There is no music playing.");
        return;
      }
      var server = servers[message.guild.id];
      //Check if dispatcher exists
      if (!server.dispatcher) {
        message.channel.send("There is no music playing.");
        return;
      }
      //Check if already paused
      if (server.dispatcher.paused) {
        message.channel.send("The music is already paused.")
        return;
      }
      //Pause if all checks pass, send confirmation
      server.dispatcher.pause();
      message.channel.send("Paused");
      break;

    case "resume":
      //Check that bot and user are in same channel
      if (connectedChannel != message.member.voiceChannel) {
        message.channel.send("We must be in the same voice channel to use " +
         "this command.")
        return;
      }
      //Check if server is defined
      if (!servers[message.guild.id]) {
        message.channel.send("There is no music to resume.");
        return;
      }
      var server = servers[message.guild.id];
      //Check if dispatcher exists
      if (!server.dispatcher) {
        message.channel.send("You must start playing music first. (Do so with " +
         "`!play`)");
        return;
      }
      //Check if already playing
      if (!server.dispatcher.paused) {
        message.channel.send("Music is already playing!")
        return;
      }
      //Resume if all checks pass, send confirmation
      server.dispatcher.resume();
      message.channel.send("Resumed");
      break;

    case "skip":
      //Check if server is defined
      if (!servers[message.guild.id]) {
        message.channel.send("There are no songs in the queue, so I can't " +
         "skip.");
        return;
      }
      var server = servers[message.guild.id];
      //Check if a song is playing
      if (server.dispatcher) {
        server.dispatcher.end();
      }
      else {
        message.channel.send("I'm not playing anything right now! (Use " +
        "`!play` to play what's in the queue)");
      }
      break;

    case "stop":
      //Check if server is defined
      if (!servers[message.guild.id]) {
        message.channel.send("There is nothing playing right now.");
        return;
      }
      var server = servers[message.guild.id];
      if (!server.dispatcher) {
        message.channel.send("I'm not playing anything right now!");
        return;
      }
      if (message.guild.voiceConnection) {
        leaveCommand(message);
      }
      break;

    case "modsrgay":  //heh you found my easter egg
      message.channel.send("It is known");
      break;

    case "ping":
      message.channel.send("pong!");
      break;

    case "shout":
      shoutCommand(args, message);
      break;

    default:
      message.channel.send("Sorry, I don't understand your command. " +
       "Make sure it's formatted as `![command] [arguments]`");
      break;
  }
}

function helpCommand(args, message) {

  //Here check for args and act based on its presence and value
  if (args.length > 0) {
    switch (args) {
      case "gemJam":
        message.channel.send("`!gemJam [command]` performs [command] within " +
         "Gem Jam, a fun little game about collecting rare gems! For full " +
         "game instructions type `!gemJam help`");
        break;

      case "help":
        message.channel.send("Well you obv already know how to use it :)");
        break;

      case "howdy":
        message.channel.send("`!howdy` doesn't have any real purpose, it " +
         "just makes me say \"partner\"");
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

      case "play":
        message.channel.send("`!play` causes the first song in the queue to " +
         "play unless the queue is empty");
        break;

      case "pause":
        message.channel.send("`!pause` pauses the current song");
        break;

      case "resume":
        message.channel.send("`!resume` resumes the current song");
        break;

      case "skip":
        message.channel.send("`!skip` skips the current song");
        break;

      case "stop":
        message.channel.send("`!stop` ends the music stream and makes me " +
         "leave the voice channel");
        break;

      case "queue":
        message.channel.send("`!queue [link]` adds [link] to the end of the " +
         "queue");
        break;

      case "qstatus":
        message.channel.send("`!qstatus` displays how many songs are " +
         "currently in the queue");
        break;

      case "clearq":
        message.channel.send("`!clearq` clears the song queue");
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
        message.channel.send(`Sorry, \`${message.content.slice(5)}\` is not ` +
        "one of my commands. For a full list of commands type `!help`");
    }
  }
  else { //if no args, output list of commands
    message.channel.send("Current list of commands (used with " +
     "`![command] [arguments]`):" +
     "\n\n`!help [command]`\t-Lists commands and their descriptions or gives " +
      "a detailed explanation of [command]" +
     "\n`!gemJam [command]`\t-Command prefix for Gem Jam game. For full game " +
      "instructions type `!gemJam help`" +
     "\n`!howdy`\t-Makes me say \"partner\"" +
     "\n`!join`\t-Makes me join the caller's voice channel" +
     "\n`!leave`\t-Makes me leave the caller's voice channel" +
     "\n`!play`\t-Plays the first song in the queue" +
     "\n`!pause`\t-Pauses the current song" +
     "\n`!resume`\t-Resumes the current song" +
     "\n`!skip`\t-Skips the current song" +
     "\n`!stop`\t-Stops playing music, makes me leave the voice channel" +
     "\n`!queue [link]`\t-Adds [link] to the back of the queue" +
     "\n`!qstatus`\t-Tells how many songs are in the queue" +
     "\n`!clearq`\t-Clears the queue" +
     "\n`!ping`\t-Makes me say \"pong!\"" +
     "\n`!shout [message]` \t-Sends [message] in all caps to the channel I " +
     "was called from" +
     "\n\nFor a detailed description of one of these commands, use " +
     "`!help [command]`");
  }
}

function joinCommand(message) {

  //Join channel (this is a magic function, idk how it actually works lol)
  message.member.voiceChannel.join()
    .then(connection => {
    });

  //Set connection status and channel
  connectionStatus = "connected";
  connectedChannel = message.member.voiceChannel;
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

function playCommand(server, message) {

  //Play first link in queue (audio only)
  server.dispatcher =
   message.guild.voiceConnection.playStream(YTDL(server.queue[0],
    {filter: "audioonly"}));

  //Remove first element of queue
  server.queue.shift();

  server.dispatcher.on("end", () => {
    if (server.queue[0]) {
      playCommand(server, message);
    }
    else {
      message.channel.send("The queue is now empty. Add more songs with " +
       `!queue [link]`);
      //Reset bot activity
      bot.user.setActivity(`${activity}`, {type: `${activityType}`});
      return;
    }
  })

  //Set activity to "Playing Funky Tunes"
  bot.user.setActivity("Funky Tunes");
}

function shoutCommand(args, message) {

  //Check for the shouted message
  if (!args.length) {
    message.channel.send("You didn't give me anything to shout...");
  }
  else {
    //Get [message] only and turn to upper case
    let newMessage = message.content.slice(7);
    message.channel.send(`${newMessage.toUpperCase()}`);
  }
}

function gemJam(args, message) {

  //Check for an argument
  if (!args.length) {
    message.channel.send("Welcome to Gem Jam! For game instructions type " +
     "'!gemJam help'");
    return;
  }

  //Get current player's id
  let exists = false;
  let currentPlayer = undefined;
  players.forEach(function(i) {
    if (i.userID == message.author.id) {
      currentPlayer = i;
      exists = true;
    }
  });

  //Game commands
  switch (args) {
    case "help": //output game instuctions and command opotions

      break;

    case "create": //create new profile
      if (exists) { //check if profile has already been made
        message.channel.send("It seems you have already created a profile! For " +
         "game instructions type `!gemJam help`");
      }
      else { //otherwise make new profile
        players.push(new GameUser(message.author.id));
        message.channel.send("Profile successfully created!");
        //Save player profiles later when we get to file streaming
      }
      break;

    case "mine": //go mining for a gem, main game function
      if (exists) {

      }
      else {
        message.channel.send("You need to make a profile first! Do so with " +
         "`!gemJam create`");
      }
      break;

    case "collection": //show user's current gem collection
      if (exists) {

      }
      else {
        message.channel.send("You need to make a profile first! Do so with " +
         "`!gemJam create`");
      }
      break;

    case "sell": //sell a gem for coins
      if (exists) {

      }
      else {
        message.channel.send("You need to make a profile first! Do so with " +
         "`!gemJam create`");
      }
      break;

    case "balance": //show user's coin balance
      if (exists) {
        message.channel.send(`${message.author.username}, you currently have ` +
         `${currentPlayer.balance} coins. You can get more by selling your ` +
         "duplicate gems to the Shopkeeper (with `!gemJam sell`) or use them to " +
         "buy cool stuff (with `!gemJam shop`)");
      }
      else {
        message.channel.send("You need to make a profile first! Do so with " +
         "`!gemJam create`");
      }
      break;

    case "crownMe": //give Crown of Wonder to user with full collection
      if (exists) {

      }
      else {
        message.channel.send("You need to make a profile first! Do so with " +
         "`!gemJam create`");
      }
      break;

    case "shop": //shop for items
      if (exists) {

      }
      else {
        message.channel.send("You need to make a profile first! Do so with " +
         "`!gemJam create`");
      }
      break;

    default: //default for unknown commands
      message.channel.send("I'm not sure what you mean... For game " +
       "instructions type `!gemJam help`");
  }
}

bot.login();
