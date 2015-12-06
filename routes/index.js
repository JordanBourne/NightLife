var express = require('express');
var router = express.Router();
var auth = jwt({secret: 'SECRET', userProperty: 'payload'})
var Yelp = require('../controllers/yelp.js');
var mongoose = require('mongoose');

var searchYelp = new Yelp();
var Bar = mongoose.model('Bar');
var Location = mongoose.model('Location');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

router.post('/register', function(req, res, next){
    if(!req.body.username || !req.body.password){
        return res.status(400).json({message: 'Please fill out all fields'});
    }

    var user = new User();

    user.username = req.body.username;

    user.setPassword(req.body.password);
    
    user.save(function (err){
        if(err){ return next(err); }

        return res.json({token: user.generateJWT()})
    });
});

router.post('/login', function(req, res, next){
    if(!req.body.username || !req.body.password){
        return res.status(400).json({message: 'Please fill out all fields'});
    }
    
    passport.authenticate('local', function(err, user, info){
        if(err){ return next(err); }
    
        if(user){
            return res.json({token: user.generateJWT()});
        } else {
            return res.status(401).json(info);
        }
    })(req, res, next);
});

router.post('/api/yelp/:location', function (req, res, next) {
    searchYelp.request_yelp(req.params.location, function(err, response, body) {
        
        Location.find({"location" : req.params.location}, function(err, result) {
            
            if(err) { console.log(err); return; }
            
            if(result[0]) {
                //console.log(result);
                res.json(result[0]);
            } else {
                var business = JSON.parse(body).businesses;
                var location = new Location();
                
                location.location = req.params.location;
                
                business.forEach(function(place) {
                    Bar.find({url: place.url}, function(err, barResult) {
                        if(barResult.length > 0) {
                            location.bars.push(place);
                        } else {
                            var bar = new Bar();
                            
                            bar.name = place.name;
                            bar.rating_img_url = place.rating_img_url;
                            bar.url = place.url;
                            bar.image_url = place.image_url;
                            bar.snippet_text = place.snippet_text;
                            
                            if(location.bars.indexOf(bar) < 0 ) {
                                location.bars.push(bar);
                            }
                            bar.save();
                        }
                        
                        if(location.bars.length === 10) {
                            location.save(function (err, location) {
                                if (err) { console.log(err); return next(err) }
                                
                                res.json(location);
                            });
                        }
                    });
                });
            }
        });
    });
});

router.get('/barList/:location', function (req, res, next) {
    Location.find({"location" : req.params.location}, function(err, result) {
        var barList = [];
        result[0].bars.forEach(function(barID) {
            Bar.find({_id: barID}, function(err, barInfo) {
                barList.push(barInfo[0]);
                
                if(barList.length === 10) {
                    res.json(barList);
                }
            });
        });
    });
});

router.put('/bar/:id', function(req, res, next) {
    Bar.findOne({_id : req.params.id}, function(err, result) {
        result.plusOne(function(err, bar) {
            if(err) { return next(err); }
        
            res.json(bar);
        });
    })
});

module.exports = router;
