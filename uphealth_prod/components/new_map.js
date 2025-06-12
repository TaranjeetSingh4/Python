/*global L, type_, gbl_district_name_mapping, indicator_mapping, g1, aspirational_districts, hpds*/
/*exported render_map*/
var map;
function render_map(url, data_map) {
  $(".example").popover();
  if (map != undefined || map != null) {
    map.remove();
    map = undefined;
    $("#mapid").html("");
  }
  map = L.map("mapid", {
    attributionControl: false,
    zoomControl: false,
    zoomSnap: 0.1,
  });
  map.doubleClickZoom.disable();
  map.dragging.disable();
  // state level data_map
  var dist_ = "Agra";
  if (_.includes([undefined, "Uttar Pradesh", ""], url.searchKey.district)) {
    dist_ = "lucknow";
  }
  var first_dist = data_map.length > 0 ? data_map[0].district : "Agra";
  var second_dist = data_map.length > 1 ? data_map[1].district : dist_;
  if (_.includes([undefined, "Uttar Pradesh", ""], url.searchKey.district)) {
    if (
      url.searchKey.check == "yes" &&
      _.includes(["", undefined], url.searchKey.district)
    ) {
      // var mapjson;
      if (!_.includes(["", undefined], url.searchKey.division)) {
        $.getJSON("district_level", function (data) {
          data.features = _.filter(data.features, function (d) {
            var filter_ = url.searchKey.division_level;
            return d.properties.DIVISIONID == parseInt(filter_);
          });
          addLayersToMap(data);
        });
      } else {
        $.getJSON("division_level", function (data) {
          addLayersToMap(data);
        });
      }
    } else {
      $.getJSON("district_level", function (data) {
        addLayersToMap(data);
      });
    }
  } else {
    $.getJSON("block_level", function (data) {
      data.objects["up-districts"].geometries = _.filter(
        data.objects["up-districts"].geometries,
        function (d) {
          // data.features = _.filter(data.features, function (d) {
          var data_map = {
            "C S M Nagar": "C.S.M. Nagar",
            Amethi: "C.S.M. Nagar",
            Amroha: "Jyotiba Phule Nagar",
            Bagpat: "Baghpat",
            Kasganj: "Kanshiram Nagar",
            Hathras: "Mahamaya Nagar",
            Bhadohi: "Sant Ravidas Nagar (Bhadohi)",
            "Sant Ravidas Nagar Bhadohi": "Sant Ravidas Nagar (Bhadohi)",
            Unnav: "Unnao",
            "Lakhimpur Kheri": "Kheri",
            Maharajganj: "Mahrajganj",
            "Siddharth Nagar": "Siddharthnagar",
            Bulandshahar: "Bulandshahr",
            Maunathbhanjan: "Mau",
            Barabanki: "Bara Banki",
          };
          var filter_;
          if (
            _.includes(
              ["executive-summary", "executive-summary-capture"],
              url.file
            )
          ) {
            if ((!_.includes[("", undefined)], url.searchKey.district)) {
              filter_ =
                data_map[url.searchKey.district] === undefined
                  ? _.toLower(url.searchKey.district)
                  : _.toLower(data_map[url.searchKey.district]);
            }
            return _.toLower(d.properties.DT_Name) == filter_;
          } else {
            filter_ = url.searchKey.district_level;
            return _.toLower(d.properties.DT_CODE) == filter_;
          }
        }
      );
      if (url.file == "amethi_map") {
        data.objects["up-districts"].geometries = _.filter(
          data.objects["up-districts"].geometries,
          function (d) {
            return !_.includes([320, 321, 322], d.properties.Id);
          }
        );
      }
      addLayersToMap(data);
    });
  }
  function addLayersToMap(mapjson) {
    // $('.loading-icon').hide()
    var layer;
    if (layer) map.removeLayer(layer);
    // mapjson.features = _.filter(mapjson.features, function(d){return d.properties.DT_Name == "Agra"})
    layer = new L.TopoJSON(mapjson, {
      style: function (feature) {
        var name_ =
          url.searchKey.district == undefined || first_dist !== second_dist
            ? "Id"
            : "Id";
        return {
          fillColor: color_(url, feature.properties[name_], name_, data_map),
          fillOpacity: 1,
          color: "#dcc",
          weight: 0.7,
          opacity: 0.7,
        };
      },
    });
    layer.addTo(map);
    map.fitBounds(layer.getBounds());
    $("#mapid").find(".leaflet-map-pane").show();
    layer.eachLayer(function (sublayer) {
      var tool_tip =
        url.searchKey.check === "yes" &&
        _.includes([undefined, ""], url.searchKey.division)
          ? "DIVISION"
          : "DT_NAME";
      if (!_.includes([undefined, ""], url.searchKey.district)) {
        tool_tip = "BLOCK_NAME";
        var val_ = "";
        _.each(data_map, function (d) {
          if (sublayer.feature.properties.Id === d.map_id) {
            val_ = _.toString(d.count);
          }
        });
        var my_icon2 = L.divIcon({
          className: "current-location-icon2",
          html:
            '<span class="label_text text-black ' +
            sublayer.feature.properties.Id +
            '">' +
            sublayer.feature.properties.BLOCK_NAME +
            "</span>",
          iconAnchor: [0, 0],
          iconSize: null,
          popupAnchor: [0, 0],
        });
        L.marker([sublayer.getCenter().lat, sublayer.getCenter().lng], {
          radius: 5,
          icon: my_icon2,
          color: "blue",
          opacity: 1,
          fillColor: "blue",
          fillOpacity: 0.4,
          className: "map_circle2",
        }).addTo(map);
        if (val_ !== "") {
          var my_icon = L.divIcon({
            className: "current-location-icon",
            html:
              '<span class="p-2 badge-pill bg-primary text-white" id=' +
              sublayer.feature.properties.Id +
              ">" +
              val_ +
              "</span>",
            iconAnchor: [0, 0],
            iconSize: null,
            popupAnchor: [0, 0],
          });
          L.marker([sublayer.getCenter().lat, sublayer.getCenter().lng], {
            radius: 5,
            icon: my_icon,
            color: "blue",
            opacity: 1,
            fillColor: "blue",
            fillOpacity: 0.4,
            className: "map_circle",
          }).addTo(map);
        }
        $(".view_facility").show();
      } else {
        var text_ =
          sublayer.feature.properties.DT_NAME ||
          sublayer.feature.properties.DIVISION;
        if (_.includes(Object.keys(gbl_district_name_mapping), text_))
          text_ = gbl_district_name_mapping[text_];
        var my_icon1 = L.divIcon({
          className: "current-location-icon1",
          html:
            '<span class="label_text text-black ' +
            sublayer.feature.properties.Id +
            '" id=' +
            sublayer.feature.properties.Id +
            ">" +
            text_ +
            "</span>",
          iconAnchor: [0, 0],
          iconSize: null,
          popupAnchor: [0, 0],
        });
        L.marker([sublayer.getCenter().lat, sublayer.getCenter().lng], {
          radius: 10,
          icon: my_icon1,
          color: "blue",
          opacity: 1,
          fillColor: "blue",
          fillOpacity: 0.4,
          className: "map_circle1",
        }).addTo(map);
      }
      sublayer.setStyle({
        className: "layer_interactive",
        dashArray:
          sublayer.feature.properties.Id +
          "_" +
          _.startCase(sublayer.feature.properties[tool_tip]),
        color: "black",
      });
      var list_ = _.filter(data_map, function (d) {
        return d.map_id == sublayer.feature.properties.Id;
      });
      var def = "composite_index";
      if (
        (!_.includes([undefined, ""], url.searchKey.type) &&
          !_.includes([undefined, ""], url.searchKey.indicator_id)) ||
        (_.includes([undefined, ""], url.searchKey.type) &&
          _.includes([undefined, ""], url.searchKey.domain) &&
          !_.includes([undefined, ""], url.searchKey.indicator_id))
      ) {
        def = "indicator_index";
      }
      var score = list_.length !== 0 ? _.round(list_[0][def], 2) : "";
      var score_per;
      var tooltip_name;
      if (_.includes(["indicator_12"], url.searchKey.indicator_id)) {
        score_per =
          list_.length !== 0
            ? numeral(_.round(list_[0].perc_point, 2)).format("0,0.00")
            : "";
        tooltip_name = sublayer.feature.properties[tool_tip];
        if (_.includes(Object.keys(gbl_district_name_mapping), tooltip_name))
          tooltip_name = gbl_district_name_mapping[tooltip_name];
        if (url.file == "amethi_map") {
          sublayer.bindTooltip(tooltip_name + "<br> Performance :" + score_per);
        } else {
          sublayer.bindTooltip(tooltip_name + "<br> Cost: Rs." + score_per);
        }
      } else if (
        _.includes(
          ["indicator_121", "indicator_131", "indicator_141"],
          url.searchKey.indicator_id
        )
      ) {
        score_per = list_.length !== 0 ? _.round(list_[0].perc_point, 2) : "";
        tooltip_name = sublayer.feature.properties[tool_tip];
        if (_.includes(Object.keys(gbl_district_name_mapping), tooltip_name))
          tooltip_name = gbl_district_name_mapping[tooltip_name];
        sublayer.bindTooltip(tooltip_name + "<br> Count: " + score_per);
      } else if (
        _.includes(["indicator_4"], url.searchKey.indicator_id) &&
        url.file == ""
      ) {
        score_per = list_.length !== 0 ? _.round(list_[0].perc_point, 2) : "";
        tooltip_name = sublayer.feature.properties[tool_tip];
        if (_.includes(Object.keys(gbl_district_name_mapping), tooltip_name))
          tooltip_name = gbl_district_name_mapping[tooltip_name];
        sublayer.bindTooltip(tooltip_name + "<br> Value:" + score_per);
      } else {
        score_per = list_.length !== 0 ? _.round(list_[0].perc_point, 2) : "";
        tooltip_name = sublayer.feature.properties[tool_tip];
        if (_.includes(Object.keys(gbl_district_name_mapping), tooltip_name))
          tooltip_name = gbl_district_name_mapping[tooltip_name];
        if (_.includes([undefined, ""], url.searchKey.indicator_id)) {
          if (url.file == "amethi_map") {
            var tool_tip_text = "<br> Aggregate Score:";
            score = numeral(score).format("0,0.0");
          } else {
            tool_tip_text = "<br> Index Score:";
          }
          sublayer.bindTooltip(tooltip_name + tool_tip_text + score + "%");
        } else {
          if (url.file == "amethi_map") {
            tool_tip_text = "<br> Performance:";
            let unit = _.filter(indicator_mapping, {
              indicator_id: url.searchKey.indicator_id,
            })[0].unit;
            let decimal = _.filter(indicator_mapping, {
              indicator_id: url.searchKey.indicator_id,
            })[0].decimal;
            score_per =
              unit === "%"
                ? numeral(score_per).format(decimal) + "%"
                : numeral(_.round(score_per / 100, 2)).format(decimal);
          } else {
            tool_tip_text = "<br> % Value:";
          }
          sublayer.bindTooltip(tooltip_name + tool_tip_text + score_per);
        }
      }
    });
  }
  if (url.file == "") {
    if (
      _.includes(
        ["", undefined],
        g1.url.parse(location.href).searchKey[type_.split("_")[0] + "_level"]
      )
    ) {
      $(".leaflet-overlay-pane path, .label_text").css("opacity", "1");
      url = g1.url.parse(location.href);
      if (url.searchKey.slider != undefined) {
        if (url.searchKey.check == "no") {
          if (url.searchKey.slider === "asd") {
            $(".leaflet-overlay-pane path, .label_text").css("opacity", "0.1");
            _.each($(".leaflet-overlay-pane path"), function (d) {
              if (
                _.includes(
                  aspirational_districts,
                  $(d).attr("stroke-dasharray").split("_")[0]
                )
              ) {
                $(
                  ".label_text." + $(d).attr("stroke-dasharray").split("_")[0]
                ).css("opacity", "1");
                $(d).css("opacity", "1");
              }
            });
          } else if (url.searchKey.slider === "hpds") {
            $(".leaflet-overlay-pane path, .label_text").css("opacity", "0.1");
            _.each($(".leaflet-overlay-pane path"), function (d) {
              if (
                _.includes(hpds, $(d).attr("stroke-dasharray").split("_")[0])
              ) {
                $(
                  ".label_text." + $(d).attr("stroke-dasharray").split("_")[0]
                ).css("opacity", "1");
                $(d).css("opacity", "1");
              }
            });
          } else if (url.searchKey.slider === "all") {
            $(".leaflet-overlay-pane path").css("opacity", "1");
            $(".leaflet-overlay-pane path, .label_text").css("opacity", "1");
          }
        }
      }
    } else {
      if (
        !_.includes(["", undefined], url.searchKey.division_level) ||
        !_.includes(["", undefined], url.searchKey.district_level)
      ) {
        $(".back_nav").removeClass("d-flex").show();
      }
      $(".leaflet-overlay-pane path").css("opacity", "0.1");
      var dis_div_block = url.searchKey[type_.split("_")[0] + "_level"];
      _.each($(".leaflet-overlay-pane path"), function (d) {
        if ($(d).attr("stroke-dasharray").split("_")[0] === dis_div_block) {
          $(d).css("opacity", "1");
          $(".leaflet-overlay-pane path .label_text").css("opacity", "1");
          $(".leaflet-overlay-pane path").css("opacity", "0.1");
          $(".leaflet-marker-icon").hide();
          $(d).css("opacity", "1");
          $("." + dis_div_block)
            .parent()
            .show();
        }
      });
    }
    $(".label_text").css(
      "font",
      "10px/1.5 Helvetica Neue, Arial, Helvetica, sans-serif"
    );
  }
  if (url.file == "amethi_map") {
    $(".map_trend_flex").empty();
    $(".filter_show").hide();
    $(".filter_val_trend").hide();
    $(".back_nav").hide();
    $(".rank_details").empty();
    $("#trend").removeClass("pt-5");
    $("#trend").addClass("pt-0");
    $(".view_fec").addClass("d-none");
    $(".negative_indication").addClass("d-none");
    $(".legend_table").css("padding-bottom", "8rem");
  }
}

function color_(url, name, name_, data_map) {
  // debugger
  var def = "composite_index";
  if (!_.includes([undefined, ""], url.searchKey.type)) {
    def = "type_index";
  }
  if (!_.includes([undefined, ""], url.searchKey.domain)) {
    def = "domain_index";
  }
  if (
    !_.includes([undefined, ""], url.searchKey.type) &&
    !_.includes([undefined, ""], url.searchKey.indicator_id)
  ) {
    def = "indicator_index";
  }
  if (
    _.includes([undefined, ""], url.searchKey.type) &&
    _.includes([undefined, ""], url.searchKey.domain) &&
    !_.includes([undefined, ""], url.searchKey.indicator_id)
  ) {
    def = "indicator_index";
  }

  if (
    !_.includes(["executive-summary", "executive-summary-capture"], url.file)
  ) {
    data_map = _.filter(data_map, function (d) {
      return d[def] != null;
    });
  }
  // data_map = _.filter(data_map, function(d){ return d[def] != null })
  data_map = _.orderBy(data_map, def, "desc");
  _.each(data_map, function (d, i) {
    d["rank"] = i;
  });

  var color_scale = d3
    .scaleQuantile()
    .domain([0, data_map.length])
    .range(["#098641", "#FF8E04", "#C5141D"]);
  var color_scale_amethi = d3
    .scaleThreshold()
    .domain([6, 10, 14])
    .range(["#098641", "#FF8E04", "#C5141D"]);
  var bla = "gray";
  _.each(data_map, function (d) {
    if (_.toInteger(d["map_id"]) === _.toInteger(name)) {
      if (url.file != "amethi_map") {
        bla = color_scale(d["rank"]);
      } else {
        var get_ind = _.includes(["", undefined], url.searchKey.indicator_id)
          ? "composite_rank"
          : "indicator_rank";
        bla = color_scale_amethi(d[get_ind]);
      }
    }
  });
  return bla;
}
