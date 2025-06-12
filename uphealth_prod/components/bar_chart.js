/* exported get_barchart_spec */
var get_barchart_spec = function (area) {
  return {
    $schema: "https://vega.github.io/schema/vega/v4.json",
    width: 370,
    height: 68,
    autosize: "pad",
    data: [
      {
        name: "table",
        values: [],
      },
    ],
    scales: [
      {
        name: "xscale",
        type: "band",
        domain: { data: "table", field: area },
        range: "width",
        padding: 0.3,
      },
      {
        name: "yscale",
        type: "linear",
        domain: { data: "table", field: "value" },
        range: "height",
        round: true,
        zero: true,
        nice: true,
      },
      {
        name: "color",
        type: "ordinal",
        domain: { data: "table", field: "position" },
        range: ["#50E3C2", "#4A90E2"],
      },
    ],
    axes: [
      {
        orient: "bottom",
        scale: "xscale",
        ticks: false,
        translate: -1,
        labelPadding: 10,
        labelColor: "#000000",
        domainColor: "#cccc",
        domainOpacity: 0,
      },
    ],
    marks: [
      {
        type: "group",
        from: {
          facet: {
            data: "table",
            name: "facet",
            groupby: area,
          },
        },
        encode: {
          enter: {
            x: { scale: "xscale", field: area },
          },
        },

        signals: [{ name: "width", update: "bandwidth('xscale')" }],

        scales: [
          {
            name: "pos",
            type: "band",
            range: "width",
            domain: { data: "facet", field: "position" },
          },
        ],

        marks: [
          {
            name: "bars",
            from: { data: "facet" },
            type: "rect",
            encode: {
              update: {
                x: { scale: "pos", field: "position" },
                width: { scale: "pos", band: 1 },
                y: { scale: "yscale", field: "value" },
                y2: { scale: "yscale", value: 0 },
                fill: { scale: "color", field: "position" },
                opacity: { signal: "datum.position == 0 ? 1 : 1" },
              },
            },
          },
          {
            type: "text",
            from: { data: "bars" },
            encode: {
              enter: {
                align: { value: "center" },
                baseline: { value: "middle" },
                fill: { value: "#000000" },
              },
              update: {
                y: { field: "y", offset: -6 },
                x: { field: "x", offset: { field: "width", mult: 0.5 } },
                text: { field: "datum.value" },
                opacity: { signal: "datum.datum.position == 0 ? 0.6 : 1" },
              },
            },
          },
        ],
      },
    ],
  };
};
