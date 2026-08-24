/* global Promise, program_config, program_image_mapping, notyfication_, merge_arrays, add_date_text,
render_vega, get_area_chart_spec, helpers_get_, url_update, rename_keys, dropdown_opt_filter,
load_pa_calendar, pa_datepicker, calendar_click, get_multi_line_chart_spec, trigger_submit */
// pa_trigger_submit,
/* exported render_no_data_template, render_score_matrix, get_trend_line_data, render_multi_line_chart, render_area_chart */

var url = g1.url.parse(location.href);
var regions,
  mapping,
  region_scores,
  ind_data,
  data,
  area_chart_data,
  fdate,
  pa_classes,
  compare_type = url.searchKey.comp_type || program_config["compare_type"],
  default_selection = program_config["default_selection"],
  comp_list = url.searchList["comp_list"] || default_selection[compare_type];
let _program = url.searchKey.program || program_config.default_program; // 'MH'
var selected_prog_card = _.filter(program_image_mapping, function (d) {
  if (d.short_name == _program) return d;
});
var default_class = selected_prog_card[0].default_class;
var date = url.searchKey.date || selected_prog_card[0].date,
  cal_type = selected_prog_card[0].cal_type,
  type = url.searchKey.type || selected_prog_card[0].type,
  ind_view = url.searchKey.ind_view || selected_prog_card[0].default_indicator;
var chart_data, up_avg_data;

var opt_list = url.searchList.comp_list || comp_list,
  filter_data = {},
  hier_opt = url.searchKey.hier_opt || "all";
var flag = 0,
  date_format = "YYYY-MM-DD";
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

url_update({
  program: url.searchKey.program || _program,
  class: url.searchKey.class || default_class,
  comp_list: comp_list,
  ind_view: ind_view,
});

$(".compare-h").text(selected_prog_card[0].name + " : " + "Compare");

$(function () {
  render();
  render_score_matrix();
});

function render() {
  render_indictor_class_template();
  comp_area_dropdown();
  load_pa_calendar(cal_type);
  populate_comp_date_label(moment(date), type);
  $(".pa-scorecards").hide();
  var tab = url.searchKey.tab || "score";
  comp_list = url.searchList.comp_list || default_selection[compare_type];
  compare_type = url.searchKey.comp_type || program_config["compare_type"];
  $("#" + tab).show();
  $(".selectpicker#custm-select").selectpicker("val", tab);
  $(".area-type").html(
    '<span class="text-color22">' +
      _.capitalize(compare_type) +
      "s: </span>" +
      _.join(comp_list, " ,")
  );
}

function render_score_matrix() {
  $(".modal-backdrop.fade").remove();
  $(".compare_no_data").template();
  regions = comp_list;
  var indicator_id =
      url.searchKey.indicator_id === "all" ? null : url.searchKey.indicator_id,
    program_area = url.searchKey.program || "MH",
    type = url.searchKey.type || selected_prog_card[0].type;
  date = url.searchKey.date || selected_prog_card[0].date;
  var params = {
    program_area: program_area,
    class: url.searchKey.class === "ALL" ? null : url.searchKey.class,
    indicator_id: indicator_id,
  };
  helpers_get_("pa-indicator-mapping?" + $.param(params, true)).then(function (
    resp
  ) {
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
        add_missing_data(data, comp_list, compare_type, date);
        score_matrix_data();
        chart_data = merge_arrays(
          JSON.parse(response[3]),
          mapping,
          "indicator_id"
        );
        up_avg_data = JSON.parse(response[4]);
        render_indicator_cards(data, regions, chart_data, up_avg_data);
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
  score_matrix_template(ind_data);
}

function score_matrix_template(ind_data) {
  var _id =
    (_.map(ind_data, "indicator_id").includes(parseInt(url.searchKey.ind_view))
      ? url.searchKey.ind_view
      : ind_data[0].indicator_id) ||
    (url.searchKey.class == "MDR" || url.searchKey.class == "Availability"
      ? selected_prog_card[0].default_indicator
      : ind_data[0].indicator_id);
  var _data = _.filter(ind_data, (d) => d.indicator_id == _id);
  $(".score-matrix")
    .one("template", function () {
      render_score_matrix_charts_template(_data);
      _.each($("#pills-tab .indicator-sel"), function (d) {
        if ($(d).hasClass("active")) {
          $("#pills-tab").scrollLeft($(d).offset().left - 20);
        }
      });
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
    })
    .template({
      indicator_data: ind_data,
      _indicator_id: _id,
    });
}

function render_score_matrix_charts_template(ind_data) {
  var _id =
    (_.map(ind_data, "indicator_id").includes(parseInt(url.searchKey.ind_view))
      ? url.searchKey.ind_view
      : ind_data[0].indicator_id) ||
    (url.searchKey.class == "MDR" || url.searchKey.class == "Availability"
      ? selected_prog_card[0].default_indicator
      : ind_data[0].indicator_id);
  var _date = url.searchKey.date;
  $(".score-matrix-charts")
    .one("template", function () {
      $(".selectpicker").selectpicker();
      var from = url.searchKey.from || 0;
      var to = url.searchKey.to || 100;
      render_matrix_colors(from, to);
      populate_comp_date_label(moment(_date), url.searchKey.type || "month");
    })
    .template({
      indicator_data: ind_data,
      data: _.groupBy(region_scores, "indicator_id"),
      compare_type: compare_type,
      region: regions,
      chart_data: area_chart_data,
      _indicator_id: _id,
    });
}

function render_indictor_class_template() {
  // indicator class dropdown
  helpers_get_(
    "pa-indicator-mapping?" +
      $.param({ program_area: url.searchKey.program }, true)
  ).then(function (resp) {
    pa_classes = _.uniq(_.map(JSON.parse(resp), "class"));
    pa_classes.unshift("ALL");
    $(".comp-indicator-class")
      .one("template", function () {
        $("#comp-indicator-select").selectpicker();
      })
      .template({
        pa_classes: pa_classes,
      });
  });
}

function get_area_chart_data(_data, group_id) {
  _data = add_date_text(_data, url.searchKey.type);
  _data = _.groupBy(_data, group_id);
  return _data;
}

function get_trend_line_data(_data, _up_data) {
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

function render_area_chart(_data, placeholder) {
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

function render_no_data_template() {
  $(".no-data")
    .one("template", function () {
      $(".no_data_card").removeClass("d-none");
    })
    .template();
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

// Template cards for Map and trends tab
function render_indicator_cards(_data, regions, _chart_data, _up_data) {
  var data_card = [];
  set_indicator_change(_data, _chart_data, compare_type);
  _data = _.chunk(_data, _data.length);
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
  $(".indicator-cards")
    .one("template", function () {
      var tab = url.searchKey.tab || "score";
      $(".pa-scorecards").hide();
      $("#" + tab).show();
      $(".comp-slider-img, .comp-slider").addClass("d-none");
      $(".slider-div").addClass("d-flex").removeClass("d-none");
      if (tab != "score") {
        $(".indicator-pills").hide();
        $(".comp-slider-img").removeClass("d-none");
        if (tab === "trends") {
          $(".slider-div").removeClass("d-flex").addClass("d-none");
        }
      } else {
        $(".comp-slider").removeClass("d-none");
      }
    })
    .template({
      regions: regions,
      data: data_card,
      chart_data: get_area_chart_data(_chart_data, "indicator_id"),
      up_data: get_area_chart_data(_up_data, "indicator_id"),
      tab: url.searchKey["tab"] || "score",
      comp_type: compare_type,
      color_arr: color_arr,
    });
}

$(".js-range-slider").on("change", function () {
  var from = $(this).val().split(";")[0];
  var to = $(this).val().split(";")[1];
  render_matrix_colors(from, to);
});

// Populates the date label adjacent to calendar icon
function populate_comp_date_label(_date, _type) {
  // Updates default url params if not present
  var sel_f_text, sel_text;
  var url = g1.url.parse(location.href);
  var date = _date || moment(program_config.date);
  var type = _type || program_config.default_type,
    fdate;
  if (type == "month")
    fdate = moment(date).subtract(5, "month").format("YYYY-MM-DD");
  if (type == "quarter")
    fdate = moment(date).subtract(11, "month").format("YYYY-MM-DD");
  else if (type == "year")
    fdate = moment(date).subtract(1, "year").format("YYYY-MM-DD");
  fdate = url.searchKey.fdate || fdate;
  var tab_name = _.includes(url.pathname, "pa-compare"),
    tab = url.searchKey.tab || "score";
  url.update({ date: date.format("YYYY-MM-DD"), type: type, fdate: fdate });
  window.history.pushState({}, "", url.toString());

  // type = year
  // 2018 - 2019
  if (type == "year") {
    if (tab_name == true && tab != "map") {
      sel_f_text = parseInt(moment(fdate).format("YYYY"));
      sel_text = parseInt(moment(date).format("YYYY"));
      $(".date-label, .date_header").text(sel_f_text + " to " + sel_text);
    } else {
      var sel_year = parseInt(moment(date).format("YYYY"));
      $(".date-label, .date_header").text(sel_year + " - " + (sel_year + 1));
    }
  }

  // type = month
  // Jul 2018
  if (type == "month") {
    if (tab_name == true && tab != "map") {
      sel_f_text = moment(fdate).format("MMM YY");
      sel_text = moment(date).format("MMM YY");
      $(".date-label, .date_header").text(sel_f_text + " to " + sel_text);
    } else {
      sel_text = moment(date).format("MMM YYYY");
      $(".date-label, .date_header").text(sel_text);
    }
  }

  // type = quarter
  // Q1 2018 - 2019
  if (type == "quarter") {
    var sel_month_text = moment(date).format("-MM-DD");
    var quart_month = {
      "-04-01": "Q1",
      "-07-01": "Q2",
      "-10-01": "Q3",
      "-01-01": "Q4",
    };
    if (tab_name == true && tab != "map") {
      var ftext = moment(fdate).format("-MM-DD");
      var ttext = moment(date).format("-MM-DD");
      var fquart = quart_month[ftext];
      var tquart = quart_month[ttext];
      var fsel_year = parseInt(moment(fdate).format("YY"));
      var tsel_year = parseInt(moment(date).format("YY"));
      sel_f_text =
        fquart == "Q4"
          ? fquart + " " + (fsel_year - 1)
          : fquart + " " + fsel_year;
      sel_text =
        tquart == "Q4"
          ? tquart + " " + (tsel_year - 1)
          : tquart + " " + tsel_year;
      $(".date-label, .date_header").text(sel_f_text + " to " + sel_text);
    } else {
      var quart_id = quart_month[sel_month_text];
      sel_year = parseInt(moment(date).format("YYYY"));
      var sel_year_text =
        quart_id == "Q4"
          ? sel_year - 1 + " - " + sel_year
          : sel_year + " - " + (sel_year + 1);
      $(".date-label, .date_header").text(quart_id + " " + sel_year_text);
    }
  }
}

// Template call for area dropdown
function comp_area_dropdown() {
  let _url = "district-mapping?_sort=" + compare_type;
  helpers_get_(_url).then(function (resp) {
    var dropdown_data = dropdown_opt_filter(JSON.parse(resp)),
      hier_div = {
        district: ["all", "aspirational", "high_priority"],
        division: ["divisions"],
        block: ["blocks"],
      };
    filter_data = {
      district: {
        all: _.sortBy(dropdown_data["district_all"]),
        aspirational: _.sortBy(dropdown_data["district_asp"]),
        high_priority: _.sortBy(dropdown_data["district_hp"]),
      },
      division: { division: _.sortBy(dropdown_data["division_list"]) },
      block: { block: [] },
    };
    $(".pa_comp_dropdown")
      .one("template", function () {
        $(".district-dropdown-search").search();
        $(".district-dropdown-search").attr(
          "placeholder",
          "Search " + _.upperFirst(url.searchKey.comp_type || "district") + "s"
        );
      })
      .template({
        data: filter_data,
        hier_div: hier_div,
        hier_opt: hier_opt,
        header: ["division", "district", "block"],
        sel_opt: compare_type,
      });
  });
}

// Resetting the dropdown options
function reset_dropdown() {
  url = g1.url.parse(location.href);
  $(".custom-control-input").prop("checked", false);
  var lst = url.searchList.comp_list || default_selection[compare_type],
    _hier_opt = url.searchKey.hier_opt || hier_opt;
  _.each(lst, function (d) {
    $("#customCheck" + _hier_opt + _.replace(d, " ", "_")).prop(
      "checked",
      true
    );
  });
  $(".district-dropdown-search").attr(
    "placeholder",
    "Search " + _.upperFirst(url.searchKey.comp_type || "district") + "s"
  );
  $(" .district-dropdown-search").val("").trigger("change");
}

// Function to add missing map data
function add_missing_data(data, opt_list, opt_type, date) {
  var dist_data = _.map(data[0][data[0]["indicator"]], function (d) {
    return {
      area: d[compare_type],
      area_id: d[compare_type + "_id"],
      map_id: d[compare_type == "division" ? "div_map_id" : "map_id"],
    };
  });
  _.each(data, function (val) {
    opt_list = _.sortBy(opt_list);
    var _list = _.sortBy(_.map(val[val["indicator"]], opt_type));
    if (!_.isEqual(_list, opt_list)) {
      var _missed_opt = _.difference(opt_list, _list),
        options = val[val["indicator"]];
      _.each(_missed_opt, function (area) {
        var area_data = _.filter(dist_data, { area: area })[0];
        if (_.keys(area_data).length) {
          var tmp = {};
          if (opt_type === "division") {
            tmp = {
              division: area,
              division_id: area_data["area_id"],
              div_map_id: area_data["map_id"],
              value: 0,
              date: date,
            };
          } else {
            tmp = {
              district: area,
              district_id: area_data["area_id"],
              map_id: area_data["map_id"],
              value: 0,
              date: date,
            };
          }
          options.push(tmp);
        }
      });
    }
  });
}

$("body")
  // Back arrow link for all pa page
  .on("click", ".back_arrow_link", function () {
    let url_params = {
      program: url.searchKey.program || program_config.default_program,
    };
    location.href = "pa?" + $.param(url_params, true);
  })
  .on("click", ".indicator-sel", function () {
    var _id = $(this).attr("data-value");
    url_update({ ind_view: _id });
    var _data = _.filter(ind_data, (d) => d.indicator_id == _id);
    render_score_matrix_charts_template(_data);
  })
  .on("click", ".indicator-cls", function () {
    var _sel_indicator_class = $(this).text().trim();
    url_update({ class: _sel_indicator_class });
    render_score_matrix();
  })
  // handling url options for dist/div and block
  .on("click", "#pa-pills-tab>li", function () {
    var tmp = $(this).attr("value");
    $("#pa-pills-tab").attr("value", tmp);
    $(".pa-comp-header>.tab-pane").removeClass("show active");
    $(".custom-control-input").prop("checked", false);
    $("#pills-" + tmp).addClass(" show active");
    opt_list = [];
    hier_opt = _.keys(filter_data[tmp])[0];
    var lst = url.searchList.comp_list;
    _.each(lst, function (d) {
      $("#customCheck" + url.searchKey.hier_opt + _.replace(d, " ", "_")).prop(
        "checked",
        true
      );
    });
    $(".district-dropdown-search").val("").trigger("change");
    compare_type = tmp;
    $(".district-dropdown-search").attr(
      "placeholder",
      "Search " + _.upperFirst(tmp || "district") + "s"
    );
  })
  // Handling url area dropdown options
  .on("click", ".comp_opt_type", function () {
    url = g1.url.parse(location.href);
    $(".custom-control-input").prop("checked", false);
    var lst = url.searchList.comp_list;
    hier_opt = $(this).attr("value");
    _.each(lst, function (d) {
      $("#customCheck" + url.searchKey.hier_opt + _.replace(d, " ", "_")).prop(
        "checked",
        true
      );
    });
    $(".district-dropdown-search").val("").trigger("change");
    $(".district-dropdown-search").attr(
      "placeholder",
      "Search " + _.upperFirst(compare_type) + "s"
    );
    opt_list = [];
  })
  // Displaying selected - Area dropdown options
  .on("show.bs.modal", "#area-dropdown", function () {
    reset_dropdown();
  })
  // updating the options list on select/deselect
  .on("click", ".custom-control-input", function () {
    var tmp = $(this).attr("value");
    if (!_.includes(opt_list, tmp)) {
      opt_list.push(tmp);
    } else {
      opt_list = _.filter(opt_list, function (d) {
        return d != tmp;
      });
    }
  })
  // handler for area dropdown submit
  .on("click", ".comp-submit", function () {
    var tmp_lst = opt_list;
    if (tmp_lst.length > 2 && tmp_lst.length <= 6) {
      url_update({
        comp_list: tmp_lst,
        "comp-list": compare_type,
        comp_type: compare_type,
        hier_opt: hier_opt,
      });
      $(".area-type").html(
        '<span class="text-color22">' +
          _.capitalize(compare_type) +
          "s: </span>" +
          _.join(tmp_lst, " ,")
      );
      render();
      render_score_matrix();
    } else {
      notyfication_("error", "At least 3 regions should be selected");
    }
  })
  // Handling the calendar functionality based on Map/trends and Score
  .on("click", ".cal-drpdwn", function () {
    $(".comp-datepicker-container, .datepicker-container").addClass("d-none");
    var tab = url.searchKey["tab"],
      id =
        tab != "map" ? ".comp-datepicker-container" : ".datepicker-container";
    if ($(id).is(":visible")) {
      $(id).addClass("d-none");
      return;
    }
    $(id).removeClass("d-none");
    if (_.includes(["score", undefined, "trends"], tab)) {
      load_pa_calendar(cal_type);
      $(id).removeClass("d-none").css("display", "block");
      $(id).show();
    } else {
      pa_datepicker(cal_type);
      $(id).removeClass("d-none").css("display", "block");
      $(id).show();
      calendar_click();
    }
  })
  // Highlighting the calendar header options
  .on("click", ".cal-nav-pills li", function () {
    type = $(this).data("tab");
    url = g1.url.parse(location.href);
    var sel_tab = url.searchKey.type || "month";
    if (sel_tab !== type) {
      $(".cal-tab-" + type)
        .removeClass("bg-color15 bg-color-21 text-white active")
        .addClass("bg-color14 text-color3");
    }
  })
  // Highlighting the calendar options for Multi select calendar
  .on("click", ".cal-cell", function () {
    if (flag == 0) {
      $(".cal-cell")
        .removeClass("bg-color15 bg-color-21 text-white")
        .addClass("bg-color14 text-color3");
      $(this)
        .removeClass("bg-color14 text-color3")
        .addClass("bg-color15 text-white active");
      flag = 1;
      fdate = moment($(this).data("attr"), date_format);
    } else {
      var curr_date = moment($(this).data("attr"), date_format);
      if (curr_date < fdate) {
        $(".cal-cell")
          .removeClass("bg-color15 text-white")
          .addClass("bg-color14 text-color3");
        $(this)
          .removeClass("bg-color14 text-color3")
          .addClass("bg-color15 text-white active");
        fdate = moment($(this).data("attr"), date_format);
      } else if (curr_date > fdate) {
        date = curr_date;
        $(this).removeClass("bg-color-21").addClass("bg-color15 active");
        flag = 0;
      }
    }
  })
  // Highlighting the calendar
  .on("mouseover", ".cal-cell", function () {
    if (flag) {
      var curr_date = moment($(this).data("attr"), date_format);
      _.each($(".cal-cell"), function (d) {
        var cell_date = moment($(d).data("attr"), date_format);
        if (cell_date > fdate && cell_date <= curr_date) {
          if (url.searchKey.tab !== "map") {
            $(d)
              .removeClass("bg-color14 text-color3")
              .addClass("bg-color-21 text-white");
          }
        } else {
          if (!$(d).hasClass("active"))
            $(d)
              .removeClass("bg-color-21 text-white")
              .addClass("bg-color14 text-color3");
        }
      });
    }
  })
  // Handling URL on apply click calendar
  .on("click", ".apply-date", function () {
    if (url.searchKey.tab == "map") {
      $(".comp-datepicker-container").hide();
      trigger_submit();
      render();
      render_score_matrix();
      return;
    }
    var submt_flag = 0;
    var date_type = $(".cal-id.active").parent().attr("data-tab"),
      date_diff;
    if (flag == 0) {
      var f_date = moment(fdate);
      var tdate = moment(date);
      if (date_type == "year") {
        date_diff = tdate.year() - f_date.year();
      } else if (date_type == "month") {
        date_diff = moment(tdate).diff(moment(fdate), "months", true);
      } else if (date_type == "quarter") {
        date_diff = Math.floor(tdate.diff(f_date, "months") / 3);
      }
      if (date_diff > 0 && date_diff <= 5) {
        url.update({
          type: type,
          fdate: f_date.format(date_format),
          date: tdate.format(date_format),
        });
        window.history.pushState({}, "", url.toString());
        $(".comp-datepicker-container").hide();
        render();
        render_score_matrix();
        populate_comp_date_label(moment(date), date_type);
        submt_flag = 1;
      }
    }
    if (submt_flag == 0) {
      $(".cal-cell")
        .removeClass("bg-color-21 bg-color15 text-white active")
        .addClass("bg-color14 text-color3 ");
      notyfication_(
        "error",
        "Minimum of 2 and maximum of 6 " + date_type + "'s can be selected"
      );
    }
    flag = 0; // resetting flag to 0 on clicking single value and submitting
  })
  //Handler for area Dropdown reset button
  .on("click", ".district-dropdown-reset", function (e) {
    reset_dropdown();
    e.stopPropagation();
  });
