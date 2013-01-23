function Escort(selector) {
  if (!(this instanceof Escort)) return new Escort(selector);
  this.bindMethods();
  this.$el = jQuery(selector);
  this.$el.hide();
  this.initPopups();
  Escort.addInstance(this);
  return this;
}

Escort.instances = [];

Escort.addInstance = function(instance) {
  if (this.instances.length === 0) this.attach();
  this.instances.push(instance);
};

Escort.attach = function() {
  $(window).on('hashchange', $.proxy(Escort, 'checkHash'));
};

Escort.checkHash = function(event) {
  for (var i = 0; i < this.instances.length; i++) {
    var popupIndex = this.instances[i].getIndexFromHash();
    if (popupIndex > -1) {
      this.instances[i].show(popupIndex);
      break;
    }
  }
};

Escort.prototype.getIndexFromHash = function() {
  var id = location.hash.replace(/^#/, '');
  if (id === '') return -1;
  for (var i = 0; i < this.popups.length; i++) {
    var matches = this.popups[i].attr('id') == id;
    if (matches) {
      this.show(i);
      return i;
    }
  }
  return -1;
};

Escort.prototype.bindMethods = function() {
  this.initPopup = $.proxy(this, 'initPopup');
};

Escort.prototype.initPopups = function() {
  this.popups = this.$el.children().map(this.initPopup);
};

Escort.prototype.initPopup = function(index, el) {
  return $(el).hide().css('position', 'absolute');
};

Escort.prototype.start = function() {
  var indexFromHash = this.getIndexFromHash();
  var index = indexFromHash > -1 ? indexFromHash : 0;
  this.$el.show();
  this.show(index);
};

Escort.prototype.show = function(index) {
  this.hideCurrent();
  this.$popup = this.popups[index];
  this.$popup.show();
  this.position();
  setTimeout($.proxy(this, 'scroll'), 100);
};

Escort.prototype.hideCurrent = function() {
  if (this.$popup) this.$popup.hide();
};

Escort.prototype.position = function() {
  var pointsTo = this.$popup.attr('points-to');
  if (pointsTo) {
    this.pointTo(pointsTo);
  } else {
    this.positionDefault();
  }
};

Escort.prototype.scroll = function() {
  this.$popup.scrollIntoView({offset: {x: 0, y: 100}});
};

Escort.prototype.positionDefault = function() {
  this.$popup.position({
    my: 'center',
    at: 'center',
    of: window
  });
};

Escort.positions = {
  left: {
    my: 'right',
    at: 'left center'
  },
  right: {
    my: 'left',
    at: 'right'
  },
  top: {},
  bottom: {}
};

Escort.prototype.pointTo = function(pointTo) {
  var position = this.$popup.attr('position') || 'bottom';
  var options = Escort.positions[position];
  options.of = $(pointTo);
  console.log(options);
  this.$popup.position(options);
};

