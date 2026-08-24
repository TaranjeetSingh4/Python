/* global merge_arrays, rename_keys, program_config, url_update, helpers_get_, top_panel_dropdown,
  render_vega, get_area_chart_spec, render_block_map,
  url:true, compute_growth, notyfication_, pa_indicator_mapping,
  add_date_text, default_program, program_image_mapping, dropdown_opt_filter, populate_date_label, load_pa_calendar,
  render_profile_map, parse_response, Promise */
/* exported to_date, date_type, render_charts_overview, render_area_chart, _profile_map, hideVegaTooltip, sort_filter */

var data, // eslint-disable-line
  ind_data,
  to_date,
  date_type,
  radial_chart, // eslint-disable-line
  selected_sort,
  insights_1_data,
  _area_filter,
  _dist_selected,
  selected_area;
var indicator_up_avg = "";
url = g1.url.parse(location.href);
// global variables for dropdown filters
var hier_levels = {
    district_all: "district",
    district_asp: "aspirational",
    district_hp: "high_priority",
    division_list: "district",
  },
  dist_type = url.searchKey.area_type || "district_all";
var dist_drpdwn,
  dist_name,
  block_name,
  hier_div_data = {};
var date_range_fetch = {
  month: ["month", 5, 1],
  quarter: ["month", 15, 3],
  year: ["year", 5, 1],
};

let _program = url.searchKey.program || program_config.default_program; // 'MH'
var selected_prog_card = _.filter(program_image_mapping, function (d) {
  if (d.short_name == _program) return d;
});
var default_date = selected_prog_card[0].date,
  default_date_type = selected_prog_card[0].type;
var config = {
  default_district: program_config.default_district,
  area: _.includes(["", null, undefined], url.searchKey.area_selected)
    ? "district"
    : url.searchKey.area_selected,
  view: {
    overview_home: "#home-panel",
    area_profile: "#district-view-section",
    block_view: "#block-view-section",
  },
};
var type_dist = url.searchKey.chart_districts || "all";
url_update({ chart_districts: type_dist });
var asp_high_dist = [];

// ----------- UI Functions -------------- //
function select_nav(nav_id) {
  $(".custom-nav .nav-select").removeClass("nav-selection-active");
  $(nav_id + " .nav-select").addClass("nav-selection-active");
}

// ----------- Doc.onload Functions ------ //
$(function () {
  let _program = url.searchKey.program || default_program; // 'MH'
  // let _indicator_config =
  //   program_config.program_indicator_list[_program]["classes"];
  url_update({ program: _program, date: url.searchKey.date || default_date });
  if (_.includes(["", null, undefined], url.searchKey.area_selected))
    url_update({ area_selected: "district", sort: "score" });
  get_indicator_mapping();
  top_panel_dropdown(program_config, selected_prog_card[0]);
  load_pa_calendar(selected_prog_card[0].cal_type);
  to_date = url.searchKey.date || default_date;
  date_type = url.searchKey.type || default_date_type;
  populate_date_label(to_date, date_type);
  url_update({ type: date_type });
  dist_type = url.searchKey.area_type || dist_type;
  Promise.all([
    helpers_get_("district-mapping?_sort=district"),
    helpers_get_("unique_district_blocks?_by=division&_sort=division"),
  ])
    .then(function (resp) {
      asp_high_dist = JSON.parse(resp[0]);
      // Renders district/division dropdowns
      render_area_dropdown(asp_high_dist);
    })
    .catch(function (error) {
      notyfication_("error", error.name);
    });

  if (_.includes(["", undefined], url.searchKey.area)) {
    url_update({ page: "overview_home" });
    setTimeout(render_overview_charts, 500);
  } else {
    render_district_profile();
  }

  $(".area-selected").text(
    url.searchKey.chart_districts == "all"
      ? "ALL Districts"
      : capitalize_first_char(url.searchKey.chart_districts.replace(/_/g, " "))
  );
});

area_filter();
render_indicator_dropdown();
render_view_class();

// highlight default tabs in top pane (home, drop1, drop2) on default load
highlight_default_tabs();
page_elements_hide();

// ----------- Render Functions ------ //
// District dropdown template call
function render_area_dropdown(data) {
  hier_div_data = {};
  _.each(_.groupBy(data, "division"), function (val, key) {
    hier_div_data[key] = _.map(val, hier_levels[dist_type]);
  });
  dist_drpdwn = dropdown_opt_filter(data);
  district_dropdown_data(dist_drpdwn["district_all"], dist_type);
  block_dropdown_data(hier_div_data);
  if (dist_type != "division_list") {
    $("#pills-contact-tab").addClass("pointer-events-none");
  }
}

function district_dropdown_data(options, area_type) {
  var title = url.searchKey.area || "Select Dist./Div.";
  $(".dist-label").html(title);
  $(".district_custom_dropdown") //Dropdown Template
    .template({
      data: {
        parent_id: "#district_dropdown_1",
        opt_data: options,
        type: area_type,
      },
    });
}

// Block dropdown /district Dropdown 2 template call
function block_dropdown_data(block_data) {
  url = g1.url.parse(location.href);
  var area = url.searchKey.area || "Agra Division";
  var area2 = url.searchKey.area2;
  dist_type = url.searchKey.area_type || dist_type;
  if (dist_type == "division_list") {
    area2 =
      area2 == undefined
        ? "Select Dist./Block"
        : area2 == "all"
        ? "All Blocks"
        : area2;
  } else {
    area2 = area2 || "Select Dist./Block";
    $("#pills-contact-tab").addClass("pointer-events-none");
  }
  $(".block-label").html(area2);
  $(".block_custom_dropdown").template({
    data: _.sortBy(_.keys(block_data)),
    dist_data: dist_drpdwn["district_all"],
    dist_type: dist_type,
    url: url,
    area: _.includes(area, "Division") ? area : area + " Division",
    type: hier_levels[dist_type] || "district",
  });
}

function render_area_details_insights() {
  select_nav("#district_dropdown_2");
  $("#district_dropdown_2 .custom-dropdown-display-text span").html(
    url.searchKey.area2 || "Select Dist./Div."
  );
  $(".districts_list_cards").addClass("d-none");
  $(".indicators_list_cards").removeClass("d-none");
  render_pa_indicator_cards(true);
}

// function render_district_profile(_district) {
function render_district_profile() {
  // render_classes_(true)
  //Change params in URL & set dropdown value to selected district
  url_update({
    area:
      $("#district_dropdown_1 .districts_list").attr("value") ||
      url.searchKey.area,
    area_type:
      $("#district_dropdown_1 .districts_type").attr("value") ||
      url.searchKey.area_type ||
      "district_all",
    page: url.searchKey.page || "area_profile",
  });
  //Set dropdown values
  $("#district_dropdown_1 .custom-dropdown-display-text span").html(
    url.searchKey.area || "Select Dist./Div."
  );
  $(".custom-dropdown-toggle").attr("aria-expanded", "false");
  $(".custom-dropdown-menu").removeClass("show");
  //Render profile page
  // Hide all 3 tab contents
  $(".program-area-view-cards").removeClass("active show");
  $("#district-view-section").addClass("active show");
  select_nav("#district_dropdown_menu1");

  //Renders blocks view
  if (url.searchKey.page === "block_view") {
    $("#block-view-section").addClass("active show");
    $("#district-view-section").removeClass("active show");
  }

  //Render charts
  render_overview_charts();
}

function render_overview_charts() {
  if (!url.searchKey.page || url.searchKey.page === "overview_home") {
    render_pa_select_cards();
    $("#district_dropdown_menu2").css("pointer-events", "none");
  } else if (url.searchKey.page === "area_profile") {
    render_pa_indicator_cards();
    $("#district_dropdown_menu2").css("pointer-events", "all");
  } else {
    $("#district_dropdown_menu2").css("pointer-events", "all");
    render_pa_select_cards(true);
    if (url.searchKey.block_details) {
      render_area_details_insights();
    }
  }
}

function check_na_data(_test_data) {
  //Check if entire data has 'null' values
  var check = _.groupBy(_test_data, function (row) {
    return row.value == null; // || row.value == 0
  });
  var check2 = _.groupBy(_test_data, function (row) {
    return row.value == 0;
  });
  if (
    _test_data.length === 0 ||
    (check.true && !check.false) ||
    (check2.true && !check2.false)
  ) {
    // Show "Data Not Available" section
    $(".program-area-view-cards").removeClass("active show");
    $("#notification-section").addClass("active show");
    return true;
  } else {
    $(".program-area-view-cards").removeClass("active show");
    $(config.view[url.searchKey.page]).addClass("active show");
    return false;
  }
}

function render_pa_select_cards(render_blocks) {
  let _area = render_blocks ? "district" : url.searchKey.area_selected; // config.area
  to_date = url.searchKey["date"] || default_date;
  date_type = url.searchKey["type"] || default_date_type;
  selected_sort = url.searchKey["sort"] || "score";
  var from_date = "";
  var sel_range = date_range_fetch[date_type];
  from_date = moment(to_date)
    .subtract(sel_range[1], sel_range[0])
    .format("YYYY-MM-DD");

  var params = {
    "date>~": from_date,
    "date<~": to_date,
    indicator_id: url.searchKey["indicator_id"],
  };
  let dist = asp_high_dist;
  if (url.searchKey.page === "overview_home" && type_dist != "all") {
    dist = _.filter(asp_high_dist, (item) => item[type_dist]);
    params["district"] = dist.map((value) => value.district);
  }
  let get_all_dist = dist.map((value) => value[_area]);
  var param = { date: to_date, indicator_id: url.searchKey["indicator_id"] };
  var param_prev = {
    date: moment(to_date)
      .subtract(sel_range[2], sel_range[0])
      .format("YYYY-MM-DD"),
    indicator_id: url.searchKey["indicator_id"],
  };

  var params_url =
    program_config["data-file"][_area][date_type] + "?" + $.param(params, true);
  Promise.all([
    helpers_get_("pa-indicator-mapping"),
    helpers_get_(
      program_config["data-file"]["state"][date_type] +
        "?" +
        $.param(param, true)
    ),
    helpers_get_(params_url),
    helpers_get_(
      program_config["data-file"]["state"][date_type] +
        "?" +
        $.param(param_prev, true)
    ),
    helpers_get_(
      "district-mapping?_sort=district&division=" + url.searchKey.area
    ),
  ])
    .then(function (resp) {
      var data = JSON.parse(resp[2]);
      data = merge_arrays(data, JSON.parse(resp[0]), "indicator_id");
      var _data = _.filter(data, function (d) {
        return d.date == to_date;
      });
      var add_all = [];
      if (_.size(_data) != _.size(get_all_dist)) {
        _.each(get_all_dist, function (d) {
          var w = _.find(_data, function (d1) {
            return d1[_area] == d;
          });
          if (!w) {
            var dist_detail = _.find(dist, function (d1) {
              return d1[_area] == d;
            });
            dist_detail = _.pick(dist_detail, [_area, "map_id", "div_map_id"]);
            dist_detail["date"] = to_date;
            dist_detail["indicator_id"] = parseInt(
              url.searchKey["indicator_id"]
            );
            add_all.push(dist_detail);
          }
        });
        add_all = merge_arrays(add_all, JSON.parse(resp[0]), "indicator_id");
      }
      _data = _.concat(_data, add_all);
      var prev_date;
      if (date_type == "month")
        prev_date = moment(to_date).subtract(1, "month").format("YYYY-MM-DD");
      if (date_type == "quarter")
        prev_date = moment(to_date).subtract(3, "month").format("YYYY-MM-DD");
      if (date_type == "year")
        prev_date = moment(to_date).subtract(1, "year").format("YYYY-MM-DD");

      var prev_data = _.filter(data, function (d) {
        return d.date == prev_date;
      });
      _data = set_indicator_change(_data, prev_data, _area);
      var ind_name = _.find(ind_data, function (d) {
        return d.indicator_id == url.searchKey["indicator_id"];
      });
      var up_avg = JSON.parse(resp[1])[0] ? JSON.parse(resp[1])[0].value : "-";
      var up_avg_prev = JSON.parse(resp[3])[0]
        ? JSON.parse(resp[3])[0].value
        : "-";

      if (render_blocks) {
        let districts_list = JSON.parse(resp[4]);
        let filter_districts = [];
        _.each(districts_list, function (d1) {
          _.each(_data, function (d2) {
            if (d1.district === d2.district) filter_districts.push(d2);
          });
        });
        _data = filter_districts;
      }
      _data = order_data(_data, "indicator");
      var _config = {
        area: _area,
        temp_data: _data,
        block_break: render_blocks,
        ind_name: ind_name.indicator_name || "",
        ind_class: ind_name.class || "",
        up_avg: up_avg,
        chart_data: get_area_chart_data(data, _area),
        placeholder: render_blocks
          ? ".pa-indicator-card-block"
          : ".pa-indicator-card",
        id: render_blocks ? "indicator_sort_block" : "indicator_sort_home",
        view_name: render_blocks ? "v3" : "v1",
      };
      render_card_templates(_config);
      // Render Insights - SET 1 - UP Overview
      insights_1_data = {
        curr_data: _data,
        prev_data: prev_data,
        up_avg: up_avg,
        up_avg_prev: up_avg_prev,
      };
      insights_set_1(insights_1_data);
    })
    .catch(function (error) {
      notyfication_("error", error.name);
    });
}

function render_pa_indicator_cards(render_block_details) {
  to_date = url.searchKey["date"] || default_date;
  date_type = url.searchKey["type"] || default_date_type;
  selected_sort = url.searchKey["sort"] || "score";
  if (_.includes(["alphabetic_desc", "alphabetic"], selected_sort)) {
    url_update({ sort: "score" });
    selected_sort = "score";
  }
  let _area = render_block_details ? "district" : config.area;
  var from_date = "";
  if (date_type == "month")
    from_date = moment(to_date).subtract(5, "month").format("YYYY-MM-DD");
  if (date_type == "quarter")
    from_date = moment(to_date).subtract(15, "month").format("YYYY-MM-DD");
  if (date_type == "year")
    from_date = moment(to_date).subtract(5, "year").format("YYYY-MM-DD");

  var params = {
    "date>~": from_date,
    "date<~": to_date,
    [_area]: render_block_details ? url.searchKey.area2 : url.searchKey.area,
    "indicator_id!": [7, 8],
  };
  var param = {
    date: to_date,
    [_area]: render_block_details ? url.searchKey.area2 : url.searchKey.area,
  };
  var indicator_data_url =
    program_config["data-file"][_area][date_type] + "?" + $.param(params, true);
  var get_prog_class = "program_area"; //url.searchKey.class == 'all' ? 'program_area' : 'class'
  _.filter(pa_indicator_mapping, function (row) {
    if (row[get_prog_class] === url.searchKey[get_prog_class])
      indicator_data_url += "&indicator_id=" + row.indicator_id;
  });
  Promise.all([
    helpers_get_("pa-indicator-mapping"),
    helpers_get_(
      program_config["data-file"]["state"][date_type] +
        "?" +
        $.param(param, true)
    ),
    helpers_get_(indicator_data_url),
  ])
    .then(function (resp) {
      var data = JSON.parse(resp[2]);
      data = merge_arrays(data, JSON.parse(resp[0]), "indicator_id");
      var _data = _.filter(data, function (d) {
        return d.date == to_date;
      });
      _data = merge_arrays(
        _data,
        rename_keys(JSON.parse(resp[1]), { value: "avg", rank: "up_rank" }),
        "indicator_id"
      );

      if (date_type == "month")
        var prev_date = moment(to_date)
          .subtract(1, "month")
          .format("YYYY-MM-DD");
      if (date_type == "quarter")
        prev_date = moment(to_date).subtract(3, "month").format("YYYY-MM-DD");
      if (date_type == "year")
        prev_date = moment(to_date).subtract(1, "year").format("YYYY-MM-DD");

      var prev_data = _.filter(data, function (d) {
        return d.date == prev_date;
      });
      _data = set_indicator_change(_data, prev_data, "indicator_id");
      _data = order_data(_data, _area);

      var _config = {
        area: _area,
        temp_data: _data,
        block_break: render_block_details,
        ind_name:
          (render_block_details ? url.searchKey.area2 : url.searchKey.area) ||
          "",
        // indicator_data: ind_data,
        chart_data: get_area_chart_data(data, "indicator_id"),
        placeholder: render_block_details
          ? ".pa-district-card-block"
          : ".pa-district-card",
        id: render_block_details ? "district_sort_block" : "district_sort_home",
        view_name: render_block_details ? "v4" : "v2",
      };
      render_card_templates(_config);
      // Render Insights - SET 2 - District Overview
      insights_set_2(_data, prev_data);
    })
    .catch(function (error) {
      notyfication_("error", error.name);
    });
}

function render_card_templates(_config) {
  if (check_na_data(_config.temp_data)) return;
  $(_config.placeholder)
    .one("template", function () {
      var _option = program_config.indicator_sort_options;
      $(".sort-drop-up")
        .one("template", function () {
          if (
            _config.id &&
            !_.includes(
              ["indicator_sort_home", "indicator_sort_block"],
              _config.id
            )
          ) {
            $(".sort_list ul li")
              .find("a[value=alphabetic_desc], a[value=alphabetic]")
              .hide();
          }
          if (_.size(_config.temp_data) < 10) {
            $(".sort_list ul li").find("a[value=bottom], a[value=top]").hide();
          }
        })
        .template({
          id: _config.id,
          options: _option,
          selected_opt: selected_sort,
        });

      setTimeout(function () {
        if (
          url.searchKey.page == "area_profile" ||
          url.searchKey.block_details == "true"
        ) {
          highlight_selected_indicator_District();
        }
      }, 500);
    })
    .template(_config);
}

function order_data(_data, type) {
  var orderBy = _.includes(["change", "change_desc"], selected_sort)
    ? "change"
    : "rank";
  var by = "asc";
  if (selected_sort == "alphabetic" || selected_sort == "alphabetic_desc")
    orderBy =
      type == "indicator"
        ? config.area == "division"
          ? "district"
          : config.area
        : "indicator_name";
  if (
    _.includes(
      ["low_high", "bottom", "alphabetic_desc", "change_desc"],
      selected_sort
    )
  )
    by = "desc";
  if (orderBy == "change") {
    var na_data = _.filter(_data, function (d) {
      return !isFinite(d.change);
    });
    _data = _.filter(_data, function (d) {
      return isFinite(d.change);
    });
    _data = _.orderBy(_data, orderBy, by);
    _data = _.concat(_data, na_data);
  } else _data = _.orderBy(_data, orderBy, by);
  if (_.includes(["top", "bottom"], selected_sort)) {
    if (_.size(_data.slice(0, 10)) < 10) {
      _data = _.orderBy(_data, orderBy, "asc");
      var _temp =
        g1.url.parse(location.href).searchKey.chart_districts || "all";
      url_update({ sort: "score", chart_districts: _temp });
      selected_sort = "score";
    } else {
      _data = _data.slice(0, 10);
    }
  }
  return _data;
}

function set_indicator_change(_data, _sub_data, key) {
  _.forEach(_data, function (d) {
    var d1 = _.filter(_sub_data, function (_d) {
      return d[key] == _d[key];
    });
    if (d1.length > 0) {
      d.change =
        (((d.value || 0) - (d1[0].value || 0)) / (d1[0].value || 0)) * 100;
    }
  });
  return _data;
}

function get_area_chart_data(_data, group_id) {
  _data = add_date_text(_data, url.searchKey.type);
  _data = _.groupBy(_data, group_id);
  return _data;
}

function render_area_chart(_data, placeholder) {
  // draw area chart
  var _config = {};
  _config.width = $("." + placeholder).width();
  _config.height = $("." + placeholder).height();
  _config.data = _data;
  var spec = get_area_chart_spec(_config);
  let t_opn = { offsetX: 0, offsetY: -20, direction: "n" };
  render_vega(spec, "." + placeholder, { tooltip: t_opn });
}

function get_indicator_mapping() {
  // get indicator details from indicator mapping file
  helpers_get_("pa-indicator-mapping")
    .then(function (resp) {
      ind_data = JSON.parse(resp);
    })
    .catch(function (error) {
      notyfication_("error", error.name);
    });
}

async function _profile_map() {
  let _area = config.area;
  let date_type = url.searchKey["type"] || default_date_type;
  let data_url;
  let params = {
    indicator_id:
      url.searchKey.indicator_id == "all" ? 1 : url.searchKey.indicator_id,
    date: url.searchKey.date,
  };
  if (url.searchKey.page === "block_view")
    _area = url.searchKey.area_selected === "division" ? "district" : "block";
  else params[_area] = url.searchKey.area;

  data_url =
    program_config["data-file"][_area][date_type] + "?" + $.param(params);
  //Data URL for district/block break
  if (url.searchKey.page === "block_view") {
    //Add selected district to data-url in 'block-details' map
    if (url.searchKey.block_details) {
      data_url += "&district=" + url.searchKey.area2;
    }
    //Adding list of districts for district-breakup data for map
    else {
      let dist_list = JSON.parse(
        await helpers_get_("districts_all?division=" + url.searchKey.area)
      );
      _.each(dist_list, function (row) {
        data_url += "&district=" + row.district;
      });
    }
  }
  let prev_date = moment(url.searchKey.date)
    .subtract(1, url.searchKey.type || "month")
    .format("YYYY-MM-DD");
  data_url += "&date=" + prev_date;
  //delete district from fetch url params
  delete params[_area];
  delete params.date;

  //Get Max value from data
  params._by = "indicator_id";
  params._c = "value|max";
  let data_url_1 =
    program_config["data-file"][_area][date_type] + "?" + $.param(params);

  //Get Min value from data
  params._c = "value|min";
  let data_url_2 =
    program_config["data-file"][_area][date_type] + "?" + $.param(params);

  let res = JSON.parse(await helpers_get_(data_url));
  let max_val = JSON.parse(await helpers_get_(data_url_1))[0]["value|max"];
  let min_val = JSON.parse(await helpers_get_(data_url_2))[0]["value|min"];
  let res_1 = _.filter(res, { date: url.searchKey.date });
  let res_2 = _.filter(res, { date: prev_date });
  let map_data = set_indicator_change(res_1, res_2, _area); //Calculate pge change for map data
  //Render profile map
  let map_config = {
    area: _area,
    map_id: url.searchKey.page === "block_view" ? "block_map" : "profile_map",
    map_type: "topojson",
    map_url: _area + "_level",
    data: map_data,
    curr_dist: url.searchKey.area,
    min_max: [min_val, max_val],
    block_details: url.searchKey.block_details,
  };
  if (url.searchKey.page === "block_view") render_block_map(map_config);
  else render_profile_map(map_config);
}

function insights_set_1(insights_1_data) {
  // Render Insights - SET 1 - UP Overview
  var curr_data = insights_1_data.curr_data,
    prev_data = insights_1_data.prev_data,
    up_avg = insights_1_data.up_avg,
    up_avg_prev = insights_1_data.up_avg_prev;

  url = g1.url.parse(location.href);
  var unit = "%";
  var page_name = url.searchKey["page"]; // overview_home or block_view

  if (page_name == "overview_home") {
    var region = url.searchKey["area_selected"] || config.area; //district
    var level = "l1";
  } else if (page_name == "block_view") {
    region =
      url.searchKey["area_selected"] === "division" ? "district" : "block";
    level = "l3";
  }

  // Insight 1
  curr_data = _.sortBy(curr_data, "rank");
  var best = level == "l1" ? curr_data.slice(0, 4) : curr_data.slice(0, 2);
  _.each(best, function (d) {
    d["value_r"] = _.round(d.value, 2);
  });
  var best_array = _.map(best, function (d) {
    return d[region] + " (" + d.value_r + unit + ")";
  });
  var uniq_arr = _.uniq(_.map(best, "value_r"));
  var best_text =
    _.size(uniq_arr) == 1 && uniq_arr[0] == 0 ? "" : _.join(best_array, ", ");
  var i1 = { best_text: best_text };

  // Insight 2
  var worst =
    level == "l1"
      ? curr_data.reverse().slice(0, 4)
      : curr_data.reverse().slice(0, 2);
  _.each(worst, function (d) {
    d["value_r"] = _.round(d.value, 2);
  });
  var worst_array = _.map(worst, function (d) {
    return d[region] + " (" + d.value_r + unit + ")";
  });
  var worst_text = _.join(worst_array, ", ");
  var i2 = { worst_text: worst_text };

  // Insight 3
  // Removes records with change as NaN, infinity
  var i3_curr_data = _.filter(curr_data, function (d) {
    return isFinite(d.change);
  });
  var sort_growth_data = _.sortBy(i3_curr_data, "change");
  var decline = sort_growth_data[0];
  var increase = sort_growth_data[_.size(sort_growth_data) - 1];
  var i3 = { increase: increase, decline: decline };

  // Insight 4
  var _dict = { "-1": "decreased by", 1: "increased by", 0: "did not change" };
  var count_regions = _.size(curr_data);
  var up_metric = compute_growth(up_avg, up_avg_prev);
  var growth_values = _.map(curr_data, "change");
  var na_count = _.size(
    _.filter(growth_values, function (d) {
      return isFinite(d) != true;
    })
  );
  var finite_cases = _.filter(growth_values, function (d) {
    return isFinite(d) != false;
  });
  var increase_count = _.size(
    _.filter(finite_cases, function (d) {
      return d > 0;
    })
  );
  var shrink_count = _.size(
    _.filter(finite_cases, function (d) {
      return d <= 0;
    })
  );
  var i4 = {
    growth_text: _dict[up_metric.growth],
    growth: up_metric.diff,
    na_count: na_count,
    increase_count: increase_count,
    shrink_count: shrink_count,
  };

  // Insight 5/6
  prev_data = rename_keys(prev_data, {
    date: "prev_date",
    rank: "prev_rank",
    value: "prev_value",
  });
  var prev_curr_ranks = merge_arrays(curr_data, prev_data, region);
  prev_curr_ranks = _.filter(prev_curr_ranks, function (d) {
    return d["rank"] != null && d["prev_rank"] != null;
  });
  _.each(prev_curr_ranks, function (item) {
    item["rank_change"] = item["rank"] - item["prev_rank"] || "NA";
  });
  // removes cases where 'NA' is present
  prev_curr_ranks = _.filter(prev_curr_ranks, function (d) {
    return d["rank_change"] != "NA";
  });
  prev_curr_ranks = _.sortBy(prev_curr_ranks, "rank_change");
  var increase_rank = prev_curr_ranks[0];
  var decrease_rank = prev_curr_ranks[_.size(prev_curr_ranks) - 1];
  var i5_6 = { increase_rank: increase_rank, decrease_rank: decrease_rank };

  $(".auto_insights")
    .one("template", function () {
      // $('.insights').modal('show')
    })
    .template({
      page_name: page_name,
      level: level,
      region: region,
      count: count_regions,
      unit: "%",
      ind_name: _.size(curr_data) ? curr_data[0]["indicator_name"] : "",
      from_date: moment(to_date).subtract(1, "month").format("MMM-YY"),
      to_date: moment(to_date).format("MMM-YY"),
      i1: i1,
      i2: i2,
      i3: i3,
      i4: i4,
      i5_6: i5_6,
    });
}

// function insights_set_2(curr_data, prev_data) {
function insights_set_2(curr_data) {
  // Render Insights - SET 2 - District Overview
  url = g1.url.parse(location.href);
  var page_name = url.searchKey["page"]; // area_profile or block_view

  if (page_name == "area_profile") {
    var region_type = url.searchKey["area_selected"] || config.area; //district
    var region_name = url.searchKey["area"] || config.default_district; // Agra
    var level = "l2";
  } else if (page_name == "block_view") {
    region_type =
      url.searchKey["area_selected"] === "division" ? "district" : "block";
    region_name = url.searchKey["area2"];
    level = "l4";
  }

  // Insight 7
  curr_data = _.sortBy(curr_data, "change");
  var finite_curr_data = _.filter(curr_data, function (d) {
    return isFinite(d.change);
  });
  var increase = _.filter(finite_curr_data, function (d) {
    return d.change > 0;
  });
  increase = increase[_.size(increase) - 1];
  var i7 = { increase: increase };

  // Insight 8
  var decrease = _.filter(finite_curr_data, function (d) {
    return d.change < 0;
  });
  decrease = finite_curr_data[0];
  var i8 = { decrease: decrease };

  // Insight 10
  var finite_i9_data = _.filter(curr_data, function (d) {
    return isFinite(d.value) === true && d.value !== null;
  });
  finite_i9_data = _.each(finite_i9_data, function (d) {
    d["val_avg_diff"] = (((d.value || 0) - (d.avg || 0)) / (d.avg || 0)) * 100;
  });
  finite_i9_data = _.sortBy(finite_i9_data, "val_avg_diff");
  var below_up = _.filter(finite_i9_data, function (d) {
    return d.val_avg_diff < 0;
  });
  below_up = below_up.slice(0, 3);
  below_up = _.map(below_up, "indicator_name");
  var i10 = { below_up: below_up };

  // Insight 9
  var above_up = _.filter(finite_i9_data, function (d) {
    return d.val_avg_diff > 0;
  });
  above_up = above_up.reverse().slice(0, 3);
  above_up = _.map(above_up, "indicator_name");
  var i9 = { above_up: above_up };

  // Insight 11
  var ind_9_val = _.size(curr_data)
    ? _.find(curr_data, { indicator_id: 9 })
      ? _.round(_.find(curr_data, { indicator_id: 9 })["value"], 2)
      : ""
    : "";
  var ind_10_val = _.size(curr_data)
    ? _.find(curr_data, { indicator_id: 10 })
      ? _.round(_.find(curr_data, { indicator_id: 10 })["value"], 2)
      : ""
    : "";
  var i11 = { ind_9_val: ind_9_val, ind_10_val: ind_10_val };

  // Insight 12
  // Report this indicator only if urban > rural for a given district
  var ind_20_rural = _.size(curr_data)
    ? _.find(curr_data, { indicator_id: 20 })
      ? _.round(_.find(curr_data, { indicator_id: 20 })["value"], 2)
      : ""
    : "";
  var ind_21_urban = _.size(curr_data)
    ? _.find(curr_data, { indicator_id: 21 })
      ? _.round(_.find(curr_data, { indicator_id: 21 })["value"], 2)
      : ""
    : "";
  var i12 = { ind_20_rural: ind_20_rural, ind_21_urban: ind_21_urban };

  $(".auto_insights")
    .one("template", function () {
      // $('.insights').modal('show')
    })
    .template({
      page_name: page_name,
      level: level,
      region_name: region_name,
      region_type: region_type,
      unit: "%",
      from_date: moment(to_date).subtract(1, "month").format("MMM-YY"),
      to_date: moment(to_date).format("MMM-YY"),
      i7: i7,
      i8: i8,
      i9: i9,
      i10: i10,
      i11: i11,
      i12: i12,
    });
}

function hideVegaTooltip() {
  $("#vg-tooltip-element, .vg-tooltip").removeClass("visible");
  $("#vg-tooltip-element, .vg-tooltip").hide();
}

function area_filter() {
  _area_filter = url.searchKey.area_selected; // divisons || districts
  selected_area = url.searchKey.chart_districts || "all"; // {all_districts, aspirational, high_priority, division}
  var area_options = program_config.area_options;
  $(".dist-drop-up")
    .one("template", function () {})
    .template({
      area_options: area_options,
      selected_area: selected_area,
    });
}

function sort_filter() {
  selected_sort = url.searchKey.sort || "score";
  var _option = program_config.indicator_sort_options;
  $(".sort-drop-up")
    .one("template", function () {})
    .template({
      options: _option,
      selected_opt: selected_sort,
    });
}

function render_indicator_dropdown() {
  var _cur_indicator =
    url.searchKey.indicator_id || selected_prog_card[0].default_indicator;
  date_type = url.searchKey.type || default_date_type;
  to_date = url.searchKey["date"] || default_date;

  var param = { "indicator_id!": [7, 8] };
  param = $.param(param, true);
  var _param = { date: to_date, indicator_id: parseInt(_cur_indicator) };
  Promise.all([
    helpers_get_("pa-indicator-mapping?" + param),
    helpers_get_(
      program_config["data-file"]["state"][date_type] +
        "?" +
        $.param(_param, true)
    ),
  ]).then(function (resp_indicator_mapping) {
    var indicator_mapping = parse_response(resp_indicator_mapping[0]);
    // Filter program specific indicators
    indicator_mapping = _.filter(indicator_mapping, { program_area: _program });

    var pa_classes = _.uniq(_.map(indicator_mapping, "class"));
    pa_classes.unshift("ALL");
    // var pa_indicators = _.uniq(_.map(indicator_mapping, 'indicator_id'))
    var groupBy_class = _.groupBy(indicator_mapping, "class");

    indicator_up_avg = JSON.parse(resp_indicator_mapping[1])[0]
      ? JSON.parse(resp_indicator_mapping[1])[0].value
      : "NA";
    $(".up-avg-val").text(
      "UP AVG : " + (indicator_up_avg != "NA")
        ? indicator_up_avg.toFixed(2)
        : indicator_up_avg
    );
    $(".collapse-dropdown")
      .one("template", function () {
        update_indicator_info();
      })
      .template({
        program: _program,
        data: indicator_mapping,
        pa_classes: pa_classes,
        class_data: groupBy_class,
        // default_class: indicator_class,
        default_indicator: _cur_indicator,
      });
  });
}

function render_view_class() {
  var param = { "indicator_id!": [7, 8] };
  helpers_get_("pa-indicator-mapping?" + param).then(function (
    responce_view_class
  ) {
    var indicator_mapping = parse_response(responce_view_class);
    // Filter program specific indicators
    indicator_mapping = _.filter(indicator_mapping, { program_area: _program });

    var pa_classes = _.uniq(_.map(indicator_mapping, "class"));
    pa_classes.unshift("ALL");

    $(".pa-view-class")
      .one("template", function () {})
      .template({
        pa_classes: pa_classes,
      });
    url_update({ view_class: "ALL" });
  });
}

// updates selected indicator in dropdown
function update_indicator_info() {
  $(".program-h").text(selected_prog_card[0].name);
  var _cur_ind_id = $(".indicator-card.opacity-100").attr("id");
  var _selected_indicator = $(".indicator-card.opacity-100 .slected_ind").attr(
    "data-attr"
  );
  var indicator_class = $(".indicator-card.opacity-100").attr("data-attr");
  url_update({
    date: to_date,
    program: _program,
    class: indicator_class,
    indicator_id: _cur_ind_id,
  });
  $(".indicator-text").text(_selected_indicator);
  $(".ind-class").text(indicator_class);
}

function drpdwn2_options(selector, _data, disp_txt, area2) {
  $(selector).empty();
  var opts =
    '<li class="mb-3 font-13 ' +
    ("all" == _.toLower(area2) ? "text-color17" : "text-color3") +
    '  d-flex -justify-content-between block_opt" value="all"><span class="w-77 text-truncate">' +
    disp_txt +
    '</span><span class="ml-2"><img src="img/tick_blue.svg" class="' +
    ("all" == _.toLower(area2) ? "" : "d-none") +
    ' block_tick" alt="tick-blue" /></span></li>';
  _.each(_data, function (d) {
    opts =
      opts +
      '<li class="mb-3 font-13 ' +
      (d == area2 ? "text-color17" : "text-color3") +
      ' d-flex -justify-content-between block_opt " value="' +
      d +
      '"><span class="w-77 text-truncate">' +
      _.toUpper(d) +
      '</span><span class="ml-2"><img src="img/tick_blue.svg" class="' +
      (d == area2 ? "" : "d-none") +
      ' block_tick"\
        alt="tick-blue" /></span></li>';
  });
  $(selector).html(opts);
}

function highlight_selected_indicator_District() {
  // highlight selected indicator card
  var ind_card_count = 0;
  $(".dist-indicator-card").each(function () {
    var _id = $(".indicator-card.opacity-100").attr("id");
    var _this = $(this).attr("data-val");
    _id == _this ? ind_card_count++ : "";
    _this == _id
      ? $(this).addClass("border border-primary").removeClass("border-0")
      : $(this).removeClass("border border-primary").addClass("border-0");
    if (_this == _id) {
      // first scrolls to top most point and then scrolls to corresponding indicator
      $(".tab-content").scrollTop($("#pa_overview_nav").height() - 120);
      $(".tab-content").scrollTop(
        $(".card[data-val=" + _id + "]").offset().top -
          ($("#pa_overview_nav").height() + 120)
      );
    }
  });
  ind_card_count == 0
    ? notyfication_("error", "Data is not available for the selected indicator")
    : "";
}

function capitalize_first_char(text) {
  return text
    .split(" ")
    .map((c) => c.charAt(0).toUpperCase() + c.substring(1))
    .join(" ");
}

// highlight default tabs in top pane (home, drop1, drop2) on default load
function highlight_default_tabs() {
  if (url.searchKey.page == "area_profile") {
    $("#pills-state-tab").removeClass("active show");
    $("#pills-districts-tab").addClass("active show");
  } else if (
    url.searchKey.page == "block_view" &&
    url.searchKey.block_details == undefined
  ) {
    $("#pills-state-tab").removeClass("active show");
    $("#pills-districts-tab").addClass("active show");
  } else if (
    url.searchKey.page == "block_view" &&
    url.searchKey.block_details == "true"
  ) {
    $("#pills-state-tab").removeClass("active show");
    $("#pills-contact-tab").addClass("active show");
  }
}

function page_elements_hide() {
  // 1. shows arrow icon of area toggle in footer only for page 1
  if (url.searchKey.page == "overview_home") $(".arrow_icon_area").show();
  else $(".arrow_icon_area").hide();
}

$("body")
  // compare view click event
  .on("click", "#pills-compare-tab", function () {
    let url_params = {
      date: url.searchKey.date || program_config.date,
      type: url.searchKey.type || program_config.default_type,
      program: url.searchKey.program || program_config.default_program,
    };
    location.href = "pa-compare?" + $.param(url_params, true);
  })
  // Back arrow link for all pa page
  .on("click", ".back_arrow_link", function () {
    let url_params = {
      program: url.searchKey.program || program_config.default_program,
    };
    location.href = "pa?" + $.param(url_params, true);
  })
  //Handler for Dropdown 2 (district /block) apply button
  .on("click", "#district_dropdown_2 .block-dropdown-submit", function () {
    url = g1.url.parse(location.href);
    $(".block-label").html(
      (block_name == "all" ? "All Blocks" : block_name) || "Select Dist./Block"
    );
    $(".dist-label").html(dist_name);
    var params = {
      area_type: dist_type,
      area: dist_name,
      page: "block_view",
      area2: block_name,
      block_details: true,
    };
    if (block_name == undefined || block_name == "all") {
      params["area2"] = null;
      params["block_details"] = null;
    }
    url_update(params);
    $("#district_dropdown_2").modal("hide");
  })
  //Handler for Dropdown 1 (division/district) apply button
  .on("click", "#district_dropdown_1 .district-dropdown-submit", function () {
    if (dist_name !== undefined) {
      url_update({
        area_type: dist_type,
        area: dist_name,
        area2: null,
        page: "area_profile",
        block_details: null,
        area_selected: "district",
      });
      config.area = "district";
      var area2 = url.searchKey.area2;
      if (dist_type == "division_list") {
        url_update({ area_selected: "division" });
        config.area = "division";
        $("#pills-contact-tab").removeClass("pointer-events-none");
      } else {
        block_name = undefined;
        $("#pills-contact-tab").addClass("pointer-events-none");
      }
      area2 = area2 || "Select Dist./Block";
      $(".block-label").html(area2);
      $(".dist-label").html(dist_name);
    }
    $("#district_dropdown_1").modal("hide");
    render_district_profile();

    page_elements_hide();
  })

  // on shown of district Dropdown 2 / block dropdown handling options
  .on("show.bs.modal", "#district_dropdown_2", function () {
    url = g1.url.parse(location.href);
    $(".block_type").addClass("opacity-40");
    $(".block_arrow").addClass("d-none");
    $("#block-header").html(
      "Please Select " + (dist_type == "division_list" ? " Dist." : " Blocks")
    );
    var area = url.searchKey.area || "Agra Division",
      area2 = url.searchKey.area2;
    dist_type = url.searchKey.area_type || dist_type;
    area = _.includes(area, "Division") ? area : area + " Division";
    $(".block_type[value='" + area + "']").removeClass(
      "opacity-40 pointer-events-none"
    );
    $("li[value='" + area + "']>span>img").removeClass("d-none");
    dist_name = area;
    var b_data = _.sortBy(_.uniq(hier_div_data[area]));
    var _disp_txt =
      "ALL " +
      (dist_type == "division_list" ? " DISTRICTS " : " BLOCKS") +
      " BREAKUP";
    drpdwn2_options(".block_dropdown_vals", b_data, _disp_txt, area2);

    page_elements_hide();
  })
  // Handler for left panel of district dropdown 2 /block dropdown
  .on("click", ".blocks_type .nav-item", function () {
    url = g1.url.parse(location.href);
    let parent = $(this).closest(".dropdown-template");
    let _block_type = $(this).attr("value");
    parent.find(".block_arrow").addClass("d-none");
    parent.find(".blocks_type .nav-item").addClass("opacity-40");
    $(this).find(".block_arrow").removeClass("d-none");
    $(this).removeClass("opacity-40");
    var b_data = _.sortBy(_.uniq(hier_div_data[_block_type]));
    dist_name = _block_type;
    var area2 = url.searchKey.area2;
    var _disp_txt =
      "ALL " +
      (dist_type == "division_list" ? " DISTRICTS " : " BLOCKS") +
      " BREAKUP";
    drpdwn2_options(".block_dropdown_vals", b_data, _disp_txt, area2);
    block_name = undefined;
    parent
      .find(".blocks_list")
      .find("." + _block_type)
      .removeClass("d-none");
    parent.find(".blocks_type").attr("value", _block_type);
  })
  // Handler for left panel of district dropdown
  .on("click", ".districts_type .nav-item", function () {
    url = g1.url.parse(location.href);
    let parent = $(this).closest(".dropdown-template");
    let _dist_type = $(this).attr("value");
    var area_val = g1.url.parse(location.href).searchKey.area;
    parent.find(".dist_arrow").addClass("d-none");
    parent.find(".districts_type .nav-item").addClass("opacity-40");
    $(this).find(".dist_arrow").removeClass("d-none");
    $(this).removeClass("opacity-40");
    var dropdown_data = dist_drpdwn[_dist_type];
    $("#pills-contact-tab").addClass("pointer-events-none");
    $(".dist_dropdown_vals").empty();
    var opts = "";
    _.each(_.sortBy(_.uniq(dropdown_data)), function (d) {
      opts =
        opts +
        '<li class="mb-3 font-13 ' +
        (d == area_val ? "text-color17" : "text-color21") +
        ' d-flex -justify-content-between dist_opt" value="' +
        d +
        '"><span class="w-77 text-truncate dis-txt">' +
        _.toUpper(d) +
        '</span><span class="ml-2"><img class="dist_tick ' +
        (d == area_val ? "" : "d-none") +
        ' " src="img/tick_blue.svg" alt="tick-blue" />' +
        "  </span></li>";
    });
    $(".dist_dropdown_vals").html(opts);
    parent
      .find(".districts_list")
      .find("." + _dist_type)
      .removeClass("d-none");
    parent.find(".districts_type").attr("value", _dist_type);
    dist_type = _dist_type;
    dist_name = undefined;
  })
  // Handler for right panel of district dropdown
  .on("click", ".dist_opt", function () {
    var sel_opt = $(this).attr("value");
    dist_name = sel_opt;
    $(".dist_opt")
      .removeClass("text-color21 text-color17")
      .addClass("text-color21");
    $(".dist_tick").addClass("d-none");
    $(this).addClass("text-color17").removeClass("text-color21");
    $(this).find(".dist_tick").removeClass("d-none");
  })
  // Handler for right panel of district dropdown 2 /block dropdown
  .on("click", ".block_opt", function () {
    var sel_opt = $(this).attr("value");
    block_name = sel_opt;
    $(".block_opt")
      .removeClass("text-color3 text-color17")
      .addClass("text-color3");
    $(".block_tick").addClass("d-none");
    $(this).addClass("text-color17").removeClass("text-color3");
    $(this).find(".block_tick").removeClass("d-none");
  })
  // sort submit button
  .on("click", "#sort-dropdown .sort-dropdown-submit", function () {
    let sort_val =
      $(this).closest("#sort-dropdown").find(".sort_list").attr("value") ||
      "score";
    url_update({ sort: sort_val });
    $(".selected-opt").text(capitalize_first_char(sort_val.replace(/_/g, " ")));
    $("#sort-dropdown .nav-select").removeClass("nav-selection-active");
    $("#sort-dropdown .custom-dropdown-display-text span").html(
      $("#sort-dropdown .nav-select .nav-selection-active").text()
    );
    // check_session()
    if (url.searchKey.page === "block_view") {
      if (url.searchKey.area2) render_pa_indicator_cards(true);
      else render_pa_select_cards(true);
    } else {
      if (!_.includes(["", undefined], url.searchKey.area))
        render_pa_indicator_cards();
      else render_pa_select_cards();
    }
  })
  // UI styling when a sort item is clicked on
  .on("click", ".sort_list ul li", function () {
    let parent = $(this).closest(".sort_list");
    parent
      .find(".nav .nav-link")
      .addClass("opacity-30")
      .removeClass("text-primary");
    $(this).find("a").removeClass("opacity-30").addClass("text-primary");
    _dist_selected = $(this).find("a").attr("value");
    parent.attr("value", _dist_selected);
  })
  .on("click", "._dist_list ul li", function () {
    let parent = $(this).closest("._dist_list");
    parent
      .find(".nav .nav-link")
      .addClass("opacity-30")
      .removeClass("text-primary");
    $(this).find("a").removeClass("opacity-30").addClass("text-primary");
    _area_filter = $(this).find("a").attr("value");
    selected_area = $(this).find("a").attr("value");
    parent.attr("value", _area_filter);
  })
  //Handler for UP home - view 1
  .on("click", "#pills-state-tab", function () {
    $(".program-area-view-cards").removeClass("active show");
    $("#home-panel").addClass("active show");

    $("#pills-districts-tab").removeClass("active show");
    $("#pills-contact-tab").removeClass("active show");
    $(".dist-label").html("Select Dist./Div.");
    $(".block-label").html("Select Dist./Block");

    let url_params_home = {
      area_type: null,
      area: null,
      page: "overview_home",
      block_break: null,
      area2: null,
      block_details: null,
      area_selected: "district",
    };
    location.href = "pa-overview?" + $.param(url_params_home, true);
  })

  // District card click: show explore and insight in footer
  .on("click", ".indicator_district_card", function () {
    var insight_heading =
      url.searchKey.page == "overview_home" ? "UP" : url.searchKey.area;
    $(".insight_header").html(
      insight_heading +
        '<span class="font-weight-bold text-capitalize"> Overview - Insights</span>'
    );
    $(".indicator_district_card")
      .addClass("border-0")
      .removeClass("border border-primary");
    $(".cd-foter").addClass("d-none");
    $(this).removeClass("border-0").addClass("border border-primary");
    $(this).find(".cd-foter").removeClass("d-none");
  })
  // Indicator card click: show explore in footer
  .on("click", ".dist-indicator-card", function () {
    var insight_heading =
      url.searchKey.page == "area_profile"
        ? url.searchKey.area
        : url.searchKey.area2;
    $(".insight_header").html(
      insight_heading +
        '<span class="font-weight-bold text-capitalize"> - Insights</span>'
    );
    var _card_id = $(this).attr("data-val");
    // highlight selected indicator in dropdown
    $(".indicator-card").each(function () {
      var _id = $(this).attr("id");
      _card_id == _id
        ? $(this)
            .addClass("opacity-100")
            .removeClass("opacity-50")
            .find("img")
            .removeClass("d-none")
        : $(this)
            .addClass("opacity-50")
            .removeClass("opacity-100")
            .find("img")
            .addClass("d-none");
    });
    update_indicator_info();
    var indicator_up_value = $(
      this.childNodes[0].childNodes[3].childNodes[3].childNodes[3]
    ).text();
    $(".up-avg-val").text(
      "UP AVG : " + indicator_up_value.split(":")[1].split(" ")[1]
    );

    $(".dist-indicator-card")
      .addClass("border-0")
      .removeClass("border border-primary");
    $(".cd-foter-1").addClass("d-none");
    $(this).removeClass("border-0").addClass("border border-primary");
    $(this).find(".cd-foter-1").removeClass("d-none");
  })
  // Explore click link on all districts page (v1/v3)
  .on("click", ".explore_v1, .explore_v3", function () {
    let _dist = $(this).closest(".indicator_district_card").attr("data-attr");
    if (url.searchKey.page === "overview_home") {
      var dropdown1_type =
        url.searchKey.area_selected == "division"
          ? "division_list"
          : "district_all";
      config.area =
        url.searchKey.area_selected == "division" ? "division" : "district";
      url_update({
        page: "area_profile",
        area: _dist,
        area_type: dropdown1_type,
      });

      render_district_profile();
      $(".dist-label").html(_dist);
      $("#pills-state-tab").removeClass("active show");
      $("#pills-districts-tab").addClass("active show");
    } else {
      url_update({ page: "block_view", block_details: true, area2: _dist });
      render_area_details_insights();
      $(".block-label").html(_dist);
      $("#pills-districts-tab").removeClass("active show");
      $("#pills-contact-tab").addClass("active show");
    }
    page_elements_hide();
  })
  // Explore click link on all indicators page (v2)
  .on("click", ".explore_v2", function () {
    url_update({
      indicator_id: $(this).closest(".dist-indicator-card").attr("data-val"),
      page: "block_view",
    });
    render_district_profile();
    page_elements_hide();
  })
  // back button: v3 --> v2
  .on("click", ".block-back-btn", function () {
    url_update({ block_details: null, area2: null, page: "area_profile" });
    // $('.block-back-btn').addClass('d-none')
    $("#district_dropdown_2 .custom-dropdown-display-text span").html(
      "Select Dist./Div."
    );
    select_nav("#district_dropdown_menu1");
    render_district_profile();
  })
  // close button: v4 --> v3
  .on("click", ".close-block-details", function () {
    url_update({ block_details: null, area2: null });
    $(".indicators_list_cards").addClass("d-none");
    $(".districts_list_cards").removeClass("d-none");
    // $('#district_dropdown2 .district-dropdown-reset').click()
    $("#district_dropdown_2 .custom-dropdown-display-text span").html(
      "Select Dist./Div."
    );
    select_nav("#district_dropdown_menu1");
    insights_set_1(insights_1_data);

    $("#pills-contact-tab").removeClass("active show");
    $("#pills-districts-tab").addClass("active show");
    $(".block-label").html("Select Dist./Block");
  })
  // v1, area filter : submit
  .on("click", "#dist-dropdown .dist-dropdown-submit", function () {
    $(".area-selected").text(
      _area_filter == "all"
        ? "ALL Districts"
        : capitalize_first_char(_area_filter.replace(/_/g, " "))
    );
    if (_area_filter === "division")
      url_update({ area_selected: "division", chart_districts: "division" });
    else
      url_update({ area_selected: "district", chart_districts: _area_filter });
    render_overview_charts();
  })
  // indicator drop-down click event
  .on("click", ".indicator-card", function () {
    $(".indicator-card").removeClass("opacity-100").addClass("opacity-50");
    $(".indicator-card img").addClass("d-none");
    $(this).removeClass("opacity-50").addClass("opacity-100");
    $(this).find("img").removeClass("d-none");
    // indicator dropdown : submit
  })
  .on("click", ".apply_class", function () {
    update_indicator_info();
    url = g1.url.parse(location.href);
    highlight_selected_indicator_District();
    if (_.includes(["block_view", "area_profile"], url.searchKey.page)) {
      // $('.dist-indicator-card').find('[data-val='+$(this).val()+']').click()
    } else {
      render_overview_charts();
    }

    Promise.all([
      helpers_get_(
        program_config["data-file"]["state"][date_type] +
          "?" +
          $.param(url.searchKey, true)
      ),
    ]).then(function (responce) {
      var data = parse_response(responce);
      indicator_up_avg = data[0] ? data[0].value : "NA";
      $(".up-avg-val").text(
        "UP AVG : " +
          (indicator_up_avg != "NA"
            ? indicator_up_avg.toFixed(2)
            : indicator_up_avg)
      );
    });
  })
  // district drodpown - rotate arrow and highlight selelcted tab
  .on("show.bs.modal", ".modal-z-ind", function () {
    var temp = $(this).attr("id");
    $("body")
      .find('div[data-target="#' + temp + '"]')
      .closest("li")
      .addClass("z-2000");
    $("body")
      .find('div[data-target="#' + temp + '"] img.drop-active')
      .addClass("rotate-180");
  })
  // district drodpown - rotate arrow and highlight selelcted tab - reverse
  .on("hidden.bs.modal", ".modal-z-ind", function () {
    var temp = $(this).attr("id");
    $("body")
      .find('div[data-target="#' + temp + '"]')
      .closest("li")
      .removeClass("z-2000");
    $("body")
      .find('div[data-target="#' + temp + '"] img.drop-active')
      .removeClass("rotate-180");
  })
  // All class pills for all indicators page
  .on("click", ".view_class", function () {
    var _cur_view_class = $(this).attr("data-name");
    url_update({ view_class: _cur_view_class });

    var _counter = 0;
    var _id = ".dist-indicator-card";
    _cur_view_class == "ALL"
      ? $(_id).removeClass("d-none")
      : $("div" + _id).each(function () {
          $(this).attr("data-class") == _cur_view_class ? _counter++ : _counter;
          $(this).attr("data-class") == _cur_view_class
            ? $(this).removeClass("d-none")
            : $(this).addClass("d-none");
        });
    if (_counter == 0) {
      $(".no-data")
        .one("template", function () {
          $(".no_data_card").removeClass("d-none");
          $(".card-heading").addClass("d-none").removeClass("d-flex");
          if (_cur_view_class == "ALL") {
            $(".no_data_card").addClass("d-none");
            $(".card-heading").addClass("d-flex");
          }
        })
        .template();
    } else {
      $(".no_data_card").addClass("d-none");
      $(".card-heading").removeClass("d-none").addClass("d-flex");
    }
  })
  // Footer - Area toggle is disabled across all pages except for page 1
  .on("click", ".footer_tab_1", function () {
    if (url.searchKey.page == "overview_home") {
      $(".footer_tab_1").attr("data-target", "#district-list");
    } else {
      $(".footer_tab_1").attr("data-target", "#");
    }
  });

$(".selectpicker").urlfilter();
