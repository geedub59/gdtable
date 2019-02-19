$(document).ready(function () {

  var ins = "";
  var jsonLabels = ["filterDelay","colHeadings","columnName", "columnType", "colWidthRatio", "colMinWidth", "colEllipsis"];

  $("button").click(function () {

    $.getJSON("json/dbtablev1.json", function (data, status) {

      for (var i = 0; i < jsonLabels.length; i++) {

        var l = data.gdtableParams[jsonLabels[i]].length;

        if (l === undefined) {
          ins += "<span>" + jsonLabels[i] + "</span><ul><li>" + data.gdtableParams[jsonLabels[i]] + "</li></ul>";
        } else if (l > 0) {
          processJSON(jsonLabels[i], data.gdtableParams[jsonLabels[i]], l);
        }

      }

      $("#jsonData").html(ins);

    });
  });

  function processJSON(label, data, l) {

    ins += "<span>" + label + "</span><ul>";

    for (var x = 0; x < l; x++) {
      ins += "<li>" + data[x] + "</li>";
    }

    ins += "</ul>";
  }

});