/* global g1, UI, user_info, defaults, indicator_mapping, data_map, district_name_mapping,redraw_table_view,
download_map, convert_date,get_fin_year,set_table_selection,get_selected_date,
get_domain_values,get_block_domain_values,rendering_indicator_template,common_district_template,format_data*/
// set_user_details,
/* exported render_table, render_indicator_table*/

var url, sort_key, table_config, table_selection, date, ind_type;
// user_district, user_division
url = g1.url.parse(location.href);
var area_blk;
var _def_inds = {
  amethi_table: "aggregate_score",
};

if (url.file == "amethi_table") {
  $(".search-input").hide();
  $(".fa-home").css("color", "white");
}

function calculate_percent(area_blk, url) {
  var area_bulk = {};
  _.map(area_blk, function (obj, key) {
    var x = _.map(obj, function (b) {
      if (
        url.searchKey.indicator == undefined ||
        url.searchKey.indicator === "aggregate_score"
      ) {
        b.score = (b.score / (b["weightage"] * 100)) * 100 * 100;
        b.score = numeral(b.score).format("0,0.0");
      } else {
        let mapping = _.find(indicator_mapping, {
          indicator_name: url.searchKey["indicator"],
        });
        if (mapping !== undefined) {
          if (mapping["unit"] === "%") {
            b.score = b.score * 100;
            b.score = numeral(b.score).format(
              mapping.decimal == undefined ? "0,0.0" : mapping.decimal
            );
          }
        }
      }
      return b;
    });
    area_bulk[key] = x;
  });
  return area_bulk;
}

function group_by_date(area_blk, id) {
  _.each(area_blk, function (row) {
    row["date"] = convert_date(row["date"], table_selection);
  });
  area_blk = _.groupBy(area_blk, id);
  return area_blk;
}

function render_table() {
  $(".year").parent().removeClass("cursor-pointer");
  $(".quarter").parent().removeClass("cursor-pointer");
  $(".loading-icon").show();
  url = g1.url.parse(location.href);
  var month = url.searchKey["month"];
  var quarter = url.searchKey["quarter"];
  var year = url.searchKey["year"] || defaults.year;
  table_selection = set_table_selection();
  date = get_selected_date(table_selection, month, quarter, year, defaults);
  var val = url.searchKey["val"] || defaults.val;
  var name = url.searchKey[val] || defaults.name;
  var select = url.searchKey["select"] || "defaults.level";
  var selected_name = url.searchKey[select] || "";
  var level = url.searchKey["level"] || defaults.level;
  var url_indicator = url.searchKey["indicator"] || _def_inds[url.file]; //(url.file == 'table' ? 'composite_score' : '% ANC registered in First trimester')
  var indicator_np = _.find(indicator_mapping, {
    indicator_name: url_indicator,
  }).positive_negative;
  var color_scale =
    indicator_np == "positive"
      ? d3.scaleLinear().range(["red", "white", "green"])
      : d3.scaleLinear().range(["green", "white", "red"]);
  var _ind = _def_inds[url.file]; //url.file == 'table' ? 'composite_score' : '% ANC registered in First trimester'
  name == _ind
    ? color_scale.domain([0, 0.5, 1])
    : color_scale.domain([0, 50, 100]);
  sort_key = url.searchKey["sort_key"] || defaults.sort_key;
  var date_format;
  var parsetime, display_values;
  if (table_selection === "month") {
    date_format = "MMM YY";
    parsetime = d3.timeParse("%b %y");
    display_values = [
      table_config.rank,
      table_config.pre_rank,
      table_config.month,
      table_config.pre_month,
      table_config.trend,
    ];
    $("#date-label").text(moment(date).format("MMM YYYY"));
  }
  $(".trend").empty();
  if (table_selection == "month")
    var from_date = moment(date).subtract(5, "month").format("YYYY-MM-DD");
  const params = {
    to_date: date,
    from_date: from_date,
  };
  const ajax_url_trend =
    name === "aggregate_score" || name === undefined
      ? "district_amethi_line_chart"
      : "block_amethi_line_chart";
  params["indicator"] = url_indicator;
  area_blk = UI.fetch_data(ajax_url_trend, params);
  area_blk = group_by_date(area_blk, "block_id");
  if (_.isEmpty(area_blk)) {
    $(".no_data_show").removeClass("d-none");
    $(
      ".amethi_left_table,.loading-icon,.indicator-table-container,#dropdownMenuButton"
    ).hide();
    return false;
  } else {
    $(".no_data_show").addClass("d-none");
    $(
      ".amethi_left_table,.loading-icon,.indicator-table-container,#dropdownMenuButton"
    ).show();
  }
  area_blk = calculate_percent(area_blk, url);
  var amethi_district_map = { StsLkYw1G0m: [] };
  if (name === "aggregate_score" || name === undefined) {
    var amethi_aggregate = UI.fetch_data(
      "district_amethi_agg_line_chart",
      params
    );
  } else {
    let new_params = jQuery.extend(true, {}, params);
    new_params[select] = selected_name;
    amethi_aggregate = UI.fetch_data(
      "district_amethi_per_line_chart",
      new_params
    );
  }
  amethi_aggregate = group_by_date(amethi_aggregate, "district_id");
  if (amethi_aggregate["StsLkYw1G0m"].length > 0) {
    _.map(amethi_aggregate["StsLkYw1G0m"], function (d) {
      if (d.score !== null) {
        if (name === "aggregate_score" || name === undefined) {
          d["weightage"] = _.filter(area_blk["J7htJUPglZb"], {
            date: d.date,
          })[0]["weightage"];
        }
        amethi_district_map["StsLkYw1G0m"].push(d);
      }
    });
  }
  amethi_district_map = calculate_percent(amethi_district_map, url);
  const ajax_url_agg =
    name === "aggregate_score" || name === undefined
      ? "district_aggregate_score"
      : "district_per_score";
  from_date = moment(date)
    .subtract(1, "months")
    .startOf("month")
    .format("YYYY-MM-DD");
  params["from_date"] = from_date;
  var table_block_data = UI.fetch_data(ajax_url_agg, params);
  if (
    table_block_data.length == 0 ||
    (_.uniqBy(table_block_data, "date").length === 1 &&
      table_block_data[0]["date"] !== date)
  ) {
    $(".no_data_show").removeClass("d-none");
    $(
      ".amethi_left_table,.loading-icon,.indicator-table-container,#dropdownMenuButton"
    ).hide();
    return false;
  } else {
    $(".no_data_show").addClass("d-none");
    $(
      ".amethi_left_table,.loading-icon,.indicator-table-container,#dropdownMenuButton"
    ).show();
  }
  let map_dict = {
    monthly_score: "pre_monthly_score",
    composite_rank: "pre_composite_rank",
    indicator_rank: "pre_indicator_rank",
    date: "date",
    perc_point: "pre_perc_point",
    weightage: "pre_Weight_sum",
    block_id: "pre_block_id",
    block: "pre_block",
    district_id: "pre_district_id",
    district: "pre_district",
    amethi_aggregate_score: "pre_amethi_aggregate_score",
  };
  table_block_data = format_data(
    table_block_data,
    params,
    map_dict,
    "pre_block_id",
    "block_id"
  );
  // get_table_data('block', group, parameter, table_year, table_quarter, date)
  var block_domain = get_domain_values(table_block_data);
  var district_block_domain = get_block_domain_values(table_block_data);
  var labels =
    user_info.user != "CM_Office1"
      ? d3.extent(area_blk["J7htJUPglZb"], function (d) {
          return parsetime(d.date);
        })
      : [];
  if (level === "district") {
    if (
      url.searchKey.indicator == undefined ||
      url.searchKey.indicator == "aggregate_score"
    ) {
      table_block_data = _.sortBy(table_block_data, ["composite_rank"]);
    } else {
      table_block_data = _.sortBy(table_block_data, ["indicator_rank"]);
    }
    let division_sort = url.searchKey["division_sort"] || "asc";
    table_block_data = _.orderBy(table_block_data, sort_key, division_sort);
    var distrinct_template_data = {
      selection: table_selection,
      indicator: name,
      type: "district",
      level_two_data: _.groupBy(table_block_data, "district"),
      level_three_data: false,
      level_two_domain: block_domain,
      district_block_domain: district_block_domain,
      area_data: area_blk,
      parsetime: parsetime,
      display_values: display_values,
      district_name_change: district_name_mapping,
      district_map: amethi_district_map,
    };
    common_district_template(
      table_selection,
      user_info,
      labels,
      date_format,
      url,
      distrinct_template_data,
      select,
      selected_name,
      defaults
    );
  }
}

function render_indicator_table() {
  // var year_arr, quarter_arr, date_arr, select
  // var keyMap = {}
  $(".loading-icon").show();
  var month = url.searchKey["month"];
  var quarter = url.searchKey["quarter"];
  var year = url.searchKey["year"] || defaults.year;
  var table_selection = set_table_selection();
  var date = get_selected_date(table_selection, month, quarter, year, defaults);
  var table_quarter = moment(date).fquarter().quarter;
  var params = {};
  var table_data = {};
  var select = url.searchKey["select"] || defaults.level;
  params[select] = url.searchKey[select];
  var filter_type = url.searchKey["filter_type"] || defaults.filter_type;
  ind_type = "block_amethi";
  params["to_date"] = date;
  let from_date = moment(date)
    .subtract(1, "months")
    .startOf("month")
    .format("YYYY-MM-DD");
  params["from_date"] = from_date;

  if (table_selection == "quarter") {
    params["quarter"] = table_quarter;
    table_data["quarter"] = UI.fetch_data(
      data_map[ind_type]["quarter"],
      params
    );
  } else if ((table_selection == "month") & (select == "district")) {
    var entire_data = UI.fetch_data("district_indicator_score", params);
    if (
      _.isEmpty(area_blk) ||
      entire_data.length == 0 ||
      (_.uniqBy(entire_data, "date").length === 1 &&
        entire_data[0]["date"] !== date)
    ) {
      $(".no_data_show").removeClass("d-none");
      $(
        ".amethi_left_table,.loading-icon,.indicator-table-container,#dropdownMenuButton"
      ).hide();
      return false;
    } else {
      $(".no_data_show").addClass("d-none");
      $(
        ".amethi_left_table,.loading-icon,.indicator-table-container,#dropdownMenuButton"
      ).show();
    }
    let map_dict = {
      dist_aggr: "pre_dist_aggr",
      amethi_aggregate_score: "pre_amethi_score",
      indicator: "pre_indicator",
      best_in_dist: "pre_best_in_dist",
      calc_type: "pre_calc_type",
      Weight: "pre_Weight",
      type: "pre_type",
      domain: "pre_domain",
      amethi_dist_score: "pre_amethi_dist_score",
    };
    table_data = format_data(
      entire_data,
      params,
      map_dict,
      "pre_indicator",
      "indicator"
    );
    table_data = _.map(table_data, function (obj) {
      obj["weightage"] = (obj["amethi_dist_score"] / obj["Weight"]) * 100;
      return obj;
    });
    // table_data= _.merge(prev_temp_indi_data,current_data)
  } else if ((table_selection == "month") & (select == "block")) {
    let current_data = UI.fetch_data("block_indicator_score", params);
    table_data = _.map(current_data, function (obj) {
      obj["weightage"] = (obj["indicator_index"] / obj["Weight"]) * 100;
      return obj;
    });
    let map_dict = {
      perc_point: "pre_perc_point",
      indicator_rank: "pre_indicator_rank",
      indicator: "pre_indicator",
      block: "pre_block",
      Weight: "pre_Weight",
      calc_type: "pre_calc_type",
      indicator_index: "pre_indicator_index",
      best_in_dist: "pre_best_in_dist",
      dist_aggr: "pre_dist_aggr",
      type: "pre_type",
      domain: "pre_domain",
      amethi_aggregate_score: "pre_amethi_score",
      weightage: "pre_weightage",
    };
    table_data = format_data(
      table_data,
      params,
      map_dict,
      "pre_indicator",
      "indicator"
    );
    // table_data= _.merge(prev_temp_block_data,current_data)
    let current_range = UI.fetch_data("min_max_rank", params);
    var table_range_data = {};
    let key_map = {
      indicator_rank_min: "pre_indicator_rank_min",
      indicator_rank_max: "pre_indicator_rank_max",
      indicator: "pre_indicator",
    };
    table_range_data = format_data(
      current_range,
      params,
      key_map,
      "pre_indicator",
      "indicator"
    );
  } else if (table_selection == "year") {
    table_data["year"] = UI.fetch_data(data_map[ind_type]["year"], params);
  }

  let weight_sum = parseFloat(
    (
      _.sumBy(table_data, function (o) {
        return o.Weight;
      }) * 100
    ).toFixed(2)
  );
  // table_data = custom_sort_indicators(table_data,'weightage')
  let template_indicator_data = {
    selection: table_selection,
    type: filter_type,
    table_range_data: table_range_data,
    indicator_data: table_data,
    weight_sum: weight_sum,
    mapping: indicator_mapping,
    select: select,
  };
  $(".download-button").template();
  rendering_indicator_template(defaults, url, template_indicator_data, select);
}

$(function () {
  url = g1.url.parse(location.href);
  table_config = defaults.table_config;
  $(".mapview-sidenav")
    .on("template", function () {
      $(".user_name").text($(".user_name").attr("id"));
      $(".last_date").text("Mar 2020");
    })
    .template({ user: user_info.designation || "Admin" });
  $(".nav-bar")
    .on("template", function () {
      // logged user is extracted to determine if district or not
      var _attr = url.file; //== 'table' ? "table" : "niti_table"
      $("a[data-attr=" + _attr + "]").addClass("active-tab");
      $.fn.selectpicker.Constructor.BootstrapVersion = "4";
      $(".page-sidenav")
        .on("template", function () {
          $(".last_date").text("Feb 2020");
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
      // $('.insights').template()
      // render_search_bar_template()
    })
    .template({ user: user_info.user });
  UI.load_calendar();
  // let user_config = set_user_details(defaults);
  // user_district = user_config.user_district
  // user_division = user_config.user_division
  // url = g1.url.parse(location.href)
  // var level = url.searchKey.level || defaults.level
  // if (user_info.division != "" && user_info.district == "")
  //   level = 'division'
  // if (!url.searchKey.select) {
  //   if (level === 'district')
  //     url.update({ select: 'district', district: user_district })
  //   else
  //     url.update({ level: 'division', select: 'division', division: user_division })
  // } else {
  //   var select = url.searchKey.select
  //   if (!url.searchKey[select]) {
  //     var param = {}
  //     param[select] = select === 'division' ? user_division : user_district
  //   }
  // }
  window.history.pushState({}, "", url.toString());
  redraw_table_view(defaults, _def_inds, [{}]);

  // code which hides/displays negative indicator text
  // var url_indicator = url.searchKey.indicator_id || (url.file == 'table' ? '' : 'indicator_1')  // indicator_1 is in niti view
  // var url_indicator = url.searchKey.indicator_id || (url.file == 'table' ? '' : ' ')  // indicator_1 is in niti view
  // var indicator_np = _.find(indicator_mapping, { indicator_id: url_indicator })

  // if (indicator_np.positive_negative == 'positive') {
  //   $('.negative_indication').hide()
  // } else {
  //   $('.negative_indication').show()
  // }
});

$("body")
  .urlfilter({
    selector: ".urlfilter",
    target: "pushState",
  })
  .on("urlfilter", redraw_table_view);

$(document)
  .on("click", ".block-name", function () {
    $(".division-name,.district-name,.block-name,.amethi_block").removeClass(
      "selected-name"
    );
    $(this).addClass("selected-name");
    url.update({
      select: "block",
      block: $(this).attr("data-attr"),
      district: "Amethi",
    });
    window.history.pushState({}, "", url.toString());
    render_indicator_table();
  })
  .on("click", ".amethi_block", function () {
    url.update({ select: "district", district: "Amethi", block: null });
    $(this).addClass("selected-name");
    $(".block-name").removeClass("selected-name");
    window.history.pushState({}, "", url.toString());
    render_indicator_table();
  })

  .on("click touch", '[data-toggle="collapse"]', function () {
    if ($(this).find("i").hasClass("fa-plus")) {
      $('[data-toggle="collapse"] i')
        .removeClass("fa-minus")
        .addClass("fa-plus");
      $(this).find("i").removeClass("fa-plus").addClass("fa-minus");
    } else {
      $('[data-toggle="collapse"] i')
        .removeClass("fa-minus")
        .addClass("fa-plus");
      $(this).find("i").removeClass("fa-minus").addClass("fa-plus");
    }
  })

  .on("click", ".download-data", function () {
    var amethi_today_date = new Date();
    // Data_Report_Requirement-8-1-2020
    var filename = [
      "Data_Report_Requirement",
      amethi_today_date.getDate(),
      amethi_today_date.getMonth() + 1,
      amethi_today_date.getFullYear(),
    ].join("-");

    // TODO - add quarter date filter
    var amethi_date_filter =
      table_selection == "year"
        ? moment(get_fin_year(date) - 1 + "-04-01").format("YYYY-MM-DD")
        : date;

    // Case 3 : block download
    if ($(this).attr("geography") == "block") {
      var amethi_dist_div =
        url.searchKey.district || url.searchKey.division || "All";
      filename = amethi_dist_div + "-" + filename;
      var amethi_block_link =
        download_map["block"][table_selection] +
        "?date=" +
        amethi_date_filter +
        "&url_file=" +
        url.file +
        "&area=block&_format=xlsx&_download=" +
        filename +
        "_block.xlsx";
      location.href = amethi_block_link;
    }
  });
