/*global url, UI, district_name_mapping*/
/*exported render_map*/
var map;
function render_map(url, data) {
  // url = g1.url.parse(location.href)
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
  // state level data
  var dist_ = "Agra";
  if (_.includes([undefined, "Uttar Pradesh", ""], url.searchKey.district)) {
    dist_ = "lucknow";
  }
  var first_dist = data.length > 0 ? data[0].district : "Agra";
  var second_dist = data.length > 0 ? data[1].district : dist_;

  if (_.includes([undefined, "Uttar Pradesh", ""], url.searchKey.district)) {
    if (
      url.searchKey.check == "yes" &&
      _.includes(["", undefined], url.searchKey.district)
    ) {
      var mapjson = UI.fetch_data("district_level", "");
      if (!_.includes(["", undefined], url.searchKey.division)) {
        mapjson.features = _.filter(mapjson.features, function (d) {
          var filter_ = url.searchKey.division_level;
          return d.properties.DIVISIONID == parseInt(filter_);
        });
      } else {
        mapjson = UI.fetch_data("division_level", "");
      }
      addLayersToMap(mapjson);
    } else {
      addLayersToMap(UI.fetch_data("district_level", ""));
    }
  } else {
    mapjson = UI.fetch_data("block_level", "");
    mapjson.features = _.filter(mapjson.features, function (d) {
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
      if ((!_.includes[("", undefined)], url.searchKey.district)) {
        var filter_ =
          data_map[url.searchKey.district] === undefined
            ? _.toLower(url.searchKey.district)
            : _.toLower(data_map[url.searchKey.district]);
      }
      return _.toLower(d.properties.DT_Name) == filter_;
    });
    addLayersToMap(mapjson);
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
          fillColor: color_(feature.properties[name_], name_, data),
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
        _.each(data, function (d) {
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
        if (_.includes(Object.keys(district_name_mapping), text_))
          text_ = district_name_mapping[text_];
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
      var list_ = _.filter(data, function (d) {
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
        if (_.includes(Object.keys(district_name_mapping), tooltip_name))
          tooltip_name = district_name_mapping[tooltip_name];
        sublayer.bindTooltip(tooltip_name + "<br> Cost: Rs." + score_per);
      } else if (
        _.includes(
          ["indicator_121", "indicator_131", "indicator_141"],
          url.searchKey.indicator_id
        )
      ) {
        score_per = list_.length !== 0 ? _.round(list_[0].perc_point, 2) : "";
        tooltip_name = sublayer.feature.properties[tool_tip];
        if (_.includes(Object.keys(district_name_mapping), tooltip_name))
          tooltip_name = district_name_mapping[tooltip_name];
        sublayer.bindTooltip(tooltip_name + "<br> Count: " + score_per);
      } else if (_.includes(["indicator_4"], url.searchKey.indicator_id)) {
        score_per = list_.length !== 0 ? _.round(list_[0].perc_point, 2) : "";
        tooltip_name = sublayer.feature.properties[tool_tip];
        if (_.includes(Object.keys(district_name_mapping), tooltip_name))
          tooltip_name = district_name_mapping[tooltip_name];
        sublayer.bindTooltip(tooltip_name + "<br> Value:" + score_per);
      } else {
        score_per =
          list_.length !== 0 ? _.round(list_[0].perc_point, 2) + "%" : "";
        tooltip_name = sublayer.feature.properties[tool_tip];
        if (_.includes(Object.keys(district_name_mapping), tooltip_name))
          tooltip_name = district_name_mapping[tooltip_name];
        if (_.includes([undefined, ""], url.searchKey.indicator_id)) {
          sublayer.bindTooltip(tooltip_name + "<br> Index Score:" + score);
        } else {
          sublayer.bindTooltip(tooltip_name + "<br> % Value:" + score_per);
        }
      }
    });
  }
}

function color_(name, name_, data) {
  // debugger;
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
  data = _.orderBy(data, def, "desc");
  _.each(data, function (d, i) {
    d["rank"] = i;
  });

  var color_scale = d3
    .scaleQuantile()
    .domain([0, data.length])
    .range(["#098641", "#FF8E04", "#C5141D"]);
  var bla = "gray";
  _.each(data, function (d) {
    if (_.toInteger(d["map_id"]) === _.toInteger(name)) {
      bla = color_scale(d["rank"]);
    }
  });
  return bla;
}
