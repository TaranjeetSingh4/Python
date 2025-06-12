/* exported draw_trend temp_data*/
/* globals url,type_, g1, aspirational_districts, hpds, user_data, map_data */
function draw_trend(
  trend_final_vals,
  data,
  selector,
  type,
  append_up,
  overall
) {
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
  var tooltip_metric,
    axis_metric = "all";
  if (url.searchKey["chart"] == undefined || url.searchKey["chart"] == "map") {
    $("#mapid").removeClass("d-none");
    $("#trend").addClass("d-none");
    $(".filter_val_trend").hide();
    $(".map_trend_flex").addClass("mt-n2");
    $(".filter_show").hide();
    if (
      _.includes(["", undefined], url.searchKey.district_level) ||
      _.includes(["", undefined], url.searchKey.division_level)
    ) {
      $(".back_nav").hide();
    } else {
      $(".back_nav").show();
    }
    $(".show_text").show();
    $(".view_fec").show();
  } else {
    $(".back_nav").show();
    if (_.includes(["", undefined], url.searchKey.district_level)) {
      $(".back_nav").removeClass("d-flex");
      $(".map_trend_flex").addClass("mt-n2");
    }
    $("#mapid").addClass("d-none");
    $("#map_trend").prop("checked", true);
    $(".filter_val_trend").hide();
    $("#trend").removeClass("d-none");
    $(".show_text").hide();
    $(".view_fec").hide();
    $(".filter_show").show();
  }
  if (_.includes(["indicator_12"], url.searchKey.indicator_id)) {
    tooltip_metric = "Cost: Rs.";
    axis_metric = "amt";
  } else if (
    _.includes(
      ["indicator_121", "indicator_131", "indicator_141"],
      url.searchKey.indicator_id
    )
  ) {
    tooltip_metric = "Count";
  } else if (_.includes(["indicator_4"], url.searchKey.indicator_id)) {
    tooltip_metric = "% Value";
  } else {
    if (_.includes([undefined, ""], url.searchKey.indicator_id)) {
      if (url.file == "amethi_map") {
        tooltip_metric = "Aggregate Score:";
      } else {
        tooltip_metric = "Index Score:";
      }
    } else {
      tooltip_metric = "% Value";
    }
  }
  var metric =
    url.searchKey.indicator_id == "" || url.searchKey.indicator_id == undefined
      ? "composite_index"
      : "perc_point";
  $(selector).empty();
  if (
    type_ == "block_view" ||
    type_ == "block_view_yr" ||
    type_ == "block_view_qa"
  ) {
    _.forEach(append_up, function (d) {
      d["map_id"] = "block_up";
      d["district"] = "block_up";
    });
    _.forEach(overall, function (d) {
      d["map_id"] = "UP";
      d["district"] = "UP";
    });
    var values = _(overall)
      .groupBy("date")
      .map(function (entry, date) {
        return _defineProperty(
          {
            date: date,
            district: "UP",
            map_id: "UP",
          },
          metric,
          _.meanBy(entry, metric)
        );
      })
      .value();
    var up_avg = { name: "block_up", values: append_up };
    var overall_avg = { name: "UP", values: values };
    data = _.chain(data)
      .groupBy("map_id")
      .map(function (value, key) {
        return {
          name: key,
          values: value,
        };
      })
      .value();
    if (append_up.length != 0) {
      data.push(up_avg);
    }
    if (overall.length != 0) {
      data.push(overall_avg);
    }
    if (data.length != 0) {
      var max_min = _.map(data, function (d) {
        return d.values;
      });
    }
    var max_domain = _.maxBy(_.flatten(max_min), function (d) {
      return d[metric];
    })[metric];
    var min_domain = _.minBy(_.flatten(max_min), function (d) {
      return d[metric];
    })[metric];
  } else if (
    !_.includes(["", undefined], url.searchKey.division) &&
    _.includes(["", undefined], url.searchKey.district)
  ) {
    _.forEach(append_up, function (d) {
      d["map_id"] = "block_up";
      d["district"] = "block_up";
    });
    _.forEach(overall, function (d) {
      d["map_id"] = "UP";
      d["district"] = "UP";
    });
    values = _(overall)
      .groupBy("date")
      .map(function (entry, date) {
        return _defineProperty(
          {
            date: date,
            district: "UP",
            map_id: "UP",
          },
          metric,
          _.meanBy(entry, metric)
        );
      })
      .value();
    append_up = _(append_up)
      .groupBy("date")
      .map(function (entry, date) {
        return _defineProperty(
          {
            date: date,
            district: "block_up",
            map_id: "block_up",
          },
          metric,
          _.meanBy(entry, metric)
        );
      })
      .value();
    up_avg = { name: "block_up", values: append_up };
    overall_avg = { name: "UP", values: values };
    data = _.chain(data)
      .groupBy("map_id")
      .map(function (value, key) {
        return {
          name: key,
          values: value,
        };
      })
      .value();
    if (append_up.length != 0) {
      data.push(up_avg);
    }
    if (overall.length != 0) {
      data.push(overall_avg);
    }
    if (data.length != 0) {
      max_min = _.map(data, function (d) {
        return d.values;
      });
    }
    max_domain = _.maxBy(_.flatten(max_min), function (d) {
      return d[metric];
    })[metric];
    min_domain = _.minBy(_.flatten(max_min), function (d) {
      return d[metric];
    })[metric];
  } else {
    if (type == "date" || type == "month") {
      max_domain = _.maxBy(data, function (d) {
        return d[metric];
      })[metric];
      min_domain = _.minBy(data, function (d) {
        return d[metric];
      })[metric];
      values = _(data)
        .groupBy("date")
        .map(function (entry, date) {
          return _defineProperty(
            {
              date: date,
              district: "UP",
              map_id: "UP",
            },
            metric,
            _.meanBy(entry, metric)
          );
        })
        .value();
      up_avg = { name: "UP", values: values };
      data = _.chain(data)
        .groupBy("map_id")
        .map(function (value, key) {
          return {
            name: key,
            values: value,
          };
        })
        .value();
      data.push(up_avg);
    }
    if (type == "quarter" || type == "year") {
      max_domain = _.maxBy(data, function (d) {
        return d[metric];
      })[metric];
      min_domain = _.minBy(data, function (d) {
        return d[metric];
      })[metric];
      values = _(data)
        .groupBy("date")
        .map(function (entry, date) {
          return _defineProperty(
            {
              date: date,
              district: "UP",
              map_id: "UP",
            },
            metric,
            _.meanBy(entry, metric)
          );
        })
        .value();
      up_avg = { name: "UP", values: values };
      data = _.chain(data)
        .groupBy("map_id")
        .map(function (value, key) {
          return {
            name: key,
            values: value,
          };
        })
        .value();
      data.push(up_avg);
    }
  }
  if ($("#map_trend").is(":checked") == true) {
    $("#mapid").addClass("d-none");
  }
  var width = 600;
  var height = 350;
  var margin = 50;

  var circleOpacity = "0.85";
  var circleRadius = 3;
  // var temp_data = _.map(data.data, 'name')
  // var map_ids = _.map(data.data, function(d){ d['map_id']})
  data.forEach(function (d) {
    d.values.forEach(function (d) {
      d.date = moment(d.date).format("MM-DD-YYYY");
      d[metric] = +d[metric];
    });
  });
  var max_array = data[0].values;
  var max_array_all = max_array.map(function (d) {
    return moment(d.date);
  });

  var max_d = moment.max(max_array_all)["_i"];
  var min_d = moment.min(max_array_all)["_i"];
  var xScale = d3
    .scaleTime()
    .domain([new Date(min_d), new Date(max_d)])
    .range([0, width - margin]);

  var yScale = d3
    .scaleLinear()
    .domain([min_domain, axis_metric === "all" ? 109 : max_domain])
    .range([height - margin, 0])
    .clamp(true);

  // var color = d3.scaleOrdinal(d3.schemeCategory10);
  var color = d3
    .scaleQuantile()
    .domain([0, data.length])
    .range(["#098641", "#FF8E04", "#C5141D"]);
  function dragmove() {
    d3.select(this).attr("y", d3.event.y).attr("x", d3.event.x);
  }
  var drag = d3.drag().on("drag", dragmove);
  /* Add SVG */
  var svg = d3
    .select(selector)
    .append("svg")
    .attr("width", width + margin + "px")
    .attr("height", height + margin + "px")
    .append("g")
    .attr("transform", "translate(".concat(margin, ", ").concat(margin, ")"));
  /* Add line into SVG */
  var line = d3
    .line()
    .x(function (d) {
      return xScale(new Date(d.date));
    })
    .y(function (d) {
      return yScale(d[metric]);
    });
  let lines = svg.append("g").attr("class", "lines");
  lines
    .selectAll(".line-group")
    .data(data)
    .enter()
    .append("g")
    .attr("class", "line-group")
    .append("path")
    .attr("class", function (d) {
      return "line path_country_" + String(d.values[0]["map_id"]);
    })
    .attr("data-attr", function (d) {
      return "country_" + String(d.values[0]["map_id"]);
    })
    .attr("d", function (d) {
      return line(d.values);
    })
    .style("stroke", function (d) {
      if (d.values[d.values.length - 1]["composite_rank"]) {
        return color(d.values[d.values.length - 1]["composite_rank"]);
      } else {
        return "black";
      }
    });
  lines
    .selectAll("circle-group")
    .data(data)
    .enter()
    .append("g")
    .style("fill", function (d) {
      return color(d.values[d.values.length - 1]["composite_rank"]);
    })
    .append("g")
    .attr("class", function (d) {
      return "circle path_country_" + String(d.values[0]["map_id"]);
    })
    .attr("data-attr", function (d) {
      return "country_" + String(d.values[0]["map_id"]);
    })
    .selectAll("circle")
    .data(function (d) {
      return d.values;
    })
    .enter()
    .append("circle")
    .attr("cx", function (d) {
      return xScale(new Date(d.date));
    })
    .attr("cy", function (d) {
      return yScale(d[metric]);
    })
    .attr("r", circleRadius)
    .style("opacity", circleOpacity)
    .attr("data-toggle", "tooltip")
    .attr("data-placement", "top")
    .attr("title", function (d) {
      if (d["map_id"] == "UP") {
        if (
          type_ == "district_view" ||
          type_ == "district_view_qa" ||
          type_ == "district_view_yr"
        ) {
          var district = "UP Avg";
        }
        if (!_.includes(["", undefined], url.searchKey.division_level)) {
          district = "UP Avg";
        }
        if (
          type_ == "division_view" ||
          type_ == "division_view_qa" ||
          type_ == "division_view_yr"
        ) {
          district = "UP Avg";
        }
        if (!_.includes(["", undefined], url.searchKey.district_level)) {
          district = $("#header-text").text();
        }
        if (
          !_.includes(["", undefined], url.searchKey.block_level) ||
          !_.includes(["", undefined], url.searchKey.district)
        ) {
          district = "UP Avg";
        }
      } else {
        if (d["map_id"] != "block_up") {
          district = _.filter(trend_final_vals, { map_id: d["map_id"] })[0][
            "name"
          ];
        } else if (
          !_.includes(["", undefined], url.searchKey.division) &&
          _.includes(["", undefined], url.searchKey.district)
        ) {
          district = $("#header-text").text();
        } else {
          district = "Block Avg";
        }
      }
      return district + "-" + tooltip_metric + ":" + _.round(d[metric], 2);
    });
  // +'-'+_.round(d[metric], 2)}

  lines
    .selectAll(".text-label")
    .data(data)
    .enter()
    .append("text")
    .attr("class", function (d) {
      return "label path_country_" + String(d.values[0]["map_id"]);
    })
    .attr("data-attr", function (d) {
      return "country_" + String(d.values[0]["map_id"]);
    })
    .attr("x", function (d) {
      return xScale(new Date(d.values[d.values.length - 1].date));
    })
    .attr("y", function (d) {
      return yScale(d.values[d.values.length - 1][metric]);
    })
    .attr("dy", ".50em")
    .attr("dx", ".50em")
    .style("fill", function (d) {
      if (d.values[d.values.length - 1]["composite_rank"] && d.name != "UP") {
        return color(d.values[d.values.length - 1]["composite_rank"]);
      } else {
        return "blue";
      }
    })
    .attr("id", "draggable")
    .attr("text-anchor", "start")
    .attr("font-size", "11px")
    .text(function (d) {
      if (d.name != "UP" && d.name != "block_up") {
        return _.find(trend_final_vals, { map_id: Number(d.name) }).name;
      } else if (d.name == "block_up" && d.name != "UP") {
        if (
          !_.includes(["", undefined], url.searchKey.division) &&
          _.includes(["", undefined], url.searchKey.district)
        ) {
          return url.searchKey.division;
        } else {
          return url.searchKey.district;
        }
      } else if (d.name == "UP" || url.searchKey["district"] != "") {
        return "UP Avg";
      } else if (d.name == "block_up") {
        return "UP Avg";
      }
    })
    .call(drag);
  var map_quat = {
    Apr: "Q1",
    Jul: "Q2",
    Oct: "Q3",
    Jan: "Q4",
  };
  /* Add Axis into SVG */
  var xAxis = d3.axisBottom(xScale).tickFormat(
    type == "year"
      ? function (d) {
          var crnt_yr = moment(d).format("YYYY");
          var nxt_year = Number(crnt_yr) + 1;
          return crnt_yr + "-" + nxt_year;
        }
      : type == "quarter"
      ? function (d) {
          return (
            map_quat[moment(d).format("MMM")] + "-" + moment(d).format("YY")
          );
        }
      : d3.timeFormat("%b%y")
  );
  var yAxis = d3.axisLeft(yScale);
  svg
    .append("g")
    .attr("class", "x axis")
    .attr("class", "axisRed")
    .attr("transform", "translate(0, ".concat(height - margin, ")"))
    .call(xAxis);
  svg
    .append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .append("text")
    .attr("y", 15)
    .attr("transform", "rotate(-90)")
    .attr("fill", "#000");
  if (
    _.includes(
      ["", undefined],
      g1.url.parse(location.href).searchKey[type_.split("_")[0] + "_level"]
    )
  ) {
    $("#trend svg .lines path").css("opacity", 0);
    $("#trend svg g g.lines text").css("opacity", 0);
    $("#trend svg .lines g.circle circle").css("opacity", 0);
    $("#trend svg .lines path.path_country_UP").css("opacity", 1);
    $("#trend svg .lines g.circle.path_country_UP circle").css("opacity", 1);
    $("#trend svg .lines path.path_country_UP").css("stroke", "blue");
    $("#trend svg .lines g.circle.path_country_UP circle").css("fill", "blue");
    $("#trend svg g g.lines text.label.path_country_UP").css("opacity", 1);
    if (
      !_.includes(["", undefined], url.searchKey.division) &&
      _.includes(["", undefined], url.searchKey.district)
    ) {
      $("#trend svg .lines path.path_country_block_up").css("opacity", 1);
      $("#trend svg .lines g.circle.path_country_block_up circle").css(
        "opacity",
        1
      );
      $("#trend svg .lines path.path_country_block_up").css("stroke", "black");
      $("#trend svg .lines g.circle.path_country_block_up circle").css(
        "fill",
        "black"
      );
      $("#trend svg g g.lines text.label.path_country_block_up").css(
        "opacity",
        1
      );
      $("#trend svg g g.lines text.label.path_country_block_up").css(
        "fill",
        "black"
      );
    } else {
      $("#trend svg .lines path.path_country_" + user_data.map_id).css(
        "opacity",
        1
      );
      $(
        "#trend svg .lines g.circle.path_country_" +
          user_data.map_id +
          " circle"
      ).css("opacity", 1);
      $("#trend svg .lines path.path_country_" + user_data.map_id).css(
        "stroke",
        "black"
      );
      $(
        "#trend svg .lines g.circle.path_country_" +
          user_data.map_id +
          " circle"
      ).css("fill", "black");
      $(
        "#trend svg g g.lines text.label.path_country_" +
          String(user_data.map_id)
      ).css("opacity", 1);
      $(
        "#trend svg g g.lines text.label.path_country_" +
          String(user_data.map_id)
      ).css("fill", "black");
    }
    if (url.searchKey.check == "no") {
      if (url.searchKey.slider === "asd") {
        $("#trend svg .lines path").css("opacity", 0);
        $("#trend svg .lines g.circle circle").css("opacity", 0);
        _.each(aspirational_districts, function (d) {
          $("#trend svg .lines path.path_country_" + String(d)).css(
            "opacity",
            1
          );
          $(
            "#trend svg .lines g.circle.path_country_" + String(d) + " circle"
          ).css("opacity", 1);
        });
      } else if (url.searchKey.slider === "hpds") {
        $("#trend svg .lines path").css("opacity", 0);
        $("#trend svg .lines g.circle circle").css("opacity", 0);
        _.each(hpds, function (d) {
          $(".filter_val_trend")
            .find("[data-attr=country_" + d + "]")
            .removeClass("d-none");
          $("#trend svg .lines path.path_country_" + String(d)).css(
            "opacity",
            1
          );
          $(
            "#trend svg .lines g.circle.path_country_" + String(d) + " circle"
          ).css("opacity", 1);
        });
      } else if (url.searchKey.slider === "all") {
        $("#trend svg .lines path").css("opacity", 0);
        $("#trend svg .lines g.circle circle").css("opacity", 0);
        $("#trend svg .lines path.path_country_UP").css("opacity", 1);
        $("#trend svg .lines g.circle.path_country_UP circle").css(
          "opacity",
          1
        );
        $("#trend svg .lines path.path_country_UP").css("stroke", "blue");
        $("#trend svg .lines g.circle.path_country_UP circle").css(
          "fill",
          "blue"
        );
        $("#trend svg .lines path.path_country_" + user_data.map_id).css(
          "opacity",
          1
        );
        $(
          "#trend svg .lines g.circle.path_country_" +
            user_data.map_id +
            " circle"
        ).css("opacity", 1);
        $("#trend svg .lines path.path_country_" + user_data.map_id).css(
          "stroke",
          "black"
        );
        $(
          "#trend svg .lines g.circle.path_country_" +
            user_data.map_id +
            " circle"
        ).css("fill", "black");
        $("#trend svg g g.lines text.label.path_country_UP").css("opacity", 1);
        $(
          "#trend svg g g.lines text.label.path_country_" +
            String(user_data.map_id)
        ).css("opacity", 1);
      }
    }
  } else {
    var dis_div_block = url.searchKey[type_.split("_")[0] + "_level"];
    $("#trend svg .lines path").css("opacity", 0);
    $("#trend svg .lines g.circle circle").css("opacity", 0);
    $("#trend svg .lines path.path_country_" + user_data.map_id).css(
      "opacity",
      1
    );
    $(
      "#trend svg .lines g.circle.path_country_" + user_data.map_id + " circle"
    ).css("opacity", 1);
    $("#trend svg .lines path.path_country_" + user_data.map_id).css(
      "stroke",
      "black"
    );
    $(
      "#trend svg .lines g.circle.path_country_" + user_data.map_id + " circle"
    ).css("fill", "black");
    $("#trend svg .lines path.path_country_" + String(dis_div_block)).css(
      "opacity",
      1
    );
    $(
      "#trend svg .lines g.circle.path_country_" +
        String(dis_div_block) +
        " circle"
    ).css("opacity", 1);
  }
  if (
    !_.includes(["", undefined], url.searchKey.district) ||
    !_.includes(["", undefined], url.searchKey.block_level)
  ) {
    if (user_data.block != "" && url.searchKey.district == user_data.district) {
      var block = _.filter(map_data, { block: user_data.block })[0].map_id;
      $("#trend svg .lines path.path_country_" + String(block)).css(
        "opacity",
        1
      );
      $(
        "#trend svg .lines g.circle.path_country_" + String(block) + " circle"
      ).css("opacity", 1);
      $("#trend svg g g.lines text.label.path_country_UP").css("opacity", 1);
      $("#trend svg g g.lines text.label.path_country_" + String(block)).css(
        "opacity",
        1
      );
      $("#trend svg g g.lines text.label.path_country_block_up").css(
        "opacity",
        1
      );
      $("#trend svg g g.lines text.label.path_country_block_up").css(
        "fill",
        "black"
      );
    }
    $("#trend svg .lines path.path_country_UP").css("opacity", 1);
    $("#trend svg .lines g.circle.path_country_UP circle").css("opacity", 1);
    $("#trend svg .lines path.path_country_UP").css("stroke", "blue");
    $("#trend svg .lines g.circle.path_country_UP circle").css("fill", "blue");
    $("#trend svg .lines path.path_country_block_up").css("opacity", 1);
    $("#trend svg .lines g.circle.path_country_block_up circle").css(
      "opacity",
      1
    );
    $("#trend svg .lines path.path_country_block_up").css("stroke", "black");
    $("#trend svg .lines g.circle.path_country_block_up circle").css(
      "fill",
      "black"
    );
    $("#trend svg g g.lines text.label.path_country_block_up").css(
      "opacity",
      1
    );
    $("#trend svg g g.lines text.label.path_country_block_up").css(
      "fill",
      "black"
    );
  }
  $("circle").tooltip({ container: "body", html: true });
  if (type == "year") {
    if (data[0].values.length == 3) {
      var tick_hide = [1, 2, 3, 5, 6, 7];
      _.forEach(tick_hide, function (d) {
        $($(".tick")[d]).hide();
      });
    } else {
      tick_hide = _.range(12);
      _.forEach(tick_hide, function (d) {
        if (d != 0 && d != 12) {
          $($(".tick")[d]).hide();
        }
      });
    }
  }
  _.forEach($("#trend svg .lines g.circle circle"), function (d) {
    if ($(d).css("opacity") != 1) {
      $(d).tooltip("disable");
      $(d).css("pointer-events", "none");
    } else {
      $(d).tooltip("enable");
      $(d).css("pointer-events", "all");
    }
  });

  $("circle").on("inserted.bs.tooltip", function () {
    var h3 = $(".tooltip-inner");
    var text = h3.text().split("-");
    $.each(text, function (i, val) {
      text[i] = "<span>" + val + "</span><br>";
    });
    h3.html(text.join(" "));
  });
}
