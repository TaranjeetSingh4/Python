/*NavBar container 1 and container 2 details*/
/* exported url_update,searchFun,district_ranking, fetch_data, load_top_containers, url, division_district_map,
  UI, return_url, merge_arrays, sort_list, get_indicators_list, district_name_mapping, render_nav_bar, get_latest_date */
/*global url, indicator_mapping, user_data, defaults
  url:true JSInterface*/

var insights_ = []; //[{'per': '89%', 'name': "of pregnant woman were registered in the program (HMIS)"}]
url = g1.url.parse(location.href);
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
var data_map_dist = {
  Unnao: "Unnav",
  Kheri: "Lakhimpur Kheri",
  Mahrajganj: "Maharajganj",
};
var district_name_mapping = {
  Allahabad: "Prayagraj",
  Faizabad: "Ayodhya",
  "Allahabad Division": "Prayagraj Division",
  "Faizabad Division": "Ayodhya Division",
};
function return_url() {
  return url;
}

var default_ind = [
  {
    indicator:
      "% of children received full immunization (BCG, Penta 1, 2, 3, Measles)",
  },
  {
    indicator:
      "% of pregnant women delivered in institution against estimated delivery",
  },
  { indicator: "Total case notification rate of TB against expected TB cases" },
  { indicator: "% JSY Incentive" },
  { indicator: "% of fund utilized against approved budget" },
  { indicator: "Treatment Success Rate  as per total cases notified" },
];

var UI = (function () {
  // load container1
  function load_top_containers() {
    render_nav_bar();
    // Insights template
    $(".container")
      .on("template", function () {
        var params = g1.url.parse(location.href).searchKey;
        if (params.to !== undefined) {
          $(".curr").text(moment(params.to, "YYYY-MM-DD").format("MMM YYYY"));
          $(".prev").text(moment(params.from, "YYYY-MM-DD").format("MMM YYYY"));
        } else {
          $(".curr").text(moment().subtract(3, "month").format("MMM YYYY"));
          $(".prev").text(moment().subtract(4, "month").format("MMM YYYY"));
        }
      })
      .template({
        insights_data: insights_,
      });
  }
  function render_nav_bar() {
    var dashboard_data = [
      { name: "Dashboard", img: "home", nav: "./" },
      { name: "Insights", img: "insight-small", nav: "#" },
      { name: "Map", img: "map", nav: "map" },
      { name: "Program Area", img: "home", nav: "pa-landing" },
      { name: "Alerts", img: "alarm", nav: "#" },
      { name: "About us", img: "information", nav: "#" },
      { name: "Versions", img: "folder", nav: "#" },
      { name: "User Manual", img: "folder", nav: "files/user_manual.pdf" },
      {
        name: "Tutorial (short)",
        img: "video-player",
        nav: "#",
        target: "#forVideo",
      },
      {
        name: "Tutorial (long)",
        img: "video-player",
        nav: "#",
        target: "#forVideoLong",
      },
      { name: "Advanced Analytics", img: "analysis", nav: "#" },
      { name: "Logout", img: "home", nav: "logout" },
      { name: "POPUP", img: "home", nav: "send_popup" },
    ];

    var nav_template_data = {
      container_data:
        url.file === "deepdive" || url.file === "niti_deepdive"
          ? get_districts()
          : create_data_structure("district_list"),
      area: _.includes([undefined, "", "district"], url.searchKey.level)
        ? "district"
        : "division",
      dashboard_details: dashboard_data,
      indicator_: fetch_data("indicator_list", {}).list_by_type,
    };
    // NavBar with uniq districts dropdown list
    $(".nav_bar")
      .on("template", function () {
        $(".user_person").text($(".user_name").attr("id"));
        var name_ = user_data.name;
        $(".last_date").text(moment(FULL_LATEST_DATE).format("MMM"));
        if (!_.includes([null, ""], name_)) $(".user_person").text(name_);
        $("#myUL").hide();
        _.each($("select option"), function (d, i) {
          if ($(d).text().trim() === url.searchKey.district) {
            $("select option").eq(i).attr("selected", "selected");
          }
          $(".user_person").text($(".user_name").attr("id") || "user");
        });
        $(".user_name").attr("id") === "admin"
          ? $("#send_popup").parent().show()
          : $("#send_popup").parent().hide();
        if (url.file === "deepdive") {
          $("#icon").click(function () {
            $("#myInput1").show();
          });
          $("#close_nav").click(function () {
            $("#myInput1").hide();
            document.getElementById("myInput").value = "";
            $("#myUL").hide();
          });
        }
      })
      .template(nav_template_data);
  }
  // fetching data
  function create_data_structure(section_name) {
    var data = null;
    var params = url.searchKey;
    _.each($("select option"), function (d, i) {
      if ($(d).text().trim() === url.searchKey.district) {
        $("select option").eq(i).attr("selected", "selected");
      }
    });

    if (section_name === "profile") {
      data = fetch_data("profile_data", params);
      return data;
    } else if (section_name === "district_list") {
      params = { _c: "district" };
      var list = [{ district: "Uttar Pradesh" }];
      return list.concat(
        _.sortBy(
          _.uniqWith(fetch_data("district_data", params), _.isEqual),
          "district"
        )
      );
    } else if (section_name === "complete_data") {
      // debugger
      params.district =
        data_map_dist[params.district] === undefined
          ? params.district
          : data_map_dist[params.district];
      // data = (params.district == undefined || params.district == 'Uttar Pradesh') ? fetch_data('summary_overall', params) : fetch_data('summary', params)
      data =
        params.district == undefined || params.district == params.district
          ? fetch_data("summary_overall", params)
          : fetch_data("summary", params);
      return data;
    }
  }

  // convert to and from url into date
  function stringify_(params) {
    if (params.district === "Uttar Pradesh") {
      delete params.district;
    }
    if (_.has(params, "from")) {
      params.date = [params.from, params.to];
    }
    var params_ = $.param(params, true);
    // params_ = _.replace(params_, 'from', 'date')
    // params_ = _.replace(params_, 'to', 'date')
    return params_;
  }
  /* for fetching data */
  function fetch_data(url, params) {
    var params_ = typeof params !== "string" ? stringify_(params) : params;
    var data;
    $.ajax({
      url: url,
      async: false,
      data: params_,
      success: function (response) {
        data = response;
      },
    });
    return data;
  }
  // render profile page with data
  function get_profile_data(district_name) {
    var data = fetch_data("profile_data", { district: district_name });
    var profile_data = [],
      header_data = [],
      profile_labels = [
        "IMR",
        "NMR",
        "U5MR",
        "MMR",
        "TFR",
        "CBR",
        "Unmet Need for Spacing",
        "Unmet Need for Limiting",
      ],
      top_labels = {
        "Total Population": "Estd. Population 2017",
        "Sex Ratio": "Sex Ratio",
        "Literacy Rate": "Literacy",
      };

    _.each(profile_labels, function (d) {
      var value = data.length === 0 ? 0 : data[0][d];
      profile_data.push({ name: d, value: value });
    });

    _.each(top_labels, function (value, key) {
      var value2 = data.length === 0 ? 0 : data[0][value];
      header_data.push({ name: key, value: value2 });
    });
    return {
      district: district_name,
      header_data: header_data,
      profile_data: profile_data,
    };
  }

  return {
    create_data_structure: create_data_structure,
    get_profile_data: get_profile_data,
    load_top_containers: load_top_containers,
    fetch_data: fetch_data,
    render_nav_bar: render_nav_bar,
  };
})();

UI.load_top_containers();
var FULL_LATEST_DATE;
get_latest_date();

function get_districts() {
  if (url.file === "deepdive" || url.file === "niti_deepdive") {
    let _list;
    if (_.includes([undefined, "", "district"], url.searchKey.level))
      _list = UI.fetch_data("get_list", "")["district"];
    else _list = UI.fetch_data("get_list", "")["division"];
    return _list;
  } else {
    var lst = UI.fetch_data("districts_all", "");
    return lst; //UI.fetch_data('districts_all', "")
  }
}

/* Merge two arrays */
function merge_arrays(array1, array2, key) {
  var merged_data = [];
  if (user_data.user != "CM_Office1") {
    merged_data = _.map(array1, function (obj) {
      var find = {};
      find[key] = obj[key];
      return _.assign(obj, _.find(array2, find));
    });
  } else {
    merged_data = _.merge(_.keyBy(array1, key), _.keyBy(array2, key));
    merged_data = _.values(merged_data);
  }
  return merged_data;
}

function sort_list(list, col_name) {
  var indicators_list = _.map(indicator_mapping, "indicator_name");
  var sortedCollection = _.sortBy(list, function (item) {
    return indicators_list.indexOf(item[col_name]);
  });
  return sortedCollection;
}

/*
update url without page refresh
uri is dictionary
*/
function url_update(uri) {
  var clear_url = g1.url.parse(location.href).update(uri);
  history.pushState({}, "", clear_url.toString());
}

// search clickevent
function searchFun() {
  $("#myUL").show();
  var input, filter, ul, li, a, i;
  input = document.getElementById("myInput");
  filter = input.value.toUpperCase();
  if (filter.length === 0) {
    $("#myUL").hide();
  } else {
    $("#myUL").show();
  }
  ul = document.getElementById("myUL");
  li = ul.getElementsByTagName("li");
  var total = 0;
  var _type = url.file === "map" ? "span" : "span";
  for (i = 0; i < li.length; i++) {
    a = li[i].getElementsByTagName(_type)[0];
    if (a.innerHTML.toUpperCase().indexOf(filter) > -1) {
      li[i].style.display = "";
      total += 1;
    } else {
      li[i].style.display = "none";
    }
  }
  total === 0 ? $(".search-check").show() : $(".search-check").hide();
}
if (url.file === "")
  $(document).ready(function () {
    $("#icon").click(function () {
      $("#myInput1").hide();
    });
    $("#icon").click(function () {
      $("#myInput1").show();
    });
    $("#close_nav").click(function () {
      $("#myInput1").hide();
      document.getElementById("myInput").value = "";
      $("#myUL").hide();
    });
  });

$("#download_png").on("click", function () {
  var href = "capture?ext=png" + "&url=" + encodeURIComponent(url);
  location.href = href;
});

$(".screenshot").on("click", function () {
  if (!navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
    $(".footer").hide();
    setTimeout(function () {
      JSInterface.screen_shot({ value: "trigger screenshot" });
    }, 3000);
    setTimeout(function () {
      $(".footer").show();
    }, 4000);
  } else {
    setTimeout(function () {
      JSInterface.screen_shot({ value: "trigger screenshot" });
    }, 1000);
  }
});

function load_calendar() {
  $(".calendar")
    .on("template", function () {
      var quarter = ["Q1", "Q2", "Q3", "Q4"];
      disable_future_quarters(new Date(defaults.date).getFullYear());
      function disable_future_quarters(year) {
        var cur_month_no = new Date(defaults.date).getMonth(); // current month number
        var cur_month = moment(defaults.date).format("MMM"); // current month name
        var _q = {
          Q1: [3, 4, 5],
          Q2: [6, 7, 8],
          Q3: [9, 10, 11],
          Q4: [0, 1, 2],
        };
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
        //  for quarters
        if (year >= new Date(defaults.date).getFullYear()) {
          _.each(_q, function (v, k) {
            if (_.includes(v, cur_month_no)) {
              // var current_q = k.replace('Q','')
              for (
                var i = quarter.indexOf(k) + 1;
                i <= quarter.length - 1;
                i++
              ) {
                $("." + quarter[i]).removeAttr("id");
                $("." + quarter[i]).addClass("pointer-none");
              }
              // for (var i = 0; i <= quarter.length; i++) {
              //   if(quarter[i] != k){
              //     $('.' + quarter[i]).removeAttr('id')
              //     $('.' + quarter[i]).addClass('pointer-none')
              //   }
              // }
            }
          });
          // for months
          for (
            var i = months.indexOf(cur_month) + 1;
            i <= months.length - 1;
            i++
          ) {
            // months.indexOf(cur_month)+1
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
      }
      $(document).on("click", "td", function () {
        var month = moment.monthsShort();
        for (var i = 0; i < month.length; i++) {
          $("." + month[i]).removeAttr("id");
        }
        $(this).attr("id", "active");
        // var quarter = ['Q1', 'Q2', 'Q3', 'Q4']
        for (i = 0; i < quarter.length; i++) {
          $("." + quarter[i]).removeAttr("id");
        }
        $(".year").removeAttr("id");
      });

      $(document)
        .on("click", ".fa-chevron-left", function () {
          var year = parseInt($(".year").attr("data-attr")) - 1;
          $(".year").text(year - 1 + " - " + year);
          $(".year").attr("data-attr", year);
          $(".month").each(function () {
            $(this).attr("data-year", parseInt($(this).attr("data-year")) - 1);
          });
          disable_future_quarters(year - 1);
          if (year >= new Date().getFullYear()) {
            $(".next-yr").removeClass("pointer-none");
          }
        })
        .on("click", ".fa-chevron-right", function () {
          var year = parseInt($(".year").attr("data-attr"));
          disable_future_quarters(year);
          if (year - 1 >= new Date().getFullYear()) {
            $(".next-yr").addClass("pointer-none");
          } else {
            $(".year").text(year + " - " + (year + 1));
            $(".year").attr("data-attr", year + 1);
            $(".month").each(function () {
              $(this).attr(
                "data-year",
                parseInt($(this).attr("data-year")) + 1
              );
            });
          }
          // <%- new Date().getFullYear() <= current_year ? 'cursor-pointer' :  %>
        })
        .on("click", "#for-date", function () {
          $(
            ".anvesh, .map_legend_content, .mapid, form, #deepdive-container, #analytics-container"
          ).hide();
          $(".main-box").hide();
          $(".deepdive-mainview").hide();
          $("#cal").show();
          var url = g1.url.parse(location.href);
          var month_selected = url.searchKey["month"];
          var quarter_selected = url.searchKey["quarter"];
          var year_selected = url.searchKey["year"];
          $(".month").removeAttr("id");
          $(".quarter p").removeAttr("id");
          $(".year").removeAttr("id");
          if (!month_selected && !quarter_selected && !year_selected) {
            month_selected = moment(FULL_LATEST_DATE).format("MMM");
          }
          if (month_selected != "") {
            var month = moment.monthsShort();
            for (var i = 0; i < month.length; i++) {
              $("." + month[i]).removeAttr("id");
            }
            $("." + month_selected).attr("id", "active");
          }
          if (quarter_selected != "") {
            month = moment.monthsShort();
            // var quarter = ['Q1', 'Q2', 'Q3', 'Q4']
            for (i = 0; i < quarter.length; i++) {
              $("." + quarter[i]).removeAttr("id");
            }
            $("." + quarter_selected).attr("id", "active_q");
          }
          var today = new Date();
          $(".quarter p").click(function () {
            // var quarter = ['Q1', 'Q2', 'Q3', 'Q4']
            // var _q = {'Q1':[3,4,5], 'Q2':[6,7,8], 'Q3':[9,10,11],'Q4':[0,1,2]}
            for (var i = 0; i < quarter.length; i++) {
              $("." + quarter[i]).removeAttr("id");
            }
            $(this).attr("id", "active_q");
            var month = moment.monthsShort();
            for (i = 0; i < month.length; i++) {
              $("." + month[i]).removeAttr("id");
            }
            $(".year").removeAttr("id");
          });

          // logic for the year selection .....................
          $(".year").unbind("click");
          $(".year").click(function () {
            var id_attr_value = $(".year").attr("id");
            if (id_attr_value != null) {
              $(".year").removeAttr("id");
            } else {
              $(".year").attr("id", "year_selected");
              //remove the quarter
              // var quarter = ['Q1', 'Q2', 'Q3', 'Q4']
              for (var i = 0; i < quarter.length; i++) {
                $("." + quarter[i]).removeAttr("id");
              }
              var month = moment.monthsShort();
              for (i = 0; i < month.length; i++) {
                $("." + month[i]).removeAttr("id");
              }
            }
          });
          month = moment(today, "YYYY-MM-DD").format("MMM");
          $(".submit").unbind("click");
          $(".submit").click(function () {
            $(".anvesh, .map_legend_content, .mapid, form").show();
            $(".main-box").show();
            $(".deepdive-mainview").show();
            var month = moment.monthsShort();
            // var quarter = ['Q1', 'Q2', 'Q3', 'Q4']
            var month_value = "";
            var quarter_value = "";
            var year_value = "";
            for (var i = 0; i < quarter.length; i++) {
              quarter_value = $("." + quarter[i]).attr("id");
              if (quarter_value == "active_q") {
                quarter_value = quarter[i];
                break;
              }
            }
            if (quarter_value == null) {
              quarter_value = "";
            }
            for (i = 0; i < month.length; i++) {
              var id_value = $("." + month[i]).attr("id");
              if (id_value == "active") {
                month_value = month[i];
                break;
              }
            }
            year_value = $(".year").attr("data-attr");
            var year_text = $(".year").text();
            var url = g1.url.parse(location.href);
            var upd = "";
            if ($(".year").attr("id") == "year_selected") {
              upd = url.update({
                year: year_value.trim(),
                month: month_value,
                quarter: quarter_value,
                prev_year: year_value.trim() - 1,
              });
              $(".selected_cal").text(year_text);
            } else {
              if (month_value.length != 0) {
                year_value = $("#active").attr("data-year");
                upd = url.update({
                  year: year_value.trim(),
                  month: month_value,
                  quarter: quarter_value,
                  prev_year: year_value.trim() - 1,
                });
                $(".selected_cal").text(month_value + " " + year_value.trim());
              } else if (quarter_value.length != 0) {
                var quarter_index = quarter.indexOf(quarter_value) - 1;
                if (quarter_index == -1) {
                  quarter_index = 3;
                }
                $(".selected_cal").text(quarter_value + " " + year_text);
                upd = url.update({
                  year: year_value.trim(),
                  quarter: quarter_value,
                  month: month_value,
                  prev_quarter: quarter[quarter_index],
                  prev_year: year_value.trim() - 1,
                });
              }
            }
            history.pushState({}, "", "?" + upd.search.toString());
            $("#cal").hide();
          });
        })
        .on("click", "#close-cal", function () {
          $("#cal").hide();
          $(".main-box").show();
          $(".deepdive-mainview").show();
          $(
            ".anvesh, .map_legend_content, .mapid, form, #deepdive-container, #analytics-container"
          ).show();
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
    });
}

if (url.file != "executive-summary") {
  load_calendar();
}

function division_district_map() {
  var data = UI.fetch_data("div_dist_map", {});
  data = _.sortBy(data, "division");
  var map = {};
  _.each(_.groupBy(data, "division"), function (rows, division) {
    map[division] = _.map(_.sortBy(rows, "district"), "district");
  });
  return map;
}

function get_indicators_list() {
  var data = default_ind;
  if (user_data.user != "CM_Office1") {
    // data = UI.fetch_data('district_data', {'_c': ['indicator', 'indicator_id']})
    data = UI.fetch_data("get_indicator_list", "");
  }
  return sort_list(_.uniq(_.map(data, "indicator")));
}

$(document)
  .on("click", ".hamburger", function () {
    $(".modal-backdrop").css("z-index", 0);
  })
  .on("click", ".info-btn", function () {
    $(".modal-backdrop").css("z-index", 0);
    $(".navbar.pos-t").css("z-index", 0);
  })
  .on("click", ".close", function () {
    $(".navbar.pos-t").css("z-index", 3);
    $(".video_pause").each(function () {
      $(this).get(0).pause();
    });
  });

function district_ranking(data, url_, parameter) {
  var to_ = moment(FULL_LATEST_DATE).subtract(1, "months").format("YYYY-MM-DD");
  var from_ = moment(FULL_LATEST_DATE).format("YYYY-MM-DD");
  var filter_type = "date";
  if (
    url.searchKey.month === undefined &&
    url.searchKey.quarter === undefined &&
    url.searchKey.year === undefined
  ) {
    to_ = to_ || 0;
    from_ = from_ || 0;
  } else if (!_.includes([undefined, ""], url.searchKey.month)) {
    from_ = moment(
      url.searchKey.year + "-" + url.searchKey.month + "-01",
      "YYYY-MMM_DD"
    ).format("YYYY-MM-DD");
    to_ = moment(
      url.searchKey.year +
        "-" +
        moment(url.searchKey.year + "-" + url.searchKey.month + "-01")
          .subtract(1, "months")
          .format("MMM") +
        "-01",
      "YYYY-MMM_DD"
    ).format("YYYY-MM-DD");
  } else if (!_.includes([undefined, ""], url.searchKey.quarter)) {
    from_ = parseInt(url.searchKey.quarter[1]);
    to_ = parseInt(url.searchKey.prev_quarter[1]);
    filter_type = "quarter";
  } else {
    from_ = parseInt(url.searchKey.year);
    to_ = parseInt(url.searchKey.prev_year);
    filter_type = "year";
  }

  var def = "composite_index";
  var table_data = [];
  _.each(_.groupBy(data, parameter), function (values, key) {
    if (filter_type === "date") {
      var cm_value = _.find(values, { date: from_ });
      var pm_value = _.find(values, { date: to_ });
    } else if (filter_type === "quarter") {
      cm_value = _.find(values, { quarter: from_ });
      pm_value = _.find(values, { quarter: to_ });
    } else {
      cm_value = _.find(values, { year: from_ });
      pm_value = _.find(values, { year: to_ });
    }
    // debugger
    if (parameter == "district") {
      var row = {
        district: key,
        rank: cm_value === undefined ? "-" : cm_value.composite_rank,
        cm_index: cm_value === undefined ? 0 : cm_value[def],
        pm_index: pm_value === undefined ? 0 : pm_value[def],
      };
    } else {
      row = {
        district: key,
        rank: cm_value === undefined ? "-" : cm_value.composite_rank,
        cm_index: cm_value === undefined ? 0 : cm_value[def],
        pm_index: pm_value === undefined ? 0 : pm_value[def],
      };
    }
    table_data.push(row);
  });
  // table_data = _.orderBy(table_data, 'cm_index', 'desc')
  table_data = _.orderBy(table_data, ["cm_index", "district"], "desc");
  var i = 0;
  var default_value = -99;
  _.each(table_data, function (d) {
    if (default_value !== d.cm_index) {
      i += 1;
    }
    d.rank = i;
    default_value = d.cm_index;
  });
  return table_data;
}

function get_latest_date() {
  let urlmapping = {
    summary: "last_update",
    map: "get_maximum_date",
    trend: "get_maximum_date",
    deepdive: "get_maximum_date",
    analytics: "get_maximum_date",
    "executive-summary": "last_update",
    "executive-summary-capture": "last_update",
    niti_deepdive: "get_niti_maximum_date",
    deepdive_cm: "get_cm_maximum_date",
  };
  let path = g1.url.parse(location.href);
  let lat_url = urlmapping[path.file] || "last_update";
  var latest_date = UI.fetch_data(lat_url, $.param({}, true))[0][0];
  FULL_LATEST_DATE = new Date(latest_date);
  latest_date =
    monthNames[FULL_LATEST_DATE.getMonth()] +
    " " +
    FULL_LATEST_DATE.getFullYear();
  return latest_date;
}
