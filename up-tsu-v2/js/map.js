/* global defaults, UI, url_update, return_url, indicator_mapping, map_dropdown_indicators_14, district_name_mapping, user_data, div_dis_map, get_latest_date */
/* exported map:true*/
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
var data_map_dist = defaults.data_map_dist;
// calculate RANK (index_rank,type_rank, composite rank) for computing color metric for district, division, block data
function order_by_rank(data, index_metric, rank_metric) {
  // sorts the array by specified metric and computes the rank
  data = _.orderBy(data, index_metric, "desc");
  _.each(data, function (d, i) {
    d[rank_metric] = i;
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
  let url_div = url.searchKey.division;
  let url_dist = url.searchKey.district;
  let toggle = url.searchKey.toggle;
  if (user_map_id && !url_div && !url_dist && !toggle) {
    if (user_data.district) {
      $("#map-section").prop("checked", false);
      $("#dropdownMenuButton").text(user_data.district);
      $("#double-label-slider").hide();
      url_update({
        district: user_map_id + "_layer",
        division: null,
        toggle: "no",
        slider: "all",
      });
    } else if (user_data.division) {
      $("#dropdownMenuButton").text(user_data.division);
      $("#map-section").prop("checked", true);
      $("#double-label-slider").hide();
      url_update({
        district: null,
        division: user_map_id + "_layer",
        toggle: "yes",
        slider: null,
      });
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

// Sets opacity for Aspirational, HPD toggle
function opacity_iterate_sublayers(self, layer, ref_list) {
  self.gLayers[layer].eachLayer(function (sublayer) {
    // DISTRICT ID
    // sublayer.feature.properties.Id
    sublayer.setStyle({ fillOpacity: 0.1 });
    if (
      _.includes(ref_list, sublayer.feature.properties.Id.toString()) == true ||
      ref_list === undefined
    ) {
      sublayer.setStyle({ fillOpacity: 1 });
      sublayer.openTooltip();
    } else {
      sublayer.closeTooltip();
    }
  });
}

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
        // if (!event.originalEvent) return;
        if (ui.value === 0) {
          url_update({ slider: "all" });
        } else if (ui.value === 1) {
          url_update({ slider: "asd" });
        } else {
          url_update({ slider: "hpds" });
        }

        var self = map_updivisions;
        var layer = "indiaGeojson";
        var url_checked = g1.url.parse(location.href);
        if (
          map_updivisions.current_level == 0 &&
          url_checked.searchList["toggle"] != "yes"
        ) {
          $("#double-label-slider").show();
          if (g1.url.parse(location.href).searchKey.slider === "asd") {
            // Iterates through sub layer and toggles the tooltip
            opacity_iterate_sublayers(self, layer, aspirational_districts);
          } //end of if ASD
          else if (g1.url.parse(location.href).searchKey.slider === "hpds") {
            // Iterates through sub layer and toggles the tooltip
            opacity_iterate_sublayers(self, layer, hpds);
          } //end of if HPDS
          else {
            opacity_iterate_sublayers(self, layer);
          }
        } // end of if 1
        // else {
        //   $("#double-label-slider").hide();
        // }
        render_dropdownlist();
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

var map_updivisions;
let map_ = function (data) {
  url = g1.url.parse(location.href);
  var def = "comp_rank";
  var index_metric = "composite_index";
  if (!_.includes([undefined, ""], url.searchKey.indicator_id)) {
    def = "indicator_rank";
    index_metric = "indicator_index";
  }

  map_updivisions = g1.mapviewer({
    id: "mapid",
    map: {
      zoomDelta: 1,
      attributionControl: false,
      zoomSnap: 0.1,
      doubleClickZoom: false,
    },
    layers: {
      // worldMap: { type: 'tile', url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' },
      indiaGeojson: {
        type: "geojson",
        url: data.url_,
        link: {
          data: data.data, // Load data from this file
          dataKey: "map_id", // Join this column from the URL (data)
          mapKey: "Id", // with this property in the GeoJSON
        },
        options: {
          style: {
            fillOpacity: 1,
            color: "black",
            weight: 0.3,
            fillColor: "#dee",
            data_val: data.url_,
          },
        },
        attrs: {
          fillColor: {
            // Fill the regions
            metric: function (d) {
              return d[def];
            },
            scale: "quantile",
            domain: [0, data.data.length],
            range: ["#098641", "#FF8E04", "#C5141D"],
          },
        },
        tooltip: function (d) {
          return _.includes(Object.keys(district_name_mapping), d["DT_NAME"])
            ? district_name_mapping[d["DT_NAME"]]
            : d["DT_NAME"];
        },
        tooltipOptions: {
          direction: function (args) {
            return args.centerPoint[1] > args.tooltipPoint.x[1]
              ? "top"
              : "bottom";
          },
          className: "labelstyle",
          permanent: true,
        },
      },
    },
    drilldown: {
      rootLayer: "indiaGeojson",
      levels: [
        {
          layerName: function (props) {
            return props["Id"] + "_layer";
          },
          layerOptions: {
            url: function (props) {
              url_update({ district: props["Id"] + "_layer" });
              $("#dropdownMenuButton").text(
                $("#" + props["Id"] + "_layer").text()
              );
              $(".breadcrumb").empty();
              // $('.breadcrumb').html('<li class="breadcrumb-item">'+props.DT_NAME+'</li>')
              $(".breadcrumb").html(
                '<li class="breadcrumb-item">' +
                  (_.includes(Object.keys(district_name_mapping), props.DT_NAME)
                    ? district_name_mapping[props.DT_NAME]
                    : props.DT_NAME) +
                  "</li>"
              );
              var mapjson = UI.fetch_data("block_level", {});
              mapjson.features = _.filter(mapjson.features, function (d) {
                return d.properties.DT_CODE === props.DT_CODE;
              });
              return mapjson;
            },
            type: "geojson",
            link: {
              data: function (props) {
                var source = data.block;
                var district_ =
                  data_map_dist[props.DT_NAME] === undefined
                    ? props.DT_NAME
                    : data_map_dist[props.DT_NAME];
                var temp = _.filter(source, { district: district_ });
                temp = order_by_rank(temp, index_metric, def);
                sessionStorage["map1_block_domain"] = temp.length;
                return temp;
              },
              mapKey: "Id", // with this property in the GeoJSON
              dataKey: "map_id", // Join this column from the URL (data)
            },
            options: {
              style: {
                fillOpacity: 1,
                color: "black",
                weight: 0.3,
                fillColor: "#dee",
              },
            },
            attrs: {
              fillColor: {
                metric: function (d) {
                  return d[def];
                },
                scale: "quantile",
                // Commenting domain at drilldown level to ensure color code issue is resolved
                // domain : [1, parseInt(sessionStorage['map1_block_domain'])],
                range: ["#098641", "#FF8E04", "#C5141D"],
              },
            },
            tooltip: function (d) {
              return d["block"];
            },
            tooltipOptions: {
              direction: function (args) {
                return args.centerPoint[1] > args.tooltipPoint.x[1]
                  ? "top"
                  : "bottom";
              },
              className: "labelstyle",
              permanent: true,
            },
          },
        },
      ],
    },
  });
};

var map_updivisions2;
let map_2 = function (data) {
  url = g1.url.parse(location.href);
  var def = "comp_rank";
  var index_metric = "composite_index";
  if (!_.includes([undefined, ""], url.searchKey.indicator_id)) {
    def = "indicator_rank";
    index_metric = "indicator_index";
  }

  map_updivisions2 = g1.mapviewer({
    id: "mapid2",
    map: {
      attributionControl: false,
      zoomSnap: 0.1,
      doubleClickZoom: false,
    },
    layers: {
      indiaGeojson2: {
        type: "geojson",
        url: data.url_,
        link: {
          data: data.div, // Load data from this file
          dataKey: "div_map_id", // Join this column from the URL (data)
          mapKey: "Id", // with this property in the GeoJSON
        },
        options: {
          style: {
            fillOpacity: 1,
            color: "black",
            weight: 0.2,
            fillColor: "#dee",
          },
        },
        attrs: {
          fillColor: {
            metric: function (d) {
              return d[def];
            },
            scale: "quantile",
            domain: [0, data.div.length],
            range: ["#098641", "#FF8E04", "#C5141D"],
          },
        },
        tooltip: function (d) {
          return _.includes(Object.keys(district_name_mapping), d["DIVISION"])
            ? district_name_mapping[d["DIVISION"]]
            : d["DIVISION"];
        },
        tooltipOptions: {
          direction: function (args) {
            return args.centerPoint[1] > args.tooltipPoint.x[1]
              ? "top"
              : "bottom";
          },
          className: "labelstyle",
          permanent: true,
        },
      },
    },
    drilldown: {
      rootLayer: "indiaGeojson2",
      levels: [
        {
          layerName: function (props) {
            return props["Id"] + "_layer";
          },
          layerOptions: {
            url: function (props) {
              url_update({ division: props["Id"] + "_layer" });
              $("#dropdownMenuButton").text(
                $("#" + props["Id"] + "_layer").text()
              );
              $(".breadcrumb").empty();
              $(".breadcrumb").html(
                '<li class="breadcrumb-item">' +
                  (_.includes(
                    Object.keys(district_name_mapping),
                    props.DIVISION
                  )
                    ? district_name_mapping[props.DIVISION]
                    : props.DIVISION) +
                  "</li>"
              );
              // $('.breadcrumb').html('<li class="breadcrumb-item">'+props.DIVISION+'</li>')
              var mapjson = UI.fetch_data("district_level", {});
              var district_id_list = [];
              mapjson.features = _.filter(mapjson.features, function (d) {
                if (d.properties.DIVISIONID === props.Id) {
                  district_id_list.push(d.properties.Id);
                }
                return d.properties.DIVISIONID === props.Id;
              });
              sessionStorage["s_district_id_list"] =
                JSON.stringify(district_id_list);
              return mapjson;
            },
            type: "geojson",
            link: {
              data: function () {
                var source = data.data;
                var district_id_list = JSON.parse(
                  sessionStorage["s_district_id_list"]
                );
                var temp = [];
                _.each(district_id_list, function (dis_id) {
                  temp.push(_.filter(source, { map_id: dis_id })[0]);
                });
                temp = order_by_rank(temp, index_metric, def);
                sessionStorage["map2_district_domain"] = temp.length;
                return temp;
              },
              mapKey: "Id", // with this property in the GeoJSON
              dataKey: "map_id", // Join this column from the URL (data)
            },
            options: {
              style: {
                fillOpacity: 1,
                color: "black",
                weight: 0.2,
                fillColor: "#dee",
              },
            },
            attrs: {
              fillColor: {
                metric: function (d) {
                  return d[def];
                },
                scale: "quantile",
                // Commenting domain at drilldown level to ensure color code issue is resolved
                // domain: [0, sessionStorage['map2_district_domain']],
                range: ["#098641", "#FF8E04", "#C5141D"],
              },
            },
            tooltip: function (d) {
              return _.includes(
                Object.keys(district_name_mapping),
                d["district"]
              )
                ? district_name_mapping[d["district"]]
                : d["district"];
            },
            tooltipOptions: {
              direction: function (args) {
                return args.centerPoint[1] > args.tooltipPoint.x[1]
                  ? "top"
                  : "bottom";
              },
              className: "labelstyle",
              permanent: true,
            },
          },
        },
        {
          layerName: function (props) {
            return props["Id"] + "_layer1";
          },
          layerOptions: {
            url: function (props) {
              url_update({ district: props["Id"] + "_layer" });
              var bla = $(".breadcrumb li").eq(0).text();
              $(".breadcrumb").empty();
              $(".breadcrumb").html(
                '<li class="breadcrumb-item">' +
                  (_.includes(Object.keys(district_name_mapping), bla)
                    ? district_name_mapping[bla]
                    : bla) +
                  '</li><li class="breadcrumb-item">' +
                  (_.includes(Object.keys(district_name_mapping), props.DT_NAME)
                    ? district_name_mapping[props.DT_NAME]
                    : props.DT_NAME) +
                  "</li>"
              );
              // $('.breadcrumb').html('<li class="breadcrumb-item">'+bla+'</li><li class="breadcrumb-item">'+props.DT_NAME+'</li>')
              var mapjson = UI.fetch_data("block_level", {});
              mapjson.features = _.filter(mapjson.features, function (d) {
                return d.properties.DT_CODE === props.DT_CODE;
              });
              return mapjson;
            },
            type: "geojson",
            link: {
              data: function (props) {
                var source = data.block;
                var temp = _.filter(source, { district: props.DT_NAME });
                temp = order_by_rank(temp, index_metric, def);
                sessionStorage["map2_block_domain"] = temp.length;
                return temp;
              },

              mapKey: "Id", // with this property in the GeoJSON
              dataKey: "map_id", // Join this column from the URL (data)
            },
            options: {
              style: {
                fillOpacity: 1,
                color: "black",
                weight: 0.2,
                fillColor: "#dee",
              },
            },
            attrs: {
              fillColor: {
                metric: function (d) {
                  return d[def];
                },
                scale: "quantile",
                // Commenting domain at drilldown level to ensure color code issue is resolved
                // domain: [0, sessionStorage['map2_block_domain']],
                range: ["#098641", "#FF8E04", "#C5141D"],
              },
            },
            tooltip: function (d) {
              return d["block"];
            },
            tooltipOptions: {
              direction: function (args) {
                return args.centerPoint[1] > args.tooltipPoint.x[1]
                  ? "top"
                  : "bottom";
              },
              className: "labelstyle",
              permanent: true,
            },
          },
        },
      ],
    },
  });
};

$("._dropdown")
  .on("template", function () {
    var val = url.searchKey["indicator_id"] || "composite_score";
    if (val === "composite_score") $(".back-button").hide();
    var short_name = _.find(indicator_mapping, {
      indicator_id: val,
    }).short_name;
    // $('#top-panel').text(short_name)
    $("#top-panel").text(short_name.slice(0, 25));
  })
  .template({
    overall: "Composite Score",
    map_dropdown_indicators_14: map_dropdown_indicators_14,
    filter: "type",
    param: "indicator_id",
  });

function render_map() {
  // Called only once on page load
  $(".calendar_cc").show();
  $(".loading").show();
  $(".mapid").show();
  $(".mapid2").show();
  $("#indicator-top-bar").hide();
  $("#collapsemain").removeClass("show");
  $("#top-panel").addClass("collapsed");
  $("#deepdive-container").show();
  $("#top-panel").html("Composite Score");
  url = g1.url.parse(location.href);
  // var def_date = "2023-01-01";
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
  var type_ = "";
  var indicator_id_ =
    url.searchKey.indicator_id !== undefined
      ? url.searchKey.indicator_id.split("_")[1]
      : "";
  var district_data = UI.fetch_data(
    "summary_overall" + filter_,
    $.param(
      {
        date: def_date,
        to_year: year_,
        from_year: prev_year_,
        to_quarter: quarter_.split("Q")[1],
        from_quarter: prev_quarter_.split("Q")[1],
        type: type_,
        indicator_id: indicator_id_,
      },
      true
    )
  );
  var block_level_data = UI.fetch_data(
    "summary_form" + filter_,
    $.param(
      {
        date: def_date,
        to_year: year_,
        from_year: prev_year_,
        to_quarter: quarter_.split("Q")[1],
        from_quarter: prev_quarter_.split("Q")[1],
        type: type_,
        indicator_id: indicator_id_,
      },
      true
    )
  );
  var divisions_level_data = UI.fetch_data(
    "summary_division" + filter_,
    $.param(
      {
        date: def_date,
        type: type_,
        to_year: year_,
        from_year: prev_year_,
        to_quarter: quarter_.split("Q")[1],
        from_quarter: prev_quarter_.split("Q")[1],
        indicator_id: indicator_id_,
      },
      true
    )
  );

  if (indicator_id_ !== "") {
    var val = url.searchKey["indicator_id"] || "composite_score";
    if (val === "composite_score") $(".back-button").hide();
    var short_name = _.find(indicator_mapping, {
      indicator_id: val,
    }).short_name;
    $("#top-panel").text(short_name.slice(0, 25));
    // $('#top-panel').text(short_name)
  }

  if (map_updivisions !== undefined) {
    map_updivisions.map.remove();
    map_updivisions2.map.remove();
    $("#mapid").html("");
    $("#mapid2").html("");
  }

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
  // BLOCK DATA - TYPE RANK
  block_level_data.top_bottom_52 = order_by_rank(
    block_level_data.top_bottom_52,
    "type_index",
    "type_rank"
  );
  // BLOCK DATA - INDICATOR RANK
  block_level_data.top_bottom_52 = order_by_rank(
    block_level_data.top_bottom_52,
    "indicator_index",
    "indicator_rank"
  );
  // BLOCK DATA - COMPOSITE RANK
  block_level_data.top_bottom_52 = order_by_rank(
    block_level_data.top_bottom_52,
    "composite_index",
    "comp_rank"
  );

  map_2({
    div: divisions_level_data.top_bottom_52,
    data: district_data.top_bottom_52,
    block: block_level_data.top_bottom_52,
    url_: "division_level",
  });
  map_({
    data: district_data.top_bottom_52,
    block: block_level_data.top_bottom_52,
    url_: "district_level",
  });

  // MAP 1: Adds Map control icons
  $(".mapid .leaflet-control-zoom-in")
    .removeAttr("href")
    .addClass("cursor-pointer");
  $(".mapid .leaflet-control-zoom-out")
    .removeAttr("href")
    .addClass("cursor-pointer");
  $(".mapid .leaflet-control-zoom").append(
    '<a class="leaflet-control-zoom-reset" href="#" title="Zoom reset" role="button" aria-label="Zoom out"><i class="fa fa-undo fa-lg"></i></a>'
  );
  $(".mapid .leaflet-control-zoom").append(
    '<a class="leaflet-control-zoom-home" href="./" title="Home" role="button" aria-label="Zoom out"><img src="img/home.png" alt="home"></img></a>'
  );
  $(".mapid .leaflet-control-zoom").append(
    '<a class="leaflet-control-zoom-tooltip" href="./" title="Tooltips" role="button" aria-label="tooltip"><i class="fa fa-tumblr fa-lg"></i></a>'
  );

  // MAP 2: Adds Map control icons
  $(".mapid2 .leaflet-control-zoom-in")
    .removeAttr("href")
    .addClass("cursor-pointer");
  $(".mapid2 .leaflet-control-zoom-out")
    .removeAttr("href")
    .addClass("cursor-pointer");
  $(".mapid2 .leaflet-control-zoom").append(
    '<a class="leaflet-control-zoom-reset" href="#" title="Zoom reset" role="button" aria-label="Zoom out"><i class="fa fa-undo fa-lg"></i></a>'
  );
  $(".mapid2 .leaflet-control-zoom").append(
    '<a class="leaflet-control-zoom-home" href="./" title="Zoom reset" role="button" aria-label="Zoom out"><img src="img/home.png" alt="home"></img></a>'
  );
  $(".mapid2 .leaflet-control-zoom").append(
    '<a class="leaflet-control-zoom-tooltip" href="./" title="Tooltips" role="button" aria-label="tooltip"><i class="fa fa-tumblr fa-lg"></i></a>'
  );

  // Map 1: Reset icon click event
  $(".mapid .leaflet-control-zoom-reset").on("click", function (evt) {
    if (evt.originalEvent) {
      $("#double-label-slider").slider({ value: 0 });
    }
    evt.preventDefault();
    if (map_updivisions.drilldown_stack.length !== 0) {
      $(".breadcrumb li")
        .eq($(".breadcrumb li").length - 1)
        .remove();
      url_update({ district: null });
      $("#dropdownMenuButton").text("Uttar Pradesh");
      map_updivisions.drillup();
      // $("#double-label-slider").slider({ value: 0 });
      $("#double-label-slider").show();
    }
  });

  // Map 2: Reset icon click event
  $(".mapid2 .leaflet-control-zoom-reset").on("click", function (evt) {
    evt.preventDefault();
    if (map_updivisions2.drilldown_stack.length !== 0) {
      url_update({ division: null });
      $("#dropdownMenuButton").text("Uttar Pradesh");
      $(".breadcrumb li")
        .eq($(".breadcrumb li").length - 1)
        .remove();
      map_updivisions2.drillup();
      map_updivisions2.drillup();
    }
    var self = map_updivisions2;
    var layer = "indiaGeojson2";
    opacity_iterate_sublayers(self, layer);
  });

  // Iterates through sublayers and toggles the tooltip state
  function iterate_sublayers(self, layer) {
    var isAtleastOneTooltipOpen = false;

    self.gLayers[layer].eachLayer(function (sublayer) {
      if (sublayer.isTooltipOpen()) {
        isAtleastOneTooltipOpen = true;
      }
    });

    self.gLayers[layer].eachLayer(function (sublayer) {
      if (isAtleastOneTooltipOpen) {
        sublayer.closeTooltip();
      } else {
        sublayer.openTooltip();
      }
    });
  }

  // MAP 1: LEVEL 0, 1: Hides/Shows tooltip sublayers when T icon is clicked
  // map_updivisions.on('layersloaded', function() {
  $(".mapid .leaflet-control-zoom-tooltip").on("click", function (evt) {
    evt.preventDefault();
    var self = map_updivisions;
    var layer = "indiaGeojson";
    var url = g1.url.parse(location.href);
    if (map_updivisions.current_level == 1) {
      layer = url.searchKey.district;
      iterate_sublayers(self, layer);
    } // end of if
    else {
      // Iterates through parent layer and toggles the tooltip
      iterate_sublayers(self, layer);
    }
  }); // zoom event end
  // })

  // MAP 2: LEVEL 0, 1, 2: Hides/Shows tooltip sublayers when T icon is clicked
  // map_updivisions2.on('layersloaded', function() {
  $(".mapid2 .leaflet-control-zoom-tooltip").on("click", function (evt) {
    evt.preventDefault();
    var self = map_updivisions2;
    var layer = "indiaGeojson2";
    var url = g1.url.parse(location.href);
    if (map_updivisions2.current_level == 1) {
      layer = url.searchKey.division;
      iterate_sublayers(self, layer);
    } // end of if
    else if (map_updivisions2.current_level == 2) {
      layer = url.searchKey.district + "1";
      iterate_sublayers(self, layer);
    } // end of if
    else {
      // Iterates through parent layer and toggles the tooltip
      iterate_sublayers(self, layer);
    }
  }); // zoom event end
  // })

  // MAP 1: District level - event to handle show/hide SLIDER toggle everytime MAP 1 is loaded
  // map_updivisions.on("layersloaded", function () {
  //   if (map_updivisions.current_level == 0) {
  //     $("#double-label-slider").show();
  //   } else {
  //     $("#double-label-slider").hide();
  //   }
  // });

  // MAP 2: DIVISION level - event to always hide SLIDER toggle everytime MAP 2 is loaded
  // map_updivisions2.on("layersloaded", function () {
  //   $("#double-label-slider").hide();
  // });

  setTimeout(function () {
    if ($(".map1").prop("checked")) {
      $(".mapid").hide();
      $("#double-label-slider").hide();
    } else {
      $(".mapid2").hide();
      $("#double-label-slider").show();
    }
    $(".loading").hide();
  }, 1000);
  layer_click();
}

function layer_click() {
  url = g1.url.parse(location.href);
  if ($(".map1").prop("checked")) {
    $(".mapid2").show();
    if (!_.includes([undefined, ""], url.searchKey.division)) {
      map_updivisions2.on("indiaGeojson2loaded", function () {
        map_updivisions2.off("indiaGeojson2loaded");
        map_updivisions2.current_level = 0;
        map_updivisions2.drilldown_recursive("indiaGeojson2");
        map_updivisions2.gLayers["indiaGeojson2"].eachLayer(function (
          sublayer
        ) {
          if (
            sublayer.feature.properties.Id ===
            _.toInteger(_.split(url.searchKey.division, "_")[0])
          ) {
            sublayer.fire("click");
          }
        });
      });
    }
  } else {
    $(".mapid").show();
    if (!_.includes([undefined, ""], url.searchKey.district)) {
      map_updivisions.on("indiaGeojsonloaded", function () {
        map_updivisions.off("indiaGeojsonloaded");
        map_updivisions.current_level = 0;
        map_updivisions.drilldown_recursive("indiaGeojson");
        map_updivisions.gLayers["indiaGeojson"].eachLayer(function (sublayer) {
          if (
            sublayer.feature.properties.Id ===
            _.toInteger(_.split(url.searchKey.district, "_")[0])
          ) {
            sublayer.fire("click");
          }
        });
      });
    }
  }
}

// render_map();

$(document)
  // District/Division toggle
  .on("change", ".map1", function () {
    url_checked = g1.url.parse(location.href);
    var toggle_value =
      url_checked.searchList["toggle"] === undefined
        ? "no"
        : url_checked.searchList["toggle"][0];
    count = toggle_value == "no" ? 25 : 6;
    // console.log(count)
    $("#id_legend_circle").template({ count: count });

    // Slider toggle code
    if (toggle_value == "yes") {
      $("#double-label-slider").hide();
      url_update({
        district: null,
        division: user_data.division ? user_data.map_id + "_layer" : null,
        slider: null,
      });
      $("#dropdownMenuButton").text(user_data.division || "Uttar Pradesh");
      $(".mapid2 .leaflet-control-zoom-reset").click();
    } else {
      $("#double-label-slider").show();
      url_update({
        district: user_data.district ? user_data.map_id + "_layer" : null,
        division: null,
        slider: null,
      });
      $(".mapid .leaflet-control-zoom-reset").click();
      $("#dropdownMenuButton").text(user_data.district || "Uttar Pradesh");
    }
    $("#double-label-slider").slider("option", "value", 0);
    if (user_data.division || user_data.district) {
      $("#double-label-slider").hide();
    }
    render_dropdownlist();
    render_map();
  })
  .on("click", ".dropdown-default", function () {
    url = g1.url.parse(location.href);
    url.update({ indicator_id: null });

    var selected = url.searchKey["district"];
    if (selected !== undefined) {
      url.update({ district: selected }, "district=del");
    }
    selected = url.searchKey["division"];
    if (selected !== undefined) {
      url.update({ division: selected }, "division=del");
    }
    window.history.pushState({}, "", url.toString());
    $(".back-button").hide();
    $(".map_composite_drop").removeClass("bg-secondary");
    $(".dropdown-default").addClass("bg-secondary");
    render_map();
  })
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
    render_map();
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
    render_map();
  })
  .on("click", ".back-button", function () {
    if (_.includes(g1.url.parse(location.href).relative, "#")) {
      history.go(-2);
      setTimeout(function () {
        render_map();
      }, 1000);
    } else {
      $.when(history.back()).then(function () {
        url = g1.url.parse(location.href);
        setTimeout(function () {
          render_map();
        }, 1000);
      });
    }
  })

  // Click event for color legend
  .on("click", ".legend_color", function () {
    var color = $(this).find("span").attr("id");
    url = g1.url.parse(location.href);
    var toggle_value =
      url.searchList["toggle"] === undefined
        ? "no"
        : url.searchList["toggle"][0];

    if (toggle_value != "yes") {
      var self = map_updivisions;
      var layer = "indiaGeojson";

      // Map 1: BLOCK -  Drill down layer name
      if (self.current_level == 1) {
        layer = url.searchKey.district;
      }
    } else {
      self = map_updivisions2;
      layer = "indiaGeojson2";

      // Map 2: DISTRICT -  Drill down layer name
      if (self.current_level == 1) {
        layer = url.searchKey.division;
      }
      // Map 2: BLOCK -  Drill down layer name
      if (self.current_level == 2) {
        layer = url.searchKey.district + "1";
      }
    }
    // Iterates through sublayers and retains the matching color
    self.gLayers[layer].eachLayer(function (sublayer) {
      sublayer.setStyle({ fillOpacity: 0.1 });
      if (sublayer.options.fillColor == color) {
        sublayer.setStyle({ fillOpacity: 1 });
        sublayer.openTooltip();
      } else {
        sublayer.closeTooltip();
      }
    });
  });
