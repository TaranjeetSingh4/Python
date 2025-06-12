/* globals g1, draw_map_view, parse_url, defaults, FULL_LATEST_DATE: true */
/* exported load_calendar */

// FULL_LATEST_DATE = new Date()

try {
  if (FULL_LATEST_DATE) {
    // check FULL_LATEST_DATE variable exists or not
  }
} catch (e) {
  FULL_LATEST_DATE = new Date();
}

$("body")
  .on("click", ".fa-chevron-left", function () {
    var url = g1.url.parse(location.href);
    var year = parseInt($(".year").attr("data-attr")) - 1;
    if (url.file === "cmo_new") {
      let month_cal = [
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
      ];
      let max_year = localStorage.getItem("cmo_max_date").split(" ");
      let min_year = 2019;
      let max_month = max_year[0];
      max_year = parseInt(max_year[1]);
      if (year - 1 < max_year && year - 1 > min_year) {
        $(".month").addClass("cursor-pointer");
        $(".month").css("pointer-events", "");
        $(".year").parent().addClass("cursor-pointer");
        $(".year").css("pointer-events", "");
      } else if (year - 1 === max_year) {
        let class_hide =
          "." + month_cal.slice(0, month_cal.indexOf(max_month) + 1).join(",.");
        $(class_hide).addClass("cursor-pointer");
        $(class_hide).css("pointer-events", "");
        $(".year").parent().addClass("cursor-pointer");
        $(".year").css("pointer-events", "");
      } else {
        $(".month").removeClass("cursor-pointer");
        $(".month").css("pointer-events", "none");
        $(".year").parent().removeClass("cursor-pointer");
        $(".year").css("pointer-events", "none");
      }

      if (year - 1 === 2019) {
        $(".Dec,.Jan,.Feb,.Mar").addClass("cursor-pointer");
        $(".Dec,.Jan,.Feb,.Mar").css("pointer-events", "");
        $(".year").parent().addClass("cursor-pointer");
        $(".year").css("pointer-events", "");
      }
    } else {
      if (year >= new Date().getFullYear()) {
        $(".next-yr").removeClass("pointer-none");
      }
      disable_future_quarters(year - 1);
    }
    $(".year").text(year - 1 + " - " + year);
    $(".year").attr("data-attr", year);
    $(".quarter").attr("data-year", year);
    $(".month").removeClass("active");
    $(".quarter").removeClass("highlighted");
    $(".year").removeClass("highlighted");
    $(".month").each(function () {
      $(this).attr("data-year", parseInt($(this).attr("data-year")) - 1);
    });
  })
  .on("click", ".fa-chevron-right", function () {
    var url = parse_url();
    $(".month").removeClass("active");
    $(".quarter").removeClass("highlighted");
    $(".year").removeClass("highlighted");
    var year = parseInt($(".year").attr("data-attr"));
    if (url.file === "cmo_new") {
      if (year === 2019) {
        $(".Dec,.Jan,.Feb,.Mar").addClass("cursor-pointer");
        $(".Dec,.Jan,.Feb,.Mar").css("pointer-events", "");
      }
      let month_cal = [
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
      ];
      let max_year = localStorage.getItem("cmo_max_date").split(" ");
      let max_month = max_year[0];
      max_year = parseInt(max_year[1]);
      let min_year = 2019;
      if (year < max_year && year > min_year) {
        $(".month").addClass("cursor-pointer");
        $(".month").css("pointer-events", "");
        $(".year").parent().addClass("cursor-pointer");
        $(".year").css("pointer-events", "");
      } else if (year === max_year) {
        let class_hide =
          "." + month_cal.slice(0, month_cal.indexOf(max_month) + 1).join(",.");
        $(class_hide).addClass("cursor-pointer");
        $(class_hide).css("pointer-events", "");
        let new_class_hide =
          "." + month_cal.slice(month_cal.indexOf(max_month) + 1).join(",.");
        $(new_class_hide).removeClass("cursor-pointer");
        $(new_class_hide).css("pointer-events", "none");
      } else if (year > max_year) {
        $(".year").parent().removeClass("cursor-pointer");
        $(".year").css("pointer-events", "none");
        $(".month").removeClass("cursor-pointer");
        $(".month").css("pointer-events", "none");
      } else {
        $(".year").parent().addClass("cursor-pointer");
        $(".year").css("pointer-events", "");
      }
    } else {
      disable_future_quarters(year);
      if (year - 1 >= new Date().getFullYear()) {
        $(".next-yr").addClass("pointer-none");
      } else {
        $(".year").text(year + " - " + (year + 1));
        $(".year").attr("data-attr", year + 1);
        $(".quarter").attr("data-year", year + 1);
        $(".month").each(function () {
          $(this).attr("data-year", parseInt($(this).attr("data-year")) + 1);
        });
      }
    }
    // $('.year').text((year) + ' - ' + (year + 1))
    // $('.year').attr('data-attr', (year + 1))
    // $('.quarter').attr('data-year', (year + 1))
    // $('.month').each(function () {
    //     $(this).attr('data-year', parseInt($(this).attr('data-year')) + 1)
    // })
  })
  .on("click", ".cal-button-area", function () {
    $(".cal_wid").toggleClass("d-none");
  });
function load_calendar() {
  $(".calendar")
    .on("template", function () {
      if (g1.url.parse(location.href).file === "cmo_new") {
        $(".cal_wid ").addClass("d-none");
        // $('.cal_wid ').hide()
        let date = g1.url.parse(location.href).searchKey["date"];
        if (
          _.keys(g1.url.parse(location.href).searchKey).indexOf("year") >= 0
        ) {
          let year = g1.url.parse(location.href).searchKey["year"];
          $(".cal-button-area span").text(
            `${year - 1} - ${year.toString().substring(2, 4)}`
          );
          // $('.cal-button-area span').text(year)
          $(".year[data-attr='" + year + "']").addClass("highlighted");
        } else if (
          _.keys(g1.url.parse(location.href).searchKey).indexOf("quarter") >= 0
        ) {
          let quater = g1.url.parse(location.href).searchKey["quarter"];
          let year = g1.url.parse(location.href).searchKey["q_year"];
          $(".cal-button-area span").text("Q" + quater + " " + year);
          $(".Q" + quater).addClass("highlighted");
        } else if (date === undefined) {
          let curl = g1.url.parse(location.href);
          let max_date = {
            cmo_new: "get_maximum_date",
            amethi_map: "get_maximum_date_amethi",
            amethi_table: "get_maximum_date_amethi",
            niti_table: "get_niti_maximum_date_district",
            table_noauth: "last_update_noauth",
          };
          let date_url = max_date[curl.file]
            ? max_date[curl.file]
            : "get_maximum_date_district";
          $.getJSON(date_url, function (data) {
            let label = moment(data[0]["date"]).format("MMM YYYY");
            let month_cal = [
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
            ];
            // some = label.split(' ')[0]
            let index = month_cal.indexOf(label.split(" ")[0]) == 11 ? 0 : 1;
            let class_hide =
              "." +
              month_cal
                .slice(month_cal.indexOf(label.split(" ")[0]) + index)
                .join(",.");
            $(class_hide).removeClass("cursor-pointer");
            $(class_hide).css("pointer-events", "none");
            localStorage.setItem("cmo_max_date", label);
            $(".cal-button-area span").text(label);
            $("." + moment(data[0]["date"]).format("MMM")).addClass(
              "active text-dark"
            );
            $("." + moment(data[0]["date"]).format("MMM")).removeClass(
              "opacity-70"
            );
          });
        } else {
          let label = moment(date).format("MMM YYYY");
          $(".cal-button-area span").text(label);
          $("." + moment(date).format("MMM")).addClass("active text-dark");
          $("." + moment(date).format("MMM")).removeClass("opacity-70");
        }
      } else {
        if (
          g1.url.parse(location.href).file === "amethi_map" ||
          g1.url.parse(location.href).file === "amethi_table"
        ) {
          $.getJSON("amethi_max_date", function (data) {
            if (data.length > 0) {
              disable_future_quarters(new Date(data[0]["date"]).getFullYear());
            }
          });
        } else {
          disable_future_quarters(new Date(defaults.date).getFullYear());
        }
      }
      // $(".fa-chevron-left").unbind("click")
      // $(".cal-tb-right").unbind("click")
      $("body")
        .on("click", "td", function () {
          $(".month").removeAttr("id");
          $(this).attr("id", "active");
          $(".quarter").removeAttr("id");
          $(".year").removeAttr("id");
        })
        // removed cal-tab-left
        // removed cal-tab-right
        .on("click", "#for-date", function () {
          var url = g1.url.parse(location.href);
          $("#cal").show();
          var month_selected = url.searchKey["month"];
          var quarter_selected = url.searchKey["quarter"];
          var prev_month = url.searchKey["prev_month"];
          var prev_quarter = url.searchKey["prev_quarter"];
          var year_selected = url.searchKey["year"];
          if (
            month_selected === undefined &&
            quarter_selected === undefined &&
            year_selected === undefined
          ) {
            $(".month").removeAttr("id");
            if (
              g1.url.parse(location.href).file === "amethi_map" ||
              g1.url.parse(location.href).file === "amethi_table"
            ) {
              $.getJSON("get_maximum_date_amethi", function (data) {
                $(".month").removeAttr("id");
                $("." + moment(data[0]["date"]).format("MMM")).attr(
                  "id",
                  "active"
                );
              });
            } else {
              $.getJSON("get_maximum_date_district", function (data) {
                $(".month").removeAttr("id");
                $("." + moment(data[0]["date"]).format("MMM")).attr(
                  "id",
                  "active"
                );
              });

              // $(".jan").attr("id", "active");
            }
          } else if (month_selected !== undefined) {
            url.update(
              { month: month_selected, prev_month: prev_month },
              "month=del&prev_month=del"
            );
            $(".month").removeAttr("id");
            $("." + month_selected).attr("id", "active");
          } else if (quarter_selected !== undefined) {
            url.update(
              { quarter: quarter_selected, prev_quarter: prev_quarter },
              "quarter=del&prev_quarter=del"
            );
            $(".month").removeAttr("id");
            $(".quarter").removeAttr("id");
            $("." + quarter_selected).attr("id", "active_q");
          } else {
            $(".month").removeAttr("id");
            $(".quarter").removeAttr("id");
            $(".year").attr("id", "year_selected");
          }
          $(".quarter").click(function () {
            $(".quarter").removeAttr("id");
            $(".month").removeAttr("id");
            $(".year").removeAttr("id");
            $(this).attr("id", "active_q");
          });
          $(".year").click(function () {
            $(".year").attr("id", "year_selected");
            $(".quarter").removeAttr("id");
            $(".month").removeAttr("id");
          });
          $(".submit").unbind("click");
          $(".submit").click(function () {
            var month_value = $("#active").attr("data-attr");
            var quarter_value = $("#active_q").attr("data-attr");
            var year_value = $(".year").attr("data-attr");
            var year_text = $(".year").text();
            if ($(".year").attr("id") == "year_selected") {
              url.update({
                year: year_value,
                prev_year: parseInt(year_value) - 1,
              });
              $("#date-label").text(year_text);
            } else {
              if (month_value !== undefined) {
                year_value = $("#active").attr("data-year");
                var prev_date = moment(
                  year_value + "-" + month_value,
                  "YYYY-MMM"
                ).subtract(1, "month");
                url.update({
                  year: year_value,
                  month: month_value,
                  prev_month: prev_date.format("MMM"),
                  prev_year: prev_date.year(),
                });
                $("#date-label").text(month_value + " " + year_value);
              } else {
                var month = parseInt(quarter_value[1]) * 3 - 2;
                prev_date = moment(
                  year_value + "-" + month,
                  "YYYY-MM"
                ).subtract(3, "month");
                url.update({
                  year: year_value,
                  quarter: quarter_value,
                  prev_quarter: "Q" + (prev_date.month() / 3 + 1),
                  prev_year: prev_date.year(),
                });
                $("#date-label").text(
                  quarter_value +
                    " " +
                    (url.searchKey.year - 1) +
                    " - " +
                    url.searchKey.year
                );
              }
            }
            window.history.pushState({}, "", url.toString());
            $("#cal").hide();
            // $.when($('.loading-icon').show()).then(redraw_table_view)
            if (url.file == "map_view")
              $.when($(".loading-icon").show()).then(
                draw_map_view(parse_url(), ["all"])
              );
          });
          if (url.file == "amethi_map" || url.file == "amethi_table") {
            $(".quarter").off("click");
            $(".year").off("click");
          }
        })
        .on("click", "#close-cal", function () {
          $("#cal").hide();
        })
        .on("click", ".calendar-button", function () {
          if ($(".cal_wid").css("display") === "none") {
            $(".cal_wid").show();
          } else {
            $(".cal_wid").hide();
          }
        });
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
      current_month:
        moment(FULL_LATEST_DATE).format("MMM") || moment().format("MMM"),
      current_year:
        (moment(FULL_LATEST_DATE).month() + 1 <= 3
          ? parseInt(moment(FULL_LATEST_DATE).format("YYYY"))
          : parseInt(moment(FULL_LATEST_DATE).format("YYYY")) + 1) ||
        (moment().month() + 1 <= 3
          ? parseInt(moment().format("YYYY"))
          : parseInt(moment().format("YYYY")) + 1),
      place_holder: "top_cal",
      label:
        (moment(FULL_LATEST_DATE).month() + 1 <= 3
          ? parseInt(moment(FULL_LATEST_DATE).format("YYYY"))
          : parseInt(moment(FULL_LATEST_DATE).format("YYYY")) + 1) ||
        (moment().month() + 1 <= 3
          ? parseInt(moment().format("YYYY"))
          : parseInt(moment().format("YYYY")) + 1),
    });
}

function disable_future_quarters(year) {
  var url = g1.url.parse(location.href);
  var max_date = {
    cmo_new: "get_maximum_date",
    amethi_map: "get_maximum_date_amethi",
    amethi_table: "get_maximum_date_amethi",
    niti_table: "get_niti_maximum_date_district",
    table_noauth: "last_update_noauth",
  };
  var date_url = max_date[url.file]
    ? max_date[url.file]
    : "get_maximum_date_district";
  $.getJSON(date_url, function (data) {
    let defaults_date = moment(data[0]["date"]).format("YYYY-MM-DD");
    var quarter = ["Q1", "Q2", "Q3", "Q4"];
    // disable_future_quarters(new Date(defaults_date).getFullYear())
    year = year || new Date(defaults_date).getFullYear();
    var cur_month_no = new Date(defaults_date).getMonth(); // current month number
    var cur_month = moment(defaults_date).format("MMM"); // current month name
    var _q = { Q1: [3, 4, 5], Q2: [6, 7, 8], Q3: [9, 10, 11], Q4: [0, 1, 2] };
    var months = [
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
    ];
    if (year >= new Date(defaults_date).getFullYear()) {
      _.each(_q, function (v, k) {
        if (_.includes(v, cur_month_no)) {
          // var current_q = k.replace('Q','')

          for (var i = quarter.indexOf(k) + 1; i <= quarter.length - 1; i++) {
            $("." + quarter[i]).removeAttr("id");
            $("." + quarter[i]).addClass("pointer-none");
          }
        }
      });

      for (var i = months.indexOf(cur_month) + 1; i <= months.length - 1; i++) {
        $("." + months[i]).removeAttr("id");
        $("." + months[i]).addClass("pointer-none");
      }
    } else {
      for (let i = 0; i <= quarter.length; i++) {
        $("." + quarter[i]).removeAttr("id");
        $("." + quarter[i]).removeClass("pointer-none");
      }

      for (let i = 0; i <= months.length; i++) {
        $("." + months[i]).removeAttr("id");
        $("." + months[i]).removeClass("pointer-none");
      }
    }
  });
}
