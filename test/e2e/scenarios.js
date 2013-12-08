'use strict';

/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */

describe('checkForBrokenLinksApp', function() {

    beforeEach(function() {
        browser().navigateTo('app/index.html');
    });


    it('should automatically redirect to / when location hash/fragment is empty', function() {
        expect(browser().location().url()).toBe("/");
    });

    describe('/', function() {

        beforeEach(function() {
            browser().navigateTo('#/');
        });

        it('should have a search box when on the home page', function() {
            expect(element('input').count()).
            // submit button and input box
            toMatch(2);
        });
    });


    describe('/contact', function() {

        beforeEach(function() {
            browser().navigateTo('#/contact');
        });


        it('should render contact form when user navigates to /contact', function() {
            expect(element('input').count()).
            toMatch(3);
        });

    });

    describe('/about', function() {

        beforeEach(function() {
            browser().navigateTo('#/about');
        });


        it('should render about view when user navigates to /about', function() {
            expect(element('[ng-view] p:first').text()).
            toMatch(/is a project lovingly maintained by Nathan LeClaire/);
        });
    });
});
