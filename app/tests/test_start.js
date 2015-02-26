/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
require([
  'lib/translator',
  'lib/session',
  '../tests/setup'
],
function (Translator, Session) {
  'use strict';

  var tests = [
    '../tests/spec/lib/channels/null',
    '../tests/spec/lib/channels/fx-desktop',
    '../tests/spec/lib/channels/web',
    '../tests/spec/lib/channels/inter-tab',
    '../tests/spec/lib/channels/iframe',
    '../tests/spec/lib/xss',
    '../tests/spec/lib/url',
    '../tests/spec/lib/session',
    '../tests/spec/lib/fxa-client',
    '../tests/spec/lib/oauth-client',
    '../tests/spec/lib/assertion',
    '../tests/spec/lib/translator',
    '../tests/spec/lib/router',
    '../tests/spec/lib/strings',
    '../tests/spec/lib/auth-errors',
    '../tests/spec/lib/oauth-errors',
    '../tests/spec/lib/profile-client',
    '../tests/spec/lib/app-start',
    '../tests/spec/lib/validate',
    '../tests/spec/lib/service-name',
    '../tests/spec/lib/screen-info',
    '../tests/spec/lib/metrics',
    '../tests/spec/lib/null-metrics',
    '../tests/spec/lib/cropper',
    '../tests/spec/lib/image-loader',
    '../tests/spec/lib/resume-token',
    '../tests/spec/lib/xhr',
    '../tests/spec/lib/storage',
    '../tests/spec/lib/null-storage',
    '../tests/spec/views/base',
    '../tests/spec/views/tooltip',
    '../tests/spec/views/form',
    '../tests/spec/views/sign_up',
    '../tests/spec/views/complete_sign_up',
    '../tests/spec/views/sign_in',
    '../tests/spec/views/oauth_sign_in',
    '../tests/spec/views/oauth_sign_up',
    '../tests/spec/views/force_auth',
    '../tests/spec/views/settings',
    '../tests/spec/views/settings/avatar',
    '../tests/spec/views/settings/avatar_change',
    '../tests/spec/views/settings/avatar_crop',
    '../tests/spec/views/settings/avatar_gravatar',
    '../tests/spec/views/settings/avatar_camera',
    '../tests/spec/views/change_password',
    '../tests/spec/views/delete_account',
    '../tests/spec/views/confirm',
    '../tests/spec/views/tos',
    '../tests/spec/views/pp',
    '../tests/spec/views/reset_password',
    '../tests/spec/views/confirm_reset_password',
    '../tests/spec/views/complete_reset_password',
    '../tests/spec/views/ready',
    '../tests/spec/views/confirm_account_unlock',
    '../tests/spec/views/complete_account_unlock',
    '../tests/spec/views/cookies_disabled',
    '../tests/spec/views/clear_storage',
    '../tests/spec/views/unexpected_error',
    '../tests/spec/views/progress_indicator',
    '../tests/spec/views/marketing_snippet',
    '../tests/spec/views/cannot_create_account',
    '../tests/spec/views/close_button',
    '../tests/spec/views/mixins/floating-placeholder-mixin',
    '../tests/spec/views/mixins/timer-mixin',
    '../tests/spec/views/mixins/service-mixin',
    '../tests/spec/views/mixins/password-mixin',
    '../tests/spec/views/mixins/avatar-mixin',
    '../tests/spec/views/mixins/back-mixin',
    '../tests/spec/views/mixins/account-locked-mixin',
    '../tests/spec/models/user',
    '../tests/spec/models/account',
    '../tests/spec/models/form-prefill',
    '../tests/spec/models/reliers/base',
    '../tests/spec/models/reliers/relier',
    '../tests/spec/models/reliers/oauth',
    '../tests/spec/models/reliers/fx-desktop',
    '../tests/spec/models/auth_brokers/base',
    '../tests/spec/models/auth_brokers/fx-desktop',
    '../tests/spec/models/auth_brokers/web-channel',
    '../tests/spec/models/auth_brokers/redirect',
    '../tests/spec/models/auth_brokers/oauth',
    '../tests/spec/models/auth_brokers/iframe'
  ];

  /*global mocha */

  // The translator is expected to be on the window object.
  window.translator = new Translator('en-US', ['en-US']);

  // Make sure to tests are loaded in proper order using Require.JS
  var index = 0;
  var loadTests = function () {
    var test = tests[index];
    index += 1;
    if (index === tests.length) {
      // run the tests after all of them have loaded
      require([test], runTests);
    } else {
      require([test], loadTests);
    }
  };

  var runTests = function () {
    /**
     * Ensure session state does not pollute other tests
     */
    beforeEach(function () {
      Session.testClear();
    });

    afterEach(function () {
      Session.testClear();
    });

    var runner = mocha.run();

    runner.on('end', function () {
      // This is our hook to the Selenium tests that run
      // the mocha tests as part of the CI build.
      // The selenium test will wait until the #total-failures element exists
      // and check for "0"
      var failureEl = document.createElement('div');
      failureEl.setAttribute('id', 'total-failures');
      failureEl.innerHTML = runner.failures || '0';
      document.body.appendChild(failureEl);
    });
  };

  loadTests();

});



