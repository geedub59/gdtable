$(document).ready(function () {

  // make the table a "gdtable"
  $("#ima_gdtable1").gdtable({
    columnName: ["suburb", "pc", "region", "sc", "state", "lat", "long"],
    // columnType: ["text", "number", "text", "text", "text", "number", "number"],
    colWidthRatio: [20, 10, 20, 10, 20, 10, 10],
    colMinWidth: [80, 80, 80, 50, 80, 70, 80],
    colEllipsis: [1, 5],
    filterDelay: 500
  }).gdzebra();

  $("#ima_gdtable1").tablesorter({

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
    .on("sortEnd", function (e, t) {
      $(t).gdzebra();
    });

  $(window).trigger("resize");

});