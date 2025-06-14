/* eslint-disable */

// Copyright 2012 Google Inc. All rights reserved.
(function () {
  var data = {
    resource: {
      version: "1",

      macros: [{ function: "__e" }, { function: "__cid" }],
      tags: [
        {
          function: "__rep",
          once_per_event: true,
          vtp_containerId: ["macro", 1],
          tag_id: 1,
        },
      ],
      predicates: [{ function: "_eq", arg0: ["macro", 0], arg1: "gtm.js" }],
      rules: [
        [
          ["if", 0],
          ["add", 0],
        ],
      ],
    },
    runtime: [],
  };

  /*

     Copyright The Closure Library Authors.
     SPDX-License-Identifier: Apache-2.0
    */
  var h,
    aa = function (a) {
      var b = 0;
      return function () {
        return b < a.length ? { done: !1, value: a[b++] } : { done: !0 };
      };
    },
    ba =
      "function" == typeof Object.create
        ? Object.create
        : function (a) {
            var b = function () {};
            b.prototype = a;
            return new b();
          },
    ea;
  if ("function" == typeof Object.setPrototypeOf) ea = Object.setPrototypeOf;
  else {
    var fa;
    a: {
      var ia = { a: !0 },
        ja = {};
      try {
        ja.__proto__ = ia;
        fa = ja.a;
        break a;
      } catch (a) {}
      fa = !1;
    }
    ea = fa
      ? function (a, b) {
          a.__proto__ = b;
          if (a.__proto__ !== b) throw new TypeError(a + " is not extensible");
          return a;
        }
      : null;
  }
  var ka = ea,
    ma = function (a, b) {
      a.prototype = ba(b.prototype);
      a.prototype.constructor = a;
      if (ka) ka(a, b);
      else
        for (var c in b)
          if ("prototype" != c)
            if (Object.defineProperties) {
              var d = Object.getOwnPropertyDescriptor(b, c);
              d && Object.defineProperty(a, c, d);
            } else a[c] = b[c];
      a.Vj = b.prototype;
    },
    na = this || self,
    oa = function (a) {
      return a;
    };
  var pa = function () {},
    ra = function (a) {
      return "function" == typeof a;
    },
    k = function (a) {
      return "string" == typeof a;
    },
    sa = function (a) {
      return "number" == typeof a && !isNaN(a);
    },
    ta = Array.isArray,
    ua = function (a, b) {
      if (a && ta(a))
        for (var c = 0; c < a.length; c++) if (a[c] && b(a[c])) return a[c];
    },
    wa = function (a, b) {
      if (!sa(a) || !sa(b) || a > b) (a = 0), (b = 2147483647);
      return Math.floor(Math.random() * (b - a + 1) + a);
    },
    Aa = function (a, b) {
      for (var c = new za(), d = 0; d < a.length; d++) c.set(a[d], !0);
      for (var e = 0; e < b.length; e++) if (c.get(b[e])) return !0;
      return !1;
    },
    Ba = function (a, b) {
      for (var c in a) Object.prototype.hasOwnProperty.call(a, c) && b(c, a[c]);
    },
    Ca = function (a) {
      return (
        !!a &&
        ("[object Arguments]" == Object.prototype.toString.call(a) ||
          Object.prototype.hasOwnProperty.call(a, "callee"))
      );
    },
    Da = function (a) {
      return Math.round(Number(a)) || 0;
    },
    Ea = function (a) {
      return "false" == String(a).toLowerCase() ? !1 : !!a;
    },
    Fa = function (a) {
      var b = [];
      if (ta(a)) for (var c = 0; c < a.length; c++) b.push(String(a[c]));
      return b;
    },
    Ga = function (a) {
      return a ? a.replace(/^\s+|\s+$/g, "") : "";
    },
    Ha = function () {
      return new Date(Date.now());
    },
    Ia = function () {
      return Ha().getTime();
    },
    za = function () {
      this.prefix = "gtm.";
      this.values = {};
    };
  za.prototype.set = function (a, b) {
    this.values[this.prefix + a] = b;
  };
  za.prototype.get = function (a) {
    return this.values[this.prefix + a];
  };
  var Ja = function (a, b, c) {
      return a && a.hasOwnProperty(b) ? a[b] : c;
    },
    Ka = function (a) {
      var b = a;
      return function () {
        if (b) {
          var c = b;
          b = void 0;
          try {
            c();
          } catch (d) {}
        }
      };
    },
    La = function (a, b) {
      for (var c in b) b.hasOwnProperty(c) && (a[c] = b[c]);
    },
    Ma = function (a) {
      for (var b in a) if (a.hasOwnProperty(b)) return !0;
      return !1;
    },
    Na = function (a, b) {
      for (var c = [], d = 0; d < a.length; d++)
        c.push(a[d]), c.push.apply(c, b[a[d]] || []);
      return c;
    },
    Oa = function (a, b) {
      for (var c = {}, d = c, e = a.split("."), f = 0; f < e.length - 1; f++)
        d = d[e[f]] = {};
      d[e[e.length - 1]] = b;
      return c;
    },
    Pa = /^\w{1,9}$/,
    Qa = function (a, b) {
      a = a || {};
      b = b || ",";
      var c = [];
      Ba(a, function (d, e) {
        Pa.test(d) && e && c.push(d);
      });
      return c.join(b);
    };
  var Ra,
    Sa = function () {
      if (void 0 === Ra) {
        var a = null,
          b = na.trustedTypes;
        if (b && b.createPolicy) {
          try {
            a = b.createPolicy("goog#html", {
              createHTML: oa,
              createScript: oa,
              createScriptURL: oa,
            });
          } catch (c) {
            na.console && na.console.error(c.message);
          }
          Ra = a;
        } else Ra = a;
      }
      return Ra;
    };
  var Ua = function (a, b) {
    this.m = b === Ta ? a : "";
  };
  Ua.prototype.toString = function () {
    return this.m + "";
  };
  var Ta = {};
  var Va = /^(?:(?:https?|mailto|ftp):|[^:/?#]*(?:[/?#]|$))/i;
  function Wa() {
    var a = na.navigator;
    if (a) {
      var b = a.userAgent;
      if (b) return b;
    }
    return "";
  }
  function Xa(a) {
    return -1 != Wa().indexOf(a);
  }
  var Ya = {},
    Za = function (a, b, c) {
      this.m = c === Ya ? a : "";
    };
  Za.prototype.toString = function () {
    return this.m.toString();
  };
  var $a = function (a) {
      return a instanceof Za && a.constructor === Za
        ? a.m
        : "type_error:SafeHtml";
    },
    ab = function (a) {
      var b = Sa(),
        c = b ? b.createHTML(a) : a;
      return new Za(c, null, Ya);
    }; /*

     SPDX-License-Identifier: Apache-2.0
    */
  function bb(a) {
    if (null !== a && void 0 !== a.tagName) {
      if ("script" === a.tagName.toLowerCase())
        throw Error("Use setTextContent with a SafeScript.");
      if ("style" === a.tagName.toLowerCase())
        throw Error("Use setTextContent with a SafeStyleSheet.");
    }
  }
  var B = window,
    G = document,
    cb = navigator,
    db = G.currentScript && G.currentScript.src,
    eb = function (a, b) {
      var c = B[a];
      B[a] = void 0 === c ? b : c;
      return B[a];
    },
    fb = function (a, b) {
      b &&
        (a.addEventListener
          ? (a.onload = b)
          : (a.onreadystatechange = function () {
              a.readyState in { loaded: 1, complete: 1 } &&
                ((a.onreadystatechange = null), b());
            }));
    },
    gb = { async: 1, nonce: 1, onerror: 1, onload: 1, src: 1, type: 1 },
    hb = { onload: 1, src: 1, width: 1, height: 1, style: 1 };
  function ib(a, b, c) {
    b &&
      Ba(b, function (d, e) {
        d = d.toLowerCase();
        c.hasOwnProperty(d) || a.setAttribute(d, e);
      });
  }
  var lb = function (a, b, c, d) {
      var e = G.createElement("script");
      ib(e, d, gb);
      e.type = "text/javascript";
      e.async = !0;
      var f,
        g = Sa(),
        l = g ? g.createScriptURL(a) : a;
      f = new Ua(l, Ta);
      e.src =
        f instanceof Ua && f.constructor === Ua
          ? f.m
          : "type_error:TrustedResourceUrl";
      var m,
        n,
        p = ((e.ownerDocument && e.ownerDocument.defaultView) || window)
          .document,
        q =
          null === (n = p.querySelector) || void 0 === n
            ? void 0
            : n.call(p, "script[nonce]");
      (m = q ? q.nonce || q.getAttribute("nonce") || "" : "") &&
        e.setAttribute("nonce", m);
      fb(e, b);
      c && (e.onerror = c);
      var t = G.getElementsByTagName("script")[0] || G.body || G.head;
      t.parentNode.insertBefore(e, t);
      return e;
    },
    mb = function () {
      if (db) {
        var a = db.toLowerCase();
        if (0 === a.indexOf("https://")) return 2;
        if (0 === a.indexOf("http://")) return 3;
      }
      return 1;
    },
    nb = function (a, b, c, d, e) {
      var f = e,
        g = !1;
      f || ((f = G.createElement("iframe")), (g = !0));
      ib(f, c, hb);
      d &&
        Ba(d, function (m, n) {
          f.dataset[m] = n;
        });
      f.height = "0";
      f.width = "0";
      f.style.display = "none";
      f.style.visibility = "hidden";
      if (g) {
        var l = (G.body && G.body.lastChild) || G.body || G.head;
        l.parentNode.insertBefore(f, l);
      }
      fb(f, b);
      void 0 !== a && (f.src = a);
      return f;
    },
    ob = function (a, b, c) {
      var d = new Image(1, 1);
      d.onload = function () {
        d.onload = null;
        b && b();
      };
      d.onerror = function () {
        d.onerror = null;
        c && c();
      };
      d.src = a;
      return d;
    },
    pb = function (a, b, c, d) {
      a.addEventListener
        ? a.addEventListener(b, c, !!d)
        : a.attachEvent && a.attachEvent("on" + b, c);
    },
    qb = function (a, b, c) {
      a.removeEventListener
        ? a.removeEventListener(b, c, !1)
        : a.detachEvent && a.detachEvent("on" + b, c);
    },
    H = function (a) {
      B.setTimeout(a, 0);
    },
    sb = function (a, b) {
      return a && b && a.attributes && a.attributes[b]
        ? a.attributes[b].value
        : null;
    },
    tb = function (a) {
      var b = a.innerText || a.textContent || "";
      b && " " != b && (b = b.replace(/^[\s\xa0]+|[\s\xa0]+$/g, ""));
      b && (b = b.replace(/(\xa0+|\s{2,}|\n|\r\t)/g, " "));
      return b;
    },
    ub = function (a) {
      var b = G.createElement("div"),
        c = b,
        d = ab("A<div>" + a + "</div>");
      bb(c);
      c.innerHTML = $a(d);
      b = b.lastChild;
      for (var e = []; b.firstChild; ) e.push(b.removeChild(b.firstChild));
      return e;
    },
    vb = function (a, b, c) {
      c = c || 100;
      for (var d = {}, e = 0; e < b.length; e++) d[b[e]] = !0;
      for (var f = a, g = 0; f && g <= c; g++) {
        if (d[String(f.tagName).toLowerCase()]) return f;
        f = f.parentElement;
      }
      return null;
    },
    wb = function (a) {
      var b;
      try {
        b = cb.sendBeacon && cb.sendBeacon(a);
      } catch (c) {}
      b || ob(a);
    },
    xb = function (a, b) {
      var c = a[b];
      c && "string" === typeof c.animVal && (c = c.animVal);
      return c;
    },
    yb = function (a) {
      var b = G.featurePolicy;
      return b && ra(b.allowsFeature) ? b.allowsFeature(a) : !1;
    }; /*
     jQuery (c) 2005, 2012 jQuery Foundation, Inc. jquery.org/license. */
  var zb = /\[object (Boolean|Number|String|Function|Array|Date|RegExp)\]/,
    Ab = function (a) {
      if (null == a) return String(a);
      var b = zb.exec(Object.prototype.toString.call(Object(a)));
      return b ? b[1].toLowerCase() : "object";
    },
    Bb = function (a, b) {
      return Object.prototype.hasOwnProperty.call(Object(a), b);
    },
    Cb = function (a) {
      if (!a || "object" != Ab(a) || a.nodeType || a == a.window) return !1;
      try {
        if (
          a.constructor &&
          !Bb(a, "constructor") &&
          !Bb(a.constructor.prototype, "isPrototypeOf")
        )
          return !1;
      } catch (c) {
        return !1;
      }
      for (var b in a);
      return void 0 === b || Bb(a, b);
    },
    Db = function (a, b) {
      var c = b || ("array" == Ab(a) ? [] : {}),
        d;
      for (d in a)
        if (Bb(a, d)) {
          var e = a[d];
          "array" == Ab(e)
            ? ("array" != Ab(c[d]) && (c[d] = []), (c[d] = Db(e, c[d])))
            : Cb(e)
            ? (Cb(c[d]) || (c[d] = {}), (c[d] = Db(e, c[d])))
            : (c[d] = e);
        }
      return c;
    };
  var Fb = function (a) {
    if (void 0 === a || ta(a) || Cb(a)) return !0;
    switch (typeof a) {
      case "boolean":
      case "number":
      case "string":
      case "function":
        return !0;
    }
    return !1;
  };
  var Gb = (function () {
    var a = function (b) {
      return {
        toString: function () {
          return b;
        },
      };
    };
    return {
      ih: a("consent"),
      jh: a("consent_always_fire"),
      ff: a("convert_case_to"),
      hf: a("convert_false_to"),
      jf: a("convert_null_to"),
      kf: a("convert_true_to"),
      lf: a("convert_undefined_to"),
      Ij: a("debug_mode_metadata"),
      qb: a("function"),
      Th: a("instance_name"),
      Xh: a("live_only"),
      Yh: a("malware_disabled"),
      Zh: a("metadata"),
      di: a("original_activity_id"),
      Kj: a("original_vendor_template_id"),
      ci: a("once_per_event"),
      Tf: a("once_per_load"),
      Mj: a("priority_override"),
      Nj: a("respected_consent_types"),
      Xf: a("setup_tags"),
      Yf: a("tag_id"),
      Zf: a("teardown_tags"),
    };
  })();
  var bc;
  var cc = [],
    dc = [],
    ec = [],
    fc = [],
    hc = [],
    ic = {},
    jc,
    kc,
    lc,
    mc = function (a, b) {
      var c = a["function"],
        d = b && b.event;
      if (!c) throw Error("Error: No function name given for function call.");
      var e = ic[c],
        f = {},
        g;
      for (g in a)
        if (a.hasOwnProperty(g))
          if (0 === g.indexOf("vtp_"))
            e && d && d.mg && d.mg(a[g]),
              (f[void 0 !== e ? g : g.substr(4)] = a[g]);
          else if (g === Gb.jh.toString() && a[g]) {
          }
      e && d && d.lg && (f.vtp_gtmCachedValues = d.lg);
      return void 0 !== e ? e(f) : bc(c, f, b);
    },
    oc = function (a, b, c) {
      c = c || [];
      var d = {},
        e;
      for (e in a) a.hasOwnProperty(e) && (d[e] = nc(a[e], b, c));
      return d;
    },
    nc = function (a, b, c) {
      if (ta(a)) {
        var d;
        switch (a[0]) {
          case "function_id":
            return a[1];
          case "list":
            d = [];
            for (var e = 1; e < a.length; e++) d.push(nc(a[e], b, c));
            return d;
          case "macro":
            var f = a[1];
            if (c[f]) return;
            var g = cc[f];
            if (!g || b.Me(g)) return;
            c[f] = !0;
            try {
              var l = oc(g, b, c);
              l.vtp_gtmEventId = b.id;
              d = mc(l, { event: b, index: f, type: 2 });
              lc && (d = lc.si(d, l));
            } catch (A) {
              b.Fg && b.Fg(A, Number(f)), (d = !1);
            }
            c[f] = !1;
            return d;
          case "map":
            d = {};
            for (var m = 1; m < a.length; m += 2)
              d[nc(a[m], b, c)] = nc(a[m + 1], b, c);
            return d;
          case "template":
            d = [];
            for (var n = !1, p = 1; p < a.length; p++) {
              var q = nc(a[p], b, c);
              kc && (n = n || q === kc.$c);
              d.push(q);
            }
            return kc && n ? kc.yi(d) : d.join("");
          case "escape":
            d = nc(a[1], b, c);
            if (kc && ta(a[1]) && "macro" === a[1][0] && kc.Si(a))
              return kc.ij(d);
            d = String(d);
            for (var t = 2; t < a.length; t++) Hb[a[t]] && (d = Hb[a[t]](d));
            return d;
          case "tag":
            var u = a[1];
            if (!fc[u])
              throw Error("Unable to resolve tag reference " + u + ".");
            return (d = { rg: a[2], index: u });
          case "zb":
            var r = { arg0: a[2], arg1: a[3], ignore_case: a[5] };
            r["function"] = a[1];
            var v = pc(r, b, c),
              z = !!a[4];
            return z || 2 !== v ? z !== (1 === v) : null;
          default:
            throw Error(
              "Attempting to expand unknown Value type: " + a[0] + "."
            );
        }
      }
      return a;
    },
    pc = function (a, b, c) {
      try {
        return jc(oc(a, b, c));
      } catch (d) {
        JSON.stringify(a);
      }
      return 2;
    };
  var sc = function (a) {
      function b(t) {
        for (var u = 0; u < t.length; u++) d[t[u]] = !0;
      }
      for (var c = [], d = [], e = qc(a), f = 0; f < dc.length; f++) {
        var g = dc[f],
          l = rc(g, e);
        if (l) {
          for (var m = g.add || [], n = 0; n < m.length; n++) c[m[n]] = !0;
          b(g.block || []);
        } else null === l && b(g.block || []);
      }
      for (var p = [], q = 0; q < fc.length; q++) c[q] && !d[q] && (p[q] = !0);
      return p;
    },
    rc = function (a, b) {
      for (var c = a["if"] || [], d = 0; d < c.length; d++) {
        var e = b(c[d]);
        if (0 === e) return !1;
        if (2 === e) return null;
      }
      for (var f = a.unless || [], g = 0; g < f.length; g++) {
        var l = b(f[g]);
        if (2 === l) return null;
        if (1 === l) return !1;
      }
      return !0;
    },
    qc = function (a) {
      var b = [];
      return function (c) {
        void 0 === b[c] && (b[c] = pc(ec[c], a));
        return b[c];
      };
    };
  var tc = {
    si: function (a, b) {
      b[Gb.ff] &&
        "string" === typeof a &&
        (a = 1 == b[Gb.ff] ? a.toLowerCase() : a.toUpperCase());
      b.hasOwnProperty(Gb.jf) && null === a && (a = b[Gb.jf]);
      b.hasOwnProperty(Gb.lf) && void 0 === a && (a = b[Gb.lf]);
      b.hasOwnProperty(Gb.kf) && !0 === a && (a = b[Gb.kf]);
      b.hasOwnProperty(Gb.hf) && !1 === a && (a = b[Gb.hf]);
      return a;
    },
  };
  var J = {
    Kb: "_ee",
    gd: "_syn_or_mod",
    Oj: "_uei",
    mc: "_eu",
    Lj: "_pci",
    Hb: "event_callback",
    Rc: "event_timeout",
    Aa: "gtag.config",
    Oa: "gtag.get",
    ya: "purchase",
    Eb: "refund",
    kb: "begin_checkout",
    Bb: "add_to_cart",
    Cb: "remove_from_cart",
    sh: "view_cart",
    pf: "add_to_wishlist",
    za: "view_item",
    Db: "view_promotion",
    Jd: "select_promotion",
    Id: "select_item",
    lb: "view_item_list",
    nf: "add_payment_info",
    rh: "add_shipping_info",
    Qa: "value_key",
    Za: "value_callback",
    U: "allow_ad_personalization_signals",
    hc: "restricted_data_processing",
    Zb: "allow_google_signals",
    qa: "cookie_expires",
    Gb: "cookie_update",
    ic: "session_duration",
    Vc: "session_engaged_time",
    Pc: "engagement_time_msec",
    Da: "user_properties",
    ra: "transport_url",
    T: "ads_data_redaction",
    sa: "user_data",
    bc: "first_party_collection",
    C: "ad_storage",
    M: "analytics_storage",
    df: "region",
    ef: "wait_for_update",
    oa: "conversion_linker",
    Ga: "conversion_cookie_prefix",
    ia: "value",
    fa: "currency",
    Pf: "trip_type",
    aa: "items",
    Ef: "passengers",
    Md: "allow_custom_scripts",
    jc: "session_id",
    Jf: "quantity",
    cb: "transaction_id",
    ab: "language",
    Oc: "country",
    Nc: "allow_enhanced_conversions",
    Rd: "aw_merchant_id",
    Pd: "aw_feed_country",
    Qd: "aw_feed_language",
    Od: "discount",
    W: "developer_id",
    Wc: "delivery_postal_code",
    Xd: "estimated_delivery_date",
    Vd: "shipping",
    de: "new_customer",
    Sd: "customer_lifetime_value",
    Wd: "enhanced_conversions",
    Yb: "page_view",
    ka: "linker",
    N: "domains",
    Jb: "decorate_forms",
    Af: "enhanced_conversions_automatic_settings",
    zh: "auto_detection_enabled",
    Bf: "ga_temp_client_id",
    Kd: "user_engagement",
    mh: "app_remove",
    nh: "app_store_refund",
    oh: "app_store_subscription_cancel",
    ph: "app_store_subscription_convert",
    qh: "app_store_subscription_renew",
    th: "first_open",
    uh: "first_visit",
    vh: "in_app_purchase",
    wh: "session_start",
    xh: "allow_display_features",
    $b: "campaign",
    qf: "campaign_content",
    rf: "campaign_id",
    sf: "campaign_medium",
    tf: "campaign_name",
    uf: "campaign_source",
    vf: "campaign_term",
    Xa: "client_id",
    ja: "cookie_domain",
    Fb: "cookie_name",
    Ya: "cookie_path",
    Ha: "cookie_flags",
    ac: "custom_map",
    $d: "groups",
    Df: "non_interaction",
    Ra: "page_location",
    ee: "page_path",
    Ia: "page_referrer",
    fc: "page_title",
    la: "send_page_view",
    pb: "send_to",
    fe: "session_engaged",
    ce: "_logged_in_state",
    he: "session_number",
    Ph: "tracking_id",
    eb: "url_passthrough",
    Ib: "accept_incoming",
    cc: "url_position",
    Hf: "phone_conversion_number",
    Ff: "phone_conversion_callback",
    Gf: "phone_conversion_css_class",
    If: "phone_conversion_options",
    Kh: "phone_conversion_ids",
    Jh: "phone_conversion_country_code",
    Pa: "aw_remarketing",
    Nd: "aw_remarketing_only",
    Ld: "gclid",
    yh: "auid",
    Eh: "affiliation",
    zf: "tax",
    Ud: "list_name",
    yf: "checkout_step",
    xf: "checkout_option",
    Fh: "coupon",
    Gh: "promotions",
    Ca: "user_id",
    Nh: "retoken",
    Ba: "cookie_prefix",
    wf: "disable_merchant_reported_purchases",
    Dh: "dc_natural_search",
    Ch: "dc_custom_params",
    Cf: "method",
    Oh: "search_term",
    Bh: "content_type",
    Ih: "optimize_id",
    Hh: "experiments",
    $a: "google_signals",
  };
  J.Tc = "google_tld";
  J.Xc = "update";
  J.Yd = "firebase_id";
  J.Zd = "ga_restrict_domain";
  J.Qc = "event_settings";
  J.Td = "dynamic_event_settings";
  J.kc = "user_data_settings";
  J.Lf = "screen_name";
  J.Mf = "screen_resolution";
  J.ob = "_x_19";
  J.nb = "_ecid";
  J.Sc = "_x_20";
  J.be = "internal_traffic_results";
  J.Of = "traffic_type";
  J.Uc = "referral_exclusion_definition";
  J.ae = "ignore_referrer";
  J.Ah = "content_group";
  J.da = "allow_interest_groups";
  var Tc = {};
  J.Rf = Object.freeze(
    ((Tc[J.nf] = 1),
    (Tc[J.rh] = 1),
    (Tc[J.Bb] = 1),
    (Tc[J.Cb] = 1),
    (Tc[J.sh] = 1),
    (Tc[J.kb] = 1),
    (Tc[J.Id] = 1),
    (Tc[J.lb] = 1),
    (Tc[J.Jd] = 1),
    (Tc[J.Db] = 1),
    (Tc[J.ya] = 1),
    (Tc[J.Eb] = 1),
    (Tc[J.za] = 1),
    (Tc[J.pf] = 1),
    Tc)
  );
  J.je = Object.freeze([J.U, J.Zb, J.Gb]);
  J.ai = Object.freeze([].concat(J.je));
  J.ke = Object.freeze([J.qa, J.Rc, J.ic, J.Vc, J.Pc]);
  J.bi = Object.freeze([].concat(J.ke));
  var Uc = {};
  J.Fd = ((Uc[J.C] = "1"), (Uc[J.M] = "2"), Uc);
  var Zc = { xi: "IN", pj: "IN-TG" };
  var $c = {},
    ad = function (a, b) {
      $c[a] = $c[a] || [];
      $c[a][b] = !0;
    },
    bd = function (a) {
      for (var b = [], c = $c[a] || [], d = 0; d < c.length; d++)
        c[d] && (b[Math.floor(d / 6)] ^= 1 << d % 6);
      for (var e = 0; e < b.length; e++)
        b[e] =
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_".charAt(
            b[e] || 0
          );
      return b.join("");
    },
    cd = function () {
      for (var a = [], b = $c.GA4_EVENT || [], c = 0; c < b.length; c++)
        b[c] && a.push(c);
      return 0 < a.length ? a : void 0;
    };
  var dd = function (a) {
    ad("GTM", a);
  };
  var ed = new (function (a, b) {
    this.m = a;
    this.defaultValue = void 0 === b ? !1 : b;
  })(1933);
  var gd = function () {
    var a = fd,
      b = "Ke";
    if (a.Ke && a.hasOwnProperty(b)) return a.Ke;
    var c = new a();
    a.Ke = c;
    a.hasOwnProperty(b);
    return c;
  };
  var fd = function () {
    var a = {};
    this.m = function () {
      var b = ed.m,
        c = ed.defaultValue;
      return null != a[b] ? a[b] : c;
    };
    this.o = function () {
      a[ed.m] = !0;
    };
  };
  var hd = [];
  function id() {
    var a = eb("google_tag_data", {});
    a.ics ||
      (a.ics = {
        entries: {},
        set: jd,
        update: kd,
        addListener: ld,
        notifyListeners: md,
        active: !1,
        usedDefault: !1,
        usedUpdate: !1,
        accessedDefault: !1,
        accessedAny: !1,
        wasSetLate: !1,
      });
    return a.ics;
  }
  function jd(a, b, c, d, e, f) {
    var g = id();
    !g.usedDefault && g.usedUpdate && (g.wasSetLate = !0);
    g.usedDefault ||
      (!g.accessedDefault && !g.accessedAny) ||
      (g.wasSetLate = !0);
    g.active = !0;
    g.usedDefault = !0;
    if (void 0 != b) {
      var l = g.entries,
        m = l[a] || {},
        n = m.region,
        p = c && k(c) ? c.toUpperCase() : void 0;
      d = d.toUpperCase();
      e = e.toUpperCase();
      if ("" === d || p === e || (p === d ? n !== e : !p && !n)) {
        var q = !!(f && 0 < f && void 0 === m.update),
          t = {
            region: p,
            initial: "granted" === b,
            update: m.update,
            quiet: q,
          };
        if ("" !== d || !1 !== m.initial) l[a] = t;
        q &&
          B.setTimeout(function () {
            l[a] === t &&
              t.quiet &&
              ((t.quiet = !1), nd(a), md(), ad("TAGGING", 2));
          }, f);
      }
    }
  }
  function kd(a, b) {
    var c = id();
    c.usedDefault || c.usedUpdate || !c.accessedAny || (c.wasSetLate = !0);
    c.active = !0;
    c.usedUpdate = !0;
    if (void 0 != b) {
      var d = od(a),
        e = c.entries,
        f = (e[a] = e[a] || {});
      f.update = "granted" === b;
      var g = od(a);
      f.quiet ? ((f.quiet = !1), nd(a)) : g !== d && nd(a);
    }
  }
  function ld(a, b) {
    hd.push({ Be: a, Fi: b });
  }
  function nd(a) {
    for (var b = 0; b < hd.length; ++b) {
      var c = hd[b];
      ta(c.Be) && -1 !== c.Be.indexOf(a) && (c.Lg = !0);
    }
  }
  function md(a) {
    for (var b = 0; b < hd.length; ++b) {
      var c = hd[b];
      if (c.Lg) {
        c.Lg = !1;
        try {
          c.Fi({ consentEventId: a });
        } catch (d) {}
      }
    }
  }
  var od = function (a) {
      var b = id();
      b.accessedAny = !0;
      var c = b.entries[a] || {};
      return void 0 !== c.update ? c.update : c.initial;
    },
    pd = function (a) {
      var b = id();
      b.accessedDefault = !0;
      return (b.entries[a] || {}).initial;
    },
    qd = function (a) {
      var b = id();
      b.accessedAny = !0;
      return !(b.entries[a] || {}).quiet;
    },
    wd = function () {
      if (!gd().m()) return !1;
      var a = id();
      a.accessedAny = !0;
      return a.active;
    },
    xd = function () {
      var a = id();
      a.accessedDefault = !0;
      return a.usedDefault;
    },
    yd = function (a, b) {
      id().addListener(a, b);
    },
    zd = function (a) {
      id().notifyListeners(a);
    },
    Ad = function (a, b) {
      function c() {
        for (var e = 0; e < b.length; e++) if (!qd(b[e])) return !0;
        return !1;
      }
      if (c()) {
        var d = !1;
        yd(b, function (e) {
          d || c() || ((d = !0), a(e));
        });
      } else a({});
    },
    Bd = function (a, b) {
      function c() {
        for (var f = [], g = 0; g < d.length; g++) {
          var l = d[g];
          !1 === od(l) || e[l] || (f.push(l), (e[l] = !0));
        }
        return f;
      }
      var d = k(b) ? [b] : b,
        e = {};
      c().length !== d.length &&
        yd(d, function (f) {
          var g = c();
          0 < g.length && ((f.Be = g), a(f));
        });
    };
  function Cd() {}
  function Dd() {}
  function Ed(a) {
    for (var b = [], c = 0; c < Fd.length; c++) {
      var d = a(Fd[c]);
      b[c] = !0 === d ? "1" : !1 === d ? "0" : "-";
    }
    return b.join("");
  }
  var Fd = [J.C, J.M],
    Gd = function (a) {
      var b = a[J.df];
      b && dd(40);
      var c = a[J.ef];
      c && dd(41);
      for (
        var d = ta(b) ? b : [b], e = { Wb: 0 };
        e.Wb < d.length;
        e = { Wb: e.Wb }, ++e.Wb
      )
        Ba(
          a,
          (function (f) {
            return function (g, l) {
              if (g !== J.df && g !== J.ef) {
                var m = d[f.Wb],
                  n = Zc.xi,
                  p = Zc.pj;
                id().set(g, l, m, n, p, c);
              }
            };
          })(e)
        );
    },
    Hd = 0,
    Id = function (a, b) {
      Ba(a, function (e, f) {
        id().update(e, f);
      });
      zd(b);
      var c = Ia(),
        d = c - Hd;
      Hd && 0 <= d && 1e3 > d && dd(66);
      Hd = c;
    },
    Jd = function (a) {
      var b = od(a);
      return void 0 != b ? b : !0;
    },
    Kd = function () {
      return "G1" + Ed(od);
    },
    Ld = function () {
      return "G1" + Ed(pd);
    },
    Md = function (a, b) {
      Bd(a, b);
    },
    Nd = function (a, b) {
      Ad(a, b);
    };
  var Pd = function (a) {
      return Od ? G.querySelectorAll(a) : null;
    },
    Qd = function (a, b) {
      if (!Od) return null;
      if (Element.prototype.closest)
        try {
          return a.closest(b);
        } catch (e) {
          return null;
        }
      var c =
          Element.prototype.matches ||
          Element.prototype.webkitMatchesSelector ||
          Element.prototype.mozMatchesSelector ||
          Element.prototype.msMatchesSelector ||
          Element.prototype.oMatchesSelector,
        d = a;
      if (!G.documentElement.contains(d)) return null;
      do {
        try {
          if (c.call(d, b)) return d;
        } catch (e) {
          break;
        }
        d = d.parentElement || d.parentNode;
      } while (null !== d && 1 === d.nodeType);
      return null;
    },
    Rd = !1;
  if (G.querySelectorAll)
    try {
      var Sd = G.querySelectorAll(":root");
      Sd && 1 == Sd.length && Sd[0] == G.documentElement && (Rd = !0);
    } catch (a) {}
  var Od = Rd;
  var le = function () {
      this.eventModel = {};
      this.targetConfig = {};
      this.containerConfig = {};
      this.globalConfig = {};
      this.remoteConfig = {};
      this.onSuccess = function () {};
      this.onFailure = function () {};
      this.setContainerTypeLoaded = function () {};
      this.getContainerTypeLoaded = function () {};
      this.eventId = void 0;
      this.isGtmEvent = !1;
    },
    me = function (a) {
      var b = new le();
      b.eventModel = a;
      return b;
    },
    ne = function (a, b) {
      a.targetConfig = b;
      return a;
    },
    qe = function (a, b) {
      a.containerConfig = b;
      return a;
    },
    re = function (a, b) {
      a.globalConfig = b;
      return a;
    },
    se = function (a, b) {
      a.remoteConfig = b;
      return a;
    },
    te = function (a, b) {
      a.onSuccess = b;
      return a;
    },
    ue = function (a, b) {
      a.setContainerTypeLoaded = b;
      return a;
    },
    ve = function (a, b) {
      a.getContainerTypeLoaded = b;
      return a;
    },
    we = function (a, b) {
      a.onFailure = b;
      return a;
    };
  le.prototype.getWithConfig = function (a) {
    if (void 0 !== this.eventModel[a]) return this.eventModel[a];
    if (void 0 !== this.targetConfig[a]) return this.targetConfig[a];
    if (void 0 !== this.containerConfig[a]) return this.containerConfig[a];
    if (void 0 !== this.globalConfig[a]) return this.globalConfig[a];
    if (void 0 !== this.remoteConfig[a]) return this.remoteConfig[a];
  };
  var xe = function (a) {
      function b(d) {
        for (var e = Object.keys(d), f = 0; f < e.length; ++f) c[e[f]] = 1;
      }
      var c = {};
      b(a.eventModel);
      b(a.targetConfig);
      b(a.containerConfig);
      b(a.globalConfig);
      return Object.keys(c);
    },
    ye = function (a, b, c) {
      function d(g) {
        Cb(g) &&
          Ba(g, function (l, m) {
            f = !0;
            e[l] = m;
          });
      }
      var e = {},
        f = !1;
      (c && 1 !== c) ||
        (d(a.remoteConfig[b]),
        d(a.globalConfig[b]),
        d(a.containerConfig[b]),
        d(a.targetConfig[b]));
      (c && 2 !== c) || d(a.eventModel[b]);
      return f ? e : void 0;
    },
    ze = function (a) {
      var b = [J.$b, J.qf, J.rf, J.sf, J.tf, J.uf, J.vf],
        c = {},
        d = !1,
        e = function (f) {
          for (var g = 0; g < b.length; g++)
            void 0 !== f[b[g]] && ((c[b[g]] = f[b[g]]), (d = !0));
          return d;
        };
      if (
        e(a.eventModel) ||
        e(a.targetConfig) ||
        e(a.containerConfig) ||
        e(a.globalConfig)
      )
        return c;
      e(a.remoteConfig);
      return c;
    },
    Ae = function (a) {
      var b = [],
        c;
      for (c in a.eventModel)
        c !== J.Kb &&
          a.eventModel.hasOwnProperty(c) &&
          void 0 !== a.eventModel[c] &&
          b.push(c);
      return b;
    };
  var M = {},
    Q = (B.google_tag_manager = B.google_tag_manager || {}),
    Be = Math.random();
  M.I = "UA-139844109-1";
  M.ed = "270";
  M.V = "dataLayer";
  M.lh =
    "ChAIgMaIkAYQ5PfgleDmlI1fEicAVkredbhi9b2+giggBp40QA6JXLwtgDPOSjr8KzC1Ho3vaeqG59EaAmTW";
  var Ce = {
      __cl: !0,
      __ecl: !0,
      __ehl: !0,
      __evl: !0,
      __fal: !0,
      __fil: !0,
      __fsl: !0,
      __hl: !0,
      __jel: !0,
      __lcl: !0,
      __sdl: !0,
      __tl: !0,
      __ytl: !0,
    },
    De = { __paused: !0, __tg: !0 },
    Ee;
  for (Ee in Ce) Ce.hasOwnProperty(Ee) && (De[Ee] = !0);
  M.Gd = "www.googletagmanager.com";
  var Fe,
    Ge = M.Gd + "/gtm.js";
  Ge = M.Gd + "/gtag/js";
  Fe = Ge;
  var He = Ea(""),
    Ie = null,
    Je = null,
    Ke = "https://www.googletagmanager.com/a?id=" + M.I + "&cv=1",
    Le = {},
    Me = {},
    Ne = function () {
      var a = Q.sequence || 1;
      Q.sequence = a + 1;
      return a;
    };
  M.kh = "";
  var Oe = "";
  M.fd = Oe;
  var Pe = new za(),
    Qe = {},
    Re = {},
    Ue = {
      name: M.V,
      set: function (a, b) {
        Db(Oa(a, b), Qe);
        Se();
      },
      get: function (a) {
        return Te(a, 2);
      },
      reset: function () {
        Pe = new za();
        Qe = {};
        Se();
      },
    },
    Te = function (a, b) {
      return 2 != b ? Pe.get(a) : Ve(a);
    },
    Ve = function (a) {
      var b,
        c = a.split(".");
      b = b || [];
      for (var d = Qe, e = 0; e < c.length; e++) {
        if (null === d) return !1;
        if (void 0 === d) break;
        d = d[c[e]];
        if (-1 !== b.indexOf(d)) return;
      }
      return d;
    },
    We = function (a, b) {
      Re.hasOwnProperty(a) || (Pe.set(a, b), Db(Oa(a, b), Qe), Se());
    },
    Se = function (a) {
      Ba(Re, function (b, c) {
        Pe.set(b, c);
        Db(Oa(b, void 0), Qe);
        Db(Oa(b, c), Qe);
        a && delete Re[b];
      });
    },
    Xe = function (a, b) {
      var c,
        d = 1 !== (void 0 === b ? 2 : b) ? Ve(a) : Pe.get(a);
      "array" === Ab(d) || "object" === Ab(d) ? (c = Db(d)) : (c = d);
      return c;
    };
  var Ye,
    Ze = !1,
    $e = function (a) {
      if (!Ze) {
        Ze = !0;
        Ye = Ye || {};
      }
      return Ye[a];
    };
  var af = function (a) {
    if (G.hidden) return !0;
    var b = a.getBoundingClientRect();
    if (b.top == b.bottom || b.left == b.right || !B.getComputedStyle)
      return !0;
    var c = B.getComputedStyle(a, null);
    if ("hidden" === c.visibility) return !0;
    for (var d = a, e = c; d; ) {
      if ("none" === e.display) return !0;
      var f = e.opacity,
        g = e.filter;
      if (g) {
        var l = g.indexOf("opacity(");
        0 <= l &&
          ((g = g.substring(l + 8, g.indexOf(")", l))),
          "%" == g.charAt(g.length - 1) && (g = g.substring(0, g.length - 1)),
          (f = Math.min(g, f)));
      }
      if (void 0 !== f && 0 >= f) return !0;
      (d = d.parentElement) && (e = B.getComputedStyle(d, null));
    }
    return !1;
  };
  var kf = /:[0-9]+$/,
    lf = function (a, b, c) {
      for (var d = a.split("&"), e = 0; e < d.length; e++) {
        var f = d[e].split("=");
        if (decodeURIComponent(f[0]).replace(/\+/g, " ") === b) {
          var g = f.slice(1).join("=");
          return c ? g : decodeURIComponent(g).replace(/\+/g, " ");
        }
      }
    },
    of = function (a, b, c, d, e) {
      b && (b = String(b).toLowerCase());
      if ("protocol" === b || "port" === b)
        a.protocol = mf(a.protocol) || mf(B.location.protocol);
      "port" === b
        ? (a.port = String(
            Number(a.hostname ? a.port : B.location.port) ||
              ("http" == a.protocol ? 80 : "https" == a.protocol ? 443 : "")
          ))
        : "host" === b &&
          (a.hostname = (a.hostname || B.location.hostname)
            .replace(kf, "")
            .toLowerCase());
      return nf(a, b, c, d, e);
    },
    nf = function (a, b, c, d, e) {
      var f,
        g = mf(a.protocol);
      b && (b = String(b).toLowerCase());
      switch (b) {
        case "url_no_fragment":
          f = pf(a);
          break;
        case "protocol":
          f = g;
          break;
        case "host":
          f = a.hostname.replace(kf, "").toLowerCase();
          if (c) {
            var l = /^www\d*\./.exec(f);
            l && l[0] && (f = f.substr(l[0].length));
          }
          break;
        case "port":
          f = String(
            Number(a.port) || ("http" == g ? 80 : "https" == g ? 443 : "")
          );
          break;
        case "path":
          a.pathname || a.hostname || ad("TAGGING", 1);
          f = "/" == a.pathname.substr(0, 1) ? a.pathname : "/" + a.pathname;
          var m = f.split("/");
          0 <= (d || []).indexOf(m[m.length - 1]) && (m[m.length - 1] = "");
          f = m.join("/");
          break;
        case "query":
          f = a.search.replace("?", "");
          e && (f = lf(f, e, void 0));
          break;
        case "extension":
          var n = a.pathname.split(".");
          f = 1 < n.length ? n[n.length - 1] : "";
          f = f.split("/")[0];
          break;
        case "fragment":
          f = a.hash.replace("#", "");
          break;
        default:
          f = a && a.href;
      }
      return f;
    },
    mf = function (a) {
      return a ? a.replace(":", "").toLowerCase() : "";
    },
    pf = function (a) {
      var b = "";
      if (a && a.href) {
        var c = a.href.indexOf("#");
        b = 0 > c ? a.href : a.href.substr(0, c);
      }
      return b;
    },
    qf = function (a) {
      var b = G.createElement("a");
      a && (b.href = a);
      var c = b.pathname;
      "/" !== c[0] && (a || ad("TAGGING", 1), (c = "/" + c));
      var d = b.hostname.replace(kf, "");
      return {
        href: b.href,
        protocol: b.protocol,
        host: b.host,
        hostname: d,
        pathname: c,
        search: b.search,
        hash: b.hash,
        port: b.port,
      };
    },
    rf = function (a) {
      function b(n) {
        var p = n.split("=")[0];
        return 0 > d.indexOf(p) ? n : p + "=0";
      }
      function c(n) {
        return n
          .split("&")
          .map(b)
          .filter(function (p) {
            return void 0 != p;
          })
          .join("&");
      }
      var d =
          "gclid dclid gbraid wbraid gclaw gcldc gclha gclgf gclgb _gl".split(
            " "
          ),
        e = qf(a),
        f = a.split(/[?#]/)[0],
        g = e.search,
        l = e.hash;
      "?" === g[0] && (g = g.substring(1));
      "#" === l[0] && (l = l.substring(1));
      g = c(g);
      l = c(l);
      "" !== g && (g = "?" + g);
      "" !== l && (l = "#" + l);
      var m = "" + f + g + l;
      "/" === m[m.length - 1] && (m = m.substring(0, m.length - 1));
      return m;
    };
  var sf = {};
  var Lf = {},
    Mf = function (a, b) {
      if (B._gtmexpgrp && B._gtmexpgrp.hasOwnProperty(a))
        return B._gtmexpgrp[a];
      void 0 === Lf[a] && (Lf[a] = Math.floor(Math.random() * b));
      return Lf[a];
    };
  var Nf = function (a) {
    var b = 1,
      c,
      d,
      e;
    if (a)
      for (b = 0, d = a.length - 1; 0 <= d; d--)
        (e = a.charCodeAt(d)),
          (b = ((b << 6) & 268435455) + e + (e << 14)),
          (c = b & 266338304),
          (b = 0 != c ? b ^ (c >> 21) : b);
    return b;
  };
  var Of = function (a, b, c) {
    for (var d = [], e = b.split(";"), f = 0; f < e.length; f++) {
      var g = e[f].split("="),
        l = g[0].replace(/^\s*|\s*$/g, "");
      if (l && l == a) {
        var m = g
          .slice(1)
          .join("=")
          .replace(/^\s*|\s*$/g, "");
        m && c && (m = decodeURIComponent(m));
        d.push(m);
      }
    }
    return d;
  };
  var Pf = function (a, b) {
      var c = function () {};
      c.prototype = a.prototype;
      var d = new c();
      a.apply(d, Array.prototype.slice.call(arguments, 1));
      return d;
    },
    Qf = function (a) {
      var b = a;
      return function () {
        if (b) {
          var c = b;
          b = null;
          c();
        }
      };
    };
  function Rf(a) {
    return "null" !== a.origin;
  }
  var Uf = function (a, b, c, d) {
      return Sf(d) ? Of(a, String(b || Tf()), c) : [];
    },
    Xf = function (a, b, c, d, e) {
      if (Sf(e)) {
        var f = Vf(a, d, e);
        if (1 === f.length) return f[0].id;
        if (0 !== f.length) {
          f = Wf(
            f,
            function (g) {
              return g.od;
            },
            b
          );
          if (1 === f.length) return f[0].id;
          f = Wf(
            f,
            function (g) {
              return g.Cc;
            },
            c
          );
          return f[0] ? f[0].id : void 0;
        }
      }
    };
  function ag(a, b, c, d) {
    var e = Tf(),
      f = window;
    Rf(f) && (f.document.cookie = a);
    var g = Tf();
    return e != g || (void 0 != c && 0 <= Uf(b, g, !1, d).indexOf(c));
  }
  var eg = function (a, b, c) {
      function d(u, r, v) {
        if (null == v) return delete g[r], u;
        g[r] = v;
        return u + "; " + r + "=" + v;
      }
      function e(u, r) {
        if (null == r) return delete g[r], u;
        g[r] = !0;
        return u + "; " + r;
      }
      if (!Sf(c.Ta)) return 2;
      var f;
      void 0 == b
        ? (f = a + "=deleted; expires=" + new Date(0).toUTCString())
        : (c.encode && (b = encodeURIComponent(b)),
          (b = bg(b)),
          (f = a + "=" + b));
      var g = {};
      f = d(f, "path", c.path);
      var l;
      c.expires instanceof Date
        ? (l = c.expires.toUTCString())
        : null != c.expires && (l = "" + c.expires);
      f = d(f, "expires", l);
      f = d(f, "max-age", c.Rj);
      f = d(f, "samesite", c.Tj);
      c.Uj && (f = e(f, "secure"));
      var m = c.domain;
      if (m && "auto" === m.toLowerCase()) {
        for (var n = cg(), p = 0; p < n.length; ++p) {
          var q = "none" !== n[p] ? n[p] : void 0,
            t = d(f, "domain", q);
          t = e(t, c.flags);
          if (!dg(q, c.path) && ag(t, a, b, c.Ta)) return 0;
        }
        return 1;
      }
      m && "none" !== m.toLowerCase() && (f = d(f, "domain", m));
      f = e(f, c.flags);
      return dg(m, c.path) ? 1 : ag(f, a, b, c.Ta) ? 0 : 1;
    },
    fg = function (a, b, c) {
      null == c.path && (c.path = "/");
      c.domain || (c.domain = "auto");
      return eg(a, b, c);
    };
  function Wf(a, b, c) {
    for (var d = [], e = [], f, g = 0; g < a.length; g++) {
      var l = a[g],
        m = b(l);
      m === c
        ? d.push(l)
        : void 0 === f || m < f
        ? ((e = [l]), (f = m))
        : m === f && e.push(l);
    }
    return 0 < d.length ? d : e;
  }
  function Vf(a, b, c) {
    for (var d = [], e = Uf(a, void 0, void 0, c), f = 0; f < e.length; f++) {
      var g = e[f].split("."),
        l = g.shift();
      if (!b || -1 !== b.indexOf(l)) {
        var m = g.shift();
        m &&
          ((m = m.split("-")),
          d.push({ id: g.join("."), od: 1 * m[0] || 1, Cc: 1 * m[1] || 1 }));
      }
    }
    return d;
  }
  var bg = function (a) {
      a && 1200 < a.length && (a = a.substring(0, 1200));
      return a;
    },
    gg = /^(www\.)?google(\.com?)?(\.[a-z]{2})?$/,
    hg = /(^|\.)doubleclick\.net$/i,
    dg = function (a, b) {
      return (
        hg.test(window.document.location.hostname) || ("/" === b && gg.test(a))
      );
    },
    Tf = function () {
      return Rf(window) ? window.document.cookie : "";
    },
    cg = function () {
      var a = [],
        b = window.document.location.hostname.split(".");
      if (4 === b.length) {
        var c = b[b.length - 1];
        if (parseInt(c, 10).toString() === c) return ["none"];
      }
      for (var d = b.length - 2; 0 <= d; d--) a.push(b.slice(d).join("."));
      var e = window.document.location.hostname;
      hg.test(e) || gg.test(e) || a.push("none");
      return a;
    },
    Sf = function (a) {
      if (!gd().m() || !a || !wd()) return !0;
      if (!qd(a)) return !1;
      var b = od(a);
      return null == b ? !0 : !!b;
    };
  var ig = function (a) {
      var b = Math.round(2147483647 * Math.random());
      return a ? String(b ^ (Nf(a) & 2147483647)) : String(b);
    },
    jg = function (a) {
      return [ig(a), Math.round(Ia() / 1e3)].join(".");
    },
    mg = function (a, b, c, d, e) {
      var f = kg(b);
      return Xf(a, f, lg(c), d, e);
    },
    ng = function (a, b, c, d) {
      var e = "" + kg(c),
        f = lg(d);
      1 < f && (e += "-" + f);
      return [b, e, a].join(".");
    },
    kg = function (a) {
      if (!a) return 1;
      a = 0 === a.indexOf(".") ? a.substr(1) : a;
      return a.split(".").length;
    },
    lg = function (a) {
      if (!a || "/" === a) return 1;
      "/" !== a[0] && (a = "/" + a);
      "/" !== a[a.length - 1] && (a += "/");
      return a.split("/").length - 1;
    };
  function og(a, b, c) {
    var d,
      e = Number(null != a.vb ? a.vb : void 0);
    0 !== e && (d = new Date((b || Ia()) + 1e3 * (e || 7776e3)));
    return {
      path: a.path,
      domain: a.domain,
      flags: a.flags,
      encode: !!c,
      expires: d,
    };
  }
  var pg = ["1"],
    qg = {},
    rg = {},
    vg = function (a, b) {
      b = void 0 === b ? !0 : b;
      var c = sg(a.prefix);
      if (!qg[c] && !tg(c, a.path, a.domain) && b) {
        var d = sg(a.prefix),
          e = jg();
        if (0 === ug(d, e, a)) {
          var f = eb("google_tag_data", {});
          f._gcl_au ? ad("GTM", 57) : (f._gcl_au = e);
        }
        tg(c, a.path, a.domain);
      }
    };
  function ug(a, b, c, d) {
    var e = ng(b, "1", c.domain, c.path),
      f = og(c, d);
    f.Ta = "ad_storage";
    return fg(a, e, f);
  }
  function tg(a, b, c) {
    var d = mg(a, b, c, pg, "ad_storage");
    if (!d) return !1;
    var e = d.split(".");
    5 === e.length
      ? ((qg[a] = e.slice(0, 2).join(".")),
        (rg[a] = { id: e.slice(2, 4).join("."), Cg: Number(e[4]) || 0 }))
      : 3 === e.length
      ? (rg[a] = { id: e.slice(0, 2).join("."), Cg: Number(e[2]) || 0 })
      : (qg[a] = d);
    return !0;
  }
  function sg(a) {
    return (a || "_gcl") + "_au";
  }
  var wg = function (a) {
    for (
      var b = [],
        c = G.cookie.split(";"),
        d = new RegExp(
          "^\\s*" + (a || "_gac") + "_(UA-\\d+-\\d+)=\\s*(.+?)\\s*$"
        ),
        e = 0;
      e < c.length;
      e++
    ) {
      var f = c[e].match(d);
      f &&
        b.push({
          $e: f[1],
          value: f[2],
          timestamp: Number(f[2].split(".")[1]) || 0,
        });
    }
    b.sort(function (g, l) {
      return l.timestamp - g.timestamp;
    });
    return b;
  };
  function xg(a, b) {
    var c = wg(a),
      d = {};
    if (!c || !c.length) return d;
    for (var e = 0; e < c.length; e++) {
      var f = c[e].value.split(".");
      if (
        !("1" !== f[0] || (b && 3 > f.length) || (!b && 3 !== f.length)) &&
        Number(f[1])
      ) {
        d[c[e].$e] || (d[c[e].$e] = []);
        var g = { version: f[0], timestamp: 1e3 * Number(f[1]), va: f[2] };
        b && 3 < f.length && (g.labels = f.slice(3));
        d[c[e].$e].push(g);
      }
    }
    return d;
  }
  function yg() {
    for (var a = zg, b = {}, c = 0; c < a.length; ++c) b[a[c]] = c;
    return b;
  }
  function Ag() {
    var a = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    a += a.toLowerCase() + "0123456789-_";
    return a + ".";
  }
  var zg, Bg;
  function Cg(a) {
    function b(m) {
      for (; d < a.length; ) {
        var n = a.charAt(d++),
          p = Bg[n];
        if (null != p) return p;
        if (!/^[\s\xa0]*$/.test(n))
          throw Error("Unknown base64 encoding at char: " + n);
      }
      return m;
    }
    zg = zg || Ag();
    Bg = Bg || yg();
    for (var c = "", d = 0; ; ) {
      var e = b(-1),
        f = b(0),
        g = b(64),
        l = b(64);
      if (64 === l && -1 === e) return c;
      c += String.fromCharCode((e << 2) | (f >> 4));
      64 != g &&
        ((c += String.fromCharCode(((f << 4) & 240) | (g >> 2))),
        64 != l && (c += String.fromCharCode(((g << 6) & 192) | l)));
    }
  }
  var Dg;
  var Hg = function () {
      var a = Eg,
        b = Fg,
        c = Gg(),
        d = function (g) {
          a(g.target || g.srcElement || {});
        },
        e = function (g) {
          b(g.target || g.srcElement || {});
        };
      if (!c.init) {
        pb(G, "mousedown", d);
        pb(G, "keyup", d);
        pb(G, "submit", e);
        var f = HTMLFormElement.prototype.submit;
        HTMLFormElement.prototype.submit = function () {
          b(this);
          f.call(this);
        };
        c.init = !0;
      }
    },
    Ig = function (a, b, c, d, e) {
      var f = {
        callback: a,
        domains: b,
        fragment: 2 === c,
        placement: c,
        forms: d,
        sameHost: e,
      };
      Gg().decorators.push(f);
    },
    Jg = function (a, b, c) {
      for (var d = Gg().decorators, e = {}, f = 0; f < d.length; ++f) {
        var g = d[f],
          l;
        if ((l = !c || g.forms))
          a: {
            var m = g.domains,
              n = a,
              p = !!g.sameHost;
            if (m && (p || n !== G.location.hostname))
              for (var q = 0; q < m.length; q++)
                if (m[q] instanceof RegExp) {
                  if (m[q].test(n)) {
                    l = !0;
                    break a;
                  }
                } else if (
                  0 <= n.indexOf(m[q]) ||
                  (p && 0 <= m[q].indexOf(n))
                ) {
                  l = !0;
                  break a;
                }
            l = !1;
          }
        if (l) {
          var t = g.placement;
          void 0 == t && (t = g.fragment ? 2 : 1);
          t === b && La(e, g.callback());
        }
      }
      return e;
    };
  function Gg() {
    var a = eb("google_tag_data", {}),
      b = a.gl;
    (b && b.decorators) || ((b = { decorators: [] }), (a.gl = b));
    return b;
  }
  var Kg = /(.*?)\*(.*?)\*(.*)/,
    Lg = /^https?:\/\/([^\/]*?)\.?cdn\.ampproject\.org\/?(.*)/,
    Mg = /^(?:www\.|m\.|amp\.)+/,
    Ng = /([^?#]+)(\?[^#]*)?(#.*)?/;
  function Og(a) {
    return new RegExp("(.*?)(^|&)" + a + "=([^&]*)&?(.*)");
  }
  var Qg = function (a) {
    var b = [],
      c;
    for (c in a)
      if (a.hasOwnProperty(c)) {
        var d = a[c];
        if (
          void 0 !== d &&
          d === d &&
          null !== d &&
          "[object Object]" !== d.toString()
        ) {
          b.push(c);
          var e = b,
            f = e.push,
            g,
            l = String(d);
          zg = zg || Ag();
          Bg = Bg || yg();
          for (var m = [], n = 0; n < l.length; n += 3) {
            var p = n + 1 < l.length,
              q = n + 2 < l.length,
              t = l.charCodeAt(n),
              u = p ? l.charCodeAt(n + 1) : 0,
              r = q ? l.charCodeAt(n + 2) : 0,
              v = t >> 2,
              z = ((t & 3) << 4) | (u >> 4),
              A = ((u & 15) << 2) | (r >> 6),
              y = r & 63;
            q || ((y = 64), p || (A = 64));
            m.push(zg[v], zg[z], zg[A], zg[y]);
          }
          g = m.join("");
          f.call(e, g);
        }
      }
    var x = b.join("*");
    return ["1", Pg(x), x].join("*");
  };
  function Pg(a, b) {
    var c = [
        B.navigator.userAgent,
        new Date().getTimezoneOffset(),
        cb.userLanguage || cb.language,
        Math.floor(Ia() / 60 / 1e3) - (void 0 === b ? 0 : b),
        a,
      ].join("*"),
      d;
    if (!(d = Dg)) {
      for (var e = Array(256), f = 0; 256 > f; f++) {
        for (var g = f, l = 0; 8 > l; l++)
          g = g & 1 ? (g >>> 1) ^ 3988292384 : g >>> 1;
        e[f] = g;
      }
      d = e;
    }
    Dg = d;
    for (var m = 4294967295, n = 0; n < c.length; n++)
      m = (m >>> 8) ^ Dg[(m ^ c.charCodeAt(n)) & 255];
    return ((m ^ -1) >>> 0).toString(36);
  }
  function Rg() {
    return function (a) {
      var b = qf(B.location.href),
        c = b.search.replace("?", ""),
        d = lf(c, "_gl", !0) || "";
      a.query = Sg(d) || {};
      var e = of(b, "fragment").match(Og("_gl"));
      a.fragment = Sg((e && e[3]) || "") || {};
    };
  }
  function Tg(a, b) {
    var c = Og(a).exec(b),
      d = b;
    if (c) {
      var e = c[2],
        f = c[4];
      d = c[1];
      f && (d = d + e + f);
    }
    return d;
  }
  var Ug = function (a, b) {
      b || (b = "_gl");
      var c = Ng.exec(a);
      if (!c) return "";
      var d = c[1],
        e = Tg(b, (c[2] || "").slice(1)),
        f = Tg(b, (c[3] || "").slice(1));
      e.length && (e = "?" + e);
      f.length && (f = "#" + f);
      return "" + d + e + f;
    },
    Vg = function (a) {
      var b = Rg(),
        c = Gg();
      c.data || ((c.data = { query: {}, fragment: {} }), b(c.data));
      var d = {},
        e = c.data;
      e && (La(d, e.query), a && La(d, e.fragment));
      return d;
    },
    Sg = function (a) {
      try {
        var b = Wg(a, 3);
        if (void 0 !== b) {
          for (
            var c = {}, d = b ? b.split("*") : [], e = 0;
            e + 1 < d.length;
            e += 2
          ) {
            var f = d[e],
              g = Cg(d[e + 1]);
            c[f] = g;
          }
          ad("TAGGING", 6);
          return c;
        }
      } catch (l) {
        ad("TAGGING", 8);
      }
    };
  function Wg(a, b) {
    if (a) {
      var c;
      a: {
        for (var d = a, e = 0; 3 > e; ++e) {
          var f = Kg.exec(d);
          if (f) {
            c = f;
            break a;
          }
          d = decodeURIComponent(d);
        }
        c = void 0;
      }
      var g = c;
      if (g && "1" === g[1]) {
        var l = g[3],
          m;
        a: {
          for (var n = g[2], p = 0; p < b; ++p)
            if (n === Pg(l, p)) {
              m = !0;
              break a;
            }
          m = !1;
        }
        if (m) return l;
        ad("TAGGING", 7);
      }
    }
  }
  function Xg(a, b, c, d) {
    function e(p) {
      p = Tg(a, p);
      var q = p.charAt(p.length - 1);
      p && "&" !== q && (p += "&");
      return p + n;
    }
    d = void 0 === d ? !1 : d;
    var f = Ng.exec(c);
    if (!f) return "";
    var g = f[1],
      l = f[2] || "",
      m = f[3] || "",
      n = a + "=" + b;
    d ? (m = "#" + e(m.substring(1))) : (l = "?" + e(l.substring(1)));
    return "" + g + l + m;
  }
  function Yg(a, b) {
    var c = "FORM" === (a.tagName || "").toUpperCase(),
      d = Jg(b, 1, c),
      e = Jg(b, 2, c),
      f = Jg(b, 3, c);
    if (Ma(d)) {
      var g = Qg(d);
      c ? Zg("_gl", g, a) : $g("_gl", g, a, !1);
    }
    if (!c && Ma(e)) {
      var l = Qg(e);
      $g("_gl", l, a, !0);
    }
    for (var m in f)
      if (f.hasOwnProperty(m))
        a: {
          var n = m,
            p = f[m],
            q = a;
          if (q.tagName) {
            if ("a" === q.tagName.toLowerCase()) {
              $g(n, p, q, void 0);
              break a;
            }
            if ("form" === q.tagName.toLowerCase()) {
              Zg(n, p, q);
              break a;
            }
          }
          "string" == typeof q && Xg(n, p, q, void 0);
        }
  }
  function $g(a, b, c, d) {
    if (c.href) {
      var e = Xg(a, b, c.href, void 0 === d ? !1 : d);
      Va.test(e) && (c.href = e);
    }
  }
  function Zg(a, b, c) {
    if (c && c.action) {
      var d = (c.method || "").toLowerCase();
      if ("get" === d) {
        for (var e = c.childNodes || [], f = !1, g = 0; g < e.length; g++) {
          var l = e[g];
          if (l.name === a) {
            l.setAttribute("value", b);
            f = !0;
            break;
          }
        }
        if (!f) {
          var m = G.createElement("input");
          m.setAttribute("type", "hidden");
          m.setAttribute("name", a);
          m.setAttribute("value", b);
          c.appendChild(m);
        }
      } else if ("post" === d) {
        var n = Xg(a, b, c.action);
        Va.test(n) && (c.action = n);
      }
    }
  }
  function Eg(a) {
    try {
      var b;
      a: {
        for (var c = a, d = 100; c && 0 < d; ) {
          if (c.href && c.nodeName.match(/^a(?:rea)?$/i)) {
            b = c;
            break a;
          }
          c = c.parentNode;
          d--;
        }
        b = null;
      }
      var e = b;
      if (e) {
        var f = e.protocol;
        ("http:" !== f && "https:" !== f) || Yg(e, e.hostname);
      }
    } catch (g) {}
  }
  function Fg(a) {
    try {
      if (a.action) {
        var b = of(qf(a.action), "host");
        Yg(a, b);
      }
    } catch (c) {}
  }
  var ah = function (a, b, c, d) {
      Hg();
      Ig(a, b, "fragment" === c ? 2 : 1, !!d, !1);
    },
    bh = function (a, b) {
      Hg();
      Ig(a, [nf(B.location, "host", !0)], b, !0, !0);
    },
    ch = function () {
      var a = G.location.hostname,
        b = Lg.exec(G.referrer);
      if (!b) return !1;
      var c = b[2],
        d = b[1],
        e = "";
      if (c) {
        var f = c.split("/"),
          g = f[1];
        e = "s" === g ? decodeURIComponent(f[2]) : decodeURIComponent(g);
      } else if (d) {
        if (0 === d.indexOf("xn--")) return !1;
        e = d.replace(/-/g, ".").replace(/\.\./g, "-");
      }
      var l = a.replace(Mg, ""),
        m = e.replace(Mg, ""),
        n;
      if (!(n = l === m)) {
        var p = "." + m;
        n = l.substring(l.length - p.length, l.length) === p;
      }
      return n;
    },
    dh = function (a, b) {
      return !1 === a ? !1 : a || b || ch();
    };
  var eh = {};
  var fh = /^\w+$/,
    gh = /^[\w-]+$/,
    hh = { aw: "_aw", dc: "_dc", gf: "_gf", ha: "_ha", gp: "_gp", gb: "_gb" },
    ih = function () {
      if (!gd().m() || !wd()) return !0;
      var a = od("ad_storage");
      return null == a ? !0 : !!a;
    },
    jh = function (a, b) {
      qd("ad_storage")
        ? ih()
          ? a()
          : Bd(a, "ad_storage")
        : b
        ? ad("TAGGING", 3)
        : Ad(
            function () {
              jh(a, !0);
            },
            ["ad_storage"]
          );
    },
    lh = function (a) {
      return kh(a).map(function (b) {
        return b.va;
      });
    },
    kh = function (a) {
      var b = [];
      if (!Rf(B) || !G.cookie) return b;
      var c = Uf(a, G.cookie, void 0, "ad_storage");
      if (!c || 0 == c.length) return b;
      for (var d = {}, e = 0; e < c.length; d = { Jc: d.Jc }, e++) {
        var f = mh(c[e]);
        if (null != f) {
          var g = f,
            l = g.version;
          d.Jc = g.va;
          var m = g.timestamp,
            n = g.labels,
            p = ua(
              b,
              (function (q) {
                return function (t) {
                  return t.va === q.Jc;
                };
              })(d)
            );
          p
            ? ((p.timestamp = Math.max(p.timestamp, m)),
              (p.labels = nh(p.labels, n || [])))
            : b.push({ version: l, va: d.Jc, timestamp: m, labels: n });
        }
      }
      b.sort(function (q, t) {
        return t.timestamp - q.timestamp;
      });
      return oh(b);
    };
  function nh(a, b) {
    for (var c = {}, d = [], e = 0; e < a.length; e++)
      (c[a[e]] = !0), d.push(a[e]);
    for (var f = 0; f < b.length; f++) c[b[f]] || d.push(b[f]);
    return d;
  }
  function ph(a) {
    return a && "string" == typeof a && a.match(fh) ? a : "_gcl";
  }
  var rh = function () {
      var a = qf(B.location.href),
        b = of(a, "query", !1, void 0, "gclid"),
        c = of(a, "query", !1, void 0, "gclsrc"),
        d = of(a, "query", !1, void 0, "wbraid"),
        e = of(a, "query", !1, void 0, "dclid");
      if (!b || !c || !d) {
        var f = a.hash.replace("#", "");
        b = b || lf(f, "gclid", void 0);
        c = c || lf(f, "gclsrc", void 0);
        d = d || lf(f, "wbraid", void 0);
      }
      return qh(b, c, e, d);
    },
    qh = function (a, b, c, d) {
      var e = {},
        f = function (g, l) {
          e[l] || (e[l] = []);
          e[l].push(g);
        };
      e.gclid = a;
      e.gclsrc = b;
      e.dclid = c;
      void 0 !== d && gh.test(d) && ((e.gbraid = d), f(d, "gb"));
      if (void 0 !== a && a.match(gh))
        switch (b) {
          case void 0:
            f(a, "aw");
            break;
          case "aw.ds":
            f(a, "aw");
            f(a, "dc");
            break;
          case "ds":
            f(a, "dc");
            break;
          case "3p.ds":
            f(a, "dc");
            break;
          case "gf":
            f(a, "gf");
            break;
          case "ha":
            f(a, "ha");
        }
      c && f(c, "dc");
      return e;
    },
    th = function (a) {
      var b = rh();
      jh(function () {
        sh(b, !1, a);
      });
    };
  function sh(a, b, c, d, e) {
    function f(z, A) {
      var y = uh(z, g);
      y && (fg(y, A, l), (m = !0));
    }
    c = c || {};
    e = e || [];
    var g = ph(c.prefix);
    d = d || Ia();
    var l = og(c, d, !0);
    l.Ta = "ad_storage";
    var m = !1,
      n = Math.round(d / 1e3),
      p = function (z) {
        var A = ["GCL", n, z];
        0 < e.length && A.push(e.join("."));
        return A.join(".");
      };
    a.aw && f("aw", p(a.aw[0]));
    a.dc && f("dc", p(a.dc[0]));
    a.gf && f("gf", p(a.gf[0]));
    a.ha && f("ha", p(a.ha[0]));
    a.gp && f("gp", p(a.gp[0]));
    if (
      (void 0 == eh.enable_gbraid_cookie_write
        ? 0
        : eh.enable_gbraid_cookie_write) &&
      !m &&
      a.gb
    ) {
      var q = a.gb[0],
        t = uh("gb", g),
        u = !1;
      if (!b)
        for (var r = kh(t), v = 0; v < r.length; v++)
          r[v].va === q && r[v].labels && 0 < r[v].labels.length && (u = !0);
      u || f("gb", p(q));
    }
  }
  var wh = function (a, b) {
      var c = Vg(!0);
      jh(function () {
        for (var d = ph(b.prefix), e = 0; e < a.length; ++e) {
          var f = a[e];
          if (void 0 !== hh[f]) {
            var g = uh(f, d),
              l = c[g];
            if (l) {
              var m = Math.min(vh(l), Ia()),
                n;
              b: {
                var p = m;
                if (Rf(B))
                  for (
                    var q = Uf(g, G.cookie, void 0, "ad_storage"), t = 0;
                    t < q.length;
                    ++t
                  )
                    if (vh(q[t]) > p) {
                      n = !0;
                      break b;
                    }
                n = !1;
              }
              if (!n) {
                var u = og(b, m, !0);
                u.Ta = "ad_storage";
                fg(g, l, u);
              }
            }
          }
        }
        sh(qh(c.gclid, c.gclsrc), !1, b);
      });
    },
    uh = function (a, b) {
      var c = hh[a];
      if (void 0 !== c) return b + c;
    },
    vh = function (a) {
      return 0 !== xh(a.split(".")).length
        ? 1e3 * (Number(a.split(".")[1]) || 0)
        : 0;
    };
  function mh(a) {
    var b = xh(a.split("."));
    return 0 === b.length
      ? null
      : {
          version: b[0],
          va: b[2],
          timestamp: 1e3 * (Number(b[1]) || 0),
          labels: b.slice(3),
        };
  }
  function xh(a) {
    return 3 > a.length ||
      ("GCL" !== a[0] && "1" !== a[0]) ||
      !/^\d+$/.test(a[1]) ||
      !gh.test(a[2])
      ? []
      : a;
  }
  var yh = function (a, b, c, d, e) {
      if (ta(b) && Rf(B)) {
        var f = ph(e),
          g = function () {
            for (var l = {}, m = 0; m < a.length; ++m) {
              var n = uh(a[m], f);
              if (n) {
                var p = Uf(n, G.cookie, void 0, "ad_storage");
                p.length && (l[n] = p.sort()[p.length - 1]);
              }
            }
            return l;
          };
        jh(function () {
          ah(g, b, c, d);
        });
      }
    },
    oh = function (a) {
      return a.filter(function (b) {
        return gh.test(b.va);
      });
    },
    zh = function (a, b) {
      if (Rf(B)) {
        for (var c = ph(b.prefix), d = {}, e = 0; e < a.length; e++)
          hh[a[e]] && (d[a[e]] = hh[a[e]]);
        jh(function () {
          Ba(d, function (f, g) {
            var l = Uf(c + g, G.cookie, void 0, "ad_storage");
            l.sort(function (u, r) {
              return vh(r) - vh(u);
            });
            if (l.length) {
              var m = l[0],
                n = vh(m),
                p = 0 !== xh(m.split(".")).length ? m.split(".").slice(3) : [],
                q = {},
                t;
              t = 0 !== xh(m.split(".")).length ? m.split(".")[2] : void 0;
              q[f] = [t];
              sh(q, !0, b, n, p);
            }
          });
        });
      }
    };
  function Ah(a, b) {
    for (var c = 0; c < b.length; ++c) if (a[b[c]]) return !0;
    return !1;
  }
  var Bh = function (a) {
    function b(e, f, g) {
      g && (e[f] = g);
    }
    if (wd()) {
      var c = rh();
      if (Ah(c, a)) {
        var d = {};
        b(d, "gclid", c.gclid);
        b(d, "dclid", c.dclid);
        b(d, "gclsrc", c.gclsrc);
        b(d, "wbraid", c.gbraid);
        bh(function () {
          return d;
        }, 3);
        bh(function () {
          var e = {};
          return (e._up = "1"), e;
        }, 1);
      }
    }
  };
  function Ch(a, b) {
    var c = ph(b),
      d = uh(a, c);
    if (!d) return 0;
    for (var e = kh(d), f = 0, g = 0; g < e.length; g++)
      f = Math.max(f, e[g].timestamp);
    return f;
  }
  function Dh(a) {
    var b = 0,
      c;
    for (c in a)
      for (var d = a[c], e = 0; e < d.length; e++)
        b = Math.max(b, Number(d[e].timestamp));
    return b;
  }
  var Zh = new RegExp(
      /^(.*\.)?(google|youtube|blogger|withgoogle)(\.com?)?(\.[a-z]{2})?\.?$/
    ),
    $h = {
      cl: ["ecl"],
      customPixels: ["nonGooglePixels"],
      ecl: ["cl"],
      ehl: ["hl"],
      hl: ["ehl"],
      html: [
        "customScripts",
        "customPixels",
        "nonGooglePixels",
        "nonGoogleScripts",
        "nonGoogleIframes",
      ],
      customScripts: [
        "html",
        "customPixels",
        "nonGooglePixels",
        "nonGoogleScripts",
        "nonGoogleIframes",
      ],
      nonGooglePixels: [],
      nonGoogleScripts: ["nonGooglePixels"],
      nonGoogleIframes: ["nonGooglePixels"],
    },
    ai = {
      cl: ["ecl"],
      customPixels: ["customScripts", "html"],
      ecl: ["cl"],
      ehl: ["hl"],
      hl: ["ehl"],
      html: ["customScripts"],
      customScripts: ["html"],
      nonGooglePixels: [
        "customPixels",
        "customScripts",
        "html",
        "nonGoogleScripts",
        "nonGoogleIframes",
      ],
      nonGoogleScripts: ["customScripts", "html"],
      nonGoogleIframes: ["customScripts", "html", "nonGoogleScripts"],
    },
    bi =
      "google customPixels customScripts html nonGooglePixels nonGoogleScripts nonGoogleIframes".split(
        " "
      );
  var ci = function () {
      var a = !1;
      a = !0;
      return a;
    },
    ei = function (a) {
      var b = Te("gtm.allowlist") || Te("gtm.whitelist");
      b && dd(9);
      ci() && (b = "google gtagfl lcl zone oid op".split(" "));
      var c = b && Na(Fa(b), $h),
        d = Te("gtm.blocklist") || Te("gtm.blacklist");
      d || ((d = Te("tagTypeBlacklist")) && dd(3));
      d ? dd(8) : (d = []);
      di() &&
        ((d = Fa(d)),
        d.push("nonGooglePixels", "nonGoogleScripts", "sandboxedScripts"));
      0 <= Fa(d).indexOf("google") && dd(2);
      var e = d && Na(Fa(d), ai),
        f = {};
      return function (g) {
        var l = g && g[Gb.qb];
        if (!l || "string" != typeof l) return !0;
        l = l.replace(/^_*/, "");
        if (void 0 !== f[l]) return f[l];
        var m = Me[l] || [],
          n = a(l, m);
        if (b) {
          var p;
          if ((p = n))
            a: {
              if (0 > c.indexOf(l))
                if (m && 0 < m.length)
                  for (var q = 0; q < m.length; q++) {
                    if (0 > c.indexOf(m[q])) {
                      dd(11);
                      p = !1;
                      break a;
                    }
                  }
                else {
                  p = !1;
                  break a;
                }
              p = !0;
            }
          n = p;
        }
        var t = !1;
        if (d) {
          var u = 0 <= e.indexOf(l);
          if (u) t = u;
          else {
            var r = Aa(e, m || []);
            r && dd(10);
            t = r;
          }
        }
        var v = !n || t;
        v ||
          !(0 <= m.indexOf("sandboxedScripts")) ||
          (c && -1 !== c.indexOf("sandboxedScripts")) ||
          (v = Aa(e, bi));
        return (f[l] = v);
      };
    },
    di = function () {
      return Zh.test(B.location && B.location.hostname);
    };
  var fi = !1,
    gi = 0,
    hi = [];
  function ii(a) {
    if (!fi) {
      var b = G.createEventObject,
        c = "complete" == G.readyState,
        d = "interactive" == G.readyState;
      if (!a || "readystatechange" != a.type || c || (!b && d)) {
        fi = !0;
        for (var e = 0; e < hi.length; e++) H(hi[e]);
      }
      hi.push = function () {
        for (var f = 0; f < arguments.length; f++) H(arguments[f]);
        return 0;
      };
    }
  }
  function ji() {
    if (!fi && 140 > gi) {
      gi++;
      try {
        G.documentElement.doScroll("left"), ii();
      } catch (a) {
        B.setTimeout(ji, 50);
      }
    }
  }
  var ki = function (a) {
    fi ? a() : hi.push(a);
  };
  var mi = function (a, b) {
      this.m = !1;
      this.D = [];
      this.J = { tags: [] };
      this.X = !1;
      this.o = this.s = 0;
      li(this, a, b);
    },
    ni = function (a, b, c, d) {
      if (De.hasOwnProperty(b) || "__zone" === b) return -1;
      var e = {};
      Cb(d) && (e = Db(d, e));
      e.id = c;
      e.status = "timeout";
      return a.J.tags.push(e) - 1;
    },
    oi = function (a, b, c, d) {
      var e = a.J.tags[b];
      e && ((e.status = c), (e.executionTime = d));
    },
    pi = function (a) {
      if (!a.m) {
        for (var b = a.D, c = 0; c < b.length; c++) b[c]();
        a.m = !0;
        a.D.length = 0;
      }
    },
    li = function (a, b, c) {
      ra(b) && qi(a, b);
      c &&
        B.setTimeout(function () {
          return pi(a);
        }, Number(c));
    },
    qi = function (a, b) {
      var c = Ka(function () {
        return H(function () {
          b(M.I, a.J);
        });
      });
      a.m ? c() : a.D.push(c);
    },
    ri = function (a) {
      a.s++;
      return Ka(function () {
        a.o++;
        a.X && a.o >= a.s && pi(a);
      });
    };
  var si = function () {
      function a(d) {
        return !sa(d) || 0 > d ? 0 : d;
      }
      if (!Q._li && B.performance && B.performance.timing) {
        var b = B.performance.timing.navigationStart,
          c = sa(Ue.get("gtm.start")) ? Ue.get("gtm.start") : 0;
        Q._li = { cst: a(c - b), cbt: a(Je - b) };
      }
    },
    ti = function (a) {
      B.performance && B.performance.mark(M.I + "_" + a + "_start");
    },
    ui = function (a) {
      if (B.performance) {
        var b = M.I + "_" + a + "_start",
          c = M.I + "_" + a + "_duration";
        B.performance.measure(c, b);
        var d = B.performance.getEntriesByName(c)[0];
        B.performance.clearMarks(b);
        B.performance.clearMeasures(c);
        var e = Q._p || {};
        void 0 === e[a] && ((e[a] = d.duration), (Q._p = e));
        return d.duration;
      }
    },
    vi = function () {
      if (B.performance && B.performance.now) {
        var a = Q._p || {};
        a.PAGEVIEW = B.performance.now();
        Q._p = a;
      }
    };
  var wi = {},
    xi = function () {
      return B.GoogleAnalyticsObject && B[B.GoogleAnalyticsObject];
    },
    yi = !1;
  var zi = function (a) {
      B.GoogleAnalyticsObject || (B.GoogleAnalyticsObject = a || "ga");
      var b = B.GoogleAnalyticsObject;
      if (B[b]) B.hasOwnProperty(b) || dd(12);
      else {
        var c = function () {
          c.q = c.q || [];
          c.q.push(arguments);
        };
        c.l = Number(Ha());
        B[b] = c;
      }
      si();
      return B[b];
    },
    Ai = function (a) {
      if (wd()) {
        var b = xi();
        b(a + "require", "linker");
        b(a + "linker:passthrough", !0);
      }
    };
  function Bi() {
    return B.GoogleAnalyticsObject || "ga";
  }
  var Ci = function (a) {},
    Di = function (a, b) {
      return function () {
        var c = xi(),
          d = c && c.getByName && c.getByName(a);
        if (d) {
          var e = d.get("sendHitTask");
          d.set("sendHitTask", function (f) {
            var g = f.get("hitPayload"),
              l = f.get("hitCallback"),
              m = 0 > g.indexOf("&tid=" + b);
            m &&
              (f.set(
                "hitPayload",
                g.replace(/&tid=UA-[0-9]+-[0-9]+/, "&tid=" + b),
                !0
              ),
              f.set("hitCallback", void 0, !0));
            e(f);
            m &&
              (f.set("hitPayload", g, !0),
              f.set("hitCallback", l, !0),
              f.set("_x_19", void 0, !0),
              e(f));
          });
        }
      };
    };
  var Ki = function (a) {},
    Xi = function (a) {},
    Yi = function () {
      return (
        "&tc=" +
        fc.filter(function (a) {
          return a;
        }).length
      );
    },
    aj = function () {
      2022 <= Zi().length && $i();
    },
    bj = function (a) {
      return 0 === a.indexOf("gtm.") ? encodeURIComponent(a) : "*";
    },
    dj = function () {
      cj || (cj = B.setTimeout($i, 500));
    },
    $i = function () {
      cj && (B.clearTimeout(cj), (cj = void 0));
      void 0 === ej ||
        (fj[ej] && !gj && !hj) ||
        (ij[ej] || jj.Ti() || 0 >= kj--
          ? (dd(1), (ij[ej] = !0))
          : (jj.qj(),
            ob(Zi(!0)),
            (fj[ej] = !0),
            (lj = mj = nj = hj = gj = "")));
    },
    Zi = function (a) {
      var b = ej;
      if (void 0 === b) return "";
      var c = bd("GTM"),
        d = bd("TAGGING");
      return [
        oj,
        fj[b] ? "" : "&es=1",
        pj[b],
        Ki(b),
        c ? "&u=" + c : "",
        d ? "&ut=" + d : "",
        Yi(),
        gj,
        hj,
        nj,
        mj,
        Xi(a),
        lj,
        "&z=0",
      ].join("");
    },
    rj = function () {
      oj = qj();
    },
    qj = function () {
      return [Ke, "&v=3&t=t", "&pid=" + wa(), "&rv=" + M.ed].join("");
    },
    Wi = ["L", "S", "Y"],
    Ji = ["S", "E"],
    sj = { sampleRate: "0.005000", eh: "", dh: Number("5") },
    tj =
      0 <= G.location.search.indexOf("?gtm_latency=") ||
      0 <= G.location.search.indexOf("&gtm_latency="),
    uj;
  if (!(uj = tj)) {
    var vj = Math.random(),
      wj = sj.sampleRate;
    uj = vj < wj;
  }
  var xj = uj,
    yj = {
      label: M.I + " Container",
      children: [{ label: "Initialization", children: [] }],
    },
    oj = qj(),
    fj = {},
    gj = "",
    hj = "",
    lj = "",
    mj = "",
    Mi = {},
    Li = !1,
    Ii = {},
    zj = {},
    nj = "",
    ej = void 0,
    pj = {},
    ij = {},
    cj = void 0,
    Aj = 5;
  0 < sj.dh && (Aj = sj.dh);
  var jj = (function (a, b) {
      for (var c = 0, d = [], e = 0; e < a; ++e) d.push(0);
      return {
        Ti: function () {
          return c < a ? !1 : Ia() - d[c % a] < b;
        },
        qj: function () {
          var f = c++ % a;
          d[f] = Ia();
        },
      };
    })(Aj, 1e3),
    kj = 1e3,
    Cj = function (a, b) {
      if (xj && !ij[a] && ej !== a) {
        $i();
        ej = a;
        lj = gj = "";
        pj[a] = "&e=" + bj(b) + "&eid=" + a;
        dj();
      }
    },
    Dj = function (a, b, c, d) {
      if (xj && b) {
        var e,
          f = String(b[Gb.qb] || "").replace(/_/g, "");
        0 === f.indexOf("cvt") && (f = "cvt");
        e = f;
        var g = c + e;
        if (!ij[a]) {
          a !== ej && ($i(), (ej = a));
          gj = gj ? gj + "." + g : "&tr=" + g;
          var l = b["function"];
          if (!l)
            throw Error("Error: No function name given for function call.");
          var m = (ic[l] ? "1" : "2") + e;
          lj = lj ? lj + "." + m : "&ti=" + m;
          dj();
          aj();
        }
      }
    };
  var Kj = function (a, b, c) {
      if (xj && !ij[a]) {
        a !== ej && ($i(), (ej = a));
        var d = c + b;
        hj = hj ? hj + "." + d : "&epr=" + d;
        dj();
        aj();
      }
    },
    Lj = function (a, b, c) {};
  function Mj(a, b, c, d) {
    var e = fc[a],
      f = Nj(a, b, c, d);
    if (!f) return null;
    var g = nc(e[Gb.Xf], c, []);
    if (g && g.length) {
      var l = g[0];
      f = Mj(
        l.index,
        {
          onSuccess: f,
          onFailure: 1 === l.rg ? b.terminate : f,
          terminate: b.terminate,
        },
        c,
        d
      );
    }
    return f;
  }
  function Nj(a, b, c, d) {
    function e() {
      if (f[Gb.Yh]) l();
      else {
        var z = oc(f, c, []);
        var A = z[Gb.ih];
        if (null != A)
          for (var y = 0; y < A.length; y++)
            if (!Jd(A[y])) {
              l();
              return;
            }
        var x = ni(c.Ob, String(f[Gb.qb]), Number(f[Gb.Yf]), z[Gb.Zh]),
          w = !1;
        z.vtp_gtmOnSuccess = function () {
          if (!w) {
            w = !0;
            var E = Ia() - D;
            Dj(c.id, fc[a], "5", E);
            oi(c.Ob, x, "success", E);
            g();
          }
        };
        z.vtp_gtmOnFailure = function () {
          if (!w) {
            w = !0;
            var E = Ia() - D;
            Dj(c.id, fc[a], "6", E);
            oi(c.Ob, x, "failure", E);
            l();
          }
        };
        z.vtp_gtmTagId = f.tag_id;
        z.vtp_gtmEventId = c.id;
        Dj(c.id, f, "1");
        var C = function () {
          var E = Ia() - D;
          Dj(c.id, f, "7", E);
          oi(c.Ob, x, "exception", E);
          w || ((w = !0), l());
        };
        var D = Ia();
        try {
          mc(z, { event: c, index: a, type: 1 });
        } catch (E) {
          C(E);
        }
      }
    }
    var f = fc[a],
      g = b.onSuccess,
      l = b.onFailure,
      m = b.terminate;
    if (c.Me(f)) return null;
    var n = nc(f[Gb.Zf], c, []);
    if (n && n.length) {
      var p = n[0],
        q = Mj(p.index, { onSuccess: g, onFailure: l, terminate: m }, c, d);
      if (!q) return null;
      g = q;
      l = 2 === p.rg ? m : q;
    }
    if (f[Gb.Tf] || f[Gb.ci]) {
      var t = f[Gb.Tf] ? hc : c.Cj,
        u = g,
        r = l;
      if (!t[a]) {
        e = Ka(e);
        var v = Oj(a, t, e);
        g = v.onSuccess;
        l = v.onFailure;
      }
      return function () {
        t[a](u, r);
      };
    }
    return e;
  }
  function Oj(a, b, c) {
    var d = [],
      e = [];
    b[a] = Pj(d, e, c);
    return {
      onSuccess: function () {
        b[a] = Qj;
        for (var f = 0; f < d.length; f++) d[f]();
      },
      onFailure: function () {
        b[a] = Rj;
        for (var f = 0; f < e.length; f++) e[f]();
      },
    };
  }
  function Pj(a, b, c) {
    return function (d, e) {
      a.push(d);
      b.push(e);
      c();
    };
  }
  function Qj(a) {
    a();
  }
  function Rj(a, b) {
    b();
  }
  var Sj = {
      active: !0,
      isAllowed: function () {
        return !0;
      },
    },
    Tj = function (a) {
      var b = Q.zones;
      return b ? b.checkState(M.I, a) : Sj;
    },
    Uj = function (a) {
      var b = Q.zones;
      !b && a && (b = Q.zones = a());
      return b;
    };
  var Xj = function (a, b) {
    for (var c = [], d = 0; d < fc.length; d++)
      if (a[d]) {
        var e = fc[d];
        var f = ri(b.Ob);
        try {
          var g = Mj(d, { onSuccess: f, onFailure: f, terminate: f }, b, d);
          if (g) {
            var l = c,
              m = l.push,
              n = d,
              p = e["function"];
            if (!p) throw "Error: No function name given for function call.";
            var q = ic[p];
            m.call(l, {
              Wg: n,
              Mg: q ? q.priorityOverride || 0 : 0,
              execute: g,
            });
          } else Vj(d, b), f();
        } catch (r) {
          f();
        }
      }
    var t = b.Ob;
    t.X = !0;
    t.o >= t.s && pi(t);
    c.sort(Wj);
    for (var u = 0; u < c.length; u++) c[u].execute();
    return 0 < c.length;
  };
  function Wj(a, b) {
    var c,
      d = b.Mg,
      e = a.Mg;
    c = d > e ? 1 : d < e ? -1 : 0;
    var f;
    if (0 !== c) f = c;
    else {
      var g = a.Wg,
        l = b.Wg;
      f = g > l ? 1 : g < l ? -1 : 0;
    }
    return f;
  }
  function Vj(a, b) {
    if (!xj) return;
    var c = function (d) {
      var e = b.Me(fc[d]) ? "3" : "4",
        f = nc(fc[d][Gb.Xf], b, []);
      f && f.length && c(f[0].index);
      Dj(b.id, fc[d], e);
      var g = nc(fc[d][Gb.Zf], b, []);
      g && g.length && c(g[0].index);
    };
    c(a);
  }
  var Yj = !1;
  var dk = function (a) {
    var b = Ia(),
      c = a["gtm.uniqueEventId"],
      d = a.event;
    if ("gtm.js" === d) {
      if (Yj) return !1;
      Yj = !0;
    }
    var g = Tj(c),
      l = !1;
    if (!g.active) {
      if ("gtm.js" !== d && "gtm.init" !== d && "gtm.init_consent" !== d)
        return !1;
      l = !0;
      g = Tj(Number.MAX_SAFE_INTEGER);
    }
    Cj(c, d);
    var m = a.eventCallback,
      n = a.eventTimeout,
      p = m;
    var q = {
        id: c,
        name: d,
        Me: ei(g.isAllowed),
        Cj: [],
        Fg: function () {
          dd(6);
        },
        lg: Zj(),
        mg: ak(c),
        Ob: new mi(p, n),
      },
      t = sc(q);
    l && (t = bk(t));
    var u = Xj(t, q);
    ("gtm.js" !== d && "gtm.sync" !== d) || Ci(M.I);
    return ck(t, u);
  };
  function ak(a) {
    return function (b) {
      xj && (Fb(b) || Lj(a, "input", b));
    };
  }
  function Zj() {
    var a = {};
    a.event = Xe("event", 1);
    a.ecommerce = Xe("ecommerce", 1);
    a.gtm = Xe("gtm");
    a.eventModel = Xe("eventModel");
    return a;
  }
  function bk(a) {
    for (var b = [], c = 0; c < a.length; c++)
      if (a[c]) {
        Ce[String(fc[c][Gb.qb])] && (b[c] = !0);
        void 0 !== fc[c][Gb.di] && (b[c] = !0);
      }
    return b;
  }
  function ck(a, b) {
    if (!b) return b;
    for (var c = 0; c < a.length; c++)
      if (a[c] && fc[c] && !De[String(fc[c][Gb.qb])]) return !0;
    return !1;
  }
  function ek(a, b) {
    if (a) {
      var c = "" + a;
      0 !== c.indexOf("http://") &&
        0 !== c.indexOf("https://") &&
        (c = "https://" + c);
      "/" === c[c.length - 1] && (c = c.substring(0, c.length - 1));
      return qf("" + c + b).href;
    }
  }
  function fk(a, b) {
    return gk() ? ek(a, b) : void 0;
  }
  function gk() {
    var a = !1;
    return a;
  }
  function hk() {
    return !!M.fd && "SGTM_TOKEN" !== M.fd.replaceAll("@@", "");
  }
  var ik = function () {
    var a = !1;
    return a;
  };
  var jk;
  if (3 === M.ed.length) jk = "g";
  else {
    var kk = "G";
    kk = "g";
    jk = kk;
  }
  var lk = {
      "": "n",
      UA: "u",
      AW: "a",
      DC: "d",
      G: "e",
      GF: "f",
      HA: "h",
      GTM: jk,
      OPT: "o",
    },
    mk = function (a) {
      var b = M.I.split("-"),
        c = b[0].toUpperCase(),
        d = lk[c] || "i",
        e = a && "GTM" === c ? b[1] : "OPT" === c ? b[1] : "",
        f;
      if (3 === M.ed.length) {
        var g = "w";
        g = ik() ? "s" : "o";
        f = "2" + g;
      } else f = "";
      return f + d + M.ed + e;
    };
  function nk(a, b) {
    if ("" === a) return b;
    var c = Number(a);
    return isNaN(c) ? b : c;
  }
  var ok = function (a, b) {
    a.addEventListener && a.addEventListener.call(a, "message", b, !1);
  };
  function pk() {
    return Xa("iPhone") && !Xa("iPod") && !Xa("iPad");
  }
  Xa("Opera");
  Xa("Trident") || Xa("MSIE");
  Xa("Edge");
  !Xa("Gecko") ||
    (-1 != Wa().toLowerCase().indexOf("webkit") && !Xa("Edge")) ||
    Xa("Trident") ||
    Xa("MSIE") ||
    Xa("Edge");
  -1 != Wa().toLowerCase().indexOf("webkit") && !Xa("Edge") && Xa("Mobile");
  Xa("Macintosh");
  Xa("Windows");
  Xa("Linux") || Xa("CrOS");
  var qk = na.navigator || null;
  qk && (qk.appVersion || "").indexOf("X11");
  Xa("Android");
  pk();
  Xa("iPad");
  Xa("iPod");
  pk() || Xa("iPad") || Xa("iPod");
  Wa().toLowerCase().indexOf("kaios");
  var rk = function (a) {
    if (!a || !G.head) return null;
    var b, c;
    c = void 0 === c ? document : c;
    b = c.createElement("meta");
    G.head.appendChild(b);
    b.httpEquiv = "origin-trial";
    b.content = a;
    return b;
  };
  var sk = function () {};
  var tk = function (a) {
      void 0 !== a.addtlConsent &&
        "string" !== typeof a.addtlConsent &&
        (a.addtlConsent = void 0);
      void 0 !== a.gdprApplies &&
        "boolean" !== typeof a.gdprApplies &&
        (a.gdprApplies = void 0);
      return (void 0 !== a.tcString && "string" !== typeof a.tcString) ||
        (void 0 !== a.listenerId && "number" !== typeof a.listenerId)
        ? 2
        : a.cmpStatus && "error" !== a.cmpStatus
        ? 0
        : 3;
    },
    uk = function (a, b) {
      this.o = a;
      this.m = null;
      this.D = {};
      this.X = 0;
      this.J = void 0 === b ? 500 : b;
      this.s = null;
    };
  ma(uk, sk);
  uk.prototype.addEventListener = function (a) {
    var b = {},
      c = Qf(function () {
        return a(b);
      }),
      d = 0;
    -1 !== this.J &&
      (d = setTimeout(function () {
        b.tcString = "tcunavailable";
        b.internalErrorState = 1;
        c();
      }, this.J));
    var e = function (f, g) {
      clearTimeout(d);
      f
        ? ((b = f),
          (b.internalErrorState = tk(b)),
          (g && 0 === b.internalErrorState) ||
            ((b.tcString = "tcunavailable"), g || (b.internalErrorState = 3)))
        : ((b.tcString = "tcunavailable"), (b.internalErrorState = 3));
      a(b);
    };
    try {
      vk(this, "addEventListener", e);
    } catch (f) {
      (b.tcString = "tcunavailable"),
        (b.internalErrorState = 3),
        d && (clearTimeout(d), (d = 0)),
        c();
    }
  };
  uk.prototype.removeEventListener = function (a) {
    a && a.listenerId && vk(this, "removeEventListener", null, a.listenerId);
  };
  var xk = function (a, b, c) {
      var d;
      d = void 0 === d ? "755" : d;
      var e;
      a: {
        if (a.publisher && a.publisher.restrictions) {
          var f = a.publisher.restrictions[b];
          if (void 0 !== f) {
            e = f[void 0 === d ? "755" : d];
            break a;
          }
        }
        e = void 0;
      }
      var g = e;
      if (0 === g) return !1;
      var l = c;
      2 === c
        ? ((l = 0), 2 === g && (l = 1))
        : 3 === c && ((l = 1), 1 === g && (l = 0));
      var m;
      if (0 === l)
        if (a.purpose && a.vendor) {
          var n = wk(a.vendor.consents, void 0 === d ? "755" : d);
          m =
            n && "1" === b && a.purposeOneTreatment && "CH" === a.publisherCC
              ? !0
              : n && wk(a.purpose.consents, b);
        } else m = !0;
      else
        m =
          1 === l
            ? a.purpose && a.vendor
              ? wk(a.purpose.legitimateInterests, b) &&
                wk(a.vendor.legitimateInterests, void 0 === d ? "755" : d)
              : !0
            : !0;
      return m;
    },
    wk = function (a, b) {
      return !(!a || !a[b]);
    },
    vk = function (a, b, c, d) {
      c || (c = function () {});
      if ("function" === typeof a.o.__tcfapi) {
        var e = a.o.__tcfapi;
        e(b, 2, c, d);
      } else if (yk(a)) {
        zk(a);
        var f = ++a.X;
        a.D[f] = c;
        if (a.m) {
          var g = {};
          a.m.postMessage(
            ((g.__tcfapiCall = {
              command: b,
              version: 2,
              callId: f,
              parameter: d,
            }),
            g),
            "*"
          );
        }
      } else c({}, !1);
    },
    yk = function (a) {
      if (a.m) return a.m;
      var b;
      a: {
        for (var c = a.o, d = 0; 50 > d; ++d) {
          var e;
          try {
            e = !(!c.frames || !c.frames.__tcfapiLocator);
          } catch (l) {
            e = !1;
          }
          if (e) {
            b = c;
            break a;
          }
          var f;
          b: {
            try {
              var g = c.parent;
              if (g && g != c) {
                f = g;
                break b;
              }
            } catch (l) {}
            f = null;
          }
          if (!(c = f)) break;
        }
        b = null;
      }
      a.m = b;
      return a.m;
    },
    zk = function (a) {
      a.s ||
        ((a.s = function (b) {
          try {
            var c;
            c = ("string" === typeof b.data ? JSON.parse(b.data) : b.data)
              .__tcfapiReturn;
            a.D[c.callId](c.returnValue, c.success);
          } catch (d) {}
        }),
        ok(a.o, a.s));
    };
  var Ak = !0;
  Ak = !1;
  var Bk = { 1: 0, 3: 0, 4: 0, 7: 3, 9: 3, 10: 3 },
    Ck = nk("", 550),
    Dk = nk("", 500);
  function Ek() {
    var a = Q.tcf || {};
    return (Q.tcf = a);
  }
  var Jk = function () {
    var a = Ek(),
      b = new uk(B, Ak ? 3e3 : -1);
    if (
      !0 === B.gtag_enable_tcf_support &&
      !a.active &&
      ("function" === typeof B.__tcfapi ||
        "function" === typeof b.o.__tcfapi ||
        null != yk(b))
    ) {
      a.active = !0;
      a.Ec = {};
      Fk();
      var c = null;
      Ak
        ? (c = B.setTimeout(function () {
            Gk(a);
            Hk(a);
            c = null;
          }, Dk))
        : (a.tcString = "tcunavailable");
      try {
        b.addEventListener(function (d) {
          c && (clearTimeout(c), (c = null));
          if (0 !== d.internalErrorState) Gk(a), Hk(a);
          else {
            var e;
            a.gdprApplies = d.gdprApplies;
            if (!1 === d.gdprApplies) (e = Ik()), b.removeEventListener(d);
            else if (
              "tcloaded" === d.eventStatus ||
              "useractioncomplete" === d.eventStatus ||
              "cmpuishown" === d.eventStatus
            ) {
              var f = {},
                g;
              for (g in Bk)
                if (Bk.hasOwnProperty(g))
                  if ("1" === g) {
                    var l = d,
                      m = !0;
                    m = void 0 === m ? !1 : m;
                    var n;
                    var p = l;
                    !1 === p.gdprApplies
                      ? (n = !0)
                      : (void 0 === p.internalErrorState &&
                          (p.internalErrorState = tk(p)),
                        (n =
                          "error" === p.cmpStatus ||
                          0 !== p.internalErrorState ||
                          ("loaded" === p.cmpStatus &&
                            ("tcloaded" === p.eventStatus ||
                              "useractioncomplete" === p.eventStatus))
                            ? !0
                            : !1));
                    f["1"] = n
                      ? !1 === l.gdprApplies ||
                        "tcunavailable" === l.tcString ||
                        (void 0 === l.gdprApplies && !m) ||
                        "string" !== typeof l.tcString ||
                        !l.tcString.length
                        ? !0
                        : xk(l, "1", 0)
                      : !1;
                  } else f[g] = xk(d, g, Bk[g]);
              e = f;
            }
            e && ((a.tcString = d.tcString || "tcempty"), (a.Ec = e), Hk(a));
          }
        });
      } catch (d) {
        c && (clearTimeout(c), (c = null)), Gk(a), Hk(a);
      }
    }
  };
  function Gk(a) {
    a.type = "e";
    a.tcString = "tcunavailable";
    Ak && (a.Ec = Ik());
  }
  function Fk() {
    var a = {},
      b = ((a.ad_storage = "denied"), (a.wait_for_update = Ck), a);
    Gd(b);
  }
  function Ik() {
    var a = {},
      b;
    for (b in Bk) Bk.hasOwnProperty(b) && (a[b] = !0);
    return a;
  }
  function Hk(a) {
    var b = {},
      c = ((b.ad_storage = a.Ec["1"] ? "granted" : "denied"), b);
    Id(c, 0, { gdprApplies: a ? a.gdprApplies : void 0, tcString: Kk() });
  }
  var Kk = function () {
      var a = Ek();
      return a.active ? a.tcString || "" : "";
    },
    Lk = function () {
      var a = Ek();
      return a.active && void 0 !== a.gdprApplies
        ? a.gdprApplies
          ? "1"
          : "0"
        : "";
    },
    Mk = function (a) {
      if (!Bk.hasOwnProperty(String(a))) return !0;
      var b = Ek();
      return b.active && b.Ec ? !!b.Ec[String(a)] : !0;
    };
  var Tk = !1;
  var Uk = function () {
      this.m = {};
    },
    Vk = function (a, b, c) {
      null != c && (a.m[b] = c);
    },
    Wk = function (a) {
      return Object.keys(a.m)
        .map(function (b) {
          return encodeURIComponent(b) + "=" + encodeURIComponent(a.m[b]);
        })
        .join("&");
    },
    Yk = function (a, b, c, d, e) {};
  var $k = /[A-Z]+/,
    al = /\s/,
    bl = function (a) {
      if (k(a)) {
        a = Ga(a);
        var b = a.indexOf("-");
        if (!(0 > b)) {
          var c = a.substring(0, b);
          if ($k.test(c)) {
            for (
              var d = a.substring(b + 1).split("/"), e = 0;
              e < d.length;
              e++
            )
              if (!d[e] || (al.test(d[e]) && ("AW" !== c || 1 !== e))) return;
            return { id: a, prefix: c, containerId: c + "-" + d[0], K: d };
          }
        }
      }
    },
    dl = function (a) {
      for (var b = {}, c = 0; c < a.length; ++c) {
        var d = bl(a[c]);
        d && (b[d.id] = d);
      }
      cl(b);
      var e = [];
      Ba(b, function (f, g) {
        e.push(g);
      });
      return e;
    };
  function cl(a) {
    var b = [],
      c;
    for (c in a)
      if (a.hasOwnProperty(c)) {
        var d = a[c];
        "AW" === d.prefix && d.K[1] && b.push(d.containerId);
      }
    for (var e = 0; e < b.length; ++e) delete a[b[e]];
  }
  var fl = function (a, b, c, d) {
      return (2 === el() || d || "http:" != B.location.protocol ? a : b) + c;
    },
    el = function () {
      var a = mb(),
        b;
      if (1 === a)
        a: {
          var c = Fe;
          c = c.toLowerCase();
          for (
            var d = "https://" + c,
              e = "http://" + c,
              f = 1,
              g = G.getElementsByTagName("script"),
              l = 0;
            l < g.length && 100 > l;
            l++
          ) {
            var m = g[l].src;
            if (m) {
              m = m.toLowerCase();
              if (0 === m.indexOf(e)) {
                b = 3;
                break a;
              }
              1 === f && 0 === m.indexOf(d) && (f = 2);
            }
          }
          b = f;
        }
      else b = a;
      return b;
    };
  var hl = function (a, b, c) {
      if (B[a.functionName]) return b.Se && H(b.Se), B[a.functionName];
      var d = gl();
      B[a.functionName] = d;
      if (a.kd)
        for (var e = 0; e < a.kd.length; e++) B[a.kd[e]] = B[a.kd[e]] || gl();
      a.wd && void 0 === B[a.wd] && (B[a.wd] = c);
      lb(fl("https://", "http://", a.Ye), b.Se, b.dj);
      return d;
    },
    gl = function () {
      var a = function () {
        a.q = a.q || [];
        a.q.push(arguments);
      };
      return a;
    },
    il = {
      functionName: "_googWcmImpl",
      wd: "_googWcmAk",
      Ye: "www.gstatic.com/wcm/loader.js",
    },
    jl = {
      functionName: "_gaPhoneImpl",
      wd: "ga_wpid",
      Ye: "www.gstatic.com/gaphone/loader.js",
    },
    kl = { hh: "", ei: "5" },
    ll = {
      functionName: "_googCallTrackingImpl",
      kd: [jl.functionName, il.functionName],
      Ye:
        "www.gstatic.com/call-tracking/call-tracking_" +
        (kl.hh || kl.ei) +
        ".js",
    },
    ml = {},
    nl = function (a, b, c, d) {
      dd(22);
      if (c) {
        d = d || {};
        var e = hl(il, d, a),
          f = { ak: a, cl: b };
        void 0 === d.Sa && (f.autoreplace = c);
        e(2, d.Sa, f, c, 0, Ha(), d.options);
      }
    },
    ol = function (a, b, c, d) {
      dd(21);
      if (b && c) {
        d = d || {};
        for (
          var e = {
              countryNameCode: c,
              destinationNumber: b,
              retrievalTime: Ha(),
            },
            f = 0;
          f < a.length;
          f++
        ) {
          var g = a[f];
          ml[g.id] ||
            (g && "AW" === g.prefix && !e.adData && 2 <= g.K.length
              ? ((e.adData = { ak: g.K[0], cl: g.K[1] }), (ml[g.id] = !0))
              : g &&
                "UA" === g.prefix &&
                !e.gaData &&
                ((e.gaData = { gaWpid: g.containerId }), (ml[g.id] = !0)));
        }
        (e.gaData || e.adData) && hl(ll, d)(d.Sa, e, d.options);
      }
    },
    pl = function () {
      var a = !1;
      return a;
    },
    ql = function (a, b) {
      if (a)
        if (ik()) {
        } else {
          if (k(a)) {
            var c = bl(a);
            if (!c) return;
            a = c;
          }
          var d = void 0,
            e = !1,
            f = b.getWithConfig(J.Kh);
          if (f && ta(f)) {
            d = [];
            for (var g = 0; g < f.length; g++) {
              var l = bl(f[g]);
              l &&
                (d.push(l),
                (a.id === l.id ||
                  (a.id === a.containerId &&
                    a.containerId === l.containerId)) &&
                  (e = !0));
            }
          }
          if (!d || e) {
            var m = b.getWithConfig(J.Hf),
              n;
            if (m) {
              ta(m) ? (n = m) : (n = [m]);
              var p = b.getWithConfig(J.Ff),
                q = b.getWithConfig(J.Gf),
                t = b.getWithConfig(J.If),
                u = b.getWithConfig(J.Jh),
                r = p || q,
                v = 1;
              "UA" !== a.prefix || d || (v = 5);
              for (var z = 0; z < n.length; z++)
                if (z < v)
                  if (d) ol(d, n[z], u, { Sa: r, options: t });
                  else if ("AW" === a.prefix && a.K[1])
                    pl()
                      ? ol([a], n[z], u || "US", { Sa: r, options: t })
                      : nl(a.K[0], a.K[1], n[z], { Sa: r, options: t });
                  else if ("UA" === a.prefix)
                    if (pl()) ol([a], n[z], u || "US", { Sa: r });
                    else {
                      var A = a.containerId,
                        y = n[z],
                        x = { Sa: r };
                      dd(23);
                      if (y) {
                        x = x || {};
                        var w = hl(jl, x, A),
                          C = {};
                        void 0 !== x.Sa ? (C.receiver = x.Sa) : (C.replace = y);
                        C.ga_wpid = A;
                        C.destination = y;
                        w(2, Ha(), C);
                      }
                    }
            }
          }
        }
    };
  var yl = !1;
  function zl() {
    if (ra(cb.joinAdInterestGroup)) return !0;
    yl || (rk(""), (yl = !0));
    return ra(cb.joinAdInterestGroup);
  }
  function Al(a, b) {
    var c = void 0;
    try {
      c = G.querySelector('iframe[data-tagging-id="' + b + '"]');
    } catch (e) {}
    if (c) {
      var d = Number(c.dataset.loadTime);
      if (d && 6e4 > Ia() - d) {
        ad("TAGGING", 9);
        return;
      }
    } else
      try {
        if (
          50 <=
          G.querySelectorAll(
            'iframe[allow="join-ad-interest-group"][data-tagging-id*="-"]'
          ).length
        ) {
          ad("TAGGING", 10);
          return;
        }
      } catch (e) {}
    nb(
      a,
      void 0,
      { allow: "join-ad-interest-group" },
      { taggingId: b, loadTime: Ia() },
      c
    );
  }
  var wm = function () {
      var a = !0;
      (Mk(7) && Mk(9) && Mk(10)) || (a = !1);
      return a;
    },
    xm = function () {
      var a = !0;
      (Mk(3) && Mk(4)) || (a = !1);
      return a;
    };
  var Bm = function (a, b) {
      var c = b.getWithConfig(J.Qa),
        d = b.getWithConfig(J.Za),
        e = b.getWithConfig(c);
      if (void 0 === e) {
        var f = void 0;
        ym.hasOwnProperty(c)
          ? (f = ym[c])
          : zm.hasOwnProperty(c) && (f = zm[c]);
        1 === f && (f = Am(c));
        k(f)
          ? xi()(function () {
              var g = xi().getByName(a).get(f);
              d(g);
            })
          : d(void 0);
      } else d(e);
    },
    Cm = function (a, b) {
      var c = a[J.cc],
        d = b + ".",
        e = a[J.N] || "",
        f = void 0 === c ? !!a.use_anchor : "fragment" === c,
        g = !!a[J.Jb];
      e = String(e).replace(/\s+/g, "").split(",");
      var l = xi();
      l(d + "require", "linker");
      l(d + "linker:autoLink", e, f, g);
    },
    Gm = function (a, b, c) {
      if (wd() && (!c.isGtmEvent || !Dm[a])) {
        var d = !Jd(J.M),
          e = function (f) {
            var g,
              l,
              m = xi(),
              n = Em(b, "", c),
              p,
              q = n.createOnlyFields._useUp;
            if (c.isGtmEvent || Fm(b, n.createOnlyFields)) {
              var t = !0;
              if (c.isGtmEvent) {
                g = "gtm" + Ne();
                l = n.createOnlyFields;
                n.gtmTrackerName && (l.name = g);
                t = !1;
                t = !0;
              }
              t &&
                m(function () {
                  var r = m.getByName(b);
                  r && (p = r.get("clientId"));
                  c.isGtmEvent || m.remove(b);
                });
              m("create", a, c.isGtmEvent ? l : n.createOnlyFields);
              d &&
                Jd(J.M) &&
                ((d = !1),
                m(function () {
                  var r = xi().getByName(c.isGtmEvent ? g : b);
                  !r ||
                    (r.get("clientId") == p && q) ||
                    (c.isGtmEvent
                      ? ((n.fieldsToSet["&gcu"] = "1"),
                        (n.fieldsToSet["&gcut"] = J.Fd[f]))
                      : ((n.fieldsToSend["&gcu"] = "1"),
                        (n.fieldsToSend["&gcut"] = J.Fd[f])),
                    r.set(n.fieldsToSet),
                    c.isGtmEvent
                      ? r.send("pageview")
                      : r.send("pageview", n.fieldsToSend));
                }));
              c.isGtmEvent &&
                m(function () {
                  m.remove(g);
                });
            }
          };
        Md(function () {
          return e(J.M);
        }, J.M);
        Md(function () {
          return e(J.C);
        }, J.C);
        c.isGtmEvent && (Dm[a] = !0);
      }
    },
    Hm = function (a, b) {
      hk() && b && (a[J.ob] = b);
    },
    Qm = function (a, b, c) {
      function d() {
        var L = c.getWithConfig(J.ac);
        l(function () {
          if (!c.isGtmEvent && Cb(L)) {
            var I = r.fieldsToSend,
              O = m().getByName(n),
              N;
            for (N in L)
              if (
                L.hasOwnProperty(N) &&
                /^(dimension|metric)\d+$/.test(N) &&
                void 0 != L[N]
              ) {
                var K = O.get(Am(L[N]));
                Im(I, N, K);
              }
          }
        });
      }
      function e() {
        if (r.displayfeatures) {
          var L = "_dc_gtm_" + f.replace(/[^A-Za-z0-9-]/g, "");
          p("require", "displayfeatures", void 0, { cookieName: L });
        }
      }
      var f = a,
        g = "https://www.google-analytics.com/analytics.js",
        l = c.isGtmEvent ? zi(c.getWithConfig("gaFunctionName")) : zi();
      if (ra(l)) {
        var m = xi,
          n;
        c.isGtmEvent
          ? (n = c.getWithConfig("name") || c.getWithConfig("gtmTrackerName"))
          : (n = "gtag_" + f.split("-").join("_"));
        var p = function (L) {
            var I = [].slice.call(arguments, 0);
            I[0] = n ? n + "." + I[0] : "" + I[0];
            l.apply(window, I);
          },
          q = function (L) {
            var I = function (S, qa) {
                for (var xa = 0; qa && xa < qa.length; xa++) p(S, qa[xa]);
              },
              O = c.isGtmEvent,
              N = O ? Jm(r) : Km(b, c);
            if (N) {
              var K = {};
              Hm(K, L);
              p("require", "ec", "ec.js", K);
              O && N.Ce && p("set", "&cu", N.Ce);
              var R = N.action;
              if (O || "impressions" === R)
                if ((I("ec:addImpression", N.Bg), !O)) return;
              if ("promo_click" === R || "promo_view" === R || (O && N.Dc)) {
                var ca = N.Dc;
                I("ec:addPromo", ca);
                if (ca && 0 < ca.length && "promo_click" === R) {
                  O ? p("ec:setAction", R, N.fb) : p("ec:setAction", R);
                  return;
                }
                if (!O) return;
              }
              "promo_view" !== R &&
                "impressions" !== R &&
                (I("ec:addProduct", N.wb), p("ec:setAction", R, N.fb));
            }
          },
          t = function (L) {
            if (L) {
              var I = {};
              if (Cb(L))
                for (var O in Lm) Lm.hasOwnProperty(O) && Mm(Lm[O], O, L[O], I);
              Hm(I, A);
              p("require", "linkid", I);
            }
          },
          u = function () {
            if (ik()) {
            } else {
              var L = c.getWithConfig(J.Ih);
              L &&
                (p("require", L, { dataLayer: M.V }), p("require", "render"));
            }
          },
          r = Em(n, b, c),
          v = function (L, I, O) {
            O && (I = "" + I);
            r.fieldsToSend[L] = I;
          };
        !c.isGtmEvent &&
          Fm(n, r.createOnlyFields) &&
          (l(function () {
            m() && m().remove(n);
          }),
          (Nm[n] = !1));
        l("create", f, r.createOnlyFields);
        if (r.createOnlyFields[J.ob] && !c.isGtmEvent) {
          var z = fk(r.createOnlyFields[J.ob], "/analytics.js");
          z && (g = z);
        }
        var A = c.isGtmEvent ? r.fieldsToSet[J.ob] : r.createOnlyFields[J.ob];
        if (A) {
          var y = c.isGtmEvent ? r.fieldsToSet[J.Sc] : r.createOnlyFields[J.Sc];
          y && !Nm[n] && ((Nm[n] = !0), l(Di(n, y)));
        }
        c.isGtmEvent
          ? r.enableRecaptcha && p("require", "recaptcha", "recaptcha.js")
          : (d(), t(r.linkAttribution));
        var x = r[J.ka];
        x && x[J.N] && Cm(x, n);
        p("set", r.fieldsToSet);
        if (c.isGtmEvent) {
          if (r.enableLinkId) {
            var w = {};
            Hm(w, A);
            p("require", "linkid", "linkid.js", w);
          }
          wd() && Gm(f, n, c);
        }
        if (b === J.Yb)
          if (c.isGtmEvent) {
            e();
            if (r.remarketingLists) {
              var C = "_dc_gtm_" + f.replace(/[^A-Za-z0-9-]/g, "");
              p("require", "adfeatures", { cookieName: C });
            }
            q(A);
            p("send", "pageview");
            r.createOnlyFields._useUp && Ai(n + ".");
          } else u(), p("send", "pageview", r.fieldsToSend);
        else
          b === J.Aa
            ? (u(),
              ql(f, c),
              c.getWithConfig(J.eb) && (Bh(["aw", "dc"]), Ai(n + ".")),
              0 != r.sendPageView && p("send", "pageview", r.fieldsToSend),
              Gm(f, n, c),
              !c.isGtmEvent &&
                0 < Ae(c).length &&
                (dd(68), 1 < Q.configCount && dd(69)))
            : b === J.Oa
            ? Bm(n, c)
            : "screen_view" === b
            ? p("send", "screenview", r.fieldsToSend)
            : "timing_complete" === b
            ? ((r.fieldsToSend.hitType = "timing"),
              v("timingCategory", r.eventCategory, !0),
              c.isGtmEvent
                ? v("timingVar", r.timingVar, !0)
                : v("timingVar", r.name, !0),
              v("timingValue", Da(r.value)),
              void 0 !== r.eventLabel && v("timingLabel", r.eventLabel, !0),
              p("send", r.fieldsToSend))
            : "exception" === b
            ? p("send", "exception", r.fieldsToSend)
            : ("" === b && c.isGtmEvent) ||
              ("track_social" === b && c.isGtmEvent
                ? ((r.fieldsToSend.hitType = "social"),
                  v("socialNetwork", r.socialNetwork, !0),
                  v("socialAction", r.socialAction, !0),
                  v("socialTarget", r.socialTarget, !0))
                : ((c.isGtmEvent || Om[b]) && q(A),
                  c.isGtmEvent && e(),
                  (r.fieldsToSend.hitType = "event"),
                  v("eventCategory", r.eventCategory, !0),
                  v("eventAction", r.eventAction || b, !0),
                  void 0 !== r.eventLabel && v("eventLabel", r.eventLabel, !0),
                  void 0 !== r.value && v("eventValue", Da(r.value))),
              p("send", r.fieldsToSend));
        var D = !1;
        var E = Pm;
        D && (E = c.getContainerTypeLoaded("UA"));
        if (!E && !c.isGtmEvent) {
          Pm = !0;
          D && c.setContainerTypeLoaded("UA", !0);
          si();
          var F = function () {
              D && c.setContainerTypeLoaded("UA", !1);
              c.onFailure();
            },
            P = function () {
              m().loaded || F();
            };
          ik() ? H(P) : lb(g, P, F);
        }
      } else H(c.onFailure);
    },
    Rm = function (a, b, c, d) {
      Nd(
        function () {
          Qm(a, b, d);
        },
        [J.M, J.C]
      );
    },
    Tm = function (a, b) {
      function c(f) {
        function g(p, q) {
          for (var t = 0; t < q.length; t++) {
            var u = q[t];
            if (f[u]) {
              m[p] = f[u];
              break;
            }
          }
        }
        function l() {
          if (f.category) m.category = f.category;
          else {
            for (var p = "", q = 0; q < Sm.length; q++)
              void 0 !== f[Sm[q]] && (p && (p += "/"), (p += f[Sm[q]]));
            p && (m.category = p);
          }
        }
        var m = Db(f),
          n = !1;
        if (n || b)
          g("id", ["id", "item_id", "promotion_id"]),
            g("name", ["name", "item_name", "promotion_name"]),
            g("brand", ["brand", "item_brand"]),
            g("variant", ["variant", "item_variant"]),
            g("list", ["list_name", "item_list_name"]),
            g("position", ["list_position", "creative_slot", "index"]),
            l();
        g("listPosition", ["list_position"]);
        g("creative", ["creative_name"]);
        g("list", ["list_name"]);
        g("position", ["list_position", "creative_slot"]);
        return m;
      }
      b = void 0 === b ? !1 : b;
      for (var d = [], e = 0; a && e < a.length; e++)
        a[e] && Cb(a[e]) && d.push(c(a[e]));
      return d.length ? d : void 0;
    },
    Um = function (a) {
      return Jd(a);
    },
    Vm = !1;
  var Pm,
    Nm = {},
    Dm = {},
    Wm = {},
    ym = Object.freeze(
      ((Wm.client_storage = "storage"),
      (Wm.sample_rate = 1),
      (Wm.site_speed_sample_rate = 1),
      (Wm.store_gac = 1),
      (Wm.use_amp_client_id = 1),
      (Wm[J.Xa] = 1),
      (Wm[J.oa] = "storeGac"),
      (Wm[J.ja] = 1),
      (Wm[J.qa] = 1),
      (Wm[J.Ha] = 1),
      (Wm[J.Fb] = 1),
      (Wm[J.Ya] = 1),
      (Wm[J.Gb] = 1),
      Wm)
    ),
    Xm = {},
    Ym = Object.freeze(
      ((Xm._cs = 1),
      (Xm._useUp = 1),
      (Xm.allowAnchor = 1),
      (Xm.allowLinker = 1),
      (Xm.alwaysSendReferrer = 1),
      (Xm.clientId = 1),
      (Xm.cookieDomain = 1),
      (Xm.cookieExpires = 1),
      (Xm.cookieFlags = 1),
      (Xm.cookieName = 1),
      (Xm.cookiePath = 1),
      (Xm.cookieUpdate = 1),
      (Xm.legacyCookieDomain = 1),
      (Xm.legacyHistoryImport = 1),
      (Xm.name = 1),
      (Xm.sampleRate = 1),
      (Xm.siteSpeedSampleRate = 1),
      (Xm.storage = 1),
      (Xm.storeGac = 1),
      (Xm.useAmpClientId = 1),
      (Xm._cd2l = 1),
      Xm)
    ),
    Zm = Object.freeze({ anonymize_ip: 1 }),
    $m = {},
    zm = Object.freeze(
      (($m.campaign = {
        content: "campaignContent",
        id: "campaignId",
        medium: "campaignMedium",
        name: "campaignName",
        source: "campaignSource",
        term: "campaignKeyword",
      }),
      ($m.app_id = 1),
      ($m.app_installer_id = 1),
      ($m.app_name = 1),
      ($m.app_version = 1),
      ($m.description = "exDescription"),
      ($m.fatal = "exFatal"),
      ($m.language = 1),
      ($m.page_hostname = "hostname"),
      ($m.transport_type = "transport"),
      ($m[J.fa] = "currencyCode"),
      ($m[J.Df] = 1),
      ($m[J.Ra] = "location"),
      ($m[J.ee] = "page"),
      ($m[J.Ia] = "referrer"),
      ($m[J.fc] = "title"),
      ($m[J.Lf] = 1),
      ($m[J.Ca] = 1),
      $m)
    ),
    an = {},
    bn = Object.freeze(
      ((an.content_id = 1),
      (an.event_action = 1),
      (an.event_category = 1),
      (an.event_label = 1),
      (an.link_attribution = 1),
      (an.name = 1),
      (an[J.ka] = 1),
      (an[J.Cf] = 1),
      (an[J.la] = 1),
      (an[J.ia] = 1),
      an)
    ),
    cn = Object.freeze({
      displayfeatures: 1,
      enableLinkId: 1,
      enableRecaptcha: 1,
      eventAction: 1,
      eventCategory: 1,
      eventLabel: 1,
      gaFunctionName: 1,
      gtmEcommerceData: 1,
      gtmTrackerName: 1,
      linker: 1,
      remarketingLists: 1,
      socialAction: 1,
      socialNetwork: 1,
      socialTarget: 1,
      timingVar: 1,
      value: 1,
    }),
    Sm = Object.freeze([
      "item_category",
      "item_category2",
      "item_category3",
      "item_category4",
      "item_category5",
    ]),
    dn = {},
    Lm = Object.freeze(
      ((dn.levels = 1), (dn[J.qa] = "duration"), (dn[J.Fb] = 1), dn)
    ),
    en = {},
    fn = Object.freeze(
      ((en.anonymize_ip = 1),
      (en.fatal = 1),
      (en.send_page_view = 1),
      (en.store_gac = 1),
      (en.use_amp_client_id = 1),
      (en[J.oa] = 1),
      (en[J.Df] = 1),
      en)
    ),
    Mm = function (a, b, c, d) {
      if (void 0 !== c)
        if (
          (fn[b] && (c = Ea(c)),
          "anonymize_ip" !== b || c || (c = void 0),
          1 === a)
        )
          d[Am(b)] = c;
        else if (k(a)) d[a] = c;
        else
          for (var e in a)
            a.hasOwnProperty(e) && void 0 !== c[e] && (d[a[e]] = c[e]);
    },
    Am = function (a) {
      return a && k(a)
        ? a.replace(/(_[a-z])/g, function (b) {
            return b[1].toUpperCase();
          })
        : a;
    },
    gn = {},
    Om = Object.freeze(
      ((gn.checkout_progress = 1),
      (gn.select_content = 1),
      (gn.set_checkout_option = 1),
      (gn[J.Bb] = 1),
      (gn[J.Cb] = 1),
      (gn[J.kb] = 1),
      (gn[J.lb] = 1),
      (gn[J.Db] = 1),
      (gn[J.ya] = 1),
      (gn[J.Eb] = 1),
      (gn[J.za] = 1),
      gn)
    ),
    hn = {},
    jn = Object.freeze(
      ((hn.checkout_progress = 1),
      (hn.set_checkout_option = 1),
      (hn[J.nf] = 1),
      (hn[J.Bb] = 1),
      (hn[J.Cb] = 1),
      (hn[J.kb] = 1),
      (hn[J.ya] = 1),
      (hn[J.Eb] = 1),
      (hn[J.pf] = 1),
      hn)
    ),
    kn = {},
    ln = Object.freeze(
      ((kn.generate_lead = 1),
      (kn.login = 1),
      (kn.search = 1),
      (kn.select_content = 1),
      (kn.share = 1),
      (kn.sign_up = 1),
      (kn.view_search_results = 1),
      (kn[J.lb] = 1),
      (kn[J.Db] = 1),
      (kn[J.za] = 1),
      kn)
    ),
    mn = function (a) {
      var b = "general";
      jn[a]
        ? (b = "ecommerce")
        : ln[a]
        ? (b = "engagement")
        : "exception" === a && (b = "error");
      return b;
    },
    nn = {},
    on = Object.freeze(
      ((nn.view_search_results = 1),
      (nn[J.lb] = 1),
      (nn[J.Db] = 1),
      (nn[J.za] = 1),
      nn)
    ),
    Im = function (a, b, c) {
      a.hasOwnProperty(b) || (a[b] = c);
    },
    pn = function (a) {
      if (ta(a)) {
        for (var b = [], c = 0; c < a.length; c++) {
          var d = a[c];
          if (void 0 != d) {
            var e = d.id,
              f = d.variant;
            void 0 != e && void 0 != f && b.push(String(e) + "." + String(f));
          }
        }
        return 0 < b.length ? b.join("!") : void 0;
      }
    },
    Em = function (a, b, c) {
      var d = function (P) {
          return c.getWithConfig(P);
        },
        e = {},
        f = {},
        g = {},
        l = {},
        m = pn(d(J.Hh));
      !c.isGtmEvent && m && Im(f, "exp", m);
      g["&gtm"] = mk(!0);
      wd() && (l._cs = Um);
      var n = d(J.ac);
      if (!c.isGtmEvent && Cb(n))
        for (var p in n)
          if (
            n.hasOwnProperty(p) &&
            /^(dimension|metric)\d+$/.test(p) &&
            void 0 != n[p]
          ) {
            var q = d(String(n[p]));
            void 0 !== q && Im(f, p, q);
          }
      for (var t = xe(c), u = 0; u < t.length; ++u) {
        var r = t[u];
        if (c.isGtmEvent) {
          var v = d(r);
          cn.hasOwnProperty(r)
            ? (e[r] = v)
            : Ym.hasOwnProperty(r)
            ? (l[r] = v)
            : (g[r] = v);
        } else {
          var z = void 0;
          z = r !== J.W ? d(r) : ye(c, r);
          if (bn.hasOwnProperty(r)) Mm(bn[r], r, z, e);
          else if (Zm.hasOwnProperty(r)) Mm(Zm[r], r, z, g);
          else if (zm.hasOwnProperty(r)) Mm(zm[r], r, z, f);
          else if (ym.hasOwnProperty(r)) Mm(ym[r], r, z, l);
          else if (/^(dimension|metric|content_group)\d+$/.test(r))
            Mm(1, r, z, f);
          else if (r === J.W) {
            if (!Vm) {
              var A = Qa(z);
              A && (f["&did"] = A);
            }
            var y = void 0,
              x = void 0;
            b === J.Aa
              ? (y = Qa(ye(c, r), "."))
              : ((y = Qa(ye(c, r, 1), ".")), (x = Qa(ye(c, r, 2), ".")));
            y && (f["&gdid"] = y);
            x && (f["&edid"] = x);
          } else
            r === J.Ba && 0 > t.indexOf(J.Fb) && (l.cookieName = z + "_ga");
        }
      }
      (!1 !== d(J.xh) && !1 !== d(J.Zb) && wm()) || (g.allowAdFeatures = !1);
      (!1 !== d(J.U) && xm()) || (g.allowAdPersonalizationSignals = !1);
      !c.isGtmEvent && d(J.eb) && (l._useUp = !0);
      if (c.isGtmEvent) {
        l.name = l.name || e.gtmTrackerName;
        var w = g.hitCallback;
        g.hitCallback = function () {
          ra(w) && w();
          c.onSuccess();
        };
      } else {
        Im(l, "cookieDomain", "auto");
        Im(g, "forceSSL", !0);
        Im(e, "eventCategory", mn(b));
        on[b] && Im(f, "nonInteraction", !0);
        "login" === b || "sign_up" === b || "share" === b
          ? Im(e, "eventLabel", d(J.Cf))
          : "search" === b || "view_search_results" === b
          ? Im(e, "eventLabel", d(J.Oh))
          : "select_content" === b && Im(e, "eventLabel", d(J.Bh));
        var C = e[J.ka] || {},
          D = C[J.Ib];
        D || (0 != D && C[J.N])
          ? (l.allowLinker = !0)
          : !1 === D && Im(l, "useAmpClientId", !1);
        f.hitCallback = c.onSuccess;
        l.name = a;
      }
      wd() &&
        ((g["&gcs"] = Kd()),
        Jd(J.M) || (l.storage = "none"),
        Jd(J.C) || ((g.allowAdFeatures = !1), (l.storeGac = !1)));
      var E = d(J.ra) || d(J.ob),
        F = d(J.Sc);
      E && (c.isGtmEvent || (l[J.ob] = E), (l._cd2l = !0));
      F && !c.isGtmEvent && (l[J.Sc] = F);
      e.fieldsToSend = f;
      e.fieldsToSet = g;
      e.createOnlyFields = l;
      return e;
    },
    Jm = function (a) {
      var b = a.gtmEcommerceData;
      if (!b) return null;
      var c = {};
      b.currencyCode && (c.Ce = b.currencyCode);
      if (b.impressions) {
        c.action = "impressions";
        var d = b.impressions;
        c.Bg = "impressions" === b.translateIfKeyEquals ? Tm(d, !0) : d;
      }
      if (b.promoView) {
        c.action = "promo_view";
        var e = b.promoView.promotions;
        c.Dc = "promoView" === b.translateIfKeyEquals ? Tm(e, !0) : e;
      }
      if (b.promoClick) {
        c.action = "promo_click";
        var f = b.promoClick.promotions;
        c.Dc = "promoClick" === b.translateIfKeyEquals ? Tm(f, !0) : f;
        c.fb = b.promoClick.actionField;
        return c;
      }
      for (var g in b)
        if (
          b.hasOwnProperty(g) &&
          "translateIfKeyEquals" !== g &&
          "impressions" !== g &&
          "promoView" !== g &&
          "promoClick" !== g &&
          "currencyCode" !== g
        ) {
          c.action = g;
          var l = b[g].products;
          c.wb = "products" === b.translateIfKeyEquals ? Tm(l, !0) : l;
          c.fb = b[g].actionField;
          break;
        }
      return Object.keys(c).length ? c : null;
    },
    Km = function (a, b) {
      function c(u) {
        return {
          id: d(J.cb),
          affiliation: d(J.Eh),
          revenue: d(J.ia),
          tax: d(J.zf),
          shipping: d(J.Vd),
          coupon: d(J.Fh),
          list: d(J.Ud) || u,
        };
      }
      for (
        var d = function (u) {
            return b.getWithConfig(u);
          },
          e = d(J.aa),
          f,
          g = 0;
        e && g < e.length && !(f = e[g][J.Ud]);
        g++
      );
      var l = d(J.ac);
      if (Cb(l))
        for (var m = 0; e && m < e.length; ++m) {
          var n = e[m],
            p;
          for (p in l)
            l.hasOwnProperty(p) &&
              /^(dimension|metric)\d+$/.test(p) &&
              void 0 != l[p] &&
              Im(n, p, n[l[p]]);
        }
      var q = null,
        t = d(J.Gh);
      a === J.ya || a === J.Eb
        ? (q = { action: a, fb: c(), wb: Tm(e) })
        : a === J.Bb
        ? (q = { action: "add", wb: Tm(e) })
        : a === J.Cb
        ? (q = { action: "remove", wb: Tm(e) })
        : a === J.za
        ? (q = { action: "detail", fb: c(f), wb: Tm(e) })
        : a === J.lb
        ? (q = { action: "impressions", Bg: Tm(e) })
        : "view_promotion" === a
        ? (q = { action: "promo_view", Dc: Tm(t) })
        : "select_content" === a && t && 0 < t.length
        ? (q = { action: "promo_click", Dc: Tm(t) })
        : "select_content" === a
        ? (q = { action: "click", fb: { list: d(J.Ud) || f }, wb: Tm(e) })
        : a === J.kb || "checkout_progress" === a
        ? (q = {
            action: "checkout",
            wb: Tm(e),
            fb: { step: a === J.kb ? 1 : d(J.yf), option: d(J.xf) },
          })
        : "set_checkout_option" === a &&
          (q = {
            action: "checkout_option",
            fb: { step: d(J.yf), option: d(J.xf) },
          });
      q && (q.Ce = d(J.fa));
      return q;
    },
    qn = {},
    Fm = function (a, b) {
      var c = qn[a];
      qn[a] = Db(b);
      if (!c) return !1;
      for (var d in b) if (b.hasOwnProperty(d) && b[d] !== c[d]) return !0;
      for (var e in c) if (c.hasOwnProperty(e) && c[e] !== b[e]) return !0;
      return !1;
    };
  function rn() {
    return (Q.gcq = Q.gcq || new sn());
  }
  var tn = function (a, b, c) {
      rn().register(a, b, c);
    },
    un = function (a, b, c, d) {
      rn().push("event", [b, a], c, d);
    },
    vn = function (a, b) {
      rn().push("config", [a], b);
    },
    wn = function (a, b, c, d) {
      rn().push("get", [a, b], c, d);
    },
    xn = {},
    yn = function () {
      this.status = 1;
      this.containerConfig = {};
      this.targetConfig = {};
      this.remoteConfig = {};
      this.o = {};
      this.s = null;
      this.m = !1;
    },
    zn = function (a, b, c, d, e) {
      this.type = a;
      this.s = b;
      this.R = c || "";
      this.m = d;
      this.o = e;
    },
    sn = function () {
      this.o = {};
      this.s = {};
      this.m = [];
      this.D = { AW: !1, UA: !1 };
    },
    An = function (a, b) {
      var c = bl(b);
      return (a.o[c.containerId] = a.o[c.containerId] || new yn());
    },
    Bn = function (a, b, c) {
      if (b) {
        var d = bl(b);
        if (d && 1 === An(a, b).status) {
          An(a, b).status = 2;
          var e = {};
          xj &&
            (e.timeoutId = B.setTimeout(function () {
              dd(38);
              dj();
            }, 3e3));
          a.push("require", [e], d.containerId);
          xn[d.containerId] = Ia();
          if (ik()) {
          } else {
            var g =
              "/gtag/js?id=" +
              encodeURIComponent(d.containerId) +
              "&l=" +
              M.V +
              "&cx=c";
            hk() && (g += "&sign=" + M.fd);
            var l =
                ("http:" != B.location.protocol ? "https:" : "http:") +
                ("//www.googletagmanager.com" + g),
              m = fk(c, g) || l;
            lb(m);
          }
        }
      }
    },
    Cn = function (a, b, c, d) {
      if (d.R) {
        var e = An(a, d.R),
          f = e.s;
        if (f) {
          var g = Db(c),
            l = Db(e.targetConfig[d.R]),
            m = Db(e.containerConfig),
            n = Db(e.remoteConfig),
            p = Db(a.s),
            q = Te("gtm.uniqueEventId"),
            t = bl(d.R).prefix,
            u = Ka(function () {
              var v = g[J.Hb];
              v && H(v);
            }),
            r = ve(
              ue(
                we(
                  te(re(se(qe(ne(me(g), l), m), n), p), function () {
                    Kj(q, t, "2");
                    u();
                  }),
                  function () {
                    Kj(q, t, "3");
                    u();
                  }
                ),
                function (v, z) {
                  a.D[v] = z;
                }
              ),
              function (v) {
                return a.D[v];
              }
            );
          try {
            Kj(q, t, "1");
            f(d.R, b, d.s, r);
          } catch (v) {
            Kj(q, t, "4");
          }
        }
      }
    };
  sn.prototype.register = function (a, b, c) {
    var d = An(this, a);
    if (3 !== d.status) {
      d.s = b;
      d.status = 3;
      c && (Db(d.remoteConfig, c), (d.remoteConfig = c));
      var e = bl(a),
        f = xn[e.containerId];
      if (void 0 !== f) {
        var g = Q[e.containerId].bootstrap,
          l = e.prefix.toUpperCase();
        Q[e.containerId]._spx && (l = l.toLowerCase());
        var m = Te("gtm.uniqueEventId"),
          n = l,
          p = Ia() - g;
        if (xj && !ij[m]) {
          m !== ej && ($i(), (ej = m));
          var q = n + "." + Math.floor(g - f) + "." + Math.floor(p);
          mj = mj ? mj + "," + q : "&cl=" + q;
        }
        delete xn[e.containerId];
      }
      this.flush();
    }
  };
  sn.prototype.push = function (a, b, c, d) {
    var e = Math.floor(Ia() / 1e3);
    Bn(this, c, b[0][J.ra] || this.s[J.ra]);
    c && An(this, c).m && (d = !1);
    this.m.push(new zn(a, e, c, b, d));
    d || this.flush();
  };
  sn.prototype.insert = function (a, b, c) {
    var d = Math.floor(Ia() / 1e3);
    0 < this.m.length
      ? this.m.splice(1, 0, new zn(a, d, c, b, !1))
      : this.m.push(new zn(a, d, c, b, !1));
  };
  sn.prototype.flush = function (a) {
    for (var b = this, c = [], d = !1, e = {}; this.m.length; ) {
      var f = this.m[0];
      if (f.o)
        !f.R || An(this, f.R).m ? ((f.o = !1), this.m.push(f)) : c.push(f),
          this.m.shift();
      else {
        switch (f.type) {
          case "require":
            if (3 !== An(this, f.R).status && !a) {
              this.m.push.apply(this.m, c);
              return;
            }
            xj && B.clearTimeout(f.m[0].timeoutId);
            break;
          case "set":
            Ba(f.m[0], function (t, u) {
              Db(Oa(t, u), b.s);
            });
            break;
          case "config":
            e.Na = {};
            Ba(
              f.m[0],
              (function (t) {
                return function (u, r) {
                  Db(Oa(u, r), t.Na);
                };
              })(e)
            );
            var g = !!e.Na[J.Xc];
            delete e.Na[J.Xc];
            var l = An(this, f.R),
              m = bl(f.R),
              n = m.containerId === m.id;
            g || (n ? (l.containerConfig = {}) : (l.targetConfig[f.R] = {}));
            (l.m && g) || Cn(this, J.Aa, e.Na, f);
            l.m = !0;
            delete e.Na[J.Kb];
            n ? Db(e.Na, l.containerConfig) : Db(e.Na, l.targetConfig[f.R]);
            d = !0;
            break;
          case "event":
            e.Ic = {};
            Ba(
              f.m[0],
              (function (t) {
                return function (u, r) {
                  Db(Oa(u, r), t.Ic);
                };
              })(e)
            );
            Cn(this, f.m[1], e.Ic, f);
            break;
          case "get":
            var p = {},
              q = ((p[J.Qa] = f.m[0]), (p[J.Za] = f.m[1]), p);
            Cn(this, J.Oa, q, f);
        }
        this.m.shift();
        Dn(this, f);
      }
      e = { Na: e.Na, Ic: e.Ic };
    }
    this.m.push.apply(this.m, c);
    d && this.flush();
  };
  var Dn = function (a, b) {
    if ("require" !== b.type)
      if (b.R)
        for (
          var c = a.getCommandListeners(b.R)[b.type] || [], d = 0;
          d < c.length;
          d++
        )
          c[d]();
      else
        for (var e in a.o)
          if (a.o.hasOwnProperty(e)) {
            var f = a.o[e];
            if (f && f.o)
              for (var g = f.o[b.type] || [], l = 0; l < g.length; l++) g[l]();
          }
  };
  sn.prototype.getRemoteConfig = function (a) {
    return An(this, a).remoteConfig;
  };
  sn.prototype.getCommandListeners = function (a) {
    return An(this, a).o;
  };
  var En = {},
    Fn = function (a, b) {
      b = b.toString().split(",");
      for (var c = 0; c < b.length; c++) {
        var d = En[b[c]] || [];
        En[b[c]] = d;
        0 > d.indexOf(a) && d.push(a);
      }
    },
    Gn = function (a) {
      Ba(En, function (b, c) {
        var d = c.indexOf(a);
        0 <= d && c.splice(d, 1);
      });
    };
  var Hn = "HA GF G UA AW DC".split(" "),
    In = !1,
    Jn = !1,
    Kn = 0;
  function Ln(a, b) {
    var c = { event: a };
    b &&
      ((c.eventModel = Db(b)),
      b[J.Hb] && (c.eventCallback = b[J.Hb]),
      b[J.Rc] && (c.eventTimeout = b[J.Rc]));
    return c;
  }
  function Mn(a) {
    a.hasOwnProperty("gtm.uniqueEventId") ||
      Object.defineProperty(a, "gtm.uniqueEventId", { value: Ne() });
    return a["gtm.uniqueEventId"];
  }
  function Nn() {
    if (!In && !Q.gtagRegistered) {
      In = Q.gtagRegistered = !0;
      Q.addTargetToGroup = function (c) {
        Fn(c, "default");
      };
      var a = Q.pendingDefaultTargets;
      delete Q.pendingDefaultTargets;
      if (ta(a)) for (var b = 0; b < a.length; ++b) Fn(a[b], "default");
    }
    return In;
  }
  var On = {
      config: function (a) {
        var b,
          c = Mn(a);
        if (2 > a.length || !k(a[1])) return;
        var d = {};
        if (2 < a.length) {
          if ((void 0 != a[2] && !Cb(a[2])) || 3 < a.length) return;
          d = a[2];
        }
        var e = bl(a[1]);
        if (!e) return;
        Gn(e.id);
        Fn(e.id, d[J.$d] || "default");
        delete d[J.$d];
        Jn || dd(43);
        if (Nn() && -1 !== Hn.indexOf(e.prefix)) {
          "G" === e.prefix && (d[J.Kb] = !0);
          delete d[J.Hb];
          e.id === e.containerId && (Q.configCount = ++Kn);
          vn(d, e.id);
          return;
        }
        We("gtag.targets." + e.id, void 0);
        We("gtag.targets." + e.id, Db(d));
        var f = {};
        f[J.pb] = e.id;
        b = Ln(J.Aa, f);
        b["gtm.uniqueEventId"] = c;
        return b;
      },
      consent: function (a) {
        if (3 === a.length) {
          dd(39);
          var b = Ne(),
            c = a[1];
          "default" === c ? Gd(a[2]) : "update" === c && Id(a[2], b);
        }
      },
      event: function (a) {
        var b = a[1];
        if (!(2 > a.length) && k(b)) {
          var c;
          if (2 < a.length) {
            if ((!Cb(a[2]) && void 0 != a[2]) || 3 < a.length) return;
            c = a[2];
          }
          var d = Ln(b, c),
            e = Mn(a);
          d["gtm.uniqueEventId"] = e;
          if ("optimize.callback" === b)
            return (d.eventModel = d.eventModel || {}), d;
          var f;
          var g = c && c[J.pb];
          void 0 === g && ((g = Te(J.pb, 2)), void 0 === g && (g = "default"));
          if (k(g) || ta(g)) {
            for (
              var l = g.toString().replace(/\s+/g, "").split(","),
                m = [],
                n = 0;
              n < l.length;
              n++
            )
              if (0 <= l[n].indexOf("-")) m.push(l[n]);
              else {
                var p = En[l[n]];
                p && p.length && (m = m.concat(p));
              }
            f = dl(m);
          } else f = void 0;
          var q = f;
          if (!q) return;
          for (var t = Nn(), u = [], r = 0; t && r < q.length; r++) {
            var v = q[r];
            if (-1 !== Hn.indexOf(v.prefix)) {
              var z = Db(c);
              "G" === v.prefix && (z[J.Kb] = !0);
              delete z[J.Hb];
              un(b, z, v.id);
            }
            u.push(v.id);
          }
          d.eventModel = d.eventModel || {};
          0 < q.length
            ? (d.eventModel[J.pb] = u.join())
            : delete d.eventModel[J.pb];
          Jn || dd(43);
          return d;
        }
      },
      get: function (a) {
        dd(53);
        if (4 !== a.length || !k(a[1]) || !k(a[2]) || !ra(a[3])) return;
        var b = bl(a[1]),
          c = String(a[2]),
          d = a[3];
        if (!b) return;
        Jn || dd(43);
        if (!Nn() || -1 === Hn.indexOf(b.prefix)) return;
        Ne();
        var e = {};
        Cd(Db(((e[J.Qa] = c), (e[J.Za] = d), e)));
        wn(
          c,
          function (f) {
            H(function () {
              return d(f);
            });
          },
          b.id
        );
      },
      js: function (a) {
        if (2 == a.length && a[1].getTime) {
          Jn = !0;
          Nn();
          var b = {};
          return (
            (b.event = "gtm.js"),
            (b["gtm.start"] = a[1].getTime()),
            (b["gtm.uniqueEventId"] = Mn(a)),
            b
          );
        }
      },
      policy: function () {},
      set: function (a) {
        var b;
        2 == a.length && Cb(a[1])
          ? (b = Db(a[1]))
          : 3 == a.length &&
            k(a[1]) &&
            ((b = {}),
            Cb(a[2]) || ta(a[2]) ? (b[a[1]] = Db(a[2])) : (b[a[1]] = a[2]));
        if (b) {
          if ((Ne(), Db(b), Nn())) {
            var c = Db(b);
            rn().push("set", [c]);
          }
          b._clear = !0;
          return b;
        }
      },
    },
    Pn = { policy: !0 };
  var Qn = function () {
    this.m = [];
    this.o = [];
  };
  Qn.prototype.push = function (a, b, c) {
    var d = {
      debugContext: c,
      message: a,
      notBeforeEventId: b,
      priorityId: this.m.length + 1,
    };
    this.m.push(d);
    for (var e = 0; e < this.o.length; e++)
      try {
        this.o[e](d);
      } catch (f) {}
  };
  Qn.prototype.Eg = function (a) {
    this.o.push(a);
  };
  Qn.prototype.get = function () {
    for (var a = {}, b = 0; b < this.m.length; b++) {
      var c = this.m[b],
        d = a[c.notBeforeEventId];
      d || ((d = []), (a[c.notBeforeEventId] = d));
      d.push(c);
    }
    return a;
  };
  Qn.prototype.get = Qn.prototype.get;
  Qn.prototype.listen = Qn.prototype.Eg;
  Qn.prototype.push = Qn.prototype.push;
  function Rn(a, b) {
    return (
      a.notBeforeEventId - b.notBeforeEventId || a.priorityId - b.priorityId
    );
  }
  var Sn = function (a) {
      var b = B[M.V].hide;
      if (b && void 0 !== b[a] && b.end) {
        b[a] = !1;
        var c = !0,
          d;
        for (d in b)
          if (b.hasOwnProperty(d) && !0 === b[d]) {
            c = !1;
            break;
          }
        c && (b.end(), (b.end = null));
      }
    },
    Tn = function (a) {
      var b = B[M.V],
        c = b && b.hide;
      c && c.end && (c[a] = !0);
    };
  var Un = !1,
    Vn = [];
  function Wn() {
    if (!Un) {
      Un = !0;
      for (var a = 0; a < Vn.length; a++) H(Vn[a]);
    }
  }
  var Xn = function (a) {
    Un ? H(a) : Vn.push(a);
  };
  var yo = function (a) {
    if (xo(a)) return a;
    this.m = a;
  };
  yo.prototype.Li = function () {
    return this.m;
  };
  var xo = function (a) {
    return !a || "object" !== Ab(a) || Cb(a)
      ? !1
      : "getUntrustedMessageValue" in a;
  };
  yo.prototype.getUntrustedMessageValue = yo.prototype.Li;
  var zo = 0,
    Ao,
    Bo = {},
    Co = [],
    Do = [],
    Eo = !1,
    Fo = !1,
    Go = function (a) {
      return B[M.V].push(a);
    },
    Ho = function (a, b) {
      var c = Q[M.V],
        d = c ? c.subscribers : 1,
        e = 0,
        f = !1,
        g = void 0;
      b &&
        (g = B.setTimeout(function () {
          f || ((f = !0), a());
          g = void 0;
        }, b));
      return function () {
        ++e === d &&
          (g && (B.clearTimeout(g), (g = void 0)), f || (a(), (f = !0)));
      };
    };
  function Io(a) {
    var b = a._clear;
    Ba(a, function (d, e) {
      "_clear" !== d && (b && We(d, void 0), We(d, e));
    });
    Ie || (Ie = a["gtm.start"]);
    var c = a["gtm.uniqueEventId"];
    if (!a.event) return !1;
    c || ((c = Ne()), (a["gtm.uniqueEventId"] = c), We("gtm.uniqueEventId", c));
    return dk(a);
  }
  function Jo(a) {
    if (null == a || "object" !== typeof a) return !1;
    if (a.event) return !0;
    if (Ca(a)) {
      var b = a[0];
      if ("config" === b || "event" === b || "js" === b) return !0;
    }
    return !1;
  }
  function Ko() {
    for (var a = !1; !Fo && (0 < Co.length || 0 < Do.length); ) {
      if (!Eo && Jo(Co[0])) {
        var b = {},
          c = ((b.event = "gtm.init_consent"), b),
          d = {},
          e = ((d.event = "gtm.init"), d),
          f = Co[0]["gtm.uniqueEventId"];
        f &&
          ((c["gtm.uniqueEventId"] = f - 2), (e["gtm.uniqueEventId"] = f - 1));
        Co.unshift(c, e);
        Eo = !0;
      }
      Fo = !0;
      delete Qe.eventModel;
      Se();
      var g = null,
        l = void 0;
      null == g && (g = Co.shift());
      if (null != g) {
        var n = xo(g);
        if (n) {
          var p = g;
          g = xo(p) ? p.getUntrustedMessageValue() : void 0;
          for (
            var q = [
                "gtm.allowlist",
                "gtm.blocklist",
                "gtm.whitelist",
                "gtm.blacklist",
                "tagTypeBlacklist",
              ],
              t = 0;
            t < q.length;
            t++
          ) {
            var u = q[t],
              r = Te(u, 1);
            if (ta(r) || Cb(r)) r = Db(r);
            Re[u] = r;
          }
        }
        try {
          if (ra(g))
            try {
              g.call(Ue);
            } catch (F) {}
          else if (ta(g)) {
            var v = g;
            if (k(v[0])) {
              var z = v[0].split("."),
                A = z.pop(),
                y = v.slice(1),
                x = Te(z.join("."), 2);
              if (null != x)
                try {
                  x[A].apply(x, y);
                } catch (F) {}
            }
          } else {
            if (Ca(g)) {
              a: {
                var w = g,
                  C = l;
                if (w.length && k(w[0])) {
                  var D = On[w[0]];
                  if (D && (!n || !Pn[w[0]])) {
                    g = D(w, C);
                    break a;
                  }
                }
                g = void 0;
              }
              if (!g) {
                Fo = !1;
                continue;
              }
            }
            a = Io(g) || a;
          }
        } finally {
          n && Se(!0);
        }
      }
      Fo = !1;
    }
    return !a;
  }
  function Mo() {
    var b = Ko();
    try {
      Sn(M.I);
    } catch (c) {}
    return b;
  }
  var Po = function () {
    var a = eb(M.V, []),
      b = eb("google_tag_manager", {});
    b = b[M.V] = b[M.V] || {};
    ki(function () {
      b.gtmDom || ((b.gtmDom = !0), a.push({ event: "gtm.dom" }));
    });
    Xn(function () {
      b.gtmLoad || ((b.gtmLoad = !0), a.push({ event: "gtm.load" }));
    });
    b.subscribers = (b.subscribers || 0) + 1;
    var c = a.push;
    a.push = function () {
      var e;
      if (0 < Q.SANDBOXED_JS_SEMAPHORE) {
        e = [];
        for (var f = 0; f < arguments.length; f++) e[f] = new yo(arguments[f]);
      } else e = [].slice.call(arguments, 0);
      Co.push.apply(Co, e);
      var g = c.apply(a, e);
      if (300 < this.length) for (dd(4); 300 < this.length; ) this.shift();
      var l = "boolean" !== typeof g || g;
      return Ko() && l;
    };
    var d = a.slice(0);
    Co.push.apply(Co, d);
    if (No()) {
      H(Mo);
    }
  };
  var No = function () {
    var a = !0;
    return a;
  };
  function Qo(a) {
    if (null == a || 0 === a.length) return !1;
    var b = Number(a),
      c = Ia();
    return b < c + 3e5 && b > c - 9e5;
  }
  var Ro = function (a) {
    Q.addTargetToGroup
      ? Q.addTargetToGroup(a)
      : ((Q.pendingDefaultTargets = Q.pendingDefaultTargets || []),
        Q.pendingDefaultTargets.push(a));
  };
  var So = { Kg: "UA-139844109-1" };
  var To = {};
  To.$c = new String("undefined");
  var tp = B.clearTimeout,
    up = B.setTimeout,
    T = function (a, b, c, d) {
      if (ik()) {
        b && H(b);
      } else return lb(a, b, c, d);
    },
    vp = function () {
      return new Date();
    },
    wp = function () {
      return B.location.href;
    },
    xp = function (a) {
      return of(qf(a), "fragment");
    },
    yp = function (a) {
      return pf(qf(a));
    },
    zp = function (a, b) {
      return Te(a, b || 2);
    },
    Ap = function (a, b, c) {
      var d;
      b
        ? ((a.eventCallback = b), c && (a.eventTimeout = c), (d = Go(a)))
        : (d = Go(a));
      return d;
    },
    Bp = function (a, b) {
      B[a] = b;
    },
    W = function (a, b, c) {
      b && (void 0 === B[a] || (c && !B[a])) && (B[a] = b);
      return B[a];
    },
    Cp = function (a, b, c) {
      return Uf(a, b, void 0 === c ? !0 : !!c);
    },
    Dp = function (a, b, c) {
      return 0 === fg(a, b, c);
    },
    Ep = function (a, b) {
      if (ik()) {
        b && H(b);
      } else nb(a, b);
    },
    Fp = function (a) {
      return !!$o(a, "init", !1);
    },
    Gp = function (a) {
      Yo(a, "init", !0);
    },
    Hp = function (a) {
      var b = Fe,
        c = "?id=" + encodeURIComponent(a) + "&l=" + M.V;
      hk() &&
        ((c += "&sign=" + M.fd),
        db && (b = db.replace(/^(?:https?:\/\/)?/i, "").split(/[?#]/)[0]));
      var d = fl("https://", "http://", b + c);
      T(d);
    },
    Ip = function (a, b, c) {
      xj && (Fb(a) || Lj(c, b, a));
    };
  var fq = [
    "matches",
    "webkitMatchesSelector",
    "mozMatchesSelector",
    "msMatchesSelector",
    "oMatchesSelector",
  ];
  function gq(a, b) {
    a = String(a);
    b = String(b);
    var c = a.length - b.length;
    return 0 <= c && a.indexOf(b, c) === c;
  }
  var hq = new za();
  function iq(a, b, c) {
    var d = c ? "i" : void 0;
    try {
      var e = String(b) + d,
        f = hq.get(e);
      f || ((f = new RegExp(b, d)), hq.set(e, f));
      return f.test(a);
    } catch (g) {
      return !1;
    }
  }
  function jq(a, b) {
    function c(g) {
      var l = qf(g),
        m = of(l, "protocol"),
        n = of(l, "host", !0),
        p = of(l, "port"),
        q = of(l, "path").toLowerCase().replace(/\/$/, "");
      if (
        void 0 === m ||
        ("http" === m && "80" === p) ||
        ("https" === m && "443" === p)
      )
        (m = "web"), (p = "default");
      return [m, n, p, q];
    }
    for (var d = c(String(a)), e = c(String(b)), f = 0; f < d.length; f++)
      if (d[f] !== e[f]) return !1;
    return !0;
  }
  function kq(a) {
    return lq(a) ? 1 : 0;
  }
  function lq(a) {
    var b = a.arg0,
      c = a.arg1;
    if (a.any_of && Array.isArray(c)) {
      for (var d = 0; d < c.length; d++) {
        var e = Db(a, {});
        Db({ arg1: c[d], any_of: void 0 }, e);
        if (kq(e)) return !0;
      }
      return !1;
    }
    switch (a["function"]) {
      case "_cn":
        return 0 <= String(b).indexOf(String(c));
      case "_css":
        var f;
        a: {
          if (b)
            try {
              for (var g = 0; g < fq.length; g++) {
                var l = fq[g];
                if (b[l]) {
                  f = b[l](c);
                  break a;
                }
              }
            } catch (m) {}
          f = !1;
        }
        return f;
      case "_ew":
        return gq(b, c);
      case "_eq":
        return String(b) === String(c);
      case "_ge":
        return Number(b) >= Number(c);
      case "_gt":
        return Number(b) > Number(c);
      case "_lc":
        return 0 <= String(b).split(",").indexOf(String(c));
      case "_le":
        return Number(b) <= Number(c);
      case "_lt":
        return Number(b) < Number(c);
      case "_re":
        return iq(b, c, a.ignore_case);
      case "_sw":
        return 0 === String(b).indexOf(String(c));
      case "_um":
        return jq(b, c);
    }
    return !1;
  }
  Object.freeze({ dl: 1, id: 1 });
  var qq = function (a, b, c) {
      this.D = a;
      this.eventName = b;
      this.m = c;
      this.o = {};
      this.metadata = {};
    },
    rq = function (a, b, c) {
      var d = a.m.getWithConfig(b);
      void 0 !== d ? (a.o[b] = d) : void 0 !== c && (a.o[b] = c);
    };
  Object.freeze(["config", "event", "get", "set"]);
  var sq = encodeURI,
    X = encodeURIComponent,
    tq = ob;
  var uq = function (a, b) {
    if (!a) return !1;
    var c = of(qf(a), "host");
    if (!c) return !1;
    for (var d = 0; b && d < b.length; d++) {
      var e = b[d] && b[d].toLowerCase();
      if (e) {
        var f = c.length - e.length;
        0 < f && "." != e.charAt(0) && (f--, (e = "." + e));
        if (0 <= f && c.indexOf(e, f) == f) return !0;
      }
    }
    return !1;
  };
  var vq = function (a, b, c) {
    for (var d = {}, e = !1, f = 0; a && f < a.length; f++)
      a[f] &&
        a[f].hasOwnProperty(b) &&
        a[f].hasOwnProperty(c) &&
        ((d[a[f][b]] = a[f][c]), (e = !0));
    return e ? d : null;
  };
  function Qr() {
    return (B.gaGlobal = B.gaGlobal || {});
  }
  var Rr = function () {
      var a = Qr();
      a.hid = a.hid || wa();
      return a.hid;
    },
    Sr = function (a, b) {
      var c = Qr();
      if (void 0 == c.vid || (b && !c.from_cookie))
        (c.vid = a), (c.from_cookie = b);
    };
  var qs = function () {
    if (ra(B.__uspapi)) {
      var a = "";
      try {
        B.__uspapi("getUSPData", 1, function (b, c) {
          if (c && b) {
            var d = b.uspString;
            d && RegExp("^[\\da-zA-Z-]{1,20}$").test(d) && (a = d);
          }
        });
      } catch (b) {}
      return a;
    }
  };
  var Os = window,
    Ps = document,
    Qs = function (a) {
      var b = Os._gaUserPrefs;
      if ((b && b.ioo && b.ioo()) || (a && !0 === Os["ga-disable-" + a]))
        return !0;
      try {
        var c = Os.external;
        if (c && c._gaUserPrefs && "oo" == c._gaUserPrefs) return !0;
      } catch (f) {}
      for (
        var d = Of("AMP_TOKEN", String(Ps.cookie), !0), e = 0;
        e < d.length;
        e++
      )
        if ("$OPT_OUT" == d[e]) return !0;
      return Ps.getElementById("__gaOptOutExtension") ? !0 : !1;
    };
  var Rs = {};
  function Ys(a) {
    delete a.eventModel[J.Kb];
    bt(a.eventModel);
  }
  var bt = function (a) {
    Ba(a, function (c) {
      "_" === c.charAt(0) && delete a[c];
    });
    var b = a[J.Da] || {};
    Ba(b, function (c) {
      "_" === c.charAt(0) && delete b[c];
    });
  };
  var qt = function (a, b, c) {
      un(b, c, a);
    },
    rt = function (a, b, c) {
      un(b, c, a, !0);
    },
    tt = function (a, b) {};
  function st(a, b) {}
  var Z = { g: {} };

  (Z.g.e = ["google"]),
    (function () {
      (function (a) {
        Z.__e = a;
        Z.__e.h = "e";
        Z.__e.isVendorTemplate = !0;
        Z.__e.priorityOverride = 0;
      })(function (a) {
        return String(a.vtp_gtmCachedValues.event);
      });
    })();

  (Z.g.v = ["google"]),
    (function () {
      (function (a) {
        Z.__v = a;
        Z.__v.h = "v";
        Z.__v.isVendorTemplate = !0;
        Z.__v.priorityOverride = 0;
      })(function (a) {
        var b = a.vtp_name;
        if (!b || !b.replace) return !1;
        var c = zp(b.replace(/\\\./g, "."), a.vtp_dataLayerVersion || 1),
          d = void 0 !== c ? c : a.vtp_defaultValue;
        Ip(d, "v", a.vtp_gtmEventId);
        return d;
      });
    })();
  (Z.g.rep = ["google"]),
    (function () {
      (function (a) {
        Z.__rep = a;
        Z.__rep.h = "rep";
        Z.__rep.isVendorTemplate = !0;
        Z.__rep.priorityOverride = 0;
      })(function (a) {
        var b;
        switch (bl(a.vtp_containerId).prefix) {
          case "AW":
            b = Wl;
            break;
          case "DC":
            b = im;
            break;
          case "GF":
            b = nm;
            break;
          case "HA":
            b = sm;
            break;
          case "UA":
            b = Rm;
            break;
          default:
            H(a.vtp_gtmOnFailure);
            return;
        }
        H(a.vtp_gtmOnSuccess);
        tn(a.vtp_containerId, b, a.vtp_remoteConfig || {});
      });
    })();

  (Z.g.cid = ["google"]),
    (function () {
      (function (a) {
        Z.__cid = a;
        Z.__cid.h = "cid";
        Z.__cid.isVendorTemplate = !0;
        Z.__cid.priorityOverride = 0;
      })(function () {
        return M.I;
      });
    })();

  (Z.g.get = ["google"]),
    (function () {
      (function (a) {
        Z.__get = a;
        Z.__get.h = "get";
        Z.__get.isVendorTemplate = !0;
        Z.__get.priorityOverride = 0;
      })(function (a) {
        var b = a.vtp_settings;
        (a.vtp_deferrable
          ? rt
          : qt)(String(b.streamId), String(a.vtp_eventName), b.eventParameters || {});
        a.vtp_gtmOnSuccess();
      });
    })();

  var ut = {};
  ut.dataLayer = Ue;
  ut.callback = function (a) {
    Le.hasOwnProperty(a) && ra(Le[a]) && Le[a]();
    delete Le[a];
  };
  ut.bootstrap = 0;
  ut._spx = !1;
  (function (a) {
    if (!B["__TAGGY_INSTALLED"]) {
      var b = !1;
      if (G.referrer) {
        var c = qf(G.referrer);
        b = "cct.google" === nf(c, "host");
      }
      if (!b) {
        var d = Uf("googTaggyReferrer");
        b = d.length && d[0].length;
      }
      b &&
        ((B["__TAGGY_INSTALLED"] = !0),
        lb("https://cct.google/taggy/agent.js"));
    }
    var f = function (q) {
        var t = "GTM",
          u = "GTM";
        (t = "OGT"), (u = "GTAG");
        var r = B["google.tagmanager.debugui2.queue"];
        r ||
          ((r = []),
          (B["google.tagmanager.debugui2.queue"] = r),
          lb(
            "https://" +
              M.Gd +
              "/debug/bootstrap?id=" +
              M.I +
              "&src=" +
              u +
              "&cond=" +
              q +
              "&gtm=" +
              mk()
          ));
        var v = {
          messageType: "CONTAINER_STARTING",
          data: { scriptSource: db, containerProduct: t, debug: !1, id: M.I },
        };
        v.data.resume = function () {
          a();
        };
        M.kh && (v.data.initialPublish = !0);
        r.push(v);
      },
      g = void 0,
      l = of(B.location, "query", !1, void 0, "gtm_debug");
    Qo(l) && (g = 2);
    if (!g && G.referrer) {
      var m = qf(G.referrer);
      "tagassistant.google.com" === nf(m, "host") && (g = 3);
    }
    if (!g) {
      var n = Uf("__TAG_ASSISTANT");
      n.length && n[0].length && (g = 4);
    }
    if (!g) {
      var p = G.documentElement.getAttribute("data-tag-assistant-present");
      Qo(p) && (g = 5);
    }
    g && db ? f(g) : a();
  })(function () {
    var a = !1;
    a && ti("INIT");
    gd().o();
    Jk();
    eh.enable_gbraid_cookie_write = !0;
    var b = !!Q[M.I];
    if (b) {
      var c = Q.zones;
      c && c.unregisterChild(M.I);
    } else {
      for (
        var g = data.resource || {}, l = g.macros || [], m = 0;
        m < l.length;
        m++
      )
        cc.push(l[m]);
      for (var n = g.tags || [], p = 0; p < n.length; p++) fc.push(n[p]);
      for (var q = g.predicates || [], t = 0; t < q.length; t++) ec.push(q[t]);
      for (var u = g.rules || [], r = 0; r < u.length; r++) {
        for (var v = u[r], z = {}, A = 0; A < v.length; A++)
          z[v[A][0]] = Array.prototype.slice.call(v[A], 1);
        dc.push(z);
      }
      ic = Z;
      jc = kq;
      Q[M.I] = ut;
      La(Me, Z.g);
      lc = tc;
      Po();
      fi = !1;
      gi = 0;
      if (
        ("interactive" == G.readyState && !G.createEventObject) ||
        "complete" == G.readyState
      )
        ii();
      else {
        pb(G, "DOMContentLoaded", ii);
        pb(G, "readystatechange", ii);
        if (G.createEventObject && G.documentElement.doScroll) {
          var y = !0;
          try {
            y = !B.frameElement;
          } catch (E) {}
          y && ji();
        }
        pb(B, "load", ii);
      }
      Un = !1;
      "complete" === G.readyState ? Wn() : pb(B, "load", Wn);
      xj && B.setInterval(rj, 864e5);
      Je = Ia();
      ut.bootstrap = Je;
      if (a) {
        var D = ui("INIT");
      }
    }
  });
})();
