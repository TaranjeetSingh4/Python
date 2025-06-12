/* global map, get_rank_spec, get_barchart_spec, get_donut_spec, vega, g1, UI, url_update,render_map, indicator_mapping, user_data, load_pa_calendar, Map */
/* exported isInt, get_comp_rank_data, get_text_curr_prev_month */

var url = g1.url.parse(location.href);
var district_names = { Allahabad: "Prayagraj", Faizabad: "Ayodhya" };
var isDivision = !_.includes(["", null, undefined], user_data.division);
var isStateUser =
  !isDivision && _.includes(["", null, undefined], user_data.district);
var _main_area = isStateUser ? "state" : isDivision ? "division" : "district";
var _area = isStateUser ? "division" : isDivision ? "district" : "block";
var _is_pdf = url.file === "executive-summary-capture";

var _date = get_curr_prev_months("default"); // {curr_month: "2019-04-01", prev_month: "2019-03-01", prev_2_month: "2019-02-01"}

/* Updates time period url parameters */
var date = url.searchKey["date"] || _date["curr_month"];
var type = url.searchKey["type"] || "month";
url_update({ date: date, type: type });

// Update _date dict based on url param 'date'
_date = get_curr_prev_months(date);
var _date_text = get_text_curr_prev_months(date); // {curr_month: "Apr'19", prev_month: "Mar'19", prev_2_month: "Feb'19"}

var table_toggle = url.searchKey["table_toggle"] || "district";
var state_table_area = isStateUser ? table_toggle : _area;

/* Updates url parameters based on logged in user */
function get_text_curr_prev_month() {
  let select_date = url.searchKey.date;
  // console.log(select_date)
  let temp_date = new Date(select_date);
  // console.log(temp_date)
  let next_mon = moment(temp_date)
    .add("months", 1)
    .startOf("month")
    .format("MMM'YY");
  // console.log(last_mon)

  return { curr_month: next_mon };
}
// get_text_curr_prev_month()

if (isStateUser) {
  user_data.state = "Uttar Pradesh";
  url_update({
    state: "Uttar Pradesh",
    check: "yes",
    table_toggle: state_table_area,
  });
} else if (isDivision) {
  url_update({
    division: user_data.division || "Agra Division",
    check: "yes",
    division_level: user_data.map_id,
  });
} else {
  url_update({ district: user_data.district || "Agra" });
}

// Side Navigation panel render code
$(".user_name").text(user_data.name);
$(".user-profile").template({
  user_name: user_data.name,
  details: {
    mobile: user_data.phonenumber,
    district: user_data.district || "All",
    designation: user_data.designation || "Admin",
    program: user_data.program || "None",
  },
});
$(".mapview-sidenav")
  .one("template", function () {
    $(".user_name").text(user_data.name);
    $(".user_name").text($(".user_name").attr("id"));
    $.getJSON("get_maximum_date_district", function (data) {
      var date_t = moment(data[0]["date"]).add(1, "months").format("MMM yyyy");
      $(".last_date").text(date_t);
      // $(".last_date").text("Feb 2023");
    });
  })
  .template({ user: user_data.designation || "Admin", xsrf: $("#xsrf").val() });

function update_status() {
  if (isStateUser) {
    user_data.state = "Uttar Pradesh";
    url_update({
      state: "Uttar Pradesh",
      check: "yes",
      table_toggle: state_table_area,
    });
  } else if (isDivision) {
    var distinct_division_id = localStorage.getItem("distinct_division_id");
    // let distric_name = user_data.district || 'Agra'
    if (!distinct_division_id) {
      $.get("distinct_division_id", function (data) {
        localStorage.setItem("distinct_division_id", JSON.stringify(data));
      });
    }
    url_update({
      division: user_data.division || "Agra Division",
      check: "yes",
      division_level: user_data.map_id,
    });
  } else {
    var distinct_district_id = localStorage.getItem("distinct_district_id");
    let distric_name = user_data.district || "Agra";
    if (!distinct_district_id) {
      $.get("distinct_district_id", function (data) {
        localStorage.setItem("distinct_district_id", JSON.stringify(data));
      });
    }
    url_update({ district: distric_name });
  }
}

// Loads the No Data template
$.when(update_status()).then(function () {
  $(".no_data")
    .one("template", function () {
      render_dashboard();
    })
    .template({});
});

//////////////////////////////////////////////////////////////////////////////////////
function render_dashboard() {
  $(".loading-icon").show();
  url = g1.url.parse(location.href);
  date = url.searchKey["date"] || _date["curr_month"];
  _date = get_curr_prev_months(date); // Update _date dict based on url param 'date'
  _date_text = get_text_curr_prev_months(date); // {curr_month: "Apr'19", prev_month: "Mar'19", prev_2_month: "Feb'19"}

  // page render functions (page 1,2,3)
  load_pa_calendar(); // Loads the calendar component
  // populate_date_label() // Populates the date label adjacent to calendar icon
  $(".date-label").text(
    _date_text["curr_month"].substring(0, 3) +
      " " +
      moment(_date["curr_month"]).year()
  ); // Populates the date label adjacent to calendar icon

  var max_date = get_curr_prev_months("default")["curr_month"];
  // Case when data is present
  if (date <= max_date) {
    show_es();
    draw_page_1();
    draw_insights();
    draw_rank_chart();
    draw_table();
    pdf_draw_table();
    $(".loading-icon").hide();
  }
  // No data case
  else {
    $(".loading-icon").show();
    hide_es();
    $(".loading-icon").hide();
  }
}
//////////////////////////////////////////////////////////////////////////////////////
function draw_insights() {
  // Insights template
  $(".executive_p2_insights")
    .one("template", function () {})
    .template({ d: get_insight_data() });
}

function draw_table() {
  // Dashboard - Draws table
  var table_dict = get_table_data(state_table_area);
  var comp_rank_data = get_comp_rank_data(state_table_area);
  // Table template
  $(".executive_table")
    .one("template", function () {
      jQuery(".main-table")
        .clone(true)
        .appendTo("#table-scroll")
        .addClass("clone");
      // $(".main-table").remove()
      if (isStateUser) {
        if (state_table_area === "district") {
          $("#level").attr("checked", true);
          $(".level-district").removeClass("text-secondary");
          $(".level-division").addClass("text-secondary");
        } else if (state_table_area === "division") {
          $("#level").attr("checked", false);
          $(".level-division").removeClass("text-secondary");
          $(".level-district").addClass("text-secondary");
        }
      }
    })
    .template({
      _area: state_table_area,
      d: table_dict["table_data"],
      comp_rank_data: comp_rank_data,
      uniq_blocks: table_dict["uniq_blocks"],
      curr_month: _date_text.curr_month,
      count_blocks: _.size(table_dict["uniq_blocks"]),
    });
}

var table_dict, comp_rank_data;
function pdf_draw_table() {
  // PDF - Draws table
  table_dict = get_table_data(state_table_area);
  comp_rank_data = get_comp_rank_data(state_table_area);
  var block_length = _.size(table_dict["uniq_blocks"]);
  var middle_limit = block_length / 2 <= 6 ? 6 : 8;
  //(block_length > 70) ? 8 : (block_length / 2 > 6) ? block_length / 2 : 6
  var i = 0;
  render_temp_pdf_table(i, block_length, middle_limit);
}

function render_temp_pdf_table(i, block_length, middle_limit) {
  if (i < block_length) {
    var temp_blocks,
      temp_data_dict = {},
      temp_comp_rank_data = {};

    // Data for table temp
    if (i + middle_limit < block_length)
      temp_blocks = _.slice(table_dict["uniq_blocks"], i, i + middle_limit);
    else temp_blocks = _.slice(table_dict["uniq_blocks"], i);

    _.each(table_dict["table_data"], function (v, k) {
      temp_data_dict[k] = _.filter(v, function (block_obj) {
        var blck_present = _.includes(temp_blocks, block_obj["name"]);
        return blck_present;
      });
      temp_comp_rank_data = _.filter(comp_rank_data, function (block_obj) {
        var blck_present = _.includes(temp_blocks, block_obj["area"]);
        return blck_present;
      });
    });

    // _.each(_.keys(temp_data_dict), function (ind) {

    //   _.each(temp_data_dict[ind], function (td) {

    //     td['indicator_id'] = 'indicator_' + td['indicator_id']

    //   })

    // })
    //remove district name in headers to restirct size of the columns
    temp_blocks = _.map(temp_blocks, function (d) {
      return d.replace(url.searchKey.district + " ", "");
    });

    //remove district name in table data to sort according to the headers in comp rank
    temp_comp_rank_data = _.map(temp_comp_rank_data, function (d) {
      d.area = d.area.replace(url.searchKey.district + " ", "");
      return d;
    });

    //remove district name in table data to sort according to the headers in all indicators
    _.each(temp_data_dict, function (indicator) {
      _.each(indicator, function (d) {
        d.name = d.name.replace(url.searchKey.district + " ", "");
      });
    });
    // console.log(temp_data_dict, 'temp data dict')
    // Generating temporory table and on 'template' appending it to div > 'container_executive_table'
    $(".executive_table_pdf_temp")
      .one("template", function () {
        $(".container_executive_table > .gen_table").find("script").remove();
        $(".temp_table_template > .gen_table")
          .clone()
          .appendTo($(".container_executive_table"));
        i = i + middle_limit;
        render_temp_pdf_table(i, block_length, middle_limit);
      })
      .template({
        _area: state_table_area,
        d: temp_data_dict,
        comp_rank_data: temp_comp_rank_data,
        uniq_blocks: temp_blocks,
        curr_month: _date_text.curr_month,
        count_blocks: block_length,
      });
  } else {
    $(".executive_table_pdf_temp").off("template"); // Removing on template event
    $(".temp_table_template").empty();
  }
  $(".container_executive_table").css(
    "margin-top",
    isStateUser ? "5rem" : isDivision ? "0rem" : "8rem"
  );
  $(".container_executive_table > .gen_table").css("border", "black 1px");
  $(".container_executive_table > .gen_table").css(
    "margin-top",
    isDivision ? "0rem" : "5rem"
  );
}

function draw_rank_chart() {
  $(".rank_chart_title").html(_.toUpper(_area + " LEVEL"));
  var rank_array = get_rank_data();
  // remove district name from block and trim block names
  _.each(rank_array, function (item) {
    trim_block_names(item, "area");
  });

  var updatedData = rank_array.map((elem) => {
    return {
      area: elem.area,
      rank: {
        m1: Object.entries(elem.rank)[0][1],
        m2: Object.entries(elem.rank)[1][1],
        m3: Object.entries(elem.rank)[2][1],
      },
      color: {
        m1: Object.entries(elem.color)[0][1],
        m2: Object.entries(elem.color)[1][1],
        m3: Object.entries(elem.color)[2][1],
      },
      months: {
        m1: Object.entries(elem.rank)[0][0],
        m2: Object.entries(elem.rank)[1][0],
        m3: Object.entries(elem.rank)[2][0],
      },
    };
  });

  var rank_spec = get_rank_spec(isStateUser, _is_pdf, isDivision);
  rank_spec.data[0].values = updatedData;

  var view = new vega.View(vega.parse(rank_spec))
    .renderer("svg")
    .logLevel(vega.Warn)
    .initialize(".rank_chart")
    .width($(".rank_chart").width())
    .height($(".rank_chart").height())
    .hover()
    .run();

  $(".rank-container").append('<div class="rank_tooltip">');
  $(".rank_tooltip").css({ position: "absolute" });
  view.addEventListener("mousemove", function (event, item) {
    $(".rank_tooltip").show();
    updateTooltip(event, item);
  });
  view.addEventListener("mouseout", function () {
    $(".rank_tooltip").hide();
    $(".rank_tooltip").empty();
  });

  if (isStateUser && !_is_pdf) {
    $(".maximise_chart").removeClass("d-none");
    rank_spec.height = 800;
    rank_spec.signals[0].on.forEach(function (eve) {
      eve.events = _.replace(eve.events, /mouseover/g, "click");
    });
    rank_spec.marks[3].encode.update.fontSize.value = 12;
    rank_spec.marks[4].encode.update.fontSize.signal = 12;
    rank_spec.marks[5].encode.update.fontSize.signal = 12;

    var view_2 = new vega.View(vega.parse(rank_spec))
      .renderer("svg")
      .logLevel(vega.Warn)
      .initialize(".large_rank_chart")
      .width(1000)
      .height($("body").height())
      .hover()
      .run();
    view_2.addEventListener("mousemove", function (event, item) {
      $(".rank_tooltip").show();
      updateTooltip(event, item);
    });
    view_2.addEventListener("mouseout", function () {
      $(".rank_tooltip").hide();
      $(".rank_tooltip").empty();
    });
    $("#maximised_chart").on("shown.bs.modal", function () {
      $(".org_rank_chart .rank_tooltip").addClass("d-none");
    });
    $("#maximised_chart").on("hidden.bs.modal", function () {
      $(".org_rank_chart .rank_tooltip").removeClass("d-none");
    });
  }
  if (isDivision) {
    $(".rank_title").append(
      '<span class="div_rank_note sm4 float-right pr-0 font-weight-bold">Note: ( ) denotes rank of the district in that particular month</span>'
    );
    if (_is_pdf) $(".div_rank_note").css("margin-right", "-70px");
  }
}

function updateTooltip(event, item) {
  // Rank chart tootip update function
  $(".rank_tooltip").empty();
  if (item !== undefined) {
    if (item.mark.name !== "heading-month-text") {
      if (item.mark.marktype == "path") {
        $(".rank_tooltip")
          .append(
            '<div class="py-1 px-2 text-capitalize"><span>' +
              _.startCase(_area) +
              " : " +
              item.datum.area +
              "</span><br>" +
              "<span>" +
              item.datum.monthName +
              " Rank : " +
              item.datum.rank +
              "</span><br>" +
              "<span>" +
              item.datum.target.monthName +
              " Rank : " +
              item.datum.target.rank +
              "</span></div>"
          )
          .css({ top: event.offsetY - 10, left: event.offsetX + 20 });
      } else {
        let width = $(".org_rank_chart").width(),
          dim = { top: event.offsetY - 10, left: event.offsetX + 20 };
        if (event.offsetX + 100 > width) {
          dim = { top: event.offsetY - 10, left: event.offsetX - 100 };
          // dim['display'] = 'block'
        }
        $(".rank_tooltip")
          .append(
            '<div class="py-1 px-2 text-capitalize"><span>' +
              _.startCase(_area) +
              " : " +
              item.datum.area +
              "</span><br>" +
              "<span>" +
              item.datum.monthName +
              " Rank : " +
              item.datum.rank +
              "</span></div>"
          )
          .css(dim);
        // .css({ 'top': event.offsetY - 10, 'left': event.offsetX + 20 })
      }
    }
  }
}

function get_insight_data() {
  // Generates Insights data

  // INSIGHT 1
  var insight1_data = insight_1();
  var rank_increase = insight1_data["rank_increase"];
  var rank_decrease = insight1_data["rank_decrease"];

  // INSIGHT 2 base
  var insight_2 = get_table_data(_area)["table_data"];
  var insight_list = [];
  _.each(insight_2, function (value) {
    insight_list.push(value);
  });
  insight_list = _.flatten(insight_list);
  console.log(insight_list, "insight list");
  insight_list = _.sortBy(insight_list, ["diff", "indicator"]);

  //INSIGHT 2: Highest increase in indicator from last month
  var indicator_increase = _.maxBy(insight_list, "diff");
  indicator_increase["indicator_name"] = indicator_increase["indicator"];
  indicator_increase["growth"] = indicator_increase["diff"];

  //INSIGHT 2: Maximum decrease in indicator from last month
  var indicator_decrease = _.minBy(insight_list, "diff");
  indicator_decrease["indicator_name"] = indicator_decrease["indicator"];
  indicator_decrease["growth"] = indicator_decrease["diff"];

  var insights_data = {
    curr_month: _date_text.curr_month,
    prev_month: _date_text.prev_month,
    rank: {
      increase: rank_increase,
      decrease: rank_decrease,
    },
    indicator: {
      increase: indicator_increase,
      decrease: indicator_decrease,
    },
    area: _area,
    rank_change: rank_increase.diff !== 0, // can use this to hide/change insight rank when there is no change from prev. month
  };
  console.log(insights_data, "insights data");
  return insights_data;
}

function insight_1() {
  // Generates insight 1 data
  var rank_params = get_params(2);
  // If Division user logins, all UP districts are pulled, so division key is removed
  if (isDivision) {
    delete rank_params[_main_area];
  }

  // rank_params['date'] = ''
  rank_params["from_date"] = _date["curr_month"];
  rank_params["to_date"] = _date["prev_month"];

  // rank_params['_by'] = ['date', _area]
  // rank_params['_c'] = ['composite_index|avg']
  // rank_params['_sort'] = ['date', '-composite_index|avg']
  // let fetch_url = (isStateUser || isDivision) ? 'district_data' : 'block_data'
  let fetch_url = isStateUser
    ? "division_view_exe"
    : isDivision
    ? "district_view_exe"
    : "block_data_exe";
  var rank_data = UI.fetch_data(fetch_url, rank_params);

  // if (user_data.designation !== "ACMORCH" && user_data.designation !== "CMO")
  // if (!_.includes(["ACMORCH", "ACMO", "CMO"], user_data.designation))
  // if (_.includes([" -"], user_data.designation))
  rank_data = rank_data["data"];

  _.each(rank_data, function (d) {
    d["date"] = moment(d.date).format("YYYY-MM-DD");
  });

  // Splits data based on last 2 months
  var curr_df = _.filter(rank_data, { date: _date["curr_month"] });
  var prev_df = _.filter(rank_data, { date: _date["prev_month"] });

  // Count of blocks
  if (fetch_url === "block_data_exe") {
    var arrayUniqueByKey = [
      ...new Map(curr_df.map((item) => [item["block"], item])).values(),
    ];
    var count = arrayUniqueByKey.length;
  } else {
    count = curr_df.length;
  }

  // computes rank
  // curr_df = get_rank(curr_df, 'composite_index|avg')
  // prev_df = get_rank(prev_df, 'composite_index|avg')
  curr_df = get_rank(curr_df, "composite_index");
  prev_df = get_rank(prev_df, "composite_index");

  // renaming keys and merging prev and current ranks
  var params = { rank: "prev" };
  params[_area] = "name";
  prev_df = rename_keys(prev_df, params);
  params.rank = "curr";
  curr_df = rename_keys(curr_df, params);

  // extracting required columns using pick
  var new_curr_df = _.map(curr_df, function (row) {
    return _.pick(row, ["name", "curr"]);
  });
  var new_prev_df = _.map(prev_df, function (row) {
    return _.pick(row, ["name", "prev"]);
  });

  // merge the curr and prev ranks for every block
  _.each(new_curr_df, function (row) {
    // row['prev'] = _.find(new_prev_df, {'name': row['name']})['prev']
    row["prev"] =
      _.find(new_prev_df, { name: row["name"] }) != undefined
        ? _.find(new_prev_df, { name: row["name"] })["prev"]
        : "-";
  });
  var df = new_curr_df;
  // Adding key: diff = curr_rank - prev_rank
  _.each(df, function (row) {
    row["diff"] = row.curr - row.prev;
  });

  // If Division user logins , all districts related to division are filtered
  if (isDivision) {
    var uniq_areas = _.map(get_unique_areaNames(), _area);
    df = _.filter(df, function (item) {
      return _.includes(uniq_areas, item["name"]);
    });
  }
  console.log(df, "df");

  //Insight 1: Highest increase in rank from last month (composite index)
  var rank_increase = _.minBy(df, "diff");
  rank_increase.prev = "" + rank_increase.prev + "/" + count;
  rank_increase.curr = "" + rank_increase.curr + "/" + count;

  //Insight 1: Maximum decrease in rank from last month (composite index)
  _.reverse(df);
  var rank_decrease = _.maxBy(df, "diff");
  rank_decrease.prev = "" + rank_decrease.prev + "/" + count;
  rank_decrease.curr = "" + rank_decrease.curr + "/" + count;
  return { rank_increase: rank_increase, rank_decrease: rank_decrease };
}

function get_rank_data() {
  // Generates rank data
  var rank_data, col;
  var rank_params = get_params(3);

  // If Division user logins, all UP districts need to be pulled for computing overall district rank, so division key is removed
  if (isDivision) {
    delete rank_params[_main_area];
  }

  // rank_params['_c'] = ['composite_index|avg']
  // rank_params['_sort'] = ['date', '-composite_index|avg']
  //Fetch rank_data from URL
  //Rename key ('block' or 'district') to area
  // eg: "division":"Basti Division" is replaced with "area":"Basti Division" in json string
  if (!isDivision && !isStateUser) {
    rank_params["_by"] = ["date", "block"];
    // rank_data = UI.fetch_data('block_data', rank_params)
    rank_params["_c"] = ["composite_index|avg"];
    rank_params["_sort"] = ["date", "-composite_index|avg"];
    col = "composite_index|avg";
    rank_data = UI.fetch_data("block_data_exe", rank_params);
    rank_data = rank_data["data"];
    rank_data = JSON.parse(
      JSON.stringify(rank_data).replace(/"block":/g, '"area":')
    );
  }
  // division or state user
  else {
    // rank_params['_by'] = ['date', _area]
    // rank_data = UI.fetch_data('district_data', rank_params)
    col = "composite_index";
    if (isStateUser) {
      rank_data = UI.fetch_data("division_view_exe", rank_params);
    } else {
      rank_data = UI.fetch_data("district_view_exe", rank_params);
    }
    rank_data = rank_data["data"];
    // _.each(rank_data, function(d){
    //   d['date'] = moment(d.date).format('YYYY-MM-DD')
    // })
    var re = new RegExp('"' + _area + '":', "g");
    rank_data = JSON.parse(JSON.stringify(rank_data).replace(re, '"area":'));
  }
  _.each(rank_data, function (d) {
    d["date"] = moment(d.date).format("YYYY-MM-DD");
  });

  // Splits data based on last 3 months
  var curr_df = _.filter(rank_data, { date: _date["curr_month"] });
  var prev_df = _.filter(rank_data, { date: _date["prev_month"] });
  var prev_2_df = _.filter(rank_data, { date: _date["prev_2_month"] });

  // computes rank
  // curr_df = get_rank(curr_df, 'composite_index|avg')
  // prev_df = get_rank(prev_df, 'composite_index|avg')
  // prev_2_df = get_rank(prev_2_df, 'composite_index|avg')

  curr_df = get_rank(curr_df, col);
  prev_df = get_rank(prev_df, col);
  prev_2_df = get_rank(prev_2_df, col);

  // computes color code based on rank
  curr_df = get_color_code(curr_df);
  prev_df = get_color_code(prev_df);
  prev_2_df = get_color_code(prev_2_df);

  // If Division user logins , all districts related to division are filtered
  if (isDivision) {
    var uniq_areas = _.map(get_unique_areaNames(), _area);
    curr_df = _.filter(curr_df, function (item) {
      return _.includes(uniq_areas, item["area"]);
    });
    prev_df = _.filter(prev_df, function (item) {
      return _.includes(uniq_areas, item["area"]);
    });
    prev_2_df = _.filter(prev_2_df, function (item) {
      return _.includes(uniq_areas, item["area"]);
    });
  }

  var all_blocks = _.map(curr_df, "area");
  var main_rank_array = [];

  // sample =  [{
  // "block": "Mathura",
  // "rank": {"oct": "1", "nov": "2", "dec": "1"},
  // "color": {"oct": "R", "nov": "Y", "dec": "R"}
  // }, b2, b3 ...]
  _.each(all_blocks, function (blck) {
    var temp = {};
    // A. ARG 1 - block
    // "block": "Agra"

    //Remove 'District' from district name
    temp.area = _.replace(blck, " District", "");

    if (url.searchKey.district === "Gautam Buddha Nagar") {
      temp.area = _.includes(
        temp.area,
        "Gautam Buddha Nagar GAUTAM BUDDHA NAGAR"
      )
        ? "GB NAGAR"
        : temp.area;
      temp.area = _.includes(temp.area, "DHQ") ? "DHQ GB NAGAR" : temp.area;
    } else if (
      url.searchKey.district === "Sant Kabir Nagar" &&
      _.includes(temp.area, "dhq")
    ) {
      temp.area = "DHQ SK NAGAR";
    } else if (
      url.searchKey.district === "Maunathbhanjan" &&
      _.includes(temp.area, "dhq")
    ) {
      temp.area = "DHQ Mau";
    }
    // B. ARG 2 - rank
    // "rank": {"oct": "2", "nov": "3", "dec": "2"}
    // Adding key-value : 'month': 'rank' ==>  'oct: 3'
    var temp_rank = {};
    temp_rank[_date_text.prev_2_month] =
      _.find(prev_2_df, { area: blck }) != undefined
        ? _.find(prev_2_df, { area: blck }).rank
        : "-";
    temp_rank[_date_text.prev_month] =
      _.find(prev_df, { area: blck }) != undefined
        ? _.find(prev_df, { area: blck }).rank
        : "-";
    temp_rank[_date_text.curr_month] =
      _.find(curr_df, { area: blck }) != undefined
        ? _.find(curr_df, { area: blck }).rank
        : "-";
    temp["rank"] = temp_rank;

    // C. ARG 3 - color
    // "color": {"oct": "G", "nov": "Y", "dec": "R"}
    // Adding key-value : 'month': 'color' ==>  'oct: 'G'
    var temp_color = {};
    temp_color[_date_text.prev_2_month] =
      _.find(prev_2_df, { area: blck }) != undefined
        ? _.find(prev_2_df, { area: blck }).color
        : "R";
    temp_color[_date_text.prev_month] =
      _.find(prev_df, { area: blck }) != undefined
        ? _.find(prev_df, { area: blck }).color
        : "R";
    temp_color[_date_text.curr_month] =
      _.find(curr_df, { area: blck }) != undefined
        ? _.find(curr_df, { area: blck }).color
        : "R";
    temp["color"] = temp_color;

    // push dict to main rank array
    main_rank_array.push(temp);
  });
  return main_rank_array;
}

function get_color_code(df) {
  // Computes color code
  var color_scale = d3
    .scaleQuantile()
    .domain([1, df.length])
    .range(["G", "Y", "R"]);
  _.each(df, function (i) {
    i["color"] = color_scale(i["rank"]);
  });
  return df;
}

function get_rank(df, key) {
  // Computes rank
  var counter = 0;
  var default_val = -1;

  df.forEach(function (row) {
    // row[key] = _.round(row[key], 4)
    if (row[key]) {
      if (default_val != row[key]) {
        counter += 1;
      }
      default_val = row[key];
      row["rank"] = counter;
    } else row["rank"] = "-";
  });

  return df;
}

function get_table_data(local_table_area) {
  // Generates table data
  var table_params = get_params(2);
  var fetch_url;
  if (isStateUser) {
    if (local_table_area == "division") {
      fetch_url = "context_data_division";
      // table_params['_by'] = ['date', 'division', 'indicator_id', 'indicator', 'calc_type']
      // table_params['_c'] = ['perc_point|avg']
      // table_params['_sort'] = 'indicator_ids'
    } else {
      fetch_url = "context_data_district";
      // table_params['_c'] = ['date', 'indicator_id', 'indicator', 'district', 'perc_point', 'calc_type']
      // table_params['_sort'] = 'indicator_ids'
    }
  } else if (isDivision) {
    fetch_url = "context_data_district";
  } else {
    fetch_url = "block_data_exe";
    // table_params['_c'] = ['date', 'indicator_id', 'indicator', _area, 'perc_point', 'calc_type']
    // table_params['_sort'] = 'indicator_ids'
  }

  // let fetch_url = (isStateUser || isDivision) ? 'district_data' : 'block_data'
  var table_data = UI.fetch_data(fetch_url, table_params);
  if (fetch_url === "block_data_exe") {
    table_data = table_data["data"];
  }
  _.each(table_data, function (d) {
    d["date"] = moment(d.date).format("YYYY-MM-DD");
  });

  if (isStateUser) {
    if (local_table_area == "division") {
      table_data = rename_keys(table_data, { "perc_point|avg": "perc_point" });
    }
  }

  var prev_df = _.filter(table_data, { date: _date["prev_month"] });
  var curr_df = _.filter(table_data, { date: _date["curr_month"] });

  // renaming keys and merging prev and current perc points indicator wise
  var params = { perc_point: "prev" };
  params[local_table_area] = "name";
  prev_df = rename_keys(prev_df, params);
  params.perc_point = "curr";
  curr_df = rename_keys(curr_df, params);

  // merge the curr and prev perc points for every indicator and block combination
  _.each(curr_df, function (row) {
    // if record does not exist in previous month dataset, set prev = 0
    if (
      _.find(prev_df, {
        name: row["name"],
        indicator_id: row["indicator_id"],
      }) === undefined
    ) {
      row["prev"] = 0;
    } else {
      row["prev"] = _.find(prev_df, {
        name: row["name"],
        indicator_id: row["indicator_id"],
      })["prev"];
    }
  });

  var df = curr_df;

  var uniq_blocks = table_get_unique_areaNames(local_table_area);
  uniq_blocks = _.sortBy(_.map(uniq_blocks, local_table_area));
  var size = _.size(uniq_blocks);

  table_data = _.groupBy(df, "indicator");

  // Identifies missing indicators and adds empty records
  var all_indicators = _.map(
    _.filter(indicator_mapping, function (i) {
      return i["type_ind"] == local_table_area || i["type_ind"] == "dist_block";
    }),
    "indicator_name"
  );
  var partial_indicators = _.keys(table_data);
  var missing_indicators = _.difference(all_indicators, partial_indicators);

  _.each(missing_indicators, function (j) {
    table_data[j] = [];
  });

  // Identifies missing blocks for every indicator and adds empty records
  _.each(table_data, function (v, k) {
    if (_.size(table_data[k]) !== size) {
      var partial_blocks = _.map(table_data[k], "name");
      var missing_blocks = _.difference(uniq_blocks, partial_blocks);

      _.each(missing_blocks, function (i) {
        table_data[k].push({ name: i, curr: 0, prev: 0 });
      });
    }
  });

  // Calculate growth
  // growth = increase: 1, descrese: -1, no change: 0, NA : NA
  _.each(table_data, function (value_) {
    _.each(value_, function (item) {
      if (item.curr == 0 && item.prev == 0) {
        item["growth"] = "NA";
        item["diff"] = 0;
      } else if (item.curr == item.prev) {
        item["growth"] = "0";
        item["diff"] = 0;
      } else if (item.curr > item.prev) {
        item["growth"] = item["calc_type"] == "p" ? "1" : "1n";
        // item['growth'] = '1'
        var den = 100 / item.prev !== 1 / 0 ? 100 / item.prev : 0;
        // item['diff'] = (item['calc_type'] == 'p')? (item.curr - item.prev)*den : -(item.curr - item.prev)*den
        item["diff"] = (item.curr - item.prev) * den;
      } else if (item.prev > item.curr) {
        item["growth"] = item["calc_type"] == "p" ? "-1" : "-1n";
        // item['growth'] = '-1'
        den = 100 / item.prev !== 1 / 0 ? 100 / item.prev : 0;
        // item['diff'] = (item['calc_type'] == 'p')? -(item.prev - item.curr)*den : (item.prev - item.curr)*den
        item["diff"] = -(item.prev - item.curr) * den;
      }
    });
  });
  // remove district name from every block text
  _.each(table_data, function (value_) {
    _.each(value_, function (item) {
      trim_block_names(item, "name");
    });
  });

  // remove district name from every block text
  uniq_blocks = _.each(uniq_blocks, function (item, i) {
    uniq_blocks[i] = trim_block_names(item);
  });

  var table_dict = { table_data: table_data, uniq_blocks: uniq_blocks };
  return table_dict;
}

function trim_block_names(item, block_key) {
  // removes district text from block entities
  // CASE 1: item is dict object, block_key has the block name key
  // CASE 2: item is a list item, block_key is empty
  var district = get_area();
  // CASE 1
  if (block_key) {
    item[block_key] =
      item[block_key] == district
        ? item[block_key]
        : _.trim(_.replace(item[block_key], district, ""));
    if (item[block_key] == "DHQ") item[block_key] = "DHQ " + district;
  }

  // CASE 2
  else {
    var blck_name =
      item == district ? item : _.trim(_.replace(item, district, ""));
    if (blck_name == "DHQ") blck_name = "DHQ " + district;
    return blck_name;
  }
  return;
}

function get_unique_areaNames() {
  // Fetches unique blocks for a district or unique districts for a division or unique divisions/districts at state level
  var area = get_area();
  // var fetch_url = (isStateUser)? 'unique_divisions' : 'unique_district_blocks'
  // var params = (isStateUser)? {'_by': 'division', '_c': 'division'} : (isDivision) ? {'division': area, '_c':'district'} : {'district': area, '_c':'block'}
  // params['date'] = _date['curr_month']
  // var uniq_areas = UI.fetch_data(fetch_url, params)
  var fetch_url = isStateUser
    ? "unique_divisions"
    : isDivision
    ? "unique_district"
    : "unique_blocks";
  var params = isDivision ? { division: area } : { district: area };
  var uniq_areas = UI.fetch_data(fetch_url, params);
  return uniq_areas;
}

function table_get_unique_areaNames(table_area) {
  // Table : Fetches unique blocks for a district or unique districts for a division or unique divisions/districts at state level
  var area = get_area();
  // var fetch_url = (isStateUser)? (table_area == 'division')? 'unique_divisions': 'unique_district_blocks': 'unique_district_blocks'
  // var params = (isStateUser)? (table_area == 'division')? {'_by': 'division', '_c': 'division'}: {'_by': 'district', '_c':'district'} : (isDivision) ? {'division': area, '_c':'district'} : {'district': area, '_c':'block'}
  // params['date'] = _date['curr_month']
  // var uniq_areas = UI.fetch_data(fetch_url, params)
  var params = isDivision ? { division: area } : { district: area };
  var fetch_url = isStateUser
    ? table_area == "division"
      ? "unique_divisions"
      : "unique_district"
    : isDivision
    ? "unique_district"
    : "unique_blocks";
  params["date"] = _date["curr_month"];
  var uniq_areas = UI.fetch_data(fetch_url, params);
  let eliminatedBlocks = [
    "Aligarh",
    "Ayodhya",
    "Ballia Ballia Sadar",
    "Sadar Tahsil",
    "Deoria Sader",
    "Gautam Buddha Nagar - Block",
    "Kanpur Nagar",
    "DWH Mahoba",
    "Kulphar",
    "Mahoba",
    "Mainpuri Kuchela",
    "Tanda Rampur",
    "Shamli Kudana",
    "Sultanpur",
    "Selarpur",
  ];
  uniq_areas = _.filter(uniq_areas, function (d) {
    // return d.block != 'Sultanpur'
    if (!eliminatedBlocks.includes(d.block)) {
      return d.block || d.district || d.division;
    }
  });
  return uniq_areas;
}

function get_params(month_count) {
  // Fetches default parameters: Time and district
  var params = {};
  if (!isStateUser) params[_main_area] = get_area();
  if (month_count == 2) {
    params["from_date"] = _date["curr_month"];
    params["to_date"] = _date["prev_month"];
    // params['date'] = [_date['curr_month'], _date['prev_month']]
  } else if (month_count == 3) {
    params["from_date"] = _date["curr_month"];
    params["to_date"] = _date["prev_2_month"];
    // params['date'] = [_date['curr_month'], _date['prev_month'], _date['prev_2_month']]
  }
  return params;
}

function get_area() {
  // fetches user district from url
  if (_main_area === "division") {
    let division_data = JSON.parse(
      localStorage.getItem("distinct_division_id")
    );
    division_data = _.filter(division_data["data"], {
      division_name: user_data.division.trim(),
    });
    return division_data[0]["division_id_num"];
  } else if (_main_area === "district") {
    let district_data = JSON.parse(
      localStorage.getItem("distinct_district_id")
    );
    district_data = _.filter(district_data["data"], {
      district_name: url.searchKey[_main_area],
    });
    return district_data[0]["district_id_num"];
  }
  return user_data[_main_area];
}

function get_curr_prev_months(period) {
  // "2019-01-31"
  var latest_date =
    period == "default"
      ? UI.fetch_data("last_update", $.param({}, true))[0][0]
      : period;
  var curr_month = moment(latest_date)
    .subtract(0, "months")
    .startOf("month")
    .format("YYYY-MM-DD");
  var prev_month = moment(latest_date)
    .subtract(1, "months")
    .startOf("month")
    .format("YYYY-MM-DD");
  var prev_2_month = moment(latest_date)
    .subtract(2, "months")
    .startOf("month")
    .format("YYYY-MM-DD");
  return {
    curr_month: curr_month,
    prev_month: prev_month,
    prev_2_month: prev_2_month,
  };
}

function get_text_curr_prev_months(period) {
  // Dec'18
  var latest_date =
    period == "default"
      ? UI.fetch_data("last_update", $.param({}, true))[0][0]
      : period;
  var curr_month = moment(latest_date)
    .subtract(0, "months")
    .startOf("month")
    .format("MMM'YY");
  var prev_month = moment(latest_date)
    .subtract(1, "months")
    .startOf("month")
    .format("MMM'YY");
  var prev_2_month = moment(latest_date)
    .subtract(2, "months")
    .startOf("month")
    .format("MMM'YY");
  return {
    curr_month: curr_month,
    prev_month: prev_month,
    prev_2_month: prev_2_month,
  };
}

function rename_keys(arr, keyMap) {
  // renames dict keys
  var new_arr = arr.map(function (obj) {
    return _.mapKeys(obj, function (value, key) {
      return keyMap[key] || key;
    });
  });
  return new_arr;
}

function parse_url() {
  return g1.url.parse(location.href);
}

function update_url(obj) {
  var url_args = parse_url().update(obj);
  history.pushState({}, "", "?" + url_args.search);
  return url_args;
}

$(".download_cap").click(function () {
  let _download_val = parse_url().searchKey._download;
  let download_object = {
    _download: _download_val ? parseInt(_download_val) + 1 : 1,
  };
  update_url(download_object);
  capture_function(
    ".download_cap",
    user_data[_main_area] + "_" + moment(date).format("MMM_YYYY")
  );
});

function capture_function(placeholder, filename) {
  var url = parse_url();
  url = url.href.replace("executive-summary", "executive-summary-capture");
  var href =
    "capture?url=" +
    encodeURIComponent(url) +
    "&start&ext=pdf&delay=6000&file=" +
    filename +
    "&footer=|$pageNumber&format=A4&orientation=landscape";
  $(placeholder).attr("href", href);
}

function isInt(n) {
  return n % 1 === 0;
}

function draw_page_1() {
  // var area_selected = _.startCase(user_data[_main_area]);
  var curr_date = _date["curr_month"];
  var prev_date = _date["prev_month"];
  var bar_chart_data;
  var district_id;
  // var params_default = { date: [curr_date, prev_date] }
  var params_default = { from_date: curr_date, to_date: prev_date };

  if (isStateUser) {
    // bar_chart_data = UI.fetch_data('division_view', $.param(params_default, true))
    bar_chart_data = UI.fetch_data(
      "division_view_exe",
      $.param(params_default, true)
    );
  } else if (isDivision) {
    // params_default.division = _.startCase(_.toLower(user_data.division))
    let division_data = JSON.parse(
      localStorage.getItem("distinct_division_id")
    );
    division_data = _.filter(division_data["data"], {
      division_name: user_data.division.trim(),
    });
    // console.log(user_data);
    // console.log(division_data);
    district_id = division_data[0]["division_id_num"];
    params_default.division = division_data[0]["division_id_num"];
    bar_chart_data = UI.fetch_data(
      "district_view_exe",
      $.param(params_default, true)
    );
  } else {
    // params_default.district = area_selected
    let district_data = JSON.parse(
      localStorage.getItem("distinct_district_id")
    );
    district_data = _.filter(district_data["data"], {
      district_name: url.searchKey[_main_area],
    });
    district_id = district_data[0]["district_id_num"];
    params_default.district = district_data[0]["district_id_num"];
    // bar_chart_data = UI.fetch_data('block_view', $.param(params_default, true))
    bar_chart_data = UI.fetch_data(
      "block_view_exe",
      $.param(params_default, true)
    );
  }

  _.each(bar_chart_data["data"], function (d) {
    d["date"] = moment(d.date).format("YYYY-MM-DD");
  });

  var start_Array = _.filter(bar_chart_data.data, function (el) {
    if (el.date === curr_date) {
      el.position = 1;
      el.value = el.composite_index.toFixed(2);
      return el;
    }
  });
  var end_Array = _.filter(bar_chart_data.data, function (el) {
    if (el.date === prev_date) {
      el.position = 0;
      el.value = el.composite_index.toFixed(2);
      return el;
    }
  });

  var final_array = [];
  _.forEach(start_Array, function (array1) {
    _.forEach(end_Array, function (array2) {
      var dict = {};
      if (array1[_area] === array2[_area]) {
        dict.area = array1[_area];
        dict.score =
          ((array1.composite_index - array2.composite_index) /
            array2.composite_index) *
          100;
        final_array.push(dict);
      }
    });
  });

  // Block chart , RHS
  final_array = _.sortBy(final_array, "score");
  final_array = _.reverse(final_array);

  var negative_vals = _.filter(final_array, function (item) {
    return item.score < 0;
  });
  negative_vals = _.reverse(negative_vals);
  var positive_vals = _.filter(final_array, function (item) {
    return item.score > 0;
  });

  var top_3 = positive_vals.slice(0, 3);
  var bottom_3 = negative_vals.slice(0, 3);

  var top_3_array = _.map(top_3, "area");
  var bottom_3_array = _.map(bottom_3, "area");

  var top3_start = _.map(start_Array, function (o) {
    if (top_3_array.indexOf(o[_area]) > -1) return o;
  });
  top3_start = _.without(top3_start, undefined);

  var top3_end = _.map(end_Array, function (o) {
    if (top_3_array.indexOf(o[_area]) > -1) return o;
  });
  top3_end = _.without(top3_end, undefined);

  var bottom3_start = _.map(start_Array, function (o) {
    if (bottom_3_array.indexOf(o[_area]) > -1) return o;
  });
  bottom3_start = _.without(bottom3_start, undefined);

  var bottom3_end = _.map(end_Array, function (o) {
    if (bottom_3_array.indexOf(o[_area]) > -1) return o;
  });
  bottom3_end = _.without(bottom3_end, undefined);

  var top_values = _.concat(top3_end, top3_start);
  top_values = _.sortBy(top_values, function (item) {
    return top_3_array.indexOf(item[_area]);
  });

  var bottom_values = _.concat(bottom3_end, bottom3_start);
  bottom_values = _.sortBy(bottom_values, function (item) {
    return bottom_3_array.indexOf(item[_area]);
  });

  // Top and bottom performing areas - LHS BLOCK
  start_Array = _.sortBy(start_Array, "composite_index");
  start_Array = _.reverse(start_Array);

  var _size = _.size(start_Array);

  // slice partitioning dict
  var c_dict = { 5: { t: 3, b: 3 }, 4: { t: 2, b: 2 }, 3: { t: 2, b: 2 } };

  if (_size > 5) {
    var top_slice = 3;
    var bottom_slice = _size - top_slice;
  } else {
    top_slice = c_dict[_size].t;
    bottom_slice = c_dict[_size].b;
  }
  var top_3_ = start_Array.slice(0, top_slice);
  var bottom_3_ = start_Array.slice(bottom_slice, _size);
  bottom_3_ = _.reverse(bottom_3_);

  params_default = { _c: "map_id" };
  // var context_data = UI.fetch_data('get_unique_list', $.param(params_default, true))
  // var params = { date: curr_date}
  var params = {};
  // params[_main_area] = area_selected
  params[_main_area] = district_id;
  // var fetch_url = (isDivision) ? 'division_data' : 'district_data'
  // = UI.fetch_data(fetch_url, params)
  var new_start_Array, new_end_Array, context_data, context_data1;

  // Table Page 1 - PART A: Indicator performance change
  if (isStateUser) {
    // context_data = UI.fetch_data('context_data_state', params)
    // context_data = _.sortBy(context_data, 'indicator_rank')
    (params["from_date"] = curr_date), (params["to_date"] = prev_date);
    // params.date = [curr_date, prev_date]
    context_data1 = UI.fetch_data("context_data_state", params);
    _.each(context_data1, function (d) {
      d["date"] = moment(d.date).format("YYYY-MM-DD");
    });
    context_data = _.filter(context_data1, { date: curr_date });
  } else if (isDivision) {
    params = {};
    // params.date = curr_date
    (params["from_date"] = curr_date), (params["to_date"] = prev_date);
    params["division_id"] = district_id;
    context_data = UI.fetch_data("context_data_division", params);
    _.each(context_data, function (d) {
      d["date"] = moment(d.date).format("YYYY-MM-DD");
    });
    var new_context_data = context_data;
    context_data = _.filter(context_data, function (el) {
      if (el.date === curr_date) {
        return el;
      }
    });
    context_data = _.sortBy(context_data, ["indicator_rank", "indicator"]);
    // new_start_Array = UI.fetch_data('context_data_division', params)
    new_start_Array = _.filter(context_data, function (el) {
      if (el.date === curr_date) {
        el.date = curr_date;
        return el;
      }
    });
    params.date = prev_date;
    // new_end_Array = UI.fetch_data('context_data_division', params)
    new_end_Array = _.filter(new_context_data, function (el) {
      if (el.date === prev_date) {
        el.date = prev_date;
        return el;
      }
    });
  } else {
    (params["from_date"] = curr_date), (params["to_date"] = prev_date);
    var new_data = UI.fetch_data("district_data_exe", params);
    _.each(new_data, function (d) {
      d["date"] = moment(d.date).format("YYYY-MM-DD");
      d["district"] = d["district_name"];
      delete d["district_name"];
    });
    // context_data = UI.fetch_data('district_data', params)
    context_data = _.filter(new_data, { date: curr_date });
    context_data = _.sortBy(context_data, ["indicator_rank", "indicator"]);
    context_data1 = new_data;
    // params.date = [curr_date, prev_date]
    // context_data1 = UI.fetch_data('district_data', params)
  }

  if (!isDivision) {
    new_start_Array = _.filter(context_data1, function (el) {
      if (el.date === curr_date) {
        return el;
      }
    });
    new_end_Array = _.filter(context_data1, function (el) {
      if (el.date === prev_date) {
        return el;
      }
    });
  }

  // Table Page 1 - PART B: Indicator performance change
  var final_end_array = [];
  // console.log(new_start_Array, 'new start array')
  // console.log(new_end_Array, 'new end array')
  _.forEach(new_start_Array, function (array1) {
    _.forEach(new_end_Array, function (array2) {
      if (array1.indicator === array2.indicator) {
        array1.score =
          ((array1.perc_point - array2.perc_point) / array2.perc_point) * 100;
        if (
          array1.indicator ==
            "% of facilities reported outlier for the identified indicators of ranking" ||
          array1.indicator == "Still birth ratio"
        ) {
          // array1.score = -(array1.score)
          // array1.score = ((array2.perc_point - array1.perc_point)/array2.perc_point)*100
          // console.log(array1, 'array1')
          // if(array1.score < 0) {
          array1.score = -array1.score;
          // }
        }
        array1["prev_perc_point"] = array2.perc_point;
        array1["prev_indicator_rank"] = array2.indicator_rank;
        final_end_array.push(array1);
      }
    });
  });
  console.log(final_end_array, "final array");
  final_end_array = _.map(final_end_array, function (row) {
    return _.pick(row, [
      "indicator",
      "indicator_rank",
      "prev_indicator_rank",
      "perc_point",
      "prev_perc_point",
      "score",
    ]);
  });
  final_end_array = _.sortBy(final_end_array, ["score", "indicator"]);
  var negative_vals_table = _.filter(final_end_array, function (item) {
    return item.score < 0;
  });
  var positive_vals_table = _.filter(final_end_array, function (item) {
    return item.score > 0;
  });

  positive_vals_table = _.reverse(positive_vals_table);

  var top_2_table = positive_vals_table.slice(0, 2);
  var bottom_2_table = negative_vals_table.slice(0, 2);
  var table_page_1 = top_2_table.concat(bottom_2_table);

  var donut_data_ = [new_start_Array[0], new_end_Array[0]];
  var donut_data = _.filter(donut_data_, function (el) {
    if (el.date === curr_date) {
      el.id = 1;
      el.count = parseFloat(el.composite_index.toFixed(2)) * 100;
      return el;
    }
  });

  var new_percentage =
    ((_.round(donut_data_[1].composite_index, 2) -
      _.round(donut_data_[0].composite_index, 2)) /
      _.round(donut_data_[0].composite_index, 2)) *
    100;

  var rank_district = donut_data[0].composite_rank;

  if (context_data[0].indicator_id === "indicator_7") {
    context_data[0] = context_data[1];
    context_data[1] = context_data[2];
  }

  // var curr_date = moment(new Date()).add(5, 'h').add(30, 'm').toDate().toLocaleString()
  // curr_date = new Date().toLocaleString()

  var district_name =
    district_names[context_data[0].district] || context_data[0].district;
  var monthNames = [
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
  var date = new Date(curr_date);
  var template_name = isStateUser ? ".executive_sum_state" : ".executive_sum";

  // Render page 1 template
  $(template_name)
    .one("template", function () {
      //Render map
      url = g1.url.parse(location.href);
      /*- Adding url var 2nd time, cuz the url value didn't get updating and the map is breaking
      - (displaying state map as default if var url has no values for district or division)
    */

      render_map(url, start_Array);
      map.dragging.disable();
      map.scrollWheelZoom.disable();
      if (_is_pdf) {
        // $("#mapid").find("svg").css("padding-bottom", "60px");
        // $("#mapid").find("svg").css("padding-top", "20px");
        // $("#mapid").find("svg").css("padding-right", "20px");
        if (isStateUser) {
          $(".user_name").addClass("d-none");
        }
      }
      let spec = get_barchart_spec(_area);

      //Top 3 barchart
      spec.data[0].values = top_values;
      _.each(spec.data[0].values, function (item) {
        item[_area] = item[_area].includes("Gautam Buddha Nagar")
          ? item[_area].replace("Gautam Buddha Nagar", "GB Nagar")
          : item[_area];
        item[_area] = item[_area].includes("GAUTAM BUDDHA NAGAR")
          ? item[_area].replace("GAUTAM BUDDHA NAGAR", "GB Nagar")
          : item[_area];
        item[_area] = item[_area].includes("Maunathbhanjan")
          ? item[_area].replace("Maunathbhanjan", "Mau")
          : item[_area];
      });
      new vega.View(vega.parse(spec))
        .renderer("svg")
        .logLevel(vega.Warn)
        .initialize(".bar_chart")
        .hover()
        .run();

      //Bottom 3 barchart
      spec.data[0].values = bottom_values;
      _.each(spec.data[0].values, function (item) {
        item[_area] = item[_area].includes("Gautam Buddha Nagar")
          ? item[_area].replace("Gautam Buddha Nagar", "GB Nagar")
          : item[_area];
        item[_area] = item[_area].includes("GAUTAM BUDDHA NAGAR")
          ? item[_area].replace("GAUTAM BUDDHA NAGAR", "GB Nagar")
          : item[_area];
        item[_area] = item[_area].includes("Maunathbhanjan")
          ? item[_area].replace("Maunathbhanjan", "Mau")
          : item[_area];
      });
      new vega.View(vega.parse(spec))
        .renderer("svg")
        .logLevel(vega.Warn)
        .initialize(".bar_chart1")
        .hover()
        .run();

      //Render Donut chart
      if (!isStateUser) {
        var spec1 = get_donut_spec();
        spec1.data[0].values = donut_data;
        new vega.View(vega.parse(spec1))
          .renderer("svg")
          .logLevel(vega.Warn)
          .initialize(".donut_chart")
          .hover()
          .run();
      }

      //Render PDF
      capture_function(
        ".download_cap",
        user_data[_main_area] +
          "_" +
          monthNames[date.getMonth()].substring(0, 3) +
          "_" +
          date.getFullYear()
      );
      if (isStateUser) {
        // For state user, change insights alignment in capture template
        $(".cap_insights").removeClass("col-6");
        $(".cap_insights").removeClass("col-5");
        $(".cap_insights").addClass("col-12 text-center");
        $(".cap_rank_chart").css("margin-top", "9.9rem");
        $(".rank_title").removeClass("py-3");
      } else if (isDivision) {
        $(".page_content").addClass("mt-4");
        $(".cap_insights").addClass("mt-4");
        $(".cap_top_div").addClass("pt-3");
      }
    })
    .template({
      _main_area: _main_area,
      _area: _area,
      top_3: top_3_,
      bottom_3: bottom_3_,
      rank_district: rank_district,
      context_data: context_data,
      table_data: table_page_1,
      change_perc: _.round(new_percentage, 2),
      area_name: _area == "block" ? district_name : user_data[_main_area],
      monthNames: monthNames,
      date: date,
      curr_date: new Date().toLocaleString(),
      increase_blocks: positive_vals,
      decrease_blocks: negative_vals,
    });
}

function get_comp_rank_data(local_table_area) {
  // Generates rank data
  var rank_data, col;
  var rank_params = get_params(2);
  // If Division user logins, all UP districts need to be pulled for computing overall district rank, so division key is removed
  if (isDivision) {
    delete rank_params[_main_area];
  }

  // rank_params['_c'] = ['composite_index|avg']
  // rank_params['_sort'] = ['date', '-composite_index|avg']
  //Fetch rank_data from URL
  //Rename key ('block' or 'district') to area
  // eg: "division":"Basti Division" is replaced with "area":"Basti Division" in json string
  if (!isDivision && !isStateUser) {
    rank_params["_by"] = ["date", "block"];
    rank_params["_c"] = ["composite_index|avg"];
    rank_params["_sort"] = ["date", "-composite_index|avg"];
    col = "composite_index|avg";
    // rank_data = UI.fetch_data('block_data', rank_params)
    rank_data = UI.fetch_data("block_data_exe", rank_params);
    rank_data = JSON.parse(
      JSON.stringify(rank_data).replace(/"block":/g, '"area":')
    );
  }
  // division user
  else if (isDivision) {
    // rank_params['_by'] = ['date', _area]
    // rank_data = UI.fetch_data('district_data', rank_params)
    col = "composite_index";
    rank_data = UI.fetch_data("district_view_exe", rank_params);
    var re = new RegExp('"' + _area + '":', "g");
    rank_data = JSON.parse(JSON.stringify(rank_data).replace(re, '"area":'));
  }
  // state user
  else if (isStateUser) {
    // rank_params['_by'] = ['date', local_table_area]
    // rank_data = UI.fetch_data('district_data', rank_params)
    col = "composite_index";
    if (local_table_area === "division") {
      rank_data = UI.fetch_data("division_view_exe", rank_params);
    } else {
      rank_data = UI.fetch_data("district_view_exe", rank_params);
    }
    re = new RegExp('"' + local_table_area + '":', "g");
    rank_data = JSON.parse(JSON.stringify(rank_data).replace(re, '"area":'));
  }
  // if (!_.includes(["ACMORCH", "ACMO", "CMO"], user_data.designation))
  // if (_.includes([" -"], user_data.designation))
  rank_data = rank_data["data"];
  _.each(rank_data, function (d) {
    d["date"] = moment(d.date).format("YYYY-MM-DD");
  });

  // Splits data based on last 2 months
  var curr_df = _.filter(rank_data, { date: _date["curr_month"] });
  var prev_df = _.filter(rank_data, { date: _date["prev_month"] });

  // computes rank
  // curr_df = get_rank(curr_df, 'composite_index|avg')
  // prev_df = get_rank(prev_df, 'composite_index|avg')
  curr_df = get_rank(curr_df, col);
  prev_df = get_rank(prev_df, col);

  // If Division user logins , all districts related to division are filtered
  if (isDivision) {
    var uniq_areas = _.map(get_unique_areaNames(), _area);
    curr_df = _.filter(curr_df, function (item) {
      return _.includes(uniq_areas, item["area"]);
    });
    prev_df = _.filter(prev_df, function (item) {
      return _.includes(uniq_areas, item["area"]);
    });
  }

  // renaming keys and merging prev and current composite ranks
  var params = { rank: "prev" };
  prev_df = rename_keys(prev_df, params);
  params = { rank: "curr" };
  curr_df = rename_keys(curr_df, params);

  // merge the curr and prev perc points for every area combination
  _.each(curr_df, function (row) {
    // if record does not exist in previous month dataset, set prev = 0
    if (_.find(prev_df, { area: row["area"] }) === undefined) {
      row["prev"] = 0;
    } else {
      row["prev"] = _.find(prev_df, { area: row["area"] })["prev"];
    }
  });

  var df = curr_df;

  // All unique blocks
  var uniq_blocks = table_get_unique_areaNames(local_table_area);
  uniq_blocks = _.sortBy(_.map(uniq_blocks, local_table_area));

  // Identifies missing blocks and adds empty records
  var partial_blocks = _.map(df, "area");
  var missing_blocks = _.difference(uniq_blocks, partial_blocks);

  _.each(missing_blocks, function (i) {
    df.push({ area: i, curr: 0, prev: 0 });
  });

  // Calculate growth
  // growth = increase: 1, descrese: -1, no change: 0, NA : NA
  _.each(df, function (item) {
    if (item.curr == 0 && item.prev == 0) {
      item["growth"] = "NA";
      item["diff"] = 0;
    } else if (item.curr == item.prev) {
      item["growth"] = "0";
      item["diff"] = 0;
    } else if (item.curr > item.prev) {
      item["growth"] = "-1";
      var den = 100 / item.prev !== 1 / 0 ? 100 / item.prev : 0;
      item["diff"] = (item.curr - item.prev) * den;
    } else if (item.prev > item.curr) {
      item["growth"] = "1";
      den = 100 / item.prev !== 1 / 0 ? 100 / item.prev : 0;
      item["diff"] = -(item.prev - item.curr) * den;
    }
  });

  // remove district name from every block text
  _.each(df, function (item) {
    trim_block_names(item, "area");
  });

  return df;
}

function hide_es() {
  $(".no_data_card").removeClass("d-none");
  $(".page_1").addClass("d-none");
  $(".page_2_3").addClass("d-none");
  $("#maximised_chart").addClass("d-none");
}

function show_es() {
  $(".no_data_card").addClass("d-none");
  $(".page_1").removeClass("d-none");
  $(".page_2_3").removeClass("d-none");
  $("#maximised_chart").removeClass("d-none");
}

// Toggle change event at state level ES
$(document).on("change", "#level", function () {
  var val = $(this).prop("checked") ? "district" : "division";
  url.update({ table_toggle: val });
  window.history.pushState({}, "", url.toString());

  state_table_area = isStateUser ? val : _area;
  console.log(val);
  console.log(state_table_area);
  draw_table();
  capture_function(
    ".download_cap",
    user_data[_main_area] + "_" + moment(date).format("MMM_YYYY")
  );
});
