'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
.controller('NavCtrl', function($scope) {
	$scope.activeTab = '';

	$scope.navigateHome = function() {
		$scope.activeTab = '';
	}

	$scope.navigateAbout = function() {
		$scope.activeTab = 'about';
	}

	$scope.navigateContact = function() {
		$scope.activeTab = 'contact';
	}
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
					console.log(data);
					if (!data.success) {
						console.log('no success');
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
.controller('ContactCtrl', function($scope, $http) {
	$scope.successfullySubmitted = false;
	$scope.submitFeedback = function() {
			$http.post('/email', {
				yourName : $scope.yourName,
				yourEmail : $scope.yourEmail,
				feedback : $scope.feedback
			})
			.success(function(data) {
				$scope.successfullySubmitted = true;
			});

	}
});
