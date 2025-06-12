/* exported color_mapping */
/* global url,render_map,gauage,UI,default_params,format_data,user_data, parse_url */
var color_mapping = {
  Input: "bg-warning",
  "Int Outcome": "bg-danger",
  Outcome: "bg-color10",
  CD: "bg-warning",
  NCD: "bg-danger",
  Nutrition: "bg-color10",
  RMNCH: "bg-color11",
  System: "bg-color12",
};
var indicator_list;
var indicator_id_mapping = {};
var interval;
$("body")
  .urlfilter({
    selector: ".urlfilter",
    target: "pushState",
  })
  .on("urlfilter", render)
  .on("click", ".category-button", function () {
    let by = $(this).attr("id");
    url.update({ by: by });
    window.history.pushState({}, "", url.toString());
    render_left();
  })
  .on("click", ".indicator_list", function () {
    let indicator_id = $(this).attr("id");
    $(".indicator_list")
      .removeClass("tail-rc")
      .removeClass("performance-highlight-color")
      .removeClass("text-light")
      .removeClass("text-dark");
    $(this)
      .addClass("performance-highlight-color")
      .addClass("text-light")
      .addClass("tail-rc");
    if (indicator_id === undefined) {
      url.update({ indicator_id: url.searchKey.indicator_id }, "del");
    } else {
      url.update({ indicator_id: indicator_id });
    }
    nav_bar_indicator_name(indicator_id);
    window.history.pushState({}, "", url.toString());
    render_right();
  })
  .on("click", ".indicator-change-button", function () {
    next_indicator_amethi($(this).attr("id"));
  })
  .on("click", ".bar_click", function () {
    var id_ = $(this).attr("id");
    elements_hide(id_);
    url.update({ block_level: id_ });
    window.history.pushState({}, "", url.toString());
    render_left();
  })
  .on("click", ".back_nav", function () {
    $(this).hide();
    $(".bar_click").css("background-color", "white");
    $(".badge-pill").show();
    $(".leaflet-marker-icon").show();
    $(".leaflet-overlay-pane path").css("opacity", 1);
    url.update({ block_level: url.searchKey.block_level }, "del");
    window.history.pushState({}, "", url.toString());
    render_left();
  })
  .on("click", ".submit", function () {
    let month_value = $("#active").attr("data-attr");
    let year_value = $("#active").attr("data-year");
    let prev_date = moment(year_value + "-" + month_value, "YYYY-MMM").subtract(
      1,
      "month"
    );
    url.update({
      year: year_value,
      month: month_value,
      prev_month: prev_date.format("MMM"),
      prev_year: prev_date.year(),
    });
    render();
  })
  .on("click", "#play_inds", function () {
    $(
      ".leaflet-interactive, .bar_click, .indicator_list, .up_default, .left_accord, .custom-control"
    ).css("pointer-events", "none");
    if ($(".play_text").text().trim() === "Play") {
      $(".play_text").text("Stop");
      $("#play_inds").attr("src", "img/pause.svg");
      interval = setInterval(function () {
        next_indicator_amethi("next-indicator");
      }, 15000);
    } else {
      $(
        ".leaflet-interactive, .bar_click, .indicator_list, .up_default, .left_accord, .custom-control"
      ).css("pointer-events", "auto");
      clearInterval(interval);
      $(".play_text").text("Play");
      $("#play_inds").attr("src", "img/play-button.png");
    }
  })
  .on("click", ".sort-districts-names", function () {
    sort_by_common("district");
  })
  .on("click", ".sort-districts", function () {
    sort_by_common("rank");
  })
  .on("click", ".leaflet-interactive", function () {
    let id_ = $(this).attr("stroke-dasharray").split("_")[0];
    elements_hide(id_);
    url.update({ block_level: id_ });
    window.history.pushState({}, "", url.toString());
    render_left();
  });

function sort_by_common(key) {
  let sort_order = url.searchKey.sort_order || "asc";
  if (url.searchKey.sort_order !== undefined) {
    sort_order = sort_order === "asc" ? "desc" : "asc";
  }
  let bar_chart_data = JSON.parse(localStorage.getItem("bar_chart_data"));
  url.update({ sort_order: sort_order, sort_by: key });
  window.history.pushState({}, "", url.toString());
  bar_chart_template(bar_chart_data);
}

function nav_bar_indicator_name(indicator_id) {
  let indicator_name;
  if (indicator_id === undefined) {
    indicator_name = "AGGREGATE SCORE";
  } else {
    indicator_name = indicator_id_mapping[indicator_id];
  }
  $("#indicator_nav").text(indicator_name);
}

function next_indicator_amethi(id) {
  let indicator_id = url.searchKey.indicator_id;
  let new_indicator;
  if (indicator_id === undefined && id === "next-indicator") {
    new_indicator = indicator_list[0];
  } else {
    if (
      id === "next-indicator" &&
      indicator_list.indexOf(indicator_id) + 1 < indicator_list.length
    ) {
      new_indicator = indicator_list[indicator_list.indexOf(indicator_id) + 1];
    } else if (
      id === "prev-indicator" &&
      indicator_list.indexOf(indicator_id) - 1 >= 0
    ) {
      new_indicator = indicator_list[indicator_list.indexOf(indicator_id) - 1];
    }
  }
  if (new_indicator !== undefined) {
    nav_bar_indicator_name(new_indicator);
    $(".loading-icon").show();
    $(".indicator_list")
      .removeClass("tail-rc")
      .removeClass("performance-highlight-color")
      .removeClass("text-light")
      .removeClass("text-dark");
    $("#" + new_indicator)
      .addClass("performance-highlight-color")
      .addClass("text-light")
      .addClass("tail-rc");
    url.update({ indicator_id: new_indicator });
    window.history.pushState({}, "", url.toString());
    render_right();
  }
}

function elements_hide(id_) {
  $(".bar_click").css("background-color", "white");
  $("#" + id_).css("background-color", "#c5cbdc");
  $(".leaflet-overlay-pane path").css("opacity", "0.1");
  $(".badge-pill").hide();
  $(".leaflet-marker-icon").hide();
  $(".back_nav").attr("style", "z-index: 9999");
  _.each($(".leaflet-overlay-pane path"), function (d) {
    if ($(d).attr("stroke-dasharray").split("_")[0] === id_) {
      $("#" + id_).show();
      $("." + id_)
        .parent()
        .show();
      $(d).css("opacity", "1");
    }
  });
}

$(function () {
  $.get("amethi_ticker_msg", function (data) {
    $(".amethi_ticker_msg").text(data[0].Msg);
  });

  $(".mapview-header")
    .on("template", function () {
      UI.load_calendar();
      $(".quickstats").template();
      $(".insights").template();
      // user_login()
    })
    .template({
      title: "UTTAR PRADESH",
    });
  url.searchKey.by === undefined ? url.update({ by: "performance" }) : "";
  url.update({ district: "Amethi", district_level: "206" });
  render();
});

function user_login() {
  $(".user_name").text(user_data.name || "Admin");
  if ($(".sidenav").length <= 0) {
    $(".user-profile").template({
      user_name: user_data.name || "Admin",
      details: {
        mobile: user_data.phonenumber,
        district: "Amethi",
        designation: user_data.designation || "Admin",
        program: user_data.program || "None",
      },
    });
  }
  if ($(".sidenav").length <= 0) {
    $(".mapview-sidenav")
      .on("template", function () {
        $(".user_name").text($(".user_name").attr("id"));
        $(".last_date").text("Mar 2020");
      })
      .template({ user: user_data.designation || "Admin" });
  }
}

function render() {
  $(".loading-icon").show();
  let date_label_text =
    url.searchKey.month !== undefined
      ? url.searchKey.month + " " + url.searchKey.year
      : default_params.month;
  $("#date-label").text(date_label_text);
  $(".year").parent().removeClass("cursor-pointer");
  $(".quarter").parent().removeClass("cursor-pointer");
  user_login();
  render_left();
  render_right();
}

function render_left() {
  let date = url.searchKey.from || default_params.from_;
  if (url.searchKey.month !== undefined) {
    date = moment(
      url.searchKey.year + "-" + url.searchKey.month + "-01",
      "YYYY-MMM_DD"
    ).format("YYYY-MM-DD");
  }
  const filter_by = url.searchKey["by"];
  var params = { to_date: date };
  let block_level = url.searchKey.block_level;
  var ind_url = "amethi_mapview_indicator";
  var nomralize_val;
  if (block_level !== undefined) {
    ind_url = "amethi_mapview_indicator_block_level";
    params["block_level"] = block_level;
  } else {
    nomralize_val = UI.fetch_data("sum_weightage", params);
    if (nomralize_val.length > 0) {
      nomralize_val = nomralize_val[0]["nomralize_val"];
    }
  }
  var data = UI.fetch_data(ind_url, params);
  $("#header-text").html("Amethi District");
  if (_.isEmpty(data)) {
    $(".no_data_show").removeClass("d-none");
    $(
      "#power-gauge,.legend_pos,.loading-icon,.pos-b,#accordion,#mapid,.barchart_table,.left_accord,.show_text"
    ).hide();
    $(".calender-display").show();
    return false;
  } else {
    $(".no_data_show").addClass("d-none");
    $(
      "#power-gauge,.legend_pos,#accordion,.pos-b,#mapid,.barchart_table,.left_accord,.show_text"
    ).show();
  }
  let composite_score = data[0]["amethi_aggregate_score"];
  let indicator_id = url.searchKey.indicator_id;
  $(".left-section-header")
    .on("template", function () {
      $("#power-gauge svg").remove();
      let gauge_data = {
        circle_value: 100,
        composite_score: composite_score,
        date: date,
        curr_month_normalize: Math.round(_.sumBy(data, "Weight") * 100) / 100,
        nomralize_val: nomralize_val,
      };
      var url = parse_url();
      gauage("#power-gauge", gauge_data, url);
      $("#left-section-nav a").removeClass("active");
      $("#" + filter_by + " a").addClass("active");
    })
    .template({ overall_score: data });
  _.each(data, function (d) {
    indicator_id_mapping[d["indicator_id"]] = d["indicator"];
  });
  data = _.each(data, function (d) {
    d.indicator = d.indicator.replace(
      "% officer-visits conducted (RMNCH+A portal, Darpan App)",
      "% officer-visits conducted (Darpan App)"
    );
  });
  $(".accordion-section")
    .on("template", function () {
      $("#" + indicator_id)
        .addClass("performance-highlight-color")
        .addClass("text-light")
        .addClass("tail-rc")
        .removeClass("text-dark");
    })
    .template({
      accordion_data: data,
      date: date,
      filter_by: filter_by,
      nomralize_val: nomralize_val,
    });
}

function map_center(url, current_mont_data) {
  if ($("#mapid").length <= 0) {
    $(".map-section")
      .on("template", function () {
        $(".rank_details").hide();
        $(".jak").hide();
        $(".map_trend_flex").empty();
        $(".view_facility").hide();
        $(".negative_indication").hide();
        $(".filter_trend").hide();
        $(".type_text").text("Block");
        render_map(url, current_mont_data);
      })
      .template({ trend_vals: [{ name: undefined, map_id: 520 }] });
  } else {
    render_map(url, current_mont_data);
  }
}

function render_right() {
  let from_date = url.searchKey.to || default_params.to_;
  let to_date = url.searchKey.from || default_params.from_;
  if (url.searchKey.month !== undefined) {
    to_date = moment(
      url.searchKey.year + "-" + url.searchKey.month + "-01",
      "YYYY-MMM_DD"
    ).format("YYYY-MM-DD");
    from_date = moment(
      url.searchKey.prev_year + "-" + url.searchKey.prev_month + "-01",
      "YYYY-MMM_DD"
    ).format("YYYY-MM-DD");
  }
  var params = { to_date: to_date, from_date: from_date };
  let indicator_id = url.searchKey.indicator_id;
  nav_bar_indicator_name(indicator_id);
  if (_.includes([undefined, ""], url.searchKey.indicator_id)) {
    var map_url = "amethi_mapview_block_level";
  } else {
    map_url = "amethi_mapview_block_level_indicator";
    params["indicator_id"] = indicator_id;
  }
  var map_data = UI.fetch_data(map_url, params);
  if (
    map_data.length == 0 ||
    (_.uniqBy(map_data, "date").length === 1 && map_data[0]["date"] !== to_date)
  ) {
    $(".no_data_show").removeClass("d-none");
    $(
      "#power-gauge,.legend_pos,.loading-icon,.pos-b,#accordion,#mapid,.barchart_table,.left_accord,.show_text"
    ).hide();
    $(".calender-display").show();
    return;
  } else {
    $(".no_data_show").addClass("d-none");
    $(
      "#power-gauge,.legend_pos,#accordion,.pos-b,#mapid,.barchart_table,.left_accord,.show_text"
    ).show();
  }
  let current_mont_data = _.filter(map_data, { date: to_date });
  $.when(map_center(url, current_mont_data)).then(function () {
    var map_clone = _.cloneDeep(map_data);
    _.each(map_clone, function (d) {
      d["cm_index"] = d["composite_index"];
      d["district"] = d["block"];
      d["id"] = d["map_id"];
      delete d["composite_index"];
      delete d["rank"];
      delete d["map_id"];
      if (_.keys(d).indexOf("rank") === -1) {
        if (indicator_id !== undefined) {
          d["rank"] = d["indicator_rank"];
          delete d["indicator_rank"];
        } else {
          d["rank"] = d["composite_rank"];
          delete d["composite_rank"];
        }
      }
      delete d["block"];
    });
    let map_dict = {
      cm_index: "pm_index",
      perc_point: "perc_point_pm",
      district: "district",
      rank: "prev_rank",
    };
    var bar_chart_data = format_data(
      map_clone,
      params,
      map_dict,
      "district",
      "district"
    );
    bar_chart_template(bar_chart_data);
  });
}

function bar_chart_template(bar_chart_data) {
  localStorage.setItem("bar_chart_data", JSON.stringify(bar_chart_data));
  let indicator_id = url.searchKey.indicator_id;
  var bar_scale = d3.scaleLinear().range([0, 100]);
  let block_level = url.searchKey.block_level;
  let col_name =
    url.searchKey.indicator_id !== undefined ? "perc_point" : "cm_index";
  let col_pm = col_name === "cm_index" ? "pm_index" : "perc_point_pm";
  let ind_max = _.maxBy(bar_chart_data, col_name)[col_name];
  let ind_max_pm = _.maxBy(bar_chart_data, col_pm);
  ind_max_pm = ind_max_pm === undefined ? 0 : ind_max_pm[col_pm];
  ind_max = ind_max > ind_max_pm ? ind_max : ind_max_pm;
  bar_scale.domain([0, ind_max]);
  if (
    url.searchKey["sort_order"] === undefined &&
    url.searchKey["sort_by"] === undefined
  ) {
    bar_chart_data = _.orderBy(bar_chart_data, ["rank"], ["asc"]);
  } else {
    bar_chart_data = _.orderBy(
      bar_chart_data,
      [url.searchKey["sort_by"]],
      [url.searchKey["sort_order"]]
    );
  }
  $(".overall-district-ranking-section")
    .one("template", function () {
      $(".legend_table").css("padding-bottom", "8rem");
      _.each($(".cm_bar_new"), function (d) {
        var bar_width = bar_scale(Number($(d).attr("width")));
        $(d).css("width", bar_width + "%");
      });
      _.each($(".pm_bar_new"), function (d) {
        $(d).css("width", bar_scale(Number($(d).attr("width"))) + "%");
      });
      if (url.file == "amethi_map") {
        $(".curr").html("Current Value");
        $(".prev").html("Previous Value");
      }
      if (url.file == "amethi_map") {
        $(".bar_click").css("background-color", "white");
      } else {
        $(".bar_click").css("opacity", "0.5");
      }
      if (block_level !== undefined) {
        elements_hide(block_level);
      }
      $(".loading-icon").hide();
    })
    .template({
      data: bar_chart_data,
      url_: url,
      size: bar_chart_data.length,
      view: "block",
      district_name_change: {},
      indicator: indicator_id,
      scale: bar_scale,
    });
}
