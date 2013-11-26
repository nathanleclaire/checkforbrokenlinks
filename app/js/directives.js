'use strict';

/* Directives */

angular.module('myApp.directives', []).
directive('testUrlStatus', function() {
    return {
        restrict: 'A',
        templateUrl: '/partials/test_url.html',
        transclude: true
    }
})
    .directive('makingCallSpinner', function() {
        return {
            restrict: 'E',
            templateUrl: '/partials/call_spinner.html',
            transclude: true
        }
    });