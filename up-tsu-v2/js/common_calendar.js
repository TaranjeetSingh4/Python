/* globals draw_map_view, parse_url*/
/* exported load_calendar */
const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
var FULL_LATEST_DATE;
get_cmo_latest_date();
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
    // debugger
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
    }
    $(".year").text(year + " - " + (year + 1));
    $(".year").attr("data-attr", year + 1);
    $(".quarter").attr("data-year", year + 1);
    $(".month").each(function () {
      $(this).attr("data-year", parseInt($(this).attr("data-year")) + 1);
    });
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
          //$.getJSON("get_maximum_date", function (data) {
          // let label = moment(data[0]["date"]).format("MMM YYYY");
          let label = moment(FULL_LATEST_DATE).format("MMM YYYY");
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
          let class_hide =
            "." +
            month_cal
              .slice(month_cal.indexOf(label.split(" ")[0]) + 1)
              .join(",.");
          $(class_hide).removeClass("cursor-pointer");
          $(class_hide).css("pointer-events", "none");
          localStorage.setItem("cmo_max_date", label);
          $(".cal-button-area span").text(label);
          $("." + moment(FULL_LATEST_DATE).format("MMM")).addClass(
            "active text-dark"
          );
          $("." + moment(FULL_LATEST_DATE).format("MMM")).removeClass(
            "opacity-70"
          );
          //});
        } else {
          let label = moment(date).format("MMM YYYY");
          $(".cal-button-area span").text(label);
          $("." + moment(date).format("MMM")).addClass("active text-dark");
          $("." + moment(date).format("MMM")).removeClass("opacity-70");
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
        // .on('click', '.cal-tb-left', function () {
        //     // debugger
        //     var year = parseInt($('.year').attr('data-attr')) - 1
        //     $('.year').text((year - 1) + ' - ' + (year))
        //     $('.year').attr('data-attr', (year))
        //     $('.quarter').attr('data-year', (year))
        //     $('.month').removeClass('active')
        //     $('.quarter').removeClass('highlighted')
        //     $('.year').removeClass('highlighted')
        //     $('.month').each(function () {
        //         $(this).attr('data-year', parseInt($(this).attr('data-year')) - 1)
        //     })
        // })
        // .on('click', '.cal-tb-right', function () {
        //     // debugger
        //     console.log("right: ")
        //     $('.month').removeClass('active')
        //     $('.quarter').removeClass('highlighted')
        //     $('.year').removeClass('highlighted')
        //     var year = parseInt($('.year').attr('data-attr'))
        //     $('.year').text((year) + ' - ' + (year + 1))
        //     $('.year').attr('data-attr', (year + 1))
        //     $('.quarter').attr('data-year', (year + 1))
        //     $('.month').each(function () {
        //         $(this).attr('data-year', parseInt($(this).attr('data-year')) + 1)
        //     })
        // })
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
              $(".Jun").attr("id", "active");
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
      current_month: moment(FULL_LATEST_DATE).format("MMM"),
      current_year:
        moment(FULL_LATEST_DATE).month() + 1 <= 3
          ? parseInt(moment(FULL_LATEST_DATE).format("YYYY")) - 1
          : parseInt(moment(FULL_LATEST_DATE).format("YYYY")),
      place_holder: "top_cal",
      label:
        moment(FULL_LATEST_DATE).month() + 1 <= 3
          ? parseInt(moment(FULL_LATEST_DATE).format("YYYY")) - 1
          : parseInt(moment(FULL_LATEST_DATE).format("YYYY")),
    });
}

function fetch_data_api(url) {
  // var params_ = typeof params !== "string" ? stringify_(params) : params;
  var data;
  $.ajax({
    url: url,
    async: false,
    // data: params_,
    success: function (response) {
      data = response;
    },
  });
  return data;
}

function get_cmo_latest_date() {
  let urlmapping = {
    cmo_new: "get_cmo_maximum_date",
  };
  let path = g1.url.parse(location.href);
  let lat_url = urlmapping[path.file] || "last_update";
  var latest_date = fetch_data_api(lat_url)[0][0];
  FULL_LATEST_DATE = new Date(latest_date);
  latest_date =
    monthNames[FULL_LATEST_DATE.getMonth()] +
    " " +
    FULL_LATEST_DATE.getFullYear();
  return latest_date;
}
