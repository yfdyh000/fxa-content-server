/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A model to hold sign up verification data
 */

'use strict';

define([
  './base',
  'lib/validate'
], function (VerificationInfo, Validate) {

  var SignUpVerificationInfo = VerificationInfo.extend({
    defaults: {
      uid: null,
      code: null
    },

    validate: function (attributes/*, options*/) {
      if (! Validate.isUidValid(attributes.uid)) {
        throw new Error('invalid token');
      }
      if (! Validate.isCodeValid(attributes.code)) {
        throw new Error('invalid code');
      }
    }
  });

  return SignUpVerificationInfo;
});

