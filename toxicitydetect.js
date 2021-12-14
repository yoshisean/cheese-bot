
const tf= require("@tensorflow/tfjs")
const toxicity =require('@tensorflow-models/toxicity');
tf.getBackend();
const threshold = 0.9;

// Which toxicity labels to return.
const labelsToInclude = ["identity_attack","toxicity","severe_toxicity", "threat", "insult"];

toxicity.load(threshold, labelsToInclude).then(model => {
    // Now you can use the `model` object to label sentences.
    let message="shut up you dummy";
    model.classify([message]).then(predictions => {
        const rlength=predictions.length;
        for(let i=0; i<rlength;i++) {
            let matchcheck=predictions[i].results;
            //predictions[i].label
            let keyword=""
            if(predictions[i].results[0].match===true){
                keyword="has component "
            }
            else{
                keyword="does not have component "
            }

            console.log("The message "+keyword+ predictions[i].label)

        }
    });
});