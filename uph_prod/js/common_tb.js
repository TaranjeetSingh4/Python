/* globals g1, ajaxchain_fetch,
draw_annotations, indicator_mapping, tooltip_data,
sort_table, url:true, loader_hide, load_calendar, order_ind,
show_checkbox */
// loader_show
/* exported slug_, redraw, format_inr, toCamelCase */

// Sentry.init({
//   dsn: 'https://c7b36781a0554e2cbeafd715a5cd651e@sentry.io/1759357'
// });

url = g1.url.parse(location.href);
// let tab_color_range = ['#ff0000', '#fff200', '#1e9600']
// let tab_color_range = ["#D11E3B", '#F0D07F', '#3F9F57']
var month_name,
  year,
  month,
  start_date,
  end_date,
  start_month,
  start_year,
  end_year,
  date,
  end_month,
  quarter,
  q_year;
var filename, view;

$.get("ticker_msg", function (data) {
  $(".ticker_msg").text(data[0].Msg);
});

let sort_image = {
  asc: {
    dir: "desc",
    img: "assets/img/sort-bottom.svg",
  },
  desc: {
    dir: "asc",
    img: "assets/img/sort-top.svg",
  },
};
let options = {
  category: ["all_districts"],
  district_view: url.searchKey.category ? ["1"] : ["0"],
  tab: ["overview"],
  m_names: ["false"],
  m_score: ["true"],
  m_annotations: ["false"],
  ind: ["points_notify"],
  quarter: ["Q3"],
  year: ["2019"],
  active_cal: ["quarter"],
  chart_type: ["score_rank"],
  score_type: ["abs_score"],
  view2: ["state"],
  view: ["state"],
  min_value: [],
  max_value: [],
  mat_sort_key: "id",
  mat_sort_odr: "asc",
};

function format_inr(x) {
  var negative = x < 0,
    str = String(negative ? -x : x),
    arr = [],
    i = str.indexOf("."),
    j;

  if (i === -1) {
    i = str.length;
  } else {
    for (j = str.length - 1; j > i; j--) {
      arr.push(str[j]);
    }
    arr.push(".");
  }
  i--;

  for (j = 0; i >= 0; i--, j++) {
    if (j > 2 && j % 2 === 1) {
      arr.push(",");
    }
    arr.push(str[i]);
  }

  if (negative) {
    arr.push("-");
  }

  return arr.reverse().join("");
}

// to get the max and min value for every indicator to set domain to color map.
// let indicator_list;
options = $.extend({}, options, url.searchList);

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

function toCamelCase(str) {
  // eslint-disable-line
  var final_str = str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
  return final_str;
}

/**
 * [drawTable function to render table in view 2]
 * Steps -
 * - Fetch data from table specific endpoint
 * - Remove India's record from the data object
 * - Render the Table template
 *   - Render score type based on score type param
 *   - Sort the Table
 *   - Highlight specific state row in Table if state is mentioned in param
 *
 * @return None
 */

function hide_state_info() {
  $(".district-filter").addClass("d-none");
  $(".state-filter").removeClass("d-none");
  $(".tab-state-filter").removeClass("d-none");
  $(".district-view-state-profile").addClass("d-none");
  $(".h-500").css("height", "calc(100vh - 192px)");
}

function redraw() {
  url = g1.url.parse(location.href);
  options = $.extend({}, options, url.searchList);
  if (!options["ind"][0]) {
    options["ind"] = ["total_points"];
  }
  // let filter_name1 = url.searchKey.filter_name
  // let filter_name1 = url.searchKey.search_name
  let indicator_value = url.searchKey.indicator_value || "Overall";
  $(".select-category")
    .val(indicator_value.split(" ")[0])
    .selectpicker("refresh");

  // if (filter_name1===undefined){
  //   $(".select-regions").val(options["category"][1]).selectpicker("refresh")
  //   $(".select-regions").val(options["category"][1]).selectpicker("refresh")
  // }
  // else{
  //   if($(".select-regions option").length < 2){
  //     $(".select-regions").append("<option value=" + filter_name1.replace(" ","_") + ">" + filter_name1 + "</option>")
  //     $(".select-regions").val(filter_name1.replace(" ","_")).selectpicker("refresh")
  //   }
  // }

  $("#indicator_dropdown_wrapper .selectpicker")
    .val(options["ind"][0])
    .selectpicker("refresh");
  $(".selected-indicator-header").html(
    $("#indicator_dropdown_wrapper .selectpicker option:selected")
      .text()
      .split("(")[0]
  );
  hide_state_info();
  $("#annotations-wrapper").removeClass("d-none");
  $("#annotations-wrapper").addClass("d-flex");
  $("#state_search").attr("placeholder", "Search for a state in India");
  $("#header-statename-text").text("State Name");
  show_checkbox("names", options["m_names"][0]);
  show_checkbox("score", options["m_score"][0]);
  show_checkbox("annotations", options["m_annotations"][0]);
  // draw_view1_table()
  $(".nav-pills a[id='pills-" + options["tab"][0] + "-tab']").click();
  $(".score-type a[id='view-" + options["score_type"][0] + "']").click();
}

/*
  This is for drawing the table
  */
function draw_view1_table() {
  // url = g1.url.parse(location.href)
  // loader_show()
  // search place holder default text
  // $(".search_text").attr('placeholder', 'Search District')
  // let category = url.searchKey['category'] || 'all_districts'
  let category = url.searchList["category"];
  let ajax_url;
  let append_var = "";
  let table = "";
  if (url.searchKey.year != undefined) {
    table = "yearly";
  } else if (url.searchKey.quarter != undefined) {
    table = "quaterly";
  } else {
    table = "monthly";
  }
  append_var = "?" + url.search;
  // if (category === 'all_districts' || category == undefined) {
  //   append_var = '?'
  // }
  // debugger
  ajax_url = [
    "get_cmo_district_data_" + table + append_var,
    "get_cmo_sub_district_data_" + table + append_var,
    "get_district_indicator_id",
  ];
  let min_val, max_val, indi_data, sub_indi, distinct_ind;
  ajaxchain_fetch(ajax_url).ajaxchain_instance.on("done", function (e) {
    indi_data = e.response[1];
    sub_indi = e.response[2];
    distinct_ind = e.response[3];
    if (
      _.isEmpty(indi_data) ||
      _.isEmpty(sub_indi) ||
      _.isEmpty(distinct_ind)
    ) {
      $(".no_data_show").removeClass("d-none");
      $("#pills-overview").addClass("d-none");
      $(".view1-table,.loader,.background").hide();
      return false;
    } else {
      $("#pills-overview").removeClass("d-none");
      $(".no_data_show").addClass("d-none");
      $(".view1-table,.loader,.background").show();
    }
    let mat_color_obj = {};
    let mat_color_range = ["#D11E3B", "#F0D07F", "#3F9F57"];
    _.each(Object.keys(indi_data[0]), function (k) {
      if (
        k != "district_name" &&
        k != "division_name" &&
        k != "block_name" &&
        k != "block_id_num"
      ) {
        var min_vals = _.minBy(indi_data, function (o) {
          return o[k];
        })[k];
        var max_vals = _.maxBy(indi_data, function (o) {
          return o[k];
        })[k];
        mat_color_obj[k] = d3
          .scaleLinear()
          .domain([min_vals, (min_vals + max_vals) / 2, max_vals])
          .range(mat_color_range);
      }
    });

    if (category != "all_districts" && category != undefined) {
      indi_data = _.filter(indi_data, function (ind) {
        return _.includes(category, ind.name);
      });
    }
    $(".view1-table")
      .on("template", function () {
        $(".quarter").parent().removeClass("cursor-pointer");
        $(".quarter").css("cursor", "not-allowed");
        $("tbody").scroll(function () {
          //detect a scroll event on the tbody
          $("thead").css("left", -$(".custm-table tbody").scrollLeft()); //fix the thead relative to the body scrolling
          $("thead th:nth-child(1)").css(
            "left",
            $(".custm-table tbody").scrollLeft()
          ); //fix the first cell of the header
          $("tbody td:nth-child(1)").css(
            "left",
            $(".custm-table tbody").scrollLeft()
          ); //fix the first column of tdbody
        });
        $('[data-toggle="tooltip"]').tooltip();
        loader_hide();
        $("#myUL").hide();
      })
      .template({
        map_data: indi_data,
        sub_indi: sub_indi,
        distinct_ind: distinct_ind,
        min_val: min_val,
        max_val: max_val,
        indicator_mapping: indicator_mapping,
        tooltip_data: tooltip_data,
        mat_color_obj: mat_color_obj,
      });
  });
}
$(".data_empty").template({
  options: options,
});

let states = 0;
let indicator_values = 0;
indicator_values = _.sortBy(indicator_values, function (item) {
  return order_ind.indexOf(item.mapping_name);
});
$(".render_state_template")
  .on("template", function () {
    $(".state-filter .selectpicker").selectpicker();
    $(".tab-state-filter .selectpicker").selectpicker();
    $(".render_indicator_template")
      .on("template", function () {
        $("#indicator_dropdown_wrapper .selectpicker").selectpicker();
        redraw();
      })
      .template({
        res: indicator_values,
      });
  })
  .template({
    states: states,
  });

// $(".render_state_template1").on('template', function () {
//   $('#state-select-dropdown').selectpicker('val', _category)
// }).template({
//   sel_districts: ''
// })

$(".render_category_template").template({});

// let sort_img = {
//   "asc": {
//     "dir": "desc",
//     "img": "assets/img/sort-bottom.svg"
//   },
//   "desc": {
//     "dir": "asc",
//     "img": "assets/img/sort-top.svg"
//   }
// }
$(document)
  .tooltip({
    selector: '[data-toggle="tooltip"]',
    container: "body",
    placement: "top",
  })
  .on("click", ".icon-search", function () {
    $(".table_header_row").toggleClass("border-dot");
    $(".search_bar_row").toggleClass("d-none");
    $("#state_search").val("");
    $("#rank-table1 tr").filter(function () {
      $(this).toggle(
        $(this).text().toLowerCase().indexOf($("#state_search").text()) > -1
      );
    });
  })
  .on("click", "#pills-overview-tab", function () {
    $(".tab_download").removeClass("d-none");
    $(".tab_search").attr("style", "display: flex !important");
    $(".note").removeClass("d-none");
    $(".slider-image").removeClass("d-none");
    $(".overview-tabs").removeClass("pr-0").addClass("pr-4");
    // $(".state-text").css("display", "block")
    $(".ind-header").removeClass("mt-0");
    $(".tab-state-filter").attr("style", "display: block !important");
    $(".state-filter").attr("style", "display: none !important");
    $(".district-filter").attr("style", "display: none !important");
    $("#indicator_dropdown_wrapper").addClass("d-none");
    $("#indicator_dropdown_wrapper").removeClass("d-flex");
    options["tab"][0] = "overview";
    load_calendar();
    $(".state-filter, .district-filter").addClass("d-none");
    draw_view1_table();
  })
  .on("click", "#view-per_change", function () {
    $("#view-abs_score").removeClass(
      "border-primary border-bottom border-2 text-primary active"
    );
    $("#view-abs_score").addClass("text-color1");
    $("#view-abs_score .dot").addClass("d-none");
    $("#view-per_change .dot").removeClass("d-none");
    $("#view-per_change").removeClass("text-color1");
    $(".percent-block").css("display", "block ");
    $(".score-block").css("display", "none");
    $("#header-score span#header-score-text").text("% Change");
    $(".col-rank-percent").attr("data-value", function () {
      $(this).attr("data-value", $(this).attr("data-per-change-value"));
    });

    let url_tab = {};
    url_tab["score_type"] = ["per_change"];
    url = g1.url.parse(location.href).update(url_tab);
    history.pushState({}, "", url.toString());
  })
  .on("click", "#view-abs_score", function () {
    $("#view-per_change").removeClass(
      "border-primary border-bottom border-2 text-primary active"
    );
    $("#view-per_change").addClass("text-color1");
    $("#view-abs_score .dot").removeClass("d-none");
    $("#view-per_change .dot").addClass("d-none");
    // $('#view-abs_score').addClass("border-primary border-bottom border-2 text-primary active")
    $("#view-abs_score").removeClass("text-color1");
    $(".percent-block").css("display", "none");
    $(".score-block").css("display", "block");
    $(".col-rank-percent").attr("data-value", function () {
      $(this).attr("data-value", $(this).attr("data-abs-value"));
    });
    $("#header-score span#header-score-text").text("Score");
    url = g1.url.parse(location.href);
    history.pushState({}, "", url.toString());
  })
  .on("click", "#view1-table tr", function () {
    let url_tab = {};
    url_tab["tab"] = "rankings";
    url_tab["category"] = $(this).children(".state_col").attr("data-category");
    url = g1.url.parse(location.href).update(url_tab);
    window.location = url;
  })
  .on("change", "#state-select-dropdown", function () {
    let selected_value = $(this).selectpicker("val");
    let past_val = url.searchKey.category;
    // debugger
    if (past_val != undefined) {
      past_val = past_val.replace(/ /g, "_");
      $(".selectpicker")
        .find("[value=" + past_val + "]")
        .remove();
      $("#view1-search").val("");
    }
    let past_filter = url.searchKey.filter_name;
    if (past_filter != undefined) {
      past_filter = past_filter.replace(/ /g, "_");
      $(".selectpicker")
        .find("[value=" + past_filter + "]")
        .remove();
      $("#view1-search").val("");
    }
    if (selected_value.length < 75) {
      url.update({
        category: selected_value,
        filter_id: null,
        id: null,
        search_name: null,
        filter_name: null,
      });
    }
    history.pushState({}, "", url.toString());

    if (selected_value.length == 75) {
      $(".select-regions .filter-option-inner-inner").text("All Districts");
      url.update(
        {
          category: null,
        },
        "del"
      );
      history.pushState({}, "", url.toString());
    }
    // redraw()
    setTimeout(draw_view1_table(), 1000);
  })
  .on("change", "#category-select-dropdown", function () {
    let selected_value = $(this).val();
    let past_val = url.searchKey.indicator_value;
    // debugger
    if (selected_value === "Overall") {
      url.update(
        {
          indicator_value: past_val,
        },
        "del"
      );
    } else {
      url.update({
        indicator_value: selected_value + " Indicator",
      });
    }
    history.pushState({}, "", url.toString());
    // redraw()
    draw_view1_table();
  })
  .on("change", "#district-select-dropdown", function () {
    let dist = $(this).val();
    history.pushState({}, "", url.toString());
    if (dist) redirect_profile();
  })
  .on("click", "#names", function () {
    url.update({
      m_names: $(this).prop("checked").toString(),
    });
    history.pushState({}, "", url.toString());
    options["m_names"] = [$(this).prop("checked").toString()];
  })
  .on("click", "#score", function () {
    url.update({
      m_score: $(this).prop("checked").toString(),
    });
    history.pushState({}, "", url.toString());
    options["m_score"] = [$(this).prop("checked").toString()];
  })
  .on("click", "#annotations", function () {
    draw_annotations();
    url.update({
      m_annotations: $(this).prop("checked").toString(),
    });
    history.pushState({}, "", url.toString());
    options["m_annotations"] = [$(this).prop("checked").toString()];
    $(".annotation-group").toggleClass("d-none");
  })
  .on(
    "changed.bs.select",
    "#indicator_dropdown_wrapper .selectpicker",
    function () {
      $(".selected-indicator-header").html(
        $("#indicator_dropdown_wrapper .selectpicker option:selected")
          .text()
          .split("(")[0]
      );
      options["min_value"] = [];
      options["max_value"] = [];
      url.update(
        {
          min_value: url.searchList["min_value"] || [],
          max_value: url.searchList["max_value"] || [],
        },
        "del"
      );
      url.update({
        ind: $(this).val(),
      });
      history.pushState({}, "", url.toString());
      redraw();
    }
  )

  .on("click", ".profile_link", function () {
    redirect_profile();
  })
  .on("click", ".district-drill-down", function (e) {
    if (options["category"][0] === "all_districts") return;
    else redirect_profile();
    e.stopPropagation();
    url.update(
      {
        district_id: url.searchList["district_id"] || "",
      },
      "del"
    );
    url.update({
      category: $(this).attr("id"),
    });
    history.pushState({}, "", url.toString());
    redraw();
  })
  .on("click", ".back-arrow", function () {
    url.update(
      {
        district_id: url.searchList["district_id"] || "",
      },
      "del"
    );
    url.update({
      category: "all_districts",
    });
    options["min_value"] = [];
    options["max_value"] = [];
    history.pushState({}, "", url.toString());
    $(".data-empty-text").addClass("d-none");
    redraw();
  })
  .on("click", ".table-rows", function () {
    url.update({ category: $(this).attr("data-category") });
    history.pushState({}, "", url.toString());
    redraw();
    redirect_profile();
  })
  .on(
    "mouseover",
    "#view1_table  th:not(:first-child):not(.dont-highlight)",
    function () {
      $(
        "td:not(:first-child)[data-seq='" + $(this).attr("data-seq") + "']"
      ).addClass("highlighted_row_col");
    }
  )
  .on("mouseout", "#view1_table th:not(:first-child)", function () {
    $(
      "td:not(:first-child)[data-seq='" + $(this).attr("data-seq") + "']"
    ).removeClass("highlighted_row_col");
  })
  .on("mouseover", "#view1_table  td:first-child", function () {
    $(this).parent().addClass("highlighted_row_col");
  })
  .on("mouseout", "#view1_table td:first-child", function () {
    $($(this).parent()).removeClass("highlighted_row_col");
  })
  .on("click", ".view1-table-rows td:first-child", function () {
    if (url.searchList.category != "all_blocks") {
      $(".map_view_text").addClass("d-none");
      $(this).children().removeClass("d-none");
    }
  })
  .on("click", ".map_view_text", function () {
    if (url.searchKey.level == undefined) {
      var level = 1;
    } else {
      level = 2;
    }
    let past_search = url.searchKey.search_name;
    let past_filter_id = url.searchKey.filter_id;
    let past_filter_name = url.searchKey.filter_name;
    if (past_filter_id != undefined) {
      url.update({ level1_id: past_filter_id, filtername_1: past_filter_name });
    }
    if (past_filter_name !== undefined) {
      $(".selectpicker")
        .find("[value=" + past_filter_name.replace(" ", "_") + "]")
        .remove();
      $(".selectpicker").selectpicker("refresh");
    }
    if (past_search !== undefined) {
      $(".selectpicker")
        .find("[value=" + past_search.replace(/ /g, "_") + "]")
        .remove();
      $(".selectpicker").selectpicker("refresh");
    }
    var filter_name1 = $(this).attr("filter_name");
    if (
      url.searchList.category == "all_districts" ||
      url.searchList.category == undefined
    ) {
      url.update({
        filter_id: $(this).attr("level_id_data"),
        category: "all_blocks",
        filter_name: filter_name1,
        id: null,
        level: level,
      });
    } else if (url.searchList.category == "all_divisions") {
      url.update({
        filter_id: $(this).attr("level_id_data"),
        category: "all_districts",
        filter_name: filter_name1,
        id: null,
        level: level,
      });
    }
    history.pushState({}, "", url.toString());
    draw_view1_table();
    $(".back_symbol").removeClass("invisible");
    $(".selectpicker").append(
      "<option value=" +
        filter_name1.replace(" ", "_") +
        ">" +
        filter_name1 +
        "</option>"
    );
    $(".selectpicker")
      .val(filter_name1.replace(" ", "_"))
      .selectpicker("refresh");
  })
  .on("click", ".back_symbol", function () {
    $("#view1-search").val("");
    if (url.searchKey.search_name != undefined) {
      if (url.searchKey.filter_name != undefined) {
        let past_val = url.searchKey.filter_name;
        past_val = past_val.replace(/ /g, "_");
        $(".selectpicker")
          .find("[value=" + past_val + "]")
          .remove();
      }
      let category =
        url.searchList.category == "all_blocks"
          ? "all_districts"
          : url.searchList.category;
      $(".selectpicker").val(category).selectpicker("refresh");
      // $(".selectpicker").val(value_text).selectpicker("refresh")
      let past_search = url.searchKey.search_name;
      past_search = past_search.replace(/ /g, "_");
      $(".selectpicker")
        .find("[value=" + past_search + "]")
        .remove();
      $(".back_symbol").addClass("invisible");
      url.update({
        category: category,
        filter_id: null,
        level: null,
        filter_name: null,
        search_name: null,
        id: null,
        filtername_1: null,
        level1_id: null,
      });
    } else {
      if (url.searchList.category == "all_districts") {
        $(".selectpicker").val("all_divisions").selectpicker("refresh");
        url.update({
          category: "all_divisions",
        });
      } else if (url.searchList.category == "all_blocks") {
        $(".selectpicker").val("all_districts").selectpicker("refresh");
        url.update({
          category: "all_districts",
        });
      }
      if (url.searchKey.level == 1) {
        let past_val = url.searchKey.filter_name;
        past_val = past_val.replace(/ /g, "_");
        $(".selectpicker")
          .find("[value=" + past_val + "]")
          .remove();
        $(".back_symbol").addClass("invisible");
        $(".selectpicker").selectpicker("refresh");
        url.update({
          filter_id: null,
          level: null,
          filter_name: null,
          search_name: null,
          id: null,
        });
      } else {
        let past_val = url.searchKey.filter_name;
        past_val = past_val.replace(/ /g, "_");
        $(".selectpicker")
          .find("[value=" + past_val + "]")
          .remove();
        let option_val = url.searchKey.filtername_1;
        option_val = option_val.replace(/ /g, "_");
        $(".selectpicker").append(
          "<option value=" +
            option_val +
            ">" +
            url.searchKey.filtername_1 +
            "</option>"
        );
        $(".selectpicker").val(option_val).selectpicker("refresh");
        url.update({
          level: 1,
          filter_id: url.searchKey.level1_id,
          level1_id: null,
          filter_name: url.searchKey.filtername_1,
          filtername_1: null,
        });
      }
    }
    history.pushState({}, "", url.toString());
    draw_view1_table();
    $(".selectpicker").selectpicker("refresh");
  })

  .on("click", "img.pos-bc, #table_view_expand_btn", function (event) {
    event.stopPropagation();
    let cont_id = $(this).attr("data-id");
    let data_sel = $(this).closest("th").attr("data-key");
    let tab_sel = $($(this).closest("th")[0]).attr("data-seq");
    if ($("[id=" + cont_id + "]").hasClass("d-none")) {
      $("[id=" + cont_id + "]").removeClass("d-none");
      $(this).attr("src", "assets/img/icon-collapse.svg");
      $(this).closest("th").addClass("bg-color55");
      $("td[data-key='" + data_sel + "']").removeClass("bg-color53");
      $("td[data-key='" + data_sel + "']").addClass("bg-color55");
      $("td[data-seq='" + tab_sel + "']").addClass("bg-color55");
    } else {
      $("[id=" + cont_id + "]").addClass("d-none");
      $(this).attr("src", "assets/img/icon-expand.svg");
      $(this).closest("th").removeClass("bg-color55");
      $("td[data-key='" + data_sel + "']").removeClass("bg-color55");
      $("td[data-key='" + data_sel + "']").addClass("bg-color53");
      $("td[data-seq='" + tab_sel + "']").removeClass("bg-color55");
    }
  })

  .on("click", ".table_sort", function (event) {
    event.stopPropagation();

    let sort_key = $(this).attr("data-key");
    let sort_col_pos = $(this).attr("data-col_num");
    let ex_sort_key = options["mat_sort_key"];
    let sort_order = options["mat_sort_odr"];
    if (sort_key === ex_sort_key) {
      sort_order = sort_image[sort_order].dir;
    }
    $(".table_sort").attr("src", "assets/img/no-sort.svg");
    $(this).attr("src", sort_image[sort_order].img);
    sort_table("view1_table", sort_col_pos, sort_order);
    options["mat_sort_key"] = sort_key;
    options["mat_sort_odr"] = sort_order;
  })

  .on("click", "#close-link", function () {
    $(".table_header_row").toggleClass("border-dot");
    $(".search_bar_row").toggleClass("d-none");
    $("#state_search").val("");
    $("#rank-table1 tr").filter(function () {
      $(this).toggle(
        $(this).text().toLowerCase().indexOf($("#state_search").text()) > -1
      );
    });
  })

  .on("mouseover", ".info-icon-hover", function () {
    $(".info-icon-hover").attr("src", "assets/img/info_icon.svg");
    $(this).attr("src", "assets/img/info-more.svg ");
  })
  .on("mouseout", ".info-icon-hover", function () {
    $(".info-icon-hover").attr("src", "assets/img/info_icon.svg");
  })
  .on("click", ".month", function () {
    $(".quarter").removeClass("highlighted");
    $(".year").removeClass("highlighted");
    $(".month").removeClass("active");
    $(".month").removeClass("text-dark");
    $(".month").addClass("opacity-70");
    $(this).removeClass("opacity-70");
    $(this).addClass("active");
    $(this).addClass("text-dark");
    month = moment().month($(this).attr("data-attr")).format("M");
    year = $(this).attr("data-year");
    month_name = $(this).attr("data-attr");
    date = moment([year, month - 1, 1]).format("YYYY-MM-DD");
  })
  .on("click", ".quarter", function () {
    $(".month").removeClass("active");
    $(".year").removeClass("highlighted");
    quarter = $(this).attr("data-attr")[1];
    q_year = $(this).attr("data-year");
    start_month = $(this).attr("data-months").split("-")[0];
    end_month = $(this).attr("data-months").split("-")[1];
    if (start_month !== "Jan") {
      q_year = q_year - 1;
    }
    start_date = moment([
      q_year,
      moment().month(start_month).format("M") - 1,
      1,
    ]).format("YYYY-MM-DD");
    end_date = moment([
      q_year,
      moment().month(end_month).format("M") - 1,
      1,
    ]).format("YYYY-MM-DD");
    // $('.cal-button-area span').text($(this).attr("data-attr") + ' ' + q_year)
  })
  .on("click", ".year", function () {
    $(".quarter").removeClass("highlighted");
    $(".month").removeClass("active");
    year = $(this).attr("data-attr");
    start_year = moment([year - 1, 4 - 1, 1]).format("YYYY-MM-DD");
    end_year = moment([parseInt(year - 1) + 1, 3 - 1, 1]).format("YYYY-MM-DD");
    // $('.cal-button-area span').text(year)
  })
  .on("click", ".submit", function () {
    if (quarter != undefined && q_year != undefined) {
      $(".cal-button-area span").text("Q" + quarter + " " + q_year);
      view = "quaterly";
      filename = "Q" + quarter + "_" + q_year;
      url.update({
        date: null,
        quarter: quarter,
        q_year: q_year,
        start_date: start_date,
        end_date: end_date,
        year: null,
        start_year: null,
        end_year: null,
      });
      quarter = undefined;
      q_year = undefined;
      start_date = undefined;
      end_date = undefined;
    } else if (start_year != undefined) {
      // console.log($('.highlighted').data("attr"), "year")
      var _year = parseInt($(".highlighted").data("attr"));
      $(".cal-button-area span").text(
        `${_year - 1} - ${_year.toString().substring(2, 4)}`
      );
      // $('.cal-button-area span').text(year)
      view = "yearly";
      filename = year;
      url.update({
        year: year,
        start_year: start_year,
        end_year: end_year,
        date: null,
        quarter: null,
        q_year: null,
        start_date: null,
        end_date: null,
      });
      year = undefined;
      start_year = undefined;
      end_year = undefined;
    } else if (q_year == undefined && start_year == undefined) {
      $(".cal-button-area span").text(month_name + " " + year);
      view = "monthly";
      filename = month_name + "_" + year;
      url.update({
        date: date,
        quarter: null,
        q_year: null,
        start_date: null,
        end_date: null,
        year: null,
        start_year: null,
        end_year: null,
      });
      date = undefined;
    }
    history.pushState({}, "", url.toString());
    $(".cal_wid").hide();
    draw_view1_table();
  })
  .on("click", ".search_option", function () {
    $(".back_symbol").removeClass("invisible");
    $("#view1-search").val($(this).attr("total_name"));
    let past_val = url.searchKey.search_name;
    if (past_val != undefined) {
      past_val = past_val.replace(/ /g, "_");
      $(".selectpicker")
        .find("[value=" + past_val + "]")
        .remove();
      $("#view1-search").val($(this).attr("total_name"));
    }
    let id = $(this).attr("id");
    let view = $(this).attr("view");
    let category = "";
    let total_name = $(this).attr("total_name");
    if (view == "in Blocks") {
      category = "all_blocks";
    } else if (view == "in Districts") {
      category = "all_districts";
    } else {
      category = "all_divisions";
    }
    url.update({
      id: id,
      category: category,
      search_name: total_name,
      filter_id: null,
    });
    history.pushState({}, "", url.toString());
    draw_view1_table();
    let total_name_val = total_name.replace(/ /g, "_");
    $(".filter-two .selectpicker").append(
      "<option value=" + total_name_val + ">" + total_name + "</option>"
    );
    $(".filter-two .selectpicker").val(total_name_val).selectpicker("refresh");
    if (url.searchKey.filter_name != undefined) {
      $(".filter-two .selectpicker")
        .find("[value=" + url.searchKey.filter_name.replace(/ /g, "_") + "]")
        .remove();
    }
    $(".filter-two .selectpicker").selectpicker("refresh");
  })
  .on("click", ".divison_data", function () {
    let append_var = "&" + url.search;
    let data =
      "division_download_cmo_" +
      view +
      "?_format=xlsx&_download=Division_data_" +
      filename +
      ".xlsx" +
      append_var;
    location.href = data;
  })
  .on("click", ".district_data", function () {
    filename = $(".cal-button-area span").text().replace(" ", "_");
    let append_var = "&" + url.search;
    let data =
      "district_download_cmo_" +
      view +
      "?_format=xlsx&_download=District_data_" +
      filename +
      ".xlsx" +
      append_var;
    location.href = data;
  })
  .on("click", ".block_data", function () {
    let append_var = "&" + url.search;
    let data =
      "block_download_cmo_" +
      view +
      "?_format=xlsx&_download=Block_data_" +
      filename +
      ".xlsx" +
      append_var;
    location.href = data;
  })
  .mouseup(function (e) {
    var container = $(".cal_wid");
    if (!container.is(e.target) && container.has(e.target).length === 0) {
      container.addClass("d-none");
    }
  });

$(".render_state_template1")
  .on("template", function () {
    $(".select-regions").selectpicker("val", url.searchList.category);
    var _regions = $("#state-select-dropdown").selectpicker("val");
    $(".select-regions").selectpicker("refresh");
    if (_regions.length == 75) {
      $(".select-regions .filter-option-inner-inner").text("All Districts");
    }
  })
  .template({
    sel_districts: "",
  });

$("#state_search").on("keyup", function () {
  let value = $(this).val().toLowerCase();
  $("#rank-table1 tr").filter(function () {
    $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
  });
});
// $("#view1-search").focusout(function () {
//   $("#view1-search").val('')
//   $("#GFG_DOWN").addClass("d-none")
//   draw_view1_table()
// })
$("#view1-search").on("keyup", function () {
  let search_text = $(this).val().toLowerCase();
  if (search_text == "") {
    $("#myUL").hide();
  } else {
    let search_url = "search_div_dist_blck?search=" + search_text;
    ajaxchain_fetch([search_url]).ajaxchain_instance.on("done", function (e) {
      if (e.response[1].length >= 1) {
        $(".search_tb").template({
          data: e.response[1].slice(0, 6),
        });
      }
    });
  }
});
// $.getJSON("get_maximum_date", function (data) {
//   let label = moment(data[0]['date']).format('DD MMM YYYY')
//   $(".last_update").text("Data Last Updated on " + label)
// })
function redirect_profile() {
  options = $.extend({}, options, url.searchList);
  window.location.href = "profile?category=" + options["category"][0];
}

if (view == undefined || filename == undefined) {
  view = "monthly";
  filename = "Mar_2020";
}
