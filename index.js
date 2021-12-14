const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, addDoc } = require('firebase/firestore/lite');
const tf = require("@tensorflow/tfjs")
const toxicity = require('@tensorflow-models/toxicity');
const MonkeyLearn = require('monkeylearn')
const { MongoClient } = require('mongodb');
require("dotenv").config()

let ReqUrl = 'https://api.monkeylearn.com/v3/classifiers/cl_pi3C7JiL/classify/'
let model_id = 'cl_pi3C7JiL'

const ml = new MonkeyLearn(process.env.MONKEY_KEY)

//tensorflow init
tf.getBackend();
const labelsToInclude = ["toxicity", "threat", "insult"];

const { gptsecret } = require('./config.json');
const got = require('got');
let prompt;


//discord init
const discord_client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
})
discord_client.on("ready", async () => {
    console.log(`Logged in as ${discord_client.user.tag}!`)

    const channel = await discord_client.channels.fetch('896479402144182345').catch(console.log)
    channel.send('nok');
})
discord_client.login(process.env.DISCORD_TOKEN)


//bot interactions
discord_client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'aitegin') {
        await interaction.reply('Wrong, Fanegin!');
    } else if (commandName === 'server') {
        await interaction.reply(`Server name: ${interaction.guild.name}\nTotal members: ${interaction.guild.memberCount}`);
    } else if (commandName === 'user') {
        await interaction.reply(`Your tag: ${interaction.user.tag}\nYour id: ${interaction.user.id}`);
    }
});

discord_client.on("message", async (message) => {

    if (message.content.startsWith("/ban")) {
        let Roles = message.member.roles;
        if (!message.member.hasPermission("ADMINISTRATOR")) {
            message.lineReply("Imagine not being an admin, noob");
            return;
        }

        let member = message.mentions.members.first();
        member.ban().then((member) => {
            message.channel.send(":wave: " + member.displayName + " has been successfully banned. Get out of here, dummy");
        }).catch(() => {
            message.channel.send("Didn't work, not my fault");
        });
    }
    if (message.content.startsWith("/kick")) {

        if (!message.member.hasPermission("ADMINISTRATOR")) {
            message.lineReply("Imagine not being an admin, noob");
            return;
        }

        let member = message.mentions.members.first();
        member.kick().then((member) => {
            message.channel.send(":wave: " + member.displayName + " has been successfully kicked. They will not be missed");
        }).catch(() => {
            message.channel.send("Didn't work, not my fault");
        });
    }

    //run analysis
    let delta_score = 1;
    let response = await checkSentiment([message])
    if (response[0] === "Positive") {
        //increase fb score for user
        databaseAdd(message.member.id, [delta_score, 0, 0, 0])
    }
    else if (response[0] === "Negative") {
        //do stuff with response[2,3,4]
        //decrease score based on response[2,3,4]
        let data = [0, 0, 0, 0];

        await toxicity.load(0.9, labelsToInclude).then(model => {
            //set up message as array!!!
            model.classify(message.content).then(predictions => {
                const rlength = predictions.length;
                for (let i = 0; i < rlength; i++) {
                    //predictions[i].label
                    //let keyword = predictions[i].results[0].match ? "has component " : "other one"
                    if (predictions[i].label) {
                        data[i + 1] = 1
                        delta_score += 2;
                    }
                }
            });
        });
        delta_score *= -1;
        data[0] = delta_score
        databaseAdd(message.member.id, data)
    }

    //send message/reply
    if (checkifValid(message)) {
        let bot_response = respond(message.content);
        message.lineReplyNoMention(bot_response); //Line (Inline) Reply without mention

    }
});


function checkifValid(message) {
    //every x messages
    //or mentions bot
    //or x messages after command typed
    //or keywords to respond to
    const user = message.mentions.users.first();
    if (!user) {
        return; // Do not proceed, there is no user.
    }
    const name = user.username;
    // Do stuff with the username
    if (name != "CheeseBot") {
        return;
    }

    return true;
}


async function checkSentiment(text) {
    let Sentiment = "";
    let fresponse = [];
    await ml.classifiers.classify(model_id, text).then(res => {
        Sentiment = res.body[0].classifications[0].tag_name
        fresponse[0] = res.body[0].classifications[0].tag_name;
    })
    console.log("The message: '" + text + "' has a " + Sentiment + " sentiment")

    return fresponse
}


const chatLog = `The following is a conversation with an AI Assistant.\n`;

async function respond(text) {
    const url = 'https://api.openai.com/v1/engines/curie/completions';
    prompt = `${chatLog}Human: ${text}`
    const params = {
        "prompt": prompt,
        "max_tokens": 200,
        "temperature": 0.9,
        "frequency_penalty": 0.6,
        'stop': '\nHuman'
    };
    const headers = {
        'Authorization': `Bearer ${gptsecret}`,
    };

    try {
        const response = await got.post(url, { json: params, headers: headers }).json();
        let output = `${prompt}${response.choices[0].text}`;
        console.log(output);
    } catch (err) {
        console.log(err);
    }
    return await output
};

function checkRole(Roles, roleName) {
    if (Roles.find("name", roleName)) {
        return true;
    }
    return false;
}

function databaseAdd(id, uData) {
    const query = { "id": id };
    const update = { "$inc": { "score": uData[0], "toxicity": uData[1], "threat": uData[2], "insult": uData[3] } };
    const options = { "upsert": true };

    MongoClient.connect(err => {
        if (err) throw err;
        let dbo = MongoClient.db("Discord Data");
        dbo.collection("Users").updateOne(query, update, options)
            .then(result => {
                const { matchedCount, modifiedCount, upsertedId } = result;
                if (upsertedId) {
                    console.log(`Document not found. Inserted a new document with _id: ${upsertedId}`)
                } else {
                    console.log(`Successfully increased ${query.name} quantity by ${update.$inc.quantity}`)
                }
            })
            .catch(err => console.error(`Failed to upsert document: ${err}`))
    })
}

//khush was here
//khush may or may not have made any changes




