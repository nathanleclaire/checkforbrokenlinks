'use strict';


// Declare app level module which depends on filters, and services
angular.module('checkForBrokenLinksApp', [
    'ngRoute',
    'checkForBrokenLinksApp.filters',
    'checkForBrokenLinksApp.services',
    'checkForBrokenLinksApp.directives',
    'checkForBrokenLinksApp.controllers'
]).
config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.when('/', {
            templateUrl: 'partials/main.html',
            controller: 'MainCtrl'
        });
        $routeProvider.when('/about', {
            templateUrl: 'partials/about.html',
            controller: 'MainCtrl',
        });
        $routeProvider.when('/contact', {
            templateUrl: 'partials/contact.html',
            controller: 'ContactCtrl',
        });
        $routeProvider.otherwise({
            redirectTo: '/'
        });
    }
]);
