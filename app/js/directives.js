'use strict';

/* Directives */

angular.module('myApp.directives', []).
  directive('testUrl', function() {
  	return {
  		restrict: 'A',
  		scope: {
  			title: '@'
  		},
  		templateUrl: '/app/partials/test_url.html',
  		transclude: true
  	}
  });
