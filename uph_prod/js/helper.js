/* exported ajaxchain_fetch, sort_table,url, loader_show, loader_hide, find_prev_quarter, load_calendar_tb, round_val,  show_checkbox, getMaxValue, getMinValue */
/* global g1,get_accordion_data, redraw */
let url = g1.url.parse(location.href);

function ajaxchain_fetch(url_) {
  return {
    ajaxchain_instance: $.ajaxchain({
      data: { _offset: 0 },
      chain: $.ajaxchain.list(url_),
      limit: url_.length + 1,
    }),
  };
}

// function get_prev(qtr, year, quar_type) {
//   // debugger
//   qtr = parseInt(qtr.toLowerCase().replace('q', ''))
//   let prev_qtr = quar_type == 'prev' ? qtr - 1 : qtr + 1
//   let prev_year = parseInt(year)
//   if (prev_qtr == 0) {
//     prev_qtr = "Q4"
//     prev_year -= 1
//   }
//   else {
//     prev_qtr = "Q" + prev_qtr
//   }
//   return prev_qtr + "'" + prev_year.toString().substr(2, 2)
// }

// function get_tab_quer(args) {
//   let _args = []
//   let query_param = args
//   _.each(query_param, function (v, k) {
//     _args[k] = v[0]
//   })
//   let qtr = _args['quarter'], yr = _args['year']
//   let lst = [(qtr + "'" + yr.toString().substr(2, 2))]
//   let next_yr = get_prev(qtr, yr, 'next')
//   let prev_yr = get_prev(qtr, yr, 'prev')
//   lst.push(next_yr)
//   lst.push(prev_yr)
//   return lst
// }

function sort_table(table_id, column_position, dir) {
  dir = dir || "asc";
  let table, rows, f;
  // , switching;
  table = document.getElementById(table_id);
  // switching = true;
  rows = $(table).children("tbody").children("tr");
  f = dir === "asc" ? 1 : -1;
  rows.sort(function (a, b) {
    var A = getVal(a);
    var B = getVal(b);
    if (A < B) {
      return -1 * f;
    }
    if (A > B) {
      return 1 * f;
    }
    return 0;
  });

  function getVal(elm) {
    var v = $(elm).children("td").eq(column_position).attr("data-value");
    if ($.isNumeric(v)) {
      v = parseFloat(v, 10);
    }
    return v;
  }
  $.each(rows, function (index, row) {
    $(table).children("tbody").append(row);
  });
  /* Sr no remains same as before */
  // for (i = 0; i < rows.length; i++) {
  //   x = rows[i].getElementsByTagName("TD")[0]
  //   $(x).find('.sr_no').text(i + 1)
  // }
}

function loader_show() {
  $(".background").show();
  $(".loader").show();
}

function loader_hide() {
  $(".background").hide();
  $(".loader").hide();
}

function find_prev_quarter(current_quarter, crnt_year) {
  let quarter_seq = ["Q1", "Q2", "Q3", "Q4"];
  let current_quarter_index = quarter_seq.findIndex(function (d) {
    return d == current_quarter;
  });
  if (current_quarter_index == 0) {
    return {
      quarter: quarter_seq[3],
      year: crnt_year - 1,
    };
  } else {
    return {
      quarter: quarter_seq[current_quarter_index - 1],
      year: crnt_year,
    };
  }
}

$(document)
  .on("click", ".quarter, .year", function () {
    $(".quarter, .year").removeClass("highlighted");
    $(this).addClass("highlighted");
  })
  .on("click", ".apply", function () {
    let cal_holder = $(this).attr("id").includes("side_cal")
      ? "side_cal"
      : "top_cal";
    let active_cal = $("#" + cal_holder + " .cal_active.active").attr("id");
    let date_update = {};
    let active_qa = "",
      active_yr = "";
    if (active_cal.includes("quarter")) {
      active_qa = $("#" + cal_holder + " .quarter.highlighted span").attr(
        "data-attr"
      );
      active_yr = $("#" + cal_holder + " .quarter.highlighted span").attr(
        "value"
      );
      date_update["quarter"] = active_qa;
      date_update["year"] = active_yr;
      date_update["active_cal"] = "quarter";
      url = g1.url.parse(location.href).update(date_update);
      history.pushState({}, "", url.toString());
      $(".date-label-" + cal_holder).text(active_qa + " - " + active_yr);
      $("#" + cal_holder).removeClass("show");
      if (url.file == "profile") {
        get_accordion_data();
      } else {
        redraw();
      }
    } else {
      active_yr = $("#" + cal_holder + " .year.highlighted").attr("data-attr");
      date_update["quarter"] = "";
      date_update["year"] = active_yr;
      date_update["active_cal"] = "year";
      url = g1.url.parse(location.href).update(date_update);
      history.pushState({}, "", url.toString());
      $(".date-label-" + cal_holder).text(active_yr);
      $("#" + cal_holder).removeClass("show");
      if (url.file == "profile") {
        get_accordion_data();
      } else {
        redraw();
      }
    }
  });

window.addEventListener("mouseup", function (e) {
  let container = $("#top_cal");
  // if the target of the click isn't the container nor a descendant of the container
  if (!container.is(e.target) && container.has(e.target).length === 0) {
    container.removeClass("show");
  }
});

function show_checkbox(id, option_name) {
  if (option_name === "true") $("#" + id).prop("checked", true);
  else $("#" + id).prop("checked", false);
}

function round_val(value) {
  return Math.round(value);
}

/*
    Description: Calculates the minimum value based on a column in a array of objects
    Params:
        data: Data containing array of objects to be sorted
        key: Key on which the data to be sorted
    Return: Minimum value
*/
function getMinValue(data, key) {
  return data.reduce(function (min, p) {
    return p[key] < min ? p[key] : min;
  }, data[0][key]);
}

/*
    Description: Calculates the maximum value based on a column in a array of objects
    Params:
        data: Data containing array of objects to be sorted
        key: Key on which the data to be sorted
    Return: Minimum value
*/
function getMaxValue(data, key) {
  // return data.reduce(function(max, p){ return p[key] > max ? p[key] : max, data[0][key]});
  return data.reduce(function (max, p) {
    return p[key] > max ? p[key] : max;
  }, data[0][key]);
}
