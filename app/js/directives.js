'use strict';

/* Directives */

angular.module('myApp.directives', []).
  directive('testUrlStatus', function() {
  	return {
  		restrict: 'E',
  		templateUrl: '/app/partials/test_url.html',
      // set scope so that we can have isolate scope on these
      // directives (they are ng-repeated)
      // scope: {
      //
      // }
  		transclude: true
  	}
  })
  .directive('makingCallSpinner', function() {
    return {
      restrict: 'E',
      templateUrl: '/app/partials/call_spinner.html',
      transclude: true
    }
  });
