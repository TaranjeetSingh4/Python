/* global url render_dashboard */
/* exported load_pa_calendar */

// Loads the calendar component
function load_pa_calendar() {
  $(".calendar")
    .on("template", function () {
      // If pa url is hit, hide the quarters in calendar and disable click event on year
      if (url.file == "executive-summary") {
        $(".quarter_row").hide();
        $(".year").removeClass("cursor-pointer");
        $(".year").click(false);
      }
      if (url.file != "executive-summary") {
        // Grey out chevron symbol for all previous/successive years except '2018-2019' (data-attr = 2018)
        if (parseInt($(".year").attr("data-attr")) == 2018) {
          $(".fa-chevron-left, .fa-chevron-right").addClass("opacity-40");
          $(".fa-chevron-left, .fa-chevron-right").removeClass(
            "cursor-pointer"
          );
          $(".fa-chevron-left, .fa-chevron-right").click(false);
        }
      }
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
      current_month: moment().format("MMM"),
      current_year:
        moment().month() + 1 <= 3
          ? parseInt(moment().format("YYYY")) - 1
          : parseInt(moment().format("YYYY")),
    });
}

$(document)
  .on("click", "#close-cal", function () {
    $(".cal_container").hide();
  })
  .on("click", ".fa-chevron-left", function () {
    // if (parseInt($('.year').attr('data-attr')) <= 2019) {
    //   event.stopPropagation()
    // } else {
    var year = parseInt($(".year").attr("data-attr"));
    $(".year").text(year - 1 + " - " + year);
    $(".year").attr("data-attr", year - 1);
    $(".month").each(function () {
      $(this).attr("data-year", parseInt($(this).attr("data-year")) - 1);
    });
    // }
  })
  .on("click", ".fa-chevron-right", function () {
    // if (parseInt($('.year').attr('data-attr')) >= 2019) {
    //   event.stopPropagation()
    // } else {
    var year = parseInt($(".year").attr("data-attr")) + 1;
    $(".year").text(year + " - " + (year + 1));
    $(".year").attr("data-attr", year);
    $(".month").each(function () {
      $(this).attr("data-year", parseInt($(this).attr("data-year")) + 1);
    });
    // }
  })
  .on("click", "#cal-icon", function () {
    var url = g1.url.parse(location.href);
    $(".cal_container").show();
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
    if (type == "month") {
      $(".month").removeAttr("id");
      $("." + _month).attr("id", "active");
      url.update({ date: date, type: "month" });
    } else if (type == "quarter") {
      $(".month").removeAttr("id");
      $(".quarter").removeAttr("id");
      $("." + _quarter).attr("id", "active_q");
      url.update({ date: date, type: "quarter" });
    } else if (type == "year") {
      $(".month").removeAttr("id");
      $(".quarter").removeAttr("id");
      $(".year").attr("id", "year_selected");
      url.update({ date: date, type: "year" });
    }

    // Clicked on month/quarter/year is highlighted in blue
    $(".month").click(function () {
      $(".month, .quarter, .year").removeAttr("id");
      $(this).attr("id", "active");
    });

    $(".quarter").click(function () {
      $(".month, .quarter, .year").removeAttr("id");
      $(this).attr("id", "active_q");
    });

    $(".year").click(function () {
      // If pa url is hit, disable click event on year
      if (url.file != "pa" || url.file != "executive-summary") {
        $(".month, .quarter, .year").removeAttr("id");
        $(".year").attr("id", "year_selected");
      }
    });

    $(".submit").click(function (event) {
      event.stopImmediatePropagation();
      trigger_submit();
    });
  });

// Triggered when Submit button on calendar is hit
function trigger_submit() {
  // Apr
  var month_value = $("#active").attr("data-attr");
  // Q1
  var quarter_value = $("#active_q").attr("data-attr");
  // 2019 (current year)
  var year_value = $(".year").attr("data-attr");
  // var prev_year_value = String(parseInt(year_value) - 1)
  // 2019 - 2020
  var year_text = $(".year").text();

  // type = year
  if ($(".year").attr("id") == "year_selected") {
    // date=2019-04-01 & type=year (start date of fin year)
    var _date = moment(year_value, "YYYY")
      .add(3, "months")
      .format("YYYY-MM-DD");
    url.update({ date: _date, type: "year" });
    // 2019 - 2020
    $(".date-label").text(year_text);

    // type = month
  } else if (month_value !== undefined) {
    var sel_year = $("#active").attr("data-year");
    var sel_month = $("#active").attr("data-attr");
    _date = sel_month + "-" + sel_year;
    _date = moment(_date, "MMM-YYYY").format("YYYY-MM-DD");
    // date=2019-06-01 & type=month (start date of selected month)
    url.update({ date: _date, type: "month" });
    // Jul 2019
    $(".date-label").text(sel_month + " " + sel_year);

    // type = quarter
  } else if (quarter_value !== undefined) {
    var quart_month = {
      Q1: "-04-01",
      Q2: "-07-01",
      Q3: "-10-01",
      Q4: "-01-01",
    };
    var sel_quart = $("#active_q").attr("data-attr"); // Q1
    var month_day_snippet = quart_month[sel_quart];
    sel_year = $(".year").attr("data-attr"); // 2019
    var sel_year_text = $(".year").text(); // 2019-2020
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
    $(".date-label").text(sel_quart + sel_year_text);
  }

  window.history.pushState({}, "", url.toString());
  // date_type = url.searchKey.type
  $(".pa-link").attr("href", "pa?date=" + (url.searchKey.date || "2018-07-01"));
  $(".cal_container").hide();
  if (url.file === "pa" || url.file == "executive-summary") {
    render_dashboard();
  }
  // else if(url.file === 'pa-overview'){
  //   render_overview_charts()
  //   populate_date_label()
  // }
  // else if(url.file === 'pa-compare') {
  //   render_score_matrix()
  //   populate_date_label()
  // }
}
