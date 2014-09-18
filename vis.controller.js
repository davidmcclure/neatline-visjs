
/**
 * @package     omeka
 * @subpackage  neatline-visjs
 * @copyright   2014 David McClure
 * @license     http://www.apache.org/licenses/LICENSE-2.0.html
 */

Neatline.module('Vis', function(Vis) {


  Vis.Controller = Neatline.Shared.Controller.extend({


    slug: 'VIS',

    events: [

      'select',
      'unselect',

      { 'MAP:moveStart': 'minimize' },
      { 'MAP:focused': 'center' }

    ],

    commands: [
      'setOptions'
    ],


    /**
     * Create the view.
     */
    init: function() {
      this.view = new Neatline.Vis.View({ slug: this.slug });
      this.view.load();
    },


    /**
     * Select an event.
     *
     * @param {Object} args
     */
    select: function(args) {
      if (args.source !== this.slug) {

        // On startup, wait for the events to load.
        if (!this.view.items) {
          this.view.once('loaded', _.bind(function() {
            this.view.renderSelect(args.model);
          }, this));
        }

        // Otherwise, select immediately.
        else this.view.renderSelect(args.model);
        this.view.maximize();

      }
    },


    /**
     * Unselect an event.
     *
     * @param {Object} args
     */
    unselect: function(args) {
      if (!_.contains([this.slug, 'EVENTS'], args.source)) {
        this.view.renderUnselect(args.model);
      }
    },


    /**
     * Minimize the timeline when the map is panned (but not zoomed).
     *
     * @param {Object} event
     */
    minimize: function(event) {
      if (event.zoomChanged !== true) {
        this.view.minimize();
      }
    },


    /**
     * When the map is focused, nudge the viewport to push the centered
     * content into the middle of the visible viewport.
     */
    center: function() {
      this.view.centerMap();
    },


    /**
     * Set configuration options on the timeline instance.
     */
    setOptions: function(options) {
      this.view.timeline.setOptions(options);
    }


  });


});
