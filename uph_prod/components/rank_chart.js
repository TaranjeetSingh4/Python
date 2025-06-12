/* exported get_rank_spec */

function get_rank_spec(st_user, _is_pdf, isDivision) {
  var conf = {
    height: st_user && _is_pdf ? 570 : st_user ? 600 : 470,
    width: 720,
    fontSize: st_user ? 8 : 10,
    signal_font_size: st_user ? "height/60" : "height/38",
    isDivision: isDivision ? 1 : 0,
  };
  var data_transform = {
    type: "lookup",
    from: "xnodes",
    key: "month",
    fields: ["month"],
    values: ["newx1"],
    as: ["x1"],
    default: "some label",
  };

  var optimal_json = {
    stroke: {
      scale: "color",
      field: "colorCode",
    },
    strokeWidth: {
      field: "strokeWidth",
    },
    path: {
      field: "path",
    },
    strokeOpacity: [
      {
        test: "indata('data_selected', 'area', datum.area) || length(data('data_selected') == 0 )",
        value: 1,
      },
      {
        test: "length(data('data_selected')) > 0 ? true : false",
        value: 0.1,
      },
      {
        value: 0.5,
      },
    ],
  };

  var rank_spec = {
    $schema: "https://vega.github.io/schema/vega/v4.json",
    height: conf.height,
    width: conf.width,
    autosize: "fit",
    data: [
      {
        name: "rawData",
        values: null,
        transform: [
          {
            type: "formula",
            expr: "datum.rank.m1",
            as: "m1",
          },
          {
            type: "formula",
            expr: "datum.rank.m2",
            as: "m2",
          },
          {
            type: "formula",
            expr: "datum.rank.m3",
            as: "m3",
          },
          {
            type: "formula",
            expr: "ceil(1)",
            as: "size",
          },
        ],
      },
      {
        name: "rawnodes",
        source: "rawData",
        transform: [
          {
            type: "fold",
            fields: ["m1", "m2", "m3"],
            as: ["month", "rank"],
          },
          {
            type: "formula",
            expr: "datum.area+datum.month",
            as: "key",
          },
          {
            type: "stack",
            groupby: ["month"],
            sort: {
              field: "rank",
            },
          },
          {
            type: "formula",
            expr: "(datum.y0+datum.y1)/2",
            as: "yc",
          },
          {
            type: "formula",
            expr: "(datum.color[datum.month])",
            as: "colorCode",
          },
          {
            type: "formula",
            expr: "(datum.months[datum.month])",
            as: "monthName",
          },
        ],
      },
      {
        name: "xnodes",
        source: "rawnodes",
        transform: [
          {
            type: "aggregate",
            groupby: ["month"],
            fields: ["y1"],
            ops: ["max"],
            as: ["temp"],
          },
          {
            type: "formula",
            expr: "width/5",
            as: "temp",
          },
          {
            type: "stack",
            field: "temp",
            as: ["x0", "x1"],
          },
          {
            type: "identifier",
            as: "id",
          },
          {
            type: "formula",
            expr: "datum.x0 * 2",
            as: "newx0",
          },
          {
            type: "formula",
            expr: "datum.newx0 + (width/5)",
            as: "newx1",
          },
        ],
      },
      {
        name: "nodes",
        source: "rawnodes",
        transform: [
          data_transform,
          {
            type: "lookup",
            from: "xnodes",
            key: "month",
            fields: ["month"],
            values: ["newx0"],
            as: ["x0"],
            default: "some label",
          },
        ],
      },
      {
        name: "groups",
        source: "nodes",
        transform: [
          {
            type: "aggregate",
            groupby: ["month"],
            fields: ["size"],
            ops: ["sum"],
            as: ["total"],
          },
          {
            type: "stack",
            groupby: ["month"],
            field: "total",
          },
          {
            type: "formula",
            expr: "scale('y', datum.y0)",
            as: "scaledY0",
          },
          {
            type: "formula",
            expr: "scale('y', datum.y1)",
            as: "scaledY1",
          },
        ],
      },
      {
        name: "destinationNodes1",
        source: "nodes",
        transform: [
          {
            type: "filter",
            expr: "datum.month == 'm2'",
          },
        ],
      },
      {
        name: "destinationNodes2",
        source: "nodes",
        transform: [
          {
            type: "filter",
            expr: "datum.month == 'm3'",
          },
        ],
      },
      {
        name: "pathSet1",
        source: "nodes",
        transform: [
          {
            type: "filter",
            expr: "datum.month == 'm1'",
          },
          {
            type: "lookup",
            from: "destinationNodes1",
            key: "area",
            fields: ["area"],
            as: ["target"],
          },
          {
            type: "linkpath",
            orient: "horizontal",
            shape: "diagonal",
            sourceY: {
              expr: "scale('y', datum.yc)",
            },
            sourceX: {
              expr: "scale('x', datum.x1)",
            },
            targetY: {
              expr: "scale('y', datum.target.yc)",
            },
            targetX: {
              expr: "scale('x', datum.target.x0)",
            },
            as: "path",
          },
          {
            type: "formula",
            expr: "range('y')[0]+scale('y', datum.size)",
            as: "strokeWidth",
          },
        ],
      },
      {
        name: "pathSet2",
        source: "nodes",
        transform: [
          {
            type: "filter",
            expr: "datum.month == 'm2'",
          },
          {
            type: "lookup",
            from: "destinationNodes2",
            key: "area",
            fields: ["area"],
            as: ["target"],
          },
          {
            type: "linkpath",
            orient: "horizontal",
            shape: "diagonal",
            sourceY: {
              expr: "scale('y', datum.yc)",
            },
            sourceX: {
              expr: "scale('x', datum.x1)",
            },
            targetY: {
              expr: "scale('y', datum.target.yc)",
            },
            targetX: {
              expr: "scale('x', datum.target.x0)",
            },
            as: "path",
          },
          {
            type: "formula",
            expr: "range('y')[0]+scale('y', datum.size)",
            as: "strokeWidth",
          },
        ],
      },
      {
        name: "initialRanks",
        source: "nodes",
        transform: [
          {
            type: "filter",
            expr: "datum.month == 'm1'",
          },
        ],
      },
      {
        name: "months",
        source: "rawnodes",
        transform: [
          {
            type: "aggregate",
            groupby: ["monthName", "month"],
          },
          data_transform,
          {
            type: "lookup",
            from: "xnodes",
            key: "month",
            fields: ["month"],
            values: ["newx0"],
            as: ["x0"],
            default: "some label",
          },
        ],
      },
      {
        name: "data_selected",
        source: "rawnodes",
        transform: [
          {
            type: "filter",
            expr: "(datum.area == active ? datum : '')",
          },
        ],
      },
    ],
    signals: [
      {
        name: "active",
        value: null,
        on: [
          {
            events: "rect:mouseover",
            update: "datum.area",
          },
          {
            events: "mouseover[!event.item]",
            update: "datum",
          },
          {
            events: "path:mouseover",
            update: "datum.area",
          },
          {
            events: "@area_name_text:mouseover",
            update: "datum.area",
          },
        ],
      },
      {
        name: "isDivision",
        value: conf.isDivision,
      },
    ],
    scales: [
      {
        name: "x",
        type: "linear",
        range: "width",
        domain: {
          data: "nodes",
          field: "x1",
        },
      },
      {
        name: "y",
        type: "linear",
        range: "height",
        domain: {
          data: "nodes",
          field: "y1",
        },
        reverse: true,
      },
      {
        name: "color",
        type: "ordinal",
        range: ["#528A2E", "#E09C24", "#9B2F2D"],
        domain: ["G", "Y", "R"],
      },
    ],
    axes: [
      {
        orient: "bottom",
        scale: "x",
        domain: false,
        ticks: false,
        labels: false,
      },
      {
        orient: "left",
        scale: "y",
        domain: false,
        ticks: false,
        labels: false,
      },
    ],

    marks: [
      {
        type: "rect",
        name: "blockRect",
        from: {
          data: "nodes",
        },
        encode: {
          update: {
            strokeWidth: {
              value: 2,
            },
            x: {
              scale: "x",
              field: "x0",
            },
            x2: {
              scale: "x",
              field: "x1",
            },
            y: {
              field: "y0",
              scale: "y",
            },
            y2: {
              field: "y1",
              scale: "y",
            },
            fill: {
              scale: "color",
              signal: "(datum.colorCode)",
            },
            fillOpacity: [
              {
                test: "indata('data_selected', 'area', datum.area) || length(data('data_selected') == 0 )",
                value: 1,
              },
              {
                test: "length(data('data_selected')) > 0 ? true : false",
                value: 0.5,
              },
              {
                value: 1,
              },
            ],
          },
        },
      },
      {
        type: "path",
        name: "edgeMark",
        from: {
          data: "pathSet1",
        },
        clip: true,
        encode: {
          update: optimal_json,
          hover: {
            strokeOpacity: {
              value: 1,
            },
          },
        },
      },
      {
        type: "path",
        name: "edgeMark2",
        from: {
          data: "pathSet2",
        },
        clip: true,
        encode: {
          update: optimal_json,
        },
      },
      {
        name: "area_name_text",
        type: "text",
        from: {
          data: "nodes",
        },
        encode: {
          update: {
            x: {
              scale: "x",
              signal: "(datum.x0+datum.x1)/2",
            },
            y: {
              scale: "y",
              signal: "(datum.y0 + datum.y1)/2",
            },
            baseline: {
              value: "middle",
            },
            text: {
              signal:
                " (isDivision == 1) ? datum.area +' (' + datum.rank + ')' : datum.area  ",
            },
            fill: {
              value: "#fff",
            },
            align: {
              value: "center",
            },
            fontSize: {
              value: conf.fontSize,
            },
          },
        },
      },
      {
        type: "text",
        from: {
          data: "initialRanks",
        },
        encode: {
          update: {
            x: {
              value: -20,
            },
            y: {
              scale: "y",
              signal: "(datum.y0 + datum.y1)/2",
            },
            baseline: {
              value: "middle",
            },
            text: {
              signal: "datum.rank",
            },
            fontSize: {
              signal: conf.fontSize,
            },
            fill: {
              value: "#000",
            },
          },
        },
      },
      {
        name: "heading-month-text",
        type: "text",
        from: {
          data: "months",
        },
        encode: {
          update: {
            x: {
              scale: "x",
              signal: "(datum.x0+datum.x1)/2",
            },
            y: {
              value: -25,
            },
            baseline: {
              value: "middle",
            },
            text: {
              signal: "datum.monthName",
            },
            dy: {
              value: 10,
            },
            fontSize: {
              signal: conf.signal_font_size,
            },
            align: {
              value: "center",
            },
          },
        },
      },
    ],
  };

  return rank_spec;
}
