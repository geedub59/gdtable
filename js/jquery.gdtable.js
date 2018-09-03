(function ($) {

  $.fn.gdtable = function (options) {

    // default settings
    var settings = $.extend({}, $.fn.gdtable.settings, options);

    // a variable to be used to save the settings data for each element initialised
    var gdPrefix = "_gdtable";

    var $gd = {
      filterOn: false,
      currentRow: null,
      currentRowHTML: "",
      lastScrollTop: 0,
      rowActionMenu: "<div class='gd-rowactionmenu gd-menucontainer' style='position: absolute; display: none;'>\
                        <ul>\
                          <li class='gd-menuedit'>Edit</li>\
                          <li class='gd-menudelete'>Delete</li>\
                          <li class='gd-menuinsert'>Insert Before</li>\
                          <li class='gd-menuadd'>Add After</li>\
                        </ul>\
                      </div>",
      filterMenu: "<div class='gd-filtermenu gd-menucontainer' style='position: absolute; display: none;'>\
                      <ul>\
                        <li class='gd-filterclear'>Clear All</li>\
                        <li class='gd-filterhelp'>Help</li>\
                        <li class='gd-filterB'>B</li>\
                        <li class='gd-filterC'>C</li>\
                      </ul>\
                    </div>",
      filterHelp: "<div class='gd-filterhelp gd-menucontainer' style='position: absolute; display: none;'>\
                      <ul>\
                        <li>&nbsp;</li>\
                        <li>use <b>^</b> to select starting characters; e.g. <b>^ab</b> will find ABERDEEN but will excude AWABA</li>\
                        <li>&nbsp;</li>\
                        <li>use <b>$</b> to select ending characters; e.g. <b>nt$</b> will find ASHMONT but will exclude ANTWERP</li>\
                        <li>&nbsp;</li>\
                        <li>use <b>!</b> to exclude the following characters; e.g. <b>!vic</b> will exclude Victoria</li>\
                        <li>&nbsp;</li>\
                        <li>use <b>&gt;</b> with numeric fields; e.g. <b>&gt;2000</b> will exclude values of 2000 or less</li>\
                        <li>&nbsp;</li>\
                        <li>use <b>&lt;</b> with numberic fields; e.g. <b>&lt;3000</b> will exclude values greater than 3000</li>\
                        <li>&nbsp;</li>\
                        <li>use <b>|</b> for multiple <b>'or'</b> filters with both numbers and letters</li>\
                        <li>&nbsp;</li>\
                        <li>use <b>&amp;</b> for multiple <b>'and'</b> filters with numbers only; e.g. <b>&gt; 2000 &amp; &lt; 2200</li>\
                        <li>&nbsp;</li>\
                      </ul>\
                    </div>"
}

    function debounce(func, wait, immediate) {
      var timeout;
      return function () {
        var context = this,
          args = arguments;
        var later = function () {
          timeout = null;
          if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
      };
    };

    var processFilter = debounce(function () {
      // stop propagation
      // event.stopImmediatePropagation;

      // process filters
      $gdtable = $(this).parents("table");
      $gdtable.applyFilter();

      // reset odd/even row coloring
      $gdtable.gdzebra();

      $(window).trigger("resize");

    }, settings.filterDelay);

    var recalcOnResize = function () {

      var $gdtable = $(this);

      var settings = $gdtable.data("_gdtable");

      var containerWidth = $gdtable.find("thead").outerWidth(true) - 17;

      // set the height of the table and table body
      $gdtable.height($gdtable.parent().height());
      $gdtable.find("tbody").height($gdtable.parent().height() - $gdtable.find("thead").height());

      // set the widths of each of the body columns
      $gdtable.find("tbody").find("tr:visible").first().find("td").each(function (index) {
        $(this).outerWidth(Math.max((settings.colWidthRatio[index] * containerWidth), settings.colMinWidth[index]));
        $(this).css("minWidth", settings.colMinWidth[index]);
      });

      //set the widths of each of the header columns to be the same as the body columns
      $gdtable.find("thead tr").each(function () {
        $(this).find("th").each(function (index) {
          $(this).outerWidth($gdtable.find("tbody").find("tr:visible").first().find("td").slice(index).outerWidth());
          $(this).css("minWidth", settings.colMinWidth[index]);
        });
      });

      // show the scrollbar once the page width is below the sum of the column's min widths
      if ($gdtable.width() > settings.colMinWidthTotal) {
        $gdtable.find(".gd-scrollbarrow").hide();
      } else {
        $gdtable.find(".gd-scrollbarrow").css("display", "block").show();
      }

    };

    // main section to loop for each element
    return this.each(function () {

      var $gdtable = $(this);

      $gdtable.data(gdPrefix, settings);

      var colCount = $gdtable.find("thead").find("tr.gd-colheadingrow").find("th").length;

      // these are the default names and types to be used in the user doesn't prove them or comes up short
      var defColName = "col";
      var defColType = "text";

      // check the column names; create any extras required
      if (settings.columnName.length < colCount) {
        for (var x = settings.columnName.length; x < colCount; x++) {
          settings.columnName.push(defColName + x);
        }
      }
      // insert a name for the menu column
      settings.columnName.unshift(defColName + 0);

      // check the column types; create any extras required
      if (settings.columnType.length < colCount) {
        for (var x = settings.columnType.length; x < colCount; x++) {
          settings.columnType.push(defColType);
        }
      }
      // insert a type for the menu column
      settings.columnType.unshift(defColType);

      // create a default column width to be used if necessary
      var defColWidthRatio = 1 / colCount;

      // convert supplied width ratios from a percentage to a decimal fraction
      for (var x = 0; x < settings.colWidthRatio.length; x++) {
        settings.colWidthRatio[x] /= 100;
      }

      // check the column width ratios; create any extras required
      if (settings.colWidthRatio.length < colCount) {
        for (var x = settings.colWidthRatio.length; x < colCount; x++) {
          settings.colWidthRatio.push(defColWidthRatio);
        }
      }
      // insert a WidthRatio for the menu column
      settings.colWidthRatio.unshift(.01);

      // if minimum column widths have not been supplied then setup defaults
      var defColMinWidth = 100;

      // check the column widths; create any extras required
      if (settings.colMinWidth.length < colCount) {
        for (var x = settings.colMinWidth.length; x < colCount; x++) {
          settings.colMinWidth.push(defColMinWidth);
        }
      }
      // insert a Min Width for the menu column
      settings.colMinWidth.unshift(19);

      // calculate the total min width of all columns
      settings.colMinWidthTotal = 0;
      for (var x = 0; x < settings.colMinWidth.length; x++) {
        settings.colMinWidthTotal += settings.colMinWidth[x];
      }

      //////////////////////////////////////////////////////

      // add the gdtable class to the selected table
      $gdtable.addClass("gdtable");

      // *************************************
      $gdtable.find("thead .gd-scrollbarrow").prepend("<th>&nbsp;</th>");
      $gdtable.find("thead .gd-colfilterrow").prepend('<th class="gd-filtermenuicon">&nbsp;</th>');
      // *************************************

      // insert a column for the filter icon
      $gdtable.find("thead .gd-colheadingrow").prepend("<th class='gd-filtericon'>&nbsp;</th>");

      // add extra columns to the filter and scrollbar rows to match the data columns
      $gdtable.find("tbody tr").first().find("td").each(function (index) {
        $gdtable.find("thead .gd-colfilterrow").append("<th></th>");
        $gdtable.find("thead .gd-scrollbarrow").append("<th></th>");
      });

      // for each row in the body
      $gdtable.find("tbody").find("tr").each(function () {

        // insert a column for the row menu icon
        $(this).prepend('<td class="gd-rowactionicon">&nbsp;</td>');

        // and add markup to handle the ellipsis code
        for (var x = 0; x < settings.colEllipsis.length; x++) {
          var $td = $(this).find("td").slice(settings.colEllipsis[x], settings.colEllipsis[x] + 1);
          tempText = $td.text();
          $td.html("<span class='ellipsis'>" + tempText + "</span>")
          $td.addClass("ellipsis");
        }

      });

      ///////////////////////////
      // SET UP EVENT HANDLING //
      ///////////////////////////

      // capture a screen resize and recalculate column widths
      $(window).on("resize", function () {

        $(".gdtable").each(recalcOnResize);

      });

      // capture horizontal scrolling to ensure body aligns with headings
      $(".gdtable thead tr").on("scroll", function () {

        $gdtable = $(this).parents("table");
        $gdtable.find(".gd-colheadingrow, .gd-colfilterrow").scrollLeft($(this).scrollLeft());
        $gdtable.find("tbody").scrollLeft($(this).scrollLeft());

      });

      // capture click on filter icon
      $(".gdtable thead").on("click", "tr th.gd-filtericon", function (event) {

        var $gdtable = $(this).parents("table");
        $gd.filterOn = $gdtable.data(gdPrefix + "filteron");

        if ($gd.filterOn) {

          // turn off the filterOn flag
          $gd.filterOn = false;
          $gdtable.data(gdPrefix + "filteron", $gd.filterOn);

          // hide the filter row
          $gdtable.find(".gd-colfilterrow").hide();

        } else {

          // set the filterOn flag
          $gd.filterOn = true;
          $gdtable.data(gdPrefix + "filteron", $gd.filterOn);

          // add input boxes to the filter row and set the filter row column width 
          // to be the same as the header row columns
          $headingRow = $gdtable.find("tr.gd-colheadingrow");
          $filterRow = $gdtable.find("tr.gd-colfilterrow");
          $headingRow.find("th").each(function (index) {
            if (index > 0) {
              var colWidth = $(this).outerWidth();
              var colHTML = '<input type="text" value="">';
              $filterRow.find("th").slice(index, index + 1)
                .html(colHTML)
                .width(colWidth);
            }
          });

          // and show the filter row
          $gdtable.find(".gd-colfilterrow").css("display", "block").show();

        }

        // stop propagation
        event.stopImmediatePropagation();

        $(window).trigger("resize");

      });

      // apply filtering as keys are pressed
      $(".gdtable thead .gd-colfilterrow").on("keyup", "th input", processFilter);

      // display the filter menu
      $(".gdtable thead").on("click", "tr th.gd-filtermenuicon", function (event) {

        var $target = $(this);

        $gdtable = $(this).parents("table");

        // get the top and left for the cell clicked
        var pos = $target.position();
        var top = pos.top + 5;
        var left = pos.left + 5;

        // insert the filter menu into the DOM
        $gdtable.append($gd.filterMenu);
        // set positions and show the menu
        $gdtable.find(".gd-filtermenu").css("top", top).css("left", left).show();

        event.stopImmediatePropagation();

      });


      // capture a click on "gd-filterclear" from the row menu
      $(".gdtable").on("click", ".gd-filterclear", function (event) {

        $gdtable = $(this).parents("table");

        // hide the menu
        $gdtable.find(".gd-filtermenu").remove();

        // clear all filter inputs
        $gdtable.find("tr.gd-colfilterrow th").each(function () {
          $(this).find("input").val("");
        });

        // undo current filtering
        $gdtable.find("tbody tr").removeClass("gd-keep gd-odd gd-even");
        $gdtable.find("tbody tr:hidden").show();

        // stop propagation
        event.stopImmediatePropagation();

        // reset odd/even row coloring
        $gdtable.gdzebra();

        $(window).trigger("resize");

      });

      // capture a click on "gd-filterhelp" from the row menu
      $(".gdtable").on("click", ".gd-filterhelp", function (event) {

        // get the top and left for the cell clicked
        var pos = $(this).position();
        var top = pos.top + 10;
        var left = pos.left + 15;

        // insert the filter menu into the DOM
        $gdtable.append($gd.filterHelp);
        // set positions and show the menu
        $gdtable.find(".gd-filterhelp").css("top", top).css("left", left).show();


        // stop propagation
        event.stopImmediatePropagation();

      });


      // capture click on row menu icon to edit / delete / add, etc.
      $(".gdtable tbody").on("click", "tr td.gd-rowactionicon", function (event) {

        var $target = $(this);

        $gdtable = $target.parents("table");

        // remove the gdeditrow class from all rows
        $gdtable.find("tbody tr").each(function () {
          $(this).removeClass("gdeditrow");
        });

        // save pointer to the current row and the current row's html
        $gd.currentRow = $target.parent();
        $gdtable.data(gdPrefix + "currentrow", $gd.currentRow);

        $gd.currentRowHTML = $gd.currentRow.html();
        $gdtable.data(gdPrefix + "currentrowhtml", $gd.currentRowHTML);

        // get the top and left for the cell clicked
        var pos = $target.position();
        var top = pos.top + 5;
        var left = pos.left + 5;

        // check to see if displaying the menu will push it off screen and adjust the top if necessary
        var height = $gdtable.find(".gd-rowactionmenu").height();
        var bottom = top + height;
        var bodyBottom = $gdtable.position().top + $gdtable.height();
        if (bottom > bodyBottom) {
          top = bodyBottom - height - 15;
        }

        // highlight the current row
        $target.parent().addClass("gdeditrow");
        // insert the action menu into the DOM
        $gdtable.append($gd.rowActionMenu);
        // set positions and show the menu
        $gdtable.find(".gd-rowactionmenu").css("top", top).css("left", left).show();

        event.stopImmediatePropagation();

      });

      // capture a click on "gd-menuedit" from the row menu
      $(".gdtable").on("click", ".gd-menuedit", function (event) {

        $gdtable = $(this).parents("table");

        // hide the menu; apply formatting to the row being edited
        $gdtable.find(".gd-rowactionmenu").remove();

        $gd.currentRow = $gdtable.data(gdPrefix + "currentrow");
        $row = $gd.currentRow;
        $row.removeClass("gdeditrow").addClass("gd-editingrow gd-nopad");

        // 
        $row.find("td").each(function (index) {
          if (index > 0) {
            $col = $(this);
            $col.addClass("eo");
            var tmpInput = "<input";
            var $saveEle = $col;
            if ($col.hasClass("ellipsis")) {
              var colText = $col.removeClass("ellipsis").find("span").removeClass("ellipsis").text();
              $saveEle = $col.find("span");
            } else {
              var colText = $col.text();
            }
            tmpInput += ' name="' + settings.columnName[index] + '"';
            tmpInput += ' value="' + colText + '"';
            tmpInput += ' type="' + settings.columnType[index] + '">';
            $saveEle.html(tmpInput);
          }
        });

        // stop propagation
        event.stopImmediatePropagation();

      });

      // get rid of the row menu popup if there's a click event on the table
      $(".gdtable").on("click", function (event) {

        $gdtable = $(this);
        $gdtable.find(".gd-rowactionmenu, .gd-filtermenu, .gd-filterhelp").remove();
        $gdtable.find("tbody tr").each(function () {
          $(this).removeClass("gdeditrow");
        });

        // stop propagation
        event.stopPropagation();

      });

      // get rid of the row menu popup if there's a scroll event in the table body
      $(".gdtable tbody").on("scroll", function (event) {

        $gdtable = $(this).parents("table");
        $gd.lastScrollTop = $gdtable.data(gdPrefix + "lastscrolltop");

        if ($gd.lastScrollTop != $(this).scrollTop()) {

          $gdtable = $(this).parents("table");
          $gdtable.find(".gd-rowactionmenu, .gd-filtermenu").remove();
          $gdtable.find("tbody tr").each(function () {
            $(this).removeClass("gdeditrow");
          });

          $gd.lastScrollTop = $(this).scrollTop();
          $gdtable.data(gdPrefix + "lastscrolltop", $gd.lastScrollTop);
        }

        // stop propagation
        event.stopPropagation();

      });

      // capture the ESC key being pressed and if currently editing undo the edit
      $(window).on("keypress", function (event) {

        if (event.keyCode == "27") {
          $(".gdtable").each(function () {
            var $gdtable = $(this);
            $gd.currentRowHTML = $gdtable.data(gdPrefix + "currentrowhtml");
            if ($gd.currentRowHTML != null) {
              $gdtable.find("tr.gd-editingrow").each(function () {
                $(this).removeClass("gd-editingrow gd-nopad").html($gd.currentRowHTML);
                $gd.currentRow = null;
                $gdtable.data(gdPrefix + "currentrow", $gd.currentRow);
                $gd.currentRowHTML = "";
                $gdtable.data(gdPrefix + "currentrowhtml", $gd.currentRowHTML);
              });
            }
          });
          event.preventDefault();
        }

      });

    }); // End of this.each processing

  }; // End of $.fn.gdtable processing

  $.fn.gdtable.settings = {
    columnName: [],
    columnType: [],
    colWidthRatio: [],
    colMinWidth: [],
    colMinWidthTotal: 0,
    colEllipsis: [],
    filterDelay: 500
  }


  ///////////////////////////////////////////////
  // ADDITIONAL FUNCTIONS
  ///////////////////////////////////////////////
  $.fn.gdzebra = function () {
    this.find("tbody tr").removeClass("gd-even gd-odd");
    this.find("tbody tr").filter(":visible").filter(":even").addClass("gd-odd");
    this.find("tbody tr").filter(":visible").filter(":odd").addClass("gd-even");
  };

  $.fn.hasVerticalScrollBar = function () {
    return this.get(0) ? parseInt(this.get(0).scrollHeight) > parseInt(this.innerHeight()) : false;
  };

  $.fn.hasHorizontalScrollBar = function () {
    return this.get(0) ? parseInt(this.get(0).scrollWidth) > parseInt(this.innerWidth()) : false;
  };

}(jQuery));