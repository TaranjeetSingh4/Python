/*exported trendline */
/*global */
function trendline(config) {
  /*
  config = {
    palceholder: place holder of the element on which the graph will be rendered
    data:       array of objects
    margin:     { top: , bottom: , left: , right: }
    width:      int value
    height:     int value
    x_axis_name: x axis name
    y_axis_name_arr: arr of y axis name
    circle radius: radius of the circle
    date_format: given date format in json object
    chart_type: line or area chart type
    benchmark: to draw benchmark rectangle
    statemark: to draw statemark rectangle
    benchmark_score: benchmark_score for rectangle
    statement_score: statement_score for rectangle
    selected_district: to hightlight selected district
  }
  */

  // merge defaults with user config
  var defaults = {
    margin: { top: 10, right: 5, bottom: 10, left: 5 },
    width: 280,
    height: 60,
    x_axis_name: "date",
    parsetime: "%Y-%m-%d",
    y_axis_name_arr: ["score"],
    chart_type: "curveLinear",
    max_score: 0,
    colorScale: d3.scaleOrdinal().range(["#DB5F3B", "#000000"]),
  };
  config = $.extend({}, defaults, config);
  var placeholder = config["placeholder"],
    width = config["width"],
    height = config["height"],
    margin = config["margin"],
    x_axis_name = config["x_axis_name"],
    y_axis_name_arr = config["y_axis_name_arr"],
    data = _.cloneDeep(config["data"]),
    colorScale = config["colorScale"];
  var parseTime = config["parsetime"],
    chart_type = config["chart_type"];
  // max_score = config['max_score']

  (width = width - margin.left - margin.right),
    (height = height - margin.top - margin.bottom);

  // format the data
  data.forEach(function (d) {
    d[x_axis_name] = parseTime(d[x_axis_name]);
    $.each(y_axis_name_arr, function (i, y_axis_name) {
      d[y_axis_name] = +d[y_axis_name];
    });
  });

  var trend_data = [];
  _.each(_.groupBy(data, "date"), function (values) {
    var row = {};
    row["date"] = values[0].date;
    $.each(y_axis_name_arr, function (i, y_axis_name) {
      row[y_axis_name] = _.meanBy(values, y_axis_name);
    });
    trend_data.push(row);
  });
  data = trend_data;

  // set the ranges
  var x = d3.scaleTime().range([0, width]);
  var y = d3.scaleLinear().range([height, 0]);

  var valueline_arr = [];
  // define the line
  $.each(y_axis_name_arr, function (i, y_axis_name) {
    valueline_arr.push(function (dataum, boolean) {
      return d3
        .line()
        .x(function (d) {
          return boolean ? x(d[x_axis_name]) : 0;
        })
        .y(function (d) {
          return y(d[y_axis_name]);
        })
        .curve(d3[chart_type])(dataum);
    });
  });

  //remove svg
  d3.select(placeholder + " svg").remove();

  // append the svg obgect to the body of the page
  // appends a 'group' element to 'svg'
  // moves the 'group' element to the top left margin
  var svg = d3
    .select(placeholder)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var all_values = [];
  data.forEach(function (d) {
    $.each(y_axis_name_arr, function (i, y_axis_name) {
      all_values.push(d[y_axis_name]);
    });
  });

  // scale the range of the data
  x.domain(
    d3.extent(data, function (d) {
      return d[x_axis_name];
    })
  );
  y.domain(d3.extent(all_values));

  var new_g = svg.append("g");

  // add the valueline path.
  $.each(y_axis_name_arr, function (i, y_axis_name) {
    new_g
      .append("path")
      .data([data])
      .attr("d", function (d) {
        return valueline_arr[i](d, false);
      })
      .attr("stroke", colorScale(y_axis_name))
      .attr("stroke-width", 2)
      .attr("fill", "none")
      .attr("d", function (d) {
        return valueline_arr[i](d, true);
      })
      .attr("class", y_axis_name);
  });

  //add circles on line chart
  $.each(y_axis_name_arr, function (i, y_axis_name) {
    new_g
      .selectAll("circle" + i)
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot " + y_axis_name)
      .attr("fill", colorScale(y_axis_name))
      .attr("cx", function (d) {
        return x(d.date);
      })
      .attr("cy", function (d) {
        return y(d[y_axis_name]);
      })
      .attr("r", 3)
      .attr("data-toggle", "tooltip")
      .attr("data-placement", "top")
      .attr("title", function (d) {
        return _.round(d[y_axis_name], 2);
      });
  });
  $("circle").tooltip({ container: "body", html: true });
}
