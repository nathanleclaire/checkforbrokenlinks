'use strict';

/* Controllers */

angular.module('myApp.controllers', []).
  controller('MainCtrl', function($scope, $http) {
  	$http.defaults.useXDomain = true;
  	$scope.runningTest = false;
  	$scope.done_parsing_urls = false;
  	$scope.startRunningTest = function() {
  		$scope.runningTest = true;
  		console.log($scope.url_to_parse);
  	};
  });