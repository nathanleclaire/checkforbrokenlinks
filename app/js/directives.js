'use strict';

/* Directives */

angular.module('myApp.directives', []).
	directive('testUrlStatus', function() {
		return {
			// I would have preferred to have this as an "element" directive
			// but there are issues getting it to work with table rows.
			restrict: 'A',
			controller: function($scope, $http) {
				var check = function() {
					$http.get('/check', {
							params: {
								url_to_check: $scope.href
							}
						})
						.success(function(data) {
							$scope.statusCodeResult = (data.statusCode === 200);
						});
				};
				$scope.$on('checkLinks', check);
			},
			templateUrl: '/partials/test_url.html',
		}
	})
    .directive('makingCallSpinner', function() {
        return {
            restrict: 'E',
            templateUrl: '/partials/call_spinner.html',
        }
    })
	.directive('cancelX', function() {
		return {
			scope: {
				clearFunc: '='
			},
			restrict: 'E',
			templateUrl: '/partials/cancel_x.html',
		}
	});
