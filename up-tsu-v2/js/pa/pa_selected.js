/* global helpers_get_, parse_response, render_vega, get_trend_line_spec,
  compute_growth, notyfication_ , populate_date_label*/
/* global program_config, add_date_text,
  url_update, load_pa_calendar, Promise*/
/* exported class_short_name */

var class_short_name = program_config.class_short_name;
var default_program = program_config.default_program;
var program_image_mapping = program_config.program_image_mapping;

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

              // Highest Negative jump indicator
              var negative_data = _.filter(curr_data, { growth: "-1" });
              var neg_indicator = _.maxBy(negative_data, "diff")
                ? _.maxBy(negative_data, "diff")["indicator_id"]
                : -1;
            } else {
              pos_indicator = -1;
              neg_indicator = -1;
            }
            // Template : PA classes Navigation links
            $(".pa_class_links")
              .one("template", function () {
                // Program class links are highlighted, class specfic indicators are only shown
                $("li.class_links>a").removeClass("active");
                if (_class != null) {
                  $("li[data-link=" + _class + "]>a").addClass("active");
                } else {
                  $('li[data-link="all"]>a').addClass("active");
                }
              })
              .template({
                pa_classes: pa_classes,
                active_class: _class,
              });

            // Groups data by Program Class
            var grouped_data = _.groupBy(curr_data, "p_class");
            // Template: Program Blocks template
            $(".programs_details")
              .one("template", function () {
                // Get 6 months data for trendline
                var trend_data = parse_response(resp[1]);
                plot_trendline(trend_data, pa_indicators, type);

                // Program class links are highlighted, class specfic indicators are only shown
                $(".class_cards_container").hide();
                $(".class_cards_container > .no_data_card").hide();

                if (_class != null) {
                  $(".class_cards_container[data-class=" + _class + "]").show();
                  $(
                    ".class_cards_container[data-class=" +
                      _class +
                      "]>.no_data_card"
                  ).show();
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
                ind_names: {
                  id: 23,
                  name: "% of C-sections in private accredited centers district received JSY Payment",
                },
              });
          } else {
            // No data available condition
            $(".no_data_card").removeClass("d-none"); // shows the no data card
            if ($("#main_card").length) $("#main_card").addClass("d-none"); // hides the program details pane if rendered
          }
        })
        .catch(function (error) {
          notyfication_("error", error.name);
        }); // promise 2 ends

      // Search Functionality
      $(document)
        // When program class links are clicked, class specfic indicators are only shown
        .on("click", "ul#class_links_id > li", function () {
          var _class = $(this).attr("data-link");
          $(".class_cards_container").hide();
          $(".class_cards_container > .no_data_card").hide();

          if (_class != "all") {
            $(".class_cards_container[data-class=" + _class + "]").show();
            $(
              ".class_cards_container[data-class=" + _class + "]>.no_data_card"
            ).show();
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
  });
