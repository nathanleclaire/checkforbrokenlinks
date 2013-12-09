'use strict';

/* jasmine specs for controllers go here */

describe('controllers', function() {
    beforeEach(module('checkForBrokenLinksApp.controllers'));

    describe('NavCtrl', function() {
        var $scope, $location, $rootScope, createController;

        beforeEach(inject(function($injector) {
            $location = $injector.get('$location');
            $rootScope = $injector.get('$rootScope');
            $scope = $rootScope.$new();

            var $controller = $injector.get('$controller');

            createController = function() {
                return $controller('NavCtrl', {
                    '$scope': $scope
                });
            };
        }));

        it('should have a method to check if the path is active', function() {
            var controller = createController();
            $location.path('/about');
            expect($location.path()).toBe('/about');
            expect($scope.isActive('/about')).toBe(true);
            expect($scope.isActive('/contact')).toBe(false);
        });
    });

    describe('MainCtrl', function() {
        var $scope, $rootScope, $httpBackend, $timeout, createController;
        beforeEach(inject(function($injector) {
            $timeout = $injector.get('$timeout');
            $httpBackend = $injector.get('$httpBackend');
            $rootScope = $injector.get('$rootScope');
            $scope = $rootScope.$new();


            var $controller = $injector.get('$controller');

            createController = function() {
                return $controller('MainCtrl', {
                    '$scope': $scope
                });
            };
        }));

        afterEach(function() {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });

        it('should reset $scope when the clearResults() method is called', function() {
            var controller = createController();

            // setup $scope data to contain something
            $scope.urlToScrape = 'google.com';
            $scope.linksInfo = ['something.com', 'somethinglese.com', 'blahblah.com'];
            $scope.parseOriginalUrlStatus = 'someRandomStatus';
            $scope.doneScrapingOriginalUrl = true;

            $scope.clearResults();
            expect($scope.linksInfo).toEqual([]);
            expect($scope.parseOriginalUrlStatus).toEqual('waiting');
            expect($scope.doneScrapingOriginalUrl).toEqual(false);
        });

        it('should run the Test to get the link data from the go backend', function() {
            var controller = createController();

            // use clearResults() for data setup
            $scope.clearResults();
            $scope.urlToScrape = 'success.com';

            $httpBackend.expect('GET', '/slurp?urlToScrape=http:%2F%2Fsuccess.com')
                .respond({
                    "success": true,
                    "links": ["http://www.google.com", "http://angularjs.org", "http://amazon.com"]
                });

			// have to use $apply to trigger the $digest which will
			// take care of the HTTP request
            $scope.$apply(function() {
                $scope.runTest();
            });
			
			expect($scope.parseOriginalUrlStatus).toEqual('calling');
                    
            $httpBackend.flush();

			expect($scope.retrievedUrls).toEqual(["http://www.google.com", "http://angularjs.org", "http://amazon.com"]);	
			expect($scope.parseOriginalUrlStatus).toEqual('waiting');	
			expect($scope.doneScrapingOriginalUrl).toEqual(true);	
        });
    });

});
