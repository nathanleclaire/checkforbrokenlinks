'use strict';

/* Controllers */

angular.module('myApp.controllers', []).
controller('MainCtrl', function($scope, $http) {
    $scope.runningTest = false;
    $scope.done_scraping_original_url = false;
    $scope.startRunningTest = function() {
        $scope.runningTest = true;
        console.log($scope.url_to_scrape);
        $http.get('/slurp', {
            params: {
                url_to_scrape: $scope.url_to_scrape
            }
        })
            .success(function(data) {
                console.log(data);
                $scope.runningTest = false;
                $scope.done_scraping_original_url = true;
                $scope.externalWebSiteJSON = angular.toJson(data, true);
                if (data.success) {
                    $scope.retrieved_urls = data.links;
                }
            });
    };
});