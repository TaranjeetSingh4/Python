/* exported area_chart */
function area_chart(config) {
  if (config.data && typeof config.data[0].date !== "object") {
    var defaults = {},
      a_data = $.extend({}, defaults, config),
      id = a_data["id"],
      data = a_data["data"],
      chart_type = a_data["chart_type"] || "linear",
      margin = a_data["margin"] || { top: 20, right: 20, bottom: 50, left: 60 },
      color = a_data["color"] || "#A2CEEB",
      line_color = a_data["line_color"] || "#247CB8",
      update_val = a_data["update_val"],
      line_width = a_data["line_width"] || "2px",
      parseTime = a_data["parseTime"] || d3.timeParse("%Y-%m-%d"),
      gradient_fill = a_data["gradient_fill"] || false,
      width = a_data["width"] - margin.left - margin.right,
      height = a_data["height"] - margin.top - margin.bottom,
      unit = a_data["unit"],
      decimal = a_data["decimal"];

    if (!update_val) {
      d3.selectAll("#" + id + " svg").remove();
    }
    var dates = [];
    // format the data
    data.forEach(function (d) {
      d.date = parseTime(d.date);
      d["score"] = _.round(+d["score"], 2);
      dates.push(d.date);
    });
    var area_data = [];
    _.each(_.groupBy(data, "date"), function (values) {
      var row = {};
      row["date"] = values[0].date;
      row["score"] = _.meanBy(values, "score");
      area_data.push(row);
    });
    data = area_data;
    var x = d3.scaleTime().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);

    // define the area
    var area = d3
      .area()
      .x(function (d) {
        return x(d.date);
      })
      .y0(height)
      .y1(function (d) {
        if (d["score"] == undefined) {
          return y(0);
        } else {
          return y(d["score"]);
        }
      });

    // define the line
    var valueline = d3
      .line()
      .x(function (d) {
        return x(d.date);
      })
      .y(function (d) {
        return y(d["score"] || 0);
      });

    if (chart_type === "linear") {
      area.curve(d3.curveLinear);
      valueline.curve(d3.curveLinear);
    } else {
      area.curve(d3.curveCardinal);
      valueline.curve(d3.curveCardinal);
    }
    // append the svg obgect to the body of the page
    // appends a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    var svg = d3
      .select("#" + id)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr(
        "viewBox",
        " 0 0 " +
          (width + margin.left + margin.right + 10) +
          " " +
          (height + margin.top + margin.bottom)
      )
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // scale the range of the data
    x.domain(
      d3.extent(data, function (d) {
        return d.date;
      })
    );
    y.domain(
      d3.extent(data, function (d) {
        return d.score;
      })
    );

    // add the area
    svg
      .append("path")
      .data([data])
      .attr("fill", function (d) {
        if (gradient_fill) {
          var u_id = d[0].u_id || 0;
          return area_gradient(svg, color, "single_area" + u_id);
        }
        return color;
      })
      .attr("d", area);

    // add the valueline path.
    svg
      .append("path")
      .data([data])
      .attr("fill", "none")
      .attr("stroke", line_color)
      .attr("stroke-width", line_width)
      .attr("d", valueline);

    svg
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("fill", "#247CB8")
      .attr("cx", function (d) {
        return x(d.date);
      })
      .attr("cy", function (d) {
        return y(d.score);
      })
      .attr("r", 3)
      .attr("data-toggle", "tooltip")
      .attr("data-placement", "top")
      // .attr('title', function(d) { var ds = (d.date).toString(); return _.round(d.score, 2) + ' (' + moment(new Date(ds.substr(0, 16))).format('MMM, YY') + ')'})
      .attr("title", function (d) {
        let month = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ];
        return (
          month[d.date.getMonth()] +
          " : " +
          numeral(d.score).format(decimal == undefined ? "0,0.0" : decimal) +
          (unit === "%" ? "%" : "")
        );
      });
  }
  $("circle").tooltip({ container: "body", html: true });
}
//return gradient fill of color
function area_gradient(svg, color, id_name) {
  var op_ = color === "#EDF5FB" ? 1 : 0.1;
  var areaGradient = svg
    .append("defs")
    .append("linearGradient")
    .attr("id", id_name)
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "0%")
    .attr("y2", "100%");

  areaGradient
    .append("stop")
    .attr("offset", "0%")
    .attr("stop-color", color)
    .attr("stop-opacity", op_);

  areaGradient
    .append("stop")
    .attr("offset", "100%")
    .attr("stop-color", color)
    .attr("stop-opacity", op_);

  return "url(#" + id_name + ")";
}
