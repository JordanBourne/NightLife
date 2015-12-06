var mongoose = require('mongoose');

var BarSchema = new mongoose.Schema({
    name: String,
    rating_img_url: String,
    url: String,
    image_url: String,
    snippet_text: String,
    going: {type: Number, default: 0}
});

BarSchema.methods.plusOne = function (cb) {
    this.going += 1;
    this.save(cb);
}

mongoose.model('Bar', BarSchema);