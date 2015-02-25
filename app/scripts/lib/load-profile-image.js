/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'lib/promise',
  'lib/image-loader',
  'lib/profile-errors'
], function (p, ImageLoader, ProfileErrors) {

  return function (imgUrl) {
    return ImageLoader.load(imgUrl)
      .then(null, function () {
        return p.reject(ProfileErrors.toError('IMAGE_LOAD_ERROR'));
      });
  };
});

