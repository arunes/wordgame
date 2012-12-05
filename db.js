var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var WordSchema = new Schema({
    English: String,
    Turkish: String
});

exports.Word = mongoose.model('word', WordSchema);
mongoose.connect('mongodb://localhost/dictionary');