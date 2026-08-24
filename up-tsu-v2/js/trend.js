/* global UI, url_update, return_url, indicator_mapping, map_dropdown_indicators_14, draw_trend, user_data, get_latest_date*/
/* exported map:true, get_hierarchy*/
var latest_date = get_latest_date();
var aspirational_districts = [
  "180",
  "182",
  "184",
  "181",
  "200",
  "172",
  "196",
  "171",
];
var hpds = [
  "174",
  "175",
  "199",
  "200",
  "153",
  "154",
  "176",
  "177",
  "180",
  "149",
  "150",
  "151",
  "152",
  "136",
  "155",
  "159",
  "160",
  "201",
  "202",
  "181",
  "182",
  "183",
  "184",
  "186",
  "187",
];
var div_dis_map = UI.fetch_data("div_dist_map", "");
// var slider_mapping = {asd: 'aspirational_districts', hpds: 'hpds', all: "all"}
// var data_map_dist = default_params.data_map_dist
// calculate RANK (index_rank,type_rank, composite rank) for computing color metric for district, division, block data
function order_by_rank(data, index_metric, rank_metric) {
  // sorts the array by specified metric and computes the rank
  data = _.orderBy(data, index_metric, "desc");
  _.each(data, function (d, i) {
    d[rank_metric] = i + 1;
  });
  return data;
}

$(function () {
  user_login();
  render_map();
  render_silder();
  render_dropdownlist();
});

function user_login() {
  let user_map_id = user_data.map_id;
  let url_div = url.searchKey.division_level;
  let url_dist = url.searchKey.district_level;
  let toggle = url.searchKey.toggle;
  if (user_map_id && !url_div && !url_dist && !toggle) {
    if (user_data.district) {
      $("#map-section").prop("checked", false);
      $("#dropdownMenuButton").text(user_data.district);
      $("#double-label-slider").hide();
      url_update({ district_level: user_map_id, toggle: "no", slider: "all" });
    } else if (user_data.division) {
      $("#map-section").prop("checked", true);
      $("#dropdownMenuButton").text(user_data.division);
      $("#double-label-slider").hide();
      url_update({ division_level: user_map_id, toggle: "yes", slider: null });
    }
  }
}

function render_dropdownlist() {
  let url = g1.url.parse(location.href);
  let slider = url.searchKey.slider !== undefined ? url.searchKey.slider : "";
  $("#userlist").off();
  let toggle = url.searchKey.toggle !== undefined ? url.searchKey.toggle : "";
  if (slider == "asd") {
    let asd_div_dis_map = _.filter(
      div_dis_map,
      (v) => _.indexOf(aspirational_districts, v.map_id.toString()) != -1
    );
    $("#userlist").template({
      users:
        toggle == "yes"
          ? _.uniqBy(asd_div_dis_map, "division")
          : asd_div_dis_map,
      _district: toggle == "yes" ? "division" : "district",
      _type: toggle == "yes" ? "div_map_id" : "map_id",
    });
  } else if (slider == "hpds") {
    let hpds_div_dis_map = _.filter(
      div_dis_map,
      (v) => _.indexOf(hpds, v.map_id.toString()) != -1
    );
    $("#userlist").template({
      users:
        toggle == "yes"
          ? _.uniqBy(hpds_div_dis_map, "division")
          : hpds_div_dis_map,
      _district: toggle == "yes" ? "division" : "district",
      _type: toggle == "yes" ? "div_map_id" : "map_id",
    });
  } else {
    $("#userlist").template({
      users: toggle == "yes" ? _.uniqBy(div_dis_map, "division") : div_dis_map,
      _district: toggle == "yes" ? "division" : "district",
      _type: toggle == "yes" ? "div_map_id" : "map_id",
    });
  }
}
// // Sets opacity for Aspirational, HPD toggle
// function opacity_iterate_sublayers(self, layer, ref_list){
//   self.gLayers[layer].eachLayer(function(sublayer) {
//     // DISTRICT ID
//     // sublayer.feature.properties.Id
//     sublayer.setStyle({fillOpacity: 0.1})
//     if ( _.includes(ref_list, sublayer.feature.properties.Id.toString()) == true || ref_list === undefined){
//       sublayer.setStyle({fillOpacity: 1})
//       sublayer.openTooltip()
//     }
//     else {
//       sublayer.closeTooltip()
//     }
// })
// }

// Slider code
// http://simeydotme.github.io/jQuery-ui-Slider-Pips/
var doubleLabels = [
  "<i>Show All</i>",
  "<i>Aspiration</i>",
  "<i>High Priority</i>",
];
function render_silder() {
  let url_slider_val =
    url.searchKey.slider !== undefined ? url.searchKey.slider : "";
  let slider_val = 0;
  if (url_slider_val == "all") {
    slider_val = 0;
  } else if (url_slider_val === "asd") {
    slider_val = 1;
  } else if (url_slider_val === "hpds") {
    slider_val = 2;
  }

  $("#double-label-slider")
    .slider({
      max: 2,
      min: 0,
      value: slider_val || 0,
      animate: 400,
      change: function (event, ui) {
        if (!event.originalEvent) return;
        var toggle =
          url.searchKey.toggle !== undefined ? url.searchKey.toggle : "";
        if (ui.value === 0) {
          url_update({ slider: "all" });
          $("#userlist").template({
            users:
              toggle == "yes" ? _.uniqBy(div_dis_map, "division") : div_dis_map,
            _district: toggle == "yes" ? "division" : "district",
            _type: toggle == "yes" ? "div_map_id" : "map_id",
          });
        } else if (ui.value === 1) {
          url_update({ slider: "asd" });
          var asd_div_dis_map = _.filter(
            div_dis_map,
            (v) => _.indexOf(aspirational_districts, v.map_id.toString()) != -1
          );
          $("#userlist").template({
            users:
              toggle == "yes"
                ? _.uniqBy(asd_div_dis_map, "division")
                : asd_div_dis_map,
            _district: toggle == "yes" ? "division" : "district",
            _type: toggle == "yes" ? "div_map_id" : "map_id",
          });
        } else {
          url_update({ slider: "hpds" });
          var hpds_div_dis_map = _.filter(
            div_dis_map,
            (v) => _.indexOf(hpds, v.map_id.toString()) != -1
          );
          $("#userlist").template({
            users:
              toggle == "yes"
                ? _.uniqBy(hpds_div_dis_map, "division")
                : hpds_div_dis_map,
            _district: toggle == "yes" ? "division" : "district",
            _type: toggle == "yes" ? "div_map_id" : "map_id",
          });
        }
        // render_map();
        $(".loading").show();
        setTimeout(render_map, 500);
      },
    })
    .slider("pips", {
      rest: "label",
      labels: doubleLabels,
    });
}
// slider code ends

// circle legend text (Top 25/6)
var url_checked = g1.url.parse(location.href);
var toggle_value =
  url_checked.searchList["toggle"] === undefined
    ? "no"
    : url_checked.searchList["toggle"][0];
var count = toggle_value == "no" ? 25 : 6;
$("#id_legend_circle").template({ count: count });

var url = return_url();
url.searchKey.toggle === "yes" ? $(".map1").click() : "";
if (url.searchKey.toggle === "yes") $("#double-label-slider").hide();
$(".loading").css("z-index", 1);

$("._dropdown")
  .on("template", function () {
    var val = url.searchKey["indicator_id"] || "composite_score";
    if (val === "composite_score") $(".back-button").hide();
    var shortname = _.find(indicator_mapping, {
      indicator_id: val,
    }).short_name;
    // $('#top-panel').text(shortname)
    $("#top-panel").text(shortname.slice(0, 25));
  })
  .template({
    overall: "Composite Score",
    map_dropdown_indicators_14: map_dropdown_indicators_14,
    filter: "type",
    param: "indicator_id",
  });
function get_hierarchy(url) {
  var _h,
    _keys = url.searchKey;
  if (
    (_keys.division_level === undefined || _keys.division === undefined) &&
    _keys.check === "yes"
  ) {
    _h = "division_level";
  } else if (
    _keys.district_level == undefined ||
    _keys.district === undefined
  ) {
    _h = "district_level";
  } else {
    _h = "block_level";
  }
  return _h;
}

function render_map() {
  // Called only once on page load
  $(".calendar_cc").show();
  $(".loading").show();
  $("#trend").empty();
  $(".main-trend-val").html("");
  $(".right-sel-trend-div").parent().removeClass("d-flex").addClass("d-none");
  $(".mapid").show();
  $(".mapid2").show();
  $("#indicator-top-bar").hide();
  $("#collapsemain").removeClass("show");
  $("#top-panel").addClass("collapsed");
  $("#deepdive-container").show();
  $("#top-panel").html("Composite Score");
  url = g1.url.parse(location.href);
  var def_date = moment(latest_date, "MMMM YYYY").format("YYYY-MM-DD");
  var year_ = "",
    prev_year_ = "";
  var quarter_ = "",
    prev_quarter_ = "";
  var filter_ = "";
  $(".calendar_time").html(moment(def_date, "YYYY-MM-DD").format("MMM YYYY"));
  if (url.searchKey.month !== "" && url.searchKey.quarter === "") {
    def_date = moment(
      url.searchKey.year + "-" + url.searchKey.month + "-01",
      "YYYY-MMM-DD"
    ).format("YYYY-MM-DD");
    $(".calendar_time").html(moment(def_date, "YYYY-MM-DD").format("MMM YYYY"));
  } else if (!_.includes(["", undefined], url.searchKey.quarter)) {
    quarter_ = url.searchKey.quarter !== undefined ? url.searchKey.quarter : "";
    year_ = url.searchKey.year !== undefined ? url.searchKey.year : "";
    prev_quarter_ =
      url.searchKey.prev_quarter !== undefined
        ? url.searchKey.prev_quarter
        : "";
    prev_year_ =
      url.searchKey.prev_year !== undefined ? url.searchKey.prev_year : "";
    $(".calendar_time").html(url.searchKey.quarter + " " + year_);
    def_date = "";
    filter_ = "_qa";
  } else if (url.searchKey.quarter === "" && url.searchKey.month === "") {
    year_ = url.searchKey.year !== undefined ? url.searchKey.year : "";
    prev_year_ =
      url.searchKey.prev_year !== undefined ? url.searchKey.prev_year : "";
    $(".calendar_time").html(year_);
    def_date = "";
    filter_ = "_yr";
  }
  var from_date;
  from_date = def_date != "" ? moment(def_date).subtract(12, "months") : "";
  //   console.log(def_date, from_date.format('YYYY-MM-DD'))
  var type_ = "";
  var indicator_id_ =
    url.searchKey.indicator_id !== undefined
      ? url.searchKey.indicator_id.split("_")[1]
      : "";
  // var district_id = url.searchKey.district_level !== undefined ? url.searchKey.district_level : ""
  // var division_id = url.searchKey.division_level !== undefined ? url.searchKey.division_level : ""
  var slider = url.searchKey.slider !== undefined ? url.searchKey.slider : "";
  var toggle = url.searchKey.toggle !== undefined ? url.searchKey.toggle : "";

  // var district_data = UI.fetch_data(
  //   "summary_overall" + filter_,
  //   $.param(
  //     {
  //       to_date: def_date,
  //       from_date: from_date == "" ? "" : from_date.format("YYYY-MM-DD"),
  //       to_year: year_,
  //       prev_year: prev_year_,
  //       to_quarter: quarter_.split("Q")[1],
  //       prev_quarter: prev_quarter_.split("Q")[1],
  //       type: type_,
  //       indicator_id: indicator_id_,
  //     },
  //     true
  //   )
  // );
  // var block_level_data = UI.fetch_data(
  //   "summary_form" + filter_,
  //   $.param(
  //     {
  //       to_date: def_date,
  //       from_date: from_date == "" ? "" : from_date.format("YYYY-MM-DD"),
  //       to_year: year_,
  //       prev_year: prev_year_,
  //       to_quarter: quarter_.split("Q")[1],
  //       prev_quarter: prev_quarter_.split("Q")[1],
  //       type: type_,
  //       indicator_id: indicator_id_,
  //     },
  //     true
  //   )
  // );
  // var divisions_level_data = UI.fetch_data(
  //   "summary_division" + filter_,
  //   $.param(
  //     {
  //       to_date: def_date,
  //       from_date: from_date == "" ? "" : from_date.format("YYYY-MM-DD"),
  //       type: type_,
  //       to_year: year_,
  //       prev_year: prev_year_,
  //       to_quarter: quarter_.split("Q")[1],
  //       prev_quarter: prev_quarter_.split("Q")[1],
  //       indicator_id: indicator_id_,
  //     },
  //     true
  //   )
  // );
  //   console.log(divisions_level_data)
  if (indicator_id_ !== "") {
    var val = url.searchKey["indicator_id"] || "composite_score";
    if (val === "composite_score") $(".back-button").hide();
    var short_name = _.find(indicator_mapping, {
      indicator_id: val,
    }).short_name;
    $("#top-panel").text(short_name.slice(0, 25));
    // $('#top-panel').text(short_name)
  }

  // // DISTRICT DATA - TYPE RANK
  // district_data.top_bottom_52 = order_by_rank(
  //   district_data.top_bottom_52,
  //   "type_index",
  //   "type_rank"
  // );
  // // DISTRICT DATA - INDICATOR RANK
  // district_data.top_bottom_52 = order_by_rank(
  //   district_data.top_bottom_52,
  //   "indicator_index",
  //   "indicator_rank"
  // );
  // // DISTRICT DATA - COMPOSITE RANK
  // district_data.top_bottom_52 = order_by_rank(
  //   district_data.top_bottom_52,
  //   "composite_index",
  //   "comp_rank"
  // );
  // // DIVISION DATA - TYPE RANK
  // divisions_level_data.top_bottom_52 = order_by_rank(
  //   divisions_level_data.top_bottom_52,
  //   "type_index",
  //   "type_rank"
  // );
  // // DIVISION DATA - INDICATOR RANK
  // divisions_level_data.top_bottom_52 = order_by_rank(
  //   divisions_level_data.top_bottom_52,
  //   "indicator_index",
  //   "indicator_rank"
  // );
  // // DIVISION DATA - COMPOSITE RANK
  // divisions_level_data.top_bottom_52 = order_by_rank(
  //   divisions_level_data.top_bottom_52,
  //   "composite_index",
  //   "comp_rank"
  // );
  // // BLOCK DATA - TYPE RANK
  // block_level_data.top_bottom_52 = order_by_rank(
  //   block_level_data.top_bottom_52,
  //   "type_index",
  //   "type_rank"
  // );
  // // BLOCK DATA - INDICATOR RANK
  // block_level_data.top_bottom_52 = order_by_rank(
  //   block_level_data.top_bottom_52,
  //   "indicator_index",
  //   "indicator_rank"
  // );
  // // BLOCK DATA - COMPOSITE RANK
  // block_level_data.top_bottom_52 = order_by_rank(
  //   block_level_data.top_bottom_52,
  //   "composite_index",
  //   "comp_rank"
  // );
  //   console.log(g1.url.parse(location.href), district_data)
  if (toggle == "yes") {
    var divisions_level_data = UI.fetch_data(
      "summary_division" + filter_,
      $.param(
        {
          to_date: def_date,
          from_date: from_date == "" ? "" : from_date.format("YYYY-MM-DD"),
          type: type_,
          to_year: year_,
          prev_year: prev_year_,
          to_quarter: quarter_.split("Q")[1],
          prev_quarter: prev_quarter_.split("Q")[1],
          indicator_id: indicator_id_,
        },
        true
      )
    );
    // DIVISION DATA - TYPE RANK
    divisions_level_data.top_bottom_52 = order_by_rank(
      divisions_level_data.top_bottom_52,
      "type_index",
      "type_rank"
    );
    // DIVISION DATA - INDICATOR RANK
    divisions_level_data.top_bottom_52 = order_by_rank(
      divisions_level_data.top_bottom_52,
      "indicator_index",
      "indicator_rank"
    );
    // DIVISION DATA - COMPOSITE RANK
    divisions_level_data.top_bottom_52 = order_by_rank(
      divisions_level_data.top_bottom_52,
      "composite_index",
      "comp_rank"
    );
    divisions_level_data.top_bottom_52.sort(function compare(a, b) {
      var dateA = new Date(a.date);
      var dateB = new Date(b.date);
      return dateA - dateB;
    });
    draw_trend(
      g1.url.parse(location.href),
      quarter_ != "" ? "quarter" : year_ != "" ? "year" : "date",
      divisions_level_data.top_bottom_52,
      "#trend",
      from_date == "" ? "" : from_date.format("YYYY-MM-DD"),
      def_date,
      toggle
    );
  } else {
    var district_data = UI.fetch_data(
      "summary_overall" + filter_,
      $.param(
        {
          to_date: def_date,
          from_date: from_date == "" ? "" : from_date.format("YYYY-MM-DD"),
          to_year: year_,
          prev_year: prev_year_,
          to_quarter: quarter_.split("Q")[1],
          prev_quarter: prev_quarter_.split("Q")[1],
          type: type_,
          indicator_id: indicator_id_,
        },
        true
      )
    );
    // DISTRICT DATA - TYPE RANK
    district_data.top_bottom_52 = order_by_rank(
      district_data.top_bottom_52,
      "type_index",
      "type_rank"
    );
    // DISTRICT DATA - INDICATOR RANK
    district_data.top_bottom_52 = order_by_rank(
      district_data.top_bottom_52,
      "indicator_index",
      "indicator_rank"
    );
    // DISTRICT DATA - COMPOSITE RANK
    district_data.top_bottom_52 = order_by_rank(
      district_data.top_bottom_52,
      "composite_index",
      "comp_rank"
    );

    district_data.top_bottom_52.sort(function compare(a, b) {
      var dateA = new Date(a.date);
      var dateB = new Date(b.date);
      return dateA - dateB;
    });
    if (slider == "asd" || slider == "hpds") {
      // debugger
      district_data.top_bottom_52 = filter_by_slider(
        slider,
        district_data.top_bottom_52
      );
    }
    draw_trend(
      g1.url.parse(location.href),
      quarter_ != "" ? "quarter" : year_ != "" ? "year" : "date",
      district_data.top_bottom_52,
      "#trend",
      from_date == "" ? "" : from_date.format("YYYY-MM-DD"),
      def_date
    );
  }
  //   map_2({div: divisions_level_data.top_bottom_52, data: district_data.top_bottom_52, block: block_level_data.top_bottom_52 ,url_: "division_level"})

  function filter_by_slider(slider, data) {
    if (slider == "asd") {
      // console.log(_.filter(data, (v) => _.indexOf(aspirational_districts, (v.map_id).toString) > -1))
      return _.filter(
        data,
        (v) => _.indexOf(aspirational_districts, v.map_id.toString()) != -1
      );
    } else {
      return _.filter(data, (v) => _.indexOf(hpds, v.map_id.toString()) != -1);
    }
  }
  $(".loading").hide();
}

// render_map();

$(document)
  .on("click", ".dropdown-arrow", function (event) {
    event.stopPropagation();
    url = g1.url.parse(location.href);
    var selected = url.searchKey["indicator_id"];
    if (selected !== undefined) {
      url.update({ indicator_id: selected }, "indicator_id=del");
    }
    var row = {};
    var key = $(this).attr("data-param");
    row[key] = $(this).attr("data-value");
    url.update(row);
    window.history.pushState({}, "", url.toString());
    $(".back-button").show();
    // render_map();
    $(".loading").show();
    setTimeout(render_map, 500);
  })
  .on("click", ".dropdown-value", function () {
    url = g1.url.parse(location.href);
    var key = "indicator_id";
    var value = $(this).attr("data-value");
    var row = {};
    row[key] = value;
    url.update(row);
    window.history.pushState({}, "", url.toString());
    $(".back-button").show();
    $(".map_composite_drop").removeClass("bg-secondary");
    $("." + value).addClass("bg-secondary");
    // render_map();
    $(".loading").show();
    setTimeout(render_map, 500);
  })
  .on("click", ".dropdown .dropdown-item", function () {
    var bla = $(this).text().trim();
    // debugger
    $("#dropdownMenuButton").text(bla);
    var id = $(this).attr("id").split("_")[0];
    var toggle = url.searchKey.toggle !== undefined ? url.searchKey.toggle : "";
    if (toggle == "yes") url.update({ division_level: id });
    else url.update({ district_level: id });
    window.history.pushState({}, "", url.toString());
    // render_map();
    $(".loading").show();
    setTimeout(render_map, 500);
  })
  .on("change", ".map1", function () {
    $(".breadcrumb").empty();
    $("#dropdownMenuButton").text("Uttar Pradesh");
    // url_checked = g1.url.parse(location.href);
    // var toggle_value =
    //   url_checked.searchList["toggle"] === undefined
    //     ? "no"
    //     : url_checked.searchList["toggle"][0];
    // count = toggle_value == "no" ? 25 : 6;
    // console.log(count)
    // $("#id_legend_circle").template({ count: count });
    // Slider toggle code
    $("#double-label-slider").slider("option", "value", 0);
    if ($(this).prop("checked")) {
      $(".mapid").hide();
      $(".mapid2").show();
      $("#double-label-slider").hide();
      url_update({
        district: null,
        division: null,
        district_level: null,
        division_level: user_data.division ? user_data.map_id : null,
        slider: null,
        toggle: "yes",
      });
      $("#dropdownMenuButton").text(user_data.division || "Uttar Pradesh");
    } else {
      $(".mapid2").hide();
      $(".mapid").show();
      $("#double-label-slider").show();
      url_update({
        district: null,
        division: null,
        district_level: user_data.district ? user_data.map_id : null,
        division_level: null,
        toggle: null,
        slider: null,
      });
      $("#dropdownMenuButton").text(user_data.district || "Uttar Pradesh");
    }

    if (user_data.division || user_data.district) {
      $("#double-label-slider").hide();
    }
    render_dropdownlist();
    // render_map();
    $(".loading").show();
    setTimeout(render_map, 500);
  });
