/* global swal, UI, defaults, data_map, get_indicators_list, division_district_map,
  merge_arrays, sort_list, indicator_mapping, user_data, get_latest_date */

var url,
  view,
  filter_type,
  parameter,
  indicator,
  table_selection,
  date,
  quarter,
  month,
  year,
  district,
  date_type,
  cards,
  indicator_list;
var sort_key = "asc",
  sort_col = "rank";
var latest_date = get_latest_date();

function render_deepdive() {
  url = g1.url.parse(location.href);
  $(".loading-icon").show();
  $("#indicator-top-bar").hide();
  $("#collapsemain").removeClass("show");
  $("#top-panel").addClass("collapsed");
  $("#deepdive-container").show();
  view = url.searchKey["card"] || defaults.view;
  filter_type = url.searchKey["filter_type"] || defaults.filter_type;
  parameter = defaults.parameter;
  indicator = url.searchKey["indicator"] || null;
  quarter = url.searchKey["quarter"];
  month = url.searchKey["month"];
  year = url.searchKey["year"];
  if (quarter) {
    date_type = "quarter";
    $("#for-date-label").text(quarter + $(".year").text());
  } else if (month) {
    date_type = "date";
    $("#for-date-label").text(month + " " + year);
  } else if (year) {
    date_type = "year";
    $("#for-date-label").text($(".year").text());
  } else {
    date_type = "date";
    month = defaults.month;
    year = defaults.year;
    $("#for-date-label").text(month + " " + year);
  }
  date = moment(year + "-" + month + "-" + "01", "YYYY-MMM-DD").format(
    "YYYY-MM-DD"
  );
  district = url.searchKey["district"];
  if (view === "table") {
    render_table();
  } else if (indicator !== null) {
    render_bars();
  } else {
    render_accordion();
  }

  // // If state user hide ES
  // if (!user_data.district && !user_data.division ) { $('#executive_nav').remove()}
  if (url.file == "deepdive_cm") {
    $(".footer_cm").removeClass("d-none");
  } else {
    $(".footer").removeClass("d-none");
  }

  $(".loading-icon").hide();
}

function render_accordion() {
  $(".table-switch, #for-table, #for-bars").hide();
  $(".loading-icon").show();
  $(".dropdown")
    .on("template", function () {
      var val =
        url.searchKey["district"] ||
        url.searchKey["division"] ||
        "Uttar Pradesh";
      $("#top-panel").text(val.slice(0, 25));
    })
    .template({
      overall: "Uttar Pradesh",
      data: division_district_map(),
      filter: "division",
      param: "district",
    });
  $("#for-accordion").show();

  var district = url.searchKey["district"];
  var division = url.searchKey["division"];
  var select = division ? "division" : district ? "district" : "overall";
  if (url.searchKey.card_toggle === "yes") filter_type = "type";
  var params = {};
  params[date_type] = url.searchKey[date_type] || date;
  if (date_type == "quarter") {
    params["quarter"] = url.searchKey.quarter[1];
    params["year"] = url.searchKey.year;
  }
  params["division"] = url.searchKey.division;
  params["district"] = district;
  params["_by"] = [filter_type, "indicator_id", "indicator", select];
  params["_c"] = ["perc_point|avg", "indicator_rank|max"];
  var data = UI.fetch_data(data_map[select][date_type], params);
  data = rename_keys(data, {
    "perc_point|avg": "perc_point",
    "indicator_rank|max": "indicator_rank",
  });
  var indicator_data = {};
  _.each(_.groupBy(data, filter_type), function (values, key) {
    var row_list = [];
    _.each(_.groupBy(values, "indicator"), function (scores, ind) {
      var row = {};
      row["id"] = scores[0]["indicator_id"];
      row["indicator"] = ind;
      row["rank"] = scores[0]["indicator_rank"];
      row["score"] = _.round(_.meanBy(scores, "perc_point"), 2);
      row_list.push(row);
    });
    indicator_data[key] = row_list;
  });
  $(".accordion").template({ data: indicator_data, district: district });
  $(".loading-icon").hide();
}

function rename_keys(array, keyMap) {
  var renamed_array = array.map(function (obj) {
    return _.mapKeys(obj, function (value, key) {
      return keyMap[key] || key;
    });
  });
  return renamed_array;
}

function render_bars() {
  $(".table-switch").hide();
  $(".loading-icon").show();
  $(".dropdown")
    .on("template", function () {
      var val =
        url.searchKey["district"] ||
        url.searchKey["division"] ||
        "Uttar Pradesh";
      $("#top-panel").text(val.slice(0, 25));
    })
    .template({
      overall: "Uttar Pradesh",
      data: division_district_map(),
      filter: "division",
      param: "district",
    });
  district = url.searchKey["district"] || "overall";
  var params = {};
  params[date_type] = url.searchKey[date_type] || date;
  if (date_type == "quarter") {
    params["quarter"] = url.searchKey.quarter[1];
    params["year"] = url.searchKey.year;
  }
  var select = district != "overall" ? "block" : "district";
  var perf_bars = get_bars_data(select);
  var bar_scale = d3
    .scaleLinear()
    .domain(
      d3.extent(perf_bars, function (d) {
        return d.per;
      })
    )
    .range([100, 300]);
  params["division"] = url.searchKey.division;
  params["_by"] = ["indicator_id", "indicator", select, filter_type];
  params["_c"] = ["perc_point|avg", "indicator_rank|max"];
  var data = UI.fetch_data(data_map[select][date_type], params);
  data = rename_keys(data, {
    "perc_point|avg": "perc_point",
    "indicator_rank|max": "indicator_rank",
  });
  cards = _.uniqBy(data, "indicator_id");
  indicator_list = _.groupBy(data, filter_type);
  var active_category = _.find(cards, { indicator_id: indicator });
  active_category =
    active_category !== undefined ? active_category[filter_type] : "";
  var bar_title = perf_bars.length
    ? perf_bars[0]["indicator"]
    : data["indicator"];
  var bars_data = {
    title: bar_title,
    scale: bar_scale,
    selection: district,
    categories: _.keys(indicator_list),
    perf_data: perf_bars,
  };
  $("#for-table").hide();
  $("#for-bars").show();
  $("#for-accordion").hide();
  $(".bars")
    .on("template", function () {
      var scale = d3.scaleLinear().domain([0, 100]).range([20, 100]);
      _.each($(".perf_bar"), function (d) {
        $(d).attr(
          "style",
          "width:" + scale(parseFloat($(d).attr("width"))) + "% !important"
        );
      });
      $("#bar-dropdown").val(active_category.split("_").join(" "));
    })
    .template({ data: bars_data });
  $(".loading-icon").hide();
}

function get_bars_data(select) {
  var params = {
    indicator_id: url.searchKey["indicator"],
  };
  params[date_type] = url.searchKey[date_type] || date;
  if (date_type == "quarter") {
    params["quarter"] = url.searchKey.quarter[1];
    params["year"] = url.searchKey.year;
  }
  params["division"] = url.searchKey.division;
  if (select == "block") params["district"] = url.searchKey.district;
  params["_by"] = ["indicator_id", "indicator", select];
  params["_c"] = ["perc_point|avg"];
  var data = UI.fetch_data(data_map[select][date_type], params);
  var keyMap = { "perc_point|avg": "per" };
  keyMap[select] = "name";
  data = rename_keys(data, keyMap);
  data = _.orderBy(data, "per", "desc");
  data = _.each(data, function (d, i) {
    i += 1;
    d.rank = i;
  });
  data = _.concat(
    _.slice(data, 0, 5),
    _.slice(data, data.length - 5, data.length)
  );
  return data;
}

function get_indicator_type(indicator) {
  return _.find(indicator_mapping, { indicator_name: indicator })
    .positive_negative;
}

function render_table() {
  if (
    (user_data.user == "CM_Office1" || url.file == "deepdive_cm") &&
    url.searchKey["indicator"] == undefined
  ) {
    url.update({
      indicator:
        "% of pregnant women delivered in institution against estimated delivery",
    });
    window.history.pushState({}, "", url.toString());
  }
  var overall = url.file == "deepdive" ? "Composite Score" : "ANC Registered";
  if (user_data.user == "CM_Office1" || url.file == "deepdive_cm") {
    overall = "INSTITUTIONAL DELIVERY RATE";
  }
  $(".loading-icon").show();
  var select = url.searchKey["select"];
  $("#for-table").show();
  $("#for-bars, #for-accordion").hide();
  $(".dropdown")
    .on("template", function () {
      if (user_data.user != "CM_Office1" && url.file != "deepdive_cm") {
        var val =
          url.searchKey["indicator"] ||
          (url.file == "deepdive"
            ? "Composite Score"
            : "% ANC registered in First trimester");
        var short_name = _.find(indicator_mapping, {
          indicator_name: val,
        }).short_name;
        $("#top-panel").text(short_name.slice(0, 25));
      } else {
        val =
          url.searchKey["indicator"] ||
          "% of pregnant women delivered in institution against estimated delivery";
        short_name = _.find(indicator_mapping, {
          indicator_name: val,
        }).short_name;
        $("#top-panel").text(short_name.slice(0, 25));
      }
      if (url.searchKey[select] !== undefined) {
        $("#top-dropdown").hide();
        $("#name").text(url.searchKey[select]);
        $("#indicator-top-bar").show();
      }
      let url_rel_path = url.relative;
      $("#deepdive_url").attr("href", url_rel_path);
      // $(".indicator-dropdown-value").addClass("active");
      $(`a.indicator-dropdown-value[data-value="${url_indicator}"]`).addClass(
        "active"
      );
    })
    .template({
      indicator: true,
      overall: overall, // if use alpha else first indicator
      data: get_indicators_list(),
      filter: "type",
      param: "indicator",
    });
  var year_text = $(".year").text();
  if (url.searchKey.month !== "") {
    table_selection = "month";
    $("#for-date-label").text(month + " " + year);
  } else if (
    url.searchKey.month === undefined &&
    url.searchKey.quarter === undefined
  ) {
    table_selection = "year";
    $("#for-date-label").text(year_text);
  } else if (
    url.searchKey.quarter !== undefined &&
    url.searchKey.quarter !== ""
  ) {
    table_selection = "quarter";
    $("#for-date-label").text(quarter + " " + year_text);
  } else {
    table_selection = "year";
    $("#for-date-label").text(year_text);
  }

  url = g1.url.parse(location.href);
  var url_indicator =
    url.searchKey["indicator"] ||
    (url.file == "deepdive"
      ? "composite_score"
      : "% ANC registered in First trimester");
  var indicator_np = _.find(indicator_mapping, {
    indicator_name: url_indicator,
  }).positive_negative;
  var color_scale =
    indicator_np == "positive"
      ? d3.scaleLinear().domain([0, 0.5, 1]).range(["red", "white", "green"])
      : d3.scaleLinear().domain([0, 0.5, 1]).range(["green", "white", "red"]);

  // var color_scale = d3.scaleLinear().domain([0, 0.5, 1]).range(['red', 'white', 'green'])
  var table_quarter =
    table_selection == "quarter" ? quarter[1] : moment(date).fquarter().quarter;
  var table_year = get_fiscal_year(date);
  var params = {};
  parameter = url.file == "deepdive" ? "composite_index" : "perc_point";
  if (url.searchKey["indicator"] !== undefined) {
    parameter = "perc_point";
    params["indicator"] = url.searchKey["indicator"];
    color_scale.domain([0, 50, 100]);
  }

  sort_key = url.searchKey["sort_key"] || defaults.sort_key || "asc";

  // console.log(sort_key)
  // sort_key = [sort_key, "name"];

  // var group = ['division', 'div_map_id']
  // var table_division_data = get_table_data('division', group, parameter, table_year, table_quarter, date, 'div_map_id',table_selection)
  // group = ['division', 'district', 'div_map_id', 'district_id']
  // var table_district_data = get_table_data('district', group, parameter, table_year, table_quarter, date, 'district_id',table_selection)
  // group = ['division', 'district', 'district_id', 'block', 'block_id']
  // var table_block_data = get_table_data('block', group, parameter, table_year, table_quarter, date, 'block_id',table_selection)
  // var division_domain = get_domain_values(table_division_data)
  // var district_domain = get_domain_values(table_district_data)
  // var block_domain = get_domain_values(table_block_data)
  // var district_block_domain = get_block_domain_values(table_block_data)

  $(".table-switch").show();
  if (select === undefined) {
    // var group, level = url.searchKey.level
    let usr_div = user_data.division;
    let usr_dist = user_data.district;
    var group,
      level = url.searchKey["level"] || "district";
    if (!url.searchKey["level"] && usr_div) {
      level = "division";
    }
    if (level == "division") {
      group = ["division", "div_map_id"];
      var table_division_data = get_table_data(
        "division",
        group,
        parameter,
        table_year,
        table_quarter,
        date,
        "div_map_id",
        table_selection
      );
    }
    group = ["division", "district", "div_map_id", "district_id"];
    var table_district_data = get_table_data(
      "district",
      group,
      parameter,
      table_year,
      table_quarter,
      date,
      "district_id",
      table_selection
    );
    group = ["district", "district_id", "block", "block_id"];
    var table_block_data = get_table_data(
      "block",
      group,
      parameter,
      table_year,
      table_quarter,
      date,
      "block_id",
      table_selection
    );

    var up_avg = {},
      cols = [
        "monthly",
        "quarterly",
        "fin_year",
        "monthly_score",
        "quarterly_score",
        "fy_score",
      ];
    // if(user_data.user == 'CM_Office1')
    //   cols = cols.concat(data_map['sub-indicators'][url.searchKey.indicator_id])

    up_avg["name"] = defaults.state_name;
    up_avg["id"] = defaults.state_name;
    up_avg["rank"] = "";
    up_avg["next"] = false;

    _.times(cols.length, function (i) {
      up_avg[cols[i]] = _.round(_.meanBy(table_district_data, cols[i]), 2);
    });

    var division_domain = get_domain_values(table_division_data);
    var district_domain = get_domain_values(table_district_data);
    var block_domain = get_domain_values(table_block_data);
    var district_block_domain = get_block_domain_values(table_block_data);
    table_block_data = _.sortBy(table_block_data, ["rank", "name"]);
    table_district_data = _.sortBy(table_district_data, ["rank", "name"]);

    // var level = url.searchKey['level'] || 'district'
    if (level === "district") {
      $("#level").prop("checked", true);
      table_district_data = _.orderBy(table_district_data, sort_col, sort_key);
      $(".table")
        .on("template", function () {
          $(".table").off();
          _.each($(".color-cell"), function (d) {
            var domain_max = parseFloat($(d).attr("domain-attr"));
            var domain_min = parseFloat($(d).attr("domain-attr_min"))
              ? parseFloat($(d).attr("domain-attr_min"))
              : 0;
            color_scale.domain([
              domain_min,
              (domain_min + domain_max) / 2,
              domain_max,
            ]);
            if ($(d).attr("value") != 0) {
              $(d).css("background-color", color_scale($(d).attr("value")));
            }
          });
          $("#for-table").show();
          $(".loading-icon").hide();
          if (usr_dist) {
            let dist_name = usr_dist.trim();
            $('.district-name[data-attr="' + dist_name + '"]').addClass(
              "selected-name"
            );
          }
        })
        .template({
          selection: table_selection,
          type: "district",
          level_one_data: [up_avg].concat(table_district_data), //table_district_data,
          user_name: user_data.user,
          level_two_data: _.groupBy(table_block_data, "district"),
          level_one_domain: district_domain,
          level_two_domain: block_domain,
          district_block_domain: district_block_domain,
        });
    } else {
      table_division_data = _.orderBy(table_division_data, sort_col, sort_key);

      $(".table")
        .on("template", function () {
          $(".table").off();
          _.each($(".color-cell"), function (d) {
            var domain_max = parseFloat($(d).attr("domain-attr"));
            var domain_min = parseFloat($(d).attr("domain-attr_min"))
              ? parseFloat($(d).attr("domain-attr_min"))
              : 0;
            color_scale.domain([
              domain_min,
              (domain_min + domain_max) / 2,
              domain_max,
            ]);
            if ($(d).attr("value") != 0) {
              $(d).css("background-color", color_scale($(d).attr("value")));
            }
          });
          $("#for-table").show();
          $(".loading-icon").hide();
          if (usr_div) {
            let div_name = usr_div.trim();
            $('.division-name[data-attr="' + div_name + '"]')
              .removeClass("bg-table-clr3")
              .addClass("selected-name");
          }
        })
        .template({
          selection: table_selection,
          type: "division",
          level_one_data: [up_avg].concat(table_division_data), //table_division_data,
          user_name: user_data.user,
          level_two_data: _.groupBy(table_district_data, "division"),
          level_three_data: _.groupBy(table_block_data, "district"),
          level_one_domain: division_domain,
          level_two_domain: district_domain,
          level_three_domain: block_domain,
          district_block_domain: district_block_domain,
        });
    }
  } else {
    $(".table-switch").hide();
    params = {};
    var table_data = {},
      year_arr,
      quarter_arr,
      date_arr;
    params[select] = url.searchKey[select];
    params["_by"] = [select, "indicator"];
    params["_c"] = "perc_point|avg";
    params["year"] = table_year;

    // if block, also add district as additional filter to ensure district specific block is fetched  (duplicate block fix)
    if (select == "block") {
      params["district"] = url.searchKey["parent_district"];
    }

    var ind_fetch =
      user_data.user == "CM_Office1" || url.file == "deepdive_cm"
        ? select + "_cm"
        : url.file == "deepdive"
        ? select
        : select + "_niti";

    if (table_selection == "month") {
      table_data["year"] = UI.fetch_data(data_map[ind_fetch]["year"], params);
      params["date"] = date;
      table_data["date"] = UI.fetch_data(data_map[ind_fetch]["date"], params);
      table_data["quarter"] = [];
    }
    if (table_selection == "year") {
      table_data["year"] = UI.fetch_data(data_map[ind_fetch]["year"], params);
      table_data["date"] = [];
      table_data["quarter"] = [];
    }
    if (table_selection == "quarter") {
      table_data["year"] = UI.fetch_data(data_map[ind_fetch]["year"], params);
      params["quarter"] = quarter[1];
      table_data["quarter"] = UI.fetch_data(
        data_map[ind_fetch]["quarter"],
        params
      );
      table_data["date"] = [];
    }

    // table_data['year'] = UI.fetch_data(data_map[ind_fetch]['year'], params)
    // params['quarter'] = table_quarter
    // table_data['quarter'] = UI.fetch_data(data_map[ind_fetch]['quarter'], params)
    // params['date'] = date
    // table_data['date'] = UI.fetch_data(data_map[ind_fetch]['date'], params)

    year_arr = rename_keys(table_data["year"], {
      "perc_point|avg": "fin_year",
    });
    quarter_arr = rename_keys(table_data["quarter"], {
      "perc_point|avg": "quarterly",
    });
    date_arr = rename_keys(table_data["date"], { "perc_point|avg": "monthly" });

    // if block, remove district as additional filter (duplicate block fix)
    if (select == "block") {
      params["district"] = "";
    }

    params[select] = "";
    params["_by"] = "indicator";
    params["_c"] = ["perc_point|avg", "perc_point|max", "perc_point|min"];
    if (table_selection == "quarter") params["date"] = null;
    if (table_selection == "year") {
      (params["date"] = null), (params["quarter"] = null);
    }

    if (user_data.user != "CM_Office1" && url.file != "deepdive_cm") {
      var niti_or_not_dist =
        url.file == "deepdive" ? "district" : "district_niti";
      var niti_or_not_block = url.file == "deepdive" ? "block" : "block_niti";
      var district_avg = UI.fetch_data(
        data_map[niti_or_not_dist][table_selection],
        params
      );
      var block_avg = UI.fetch_data(
        data_map[niti_or_not_block][table_selection],
        params
      );
    } else {
      district_avg = UI.fetch_data(
        data_map["district_cm"][table_selection],
        params
      );
      block_avg = UI.fetch_data(data_map["block_cm"][table_selection], params);
    }
    var table_avg = _.unionBy(district_avg, block_avg, "indicator");
    table_avg = rename_keys(table_avg, {
      "perc_point|min": "avg_min",
      "perc_point|max": "avg_max",
    });
    params["_c"] = ["perc_point|max", "perc_point|min"];
    if (select == "division") {
      params["_by"] = ["indicator", select];
      params["_c"] = ["perc_point|avg"];
    }
    if (select == "block") params["district"] = url.searchKey.district;
    var table_max = UI.fetch_data(data_map[ind_fetch][table_selection], params);
    if (select == "division") {
      var division_max = [];
      _.each(_.groupBy(table_max, "indicator"), function (rows, key) {
        var max_row = _.maxBy(rows, "perc_point|avg");
        var min_row = _.minBy(rows, "perc_point|avg");
        division_max.push({
          indicator: key,
          division:
            get_indicator_type(key) == "negative"
              ? min_row["division"]
              : max_row["division"],
          "perc_point|max": max_row["perc_point|avg"],
          "perc_point|min": min_row["perc_point|avg"],
        });
      });
      table_max = division_max;
    }
    table_data["max_avg"] = merge_arrays(table_max, table_avg, "indicator");
    var max_avg = rename_keys(table_data["max_avg"], {
      "perc_point|max": "max",
      "perc_point|avg": "avg",
      "perc_point|min": "min",
    });
    (params["date"] = null), (params["quarter"] = null);
    params["_c"] = ["perc_point|max", "perc_point|min"];
    var fy_max = UI.fetch_data(data_map[ind_fetch]["year"], params);
    fy_max = rename_keys(fy_max, {
      "perc_point|max": "fy_max",
      "perc_point|min": "fy_min",
    });
    var table_indicator_data = merge_arrays(year_arr, quarter_arr, "indicator");
    // Changed the order of merge (month, year) to get all records
    table_indicator_data = merge_arrays(
      table_indicator_data,
      date_arr,
      "indicator"
    );
    table_indicator_data = merge_arrays(
      table_indicator_data,
      max_avg,
      "indicator"
    );
    table_indicator_data = merge_arrays(
      table_indicator_data,
      fy_max,
      "indicator"
    );
    table_indicator_data = rename_keys(table_indicator_data, {
      indicator: "name",
    });
    _.each(table_indicator_data, function (row) {
      row["ind_max"] = row.max;
    });

    // Identify missing indicators and adds empty records
    let type_ind = _.includes(["", undefined], url.searchKey.block)
      ? "district"
      : "block";
    var all_indicators = _.map(
      _.filter(indicator_mapping, function (i) {
        return _.includes([type_ind, "dist_block"], i.type_ind);
      }),
      "indicator_name"
    );
    var table_indicators = _.map(table_indicator_data, "name");
    var missing_indicators = _.filter(all_indicators, function (i) {
      return !_.includes(table_indicators, i);
    });

    _.each(missing_indicators, function (mi) {
      let t_avg = _.find(table_avg, { indicator: mi });
      let t_max = _.find(table_max, { indicator: mi });
      table_indicator_data.push({
        name: mi,
        avg: t_avg ? t_avg["perc_point|avg"] : t_avg,
        max: t_max ? t_max["perc_point|max"] : t_max,
        avg_max: t_avg ? t_avg["avg_max"] : t_avg,
        avg_min: t_avg ? t_avg["avg_min"] : t_avg,
        ind_max: t_max ? t_max["perc_point|max"] : t_max,
        min: t_max ? t_max["perc_point|min"] : t_max,
      });
    });

    $(".table")
      .on("template", function () {
        $(".table").off();
        _.each($(".color-cell"), function (d) {
          var domain_max = parseFloat($(d).attr("domain-attr"));
          var domain_min = parseFloat($(d).attr("domain-attr_min"))
            ? parseFloat($(d).attr("domain-attr_min"))
            : 0;
          color_scale.domain([
            domain_min,
            (domain_min + domain_max) / 2,
            domain_max,
          ]);
          var indicator_np = $(d).attr("indicator_sign");
          indicator_np == "positive"
            ? color_scale.range(["red", "white", "green"])
            : color_scale.range(["green", "white", "red"]);
          if ($(d).attr("value") != 0) {
            $(d).css("background-color", color_scale($(d).attr("value")));
          }
        });
        $("#for-table").show();
        $(".loading-icon").hide();
      })
      .template({
        selection: table_selection,
        type: "indicator",
        user_name: user_data.user,
        indicator_data: sort_list(table_indicator_data, "name"),
        mapping: indicator_mapping,
        month: moment(date).subtract(1, "month").format("MMM"),
      });
  }
  $(".loading-icon").hide();
}

function get_domain_values(array) {
  return {
    monthly: _.maxBy(array, "monthly"),
    quarterly: _.maxBy(array, "quarterly"),
    fin_year: _.maxBy(array, "fin_year"),
    monthly_min: _.minBy(array, "monthly"),
    quarterly_min: _.minBy(array, "quarterly"),
    fin_year_min: _.minBy(array, "fin_year"),
  };
}

function get_block_domain_values(array) {
  // computes max and min domains for every district for block data

  var grouped_blocks = _.groupBy(array, "district");
  var big_dict = {};
  _.each(grouped_blocks, function (item) {
    // big_dict['Agra'] = {'monthly': max_obj}
    big_dict[item[0].district] = {
      monthly: _.maxBy(item, "monthly"),
      quarterly: _.maxBy(item, "quarterly"),
      fin_year: _.maxBy(item, "fin_year"),
      monthly_min: _.minBy(item, "monthly"),
      quarterly_min: _.minBy(item, "quarterly"),
      fin_year_min: _.minBy(item, "fin_year"),
    };
  });
  return big_dict;
}

function get_table_data(
  type,
  group,
  parameter,
  year,
  quarter,
  date,
  merge_key,
  sel_period
) {
  var params = {},
    table_data = {};
  var val = url.searchKey["val"] || "type";
  var name =
    url.searchKey[val] ||
    (url.file == "deepdive"
      ? "composite_score"
      : "% ANC registered in First trimester");
  var rank_map = { month: "monthly", quarter: "quarterly", year: "fin_year" };
  var ind_fetch =
    user_data.user == "CM_Office1" || url.file == "deepdive_cm"
      ? type + "_cm"
      : url.file == "deepdive"
      ? type
      : type + "_niti";
  if (
    name !==
    (url.file == "deepdive"
      ? "composite_score"
      : "% ANC registered in First trimester")
  ) {
    params[val] = name;
  }
  // params['indicator'] = url.searchKey['indicator'] || ((url.file == 'deepdive')?'composite_score':'% ANC registered in First trimester')
  params["indicator"] =
    url.file == "deepdive"
      ? url.searchKey["indicator"]
      : url.searchKey["indicator"] || "% ANC registered in First trimester";
  params["year"] = year;
  params["_by"] = group;
  params["_c"] = parameter + "|avg";

  // table_data['year'] = UI.fetch_data(data_map[ind_fetch]['year'], params)
  // params['quarter'] = quarter
  // table_data['quarter'] = UI.fetch_data(data_map[ind_fetch]['quarter'], params)
  // params['date'] = date
  // table_data['date'] = UI.fetch_data(data_map[ind_fetch]['date'], params)
  if (sel_period == "month") {
    table_data["year"] = UI.fetch_data(data_map[ind_fetch]["year"], params);
    params["date"] = date;
    table_data["date"] = UI.fetch_data(data_map[ind_fetch]["date"], params);
    // if(date <= defaults.date){
    // }else{
    //   table_data['date'] = []
    // }
    table_data["quarter"] = [];
  }
  if (sel_period == "year") {
    table_data["year"] = UI.fetch_data(data_map[ind_fetch]["year"], params);
    table_data["date"] = [];
    table_data["quarter"] = [];
  }
  if (sel_period == "quarter") {
    table_data["year"] = UI.fetch_data(data_map[ind_fetch]["year"], params);
    params["quarter"] = quarter;
    table_data["quarter"] = UI.fetch_data(
      data_map[ind_fetch]["quarter"],
      params
    );
    // if(parseInt(quarter) <= moment(defaults.date).fquarter().quarter){
    // }
    // else{
    //   table_data['quarter'] = []
    // }
    table_data["date"] = [];
  }
  var keyMap = {};
  keyMap[parameter + "|avg"] = "fin_year";
  var year_arr = rename_keys(table_data["year"], keyMap);
  keyMap[parameter + "|avg"] = "quarterly";
  var quarter_arr = rename_keys(table_data["quarter"], keyMap);
  keyMap[parameter + "|avg"] = "monthly";
  var date_arr = rename_keys(table_data["date"], keyMap);
  // Changed the order of merge (month, year) to get all records
  var data = merge_arrays(year_arr, date_arr, merge_key);
  data = merge_arrays(data, quarter_arr, merge_key);
  (keyMap[type] = "name"), (keyMap[merge_key] = "id");
  data = rename_keys(data, keyMap);
  if (type === "block") {
    var ranked_data = [];
    _.each(_.groupBy(data, "district_id"), function (values) {
      var dist_data = add_ranks(values, rank_map[table_selection], false);
      ranked_data = ranked_data.concat(dist_data);
    });
    return ranked_data;
  }
  data = add_ranks(data, rank_map[table_selection], true);
  return data;
}

function get_fiscal_year(date) {
  var month_num = parseInt(moment(date).format("MM"));
  var year = parseInt(moment(date).format("YYYY"));
  if (month_num > 3) return year + 1;
  return year;
}

/* Add rank based on key */
function add_ranks(arr, key, next) {
  url = g1.url.parse(location.href);
  var url_indicator =
    url.searchKey["indicator"] ||
    (url.file == "deepdive"
      ? "composite_score"
      : "% ANC registered in First trimester");
  var indicator_np = _.find(indicator_mapping, {
    indicator_name: url_indicator,
  }).positive_negative;

  arr = _.filter(arr, function (d) {
    return d[key] != 0;
  });
  arr =
    indicator_np == "positive"
      ? _.reverse(_.sortBy(arr, key))
      : _.sortBy(arr, key);

  var counter = 0;
  var default_val = -1;
  arr.forEach(function (row) {
    if (row[key] && (row[key] || indicator_np == "negative")) {
      if (
        url_indicator ==
          (url.file == "deepdive"
            ? "composite_score"
            : "% ANC registered in First trimester") ||
        default_val != row[key]
      ) {
        counter += 1;
      }
      default_val = row[key];
      row["rank"] = counter;
    } else row["rank"] = "-";
    row["next"] = next;
  });
  return arr;
}

$(function () {
  render_deepdive();
  $(".insights").template();
  $(".data_last_updated").html("Data last updated on " + latest_date);
});

$("body")
  .urlfilter({
    selector: ".urlfilter",
    target: "pushState",
  })
  .on("urlfilter", render_deepdive);

$(document)
  .on("click", ".ind-name", function () {
    url.update({ indicator: $(this).attr("id") });
    window.history.pushState({}, "", url.toString());
    render_deepdive();
  })
  .on("click", ".division-name", function () {
    $(".loading-icon").show();
    url.update({ select: "division", division: $(this).attr("data-attr") });
    window.history.pushState({}, "", url.toString());
    setTimeout(render_table, 1000);
  })
  .on("click", ".district-name", function () {
    $(".loading-icon").show();
    url.update({ select: "district", district: $(this).attr("data-attr") });
    window.history.pushState({}, "", url.toString());
    setTimeout(render_table, 1000);
  })
  .on("click", ".block-name", function () {
    $(".loading-icon").show();
    var parent_district = $(this)
      .closest('div[data-parent="#level-one"]')
      .attr("id");
    parent_district =
      parent_district.charAt(0).toUpperCase() +
      parent_district.substr(1).toLowerCase();
    url.update({
      select: "block",
      block: $(this).attr("data-attr"),
      parent_district: parent_district,
    });
    window.history.pushState({}, "", url.toString());
    setTimeout(render_table, 1000);
  })
  .on("click", "#top-panel", function () {
    if ($("#deepdive-container").css("display") === "none") {
      $("#deepdive-container").show();
    } else {
      $("#deepdive-container").hide();
    }
  })
  .on("change", "#level", function () {
    var val = $(this).prop("checked") ? "district" : "division";
    url.update({ level: val });
    window.history.pushState({}, "", url.toString());
    $.when($(".loading-icon").show()).then(render_table);
    UI.render_nav_bar(); // Refresh nav-bar template to refresh search function
  })
  .on("click", ".back-button", function () {
    url = g1.url.parse(location.href);
    $(".loading-icon").show();
    url.update({ division: null, district: null, select: null, block: null });
    window.history.pushState({}, "", url.toString());
    setTimeout(render_deepdive, 1000);
  })
  .on("click", "#expand-all", function () {
    var val = $(this).attr("data-attr");
    if (val === "expand") {
      $(".collapse-title").removeClass("collapsed");
      $(".collapse-body").addClass("show");
      $("#expand-all").attr("data-attr", "collapse");
      $("#expand-all").text("collapse all");
    } else {
      $(".collapse-title").addClass("collapsed");
      $(".collapse-body").removeClass("show");
      $("#expand-all").attr("data-attr", "expand");
      $("#expand-all").text("expand all");
    }
  })
  .on("change", "#bar-dropdown", function () {
    var this_category = $(this).val().split(" ").join("_");
    url.update({ indicator: indicator_list[this_category][0]["indicator_id"] });
    window.history.pushState({}, "", url.toString());
    render_deepdive();
  })
  .on("click", ".next-card", function () {
    var next_card = _.findIndex(cards, { indicator_id: indicator }) + 1;
    if (next_card < cards.length) {
      url.update({ indicator: cards[next_card]["indicator_id"] });
      window.history.pushState({}, "", url.toString());
      render_deepdive();
    }
  })
  .on("click", ".prev-card", function () {
    var prev_card = _.findIndex(cards, { indicator_id: indicator }) - 1;
    if (prev_card >= 0) {
      url.update({ indicator: cards[prev_card]["indicator_id"] });
      window.history.pushState({}, "", url.toString());
      render_deepdive();
    }
  })
  .on("click", ".submit", function () {
    $.when($(".loading-icon").show()).then(function () {
      render_deepdive();
    });
  })
  .on("click", ".dropdown-default", function () {
    url.update({ indicator: null, division: null, district: null });
    window.history.pushState({}, "", url.toString());
    $.when($(".loading-icon").show()).then(render_deepdive);
  })
  .on("click", ".dropdown-arrow", function (event) {
    event.stopPropagation();
    var selected = url.searchKey["indicator"];
    if (selected !== undefined && url.searchKey.type !== undefined) {
      url.update({ indicator: selected }, "indicator=del");
    }
    selected = url.searchKey["district"];
    if (selected !== undefined) {
      url.update({ district: selected }, "district=del");
    }
    var row = {};
    var key = $(this).attr("data-param");
    row[key] = $(this).attr("data-value");
    url.update(row);
    window.history.pushState({}, "", url.toString());
    $.when($(".loading-icon").show()).then(render_deepdive);
  })
  .on("click", ".dropdown-value", function () {
    var key = $(this).attr("data-param");
    var row = {};
    row[key] = $(this).attr("data-value");
    key = $(this).attr("parent-param");
    row[key] = $(this).attr("parent-value");
    url.update(row);
    window.history.pushState({}, "", url.toString());
    $.when($(".loading-icon").show()).then(render_deepdive);
  })
  .on("click", ".indicator-dropdown-value", function () {
    url.update({ indicator: $(this).attr("data-value") });
    window.history.pushState({}, "", url.toString());
    $.when($(".loading-icon").show()).then(render_deepdive);
  })
  .on("click", ".col-sort", function () {
    sort_col = $(this).data("attr");
    sort_key = sort_key == "asc" ? "desc" : "asc";
    $.when($(".loading-icon").show()).then(render_table);
    url.update({ sort_key: sort_key });
    window.history.pushState({}, "", url.toString());
  })
  .on("click", ".level-one .fa-plus", function () {
    $(".level-one .fa-minus").removeClass("fa-minus").addClass("fa-plus");
    $(this).removeClass("fa-plus").addClass("fa-minus");
  })
  .on("click", ".level-one .fa-minus", function () {
    $(this).removeClass("fa-minus").addClass("fa-plus");
  })
  .on("click", ".level-two .fa-plus", function () {
    var parent_name = $(this).attr("parent-attr");
    $("#" + parent_name + " .fa-minus")
      .removeClass("fa-minus")
      .addClass("fa-plus");
    $(this).removeClass("fa-plus").addClass("fa-minus");
  })
  .on("click", ".level-two .fa-minus", function () {
    $(this).removeClass("fa-minus").addClass("fa-plus");
  })
  .on("click", "i.p-2.fa.text-primary.fa-plus", function () {
    var url_indicator =
      url.searchKey["indicator"] ||
      (url.file == "deepdive"
        ? "composite_score"
        : "% ANC registered in First trimester");
    var indicator_dist = _.find(indicator_mapping, {
      indicator_name: url_indicator,
    }).type_ind;
    if (indicator_dist == "district" && $(this).data("attr") == "district")
      swal(
        "",
        "This is a district level indicator. Data is not available at block level!",
        "info"
      );
  })
  .on("click", "#icon", function () {
    $("#myInput1").show();
  })
  .on("click", "#close_nav", function () {
    $("#myInput1").hide();
    document.getElementById("myInput").value = "";
    $("#myUL").hide();
  })
  .on("click", ".ui-autocomplete li", function () {
    var ele = $(this).find(".ui-menu-item-wrapper").html().trim().toLowerCase();
    ele = ele.split(" ").join("_");
    // var target = $('.deepdive-table [href="#'+ele+'"]')
    // target.find('i').click()
    $('.deepdive-table [data-val="' + ele + '"]').click();

    $("#myInput1").hide();
    document.getElementById("myInput").value = "";
    $("#myUL").hide();
  });
