/* exported pa_indicator_mapping, top_panel_dropdown, merge_arrays, rename_keys, slug_, helpers_get_, notyfication_, isIpad, parse_response, render_vega, compute_growth, add_date_text
url_update , load_pa_calendar, populate_date_label, dropdown_opt_filter, calendar_click */
// pa_trigger_submit,
/* global Noty, vega, render_dashboard, program_config, render_overview_charts, render_score_matrix, Promise */

var url = g1.url.parse(location.href);
var pa_indicator_mapping = "";

$(window).on("scroll", function () {
  var scrollTop = $(this).scrollTop();
  $("#navbar_pa").css({
    opacity: function () {
      var elementHeight = $(this).height(),
        opacity = (elementHeight - scrollTop) / elementHeight;

      return opacity;
    },
  });

  if ($(window).scrollTop()) {
    $(".navbar").addClass("z-10");
  } else {
    $(".navbar").removeClass("z-10");
  }
});

function slug_(text) {
  // to return sluggified text
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\\-]+/g, "") // Remove all non-word chars
    .replace(/\\-\\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

function helpers_get_(url) {
  // Return a new promise.
  return new Promise(function (resolve, reject) {
    // Do the usual XHR stuff
    var req = new XMLHttpRequest();
    req.open("GET", url);

    req.onload = function () {
      // This is called even on 404 etc
      // so check the status
      if (req.status == 200) {
        // Resolve the promise with the response text
        resolve(req.response);
      } else {
        // Otherwise reject with the status text
        // which will hopefully be a meaningful error
        reject(Error(req.statusText));
      }
    };

    // Handle network errors
    req.onerror = function () {
      reject(Error("Network Error"));
    };

    // Make the request
    req.send();
  });
}

function isIpad() {
  return (
    navigator.userAgent.match(/iPhone|iPad|iPod/i) !== null ||
    window.innerWidth < 1050
  );
}

function notyfication_(noty_type, msg) {
  new Noty({
    type: noty_type,
    text: msg,
    timeout: 1000,
  }).show();
}

function parse_response(response) {
  // parses promise object
  response = typeof response == Object ? response : JSON.parse(response);
  return response;
}

function render_vega(data_spec, id) {
  // renders vega chart for a given spec and class id
  let view = new vega.View(vega.parse(data_spec))
    .renderer("svg")
    .logLevel(vega.Warn)
    .initialize(id)
    .width($(id).width())
    .height($(id).height())
    .hover()
    .runAsync()
    .then(function () {});

  return view;
}

function compute_growth(curr, prev) {
  // Computes growth sign and growth % (diff)
  var growth, diff, abs_change;
  if ((curr == 0 && prev == 0) || prev == "NA") {
    growth = "NA";
    diff = "";
    abs_change = "NA";
  } else if (curr == prev) {
    growth = "0";
    diff = 0;
    abs_change = 0;
  } else if (curr > prev) {
    growth = "1";
    diff = _.round((curr - prev) * (prev ? 100 / prev : 0), 1);
    abs_change = _.round(curr - prev, 2);
  } else if (prev > curr) {
    growth = "-1";
    diff = Math.abs(_.round((prev - curr) * (prev ? 100 / prev : 0), 1));
    abs_change = _.round(prev - curr, 2);
  }
  return {
    growth: growth,
    diff: diff == 0 ? "" : parseFloat(diff),
    abs_change: abs_change,
  };
}

function add_date_text(_data, type) {
  _data = _.sortBy(_data, "date");
  _data = _.each(_data, function (d) {
    if (type == "quarter") {
      var tyear = parseInt(moment(d["date"]).format("YY")) + 1;
      d["date"] =
        "Q" +
        moment(d["date"]).utc().quarter() +
        " " +
        moment(d["date"]).format("YY") +
        "-" +
        tyear;
    } else if (type == "year") {
      d["date"] =
        moment(d["date"]).year() + "-" + (moment(d["date"]).year() + 1);
    } else d["date"] = moment(d["date"]).format("MMM-YY").toUpperCase();
  });
  return _data;
}

//Update URL
function url_update(uri) {
  var clear_url = g1.url.parse(location.href).update(uri);
  history.pushState({}, "", clear_url.toString());
  url = g1.url.parse(location.href);
}

function pa_datepicker(cal_type) {
  $(".datepicker")
    .on("template", function () {
      //Enable clicks for m/y/q pills based on config values
      $(".cal-id").removeClass("active");
      _.each(cal_type, function (period) {
        $("li[data-tab=" + period + "]").removeClass("pointer-events-none");
      });

      var type = url.searchKey.type || "month";
      // Activate the pills content and pill link
      $("#pills-" + type + "").addClass("show active");
      $("#pills-" + type + "-tab").addClass("show active");
      $("li[data-tab=" + type + "]>a").addClass("active");
    })
    .template({
      months: [
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
        "Jan",
        "Feb",
        "Mar",
      ],
      quarter: { Q1: "Apr-Jun", Q2: "Jul-Sep", Q3: "Oct-Dec", Q4: "Jan-Mar" },
      d_year: _.range(2016, 2024),
      month_row_start: [0, 4, 8],
      month_row_end: [3, 7, 11],
      current_month: moment().format("MMM"),
      current_year:
        moment().month() + 1 <= 3
          ? parseInt(moment().format("YYYY")) - 1
          : parseInt(moment().format("YYYY")),
    });
}

// Loads the calendar component
function load_pa_calendar(cal_type) {
  pa_datepicker(cal_type);
  if (url.searchKey.tab !== "map") {
    $(".comp-datepicker-container").remove();
    $(".pa_comp_calendar")
      .on("template", function () {
        // If pa url is hit, hide the quarters in calendar and disable click event on year
        if (!_.includes(cal_type, "year")) {
          $(".quarter_row").hide();
          $(".year").removeClass("cursor-pointer");
          $(".year").click(false);
        }
        // Grey out chevron symbol for all previous/successive years except '2018-2019' (data-attr = 2018)
        if (parseInt($(".year").attr("data-attr")) == 2018) {
          $(".fa-chevron-left, .fa-chevron-right").addClass("opacity-40");
          $(".fa-chevron-left, .fa-chevron-right").removeClass(
            "cursor-pointer"
          );
          $(".fa-chevron-left, .fa-chevron-right").click(false);
        }
      })
      .template({
        months: _.includes(cal_type, "month")
          ? [
              "Apr",
              "May",
              "Jun",
              "Jul",
              "Aug",
              "Sep",
              "Oct",
              "Nov",
              "Dec",
              "Jan",
              "Feb",
              "Mar",
            ]
          : [],
        quarter: _.includes(cal_type, "quarter")
          ? { Q1: "Apr-Jun", Q2: "Jul-Sep", Q3: "Oct-Dec", Q4: "Jan-Mar" }
          : {},
        current_month: moment().format("MMM"),
        current_year:
          moment().month() + 1 <= 3
            ? parseInt(moment().format("YYYY")) - 1
            : parseInt(moment().format("YYYY")),
      });
  }
}

// Triggered when Submit button on calendar is hit
function trigger_submit() {
  // Apr
  var month_value = $(".month.highlighted").attr("data-attr");
  // Q1
  var quarter_value = $(".quarter.highlighted").attr("data-attr");
  // 2019 (current year)
  var year_value = $(".year_div.highlighted").attr("data-attr");
  // 2019 - 2020
  var year_text = year_value + "-" + (parseInt(year_value) + 1);

  // type = year
  if (year_value !== undefined) {
    // date=2019-04-01 & type=year (start date of fin year)
    var _date = moment(year_value, "YYYY")
      .add(3, "months")
      .format("YYYY-MM-DD");
    url.update({ date: _date, type: "year" });
    // 2019 - 2020
    $(".date-label").text(year_text);

    // type = month
  } else if (month_value !== undefined) {
    var sel_year = $(".highlighted").attr("data-year");
    var sel_month = $(".highlighted").attr("data-attr");
    _date = sel_month + "-" + sel_year;
    _date = moment(_date, "MMM-YYYY").format("YYYY-MM-DD");
    // date=2019-06-01 & type=month (start date of selected month)
    url.update({ date: _date, type: "month" });
    // Jul 2019 changed to Jul 19
    $(".date-label").text(sel_month + " " + sel_year);

    // type = quarter
  } else if (quarter_value !== undefined) {
    var quart_month = {
      Q1: "-04-01",
      Q2: "-07-01",
      Q3: "-10-01",
      Q4: "-01-01",
    };
    var sel_quart = $(".highlighted").attr("data-attr"); // Q1
    var month_day_snippet = quart_month[sel_quart];
    sel_year = $(".year").attr("data-attr"); // 2019
    var sel_year_text = sel_year + "-" + (parseInt(sel_year) + 1); // 2019-2020
    var quart_year = {
      Q1: sel_year,
      Q2: sel_year,
      Q3: sel_year,
      Q4: parseInt(sel_year) + 1,
    };
    _date = quart_year[sel_quart] + month_day_snippet;
    // date=2019-01-01 & type=month (start date of selected quarter)
    url.update({ date: _date, type: "quarter" });
    // Q1 2019 - 2020
    $(".date-label").text(sel_quart + " " + sel_year_text);
  }

  window.history.pushState({}, "", url.toString());
  var d_type = url.searchKey.type;
  $(".pa-link").attr("href", "pa?date=" + (url.searchKey.date || "2018-07-01"));
  $(".datepicker-container").addClass("d-none");
  if (url.file === "pa" || url.file == "executive-summary") {
    render_dashboard();
  } else if (url.file === "pa-overview") {
    render_overview_charts();
    populate_date_label(_date, d_type);
  } else if (url.file === "pa-compare") {
    render_score_matrix();
    populate_date_label(_date, d_type);
  }
}

// Triggered when Submit button on calendar is hit
// function pa_trigger_submit() {
//   // Apr
//   var month_value = $('.month.highlighted').attr('data-attr')
//   // Q1
//   var quarter_value = $('.quarter.highlighted').attr('data-attr')
//   // 2019 (current year)
//   var year_value = $('.year_div.highlighted').attr('data-attr')
//   // 2019 - 2020
//   var year_text = year_value + '-' + (parseInt(year_value) + 1)

//   // type = year
//   if (year_value !== undefined) {
//     // date=2019-04-01 & type=year (start date of fin year)
//     var _date = moment(year_value, "YYYY").add(3, 'months').format("YYYY-MM-DD")
//     url.update({ 'date': _date, type: 'year' })
//     // 2019 - 2020
//     $('.date-label').text(year_text)

//     // type = month
//   } else if (month_value !== undefined) {
//     var sel_year = $('.highlighted').attr('data-year')
//     var sel_month = $('.highlighted').attr('data-attr')
//     _date = sel_month + '-' + sel_year
//     _date = moment(_date, "MMM-YYYY").format("YYYY-MM-DD")
//     // date=2019-06-01 & type=month (start date of selected month)
//     url.update({ 'date': _date, type: 'month' })
//     // Jul 2019 changed to Jul 19
//     $('.date-label').text(sel_month + " " + sel_year)

//     // type = quarter
//   } else if (quarter_value !== undefined) {
//     var quart_month = { Q1: "-04-01", Q2: "-07-01", Q3: "-10-01", Q4: "-01-01" }
//     var sel_quart = $('.highlighted').attr('data-attr') // Q1
//     var month_day_snippet = quart_month[sel_quart]
//     sel_year = $('.year').attr('data-attr') // 2019
//     var sel_year_text = sel_year + '-' + (parseInt(sel_year) + 1) // 2019-2020
//     var quart_year = { Q1: sel_year, Q2: sel_year, Q3: sel_year, Q4: parseInt(sel_year) + 1 }
//     _date = quart_year[sel_quart] + month_day_snippet
//     // date=2019-01-01 & type=month (start date of selected quarter)
//     url.update({ 'date': _date, type: 'quarter' })
//     // Q1 2019 - 2020
//     $('.date-label').text(sel_quart + ' ' + sel_year_text)
//   }

//   window.history.pushState({}, '', url.toString())
//   var d_type = url.searchKey.type
//   $('.pa-link').attr("href", "pa?date=" + (url.searchKey.date || '2018-07-01'))
//   $('.datepicker-container').addClass('d-none')
//   if (url.file === 'pa' || url.file == 'executive-summary') {
//     render_dashboard()
//   }
//   else if (url.file === 'pa-overview') {
//     render_overview_charts()
//     populate_date_label(_date, d_type)
//   }
//   else if (url.file === 'pa-compare') {
//     render_score_matrix()
//     populate_date_label(_date, d_type)
//   }
// }

// Populates the date label adjacent to calendar icon
function populate_date_label(_date, _type) {
  // Updates default url params if not present
  var url = g1.url.parse(location.href);
  var date = _date || program_config.date;
  var type = _type || program_config.default_type;
  url.update({ date: date, type: type });
  window.history.pushState({}, "", url.toString());

  // type = year
  // 2018 - 2019
  if (type == "year") {
    var sel_year = parseInt(moment(date).format("YYYY"));
    $(".date-label").text(sel_year + " - " + (sel_year + 1));
  }

  // type = month
  // Jul 2018
  if (type == "month") {
    var sel_text = moment(date).format("MMM YYYY");
    $(".date-label").text(sel_text);
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
    var quart_id = quart_month[sel_month_text];
    sel_year = parseInt(moment(date).format("YYYY"));
    var sel_year_text =
      quart_id == "Q4"
        ? sel_year - 1 + " - " + sel_year
        : sel_year + " - " + (sel_year + 1);
    $(".date-label").text(quart_id + " " + sel_year_text);
  }
}

$(document)
  .on("click", "#close-cal", function () {
    $(".datepicker-container").addClass("d-none");
    $(".comp-datepicker-container").addClass("d-none");
  })

  .on("click", ".fa-chevron-left", function () {
    var year = parseInt($(".year").attr("data-attr"));
    $(".year").text(year - 1 + " - " + year);
    $(".year").attr("data-attr", year - 1);
    $(".month").each(function () {
      $(this).attr("data-year", parseInt($(this).attr("data-year")) - 1);
    });
  })
  .on("click", ".fa-chevron-right", function () {
    var year = parseInt($(".year").attr("data-attr")) + 1;
    $(".year").text(year + " - " + (year + 1));
    $(".year").attr("data-attr", year);
    $(".month").each(function () {
      $(this).attr("data-year", parseInt($(this).attr("data-year")) + 1);
    });
  })

  .on("click", "#cal-icon", function () {
    calendar_click();
  });

function top_panel_dropdown(program_config, selected_prog_card, ind_id) {
  let _program = url.searchKey.program || program_config.default_program;
  var _class = url.searchKey.class || selected_prog_card.default_class;
  let _indicator_id =
    ind_id ||
    url.searchKey.indicator_id ||
    selected_prog_card.default_indicator;
  let _date = url.searchKey.date || selected_prog_card.date;
  url_update({
    program: _program,
    class: _class,
    date: _date,
    indicator_id: _indicator_id,
  });
}

// merge two arrays on given key
function merge_arrays(array1, array2, key) {
  var merged_data = _.map(array1, function (obj) {
    var find = {};
    find[key] = obj[key];
    return _.assign(obj, _.find(array2, find));
  });
  return merged_data;
}

// rename keys in array based on keyMap
function rename_keys(arr, keyMap) {
  var new_arr = arr.map(function (obj) {
    return _.mapKeys(obj, function (value, key) {
      return keyMap[key] || key;
    });
  });
  return new_arr;
}

function dropdown_opt_filter(data) {
  return {
    district_asp: _.uniq(_.map(_.filter(data, "aspirational"), "district")),
    district_hp: _.uniq(_.map(_.filter(data, "high_priority"), "district")),
    district_all: _.uniq(_.map(data, "district")),
    division_list: _.uniq(_.map(data, "division")),
  };
}

function calendar_click() {
  var url = g1.url.parse(location.href);
  $(".datepicker-container").removeClass("d-none");
  var date = url.searchKey["date"] || "2018-07-01";
  var type = url.searchKey["type"] || "month";

  var _month = moment(date).format("MMM");
  var _month_numeral = parseInt(moment(date).format("MM"));
  var _year = moment(date).format("YYYY");
  var quart_dict = { Apr: "Q1", Jul: "Q2", Oct: "Q3", Jan: "Q4" };
  var _quarter = quart_dict[_month];

  // update year attribute for month on calendar load
  $(".month").each(function () {
    var mon_text = $(this).attr("data-attr");
    var mon_numeral = moment(mon_text, "MMM").format("MM");
    if (_month_numeral > 3) {
      var mon_year = mon_numeral > 3 ? _year : parseInt(_year) + 1;
    } else {
      mon_year = mon_numeral > 3 ? _year - 1 : parseInt(_year);
    }
    $(this).attr("data-year", mon_year);
  });
  // update year attribute for year on calendar load
  var cal_year_text =
    _month_numeral > 3
      ? _year + " - " + (parseInt(_year) + 1)
      : parseInt(_year) - 1 + " - " + _year;
  $(".year").text(cal_year_text);
  var year_attr = _month_numeral > 3 ? _year : parseInt(_year) - 1;
  $(".year").attr("data-attr", year_attr);

  // type = month is considered default
  // Based on type(month/year/quarter) in url, the respective block is highlighted in blue on initial load
  $(".month, .quarter, .year_div").removeClass("highlighted");

  if (type == "month") {
    $("." + _month).addClass("highlighted");
    url.update({ date: date, type: "month" });
  } else if (type == "quarter") {
    $("." + _quarter).addClass("highlighted");
    url.update({ date: date, type: "quarter" });
  } else if (type == "year") {
    $(".y_" + _year).addClass("highlighted");
    url.update({ date: date, type: "year" });
  }

  // Clicked on month/quarter/year is highlighted in blue
  $(".month, .quarter, .year_div").click(function () {
    $(".month, .quarter, .year_div").removeClass("highlighted");
    $(this).addClass("highlighted");
  });

  $(".submit").click(function (event) {
    event.stopImmediatePropagation();
    trigger_submit();
  });
}

$(function () {
  let _url =
    "pa-indicator-mapping?program_area=" + url.searchKey.program || "MH";
  helpers_get_(_url).then(function (resp) {
    pa_indicator_mapping = JSON.parse(resp);
  });
});
