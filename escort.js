/**
 * Initialize a new Escort with an $Element or selector.
 *
 * @param {String|$Element} selector CSS selector string or jQuery element
 * @api public
 * @return {Escort}
 */

function Escort(selector, options) {
  if (!(this instanceof Escort)) return new Escort(selector);
  this.options = $.extend({}, this.defaults, options);
  this.bindMethods();
  this.$el = jQuery(selector);
  this.eventProxy = $({});
  this.initPopups();
  this.attachEvents();
  this.$el.hide();
  this.constructor.addInstance(this);
  console.log(this.options.offset.x);
  return this;
}

Escort.prototype.defaults = {
  position: true,
  resetStyles: { opacity: 0 },
  offset: {x: 20, y: 20},
  animations: {
    left:   { left: '-=20px', opacity: 1 },
    right:  { left: '+=20px', opacity: 1 },
    bottom: { top: '+=20px',  opacity: 1 },
    top:    { top: '-=20px',  opacity: 1 }
  }
};

/**
 * Start a tour.
 *
 * The initial popup to display will be the first unless one is found in the
 * hash.
 *
 * @return {Escort}
 * @api public
 */

Escort.prototype.start = function() {
  if (this.$popup) return; // started from constructor
  var indexFromHash = this.getIndexFromHash();
  var index = indexFromHash > -1 ? indexFromHash : 0;
  this.$el.show();
  this.show(index);
};

/**
 * Show the popup at `index`.
 *
 * @param {Number} index
 * @return {Escort}
 * @api public
 */

Escort.prototype.show = function(index) {
  this.$el.show();
  this.hideCurrent();
  this.$popup = this.popups[index];
  this.beforeShow();
  this.$popup.show();
  this.$popup.css(this.options.resetStyles);
  if (this.options.position) {
    this.position();
  }
  this.scroll(this.animate);
  this.trigger(this.$popup.attr('id'));
  return this;
};

/**
 * Adds event listener to the instance.
 *
 * Events:
 *
 * - when a popup is shown, triggers its id
 * - when a popup is hidden, triggers {id}:hide
 * - when the tour is closed
 *
 * @param {String} popupId
 * @param {Function} handler
 * @api public
 */

Escort.prototype.on = function(popupId, handler) {
  this.eventProxy.on(popupId, handler);
};

/**
 * Removes an event listener from the instance.
 *
 * @param {String} event
 * @param {Function} handler
 * @api public
 */

Escort.prototype.off = function(event, handler) {
  this.eventProxy.off(event, handler);
};

/**
 * Closes the tour.
 *
 * @returns {Escort}
 * @api public
 */

Escort.prototype.close = function(event) {
  this.$el.hide();
  if (event) event.preventDefault();
  window.location.hash = '';
  this.trigger('hide');
  return this;
};

/**
 * Called before a popup is shown.
 *
 * @api private
 */

Escort.prototype.beforeShow = function() {
  this.trigger(this.$popup.attr('id') + ':before');
  this.appendHash();
};

/**
 * Appends a hash to a popup's `points-to` href to persist a tour across page
 * loads.
 *
 * @api private
 */

Escort.prototype.appendHash = function() {
  var data = this.$popup.data();
  if (!data.appendHash || !data.pointsTo) return;
  var target = $(data.pointsTo);
  var hash = data.appendHash.replace(/^#/, '');
  target.attr('href', target.attr('href') + '#' + hash);
};

/**
 * Removes hash from popup's `points-to` href.
 *
 * @api private
 */

Escort.prototype.removeHash = function() {
  var data = this.$popup.data();
  if (!data.appendHash || !data.pointsTo) return;
  var target = $(data.pointsTo);
  var href = target.attr('href').replace(/#.+$/, '');
  target.attr('href', href);
};

/**
 * Animates the popup.
 *
 * @api private
 */

Escort.prototype.animate = function() {
  this.$popup.animate(this.getPopupAnimation(), 200);
};

/**
 * Gets animation options for the popup animation.
 *
 * @api private
 */

Escort.prototype.getPopupAnimation = function() {
  var direction = this.$popup.data('position') || 'bottom';
  return this.options.animations[direction];
};

/**
 * Triggers event listeners on `name`
 *
 * @param {String} name
 * @api private
 */

Escort.prototype.trigger = function(event) {
  this.eventProxy.trigger.apply(this.eventProxy, arguments);
};

/**
 * Binds methods to the instance to be used functionally.
 *
 * @api private
 */

Escort.prototype.bindMethods = function() {
  this.initPopup = $.proxy(this, 'initPopup');
  this.close = $.proxy(this, 'close');
  this.animate = $.proxy(this, 'animate');
};

/**
 * Attaches events to `$el`.
 *
 * @api private
 */

Escort.prototype.attachEvents = function() {
  this.$el.on('click.escort', '.escort-close', this.close);
  //$('body').on('click.escort', '[hijack]', $.proxy(this, 'hijackClick'));
};

/**
 * Removes events from `$el`.
 *
 * @api private
 */

Escort.prototype.removeEvents = function() {
  this.$el.off('.escort');
  //$('body').off('.escort');
};

/**
 * Finds the index for the popup id found in `location.hash` or -1 if not
 * found.
 *
 * @return {Number}
 * @api private
 */

Escort.prototype.getIndexFromHash = function() {
  var id = window.location.hash.replace(/^#/, '');
  if (id === '') return -1;
  for (var i = 0; i < this.popups.length; i++) {
    if (this.popups[i].attr('id') == id) return i;
  }
  return -1;
};

/**
 * Initializes popup elements.
 *
 * @api private
 */

Escort.prototype.initPopups = function() {
  this.popups = this.$el.children().map(this.initPopup);
};

/**
 * Initialize single popup element.
 *
 * @return {$Element}
 * @api private
 */

Escort.prototype.initPopup = function(index, el) {
  return $(el).hide().css('position', 'absolute');
};

/**
 * Hides current popup.
 *
 * @api private
 */

Escort.prototype.hideCurrent = function() {
  if (!this.$popup) return;
  this.$popup.hide();
  this.removeHash();
  this.trigger(this.$popup.attr('id') + ':hide');
};

/**
 * Positions the current popup.
 *
 * @api private
 */

Escort.prototype.position = function() {
  var pointsTo = this.$popup.data('points-to');
  if (pointsTo) {
    this.pointTo(pointsTo);
  } else {
    this.positionDefault();
  }
};

/**
 * Positions the current popup in the center of the viewport.
 *
 * @api private
 */

Escort.prototype.positionDefault = function() {
  this.$popup.position(this.constructor.positions['default']);
};

/**
 * Positions the current popup relative to the element it points to.
 *
 * @api private
 */

Escort.prototype.pointTo = function(pointTo) {
  var position = this.$popup.data('position') || 'bottom';
  var options = this.constructor.positions[position];
  options.of = $(pointTo);
  this.$popup.position(options);
};

/**
 * Scrolls the current popup into view.
 *
 * @api private
 */

Escort.prototype.scroll = function(callback) {
  this.$popup.scrollIntoView({
    offset: this.getScrollOffset(),
    complete: callback
  });
};

/**
 * Determines the offset in `scroll`
 *
 * @api private
 */

Escort.prototype.getScrollOffset = function() {
  return {
    x: parseInt(this.$popup.data('offset-x') || this.options.offset.x, 10),
    y: parseInt(this.$popup.data('offset-y') || this.options.offset.y, 10)
  }
};

/**
 * Stores all instances
 */

Escort.instances = [];

/**
 * Map `points-to` values to `$.fn.position` options.
 */

// collision: 'none' because $.fn.position mistakenly flips the element if
// the `of` element has a negative scrollX :\
Escort.positions = {
  left:      { my: 'right',  at: 'left',   collision: 'none' },
  right:     { my: 'left',   at: 'right',  collision: 'none' },
  top:       { my: 'bottom', at: 'top',    collision: 'none' },
  bottom:    { my: 'top',    at: 'bottom', collision: 'none' },
  'default': { my: 'center', at: 'center', of: window, collision: 'none' }
};

/**
 * Adds an Escort to instances array.
 *
 * @param {Escort} instance
 * @api private
 */

Escort.addInstance = function(instance) {
  this.instances.push(instance);
  if (this.instances.length == 1) {
    this.attachEvents();
    this.checkHash();
  }
};

/**
 * Attaches hashchange event for all instances.
 *
 * @api private
 */

Escort.attachEvents = function() {
  $(window).on('hashchange', $.proxy(this, 'checkHash'));
};

/**
 * Checks `location.hash` for popups in all instances and shows one if found.
 *
 * @param {Object} event jQuery event object
 * @api private
 */

Escort.checkHash = function(event) {
  for (var i = 0; i < this.instances.length; i++) {
    var index = this.instances[i].getIndexFromHash();
    if (index == -1) continue;
    this.instances[i].show(index);
    break;
  }
};

