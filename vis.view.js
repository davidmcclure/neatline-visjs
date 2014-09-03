
/**
 * @package     omeka
 * @subpackage  neatline-visjs
 * @copyright   2014 David McClure
 * @license     http://www.apache.org/licenses/LICENSE-2.0.html
 */

Neatline.module('Vis', function(Vis) {


  Vis.View = Neatline.Shared.Widget.View.extend({


    id: 'timeline',

    events: {
      'click': 'maximize'
    },


    // STARTUP
    // ------------------------------------------------------------------------


    /**
     * Initialize the collection and timeline.
     */
    init: function(options) {

      this.slug = options.slug;

      // Spin up an empty records collection.
      this.records = new Neatline.Shared.Record.Collection();

      // Create timeline.
      this._initTimeline();
      this._initGroups();
      this._initMaximize();
      this._initSelect();

    },


    /**
     * Initialize the timeline.
     */
    _initTimeline: function() {
      this.timeline = new vis.Timeline(this.el);
      this.timeline.setOptions(Vis.config.options);
    },


    /**
     * If defined in the configuration file, register groups.
     */
    _initGroups: function() {

      // Break if no groups defined.
      if (!_.isArray(Vis.config.groups)) return;

      // Create a dataset for the groups.
      var groups = new vis.DataSet();
      _.each(Vis.config.groups, function(band) {
        groups.add({ id: band.tag, content: band.title });
      });

      // Add to the timeline.
      this.timeline.setGroups(groups);

    },


    /**
     * Maximize when the zoom level is changed.
     */
    _initMaximize: function() {
      this.timeline.on('rangechanged', _.bind(this.maximize, this));
    },


    /**
     * Listen for event selections.
     */
    _initSelect: function() {

      this.selected = [] // The currently-selected ids.

      // When an event is selected.
      this.timeline.on('select', _.bind(function(args) {

        // Which IDs were added and removed?
        var a = _.difference(args.items, this.selected);
        var r = _.difference(this.selected, args.items);

        // Unselect removed IDs, select added IDs.
        _.each(r, _.bind(this.publishUnselect, this));
        _.each(a, _.bind(this.publishSelect, this));

        // Set the new IDs.
        this.selected = args.items;

        // Update the `selected` class.
        this.$el.toggleClass('selected', !_.isEmpty(this.selected));

      }, this));

    },


    // RECORDS
    // ------------------------------------------------------------------------


    /**
     * Load records for the timeline.
     */
    load: function() {
      var params = { hasDate: true };
      this.records.update(params, _.bind(this.ingest, this));
    },


    /**
     * Clear the timeline and render a new collection.
     *
     * @param {Object} records
     */
    ingest: function(records) {

      var events = new vis.DataSet();

      records.each(function(record) {

        // Pass if no start date.
        var start = record.get('start_date');
        if (!start) return;

        // Default parameters.
        var event = {
          id:       record.id,
          content:  record.get('title'),
          start:    start,
          model:    record
        };

        // If defined, add end date.
        var end = record.get('end_date');
        if (end) event['end'] = end;

        // Set the group.
        _.each(Vis.config.groups, function(band) {
          if (record.hasTag(band.tag)) {
            event['group'] = band.tag;
          }
        });

        events.add(event);

      });

      // Render the collection.
      this.timeline.setItems(events);

    },


    // EVENTS
    // ------------------------------------------------------------------------


    /**
     * Publish a record selection.
     *
     * @param {Number} id
     */
    publishSelect: function(id) {
      this.publish('select', this.records.get(id));
    },


    /**
     * Publish a record unselection.
     *
     * @param {Number} id
     */
    publishUnselect: function(id) {
      this.publish('unselect', this.records.get(id));
    },


    /**
     * Render a record selection.
     *
     * @param {Object} model
     */
    renderSelect: function(model) {
      this.selected = [model.id]
      this.timeline.setSelection(this.selected);
      this.focusByModel(model);
    },


    /**
     * Remove a record selection.
     *
     * @param {Object} model
     */
    renderUnselect: function(model) {
      this.selected = _.without(this.selected, model.id);
      this.timeline.setSelection(this.selected);
    },


    /**
     * Shrink the timeline.
     */
    minimize: function() {
      this.$el.addClass('minimized');
    },


    /**
     * Expand the timeline.
     */
    maximize: function() {
      this.$el.removeClass('minimized');
    },


    /**
     * Broadcast a public event.
     *
     * @param {String} event
     * @param {Object} model
     */
    publish: function(event, model) {
      Neatline.vent.trigger(event, {
        model: model, source: this.slug
      });
    },


    // VIEWPORT
    // ------------------------------------------------------------------------


    /**
     * Center on the model's span in the viewport.
     *
     * @param {Object} model
     */
    focusByModel: function(model) {

      d1 = moment(model.get('start_date'));
      d2 = moment(model.get('end_date'));

      // SPAN
      if (d1.isValid() && d2.isValid()) {

        var p = Vis.config.padding.span;

        // Compute the viewport boundaries
        var gutter = d2.diff(d1) * p;
        var b1 = d1.clone().subtract(gutter).toISOString();
        var b2 = d2.clone().add(gutter).toISOString();

        // Focus the timeline.
        this.timeline.setWindow(b1, b2);

      }

      // POINT
      else if (d1.isValid()) {

        var p = Vis.config.padding.point;

        // Compute the viewport boundaries
        var b1 = d1.clone().subtract(p.value, p.unit).toISOString();
        var b2 = d1.clone().add(p.value, p.unit).toISOString();

        // Focus the timeline.
        this.timeline.setWindow(b1, b2);

      }

    },


    /**
     * Pan the map so that the centroid is moved to the center of the visible
     * viewport that's not occluded by the timeline.
     */
    centerMap: function() {
      var height = this.$el.height();
      Neatline.request('MAP:getMap').pan(0, height/2);
    },


  });


});
