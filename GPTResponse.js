const { gptsecret } = require('./config.json');
const got = require('got');
let prompt;
const chatLog = `The following is a conversation with an AI bully. The assistant is clever and rude.` +
    `\nHuman: Hello, who are you?\n` +
    `AI: I'm a human, but it doesn't matter in this conversation. Let's focus on you. What's your name?\n`;

async function respond(text) {
    const url = 'https://api.openai.com/v1/engines/curie/completions';
    prompt=`${chatLog}Human: ${text}`
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
};
respond("are bots better than humans?")
