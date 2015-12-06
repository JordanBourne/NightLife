var mongoose = require('mongoose');

var LocationSchema = new mongoose.Schema({
    location: String,
    bars: [{type: String}]
});

mongoose.model('Location', LocationSchema);