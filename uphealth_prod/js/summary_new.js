/* globals parse_url, gauage, default_params, gbl_district_name_mapping, render_map, user_data,
  update_url, draw_map_view, get_drilldown, draw_trend, load_calendar, prof_dist, render_search_bar_template, url */
// gbl_color_mapping
/* exported draw_indicators_info, draw_accordion_section, draw_district_ranking,dist_id_name_mapping */

// removing below variables from globals to fix build errors
// pad,gbl_quarter_map, g1,

var gbl_map_selected,
  gbl_indicators_info,
  gbl_curr_state = $(".play_text").text().trim() || "Stop",
  gbl_next_state = gbl_curr_state === "Play" ? "Stop" : "Play",
  gbl_next_img =
    gbl_curr_state === "Play" ? "img/pause.svg" : "img/play-button.png",
  intervalID,
  gbl_metric_map = { asd: "aspirational_districts", hpds: "hpds" },
  // is_map_selected = false,
  map_id_main_id_mapping = {},
  dist_id_name_mapping = {};

$(".mapview-header")
  .one("template", function () {
    $(".quickstats").template({ url: parse_url() });
    load_calendar();
    render_search_bar_template();
  })
  .template({
    title: "UTTAR PRADESH",
    url: parse_url(),
  });

$("body")
  .on("click", ".perf-filter .gauge_click", function () {
    let val = $(this).attr("data-value"),
      _color_for_blck = {
        "t-25": "#098641",
        "m-25": "#FF8E04",
        "b-25": "#C5141D",
      };
    update_url({ perf_filter: val });
    $(".leaflet-overlay-pane path").css("opacity", 0.1);
    $(".leaflet-marker-icon").hide();
    $(".map-back-btn").removeClass("d-none");
    $(
      _.filter($(".leaflet-overlay-pane path"), function (d) {
        if ($(d).attr("fill").toUpperCase() === _color_for_blck[val]) {
          $(`.label_text.${$(d).attr("stroke-dasharray").split("_")[0]}`)
            .parent()
            .show();
          return true;
        }
      })
    ).css("opacity", 1);
  })
  .on("click", ".asd-priority-sel", function () {
    var _val = $(this).attr("data-val"),
      url = update_url({ slider: _val || null, rank_bucket: null });
    if (url.searchKey.chart === "trend") {
      draw_map_view(url, ["trend", "rank", "table"]);
    } else {
      show_asp_priority(_val);
    }
  })
  .on("click", ".category-button", function () {
    $("#left-section-nav a").removeClass("active");
    $(this).children().addClass("active");
    let url = update_url({
      by: $(this).attr("data"),
      domain: null,
      type: null,
    });
    draw_map_view(url, ["table"]);
  })
  .on("click", ".leaflet-overlay-pane path", function () {
    // is_map_selected = true
    $(".map-categories").hide();
    let url = parse_url();
    if (
      $(".alert-info").text() === "No data available" ||
      $(".indicator_list").css("display") === undefined
    ) {
      $(this).css("pointer-events", "none");
      return;
    } else {
      $(this).css("pointer-events", "auto");
    }
    $(".leaflet-interactive").css("opacity", 1);
    _.includes($(".show_text").text(), "Show")
      ? $(".label_text").hide()
      : $(".label_text").show();
    $(".leaflet-overlay-pane path").css("opacity", "0.1");
    $(".leaflet-marker-icon").hide();
    $(this).css("opacity", "1");
    if (url.file == "amethi_map") {
      $(".bar_click").css("background-color", "white");
    } else {
      $(".bar_click").css("opacity", "0.5");
    }
    var id_ = $(this).attr("stroke-dasharray").split("_")[0];
    // _n = $(this).attr('stroke-dasharray').split('_')[1]
    $("." + id_)
      .parent()
      .show();
    $(".badge-pill").hide();
    // var district_name_from_map = $(this).attr('stroke-dasharray').split('_')[1]
    _.each($(".bar_click"), function (d) {
      if ($(d).attr("id") === id_) {
        if (url.file == "amethi_map") {
          $(d).css("background-color", "#c5cbdc");
        } else {
          $(d).css("opacity", "1");
        }
        $("#" + id_).show();
      }
    });
    url = update_url({ [get_hierarchy(url)]: id_, rank_bucket: null });
    $(".map-next-level").html(`${get_drilldown(url)}`);
    $(".map-back-btn").removeClass("d-none").addClass("d-block");
    if (url.searchKey.block_level === undefined) {
      $(".rank_details").removeClass("d-none").addClass("d-block");
      if (url.searchKey.district_level === undefined) {
        $(".profile_div").hide();
      } else {
        $(".profile_div").show();
      }
      var _show_rank = gbl_map_selected.length ? gbl_map_selected[0].rank : "";
      $(".rank_value").html(_show_rank);
    } else {
      $(".rank_details").removeClass("d-block").addClass("d-none");
    }
    draw_map_view(url, ["table", "rank"]);
  })
  .on("click", ".map-view-by", function () {
    gbl_map_selected = [];
    let url = update_url({
      check: $(this).attr("mapview"),
      district_level: null,
      block_level: null,
      division_level: null,
      district: null,
      division: null,
      rank_bucket: null,
      slider: null,
    });
    draw_map_view(url, ["all"]);
  })
  .on("click", ".map-next-level", function () {
    $(".loading-icon").show();
    let url = update_url({ trend_comp: null, rank_bucket: null }),
      _keys = url.searchKey;
    if (_keys.check == "yes" && _.includes(["", undefined], _keys.division)) {
      url = update_url({
        division: map_id_main_id_mapping[parseInt(_keys["division_level"])],
      });
    } else {
      if (
        _.includes(
          ["indicator_31", "indicator_32", "indicator_10"],
          _keys.indicator_id
        )
      ) {
        url = update_url({
          district: map_id_main_id_mapping[parseInt(_keys["district_level"])],
          indicator_id: null,
        });
      } else {
        url = update_url({
          district: map_id_main_id_mapping[parseInt(_keys["district_level"])],
        });
      }
    }
    draw_map_view(url, ["all"]);
  })
  .on("click", ".bar_click", function () {
    var url = parse_url();
    $(".leaflet-interactive").css("opacity", 1);
    _.includes($(".show_text").text(), "Show")
      ? $(".label_text").hide()
      : $(".label_text").show();
    if (url.file == "amethi_map") {
      $(".bar_click").css("background-color", "white");
      $(this).css("background-color", "#c5cbdc");
    } else {
      $(".bar_click").css("opacity", "0.5");
      $(this).css("opacity", "1");
    }
    var id_ = $(this).attr("id");
    $(".leaflet-overlay-pane path").css("opacity", "0.1");
    $(".badge-pill").hide();
    $(".leaflet-marker-icon").hide();
    gbl_map_selected = [
      {
        district: $(this).find("th").text().trim(),
        rank: $(`.rank_${$(this).find("th").parent().attr("id")}`)
          .text()
          .trim(),
      },
    ];
    if ((url.searchKey.chart || "map") === "map") {
      _.each($(".leaflet-overlay-pane path"), function (d) {
        if ($(d).attr("stroke-dasharray").split("_")[0] === id_) {
          // gbl_map_selected = [{district: $(d).attr('stroke-dasharray').split('_')[1]}]
          $("#" + id_).show();
          $("." + id_)
            .parent()
            .show();
          $(d).css("opacity", "1");
        }
      });
    }
    url = update_url({ [get_hierarchy(url)]: $(this).attr("id") });
    $(".map-next-level").html(`${get_drilldown(url)}`);
    $(".map-back-btn").removeClass("d-none").addClass("d-block");
    if (url.searchKey.block_level === undefined) {
      $(".rank_details").removeClass("d-none").addClass("d-block");
      if (url.searchKey.district_level === undefined) {
        $(".profile_div").hide();
      } else {
        $(".profile_div").show();
      }
      var _show_rank = gbl_map_selected.length ? gbl_map_selected[0].rank : "";
      $(".rank_value").html(_show_rank);
    } else {
      $(".rank_details").removeClass("d-block").addClass("d-none");
    }
    draw_map_view(url, ["table", "trend"]);
  })
  .on("click", ".chart-by", function () {
    gbl_map_selected = [];
    var url = update_url({
      chart: $(this).attr("map-val"),
      district_level: null,
      block_level: null,
      division_level: null,
      district: null,
      division: null,
      rank_bucket: null,
      slider: null,
    });
    draw_map_view(url, ["all"]);
  })
  .on("click", ".indicator_list", function () {
    $(".indicator_list")
      .removeClass("tail-rc")
      .removeClass("performance-highlight-color")
      .removeClass("text-light")
      .removeClass("text-dark");
    $(this)
      .addClass("performance-highlight-color")
      .addClass("text-light")
      .addClass("tail-rc");
    var url = update_url({
      indicator_id: $(this).attr("data") || null,
      type: null,
      domain: null,
    });
    draw_map_view(url, ["map", "trend", "rank"]);
  })
  .on("click", ".map-hide-names", function () {
    var url = parse_url(),
      _sec = _.capitalize(get_hierarchy(url).replace("_level", ""));
    if ($(this).hasClass("active")) {
      $(this).removeClass("active");
      $(this).html(`Show ${_sec} Names`);
      $(".label_text").hide();
    } else {
      $(this).addClass("active");
      $(this).html(`Hide ${_sec} Names`);
      $(".label_text").show();
    }
  })
  .on("click", ".rank-bucket", function () {
    var url = update_url({
      rank_bucket: [
        $(this).attr("data-min"),
        $(this).attr("data-max"),
      ].toString(),
    });
    draw_map_view(url, ["rank"]);
  })
  .on("click", ".map-back-btn", function () {
    // console.log(g1.url.parse(location.href))
    // var url = g1.url.parse(location.href)
    // url = url.href
    // url = url.slice(0, url.lastIndexOf('&'))
    // url = g1.url.parse(url)
    var url = parse_url(),
      _l = get_hierarchy(url),
      _remove = {
        type: null,
        domain: null,
        perf_filter: null,
        rank_bucket: null,
        trend_comp: null,
      },
      _p = url.searchKey.check == "yes" ? "division_level" : "district_level",
      _prev_level = {
        division_level: "division_level",
        district_level: _p,
        block_level: "district_level",
      };
    gbl_map_selected = [];
    if (url.searchKey[_l] === undefined) {
      _remove[_l] = null;
      _remove[_l.replace("_level", "")] = null;
      _l = _prev_level[_l];
    }
    _remove[_l] = null;
    _remove[_l.replace("_level", "")] = null;

    url = update_url(_remove);
    // url = update_url({district: url.searchKey.district || null, type: url.searchKey.type || null,
    //   domain:url.searchKey.domain || null, block_level: url.searchKey.block_level || null,
    //   division: url.searchKey.division || null, district_level: url.searchKey.district_level || null,
    //   division_level:url.searchKey.division_level || null, perf_filter:url.searchKey.perf_filter || null})
    // url = update_url({district: null, type: null, domain:null, block_level: null, division: null, district_level: null, division_level:null, perf_filter:null})
    draw_map_view(url, ["all"]);
  })
  .on("click", ".indicator-change-button", function () {
    var sel_el_len = $(".performance-highlight-color").length || 1,
      next_ele;
    if ($(this).attr("id") === "next-indicator") {
      next_ele = $($(".performance-highlight-color")[sel_el_len - 1])
        .parent()
        .next()
        .find(".indicator_list");
    } else {
      next_ele = $($(".performance-highlight-color")[sel_el_len - 1])
        .parent()
        .prev()
        .find(".indicator_list");
    }
    if (next_ele[0] === undefined) {
      $($(".performance-dark-color")[0]).click();
    } else {
      next_ele.click();
    }
    $("#indicator_nav").html(
      next_ele.find('[data-toggle="tooltip"]').attr("title")
    );
  })
  .on("click", "#play_indicator", function () {
    (gbl_curr_state = $(".play_text").text().trim()),
      (gbl_next_state = gbl_curr_state === "Play" ? "Stop" : "Play"),
      (gbl_next_img =
        gbl_curr_state === "Play" ? "img/pause.svg" : "img/play-button.png");
    $(".play_text").text(gbl_next_state);
    $("#play_indicator").attr("src", gbl_next_img);

    if (gbl_next_state === "Stop") {
      intervalID = setInterval(function () {
        $("#next-indicator").click();
      }, 1500);
    } else {
      clearInterval(intervalID);
    }
  })
  .on("click", ".view_prof", function () {
    var url = parse_url(),
      // _dist = url.searchKey.district || "Agra"
      _dist = $("#" + url.searchKey.district_level).text() || "Agra";
    _dist = prof_dist[_dist] === undefined ? _dist : prof_dist[_dist];
    _dist = _dist.trim();
    $.when($.ajax(`profile_data?district=${_dist}`)).then(function (data) {
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
      data = {
        district: _dist,
        header_data: header_data,
        profile_data: profile_data,
      };
      $(".profile-stats")
        .one("template", function () {
          $("#district-stats").show();
        })
        .template({
          data: data,
        });
    });
  })
  .on("click", "#close-profile", function () {
    $("#district-stats").css("display", "none");
  });

// function get_profile_data(district_name) {
//   $.getJSON(`profile_data?district=${district_name}`, function(data) {
//     var profile_data = [],
//       header_data = [],
//       profile_labels = [
//         'IMR', 'NMR', 'U5MR', 'MMR', 'TFR', 'CBR',
//         'Unmet Need for Spacing', 'Unmet Need for Limiting'],
//       top_labels = {
//         'Total Population': 'Estd. Population 2017',
//         'Sex Ratio': 'Sex Ratio',
//         'Literacy Rate': 'Literacy'
//       }

//     _.each(profile_labels, function (d) {
//       var value = (data.length === 0) ? 0 : data[0][d]
//       profile_data.push({ 'name': d, 'value': value })
//     })

//     _.each(top_labels, function (value, key) {
//       var value2 = (data.length === 0) ? 0 : data[0][value]
//       header_data.push({ 'name': key, 'value': value2 })
//     })
//     return {
//       district: district_name,
//       header_data: header_data,
//       profile_data: profile_data
//     }
//   })
// }

function get_hierarchy(url) {
  var _h,
    _keys = url.searchKey;
  if (
    (_keys.division_level === undefined || _keys.division === undefined) &&
    _keys.check === "yes"
  ) {
    _h = "division_level";
  } else if (
    _keys.district_level === undefined ||
    _keys.district === undefined
  ) {
    _h = "district_level";
  } else {
    _h = "block_level";
  }
  return _h;
}

function draw_indicators_info(url, all_data) {
  var overall_score = all_data["overall"],
    skeys = url.searchKey,
    _by = skeys.by;
  if (all_data.overall.length === 2) {
    var change =
        ((_.round(all_data.overall[0].composite_index, 2) -
          _.round(all_data.overall[1].composite_index, 2)) /
          _.round(all_data.overall[1].composite_index, 2)) *
        100,
      text_;
    if (
      skeys.month === undefined &&
      skeys.quarter === undefined &&
      skeys.year === undefined
    ) {
      text_ = "% v/s Previous Month";
    } else if (skeys.month !== undefined) {
      text_ = "% v/s Previous Month";
    } else if (skeys.quarter !== undefined) {
      text_ = "% v/s Previous Quarter";
    } else {
      text_ = "% v/s Previous Year";
    }
    change = _.round(change, 2) + text_;
    var cm_ci_value = all_data.overall[0].composite_index;
    if (!_.includes(["", undefined], skeys.quarter)) {
      if (all_data.overall[0].year > all_data.overall[1].year) {
        cm_ci_value = all_data.overall[0].composite_index;
      } else if (
        all_data.overall[0].year === all_data.overall[1].year ||
        all_data.overall[0].year < all_data.overall[1].year
      ) {
        cm_ci_value = all_data.overall[1].composite_index;
      }
    }
    var gauage_val = parseFloat(cm_ci_value.toFixed(2));
    var gv =
      all_data.overall[1].composite_index * 100 > 100
        ? 100
        : all_data.overall[1].composite_index * 100;
    var gauge_data = {
      circle_value: gv || 0,
      composite_score: gauage_val || 0,
      insights: change,
    };
  } else if (all_data.overall.length === 1) {
    if (
      all_data.overall[0].date ===
      moment(skeys.year + "-" + skeys.month + "-01").format("YYYY-MM-DD")
    ) {
      cm_ci_value = all_data.overall[0].composite_index;
    } else if (!_.includes(["", undefined], skeys.quarter)) {
      if (all_data.overall[0].year === parseInt(skeys.year)) {
        cm_ci_value = all_data.overall[0].composite_index;
      }
    } else if (
      !_.includes(["", undefined], skeys.year) &&
      !_.includes(["", undefined], skeys.prev_year)
    ) {
      cm_ci_value = all_data.overall[0].composite_index;
    }
    gauage_val = _.round(cm_ci_value, 2);
    gauge_data = {
      circle_value: cm_ci_value * 100 || 0,
      composite_score: gauage_val || 0,
      insights: change,
    };
  }
  $(".left-section-header")
    .one("template", function () {
      if (
        !_.includes(["", undefined], skeys.district) ||
        !_.includes(["", undefined], skeys.district_level) ||
        (skeys.check === "yes" &&
          !_.includes(["", undefined], skeys.division_level))
      ) {
        $("#power-gauge svg").remove();
        gauage("#power-gauge", gauge_data, url);
      }
      $(".category-button a").removeClass("active");
      if (_by === undefined || _by === "") {
        $("#type a").addClass("active");
      } else {
        $("#" + _by + " a").addClass("active");
      }
    })
    .template({ overall_score: overall_score });
}

// var get_indicator_list = function(overall_data, url, filter_type, from_) {
//   // var performance_for = url.searchKey.from || "2018-08-01"
//   var data,
//     _by = url.searchKey.by
//   if(_.includes(['', undefined, 'type'], _by)) {
//     data = _.filter(overall_data.indicators_by_type, d => d[filter_type] === from_)
//   } else if (_.includes(['domain'], _by)) {
//     data = _.filter(overall_data.indicators_by_domain, d => d[filter_type] === from_)
//   } else {
//     data = _.filter(overall_data.overall_indicators, d => d[filter_type] === from_)
//     var indicators_order = ["indicator_1", "indicator_2", "indicator_31", "indicator_32", "indicator_4", "indicator_5", "indicator_6", "indicator_7", "indicator_8", "indicator_9", "indicator_10", "indicator_11", "indicator_12", "indicator_13", "indicator_14"];
//     if(!_.includes([undefined, ""], url.searchKey.block_level)){
//       indicators_order = ['indicator_1', 'indicator_22', 'indicator_2', 'indicator_4', 'indicator_5', 'indicator_6', 'indicator_7', 'indicator_8', 'indicator_9', 'indicator_10','indicator_11', 'indicator_12', 'indicator_121', 'indicator_131', 'indicator_141', 'indicator_13', 'indicator_14']
//     }
//     if(!_.includes([undefined, ""], url.searchKey.district)){
//       indicators_order = ['indicator_1', 'indicator_2', 'indicator_31', 'indicator_32', 'indicator_4', 'indicator_5', 'indicator_6', 'indicator_7', 'indicator_8', 'indicator_9', 'indicator_10','indicator_11', 'indicator_12', 'indicator_13', 'indicator_14', 'indicator_22', 'indicator_121', 'indicator_131', 'indicator_141']
//     }
//     data = _.sortBy(data, obj => _.indexOf(indicators_order, obj.indicator_id));
//   }
//   return data
// }

function get_ind_text(url) {
  var _text = "";
  if (gbl_indicators_info !== undefined) {
    if (_.includes(["", undefined], url.searchKey.indicator_id)) {
      _text =
        url.file == "amethi_map"
          ? "Aggregate Score"
          : "Overall Composite Score";
    } else {
      _text = _.filter(gbl_indicators_info, {
        indicator_id: parseInt(url.searchKey["indicator_id"]),
      })[0].indicator;
    }
    _text =
      _text == "1st trim ANC reg. (HMIS)" ||
      _text == "1st trim ANC reg. (RCH portal)"
        ? "ANC Registration within first trimester (against estimated PW)"
        : _text == "Visit on RMNCH+A portal" ||
          _text == "Visit on Darpan & RMNCH+A"
        ? "% officer-visits conducted (RMNCH+A portal, Darpan App)"
        : _text;
  }
  return _text;
}

function draw_accordion_section(overall_data, url) {
  var filter_by = url.searchKey.by;
  var data = overall_data.overall_indicators;
  gbl_indicators_info = _.cloneDeep(data);
  $("#indicator_nav").html(get_ind_text(url));
  var indicator_order = [1, 2, 31, 32, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
  if (!_.includes([undefined, ""], parse_url().searchKey.block_level)) {
    indicator_order = [
      1, 22, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 121, 131, 141, 13, 14,
    ];
  }
  data = _.sortBy(data, function (obj) {
    return _.indexOf(indicator_order, obj.indicator_id);
  });
  let group_key;
  if (filter_by === "type") {
    group_key = "type";
  } else if (filter_by === "domain") {
    group_key = "domain";
  }
  if (filter_by !== "performance") {
    data = _.mapValues(_.groupBy(data, group_key), (clist) =>
      clist.map((data) => _.omit(data, group_key))
    );
  }
  $(".accordion-section")
    .one("template", function () {
      // highlighting the selected indicator from url query    showing_selected_accordion(selected_indicator)
      if (!_.includes([undefined, ""], url.searchKey.type)) {
        _.each($(".checking"), function (d) {
          if ($(d).attr("data-key") === url.searchKey.type) {
            $(".adding-tail").removeClass("tail-rc");
            $(d).addClass("tail-rc");
          }
        });
      } else if (!_.includes([undefined, ""], url.searchKey.domain)) {
        $(".adding-tail").removeClass("tail-rc");
        !_.includes([undefined, ""], url.searchKey.type)
          ? $("#" + url.searchKey.type).addClass("tail-rc")
          : "";
        if (!_.includes([undefined, ""], url.searchKey.domain)) {
          $("#" + url.searchKey.domain).addClass("tail-rc");
        }
        _.each($(".checking"), function (d) {
          if ($(d).attr("data-key") === url.searchKey.domain) {
            $(".adding-tail").removeClass("tail-rc");
            $(d).addClass("tail-rc");
          }
        });
      } else {
        // adding arrow and color for indicator list in by performance
        if (!_.includes([undefined, ""], url.searchKey["indicator_id"])) {
          $(".adding-tail").removeClass("tail-rc");
          $(".indicator_list")
            .removeClass("tail-rc")
            .removeClass("performance-highlight-color")
            .removeClass("text-light");
          if (_.includes([undefined, "type", "domain"], url.searchKey.by)) {
            $("#" + url.searchKey["indicator_id"])
              .addClass("text-light")
              .addClass("tail-rc");
            $("#" + url.searchKey["indicator_id"])
              .parent()
              .parent()
              .addClass("show");
            $("#" + url.searchKey["indicator_id"])
              .parent()
              .parent()
              .parent()
              .find("a")
              .removeClass("collapsed");
            $("#indicator_nav").text(
              $("#" + url.searchKey["indicator_id"]).attr("title")
            );
          } else {
            $("#" + url.searchKey["indicator_id"])
              .addClass("performance-highlight-color")
              .addClass("text-light")
              .addClass("tail-rc");
            $("#indicator_nav").text(
              $("#" + url.searchKey["indicator_id"]).attr("title")
            );
          }
        }
      }
      $(".tooltip").remove();
    })
    .template({
      accordion_data: data,
      url: url,
      filter_by: filter_by,
      overall_score: overall_data.overall,
      accordion_per_change: {},
    });
}

function draw_district_ranking(
  params,
  url,
  filter_type,
  from_,
  to_,
  refresh,
  trend_params
) {
  var type_,
    skeys = url.searchKey,
    district_ = skeys.district || "",
    metric_trend =
      skeys.indicator_id == "" || skeys.indicator_id == undefined
        ? "composite_index"
        : "perc_point",
    def = "composite_index";
  if (
    (!_.includes([undefined, ""], skeys.type) &&
      !_.includes([undefined, ""], skeys.indicator_id)) ||
    (_.includes([undefined, ""], skeys.type) &&
      _.includes([undefined, ""], skeys.domain) &&
      !_.includes([undefined, ""], skeys.indicator_id))
  ) {
    def = "indicator_index";
  }

  if (skeys.check === "yes" && _.includes(["", undefined], skeys.division)) {
    type_ = "division_view";
  } else if (district_ === "") {
    type_ = "district_view";
  } else {
    type_ = "block_view";
  }

  if (filter_type === "quarter") {
    type_ = type_ + "_qa";
  } else if (filter_type === "year") {
    type_ = type_ + "_yr";
  }

  params.map_id = null;
  params.district = url.searchKey.district || "";
  params.division = url.searchKey.division || "";

  if (skeys.check === "yes" && _.includes(["", undefined], skeys.division))
    var parameter = "division";
  else if (!_.includes([undefined, ""], district_)) parameter = "block";
  else parameter = "district";
  params = _.pickBy(
    params,
    (value) => value !== undefined && value !== null && value !== ""
  );
  if (skeys.chart === "trend") {
    let district_avg_api;
    // division_ = !_.includes([undefined, ""], url.searchKey.division) && !_.includes([undefined, ""], url.searchKey.division_level) ? parseInt(url.searchKey.division_level) : "";
    if (filter_type == "date") {
      district_avg_api = "_view";
      // up_trend_ = pad(moment(from_).year()-2) + '-' + pad(moment(from_).month()) + '-01&date<=' + pad(moment(from_).year()) + '-' + pad(moment(from_).month()+2) + '-01'
      // up_params = {'date>': up_trend_,indicator_id: indicator_, domain: domain_, _c: metric_trend + '|avg', _by: 'date&_by=map_id&_by=composite_rank'}
    } else if (filter_type == "quarter") {
      district_avg_api = "_view_qa_trend";
      // up_trend_ = (skeys.year-3)+'-'+'04-01&date<='+(Number(skeys.year)+1)+'-04-01'
      // up_params = {'date>': up_trend_,indicator_id: indicator_, domain: domain_,_c:metric_trend+'|avg',_by:'date&_by=map_id&_by=composite_rank'}
    } else {
      // up_trend_ = ((skeys.year-1)-2)+'-'+ gbl_quarter_map[skeys.quarter] + '&date<='+(skeys.year-1) + '-' + gbl_quarter_map[skeys.quarter]
      // up_params = {'date>': up_trend_, indicator_id: indicator_, domain: domain_, _c: metric_trend + '|avg', _by: 'date&_by=map_id&_by=composite_rank' }
      district_avg_api = "_view_yr";
    }
    district_avg_api = parameter + district_avg_api;
    // trend_params.division = null
    // trend_params.div_map_id = null
    trend_params.district = url.searchKey.district || "";
    trend_params.division = url.searchKey.division || "";
    trend_params = _.pickBy(
      trend_params,
      (value) => value !== undefined && value !== null && value !== ""
    );
    $.getJSON(
      `${district_avg_api}?${decodeURIComponent($.param(trend_params, true))}`,
      function (append_dist_avg) {
        _.each(append_dist_avg.data, function (d) {
          d.date = moment(d.date).format("YYYY-MM-DD");
          if (parameter === "district") {
            map_id_main_id_mapping[d["map_id"]] = d["dist_id"];
            dist_id_name_mapping[d["dist_id"]] = d["district"];
          } else if (parameter === "division") {
            map_id_main_id_mapping[d["map_id"]] = d["div_id"];
            dist_id_name_mapping[d["div_id"]] = d["division"];
          }
        });
        var data_trend = _.cloneDeep(append_dist_avg.data);
        if (skeys.slider !== undefined) {
          var trend_table_data = _.filter(trend_table_data, (d) =>
            _.includes(
              default_params[gbl_metric_map[skeys.slider]].map((d) =>
                parseInt(d)
              ),
              d.map_id
            )
          );
        }
        table_calc(
          url,
          append_dist_avg.data,
          parameter,
          from_,
          to_,
          filter_type,
          def,
          skeys,
          refresh
        );
        $(".map-section")
          .one("template", function () {
            if (
              user_data.district !== "" &&
              user_data.district !== undefined &&
              user_data.district !== null
            ) {
              $('.map-view-by:contains("Division")').hide();
            }

            if (gbl_map_selected.length > 0) {
              $(".trend-legend-comp-sel")
                .removeClass("d-none")
                .addClass("d-flex");
              $("#trend-compare-select")
                .selectpicker()
                .on("loaded.bs.select", function () {
                  var aa =
                    $(this).data("selectpicker").selectpicker.main.elements;
                  _.each(aa, function (d) {
                    if (!$(d).hasClass("dropdown-header")) {
                      $(d).find("a").addClass("text-truncate");
                      $(d).attr("title", $(d).find(".text").text());
                    }
                  });
                });
            }
            var _show_rank = gbl_map_selected.length
              ? gbl_map_selected[0].rank
              : "";
            $(".rank_value").html(_show_rank);
            render_trend(
              url,
              filter_type,
              data_trend,
              filter_type,
              append_dist_avg,
              metric_trend
            );
            $(document).off(
              "hidden.bs.select",
              ".selectpicker#trend-compare-select"
            );
            $(document).on(
              "hidden.bs.select",
              ".selectpicker#trend-compare-select",
              function () {
                $(".loading-icon").show();
                url = update_url({
                  trend_comp: $(this).val().toString() || null,
                });
                // draw_map_view(url, ['trend'])
                render_trend(
                  url,
                  filter_type,
                  data_trend,
                  filter_type,
                  append_dist_avg,
                  metric_trend
                );
                $(".loading-icon").hide();
              }
            );
          })
          .template({
            trend_vals: [],
            url: url,
            viewby: url.searchKey.chart || "map",
            comp_dist: data_trend,
            drop_metric: (get_hierarchy(url) || "").replace("_level", ""),
          });
      }
    );
  } else {
    $.getJSON(`${type_}?${$.param(params, true)}`, function (full_data) {
      var indicator_ranks = [],
        data = full_data.data;
      map_id_main_id_mapping = {};
      _.each(data, function (d) {
        d.date = moment(d.date).format("YYYY-MM-DD");
        if (parameter === "district") {
          map_id_main_id_mapping[d["map_id"]] = d["dist_id"];
          dist_id_name_mapping[d["dist_id"]] = d["district"];
        } else if (parameter === "division") {
          map_id_main_id_mapping[d["map_id"]] = d["div_id"];
          dist_id_name_mapping[d["div_id"]] = d["division"];
        }
      });
      var map_dist = _.filter(data, (d) => d[filter_type] === from_);

      if (refresh.indexOf("all") > -1 || refresh.indexOf("map") > -1) {
        $(".map-section")
          .one("template", function () {
            if (
              user_data.district !== "" &&
              user_data.district !== undefined &&
              user_data.district !== null
            ) {
              $('.map-view-by:contains("Division")').hide();
            }
            render_map(url, map_dist);
            var _show_rank = gbl_map_selected.length
              ? gbl_map_selected[0].rank
              : "";
            $(".rank_value").html(_show_rank);
            if (params.district !== undefined) {
              var new_params = params;
              if (_.includes(_.keys(params), "indicator_id")) {
                new_params["indicator_id2"] = new_params["indicator_id"];
                delete new_params["indicator_id"];
              }
              let rank_url = "district_rank";
              if (filter_type === "date") {
                rank_url = "district_rank";
              } else if (filter_type === "quarter") {
                rank_url = "district_rank_qa";
              } else {
                rank_url = "district_rank_year";
              }
              $.getJSON(
                `${rank_url}?${$.param(new_params, true)}`,
                function (rank_data) {
                  if (rank_data.length > 0) {
                    $(".rank_value").html(rank_data[0]["composite_rank"]);
                  }
                  $(".rank_details").removeClass("d-none");
                }
              );
            }
            check_map_load(function () {
              $(".badge-pill").hide();
              if (url.searchKey["perf_filter"]) {
                $(
                  '.perf-filter .gauge_click[data-value="' +
                    url.searchKey["perf_filter"] +
                    '"]'
                ).click();
              }
              var r = 0,
                o = 0,
                g = 0;
              let _def = ["#C5141D", "#FF8E04", "#098641"];
              _.each($(".leaflet-overlay-pane path"), function (d) {
                if ($(d).attr("fill").toUpperCase() === _def[0]) {
                  r += 1;
                } else if ($(d).attr("fill").toUpperCase() === _def[1]) {
                  o += 1;
                } else if ($(d).attr("fill").toUpperCase() === _def[2]) {
                  g += 1;
                }
              });
              if ($(".up_default")[0] !== undefined) {
                var __text = "Districts";
                if (parse_url().searchKey.check === "yes") __text = "Divisions";

                $(".up_default .gauge_click div")
                  .eq(0)
                  .html(
                    '<span class="first_text">Top </span> <p class="second_text p-0 m-0">' +
                      g +
                      '</p><span class="first_text">' +
                      __text +
                      "</span>"
                  );
                $(".up_default .gauge_click div")
                  .eq(1)
                  .html(
                    '<span class="first_text">Moderate </span><p class="second_text p-0 m-0">' +
                      o +
                      '</p><span class="first_text">' +
                      __text +
                      "</span>"
                  );
                $(".up_default .gauge_click div")
                  .eq(2)
                  .html(
                    '<span class="first_text">Bottom </span><p class="second_text p-0 m-0">' +
                      r +
                      '</p><span class="first_text">' +
                      __text +
                      "</span>"
                  );
              }
              show_asp_priority(url.searchKey.slider);
            });
          })
          .template({
            trend_vals: [],
            url: url,
            viewby: url.searchKey.chart || "map",
          });
      }

      if (
        (!_.includes([undefined, ""], skeys.type) &&
          !_.includes([undefined, ""], skeys.indicator_id)) ||
        (_.includes([undefined, ""], skeys.type) &&
          _.includes([undefined, ""], skeys.domain) &&
          !_.includes([undefined, ""], skeys.indicator_id))
      ) {
        def = "indicator_index";
      }
      if (
        def != "composite_index" &&
        skeys.check === "yes" &&
        parameter == "district"
      ) {
        _.each(data, function (d) {
          if (
            d[filter_type] === from_ &&
            !_.includes(
              [undefined],
              _.find(indicator_ranks, { district: d.district })
            )
          ) {
            d.composite_rank = _.find(indicator_ranks, {
              district: d.district,
            }).indicator_rank;
          }
        });
      }
      // var def = ["#C5141D","#FF8E04","#098641"];
      table_calc(
        url,
        data,
        parameter,
        from_,
        to_,
        filter_type,
        def,
        skeys,
        refresh
      );
    });
  }
}

function show_asp_priority(metric) {
  if (metric === undefined) {
    $(".leaflet-overlay-pane path, .label_text").css("opacity", "1");
    draw_map_view(url, ["rank"]);
    return;
  }
  $(".leaflet-overlay-pane path, .label_text").css("opacity", "0.1");
  _.each($(".leaflet-overlay-pane path"), function (d) {
    if (
      _.includes(
        default_params[gbl_metric_map[metric]],
        $(d).attr("stroke-dasharray").split("_")[0]
      )
    ) {
      $(".label_text." + $(d).attr("stroke-dasharray").split("_")[0]).css(
        "opacity",
        "1"
      );
      $(".label_text." + $(d).attr("stroke-dasharray").split("_")[0])
        .parent()
        .css("opacity", "1");
      $(d).css("opacity", "1");
    }
  });
  draw_map_view(url, ["rank"]);
}

function render_trend(
  url,
  type_,
  data_trend,
  filter_type,
  append_dist_avg,
  append_up_avg,
  metric_trend
) {
  if (
    _.includes(
      [
        "block_view",
        "block_view_yr",
        "block_view_qa",
        "division_view",
        "division_view_yr",
        "division_view_qa",
      ],
      type_
    )
  ) {
    append_dist_avg = rename_key(
      append_dist_avg,
      metric_trend + "|avg",
      metric_trend
    );
    append_up_avg = rename_key(
      append_up_avg,
      metric_trend + "|avg",
      metric_trend
    );
    draw_trend(
      url,
      type_,
      data_trend,
      "#trend",
      filter_type,
      append_dist_avg,
      append_up_avg
    );
  } else if (
    !_.includes(["", undefined], url.searchKey.division) &&
    _.includes(["", undefined], url.searchKey.district)
  ) {
    append_dist_avg = rename_key(
      append_dist_avg,
      metric_trend + "|avg",
      metric_trend
    );
    append_up_avg = rename_key(
      append_up_avg,
      metric_trend + "|avg",
      metric_trend
    );
    draw_trend(
      url,
      type_,
      data_trend,
      "#trend",
      filter_type,
      append_dist_avg,
      append_up_avg
    );
  } else {
    draw_trend(url, type_, data_trend, "#trend", filter_type);
  }
}

function table_calc(
  url,
  data,
  parameter,
  from_,
  to_,
  filter_type,
  def,
  skeys,
  refresh
) {
  var table_data = [];
  _.each(_.groupBy(data, parameter), function (values, key) {
    if (filter_type === "date") {
      var cm_value = _.find(values, { date: from_ });
      var pm_value = _.find(values, { date: to_ });
    } else if (filter_type === "quarter") {
      cm_value = _.find(values, {
        quarter: from_,
        year: parseInt(skeys["year"]),
      });
      pm_value = _.find(values, {
        quarter: to_,
        year: parseInt(skeys["prev_year"]),
      });
    } else {
      cm_value = _.find(values, { year: from_ });
      pm_value = _.find(values, { year: to_ });
    }
    if (url.file != "amethi_map") {
      if (cm_value != undefined) {
        var row = {
          district: key,
          id: cm_value === undefined ? pm_value.map_id : cm_value.map_id,
          rank: cm_value === undefined ? "-" : cm_value.composite_rank,
          cm_index: cm_value === undefined ? 0 : cm_value[def],
          pm_index: pm_value === undefined ? 0 : pm_value[def],
          perc_point: cm_value === undefined ? 0 : cm_value["perc_point"],
          perc_point_pm: pm_value === undefined ? 0 : pm_value["perc_point"],
        };
        table_data.push(row);
      }
    } else {
      if (cm_value != undefined) {
        row = {
          district: key,
          id: cm_value === undefined ? pm_value.map_id : cm_value.map_id,
          rank: cm_value === undefined ? "-" : cm_value.composite_rank,
          cm_index: cm_value === undefined ? "NA" : cm_value[def],
          pm_index: pm_value === undefined ? "NA" : pm_value[def],
          perc_point: cm_value === undefined ? "NA" : cm_value["perc_point"],
          perc_point_pm: pm_value === undefined ? "NA" : pm_value["perc_point"],
        };
        table_data.push(row);
      }
    }
  });
  if (filter_type === "date" && _.find(data, { date: from_ }) === undefined) {
    table_data = [];
  }
  table_data = _.filter(table_data, function (d) {
    return d["cm_index"] !== null;
  });
  if (url.searchKey.indicator_id) {
    table_data = _.orderBy(table_data, ["perc_point", "district"], "desc");
  } else {
    table_data = _.orderBy(table_data, ["cm_index", "district"], "desc");
  }
  var i = 0;
  var default_value = -99;
  table_data = _.filter(table_data, function (d) {
    return d.id !== null;
  });
  _.each(table_data, function (d) {
    if (default_value !== d.cm_index) {
      i += 1;
    }
    if (!(skeys.check === "yes" && parameter == "district")) d.rank = i;
    default_value = d.cm_index;
  });

  if (skeys.indicator_id == 4 || skeys.indicator_id == 13) {
    let order_type = skeys.order_type || default_params.order_type;
    table_data = _.orderBy(table_data, order_type, "desc");
    let min_number = 0;
    var perc_point_t = -989;
    table_data = _.map(table_data, function (d) {
      if (d.perc_point !== perc_point_t) {
        min_number += 1;
      }
      d.rank = min_number;
      perc_point_t = d.perc_point;
      return d;
    });
  }

  if (refresh.indexOf("all") > -1 || refresh.indexOf("rank") > -1) {
    draw_table(url, table_data, from_, to_);
    $(document).off("click", ".sort-districts, .sort-districts-names");
    $(document).on(
      "click",
      ".sort-districts, .sort-districts-names",
      function () {
        var url = parse_url(),
          curr_sort = url.searchKey.sort_order || "asc",
          sort_order,
          rank_metric_map = $(this).hasClass("sort-districts")
            ? "rank"
            : "district";

        if (curr_sort === undefined || curr_sort === "asc") {
          sort_order = "desc";
        } else {
          sort_order = "asc";
        }

        url = update_url({
          sort_order: sort_order,
          order_type: rank_metric_map,
          rank_bucket: null,
        });
        draw_table(url, table_data, from_, to_);
      }
    );
  }
}

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

function draw_table(url, table_data, from_, to_) {
  var skeys = url.searchKey;
  _.each(table_data, function (row) {
    row.cm_index = _.round(row.cm_index, 2);
    row.pm_index = _.round(row.pm_index, 2);
    row.perc_point = _.round(row.perc_point, 2);
    row.perc_point_pm = _.round(row.perc_point_pm, 2);
  });
  var bar_scale = d3.scaleLinear().range([0, 100]);
  var ind_max;
  if (table_data.length) {
    var col_name = skeys.indicator_id ? "perc_point" : "cm_index";
    ind_max = _.maxBy(table_data, col_name)[col_name];
    if (ind_max < 1) ind_max = 1;
    bar_scale.domain([0, ind_max]);
  }
  var view_type;
  if (!_.includes([undefined, ""], skeys.district)) {
    view_type = "block";
  } else if (
    skeys.check === "yes" &&
    _.includes([undefined, ""], skeys.division)
  ) {
    view_type = "division";
  } else {
    view_type = "district";
  }
  var _tmp = skeys[get_hierarchy(url)];
  let district_item = _.filter(table_data, (d) => d.id == _tmp),
    rank_bucket = skeys.rank_bucket,
    order_type = skeys.order_type || default_params.order_type,
    sort_order = skeys.sort_order || "asc";
  // sort_order_district = 'asc';

  rank_bucket = rank_bucket !== undefined ? rank_bucket.split(",") : [0, 20];
  if (order_type === "district") {
    table_data = _.each(table_data, function (d) {
      if (_.includes(Object.keys(gbl_district_name_mapping), d.district))
        d.district = gbl_district_name_mapping[d.district];
      return d;
    });
  }
  gbl_map_selected = _.cloneDeep(district_item);
  // if(skeys.indicator_id == 4 || skeys.indicator_id == 13) {
  //   table_data = _.orderBy(table_data, order_type, skeys.sort_order || 'desc')
  //   let min_number = 1
  //   table_data = _.map(table_data, function(d) {
  //     d.rank = min_number
  //     min_number += 1
  //     return d
  //   })
  // } else {
  //   table_data = _.orderBy(table_data, order_type, sort_order)
  // }
  table_data = _.orderBy(table_data, order_type, sort_order);

  if (district_item.length && !url.searchKey.rank_bucket) {
    // is_map_selected = false
    var select_rank_bucket =
      parseInt(_.findIndex(table_data, { id: district_item[0].id }) / 20) * 20;
    if (select_rank_bucket + 20 <= table_data.length) {
      rank_bucket = [select_rank_bucket, select_rank_bucket + 20];
    } else {
      rank_bucket = [select_rank_bucket, table_data.length];
    }
    // let _offs = Math.max((parseInt((_.findIndex(table_data, {id: district_item[0].id})) / 10) - 1) * 10, 0)
    // rank_bucket = [_offs, _offs + 20]
  }
  let slider = url.searchKey.slider;
  let slider_data = default_params[gbl_metric_map[slider]];
  if (slider) {
    table_data = _.filter(table_data, (d) =>
      _.includes(slider_data, JSON.stringify(d.id))
    );
  }
  var display_data = table_data.slice(rank_bucket[0], rank_bucket[1]);
  // if(sort_order === 'desc') {
  //   display_data = (_.orderBy(table_data, order_type, 'asc').slice(Math.max(rank_bucket[1] - 1, 0), rank_bucket[0])).reverse()
  // } else {
  //   display_data = _.orderBy(table_data, order_type, 'asc').slice(rank_bucket[0], rank_bucket[1])
  // }
  // if(order_type === "rank") {
  //   display_data = _.orderBy(table_data, order_type, sort_order || 'asc').slice(rank_bucket[0], rank_bucket[1])
  // } else {
  //   var district_sorting = _.each(table_data, function(d) {
  //     if (_.includes(Object.keys(gbl_district_name_mapping),d.district))
  //       d.district = gbl_district_name_mapping[d.district]
  //     return d
  //   })
  //   if (district_sorting.length >= 20){
  //     display_data = _.orderBy(district_sorting, 'district', 'asc').slice(rank_bucket[0], rank_bucket[1])
  //   }else{
  //     display_data = _.orderBy(district_sorting, 'district', ((url.file == 'amethi_map') ? skeys.sort_order_district||'desc':'asc'))
  //   }
  //   if(sort_order_district === 'desc' && url.file == 'map_view') {
  //     display_data = (district_sorting.length >= 20) ? _.orderBy(district_sorting, 'district', 'desc').slice(rank_bucket[0], rank_bucket[1]) : display_data = _.orderBy(district_sorting, 'district', (url.file == 'amethi_map')?'rank':'cm_index','desc')
  //   }
  // }
  var from_legend = moment(from_, "YYYY-MM-DD").format("MMM YYYY"),
    to_legend = moment(to_, "YYYY-MM-DD").format("MMM YYYY");

  if (url.searchKey.quarter !== undefined) {
    from_legend =
      url.searchKey.year -
      1 +
      " - " +
      url.searchKey.year +
      " " +
      url.searchKey.quarter;
    to_legend =
      url.searchKey.prev_year -
      1 +
      " - " +
      url.searchKey.prev_year +
      " " +
      url.searchKey.prev_quarter;
  } else if (
    url.searchKey.month === undefined &&
    url.searchKey.year !== undefined
  ) {
    from_legend = url.searchKey.year;
    to_legend = url.searchKey.prev_year;
  }
  $(".overall-district-ranking-section")
    .one("template", function () {
      check_map_load(function () {
        $(`.bar_click.${url.searchKey[get_hierarchy(url)]}`).click();
      });
    })
    .template({
      data: display_data,
      url_: url,
      size: table_data.length,
      view: view_type,
      district_name_change: gbl_district_name_mapping,
      indicator: skeys.indicator_id,
      url: url,
      rank_bucket: rank_bucket,
      bar_scale: bar_scale,
      from_legend: from_legend,
      to_legend: to_legend,
    });
}

function check_map_load(callback) {
  var map_exists_interval = setInterval(function () {
    if ($(".leaflet-interactive").length > 0) {
      clearInterval(map_exists_interval);
      callback();
    }
  }, 300);
}
