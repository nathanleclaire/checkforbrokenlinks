'use strict';

/* Controllers */

angular.module('myApp.controllers', []).
  controller('MainCtrl', function($scope) {
  	$scope.runningTest = true;
  	$scope.startRunningTest = function() {
  		$scope.runningTest = false;
  	};
  });