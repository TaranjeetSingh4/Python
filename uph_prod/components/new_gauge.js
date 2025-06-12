/* exported gauage */
/* global g1 */
function gauage(selector, configuration, url) {
  if (url.file == "amethi_map") {
    if (
      !_.includes(
        ["", undefined],
        g1.url.parse(location.href).searchKey.block_level
      )
    ) {
      configuration["composite_score"] = numeral(
        _.round(
          (configuration["composite_score"] * 100) /
            configuration["curr_month_normalize"],
          2
        )
      ).format("0,0.0");
      var _cir_val = Number(
        $(
          "#" +
            g1.url.parse(location.href).searchKey.block_level +
            " td:first-child"
        )
          .text()
          .split("#")[1]
      );
      configuration["circle_value"] =
        _cir_val !== 1 ? Math.abs((_cir_val / 13) * 100 - 100) : -100;
    } else {
      // val_agg = UI.fetch_data('block_amethi_data', 'date=' + from_ + '&_by=district&_c=amethi_aggregate_score|avg')
      let nomralize_val = configuration["nomralize_val"];
      configuration["composite_score"] = numeral(
        _.round(
          ((configuration["composite_score"] * 100) / nomralize_val) * 100,
          2
        )
      ).format("0,0.0");
    }
  }
  const defaults = {
    size: 250,
    height: 200,
    width: 330,
    minAngle: -90,
    maxAngle: 90,
    innerRadius: 150,
    outerRadius: 130,
    legend: true,
    data: [10, 25, 30],
    margin: { top: 55, left: 0, bottom: 5, right: 10 },
    value: "value",
    name: "name",
    display_total: true,
    total_alerts: 0,
    total_alert_text: "Total",
    text_color: "black",
  };
  var deg2rad = function (deg) {
    return (deg * Math.PI) / 180;
  };
  var centerTranslation = function () {
    return (
      "translate(" +
      (config.width / 2 + config.margin.left) +
      "," +
      (config.height / 2 + config.margin.top) +
      ")"
    );
  };
  const config = $.extend({}, defaults, configuration);
  const value_key = config.value;
  var pieGenerator = d3
    .pie()
    .value(function (d) {
      return d[value_key];
    })
    .sort(null)
    .startAngle(deg2rad(config.minAngle))
    .endAngle(deg2rad(config.maxAngle));
  var pieGenerator_data = [
    {
      name: "low",
      value: 33.3,
    },
    {
      name: "med",
      value: 33.33,
    },
    {
      name: "high",
      value: 33.333,
    },
  ];
  if (url.file == "amethi_map") {
    pieGenerator_data = [
      {
        name: "low",
        value: 30.76923076923077,
      },
      {
        name: "med",
        value: 30.76923076923076,
      },
      {
        name: "high",
        value: 38.46153846153846,
      },
    ];
  }
  // console.log(config.data)
  var arcGenerator = d3
    .arc()
    .innerRadius(config.innerRadius)
    .outerRadius(config.outerRadius);
  var arcData = pieGenerator(pieGenerator_data);
  var value_scale = d3.scaleLinear().range([-90, 90]).domain([1, 100]);
  // var value_scale1 = d3.scaleLinear().range([90, -90]).domain([100, 0])
  var get_mid_point = function (value) {
    var startAngle = deg2rad(value_scale(value));
    var endAngle = deg2rad(value_scale(value));
    return { startAngle: startAngle, endAngle: endAngle };
  };
  if (url.file == "amethi_map") {
    var text_gauge = "AGGREGATE SCORE";
    $(".status").hide();
    var config_insights = "";
  } else {
    text_gauge = "COMPOSITE SCORE";
    config_insights = config.insights;
  }
  // console.log(configuration, config);
  // debugger;
  d3.select(selector + " svg").remove();
  var svg = d3
    .select(selector)
    .append("svg")
    // .attr('height', config.height)
    // .attr('width', config.width)
    .attr("viewBox", "-20 0 " + (config.width + 50) + " " + config.height);
  var bla = svg
    .append("g")
    .attr("transform", centerTranslation())
    .selectAll("path")
    .data(arcData)
    .enter();
  bla
    .append("path")
    .attr("d", function (d) {
      return arcGenerator(d);
    })
    .attr("class", "cursor-pointer")
    .attr("fill", function (d) {
      if (url.file != "amethi_map") {
        if (d.data.value === 33.3) {
          return "#C5141D";
        } else if (d.data.value === 33.33) {
          return "#FF8E04"; //'#C5141D', '#FF8E04', '#098641'
        } else {
          return "#098641";
        }
      } else {
        if (d.data.value === 30.76923076923077) {
          return "#C5141D";
        } else if (d.data.value === 30.76923076923076) {
          return "#FF8E04"; //'#C5141D', '#FF8E04', '#098641'
        } else {
          return "#098641";
        }
      }
    });
  var bla_ = function (value, length_) {
    var ordinalScale = function (value) {
      if (url.file == "amethi_map") {
        if (value >= 0 && value < 30.76923076923077) {
          return "#C5141D";
        } else if (value > 30.76923076923076 && value <= 61.53) {
          return "#FF8E04"; //'#C5141D', '#FF8E04', '#098641'
        } else {
          return "#098641";
        }
      } else {
        if (value >= 0 && value < 33) {
          return "#C5141D";
        } else if (value >= 33 && value < 66) {
          return "#FF8E04";
        } else {
          return "#098641";
        }
      }
    };
    var mean_value = 0;
    if (url.file == "amethi_map") {
      mean_value = _.round(value) || 0;
    } else {
      var _normalization = url.searchKey.check == "yes" ? 18 : 75;
      var _id =
        url.searchKey.check == "yes"
          ? g1.url.parse(location.href).searchKey.division_level
          : g1.url.parse(location.href).searchKey.district_level;
      var _get_rank =
        (1 - Number($(".rank_" + _id).text()) / _normalization) * 100;
      mean_value = _get_rank;
    }
    var vil = arcGenerator.centroid(get_mid_point(mean_value));
    if (url.file == "amethi_map") {
      if (configuration.circle_value == -100) {
        vil[1] = vil[1] + 5;
      }
      if (
        configuration.circle_value == 0 ||
        Number.isNaN(configuration.circle_value)
      ) {
        vil[1] = vil[1] - 7;
      }
    }
    // console.log(vil)
    bla
      .append("g")
      .append("circle")
      .attr("class", "circle_anim")
      .attr("transform", function () {
        return "translate(" + vil + ")";
      })
      .attr("r", function (d) {
        return d.index === length_ ? 12 : 0;
      })
      .attr("fill", "white")
      .attr("stroke", function (d) {
        return d.index === length_ ? ordinalScale(mean_value) : "";
      })
      .attr("stroke-width", function (d) {
        return d.index === length_ ? 5 : 0;
      });
    // var mean_value = 0;
    // function render_circle() { //  create a render_circle function
    //   setTimeout(function() { //  call a 3s setTimeout when the render_circle is called
    //     mean_value++; //  increment the counter
    //     d3.selectAll('.circle_anim').remove();
    //     var vil = arcGenerator.centroid(get_mid_point(mean_value))
    //     bla.append('g').append("circle")
    //       .attr('class', 'circle_anim')
    //       .attr("transform", function() {
    //         return "translate(" + vil + ")";
    //       })
    //       .attr('r', function(d) { return d.index === length_ ? 12 : 0 })
    //       .attr('fill', 'white')
    //       .attr('stroke', function(d) {
    //         return d.index === length_ ? ordinalScale(mean_value) : ""
    //       })
    //       .attr("stroke-width", function(d) { return d.index === length_ ? 5 : 0 })
    //     if (_.round(mean_value) !== _.round(value)) {
    //       render_circle();
    //     }
    //   }, 50)
    // }
    // render_circle()
  };
  bla
    .append("circle")
    .attr("cx", -(config.innerRadius - 10))
    .attr("cy", 0)
    .attr("r", 10)
    .attr("fill", "#C5141D");
  bla
    .append("circle")
    .attr("cx", config.innerRadius - 10)
    .attr("cy", 0)
    .attr("r", 10)
    .attr("fill", "#098641");
  bla
    .append("text")
    .attr("x", function () {
      if ((config.composite_score || 0) < 0.1) {
        return "-20";
      }
      return url.file == "amethi_map"
        ? url.searchKey.capture
          ? "-100"
          : "-80"
        : "-50";
    })
    .attr("y", "-35")
    .text(
      url.file == "amethi_map"
        ? config.composite_score > 0
          ? config.composite_score + "%"
          : "NA"
        : config.composite_score || 0
    )
    // .attr('class', 'compo_score')
    .attr("fill", "black")
    .attr("font-weight", "bold")
    .attr("font-family", "Open Sans")
    .attr("font-size", "59px");
  bla
    .append("text")
    .attr("x", "-60")
    .attr("y", "-90")
    // .attr('class', 'compo_score')
    .text(text_gauge)
    .attr("fill", "#000000")
    .attr("font-family", "Open Sans")
    .attr("font-size", "14px")
    .attr("font-weight", "300");
  bla
    .append("text")
    .attr("x", "-85")
    .attr("y", "0")
    .text(config_insights || "")
    .attr("fill", "#000000")
    .attr("font-family", "Open Sans")
    .attr("font-size", "16px")
    .attr("font-weight", "300");
  bla
    .append("text")
    .attr("x", -(config.innerRadius - 4))
    .attr("y", "30")
    .text(url.file == "amethi_map" ? "13" : "0")
    .attr("fill", "#000000")
    .attr("font-family", "Open Sans")
    .attr("font-size", "16px")
    .attr("font-weight", "300");
  bla
    .append("text")
    .attr("x", config.innerRadius - 14)
    .attr("y", "30")
    .text("1")
    .attr("fill", "#000000")
    .attr("font-family", "Open Sans")
    .attr("font-size", "16px")
    .attr("font-weight", "300");
  bla_(config.circle_value, config.data.length - 1);
  if (url.file == "amethi_map") {
    if (
      !_.includes(
        ["", undefined],
        g1.url.parse(location.href).searchKey.block_level
      )
    ) {
      $(".circle_anim").show();
    } else {
      $(".circle_anim").hide();
    }
  }
}
