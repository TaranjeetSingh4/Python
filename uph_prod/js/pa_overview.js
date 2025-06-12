/* globals program_config, g1, Promise, url_update, helpers_get_, top_panel_dropdown, render_indicators_,
  render_classes_, render_vega, get_area_chart_spec, render_pa_map_, render_block_map,
  url:true, compute_growth, screenshot, notyfication_, district_dropdown_reset, pa_indicator_mapping,
  add_date_text, isIpad, default_program, program_image_mapping, get_radial_chart_spec, render_profile_map,
  load_pa_calendar, check_session, merge_arrays, rename_keys */
/* exported to_date, date_type, render_charts_overview, render_area_chart */

var data, // eslint-disable-line
  ind_data,
  to_date,
  date_type,
  radial_chart, // eslint-disable-line
  selected_sort,
  insights_1_data;
url = g1.url.parse(location.href);
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
var asp_high_dist = [];
config.dropdown1 = {
  text: $("#district_dropdown_1 .custom-dropdown-display-text span"),
};

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
    url_update({ area_selected: "district" });
  get_indicator_mapping();
  top_panel_dropdown(program_config, selected_prog_card[0]);
  load_pa_calendar(selected_prog_card[0].cal_type);
  // populate_date_label()
  to_date = url.searchKey.date || default_date;
  date_type = url.searchKey.type || default_date_type;

  $(".pa-page-nav") //Home naviation template
    .one("template", function () {
      Promise.all([
        helpers_get_("district-mapping?_sort=district"),
        helpers_get_("unique_district_blocks?_by=division&_sort=division"),
      ])
        .then(function (resp) {
          asp_high_dist = JSON.parse(resp[0]);
          $(".district_custom_dropdown") //Dropdown Template
            .one("template", function () {
              if (url.searchKey.area) {
                $(".districts_list").attr("value", url.searchKey.area);
                config.dropdown1.text.html(url.searchKey.area);
              }
              if (url.searchKey.area_selected === "division") {
                $(
                  "#district_dropdown_1 .districts_type li, .chart-districts-filter"
                ).addClass("invisible");
                $("#district_dropdown_1 .districts_type [value=division_list]")
                  .removeClass("d-none")
                  .click();
              } else {
                $(
                  "#district_dropdown_1 .districts_type .chart-districts-filter"
                ).removeClass("invisible");
                $("#district_dropdown_1 .districts_type li").addClass("d-none");
                $("#district_dropdown_1 .districts_type [value!=division_list]")
                  .removeClass("d-none")
                  .click();
                $(
                  "#district_dropdown_1 .districts_type [value=district_all]"
                ).click();
              }
              $("#district_dropdown_1 .district-dropdown-search").attr(
                "placeholder",
                "Search " + _.upperFirst(config.area) + "s"
              );
              $(".district-dropdown-search").search();
              $("#district_dropdown_1").on("hide.bs.dropdown", function () {
                district_dropdown_reset("#district_dropdown_1");
              });
            })
            .template({
              data: {
                parent_id: "#district_dropdown_1",
                dist_list: JSON.parse(resp[0]),
                div_list: JSON.parse(resp[1]),
              },
            });
        })
        .catch(function (error) {
          notyfication_("error", error.name);
        });
      if (_.includes(["", undefined], url.searchKey.area)) {
        url_update({ page: "overview_home" });
      } else {
        render_district_profile();
      }
    })
    .template();
  $(".legend-area-label").html((config.area + " SCORE").toUpperCase());
  $(".names-switch span").html(
    config.area === "district" ? "DIST. NAMES" : "DIV. NAMES"
  );
  $(".custom-dropdown-menu").click(function () {
    $(".custom-dropdown-menu").toggle();
  });
  $(".nav_area_selection span").removeClass("active");
  $(".nav_area_selection [data-val=" + config.area + "]").addClass("active");
  if (url.searchKey.fullscreen === "true") toggle_fullscreen();
});

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
    url_update({ indicator_id: null });
    if (url.searchKey.page === "area_profile") {
      render_indicators_(true);
      render_pa_indicator_cards();
    } else {
      render_indicators_();
    }
  })
  .on("mouseover", ".indicator_district_card", function () {
    $(".district-row").css("opacity", "0.3");
  })
  .on(".indicator_district_card")
  .mouseout(function () {
    $(".district-row").css("opacity", "1");
  })
  .on("change", "select.indicator-selected", function () {
    if (_.includes(["block_view", "area_profile"], url.searchKey.page)) {
      $(".indicator-container")
        .find("[data-val=" + $(this).val() + "]")
        .click();
    } else {
      render_overview_charts();
    }

    setTimeout(function () {
      if (
        url.searchKey.page == "area_profile" ||
        url.searchKey.block_details == "true"
      ) {
        highlight_selected_indicator_District();
      } else {
        // code here
      }
    }, 500);
  })
  .on("click", ".custom-dropdown .dropdown-menu", function (e) {
    e.stopPropagation();
  })
  .on("click", ".compare-button", function () {
    let url_params = {
      date: url.searchKey.date || program_config.date,
      type: url.searchKey.type || program_config.default_type,
      program: url.searchKey.program || program_config.default_program,
    };
    location.href = "pa-compare?" + $.param(url_params, true);
  })
  //Handler for nav district/division selection
  .on("click", ".nav_area_selection li", function () {
    let sel_area = $(this).find("span").attr("data-val");
    config.area = sel_area;
    url_update({ area_selected: sel_area });
    if (url.searchKey.area_selected && sel_area === "division") {
      $(
        "#district_dropdown_1 .districts_type li, .chart-districts-filter"
      ).addClass("invisible");
      $("#district_dropdown_1 .districts_type [value=division_list]")
        .removeClass("d-none")
        .click();
      $(".legend-area-label").html("DIVISION SCORE");
      $(".names-switch span").html("DIV. NAMES");
    } else {
      $(
        "#district_dropdown_1 .districts_type li, .chart-districts-filter"
      ).removeClass("invisible");
      $("#district_dropdown_1 .districts_type [value=division_list]").addClass(
        "d-none"
      );
      $("#district_dropdown_1 .districts_type [value=district_all]").click();
      $(".legend-area-label").html("DISTRICT SCORE");
      $(".names-switch span").html("DIST. NAMES");
    }
    $("#district_dropdown_1 .district-dropdown-search").attr(
      "placeholder",
      "Search " + _.upperFirst(config.area) + "s"
    );
    render_overview_charts();
  })
  .on("click", "#sw2", function () {
    if ($(this).prop("checked") === false) {
      $(".chart_dist_names").hide();
      $(".chart_dist_scores").hide();
    } else {
      $(".chart_dist_names").show();
      $(".chart_dist_scores").show();
    }
  })
  .on("click", "#fullscreen-button", function () {
    toggle_fullscreen();
  })
  //Handler for district Dropdown apply button
  .on("click", "#district_dropdown_1 .district-dropdown-submit", function () {
    if (
      !_.includes(
        ["", null, undefined],
        $("#district_dropdown_1 .districts_list").attr("value")
      )
    ) {
      url_update({ page: "area_profile", area2: null, block_details: null });
      select_nav("#district_dropdown_1");
      $("#district_dropdown_2 .custom-dropdown-display-text span").html(
        "Select Dist./Div."
      );
      render_district_profile(); //Loading district profile in select district dropdown
    }
  })
  //Handler for district Dropdown apply button
  .on("click", "#district_dropdown_2 .district-dropdown-submit", function () {
    if (
      !_.includes(
        ["", null, undefined],
        $("#district_dropdown_2 .districts_list").attr("value")
      )
    ) {
      url_update({
        page: "block_view",
        area2: $("#district_dropdown_2 .districts_list").attr("value"),
        block_details: true,
      });
      select_nav("#district_dropdown_2");
      $(".program-area-view-cards").addClass("d-none");
      $("#block-view-section").removeClass("d-none");
      render_overview_charts();
      // render_pa_indicator_cards(true)
    }
  })
  .on("click", "#sort-dropdown .sort-dropdown-submit", function () {
    let sort_val = $(this)
      .closest("#sort-dropdown")
      .find(".sort_list")
      .attr("value");
    url_update({ sort: sort_val });
    $("#sort-dropdown .nav-select").removeClass("nav-selection-active");
    $("#sort-dropdown .custom-dropdown-display-text span").html(
      $("#sort-dropdown .nav-select .nav-selection-active").text()
    );
    check_session();
    if (url.searchKey.page === "block_view") {
      if (url.searchKey.area2) render_pa_indicator_cards(true);
      else render_pa_select_cards(true);
    } else {
      if (!_.includes(["", undefined], url.searchKey.area))
        render_pa_indicator_cards();
      else render_pa_select_cards();
    }
  })
  .on("click", ".sort_list ul li", function () {
    let parent = $(this).closest(".sort_list");
    parent
      .find(".nav .nav-link")
      .addClass("opacity-30")
      .removeClass("text-primary");
    $(this).find("a").removeClass("opacity-30").addClass("text-primary");
    let _dist_selected = $(this).find("a").attr("value");
    parent.attr("value", _dist_selected);
  })
  //Handler for up-home-nav button
  .on("click", ".up-home-nav", function () {
    $(".program-area-view-cards").addClass("d-none");
    $("#home-panel").removeClass("d-none");

    select_nav("#home");
    $(".custom-dropdown-display-text span").html("Select Dist./Div.");
    url_update({
      area_type: null,
      area: null,
      page: "overview_home",
      block_break: null,
      area2: null,
      block_details: null,
    });
    if (url.searchKey.indicator_id === "all") url_update({ indicator_id: 1 });
    render_classes_();
    district_dropdown_reset();
    if (config.area === "division")
      $(".districts_type").find("[value=division_list]").click();
  })
  .on("click", ".chart-districts-filter li a", function () {
    $(".mark-text").hide();
    $(".chart-districts-filter li a").addClass("opacity-30");
    $(this).removeClass("opacity-30");
    $(".chart-districts-filter").attr("value", $(this).attr("value"));
    url_update({ chart_districts: $(".chart-districts-filter").attr("value") });
    type_dist = url.searchKey.chart_districts || "all";
    render_overview_charts();
  })
  .on("click", ".indicator_district_card", function () {
    //Render district profile page
    let _dist = $(this).attr("data-attr");
    if (url.searchKey.page === "overview_home") {
      url_update({ page: "area_profile", area: _dist });
      render_district_profile();
    } else {
      // if (page === 'block-view') render insights for area details
      url_update({ block_details: true, area2: _dist });
      render_area_details_insights();
    }
  })
  .on("click", ".dist-indicator-card", function () {
    $(".dist-indicator-card").removeClass("shadow");
    $(".dist-indicator-card .selector").addClass("invisible");
    $(".dist-indicator-card .top_line").css("display", "none");
    $(this).addClass("shadow");
    if (!(url.searchKey["area2"] && url.searchKey["block_details"]))
      $(this).find(".selector").removeClass("invisible");
    $(this).find(".top_line").css("display", "block");

    url_update({ indicator_id: $(this).attr("data-val") });
    $(".indicator-selected option").removeAttr("selected");
    $(".indicator-selected")
      .find("[value=" + $(this).attr("data-val") + "]")
      .attr("selected", "true");
    $("select.indicator-selected.selectpicker").selectpicker("refresh");
    _profile_map();
  })
  .on("click", ".break-button", function () {
    if (url.searchKey.page === "block_view") {
      url_update({ block_details: true, area2: $(this).attr("value") });
      render_area_details_insights();
    } else {
      url_update({ page: "block_view" });
      //Hide area profile section & show block view
      $("#district-view-section, .indicators_list_cards").addClass("d-none");
      $("#block-view-section, .districts_list_cards").removeClass("d-none");
      //Render charts in block view
      render_pa_select_cards(true);
      _profile_map();
    }
  })
  .on("click", ".block-back-btn", function () {
    url_update({ block_details: null, area2: null, page: "area_profile" });
    // $('.block-back-btn').addClass('d-none')
    $("#district_dropdown_2 .custom-dropdown-display-text span").html(
      "Select Dist./Div."
    );
    select_nav("#district_dropdown_menu1");
    render_district_profile();
  })
  .on("click", ".close-block-details", function () {
    url_update({ block_details: null, area2: null });
    $(".indicators_list_cards").addClass("d-none");
    $(".districts_list_cards").removeClass("d-none");
    // $('#district_dropdown2 .district-dropdown-reset').click()
    $("#district_dropdown_2 .custom-dropdown-display-text span").html(
      "Select Dist./Div."
    );
    select_nav("#district_dropdown_menu1");
    _profile_map();
    insights_set_1(insights_1_data);
  })
  .on("click", ".screenshot", function () {
    var file_name = _.find(ind_data, function (d) {
      return d.indicator_id == url.searchKey["indicator_id"];
    }).indicator_name;
    screenshot(
      "." + url.searchKey.page,
      _.replace(
        file_name + "_" + moment().format("MM-DD-YY"),
        new RegExp("/", "g"),
        ","
      )
    );
  })
  .on("click", ".abv_avg_rect", function () {
    if (url.searchKey.selection == "above") url_update({ selection: "" });
    else url_update({ selection: "above" });
    render_rad_chart();
  })
  .on("click", ".bel_avg_rect", function () {
    if (url.searchKey.selection == "below") url_update({ selection: "" });
    else url_update({ selection: "below" });
    render_rad_chart();
  });
$(".selectpicker").urlfilter();

function toggle_fullscreen() {
  $("#map-container").empty(); // Removing map from the rad chart to make to load fast & neat
  if ($("#fullscreen-button").attr("toggle") === "true") {
    // Exit fullscreen
    $("#fullscreen-button").attr("toggle", "false");
    $("#fullscreen-button span").html("FULL SCREEN");
    $("#fullscreen-button i")
      .addClass("fa-expand-arrows-alt")
      .removeClass("fa-compress");
    url_update({ fullscreen: null });
    $("#rank-chart-div")
      .removeClass("col-12 pl-2 full-screen")
      .addClass("col-7 border-right");
    $("#district-indicator-div").removeClass("d-none");
    setTimeout(function () {
      render_rad_chart();
      render_pa_select_cards();
    }, 500);
  } else {
    // Make fullscreen
    $("#fullscreen-button").attr("toggle", "true");
    $("#fullscreen-button span").html("EXIT FULLSCREEN");
    $("#fullscreen-button i")
      .removeClass("fa-expand-arrows-alt")
      .addClass("fa-compress");
    url_update({ fullscreen: "true" });
    $("#rank-chart-div")
      .addClass("col-12 pl-2 full-screen")
      .removeClass("col-7 border-right");
    $("#district-indicator-div").addClass("d-none");
    setTimeout(function () {
      render_rad_chart();
    }, 500);
  }
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
  render_classes_(true);
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
  $(".program-area-view-cards").addClass("d-none");
  $("#district-view-section").removeClass("d-none");
  select_nav("#district_dropdown_menu1");
  // url_update({ selected_indicator: url.searchKey.indicator_id || 3 }) //3 is the default which is first indicator in MDR

  //Renders blocks view
  if (url.searchKey.page === "block_view") {
    $("#block-view-section").removeClass("d-none");
    $("#district-view-section").addClass("d-none");
  }
  //Render 2nd dropdown template
  if (config.area === "division") render_blocks_dropdown();
  //Render charts
  render_overview_charts();
}

function render_blocks_dropdown() {
  // let _area = url.searchKey.area
  // let _area_type = url.searchKey.area_type
  if (url.searchKey.area_selected === "division") {
    $(
      "#district_dropdown_1 .districts_type li, .chart-districts-filter"
    ).addClass("invisible");
    $("#district_dropdown_1 .districts_type [value=division_list]")
      .removeClass("d-none")
      .click();
  } else {
    $(
      "#district_dropdown_1 .districts_type li, .chart-districts-filter"
    ).removeClass("invisible");
    $("#district_dropdown_1 .districts_type [value=division_list]").addClass(
      "d-none"
    );
    $("#district_dropdown_1 .districts_type [value=district_all]").click();
  }
  $("#district_dropdown_1 .district-dropdown-search").attr(
    "placeholder",
    "Search " + _.upperFirst(config.area) + "s"
  );
  let _url = "district-mapping?_sort=district&division=" + url.searchKey.area;
  helpers_get_(_url)
    .then(function (resp) {
      $(".district_custom_dropdown2") //Dropdown2 Template
        .one("template", function () {
          //Load all districts in dropdown class -> .districts_list .district_all
          if (!_.includes(["", null, undefined], url.searchKey.area2)) {
            $(".districts_list").attr("value", url.searchKey.area2);
            $("#district_dropdown_2 .custom-dropdown-display-text span").html(
              url.searchKey.area2
            );
          }
          if (
            $("#district_dropdown_2 .districts_list .district_asp li").length <
            1
          )
            $(
              "#district_dropdown_2 .districts_type [value=district_asp]"
            ).addClass("d-none");
          if (
            $("#district_dropdown_2 .districts_list .district_hp li").length < 1
          )
            $(
              "#district_dropdown_2 .districts_type [value=district_hp]"
            ).addClass("d-none");
          $("#district_dropdown_2 .district-dropdown-search").search();
          $("#district_dropdown_2").on("hide.bs.dropdown", function () {
            district_dropdown_reset("#district_dropdown_2");
          });
        })
        .template({
          data: {
            parent_id: "#district_dropdown_2",
            dist_list: JSON.parse(resp),
          },
        });
    })
    .catch(function (error) {
      notyfication_("error", error.name);
    });
}

function render_overview_charts() {
  if (url.searchKey.page === "overview_home") {
    render_rad_chart();
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
    } else {
      _profile_map();
    }
  }
}

async function render_rad_chart() {
  // Removing existing text-marks on radial chart
  $("g.mark-text").hide();
  $(".rad-chart-div").empty();

  //Fetching data for Radial chart & map
  let params = {},
    min_max = [];
  params.indicator_id = url.searchKey.indicator_id;
  params["date~"] = url.searchKey.date;
  let _area = url.searchKey["area_selected"]
    ? url.searchKey["area_selected"]
    : "district";
  // let _data_url = config.area + '-scores?' + $.param(params)
  let dist = asp_high_dist;
  if (type_dist != "all") {
    let _url =
      program_config["data-file"][config.area][date_type] +
      "?" +
      $.param(params, true);
    let res = JSON.parse(await helpers_get_(_url));
    min_max = get_min_max(res);

    dist = _.filter(asp_high_dist, (item) => item[type_dist]);
    params["district"] = dist.map((value) => value.district);
  }

  let get_all_dist = dist.map((value) => value[_area]);
  let _data_url =
    program_config["data-file"][config.area][date_type] +
    "?" +
    $.param(params, true);
  let res = await helpers_get_(_data_url);
  check_session();
  var chart_data = JSON.parse(res),
    t_data;
  // if(url.searchKey.area_selected === 'division'){
  //   // If it is division considering districts data for calculating avg (FIX: #591)
  //   t_data = await helpers_get_(program_config['data-file']['district'][date_type] + '?' + $.param(params, true))
  //   t_data = JSON.parse(t_data)
  // } else {
  //   t_data = chart_data
  // }

  t_data = chart_data;
  var add_all = [];
  if (_.size(chart_data) != _.size(get_all_dist)) {
    _.each(get_all_dist, function (d) {
      var w = _.find(chart_data, function (d1) {
        return d1[_area] == d;
      });
      if (!w) {
        var dist_detail = _.find(dist, function (d1) {
          return d1[_area] == d;
        });
        dist_detail = _.pick(dist_detail, [_area, "map_id", "div_map_id"]);
        dist_detail["date"] = to_date;
        dist_detail["value"] = null;
        // dist_detail['date'] = to_date
        dist_detail["indicator_id"] = parseInt(url.searchKey["indicator_id"]);
        add_all.push(dist_detail);
      }
    });
    // add_all = merge_arrays(add_all, JSON.parse(resp[0]), 'indicator_id')
  }

  if (check_na_data(chart_data)) return;
  if (type_dist === "all") {
    min_max = get_min_max(t_data);
  }
  var avg = _.meanBy(t_data, "value");
  // Filter data with out nulls
  t_data = _.filter(t_data, function (o) {
    return o.value !== null;
  });
  if (url.searchKey.area_selected === "division") {
    t_data = _.filter(chart_data, function (o) {
      return o.value !== null;
    });
  }
  let min_rows = _.groupBy(t_data, function (row) {
    return row.value < avg;
  });
  var radial_chart_data = _.concat(chart_data, add_all);
  // Replacing value null with zero
  _.each(radial_chart_data, function (row) {
    if (row.value === null) {
      row.value = 0;
    }
  });

  let r_conf = {
    area: config.area,
    enlarge: url.searchKey.fullscreen === "true",
    average_val: _.round(avg, 0),
    areas_abv_avg: min_rows.false ? min_rows.false.length : 0,
    areas_blw_avg: min_rows.true ? min_rows.true.length : 0,
    selection: url.searchKey.selection || "",
  };

  //Map Config
  $("#map-container").empty();
  $("#map-container").html('<div id="mapid"></div>');
  let map_config = {
    area: config.area,
    map_id: "mapid",
    map_type: "topojson",
    map_url: config.area + "_level",
    data: chart_data,
    min_max: min_max,
  };

  //Render radial chart
  var chart_options = {
    post_run: function () {
      // Hide labels if toggle false
      if ($("#sw2").prop("checked") === false) {
        $(".chart_dist_names, .chart_dist_scores").hide();
      }
      $(".abv_avg_rect").addClass("cursor-pointer");
      $(".bel_avg_rect").addClass("cursor-pointer");
      // Hide tooltip in ipad on page scroll (#659)
      if (isIpad()) {
        $(window).on("move", hideVegaTooltip);
        $(window).on("scroll", hideVegaTooltip);
        $(window).on("touchmove", hideVegaTooltip);
      }
    },
  };

  var spec = get_radial_chart_spec(radial_chart_data, r_conf); //config.area, (url.searchKey.fullscreen === 'true'))
  radial_chart = render_vega(spec, ".rad-chart-div", chart_options);

  // Render map
  if (isIpad() && !$("#mapid").hasClass("leaflet-container")) {
    setTimeout(function () {
      render_pa_map_(map_config);
    }, 400);
  } else {
    render_pa_map_(map_config);
  }
}

function get_min_max(temp_data) {
  _.map(temp_data, function (d) {
    d.value = !d.value ? 0 : d.value;
  });
  let max_val = d3.max(temp_data, function (d) {
    return d.value;
  });
  let min_val = d3.min(temp_data, function (d) {
    return d.value;
  });
  return [min_val, max_val];
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
    // Show "Data Not Available"
    $("#notification-section").removeClass("d-none");
    $(config.view[url.searchKey.page]).addClass("d-none");
    return true;
  } else {
    $("#notification-section").addClass("d-none");
    $(config.view[url.searchKey.page]).removeClass("d-none");
    return false;
  }
}

function render_pa_select_cards(render_blocks) {
  let _area = render_blocks ? "district" : config.area;
  to_date = url.searchKey["date"] || default_date;
  date_type = url.searchKey["type"] || default_date_type;
  selected_sort = url.searchKey["sort"] || "score";
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
    indicator_id: url.searchKey["indicator_id"],
  };
  let dist = asp_high_dist;
  if (url.searchKey.page === "overview_home" && type_dist != "all") {
    dist = _.filter(asp_high_dist, (item) => item[type_dist]);
    params["district"] = dist.map((value) => value.district);
  }
  let get_all_dist = dist.map((value) => value[_area]);
  var param = { date: to_date, indicator_id: url.searchKey["indicator_id"] };

  if (date_type == "month")
    var param_prev = {
      date: moment(to_date).subtract(1, "month").format("YYYY-MM-DD"),
      indicator_id: url.searchKey["indicator_id"],
    };
  if (date_type == "quarter")
    param_prev = {
      date: moment(to_date).subtract(3, "month").format("YYYY-MM-DD"),
      indicator_id: url.searchKey["indicator_id"],
    };
  if (date_type == "year")
    param_prev = {
      date: moment(to_date).subtract(1, "year").format("YYYY-MM-DD"),
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
      // data = merge_arrays(data, rename_keys(JSON.parse(resp[1]), {value: 'avg'}), 'indicator_id')
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

      // var prev_date = moment(to_date).subtract(1, 'month').format('YYYY-MM-DD')
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
  if (url.searchKey.class !== "all") {
    _.filter(pa_indicator_mapping, function (row) {
      if (row.class === url.searchKey.class)
        indicator_data_url += "&indicator_id=" + row.indicator_id;
    });
  } else if (url.searchKey.class == "all") {
    _.filter(pa_indicator_mapping, function (row) {
      if (row.program_area === url.searchKey.program)
        indicator_data_url += "&indicator_id=" + row.indicator_id;
    });
  }
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
      $("." + _config.id)
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
          setTimeout(function () {
            if (
              url.searchKey.page == "area_profile" ||
              url.searchKey.block_details == "true"
            ) {
              highlight_selected_indicator_District();
            } else {
              // code here
            }
          }, 500);
        })
        .template({
          id: _config.id,
          option: _option,
          selected_opt: selected_sort,
        });
    })
    .template(_config);
}

function highlight_selected_indicator_District() {
  // highlight selected indicator card
  var ind_card_count = 0;
  $(".dist-indicator-card").each(function () {
    var _id =
      url.searchKey.indicator_id != "all"
        ? url.searchKey.indicator_id
        : selected_prog_card[0].default_indicator;
    var _this = $(this).attr("data-val");
    _id == _this ? ind_card_count++ : "";
    _this == _id ? $(".card[data-val=" + _id + "]").click() : "";

    if (_this == _id) {
      // first scrolls to top most point and then scrolls to corresponding indicator
      $(".scroll-content").scrollTop(-1200); // scrolls to top most indicator
      $(".scroll-content").scrollTop(
        $(".card[data-val=" + _id + "]").offset().top - 260
      );
    }
  });
  ind_card_count == 0
    ? notyfication_("error", "Data is not available for the selected indicator")
    : "";
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
      url_update({ sort: "score" });
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
  // eslint-disable-line
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
  var region_name;
  if (page_name == "area_profile") {
    var region_type = url.searchKey["area_selected"] || config.area; //district
    region_name = url.searchKey["area"] || config.default_district; // Agra
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
