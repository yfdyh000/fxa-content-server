/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A model to hold verification data
 */

'use strict';

define([
  'backbone',
  'underscore'
], function (Backbone, _) {

  var VerificationInfo = Backbone.Model.extend({
    initialize: function (options) {
      Backbone.Model.prototype.initialize.call(this, options);

      // clean up any whitespace that was probably added by an MUA.
      _.each(this.defaults, function (value, key) {
        if (this.has(key)) {
          var cleanedValue = this.get(key).replace(/ /g, '');
          if (cleanedValue) {
            this.set(key, cleanedValue);
          } else {
            this.unset(key);
          }
        }
      }, this);
    },

    setValidationError: function (err) {
      this.validationError = err;
    },

    getValidationError: function () {
      return this.validationError;
    },

    isValid: function () {
      var isValid;

      if (this.validationError) {
        return false;
      }

      try {
        // super's isValid throws if invalid.
        isValid = Backbone.Model.prototype.isValid.call(this);
      } catch (e) {
        return false;
      }

      if (! isValid) {
        return false;
      }

      return true;
    }
  });

  return VerificationInfo;
});

