(function ($) {

  $.fn.applyFilter = function () {

    // // only process a-z, 0-9, printable characters, {backspace}
    // if (
    //   (event.keyCode < "32" || event.keycode > "126") &&
    //   (event.keyCode != "8")
    // ) return;

    // variables used in the filter routine to enable multiple filter processing
    // e.g. ! = not
    //      & = and
    //      | = or
    //      > = greater than
    //      < = less than


    /////////////////////////////////////////////////////////////////////////////////////////////////
    // const regexAll = /[!&|=><()]/;
    // const regexAndOr = /[&|]/;
    // const regexNot = /[!]/;
    // const regexBrackets = /[()]/;
    // const regexGrLs = /[=><]/;
    // const regexOps = /[!=><]/;

    // var m = null,
    //   n = null;
    // var andOr = "";

    // var $gdFilter = {
    //   filterArr: [] // 2 dimensional array - col index, and/or, op, text/num
    // }

    // function parseFilter(filterText, col) {

    //   var filterOp = "";
    //   var filterPartText = "";

    //   m = regexAll.exec(filterText);
    //   if (m == null) {

    //     $gdFilter.filterArr.push([col, andOr, (regexOps.test(filterOp) ? filterOp : ""), filterText]);
    //     filterText = null;

    //   } else {

    //     if (m.index == 0) {

    //       // match on first charcter of filter text
    //       // Op character should be ! (not) > (greater than) or < (less than) or & or |

    //       // extract OP character
    //       filterOp = filterText.slice(0, 1);

    //       // remove Op character from filterText
    //       filterText = filterText.slice(1, filterText.length);

    //       if (filterOp == "&" || filterOp == "|") {

    //         (filterOp == "&") ? andOr = "and": andOr = "or";

    //       } else {

    //         // see if there are anymore Op characters in the filterText
    //         n = regexAll.exec(filterText);

    //         if (n === null) {

    //           // no more Op characters so push the current op and the rest of the text onto the filterArr stack
    //           $gdFilter.filterArr.push([col, andOr, (regexOps.test(filterOp) ? filterOp : ""), filterText]);
    //           filterText = null;

    //         } else {

    //           // another Op character has been found so extract the text for the previous Op char
    //           filterPartText = filterText.slice(0, n.index);

    //           // push Op and Text onto filterArr stack
    //           $gdFilter.filterArr.push([col, andOr, (regexOps.test(filterOp) ? filterOp : ""), filterPartText]);

    //           // get rid of previous Op and text and process filter text again
    //           filterText = filterText.slice(n.index, filterText.length);

    //         }

    //       }

    //     } else {

    //       // extract OP character
    //       filterOp = filterText.slice(m.index, m.index + 1);

    //       // extract text up to the next Op character
    //       filterPartText = filterText.slice(0, m.index);

    //       // push the current filter onto the filterArr stack
    //       $gdFilter.filterArr.push([col, andOr, (regexOps.exec(filterOp) ? filterOp : ""), filterPartText]);

    //       // get rid of the processed filter info and prepare for the next loop
    //       filterText = filterText.slice(m.index, filterText.length);

    //     }
    //   }

    //   // if there is more text then parse it
    //   if (filterText == null) {
    //     andOr = "";
    //   } else {
    //     parseFilter(filterText, col);
    //   }

    // };
    /////////////////////////////////////////////////////////////////////////////////////////////////


    // this function is applied to a table so "this" is the table object
    var $filterRow = this.find(".gd-colfilterrow").first();
    var $tbody = this.find("tbody").first();

    // filteredRows will be progressively filtered as each column's filter is processed (assumes "and" processing at this point)
    var $filteredRows = $tbody.find("tr");

    // get all filters (excluding 1st columns which is the row menu column)
    var $filters = $filterRow.find("th").slice(1);

    // undo any current filtering and make all rows available
    $filteredRows.filter(":hidden").show();
    $filteredRows.addClass("gd-keep");


    /////////////////////////////////////////////////////////////////////////////////////////////////
    // for each filter column parse the filter and add to the filter arrays
    // $filters.each(function (index) {
    //   var filterText = $(this).find("input").val().toLowerCase().replace(/\s/g, "");

    //   parseFilter(filterText, index);

    // });

    // for (x = 0; x < $gdFilter.filterArr.length; x++) {
    //   console.log($gdFilter.filterArr[x]);
    // }
    /////////////////////////////////////////////////////////////////////////////////////////////////


    // for each filter column
    $filters.each(function (index) {

      // get the filter column and text
      var filterColumn = index + 1;

      var filterText = $(this).find("input").val().toLowerCase();

      // get rid of white space
      filterText = filterText.replace(/\s/g, "");

      if (filterText != "") {
        var filterOp = filterText.slice(0, 1);
        var filterNot = false;
        if (filterOp == "!") {
          filterText = filterText.slice(1, filterText.length);
          filterNot = true;
        }
        var filterMaths = false;
        if (filterOp == ">" || filterOp == "<") {
          filterText = filterText.slice(1, filterText.length);
          filterMaths = true;
        }

        // case insensitive filtering to check each (still) visible row
        $filteredRows.filter(":visible").each(function () {

          // get the data column for the current filter column
          $(this).find("td").slice(filterColumn, filterColumn + 1).filter(function () {

            if (filterMaths) {

              // numerical comparison
              var mathExp = "0" + $(this).text() + filterOp + filterText;
              return !(math.eval(mathExp));

            } else {

              if (filterNot) {

                var rgxp = new RegExp("(" + filterText + ")", "gi");
                return ($(this).text().toLowerCase().match(rgxp) !== null);

              } else {

                var rgxp = new RegExp("(" + filterText + ")", "gi");
                return ($(this).text().toLowerCase().match(rgxp) === null);

              }
            }

          }).parent().removeClass("gd-keep");

        });

        $filteredRows.not(".gd-keep").hide();

      }

    });

  }

}(jQuery));