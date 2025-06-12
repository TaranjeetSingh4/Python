/* exported get_trend_line_spec */
function get_trend_line_spec() {
  var spec = {
    $schema: "https://vega.github.io/schema/vega/v5.json",
    // "width": 500,
    // "height": 200,
    autosize: "fit",
    data: [
      {
        name: "table",
        values: [],
      },
    ],

    scales: [
      {
        name: "x",
        type: "point",
        range: "width",
        domain: { data: "table", field: "x" },
      },
      {
        name: "y",
        type: "linear",
        range: "height",
        nice: true,
        zero: true,
        domain: { data: "table", field: "y" },
      },
    ],

    axes: [
      {
        orient: "bottom",
        scale: "x",
        ticks: false,
        labelPadding: 4,
        encode: { labels: { update: { fill: { value: "#999CA1" } } } },
      },
    ],

    marks: [
      {
        type: "group",
        marks: [
          {
            type: "line",
            from: { data: "table" },
            encode: {
              enter: {
                x: { scale: "x", field: "x" },
                y: { scale: "y", field: "y" },
                stroke: { value: "#F5A623" },
                strokeWidth: { value: 1 },
              },
              update: {
                interpolate: { value: "linear" },
                fillOpacity: { value: 1 },
              },
              hover: {
                fillOpacity: { value: 0.5 },
              },
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
                  scale: "x",
                  field: "x",
                },
                y: {
                  scale: "y",
                  field: "y",
                },
              },
              update: {
                stroke: { value: "#F5A623" },
                size: {
                  value: 35,
                },
                fill: { value: "#FFFFFF" },
                tooltip: { signal: "format(datum.value, '0.2f')" },
              },
              hover: {
                fill: { value: "#F5A623" },
                fillOpacity: { value: 1 },
                size: { value: 75 },
              },
            },
          },
        ],
      },
    ],
  };
  return spec;
}
