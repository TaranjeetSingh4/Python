/* global render_indicator_table,render_table,redraw_table_view,url,defaults,indicator_mapping */
$(document)
  .on("click touch", '.t2 [data-toggle="collapse"]', function () {
    if ($(this).find("i").hasClass("fa-plus")) {
      $('.t2 [data-toggle="collapse"] i')
        .removeClass("fa-minus")
        .addClass("fa-plus");
      $(this).find("i").removeClass("fa-plus").addClass("fa-minus");
    } else {
      $('.t2 [data-toggle="collapse"] i')
        .removeClass("fa-minus")
        .addClass("fa-plus");
      $(this).find("i").removeClass("fa-minus").addClass("fa-plus");
    }
  })
  .on("change", "#filter-type", function () {
    url.update({ filter_type: $(this).val() });
    window.history.pushState({}, "", url.toString());
    render_indicator_table();
  })
  .on("change", "#filter", function () {
    var val = url.searchKey["val"] || defaults.val;
    var row = {};
    row[val] = $(this).val();
    // appends indicator id to url in addition to indicator name
    // indicator=Still%20birth%20ratio&indicator_id=indicator_4
    var url_indicator =
      _.find(indicator_mapping, { indicator_name: $(this).val() })
        .indicator_id || "";
    row["indicator_id"] = url_indicator;

    url.update(row);
    window.history.pushState({}, "", url.toString());
    render_table();

    // code which hides/displays negative indicator text
    var indicator_np = _.find(indicator_mapping, {
      indicator_id: url_indicator,
    });
    if (indicator_np.positive_negative == "positive") {
      $(".negative_indication").hide();
    } else {
      $(".negative_indication").show();
    }
  })

  .on("click touch", ".sort-table", function () {
    let division_sort = url.searchKey["division_sort"] || "";
    division_sort = division_sort === "asc" ? "desc" : "asc";
    let sort_key = $(this).attr("data-attr") || defaults.sort_key;
    url.update({ division_sort: division_sort, sort_key: sort_key });
    window.history.pushState({}, "", url.toString());
    $.when($(".loading-icon").show()).then(render_table);
  })
  .on("click", ".submit", function () {
    $.when($(".loading-icon").show()).then(redraw_table_view);
  });
