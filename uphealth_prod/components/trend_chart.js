/* exported draw_trend*/
/* globals get_hierarchy, user_data, dist_id_name_mapping */

function draw_trend(url, type, data, selector) {
  d3.select(selector).select("svg").remove();
  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true,
      });
    } else {
      obj[key] = value;
    }
    return obj;
  }
  var max_date = _.maxBy(data, "date").date,
    min_date = _.minBy(data, "date").date,
    // trend_end_dt = _.cloneDeep(max_date),
    hierarchy = get_hierarchy(url),
    prev_level = {
      block_level: "district_level",
      district_level: "",
      division_level: "",
    };

  if (url.searchKey.check === "yes") {
    prev_level["district_level"] = "division_level";
  }

  var hier_name = prev_level[hierarchy].replace("_level", ""),
    metric =
      url.searchKey.indicator_id == "" ||
      url.searchKey.indicator_id == undefined
        ? "composite_index"
        : "perc_point";

  if (hier_name === "") {
    hier_name = url.searchKey.check === "yes" ? "division" : "district";
  }

  data = _.filter(data, (d) => d.date !== undefined);

  // up avg data
  var up_avg = _(data)
      .groupBy("date")
      .map(function (entry, date) {
        return _defineProperty(
          {
            date: date,
            [hier_name]:
              url.searchKey[prev_level[hierarchy].replace("_level", "")] ||
              "UP",
            map_id: url.searchKey[prev_level[hierarchy]] || "UP",
          },
          metric,
          _.meanBy(entry, metric)
        );
      })
      .value(),
    compare_ids = (url.searchKey.trend_comp || "")
      .split(",")
      .map((c) => parseInt(c))
      .sort();

  data.push(up_avg);
  data = _.flattenDeep(data);
  var trend_filter = _(data)
      .filter(
        (d) =>
          d.map_id === parseInt(url.searchKey[hierarchy]) ||
          d.map_id === user_data.district ||
          _.includes(compare_ids, d.map_id) ||
          d.map_id === (url.searchKey[prev_level[hierarchy]] || "UP")
      )
      .value(),
    sel_block_line = _(data)
      .filter((d) => d.map_id == url.searchKey[hierarchy])
      .value(),
    comp_ids = (url.searchKey.trend_comp || "")
      .split(",")
      .map((m) => parseInt(m)),
    com1_block_line = _(data)
      .filter((d) => d.map_id == comp_ids[0])
      .value();
  var svg = d3.select(selector).append("svg"),
    main_margin = { top: 20, right: 90, bottom: 120, left: 50 },
    mini_margin = { top: 330, right: 90, bottom: 20, left: 50 },
    width = 700,
    main_width = width - main_margin.left - main_margin.right,
    main_height = 400 - main_margin.top - main_margin.bottom,
    mini_height = 400 - mini_margin.top - mini_margin.bottom,
    up_avg_legend = up_avg.reverse()[0],
    sel_block_legend = sel_block_line.reverse()[0],
    com1_block_legend = com1_block_line.reverse()[0],
    active_legend_pos = _.cloneDeep(trend_filter).reverse()[0].date;

  svg
    .append("defs")
    .append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", main_width)
    .attr("height", main_height);

  var x = d3.scaleTime().range([0, main_width * 0.99]),
    x2 = d3.scaleBand().range([0, main_width]).padding(0.2),
    y = d3.scaleLinear().range([main_height, 0]),
    y2 = d3.scaleLinear().range([mini_height, 0]),
    x_new = d3.scaleBand().range([0, main_width]).padding(0.2);
  // x.clamp(true)

  var brush = d3
    .brushX()
    .extent([
      [0, 0],
      [main_width, mini_height],
    ])
    .on("brush end", brushed);

  var area = d3
    .line()
    .x(function (d) {
      return x(moment(d.date, "YYYY-MM-DD")["_d"]);
    })
    .y(function (d) {
      return y(d.score);
    });

  svg
    .attr("width", main_width + main_margin.left + main_margin.right)
    .attr("height", main_height + main_margin.top + main_margin.bottom);
  svg
    .append("line")
    .style("stroke", "black")
    .style("stroke-width", "0.8px")
    .style("shape-rendering", "crispEdges")
    .attr("x1", 0)
    .attr("y1", main_height + 50)
    .attr("x2", main_width + main_margin.left + main_margin.right)
    .attr("y2", main_height + 50);

  var g = svg
    .append("g")
    .attr(
      "transform",
      "translate(" + main_margin.left + "," + main_margin.top + ")"
    );

  g.append("rect")
    .attr("class", "overlay")
    .attr("width", main_width)
    .attr("height", main_height)
    .attr("fill", "#FFFFFF");
  var metrics = _(trend_filter)
    .map("map_id")
    .uniq()
    .value()
    .map(function (name) {
      return {
        name: name,
        values: _.filter(trend_filter, (d) => d.map_id == name).map(function (
          d
        ) {
          return {
            date: d.date,
            score: +d[metric],
          };
        }),
      };
    });
  var focus = g
    .selectAll(".focus")
    .data(metrics)
    .enter()
    .append("g")
    .attr("class", "focus");
  var mini = svg
    .append("g")
    .attr(
      "transform",
      "translate(" + mini_margin.left + "," + mini_margin.top + ")"
    );

  var context = mini.append("g").attr("class", "context");

  x.domain([new Date(min_date), new Date(max_date)]);
  y.domain(d3.extent(trend_filter, (d) => d[metric]));
  if (type === "year") {
    x_new.domain(
      _(data)
        .map((d) => d.date)
        .uniq()
        .value()
    );
    var xAxis = d3
      .axisBottom(x_new)
      .tickValues(x_new.domain())
      .tickFormat(function (d) {
        var _y = parseInt(d3.timeFormat("%Y")(new Date(d)));
        return `${_y}-${(_y + 1).toString().substring(2)}`;
      });
  } else {
    xAxis = d3
      .axisBottom(x)
      .tickSize(-main_height)
      .ticks(6)
      .tickFormat(function (d) {
        var _tmp = d3.timeFormat("%b %y")(d);
        if (type === "quarter") {
          return qtr_labels_format(_tmp, "MMM YYYY");
        } else if (type === "year") {
          var _y = parseInt(d3.timeFormat("%Y")(d));
          return `${_y}-${(_y + 1).toString().substring(2)}`;
        }
        return _tmp;
      });
  }
  var yAxis = d3.axisLeft(y).ticks(4).tickSize(-main_width);
  focus
    .append("path")
    .attr("clip-path", "url(#clip)")
    .attr("class", "area1")
    .attr("d", function (d) {
      return area(d.values);
    })
    .attr("fill", "none")
    .style("stroke", function (d) {
      if (d.name === (url.searchKey[prev_level[hierarchy]] || "UP")) {
        return "#222222";
      } else if (d.name == url.searchKey[hierarchy]) {
        return "#F86439";
      } else if (d.name === compare_ids[0]) {
        return "#E7CF3E";
      }
      return "#269457";
    })
    .style("stroke-width", "2px")
    .style("stroke-dasharray", function (d) {
      if (d.name === (url.searchKey[prev_level[hierarchy]] || "UP")) {
        return "3, 3";
      }
    });

  g.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + main_height + ")")
    .call(xAxis)
    .append("text")
    .attr("transform", "translate(" + mini_margin.left * 2 + ", 40)")
    .style("text-anchor", "middle")
    .style("fill", "#ADADAD")
    .style("font-size", "11px")
    .text("*Use Handle to select time range");

  fill_legends();

  var y_axis_text =
      url.file == "amethi_map" ? "Aggregate Score" : "Composite Score",
    indicator_name =
      $(`#${url.searchKey.indicator_id}`).attr("desc") || y_axis_text;

  g.append("g")
    .attr("class", "axis axis--y")
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -main_margin.left + 5)
    .attr("x", -main_margin.bottom * 1.5)
    .attr("dy", ".71em")
    .style("text-anchor", "middle")
    .style("fill", "#656565")
    .style("font-size", "11px")
    .text(indicator_name);

  let bar_data = _(trend_filter)
    .filter((d) => d.map_id == (url.searchKey[prev_level[hierarchy]] || "UP"))
    .value();
  x2.domain(
    _(bar_data)
      .map((d) => d.date)
      .uniq()
      .value()
  );
  y2.domain(d3.extent(bar_data, (d) => d[metric]));
  x2.invert = function (x) {
    var domain = this.domain();
    var range = this.range();
    var scale = d3.scaleQuantize().domain(range).range(domain);
    return scale(x);
  };
  var mini_xAxis = d3
    .axisBottom(x2)
    .tickValues(
      x2.domain().filter(function (d, i) {
        return !(i % 2);
      })
    )
    .tickFormat(function (d) {
      if (type === "date") {
        return moment(d, "YYYY-MM-DD").format("MMM YY");
      } else if (type === "quarter") {
        return qtr_labels_format(d, "YYYY-MM-DD");
      }
      var _y = parseInt(moment(d, "YYYY-MM-DD").format("YYYY"));
      return `${_y}-${(_y + 1).toString().substring(2)}`;
      // return moment(d, 'YYYY-MM-DD').format('YYYY')
    });

  mini
    .append("g")
    .attr("class", "mini-x-axis")
    .attr("transform", "translate(0," + mini_height + ")")
    .call(mini_xAxis);

  context
    .selectAll(".bar")
    .data(bar_data)
    .enter()
    .append("rect")
    .attr("class", "area")
    .attr("x", (d) => x2(d.date))
    .attr("y", (d) => y2(d[metric]))
    .attr("width", x2.bandwidth())
    .attr("height", (d) => mini_height - y2(d[metric]))
    .attr("pointer-events", "all")
    .attr("cursor", "ew-resize")
    .style("fill", "#F86338");

  context
    .append("g")
    .attr("class", "brush")
    .call(brush)
    .call(brush.move, x.range());

  d3.select(".brush")
    .selectAll(".handle")
    .attr("rx", 3)
    .attr("ry", 3)
    .attr("fill", "#fff")
    .style("stroke", "#D8D8D8")
    .style("stroke-width", "2px");

  function brushed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
    var s = d3.event.selection || x2.range();
    x.domain([new Date(x2.invert(s[0])), new Date(x2.invert(s[1]))]);
    focus.selectAll(".area1").attr("d", function (d) {
      return area(d.values);
    });
    d3.select(".axis--x").call(xAxis);
  }

  function fill_legends() {
    d3.selectAll(".legend-line").remove();
    d3.selectAll(".legend_circle").remove();
    d3.selectAll(".axis--x .tick").style("font-weight", "normal");

    d3.selectAll(".axis--x .tick")
      .filter(
        (d) =>
          moment(d).unix() === moment(active_legend_pos, "YYYY-MM-DD").unix()
      )
      .style("font-weight", "bold");

    focus
      .append("line")
      .attr("x1", x(moment(active_legend_pos, "YYYY-MM-DD")["_d"]))
      .attr("x2", x(moment(active_legend_pos, "YYYY-MM-DD")["_d"]))
      .attr("y1", 0)
      .attr("y2", main_height)
      .attr("class", "legend-line")
      .style("stroke", "#C3C3C3")
      .style("stroke-dasharray", "3,3");

    var legn_circle_data = _.filter(
      trend_filter,
      (d) => d.date === active_legend_pos
    );

    focus
      .selectAll(".legend_circle")
      .data(legn_circle_data)
      .enter()
      .append("circle")
      .attr("cx", x(moment(active_legend_pos, "YYYY-MM-DD")["_d"]))
      .attr("cy", (d) => y(d[metric]))
      .attr("r", 6)
      .attr("class", "legend_circle")
      .attr("fill", (d) => {
        if (d.map_id === (url.searchKey[prev_level[hierarchy]] || "UP")) {
          return "#222222";
        } else if (d.map_id == url.searchKey[hierarchy]) {
          return "#F86439";
        } else if (d.map_id === compare_ids[0]) {
          return "#E7CF3E";
        }
      });

    var _month_on_legend = moment(active_legend_pos, "YYYY-MM-DD").format(
      "MMM YY"
    );
    if (type === "quarter") {
      _month_on_legend = qtr_labels_format(active_legend_pos, "YYYY-MM-DD");
    }
    if (type === "year") {
      var _y = parseInt(moment(active_legend_pos, "YYYY-MM-DD").format("YYYY"));
      _month_on_legend = `${_y}-${(_y + 1).toString().substring(2)}`;
    }
    if (up_avg_legend != undefined) {
      $(".main-trend-name").html(
        dist_id_name_mapping[parseInt(up_avg_legend[hier_name])] ||
          up_avg_legend[hier_name]
      );
      $(".main-trend-val").html(
        _month_on_legend + " - " + up_avg_legend[metric].toFixed(1)
      );
      $(".main-trend-div").parent().removeClass("d-none").addClass("d-flex");
    }
    if (sel_block_legend !== undefined) {
      $(".right-sel-trend-name").html(
        sel_block_legend[(hierarchy || "").replace("_level", "")]
      );
      $(".right-sel-trend-val").html(
        _month_on_legend + " - " + sel_block_legend[metric].toFixed(1)
      );
      $(".right-sel-trend-div")
        .parent()
        .removeClass("d-none")
        .addClass("d-flex");
    }
    if (com1_block_legend !== undefined) {
      $(".drop1-sel-trend-name").html(
        com1_block_legend[(hierarchy || "").replace("_level", "")]
      );
      $(".drop1-sel-trend-val").html(
        _month_on_legend + " - " + com1_block_legend[metric].toFixed(1)
      );
      $(".drop1-sel-trend-div")
        .parent()
        .removeClass("d-none")
        .addClass("d-flex");
    }
  }

  d3.selectAll(".axis--x .tick").style("cursor", "pointer");
  d3.selectAll(".axis--x .tick").on("click", function (e) {
    active_legend_pos = moment(e).format("YYYY-MM-DD");
    up_avg_legend = _.filter(up_avg, (d) => d.date === active_legend_pos)[0];
    sel_block_legend = _.filter(
      sel_block_line,
      (d) => d.date === active_legend_pos
    )[0];
    com1_block_legend = _.filter(
      com1_block_line,
      (d) => d.date === active_legend_pos
    )[0];
    fill_legends();
  });
  d3.select(".overlay").on("mousemove", function () {
    active_legend_pos = moment(x.invert(d3.mouse(this)[0])).format(
      "YYYY-MM-01"
    );
    up_avg_legend = _.filter(up_avg, (d) => d.date === active_legend_pos)[0];
    sel_block_legend = _.filter(
      sel_block_line,
      (d) => d.date === active_legend_pos
    )[0];
    com1_block_legend = _.filter(
      com1_block_line,
      (d) => d.date === active_legend_pos
    )[0];
    fill_legends();
  });

  function qtr_labels_format(d, format) {
    var _f = moment(d, format).fquarter().toString(),
      p1 = _f.substr(0, 3),
      p2 = _f.substr(5);
    return (p1 + p2).replace("/", "-");
  }
}
