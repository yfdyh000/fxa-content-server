/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// helper functions for views with a profile image. Meant to be mixed into views.

'use strict';

define([
  'lib/image-loader',
  'lib/profile-errors'
], function (ImageLoader, ProfileErrors) {

  return {
    // Attempt to load a profile image from the profile server
    _fetchProfileImage: function (account) {
      var self = this;

      return account.getAvatar()
        .then(function (result) {
          if (result && result.avatar && result.id) {
            return ImageLoader.load(result.avatar);
          }
        })
        .then(null, function (err) {
          if (! err.errno) {
            err = ProfileErrors.toError('IMAGE_LOAD_ERROR');
          }
          // Failures to load a profile image are not displayed in the ui
          // so log the error here to make sure it's in metrics.
          self.logError(err);
          throw err;
        });
    },

    _displayProfileImage: function (account, wrapperClass) {
      var self = this;
      if (! account) {
        return;
      }

      if (! wrapperClass) {
        wrapperClass = '.avatar-wrapper';
      }

      // If the account doesn't have a profile image URL cached it
      // probably doesn't have one, so show the default image immediately
      // while we check for a real image
      if (! account.has('profileImageUrl')) {
        self.$(wrapperClass).addClass('with-default');
      }

      return this._fetchProfileImage(account)
        .then(function (img) {
          if (img) {
            self.$(wrapperClass).append(img);
            self.$(wrapperClass).removeClass('with-default');
            self.logEvent(self.className + '.profile_image_shown');
          } else {
            self.logEvent(self.className + '.profile_image_not_shown');
          }
        })
        .then(null, function () {
          // Ignore errors; the default image will be shown.
          self.$(wrapperClass).addClass('with-default');
          self.logEvent(self.className + '.profile_image_not_shown');
        });
    },

    // Cache the profile image URL in localStorage whenever it changes
    // TODO: issue #2095 send broadcast
    updateAvatarUrl: function (url) {
      if (! url && url !== null) {
        return;
      }
      var account = this.getSignedInAccount();
      account.set('profileImageUrl', url);
      this.user.setAccount(account);
    }
  };
});
