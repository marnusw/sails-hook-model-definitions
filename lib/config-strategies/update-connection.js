/**
 * Copyright 2015, Marnus Weststrate
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
'use strict';
var _ = require('lodash');


/**
 * Set the `connection` property of each model definition to that specified on the alternate connection
 * property of the model definition. The name of this property can be specified with the `altConnectionProperty`
 * option.
 *
 * A default connection name for use when a specific model does not have the alternate connection property defined
 * or when `altConnectionProperty` is not set can be provided on `altConnectionDefault`. At least one of these
 * properties are required.
 *
 * @param modelDefs {Object} The original model definitions dictionary.
 * @param options {{altConnectionDefault: {String}, altConnectionProperty: {String}}}
 * @returns {Object} The updated model definitions dictionary.
 */
module.exports = function updateConnection(modelDefs, options) {
  var defaultConn = options.altConnectionDefault;
  var connProp = options.altConnectionProperty;

  return _.map(modelDefs, function(modelDef) {
    // A shallow clone will suffice since only a text property is changed
    return _.assign({}, modelDef, {
      connection: modelDef[connProp] ? modelDef[modelDef[connProp]] : defaultConn
    });
  });
};
