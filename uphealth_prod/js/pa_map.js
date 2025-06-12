/* globals g1, Promise, url, helpers_get_, program_config, isIpad */
/* exported render_pa_map_, render_profile_map, render_block_map, compare_map */

var profile_map,
  block_map,
  map_file = {};

$(function () {
  Promise.all([
    helpers_get_("district_level"),
    helpers_get_("division_level"),
  ]).then(function (response) {
    map_file["district_level"] = JSON.parse(response[0]);
    map_file["division_level"] = JSON.parse(response[1]);
  });
});

function _build_layer(config, _map) {
  _map.gData = {}; // deleting old data from MAP!
  _map.buildLayer("map_layer", _get_map_layer(config));
}

function render_block_map(_map_config) {
  let new_config = _.cloneDeep(_map_config),
    flag = false;
  let data_attr = program_config.map_defaults.data_attr[new_config.area],
    map_attr = program_config.map_defaults.map_attr[new_config.area];
  block_map = render_pa_map_(_map_config, block_map);

  block_map.on("map_layerloaded", function () {
    // Map is rendering along with old data which is redering 2 times
    // Avoiding 2nd time loading of map
    if (flag) return;
    flag = true;

    block_map.gLayers.map_layer.eachLayer(function (layer) {
      // let _data_var = new_config.curr_dist.toLowerCase().replace('division', '').trim()
      var val = _.filter(new_config.data, function (d) {
        return d[data_attr] === layer.feature.properties[map_attr];
      });
      if (val.length < 1) {
        layer.unbindTooltip();
        layer.setStyle({
          color: "white",
          fillColor: "#E5F0F6", // "default"
        });
      } else {
        layer.unbindTooltip();
        block_map.map.fitBounds(layer.getBounds());
        add_popup(_map_config, layer);
      }
    });
    // Set zoom for block map
    if (url.searchKey.block_details) block_map.map.setZoom(8);
    else block_map.map.setZoom(7);
  });
}

function render_profile_map(_map_config) {
  let new_config = _.cloneDeep(_map_config),
    flag = false;
  profile_map = render_pa_map_(_map_config, profile_map);
  $("map_tooltip").css("background-color", "white");
  let data_attr = program_config.map_defaults.data_attr[_map_config.area];

  profile_map.on("map_layerloaded", function () {
    // Map is rendering along with old data which is redering 2 times
    // Avoiding 2nd time loading of map
    if (flag) return;
    flag = true;
    profile_map.map.setView([26.539332436211467, 80.41376918021743]);
    profile_map.gLayers.map_layer.eachLayer(function (layer) {
      layer.unbindTooltip(); // Remove Tooltip
      let _data_var = new_config.data[0][data_attr];
      if (
        layer.feature.properties[data_attr] &&
        layer.feature.properties[data_attr] === _data_var
      ) {
        add_popup(_map_config, layer);
      } else {
        layer.setStyle({
          color: "white",
          fillColor: "#E5F0F6",
        });
      }
    });
  });
}

function compare_map(_map_config) {
  let new_config = _.cloneDeep(_map_config);
  let d = render_pa_map_(_map_config);

  let data_attr = program_config.map_defaults.data_attr[new_config.area],
    map_attr = program_config.map_defaults.map_attr[new_config.area];

  d.on("map_layerloaded", function () {
    d.gLayers.map_layer.eachLayer(function (layer) {
      var val = _.filter(new_config.data, function (d) {
        return d[data_attr] === layer.feature.properties[map_attr];
      });
      if (val.length < 1) {
        layer.unbindTooltip();
        layer.setStyle({
          color: "white",
          fillColor: "#E5F0F6", //  "transparent"
        });
      }
    });
    d.map.invalidateSize();
    if (isIpad()) {
      $(".map-div .leaflet-pane .leaflet-overlay-pane svg").css(
        "transform",
        "translate3d(-60px, -34px, 0px) scale(1.4)"
      );
    } else {
      $(".map-div .leaflet-pane .leaflet-overlay-pane svg").css(
        "transform",
        "translate3d(-45px, -34px, 0px) scale(1.6)"
      );
    }
  });
}

function add_popup(_map_config, layer) {
  //Adds popup to layer
  let b_area;
  let p_change = layer.feature.properties.change;
  if (url.searchKey.page === "block_view") {
    b_area = _.startCase(_map_config.area);
  } else {
    b_area = _map_config.area === "division" ? "District" : "Block";
  }

  let popup_div =
    '<div class="py-2 ml-2 mb-3" style="width: 170px">' +
    '<div class="row justify-content-md-center mb-2"><b> ' +
    layer.feature.properties[_map_config.area] +
    "</b></div>" +
    '<div class="row pl-0 pr-2"> <div class="col-6"> SCORE: </div>' +
    '<div class="col-6 text-right font-weight-bold"> ' +
    _.round(layer.feature.properties.value, 2) +
    "</div></div>" +
    '<div class="row pl-0 pr-2"> <div class="col-6"> CHANGE: </div>' +
    '<div class="col-6 text-right ' +
    (p_change == 0 || !isFinite(p_change)
      ? "text-color3"
      : p_change > 0
      ? "text-success"
      : "text-warning") +
    ' "> ' +
    (p_change === 0 || !isFinite(p_change)
      ? ""
      : '<i class= "pr-1 fa fa-caret-' +
        (p_change < 0 ? "down" : "up") +
        '" area-hidden="true"> </i>') +
    (!isFinite(p_change)
      ? '<i class="fas fa-minus"></i>'
      : _.round(p_change, 1) + "%") +
    "</div></div>" +
    '<div class="row pt-2 pb-0 justify-content-center">';
  if (!url.searchKey.block_details) {
    popup_div +=
      "" +
      '<span class="btn btn-link break-button cursor-pointer border-top text-right" value="' +
      layer.feature.properties[_map_config.area] +
      '">' +
      b_area +
      " " +
      (url.searchKey.page === "block_view" ? "Details" : "Breakup") +
      ' <i class="fa fa-caret-right" aria-hidden="true"></i>' +
      "</span>";
  }
  +"</div> </div>";
  layer
    .bindPopup(popup_div, {
      sticky: false,
      permanent: false,
      direction: "right",
      interactive: true,
      className: "crazyTooltip",
    })
    .openPopup();

  //Disable click for block popup
  if (url.searchKey.area_selected === "district")
    $(".break-button").css("pointerEvents", "none");
}

function render_pa_map_(map_config_, _map) {
  map_config_.metric = "value";
  map_config_.data_attr =
    program_config.map_defaults.data_attr[map_config_.area];
  map_config_.map_attr = program_config.map_defaults.map_attr[map_config_.area];

  if (!_map) {
    let g1_config = get_mapconfig(map_config_);
    _map = g1.mapviewer(g1_config);
  } else {
    _build_layer(map_config_, _map);
  }
  _map.on("map_layerloaded", function () {
    $(".mismatch-log").remove();
  });
  return _map;
}

function get_mapconfig(map_config) {
  let _conf = {
    id: map_config.map_id,
    map: {
      attributionControl: false,
      doubleClickZoom: false,
      scrollWheelZoom: false,
      dragging: false,
      zoomControl: false,
      zoomAnimation: false,
      touchZoom: false,
    },
    layers: {
      map_layer: _get_map_layer(map_config),
    },
  };
  return _conf;
}

function _get_map_layer(map_config) {
  let max_val, min_val, avg_val;
  if (map_config.min_max) {
    min_val = map_config.min_max[0];
    max_val = map_config.min_max[1];
  } else {
    let temp_data = map_config.data;
    _.map(temp_data, function (d) {
      d.value = !d.value ? 0 : d.value;
    });
    max_val = d3.max(temp_data, function (d) {
      return d.value;
    });
    min_val = d3.min(temp_data, function (d) {
      return d.value;
    });
  }
  // In comapre view color scale is simillar to table view
  if (map_config.compare_map) {
    max_val = map_config.max;
    map_config.color_domain = [0, max_val / 2, max_val];
  } else avg_val = (max_val + min_val) / 2;
  let cnf = {
    type: map_config.map_type || "geojson",
    url: _.cloneDeep(map_file[map_config.map_url]),
    link: {
      url: map_config.data,
      dataKey: map_config.data_attr,
      mapKey: map_config.map_attr,
      mismatch: false,
    },
    options: {
      style: {
        color: "white",
        weight: 1,
        fillColor: map_config.block_break ? "transparent" : "#E5F0F6",
        fillOpacity: 1,
      },
    },
    tooltip: function (d) {
      let tool_tip =
        '<div class="map_tooltip">  <b>' +
        d[map_config.area === "district" ? "DT_NAME" : "DIVISION"] +
        '</b> <br><p class="sm1"> CURR. SCORE: ';
      if (d.value) tool_tip += d.value.toFixed(2);
      else tool_tip += "NA";
      tool_tip += "</p></div>";
      return tool_tip;
    },
    attrs: {
      fillColor: {
        // Fill the regions
        metric: function (d) {
          return d["value"] === null ? 0 : d["value"];
        },
        fillOpacity: 1.0,
        // scheme: 'RdYlGn' // using a RdYlGn gradient
        scale: map_config.color_scale || "quantize",
        domain: map_config.color_domain || [min_val, avg_val, max_val],
        range: map_config.color_range || ["#dc2c2b", "#ea8524", "#3f8748"],
      },
    },
  };
  if (_.includes([0, null], min_val) && _.includes([0, null], max_val))
    cnf.attrs.fillColor = "#dc2c2b"; // displaying 'red' color when min & max val both are zero
  return cnf;
}
