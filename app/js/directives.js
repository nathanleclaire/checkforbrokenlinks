'use strict';

/* Directives */

angular.module('myApp.directives', []).
	directive('testUrlStatus', function() {
		return {
			// I would have preferred to have this as an "element" directive
			// but there are issues getting it to work with table rows.
			restrict: 'A',
			controller: 'CheckCtrl',
			templateUrl: '/partials/test-url.html',
		}
	})
    .directive('makingCallSpinner', function() {
        return {
            restrict: 'E',
            templateUrl: '/partials/call-spinner.html',
        }
    })
	.directive('cancelX', function() {
		return {
			scope: {
				clearFunc: '='
			},
			restrict: 'E',
			templateUrl: '/partials/cancel-x.html',
		}
	});
