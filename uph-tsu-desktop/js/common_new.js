/* globals g1, draw_indicators_info, default_params, user_data, draw_accordion_section,
draw_district_ranking, get_hierarchy, gbl_map_selected, JSInterface, user_info, stringify_ */
/* exported gbl_color_mapping, gbl_district_name_mapping, get_drilldown, redraw, update_url, parse_url, render_search_bar_template */

var district_data = get_districts();
var gbl_color_mapping = {
    ante_natal: "bg-warning",
    communicable_diseases: "bg-danger",
    delivery_care: "bg-color10",
    family_planning: "bg-color11",
    immunization: "bg-color12",
    post_natal_care: "bg-color13",
    coverage: "bg-warning",
    quality: "bg-danger",
    data_integrity: "bg-info",
    data_quality: "bg-color10",
    availability: "bg-color11",
    finance: "bg-color11",
    input: "bg-color11",
  },
  gbl_district_name_mapping = {
    Allahabad: "Prayagraj",
    Faizabad: "Ayodhya",
    "Allahabad Division": "Prayagraj Division",
    "Faizabad Division": "Ayodhya Division",
  },
  gbl_quarter_map = { Q4: "01-01", Q1: "04-01", Q2: "07-01", Q3: "10-01" };

$(document).ajaxStop(function () {
  // Hide loading icon when all the AJAX calls are completed
  $(".loading-icon").hide();
});

$(function () {
  let url = parse_url(),
    page = url.file;
  redraw(url, page);
  $("body")
    .tooltip({
      selector: '[data-toggle="tooltip"]',
      container: "body",
      animation: true,
      html: true,
      trigger: "hover",
      placement: "top",
    })
    .on("click touch", ".png-download", function () {
      if (isIpad()) {
        JSInterface.screen_shot({ value: "trigger screenshot" });
      } else {
        if (_.includes(["table_noauth", "table", "niti_table"], url.file)) {
          var selector = ".indicator_break_table";
          var file = url.searchKey.district + "-" + $("#date-label").text();
          var slider_num = url.searchKey.slider;
          let delaytime = 25000; // milliseconds
          // if (url.file == "niti_table" && url.searchKey.select == "district") {
          //   delaytime = 20000; // milliseconds
          // }
          location.href =
            `capture?ext=png&delay=${delaytime}&&file=` +
            encodeURIComponent(file) +
            "selector=" +
            encodeURIComponent(selector) +
            "&url=" +
            encodeURIComponent(location.href + "&capture=true") +
            "&slider=" +
            encodeURIComponent(slider_num) +
            "&start=start";
        } else {
          if (url.file == "amethi_map") {
            location.href =
              "capture?ext=png&width=1400&height=2000&delay=8000&file=amethi_map&url=" +
              encodeURIComponent(location.href + "&capture=true") +
              "&start=start";
          } else if (url.file == "amethi_table") {
            location.href =
              "capture?ext=png&width=1400&height=1900&delay=8000&file=amethi_table&url=" +
              encodeURIComponent(location.href + "&capture=true") +
              "&start=start";
          } else {
            location.href =
              "capture?ext=png&width=1400&height=1450&delay=10000&url=" +
              encodeURIComponent(location.href + "&capture=true") +
              "&start=start";
          }
        }
      }
    })
    .on("click touch", ".download-map", function () {
      var url = parse_url(),
        get_dashboard =
          url.file == "amethi_map" ? "aggregate_score" : "composite_score",
        indicator_name =
          $(`#${url.searchKey.indicator_id}`).attr("desc") || get_dashboard;

      var date = new Date();
      var filename = [
        indicator_name.trim().replace(/ /g, "_"),
        date.getDate(),
        date.getMonth() + 1,
        date.getFullYear(),
      ].join("-");
      var chart_name =
        url.searchKey["chart"] == "map" || url.searchKey["chart"] == undefined
          ? "mapid"
          : "trend-png";
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
          "capture?ext=png&width=1400&height=1450&delay=7000&url=" +
          encodeURIComponent(location.href) +
          "&selector=%23" +
          chart_name +
          "&start=start&file=" +
          filename;
      }
    });
  // .on('click', "#icon", function () {
  //   $("#myInput1").show()
  // }).on('click', '#close_nav', function () {
  //   $("#myInput1").hide()
  //   document.getElementById("myInput").value = ""
  //   $("#myUL").hide()
  // })
});

function isIpad() {
  return navigator.userAgent.match(/iPhone|iPad|iPod/i);
}

function redraw(url, page) {
  let _cmd = {
    map_view: draw_map_view,
  };
  if (page == "map_view") _cmd[page].call(null, url);
  $.get("ticker_data", function (data) {
    _.each(data, function (d) {
      $("." + d.ticker_id).text(d.msg);
    });
  });
  render_search_bar_template();
}

function parse_url() {
  return g1.url.parse(location.href);
}

function draw_map_view(url, refresh = ["all"]) {
  url = def_params(url);
  let params_dict = def_filters(url),
    params = params_dict.params,
    filter_type = params_dict.filter_type,
    _url = "mapview";
  url = params_dict.url;
  if (!_.includes(["", undefined], url.searchKey.block_level))
    _url = _url + "_block";
  if (
    !_.includes(["", undefined], url.searchKey.division_level) &&
    _.includes(["", undefined], url.searchKey.district_level)
  )
    _url = _url + "_division";
  if (filter_type === "quarter") {
    _url = _url + "_qa";
  } else if (filter_type === "year") {
    _url = _url + "_yr";
  }
  let u_params = parse_url().searchKey;
  if (
    u_params.division_level !== undefined &&
    u_params.district_level == undefined
  ) {
    params.map_id = null;
    params.div_map_id = u_params.division_level;
  } else {
    params.div_map_id = null;
  }
  params = _.pickBy(params, (value) => value !== undefined && value !== null);
  params_dict.bar_params = _.pickBy(
    params_dict.bar_params,
    (value) => value !== undefined && value !== null && value !== ""
  );
  $.getJSON(`${_url}?${$.param(params, true)}`, function (data) {
    if (refresh.indexOf("all") > -1 || refresh.indexOf("table") > -1) {
      draw_indicators_info(
        url,
        data,
        filter_type,
        params_dict.from,
        params_dict.to
      );
      draw_accordion_section(data, url);
    }
    if (
      refresh.indexOf("all") > -1 ||
      refresh.indexOf("rank") > -1 ||
      refresh.indexOf("map") > -1 ||
      refresh.indexOf("trend") > -1
    ) {
      draw_district_ranking(
        params_dict.bar_params,
        url,
        filter_type,
        params_dict.from,
        params_dict.to,
        refresh,
        params_dict.trend_params
      );
    }
  });
}

function def_params(url) {
  let keys = url.searchKey;
  if (url.file != "amethi_map") {
    url = update_url({ clk: "rank" });
  }
  var user = $(".user_name").attr("id");
  $(".user_name").text(user_data.name || user);
  var district_name = "All";
  if (user_data.division != "") district_name = user_data.division;
  else if (user_data.district != "") district_name = user_data.district;
  $(".user-profile").template({
    user_name: user_data.name || user,
    details: {
      mobile: user_data.phonenumber,
      district: district_name,
      designation: user_data.designation || "Admin",
      program: user_data.program || "None",
    },
  });
  $(".mapview-sidenav")
    .on("template", function () {
      $(".user_name").text($(".user_name").attr("id"));
      $(".last_date").text("Jun 2020");
    })
    .template({ user: user_data.designation || "Admin" });
  var user_ = keys.district_level || null,
    user_div = keys.division_level || null;

  if (_.includes([undefined], keys.check)) {
    if (!_.includes([null, ""], user_data.division))
      url = update_url({ check: "yes" });
    else if (!_.includes([null, ""], user_data.district))
      url = update_url({ check: "no" });
  }
  if (keys.check !== "yes") {
    url = update_url({ district_level: user_ });
  } else {
    url = update_url({ division_level: user_div, level: "division" });
    district_data = get_districts();
  }
  return url;
}

function def_filters(url) {
  var user_ = url.searchKey.district_level || user_data.map_id,
    user_div = url.searchKey.division_level || user_data.map_id;

  if (_.includes([undefined], url.searchKey.check)) {
    if (!_.includes([null, ""], user_data.division))
      url = update_url({ check: "yes" });
    else if (!_.includes([null, ""], user_data.district))
      url = update_url({ check: "no" });
  }
  if (url.searchKey.check !== "yes") {
    url = update_url({ district_level: user_ || null });
  } else {
    url = update_url({ division_level: user_div || null, level: "division" });
    district_data = get_districts();
  }

  if (url.searchKey.by === undefined) {
    url = update_url({ by: "performance" });
  }

  let skeys = url.searchKey,
    district_ = skeys.district || "",
    prev_level = {
      block_level: "district_level",
      district_level: "division_level",
    },
    curr_level = get_hierarchy(url),
    ds_level = skeys[curr_level] || skeys[prev_level[curr_level]],
    to_ = skeys.to || default_params.to_,
    from_ = skeys.from || default_params.from_,
    indicator_ = skeys.indicator_id || "",
    type_ = skeys.type || "",
    domain_ = skeys.domain || "",
    filter_type = "date",
    division_ = "",
    params_default,
    params_bar,
    from_trend_,
    params_trend;
  // metric_trend= ((skeys.indicator_id == ''|| skeys.indicator_id == undefined) ? 'composite_index':'perc_point');

  if (
    !_.includes(["", undefined], skeys.division) &&
    _.includes(["", undefined], skeys.district)
  ) {
    division_ = parseInt(skeys.division_level);
  }
  if (
    skeys.month === undefined &&
    skeys.quarter === undefined &&
    skeys.year === undefined
  ) {
    to_ = default_params.to_;
    from_ = default_params.from_;
    params_default = {
      from_date: from_,
      to_date: to_,
      map_id: ds_level,
      div_map_id: division_,
    };
    params_bar = {
      from_date: from_,
      to_date: to_,
      map_id: ds_level,
      div_map_id: division_,
      indicator_id: indicator_,
      type: type_,
      domain: domain_,
    };
    var to_trend_ =
      pad(moment(from_).year() - 2) + "-" + pad(moment(from_).month()) + "-01";
    params_trend = {
      from_date: from_,
      to_date: to_trend_,
      district: district_,
      div_map_id: division_,
      indicator_id: indicator_,
      type: type_,
      domain: domain_,
    };
  } else if (skeys.month !== undefined) {
    from_ = moment(
      skeys.year + "-" + skeys.month + "-01",
      "YYYY-MMM_DD"
    ).format("YYYY-MM-DD");
    to_ = moment(
      skeys.prev_year + "-" + skeys.prev_month + "-01",
      "YYYY-MMM_DD"
    ).format("YYYY-MM-DD");
    params_default = {
      from_date: from_,
      to_date: to_,
      div_map_id: division_,
      map_id: ds_level,
    };
    params_bar = {
      from_date: from_,
      to_date: to_,
      map_id: ds_level,
      div_map_id: division_,
      indicator_id: indicator_,
      type: type_,
      domain: domain_,
    };
    $(".curr").html(moment(from_, "YYYY-MM-DD").format("MMM YYYY"));
    $(".prev").html(moment(to_, "YYYY-MM-DD").format("MMM YYYY"));
    to_trend_ =
      pad(moment(from_).year() - 2) +
      "-" +
      pad(moment(from_).month() + 1) +
      "-01";
    params_trend = {
      from_date: from_,
      to_date: to_trend_,
      district: district_,
      div_map_id: division_,
      indicator_id: indicator_,
      type: type_,
      domain: domain_,
    };
  } else if (skeys.quarter !== undefined) {
    from_ = parseInt(skeys.quarter[1]);
    to_ = parseInt(skeys.prev_quarter[1]);
    params_default = {
      div_map_id: division_,
      from_quater: parseInt(skeys.quarter[1]),
      to_quater: parseInt(skeys.prev_quarter[1]),
      from_year: parseInt(skeys.year),
      to_year: parseInt(skeys.prev_year),
      map_id: ds_level,
    };
    params_bar = {
      div_map_id: division_,
      from_quater: parseInt(skeys.quarter[1]),
      to_quater: parseInt(skeys.prev_quarter[1]),
      from_year: parseInt(skeys.year),
      to_year: parseInt(skeys.prev_year),
      indicator_id: indicator_,
      type: type_,
      domain: domain_,
      map_id: ds_level,
    };
    filter_type = "quarter";
    // from_trend_ = ((skeys.year-1)-2) + '-' + gbl_quarter_map[skeys.quarter]
    from_trend_ = skeys.year - 1 + "-" + gbl_quarter_map[skeys.quarter];
    if (from_ === 4) {
      from_trend_ = skeys.year + "-" + gbl_quarter_map[skeys.quarter];
    }
    to_trend_ = skeys.year - 1 - 2 + "-" + gbl_quarter_map[skeys.quarter];
    params_trend = {
      from_date: from_trend_,
      to_date: to_trend_,
      district: district_,
      indicator_id: indicator_,
      type: type_,
      domain: domain_,
      division: division_,
    };
    $(".curr").html(skeys.year - 1 + " - " + skeys.year + " " + skeys.quarter);
    $(".prev").html(
      skeys.prev_year - 1 + " - " + skeys.prev_year + " " + skeys.prev_quarter
    );
  } else {
    from_ = parseInt(skeys.year);
    to_ = parseInt(skeys.prev_year);
    params_default = {
      div_map_id: division_,
      from_year: parseInt(skeys.year),
      to_year: parseInt(skeys.prev_year),
      map_id: ds_level,
    };
    params_bar = {
      div_map_id: division_,
      from_year: parseInt(skeys.year),
      to_year: parseInt(skeys.prev_year),
      indicator_id: indicator_,
      type: type_,
      domain: domain_,
      map_id: ds_level,
    };
    params_trend = {
      from_year: parseInt(skeys.year),
      to_year: skeys.year - 12,
      div_map_id: division_,
      district: district_,
      indicator_id: indicator_,
      type: type_,
      domain: domain_,
    };
    filter_type = "year";
    $(".curr").html(skeys.year);
    $(".prev").html(skeys.prev_year);
  }
  district_ = default_params.data_map_dist[district_] || district_;

  division_ = skeys.division || "";
  if (
    url.searchKey.district_level === undefined &&
    url.searchKey.division_level === undefined
  ) {
    $("#header-text").html("UTTAR PRADESH");
  }
  if (
    url.searchKey.district_level !== undefined &&
    url.searchKey.block_level === undefined
  ) {
    $.getJSON("district_id_name", function (data) {
      district_ = _.filter(data, { district_id: parseInt(district_) });
      if (district_.length > 0) {
        $("#header-text").html(district_[0]["district_name"]);
      }
    });
  } else if (
    url.searchKey.division_level !== undefined &&
    url.searchKey.block_level === undefined
  ) {
    $.getJSON("division_id_name", function (data) {
      division_ = _.filter(data, { division_id: parseInt(division_) });
      if (division_.length > 0) {
        $("#header-text").html(division_[0]["division_name"]);
      }
    });
  }

  // $('#header-text').html(district_ === '' ? 'UTTAR PRADESH' : ' ' + district_)
  if (gbl_map_selected !== undefined && gbl_map_selected.length > 0) {
    $("#header-text").html(gbl_map_selected[0].district);
  }

  if (!_.includes([undefined, ""], url.searchKey.division_level)) {
    $("#profile_div").hide();
    // $('#rank_div').hide()
    // $('.bla').html('View Division Details')
  } else {
    $("#profile_div").show();
    // $('#rank_div').show()
    // $('.bla').html('View District Details')
  }

  var date_label_text =
    url.searchKey.year !== undefined
      ? url.searchKey.prev_year + " - " + url.searchKey.year
      : 0;
  date_label_text =
    url.searchKey.month !== undefined
      ? url.searchKey.month + " " + url.searchKey.year
      : date_label_text;
  date_label_text =
    url.searchKey.quarter !== undefined
      ? url.searchKey.quarter +
        " " +
        (url.searchKey.year - 1) +
        " - " +
        url.searchKey.year
      : date_label_text;

  $("#date-label").text(date_label_text || default_params.month);

  return {
    url: url,
    params: params_default,
    bar_params: params_bar,
    filter_type: filter_type,
    from: from_,
    to: to_,
    trend_params: params_trend,
  };
}

function update_url(obj) {
  var url = parse_url().update(obj);
  history.pushState({}, "", "?" + url.search);
  return url;
}

function get_drilldown(url) {
  var drill_level = "";
  if (url.searchKey.block_level !== undefined) {
    drill_level = "";
  } else if (
    url.searchKey.district_level !== undefined &&
    url.searchKey.district === undefined
  ) {
    drill_level = "District";
  } else if (
    url.searchKey.division_level !== undefined &&
    url.searchKey.division === undefined
  ) {
    drill_level = "Division";
  }
  return drill_level === "" ? "" : `View ${drill_level} Details`;
}

function pad(n) {
  return n < 10 ? "0" + n : n;
}

function render_search_bar_template() {
  var url = parse_url();
  // $('.search-bar').off('template')
  $(".search-bar")
    .on("template", function () {
      $("#icon").click(function () {
        $("#myInput1").hide();
      });
      $("#icon").click(function () {
        $("#myInput1").show();
        if (url.searchKey.level)
          $("#myInput").attr("placeholder", "Search Division");
      });
      $("#close_nav").click(function () {
        $("#myInput1").hide();
        document.getElementById("myInput").value = "";
        $("#myUL").hide();
      });

      $("#myUL").hide();
      var searchlist = [];
      _.each($("#myUL li"), function (d) {
        searchlist.push($(d).text().trim());
      });
      $("#myInput").autocomplete({
        source: searchlist,
        response: function (event, ui) {
          // ui.content is the array that's about to be sent to the response callback.
          if (ui.content.length === 0) {
            $("#empty-message").text("No results found");
            $("#empty-message").addClass("show");
          } else {
            $("#empty-message").empty();
            $("#empty-message").removeClass("show");
          }
        },
      });
    })
    .template({
      data: district_data,
      area: _.includes([undefined, "", "district"], url.searchKey.level)
        ? "district"
        : "division",
    });
}

function get_districts() {
  var url = parse_url();
  if (typeof user_info != "undefined") {
    var authtype = user_info.user == "CM_Office1" ? "_noauth" : "";
  } else {
    authtype = "";
  }
  if (url.file === "") {
    return fetch_data("districts_all" + authtype, "");
  } else {
    if (url.file !== "amethi_table" && url.file !== "amethi_map") {
      let _list;
      if (_.includes([undefined, "", "district"], url.searchKey.level))
        _list = fetch_data("get_list" + authtype, "")["district"];
      else _list = fetch_data("get_list" + authtype, "")["division"];
      return _list;
    }
  }
}

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
