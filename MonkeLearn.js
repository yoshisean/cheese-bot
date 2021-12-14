const { monkeKey } = require('./config.json');
let ReqUrl='https://api.monkeylearn.com/v3/classifiers/cl_pi3C7JiL/classify/'

const MonkeyLearn = require('monkeylearn')

const ml = new MonkeyLearn(monkeKey)
let model_id = 'cl_pi3C7JiL'
let data = ["Cheesebot is evil!"]
//data will be the message
ml.classifiers.classify(model_id, data).then(res => {
    console.log(res.body[0].classifications[0].tag_name)
})
//
