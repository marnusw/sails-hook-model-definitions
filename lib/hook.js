/**
 * Copyright 2015, Marnus Weststrate
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
'use strict';
var _ = require('lodash');

var updateStrategies = {
  'update-connection': require('./config-strategies/update-connection')
};


/**
 * The hook can be configured by exporting the `modelDefinitions` property on the Sails config object.
 * The exported object will be set as the current configs, so it should be an object of config objects
 * indexed by update config id.
 *
 * @param sails
 * @returns {Object} The Hook definition.
 * @constructor
 */
module.exports = function ModelDefinitionsHook(sails) {

  var modelDefs = {};
  var configs;

  var updatedDefs = {};

  // Hook Definition
  var ModelDefsHook = {

    defaults: {
      modelDefinitions: {
        transforms: {}
      }
    },

    configure: function() {
      configs = sails.config.modelDefinitions.transforms;
    },

    /**
     * Loads the model definitions after the Sails ORM has loaded. When the ORM is reloaded
     * the model definitions are reloaded here as well.
     * @param done
     */
    initialize: function(done) {
      sails.after('hook:orm:loaded', function() {
        loadModelDefs(done);
      });
      sails.on('hook:orm:reloaded', loadModelDefs);
    },

    /**
     * Get the original model definitions as they were read from disk.
     */
    getModelDefs: function() {
      return modelDefs;
    },

    /**
     * Get the model definitions with the updates associated with `id` applied. If an updated configuration
     * is provided on the second parameter that config will replace any previous configs on this id and the
     * updated results will be according to the new config.
     *
     * @param id The id that will identify these updates in the future.
     * @param [config] The configuration for the update, an object specifying `updateType` and associated options.
     * @returns {Object} The updated model definitions directory.
     */
    getUpdatedDefs: function(id, config) {
      if (config && !_.isEqual(config, configs[id]) || !updatedDefs[id]) {
        updatedDefs[id] = updateStrategies[config.updateType](modelDefs, config);
        configs[id] = config;
      }
      return updatedDefs[id];
    }
  };

  /**
   * Use the Sails.js module loader to load model definitions from disk and then apply any updates
   * configured thus far. Since this is an async operation a callback can be provided as a first
   * argument.
   *
   * @param cb
   */
  function loadModelDefs(cb) {
    sails.modules.loadModels(function(err, models) {
      if (err) {
        return cb && cb(err);
      }

      Object.keys(models).forEach(function(identity) {
        modelDefs[identity] = _.extend({}, sails.config.models, models[identity]);
      });

      Object.keys(configs).forEach(function(id) {
        ModelDefsHook.getUpdatedDefs(id, configs[id]);
      });

      if (cb) {
        cb();
      }
    });
  }

  return ModelDefsHook;
};
