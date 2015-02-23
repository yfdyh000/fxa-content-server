/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'chai',
  'sinon',
  'models/reliers/relier',
  'models/auth_brokers/base',
  'views/base',
  '../../../mocks/window'
],
function (chai, sinon, Relier, BaseAuthenticationBroker, BaseView, WindowMock) {
  var assert = chai.assert;

  describe('models/auth_brokers/base', function () {
    var relier;
    var broker;
    var view;
    var windowMock;

    beforeEach(function () {
      view = new BaseView();
      windowMock = new WindowMock();
      relier = new Relier();
      broker = new BaseAuthenticationBroker({
        window: windowMock,
        relier: relier
      });
    });

    describe('afterLoaded', function () {
      it('returns a promise', function () {
        return broker.afterLoaded()
          .then(assert.pass);
      });
    });

    describe('cancel', function () {
      it('returns a promise', function () {
        return broker.cancel()
          .then(assert.pass);
      });
    });

    describe('afterSignIn', function () {
      it('returns a promise', function () {
        return broker.afterSignIn(view)
          .then(assert.pass);
      });
    });

    describe('persist', function () {
      it('returns a promise', function () {
        return broker.persist(view)
          .then(assert.pass);
      });
    });

    describe('beforeSignUpConfirmationPoll', function () {
      it('returns a promise', function () {
        return broker.beforeSignUpConfirmationPoll(view)
          .then(assert.pass);
      });
    });

    describe('afterSignUpConfirmationPoll', function () {
      it('returns a promise', function () {
        return broker.afterSignUpConfirmationPoll(view)
          .then(assert.pass);
      });
    });

    describe('afterResetPasswordConfirmationPoll', function () {
      it('returns a promise', function () {
        return broker.afterResetPasswordConfirmationPoll(view)
          .then(assert.pass);
      });
    });

    describe('transformLink', function () {
      it('does nothing to the link', function () {
        assert.equal(broker.transformLink('signin'), 'signin');
      });
    });

    describe('isForceAuth', function () {
      it('returns `false` by default', function () {
        assert.isFalse(broker.isForceAuth());
      });

      it('returns `true` if flow began at `/force_auth`', function () {
        windowMock.location.pathname = '/force_auth';
        return broker.fetch()
          .then(function () {
            assert.isTrue(broker.isForceAuth());
          });
      });
    });

    describe('isAutomatedBrowser', function () {
      it('returns `false` by default', function () {
        assert.isFalse(broker.isAutomatedBrowser());
      });

      it('returns `true` if the URL contains `isAutomatedBrowser=true`', function () {
        windowMock.location.search = '?automatedBrowser=true';
        return broker.fetch()
          .then(function () {
            assert.isTrue(broker.isAutomatedBrowser());
          });
      });
    });
  });
});


