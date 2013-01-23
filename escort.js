/**
 * Initialize a new Escort with an $Element or selector.
 *
 * @param {String|$Element} selector CSS selector string or jQuery element
 * @api public
 * @return {Escort}
 */

function Escort(selector) {
  if (!(this instanceof Escort)) return new Escort(selector);
  this.bindMethods();
  this.$el = jQuery(selector);
  this.initPopups();
  this.attachEvents();
  this.$el.hide();
  Escort.addInstance(this);
  return this;
}

/**
 * Start a tour.
 *
 * The first popup to display will be the first popup unless one is found in
 * the hash.
 *
 * @api public
 * @return {Escort}
 */

Escort.prototype.start = function() {
  var indexFromHash = this.getIndexFromHash();
  var index = indexFromHash > -1 ? indexFromHash : 0;
  this.$el.show();
  this.show(index);
  return this;
};

/**
 * Show the popup at `index`.
 *
 * @param {Number} index
 * @api public
 * @return {Escort}
 */

Escort.prototype.show = function(index) {
  this.hideCurrent();
  this.$popup = this.popups[index];
  this.$popup.show();
  this.position();
  setTimeout($.proxy(this, 'scroll'), 100);
  return this;
};

/**
 * Closes the tour.
 *
 * @api public
 * @return {Escort}
 */

Escort.prototype.close = function(event) {
  this.$el.hide();
  if (event) event.preventDefault();
  location.hash = '';
  return this;
};

/**
 * Binds methods to the instance to be used functionally.
 *
 * @api private
 */

Escort.prototype.bindMethods = function() {
  this.initPopup = $.proxy(this, 'initPopup');
  this.close = $.proxy(this, 'close');
};

/**
 * Attaches events to `$el`.
 *
 * @api private
 */

Escort.prototype.attachEvents = function() {
  this.$el.on('click.escort', '.escort-close', this.close);
};

/**
 * Removes events from `$el`.
 *
 * @api private
 */

Escort.prototype.removeEvents = function() {
  this.$el.off('.escort');
};

/**
 * Finds the index for the popup id found in `location.hash` or -1 if not
 * found.
 *
 * @return {Number}
 * @api private
 */

Escort.prototype.getIndexFromHash = function() {
  var id = location.hash.replace(/^#/, '');
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
  if (this.$popup) this.$popup.hide();
};

/**
 * Positions the current popup.
 *
 * @api private
 */

Escort.prototype.position = function() {
  var pointsTo = this.$popup.attr('points-to');
  if (pointsTo) {
    this.pointTo(pointsTo);
  } else {
    this.positionDefault();
  }
};

/**
 * Scrolls the current popup into view.
 *
 * @api private
 */

Escort.prototype.scroll = function() {
  this.$popup.scrollIntoView({offset: {x: 0, y: 100}});
};

/**
 * Positions the current popup in the center of the viewport.
 *
 * @api private
 */

Escort.prototype.positionDefault = function() {
  this.$popup.position({
    my: 'center',
    at: 'center',
    of: window
  });
};

/**
 * Positions the current popup relative to the element it points to.
 *
 * @api private
 */

Escort.prototype.pointTo = function(pointTo) {
  var position = this.$popup.attr('position') || 'bottom';
  var options = Escort.positions[position];
  options.of = $(pointTo);
  console.log(options);
  this.$popup.position(options);
};


/**
 * Stores all instances
 */

Escort.instances = [];

/**
 * Map `points-to` values to `$.fn.position` options.
 */

Escort.positions = {
  left:   { my: 'right',  at: 'left' },
  right:  { my: 'left',   at: 'right' },
  top:    { my: 'bottom', at: 'top' },
  bottom: { my: 'top',    at: 'bottom' }
};

/**
 * Adds an Escort to instances array.
 *
 * @param {Escort} instance
 * @api private
 */

Escort.addInstance = function(instance) {
  if (this.instances.length === 0) this.attach();
  this.instances.push(instance);
};

/**
 * Attaches hashchange event for all instances.
 *
 * @api private
 */

Escort.attach = function() {
  $(window).on('hashchange', $.proxy(Escort, 'checkHash'));
};

/**
 * Checks `location.hash` for popups in all instances and shows one if found.
 *
 * @param {Object} event jQuery event object
 * @api private
 */

Escort.checkHash = function(event) {
  for (var i = 0; i < this.instances.length; i++) {
    var popupIndex = this.instances[i].getIndexFromHash();
    if (popupIndex > -1) {
      this.instances[i].show(popupIndex);
      break;
    }
  }
};

