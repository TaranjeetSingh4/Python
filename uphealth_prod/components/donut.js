/* exported get_donut_spec */

function get_donut_spec() {
  var _width = 150,
    _height = 80;
  /* Adjust width for ipad alignment */
  if (window.innerWidth <= 1024) {
    _width = 100;
    _height = 60;
  }

  var spec1 = {
    $schema: "https://vega.github.io/schema/vega/v4.json",
    width: _width,
    height: _height,
    autosize: "none",
    signals: [
      { name: "startAngle", value: -1.57079632 },
      { name: "endAngle", value: 1.57079632 },
      { name: "minDimension", update: "width >= height ? height : width" },
    ],
    data: [
      {
        name: "data_table",
        values: [
          {
            id: "1",
            count: 72,
          },
        ],
        transform: [
          {
            type: "formula",
            expr: "[datum.count, 100 - datum.count]",
            as: "count2",
          },
          {
            type: "flatten",
            fields: ["count2"],
          },
          {
            type: "pie",
            field: "count2",
            sort: false,
            startAngle: { signal: "startAngle" },
            endAngle: { signal: "endAngle" },
          },
          {
            type: "formula",
            expr: "datum.count/100",
            as: "percent",
          },
        ],
      },
    ],
    scales: [
      {
        name: "color",
        type: "ordinal",
        domain: { data: "data_table", field: "count2" },
        range: ["#ffa10e"],
      },
    ],
    marks: [
      {
        type: "arc",
        from: { data: "data_table" },
        encode: {
          enter: {
            x: { signal: "width/2" },
            y: { signal: "3*height/4" },
            fill: { scale: "color", field: "count2" },
            startAngle: { field: "startAngle" },
            endAngle: { field: "endAngle" },
            innerRadius: { signal: "minDimension/2" },
            outerRadius: { signal: "3 * minDimension/4" },
            fillOpacity: {
              signal: "indexof(data('data_table'),datum) == 0 ? 1 : 0.5",
            },
          },
        },
      },
      {
        type: "text",
        from: { data: "data_table" },
        encode: {
          enter: {
            fontWeight: { signal: "minDimension" },
            fontSize: { signal: "minDimension/3" },
            x: { signal: "width/2" },
            y: { signal: "height/2" },
            baseline: { value: "top" },
            fill: { value: "#000000" },
            align: { value: "center" },
            text: {
              signal: "datum.count == datum.count2 ? datum.percent : null",
            },
          },
        },
      },
    ],
    config: {},
  };
  return spec1;
}
