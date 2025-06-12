/* exported slug_, helpers_get_, top_panel_dropdown, render_classes_, render_indicators_,
  parse_response, render_vega, merge_arrays, rename_keys, url_update, district_dropdown_reset,
  load_pa_calendar, populate_date_label, compute_growth, screenshot, notyfication_, pa_indicator_mapping,
  add_date_text, isIpad, check_session, _class,trigger_submit */
// eslint-disable-next-line no-unused-vars
/* global vega, program_config, g1, Promise, render_overview_charts, render_dashboard, render_score_matrix, Noty, date_type:true,
  vegaTooltip, JSInterface, session_id user_data,_date,trigger_common */

// DO NOT REMOVE - sentry for up-tsu project -- tracks errors in application
// Sentry.init({ dsn: 'https://71eecfb282674fc0948d0a83e6d23117@sentry.io/1759322' });

// note that DSN link will change from project to project, this is created when you create an application in `Sentry`
var url = g1.url.parse(location.href);
var pa_indicator_mapping = "";
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

function check_session() {
  let _url = "active_session?" + $.param({ id: session_id });
  helpers_get_(_url).then(function (d) {
    if (d === "false") {
      window.location.replace(
        "login?next=" + encodeURIComponent(location.href)
      );
      // (url.file + '?' + url.search)
    }
  });
}

function render_indicators_(no_re_load) {
  // render top panel dropdown
  let program = url.searchKey.program || program_config.default_program;
  $("select.indicator-selected").empty();
  let _url = "pa-indicator-mapping?program_area=" + program; // + $('.program-selected').selectpicker('val').toUpperCase() || 'mh'
  if ($(".class-selected").selectpicker("val") !== "all")
    _url +=
      "&class=" +
      ($(".class-selected").selectpicker("val") ||
        program_config.default_class);
  helpers_get_(_url).then(function (resp) {
    check_session();
    resp = JSON.parse(resp);
    if (_.includes(["", undefined], url.searchKey.indicator_id)) {
      url_update({ indicator_id: resp[0].indicator_id });
    }
    if (!_.includes(["overview_home", "area_profile"], url.searchKey.page))
      $("select.indicator-selected").append(
        '<option value="all" class="sm2" selected > All Indicators </option>'
      );
    _.each(resp, function (_indicator) {
      let option =
        '<option value="' +
        _indicator.indicator_id +
        '" class="sm2"' +
        (url.searchKey.indicator_id === _indicator.indicator_id.toString()
          ? "selected"
          : "") +
        ">" +
        _indicator.indicator_name +
        "</option>";
      $("select.indicator-selected").append(option);
    });
    $("select.indicator-selected.selectpicker").selectpicker("refresh");
  });

  if (url.file == "pa-overview" && !no_re_load) {
    if (!url.searchKey.page || url.searchKey.page === "overview_home")
      setTimeout(render_overview_charts, 500);
  }
}

function top_panel_dropdown(program_config, selected_prog_card, ind_id) {
  let _program = url.searchKey.program || program_config.default_program;
  let _indicator_config =
    program_config.program_indicator_list[_program]["classes"];
  if (url.file != "pa") {
    var _class = url.searchKey.class || selected_prog_card.default_class;
  } else {
    _class = url.searchKey.class || null;
  }
  let _indicator_id =
    ind_id ||
    url.searchKey.indicator_id ||
    selected_prog_card.default_indicator;
  let _date = url.searchKey.date || selected_prog_card.date;
  let _type = url.searchKey.type || selected_prog_card.type;
  url_update({
    program: _program,
    class: _class,
    date: _date,
    indicator_id: _indicator_id,
  });
  $(".nav-top-filters") // Top navigations template
    .on("template", function () {
      populate_date_label(_date, _type);
      render_classes_();

      // Side Navigation pane
      // var user_data = {{json.dumps(user_info)}}
      $(".sidenav")
        .on("template", function () {
          // $('.user_name').text(user_data.name)
          $(".user_name").text(user_data.user);
          $("#aside-nav").addClass("d-none"); // hides side nav on default loads
        })
        .template({ user: user_data.designation || "Admin" });
    })
    .template({
      progs: program_config.program_image_mapping,
      classes: _indicator_config,
      selected: selected_prog_card,
      isipad: isIpad(),
      type: _type,
      date: _date,
    });
}

function render_classes_(no_re_load) {
  let program = url.searchKey.program || program_config.default_program;
  let _program =
    typeof $(".program-selected").selectpicker("val") === "string"
      ? $(".program-selected").selectpicker("val")
      : program;
  let _indicator_config =
    program_config.program_indicator_list[_program]["classes"];
  $("select.class-selected").empty();
  if (
    (url.searchKey.page && url.searchKey.page !== "overview_home") ||
    url.file == "pa-compare"
  )
    $("select.class-selected").append(
      '<option value="all" class="sm2" selected> ALL </option>'
    );
  _.each(Object.keys(_indicator_config), function (v, i) {
    let option;
    if (url.searchKey.class === v)
      option =
        '<option value="' + v + '" class="sm2" selected >' + v + " </option>";
    else
      option =
        '<option value="' +
        v +
        '" class="sm2" ' +
        (!url.searchKey.class && i === 0 ? "selected" : "") +
        " >" +
        v +
        " </option>";
    $("select.class-selected").append(option);
  });
  $("select.class-selected.selectpicker").selectpicker("refresh");
  render_indicators_(no_re_load);
}

function parse_response(response) {
  // parses promise object
  response = typeof response == Object ? response : JSON.parse(response);
  return response;
}

function render_vega(data_spec, id, options) {
  options = options || {};
  var handler = new vegaTooltip.Handler(options.tooltip || {});
  // renders vega chart for a given spec and class id
  let view = new vega.View(vega.parse(data_spec))
    .renderer("svg")
    .logLevel(vega.Warn)
    .tooltip(handler.call)
    .initialize(id)
    .width($(id).width())
    .height($(id).height())
    .hover()
    .runAsync()
    .then(function () {
      if (options.post_run) {
        options.post_run();
      }
    });

  return view;
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

//Update URL
function url_update(uri) {
  var clear_url = g1.url.parse(location.href).update(uri);
  history.pushState({}, "", clear_url.toString());
  url = g1.url.parse(location.href);
}

function screenshot(selector, filename) {
  try {
    if (isIpad()) {
      JSInterface.screen_shot({ value: "trigger screenshot" });
      notyfication_("success", "Screenshot captured!");
    } else {
      location.href =
        "capture?ext=png&delay=2000&url=" +
        encodeURIComponent(location.href) +
        "&selector=" +
        encodeURIComponent(selector) +
        "&start=start&file=" +
        filename;
    }
  } catch (error) {
    notyfication_("error", error.name);
  }
}

// Triggered when Submit button on calendar is hit
function trigger_submit() {
  trigger_common();
  date_type = url.searchKey.type;
  if (url.file === "pa" || url.file == "executive-summary") {
    render_dashboard();
  } else if (url.file === "pa-overview") {
    render_overview_charts();
    populate_date_label(_date, date_type);
  } else if (url.file === "pa-compare") {
    render_score_matrix();
    populate_date_label(_date, date_type);
  }
}

// Loads the calendar component
function load_pa_calendar(cal_type) {
  $(".calendar")
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
        $(".fa-chevron-left, .fa-chevron-right").removeClass("cursor-pointer");
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
      current_year: parseInt(moment().format("YYYY")),
    });
  $(".datepicker").template();
}

// Populates the date label adjacent to calendar icon
function populate_date_label(_date, _type) {
  // Updates default url params if not present
  var sel_f_text, sel_text;
  var url = g1.url.parse(location.href);
  var date = _date || program_config.date;
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
  url.update({ date: date, type: type, fdate: fdate });
  // url.update({'date': date, type : type})
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

//Handler for districts_type in district dropdown
$("body")
  .on("click", ".districts_type .nav-item", function () {
    let parent = $(this).closest(".dropdown-template");
    let _dist_type = $(this).attr("value");
    parent.find(".districts_type .nav-item i").addClass("d-none");
    $(this).find("i").removeClass("d-none");
    parent.find(".districts_type .nav-item a").addClass("opacity-30");
    $(this).find("a").removeClass("opacity-30");
    parent.find(".districts_list ul").addClass("d-none");
    parent
      .find(".districts_list")
      .find("." + _dist_type)
      .removeClass("d-none");
    parent.find(".districts_type").attr("value", _dist_type);
  })
  //Handler for districts_list in district dropdown
  .on("click", ".districts_list ul li", function () {
    let parent = $(this).closest(".districts_list");
    // url = g1.url.parse(location.href)
    // var compare_type = program_config.compare_type,
    //   def_list = program_config.default_selection[compare_type]
    // var comp_list = url.searchList.comp_list || def_list
    // if(comp_list.length>=6){
    //   alert("Select upto 3 to 6 options")
    //   return
    // }
    if (!$(".comp-drpdwn").hasClass("show")) {
      parent
        .find(".nav .nav-link")
        .addClass("opacity-30")
        .removeClass("text-primary");
    }
    $(this).find("a").removeClass("opacity-30").addClass("text-primary");
    let _dist_selected = $(this).find("a").text();
    parent.attr("value", _dist_selected);
  })
  .on("click", ".custom-dropdown .dropdown-menu", function (e) {
    e.stopPropagation();
  })
  //Handler for district Dropdown reset button
  .on("click", ".district-dropdown-reset", function (e) {
    if (url.file != "pa-compare") {
      var dropdown_id = "#" + $(this).closest(".custom-dropdown").attr("id");
    } else {
      dropdown_id = "#district-dropdown";
    }
    district_dropdown_reset(dropdown_id);
    e.stopPropagation();
  })
  .on("click", ".hamburger", function () {
    $("#aside-nav").removeClass("d-none");
    $(
      ".user-profile, .versions, .user_manual, .short-video, .long-video, .analytics, .update_text"
    ).addClass("d-none");
    $(".home_tab").text("District Ranking Dashboard");
  })
  .on("click", ".close-icon", function () {
    $("#aside-nav").addClass("d-none");
  });

function district_dropdown_reset(id) {
  if (!id) id = "";
  let dropdown_key = {
    "#district_dropdown_1": "area",
    "#district_dropdown_2": "area2",
    "#d1": "d1",
    "#d2": "d2",
    "#d3": "d3",
  };
  let selection_type = "";
  if (
    url.searchKey.area_selected === "district" ||
    id === "#district_dropdown_2"
  )
    selection_type = "district_all";
  else if (url.searchKey.area_selected === "division")
    selection_type = "division_list";
  else if (url.file === "pa") selection_type = "district_all";

  $(id + " .districts_list .nav .nav-link, .districts_type .nav-item a")
    .addClass("opacity-30")
    .removeClass("text-primary");
  $(id + " .districts_list .nav, .districts_type .nav-item i").addClass(
    "d-none"
  );
  $(id + " .districts_list .district_all").removeClass("d-none");
  $(id + " .districts_type").attr("value", "");
  $(id + " .districts_list").attr("value", "");
  $(id + " .district-dropdown-search")
    .val("")
    .trigger("change");
  $(id + " .districts_type")
    .find("[value=" + selection_type + "]")
    .find("i")
    .removeClass("d-none");
  $(id + " .districts_type")
    .find("[value=" + selection_type + "]")
    .find("a")
    .removeClass("opacity-30");
  $(id + " .districts_type")
    .find("[value=" + selection_type + "]")
    .click();
  if (url.file != "pa-compare") {
    let _area = url.searchKey[dropdown_key[id]];
    let target_li = $(id + ' .districts_list [data-val="' + _area + '"]');
    if (target_li.length > 0) {
      target_li.children().addClass("text-primary").removeClass("opacity-30");
    }
  } else {
    _.each(url.searchList["comp_list"], function (d) {
      let target_li = $(id + ' .districts_list [data-val="' + d + '"]');
      if (target_li.length > 0) {
        target_li.children().addClass("text-primary").removeClass("opacity-30");
      }
    });
  }
}

$(function () {
  let _url =
    "pa-indicator-mapping?program_area=" + url.searchKey.program || "MH";
  $.get("ticker_data", function (data) {
    _.each(data, function (d) {
      $("." + d.ticker_id).text(d.msg);
    });
  });
  helpers_get_(_url).then(function (resp) {
    check_session();
    pa_indicator_mapping = JSON.parse(resp);
  });
});
