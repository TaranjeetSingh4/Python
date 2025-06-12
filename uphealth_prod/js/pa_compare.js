/* global g1,Promise, program_config, url_update, top_panel_dropdown, render_indicators_, render_classes_, screenshot, compute_growth,
helpers_get_, merge_arrays, rename_keys, load_pa_calendar, render_vega, get_multi_line_chart_spec, populate_date_label, get_area_chart_spec,
notyfication_, add_date_text, check_session, program_image_mapping */
/* exported render_score_matrix, render_area_chart, get_trend_line_data, render_multi_line_chart */
//district_dropdown_reset,

var url = g1.url.parse(location.href),
  mapping;
let _program = url.searchKey.program || program_config.default_program; // 'MH'
var selected_prog_card = _.filter(program_image_mapping, function (d) {
  if (d.short_name == _program) return d;
});
var date = url.searchKey.date || selected_prog_card[0].date,
  type = url.searchKey.type || selected_prog_card[0].type,
  compare_type = url.searchKey.comp_type || program_config["compare_type"];
var default_selection = program_config["default_selection"];
var area_chart_data,
  chart_data,
  data,
  regions,
  up_avg_data,
  region_scores,
  ind_data,
  comp_list;
var flag = 0,
  date_format = "YYYY-MM-DD",
  fdate;
let map_config = {
  area: compare_type,
  map_id: "mapid",
  map_type: "topojson",
  map_url: compare_type + "_level",
  data: [],
  color_scale: "linear",
  compare_map: true,
  color_range: ["#fe4c46", "#f0be52", "#5ec620"],
};
$(function () {
  top_panel_dropdown(
    program_config,
    selected_prog_card[0],
    url.searchKey.indicator_id || "all"
  );
  load_pa_calendar(selected_prog_card[0].cal_type);
  populate_date_label(date, type);
  update_dist_url();
});

function render() {
  // if(_.includes(['score', undefined], url.searchKey.tab)) {
  //   $('#cal-icon').removeClass('d-flex').addClass('d-none')
  //   $('#datepicker-icon').removeClass('d-none').addClass('d-flex')
  // } else {
  //   $('#datepicker-icon').removeClass('d-flex').addClass('d-none')
  //   $('#cal-icon').removeClass('d-none').addClass('d-flex')
  // }
  helpers_get_(
    "unique_district_blocks?_by=" + compare_type + "&_c=" + compare_type
  ).then(function (resp) {
    // var options = JSON.parse(resp)
    $(".compare-selection")
      .one("template", function () {
        $(".district-dropdown-search").search();
        $(".district-dropdown-search").attr(
          "placeholder",
          "Search " + _.upperFirst(url.searchKey.comp_type || "district") + "s"
        );
        //Reset dropdown if closed with out submitting..
        $(".comp-list-selected ").selectpicker("val");
        $("body").on("click", function () {
          if ($(".comp-dropdown-menu").hasClass("show")) {
            url = g1.url.parse(location.href);
            comp_list =
              url.searchList["comp_list"] || default_selection[compare_type];
            $(".districts_list .nav-item a")
              .addClass("opacity-30")
              .removeClass("text-primary");
            _.each(comp_list, function (d) {
              $("li[data-val='" + d + "'] a")
                .removeClass("opacity-30")
                .addClass("text-primary");
            });
            //parent.find('.nav .nav-link').addClass('opacity-30').removeClass('text-primary')
          }
        });
        // $('.custom-dropdown').on('hide.bs.dropdown', function () {
        //   let dropdown_id = '#' + $(this).attr('id')
        //   district_dropdown_reset(dropdown_id)
        // })
        // console.log(default_selection, JSON.parse(resp), compare_type)
      })
      .template({
        comp_type: compare_type,
        data: {
          title: compare_type,
          option: JSON.parse(resp),
          opt_type: compare_type,
        },
        // selected_list: [dist1, dist2, dist3]
        selected_list: comp_list,
      });
    $(".custom-dropdown-menu").click(function () {
      $(".custom-dropdown-menu").toggle();
    });
  });
  $(".compare-tab")
    .one("template", function () {
      render_score_matrix();
      $(".js-range-slider").ionRangeSlider({
        type: "double",
        skin: "sharp",
        min: 0,
        max: 100,
        from: url.searchKey.from || 0,
        to: url.searchKey.to || 100,
        onChange: function (data) {
          render_matrix_colors(data.from, data.to);
        },
      });
    })
    .template({ tab: url.searchKey["tab"] || "score" });
}

function update_dist_url() {
  comp_list = url.searchList["comp_list"] || default_selection[compare_type];
  // url_update({ 'd1': dist1,'d2': dist2,'d3': dist3, comp_list: comp_list})
  url_update({ comp_list: comp_list });
  render();
}
function render_score_matrix() {
  $(".compare_no_data").template();
  // regions = [dist1, dist2, dist3]
  regions = comp_list;
  var indicator_id =
      url.searchKey.indicator_id === "all" ? null : url.searchKey.indicator_id,
    program_area = url.searchKey.program || "MH";
  type = url.searchKey.type || selected_prog_card[0].type;
  date = url.searchKey.date || selected_prog_card[0].date;
  var params = {
    program_area: program_area,
    class: url.searchKey.class === "all" ? null : url.searchKey.class,
    indicator_id: indicator_id,
  };
  helpers_get_("pa-indicator-mapping?" + $.param(params, true)).then(function (
    resp
  ) {
    check_session(resp);
    mapping = JSON.parse(resp);
    var ind_ids = indicator_id || _.map(mapping, "indicator_id");
    var state_params = { date: date, indicator_id: ind_ids };
    var best_params = {
      date: date,
      indicator_id: ind_ids,
      _by: "indicator_id",
      _c: "value|max",
    };
    var from_date = "";
    if (type == "month")
      from_date = moment(date).subtract(5, "month").format("YYYY-MM-DD");
    if (type == "quarter")
      from_date = moment(date).subtract(11, "month").format("YYYY-MM-DD");
    else if (type == "year")
      from_date = moment(date).subtract(2, "year").format("YYYY-MM-DD");
    fdate = url.searchKey.fdate || from_date;
    var region_params = {
      "date>~": fdate,
      "date<~": date,
      indicator_id: ind_ids,
    };
    region_params[compare_type] = regions;
    var up_avg = { "date>~": from_date, "date<~": date, indicator_id: ind_ids };
    var params = { "date>~": from_date, "date<~": date, indicator_id: ind_ids };
    params[compare_type] = regions;
    Promise.all([
      helpers_get_(
        program_config["data-file"]["state"][type] +
          "?" +
          $.param(state_params, true)
      ),
      helpers_get_(
        program_config["data-file"][compare_type][type] +
          "?" +
          $.param(best_params, true)
      ),
      helpers_get_(
        program_config["data-file"][compare_type][type] +
          "?" +
          $.param(region_params, true)
      ),
      helpers_get_(
        program_config["data-file"][compare_type][type] +
          "?" +
          $.param(params, true)
      ),
      helpers_get_(
        program_config["data-file"]["state"][type] + "?" + $.param(up_avg, true)
      ),
      helpers_get_(
        program_config["data-file"][compare_type][type] +
          "?" +
          $.param(state_params, true)
      ),
    ])
      .then(function (response) {
        area_chart_data = JSON.parse(response[2]);
        region_scores = _.filter(JSON.parse(response[2]), function (d) {
          return d.date == date;
        });
        region_scores = merge_arrays(
          region_scores,
          rename_keys(JSON.parse(response[1]), { "value|max": "best" }),
          "indicator_id"
        );
        region_scores = merge_arrays(
          region_scores,
          rename_keys(JSON.parse(response[0]), { value: "avg" }),
          "indicator_id"
        );
        region_scores = merge_arrays(region_scores, mapping, "indicator_id");
        region_scores = _.filter(region_scores, function (d) {
          return d.indicator_name;
        });
        _.map(region_scores, function (d) {
          d.dist_best_change = (d.value || 0) - (d.best || 0);
          d.up_avg_change = (d.value || 0) - (d.avg || 0);
        });
        ind_data = _.map(_.uniqBy(region_scores, "indicator_id"), function (e) {
          return _.pick(e, [
            "indicator_id",
            "indicator_name",
            "class",
            "best",
            "avg",
          ]);
        });
        _.map(ind_data, function (d) {
          d.best_dist =
            _.find(JSON.parse(response[5]), function (d1) {
              return d1.indicator_id == d.indicator_id && d1.value == d.best;
            })[compare_type] || "NA";
        });

        if (!_.size(region_scores)) {
          $(".compare-container").addClass("d-none");
          $(".no_data_card").removeClass("d-none");
          $(".auto_insights").template({
            page_name: "compare",
            level: "NA",
            no_data_case: "true",
          });
          return;
        }
        $(".compare-container").removeClass("d-none");
        data = [];
        _.each(
          _.groupBy(region_scores, "indicator_name"),
          function (items, indicator) {
            var row = {
              indicator: indicator,
              indicator_id: items[0]["indicator_id"],
              avg: items[0]["avg"],
              best: items[0]["best"],
              scores: {},
            };
            row[indicator] = items;
            row["best_dist"] =
              _.find(JSON.parse(response[5]), function (d) {
                return (
                  d.indicator_id == items[0]["indicator_id"] &&
                  d.value == items[0]["best"]
                );
              })[compare_type] || "NA";
            _.each(_.groupBy(items, compare_type), function (item, region) {
              row["scores"][region] = item[0]["value"];
            });
            data.push(row);
          }
        );
        score_matrix_data();
        chart_data = merge_arrays(
          JSON.parse(response[3]),
          mapping,
          "indicator_id"
        );
        up_avg_data = JSON.parse(response[4]);
        render_indicator_cards(data, regions, chart_data, up_avg_data);

        // Render Insights - SET 3 - compare view
        var insight_data = merge_arrays(
          JSON.parse(response[3]),
          mapping,
          "indicator_id"
        );
        insights_set_3(insight_data, region_scores, regions);
      })
      .catch(function (error) {
        notyfication_("error", error.name);
      });
  });
}

function score_matrix_data() {
  area_chart_data = merge_arrays(area_chart_data, mapping, "indicator_id");
  area_chart_data = get_area_chart_data(area_chart_data, compare_type);
  _.each(area_chart_data, function (val, key) {
    area_chart_data[key] = _.groupBy(val, "indicator_id");
  });
  _.each(mapping, function (d) {
    var find_ind = _.find(ind_data, function (d1) {
      return d1.indicator_id == d.indicator_id;
    });
    if (!find_ind) {
      ind_data.push(_.pick(d, ["indicator_id", "indicator_name", "class"]));
    }
  });
  ind_data = _.chunk(ind_data, 3);
  score_matrix_template(ind_data[url.searchKey.slide || 0]);
}

function score_matrix_template(ind_data) {
  $(".score-matrix")
    .one("template", function () {
      var from = url.searchKey.from || 0;
      var to = url.searchKey.to || 100;
      render_matrix_colors(from, to);
      var ftext, ttext;
      // dates text in template
      if (type == "month") {
        ftext = moment(fdate).format("MMM-YY");
        ttext = moment(date).format("MMM-YY");
      } else if (type == "quarter") {
        ftext = moment(fdate).format("-MM-DD");
        ttext = moment(date).format("-MM-DD");
        var quart_month = {
          "-04-01": "Q1",
          "-07-01": "Q2",
          "-10-01": "Q3",
          "-01-01": "Q4",
        };
        var fquart = quart_month[ftext];
        var tquart = quart_month[ttext];
        var fsel_year = parseInt(moment(fdate).format("YY"));
        var tsel_year = parseInt(moment(date).format("YY"));
        ftext =
          fquart == "Q4"
            ? fquart + " " + (fsel_year - 1)
            : fquart + " " + fsel_year;
        ttext =
          tquart == "Q4"
            ? tquart + " " + (tsel_year - 1)
            : tquart + " " + tsel_year;
      } else {
        ftext = parseInt(moment(fdate).format("YYYY"));
        ttext = parseInt(moment(date).format("YYYY"));
      }

      $(".score_data").html(ftext + " to " + ttext);
    })
    .template({
      indicator_data: ind_data,
      data: _.groupBy(region_scores, compare_type),
      compare_type: compare_type,
      region: regions,
      chart_data: area_chart_data,
    });
}

function render_area_chart(_data, placeholder) {
  // eslint-disable-line
  // draw area chart
  var _config = {};
  _config.width = $("." + placeholder).width();
  _config.height = $("." + placeholder).height();
  _config.data = _data;
  _config.selected_date = add_date_text([{ date: date }], type);
  var spec = get_area_chart_spec(_config);
  let t_opn = { offsetX: 0, offsetY: -20, direction: "n" };
  render_vega(spec, "." + placeholder, { tooltip: t_opn });
}

function set_indicator_change(_data, _sub_data, key) {
  var prev_date = moment(date).subtract(1, "month").format("YYYY-MM-DD");
  if (type == "quarter")
    prev_date = moment(date).subtract(1, "quarter").format("YYYY-MM-DD");
  else if (type == "year")
    prev_date = moment(date).subtract(1, "year").format("YYYY-MM-DD");
  _sub_data = _.filter(_sub_data, function (d) {
    return d.date == prev_date;
  });
  _.forEach(_data, function (d) {
    d = d[d.indicator];
    _.forEach(d, function (d_temp) {
      var d1 = _.find(_sub_data, function (_d) {
        return (
          d_temp[key] == _d[key] && d_temp["indicator_id"] == _d["indicator_id"]
        );
      });
      if (d1) {
        d_temp.change =
          (((d_temp.value || 0) - (d1.value || 0)) / (d1.value || 0)) * 100;
      }
    });
  });
  return _data;
}

function render_indicator_cards(_data, regions, _chart_data, _up_data) {
  var data_card = [];
  set_indicator_change(_data, _chart_data, compare_type);
  _data = _.chunk(_data, 3);
  _.forEach(_data, function (val, key) {
    var r = {};
    r[key] = val;
    data_card.push(r);
  });
  map_config.area = compare_type;
  map_config.map_url = compare_type + "_level";
  data_card["map_config"] = map_config;
  var color_arr = [
    "#0D72E8",
    "#F46448",
    "#A51B30",
    "#59A600",
    "#20c997",
    "#ffc107",
  ];
  $(".indicator-cards").template({
    regions: regions,
    data: data_card,
    chart_data: get_area_chart_data(_chart_data, "indicator_id"),
    up_data: get_area_chart_data(_up_data, "indicator_id"),
    tab: url.searchKey["tab"] || "score",
    comp_type: compare_type,
    color_arr: color_arr,
  });
}

function get_area_chart_data(_data, group_id) {
  _data = add_date_text(_data, url.searchKey.type);
  _data = _.groupBy(_data, group_id);
  return _data;
}

function get_trend_line_data(_data, _up_data) {
  // eslint-disable-line
  var a_data = [];
  _data = _.values(_.groupBy(_data, "date"));
  for (var [ind, value] of _data.entries()) {
    var t = { month: value[0].date, up_avg: _up_data[ind]["value"] };
    var i = 1;
    var dist = _.sortBy(comp_list);
    value = _.sortBy(value, compare_type);
    _.each(dist, function (d) {
      var filterby_dist = _.filter(value, function (_d) {
        return _d[compare_type] == d;
      });
      if (_.size(filterby_dist) > 0) {
        t["d" + i] = filterby_dist[0][compare_type];
        t["s" + i] = filterby_dist[0].value || 0;
      } else {
        t["d" + i] = d;
        t["s" + i] = 0;
      }
      i++;
    });
    a_data.push(t);
  }
  return a_data;
}

function render_multi_line_chart(_data, placeholder) {
  // eslint-disable-line
  // draw area chart
  var _config = {};
  _config.area = compare_type;
  _config.width = $(placeholder).width();
  _config.height = $(placeholder).height();
  _config.data = _data;
  _config.dist = comp_list;
  // _config.data = _.orderBy(_data, compare_type, 'asc')
  // _config.up_data = up_data
  var chart_options = {
    tooltip: { direction: "s" },
    post_run: function () {
      render_compare_tooltip(placeholder);
    },
  };
  var spec = get_multi_line_chart_spec(_config);
  render_vega(spec, placeholder, chart_options);
}

function render_matrix_colors(from, to) {
  url_update({ from: from, to: to });
  var slider_scale = d3.scaleLinear().range([0, 50, 100]);
  var color_scale = d3.scaleLinear().range(["#FE4C46", "#FFBF55", "#4DC61D"]);
  _.each($(".color-cell"), function (d) {
    var max = $(d).data("max");
    color_scale.domain([0, max / 2, max]);
    slider_scale.domain([0, max / 2, max]);
    var value = $(d).text().trim();
    value = parseInt(value);
    var slider_value = slider_scale(value);
    if (from <= slider_value && to >= slider_value)
      $(d).css("color", color_scale(value));
    else $(d).css("color", "#ccc");
  });
}

$("body")
  .on("change", ".selectpicker", function () {
    let _conf = {};
    _conf[$(this).attr("data-target")] = $(this).val();
    url_update(_conf);
  })
  .on("change", "select.program-selected", function () {
    // Need to add config for other indicators
    render_classes_();
  })
  .on("change", "select.class-selected", function () {
    url_update({ indicator_id: "all", slide: null });
    render_indicators_();
    render_score_matrix();
  })
  .on("change", "select.indicator-selected", function () {
    render_score_matrix();
  })
  .on("click", ".compare-active-tab", function () {
    var activeTab = $(this).attr("data-attr");
    var date_type = $(".cal-id.active").parent().attr("data-tab");
    url_update({ tab: activeTab });
    render();
    populate_date_label(date, date_type);
  })
  .on("click", ".home-btn", function () {
    let url_params = {
      program: url.searchKey.program || program_config.default_program,
      date: url.searchKey.date || program_config.date,
      type: url.searchKey.type || program_config.default_type,
    };
    location.href = "pa?" + $.param(url_params, true);
  })
  .on("click", ".districts_list ul li", function (e) {
    let _dist_selected = $(this).find("a").text();
    if (!_.includes(comp_list, _dist_selected) && comp_list.length >= 6) {
      notyfication_("error", "Maximum of 6 regions can be selected");
      return;
    }
    let parent = $(this).closest(".districts_list");
    if (!_.includes(comp_list, _dist_selected)) {
      $(this).find("a").removeClass("opacity-30").addClass("text-primary");
      comp_list.push(_dist_selected);
    } else {
      $(this).find("a").addClass("opacity-30").removeClass("text-primary");
      _.remove(comp_list, function (d) {
        return d == _dist_selected;
      });
    }
    parent.attr("value", comp_list);
    e.stopPropagation();
  })
  .on("click", ".district-dropdown-submit", function () {
    var id = $(this).attr("data-value");
    if (
      !_.includes(
        ["", null, undefined],
        $("#" + id + " .districts_list").attr("value")
      )
    ) {
      var _url = {};
      _url[id] = $("#" + id + " .districts_list").attr("value");
      url_update(_url);
      $("#" + id + " .nav-select").removeClass("nav-selection-active");
      $("#" + id + " .custom-dropdown-display-text span").html(
        $("#" + id + " .districts_list").attr("value")
      );
      $(this).find(".dropdown-toggle").dropdown("toggle");
      render();
    }
    url_update({ comp_list: comp_list });
    update_dist_url();
  })
  .on("click", ".screenshot", function () {
    var file_name =
      url.searchKey.indicator_id === "all"
        ? "All indicator"
        : mapping[0].indicator_name;
    var tab_name = url.searchKey.tab || "score";
    if (tab_name == "score") {
      screenshot(
        "#pills-score",
        _.replace(
          file_name + "_" + moment().format("MM-DD-YY"),
          new RegExp("/", "g"),
          ","
        )
      );
    } else if (tab_name == "trends") {
      screenshot(
        "#pills-trend",
        _.replace(
          file_name + "_" + moment().format("MM-DD-YY"),
          new RegExp("/", "g"),
          ","
        )
      );
    } else if (tab_name == "map") {
      screenshot(
        "#pills-map",
        _.replace(
          file_name + "_" + moment().format("MM-DD-YY"),
          new RegExp("/", "g"),
          ","
        )
      );
    }
  })
  .on(
    "click",
    "#carouselmap .carousel-control-prev-icon, #carouselmap .carousel-control-next-icon",
    function (e) {
      var slide_num = 0;
      e.stopPropagation();
      if (
        $(".carousel-item.active").index() <
        $("#carouselmap .carousel-item").length - 1
      )
        slide_num = $(".carousel-item.active").index() + 1;
      url_update({ slide: slide_num });
      render_score_matrix();
    }
  )
  .on("changed.bs.select", ".comp-list-selected ", function () {
    compare_type = $(".comp-list-selected ").selectpicker("val");
    var current_type =
      url.searchKey.comp_type == undefined
        ? "district"
        : url.searchKey.comp_type;
    if (compare_type != current_type) {
      url_update({ comp_type: compare_type, comp_list: null });
      update_dist_url();
    }
  })
  .on("click", ".comp-close", function () {
    if (comp_list.length > 3) {
      var item = $(this).attr("id");
      comp_list = _.without(comp_list, item);
      url_update({ comp_list: comp_list });
      update_dist_url();
    } else {
      notyfication_("error", "At least 3 regions should be selected");
      return;
    }
  })
  .on("click", ".leftarrow", function () {
    var slide_num = parseInt(url.searchKey.slide) || 0;
    slide_num = slide_num == 0 ? _.size(ind_data) - 1 : slide_num - 1;
    url_update({ slide: slide_num });
    score_matrix_template(ind_data[slide_num]);
  })
  .on("click", ".rightarrow", function () {
    var slide_num = parseInt(url.searchKey.slide) || 0;
    slide_num = slide_num == _.size(ind_data) - 1 ? 0 : slide_num + 1;
    url_update({ slide: slide_num });
    score_matrix_template(ind_data[slide_num]);
  })
  .on("click", ".hamburger", function () {
    $("#aside-nav").removeClass("d-none");
    $(
      ".user-profile, .versions, .user_manual, .short-video, .long-video, .analytics, .update_text"
    ).addClass("d-none");
    $(".home_tab").text("District Ranking Dashboard");
  })
  .on("click", ".close-icon", function () {
    $("#aside-nav").addClass("d-none");
  })
  .on("click", "#datepicker-icon", function () {
    if (_.includes(["score", undefined, "trends"], url.searchKey["tab"]))
      $(".datepicker-container").show();
    // $('.datepicker-container').toggle()
    else $("#cal-icon").click();
  })
  .on("click", ".cal-nav-pills li", function () {
    type = $(this).data("tab");
    url = g1.url.parse(location.href);
    var sel_tab = url.searchKey.type || "month";
    if (sel_tab !== type) {
      $(".cal-tab-" + type)
        .removeClass("bg-color-15 bg-color-21 text-white active")
        .addClass("bg-color-20 text-color-1");
    }
  })
  .on("click", ".cal-cell", function () {
    if (flag == 0) {
      $(".cal-cell")
        .removeClass("bg-color-15 bg-color-21 text-white")
        .addClass("bg-color-20 text-color-1");
      $(this)
        .removeClass("bg-color-20 text-color-1")
        .addClass("bg-color-15 text-white active");
      flag = 1;
      fdate = moment($(this).data("attr"), date_format);
    } else {
      var curr_date = moment($(this).data("attr"), date_format);
      if (curr_date < fdate) {
        $(".cal-cell")
          .removeClass("bg-color-15 text-white")
          .addClass("bg-color-20 text-color-1");
        $(this)
          .removeClass("bg-color-20 text-color-1")
          .addClass("bg-color-15 text-white active");
        fdate = moment($(this).data("attr"), date_format);
      } else if (curr_date > fdate) {
        date = curr_date;
        $(this).removeClass("bg-color-21").addClass("bg-color-15 active");
        flag = 0;
      }
    }
  })
  .on("mouseover", ".cal-cell", function () {
    if (flag) {
      var curr_date = moment($(this).data("attr"), date_format);
      _.each($(".cal-cell"), function (d) {
        var cell_date = moment($(d).data("attr"), date_format);
        if (cell_date > fdate && cell_date <= curr_date) {
          $(d)
            .removeClass("bg-color-20 text-color-1")
            .addClass("bg-color-21 text-white");
        } else {
          if (!$(d).hasClass("active"))
            $(d)
              .removeClass("bg-color-21 text-white")
              .addClass("bg-color-20 text-color-1");
        }
      });
    }
  })
  .on("click", ".apply-date", function () {
    var submt_flag = 0;
    var date_type = $(".cal-id.active").parent().attr("data-tab"),
      date_diff;
    if (flag == 0) {
      var f_date = moment(fdate);
      var tdate = moment(date);
      if (date_type == "year") {
        date_diff = tdate.year() - f_date.year();
      } else if (date_type == "month") {
        // date_diff = tdate.month() - f_date.month()
        date_diff = moment(tdate).diff(moment(fdate), "months", true);
      } else if (date_type == "quarter") {
        date_diff = Math.floor(tdate.diff(f_date, "months") / 3);
      }
      // console.log(date, "to - > from ", fdate, "::: diff :::: ", date_diff, flag)
      if (date_diff > 0 && date_diff <= 6) {
        url.update({
          type: type,
          fdate: f_date.format(date_format),
          date: tdate.format(date_format),
        });
        // url.update({type: type, fdate: moment(fdate).format(date_format), date: moment(date).format(date_format)})
        window.history.pushState({}, "", url.toString());
        $(".datepicker-container").hide();
        render();
        populate_date_label(date, date_type);
        submt_flag = 1;
      }
    }
    if (submt_flag == 0) {
      $(".cal-cell")
        .removeClass("bg-color-21 text-white active")
        .addClass("bg-color-20 text-color-1 ");
      notyfication_(
        "error",
        "Minimum of 2 and maximum of 6 " + date_type + "'s can be selected"
      );
    }
    flag = 0; // resetting flag to 0 on clicking single value and submitting
  });
// .on("click", ".apply-date", function() {
//   url_update({type: type, fdate: moment(fdate).format(date_format), date: moment(date).format(date_format)})
//   $('.datepicker-container').hide()
//   render()
// })

function insights_set_3(data_6, curr_all_metrics, regions) {
  // Render Insights - SET 3 - Compare view
  url = g1.url.parse(location.href);
  var page_name = "compare";
  var to_date = date; // date is global variable
  var prev_date = moment(to_date).subtract(1, "month").format("YYYY-MM-DD");

  // Insight 13
  // Show this insight only if there are records
  var curr_data = _.filter(data_6, function (d) {
    return d.date == to_date;
  });
  var prev_data = _.filter(data_6, function (d) {
    return d.date == prev_date;
  });
  // Add key 'area' for merging
  _.each(curr_data, function (item) {
    item["area"] = item[compare_type];
  });
  _.each(prev_data, function (item) {
    item["area"] = item[compare_type];
  });
  // determine growth %
  if (_.size(prev_data)) {
    _.each(curr_data, function (item) {
      var prev_val = _.filter(prev_data, {
        indicator_id: item.indicator_id,
        area: item.area,
      });
      prev_val = prev_val[0] ? prev_val[0].value : prev_val;
      item["prev_value"] = prev_val ? prev_val : "NA";
      var growth_diff = compute_growth(item.value, item.prev_value);
      item["change"] = growth_diff["diff"];
      item["sign"] = growth_diff["growth"];
    });
  }
  var finite_change = _.filter(curr_data, function (d) {
    return d.change !== "";
  });
  var positive_change = _.sortBy(
    _.filter(finite_change, { sign: "1" }),
    "change"
  );
  var max_pos_change = positive_change[_.size(positive_change) - 1];
  var positive_text = max_pos_change
    ? max_pos_change[compare_type] +
      " (" +
      _.round(max_pos_change.change, 2) +
      "%)"
    : "";
  var i13 = {
    positive_text: positive_text,
    pos_indicator: max_pos_change ? max_pos_change["indicator_name"] : "",
  };

  // Insight 14
  // Show this insight only if there are records
  var negative_change = _.sortBy(
    _.filter(finite_change, { sign: "-1" }),
    "change"
  );
  var max_neg_change = negative_change[_.size(negative_change) - 1];
  var negative_text = max_neg_change
    ? max_neg_change[compare_type] +
      " (" +
      _.round(max_neg_change.change, 2) +
      "%)"
    : "";
  var i14 = {
    negative_text: negative_text,
    neg_indicator: max_neg_change ? max_neg_change["indicator_name"] : "",
  };

  // Base data for i15,16,17,18
  // Derives metrics for data (avg_growth, avg_diff, best_growth, best_diff)
  _.each(curr_all_metrics, function (item) {
    var up_avg_metrics = compute_growth(item.value, item.avg);
    item["avg_growth"] = up_avg_metrics["growth"];
    item["avg_diff"] = up_avg_metrics["diff"];
    item["avg_change"] = up_avg_metrics["abs_change"];
    var best_metrics = compute_growth(item.value, item.best);
    item["best_growth"] = best_metrics["growth"];
    item["best_diff"] = best_metrics["diff"];
    item["best_change"] = best_metrics["abs_change"];
  });

  // Insight 15
  // Highest Positive jump wrt UP Average
  var positive_data = _.filter(curr_all_metrics, { avg_growth: "1" });
  var pos_metric = _.maxBy(positive_data, "avg_diff");
  var i15 = {
    ind_name: pos_metric ? pos_metric.indicator_name : "",
    area_name: pos_metric
      ? pos_metric[compare_type] + " (" + _.round(pos_metric.value, 2) + ")"
      : "",
  };

  // Insight 16
  // Highest Negative jump wrt UP Average
  var negative_data = _.filter(curr_all_metrics, { avg_growth: "-1" });
  var neg_metric = _.maxBy(negative_data, "avg_diff");
  var i16 = {
    ind_name: neg_metric ? neg_metric.indicator_name : "",
    area_name: neg_metric
      ? neg_metric[compare_type] + " (" + _.round(neg_metric.value, 2) + ")"
      : "",
  };

  // Insight 17
  // Highest Positive jump wrt Best performing area
  positive_data = _.filter(curr_all_metrics, { best_growth: "1" });
  pos_metric = _.maxBy(positive_data, "best_diff");
  var i17 = {
    ind_name: pos_metric ? pos_metric.indicator_name : "",
    area_name: pos_metric
      ? pos_metric[compare_type] + " (" + _.round(pos_metric.value, 2) + ")"
      : "",
  };

  // Insight 18
  // Highest Negative jump wrt Best performing area
  negative_data = _.filter(curr_all_metrics, { best_growth: "-1" });
  neg_metric = _.maxBy(negative_data, "best_diff");
  var i18 = {
    ind_name: neg_metric ? neg_metric.indicator_name : "",
    area_name: neg_metric
      ? neg_metric[compare_type] + " (" + _.round(neg_metric.value, 2) + ")"
      : "",
  };

  $(".auto_insights").template({
    page_name: page_name,
    level: "NA",
    no_data_case: "false",
    regions: regions,
    region_type: compare_type,
    unit: "%",
    to_date: date,
    i13: i13,
    i14: i14,
    i15: i15,
    i16: i16,
    i17: i17,
    i18: i18,
  });
}

function render_compare_tooltip(placeholder) {
  var svg = d3.select(placeholder + " svg"); //".barline svg"
  var tip = d3
    .tip()
    .attr("class", "d3-tip")
    .direction("s")
    .style("d3-tip:after", "d-none")
    .offset([20, 0])
    .html(function (d) {
      var _tootip_html = "<h6> " + d.datum.month + "</h6>";
      _tootip_html += '<table style="width: 100%; font-size: 10px;">';
      _.each(comp_list, function (dist, ind) {
        _tootip_html +=
          '<tr class="tr' +
          (ind + 1) +
          " " +
          d.mark.name +
          '"><td class="text-left">' +
          d.datum["d" + (ind + 1)] +
          "</td>" +
          '<td class="pl-2 text-right">' +
          _.round(d.datum["s" + (ind + 1)], 2) +
          "</td></tr>";
      });
      _tootip_html +=
        '<tr class="tr_up ' +
        d.mark.name +
        '"><td class="text-left"> UP Avg. </td>' +
        '<td class="pl-2 text-right">' +
        _.round(d.datum.up_avg, 2) +
        "</td></tr>";
      _tootip_html += "</table>";
      return _tootip_html;
    });
  svg.call(tip);
  d3.selectAll(".trend-div .mark-symbol path")
    .on("mouseover", tip.show)
    .on("mouseout", tip.hide);
}
