'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
.controller('NavCtrl', function($scope, $location) {
	$scope.isActive = function(route) {
		return route === $location.path();
	};
})
.controller('MainCtrl', function($scope, $http, $timeout) {
	// reset state of MainCtrl
	$scope.clearResults = function() {
		$scope.url_to_scrape = '';
		$scope.linksInfo = [];
		$scope.parseOriginalUrlStatus = 'waiting';
		$scope.done_scraping_original_url = false;
	};

	$scope.clearResults();

    $scope.runTest = function() {
		$scope.done_scraping_original_url = false;
        $scope.parseOriginalUrlStatus = 'calling';
        $scope.linksInfo = [];
		if (!$scope.linkCheckForm.url_to_scrape.$error.pattern) {
			$http.get('/slurp', {
				params: {
					url_to_scrape: $scope.url_to_scrape
				}
			})
				.success(function(data) {
					if (!data.success) {
						$scope.parseOriginalUrlStatus = 'invalid';
					} else {
						$scope.parseOriginalUrlStatus = 'waiting';
						$scope.done_scraping_original_url = true;
						$scope.externalWebSiteJSON = angular.toJson(data, true);
						if (data.success) {
							var links = data.links;
							if (links.length > 1) {
								$scope.retrieved_urls = links;
								$timeout(function() {
									$scope.$broadcast('checkLinks');
								});
							} else {
								$scope.parseOriginalUrlStatus = 'invalid';	
							}
						}
					}

				});
		} else {
			$scope.parseOriginalUrlStatus = 'invalid';
		}
    };
})
.controller('CheckCtrl', function($scope, $http) {
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
})
.controller('ContactCtrl', function($scope, $http) {
	var defaultContactForm = {
		yourName: '',
		yourEmail: '',
		feedback: ''
	};

	$scope.clear = function() {
		$scope.successfullySubmitted = false;
		$scope.contactForm.$setPristine();
		angular.copy(defaultContactForm, $scope.contact);
	};

	angular.copy(defaultContactForm, $scope.contact);

	$scope.submitFeedback = function() {
			$http.post('/email', $scope.contact)
			.success(function(data) {
				$scope.successfullySubmitted = true;
			});

	}
});
