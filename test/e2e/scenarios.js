'use strict';

/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */

describe('check for broken links app', function() {

    beforeEach(function() {
        browser().navigateTo('app/index.html');
    });


    it('should automatically redirect to / when location hash/fragment is empty', function() {
        expect(browser().location().url()).toBe("/");
    });


    describe('/contact', function() {

        beforeEach(function() {
            browser().navigateTo('#/contact');
        });


        it('should render contact partial when user navigates to /contact', function() {
            expect(element('[ng-view] p:first').text()).
            toMatch(/is a project lovingly maintained by Nathan LeClaire/);
        });

    });


    describe('/about', function() {

        beforeEach(function() {
            browser().navigateTo('#/about');
        });


        it('should render view2 when user navigates to /view2', function() {
            expect(element('[ng-view] p:first').text()).
            toMatch(/is a project lovingly maintained by Nathan LeClaire/);
        });
    });
});
