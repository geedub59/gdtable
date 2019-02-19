(function ($) {

  $.fn.applyFilter = function () {

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

    // for each filter column
    $filters.each(function (index) {

      // get the filter column and text
      var filterColumn = index + 1;

      var filterText = $(this).find("input").val().toLowerCase();
      console.log(filterText);

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
          filterMaths = true;
        }

        // case insensitive filtering to check each (still) visible row
        $filteredRows.filter(":visible").each(function () {

          // get the data column for the current filter column
          $(this).find("td").slice(filterColumn, filterColumn + 1).filter(function () {

            if (filterMaths) {

              var ampFound = filterText.indexOf("&");
              var orFound = filterText.indexOf("|");
              var filterTextArr = [];
              var fOp = "";
              var fText = "";

              if (ampFound > -1) {

                filterTextArr.push(filterText.slice(0, ampFound));
                var resOne = false;
                var fOp = filterTextArr[0].slice(0, 1);
                if (fOp == ">" || fOp == "<") {
                  resOne = gdEval(parseFloat($(this).text()),
                    parseFloat(filterTextArr[0].slice(1, filterTextArr[0].length)),
                    fOp);
                }

                filterTextArr.push(filterText.slice(ampFound + 1, filterText.length));
                var resTwo = false;
                fOp = filterTextArr[1].slice(0, 1);
                if (fOp == ">" || fOp == "<") {
                  resTwo = gdEval(parseFloat($(this).text()),
                    parseFloat(filterTextArr[1].slice(1, filterTextArr[1].length)),
                    fOp);
                }
                return !(resOne && resTwo);

              } else if (orFound > -1) {

                filterTextArr.push(filterText.slice(0, orFound));
                var resOne = false;
                var fOp = filterTextArr[0].slice(0, 1);
                if (fOp == ">" || fOp == "<") {
                  resOne = gdEval(parseFloat($(this).text()),
                    parseFloat(filterTextArr[0].slice(1, filterTextArr[0].length)),
                    fOp);
                }

                filterTextArr.push(filterText.slice(orFound + 1, filterText.length));
                var resTwo = false;
                fOp = filterTextArr[1].slice(0, 1);
                if (fOp == ">" || fOp == "<") {
                  resTwo = gdEval(parseFloat($(this).text()),
                    parseFloat(filterTextArr[1].slice(1, filterTextArr[1].length)),
                    fOp);
                }
                return !(resOne || resTwo);

              } else {

                fOp = filterText.slice(0, 1);
                fText = filterText.slice(1, filterText.length);
                var val1 = parseFloat($(this).text());
                var val2 = parseFloat(fText);
                switch (fOp) {
                  case ">":
                    resOne = (val1 > val2) ? true : false;
                    break;
                  case "<":
                    resOne = (val1 < val2) ? true : false;
                    break;
                }
                return !(resOne);

              }

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

  function gdEval(val1, val2, fOp) {
    var result = false;
    switch (fOp) {
      case ">":
        result = (val1 > val2) ? true : false;
        break;
      case "<":
        result = (val1 < val2) ? true : false;
        break;
    }
    return result;
  }

}(jQuery));