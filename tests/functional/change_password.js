/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'require',
  'intern/node_modules/dojo/node!xmlhttprequest',
  'app/bower_components/fxa-js-client/fxa-client',
  'tests/lib/helpers',
  'tests/functional/lib/helpers',
  'tests/functional/lib/test'
], function (intern, registerSuite, assert, require, nodeXMLHttpRequest,
      FxaClient, TestHelpers, FunctionalHelpers, Test) {
  'use strict';

  var config = intern.config;
  var AUTH_SERVER_ROOT = config.fxaAuthRoot;
  var SIGNIN_URL = config.fxaContentRoot + 'signin';
  var PAGE_URL = config.fxaContentRoot + 'change_password';

  var FIRST_PASSWORD = 'password';
  var SECOND_PASSWORD = 'new_password';
  var email;
  var client;

  var ANIMATION_DELAY_MS = 500;

  function clearBrowserStorage() {
    /*jshint validthis: true*/
    // clear localStorage to avoid polluting other tests.
    return FunctionalHelpers.clearBrowserState(this);
  }

  function fillOutChangePassword(context, oldPassword, newPassword) {
    return context.get('remote')
      .findByCssSelector('#old_password')
        .click()
        .type(oldPassword)
      .end()

      .findByCssSelector('#new_password')
        .click()
        .type(newPassword)
      .end()

      .findByCssSelector('button[type="submit"]')
        .click()
      .end();
  }

  function initiateLockedAccountChangePassword(context) {
    return context.get('remote')
      .get(require.toUrl(PAGE_URL))

      .findByCssSelector('#fxa-change-password-header')
      .end()

      .then(function () {
        return client.accountLock(email, FIRST_PASSWORD);
      })

      .then(function () {
        return fillOutChangePassword(context, FIRST_PASSWORD, SECOND_PASSWORD);
      })

      .findByCssSelector('a[href="/confirm_account_unlock"]')
        .click()
      .end()

      .findByCssSelector('#fxa-confirm-account-unlock-header')
      .end();
  }

  registerSuite({
    name: 'settings->change password with verified email',

    beforeEach: function () {
      email = TestHelpers.createEmail();

      client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });

      var self = this;
      return client.signUp(email, FIRST_PASSWORD, { preVerified: true })
        .then(function () {
          return self.get('remote')
            .setFindTimeout(intern.config.pageLoadTimeout);
        })
        .then(function () {
          return clearBrowserStorage.call(self);
        })
        .then(function () {
          return FunctionalHelpers.fillOutSignIn(self, email, FIRST_PASSWORD);
        });
    },

    teardown: function () {
      return clearBrowserStorage.call(this);
    },

    'sign in, try to change password with an incorrect old password': function () {
      var self = this;
      return this.get('remote')

        // Go to change password screen
        .findByCssSelector('#change-password')
          .click()
        .end()

        // ensure there is a back button
        .findByCssSelector('#back')
        .end()

        .then(function () {
          return fillOutChangePassword(self, 'INCORRECT', SECOND_PASSWORD);
        })

        .then(FunctionalHelpers.visibleByQSA('.error'))

        .findByCssSelector('.error').isDisplayed()
          .then(function (isDisplayed) {
            assert.isTrue(isDisplayed);
          })
        .end()

        // click the show button, the error should not be hidden.
        .findByCssSelector('[for=show-old-password]')
          .click()
        .end()

        .findByCssSelector('.error').isDisplayed()
          .then(function (isDisplayed) {
            assert.isTrue(isDisplayed);
          })
        .end()

        // Change form so that it is valid, error should be hidden.
        .findByCssSelector('#old_password')
          .click()
          .type(FIRST_PASSWORD)
        .end()

        // Since the test is to see if the error is hidden,
        // .findByClass cannot be used. We want the opposite of
        // .findByClass.
        .sleep(ANIMATION_DELAY_MS)

        .findByCssSelector('.error').isDisplayed()
          .then(function (isDisplayed) {
            assert.isFalse(isDisplayed);
          })
        .end();
    },

    'sign in, change password, sign in with new password': function () {
      var self = this;
      return this.get('remote')

        // Go to change password screen
        .findByCssSelector('#change-password')
          .click()
        .end()

        .then(function () {
          return fillOutChangePassword(self, FIRST_PASSWORD, SECOND_PASSWORD);
        })

        .findByCssSelector('#fxa-settings-header')
        .end()

        .then(FunctionalHelpers.visibleByQSA('.success'))

        .findByClassName('success').isDisplayed()
          .then(function (isDisplayed) {
            assert.equal(isDisplayed, true);
          })
        .end()

        .get(require.toUrl(SIGNIN_URL))

        .findByCssSelector('.use-different')
          .click()
        .end()

        .then(function () {
          return FunctionalHelpers.fillOutSignIn(self, email, SECOND_PASSWORD);
        })

        .findByCssSelector('#fxa-settings-header')
        .end();
    },

    'browse directly to page - no back button': function () {
      var self = this;
      return this.get('remote')
        // check that signin is complete before proceeding
        .findByCssSelector('#fxa-settings-header')
        .end()

        .get(require.toUrl(PAGE_URL))

        .findByCssSelector('#fxa-change-password-header')
        .end()

        .then(Test.noElementById(self, 'back'));
    },

    'locked account, verify same browser': function () {
      var self = this;
      return initiateLockedAccountChangePassword(this)
        .then(function () {
          return FunctionalHelpers.openVerificationLinkSameBrowser(
                      self, email, 0);
        })

        .switchToWindow('newwindow')
        // wait for the verified window in the new tab
        .findByCssSelector('#fxa-account-unlock-complete-header')
        .end()

        // switch to the original window
        .closeCurrentWindow()
        .switchToWindow('')

        .then(FunctionalHelpers.visibleByQSA('.success'))
        .end()

        // account is unlocked, re-try the password change
        .then(function () {
          return fillOutChangePassword(self, FIRST_PASSWORD, SECOND_PASSWORD);
        })

        .findByCssSelector('#fxa-settings-header')
        .end();
    },

    'locked account, verify same browser with original tab closed': function () {
      var self = this;
      return initiateLockedAccountChangePassword(this)
        // user browses to another site.
        .switchToFrame(null)

        .then(FunctionalHelpers.openExternalSite(self))

        .then(function () {
          return FunctionalHelpers.openVerificationLinkSameBrowser(
                      self, email, 0);
        })

        .switchToWindow('newwindow')
        // wait for the verified window in the new tab
        .findByCssSelector('#fxa-account-unlock-complete-header')
        .end()

        // switch to the original window
        .closeCurrentWindow()
        .switchToWindow('');
    },

    'locked account, verify same browser by replacing original tab': function () {
      var self = this;
      return initiateLockedAccountChangePassword(this)
        .then(function () {
          return FunctionalHelpers.getVerificationLink(email, 0);
        })
        .then(function (verificationLink) {
          return self.get('remote').get(require.toUrl(verificationLink));
        })

        .findByCssSelector('#fxa-account-unlock-complete-header')
        .end();
    },

    'locked account, verify different browser - from original tab\'s P.O.V.': function () {
      var self = this;
      return initiateLockedAccountChangePassword(this)
        .then(function () {
          return FunctionalHelpers.openUnlockLinkDifferentBrowser(client, email, 'x-unlock-code');
        })

        .then(FunctionalHelpers.visibleByQSA('.success'))
        .end()

        // account is unlocked, re-try the password change
        .then(function () {
          return fillOutChangePassword(self, FIRST_PASSWORD, SECOND_PASSWORD);
        })

        .findByCssSelector('#fxa-settings-header')
        .end();
    },

    'locked account, verify different browser - from new browser\'s P.O.V.': function () {
      var self = this;
      return initiateLockedAccountChangePassword(this)
        .then(function () {
          return FunctionalHelpers.clearBrowserState(self);
        })

        .then(function () {
          return FunctionalHelpers.getVerificationLink(email, 0);
        })
        .then(function (verificationLink) {
          return self.get('remote').get(require.toUrl(verificationLink));
        })

        // new browser dead ends at the 'account verified' screen.
        .findByCssSelector('#fxa-account-unlock-complete-header')
        .end();
    }
  });
});
