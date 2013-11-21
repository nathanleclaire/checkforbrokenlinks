'use strict';

/* Controllers */

angular.module('myApp.controllers', []).
controller('MainCtrl', function($scope, $http) {
    $scope.runningTest = false;
    $scope.done_scraping_original_url = false;
    $scope.startRunningTest = function() {
        $scope.runningTest = true;
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
    $scope.checkUrl = function(url_to_check) {
        console.log("checking ", url_to_check);
        $http.get('/check', {
            params: {
                url_to_check: url_to_check
            }
        })
            .success(function(data) {
                $scope.checkResult = data;
            })
    }
});