/* global g1, UI, draw_combo_chart, Noty, user_info, defaults, indicator_mapping, district_name_mapping, data_map */
/* exported defaults, all_data, url */

var url,
  all_data,
  date_selection,
  selection,
  from_selection,
  to_selection,
  find_value1,
  find_value2,
  from_year,
  to_year,
  hierarchy,
  area_date,
  area_prev_date,
  from_value,
  to_value,
  date_format,
  parsetime;
var select_geo_1 = "division",
  select_geo_2 = "division";
var selected_division,
  selected_district,
  user_district,
  is_error = false,
  selection_area;
var all_hierarchy, geography_dates;
set_date_selection();
get_hierarchy_data();
function redraw_compare_view() {
  url = g1.url.parse(location.href);
  var view = url.searchKey["view"] || defaults.view;
  var filter_type = url.searchKey["filter_type"] || defaults.filter_type;
  set_date_selection();
  if (!url.searchKey.compare1) {
    url.update({ select: selection_area, compare1: user_district });
    window.history.pushState({}, "", url.toString());
    select_geo_1 = selection_area;
    select_geo_2 = selection_area;
  }
  // get_hierarchy_data()
  if (view === "geo") {
    $(".geo-view").addClass("d-flex").show();
    $(".time-view").hide();
    $("#view-switch").attr("checked", true);
    $(".switch-geo").removeClass("text-secondary");
    $(".switch-time").addClass("text-secondary");
    render_geo_dropdown();
  } else {
    $("#alert").hide();
    $(".geo-view").removeClass("d-flex").hide();
    $(".time-view").show();
    $(".switch-time").removeClass("text-secondary");
    $(".switch-geo").addClass("text-secondary");
    render_time_dropdown();
  }
  $('.analytics-pill[data-attr="' + filter_type + '"]')
    .find("a")
    .addClass("active");
}

function set_date_selection() {
  url = g1.url.parse(location.href);
  var view = url.searchKey["view"];
  geography_dates = [];
  if (view === "geo") {
    if (url.searchKey["month"] !== undefined) {
      date_selection = "date";
      var month = url.searchKey["month"];
      var year = parseInt(url.searchKey["year"]);
      selection = moment(year + "-" + month + "-01", "YYYY-MMM-DD").format(
        "YYYY-MM-DD"
      );
      to_selection = selection;
      to_year = year;
      from_selection = moment(selection, "YYYY-MM-DD")
        .subtract(2, "month")
        .format("YYYY-MM-DD");
      from_year = moment(from_selection, "YYYY-MM-DD").year();
      $("#date-label").text(moment(selection).format("MMM YY"));
      geography_dates = [to_selection, to_selection];
    } else if (url.searchKey["quarter"] !== undefined) {
      date_selection = "quarter";
      selection = parseInt(url.searchKey["quarter"][1]);
      to_selection = selection;
      to_year = url.searchKey["year"];
      from_selection = parseInt(url.searchKey["prev_quarter"][1]);
      from_year = url.searchKey["prev_year"];
      geography_dates = [
        get_quarter_start_date(to_selection, to_year),
        get_quarter_end_date(to_selection, to_year),
      ];
      $("#date-label").text("Q" + to_selection + " " + to_year);
    } else if (url.searchKey["year"] !== undefined) {
      date_selection = "year";
      selection = parseInt(url.searchKey["year"]);
      to_selection = selection;
      from_selection = selection - 1;
      $("#date-label").text(to_year);
      geography_dates = [to_selection - 1 + "-04-01", to_selection + "-04-01"];
    } else {
      date_selection = "date";
      selection = defaults.date;
      to_selection = selection;
      to_year = defaults.year;
      from_selection = moment(selection)
        .subtract(2, "month")
        .format("YYYY-MM-01");
      $("#date-label").text(moment(selection).format("MMM YY"));
      geography_dates = [to_selection, to_selection];
    }
  } else {
    if (url.searchKey["from_month"] !== undefined) {
      date_selection = "date";
      var from_month = url.searchKey["from_month"];
      from_year = url.searchKey["from_year"];
      from_selection = moment(
        from_year + "-" + from_month + "-01",
        "YYYY-MMM-DD"
      ).format("YYYY-MM-DD");
      var to_month = url.searchKey["to_month"] || defaults.month;
      to_year = url.searchKey["to_year"] || moment().format("YYYY");
      to_selection = moment(
        to_year + "-" + to_month + "-01",
        "YYYY-MMM-DD"
      ).format("YYYY-MM-DD");
      geography_dates = [from_selection, to_selection];
      (from_value = from_month), (to_value = to_month);
    } else if (url.searchKey["from_quarter"] !== undefined) {
      date_selection = "quarter";
      from_selection = parseInt(url.searchKey["from_quarter"][1]);
      from_year = parseInt(url.searchKey["from_year"]);
      var to_quarter = url.searchKey["to_quarter"] || defaults.quarter;
      to_quarter = parseInt(to_quarter[1]);
      to_year = url.searchKey["to_year"] || defaults.year;
      to_selection = to_quarter;
      (from_value = from_selection), (to_value = to_selection);
      geography_dates = [
        get_quarter_start_date(from_selection, from_year),
        get_quarter_end_date(to_selection, to_year),
      ];
    } else if (url.searchKey["from_year"] !== undefined) {
      date_selection = "year";
      from_selection = parseInt(url.searchKey["from_year"]);
      from_year = parseInt(from_selection);
      to_year = url.searchKey["to_year"] || defaults.year;
      to_selection = parseInt(to_year);
      geography_dates = [
        from_selection - 1 + "-04-01",
        to_selection + "-04-01",
      ];
    } else {
      date_selection = "date";
      from_selection = moment(defaults.date)
        .subtract(2, "month")
        .format("YYYY-MM-DD");
      to_selection = moment(defaults.date).format("YYYY-MM-DD");
      from_year = moment(from_selection).year();
      to_year = moment(to_selection).year();
      from_value = moment(defaults.date).subtract(2, "month").format("MMM");
      to_value = moment(defaults.date).format("MMM");
      geography_dates = [from_selection, to_selection];
    }
  }
  if (date_selection === "date") {
    date_format = "MMM YY";
    parsetime = d3.timeParse("%b %y");
  } else if (date_selection === "quarter") {
    date_format = "Q YY";
    parsetime = d3.timeParse("%m %Y");
  } else {
    date_format = "YYYY";
    parsetime = d3.timeParse("%Y");
  }
}
function get_district(block_name) {
  var district_name = "district";
  _.each(hierarchy, function (divisons) {
    _.each(divisons, function (rows, district) {
      if (_.findKey(rows, { block: block_name })) {
        district_name = district;
      }
    });
  });
  return district_name;
}

function get_division(district_name) {
  return _.findKey(hierarchy, district_name);
}

function render_dropdown(
  selector,
  dropdownid,
  data_parent,
  data,
  type,
  values
) {
  $("#" + dropdownid).selectpicker("destroy");
  $(selector)
    .on("template", function () {
      set_value("#" + dropdownid, type, values);
    })
    .template({
      data: data,
      column: false,
      id: dropdownid,
      data_parent: data_parent,
      mapping: indicator_mapping,
      district_name_change: district_name_mapping,
    });
}

function set_value(dropdownid, type, values) {
  var select = url.searchKey["select"] || defaults.select;
  var parent;
  if (select === "division" && type === "division") {
    $(dropdownid).val(values.division);
  }
  if (select === "district" && type === "district") {
    parent = $(dropdownid).attr("data-parent");
    $("#" + parent).val(values.division);
    $("#" + parent).selectpicker("refresh");
    $(dropdownid).val(values.district);
  }
  if (select === "block" && type === "block") {
    parent = $(dropdownid).attr("data-parent");
    var district_parent = $("#" + parent).attr("data-parent");
    $("#" + district_parent).val(values.division);
    $("#" + district_parent).selectpicker("refresh");
    $("#" + parent).val(values.district);
    $("#" + parent).selectpicker("refresh");
    $(dropdownid).val(values.block);
  }
  $(dropdownid).selectpicker("refresh");
}

function render_geo_dropdown() {
  var select = url.searchKey["select"] || defaults.select;
  var compare1 = url.searchKey["compare1"] || defaults[select][0];
  var compare2 = url.searchKey["compare2"] || defaults[select][1];
  var values1 = {},
    values2 = {};
  if (select === "district") {
    values1["district"] = compare1;
    values1["division"] = get_division(compare1);
    values2["district"] = compare2;
    values2["division"] = get_division(compare2);
  } else if (select === "block") {
    values1["district"] = get_district(compare1);
    values1["division"] = get_division(values1.district);
    values1["block"] = compare1;
    values2["district"] = get_district(compare2);
    values2["division"] = get_division(values2.district);
    values2["block"] = compare2;
  } else {
    values1["division"] = compare1;
    values2["division"] = compare2;
  }
  $(".geo-select-2").show();
  $("#alert").hide();
  render_dropdown(
    ".division-dropdown",
    "select-division",
    "",
    _.keys(hierarchy),
    "division",
    values1
  );
  render_dropdown(
    ".district-dropdown",
    "select-district",
    "select-division",
    ["All districts"].concat(_.keys(hierarchy[values1.division])),
    "district",
    values1
  );
  render_dropdown(
    ".block-dropdown",
    "select-block",
    "select-district",
    ["All blocks"].concat(
      _.map(hierarchy[values1.division][values1.district], "block")
    ),
    "block",
    values1
  );
  render_dropdown(
    ".division-dropdown-2",
    "select-division-2",
    "",
    _.keys(hierarchy),
    "division",
    values2
  );
  render_dropdown(
    ".district-dropdown-2",
    "select-district-2",
    "select-division-2",
    ["All districts"].concat(_.keys(hierarchy[values2.division])),
    "district",
    values2
  );
  render_dropdown(
    ".block-dropdown-2",
    "select-block-2",
    "select-district-2",
    ["All blocks"].concat(
      _.map(hierarchy[values2.division][values2.district], "block")
    ),
    "block",
    values2
  );
  render_bars();
}

function render_time_dropdown() {
  $(".geo-select-2").hide();
  var select = url.searchKey["select"] || defaults.select;
  var compare1 = url.searchKey["compare1"] || defaults[select][0];
  var values = {};
  if (select === "district") {
    values["district"] = compare1;
    values["division"] = get_division(compare1);
  } else if (select === "block") {
    values["district"] = get_district(compare1);
    values["division"] = get_division(values.district);
    values["block"] = compare1;
  } else {
    values["division"] = compare1;
  }
  selected_division = values.division;
  selected_district = values.district;

  render_dropdown(
    ".division-dropdown",
    "select-division",
    "",
    _.keys(hierarchy),
    "division",
    values
  );
  render_dropdown(
    ".district-dropdown",
    "select-district",
    "select-division",
    ["All districts"].concat(_.keys(hierarchy[values.division])),
    "district",
    values
  );
  render_dropdown(
    ".block-dropdown",
    "select-block",
    "select-district",
    ["All blocks"].concat(
      _.map(hierarchy[values.division][values.district], "block")
    ),
    "block",
    values
  );
  render_bars();
}

function render_accordion() {
  $(".loading-icon").show();
  var all_acc_data = get_accordion_data();
  var acc_data = all_acc_data["acc_data"];
  var ind_data = all_acc_data["ind_data"];
  var filter_type = url.searchKey["filter_type"] || defaults.filter_type;
  var view = url.searchKey["view"] || defaults.view;
  var color1, color2, y_axis_names, color_scale;
  if (view === "time") {
    color1 = "#E09C24";
    color2 = "#846734";
    y_axis_names = ["score", "avg", "max"];
    color_scale = d3.scaleOrdinal().range(["#E09C24", "#1E90FF", "#006400"]);
  } else {
    color1 = "#DB5F3B";
    color2 = "#000000";
    y_axis_names = ["score", "score2", "avg", "max"];
    color_scale = d3
      .scaleOrdinal()
      .domain(y_axis_names)
      .range(["#DB5F3B", "#000000", "#1E90FF", "#006400"]);
  }
  $(".compare-accordion")
    .on("template", function () {
      $(".compare-accordion").off();
      _.each($(".acc-bar"), function (d) {
        var width = $(d).attr("width");
        $(d).css("width", width + "%");
      });
      $(".bar-one").css("background-color", color1);
      $(".bar-two").css("background-color", color2);
      get_composite_score_trend();
      setTimeout(function () {
        $("#up-avg").prop("checked")
          ? $(".avg, .avg-dots").show()
          : $(".avg, .avg-dots").hide();
        $("#best-dist").prop("checked")
          ? $(".max, .max-dots").show()
          : $(".max, .max-dots").hide();
        var filter_type = url.searchKey.filter_type;
        if (filter_type == "type" || filter_type == "domain") {
          var selected_filter = url.searchKey["filter_name"];
          $('.collapse-title[href="#collapse_' + selected_filter + '"]')
            .addClass("collapsed")
            .attr("aria-expanded", "true")
            .find("i")
            .removeClass("fa-plus")
            .addClass("fa-minus");
          $("#collapse_" + selected_filter).addClass("show");
        }
        $(".loading-icon").hide();
      }, 1000);
    })
    .template({
      data: acc_data,
      ind_data: ind_data,
      display: filter_type,
      area_data: get_area_data(),
      y_axis_names: y_axis_names,
      color_scale: color_scale,
      parsetime: parsetime,
      mapping: indicator_mapping,
      view: view,
    });
}

function get_accordion_data() {
  var view = url.searchKey["view"] || defaults.view;
  var select = url.searchKey["select"] || defaults.select;
  var compare1 = url.searchKey["compare1"] || defaults[select][0];
  var compare2 = url.searchKey["compare2"] || defaults[select][1];
  var filter_type = url.searchKey["filter_type"] || defaults.filter_type;
  var year = url.searchKey["year"] || defaults.year;
  var params = {};
  var acc_data = [],
    ind_data = {},
    group_data,
    indicator_data,
    find_key;
  if (view === "geo") {
    params[select] = [compare1, compare2];
    params[date_selection] = selection;
    if (date_selection == "quarter") params["year"] = year;
    params["_by"] = [select, filter_type];
    find_key = select;
    (find_value1 = compare1), (find_value2 = compare2);
  } else {
    params[date_selection] = [from_selection, to_selection];
    if (date_selection == "quarter") {
      params["year"] = [from_year, to_year];
      params["_by"] = ["year", date_selection, filter_type];
    } else params["_by"] = [date_selection, filter_type];
    params[select] = compare1;
    find_key = date_selection;
    (find_value1 = from_selection), (find_value2 = to_selection);
  }
  params["_c"] = "perc_point|avg";
  params["accordion"] = "accordion";
  group_data = UI.fetch_data(data_map[select][date_selection], params);
  group_data = rename_key(group_data, filter_type, "category");
  group_data = rename_key(group_data, "perc_point|avg", "score");
  _.each(_.groupBy(group_data, "category"), function (values, key) {
    var row = {},
      find_row = {};
    find_row[find_key] = find_value1;
    row["category"] = key;
    if (find_key == "quarter") find_row["year"] = parseInt(from_year);
    var value1 = _.find(values, find_row);
    value1 = value1 === undefined ? 0 : _.round(value1["score"], 2);
    row["curr_val"] = value1;
    find_row[find_key] = find_value2;
    if (find_key == "quarter") find_row["year"] = parseInt(to_year);
    var value2 = _.find(values, find_row);
    value2 = value2 === undefined ? 0 : _.round(value2["score"], 2);
    row["prev_val"] = value2;
    acc_data.push(row);
  });
  acc_data = UI.sort_list(acc_data, "category");
  if (filter_type !== "indicator") {
    if (view === "geo") {
      params["_by"] = [select, filter_type, "indicator"];
    } else {
      params["_by"] = [date_selection, filter_type, "indicator"];
      if (date_selection == "quarter")
        params["_by"] = ["year", date_selection, filter_type, "indicator"];
    }
    params["_c"] = "perc_point|avg";
    indicator_data = UI.fetch_data(data_map[select][date_selection], params);
    indicator_data = rename_key(indicator_data, "indicator", "category");
    indicator_data = rename_key(indicator_data, "perc_point|avg", "score");
    _.each(_.groupBy(indicator_data, filter_type), function (rows, key) {
      ind_data[key] = [];
      _.each(_.groupBy(rows, "category"), function (values) {
        var row = {},
          find_row = {};
        find_row[find_key] = find_value1;
        if (find_key == "quarter") find_row["year"] = parseInt(from_year);
        row["indicator"] = values[0]["category"];
        var value1 = _.find(values, find_row);
        value1 = value1 === undefined ? 0 : _.round(value1["score"], 2);
        row["curr_val"] = value1;
        find_row[find_key] = find_value2;
        if (find_key == "quarter") find_row["year"] = parseInt(to_year);
        var value2 = _.find(values, find_row);
        value2 = value2 === undefined ? 0 : _.round(value2["score"], 2);
        row["prev_val"] = value2;
        ind_data[key].push(row);
      });
    });
  }
  return { acc_data: acc_data, ind_data: ind_data };
}

function render_bars() {
  $(".loading-icon").show();
  var parameter = "composite_index|avg";
  var view = url.searchKey["view"] || defaults.view;
  var select = url.searchKey["select"] || defaults.select;
  var params = {};
  params[date_selection] = [to_selection];
  params[select] = url.searchKey["compare1"] || defaults[select][0];
  params["_by"] = [date_selection];
  if (date_selection == "quarter") params["_by"] = ["year", date_selection];
  params["_c"] = parameter;
  var find_row = {};
  if (date_selection == "quarter") find_row["year"] = parseInt(from_year);
  params["bars"] = "bars";
  var left_values = UI.fetch_data(data_map[select][date_selection], params);
  find_row[date_selection] = to_selection;
  if (date_selection == "quarter") find_row["year"] = parseInt(to_year);
  var left_prev_value = _.find(left_values, find_row);
  left_prev_value =
    left_prev_value === undefined ? 0 : _.round(left_prev_value[parameter], 2);

  if (view === "time") {
    $("#curr-value").text(left_prev_value);
    var display_text =
      select === "division"
        ? params[select]
        : select === "district"
        ? selected_division + " -> " + params[select]
        : selected_division +
          " -> " +
          selected_district +
          " -> " +
          params[select];
    display_text = _.replace(
      display_text,
      new RegExp("Allahabad", "g"),
      "PRAYAGRAJ"
    );
    display_text = _.replace(
      display_text,
      new RegExp("Faizabad", "g"),
      "Ayodhya"
    );
    $("#selected-geo").text(display_text);
  } else if (view === "geo") {
    var compare1 = params[select];
    params[select] = url.searchKey["compare2"] || defaults[select][1];
    var compare2 = params[select];
    var right_values = UI.fetch_data(data_map[select][date_selection], params);
    find_row[date_selection] = to_selection;
    var right_prev_value = _.find(right_values, find_row);
    right_prev_value =
      right_prev_value === undefined
        ? 0
        : _.round(right_prev_value[parameter], 2);

    $(".geo-left")
      .on("template", function () {
        $(".geo-left").off();
        $(".geo-right")
          .on("template", function () {
            $(".geo-right").off();
            _.each($(".geo-bar"), function (d) {
              $(d).css("width", $(d).attr("data-attr") * 100 + "%");
            });
          })
          .template({
            align: "right",
            color1: "bg-dark",
            color2: "custom-bg-clr6",
            curr: right_prev_value,
            name: compare2,
          });
      })
      .template({
        align: "left",
        color1: "custom-bg-clr4",
        color2: "custom-bg-clr5",
        curr: left_prev_value,
        name: compare1,
      });
  }
  render_accordion();
  $(".loading-icon").hide();
}

function get_composite_score_trend() {
  var select = url.searchKey["select"] || defaults.select;
  var selected_geo = url.searchKey["compare1"] || defaults[select][0];
  var params = { "date>~": area_prev_date, "date<~": area_date };
  var view = url.searchKey.view;
  params[select] = selected_geo;
  params["_by"] = "date";
  params["_c"] = "composite_index|avg";
  var trend_data = rename_key(
    UI.fetch_data(data_map[select][date_selection], params),
    "composite_index|avg",
    "score"
  );
  trend_data = rename_key(trend_data, "composite_index|avg", "score");
  _.each(trend_data, function (row) {
    row["date"] = convert_date(row["date"], date_selection);
  });
  params[select] = "";
  params["_c"] = ["composite_index|avg", "composite_index|max"];
  var avg_max = UI.fetch_data(data_map[select][date_selection], params);
  avg_max = rename_key(avg_max, "composite_index|avg", "avg");
  avg_max = rename_key(avg_max, "composite_index|max", "max");
  _.each(avg_max, function (row) {
    row["date"] = convert_date(row["date"], date_selection);
  });
  _.each(trend_data, function (row) {
    var temp = _.find(avg_max, { date: row.date });
    row["avg"] = _.round(temp["avg"], 2);
    row["max"] = _.round(temp["max"], 2);
    row["score"] = _.round(row["score"], 2);
    if (view == "geo") row["score2"] = _.round(row["score2"], 2);
  });
  if (date_selection === "quarter") {
    $(".curr-label").text(
      "Q" + to_selection + " " + (to_year - 1) + "-" + to_year
    );
    $(".prev-label").text(
      "Q" + from_selection + " " + (from_year - 1) + "-" + from_year
    );
  } else {
    if (date_selection === "year") {
      $(".prev-label").text(from_year - 1 + "-" + from_year);
      $(".curr-label").text(to_year - 1 + "-" + to_year);
    } else {
      $(".prev-label").text(moment(from_selection).format(date_format));
      $(".curr-label").text(moment(to_selection).format(date_format));
    }
  }
  if (view != "geo") draw_combo_chart("#trend", view, trend_data);
}

function get_quarter_end_date(quarter, year) {
  return moment(quarter + " " + year, "Q YYYY")
    .subtract(7, "month")
    .format("YYYY-MM-01");
}

function get_quarter_start_date(quarter, year) {
  return moment(quarter + " " + year, "Q YYYY")
    .subtract(9, "month")
    .format("YYYY-MM-01");
}

function get_area_data() {
  var immunization =
    "% of children received full immunization (BCG, Penta 1, 2, 3, Measles)";
  var view = url.searchKey["view"] || defaults.view;
  if (date_selection === "year") {
    area_prev_date = from_selection - 1 + "-04-01";
    area_date = to_selection + "-04-01";
  } else if (date_selection === "quarter") {
    area_date = get_quarter_end_date(to_selection, to_year);
    area_prev_date = get_quarter_start_date(from_selection, from_year);
  } else {
    area_prev_date = from_selection;
    area_date = to_selection;
  }
  var select = url.searchKey["select"] || defaults.select;
  var compare1 = url.searchKey["compare1"] || defaults[select][0];
  var compare2 = url.searchKey["compare2"] || defaults[select][1];
  var filter_type = url.searchKey["filter_type"] || defaults.filter_type;
  var params = { "date>~": area_prev_date, "date<~": area_date };
  var group_data, indicator_data;
  if (view === "geo") {
    params[select] = [compare1, compare2];
  } else {
    params[select] = compare1;
  }
  params["_by"] = ["date", select, filter_type];
  params["_c"] = "perc_point|avg";
  params["view"] = url.file;
  group_data = UI.fetch_data(data_map[select][date_selection], params);
  group_data = rename_key(group_data, filter_type, "category");
  group_data = rename_key(group_data, "perc_point|avg", "score");
  if (filter_type !== "indicator") {
    params["_by"] = ["date", select, filter_type, "indicator"];
    params["_c"] = "perc_point|avg";
    indicator_data = UI.fetch_data(data_map[select][date_selection], params);
    indicator_data = rename_key(indicator_data, "indicator", "category");
    indicator_data = rename_key(indicator_data, "perc_point|avg", "score");
    group_data = group_data.concat(indicator_data);
  }
  _.each(group_data, function (row) {
    row["date"] = convert_date(row["date"], date_selection);
  });
  params[select] = "";
  params["_c"] = ["perc_point|avg", "perc_point|max", "perc_point|min"];
  params["_by"].splice(params["_by"].indexOf(select), 1);
  var avg_max = UI.fetch_data(data_map[select][date_selection], params);
  avg_max = rename_key(avg_max, filter_type, "category");
  avg_max = rename_key(avg_max, "perc_point|avg", "avg");
  avg_max = rename_key(avg_max, "perc_point|max", "max");
  avg_max = rename_key(avg_max, "perc_point|min", "min");
  if (filter_type != "indicator") {
    params["_by"] = ["date", filter_type, "indicator"];
    var indicator_avg_max = UI.fetch_data(
      data_map[select][date_selection],
      params
    );
    indicator_avg_max = rename_key(indicator_avg_max, "indicator", "category");
    indicator_avg_max = rename_key(indicator_avg_max, "perc_point|avg", "avg");
    indicator_avg_max = rename_key(indicator_avg_max, "perc_point|max", "max");
    indicator_avg_max = rename_key(indicator_avg_max, "perc_point|min", "min");
    avg_max = avg_max.concat(indicator_avg_max);
  }
  _.each(avg_max, function (row) {
    row["date"] = convert_date(row["date"], date_selection);
  });
  var area_data = {};
  _.each(_.groupBy(group_data, "category"), function (values, key) {
    area_data[key] = [];
    _.each(_.groupBy(values, "date"), function (rows, date) {
      var row = {};
      var find_row = {};
      row["date"] = date;
      find_row[select] = compare1;
      row["score"] =
        _.round(_.meanBy(_.filter(rows, find_row), "score"), 2) || 0;
      var temp = _.find(avg_max, { date: date, category: key });
      row["avg"] = _.round(temp["avg"], 2);
      row["max"] = _.round(temp["max"], 2);
      if (view === "geo") {
        find_row[select] = compare2;
        row["score2"] =
          _.round(_.meanBy(_.filter(rows, find_row), "score"), 2) || 0;
      }
      area_data[key].push(row);
    });
  });
  if (date_selection == "date") {
    var fy_date = moment(get_fiscal_year(area_date) - 1 + "-04-01").format(
      "YYYY-MM-DD"
    );
    area_data[immunization] = _.filter(area_data[immunization], function (d) {
      return moment(d.date, "MMM YY") >= moment(fy_date, "YYYY-MM-DD");
    });
  }
  return area_data;
}

function get_fiscal_year(date) {
  var month_num = parseInt(moment(date).format("MM"));
  var year = parseInt(moment(date).format("YYYY"));
  if (month_num > 3) return year + 1;
  return year;
}

function convert_date(date, format) {
  var fyear = get_fiscal_year(date);
  if (format == "year") {
    return fyear - 1 + "-" + fyear;
  }
  if (format == "quarter") {
    return (
      "Q" + moment(date).fquarter().quarter + " " + (fyear - 1) + "-" + fyear
    );
  }
  return moment(date).format("MMM YY");
}

/* Rename dict keys */
function rename_key(dict_arr, replace_key, new_key) {
  var new_dict = [];
  // console.log(dict_arr)
  _.each(dict_arr, function (each_dict) {
    var b = {};
    _.each(each_dict, function (value, key) {
      if (key === replace_key) b[new_key] = value;
      else b[key] = value;
      if (
        each_dict["category"] === "Still birth ratio" ||
        each_dict["category"] ===
          "% of facilities reported outlier for the identified indicators of ranking" ||
        each_dict["category"] ===
          "Est Delivery load as per available Delivery Point" ||
        each_dict["category"] ===
          "Est Delivery load as per available SBA trained staff Nurse / ANM" ||
        each_dict["category"] ===
          "Availability of ASHA to total rural population"
      ) {
        var x = b["min"];
        b["max"] = x;
      }
    });
    new_dict.push(b);
  });
  return new_dict;
}

function show_error() {
  is_error = true;
  new Noty({
    type: "error",
    text: "FROM date should be lesser than TO date",
    timeout: 3000,
    progressBar: true,
  }).show();
  $(".loading-icon").hide();
}

function get_hierarchy_data() {
  all_hierarchy = UI.fetch_data("block_compare_hierachy", {
    "date>~": geography_dates[0],
    "date<~": geography_dates[1],
  });
  hierarchy = {};
  _.each(_.groupBy(all_hierarchy, "division"), function (values, key) {
    key = _.trim(key);
    _.each(values, function (item) {
      item["district"] = _.trim(item["district"]);
      item["block"] = _.trim(item["block"]);
    });
    hierarchy[key] = _.groupBy(values, "district");
  });
}

$(function () {
  url = g1.url.parse(location.href);
  $.fn.selectpicker.Constructor.BootstrapVersion = "4";
  $("#cal").hide();
  $(".geo-view").hide();
  $(".time-view").hide();
  user_district = defaults.district[0];
  selection_area = "district";
  if (user_info.division != "") {
    user_district = user_info.division;
    selection_area = "division";
  } else if (user_info.district != "") {
    user_district = user_info.district;
    selection_area = "district";
  }
  // all_data = UI.fetch_data('get_list', {})

  $(".nav-bar")
    .on("template", function () {
      $('a[data-attr="analytics"]').addClass("active-tab");
      $(".page-sidenav")
        .on("template", function () {
          $.getJSON("get_maximum_date_district", function (data) {
            var date_t = moment(data[0]["date"])
              .add(1, "months")
              .format("MMM yyyy");
            $(".last_date").text(date_t);
            // $(".last_date").text("Feb 2023");
          });
          $(".user_name").text(user_info.user);
          $(".user-profile").template({
            user_name: user_info.user,
            details: {
              mobile: user_info.phonenumber || "Not Provided",
              district: user_info.district || "All",
              designation: user_info.designation || "Admin",
              program: user_info.program || "None",
            },
          });
        })
        .template({ user: user_info.designation || "Admin" });
      UI.load_calendar();
      $(".insights").template();
    })
    .template({ user: user_info.user });
  set_date_selection();
  // get_hierarchy_data()
  $(".geo-1")
    .on("template", function () {
      $(".geo-1").off();
      $(".geo-2")
        .on("template", function () {
          $(".geo-2").off();
          $(".geo-left")
            .on("template", function () {
              $(".geo-left").off();
              $(".geo-right")
                .on("template", function () {
                  $(".geo-right").off();
                  redraw_compare_view();
                })
                .template({
                  align: "right",
                  color1: "bg-dark",
                  color2: "custom-bg-clr6",
                  curr: 0,
                  prev: 0,
                  name: "",
                });
            })
            .template({
              align: "left",
              color1: "custom-bg-clr4",
              color2: "custom-bg-clr5",
              curr: 0,
              prev: 0,
              name: "",
            });
        })
        .template({
          add_class: "geo-select-2",
          data: [
            {
              name: "Division",
              label: "select-division-2",
              class: "division-dropdown-2",
            },
            {
              name: "District",
              label: "select-district-2",
              class: "district-dropdown-2",
            },
            {
              name: "Block",
              label: "select-block-2",
              class: "block-dropdown-2",
            },
          ],
        });
    })
    .template({
      add_class: "",
      data: [
        {
          name: "Division",
          label: "select-division",
          class: "division-dropdown",
        },
        {
          name: "District",
          label: "select-district",
          class: "district-dropdown",
        },
        { name: "Block", label: "select-block", class: "block-dropdown" },
      ],
    });
});

$(document)
  .on("click", ".analytics-pill", function () {
    var filter = $(this).attr("data-attr");
    url.update({ filter_type: filter, filter_name: null });
    window.history.pushState({}, "", url.toString());
    render_accordion();
  })
  .on("click", "#view-switch", function () {
    $(".loading-icon").show();
    var val = $(this).prop("checked") ? "geo" : "time";
    url.update({ view: val });
    url.update({
      compare1: null,
      compare2: null,
      select: null,
      month: null,
      quarter: null,
      prev_quarter: null,
      year: null,
      prev_year: null,
      from_month: null,
      from_quarter: null,
      from_year: null,
      to_month: null,
      to_quarter: null,
      to_year: null,
    });
    window.history.pushState({}, "", url.toString());
    redraw_compare_view();
    // $(".loading-icon").hide()
  })
  .on("click", ".submit", function () {
    if (url.searchKey.view === "geo") {
      $(".submit").removeAttr("id");
      // set_date_selection()
      // render_bars()
      redraw_compare_view();
    }
  })
  .on("click", "#time-for-date", function () {
    $(".quarter,.month,.year").unbind("click");
    $(".submit").removeAttr("id").attr("id", "submit-for");
    $("#cal").show();
    var month_selected = url.searchKey["from_month"];
    var quarter_selected = url.searchKey["from_quarter"];
    $(".month,.quarter,.year").removeAttr("id");
    if (month_selected) {
      url.update({ from_month: null });
      if (date_selection != "date") url.update({ to_month: null });
      $("." + month_selected).attr("id", "active");
    }
    if (quarter_selected) {
      url.update({ from_quarter: null });
      if (date_selection != "quarter") url.update({ to_quarter: null });
      $("." + quarter_selected).attr("id", "active_q");
    }
    if (!month_selected && !quarter_selected) {
      if (date_selection === "date") {
        $("." + from_value).attr("id", "active");
      } else if (date_selection === "quarter") {
        $(".Q" + from_value).attr("id", "active_q");
      } else {
        $(".year").attr("id", "year_selected");
      }
    }
    $(".quarter").click(function () {
      $(".quarter,.month,.year").removeAttr("id");
      $(this).attr("id", "active_q");
    });
    $(".year").click(function () {
      $(".year").attr("id", "year_selected");
      $(".quarter,.month").removeAttr("id");
    });
    $("#submit-for").unbind("click");
    $("#submit-for").click(function () {
      var month_value = $("#active").attr("data-attr");
      var quarter_value = $("#active_q").attr("data-attr");
      var year_value = $(".year").attr("data-attr").trim();
      is_error = false;
      if ($(".year").attr("id") == "year_selected") {
        if (date_selection == "year") {
          parseInt(year_value) >= to_selection
            ? show_error()
            : url.update({ from_year: year_value });
        } else {
          url.update({ from_year: year_value, to_year: defaults.year });
        }
      } else {
        if (month_value !== undefined) {
          year_value = $("#active").attr("data-year");
          if (date_selection == "date") {
            moment("01-" + month_value + "-" + year_value, "DD-MMM-YYYY") >=
            moment(to_selection)
              ? show_error()
              : url.update({ from_year: year_value, from_month: month_value });
          } else {
            url.update({
              from_year: year_value,
              from_month: month_value,
              to_year: moment(defaults.date).year(),
              to_month: defaults.month,
            });
          }
        } else {
          if (date_selection == "quarter") {
            moment(quarter_value + year_value, "QYYYY") >=
            moment(to_selection + to_year, "QYYYY")
              ? show_error()
              : url.update({
                  from_year: year_value,
                  from_quarter: quarter_value,
                });
          } else {
            url.update({
              from_year: year_value,
              from_quarter: quarter_value,
              to_quarter: defaults.quarter,
              to_year: defaults.year,
            });
          }
        }
      }
      $("#cal").hide();
      if (!is_error) {
        window.history.pushState({}, "", url.toString());
        // set_date_selection()
        // render_bars()
        redraw_compare_view();
      }
    });
  })
  .on("click", "#time-to-date", function () {
    $(".quarter, .month, .year").unbind("click");
    $(".submit").removeAttr("id").attr("id", "submit-to");
    $("#cal").show();
    var month_selected = url.searchKey["to_month"];
    var quarter_selected = url.searchKey["to_quarter"];
    $(".quarter, .month, .year").removeAttr("id");
    if (month_selected) {
      url.update({ to_month: null });
      if (date_selection != "date") url.update({ from_month: null });
      $("." + month_selected).attr("id", "active");
    }
    if (quarter_selected) {
      url.update({ to_quarter: null });
      if (date_selection != "quarter") url.update({ from_quarter: null });
      $("." + quarter_selected).attr("id", "active_q");
    }
    if (!month_selected && !quarter_selected) {
      if (date_selection === "date") {
        $("." + to_value).attr("id", "active");
      } else if (date_selection === "quarter") {
        $(".Q" + to_value).attr("id", "active_q");
      } else {
        $(".year").attr("id", "year_selected");
      }
    }
    $(".quarter").click(function () {
      $(".quarter, .month, .year").removeAttr("id");
      $(this).attr("id", "active_q");
    });
    $(".year").click(function () {
      $(".year").attr("id", "year_selected");
      $(".quarter, .month").removeAttr("id");
    });
    $("#submit-to").unbind("click");
    $("#submit-to").click(function () {
      var month_value = $("#active").attr("data-attr");
      var quarter_value = $("#active_q").attr("data-attr");
      var year_value = $(".year").attr("data-attr");
      is_error = false;
      var cal_date, from_cal_date;
      if ($(".year").attr("id") == "year_selected") {
        if (date_selection == "year") {
          parseInt(year_value) <= from_selection
            ? show_error()
            : url.update({ to_year: year_value });
        } else {
          url.update({ to_year: year_value, from_year: defaults.year - 1 });
        }
      } else {
        if (month_value !== undefined) {
          year_value = $("#active").attr("data-year");
          cal_date = moment(
            "01-" + month_value + "-" + year_value,
            "DD-MMM-YYYY"
          );
          if (date_selection == "date") {
            cal_date <= moment(from_selection)
              ? show_error()
              : url.update({ to_year: year_value, to_month: month_value });
          } else {
            from_cal_date = cal_date.subtract(2, "month");
            url.update({
              to_year: year_value,
              to_month: month_value,
              from_year: from_cal_date.year(),
              from_month: from_cal_date.format("MMM"),
            });
          }
        } else {
          cal_date = moment(quarter_value + year_value, "QYYYY");
          if (date_selection == "quarter") {
            cal_date <= moment(from_selection + from_year, "QYYYY")
              ? show_error()
              : url.update({ to_year: year_value, to_quarter: quarter_value });
          } else {
            from_cal_date = cal_date.subtract(2, "Q");
            url.update({
              to_year: year_value,
              to_quarter: quarter_value,
              from_quarter: "Q" + from_cal_date.quarter(),
              from_year: from_cal_date.year(),
            });
          }
        }
      }
      $("#cal").hide();
      if (!is_error) {
        window.history.pushState({}, "", url.toString());
        // set_date_selection()
        // render_bars()
        redraw_compare_view();
      }
    });
  })
  .on("change", "#select-division", function () {
    var val = $(this).val();
    url.update({ select: "division" });
    select_geo_1 = "division";
    render_dropdown(
      ".district-dropdown",
      "select-district",
      "select-division",
      ["All districts"].concat(_.keys(hierarchy[val])),
      "district",
      {}
    );
    render_dropdown(
      ".block-dropdown",
      "select-block",
      "select-district",
      ["All blocks"],
      "block",
      {}
    );
  })
  .on("change", "#select-district", function () {
    var division = $("#select-division").val();
    var val = $(this).val();
    if (val === "All districts") {
      url.update({ select: "division" });
      select_geo_1 = "division";
    } else {
      url.update({ select: "district" });
      select_geo_1 = "district";
      selected_division = get_division(val);
    }
    render_dropdown(
      ".block-dropdown",
      "select-block",
      "select-district",
      ["All blocks"].concat(_.map(hierarchy[division][val], "block")),
      "block",
      {}
    );
  })
  .on("change", "#select-block", function () {
    var val = $(this).val();
    if (val === "All blocks") {
      url.update({ select: "district" });
      select_geo_1 = "district";
    } else {
      url.update({ select: "block" });
      select_geo_1 = "block";
      selected_district = get_district(val);
    }
  })
  .on("change", "#select-division-2", function () {
    select_geo_2 = "division";
    var val = $(this).val();
    url.update({ select: "division" });
    render_dropdown(
      ".district-dropdown-2",
      "select-district-2",
      "select-division-2",
      ["All districts"].concat(_.keys(hierarchy[val])),
      "district",
      {}
    );
    render_dropdown(
      ".block-dropdown-2",
      "select-block-2",
      "select-district-2",
      ["All blocks"],
      "block",
      {}
    );
  })
  .on("change", "#select-district-2", function () {
    var division = $("#select-division-2").val();
    var val = $(this).val();
    if (val === "All districts") {
      url.update({ select: "division" });
      select_geo_2 = "division";
    } else {
      url.update({ select: "district" });
      select_geo_2 = "district";
    }
    render_dropdown(
      ".block-dropdown-2",
      "select-block-2",
      "select-district-2",
      ["All blocks"].concat(_.map(hierarchy[division][val], "block")),
      "block",
      {}
    );
  })
  .on("change", "#select-block-2", function () {
    var val = $(this).val();
    if (val === "All blocks") {
      url.update({ select: "district" });
      select_geo_2 = "district";
    } else {
      url.update({ select: "block" });
      select_geo_2 = "block";
    }
  })
  .on("click", "#time-submit", function () {
    if (url.searchKey.view === "geo") {
      if (select_geo_1 === select_geo_2) {
        url.update({
          select: select_geo_1,
          compare1: $("#select-" + select_geo_1).val(),
          compare2: $("#select-" + select_geo_1 + "-2").val(),
        });
        window.history.pushState({}, "", url.toString());
        $("#alert").hide();
        set_date_selection();
        render_bars();
      } else {
        $("#alert").show();
      }
    } else {
      url.update({
        select: select_geo_1,
        compare1: $("#select-" + select_geo_1).val(),
      });
      window.history.pushState({}, "", url.toString());
      set_date_selection();
      render_bars();
    }
  })
  .on("click touch", ".collapse-header", function () {
    if ($(this).find(".fa-minus").length > 0) {
      $(".fa-minus").removeClass("fa-minus").addClass("fa-plus");
      url.update({ filter_name: null });
    } else {
      $(".fa-minus").removeClass("fa-minus").addClass("fa-plus");
      $(this).find(".fa-plus").removeClass("fa-plus").addClass("fa-minus");
      var filter_row = {};
      filter_row["filter_name"] = $(this).data("attr");
      url.update(filter_row);
    }
    window.history.pushState({}, "", url.toString());
  })
  .on("change", "#up-avg", function () {
    $(this).prop("checked")
      ? $(".avg, .avg-dots").show()
      : $(".avg, .avg-dots").hide();
  })
  .on("change", "#best-dist", function () {
    $(this).prop("checked")
      ? $(".max, .max-dots").show()
      : $(".max, .max-dots").hide();
  });
