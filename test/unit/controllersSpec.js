'use strict';

/* jasmine specs for controllers go here */

describe('controllers', function() {
    beforeEach(module('checkForBrokenLinksApp.controllers'));

    describe('NavCtrl', function() {
        var $scope, $location, $rootScope, createController;

        beforeEach(inject(function($injector) {
            $location = $injector.get('$location');
            $rootScope = $injector.get('$rootScope');
            var $controller = $injector.get('$controller');
            $scope = $rootScope.$new();

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
        var scope, rootScope, ctrl, http, timeout;
        beforeEach(inject(function($http, $timeout, $rootScope, $controller) {
            http = $http;
            timeout = $timeout;
            rootScope = $rootScope;
            scope = $rootScope.$new();
            ctrl = $controller('MainCtrl', {
                $scope: scope
            });
        }));

        it('should reset scope when the clearResults() method is called', function() {
            scope.urlToScrape = 'google.com';
            scope.linksInfo = ['something.com', 'somethinglese.com', 'blahblah.com'];
            scope.parseOriginalUrlStatus = 'someRandomStatus';
            scope.doneScrapingOriginalUrl = true;


            scope.clearResults();
            expect(scope.linksInfo).toEqual([]);
            expect(scope.parseOriginalUrlStatus).toEqual('waiting');
            expect(scope.doneScrapingOriginalUrl).toEqual(false);
        });

        it('should run the Test to get the link data from the go backend', function() {
            scope.urlToScrape = 'nathanleclaire.com';

        });
    });

});
