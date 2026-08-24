/* global UI, draw_combo_chart, defaults, user_data, data_map, merge_arrays, sort_list, Noty, district_name_mapping,
accordion_data_map */

var url,
  view,
  filter_type,
  compare1,
  compare2,
  select,
  trend,
  acc_data,
  date,
  prev_date,
  all_data,
  quarter,
  year,
  selection,
  from_value,
  to_value,
  from_year,
  to_year,
  from_date,
  to_date,
  month,
  prev_quarter,
  prev_month,
  prev_year,
  prev_value,
  is_error = false,
  change_dist;

var user_district, user_division;

// // If state user hide ES
// if (!user_data.district && !user_data.division ) { $('#executive_nav').remove()}
$(".footer").removeClass("d-none");

// logged user is extracted to determine if district or not
function set_user_details() {
  user_district = user_data["district"] || "Agra";
  user_division = _.filter(all_data["district"], {
    district: user_district,
  })[0]["division"];
}

function render_analytics() {
  $(".loading-icon").show();
  $(".cal").hide();
  $("#analytics-container").show();
  url = g1.url.parse(location.href);
  view = url.searchKey["view"] || defaults.view;
  filter_type = url.searchKey["filter_type"] || defaults.filter_type;
  select = url.searchKey["select"] || "district";
  if (view === "geo") {
    render_geo_view();
    $(".filter-dropdown").text("By Geography");
    $("#radio-select-" + select).attr("checked", "checked");
  } else if (view === "time") {
    render_time_view();
    $(".filter-dropdown").text("By TimePeriod");
    $("#radio-select1-" + select).attr("checked", "checked");
  }
  select === "block"
    ? $(".for-blocks").removeClass("d-none")
    : $(".for-blocks").addClass("d-none");
  setTimeout(function () {
    $("#up-avg").prop("checked") ? $(".avg").show() : $(".avg").hide();
    $("#best-dist").prop("checked") ? $(".max").show() : $(".max").hide();
    $(".loading-icon").hide();
  }, 1000);

  $(".loading-icon").hide();
}

function render_time_view() {
  $(".loading-icon").show();
  $(".time-view").show();
  $(".geo-view").hide();
  select = url.searchKey["select"] || "district";
  $("#radio-select1-" + select).attr("checked", "checked");
  var from_month = url.searchKey["from_month"];
  var from_quarter = url.searchKey["from_quarter"];
  from_year = url.searchKey["from_year"];
  if (
    from_month === undefined &&
    from_quarter === undefined &&
    from_year === undefined
  ) {
    selection = "month";
    from_date = get_selected_date(
      selection,
      from_month,
      from_quarter,
      from_year
    );
    from_date = moment(from_date, "YYYY-MM-DD")
      .subtract(2, "month")
      .format("YYYY-MM-01");
    from_year = parseInt(moment(from_date).format("YYYY"));
    from_value = moment(from_date).format("MMM");
  } else if (from_month === undefined && from_quarter === undefined) {
    selection = "year";
    from_date = get_selected_date(
      selection,
      from_month,
      from_quarter,
      from_year
    );
    from_value = from_year;
  } else if (from_quarter === undefined) {
    selection = "month";
    from_value = from_month;
    from_year = from_year || defaults.year;
    from_date = get_selected_date(
      selection,
      from_month,
      from_quarter,
      from_year
    );
  } else {
    selection = "quarter";
    from_value = from_quarter[1];
    from_year = from_year || defaults.year;
    from_date = get_selected_date(
      selection,
      from_month,
      from_quarter,
      from_year
    );
    from_date = moment(from_date, "Q YYYY")
      .subtract(2, "month")
      .format("Q YYYY");
    from_month = moment(from_date, "Q YYYY").format("MMM");
  }

  var to_month = url.searchKey["to_month"];
  var to_quarter = url.searchKey["to_quarter"];
  to_year = url.searchKey["to_year"];

  if (selection === "quarter") {
    to_quarter = to_quarter || defaults.quarter;
    to_value = to_quarter[1];
    to_year = to_year || defaults.year;
    to_month = get_quarter_end_date(to_quarter, to_year);
    to_date = get_selected_date(selection, to_month, to_quarter, to_year);
    $("#cal-to-label").text(to_quarter + " " + (to_year - 1) + "-" + to_year);
    $("#cal-from-label").text(
      from_quarter + " " + (from_year - 1) + "-" + from_year
    );
  } else if (selection === "month") {
    to_month = to_month || defaults.month;
    to_value = to_month;
    to_year = to_year || defaults.year;
    to_date = get_selected_date(selection, to_month, to_quarter, to_year);
    $("#cal-from-label").text(from_value + " " + from_year);
    $("#cal-to-label").text(to_value + " " + to_year);
  } else {
    to_year = to_year || defaults.year;
    to_value = to_year;
    to_date = get_selected_date(selection, to_month, to_quarter, to_year);
    $("#cal-from-label").text(from_year - 1 + "-" + from_year);
    $("#cal-to-label").text(to_year - 1 + "-" + to_year);
  }
  var block_dist = url.searchKey["block_dist"] || defaults.district[0];
  if (select === "block") {
    $("#time-district-dropdown").selectpicker("destroy");
    $(".time-district-dropdown")
      .on("template", function () {
        $(".time-district-dropdown").off();
        change_dist = _.includes(Object.keys(district_name_mapping), block_dist)
          ? district_name_mapping[block_dist]
          : block_dist;
        $("#time-district-dropdown").val(change_dist);
        $("#time-district-dropdown").selectpicker("refresh");
      })
      .template({
        id: "time-district-dropdown",
        data: all_data["district"],
        column: "district",
        district_name_change: district_name_mapping,
      });
  }
  var dropdown_data = all_data[select];
  if (select === "block") {
    dropdown_data = _.filter(dropdown_data, { district: block_dist });
  }
  compare1 = url.searchKey["compare1"] || dropdown_data[0][select];
  $("#district").selectpicker("destroy");
  $(".analytics-dropdown")
    .on("template", function () {
      $(".analytics-dropdown").off();
      change_dist = _.includes(Object.keys(district_name_mapping), compare1)
        ? district_name_mapping[compare1]
        : compare1;
      $("#district").val(change_dist);
      $("#district").selectpicker("refresh");
      // var value = get_composite_score(compare1, selection, from_value, from_year)
      var pre_value = get_composite_score(
        compare1,
        selection,
        to_value,
        to_year
      );
      $("#comp_score").text(_.round(pre_value, 2));
      if (selection === "month") {
        $("#curr-label").text(from_value + " " + from_year);
        $("#prev-label").text(to_value + " " + to_year);
      } else if (selection === "quarter") {
        $("#curr-label").text(from_quarter + " " + from_year);
        $("#prev-label").text(to_quarter + " " + to_year);
      } else {
        $("#curr-label").text(from_year);
        $("#prev-label").text(to_year);
      }
    })
    .template({
      data: dropdown_data,
      column: select,
      id: "district",
      district_name_change: district_name_mapping,
    });
  render_accordion(filter_type);
  $(".loading-icon").hide();
}

function render_geo_view() {
  $(".loading-icon").show();
  $(".geo-view").show();
  $(".time-view").hide();
  select = url.searchKey["select"] || "district";
  quarter = url.searchKey["quarter"];
  month = url.searchKey["month"];
  year = url.searchKey["year"];
  prev_quarter = url.searchKey["prev_quarter"];
  prev_month = url.searchKey["prev_month"];
  prev_year = url.searchKey["prev_year"];
  if (year === undefined) {
    selection = "month";
    month = defaults.month;
    from_value = defaults.month;
    year = defaults.year;
    prev_month = moment(month, "MMM").subtract(2, "month").format("MMM");
    prev_value = prev_month;
    prev_year = moment(month + " " + year, "MMM YYYY")
      .subtract(2, "month")
      .format("YYYY");
  } else if (quarter === undefined || quarter === "") {
    selection = "month";
    from_value = month;
    prev_month = moment(month, "MMM").subtract(2, "month").format("MMM");
    prev_value = prev_month;
    prev_year = moment(month + " " + year, "MMM YYYY")
      .subtract(2, "month")
      .format("YYYY");
  } else if (month === undefined || month === "") {
    selection = "quarter";
    from_value = quarter[1];
    prev_value = prev_quarter[1];
  }
  if (quarter === "" && month === "") {
    selection = "year";
    from_value = year;
    prev_value = prev_year;
  }
  $(".selection-label").text(selection);
  if (selection === "month") {
    date = get_selected_date(selection, month, quarter, year);
    prev_date = moment(date, "YYYY-MM-DD")
      .subtract(2, "month")
      .format("YYYY-MM-DD");
    $("#date-label").text(month + " " + year);
  } else if (selection == "quarter") {
    date = get_quarter_end_date(quarter, year);
    month = moment(date, "YYYY-MM-DD").format("MMM");
    prev_date = moment(date, "YYYY-MM-DD")
      .subtract(5, "month")
      .format("YYYY-MM-DD");
    $("#date-label").text(quarter + " " + (year - 1) + "-" + year);
  } else {
    date = get_selected_date(selection, month, quarter, year);
    prev_date = prev_year + "-04-01";
    $("#date-label").text(year - 1 + "-" + year);
  }
  var block_dist = url.searchKey["block_dist"] || defaults.district[0];
  if (select === "block") {
    $("#geo-district-dropdown").selectpicker("destroy");
    $(".geo-district-dropdown")
      .on("template", function () {
        $(".geo-district-dropdown").off();
        change_dist = _.includes(Object.keys(district_name_mapping), block_dist)
          ? district_name_mapping[block_dist]
          : block_dist;
        $("#geo-district-dropdown").val(change_dist);
        $("#geo-district-dropdown").selectpicker("refresh");
      })
      .template({
        id: "geo-district-dropdown",
        data: all_data["district"],
        column: "district",
        district_name_change: district_name_mapping,
      });
  }
  var left_list,
    right_list,
    find_row = {};
  var dropdown_data = all_data[select];
  if (select === "block") {
    dropdown_data = _.filter(dropdown_data, { district: block_dist });
  }
  compare1 = url.searchKey["compare1"] || dropdown_data[0][select];
  compare2 =
    url.searchKey["compare2"] ||
    (compare1 == dropdown_data[1][select]
      ? dropdown_data[2][select]
      : dropdown_data[1][select]);
  left_list = _.cloneDeep(dropdown_data);
  right_list = _.cloneDeep(dropdown_data);
  find_row[select] = compare1;
  right_list.splice(_.findIndex(left_list, find_row), 1);
  find_row[select] = compare2;
  left_list.splice(_.findIndex(left_list, find_row), 1);

  $("#compare1").selectpicker("destroy");
  $("#compare2").selectpicker("destroy");
  $(".left-dropdown")
    .on("template", function () {
      $(".left-dropdown").off();
      var value = get_composite_score(compare1, selection, from_value, year);
      var pre_value = get_composite_score(
        compare1,
        selection,
        prev_value,
        prev_year
      );
      pre_value = ((value - pre_value) / value) * 100;
      change_dist = _.includes(Object.keys(district_name_mapping), compare1)
        ? district_name_mapping[compare1]
        : compare1;
      $("#compare1").val(change_dist);
      $("#compare1").addClass("custom-border_bottom_left");
      $("#compare1").selectpicker("refresh");
      $("#left-value").text(_.round(value, 2) || 0);
      $("#left-change").text(_.round(pre_value, 2) || 0);
    })
    .template({
      data: left_list,
      column: select,
      id: "compare1",
      district_name_change: district_name_mapping,
    });

  $(".right-dropdown")
    .on("template", function () {
      $(".right-dropdown").off();
      var value = get_composite_score(compare2, selection, from_value, year);
      var pre_value = get_composite_score(
        compare2,
        selection,
        prev_value,
        prev_year
      );
      pre_value = ((value - pre_value) / value) * 100;
      change_dist = _.includes(Object.keys(district_name_mapping), compare2)
        ? district_name_mapping[compare2]
        : compare2;
      $("#compare2").val(change_dist);
      $("#compare2").addClass("custom-border_bottom_right");
      $("#compare2").selectpicker("refresh");
      $("#right-value").text(_.round(value, 2) || 0);
      $("#right-change").text(_.round(pre_value, 2) || 0);
    })
    .template({
      data: right_list,
      column: select,
      id: "compare2",
      district_name_change: district_name_mapping,
    });
  render_accordion(filter_type);
  $(".loading-icon").hide();
}

function get_composite_score(name, type, value, year) {
  var date;
  var params = {};
  if (type === "month") {
    date = moment(year + "-" + value + "-01", "YYYY-MMM-DD").format(
      "YYYY-MM-DD"
    );
    params = { date: date };
  } else if (type === "quarter") {
    params = { quarter: value, year: year };
  } else {
    params = { year: year };
  }
  params[select] = name;
  var data = UI.fetch_data(data_map[select][type], params);
  return data.length ? _.meanBy(data, "composite_index") : 0;
}

function render_trend() {
  filter_type = url.searchKey["filter_type"] || defaults.filter_type;
  trend = url.searchKey["trend"] || "Composite_Score";
  var parameter, avg_max;
  parameter = trend === "Composite_Score" ? "composite_index" : "perc_point";
  var trend_data = [];
  var params = {},
    data;
  if (view === "geo") {
    if (selection === "year") {
      to_date = year + "-03-01";
    } else {
      to_date = date;
    }
    params = { date: get_dates(moment(prev_date), moment(to_date)) };
    params[select] = [compare1, compare2];
    if (trend !== "Composite_Score") {
      params[filter_type] = trend;
    }
    // data = UI.fetch_data(select+'_data_analytics_exe', params)
    var _geo = select == "division" ? "district" : select;
    data = UI.fetch_data(_geo + "_data_analytics", params);
    _.each(_.groupBy(data, "date"), function (values, key) {
      var row = {};
      row["date"] = key;
      _.each(_.groupBy(values, select), function (rows, index) {
        row[index] = _.meanBy(rows, parameter);
      });
      trend_data.push(row);
    });
    trend_data = rename_key(trend_data, compare1, "score");
    trend_data = rename_key(trend_data, compare2, "score2");
    _.each(trend_data, function (row) {
      console.log("here", row)
      row["date"] = convert_date(row["date"], selection);
      row["score"] = row["score"] ? row["score"] : 0;
      row["score2"] = row["score2"] ? row["score2"] : 0;
    });
    params[select] = "";
    params["_by"] = ["date"];
    params["_c"] = [parameter + "|avg", parameter + "|max"];
    // avg_max = UI.fetch_data(select+'_data_analytics_exe', params)
    avg_max = UI.fetch_data(_geo + "_data_analytics", params);
    avg_max = rename_key(avg_max, filter_type, "category");
    avg_max = rename_key(avg_max, parameter + "|avg", "avg");
    avg_max = rename_key(avg_max, parameter + "|max", "max");
    _.each(avg_max, function (row) {
      row["date"] = convert_date(row["date"], selection);
    });
    trend_data = merge_arrays(trend_data, avg_max, "date");
    draw_combo_chart("#trendline", view, trend_data);
  } else if (view === "time") {
    var from = from_date;
    var to = to_date;
    params = { date: get_dates(moment(from), moment(to)) };
    params[select] = compare1;
    if (trend !== "Composite_Score") {
      params[filter_type] = trend;
    }
    // data = UI.fetch_data(select+'_data_analytics_exe', params)
    // select = select == 'division' ? 'district' : select
    _geo = select == "division" ? "district" : select;
    data = UI.fetch_data(_geo + "_data_analytics", params);
    _.each(_.groupBy(data, "date"), function (values, key) {
      var row = {};
      row["date"] = key;
      row["score"] = _.meanBy(values, parameter);
      trend_data.push(row);
    });
    _.each(trend_data, function (row) {
      row["date"] = convert_date(row["date"], selection);
    });
    params[select] = "";
    params["_by"] = ["date"];
    params["_c"] = [parameter + "|avg", parameter + "|max"];
    // avg_max = UI.fetch_data(select+'_data_analytics_exe', params)
    avg_max = UI.fetch_data(_geo + "_data_analytics", params);
    if (params['indicator'] == "Still birth ratio" || params['indicator'] == "% of facilities reported outlier for the identified indicators of ranking"){
      avg_max = rename_key(avg_max, filter_type, "category");
      avg_max = rename_key(avg_max, parameter + "|avg", "max");
      avg_max = rename_key(avg_max, parameter + "|max", "avg");
      _.each(avg_max, function (row) {
        row["date"] = convert_date(row["date"], selection);
      });
      trend_data = merge_arrays(trend_data, avg_max, "date");
      draw_combo_chart("#trendline", view, trend_data);
    }else{
      avg_max = rename_key(avg_max, filter_type, "category");
      avg_max = rename_key(avg_max, parameter + "|avg", "avg");
      avg_max = rename_key(avg_max, parameter + "|max", "max");
      _.each(avg_max, function (row) {
        row["date"] = convert_date(row["date"], selection);
      });
      trend_data = merge_arrays(trend_data, avg_max, "date");
      draw_combo_chart("#trendline", view, trend_data);
    }
  }
  $("#up-avg").prop("checked") ? $(".avg, .avg-dots").show() : $(".avg").hide();
  $("#best-dist").prop("checked")
    ? $(".max, .max-dots").show()
    : $(".max").hide();
}

function get_dates(from_date, to_date) {
  var result = [];
  var current_date = from_date;
  while (from_date.isBefore(to_date)) {
    result.push(current_date.format("YYYY-MM-01"));
    from_date.add(1, "month");
  }
  result.push(to_date.format("YYYY-MM-01"));
  return result;
}

function get_fiscal_year(date) {
  var month_num = parseInt(moment(date).format("MM"));
  var year = parseInt(moment(date).format("YYYY"));
  if (month_num > 3) return year + 1;
  return year;
}

function convert_date(date, format) {
  if (format == "year") {
    return get_fiscal_year(date).toString();
  }
  if (format == "quarter") {
    return "Q" + moment(date).utc().quarter() + " " + get_fiscal_year(date);
    // return moment(date).fquarter().quarter + ' ' + get_fiscal_year(date)
  }
  return moment(date).format("MMM YY");
}

function get_selected_date(selection, month, quarter, year) {
  if (selection === "quarter") return get_quarter_end_date(quarter, year);
  if (selection === "year") return moment(year, "YYYY").format("YYYY-03-01");
  if (!month) return defaults.date;
  return moment(year + "-" + month + "-01", "YYYY-MMM-DD").format("YYYY-MM-DD");
}

function get_quarter_end_date(quarter, year) {
  return moment(quarter + " " + year, "[Q]Q YYYY")
    .subtract(1, "year")
    .add(5, "month")
    .format("YYYY-MM-01");
}

/* Rename dict keys */
function rename_key(dict_arr, replace_key, new_key) {
  var new_dict = [];
  _.each(dict_arr, function (each_dict) {
    var b = {};
    _.each(each_dict, function (value, key) {
      if (key === replace_key) b[new_key] = value;
      else b[key] = value;
    });
    new_dict.push(b);
  });
  return new_dict;
}

function render_accordion(filter) {
  var all_acc_data = get_accordion_data(filter);
  acc_data = sort_list(all_acc_data["acc_data"], "category");
  var ind_data = all_acc_data["ind_data"];
  filter_type = url.searchKey["filter_type"] || defaults.filter_type;
  var trendline_dropdown = [{ category: "Composite Score" }];
  var color1, color2;
  if (view === "time") {
    color1 = "#E09C24";
    color2 = "#846734";
  } else {
    color1 = "#DB5F3B";
    color2 = "#000000";
  }
  $(".analytics-accordion")
    .on("template", function () {
      $(".analytics-accordion").off();
      _.each($(".acc-bar"), function (d) {
        var width = $(d).attr("width");
        $(d).css("width", width + "%");
      });
      $(".bar-one").css("background-color", color1);
      $(".bar-two").css("background-color", color2);
    })
    .template({ data: acc_data, ind_data: ind_data, display: filter_type });
  $("#trend").selectpicker("destroy");
  if (acc_data.length > 0) {
    $(".trend-analysis").show();
    $(".trendline-dropdown")
      .on("template", function () {
        $(".trendline-dropdown").off();
        $("#trend").selectpicker("refresh");
      })
      .template({
        data: trendline_dropdown.concat(acc_data),
        column: "category",
        id: "trend",
        short_name: true,
      });
    render_trend();
  } else {
    $(".trend-analysis").hide();
  }
}

function get_accordion_data(filter) {
  var acc_data = [];
  var ind_data = {};
  var indicator_data = {};
  var params, data;
  if (view === "geo") {
    params = { date: date };
    params[select] = [compare1, compare2];
    // data = UI.fetch_data('analytics_accordion_'+select, params)
    params["view"] = "geo";
    data = UI.fetch_data(accordion_data_map[selection] + select, params);
    indicator_data = data["indicator_" + filter];
    data = data["score_by_" + filter];
    _.each(_.groupBy(data, "category"), function (values, key) {
      var row = {},
        find_row = {};
      find_row[select] = compare1;
      row["category"] = key;
      var value1 = _.find(values, find_row);
      value1 = value1 === undefined ? 0 : _.round(value1["score"], 2);
      row["curr_val"] = value1;
      find_row[select] = compare2;
      var value2 = _.find(values, find_row);
      value2 = value2 === undefined ? 0 : _.round(value2["score"], 2);
      row["prev_val"] = value2;
      acc_data.push(row);
    });
    if (filter !== "indicator") {
      _.each(_.groupBy(indicator_data, filter), function (rows, key) {
        ind_data[key] = [];
        // _.each(_.groupBy(rows, select), function(values){
        _.each(_.groupBy(rows, "category"), function (values) {
          var row = {},
            find_row = {};
          find_row[select] = compare1;
          row["indicator"] = values[0]["category"];
          var value1 = _.find(values, find_row);
          value1 = value1 === undefined ? 0 : _.round(value1["score"], 2);
          row["curr_val"] = value1;
          find_row[select] = compare2;
          var value2 = _.find(values, find_row);
          value2 = value2 === undefined ? 0 : _.round(value2["score"], 2);
          row["prev_val"] = value2;
          ind_data[key].push(row);
        });
      });
    }
  } else if (view === "time") {
    if (selection === "month") {
      // params = {date: [from_date, to_date]}
      if (select != "block") params = { date: [from_date, to_date] };
      else params = { from_date: from_date, to_date: to_date };
    } else if (selection === "quarter") {
      // params = {quarter: [from_value, to_value], year: [from_year, to_year]}
      if (select != "block")
        params = {
          quarter: [from_value, to_value],
          year: [from_year, to_year],
        };
      else
        params = {
          from_value: from_value,
          to_value: to_value,
          from_year: from_year,
          to_year: to_year,
        };
    } else {
      // params = {year: [from_year, to_year]}
      if (select != "block")
        params = { from_year: from_year, to_year: to_year };
      else params = { year: [from_year, to_year] };
    }
    params[select] = compare1;
    data = UI.fetch_data(accordion_data_map[selection] + select, params);
    // data = UI.fetch_data('analytics_accordion_'+select, params)
    indicator_data = data["indicator_" + filter];
    data = data["score_by_" + filter];
    _.each(_.groupBy(data, "category"), function (values, key) {
      var row = {};
      var find_row = {};
      selection === "month"
        ? (find_row["date"] = from_date)
        : (find_row[selection] = parseInt(from_value));
      if (selection === "quarter") find_row["year"] = parseInt(from_year);
      row["category"] = key;
      var value1 = _.meanBy(_.filter(values, find_row), "score");
      value1 = isNaN(value1) ? 0 : _.round(value1, 2);
      row["curr_val"] = value1;
      selection === "month"
        ? (find_row["date"] = to_date)
        : (find_row[selection] = parseInt(to_value));
      if (selection === "quarter") find_row["year"] = parseInt(to_year);
      var value2 = _.meanBy(_.filter(values, find_row), "score");
      value2 = isNaN(value2) ? 0 : _.round(value2, 2);
      row["prev_val"] = value2;
      acc_data.push(row);
    });
    if (filter !== "indicator") {
      _.each(_.groupBy(indicator_data, filter), function (rows, key) {
        ind_data[key] = [];
        _.each(_.groupBy(rows, "category"), function (values, index) {
          var row = {};
          var find_row = {};
          selection === "month"
            ? (find_row["date"] = from_date)
            : (find_row[selection] = parseInt(from_value));
          row["indicator"] = index;
          var value1 = _.meanBy(_.filter(values, find_row), "score");
          value1 = isNaN(value1) ? 0 : _.round(value1, 2);
          row["curr_val"] = value1;
          selection === "month"
            ? (find_row["date"] = to_date)
            : (find_row[selection] = parseInt(to_value));
          var value2 = _.meanBy(_.filter(values, find_row), "score");
          value2 = isNaN(value2) ? 0 : _.round(value2, 2);
          row["prev_val"] = value2;
          ind_data[key].push(row);
        });
      });
    }
  }
  return { acc_data: acc_data, ind_data: ind_data };
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

$(function () {
  $.fn.selectpicker.Constructor.BootstrapVersion = "4";
  all_data = UI.fetch_data("get_list", {});
  _.each(all_data["division"], function (row) {
    row["division"] = _.trim(row["division"]);
  });
  _.each(all_data["district"], function (row) {
    row["district"] = _.trim(row["district"]);
  });
  _.each(all_data["block"], function (row) {
    row["district"] = _.trim(row["district"]);
    row["block"] = _.trim(row["block"]);
  });
  set_user_details();
  url = g1.url.parse(location.href);
  if (!url.searchKey.compare1) {
    url.update({ compare1: user_district });
    window.history.pushState({}, "", url.toString());
  }
  render_analytics();
  $(".insights").template();
  $(".search-input").removeClass("d-flex").addClass("d-none");
});

function update_url(select) {
  if (select === "division") url.update({ compare1: user_division });
  else url.update({ block_dist: user_district });
}

$("body")
  .urlfilter({
    selector: ".urlfilter",
    target: "pushState",
  })
  .on("urlfilter", render_analytics);

$(document)
  .on("change", ".radio-select", function () {
    var select = $(this).val();
    url.update(
      { select: select, compare1: compare1, compare2: compare2 },
      "compare1=del&compare2=del"
    );
    update_url(select);
    window.history.pushState({}, "", url.toString());
    $.when($(".loading-icon").show()).then(render_analytics);
  })
  .on("change", ".radio-select1", function () {
    var select = $(this).val();
    url.update({ select: select, compare1: compare1 }, "compare1=del");
    update_url(select);
    window.history.pushState({}, "", url.toString());
    $.when($(".loading-icon").show()).then(render_analytics);
  })
  .on("click", ".analytics-pill", function () {
    var filter = $(this).attr("data-attr");
    url.update({ filter_type: filter });
    window.history.pushState({}, "", url.toString());
    render_accordion(filter);
  })
  .on("change", "#compare1", function () {
    url.update({ compare1: $(this).val() });
    window.history.pushState({}, "", url.toString());
    $.when($(".loading-icon").show()).then(render_analytics);
  })
  .on("change", "#compare2", function () {
    url.update({ compare2: $(this).val() });
    window.history.pushState({}, "", url.toString());
    $.when($(".loading-icon").show()).then(render_analytics);
  })
  .on("change", "#trend", function () {
    if (filter_type === "indicator") {
      var name = $(this).val();
      if (name === "Composite Score") {
        name = "Composite_Score";
      }
      url.update({ trend: name });
    } else {
      url.update({ trend: $(this).val().split(" ").join("_") });
    }
    window.history.pushState({}, "", url.toString());
    render_trend();
  })
  .on("change", "#district", function () {
    url.update({ compare1: $(this).val() });
    window.history.pushState({}, "", url.toString());
    $.when($(".loading-icon").show()).then(render_analytics);
  })
  .on("click", ".submit", render_analytics)
  .on("click", "#date-for", function () {
    $(".quarter p, .month, .year").unbind("click").removeAttr("id");
    $(".submit").attr("id", "submit-for");
    $("#analytics-container").hide();
    $("#cal").show();
    var month_selected = url.searchKey["from_month"];
    var quarter_selected = url.searchKey["from_quarter"];
    if (month_selected) {
      url.update({ from_month: null, to_month: null });
      $("." + month_selected).attr("id", "active");
    }
    if (quarter_selected) {
      url.update({ from_quarter: null, to_quarter: null });
      $("." + quarter_selected).attr("id", "active_q");
    }
    if (!month_selected && !quarter_selected) {
      if (selection === "month") {
        $("." + from_value).attr("id", "active");
      } else if (selection === "quarter") {
        $(".Q" + from_value).attr("id", "active_q");
      } else {
        $(".year").attr("id", "year_selected");
      }
    }
    $(".quarter p").click(function () {
      $(".quarter p, .month, .year").removeAttr("id");
      $(this).attr("id", "active_q");
    });
    $(".year").click(function () {
      $(".year").attr("id", "year_selected");
      $(".quarter p, .month").removeAttr("id");
    });
    $(".submit").unbind("click");
    $("#submit-for").click(function () {
      var month_value = $("#active").attr("data-attr");
      var quarter_value = $("#active_q").attr("data-attr");
      var year_value = $(".year").attr("data-attr").trim();
      is_error = false;
      if ($(".year").attr("id") == "year_selected") {
        if (selection == "year") {
          parseInt(year_value) > to_year
            ? show_error()
            : url.update({ from_year: year_value });
        } else {
          url.update({ from_year: year_value, to_year: defaults.year });
        }
      } else {
        if (month_value !== undefined) {
          year_value = $("#active").attr("data-year");
          if (selection == "month") {
            moment("01-" + month_value + "-" + year_value, "DD-MMM-YYYY") >
            moment(to_date)
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
          if (selection == "quarter") {
            moment(quarter_value + year_value, "QYYYY") >
            moment(to_value + to_year, "QYYYY")
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
        render_analytics();
      }
    });
  })
  .on("click", "#date-to", function () {
    $(".quarter p, .month, .year").unbind("click").removeAttr("id");
    $(".submit").attr("id", "submit-to");
    $("#analytics-container").hide();
    $("#cal").show();
    var month_selected = url.searchKey["to_month"];
    var quarter_selected = url.searchKey["to_quarter"];
    if (month_selected) {
      url.update({ from_month: null, to_month: null });
      $("." + month_selected).attr("id", "active");
    }
    if (quarter_selected) {
      url.update({ from_quarter: null, to_quarter: null });
      $("." + quarter_selected).attr("id", "active_q");
    }
    if (!month_selected && !quarter_selected) {
      if (selection === "month") {
        $("." + to_value).attr("id", "active");
      } else if (selection === "quarter") {
        $(".Q" + to_value).attr("id", "active_q");
      } else {
        $(".year").attr("id", "year_selected");
      }
    }
    $(".quarter p").click(function () {
      $(".quarter p, .month, .year").removeAttr("id");
      $(this).attr("id", "active_q");
    });
    $(".year").click(function () {
      $(".year").attr("id", "year_selected");
      $(".quarter p, .month").removeAttr("id");
    });
    $(".submit").unbind("click");
    $("#submit-to").click(function () {
      var month_value = $("#active").attr("data-attr");
      var quarter_value = $("#active_q").attr("data-attr");
      var year_value = $(".year").attr("data-attr");
      is_error = false;
      var cal_date, from_cal_date;
      if ($(".year").attr("id") == "year_selected") {
        if (selection == "year") {
          parseInt(year_value) < from_year
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
          if (selection == "month") {
            cal_date < moment(from_date)
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
          if (selection == "quarter") {
            cal_date < moment(from_value + from_year, "QYYYY")
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
        render_analytics();
      }
    });
  })
  .on("click", ".collapse-header", function () {
    if ($(this).find(".fa-minus").length > 0) {
      $(".fa-minus").removeClass("fa-minus").addClass("fa-plus");
    } else {
      $(".fa-minus").removeClass("fa-minus").addClass("fa-plus");
      $(this).find(".fa-plus").removeClass("fa-plus").addClass("fa-minus");
    }
  })
  .on("change", "#time-district-dropdown", function () {
    url.update({ block_dist: $(this).val() });
    url.update({ compare1: $("#district").val() }, "del");
    window.history.pushState({}, "", url.toString());
    $.when($(".loading-icon").show()).then(render_analytics);
  })
  .on("change", "#geo-district-dropdown", function () {
    url.update({ block_dist: $(this).val() });
    url.update(
      { compare1: $("#compare1").val(), compare2: $("#compare2").val() },
      "del"
    );
    window.history.pushState({}, "", url.toString());
    $.when($(".loading-icon").show()).then(render_analytics);
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

$(window).scroll(function () {
  if ($(window).scrollTop() > 100) {
    document.elementFromPoint(0, 0).click();
  }
});
