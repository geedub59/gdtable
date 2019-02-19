$(document).ready(function () {

  var savedColWidth = Array();
  var savedColMinWidth = Array();

  // make the table a "gdtable"
  $("#ima_gdtable").gdtable({
      columnName: ["suburb", "pc", "region", "sc", "state", "lat", "long"],
      // columnType: ["text", "number", "text", "text", "text", "number", "number"],
      colWidthRatio: [20, 10, 20, 10, 20, 10, 10],
      colMinWidth: [80, 80, 80, 50, 80, 70, 80],
      colEllipsis: [1, 5],
      filterDelay: 750,
      beforeFilter: function ($gdtable) {
        if ($(this).find("tbody tr:visible").length > 0) {
          // save the width and min-width values of the first data row
          savedColWidth.length = 0;
          savedColMinWidth.length = 0;
          $gdtable.find("tr.gd-colWidths td").each(function () {
            savedColWidth.push($(this).css("width"));
            savedColMinWidth.push($(this).css("min-width"));
          });
        }
        // mark the first data row with a class to be used to remove the style tag from the columns after the sort
        $gdtable.find("tr.gd-colWidths").addClass("deleteStyle");
        // console.log(savedColWidth);
        // console.log(savedColMinWidth);
      },
      afterFilter: function ($gdtable) {
        $gdtable.find("tbody tr.gd-colWidths").removeClass("gd-colWidths");
        var $row = $gdtable.find("tbody tr:visible").first();
        $row.addClass("gd-colWidths");
        if ($row.hasClass("deleteStyle")) {
          $row.removeClass("deleteStyle");
        } else {
          // copy the saved width and min-width values to the new first data row
          $row.find("td").each(function (indx) {
            $(this).css("width", savedColWidth[indx]);
            $(this).css("min-width", savedColMinWidth[indx]);
          });
          // remove the style tag from the old first row columns
          $gdtable.find("tbody tr.deleteStyle:first td").each(function (indx) {
            $(this).removeAttr("style");
          });
          // remove the deleteStyle class
          $gdtable.find("tbody tr.deleteStyle:first").removeClass("deleteStyle");
        }
        recalcOnColumnResize($gdtable);
      },
      afterInit: function ($gdtable) {
        // save the width and min-width values of the first data row
        $gdtable.find("tbody tr:first").addClass("gd-colWidths");
        savedColWidth.length = 0;
        savedColMinWidth.length = 0;
        $gdtable.find("tr.gd-colWidths td").each(function () {
          savedColWidth.push($(this).css("width"));
          savedColMinWidth.push($(this).css("min-width"));
        });
      }
    })
    .gdtooltip({
      colToolTip: [1, 5],
      toolTipDelay: 500,
      toolTipHold: 1000
    })
    .gdzebra()
    .tablesorter({

      // $("#ima_gdtable").tablesorter({

      // set initial sort column and direction
      sortList: [
        [1, 0]
      ],

      // define column specific formats 
      headers: {
        0: {
          sorter: false,
          parser: false
        }
        // 4: {
        //   empty: "emptyMin",
        // },
        // 11: {
        //   dateFormat: "ddmmyyyy",
        //   sorter: "shortDate",
        //   empty: "emptyMin"
        // },
      },

      // name a function to be called after the table is initialised
      initialized: function (t) {
        $(t).gdzebra();
      }

    })
    .on("sortStart", function (e, t) {
      if ($(this).find("tbody tr:visible").length > 0) {
        // save the width and min-width values of the first data row
        savedColWidth.length = 0;
        savedColMinWidth.length = 0;
        $(this).find("tr.gd-colWidths td").each(function () {
          savedColWidth.push($(this).css("width"));
          savedColMinWidth.push($(this).css("min-width"));
        });
      }
      // console.log(savedColWidth);
      // console.log(savedColMinWidth);
      // mark the first data row with a class to be used to remove the style tag from the columns after the sort
      $(this).find("tr.gd-colWidths").addClass("deleteStyle");
    })
    .on("sortEnd", function (e, t) {
      $(t).gdzebra();
      $(this).find("tbody tr.gd-colWidths").removeClass("gd-colWidths");
      var $row = $(this).find("tbody tr:visible").first();
      $row.addClass("gd-colWidths");
      if ($row.hasClass("deleteStyle")) {
        $row.removeClass("deleteStyle");
      } else {
        // copy the saved width and min-width values to the new first data row
        $row.find("td").each(function (indx) {
          $(this).css("width", savedColWidth[indx]);
          $(this).css("min-width", savedColMinWidth[indx]);
        });
        // remove the style tag from the old first row columns
        $(this).find("tbody tr.deleteStyle:first td").each(function (indx) {
          $(this).removeAttr("style");
        });
        // remove the deleteStyle class
        $(this).find("tbody tr.deleteStyle:first").removeClass("deleteStyle");
      }
      recalcOnColumnResize($(this));
    });

  $('table.resizable').resizableColumns({
    rowIndex: 3,
    afterResize: function ($table) {
      recalcOnColumnResize($table);
    }
  });

  var recalcOnColumnResize = function ($table) {

    var $gdtable = $table;
    var settings = $gdtable.data("_gdtable");

    // loop through each of the gd-colheadingrow columns and set each of the other
    // heading row's column widths and the body's column widths
    var colWidths = Array();
    var width = 0;
    var totalColWidth = 0;
    $gdtable.find("thead tr.gd-colheadingrow:first").find("th").each(function (idx) {
      width = parseFloat($(this).css("width").replace(/[^\d.-]/g, ''));
      width = $(this).outerWidth();
      totalColWidth += width;
      colWidths.push(width);
      var i = idx + 1;
      $gdtable.find("thead tr.gd-scrollbarrow:first th:nth-child(" + i + ")").css("width", width);
      $gdtable.find("thead tr.gd-colfilterrow:first th:nth-child(" + i + ")").css("width", width);
      $gdtable.find("tbody tr.gd-colWidths td:nth-child(" + i + ")").css("width", width);
    });
    settings.colOuterWidth = colWidths;
    settings.colOuterWidthTotal = totalColWidth;

    $gdtable.data("_gdtable", settings);

  };

  $(".gdtooltip").on("mouseenter", function (jqEvent) {
    if (gdMessages.popup.inPlay == false) {
      if ($(this).data("tooltip") !== undefined) {
        var tooltipSpan = '<span>' + $(this).data("tooltip") + '</span>';
        var className = "gdtooltipSpan";
        showPopup(tooltipSpan, className, jqEvent);
      }
    }
  });

  $(".gdtooltip").on("mouseleave", function () {
    if (gdMessages.popup.inPlay == true) {
      gdMessages.popup.close();
    }
  });

  // -------------------------------------
  // Display a popup
  // -------------------------------------
  function showPopup(message, className, jqEvent) {

    var cursorX = jqEvent.pageX;
    var cursorY = jqEvent.pageY;

    gdMessages.popup.open({
      msg: message,
      className: className,
      position: "coords",
      cursorPos: {
        cursorX: cursorX,
        cursorY: cursorY
      },
      width: "auto",
      autoClose: false,
      afterOpen: null,
      afterClose: null
    });

  }

});