const { monkeKey } = require('./config.json');
const tf= require("@tensorflow/tfjs")
const toxicity =require('@tensorflow-models/toxicity');
const MonkeyLearn = require('monkeylearn')

let ReqUrl='https://api.monkeylearn.com/v3/classifiers/cl_pi3C7JiL/classify/'
let model_id = 'cl_pi3C7JiL'

const threshold = 0.9;
const labelsToInclude = ["identity_attack","toxicity","severe_toxicity", "threat", "insult"];
const ml = new MonkeyLearn(monkeKey)
tf.getBackend();

//let text = ["Cheesebot is evil!"];

async function checkSentiment(text) {
    let Sentiment = "";
    await ml.classifiers.classify(model_id, text).then(res => {
        Sentiment = res.body[0].classifications[0].tag_name
    })
    console.log("The message: '" + text + "' has a " + Sentiment + " sentiment")

    toxicity.load(threshold, labelsToInclude).then(model => {
        model.classify(text).then(predictions => {
            const rlength = predictions.length;
            for (let i = 0; i < rlength; i++) {
                let matchcheck = predictions[i].results;
                //predictions[i].label
                let keyword = ""
                if (predictions[i].results[0].match === true) {
                    keyword = "has component "
                } else {
                    keyword = "does not have component "
                }
                console.log("The message " + keyword + predictions[i].label)
            }
        });
    });

}
checkSentiment(["timothy is a bad boy"])



