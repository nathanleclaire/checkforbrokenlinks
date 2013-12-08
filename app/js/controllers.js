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
            $scope.urlToScrape = '';
            $scope.linksInfo = [];
            $scope.parseOriginalUrlStatus = 'waiting';
            $scope.doneScrapingOriginalUrl = false;
        };

        $scope.clearResults();

        $scope.runTest = function() {
            $scope.doneScrapingOriginalUrl = false;
            $scope.parseOriginalUrlStatus = 'calling';
            $scope.linksInfo = [];
            var urlToScrape = $scope.urlToScrape;

            if (!urlToScrape.match(/^https*:\/\//i)) {
                // default to using HTTP
                urlToScrape = 'http://' + urlToScrape;
            }

            $http.get('/slurp', {
                params: {
                    urlToScrape: urlToScrape
                }
            })
                .success(function(data) {
                    if (!data.success) {
                        $scope.parseOriginalUrlStatus = 'invalid';
                    } else {
                        $scope.parseOriginalUrlStatus = 'waiting';
                        $scope.doneScrapingOriginalUrl = true;
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
        };
    })
    .controller('CheckCtrl', function($scope, $http) {
        var check = function() {
            $http.get('/check', {
                params: {
                    urlToCheck: $scope.href
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
                    $scope.clear();
                    $scope.successfullySubmitted = true;
                });

        }
    });
