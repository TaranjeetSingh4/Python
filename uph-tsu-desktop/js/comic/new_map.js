/*globals topojson */
/*exported render_map*/
// var map;
function render_map(data_map) {
  var selector = ".map_view";
  var width = $(selector).width(),
    height = $(selector).height();
  // padding = 10,
  // scale = 2000;

  var margin = { top: 0, right: 0, bottom: 0, left: 0 };
  $.getJSON("block_level", function (data) {
    data_map = _.orderBy(data_map, "composite_index", "desc");
    _.each(data_map, function (d, i) {
      d["rank"] = i;
    });
    var color_scale = d3
      .scaleQuantile()
      .domain([0, data_map.length])
      .range(["#098641", "#FF8E04", "#C5141D"]);
    d3.select(selector).selectAll("*").remove();
    var svg = d3
      .select(selector)
      .append("svg")
      .attr("viewBox", function () {
        let viewBox =
          "0 0 " +
          (width + margin.left + margin.right) +
          " " +
          (height + margin.top + margin.bottom + 35);
        return viewBox;
      })
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr("width", "100%")
      .attr("height", "100%");

    let projection = d3.geoMercator();

    let path = d3.geoPath().projection(projection).pointRadius(2);

    var districts = topojson.feature(
      data,
      data.objects["up-districts"]
    ).features;

    var distinct_id = _.map(data_map, "map_id");
    districts = _.filter(districts, function (d) {
      return _.includes(distinct_id, d.properties.CD_Block);
    });
    var o = topojson.mesh(data, data.objects["up-districts"], function (a, b) {
      return a === b && _.includes(distinct_id, a.properties.CD_Block);
    });
    projection.scale(1).translate([0, 0]);
    var b = path.bounds(o),
      s =
        1 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
      t = [
        (width - s * (b[1][0] + b[0][0])) / 2,
        (height - s * (b[1][1] + b[0][1])) / 2,
      ];
    projection.scale(s).translate(t);

    var districtPaths = svg.selectAll(".district").data(districts);

    districtPaths
      .enter()
      .append("path")
      .attr("class", "district")
      .attr("d", path)
      .attr("data-id", function (d) {
        return d.properties.DT_CODE;
      })
      .attr("data-placement", "top")
      .style("stroke", "black")
      .style("stroke-width", "1px")
      .attr("data-html", "true")
      .style("fill", function (d) {
        let rank = _.filter(data_map, { map_id: d.properties.CD_Block });
        if (rank.length > 0) return color_scale(rank[0]["rank"]);
      });
    districtPaths
      .enter()
      .append("text")
      .attr("transform", function (d) {
        return "translate(" + path.centroid(d) + ")";
      })
      .attr("dx", function (d) {
        return d.properties.dx || "0";
      })
      .attr("dy", function (d) {
        return d.properties.dy || "0.35em";
      })
      .text(function (d) {
        return d.properties.BLOCK_NAME;
      });
  });
}
