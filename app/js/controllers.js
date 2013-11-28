'use strict';

/* Controllers */

angular.module('myApp.controllers', []).
controller('MainCtrl', function($scope, $http) {
    $scope.parseOriginalUrlStatus = 'waiting';
    $scope.done_scraping_original_url = false;

    $scope.statusCodeResult = function(statusCode) {
        if (statusCode === undefined) {
            return undefined;
        }
        if (statusCode === 200) {
            return true;
        }
        return false;
    };

    $scope.startRunningTest = function() {
		$scope.done_scraping_original_url = false;
        $scope.linksInfo = [];
        $scope.parseOriginalUrlStatus = 'calling';
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
                        var linksInfo = [];
                        for (var i = 0; i < links.length; i++) {
                            linksInfo.push({
                                href: links[i],
                                checkResult: undefined,
                            });
                        }
                        $scope.retrieved_urls = linksInfo;
                        for (var i = 0; i < linksInfo.length; i++) {
                            $scope.checkUrl(i);
                        }
                    }
                }

            });
    };
    $scope.checkUrl = function(url_to_check_index) {
        console.log("checking ", $scope.retrieved_urls[url_to_check_index].href);
        $http.get('/check', {
            params: {
                url_to_check: $scope.retrieved_urls[url_to_check_index].href
            }
        })
            .success(function(data) {
                $scope.retrieved_urls[url_to_check_index].checkResult = data;
            })
    }
});
