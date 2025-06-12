/* exported get_radial_chart_spec */
function get_radial_chart_spec(chart_data, r_conf) {
  // area, enlarge) {
  var offset = 0,
    rule_offset = 0;
  if (window.innerWidth < 1050) {
    if (r_conf.enlarge) {
      offset = 70;
      rule_offset = 75;
    } else {
      offset = -30;
      rule_offset = -5;
    }
  } else {
    if (r_conf.enlarge) {
      offset = 70;
      rule_offset = 180;
    }
  }
  var filling_bar =
    "(datum.value === min_max[0])? '#dc2c2b' : (datum.value === min_max[1])? '#3f8748' : '#EDEED9'";
  if (r_conf.selection == "above") {
    filling_bar =
      "(datum.value > " + r_conf.average_val + " ) ? '#5bd25b' : '#EDEED9'";
  } else if (r_conf.selection == "below") {
    filling_bar =
      "(datum.value < " + r_conf.average_val + " ) ? '#e65858' : '#EDEED9'";
  }
  var spec = {
    $schema: "https://vega.github.io/schema/vega/v5.json",
    autosize: "fit",

    signals: [
      {
        name: "startAngle",
        value: 0,
      },
      {
        name: "endAngle",
        value: 5.2,
      },
      {
        name: "padAngle",
        value: 0.005,
      },
      {
        name: "innerRadius",
        value: 130 + offset,
      },
      {
        name: "cornerRadius",
        value: 20,
      },
      {
        name: "sort",
        value: false,
      },
    ],

    data: [
      {
        name: "table",
        values: chart_data,
        transform: [
          {
            type: "pie",
            startAngle: { signal: "startAngle" },
            endAngle: { signal: "endAngle" },
            sort: { signal: "sort" },
          },
          {
            type: "extent",
            field: "value",
            signal: "min_max",
          },
        ],
      },
    ],

    scales: [
      {
        name: "color",
        type: "ordinal",
        domain: { data: "table", field: r_conf.area },
        range: { scheme: "category20" },
      },
      {
        name: "arcHeight",
        type: "linear",
        domain: { data: "table", field: "value" },
        range: { signal: "[innerRadius + 20, height/2]" },
      },
    ],

    marks: [
      {
        name: "chart_bars",
        type: "arc",
        from: { data: "table" },
        encode: {
          update: {
            startAngle: { field: "startAngle" },
            fill: { signal: filling_bar },
            x: { signal: "width / 2" },
            y: { signal: "height / 2" },
            innerRadius: { signal: "innerRadius" },
            outerRadius: { scale: "arcHeight", field: "value" },
            cornerRadius: { value: 6 },
            endAngle: { field: "endAngle" },
            padAngle: { signal: "padAngle" },
            tooltip: {
              signal:
                "{'" +
                r_conf.area.toUpperCase() +
                "': upper(datum['" +
                r_conf.area +
                "']), 'CURR. SCORE': format(datum.value, '0.2f')}",
              name: "x_tooltip",
            },
          },
        },
      },
      {
        name: "circle_1",
        type: "arc",
        encode: {
          enter: {
            x: { signal: "width / 2" },
            y: { signal: "height / 2" },
            innerRadius: { signal: "scale('arcHeight', min_max[1])" },
            outerRadius: { signal: "scale('arcHeight', min_max[1]) + 1" },
            startAngle: { signal: "startAngle" },
            endAngle: { signal: "endAngle" },
            stroke: { value: "green" },
            strokeDash: { value: [1, 2] },
          },
        },
      },
      {
        name: "circle_2",
        type: "arc",
        encode: {
          enter: {
            x: { signal: "width / 2" },
            y: { signal: "height / 2" },
            innerRadius: {
              signal: "scale('arcHeight', " + r_conf.average_val + ")",
            },
            outerRadius: {
              signal: "scale('arcHeight', " + r_conf.average_val + ") + 0.5",
            },
            startAngle: { signal: "startAngle" },
            endAngle: { signal: "endAngle" },
            fill: { value: "blue" },
            strokeWidth: { value: 0.3 },
          },
        },
      },
      {
        name: "circle_3",
        type: "arc",
        encode: {
          enter: {
            x: { signal: "width / 2" },
            y: { signal: "height / 2" },
            innerRadius: { signal: "scale('arcHeight', min_max[0])" },
            outerRadius: { signal: "scale('arcHeight', min_max[0]) + 1" },
            startAngle: { signal: "startAngle" },
            endAngle: { signal: "endAngle" },
            stroke: { value: "red" },
            strokeDash: { value: [1, 2] },
          },
        },
      },
      {
        name: "line_1",
        type: "rule",
        encode: {
          enter: {
            x: {
              signal: "scale('arcHeight', min_max[1]) - 30 + " + rule_offset,
            },
            y: {
              signal: "height/2 - scale('arcHeight', min_max[1])",
            },
            x2: {
              signal: "width / 2",
            },
            y2: {
              signal: "height/2 - scale('arcHeight', min_max[1])",
            },
            stroke: {
              value: "green",
            },
            zindex: {
              value: 20000,
            },
            strokeWidth: { value: 0.5 },
            strokeDash: { value: [1, 2] },
          },
        },
      },
      {
        name: "rect_1",
        type: "rect",
        encode: {
          enter: {
            x: {
              signal: "scale('arcHeight', min_max[1]) - 110 + " + rule_offset,
            },
            y: {
              signal: "height/2 - scale('arcHeight', min_max[1]) - 8",
            },
            height: { value: 15 },
            width: { value: 80 },
            stroke: {
              value: "green",
            },
            zindex: {
              value: 20000,
            },
            cornerRadius: { value: 5 },
            strokeWidth: { value: 0.5 },
          },
        },
      },
      {
        name: "rect_1_text",
        type: "text",
        encode: {
          enter: {
            fill: { value: "green" },
            text: {
              value:
                "BEST PERF. " +
                (r_conf.area.toLowerCase() === "district" ? "DIST." : "DIV."),
            },
          },
          update: {
            opacity: { value: 1 },
            x: {
              signal: "scale('arcHeight', min_max[1]) - 95 + " + rule_offset,
            },
            y: {
              signal: "height/2 - scale('arcHeight', min_max[1]) + 2",
            },
            fontSize: { value: 8 },
            fontStyle: { value: "arial" },
          },
          hover: {
            opacity: { value: 0.5 },
          },
        },
      },
      {
        name: "line_2",
        type: "rule",
        encode: {
          enter: {
            x: {
              signal: "scale('arcHeight', min_max[1]) - 30 + " + rule_offset,
            },
            y: {
              signal:
                "height/2 - scale('arcHeight',  " + r_conf.average_val + ")",
            },
            x2: {
              signal: "width / 2",
            },
            y2: {
              signal:
                "height/2 - scale('arcHeight',  " + r_conf.average_val + ")",
            },
            stroke: {
              value: "blue",
            },
            zindex: {
              value: 20000,
            },
            strokeWidth: { value: 0.5 },
          },
        },
      },
      {
        name: "rect_2",
        type: "rect",
        encode: {
          enter: {
            x: {
              signal: "scale('arcHeight', min_max[1]) - 90 + " + rule_offset, // scale val. - (line_2 start point) - (rect width)
            },
            y: {
              signal:
                "height/2 - scale('arcHeight', " + r_conf.average_val + ") - 8",
            },
            height: { value: 15 },
            width: { value: 60 },
            stroke: {
              value: "blue",
            },
            zindex: {
              value: 20000,
            },
            cornerRadius: { value: 5 },
            strokeWidth: { value: 0.5 },
          },
        },
      },
      {
        name: "rect_2_text",
        type: "text",
        encode: {
          enter: {
            fill: { value: "blue" },
            text: {
              signal: "'UP AVG. ' + format(" + r_conf.average_val + ", '0.0f')",
            },
          },
          update: {
            opacity: { value: 1 },
            x: {
              signal: "scale('arcHeight', min_max[1]) - 80 + " + rule_offset,
            },
            y: {
              signal:
                "height/2 - scale('arcHeight', " + r_conf.average_val + ") + 2",
            },
            fontSize: { value: 8 },
            fontStyle: { value: "arial" },
          },
          hover: {
            opacity: { value: 0.5 },
          },
        },
      },
      {
        name: "line_3",
        type: "rule",
        encode: {
          enter: {
            x: {
              signal: "scale('arcHeight', min_max[1]) - 30 + " + rule_offset,
            },
            y: {
              signal: "height/2 - scale('arcHeight', min_max[0])",
            },
            x2: {
              signal: "width / 2",
            },
            y2: {
              signal: "height/2 - scale('arcHeight', min_max[0])",
            },
            stroke: {
              value: "red",
            },
            zindex: {
              value: 20000,
            },
            strokeWidth: { value: 0.5 },
            strokeDash: { value: [1, 2] },
          },
        },
      },
      {
        name: "rect_3",
        type: "rect",
        encode: {
          enter: {
            x: {
              signal: "scale('arcHeight', min_max[1]) - 110 + " + rule_offset,
            },
            y: {
              signal: "height/2 - scale('arcHeight', min_max[0]) - 8",
            },
            height: { value: 15 },
            width: { value: 80 },
            stroke: {
              value: "red",
            },
            zindex: {
              value: 20000,
            },
            cornerRadius: { value: 5 },
            strokeWidth: { value: 1 },
          },
        },
      },
      {
        name: "rect_3_text",
        type: "text",
        encode: {
          enter: {
            fill: { value: "red" },
            text: {
              value:
                "POOR PERF. " +
                (r_conf.area.toLowerCase() === "district" ? "DIST." : "DIV."),
            },
          },
          update: {
            opacity: { value: 1 },
            x: {
              signal: "scale('arcHeight', min_max[1]) - 100 + " + rule_offset,
            },
            y: {
              signal: "height/2 - scale('arcHeight', min_max[0]) + 2",
            },
            fontSize: { value: 8 },
            fontStyle: { value: "arial" },
          },
          hover: {
            opacity: { value: 0.5 },
          },
        },
      },
      {
        name: "ind_baseline_1",
        type: "rule",
        encode: {
          enter: {
            x: {
              signal: "(width / 2) - 15",
            },
            y: {
              signal: "height/2 - scale('arcHeight', min_max[1])",
            },
            x2: {
              signal: "(width / 2) - 15",
            },
            y2: {
              signal:
                "height/2 - scale('arcHeight', " + r_conf.average_val + ")",
            },
            stroke: {
              value: "black",
            },
            zindex: {
              value: 20000,
            },
            strokeWidth: {
              value: 0.5,
            },
            strokeDash: {
              value: [1, 2],
            },
          },
        },
      },
      {
        name: "ind_baseline_2",
        type: "rule",
        encode: {
          enter: {
            x: {
              signal: "(width / 2) - 15",
            },
            y: {
              signal: "height/2 - scale('arcHeight', min_max[0])",
            },
            x2: {
              signal: "(width / 2) - 15",
            },
            y2: {
              signal:
                "height/2 - scale('arcHeight'," + r_conf.average_val + ")",
            },
            stroke: {
              value: "black",
            },
            zindex: {
              value: 20000,
            },
            strokeWidth: {
              value: 0.5,
            },
            strokeCap: { value: "round" },
            strokeDash: {
              value: [1, 2],
            },
          },
        },
      },
      {
        name: "ind_line_1",
        type: "rule",
        encode: {
          enter: {
            x: {
              signal: "scale('arcHeight', min_max[1]) - 115",
            },
            y: {
              signal:
                "height/2 - scale('arcHeight', (min_max[1] + " +
                r_conf.average_val +
                ")/2)",
            },
            x2: {
              signal: "(width / 2) - 15",
            },
            y2: {
              signal:
                "height/2 - scale('arcHeight', (min_max[1] + " +
                r_conf.average_val +
                ")/2)",
            },
            stroke: {
              value: "black",
            },
            zindex: {
              value: 20000,
            },
            strokeWidth: {
              value: 1,
            },
            strokeDash: {
              value: [1, 2],
            },
          },
        },
      },
      {
        name: "ind_line_2",
        type: "rule",
        encode: {
          enter: {
            x: {
              signal: "scale('arcHeight', min_max[1]) - 115",
            },
            y: {
              signal:
                "height/2 - scale('arcHeight', (min_max[0] + " +
                r_conf.average_val +
                ")/2)",
            },
            x2: {
              signal: "(width / 2) - 15",
            },
            y2: {
              signal:
                "height/2 - scale('arcHeight', (min_max[0] + " +
                r_conf.average_val +
                ")/2)",
            },
            stroke: {
              value: "black",
            },
            zindex: {
              value: 20000,
            },
            strokeWidth: {
              value: 0.5,
            },
            strokeDash: {
              value: [1, 2],
            },
          },
        },
      },
      {
        name: "abv_avg_rect",
        type: "rect",
        encode: {
          enter: {
            x: {
              signal: "scale('arcHeight', min_max[1]) - 180",
            },
            y: {
              signal:
                "height/2 - scale('arcHeight', (min_max[1] + " +
                r_conf.average_val +
                ")/2) - 15",
            },
            height: {
              value: 30,
            },
            width: {
              value: 65,
            },
            fill: {
              value: r_conf.selection == "above" ? "#5bd25b" : "white",
            },
            stroke: {
              value: "black",
            },
            zindex: {
              value: 20000,
            },
            cornerRadius: {
              value: 5,
            },
            strokeWidth: {
              value: 1,
            },
          },
        },
      },
      {
        name: "abv_avg_text",
        type: "text",
        encode: {
          enter: {
            fill: {
              value: r_conf.selection == "above" ? "white" : "black",
            },
            text: {
              value:
                r_conf.areas_abv_avg +
                " " +
                (r_conf.area.toLowerCase() === "district" ? "DIST." : "DIV."),
            },
          },
          update: {
            opacity: {
              value: 1,
            },
            x: {
              signal: "scale('arcHeight', min_max[1]) - 150 ",
            },
            y: {
              signal:
                "height/2 - scale('arcHeight', (min_max[1] + " +
                r_conf.average_val +
                " ) / 2)",
            },
            fontSize: {
              value: 8,
            },
            fontStyle: {
              value: "arial",
            },
          },
        },
      },
      {
        name: "abv_avg_text_2",
        type: "text",
        encode: {
          enter: {
            fill: {
              value: r_conf.selection == "above" ? "white" : "grey",
            },
            text: {
              value: " ABOVE UP AVG.",
            },
          },
          update: {
            opacity: {
              value: 1,
            },
            x: {
              signal: "scale('arcHeight', min_max[1]) - 180 ",
            },
            y: {
              signal:
                "height/2 - scale('arcHeight', (min_max[1] + " +
                r_conf.average_val +
                " ) / 2) + 10",
            },
            fontSize: {
              value: 8,
            },
            fontStyle: {
              value: "arial",
            },
          },
        },
      },
      {
        name: "bel_avg_rect",
        type: "rect",
        encode: {
          enter: {
            x: {
              signal: "scale('arcHeight', min_max[1]) - 180",
            },
            y: {
              signal:
                "height/2 - scale('arcHeight', (min_max[0] + " +
                r_conf.average_val +
                ")/2) - 15",
            },
            height: {
              value: 30,
            },
            width: {
              value: 65,
            },
            fill: {
              value: r_conf.selection == "below" ? "#e65858" : "white",
            },
            stroke: {
              value: "black",
            },
            zindex: {
              value: 20000,
            },
            cornerRadius: {
              value: 5,
            },
            strokeWidth: {
              value: 1,
            },
          },
        },
      },
      {
        name: "low_avg_text",
        type: "text",
        encode: {
          enter: {
            fill: {
              value: r_conf.selection == "below" ? "white" : "black",
            },
            text: {
              value:
                r_conf.areas_blw_avg +
                " " +
                (r_conf.area.toLowerCase() === "district" ? "DIST." : "DIV."),
            },
          },
          update: {
            opacity: {
              value: 1,
            },
            x: {
              signal: "scale('arcHeight', min_max[1]) - 150",
            },
            y: {
              signal:
                "height/2 - scale('arcHeight', (min_max[0] + " +
                r_conf.average_val +
                " ) / 2) + 2",
            },
            fontSize: {
              value: 8,
            },
            fontStyle: {
              value: "arial",
            },
          },
        },
      },
      {
        name: "low_avg_text_2",
        type: "text",
        encode: {
          enter: {
            fill: {
              value: r_conf.selection == "below" ? "white" : "grey",
            },
            text: {
              value: " BELOW UP AVG.",
            },
          },
          update: {
            opacity: {
              value: 1,
            },
            x: {
              signal: "scale('arcHeight', min_max[1]) - 180 ",
            },
            y: {
              signal:
                "height/2 - scale('arcHeight', (min_max[0] + " +
                r_conf.average_val +
                " ) / 2) + 10",
            },
            fontSize: {
              value: 8,
            },
            fontStyle: {
              value: "arial",
            },
          },
        },
      },
      {
        name: "chart_dist_names",
        type: "text",
        from: { data: "table" },
        encode: {
          enter: {
            x: { field: { group: "width" }, mult: 0.5 },
            y: { field: { group: "height" }, mult: 0.5 },
            theta: { signal: "(datum.startAngle + datum.endAngle)/2" },
            radius: { signal: "innerRadius + 10" },
            angle: {
              signal:
                "(datum.startAngle+datum.endAngle)*90/PI-90 > 90? (datum.startAngle+datum.endAngle)*90/PI-90 -180: (datum.startAngle+datum.endAngle)*90/PI-90",
            },
            fill: { value: "#000" },
            align: {
              signal:
                "(datum.startAngle+datum.endAngle)*90/PI-90 < 90? 'left': 'right'",
            },
            baseline: { value: "middle" },
            text: {
              signal:
                " (datum.startAngle+datum.endAngle)*90/PI-90 < 90? (upper(datum." +
                r_conf.area +
                " + '      ' + format(datum.value, '0.0f') )) : (upper( format(datum.value, '0.0f') + '     ' + datum." +
                r_conf.area +
                "))",
            },
            fontSize: { value: "8" },
            tooltip: {
              signal:
                "{'" +
                r_conf.area.toUpperCase() +
                "': upper(datum['" +
                r_conf.area +
                "']), 'CURR. SCORE': format(datum.value, '0.2f')}",
              name: "x_tooltip",
            },
          },
        },
      },
    ],
  };

  return spec;
}
