/* exported UI,url_update,slugify, district_name_mapping get_curr_prev_months, get_districts,
  set_user_details,rename_key, rename_keys,render_table_dropdown,redraw_table_view, get_area_data,get_col_values,get_fin_year,
  convert_date,set_table_selection,get_selected_date,get_domain_values,get_block_domain_values,rendering_indicator_template,
  update_rows,common_district_template,set_labels,custom_sort_indicators,format_data, parse_url, stringify_*/
/*global g1,user_info,session_id, swal, url:true, indicator_mapping, JSInterface,
  render_table,render_indicator_table,data_map,ind_type:true,defaults, _def_inds, default_ind, render_search_bar_template
  load_calendar, data_map_area*/
// swal

// DO NOT REMOVE - sentry for up-tsu project -- tracks errors in application
// Sentry.init({ dsn: 'https://71eecfb282674fc0948d0a83e6d23117@sentry.io/1759322' });

// note that DSN link will change from project to project, this is created when you create an application in `Sentry`
var block_ind_list = [];
var UI = (function () {
  // convert to and from url into date
  function stringify_(params) {
    if (params.district === "Uttar Pradesh") {
      delete params.district;
    }
    if (_.has(params, "from")) {
      params.date = [params.from, params.to];
    }
    var params_ = $.param(params, true);
    return params_;
  }

  /* for fetching data */
  function fetch_data(url, params) {
    var params_ = typeof params !== "string" ? stringify_(params) : params;
    var data;
    $.ajax({
      url: url,
      async: false,
      data: params_,
      success: function (response) {
        data = response;
      },
    });
    return data;
  }

  function sort_list(list, col_name) {
    var indicators_list = _.map(indicator_mapping, "indicator_name");
    var sortedCollection = _.sortBy(list, function (item) {
      return indicators_list.indexOf(item[col_name]);
    });
    return sortedCollection;
  }

  // render profile page with data
  function get_profile_data(district_name) {
    var data = fetch_data("profile_data", { district: district_name });
    var profile_data = [],
      header_data = [],
      profile_labels = [
        "IMR",
        "NMR",
        "U5MR",
        "MMR",
        "TFR",
        "CBR",
        "Unmet Need for Spacing",
        "Unmet Need for Limiting",
      ],
      top_labels = {
        "Total Population": "Estd. Population 2017",
        "Sex Ratio": "Sex Ratio",
        "Literacy Rate": "Literacy",
      };

    _.each(profile_labels, function (d) {
      var value = data.length === 0 ? 0 : data[0][d];
      profile_data.push({ name: d, value: value });
    });

    _.each(top_labels, function (value, key) {
      var value2 = data.length === 0 ? 0 : data[0][value];
      header_data.push({ name: key, value: value2 });
    });
    return {
      district: district_name,
      header_data: header_data,
      profile_data: profile_data,
    };
  }

  function render_date() {
    _.each($(".cal-btn").find("p"), function (d) {
      if ($(d).css("opacity") == 1) {
        var key = $(d).attr("class").split(" ").pop();
        $("." + key).text($("#active").text() + " " + $(".year").text());
      }
    });
  }

  return {
    fetch_data: fetch_data,
    get_profile_data: get_profile_data,
    load_calendar: load_calendar,
    render_date: render_date,
    sort_list: sort_list,
  };
})();

//  removed amethi ticker

var district_name_mapping = {
  Allahabad: "Prayagraj",
  Faizabad: "Ayodhya",
  "Allahabad Division": "Prayagraj Division",
  "Faizabad Division": "Ayodhya Division",
};

$(document)
  .on("click touch", ".png-download", function () {
    if (isIpad()) {
      JSInterface.screen_shot({ value: "trigger screenshot" });
    } else {
      if (_.includes(["table_noauth", "table", "niti_table"], url.file)) {
        var selector = ".indicator_break_table";
        var file = url.searchKey.district + "-" + $("#date-label").text();
        location.href =
          "capture?ext=png&delay=10000&&file=" +
          encodeURIComponent(file) +
          "selector=" +
          encodeURIComponent(selector) +
          "&url=" +
          encodeURIComponent(location.href + "&capture=true") +
          "&start=start";
      } else {
        if (url.file == "amethi_map") {
          location.href =
            "capture?ext=png&width=1400&height=2000&delay=8000&file=amethi_map&url=" +
            encodeURIComponent(location.href + "&capture=true") +
            "&start=start";
        } else if (url.file == "amethi_table") {
          let url = g1.url.parse(location.href);
          location.href =
            "capture?ext=png&width=1400&height=1900&delay=8000&file=amethi_table&url=" +
            encodeURIComponent(url.href + "?" + url.search + "&capture=true") +
            "&start=start";
        } else {
          location.href =
            "capture?ext=png&delay=8000&url=" +
            encodeURIComponent(location.href + "&capture=true") +
            "&start=start";
        }
      }
    }
  })
  .on("template", function () {
    $('[data-toggle="tooltip"]').tooltip();
  })
  .on("click touch", ".download-map", function () {
    var url = g1.url.parse(location.href);
    var get_dashboard =
      url.file == "amethi_map" ? "aggregate_score" : "composite_score";
    var indicator_name = _.find(indicator_mapping, {
      indicator_id: url.searchKey.indicator_id || get_dashboard,
    }).short_name;
    var date = new Date();
    var filename = [
      indicator_name.replace(/ /g, "_"),
      date.getDate(),
      date.getMonth() + 1,
      date.getFullYear(),
    ].join("-");
    var chart_name =
      url.searchKey["chart"] == "map" || url.searchKey["chart"] == undefined
        ? "mapid"
        : "trend";
    if (isIpad()) {
      window.open(
        "capture?ext=png&delay=7000&url=" +
          encodeURIComponent(location.href) +
          "&selector=%23" +
          chart_name +
          "&start=start&file=" +
          filename,
        "_blank"
      );
    } else {
      location.href =
        "capture?ext=png&delay=7000&url=" +
        encodeURIComponent(location.href) +
        "&selector=%23" +
        chart_name +
        "&start=start&file=" +
        filename;
    }
  })
  .on("click", "#closeNav", function () {
    $("#aside-nav").hide();
  })
  .on("click", "body", function (event) {
    if (["aside-nav"].indexOf($(event.target).attr("id")) < 0) {
      if (
        $(event.target).attr("id") === "openNav" &&
        $("#aside-nav").css("display") === "none"
      )
        $("#aside-nav").show();
      else $("#aside-nav").hide();
    }
    if (["right-aside-nav"].indexOf($(event.target).attr("id")) < 0) {
      if (
        $(event.target).attr("id") === "p" &&
        $("#right-aside-nav").css("display") === "none"
      )
        $("#right-aside-nav").show();
      else $("#right-aside-nav").hide();
    }
  })
  .on("click", "#c", function () {
    $("#right-aside-nav").hide();
  })
  .on("click", "#cc", function () {
    $("#right-aside-nav1").hide();
  })
  .on("click", "body", function (event) {
    if (["right-aside-nav1"].indexOf($(event.target).attr("id")) < 0) {
      if (
        $(event.target).attr("id") === "pp" &&
        $("#right-aside-nav1").css("display") === "none"
      )
        $("#right-aside-nav1").show();
      else $("#right-aside-nav1").hide();
    }
  })
  .on("click", ".user-profile", function () {
    $("#user-profile").show();
  })
  .on("click", "#close-user-profile", function () {
    $("#user-profile").hide();
  });

// removed render_search_bar_template()

function isIpad() {
  return navigator.userAgent.match(/iPhone|iPad|iPod/i);
}

if (isIpad()) {
  $(window).on("move", function () {
    $(".leaflet-tooltip, .leaflet-tooltip-pane").hide();
  });
  $(window).on("scroll", function () {
    $(".leaflet-tooltip, .leaflet-tooltip-pane").hide();
  });
}
/*
update url without page refresh
uri is dictionary
*/
function url_update(uri) {
  var clear_url = g1.url.parse(location.href).update(uri);
  history.pushState({}, "", clear_url.toString());
}

// removed get_districts()

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w-]+/g, "") // Remove all non-word chars
    .replace(/--+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

function get_curr_prev_months() {
  // "2019-01-31"
  if (typeof user_info != "undefined") {
    var authtype = user_info.user == "CM_Office1" ? "_noauth" : "";
  } else {
    authtype = "";
  }
  var latest_date = UI.fetch_data(
    "last_update" + authtype,
    $.param({}, true)
  )[0][0];
  var curr_month = moment(latest_date)
    .subtract(0, "months")
    .startOf("month")
    .format("YYYY-MM-DD");
  var prev_month = moment(latest_date)
    .subtract(1, "months")
    .startOf("month")
    .format("YYYY-MM-DD");
  var prev_2_month = moment(latest_date)
    .subtract(2, "months")
    .startOf("month")
    .format("YYYY-MM-DD");

  return {
    curr_month: curr_month,
    prev_month: prev_month,
    prev_2_month: prev_2_month,
  };
}

// 5 mins
function check_session(e) {
  let _url = "active_session?" + $.param({ id: session_id });
  var conn_status = UI.fetch_data(_url, $.param({}, true));
  if (conn_status === "false") {
    e.preventDefault();
    e.stopPropagation();
    swal("", "Session Timed Out Please Log In", "info");
    $(".confirm").on("click", function () {
      window.location.replace(
        "login?next=" /*+ encodeURIComponent(location.href)*/
      );
    });
  }
}

function set_user_details(defaults) {
  var district_data =
    user_info.user == "CM_Office1" ? "district_data_noauth" : "district_data";
  let user_district = user_info["district"] || defaults.district;
  let user_division = !_.includes(["", null], user_info["division"])
    ? user_info["division"]
    : UI.fetch_data(district_data, { district: user_district })[0]["division"];
  return { user_district: user_district, user_division: user_division };
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

function rename_keys(arr, keyMap) {
  var new_arr = arr.map(function (obj) {
    return _.mapKeys(obj, function (value, key) {
      return keyMap[key] || key;
    });
  });
  return new_arr;
}

$("body").click(function (e) {
  if (url.file != "table_noauth") {
    check_session(e);
  }
});

/* Get list of indicators and render dropdown*/
function render_table_dropdown() {
  var row = {};
  var val = "indicator";
  url = g1.url.parse(location.href);
  var name = url.searchKey[val] || defaults.name;
  row[val] = _def_inds[url.file]; //url.file == 'table' ? 'composite_score' : '% ANC registered in First trimester'
  var month = url.searchKey["month"];
  var year = url.searchKey["year"];
  var _date =
    month != undefined
      ? moment(year + "-" + month + "-01", "YYYY-MMM-DD").format("YYYY-MM-DD")
      : defaults.date;
  var _unique_lists = {
    table: "get_unique_list",
    niti_table: "get_unique_list_niti",
    cmo_table: "get_unique_list_cmo",
    // 'amethi_table': 'get_unique_list_amethi',
    table_noauth: "get_unique_list_cm",
  };

  var _unique__blocks_ind_lists = {
    table: "get_unique_block_ind_list",
    niti_table: "get_unique_block_ind_list_niti",
    table_noauth: "get_unique_block_ind_list_cm",
  };
  var unique_block_inds = UI.fetch_data(
    _unique__blocks_ind_lists[url.file],
    ""
  );
  _.each(unique_block_inds, function (d) {
    block_ind_list.push(d["indicator"]);
  });
  // for composite_index. when composite_score is selected, indicator is undefined
  block_ind_list.push(undefined);
  var filter_type = url.searchKey["filter_type"] || defaults.filter_type;
  var list = UI.fetch_data(
    user_info.user != "CM_Office1"
      ? _unique_lists[url.file]
      : "get_unique_list_cm",
    { _c: val }
  );
  if (url.file == "amethi_table") {
    list = UI.fetch_data("get_unique_list_amethi", { _c: val, _date: _date });
  }
  // var list = UI.fetch_data((user_info.user != 'CM_Office1') ? ((url.file == 'table') ? 'get_unique_list' : 'get_unique_list_niti') : 'get_unique_list_cm', { '_c': val })
  if (url.file === "amethi_table") {
    list[val] = UI.sort_list(list);
  } else {
    list[val] = UI.sort_list(list);
  }
  if (user_info.user === "CM_Office1" || url.file === "table_noauth") {
    list[val] = default_ind;
  }

  list[val] = _.sortBy(list, "indicator");

  $("#filter").selectpicker("destroy");
  $(".table-dropdown")
    .on("template", function () {
      $("#filter").val(name);
      $("#filter").selectpicker("refresh");
      $("#filter-type").val(filter_type);
      $(".table-dropdown").off();
      render_table();
      render_indicator_table();
    })
    .template({
      data:
        url.file != "table" && url.file != "amethi_table"
          ? [].concat(list[val])
          : user_info.user != "CM_Office1"
          ? [row].concat(list[val])
          : [].concat(list[val]),
      // data: url.file == 'table' ? ((user_info.user != 'CM_Office1') ? [row].concat(list[val]) : [].concat(list[val])) : [].concat(list[val]),
      column: val,
      id: "filter",
      mapping: indicator_mapping,
    });
}

function redraw_table_view() {
  $("#cal").hide();
  let url = g1.url.parse(location.href);
  var level = url.searchKey["level"] || defaults.level;
  if (level === "district") {
    $("#level").attr("checked", true);
    $("#double-label-slider").removeClass("d-none");
  }
  $(".deepdive-table").empty();
  render_search_bar_template();
  render_table_dropdown();
}

function get_fin_year(date) {
  var month_num = parseInt(moment(date).format("MM"));
  var year = parseInt(moment(date).format("YYYY"));
  if (month_num > 3) return year + 1;
  return year;
}

function convert_date(date, format) {
  if (format == "year") {
    return get_fin_year(date).toString();
  }
  if (format == "quarter") {
    return moment(date).fquarter().quarter + " " + get_fin_year(date);
  }
  return moment(date).format("MMM YY");
}

function get_area_data(
  defaults,
  selection,
  date,
  parameter,
  format,
  aggregate_score
) {
  var keyMap = {},
    id;
  if (selection == "division") id = "div_map_id";
  else id = selection + "_id";
  if (
    aggregate_score === "aggregate_score" ||
    aggregate_score === "percent_point"
  ) {
    id = "district_id";
  }
  var immunization = defaults.immunization_indicator;
  var type = selection == "overall" ? "division" : selection;
  var fy_date = moment(get_fin_year(date) - 1 + "-04-01").format("YYYY-MM-DD");
  var from_date;
  if (format == "month")
    from_date = moment(date).subtract(5, "month").format("YYYY-MM-DD");
  else if (format == "year")
    from_date = moment(date).subtract(2, "year").format("YYYY-MM-DD");
  else from_date = moment(date).subtract(11, "month").format("YYYY-MM-DD");
  var params = { "date>~": from_date, "date<~": date };

  // -------- not same -------- //
  var name = url.searchKey[parameter];
  var col_name;
  if (url.file === "amethi_table") {
    if (aggregate_score !== undefined) {
      if (aggregate_score === "aggregate_score") {
        col_name = "amethi_aggregate_score|avg";
        params["_c"] = [col_name];
        params["_by"] = ["date", "district_id"];
      } else {
        col_name = "perc_point|avg";
        params["_c"] = col_name;
        params["indicator"] = url.searchKey.indicator;
        params["_by"] = ["date", "district_id"];
      }
    } else {
      if (
        url.searchKey.indicator == undefined ||
        url.searchKey.indicator === "aggregate_score"
      ) {
        col_name = "composite_index|avg";
        params["_c"] = [col_name, "Weight|sum"];
        params["_by"] = [id, "date"];
      } else {
        col_name = "perc_point|avg";
        params["_c"] = col_name;
        params["indicator"] = url.searchKey.indicator;
        params["_by"] = [id, "date", "indicator"];
      }
    }
  } else {
    if (name && name !== "composite_score") {
      col_name = "perc_point|avg";
      params[parameter] = name;
    } else {
      // col_name = 'composite_index|avg'
      // col_name = url.file == 'table' ? 'composite_index|avg' : 'perc_point|avg'
      col_name = url.file != "table" ? "perc_point|avg" : "composite_index|avg";
    }
    params["_c"] = col_name;
    params["_by"] = [id, "date"];
  }
  // if(selection == "division"){
  //   delete params['_by']
  // }
  keyMap[col_name] = "score";
  var _type = {
    table: type,
    niti_table: type + "_niti",
    cmo_table: type + "_cmo",
    amethi_table: type + "_amethi",
    table_noauth: type + "_cm",
  };
  // type = _type[url.file] || type
  ind_type = _type[url.file] || type; //type //user_info.user == 'CM_Office1' ? type + '_cm' : type
  //---------------- till here --------//
  var data;
  // if(ind_type == 'block'){
  if (_.includes(["block", "block_cm", "block_niti"], ind_type)) {
    if (_.includes(block_ind_list, params["indicator"])) {
      data = rename_keys(
        UI.fetch_data(data_map_area[ind_type][format], params),
        keyMap
      );
    } else {
      data = [];
    }
  } else {
    data = rename_keys(
      UI.fetch_data(data_map_area[ind_type][format], params),
      keyMap
    );
  }
  if (url.file == "table" && name == immunization)
    data = _.filter(data, function (d) {
      return moment(d.date, "YYYY-MM-DD") >= moment(fy_date, "YYYY-MM-DD");
    });
  _.each(data, function (row) {
    row["date"] = convert_date(row["date"], format);
  });
  if (selection != "overall") data = _.groupBy(data, id);
  return data;
}

/* Get values of given time_unit (year, quarter or month) */
function get_col_values(
  type,
  time_unit,
  value,
  parameter,
  params,
  key1,
  key2,
  col
) {
  var keyMap = {};
  params[time_unit] = value;
  var _type = {
    table: type,
    niti_table: type + "_niti",
    cmo_table: type + "_cmo",
    amethi_table: type + "_amethi",
    table_noauth: type + "_cm",
  };
  // type = url.file == 'niti_table' ? type+'_niti' : type
  // type = _type[url.file] || type
  let ind_type = _type[url.file] || type; //user_info.user == 'CM_Office1' ? type + '_cm' : type
  if (time_unit == "date") {
    delete params.quarter;
  }

  var data;
  // if(ind_type == 'block'){
  if (_.includes(["block", "block_cm", "block_niti"], ind_type)) {
    if (_.includes(block_ind_list, params["indicator"])) {
      data = UI.fetch_data(data_map[ind_type][time_unit], params);
    } else {
      data = [];
    }
  } else {
    data = UI.fetch_data(data_map[ind_type][time_unit], params);
  }
  // var data = UI.fetch_data(data_map[ind_type][time_unit], params)
  // debugger
  keyMap[parameter + "|avg"] = key1;
  keyMap[col] = key2;
  return rename_keys(data, keyMap);
}

function set_table_selection() {
  if (url.searchKey["month"] !== undefined) return "month";
  if (url.searchKey["quarter"] !== undefined) return "quarter";
  if (url.searchKey["year"] !== undefined) return "year";
  return "month";
}

function get_selected_date(table_selection, month, quarter, year, defaults) {
  if (table_selection === "quarter")
    return moment(quarter + " " + year, "[Q]Q YYYY")
      .subtract(9, "month")
      .format("YYYY-MM-01");
  if (table_selection === "year")
    return moment(year, "YYYY").format("YYYY-03-01");
  if (!month) return defaults.date;
  return moment(year + "-" + month + "-01", "YYYY-MMM-DD").format("YYYY-MM-DD");
}

function get_domain_values(array) {
  return {
    monthly: _.maxBy(array, "monthly_score"),
    quarterly: _.maxBy(array, "quarterly_score"),
    fy: _.maxBy(array, "fy_score"),
    monthly_min: _.minBy(array, "monthly_score"),
    quarterly_min: _.minBy(array, "quarterly_score"),
    fy_min: _.minBy(array, "fy_score"),
  };
}

function get_block_domain_values(array) {
  // computes max and min domains for every district for block data

  var grouped_blocks = _.groupBy(array, "district");
  var big_dict = {};
  _.each(grouped_blocks, function (item) {
    // big_dict['Agra'] = {'monthly': max_obj}
    big_dict[item[0].district] = {
      monthly: _.maxBy(item, "monthly_score"),
      quarterly: _.maxBy(item, "quarterly_score"),
      fy: _.maxBy(item, "fy_score"),
      monthly_min: _.minBy(item, "monthly_score"),
      quarterly_min: _.minBy(item, "quarterly_score"),
      fy_min: _.minBy(item, "fy_score"),
    };
  });
  return big_dict;
}

function rendering_indicator_template(defaults, url, indicator_data, select) {
  let color_scale = d3
    .scaleLinear()
    .domain([0, 50, 100])
    .range(["red", "white", "green"]);
  $(".indicator-table")
    .on("template", function () {
      $(".indicator-table").off();

      if (url.searchKey.select == "district" && url.file == "amethi_table") {
        $(".deepdive-table").removeClass(".ind-color-cell");
      } else if (
        url.searchKey.select == "block" &&
        url.file == "amethi_table"
      ) {
        _.each($(".ind-color-cell"), function (d) {
          var domain_max = parseFloat($(d).attr("domain-attr"));
          var domain_min = parseFloat($(d).attr("domain-attr_min"));
          color_scale.domain([
            domain_min,
            (domain_min + domain_max) / 2,
            domain_max,
          ]);
          if ($(d).attr("value") != "NA") {
            $(d).css("background-color", color_scale($(d).attr("value")));
          }
        });
      } else {
        _.each($(".ind-color-cell"), function (d) {
          var domain_max = parseFloat($(d).attr("domain-attr"));
          var domain_min = parseFloat($(d).attr("domain-attr_min"));
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
          } else if (
            $(d).attr("indicator_sign") == "negative" &&
            $(d).attr("value") != ""
          ) {
            $(d).css("background-color", color_scale($(d).attr("value")));
          }
        });
      }
      var selected_geo = url.searchKey[select] || defaults.state_name;

      if (url.file == "amethi_table") {
        if (url.searchKey.select == "block") {
          selected_geo += " Block";
          $(".table-title").text(selected_geo);
        } else {
          $(".table-title").text("Amethi District");
          if (
            _.includes(
              Object.keys(district_name_mapping),
              $(".table-title").text().trim()
            )
          )
            $(".table-title").text(
              district_name_mapping[$(".table-title").text().trim()]
            );
        }
      } else {
        if (select == "block") selected_geo += " - " + url.searchKey.district;
        $(".table-title").text(selected_geo);
        if (
          _.includes(
            Object.keys(district_name_mapping),
            $(".table-title").text().trim()
          )
        )
          $(".table-title").text(
            district_name_mapping[$(".table-title").text().trim()]
          );
      }
      $(".loading-icon").hide();

      //For changing icons on accordition
      $(".collapse-body").on("show.bs.collapse", function () {
        $(this).parent().find(".collapse-header .fa").removeClass("fa-minus");
        $(this).parent().find(".collapse-header .fa").addClass("fa-plus");
      });
      $(".collapse-body").on("hide.bs.collapse", function () {
        $(this).parent().find(".collapse-header .fa").removeClass("fa-plus");
        $(this).parent().find(".collapse-header .fa").addClass("fa-minus");
      });
    })
    .template(indicator_data);
}

function update_rows(slider_value, defaults) {
  $(".level-one-card").removeClass("d-none");
  if (slider_value)
    _.each($(".level-one-card"), function (item) {
      if (
        !_.includes(
          defaults.district_priority[slider_value - 1],
          $(item).data("attr").toString()
        )
      )
        $(item).addClass("d-none");
    });
}

function common_district_template(
  table_selection,
  user_info,
  labels,
  date_format,
  url,
  data,
  select,
  selected_name,
  defaults
) {
  let color_scale = d3
    .scaleLinear()
    .domain([0, 50, 100])
    .range(["red", "white", "green"]);
  var _class = url.file == "table_noauth" ? ".table_cm" : ".table";
  // if(url.file == 'table_noauth')
  //   var class = '.table_cm'
  //   else

  $(_class)
    .on("template", function () {
      $(_class).off();
      _.each($(".color-cell"), function (d) {
        var domain_max = _.round(parseFloat($(d).attr("domain-attr")), 2);
        var domain_min = _.round(parseFloat($(d).attr("domain-attr_min")), 2);
        if (domain_max == domain_min) {
          domain_min = domain_min - 0.1;
        }
        color_scale.domain([
          domain_min,
          (domain_min + domain_max) / 2,
          domain_max,
        ]);
        var url_indicator = url.searchKey["indicator"] || _def_inds[url.file];
        var indicator_np = _.find(indicator_mapping, {
          indicator_name: url_indicator,
        }).positive_negative;
        indicator_np == "positive"
          ? color_scale.range(["red", "white", "green"])
          : color_scale.range(["green", "white", "red"]);
        if (url.file == "amethi_table") {
          $(d).css("background-color", color_scale($(d).attr("value")));
        }
        if ($(d).attr("value") != 0) {
          $(d).css("background-color", color_scale($(d).attr("value")));
        }
      });
      if (user_info.user != "CM_Office1")
        set_labels(table_selection, labels, date_format);
      $("." + select + '-name[data-attr="' + selected_name + '"]').addClass(
        "selected-name"
      );
      var slider_value = parseInt(url.searchKey.slider);
      if (slider_value) update_rows(slider_value, defaults);
      $(".loading-icon").hide();
      if (url.searchKey.toggle) {
        $('.level-one-card [href="' + url.searchKey.toggle + '"]').click();
      }
    })
    .template(data);
}

function set_labels(table_selection, labels, date_format) {
  var left_year = parseInt(moment(labels[0]).format("YYYY"));
  var right_year = parseInt(moment(labels[1]).format("YYYY"));
  if (table_selection === "quarter") {
    $("#trend-left").text(
      "Q" +
        moment(labels[0]).format("M") +
        " " +
        (left_year - 1) +
        "-" +
        left_year
    );
    $("#trend-right").text(
      "Q" +
        moment(labels[1]).format("M") +
        " " +
        (right_year - 1) +
        "-" +
        right_year
    );
  } else if (table_selection === "year") {
    $("#trend-left").text(left_year - 1 + "-" + left_year);
    $("#trend-right").text(right_year - 1 + "-" + right_year);
  } else {
    $("#trend-left").text(moment(labels[0]).format(date_format));
    $("#trend-right").text(moment(labels[1]).format(date_format));
  }
  if (labels[0] == labels[1]) $("#trend-right").text("");
  if (labels.length == 0 || !labels[0]) {
    $("#trend-left").text("");
    $("#trend-right").text("");
  }
}

function custom_sort_indicators(custom_data, based_on) {
  let custom_order = [
    "NMR reporting (< 4 weeks)",
    "IMR reporting (4 weeks to 12 months)",
    "ANC Registration reporting (line-list vs. summary)",
    "Full Immunization Coverage (line-list vs. summary)",
    "% ARI/ILI cases reported",
    "% pneumonia cases reported",
    "% diarrhea cases reported",
    "% children below 6 years reported underweight",
    "% children below 6 years reported severely underweight",
    "% PMJAY enrollment (against target)",
    "Visit on RMNCH+A portal",
    "% officer-visits conducted (Darpan App)",
    "Block fund utilization (against target)",
    "% facilities reported non-blank values for identified indicators",
    "% facilities reported outlier values for identified indicators",
    "ANC Registration within first trimester (against estimated PW)",
    "1st trim ANC reg. (HMIS)",
    "% PW who received 4 or more ANC (against estimated PW)",
    "% PW tested for Hb for 4 or more times (against estimated PW)",
    "PW Screened For HIV (against estimated PW)",
    "Proportion of institutional deliveries (against estimated deliveries)",
    "% newborns received HBNC visits",
    "Post-Partum Checkup Within 48 Hours (for reported delivery)",
    "Ratio Of Pentavalent 3 To BCG",
    "Full immunization coverage (against target)",
    "Permanent FP method accepted per 1000 EC",
    "Spacing FP method accepted per 1000 EC",
    "Malaria slides collected",
    "Total case notification rate of TB (per 1L pop)",
    "Hypertension cases diagnosed (vs. expected)",
    "Diabetes cases diagnosed (vs. expected)",
    "Avg. OPD during month at PHCs",
    "Average ASHA incentive",
    "Still Birth Rate",
    "Proportion of LBW among new born",
    "TB treatment success rate",
    "1st trim ANC reg. (RCH portal)",
    "% facilities with >80% drugs available",
    "% facilities with >80% tests available",
    "% facilities with >80% equipment available",
    "% staff marking attendance via Darpan app",
  ];
  custom_data = custom_data.sort(function (a, b) {
    return (
      custom_order.indexOf(a.indicator) - custom_order.indexOf(b.indicator)
    );
  });
  return _.orderBy(custom_data, [based_on], ["desc"]);
}

function format_data(temp_data, params, map_dict, key1, key2) {
  var current_data = _.filter(temp_data, { date: params.to_date });
  var previous_data = _.filter(temp_data, { date: params.from_date });
  previous_data = previous_data.map(function (obj) {
    return _.mapKeys(obj, function (value, key) {
      return map_dict[key];
    });
  });
  return _.map(current_data, function (obj) {
    let temp = {};
    temp[key1] = obj[key2];
    return _.assign(obj, _.find(previous_data, temp));
  });
}

function parse_url() {
  return g1.url.parse(location.href);
}
