/* exported get_area_chart_spec */
function get_area_chart_spec(_config) {
  _.each(_config.data, function (d) {
    if (d.value == null) d.value = 0;
  });
  var spec = {
    $schema: "https://vega.github.io/schema/vega/v4.json",
    width: _config.width,
    height: _config.height,
    autosize: "fit",
    data: [
      {
        name: "table",
        values: _config.data,
      },
    ],
    scales: [
      {
        name: "xscale",
        type: "band",
        domain: {
          data: "table",
          field: "date",
        },
        range: "width",
        // "padding": 0.7,
        paddingInner: 1,
      },
      {
        name: "yscale",
        domain: {
          data: "table",
          field: "value",
        },
        range: "height",
      },
    ],
    axes: [
      {
        orient: "bottom",
        scale: "xscale",
        ticks: false,
        labelPadding: 5,
        labelFontSize: 8,
        domainColor: "#9E9E9E",
        encode: {
          labels: {
            update: {
              fill: { value: "#999CA1" },
            },
          },
        },
      },
    ],
    marks: [
      {
        type: "area",
        from: {
          data: "table",
        },
        encode: {
          enter: {
            x: {
              scale: "xscale",
              field: "date",
            },
            width: {
              scale: "xscale",
              band: 1,
            },
            y: {
              scale: "yscale",
              field: "value",
            },
            y2: {
              scale: "yscale",
              value: 0,
            },
            fill: {
              value: "rgb(189, 219, 239)",
            },
            fillOpacity: { value: 0.7 },
            interpolate: { value: "linear" },
          },
        },
      },
      {
        name: "color-cell-datum",
        type: "rule",
        from: { data: "table" },
        encode: {
          enter: {
            x: { scale: "xscale", field: "date" },
            width: { scale: "xscale", band: 1 },
            y: { scale: "yscale", field: "value" },
            y2: { scale: "yscale", value: 0 },
          },
          update: {
            stroke: { value: "white" },
            fill: { value: "white" },
          },
        },
      },
      {
        name: "top_line",
        type: "line",
        from: {
          data: "table",
        },
        encode: {
          enter: {
            x: {
              scale: "xscale",
              field: "date",
            },
            y: {
              scale: "yscale",
              field: "value",
            },
            stroke: {
              value: "#007bff",
            },
          },
          update: {},
        },
      },
      {
        type: "symbol",
        from: {
          data: "table",
        },
        encode: {
          enter: {
            x: {
              scale: "xscale",
              field: "date",
            },
            y: {
              scale: "yscale",
              field: "value",
            },
            stroke: {
              value: "#ABD2FF",
            },
            size: {
              value: 70,
            },
          },
          update: {
            fill: { value: "#FFFFFF" },
            tooltip: { signal: "{'Curr. Score': format(datum.value, '0.2f')}" },
          },
        },
      },
      {
        type: "text",
        from: {
          data: "table",
        },
        encode: {
          enter: {
            x: {
              scale: "xscale",
              field: "date",
            },
            y: {
              scale: "yscale",
              field: "value",
              offset: -5,
            },
            text: {
              signal: "format(datum.value,'0.2f')",
            },
            align: {
              value: "center",
            },
            fill: {
              value: "black",
            },
            fontSize: {
              value: 10,
            },
          },
        },
      },
    ],
  };
  return spec;
}

$("body")
  .on("mouseover", ".mark-symbol", function () {
    $("#vg-tooltip-element").addClass(
      "bg-white border border-primary rounded tail-bc"
    );
  })
  .on(".indicator_district_card")
  .mouseout(function () {
    $("#vg-tooltip-element").removeClass(
      "bg-white border border-primary rounded tail-bc"
    );
  });
