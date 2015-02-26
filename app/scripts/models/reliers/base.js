/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * The base relier. It's the base of all other reliers, or a NullRelier,
 * depending on how you want to use it.
 */

'use strict';

define([
  'backbone',
  'lib/promise'
], function (Backbone, p) {

  var Relier = Backbone.Model.extend({
    defaults: {},

    fetch: function () {
      return p(true);
    },

    /**
     * Check if the user visits FxA directly, without
     * a relier.
     *
     * @returns {Boolean}
     * `true` if the user visits FxA without using
     * a relier
     */
    isDirectAccess: function () {
      return ! this.has('service');
    },

    /**
     * Check if the relier is using the oauth flow
     */
    isOAuth: function () {
      return false;
    },

    /**
     * Check if the relier is Firefox Desktop
     */
    isFxDesktop: function () {
      return false;
    },

    /**
     * Check if the relier is Sync for Firefox Desktop
     */
    isSync: function () {
      return false;
    },

    /**
     * Check if the relier forces the "customize sync" checkbox to be checked.
     */
    isCustomizeSyncChecked: function () {
      return false;
    },

    /**
     * Check if the relier needs access to a keyFetchToken.
     */
    isKeyFetchEnabled: function () {
      return false;
    },

    /**
     * Create a resume token to be passed along in the email
     * verification links
     */
    getResumeToken: function () {
      return null;
    },

    /**
     * Indicates whether the relier allows cached credentials
     */
    allowCachedCredentials: function () {
      return true;
    }
  });

  return Relier;
});
