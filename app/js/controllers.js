'use strict';

/* Controllers */

angular.module('checkForBrokenLinksApp.controllers', [])
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
                            if (links.length > 0) {
                                $scope.retrievedUrls = links;
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
                    urlToCheck: $scope.link.href
                }
            })
                .success(function(data) {
                    $scope.statusCodeResult = (data.statusCode === 200);
                });
        };
        $scope.$on('checkLinks', check);
    })
    .controller('ContactCtrl', function($scope, $http, vcRecaptchaService) {
        var defaultContactForm = {
            yourName: '',
            yourEmail: '',
            feedback: '',
            captcha: {}
        };

        $scope.clear = function() {
            //$scope.contactForm.$setPristine();
            angular.copy(defaultContactForm, $scope.contact);
            vcRecaptchaService.reload();
            $scope.successfullySubmitted = undefined;
        };

        angular.copy(defaultContactForm, $scope.contact);

        $scope.submitFeedback = function() {
            $scope.contact.captcha = vcRecaptchaService.data();
            $http.post('/email', $scope.contact)
                .success(function(data) {
                    $scope.successfullySubmitted = data.success;
                    if (!data.success) {
                        vcRecaptchaService.reload();
                    }
                });

        }
    });
