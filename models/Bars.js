var mongoose = require('mongoose');

var BarSchema = new mongoose.Schema({
    name: String,
    rating_img_url: String,
    url: String,
    image_url: String,
    snippet_text: String,
    people: [{type: String}],
    going: {type: Number, default: 0},
    id: String
});

BarSchema.methods.checkNum = function (cb) {
    this.going = this.people.length;
    this.save(cb);
}

mongoose.model('Bar', BarSchema);