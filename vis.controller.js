
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
        this.view.renderSelect(args.model)
      }
    },


    /**
     * Unselect an event.
     *
     * @param {Object} args
     */
    unselect: function(args) {
      if (!_.contains([this.slug, 'EVENTS'], args.source)) {
        this.view.renderUnselect(args.model)
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
    }


  });


});
