/* exported dumbel_chart */

function dumbel_chart(data, indicator) {
  let selector = ".dumbell_chart";
  var margin = { top: 20, right: 100, bottom: 30, left: 150 },
    width = 593 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;
  var svg = d3
    .select(selector)
    .append("svg")
    .attr("viewBox", function () {
      let viewBox =
        "0 0 " +
        (width + margin.left + margin.right) +
        " " +
        (height + margin.top + margin.bottom);
      return viewBox;
    })
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("width", "100%");
  // add scales
  var x = d3.scaleLinear().rangeRound([70, width - 10]),
    y = d3.scalePoint().rangeRound([height, 10]).padding(0.4),
    z = d3.scalePoint().rangeRound([height, 10]).padding(0.4);

  var chart = svg
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  data.sort(function (a, b) {
    // range is flipped, so it ascends from bottom of chart
    return d3.ascending(+a.perc_point, +b.perc_point);
  });
  let curr_points = _.map(data, "perc_point");
  let prev_points = _.map(data, "perc_point_prev");
  let points = [...curr_points, ...prev_points];
  x.domain([d3.min(points), d3.max(points)]);
  y.domain(
    data.map(function (d) {
      return d.block_name;
    })
  );
  z.domain(
    data.map(function (d, i) {
      return i + " " + d.chanage;
    })
  );

  // Create scale
  //   let curr_points = _.map(data, 'perc_point')
  //   let prev_points = _.map(data, 'perc_point_prev')
  //   let points = [...curr_points]
  //   console.log(points)
  //   console.log(d3.min(points), d3.max(points))
  //   var scale = d3.scaleLinear()
  //   .domain([d3.min(points), d3.max(points)])
  //   .range([0, width - 10])
  //   .nice();

  // let xAxisGenerator = d3.axisBottom(scale)
  // xAxisGenerator.ticks(5);

  // x-axis
  // chart.append("g")
  //     .attr("class", "x axis")
  //     .attr("transform", "translate(10, -" + 10 + ")")
  //     .call(xAxisGenerator)
  //   .append("text")
  //     .attr("text-anchor", "end");

  var dumbbellGroup = chart.append("g").attr("id", "dumbbellGroup");

  var dumbbell = dumbbellGroup
    .selectAll(".dumbbell")
    .data(data)
    .enter()
    .append("g")
    .attr("class", "dumbbell")
    .attr("transform", function (d) {
      return "translate(5," + y(d.block_name) + ")";
    });

  dumbbell
    .append("rect")
    .attr("x", -500)
    .attr("y", -10)
    .attr("width", 2000)
    .attr("height", 20)
    .attr("fill", function (d, i) {
      return i % 2 == 0 ? "#ddd" : "#fff";
    });

  // lines: between dots
  dumbbell
    .append("line")
    .attr("class", "line between")
    .attr("x1", function (d) {
      return x(d.perc_point);
    })
    .attr("x2", function (d) {
      return x(d.perc_point_prev);
    })
    .attr("y1", 0)
    .attr("y2", 0)
    .style("stroke", "black")
    .style("stroke-width", "1px");

  // dots: current inventory
  dumbbell
    .append("circle")
    .attr("class", "circle current")
    .attr("cx", function (d) {
      return x(d.perc_point);
    })
    .attr("cy", 0)
    .attr("r", 6)
    .style("fill", "#54492C");

  // data labels: current
  dumbbell
    .append("text")
    .attr("class", "text current")
    .attr("x", function (d) {
      return x(d.perc_point);
    })
    .attr("y", 0)
    .attr("dy", ".35em")
    .attr("dx", function (d) {
      return d.chanage < 0 ? -45 : 17;
    })
    .text(function (d) {
      return d.perc_point;
    });

  // data labels: future
  dumbbell
    .append("text")
    .attr("class", "text future")
    .attr("x", function (d) {
      return x(d.perc_point_prev);
    })
    .attr("y", 0)
    .attr("dy", ".35em")
    .attr("dx", function (d) {
      return d.chanage < 0 ? 45 : -17;
    })
    .attr("text-anchor", "end")
    .text(function (d) {
      return d.perc_point_prev;
    });

  // dots: future inventory
  dumbbell
    .append("circle")
    .attr("class", "circle future")
    .attr("cx", function (d) {
      return x(d.perc_point_prev);
    })
    .attr("cy", 0)
    .attr("r", 6)
    .style("stroke", "#414E68")
    .style("fill", "#F6F2E8");

  // y-axis
  chart
    .append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(-150, 0)")
    .call(d3.axisRight(y));

  let y_txt = d3.selectAll(".y.axis .tick");
  y_txt.attr("font-size", "13px");
  // z-axis
  chart
    .append("g")
    .attr("class", "z axis")
    .attr("transform", "translate(390,0)")
    .call(d3.axisRight(z));

  d3.selectAll("svg .z text").each(function (d) {
    d = d.split(" ").pop();
    d3.select(this).text(d);
  });

  var ticks = d3.selectAll(".z .tick");
  // ticks.text((name) => name.substr(0))
  ticks.each(function () {
    d3.select(this)
      .append("circle")
      .attr("r", 5)
      .style("fill", function (d) {
        d = d.split(" ").pop();
        if (indicator.indicator_name == "Still birth ratio") {
          if (d < 0) {
            return "#00b441";
          } else {
            return d < 25 ? "#fdc108" : "#d30907";
          }
        } else {
          if (d > 0) {
            return "#00b441";
          } else {
            return d > -25 ? "#fdc108" : "#d30907";
          }
        }
      });
  });
}
