/* global g1, Promise, helpers_get_, parse_response, render_vega, get_trend_line_spec, populate_date_label,
load_pa_calendar, compute_growth, notyfication_ , Choices*/
/* global default_program, search_keywords, program_image_mapping, program_config, add_date_text,
district_dropdown_reset top_panel_dropdown, pa_indicator_mapping, url_update*/
/* exported class_short_name */

var class_short_name = program_config.class_short_name;
var choices;
var global_insight_3;
render_top_panel();
render_global_area_filters();
render_dashboard();

function render_dashboard() {
  // Main function which renders the dashboard
  var url = g1.url.parse(location.href);
  var program = url.searchKey.program || default_program; // 'MH'
  var selected_prog_card = _.filter(program_image_mapping, function (d) {
    if (d.short_name == program) return d;
  });
  $(".class-name").text(selected_prog_card[0].name);
  var date = url.searchKey.date || selected_prog_card[0].date; // '2018-07-01'
  var prev_date = moment(date)
    .subtract(1, selected_prog_card[0].type)
    .startOf("month")
    .format("YYYY-MM-DD");
  // var type = (url.searchKey.type) || 'month'
  var keywords = search_keywords[program]; // ["ultrasound", "pregnant women"]
  var type = url.searchKey.type || selected_prog_card[0].type;
  var _class = url.searchKey.class || null;

  // Loads data using promises and templates are rendered
  var param = { "indicator_id!": [7, 8] };
  param = $.param(param, true);
  // 1. Loads the calendar component
  load_pa_calendar(selected_prog_card[0].pa_cal);
  // 2.Populates the date label adjacent to calendar icon
  populate_date_label(date, type);
  // 3.Loads the No Data template
  $(".no_data").template();
  // 4. Choice input search box template
  $("#search_container_outer").html("");
  $(".search_input")
    .one("template", function () {
      choices = new Choices("#search_box", {
        maxItemCount: 1,
        removeItemButton: true,
      });

      $(".choices__list--dropdown").hide(); // hides the default choice dropdown
    })
    .template({});

  helpers_get_("pa-indicator-mapping?" + param)
    .then(function (resp_indicator_mapping) {
      var indicator_mapping = parse_response(resp_indicator_mapping);

      // Filter program specific indicators
      indicator_mapping = _.filter(indicator_mapping, {
        program_area: program,
      });
      var pa_classes = _.uniq(_.map(indicator_mapping, "class"));
      var pa_indicators = _.uniq(_.map(indicator_mapping, "indicator_id"));

      var params = {
        date: [date, prev_date],
        indicator_id: pa_indicators,
        "indicator_id!": [7, 8],
      };
      var params_1 = $.param(params, true);
      var from_date = "";
      // Gets last 6 dates (chart)
      // var from_date = moment(date).subtract(5, 'month').format('YYYY-MM-DD')
      if (type == "year")
        from_date = moment(date).subtract(1, "year").format("YYYY-MM-DD");
      else from_date = moment(date).subtract(5, type).format("YYYY-MM-DD");

      params = {
        "date>~": from_date,
        "date<~": date,
        indicator_id: pa_indicators,
        _c: ["date", "indicator_id", "value"],
      };
      var params_2 = $.param(params, true);

      Promise.all([
        helpers_get_(
          program_config["data-file"]["state"][type] + "?" + params_1
        ),
        helpers_get_(
          program_config["data-file"]["state"][type] + "?" + params_2
        ),
      ])
        .then(function (resp) {
          var state_data = parse_response(resp[0]);
          // Filter data by date
          var curr_data = _.filter(state_data, { date: date });
          var prev_data = _.filter(state_data, { date: prev_date });
          // Render program details template only if current month data is present else show no data
          if (_.size(curr_data)) {
            // Derives metrics for data (prev_value, indicator_name, p_class, growth, diff)
            _.each(curr_data, function (item) {
              item["prev_value"] = _.size(prev_data)
                ? _.filter(prev_data, { indicator_id: item.indicator_id })[0]
                    .value
                : "NA";
              item["indicator_name"] = _.filter(indicator_mapping, {
                indicator_id: item.indicator_id,
              })[0].indicator_name;
              item["unit"] = _.filter(indicator_mapping, {
                indicator_id: item.indicator_id,
              })[0].type;
              item["p_class"] = _.filter(indicator_mapping, {
                indicator_id: item.indicator_id,
              })[0].class;
              var growth_diff = compute_growth(item.value, item.prev_value);
              item["growth"] = growth_diff["growth"];
              item["diff"] = growth_diff["diff"];
            });

            // if previous month data is not present, pos and neg jump indicators are assigned -1
            if (_.size(prev_data)) {
              // Highest Positive jump indicator
              var positive_data = _.filter(curr_data, { growth: "1" });
              var pos_indicator = _.maxBy(positive_data, "diff")
                ? _.maxBy(positive_data, "diff")["indicator_id"]
                : -1;
              var top_2_ind = _.map(
                _.reverse(_.sortBy(positive_data, "diff")).slice(0, 2),
                "indicator_name"
              );

              // Highest Negative jump indicator
              var negative_data = _.filter(curr_data, { growth: "-1" });
              var neg_indicator = _.maxBy(negative_data, "diff")
                ? _.maxBy(negative_data, "diff")["indicator_id"]
                : -1;
              var bottom_2_ind = _.map(
                _.reverse(_.sortBy(negative_data, "diff")).slice(0, 2),
                "indicator_name"
              );
            } else {
              pos_indicator = -1;
              neg_indicator = -1;
              top_2_ind = [];
              bottom_2_ind = [];
            }

            // Template : PA classes Navigation links
            $(".pa_class_links")
              .one("template", function () {
                // Program class links are highlighted, class specfic indicators are only shown
                $("li.class_links>a").removeClass("active");
                if (_class != null) {
                  $("li[data-link=" + _class + "]>a").addClass("active");
                } else {
                  $('li[data-link="ALL"]>a').addClass("active");
                }
              })
              .template({
                pa_classes: pa_classes,
              });

            // Groups data by Program Class
            var grouped_data = _.groupBy(curr_data, "p_class");
            // Template: Program Blocks template
            $(".programs_details")
              .one("template", function () {
                // Get 6 months data for trendline
                var trend_data = parse_response(resp[1]);
                plot_trendline(trend_data, pa_indicators, type);

                // Template: Search dropdown template populated with all indicators
                $(".search_dropdown")
                  .one("template", function () {
                    // hide all keywords
                    _.each(keywords, function (word) {
                      $(
                        "[keyword_attr=" + word.replace(/\s+/g, "_") + "]"
                      ).hide();
                    });
                  })
                  .template({
                    data: _.groupBy(indicator_mapping, "class"),
                    pa_classes: _.sortBy(pa_classes),
                    keywords: keywords,
                  });

                // Renders insights section
                insights_set({
                  i1: top_2_ind,
                  i2: bottom_2_ind,
                  i3: global_insight_3,
                });

                // Program class links are highlighted, class specfic indicators are only shown
                $(".class_cards_container").hide();
                if (_class != null) {
                  $(".class_cards_container[data-class=" + _class + "]").show();
                } else {
                  $(".class_cards_container").show();
                }
              })
              .template({
                data: grouped_data,
                pa_classes: pa_classes,
                pos_indicator: pos_indicator,
                neg_indicator: neg_indicator,
                pa_program: program,
                _date: url.searchKey.date || date,
              });
          } else {
            // No data available condition
            $(".no_data_card").removeClass("d-none"); // shows the no data card
            if ($("#main_card").length) $("#main_card").addClass("d-none"); // hides the program details pane if rendered
            // Renders insights : No data case
            insights_set({ i1: [], i2: [] });
          }
        })
        .catch(function (error) {
          notyfication_("error", error.name);
        }); // promise 2 ends

      // Search Functionality
      $(document)
        // When search icon is clicked on, the search dropdown is hidden
        // .on('click', '.search_icon', function(){
        //   $('#search_dropdown').removeClass('show')
        // })
        // When user deselects a keyword in input (hits close button), dashboard is reset
        .on("removeItem", "#search_box", function () {
          toggle_indicators("", indicator_mapping);
          $(".choices__input--cloned").attr("placeholder", "Search indicators");
        })
        // When users add an item in input, search is triggered
        .on("addItem", "#search_box", function () {
          // var value = choices.getValue(true)[0]
          $("#search_dropdown").removeClass("show");
          $(".choices__input--cloned").attr("placeholder", "");
        })
        // When auto suggest keywords are clicked on, results are filtered and search dropdown is hidden
        .on("click", ".keyword_btn", function (event) {
          event.stopImmediatePropagation();
          var value = $(this).attr("keyword_attr").replace(/_/g, " ");
          // Identify all indicators having the searched text
          toggle_indicators(value, indicator_mapping);
          $("#search_dropdown").removeClass("show");
          choices.clearInput(); // clears user input text
          choices.setValue([value]); // adds selected keyword option in search box
        })
        // When words are typed, results are filtered and search dropdown is shown
        .on("keyup", ".choices__input", function (e) {
          // if there is a choice already made, further search is disabled
          if (choices.getValue(true)[0]) {
            e.preventDefault();
            return;
          }
          var value = $(this).val().toLowerCase();

          if (_.size(value) > 1) {
            $("#search_dropdown").addClass("show");
          } else if (_.size(value) <= 1) {
            $("#search_dropdown").removeClass("show");
          }

          // STEP 1: KEYWORDS
          // Identify all keywords having the searched text
          var matched_keywords = [];
          _.each(keywords, function (word) {
            if (word.indexOf(value) > -1) {
              matched_keywords.push(word);
            } // inner if
          }); // _.each

          // hide all keywords
          _.each(keywords, function (word) {
            $("[keyword_attr=" + word.replace(/\s+/g, "_") + "]").hide();
          });

          // show only matched keywords when searched word is atleast 2 letters
          if (_.size(value) > 1) {
            _.each(matched_keywords, function (word) {
              $("[keyword_attr=" + word.replace(/\s+/g, "_") + "]").show();
            });
          }
          // STEP 2: Indicators
          // Identify all indicators having the searched text
          toggle_indicators(value, indicator_mapping);
        })
        // When program class links are clicked, class specfic indicators are only shown
        .on("click", "ul#pills-tab > li", function () {
          var _class = $(this).attr("data-link");
          $(".class_cards_container").hide();

          if (_class != "ALL") {
            $(".class_cards_container[data-class=" + _class + "]").show();
            url_update({ class: _class });
          } else {
            $(".class_cards_container").show();
            url_update({ class: null });
          }
        });
      //document events end here
    })
    .catch(function (error) {
      notyfication_("error", error.name);
    }); // promise 1 ends
} // end

function plot_trendline(trend_data, pa_indicators, type) {
  // Plots Trendline
  // Stage A:  Compute change % for evry data point
  var date_list = _.sortBy(_.uniq(_.map(trend_data, "date"))); // all uniq dates

  // STEP 1: dict stores records date wise {date1: [], date2: [], date3: []}
  var dict = {};
  _.each(date_list, function (_date) {
    dict[_date] = _.filter(trend_data, function (d) {
      return d.date == _date;
    });
  });

  // STEP 2: Compute change % for each pair of curr, prev values
  _.each(date_list, function (_date, i) {
    dict[date_list[i]] = set_indicator_change(
      dict[date_list[i]],
      dict[date_list[i - 1]],
      "indicator_id"
    );

    // if no key called 'change',  add change = 0
    if (_.has(dict[date_list[i]][0], "change") == false) {
      _.each(dict[date_list[i]], function (j) {
        j["change"] = 0;
      });
    }

    // Adds a key called 'sign' which indicate if change was +, - or NA (1,-1,0)
    _.each(dict[date_list[i]], function (j) {
      j["sign"] = j["change"] > 0 ? 1 : j["change"] < 0 ? -1 : 0;
    });
  });

  // STEP 3: Flatten dict structure (dict)
  var p_trend_data = [];
  _.each(date_list, function (_date) {
    p_trend_data.push(dict[_date]);
  });
  p_trend_data = _.flatten(p_trend_data);
  // Creates shallow copy for insight consumption : i3 data in global_insight_3
  global_insight_3 = JSON.parse(JSON.stringify(p_trend_data));

  add_date_text(p_trend_data, type);

  // Stage B: Format Trend data for chart consumption
  _.each(p_trend_data, function (item) {
    item["y"] = item["value"];
    item["x"] = item["date"];
  });

  // Passing relevant columns ['indicator_id','x', 'y'] and group by indicator id
  var grouped_trend = _.groupBy(p_trend_data, "indicator_id");

  // Fetch Vega chart spec
  var data_spec = get_trend_line_spec();
  // Render vega Line chart for each indicator
  _.each(pa_indicators, function (ind_id) {
    if (grouped_trend[ind_id]) {
      data_spec.data[0].values = grouped_trend[ind_id];
      render_vega(data_spec, ".line_chart_div_" + ind_id);
    }
  });
}

function toggle_indicators(value, indicator_mapping) {
  // Identify all indicators having the searched text
  _.each(indicator_mapping, function (d) {
    d["lower_name"] = d.indicator_name.toLowerCase();
  });
  var ind_names = _.map(indicator_mapping, "lower_name");

  var matched_ind = [];
  _.each(ind_names, function (name) {
    if (name.indexOf(value) > -1) {
      matched_ind.push(name);
    } // inner if
  }); // _.each

  // Identify indicator ids having the searched text
  var _data = _.filter(indicator_mapping, function (d) {
    return _.includes(matched_ind, d["lower_name"]) == true;
  });
  var matched_ids = _.map(_data, "indicator_id");
  var all_ids = _.map(indicator_mapping, "indicator_id");
  var non_matched_ids = _.difference(all_ids, matched_ids);

  // Show all ids
  _.each(all_ids, function (id) {
    $("[indicator_attr=" + id + "]").show();
  });

  // Hide all non matched ids
  _.each(non_matched_ids, function (id) {
    $("[indicator_attr=" + id + "]").toggle();
  });
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

function render_global_area_filters() {
  var url = g1.url.parse(location.href);
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

  $(".pa-page-nav") //Home naviation template
    .one("template", function () {
      Promise.all([
        helpers_get_("district-mapping?_sort=district"),
        helpers_get_("unique_district_blocks?_by=division&_sort=division"),
      ])
        .then(function (resp) {
          // var asp_high_dist = JSON.parse(resp[0])
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
    })
    .template();
}

function render_top_panel() {
  var url = g1.url.parse(location.href);
  let _program = url.searchKey.program || program_config.default_program; // 'MH'
  var selected_prog_card = _.filter(program_image_mapping, function (d) {
    if (d.short_name == _program) return d;
  });
  top_panel_dropdown(program_config, selected_prog_card[0]);
}

$("body")
  // Compare tab
  .on("click", ".compare-button", function () {
    var url = g1.url.parse(location.href);
    let url_params = {
      date: url.searchKey.date || program_config.date,
      type: url.searchKey.type || program_config.default_type,
      program: url.searchKey.program || program_config.default_program,
    };
    location.href = "pa-compare?" + $.param(url_params, true);
  })
  // UP state icon
  .on("click", ".up-home-nav", function () {
    var url = g1.url.parse(location.href);
    let url_params = {
      date: url.searchKey.date || program_config.date,
      type: url.searchKey.type || program_config.default_type,
      program: url.searchKey.program || program_config.default_program,
    };
    location.href = "pa-overview?" + $.param(url_params, true);
  })
  //Apply button for district Dropdown 1
  .on("click", "#district_dropdown_1 .district-dropdown-submit", function () {
    if (
      !_.includes(
        ["", null, undefined],
        $("#district_dropdown_1 .districts_list").attr("value")
      )
    ) {
      var url = g1.url.parse(location.href);
      let url_params = {
        date: url.searchKey.date || program_config.date,
        type: url.searchKey.type || program_config.default_type,
        program: url.searchKey.program || program_config.default_program,
        page: "area_profile",
        area: $("#district_dropdown_1 .districts_list").attr("value"),
      };
      location.href = "pa-overview?" + $.param(url_params, true);
    }
  });

function insights_set(insights_data) {
  // Render Insights - PA page
  var url = g1.url.parse(location.href);

  // Insight 1
  var i1 = insights_data.i1;
  // Insight 2
  var i2 = insights_data.i2;

  // Insight 3
  var i3 = insights_data.i3;
  // var date_list = _.sortBy(_.uniq(_.map(i3, 'date')))  // all uniq dates
  var indicas = _.sortBy(_.uniq(_.map(i3, "indicator_id"))); // all uniq indicators

  // STEP 4: dict stores records indicator wise {Agra: [1,0,-1], Lucknow: [1,1,1], Kheri: [0,-1,1]}
  var sign_dict = {};
  _.each(indicas, function (_indica) {
    var temp_indica = _.filter(i3, function (d) {
      return d["indicator_id"] == _indica;
    });
    sign_dict[_indica] = _.map(temp_indica, "sign");
  });

  // STEP 5: Determine declined and improved indicators
  // last 3 elemnents equals [1,1,1] ==> positive increase, [-1,-1, -1] ==> negative decline
  var _decline = [],
    _improve = [];
  _.each(sign_dict, function (v, k) {
    var _len = _.size(v);
    // extracts last 3 elements and checks for patterns [1,1,1] or [-1,-1,-1]
    var sliced_arr = v.slice(_len - 3, _len + 1);
    if (_.isEqual(sliced_arr, [1, 1, 1]) == true) _improve.push(k);
    if (_.isEqual(sliced_arr, [-1, -1, -1]) == true) _decline.push(k);
  });

  // Extract indicator names from indicator ids
  // [2,3,4] ==> [name1, name2, name3]
  var _improve_name = [],
    _decline_name = [];

  _.each(_improve, function (item) {
    _improve_name.push(
      _.find(pa_indicator_mapping, { indicator_id: parseInt(item) })
        .indicator_name
    );
  });

  _.each(_decline, function (item) {
    _decline_name.push(
      _.find(pa_indicator_mapping, { indicator_id: parseInt(item) })
        .indicator_name
    );
  });

  i3 = { decline_text: _decline_name, improve_text: _improve_name };

  $(".auto_insights")
    .one("template", function () {
      // $('.insights').modal('show')
    })
    .template({
      page_name: "home",
      level: "NA",
      period_type: url.searchKey.type,
      program_name: _.find(program_image_mapping, {
        short_name: url.searchKey.program,
      }).name,
      i1: i1,
      i2: i2,
      i3: i3,
    });
}
