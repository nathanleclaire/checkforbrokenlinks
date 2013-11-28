'use strict';

/* Directives */

angular.module('myApp.directives', []).
	directive('testUrlStatus', function() {
		return {
			// I would have preferred to have this as an "element" directive
			// but there are issues getting it to work with table rows.
			restrict: 'A',
			controller: function($scope, $http) {
				$scope.check = function() {
					console.log("checking ", $scope.href);
					$http.get('/check', {
							params: {
								url_to_check: $scope.href
							}
						})
						.success(function(data) {
							$scope.statusCodeResult = (data.statusCode === 200);
						});
				};
				$scope.$on('checkLinks', $scope.check);
			},
			link: function(scope, elem, attrs) {
				scope.$emit('directivesReady');
			},
			templateUrl: '/partials/test_url.html',
		}
	})
    .directive('makingCallSpinner', function() {
        return {
            restrict: 'E',
            templateUrl: '/partials/call_spinner.html',
        }
    });
