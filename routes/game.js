var db = require('../db');
var async = require('async');

exports.get = function (req, res) {
    var cleanWordFilter = { 'English': { $not: /( |#)/ } }; //, 'Turkish': { $not: /(\.|:)/i }

    getCount(cleanWordFilter, function (count) {
        getRandomWord(count, cleanWordFilter, function (word) {
            getAnswers(word, 4, function (answers) {
                var result = {
                    wordId: word._id,
                    word: word.English,
                    answers: answers
                };

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.write(JSON.stringify(result));
                res.end();
            });
        });
    });
};

exports.save = function (req, res) {
    var question = req.body.question;
    var answer = req.body.answer;

    db.Word.findOne({ _id: question }, function (err, word) {
        if (!err) {
            var result = { RightAnswer: word.Turkish, Correct: word.Turkish === answer };

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.write(JSON.stringify(result));
            res.end();
        }
    });
};

function getCount(filter, callback) {
    db.Word.find(filter).count(function (err, count) {
        callback(!err ? count : 0);
    });
}

function getRandomWord(count, filter, callback) {
    var randomPos = Math.floor(Math.random() * count);
    var random = db.Word.find(filter).skip(randomPos).limit(1).exec(function (err, word) {
        callback(!err ? word[0] : null);
    });
}

function getAnswers(word, answerCount, callback) {
    var answerStack = new Array();

    var cleanWordFilter = { 'English': { $ne: word.English } }; //, 'Turkish': { $not: /(\.|:)/i }

    getCount(cleanWordFilter, function (count) {
        for (var i = 0; i < answerCount - 1; i++) {
            answerStack.push(function (sCallback) {
                getRandomWord(count, cleanWordFilter, function (aWord) {
                    sCallback(null, aWord.Turkish);
                });
            });
        }

        async.series(answerStack, function (err, results) {
            var answers = new Array();
            answers.push(word.Turkish);
            for (var i = 0; i < results.length; i++) {
                answers.push(results[i].toString());
            }

            callback(shuffle(answers));
        });
    });
}

shuffle = function (o) { //v1.0
    for (var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};