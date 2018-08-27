(function ($) {

  $.fn.gdtooltip = function (options) {

    // default settings
    var settings = $.extend({}, $.fn.gdtooltip.settings, options);

    if (settings.colToolTip.length > 0) {

      // main section to loop for each element
      return this.each(function () {

        var $gdtable = $(this);

        var tempText = "";

        // for each row in the body
        $gdtable.find("tbody").find("tr").each(function () {

          // copy the <td> text to a data attribute and add te gdtooltip class
          for (var x = 0; x < settings.colToolTip.length; x++) {
            var $td = $(this).find("td").slice(settings.colToolTip[x], settings.colToolTip[x] + 1);
            $td.data("tooltip", $td.find("span").first().text());
            $td.addClass("gdtooltip");
            // console.log("data = " + $td.data("tooltip"));
          }

        });


      });

    };


  };

  $.fn.gdtooltip.settings = {
    colToolTip: [],
    toolTipDelay: 500,
    toolTipHold: 1000
  };

}(jQuery));
