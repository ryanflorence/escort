/*!
 * Borrowed from jQuery UI Core, if you are using jQuery UI then you don't need this file.
 * MIT Style license
 * http://jqueryui.com
 */

(function() {

  var ie = !!(/msie [\w.]+/).exec(navigator.userAgent.toLowerCase());

  jQuery.fn.scrollParent = jQuery.fn.scrollParent || function() {
    var scrollParent;
    if (($.ui.ie && (/(static|relative)/).test(this.css("position"))) || (/absolute/).test(this.css("position"))) {
      scrollParent = this.parents().filter(function() {
        return (/(relative|absolute|fixed)/).test($.css(this,"position")) && (/(auto|scroll)/).test($.css(this,"overflow")+$.css(this,"overflow-y")+$.css(this,"overflow-x"));
      }).eq(0);
    } else {
      scrollParent = this.parents().filter(function() {
        return (/(auto|scroll)/).test($.css(this,"overflow")+$.css(this,"overflow-y")+$.css(this,"overflow-x"));
      }).eq(0);
    }

    return (/fixed/).test(this.css("position")) || !scrollParent.length ? $(document) : scrollParent;
  };

})();

