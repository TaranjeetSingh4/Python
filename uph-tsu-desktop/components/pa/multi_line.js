/* exported get_multi_line_chart_spec */
function get_multi_line_chart_spec(_config) {
  // _config.data = _.each(_config.data, function (d) { if (d.y == null) d.y = 0 })
  // _config.up_data = _.each(_config.up_data, function(d) { if(d.y == null) d.y = 0})
  var chart_line = [];

  var color_arr = [
    "#0D72E8",
    "#F46448",
    "#A51B30",
    "#59A600",
    "#20c997",
    "#ffc107",
  ];

  _.each(_config.dist, function (index, d) {
    var temp = {
      name: "line" + (d + 1),
      type: "line",
      from: {
        data: "table",
      },
      encode: {
        enter: {
          x: {
            scale: "x",
            field: "month",
          },
          y: {
            scale: "y",
            field: "s" + (d + 1),
          },
        },
        update: {
          strokeWidth: {
            value: 1,
          },
          stroke: {
            value: color_arr[d],
          },
          interpolate: {
            value: "linear",
          },
          fillOpacity: {
            value: 1,
          },
        },
        hover: {
          strokeWidth: {
            value: 2,
          },
          fillOpacity: {
            value: 0.5,
          },
        },
      },
    };
    chart_line.push(temp);
  });
  var up_line = {
    name: "line_up",
    type: "line",
    from: {
      data: "table",
    },
    encode: {
      enter: {
        x: {
          scale: "x",
          field: "month",
        },
        y: {
          scale: "y",
          field: "up_avg",
        },
      },
      update: {
        strokeWidth: {
          value: 1,
        },
        stroke: {
          value: "grey",
        },
        strokeDash: {
          value: [3, 3],
        },
        interpolate: {
          value: "linear",
        },
        fillOpacity: {
          value: 1,
        },
      },
      hover: {
        strokeWidth: {
          value: 2,
        },
        fillOpacity: {
          value: 0.5,
        },
      },
    },
  };
  chart_line.push(up_line);
  _.each(_config.dist, function (index, d) {
    var temp = {
      name: "symbol" + (d + 1),
      type: "symbol",
      from: {
        data: "table",
      },
      encode: {
        enter: {
          x: {
            scale: "x",
            field: "month",
          },
          y: {
            scale: "y",
            field: "s" + (d + 1),
          },
        },
        update: {
          stroke: {
            value: color_arr[d],
          },
          size: {
            value: 70,
          },
          fill: {
            value: "#FFFFFF",
          },
        },
        hover: {
          fill: {
            value: color_arr[d],
          },
          size: {
            value: 100,
          },
        },
      },
    };
    chart_line.push(temp);
  });
  var up_symbol = {
    name: "symbol_up",
    type: "symbol",
    from: {
      data: "table",
    },
    encode: {
      enter: {
        x: {
          scale: "x",
          field: "month",
        },
        y: {
          scale: "y",
          field: "up_avg",
        },
      },
      update: {
        stroke: {
          value: "grey",
        },
        size: {
          value: 70,
        },
        fill: {
          value: "#FFFFFF",
        },
      },
      hover: {
        fill: {
          value: "grey",
        },
        size: {
          value: 100,
        },
      },
    },
  };
  chart_line.push(up_symbol);
  var spec = {
    $schema: "https://vega.github.io/schema/vega/v5.json",
    width: 350,
    height: 340,
    padding: 5,
    autosize: "fit",
    data: [
      {
        name: "table",
        values: _config.data,
      },
    ],
    scales: [
      {
        name: "x",
        type: "point",
        range: "width",
        domain: {
          data: "table",
          field: "month",
        },
      },
      {
        name: "y",
        type: "linear",
        range: "height",
        nice: true,
        zero: true,
        domain: [0, 100],
      },
      {
        name: "color",
        type: "ordinal",
        range: "category",
        domain: {
          data: "table",
          field: "month",
        },
      },
    ],
    axes: [
      {
        orient: "bottom",
        scale: "x",
      },
      {
        orient: "left",
        scale: "y",
      },
    ],
    marks: chart_line,
  };
  return spec;
}
