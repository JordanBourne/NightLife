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
                    }],
                    onEnter: function() {
                        console.log("test123");
                    }
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
        
            /*.state('login', {
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
            });*/
        
        $urlRouterProvider.otherwise('/');
    }
]);

app.factory('auth', ['$http', '$window', function($http, $window) {
    var auth = {};
    
    auth.saveToken = function(token) {
        $window.localStorage['night-token'] = token;
    };
    
    auth.getToken = function() {
        return $window.localStorage['night-token'];
    };
    
    auth.isLoggedIn = function() {
        var token = auth.getToken();
        
        if (token) {
            var payload = JSON.parse($window.atob(token.split('.')[1]));
            
            return payload.exp > Date.now() / 1000;
        } else {
            return false;
        }
    };
    
    auth.currentUser = function() {
        if (auth.isLoggedIn()) {
            var token = auth.getToken();
            var payload = JSON.parse($window.atob(token.split('.')[1]));
            
            return payload.username;
        }
    };
    
    auth.register = function(user) {
        return $http.post('/register', user).success(function(data) {
            auth.saveToken(data.token);
        });
    };
    
    auth.logIn = function(user) {
        return $http.post('/login', user).success(function(data) {
            auth.saveToken(data.token);
        });
    };
    
    auth.logOut = function() {
        $window.localStorage.removeItem('night-token');
    };
    
    return auth;
}]);

app.factory('yelp', ['$http', 'auth', function ($http, auth) {
    var o = {
        places: [],
        bars: []
    };
    
    o.getYelp = function (location) {
        $http.post('/api/yelp/' + location)
            .then(function (res) {
                angular.copy(res, o.places);
                o.getPlaces(location);
            });
    };
    
    o.getPlaces = function (location) {
        $http.get('/barList/' + location).success(function(res) {
            angular.copy(res, o.bars);
            window.location.href = "#/search/" + location + '/' + "results";
        });
    };
    
    o.addOne = function (place) {
        $http.put('/bar/' + place._id, null, {
            headers: {Authorization: 'Bearer ' + auth.getToken()}
        }).success(function (plusMinus) {
            if(plusMinus === "true") {
                place.people.splice(place.people.indexOf(auth.currentUser), 1);
                return place.going -= 1; //minus
            } else {
                place.people.push(auth.currentUser);
                return place.going += 1; //plus
            }
        });
    };
    
    return o;
}]);

app.controller('MainCtrl', [
    '$scope',
    '$http',
    'yelp',
    'auth',
    function ($scope, $http, yelp, auth) {
        $scope.searchArea = function () {
            $scope.results = window.location.href = "#/search/" + $scope.place;
            
            $scope.place = '';
        };
        
        
        this.tab = 0;
        
        this.setTab = function (tabVal) {
            if (this.tab === tabVal) {
                this.tab = 0;
            } else {
                this.tab = tabVal;
            }
        };
        
        this.isSet = function (checkVal) {
            return this.tab === checkVal;
        };
        
        this.checkLogin = function() {
            if ($scope.isLoggedIn = auth.isLoggedIn) {
                this.tab = 0;
            }
        }
    }
]);

app.controller('NightLifeCtrl', [
    '$scope',
    'yelp',
    'auth',
    function ($scope, yelp, auth) {
        if(yelp.places.data) {
            var attendanceIndex = [];
            
            yelp.bars.forEach(function(bar) {
                if (bar.people.indexOf(auth.currentUser()) < 0) {
                   attendanceIndex.push(0);
                } else {
                   attendanceIndex.push(1);
                }
            })
            
            $scope.attend = function (num) {
                if (attendanceIndex[num] == 1) {
                    return true;
                } else {
                    return false;
                }
            }
            
            $scope.results = yelp.bars;
            
            $scope.plusOne = function(place, num) {
                if (!auth.isLoggedIn()) {
                    $scope.error = 'You must be logged in!';
                    return;
                }
                
                yelp.addOne(place);
                
                if (attendanceIndex[num] == 1) {
                    return attendanceIndex[num] -= 1;
                } else {
                    return attendanceIndex[num] += 1;
                }
            }
        }
    }
]);

app.controller('AuthCtrl', [
    '$scope',
    '$state',
    'auth',
    function($scope, $state, auth){
        $scope.user = {};
        $scope.success = false;

        $scope.register = function(){
            auth.register($scope.user).error(function(error){
                $scope.error = error;
            })
        };

        $scope.logIn = function(){
            auth.logIn($scope.user).error(function(error){
                $scope.error = error;
            })
        };
}]);

app.controller('NavCtrl', [
    '$scope',
    'auth',
    function($scope, auth){
        $scope.isLoggedIn = auth.isLoggedIn;
        $scope.currentUser = auth.currentUser;
        $scope.logOut = auth.logOut;
    }
]);

app.directive('logIn', function () {
    return {
        restrict: 'E',
        templateUrl: 'logIn.html'
    };
});

app.directive('register', function () {
    return {
        restrict: 'E',
        templateUrl: 'register.html'
    };
});