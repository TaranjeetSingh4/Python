/*exported render_map*/
var map;

function render_map(url, data) {
  if (map != undefined || map != null) {
    map.remove();
    $("#mapid").html("");
  }
  map = L.map("mapid", {
    attributionControl: false,
    zoomControl: false,
    zoomSnap: 0.1,
  });
  // $(".leaflet-control-zoom-in").removeAttr('href').addClass('cursor-pointer')
  // $(".leaflet-control-zoom-out").removeAttr('href').addClass('cursor-pointer')
  // $(".leaflet-control-zoom").append('<a class="leaflet-control-zoom-reset" href="#" title="Zoom reset" role="button" aria-label="Zoom out"><img src="./static/img/cur_location.png" alt="current location" style="width: 15px"></img><span class="sr-only">current location</span></a>')
  var layer;
  // state level data
  var dist_ = "Agra";
  if (
    url.searchKey.district == undefined ||
    url.searchKey.district == "Uttar Pradesh"
  ) {
    dist_ = "lucknow";
  }
  var first_dist = data.length > 0 ? data[0].district : "Agra";
  var second_dist = data.length > 0 ? data[1].district : dist_;
  if (
    url.searchKey.district == undefined ||
    url.searchKey.district == "Uttar Pradesh" ||
    first_dist !== second_dist
  ) {
    $.getJSON("data/uttar pradesh.json").done(addLayersToMap);
  } else {
    $.getJSON("data/up-districts.json", function (mapjson) {
      mapjson.features = _.filter(mapjson.features, function (d) {
        var data_map = {
          Amethi: "C.S.M. Nagar",
          Amroha: "Jyotiba Phule Nagar",
          Bagpat: "Baghpat",
          Kasganj: "Kanshiram Nagar",
          Hathras: "Mahamaya Nagar",
          Bhadohi: "Sant Ravidas Nagar (Bhadohi)",
          Unnav: "Unnao",
          "Lakhimpur Kheri": "Kheri",
          Maharajganj: "Mahrajganj",
          "Siddharth Nagar": "Siddharthnagar",
          Bulandshahar: "Bulandshahr",
          Maunathbhanjan: "Mau",
          Barabanki: "Bara Banki",
        };
        var filter_ =
          data_map[url.searchKey.district] === undefined
            ? _.toLower(url.searchKey.district)
            : _.toLower(data_map[url.searchKey.district]);
        return _.toLower(d.properties.DT_Name) == filter_;
      });
      addLayersToMap(mapjson);
    });
  }

  function addLayersToMap(mapjson) {
    $(".loading-icon").hide();
    if (layer) map.removeLayer(layer);
    // mapjson.features = _.filter(mapjson.features, function(d){return d.properties.DT_Name == "Agra"})
    layer = new L.TopoJSON(mapjson, {
      style: function (feature) {
        var name_ =
          url.searchKey.district == undefined || first_dist !== second_dist
            ? "Id"
            : "Id";
        return {
          fillColor: color_(feature.properties[name_]),
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
      sublayer.on("click", function () {
        map.fitBounds(sublayer.getBounds());
        var geo_level = "district";
        if (sublayer.feature.properties["DT_NAME"] != undefined) {
          var update_geo_level = {};
          update_geo_level[geo_level] = _.capitalize(
            sublayer.feature.properties["DT_NAME"]
              .toLowerCase()
              .split(" ")
              .join("_")
          );
          url.update(update_geo_level);
          window.location.href = url.toString();
          $(".loading-icon").hide();
        }
      });
    });
  }

  function color_(name) {
    var min = data.length > 0 ? data[data.length - 1].composite_index : 0;
    var mid = data.length > 0 ? data[0].composite_index / 2 : 0;
    var max = data.length > 0 ? data[0].composite_index : 0;
    var color_scale = d3
      .scaleLinear()
      .domain([min, mid, max])
      .range(["green", "white", "red"]);
    var bla = "black";
    _.each(data, function (d) {
      if (_.toInteger(d["map_id"]) === _.toInteger(name)) {
        bla = color_scale(d.composite_index);
      }
    });
    return bla;
  }
}
