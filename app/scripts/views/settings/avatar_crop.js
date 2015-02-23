/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'p-promise',
  'underscore',
  'cocktail',
  'views/form',
  'views/mixins/settings-mixin',
  'views/mixins/avatar-mixin',
  'stache!templates/settings/avatar_crop',
  'lib/constants',
  'lib/cropper',
  'lib/auth-errors',
  'models/cropper-image'
],
function (p, _, Cocktail, FormView, SettingsMixin, AvatarMixin, Template,
    Constants, Cropper, AuthErrors, CropperImage) {
  var HORIZONTAL_GUTTER = 90;
  var VERTICAL_GUTTER = 0;

  var View = FormView.extend({
    template: Template,
    className: 'avatar-crop',

    initialize: function (options) {
      options = options || {};

      var data = this.ephemeralData() || {};
      this._cropImg = data.cropImg;

      if (! this._cropImg && this.broker.isAutomatedBrowser()) {
        this._cropImg = new CropperImage();
      }
    },

    beforeRender: function () {
      if (! this._cropImg) {
        this.navigate('settings/avatar/change', {
          error: AuthErrors.toMessage('UNUSABLE_IMAGE')
        });
        return false;
      }
    },

    afterRender: function () {
      this.canvas = this.$('canvas')[0];
    },

    afterVisible: function () {
      // Use pre-set dimensions if available
      var width = this._cropImg.get('width');
      var height = this._cropImg.get('height');
      var src = this._cropImg.get('src');

      try {
        this.cropper = new Cropper({
          container: this.$('.cropper'),
          src: src,
          width: width,
          height: height,
          displayLength: Constants.PROFILE_IMAGE_DISPLAY_SIZE,
          exportLength: Constants.PROFILE_IMAGE_EXPORT_SIZE,
          verticalGutter: VERTICAL_GUTTER,
          horizontalGutter: HORIZONTAL_GUTTER
        });
      } catch (e) {
        // settings_common functional tests visit this page directly so draggable
        // won't be preloaded. Ignore errors about that– they don't matter.
        if (this.broker.isAutomatedBrowser() && e.message.indexOf('draggable') !== -1) {
          return;
        }

        this.navigate('settings/avatar/change', {
          error: AuthErrors.toMessage('UNUSABLE_IMAGE')
        });
      }
    },

    toBlob: function () {
      var defer = p.defer();

      this.cropper.toBlob(function (data) {
        defer.resolve(data);
      }, this._cropImg.get('type'),
      Constants.PROFILE_IMAGE_JPEG_QUALITY);

      return defer.promise;
    },

    submit: function () {
      var self = this;

      return self.toBlob()
        .then(function (data) {
          return self.getSignedInAccount().uploadAvatar(data);
        })
        .then(function (result) {
          self.updateAvatarUrl(result.url);
          self.navigate('settings');
          return result;
        });
    }

  });

  Cocktail.mixin(View, SettingsMixin, AvatarMixin);

  return View;
});
