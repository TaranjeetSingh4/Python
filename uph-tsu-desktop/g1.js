/* eslint-disable */
!(function (e, t) {
  "object" == typeof exports && "undefined" != typeof module
    ? t(exports)
    : "function" == typeof define && define.amd
    ? define(["exports"], t)
    : t((e.g1 = e.g1 || {}));
})(this, function (e) {
  "use strict";
  function v(e, t) {
    if (!t) return e;
    var a = {};
    for (var n in e) {
      var r = n.split(":");
      1 == r.length ? (a[r[0]] = e[n]) : r[0] === t && (a[r[1]] = e[n]);
    }
    return a;
  }
  var h = {
    null: {
      null: { state: "null" },
      date: { state: "date" },
      number: { state: "number" },
      boolean: { state: "boolean" },
      string: { state: "string" },
      object: { state: "object" },
      mixed: { state: "mixed", end: !0 },
    },
    date: {
      null: { state: "date" },
      undefined: { state: "date" },
      date: { state: "date" },
      default: { state: "mixed", end: !0 },
    },
    number: {
      null: { state: "number" },
      undefined: { state: "number" },
      number: { state: "number" },
      default: { state: "mixed", end: !0 },
    },
    boolean: {
      null: { state: "boolean" },
      undefined: { state: "boolean" },
      boolean: { state: "boolean" },
      default: { state: "mixed", end: !0 },
    },
    string: {
      null: { state: "string" },
      undefined: { state: "string" },
      string: { state: "string" },
      default: { state: "mixed", end: !0 },
    },
    object: {
      null: { state: "object" },
      object: { state: "object" },
      undefined: { state: "object" },
      default: { state: "mixed", end: !0 },
    },
    mixed: { default: { state: "mixed", end: !0 } },
  };
  function m(e, t) {
    var a = {};
    if (!e || !e.length) return a;
    ((t = t || {}).convert = t.convert || !1), (t.limit = t.limit || 1e3);
    for (
      var n = t.limit < e.length ? t.limit : e.length,
        r = (t.ignore = t.ignore || [null, void 0]),
        i = Object.keys(e[0]),
        o = 0;
      o < i.length;
      o++
    ) {
      for (var l = i[o], s = "null", d = 0; d < n; d++) {
        var c = e[d],
          u = c[l];
        if (
          (0 == o &&
            Object.keys(e[d]).forEach(function (e) {
              -1 == i.indexOf(e) && i.push(e);
            }),
          l in c && !(0 <= r.indexOf(u)))
        ) {
          var f = typeof u;
          null == u
            ? (f = "null")
            : "object" != f || isNaN(Date.parse(u))
            ? t.convert &&
              ((!isNaN(parseFloat(u)) && isFinite(u)) ||
              0 <= ["NaN", "Infinity", "-Infinity"].indexOf(u)
                ? (f = "number")
                : isNaN(Date.parse(u))
                ? -1 != ["true", "false"].indexOf(u) && (f = "boolean")
                : (f = "date"))
            : (f = "date");
          var p = h[f],
            m = p[s] || p.default;
          if (((s = m.state), m.end)) break;
        }
      }
      a[l] = s;
    }
    return a;
  }
  function a(e, t, a) {
    return e ? (-1 != e.indexOf(t) ? !a : a) : a ? null == t : null != t;
  }
  function n(e, t, a) {
    return (
      isNaN(t) && Date.parse(t) && (t = Date.parse(t)),
      isNaN(e) && Date.parse(e) && (e = Date.parse(e)),
      a ? e <= t : e < t
    );
  }
  var t,
    g = {
      "=": function (e, t) {
        return a(e, t, !1);
      },
      "!": function (e, t) {
        return a(e, t, !0);
      },
      ">": function (e, t) {
        return n(e, t, !1);
      },
      "<": function (e, t) {
        return n(t, e, !1);
      },
      ">~": function (e, t) {
        return n(e, t, !0);
      },
      "<~": function (e, t) {
        return n(t, e, !0);
      },
      "~": function (e, t) {
        return a(t, e[0], !1);
      },
      "!~": function (e, t) {
        return a(t, e[0], !0);
      },
    },
    b = {
      string: function (e, t, a) {
        return (
          a || (a = "asc"),
          "desc" == a && (e = [t, (t = e)][0]),
          e.localeCompare(t)
        );
      },
      number: function (e, t, a) {
        return a || (a = "asc"), "desc" == a && (e = [t, (t = e)][0]), e - t;
      },
    };
  function u(e, t, a) {
    var n,
      r,
      i = e;
    t = v((t = t || []), a);
    var o = m(e, { convert: !0 });
    for (var l in t)
      if ("_" != l[0]) {
        var s = l.match(/(!|>|>~|<|<~|~|!~)$/)
          ? l.match(/(!|>|>~|<|<~|~|!~)$/).index
          : l.length;
        (n = "" != l.slice(s) ? l.slice(s) : "="),
          (r = "" != t[l][0] ? t[l] : null);
        var d = l.slice(0, s);
        "number" == o[d]
          ? (r = r.map(function (e) {
              return parseFloat(e);
            }))
          : "boolean" == o[d]
          ? (r = r.map(function (e) {
              return "true" == String(e);
            }))
          : "date" == o[d] &&
            (r = r.map(function (e) {
              return Date.parse(e);
            })),
          (i = i.filter(function (e) {
            return void 0 === e[d] || g[n](r, e[d]);
          }));
      }
    var c = parseInt(t._offset) || 0,
      u = parseInt(t._limit) || 1e3;
    if (((i = i.slice(c, c + u)), t._c)) {
      var f = [],
        p = [];
      t._c.forEach(function (e) {
        "-" == e[0] ? f.push(e.slice(1)) : p.push(e);
      }),
        (i = i.map(function (e) {
          return (function (t, e, a) {
            0 == e.length && (e = Object.keys(t));
            var n = {};
            return (
              e.forEach(function (e) {
                a.indexOf(e) < 0 && (n[e] = t[e]);
              }),
              n
            );
          })(e, p, f);
        }));
    }
    return (
      t._sort &&
        i.sort(function (n, r) {
          var i = !1;
          return (
            t._sort.forEach(function (e) {
              var t = "-" == e[0] ? "desc" : "asc";
              if (("-" == e[0] && (e = e.substr(1)), void 0 !== n[e])) {
                var a = isNaN(n[e]) ? "string" : "number";
                i = i || b[a](n[e], r[e], t);
              }
            }),
            i
          );
        }),
      i
    );
  }
  function r(o, l) {
    return function (e) {
      var t,
        a,
        n,
        r =
          "function" == typeof l.metric
            ? l.metric
            : function (e) {
                return e[l.metric];
              };
      l.scheme &&
        0 !== (n = l.scheme).lastIndexOf("scheme", 0) &&
        (n = "interpolate" + n),
        (a = l.scale
          ? l.scale.replace(/\w+/g, function (e) {
              return e[0].toUpperCase() + e.slice(1).toLowerCase();
            })
          : n
          ? "Sequential"
          : "Linear");
      var i = l.domain || d3.extent(o, r);
      return (
        n
          ? (t = d3["scale" + a](d3[n]).domain(i))
          : l.range && (t = d3["scale" + a]().domain(i).range(l.range)),
        t(r(e))
      );
    };
  }
  var d = 180 / Math.PI,
    i = { translateX: 0, translateY: 0 };
  function y(e) {
    return null == e
      ? i
      : (t || (t = document.createElementNS("http://www.w3.org/2000/svg", "g")),
        t.setAttribute("transform", e),
        (e = t.transform.baseVal.consolidate())
          ? (function (e, t, a, n, r, i) {
              var o, l, s;
              (o = Math.sqrt(e * e + t * t)) && ((e /= o), (t /= o));
              (s = e * a + t * n) && ((a -= e * s), (n -= t * s));
              (l = Math.sqrt(a * a + n * n)) && ((a /= l), (n /= l), (s /= l));
              e * n < t * a && ((e = -e), (t = -t), (s = -s), (o = -o));
              return {
                translateX: r,
                translateY: i,
                rotate: Math.atan2(t, e) * d,
                skewX: Math.atan(s) * d,
                scaleX: o,
                scaleY: l,
              };
            })((e = e.matrix).a, e.b, e.c, e.d, e.e, e.f)
          : i);
  }
  function w(e, t) {
    (this.message = e), (this.options = t);
  }
  function s(e, t, a) {
    return t in e && ((a = e[t]), delete e[t]), a;
  }
  function o(e) {
    for (var t = 1, a = arguments.length; t < a; t++) {
      var n = arguments[t];
      for (var r in n) e[r] = n[r];
    }
    return e;
  }
  function x(e, a, t) {
    var n = e.map(function (e, t) {
      return t;
    });
    if (a) {
      var r = e.map(
        "function" == typeof a
          ? function (e, t) {
              return [a(e), t];
            }
          : function (e, t) {
              return [e[a], t];
            }
      );
      n.sort(function (e, t) {
        var a = r[e][0],
          n = r[t][0];
        return a < n ? -1 : n < a ? 1 : r[e][1] - r[t][1];
      }),
        (t = !t && void 0 !== t);
      for (var i = 0, o = n.length, l = []; i < o; i++)
        l[n[i]] = t ? i : o - i - 1;
      n = l;
    }
    return n;
  }
  function k(e, t) {
    for (var a in t) "object" == typeof t[a] && (t[a] = r(e, t[a]));
    return t;
  }
  var l = ".sanddance",
    j = {
      grid: function (e, t) {
        var a = t.data,
          n = t.width,
          r = t.height,
          i = (n * r) / a.length,
          o = Math.sqrt(i),
          l = Math.ceil(n / o),
          s = Math.ceil(a.length / l),
          d = o * s,
          c = t.filter,
          u = x(
            (a = c
              ? a.filter(function (e, t) {
                  return c(e, t);
                })
              : a),
            t.sort,
            t.ascending
          );
        return (
          (e.transform = function (e, t) {
            var a = (t = u[t]) % l,
              n = Math.floor(t / l);
            return (
              "translate(" +
              (this.dataset._sd_x = a * o) +
              "," +
              (this.dataset._sd_y = d - (n + 1) * o) +
              ")"
            );
          }),
          { attrs: k(a, e), options: t }
        );
      },
      hexpack: function (e, t) {
        var a,
          n = t.data,
          r = t.filter,
          i = x(
            (n = r
              ? n.filter(function (e, t) {
                  return r(e, t);
                })
              : n),
            t.sort,
            t.sort_ascending
          ),
          o = n.length,
          l = [[0, 0]],
          s = 1,
          d = 0;
        for (; d < o; ) {
          for (a = 0; 1 - s <= a; a--) l.push([s, a]);
          for (a = s; 1 <= a; a--) l.push([a, -s]);
          for (a = 0; 1 - s <= a; a--) l.push([a, -s - a]);
          for (a = 0; a <= s - 1; a++) l.push([-s, a]);
          for (a = -s; a <= -1; a++) l.push([a, s]);
          for (a = 0; a <= s - 1; a++) l.push([a, s - a]);
          (d += 6 * s), s++;
        }
        var c = t.width,
          u = t.height,
          f = 2 * s - 1,
          p = c / f,
          m = u / f,
          h = p * Math.cos((60 * Math.PI) / 180),
          g = m * Math.sin((60 * Math.PI) / 180);
        return (
          (l = l.slice(0, o).map(function (e) {
            return [e[0] * p + e[1] * h + c / 2, e[1] * g + u / 2];
          })),
          (e.transform = function (e, t) {
            t = i[t];
            var a = l[t];
            return "translate(" + a[0] + "," + a[1] + ")";
          }),
          { attrs: k(n, e), options: t }
        );
      },
      spiral: function (e, t) {
        var a = t.data,
          n = t.filter,
          r = x(
            (a = n
              ? a.filter(function (e, t) {
                  return n(e, t);
                })
              : a),
            t.sort,
            t.sort_ascending
          ),
          i = s(t, "spiral_size"),
          o = (s(t, "spiral_angle") * Math.PI) / 180,
          l = a.map(function (e, t) {
            return [t * i * Math.cos(t * o), t * i * Math.sin(t * o)];
          });
        return (
          (e.transform = function (e, t) {
            return (t = r[t]), "translate(" + l[t][0] + "," + l[t][1] + ")";
          }),
          { attrs: k(a, e), options: t }
        );
      },
    };
  function E(s, d) {
    d = d || {};
    var e,
      c = d3.dispatch("init", "start", "end");
    d.layout && ((e = j[d.layout](s, d)), (s = e.attrs), (d = e.options));
    var u = d.duration,
      f = d.speed,
      p = d.delay || 0,
      m = d.easing || d3.easeLinear,
      h = d.filter,
      g = d.x,
      v = d.y,
      a = function (e) {
        c.call("init", e);
        var t = h ? e.filter(h) : e,
          a = t.transition().ease(m);
        if (g || v) {
          var r =
              "function" == typeof g
                ? g
                : function () {
                    return g;
                  },
            i =
              "function" == typeof v
                ? v
                : function () {
                    return v;
                  };
          a.attr("transform", function (e, t) {
            var a = r(e, t),
              n = i(e, t);
            return (
              "translate(" +
              (this.dataset._sd_x = a) +
              "," +
              (this.dataset._sd_y = n) +
              ")"
            );
          });
        }
        for (var n in s) a = a.attr(n, s[n]);
        "duration" in d
          ? (a = a.duration(u))
          : f &&
            (a = a.duration(function (e) {
              var t,
                a,
                n = y(this.getAttribute("transform")),
                r = n.translateX,
                i = n.translateY,
                o = this.dataset._sd_x,
                l = this.dataset._sd_y;
              return (
                (((t = o - r), (a = l - i), Math.sqrt(t * t + a * a)) /
                  ("function" == typeof f ? f(e) : f)) *
                1e3
              );
            })),
          p &&
            (a = a.delay(function (e) {
              return "function" == typeof p ? p(e) : p;
            }));
        var o = t.size(),
          l = 0;
        a.on("start.count", function () {
          0 === l && c.call("start", e), l++;
        }),
          a.on("end interrupt", function () {
            if (!(0 < --o)) {
              if (0 === o) return c.call("end", e);
              throw new w("sanddance: Invalid count: " + o, d);
            }
          });
      };
    return (
      (a.on = function (e, t) {
        return c.on(e + l, t), a;
      }),
      (a.update = function (e, t) {
        return E(o({}, s, e), o({}, d, t));
      }),
      a
    );
  }
  E.chain = function () {
    for (var e = 0, t = arguments.length - 1; e < t; e++)
      !(function (e, t) {
        e.on("end" + l, function () {
          this.call(t);
        });
      })(arguments[e], arguments[e + 1]);
    return arguments[0];
  };
  var q = [
      "href",
      "protocol",
      "origin",
      "userinfo",
      "username",
      "password",
      "hostname",
      "port",
      "relative",
      "pathname",
      "directory",
      "file",
      "search",
      "hash",
    ],
    C = ["searchKey", "searchList"],
    c =
      /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
    f = /(?:^|&)([^&=]*)=?([^&]*)/g,
    p = function (e) {
      return decodeURIComponent(e.replace(/\+/g, "%20"));
    },
    I = encodeURIComponent;
  function O(e) {
    for (
      var t = { toString: S, join: M, update: T }, a = c.exec(e || ""), n = 14;
      n--;

    )
      t[q[n]] = a[n] || "";
    var r = (t[C[0]] = {}),
      i = (t[C[1]] = {});
    return (
      t[q[12]].replace(f, function (e, t, a) {
        t &&
          ((t = p(t)),
          (a = p(a)),
          (r[t] = a),
          (i[t] = i[t] || []),
          i[t].push(a));
      }),
      t
    );
  }
  function S(e) {
    var t,
      a,
      n,
      r,
      i = (e = e || this)[q[1]] || "http",
      o = e[q[4]],
      l = e[q[5]],
      s = e[q[6]],
      d = e[q[7]],
      c = e[q[9]],
      u = e[q[12]],
      f = e[q[13]],
      p = e[C[0]],
      m = e[C[1]],
      h = s ? [i, "://"] : [],
      g = [];
    if (
      (o && (h.push(o), l && h.push(":", l), h.push("@")),
      h.push(s),
      d && h.push(":", d),
      h.push(c || (s ? "/" : "")),
      u)
    )
      h.push("?", u);
    else {
      if (m)
        for (t in m) {
          for (n = 0, r = (a = m[t]).length; n < r; n++)
            g.push(I(t) + "=" + I(a[n]));
          r || g.push(t);
        }
      else if (p) for (t in p) g.push(I(t) + "=" + I(p[t]));
      g.length && h.push("?", g.join("&"));
    }
    return f && h.push("#", f), h.join("");
  }
  function M(e, t) {
    t = t || {};
    var a,
      n,
      r = this,
      i = r[q[9]].split("/"),
      o = i.length - 1,
      l = O(e),
      s = l.pathname.split("/"),
      d = s.length;
    for (
      void 0 === t.query && (t.query = !0),
        void 0 === t.hash && (t.hash = !0),
        a = 0;
      a < 14;
      a++
    )
      9 != a &&
        (12 != a || t.query) &&
        (13 != a || t.hash) &&
        l[q[a]] &&
        (r[q[a]] = l[q[a]]);
    for (
      t.query && l[q[12]] && ((r[C[0]] = l[C[0]]), (r[C[1]] = l[C[1]])), a = 0;
      a < d;
      a++
    )
      "." == (n = s[a])
        ? (i[o] = "")
        : ".." == n
        ? (i[--o] = "")
        : "" === n
        ? 1 < d && (a || ((i[0] = n), (o = 1)), a == d - 1 && (i[o] = n))
        : ((i[o] = n), a < d - 1 && o++);
    var c = (r[q[9]] = i.slice(0, o + 1).join("/")),
      u = c.split(/\//),
      f = [c];
    return (
      r[q[12]] && f.push("?", r[q[12]]),
      r[q[13]] && f.push("#", r[q[13]]),
      (r[q[8]] = f.join("")),
      (r[q[10]] = u.slice(0, u.length - 1).join("/") + "/"),
      (r[q[11]] = u[u.length - 1]),
      r
    );
  }
  function T(e, t) {
    var a,
      n,
      r,
      i,
      o,
      l,
      s,
      d = this[C[0]],
      c = this[C[1]],
      u = [],
      f = {};
    if (t)
      if ((t = "" + t).match(/[&=]/)) f = O("?" + t).searchKey;
      else for (a in e) f[a] = t;
    for (a in e) {
      if (null === (n = e[a])) c[a] = [];
      else if ((Array.isArray(n) || (n = [n]), f[a])) {
        a in c || (c[a] = []);
        for (o = {}, r = 0, i = n.length; r < i; r++) o[n[r].toString()] = 1;
        if ((t = "" + f[a]).match(/add/i)) c[a] = c[a].concat(n);
        else if (t.match(/del/i)) {
          for (s = [], r = 0, i = (l = c[a]).length; r < i; r++)
            o[l[r]] || s.push(l[r]);
          c[a] = s;
        } else if (t.match(/toggle/i)) {
          for (s = [], r = 0, i = (l = c[a]).length; r < i; r++)
            o[l[r]] ? (o[l[r]] = 2) : s.push(l[r]);
          for (n in o) 1 == o[n] && s.push(n);
          c[a] = s;
        }
      } else c[a] = n;
      0 === c[a].length
        ? (delete d[a], delete c[a])
        : (d[a] = c[a][c[a].length - 1]);
    }
    for (a in c)
      for (r = 0, i = (n = c[a]).length; r < i; r++)
        u.push(I(a) + "=" + I(n[r]));
    return (this.search = u.join("&")), this;
  }
  function Q(e, t) {
    return e.filter(t).add(e.find(t));
  }
  function N(e, t, a) {
    var n = e.data(t);
    return void 0 === n || !1 === n || null === n
      ? a
      : "string" != typeof n || !n.match(/^(false|off|n|no)$/i);
  }
  var A = {
    attr: "href",
    event: "click change submit",
    selector: ".urlfilter",
    src: "src",
  };
  var z = { parse: O, unparse: S, join: M, update: T };
  function D(i, o, l, s) {
    return (
      (o = o || $("<div>")),
      (l = l || []),
      (s = s || []),
      "limit" in i || (i.limit = 10),
      i.limit--,
      $.ajax(i)
        .done(function (e, t, a) {
          if (
            (l.push(i),
            s.push(e),
            o.trigger({ type: "load", request: i, response: e, xhr: a }),
            i.chain && 0 < i.limit)
          ) {
            try {
              var n = i.chain(e, i, a);
            } catch (e) {
              o.trigger({ type: "error", request: i, xhr: a, exception: e }),
                console.warn("$.ajaxchain: chain() exception", e);
            }
            if ($.isPlainObject(n) && !$.isEmptyObject(n))
              var r = D($.extend(!0, {}, i, n), o, l, s);
          }
          r || o.trigger({ type: "done", request: l, response: s });
        })
        .fail(function (e, t, a) {
          o.trigger({ type: "error", request: i, xhr: e }),
            o.trigger({ type: "done", request: l, response: s }),
            console.warn("$.ajaxchain: ajax error", a);
        }),
      o
    );
  }
  "undefined" != typeof jQuery &&
    jQuery.extend(jQuery.fn, {
      urlfilter: function (e) {
        if (0 != this.length) {
          var t = this[0].ownerDocument,
            f = $.extend({}, A, e || {}, this.dataset),
            p = f.remove || N(this, "remove"),
            a = f.event
              .split(/\s+/)
              .map(function (e) {
                return e + ".urlfilter";
              })
              .join(" "),
            m = f.location || (t.defaultView || t.parentWindow).location,
            h = f.history || (t.defaultView || t.parentWindow).history;
          return this.on(a, f.selector, function (e) {
            var r,
              t = $(this),
              i = t.data("mode") || f.mode,
              a = t.data("target") || f.target,
              n = t.data("src") || f.src,
              o = N(t, "remove", p);
            if ("change" == e.type || $(e.target).is(":input:not(:button)")) {
              var l = encodeURIComponent(t.attr("id") || t.attr("name")),
                s = encodeURIComponent(t.val());
              r = "?" + l + "=" + s;
            } else if ("submit" == e.type || $(e.target).is("form"))
              e.preventDefault(), (r = "?" + t.serialize());
            else {
              if ("click" != e.type) return;
              $(e.target).is("a") && e.preventDefault(), (r = t.attr(f.attr));
            }
            var d = O(r),
              c = d.searchList;
            function u(e) {
              var t = O(e).join(r, { query: !1, hash: !1 }).update(c, i);
              if (o) {
                var a = {};
                for (var n in t.searchKey)
                  "" === t.searchKey[n] && (a[n] = null);
                t.update(a);
              }
              return t.toString();
            }
            a
              ? "#" == a
                ? (m.hash = u(m.hash.replace(/^#/, "")))
                : a.match(/^pushstate$/i)
                ? h.pushState({}, "", u(m.href))
                : $(a).each(function () {
                    var e = $(this),
                      t = u(e.attr(n));
                    e.attr(n, t).load(t, function () {
                      e.trigger({ type: "load", url: t });
                    });
                  })
              : (m.href = u(m.href)),
              t.trigger({ type: "urlfilter", url: d });
          });
        }
      },
    }),
    (D.list = function (n) {
      return function (e, t) {
        var a = n.indexOf(t.url) + 1;
        if (a < n.length) return { url: n[a] };
      };
    }),
    (D.cursor =
      "undefined" == typeof _
        ? function () {
            throw new Error("ajaxchain.cursor requires lodash");
          }
        : function (a, n) {
            return function (e) {
              var t = _.get(e, n);
              if (t) return _.set({}, a, t);
            };
          }),
    "undefined" != typeof jQuery && jQuery.extend(jQuery, { ajaxchain: D });
  var R =
      "<% var urlfilterClass = key ? 'urlfilter' : '',\r\nmultiple = multiple ? 'multiple' : '',\r\nkey = key ? key : '' %> <select class=\"selectpicker border <%- urlfilterClass %>\" id=\"<%- key %>\" <%-multiple%>></select>",
    U =
      '<div class="alert alert-warning" role="alert"><p class="text-center"> <%- message %> </p></div>',
    F = Object.freeze({
      template_dropdown: R,
      template_dropdown_options:
        '<% _.each(data, function(item) { %> <option value="<%- item %>"><%- item %></option> <% }) %>',
      template_dropdown_object:
        '<% _.each(data, function(item) { %> <option value="<%- item[value_key] %>" label="<%- item[label_key] %>"><%- item[label_key] %></option> <% }) %>',
      template_error: U,
    }),
    P = function (e) {
      return !(
        !(n = e) ||
        "object" != typeof n ||
        ((t = e),
        "[object RegExp]" === (a = Object.prototype.toString.call(t)) ||
          "[object Date]" === a ||
          t.$$typeof === H)
      );
      var t, a, n;
    };
  var H =
    "function" == typeof Symbol && Symbol.for
      ? Symbol.for("react.element")
      : 60103;
  function J(e, t) {
    return !1 !== t.clone && t.isMergeableObject(e)
      ? X(((a = e), Array.isArray(a) ? [] : {}), e, t)
      : e;
    var a;
  }
  function V(e, t, a) {
    return e.concat(t).map(function (e) {
      return J(e, a);
    });
  }
  function X(e, t, a) {
    ((a = a || {}).arrayMerge = a.arrayMerge || V),
      (a.isMergeableObject = a.isMergeableObject || P);
    var n,
      r,
      i,
      o,
      l = Array.isArray(t);
    return l === Array.isArray(e)
      ? l
        ? a.arrayMerge(e, t, a)
        : ((n = e),
          (r = t),
          (o = {}),
          (i = a).isMergeableObject(n) &&
            Object.keys(n).forEach(function (e) {
              o[e] = J(n[e], i);
            }),
          Object.keys(r).forEach(function (e) {
            i.isMergeableObject(r[e]) && n[e]
              ? (o[e] = X(n[e], r[e], i))
              : (o[e] = J(r[e], i));
          }),
          o)
      : J(t, a);
  }
  X.all = function (e, a) {
    if (!Array.isArray(e)) throw new Error("first argument should be an array");
    return e.reduce(function (e, t) {
      return X(e, t, a);
    }, {});
  };
  var G,
    K = X,
    W = { target: "", multiple: !1, value_key: "value", label_key: "label" };
  "undefined" != typeof jQuery &&
    jQuery.extend(jQuery.fn, {
      dropdown: function (e) {
        var n = $(this),
          a = K(W, e);
        function t(e) {
          (a.data = e),
            a.key &&
              n.urlfilter({
                selector: "select.urlfilter",
                target: a.target,
                event: "change",
                remove: !0,
              });
          var t =
            "object" == typeof e[0]
              ? "template_dropdown_object"
              : "template_dropdown_options";
          n.find(".selectpicker")
            .html(_.template(F[t])(a))
            .selectpicker(a.options);
        }
        return (
          n.html(_.template(R)(a)),
          a.data
            ? (t(a.data),
              a.value &&
                n.find(".selectpicker").val(a.value).selectpicker("refresh"),
              n.trigger({ type: "load" }))
            : a.url &&
              (t(["Loading..."]),
              $.ajax(a.url)
                .fail(function (e, t, a) {
                  n.html(_.template(U)({ message: a }));
                })
                .done(function (e) {
                  t(e),
                    n.find(".selectpicker").selectpicker("refresh"),
                    n.trigger({ type: "load" });
                })),
          this
        );
      },
    });
  try {
    new Event("click"),
      (G = function (e, t) {
        return new Event(e, t);
      });
  } catch (e) {
    G = function (e, t) {
      var a = document.createEvent("event");
      return a.initEvent(e, t.bubbles, t.cancelable), a;
    };
  }
  "undefined" != typeof jQuery &&
    jQuery.extend(jQuery.fn, {
      dispatch: function (e, t) {
        return this.each(function () {
          this.dispatchEvent(
            G(e, $.extend({ bubbles: !0, cancelable: !0 }, t))
          );
        });
      },
    });
  var Y =
      '<label for="<%- id %>" data-label="<%= label %>" class="<%- labelClass %>"><input type="checkbox" name="<%- name %>" id="<%- id %>" class="<%- inputClass %>" value="<%- value %>" <%- checked ? "checked": "" %>> <%= label %> </label>',
    B = Object.freeze({
      template_:
        '<div class="position-relative"><div class="formhandler"><div class="note"></div><div class="formhandler-table-header d-flex justify-content-between mb-2"><div class="d-flex flex-wrap"><div class="edit"></div><div class="add"></div><div class="count"></div><div class="page"></div><div class="size"></div></div><div class="d-flex"><div class="filters"></div><div class="export"></div></div></div><div class="<%- (options.table == \'grid\') ? \'table_grid\' : \'table\' %>"></div></div><div class="loader pos-cc d-none"><div class="fa fa-spinner fa-spin fa-3x fa-fw"></div><span class="sr-only">Loading...</span></div></div><div class="modal formhandler-table-modal" id="fh-modal-<%- idcount %>" tabindex="-1" role="dialog" aria-labelledby="fh-label-<%- idcount %>" aria-hidden="true"><div class="modal-dialog modal-sm" role="document"><div class="modal-content"><form class="formhandler-table-modal-form modal-body"><label id="fh-label-<%- idcount %>" for="formhandler-table-modal-value">Value</label><p><input class="form-control" name="filter_input"></p><div><button type="button" class="btn btn-sm btn-secondary mr-1" data-dismiss="modal">Cancel</button><button type="submit" class="btn btn-sm btn-primary mr-1">Apply filter</button><a class="btn btn-sm btn-danger remove-action urlfilter" data-dismiss="modal" data-target="#" href="#">Remove filter</a></div></form></div></div></div><div class="modal formhandler-unique-table-modal" id="fh-unique-modal-<%- idcount %>" tabindex="-1" role="dialog" aria-labelledby="fh-unique-label-<%- idcount %>" aria-hidden="true"><div class="modal-dialog modal-sm" role="document"><div class="modal-content"><form class="formhandler-table-modal-form modal-body p-3"><div><input class="form-control mb-2" placeholder="search..." autocomplete="off" type="search" data-search="data-label" data-target=".fh-unique .fh-label-unique-values" data-hide-class="d-none"><div class="fh-unique overflow-auto border p-2" style="max-height: 30vh; min-height: 30vh"></div><div class="mt-2"><button type="submit" class="btn btn-sm btn-primary mr-1">ok</button><button type="button" class="btn btn-sm btn-secondary mr-1" data-dismiss="modal">Cancel</button></div></div></form></div></div></div>',
      template_checkbox: Y,
      template_table:
        '<%\r\n  var filtered_cols = args[\'_c\'] && args[\'_c\'].length != options.columns.length ?\r\n                      options.columns.filter(function(col) { return args[\'_c\'].indexOf(\'-\' + col.name) < 0 }) :\r\n                      options.columns\r\n  var cols = options.columns.length ? filtered_cols : meta.columns;\r\n  cols = cols.filter(function(col) { return col.hide !== true})\r\n  var form_id = idcount\r\n%> <table class="table table-sm table-striped"><thead> <% _.each(cols, function(colinfo) {\r\n        col_defaults(colinfo, data)\r\n        var menu_item = false\r\n        var col_id = idcount++\r\n        var qsort = parse(\'?\')\r\n        var isSorted = _.includes(args[\'_sort\'], colinfo.name) ? {op: \'\', cls: \'table-primary\'} : _.includes(args[\'_sort\'], \'-\' + colinfo.name) ? {op: \'-\', cls: \'table-danger\'} : {}\r\n      %> <th class="<%- isSorted.cls %>" data-col="<%- colinfo.name %>"><div class="dropdown"><a href="#" class="dropdown-toggle text-nowrap" id="fh-dd-<%- col_id %>" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"> <%- colinfo.title || colinfo.name %> </a><div class="dropdown-menu" aria-labelledby="fh-dd-<%- col_id %>"> <% _.each(colinfo.sort, function(title, op) { menu_item = true\r\n              qsort = qsort.update({_sort: args[\'_sort\'] || []})\r\n              if (!_.isEmpty(isSorted))\r\n                qsort = qsort.update({_sort: [colinfo.name, \'-\' + colinfo.name]}, \'del\')\r\n              var active = _.includes(args[\'_sort\'], op + colinfo.name) %> <a class="dropdown-item urlfilter <%- active ? \'active\': \'\' %>" href="<%- qsort.update({_sort: [op + colinfo.name]}, active ? \'del\': \'add\').toString() %>"> <%- title %> </a> <% }) %> <% if (menu_item) { %> <div class="dropdown-divider"></div> <% menu_item = false } %> <% _.each(colinfo.filters, function(title, op) { menu_item = true %> <a class="dropdown-item <%= colinfo.name + op in args ? \'active\' : \'\' %>" href="#" data-op="<%- op %>" data-toggle="modal" data-target="#fh-modal-<%- form_id %>"> <%- title %> </a> <% }) %> <% if (menu_item) { menu_item = false %><div class="dropdown-divider"></div><% } %> <% if (colinfo.unique) { menu_item = true %> <a class="dropdown-item" href="#" data-toggle="modal" data-target="#fh-unique-modal-<%- form_id %>">Filter by values...</a> <% } %> <% if (menu_item) {\r\n              menu_item = false %> <div class="dropdown-divider"></div> <% } %> <% if (colinfo.hideable) { %> <a class="dropdown-item urlfilter" href="?_c=-<%- encodeURIComponent(colinfo.name) %>" data-mode="add">Hide</a> <% } %> </div></div></th> <% }) %> </thead><tbody> <% if (isAdd) { %> <tr class="new-row"> <% _.each(cols, function(colinfo) {\r\n          if (!colinfo.template) { %> <td data-key="<%- colinfo.name %>"> <% var isEditable = colinfo.editable === undefined ? true : colinfo.editable %> <%= _.template(templates[\'template_editable\'])({isEditable: isEditable, val: undefined}) %> </td> <% } else { %> <td></td> <% } %> <% }) %> </tr> <% } %> <% if (options.rowTemplate) { %> <% _.each(data, function(row, rowIndex) { %> <%= typeof options.rowTemplate == \'function\' ? options.rowTemplate({row: row, data: data, index: rowIndex}) : _.template(options.rowTemplate)({row: row, data: data, index: rowIndex}) %> <% }) %> <% } else {%> <% _.each(data, function(row, rowIndex) { %> <tr data-val="<%- JSON.stringify(row) %>" data-row="<%- rowIndex %>"> <% _.each(cols, function(colinfo) { %> <% var fmt = typeof(colinfo.format),\r\n            val = row[colinfo.name],\r\n            isEditable = colinfo.editable === undefined ? true : colinfo.editable,\r\n            disp = fmt == "function" ?\r\n              colinfo.format({name: colinfo.name, value: val, index: rowIndex, row: row, data:data }) :\r\n            fmt === "string" && colinfo.type === "number" ?\r\n              numeral(val).format(colinfo.format) :\r\n            fmt === "string" && colinfo.type === "date" ?\r\n              moment(val).format(colinfo.format):\r\n              val,\r\n            col_link\r\n          %> <% if (!isEdit && \'link\' in colinfo)  var col_link = typeof colinfo.link == \'function\' ? colinfo.link({name: colinfo.name, value: val, format: disp, index: rowIndex, row: row, data: data}) : _.template(colinfo.link)({name: colinfo.name, value: val, format: disp, index: rowIndex, row: row, data: data}) %> <% if (colinfo.template) { %> <%= typeof colinfo.template == \'function\' ? colinfo.template({name: colinfo.name, value: val, format: disp, link: col_link, index: rowIndex, row: row, data: data}) : _.template(colinfo.template)(({name: colinfo.name, value: val, format: disp, link: col_link, index: rowIndex, row: row, data: data})) %> <% } else if (col_link) { %> <td><a href="<%- col_link %>" target="_blank"> <%= disp %> </a></td> <% } else if (isEdit && isEditable) { %> <td data-key="<%- colinfo.name %>"> <%= _.template(templates[\'template_editable\'])({isEditable: isEditable, val: val}) %> </td> <% } else { %> <td><a class="urlfilter" href="?<%- encodeURIComponent(colinfo.name) %>=<%- encodeURIComponent(val) %>&_offset="> <%= disp %> </a></td> <% } %> <% }) %> </tr> <% }) %> <% } %> </tbody></table>',
      template_editable:
        '<% if (isEditable.input == \'select\') { %> <select <% for (key in isEditable.attrs) { %> <%= key + \'="\' + isEditable.attrs[key] + \'"\' %> <% } %> class="form-control form-control-sm"><option value="" disabled selected>-- select --</option> <% _.each(isEditable.options, function(item) { %> <option <%- val && val === item ? \'selected\': null %> value="<%- item %>"> <%- item %> </option> <% }) %> </select> <% } else if (isEditable.input == \'radio\') { %> <% _.each(isEditable.options, function(item) { %> <input type="radio" <%- val && val === item ? \'checked\': null %> value="<%- item %>" <% for (key in isEditable.attrs) { %> <%= key + \'="\' + isEditable.attrs[key] + \'"\' %> <% } %> class="form-control form-control-sm"> <%- item %> <br> <% }) %> <% } else { %> <input type="<%- isEditable.input || \'text\' %>" value="<%- val %>" <% for (key in isEditable.attrs) { %> <%= key + \'="\' + isEditable.attrs[key] + \'"\' %> <% } %> class="form-control form-control-sm"> <% } %> <% if (isEditable.validationMessage) { %> <div class="invalid-feedback"> <%- isEditable.validationMessage %> </div> <% } %>',
      template_page:
        '<% var page = 1 + Math.floor(meta.offset / meta.limit),\r\n      last_page = \'count\' in meta ? Math.floor((meta.count + meta.limit - 1) / meta.limit) : meta.rows < meta.limit ? page : null,\r\n      lo = Math.max(page - 2, 1),\r\n      hi = last_page !== null ? Math.min(last_page, page + 2) : page + 2 %> <ul class="pagination pagination-sm mr-2"><li class="page-item <%- page <= 1 ? \'disabled\' : \'\' %>"><a class="page-link" href="?_offset=<%- meta.offset - meta.limit %>">Previous</a></li> <% if (lo > 1) { %> <li class="page-item"><a class="page-link" href="?_offset=">1</a></li> <% if (lo > 2) { %> <li class="page-item disabled"><a class="page-link" href="#">...</a></li> <% } %> <% } %> <% _.each(_.range(lo, hi + 1), function(pg) { %> <li class="page-item <%- pg == page ? \'active\' : \'\' %>"><a class="page-link" href="?_offset=<%- meta.limit * (pg - 1) || \'\' %>"> <%- pg %> </a></li> <% }) %> <% if (\'count\' in meta) { %> <% if (hi + 1 < last_page) { %> <li class="page-item disabled"><a class="page-link" href="#">...</a></li> <% } %> <% if (hi < last_page || lo > hi) { %> <li class="page-item"><a class="page-link" href="?_offset=<%- meta.limit * (last_page - 1) %>"> <%- last_page %> </a></li> <% } %> <% } %> <li class="page-item <%- (last_page === null) || (page < last_page) ? \'\' : \'disabled\' %>"><a class="page-link" href="?_offset=<%- meta.offset + meta.limit %>">Next</a></li></ul>',
      template_size:
        '<% if (meta.limit) { %> <div class="btn-group btn-group-sm mr-2" role="group"><button id="formhandler-size-<%- idcount++ %>" type="button" class="btn btn-light btn-sm dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"> <%- meta.limit %> rows</button><div class="dropdown-menu" aria-labelledby="formhandler-size-<%- idcount %>"> <% _.each(options.sizeValues, function(size) { %> <a class="dropdown-item <%- meta.limit == size ? \'active\' : \'\' %> urlfilter" href="?_limit=<%- size %>"> <%- size %> </a> <% }) %> </div></div> <% } %>',
      template_count:
        "<% if ('count' in meta) { %> <span class=\"btn btn-sm btn-light mr-2\"> <%- meta.count %> rows</span> <% } %>",
      template_edit:
        '<button type="submit" class="btn btn-success mr-2 btn-sm edit-btn">Edit</button>',
      template_add:
        '<button type="button" class="btn btn-success mr-2 btn-sm add-btn">Add</button>',
      template_export:
        '<div class="btn-group btn-group-sm" role="group"><button id="formhandler-export-<%- idcount++ %>" type="button" class="btn btn-light btn-sm dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Export as</button><div class="dropdown-menu dropdown-menu-right" aria-labelledby="formhandler-export-<%- idcount %>"> <% _.each(options.exportFormats, function(label, key) { var args_limit = args; args_limit._limit = 9999999 %> <a class="dropdown-item" href="<%- parse(options.src).update(args_limit).update({_format: key}) %>"> <%- label %> </a> <% }) %> </div></div>',
      template_filters:
        '<div class="p-1"><%\r\n  var qparts = parse(\'?\')\r\n  _.each(args[\'_c\'], function(col_name) {\r\n    qparts.update({_c: col_name}, \'add\')\r\n    var hide_col = col_name[0] == \'-\'\r\n    var display_name = hide_col ? col_name.slice(1) : col_name %> <a href="?_c=<%- encodeURIComponent(col_name) %>" data-mode="del" class="badge badge-pill <%- hide_col ? \'badge-dark\' : \'badge-danger\' %> urlfilter" title="<%- hide_col ? \'Show\' : \'Hide\' %> column <%- display_name %>"> <%- display_name %> </a> <% })\r\n  _.each(args, function(list_values, key) {\r\n    if (key.charAt(0) !== \'_\' && key !== \'c\') {\r\n      _.each(args[key], function(col_name) {\r\n        var update = {}\r\n        update[key] = col_name\r\n        qparts.update(update, \'add\') %> <a href="?<%- encodeURIComponent(key) %>=<%- encodeURIComponent(col_name) %>" data-mode="del" class="badge badge-pill badge-dark urlfilter" title="Clear <%- key %> filter"> <%- key %> = <%- col_name %> </a> <% })\r\n    }\r\n  })\r\n  qparts = qparts.toString()\r\n  if (qparts && qparts != \'?\') { %> <a href="?<%- qparts.slice(1) %>" class="badge badge-pill badge-danger urlfilter" data-mode="del" title="Clear all filters">×</a> <% } %> </div>',
      template_error:
        '<div class="alert alert-warning alert-dismissible" role="alert"> <%- message %> <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">×</span></button></div>',
      template_table_grid:
        '<%\r\n  var filtered_cols = args[\'_c\'] && args[\'_c\'].length != options.columns.length ?\r\n                      options.columns.filter(function(col) { return args[\'_c\'].indexOf(\'-\' + col.name) < 0 }) :\r\n                      options.columns\r\n  var cols = options.columns.length ? filtered_cols : meta.columns\r\n  var form_id = idcount, img\r\n  if (options.rowTemplate) {\r\n    _.each(data, function(row, rowIndex) { %> <%= typeof options.rowTemplate == \'function\' ? options.rowTemplate({row: row, index: rowIndex, data: data}) : _.template(options.rowTemplate)({row: row, data: data, index: rowIndex}) %> <% })\r\n} else { %> <div class="formhandler-grid row"> <% _.each(data, function(row, rowIndex) { %> <div class="col-sm-3 <%= options.classes || \'formhandler-grid-cell d-inline-block p-3 box-shadow\' %>"><div class="thumbnail"> <% img = options.icon ? ((typeof(options.icon) == \'function\' ? options.icon({row: row, data: data, index: rowIndex}) : options.icon)) : \'fa fa-home\' %> <% if (img.indexOf(\'fa \') >= 0) { %> <i class="<%= img %>"></i> <% } else { %> <img class="img img-responsive" src="<%= img %>"> <% } %> <div class="caption"> <% _.each(cols, function(colinfo) {\r\n              var fmt = typeof(colinfo.format),\r\n                  val = row[colinfo.name],\r\n                  disp = (fmt == "function" ? colinfo.format({index: rowIndex, name: colinfo.name, value: val, row: row, data:data }) :\r\n                          fmt === "string" && colinfo.type === "number" ? numeral(val).format(colinfo.format) :\r\n                          fmt === "string" && colinfo.type === "date" ? moment(val).format(colinfo.format) :\r\n                          val) %> <div><strong><%= colinfo.name %></strong>: <% if (\'link\' in colinfo) {\r\n                    var col_link = typeof colinfo.link == \'function\' ? colinfo.link({row: row, value: val, index: rowIndex, name: colinfo.name, data: data, format: disp}) : _.template(colinfo.link)({row: row, value: val, index: rowIndex, name: colinfo.name, data: data, format: disp}) %> <a href="<%- col_link %>" target="_blank"><%= disp %></a> <% } else { %> <a class="urlfilter" href="?<%- encodeURIComponent(colinfo.name) %>=<%- encodeURIComponent(val) %>&_offset="> <%= disp %> </a> <% } %> </div> <% }) %> </div></div></div> <% }) %> </div> <% } %>',
    }),
    Z = [
      "",
      "table",
      "edit",
      "add",
      "page",
      "size",
      "count",
      "export",
      "filters",
      "error",
      "table_grid",
    ],
    ee = {
      table: !0,
      edit: !1,
      add: !1,
      page: !0,
      pageSize: 100,
      size: !0,
      sizeValues: [10, 20, 50, 100, 500, 1e3],
      count: !0,
      export: !0,
      exportFormats: { xlsx: "Excel", csv: "CSV", json: "JSON", html: "HTML" },
      filters: !0,
      onhashchange: !0,
    },
    te = ["filters", "ignored", "excluded", "sort", "offset", "limit", "count"],
    ae = {
      text: {
        "": "Equals...",
        "!": "Does not equal...",
        "~": "Contains...",
        "!~": "Does not contain...",
      },
      number: {
        "": "Equals...",
        "!": "Does not equal...",
        "<": "Less than...",
        ">": "Greater than...",
      },
      date: {
        "": "Equals...",
        "!": "Does not equal...",
        "<": "Before...",
        ">": "After...",
      },
    };
  function ne(e) {
    "sort" in e && !0 !== e.sort
      ? "object" != typeof e.sort && (e.sort = {})
      : (e.sort = { "": "Sort ascending", "-": "Sort descending" }),
      (e.type = e.type || "text"),
      ("filters" in e && !0 !== e.filters) || (e.filters = ae[e.type]),
      "hideable" in e || (e.hideable = !0),
      "hide" in e || (e.hide = !1);
  }
  function re(e, t, a, n, r) {
    if (!e || a[e]) {
      var i;
      if (e) {
        "grid" == a[e] && (e = "table_grid");
        var o = a[e + "Target"] || "." + e;
        0 == (i = $(o, n)).length && (i = $(o));
      } else i = n;
      i.html(r[e](t));
    }
  }
  function ie(e, t, a) {
    var n = $(".note", e);
    n.length || (n = $('<div class="note"></div>').appendTo(e)),
      n.html(t.error({ message: a }));
  }
  function oe(e, t, a, n, r) {
    var i = n + ": " + r;
    0 == a.readyState && (i += " (cannot connect to server)"), ie(e, t, i);
  }
  function le(e, t) {
    $("tbody :input", e)
      .on("change", function () {
        $(this).parents("tr").addClass("edited-row");
      })
      .on("keypress", function (e) {
        13 == e.keyCode && ($(this).blur(), t.trigger("click"));
      })
      .eq(0)
      .focus();
  }
  "undefined" != typeof jQuery &&
    jQuery.extend(jQuery.fn, {
      formhandler: function (t) {
        return (
          t || (t = {}),
          this.each(function () {
            var m = $(this);
            m.urlfilter({
              selector: ".urlfilter, .page-link",
              target: "#",
              remove: !0,
            });
            var h = $.extend({}, ee, t, m.data());
            h.columns
              ? "string" == typeof h.columns &&
                (h.columns = _.map(h.columns.split(/\s*,\s*/), function (e) {
                  return { name: e };
                }))
              : (h.columns = []);
            var d,
              c,
              r,
              i,
              o,
              l,
              g = {};
            function s(e, t, a) {
              (a.rows = e.length),
                (a.columns = e.length
                  ? _.map(e[0], function (e, t) {
                      return { name: t };
                    })
                  : []);
              var n = _.find(h.columns, function (e) {
                return "*" === e.name;
              });
              if (n) {
                var r = _.cloneDeep(a.columns);
                _.map(h.columns, function (t) {
                  _.find(a.columns, function (e) {
                    return e.name === t.name;
                  }) ||
                    "*" === t.name ||
                    r.push(t);
                }),
                  (r = _.map(r, function (t) {
                    var e = _.find(h.columns, function (e) {
                      return e.name === t.name;
                    });
                    return e || $.extend({}, n, t);
                  }));
              }
              h.columns = r || h.columns;
              var i,
                o,
                l,
                s,
                d,
                c,
                u,
                f,
                p = {
                  data: e,
                  meta: a,
                  args: t,
                  options: h,
                  idcount: 0,
                  parse: O,
                  col_defaults: ne,
                  isEdit: !1,
                  isAdd: !1,
                  templates: B,
                };
              m.data("formhandler", p),
                _.each(Z, function (e) {
                  re(e, p, h, m, g);
                }),
                h.add &&
                  ((i = m),
                  (o = p),
                  (l = h),
                  (s = g),
                  $(".add button", i).on("click", function () {
                    var e = $(".add button", i),
                      t = $(".edit button", i);
                    if ("save" == e.html().toLowerCase()) {
                      e.html("Add"), t.prop("disabled", !1);
                      var a = $(".new-row td[data-key]");
                      $(".loader", i).removeClass("d-none");
                      var n = {};
                      if (
                        ($.each(a, function (e, t) {
                          n[t.getAttribute("data-key")] = $(t).children().val();
                        }),
                        !_.some(n))
                      )
                        return (
                          $(".loader", i).addClass("d-none"),
                          (o.isAdd = !1),
                          void re("table", o, l, i, s)
                        );
                      $.ajax(l.src, {
                        method: "POST",
                        dataType: "json",
                        data: n,
                      })
                        .done(function () {
                          o.data.unshift(n),
                            (o.isAdd = !1),
                            re("table", o, l, i, s),
                            l.add.done && l.add.done();
                        })
                        .always(function () {
                          $(".loader", i).addClass("d-none");
                        })
                        .fail(oe.bind(this, i, s));
                    } else "add" == e.html().toLowerCase() && (e.html("Save"), t.prop("disabled", !0), (o.isAdd = !0), re("table", o, l, i, s), le(i, e));
                  })),
                h.edit &&
                  ((d = m),
                  (c = p),
                  (u = h),
                  (f = g),
                  $(".edit button", d).on("click", function () {
                    var e = $(".edit button", d),
                      t = $(".add button", d);
                    if ("save" == e.html().toLowerCase()) {
                      var a = $(".edited-row");
                      0 < a.length && $(".loader", d).removeClass("d-none");
                      var i = [],
                        o = !0;
                      if (
                        ($.each(a, function (e, t) {
                          var a,
                            n = JSON.parse(t.getAttribute("data-val")),
                            r = t.getAttribute("data-row");
                          for (e in n)
                            $(
                              'td[data-key="' +
                                ((a = e), a.toString().replace(/["']/g, "")) +
                                '"] :input',
                              t
                            ).each(function () {
                              this.checkValidity()
                                ? ($(this).removeClass("is-invalid"),
                                  (n[e] = c.data[r][e] = $(this).val()))
                                : ($(this).addClass("is-invalid"), (o = !1));
                            });
                          i.push(
                            $.ajax(u.src, {
                              method: "PUT",
                              dataType: "json",
                              data: n,
                            })
                              .fail(oe.bind(this, d, f))
                              .always(function () {
                                $(".loader", d).addClass("d-none"),
                                  u.add.editFunction && u.add.editFunction();
                              })
                          );
                        }),
                        !o)
                      )
                        return;
                      $.when.apply($, i).then(function () {
                        $(".loader", d).addClass("d-none"),
                          e.html("Edit"),
                          t.prop("disabled", !1),
                          u.edit.done && u.edit.done();
                      }),
                        (c.isEdit = !1),
                        re("table", c, u, d, f);
                    } else "edit" == e.html().toLowerCase() && (e.html("Save"), t.prop("disabled", !0), (c.isEdit = !0), re("table", c, u, d, f), le(d, e), d.trigger({ type: "editmode" }));
                  }));
            }
            function e() {
              var e = O(location.hash.replace(/^#/, "")).searchList;
              e = v(e, h.name);
              var i = _.extend(
                {
                  c: h.columns.map(function (e) {
                    return e.name;
                  }),
                  _limit: h.pageSize,
                  _format: "json",
                  _meta: "y",
                },
                e
              );
              function t(e, t, a) {
                var n = {};
                if (
                  (_.each(te, function (e) {
                    var t = a ? a.getResponseHeader("Fh-Data-" + e) : null;
                    null !== t && (n[e] = JSON.parse(t));
                  }),
                  "function" == typeof h.transform)
                ) {
                  var r =
                    h.transform({ data: e, meta: n, options: h, args: i }) ||
                    {};
                  (e = "data" in r ? r.data : e),
                    (n = "meta" in r ? r.meta : n);
                }
                _.isEmpty(n) &&
                  h.page &&
                  h.size &&
                  ((n.offset = i._offset ? parseInt(i._offset) : 0),
                  (n.limit = parseInt(i._limit)),
                  (n.count = e.length),
                  (e = u(e, i))),
                  s(e, i, n),
                  m.trigger({
                    type: "load",
                    formdata: e,
                    meta: n,
                    args: i,
                    options: h,
                  });
              }
              $(".loader", m).removeClass("d-none"),
                h.data && "object" == typeof h.data
                  ? ((h.edit = !1), (h.add = !1), t(h.data))
                  : $.ajax(h.src, {
                      dataType: "json",
                      data: i,
                      traditional: !0,
                    })
                      .done(t)
                      .always(function () {
                        $(".loader", m).addClass("d-none");
                      })
                      .fail(oe.bind(this, m, g));
            }
            _.each(Z, function (e) {
              var t =
                h[e ? e + "Template" : "template"] ||
                B["template_" + e] ||
                "NA";
              g[e] = _.template(t);
            }),
              (d = m)
                .on("shown.bs.modal", ".formhandler-table-modal", function (e) {
                  var t = $(e.relatedTarget),
                    a = d.data("formhandler"),
                    n = t.data("op"),
                    r = t.closest("[data-col]").data("col"),
                    i = "";
                  a.args[r + n]
                    ? ((i = a.args[r + n].join(",")),
                      $(".remove-action", this)
                        .attr("href", "?" + r + n + "=")
                        .show())
                    : $(".remove-action", this).hide(),
                    $("input", this)
                      .val(i)
                      .attr("name", r + n)
                      .focus(),
                    $("label", this).text(t.text());
                })
                .on(
                  "shown.bs.modal",
                  ".formhandler-unique-table-modal",
                  function (e) {
                    var t = $(e.relatedTarget),
                      n = t.closest("[data-col]").data("col");
                    if (c != n || !$.trim($(".fh-unique", d).html())) {
                      var a = d.data("formhandler");
                      c = n;
                      var r = _.find(a.options.columns, function (e) {
                          return e.name == n;
                        }).unique,
                        i = O("?" + location.hash.replace(/^#\?/, ""))
                          .searchList[n],
                        o = [];
                      o.push({
                        label: "All",
                        id: "fh-select-all",
                        labelClass: "d-block",
                        inputClass: "fh-select-all mr-2",
                        checked: !1,
                        value: "",
                        name: "",
                      }),
                        r.sort().map(function (e, t) {
                          var a = !1;
                          i && 0 <= i.indexOf(e) && (a = !0),
                            o.push({
                              label: e,
                              value: e,
                              name: n,
                              labelClass: "fh-label-unique-values",
                              id: n + t,
                              checked: a,
                              inputClass: "fh-unique-values mr-2",
                            });
                        });
                      var l = "";
                      o.map(function (e) {
                        l += "<div>" + _.template(Y)(e) + "</div>";
                      }),
                        $(".fh-unique", $(".formhandler-unique-table-modal", d))
                          .html("")
                          .append(l),
                        s(".fh-select-all", !0)(),
                        $(".fh-unique-values", d).on(
                          "change",
                          s(".fh-select-all", !0)
                        ),
                        $(".fh-select-all", d).on(
                          "change",
                          s(
                            ".fh-label-unique-values:not(.d-none) input.fh-unique-values",
                            !1
                          )
                        ),
                        jQuery.fn.search
                          ? ($(".formhandler-unique-table-modal").search(),
                            $('input[type="search"]', d).trigger("search"),
                            $('input[type="search"]', d).on(
                              "shown.g.search",
                              s(".fh-select-all", !0)
                            ))
                          : $('input[type="search"]', d).remove();
                    }
                    function s(t, a) {
                      return function () {
                        var e = $(
                          ".fh-unique .fh-label-unique-values:not(.d-none)",
                          d
                        );
                        $(".fh-unique-values:checked", e).length == e.length
                          ? $(t, d).prop("checked", a)
                          : $(t, d).prop("checked", !a);
                      };
                    }
                  }
                )
                .on(
                  "submit",
                  "form.formhandler-table-modal-form",
                  function (e) {
                    e.preventDefault();
                    var t = O(location.hash.replace(/^#/, ""));
                    "" === $(e.currentTarget).serialize() &&
                      t.update(t.searchList, c + "=del");
                    var a = O("?" + $(e.currentTarget).serialize()).searchList;
                    $(this).closest(".modal").modal("hide"),
                      (window.location.hash = "#" + t.update(a));
                  }
                ),
              (i = h),
              (o = g),
              (l = {
                delete: function (e) {
                  return $.ajax(i.src, {
                    method: "DELETE",
                    dataType: "json",
                    data: e.row,
                  }).done(function () {
                    $('tr[data-row="' + e.index + '"]', r).remove();
                  });
                },
              }),
              (r = m).on("click", "[data-action]", function () {
                var e = {
                    row: $(this).closest("[data-val]").data("val"),
                    index: $(this).closest("[data-row]").data("row"),
                    notify: ie.bind(this, r, o),
                  },
                  t = $(this).data("action"),
                  a =
                    i.actions &&
                    0 <
                      i.actions.filter(function (e) {
                        return t in e;
                      }).length
                      ? i.actions.filter(function (e) {
                          return t in e;
                        })[0][t]
                      : l[t],
                  n = a(e);
                n &&
                  n.always &&
                  ($(".loader", r).removeClass("d-none"),
                  n
                    .always(function () {
                      $(".loader", r).addClass("d-none");
                    })
                    .fail(oe.bind(this, r, o)));
              }),
              h.onhashchange && $(window).on("hashchange", e),
              e();
          }),
          this
        );
      },
    });
  var se = {
    selector: '[data-toggle="highlight"]',
    target: ".highlight-target",
    mode: "hover",
    classes: "active",
  };
  "undefined" != typeof jQuery &&
    jQuery.extend(jQuery.fn, {
      highlight: function (e) {
        return (
          this.each(function () {
            var n = $.extend({}, se, e, this.dataset),
              r = this;
            Q($(this), n.selector).each(function () {
              var t = $.extend({}, n, this.dataset),
                a = $(this).off(".g1.highlight"),
                e =
                  "click" == t.mode
                    ? "click.g1.highlight"
                    : "mouseenter.g1.highlight mouseleave.g1.highlight";
              a.on(e, function () {
                var e = $(t.target, r).toggleClass(t.classes);
                a.trigger({ type: "highlight", target: e });
              });
            });
          }),
          this
        );
      },
    }),
    "undefined" != typeof L &&
      (L.TopoJSON = L.GeoJSON.extend({
        addData: function (e) {
          if ("Topology" === e.type)
            for (var t in e.objects)
              L.GeoJSON.prototype.addData.call(
                this,
                topojson.feature(e, e.objects[t])
              );
          else L.GeoJSON.prototype.addData.call(this, e);
        },
      }));
  var de = "search-last",
    ce = "search-results",
    ue = {
      selector: "[data-search]",
      hideClass: "",
      showClass: "",
      transform: "strip",
      change: "words",
    };
  function fe(e) {
    var l = $.extend({}, ue, e, this.data());
    return (
      this.off(".g.search")
        .on("keyup.g.search change.g.search", l.selector, t)
        .on("refresh.g.search", s)
        .on("search.g.search", function (e) {
          s(e), t(e);
        }),
      this.filter(l.selector).on("keyup.g.search change.g.search", t),
      this
    );
    function s(e) {
      var t = $.extend({}, l, e.target.dataset),
        a =
          "@text" == t.search
            ? function (e) {
                return e.textContent;
              }
            : function (e) {
                return e.getAttribute(t.search);
              },
        n = fe.transforms[t.transform],
        r = $(t.target)
          .map(function () {
            var e = a(this);
            return { el: $(this), original: e, text: n(e), show: !0 };
          })
          .get();
      return $(e.target).data(ce, r).removeData(de), r;
    }
    function t(e) {
      var t = $.extend({}, l, e.target.dataset),
        a = $(e.target),
        n = { type: "shown.g.search", searchText: a.val() };
      if (
        ((n.search = fe.changes[t.change](
          fe.transforms[t.transform](n.searchText)
        )),
        a.data(de) != n.search)
      ) {
        a.data(de, n.search);
        var r = t.hideClass,
          i = t.showClass,
          o = new RegExp(n.search || ".*");
        (n.results = a.data(ce) || s(e)),
          (n.matches = n.results.length),
          n.results.forEach(function (e) {
            var t = e.text.match(o);
            t !== e.show &&
              (r && e.el[t ? "removeClass" : "addClass"](r),
              i && e.el[t ? "addClass" : "removeClass"](i),
              (e.show = t)),
              t || n.matches--;
          }),
          a.trigger(n);
      }
    }
  }
  function pe(n, r) {
    return (
      Q(
        this,
        (r = r || {}).selector ||
          this.data("selector") ||
          'script[type="text/html"]'
      ).each(function () {
        var t = $(this),
          e = t.data(me);
        if (e) e(n, r);
        else {
          var a = t.attr("src");
          a
            ? $.get(a)
                .done(function (e) {
                  ge(t, e, n, r);
                })
                .fail(function (e) {
                  (n.xhr = e), ge(t, t.html(), n, r);
                })
            : ge(t, t.html(), n, r);
        }
      }),
      this
    );
  }
  (fe.transforms = {
    strip: function (e) {
      return (e || "")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .replace(/^ /, "")
        .replace(/ $/, "");
    },
  }),
    (fe.changes = {
      words: function (e) {
        return e.replace(/\s+/g, ".*");
      },
    }),
    "undefined" != typeof jQuery && jQuery.extend(jQuery.fn, { search: fe });
  var me = "template.render",
    he = "template.prev_target";
  function ge(i, o, e, l) {
    var s,
      d = _.template(o);
    function t(e, t) {
      o = d(e);
      var a = i.data("append") || (t ? t.append : l.append),
        n = i.data("target") || (t ? t.target : l.target),
        r = i.data("engine") || (t ? t.engine : l.engine);
      return (
        (r && "string" != typeof r) ||
          (r = pe.engines[r] || pe.engines.default),
        a
          ? n
            ? $(n).append($($.parseHTML(o)))
            : i.before($($.parseHTML(o)))
          : ((s = r(i, n, o)), i.data(he, s)),
        i.trigger({ type: "template", templatedata: e, target: s }),
        s
      );
    }
    return i.data(me, t), t(e);
  }
  function ve(e, a) {
    return (
      e &&
      a &&
      e.length === a.length &&
      e.every(function (e, t) {
        return e === a[t];
      })
    );
  }
  ((pe.engines = {}).default = pe.engines.jquery =
    function (e, t, a) {
      var n = $($.parseHTML(a));
      if (t) $(t).html(n);
      else {
        var r = e.data(he);
        r && r.remove(), e.before(n);
      }
      return n;
    }),
    (pe.engines.vdom = function (e, t, a) {
      var n, r, i;
      if ((t = t || e.data(he))) {
        var o = (n = $(t)).get(0);
        (r = "<" + o.nodeName),
          $.each(o.attributes, function () {
            r += " " + this.name + "=" + this.value;
          }),
          (r += ">"),
          (i = "</" + o.nodeName + ">");
      } else (r = "<div>"), (i = "</div>"), (n = $(r + i).insertBefore(e));
      return (
        n.each(function () {
          morphdom(this, r + a + i);
        }),
        n
      );
    }),
    "undefined" != typeof jQuery && jQuery.extend(jQuery.fn, { template: pe }),
    "undefined" != typeof jQuery &&
      jQuery.extend(jQuery.fn, {
        urlchange: function () {
          var i,
            o,
            l = this,
            s = l.get(0).location,
            d = {};
          return l
            .on("hashchange.urlchange", function () {
              var e = O(s.hash.replace(/^#/, "")),
                t = {};
              for (var a in $.extend({}, e.searchList, d)) {
                var n = e.searchList[a] || [];
                if (!ve(n, d[a] || [])) {
                  var r = 0 < n.length ? n[0] : "";
                  l.trigger({ type: "#?" + a, hash: e, vals: n, old: i }, r),
                    (d[a] = t[a] = n);
                }
              }
              o != e.pathname &&
                (l.trigger({ type: "#/", hash: e, old: i }, e.pathname),
                (t["/"] = o = e.pathname)),
                $.isEmptyObject(t) ||
                  l.trigger({ type: "#", hash: e, change: t, old: i }, e),
                (i = e);
            })
            .trigger("hashchange");
        },
      }),
    "undefined" != typeof jQuery &&
      jQuery.extend(jQuery.fn, {
        translate: function (u) {
          return (
            (u = u || {}),
            this.each(function () {
              var n = $(this),
                e = n.attr("lang") || u.source || "",
                t = n.attr("lang-target") || u.target;
              if (!t) throw new Error("$.translate has no target");
              if (t != e) {
                for (
                  var a,
                    r = [],
                    i = [],
                    o = [],
                    l = document.createTreeWalker(
                      this,
                      NodeFilter.SHOW_TEXT,
                      null,
                      !1
                    );
                  (a = l.nextNode());

                ) {
                  var s = a.textContent,
                    d = $.trim(s);
                  d && (r.push(a), i.push(s), o.push(d));
                }
                var c = { q: o, source: e, target: t };
                $.ajax({
                  url: n.attr("lang-url") || u.url || "translate",
                  data: c,
                  traditional: !0,
                })
                  .done(function (e) {
                    e.forEach(function (e, t) {
                      (e.node = r[t]),
                        (e.node.textContent = i[t].replace(e.q, e.t));
                    }),
                      n.trigger({ type: "translate", translate: e });
                  })
                  .fail(function (e, t, a) {
                    n.trigger({ type: "error", request: c, xhr: e }),
                      console.warn("$.translate: error", a);
                  });
              }
            }),
            this
          );
        },
      }),
    (e.version = "0.15.0"),
    (e.datafilter = u),
    (e.fuzzysearch = function (i, e) {
      var t;
      t = (e = e || {}).keys
        ? i.map(function (t) {
            return e.keys
              .map(function (e) {
                return "function" == typeof e ? e(t) : t[e];
              })
              .join(" ");
          })
        : i;
      var o = e.limit || 100,
        l = e.case ? "" : "i",
        s = e.depth || 10,
        d = e.escape || !0;
      return function (e) {
        var a,
          n = [],
          r = t.slice();
        return (
          (e = e.replace(/^\s/, "").replace(/\s$/, "")),
          d && (e = e.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")),
          (a = new RegExp(e.replace(/\s+/, "\\s+"), l)),
          r.forEach(function (e, t) {
            e && a.test(e) && (n.push(i[t]), (r[t] = ""));
          }),
          s <= 1 ||
            n.length >= o ||
            ((a = new RegExp(e.replace(/\s+/, ".*"), l)),
            r.forEach(function (e, t) {
              e && a.test(e) && (n.push(i[t]), (r[t] = ""));
            }),
            s <= 2 ||
              n.length >= o ||
              ((a = e.split(/\s+/).map(function (e) {
                return new RegExp(e, l);
              })),
              r.forEach(function (t, e) {
                t &&
                  a.every(function (e) {
                    return e.test(t);
                  }) &&
                  (n.push(i[e]), (r[e] = ""));
              }),
              s <= 3 ||
                n.length >= o ||
                ((a = e.split(/\s+/).map(function (e) {
                  return new RegExp(e.replace(/(.)/g, "$&[\\S]*"), l);
                })),
                r.forEach(function (t, e) {
                  t &&
                    a.every(function (e) {
                      return e.test(t);
                    }) &&
                    (n.push(i[e]), (r[e] = ""));
                }),
                (a = new RegExp(e.replace(/(.)/g, "$&.*"), l)),
                r.forEach(function (e, t) {
                  e && a.test(e) && (n.push(i[t]), (r[t] = ""));
                }),
                s <= 4 || n.length))),
          n.slice(0, o)
        );
      };
    }),
    (e.sanddance = E),
    (e.scale = r),
    (e.types = m),
    (e.url = z),
    Object.defineProperty(e, "__esModule", { value: !0 });
});
