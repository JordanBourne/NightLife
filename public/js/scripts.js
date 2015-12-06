var app = angular.module('app', ['ui.router']);

app.config([
    '$stateProvider',
    '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {
        
        $stateProvider
            .state('home', {
                url: '/',
            })
        
            .state('nightlife', {
                url: '/search/{place}',
                templateUrl: '/nightlife.html',
                controller: 'NightLifeCtrl',
                resolve: {
                    promise: ['$stateParams', 'yelp', function ($stateParams, yelp) {
                        yelp.getYelp($stateParams.place);
                    }]
                }
            })
        
            .state('nightlifeResults', {
                url: '/search/{place}/{id}',
                templateUrl: '/nightlife.html',
                controller: 'NightLifeCtrl',
                resolve: {
                    goHere: ['$stateParams', function($stateParams) {
                        window.location.href = "#/search/" + $stateParams.place;
                    }]
                }
            })
        
            .state('login', {
                url: '/login',
                templateUrl: '/logIn.html',
                controller: 'AuthCtrl',
                onEnter: ['$state', 'auth', function ($state, auth) {
                    if (auth.isLoggedIn()) {
                        $state.go('home');
                    }
                }]
            })
            
        
            .state('register', {
                url: '/register',
                templateUrl: '/register.html',
                controller: 'AuthCtrl',
                onEnter: ['$state', 'auth', function ($state, auth) {
                    if (auth.isLoggedIn()) {
                        $state.go('home');
                    }
                }]
            });
        
        $urlRouterProvider.otherwise('/');
    }
]);

app.factory('yelp', ['$http', function ($http) {
    var o = {
        places: [],
        bars: []
    };
    
    o.getYelp = function (location) {
        $http.post('/api/yelp/' + location)
            .then(function (res) {
            console.log(res);
                angular.copy(res, o.places);
                o.getPlaces(location);
            });
    };
    
    o.getPlaces = function(location) {
        $http.get('/barList/' + location).success(function(res) {
            angular.copy(res, o.bars);
            window.location.href = "#/search/" + location + '/' + "results";
        })
    }
    
    o.addOne = function (place) {
        $http.put('/bar/' + place._id, null)
            .success(function (res) {
            return place.going += 1;
            console.log(place.going);
        })
    }
    
    return o;
}]);

app.controller('MainCtrl', [
    '$scope',
    '$http',
    'yelp',
    function ($scope, $http, yelp) {
        $scope.searchArea = function () {
            $scope.results = 
                window.location.href = "#/search/" + $scope.place;
            
            $scope.place = '';
        };
    }
]);

app.controller('NightLifeCtrl', [
    '$scope',
    'yelp',
    function ($scope, yelp) {
        if(yelp.places.data) {
            $scope.results = yelp.bars;
            
            $scope.plusOne = function(place) {
                yelp.addOne(place);
            }
        }
    }
]);