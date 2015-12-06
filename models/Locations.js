var mongoose = require('mongoose');

var LocationSchema = new mongoose.Schema({
    location: String,
    bars: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Bar' }]
});

mongoose.model('Location', LocationSchema);