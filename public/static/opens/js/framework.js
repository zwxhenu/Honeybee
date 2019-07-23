!
function a(b, c, d) {
    function e(g, h) {
        if (!c[g]) {
            if (!b[g]) {
                var i = "function" == typeof require && require;
                if (!h && i) return i(g, !0);
                if (f) return f(g, !0);
                throw new Error("Cannot find module '" + g + "'")
            }
            var j = c[g] = {
                exports: {}
            };
            b[g][0].call(j.exports,
            function(a) {
                var c = b[g][1][a];
                return e(c ? c: a)
            },
            j, j.exports, a, b, c, d)
        }
        return c[g].exports
    }
    for (var f = "function" == typeof require && require,
    g = 0; g < d.length; g++) e(d[g]);
    return e
} ({
    1 : [function(a, b) {
        function c() {
            var a = this;
            a.defaultParams = {},
            a.antiConsole(),
            d(function() {
                a.constructNotify("alert", '<div class="open-notify open-alert"><i class="sui-icon icon-pc-error-circle"></i><label>这里放错误信息</label> </div>'),
                a.constructNotify("success", '<div class="open-notify open-success"><i class="sui-icon icon-pc-right-circle"></i><label>这里放错误信息</label> </div>'),
                a.antiIE(),
                a.transitionEnd(),
                a.autoIframeHeight()
            })
        }
        a("../common/es5-shim");
        var d = d === jQuery ? d: jQuery;
        c.prototype.antiIE = function() {
            var a = window.navigator.userAgent;
            d.browser = {};
            var b, c = new RegExp("MSIE ([0-9]{1,}[.0-9]{0,})");
            a.match(c) ? (d.browser.msie = !0, b = parseFloat(a.match(c)[1]), 10 > b && this.alert("您还在使用老旧的IE" + b + '浏览器，部分功能将不被支持，不如换个<a href="http://www.baidu.com/s?wd=chrome%E6%B5%8F%E8%A7%88%E5%99%A8%E5%AE%98%E6%96%B9%E4%B8%8B%E8%BD%BD" target="_blank">浏览器</a>试试吧~', !0)) : d.browser.msie = !1
        },
        c.prototype.getFormParams = function(a, b) {
            var c = {};
            if (b) d(a).find(b).map(function() {
                c[this.name] = this.value
            });
            else for (var e = 0; e < a.length; e++) {
                var f = a[e]; ("radio" !== f.type && "checkbox" !== f.type || f.checked !== !1) && f.name && (c[f.name] = f.value)
            }
            return c
        },
        c.prototype.simpleTemplate = function(a, b) {
            return a = a.replace(/^[^\{]*\{\s*\/\*?|\*\/[;|\s]*\}$/g, "").trim(),
            a.replace(/\{{2}(.*?)\}{2}/g,
            function(a, c) {
                var d = c.split("."),
                e = b;
                return d.map(function(a) {
                    e = e[a] || 0 === e[a] ? e[a] : ""
                }),
                e
            })
        },
        c.prototype.css3Detect = function() {
            return "WebkitTransform" in document.body.style || "MozTransform" in document.body.style || "OTransform" in document.body.style || "MsTransform" in document.body.style || "transform" in document.body.style ? !0 : !1
        },
        c.prototype.request = function(a, b, c, f, g, h) {
            c = c ? c: "get",
            b = b ? b: this.defaultURL;
            var i, j = window.FormData ? window.FormData: function() {},
            k = f ? "jsonp": "json",
            l = this,
            m = Array.prototype.slice.call(arguments, 0);
            if (this.defaultParams.ts = (new Date).getTime(), a.constructor === j) {
                if (!h) for (var n in this.defaultParams) a.append(n, this.defaultParams[n]);
                i = d.ajax({
                    url: b,
                    data: a,
                    processData: !1,
                    contentType: !1,
                    type: "POST",
                    dataType: k
                })
            } else {
                if (a.constructor !== Object) throw "数据格式不对或浏览器不支持"; ! h && this.defaultParams && d.extend(a, this.defaultParams),
                i = d[c](b, a, null, k)
            }
            return i.done(function(a) {
                g || (m.unshift(a), l.handler.apply(this, m))
            }).fail(function() {
                console.error("Inteceptor failed"),
                e.alert("服务器异常，请稍后再试")
            }),
            i
        },
        c.prototype.getUrlParms = function(a) {
            var b = /(\w+)=(\w+)/gi;
            a = a ? a: window.location.href;
            var c = {};
            return a.replace(b,
            function(a, b, d) {
                c[b] = d
            }),
            c
        },
        c.prototype.isCrossDomain = function(a) {
            return a.match(/^https?\:/i) && !a.match(document.domain)
        },

        c.prototype.env = function(a, b, c) {
            var d = this,
            e = function(a) {
                if (a) return a;
                throw "你还没有设置" + d.envDetect(a) + "环境下的地址"
            };
            if (this.envDetect()) switch (this.envDetect()) {
            case "other":
                return e(a);
            case "daily":
                return e(b);
            case "online":
                return e(c ? c: b)
            }
        },
        c.prototype.constructNotify = function(a, b) {
            function c() {
                f.running = !0,
                function a() {
                    if (f.queue.length) {
                        closeTime = 4e3;
                        var b = f.queue.shift();
                        setTimeout(b.func, 200),
                        setTimeout(function() {
                            e ? b.tpl.removeClass("opened") : b.tpl.addClass("hide"),
                            a()
                        },
                        closeTime)
                    } else f.running = !1
                } ()
            }
            this.queue = this.queue || [];
            var e = this.css3Detect(),
            f = this;
            b = d(b),
            !e && b.addClass("hide"),
            b.on("click",
            function() {
                e ? b.removeClass("opened") : b.addClass("hide")
            }),
            this[a] = function(a, g) {
                var h = function() {
                    b.find("label").html(a),
                    e ? b.addClass("opened") : b.removeClass("hide")
                };
                if (b.parent()[0] || d("body").append(b), g) h(),
                f.queue.length = 0;
                else {
                    var i = Object.create(null);
                    i.func = h,
                    i.tpl = b,
                    f.queue.push(i),
                    f.running || c()
                }
            }
        },
        c.prototype.transitionEnd = function() {
            var a, b = document.createElement("fakeelement"),
            c = {
                transition: "transitionend",
                OTransition: "OTransitionEnd",
                MozTransition: "transitionend",
                webkitTransitionEnd: "webkitTransitionEnd"
            };
            for (a in c) void 0 !== b.style[a] && (this.transitionEnd = c[a]);
            this.transitionEnd.constructor === Function && (this.transitionEnd = !1)
        },
        c.prototype.spm = function(a) {
            Object.keys(a).forEach(function(b) {
                d(b).attr("data-spm", a[b])
            })
        },
        c.prototype.toggleTransHeight = function(a, b) {
            if (this.css3Detect()) {
                var c = a.height();
                if (0 === c) {
                    a.height("auto");
                    var d = a.height();
                    a.height(c),
                    a.height(d)
                } else "auto" === a[0].style.height && a.height(c),
                a.height(0)
            } else {
                var e = a.height();
                a.height(e ? "0": "auto")
            }
            return b && b()
        },
        c.prototype.delay = function() {
            var a = 0;
            return function(b, c) {
                clearTimeout(a),
                a = setTimeout(b, c)
            }
        } (),
        c.prototype.autoIframeHeight = function() {
            function a() {
                c[0].height = c[0].contentWindow.document.body.scrollHeight
            }
            var b, c = d(".J_autoIframeHeight");
            c[0] && (this.isCrossDomain(c[0].src) ? d(window).on("message",
            function(a) {
                if (a.originalEvent.data.match(/^op-auto-height/)) {
                    var d = parseInt(a.originalEvent.data.match(/\d+/gi)[0]);
                    console.log(d),
                    d !== b && (c[0].height = d, b = d)
                }
            }) : c[0].onload = a)
        },
        c.prototype.antiConsole = function() {
            var a = function() {};
            window.console || (window.console = {
                log: a,
                error: a,
                assert: a,
                dir: a,
                debug: a
            })
        },
        c.prototype.setHttpInterceptor = function(a) {
            this.handler = a
        },
        c.prototype.setDefaultParams = function(a) {
            this.defaultParams = a
        },
        c.prototype.setDefaultURL = function(a) {
            this.defaultURL = a
        };
        var e = new c;
        e.setHttpInterceptor(function(a) {
            a.isSuccess === !1 && e.alert(a.errorMessage ? a.errorMessage: "远程调用失败")
        }),
        window.util && d.extend(e, window.util),
        window.util = e,
        b.exports = e
    },
    {
        "../common/es5-shim": 2
    }],
    2 : [function(a, b, c) { !
        function(a, d) {
            "function" == typeof define && define.amd ? define(d) : "object" == typeof c ? b.exports = d() : a.returnExports = d()
        } (this,
        function() {
            function a(a) {
                var b = +a;
                return b !== b ? b = 0 : 0 !== b && b !== 1 / 0 && b !== -(1 / 0) && (b = (b > 0 || -1) * Math.floor(Math.abs(b))),
                b
            }
            function b(a) {
                var b = typeof a;
                return null === a || "undefined" === b || "boolean" === b || "number" === b || "string" === b
            }
            function c(a) {
                var c, d, e;
                if (b(a)) return a;
                if (d = a.valueOf, p(d) && (c = d.call(a), b(c))) return c;
                if (e = a.toString, p(e) && (c = e.call(a), b(c))) return c;
                throw new TypeError
            }
            function d() {}
            var e, f = Array.prototype,
            g = Object.prototype,
            h = Function.prototype,
            i = String.prototype,
            j = Number.prototype,
            k = f.slice,
            l = f.splice,
            m = (f.push, f.unshift),
            n = h.call,
            o = g.toString,
            p = function(a) {
                return "[object Function]" === g.toString.call(a)
            },
            q = function(a) {
                return "[object RegExp]" === g.toString.call(a)
            },
            r = function(a) {
                return "[object Array]" === o.call(a)
            },
            s = function(a) {
                return "[object String]" === o.call(a)
            },
            t = function(a) {
                var b = o.call(a),
                c = "[object Arguments]" === b;
                return c || (c = !r(a) && null !== a && "object" == typeof a && "number" == typeof a.length && a.length >= 0 && p(a.callee)),
                c
            },
            u = Object.defineProperty &&
            function() {
                try {
                    return Object.defineProperty({},
                    "x", {}),
                    !0
                } catch(a) {
                    return ! 1
                }
            } ();
            e = u ?
            function(a, b, c, d) { ! d && b in a || Object.defineProperty(a, b, {
                    configurable: !0,
                    enumerable: !1,
                    writable: !0,
                    value: c
                })
            }: function(a, b, c, d) { ! d && b in a || (a[b] = c)
            };
            var v = function(a, b, c) {
                for (var d in b) g.hasOwnProperty.call(b, d) && e(a, d, b[d], c)
            },
            w = function(a) {
                if (null == a) throw new TypeError("can't convert " + a + " to object");
                return Object(a)
            },
            x = function(a) {
                return a >>> 0
            };
            v(h, {
                bind: function(a) {
                    var b = this;
                    if (!p(b)) throw new TypeError("Function.prototype.bind called on incompatible " + b);
                    for (var c = k.call(arguments, 1), e = function() {
                        if (this instanceof i) {
                            var d = b.apply(this, c.concat(k.call(arguments)));
                            return Object(d) === d ? d: this
                        }
                        return b.apply(a, c.concat(k.call(arguments)))
                    },
                    f = Math.max(0, b.length - c.length), g = [], h = 0; f > h; h++) g.push("$" + h);
                    var i = Function("binder", "return function (" + g.join(",") + "){ return binder.apply(this, arguments); }")(e);
                    return b.prototype && (d.prototype = b.prototype, i.prototype = new d, d.prototype = null),
                    i
                }
            });
            var y, z, A, B, C, D = n.bind(g.hasOwnProperty); (C = D(g, "__defineGetter__")) && (y = n.bind(g.__defineGetter__), z = n.bind(g.__defineSetter__), A = n.bind(g.__lookupGetter__), B = n.bind(g.__lookupSetter__));
            var E = function() {
                var a = [1, 2],
                b = a.splice();
                return 2 === a.length && r(b) && 0 === b.length
            } ();
            v(f, {
                splice: function() {
                    return 0 === arguments.length ? [] : l.apply(this, arguments)
                }
            },
            E);
            var F = function() {
                var a = {};
                return f.splice.call(a, 0, 0, 1),
                1 === a.length
            } ();
            v(f, {
                splice: function(b, c) {
                    if (0 === arguments.length) return [];
                    var d = arguments;
                    return this.length = Math.max(a(this.length), 0),
                    arguments.length > 0 && "number" != typeof c && (d = k.call(arguments), d.length < 2 ? d.push(this.length - b) : d[1] = a(c)),
                    l.apply(this, d)
                }
            },
            !F);
            var G = 1 !== [].unshift(0);
            v(f, {
                unshift: function() {
                    return m.apply(this, arguments),
                    this.length
                }
            },
            G),
            v(Array, {
                isArray: r
            });
            var H = Object("a"),
            I = "a" !== H[0] || !(0 in H),
            J = function(a) {
                var b = !0,
                c = !0;
                return a && (a.call("foo",
                function(a, c, d) {
                    "object" != typeof d && (b = !1)
                }), a.call([1],
                function() {
                    "use strict";
                    c = "string" == typeof this
                },
                "x")),
                !!a && b && c
            };
            v(f, {
                forEach: function(a) {
                    var b = w(this),
                    c = I && s(this) ? this.split("") : b,
                    d = arguments[1],
                    e = -1,
                    f = c.length >>> 0;
                    if (!p(a)) throw new TypeError;
                    for (; ++e < f;) e in c && a.call(d, c[e], e, b)
                }
            },
            !J(f.forEach)),
            v(f, {
                map: function(a) {
                    var b = w(this),
                    c = I && s(this) ? this.split("") : b,
                    d = c.length >>> 0,
                    e = Array(d),
                    f = arguments[1];
                    if (!p(a)) throw new TypeError(a + " is not a function");
                    for (var g = 0; d > g; g++) g in c && (e[g] = a.call(f, c[g], g, b));
                    return e
                }
            },
            !J(f.map)),
            v(f, {
                filter: function(a) {
                    var b, c = w(this),
                    d = I && s(this) ? this.split("") : c,
                    e = d.length >>> 0,
                    f = [],
                    g = arguments[1];
                    if (!p(a)) throw new TypeError(a + " is not a function");
                    for (var h = 0; e > h; h++) h in d && (b = d[h], a.call(g, b, h, c) && f.push(b));
                    return f
                }
            },
            !J(f.filter)),
            v(f, {
                every: function(a) {
                    var b = w(this),
                    c = I && s(this) ? this.split("") : b,
                    d = c.length >>> 0,
                    e = arguments[1];
                    if (!p(a)) throw new TypeError(a + " is not a function");
                    for (var f = 0; d > f; f++) if (f in c && !a.call(e, c[f], f, b)) return ! 1;
                    return ! 0
                }
            },
            !J(f.every)),
            v(f, {
                some: function(a) {
                    var b = w(this),
                    c = I && s(this) ? this.split("") : b,
                    d = c.length >>> 0,
                    e = arguments[1];
                    if (!p(a)) throw new TypeError(a + " is not a function");
                    for (var f = 0; d > f; f++) if (f in c && a.call(e, c[f], f, b)) return ! 0;
                    return ! 1
                }
            },
            !J(f.some));
            var K = !1;
            f.reduce && (K = "object" == typeof f.reduce.call("es5",
            function(a, b, c, d) {
                return d
            })),
            v(f, {
                reduce: function(a) {
                    var b = w(this),
                    c = I && s(this) ? this.split("") : b,
                    d = c.length >>> 0;
                    if (!p(a)) throw new TypeError(a + " is not a function");
                    if (!d && 1 === arguments.length) throw new TypeError("reduce of empty array with no initial value");
                    var e, f = 0;
                    if (arguments.length >= 2) e = arguments[1];
                    else for (;;) {
                        if (f in c) {
                            e = c[f++];
                            break
                        }
                        if (++f >= d) throw new TypeError("reduce of empty array with no initial value")
                    }
                    for (; d > f; f++) f in c && (e = a.call(void 0, e, c[f], f, b));
                    return e
                }
            },
            !K);
            var L = !1;
            f.reduceRight && (L = "object" == typeof f.reduceRight.call("es5",
            function(a, b, c, d) {
                return d
            })),
            v(f, {
                reduceRight: function(a) {
                    var b = w(this),
                    c = I && s(this) ? this.split("") : b,
                    d = c.length >>> 0;
                    if (!p(a)) throw new TypeError(a + " is not a function");
                    if (!d && 1 === arguments.length) throw new TypeError("reduceRight of empty array with no initial value");
                    var e, f = d - 1;
                    if (arguments.length >= 2) e = arguments[1];
                    else for (;;) {
                        if (f in c) {
                            e = c[f--];
                            break
                        }
                        if (--f < 0) throw new TypeError("reduceRight of empty array with no initial value")
                    }
                    if (0 > f) return e;
                    do f in c && (e = a.call(void 0, e, c[f], f, b));
                    while (f--);
                    return e
                }
            },
            !L);
            var M = Array.prototype.indexOf && -1 !== [0, 1].indexOf(1, 2);
            v(f, {
                indexOf: function(b) {
                    var c = I && s(this) ? this.split("") : w(this),
                    d = c.length >>> 0;
                    if (!d) return - 1;
                    var e = 0;
                    for (arguments.length > 1 && (e = a(arguments[1])), e = e >= 0 ? e: Math.max(0, d + e); d > e; e++) if (e in c && c[e] === b) return e;
                    return - 1
                }
            },
            M);
            var N = Array.prototype.lastIndexOf && -1 !== [0, 1].lastIndexOf(0, -3);
            v(f, {
                lastIndexOf: function(b) {
                    var c = I && s(this) ? this.split("") : w(this),
                    d = c.length >>> 0;
                    if (!d) return - 1;
                    var e = d - 1;
                    for (arguments.length > 1 && (e = Math.min(e, a(arguments[1]))), e = e >= 0 ? e: d - Math.abs(e); e >= 0; e--) if (e in c && b === c[e]) return e;
                    return - 1
                }
            },
            N);
            var O = !{
                toString: null
            }.propertyIsEnumerable("toString"),
            P = function() {}.propertyIsEnumerable("prototype"),
            Q = ["toString", "toLocaleString", "valueOf", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "constructor"],
            R = Q.length;
            v(Object, {
                keys: function(a) {
                    var b = p(a),
                    c = t(a),
                    d = null !== a && "object" == typeof a,
                    e = d && s(a);
                    if (!d && !b && !c) throw new TypeError("Object.keys called on a non-object");
                    var f = [],
                    g = P && b;
                    if (e || c) for (var h = 0; h < a.length; ++h) f.push(String(h));
                    else for (var i in a) g && "prototype" === i || !D(a, i) || f.push(String(i));
                    if (O) for (var j = a.constructor,
                    k = j && j.prototype === a,
                    l = 0; R > l; l++) {
                        var m = Q[l];
                        k && "constructor" === m || !D(a, m) || f.push(m)
                    }
                    return f
                }
            });
            var S = Object.keys &&
            function() {
                return 2 === Object.keys(arguments).length
            } (1, 2),
            T = Object.keys;
            v(Object, {
                keys: function(a) {
                    return T(t(a) ? f.slice.call(a) : a)
                }
            },
            !S);
            var U = -621987552e5,
            V = "-000001",
            W = Date.prototype.toISOString && -1 === new Date(U).toISOString().indexOf(V);
            v(Date.prototype, {
                toISOString: function() {
                    var a, b, c, d, e;
                    if (!isFinite(this)) throw new RangeError("Date.prototype.toISOString called on non-finite value.");
                    for (d = this.getUTCFullYear(), e = this.getUTCMonth(), d += Math.floor(e / 12), e = (e % 12 + 12) % 12, a = [e + 1, this.getUTCDate(), this.getUTCHours(), this.getUTCMinutes(), this.getUTCSeconds()], d = (0 > d ? "-": d > 9999 ? "+": "") + ("00000" + Math.abs(d)).slice(d >= 0 && 9999 >= d ? -4 : -6), b = a.length; b--;) c = a[b],
                    10 > c && (a[b] = "0" + c);
                    return d + "-" + a.slice(0, 2).join("-") + "T" + a.slice(2).join(":") + "." + ("000" + this.getUTCMilliseconds()).slice( - 3) + "Z"
                }
            },
            W);
            var X = !1;
            try {
                X = Date.prototype.toJSON && null === new Date(0 / 0).toJSON() && -1 !== new Date(U).toJSON().indexOf(V) && Date.prototype.toJSON.call({
                    toISOString: function() {
                        return ! 0
                    }
                })
            } catch(Y) {}
            X || (Date.prototype.toJSON = function() {
                var a, b = Object(this),
                d = c(b);
                if ("number" == typeof d && !isFinite(d)) return null;
                if (a = b.toISOString, "function" != typeof a) throw new TypeError("toISOString property is not callable");
                return a.call(b)
            });
            var Z = 1e15 === Date.parse("+033658-09-27T01:46:40.000Z"),
            $ = !isNaN(Date.parse("2012-04-04T24:00:00.500Z")) || !isNaN(Date.parse("2012-11-31T23:59:59.000Z")),
            _ = isNaN(Date.parse("2000-01-01T00:00:00.000Z")); (!Date.parse || _ || $ || !Z) && (Date = function(a) {
                function b(c, d, e, f, g, h, i) {
                    var j = arguments.length;
                    if (this instanceof a) {
                        var k = 1 === j && String(c) === c ? new a(b.parse(c)) : j >= 7 ? new a(c, d, e, f, g, h, i) : j >= 6 ? new a(c, d, e, f, g, h) : j >= 5 ? new a(c, d, e, f, g) : j >= 4 ? new a(c, d, e, f) : j >= 3 ? new a(c, d, e) : j >= 2 ? new a(c, d) : j >= 1 ? new a(c) : new a;
                        return k.constructor = b,
                        k
                    }
                    return a.apply(this, arguments)
                }
                function c(a, b) {
                    var c = b > 1 ? 1 : 0;
                    return f[b] + Math.floor((a - 1969 + c) / 4) - Math.floor((a - 1901 + c) / 100) + Math.floor((a - 1601 + c) / 400) + 365 * (a - 1970)
                }
                function d(b) {
                    return Number(new a(1970, 0, 1, 0, 0, 0, b))
                }
                var e = new RegExp("^(\\d{4}|[+-]\\d{6})(?:-(\\d{2})(?:-(\\d{2})(?:T(\\d{2}):(\\d{2})(?::(\\d{2})(?:(\\.\\d{1,}))?)?(Z|(?:([-+])(\\d{2}):(\\d{2})))?)?)?)?$"),
                f = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365];
                for (var g in a) b[g] = a[g];
                return b.now = a.now,
                b.UTC = a.UTC,
                b.prototype = a.prototype,
                b.prototype.constructor = b,
                b.parse = function(b) {
                    var f = e.exec(b);
                    if (f) {
                        var g, h = Number(f[1]),
                        i = Number(f[2] || 1) - 1,
                        j = Number(f[3] || 1) - 1,
                        k = Number(f[4] || 0),
                        l = Number(f[5] || 0),
                        m = Number(f[6] || 0),
                        n = Math.floor(1e3 * Number(f[7] || 0)),
                        o = Boolean(f[4] && !f[8]),
                        p = "-" === f[9] ? 1 : -1,
                        q = Number(f[10] || 0),
                        r = Number(f[11] || 0);
                        return (l > 0 || m > 0 || n > 0 ? 24 : 25) > k && 60 > l && 60 > m && 1e3 > n && i > -1 && 12 > i && 24 > q && 60 > r && j > -1 && j < c(h, i + 1) - c(h, i) && (g = 60 * (24 * (c(h, i) + j) + k + q * p), g = 1e3 * (60 * (g + l + r * p) + m) + n, o && (g = d(g)), g >= -864e13 && 864e13 >= g) ? g: 0 / 0
                    }
                    return a.parse.apply(this, arguments)
                },
                b
            } (Date)),
            Date.now || (Date.now = function() {
                return (new Date).getTime()
            });
            var aa = j.toFixed && ("0.000" !== 8e-5.toFixed(3) || "1" !== .9.toFixed(0) || "1.25" !== 1.255.toFixed(2) || "1000000000000000128" !== 0xde0b6b3a7640080.toFixed(0)),
            ba = {
                base: 1e7,
                size: 6,
                data: [0, 0, 0, 0, 0, 0],
                multiply: function(a, b) {
                    for (var c = -1; ++c < ba.size;) b += a * ba.data[c],
                    ba.data[c] = b % ba.base,
                    b = Math.floor(b / ba.base)
                },
                divide: function(a) {
                    for (var b = ba.size,
                    c = 0; --b >= 0;) c += ba.data[b],
                    ba.data[b] = Math.floor(c / a),
                    c = c % a * ba.base
                },
                numToString: function() {
                    for (var a = ba.size,
                    b = ""; --a >= 0;) if ("" !== b || 0 === a || 0 !== ba.data[a]) {
                        var c = String(ba.data[a]);
                        "" === b ? b = c: b += "0000000".slice(0, 7 - c.length) + c
                    }
                    return b
                },
                pow: function na(a, b, c) {
                    return 0 === b ? c: b % 2 === 1 ? na(a, b - 1, c * a) : na(a * a, b / 2, c)
                },
                log: function(a) {
                    for (var b = 0; a >= 4096;) b += 12,
                    a /= 4096;
                    for (; a >= 2;) b += 1,
                    a /= 2;
                    return b
                }
            };
            v(j, {
                toFixed: function(a) {
                    var b, c, d, e, f, g, h, i;
                    if (b = Number(a), b = b !== b ? 0 : Math.floor(b), 0 > b || b > 20) throw new RangeError("Number.toFixed called with invalid number of decimals");
                    if (c = Number(this), c !== c) return "NaN";
                    if ( - 1e21 >= c || c >= 1e21) return String(c);
                    if (d = "", 0 > c && (d = "-", c = -c), e = "0", c > 1e-21) if (f = ba.log(c * ba.pow(2, 69, 1)) - 69, g = 0 > f ? c * ba.pow(2, -f, 1) : c / ba.pow(2, f, 1), g *= 4503599627370496, f = 52 - f, f > 0) {
                        for (ba.multiply(0, g), h = b; h >= 7;) ba.multiply(1e7, 0),
                        h -= 7;
                        for (ba.multiply(ba.pow(10, h, 1), 0), h = f - 1; h >= 23;) ba.divide(1 << 23),
                        h -= 23;
                        ba.divide(1 << h),
                        ba.multiply(1, 1),
                        ba.divide(2),
                        e = ba.numToString()
                    } else ba.multiply(0, g),
                    ba.multiply(1 << -f, 0),
                    e = ba.numToString() + "0.00000000000000000000".slice(2, 2 + b);
                    return b > 0 ? (i = e.length, e = b >= i ? d + "0.0000000000000000000".slice(0, b - i + 2) + e: d + e.slice(0, i - b) + "." + e.slice(i - b)) : e = d + e,
                    e
                }
            },
            aa);
            var ca = i.split;
            2 !== "ab".split(/(?:ab)*/).length || 4 !== ".".split(/(.?)(.?)/).length || "t" === "tesst".split(/(s)*/)[1] || 4 !== "test".split(/(?:)/, -1).length || "".split(/.?/).length || ".".split(/()()/).length > 1 ? !
            function() {
                var a = void 0 === /()??/.exec("")[1];
                i.split = function(b, c) {
                    var d = this;
                    if (void 0 === b && 0 === c) return [];
                    if ("[object RegExp]" !== o.call(b)) return ca.call(this, b, c);
                    var e, g, h, i, j = [],
                    k = (b.ignoreCase ? "i": "") + (b.multiline ? "m": "") + (b.extended ? "x": "") + (b.sticky ? "y": ""),
                    l = 0;
                    for (b = new RegExp(b.source, k + "g"), d += "", a || (e = new RegExp("^" + b.source + "$(?!\\s)", k)), c = void 0 === c ? -1 >>> 0 : x(c); (g = b.exec(d)) && (h = g.index + g[0].length, !(h > l && (j.push(d.slice(l, g.index)), !a && g.length > 1 && g[0].replace(e,
                    function() {
                        for (var a = 1; a < arguments.length - 2; a++) void 0 === arguments[a] && (g[a] = void 0)
                    }), g.length > 1 && g.index < d.length && f.push.apply(j, g.slice(1)), i = g[0].length, l = h, j.length >= c)));) b.lastIndex === g.index && b.lastIndex++;
                    return l === d.length ? (i || !b.test("")) && j.push("") : j.push(d.slice(l)),
                    j.length > c ? j.slice(0, c) : j
                }
            } () : "0".split(void 0, 0).length && (i.split = function(a, b) {
                return void 0 === a && 0 === b ? [] : ca.call(this, a, b)
            });
            var da = i.replace,
            ea = function() {
                var a = [];
                return "x".replace(/x(.)?/g,
                function(b, c) {
                    a.push(c)
                }),
                1 === a.length && "undefined" == typeof a[0]
            } ();
            ea || (i.replace = function(a, b) {
                var c = p(b),
                d = q(a) && /\)[*?]/.test(a.source);
                if (c && d) {
                    var e = function(c) {
                        var d = arguments.length,
                        e = a.lastIndex;
                        a.lastIndex = 0;
                        var f = a.exec(c) || [];
                        return a.lastIndex = e,
                        f.push(arguments[d - 2], arguments[d - 1]),
                        b.apply(this, f)
                    };
                    return da.call(this, a, e)
                }
                return da.call(this, a, b)
            });
            var fa = i.substr,
            ga = "".substr && "b" !== "0b".substr( - 1);
            v(i, {
                substr: function(a, b) {
                    return fa.call(this, 0 > a && (a = this.length + a) < 0 ? 0 : a, b)
                }
            },
            ga);
            var ha = "	\n\f\r   ᠎             　\u2028\u2029\ufeff",
            ia = "​",
            ja = "[" + ha + "]",
            ka = new RegExp("^" + ja + ja + "*"),
            la = new RegExp(ja + ja + "*$"),
            ma = i.trim && (ha.trim() || !ia.trim());
            v(i, {
                trim: function() {
                    if (void 0 === this || null === this) throw new TypeError("can't convert " + this + " to object");
                    return String(this).replace(ka, "").replace(la, "")
                }
            },
            ma),
            (8 !== parseInt(ha + "08") || 22 !== parseInt(ha + "0x16")) && (parseInt = function(a) {
                var b = /^0[xX]/;
                return function(c, d) {
                    return c = String(c).trim(),
                    Number(d) || (d = b.test(c) ? 16 : 10),
                    a(c, d)
                }
            } (parseInt))
        })
    },
    {}],
    3 : [function() {
        var a = a === jQuery ? a: jQuery;
        a(function() {
            a("body").on("click", ".J_openDialog",
            function() {
                var b = a(this),
                c = b.next().html();
                a.alert({
                    body: c,
                    okBtn: "关闭",
                    title: b.data("title") || "API配置",
                    width: "large"
                })
            }),
            a("body").on("click", ".J_formNeedCofirm",
            function() {
                var b = a(this);
                a.alert({
                    body: b.data("message"),
                    okBtn: "确定",
                    cancelBtn: "取消",
                    okHide: function() {
                        b.closest("form").submit()
                    }
                })
            }),
            a("body").on("click", ".J_hrefNeedPostConfirm",
            function() {
                var b = a(this);
                a.alert({
                    body: b.data("message"),
                    okBtn: "确定",
                    cancelBtn: "取消",
                    okHide: function() {
                        b.closest("form").submit()
                    }
                })
            }),
            a("body").on("click", ".J_hrefNeedPost",
            function() {
                var b = a(this);
                b.closest("form").submit()
            }),
            a("body").on("click", ".J_subTargetForm",
            function() {
                var b = a(this);
                a.alert({
                    body: b.data("message"),
                    okBtn: "确定",
                    cancelBtn: "取消",
                    okHide: function() {
                        var c = a(b.data("targetForm")),
                        d = b.data("param");
                        Object.keys(d).forEach(function(a) {
                            c.append('<input type="hidden" name="' + a + '" value="' + d[a] + '"/>')
                        }),
                        c.attr("action", b.data("action") || "#"),
                        a(b.data("targetForm")).submit()
                    }
                })
            })
        })
    },
    {}],
    4 : [function(a) {
        a("../common/Util"),
        a("../common/form-stuff");
        var b = b === jQuery ? b: jQuery;
        b(function() {
            var a = {
                indecatorEffect: function() {
                    var a = b(".second-nav-container");
                    if (a[0]) {
                        var c = a.find(".active > a").length ? a.find(".active > a") : a.find("a").eq(0),
                        d = a.find("li"),
                        e = c.width() + 4,
                        f = c.position().left - 2,
                        g = a.find(".indecator");
                        g.css({
                            left: f,
                            width: e
                        }),
                        d.hover(function() {
                            var a = b(this).find("a");
                            g.css({
                                left: a.position().left - 2,
                                width: a.width() + 4
                            })
                        },
                        function() {
                            g.css({
                                left: f,
                                width: e
                            })
                        })
                    }
                },
                navGroupEffect: function() {
                    var a = b(".op-nav-group");
                    if (a[0]) {
                        var c = a.find(".active"),
                        d = a.find("> a"),
                        e = c.width() + 4,
                        f = c.position().left,
                        g = a.find(".indecator");
                        g.css({
                            left: f,
                            width: e
                        }),
                        d.hover(function() {
                            g.css({
                                left: b(this).position().left,
                                width: b(this).width() + 4
                            }),
                            c.removeClass("active")
                        },
                        function() {
                            g.css({
                                left: f,
                                width: e
                            }),
                            c.addClass("active")
                        })
                    }
                },
                sideBarStuff: function() {
                    var a = b(".openplatform-3rd-nav");
                    if (a[0]) {
                        var c = a.find(".active").parentsUntil(a.children("ul"), "ul");
                        c.each(function(a, c) {
                            c = b(c),
                            c.siblings(".folder")[0] && c.css("height", "auto").parent().addClass("opened")
                        }),
                        a.on("click", "a",
                        function() {
                            b(this).hasClass("folder") && (b(this).parent().toggleClass("opened"), util.toggleTransHeight(b(this).siblings("ul")), b(this).parentsUntil(a.children("ul"), "ul").css("height", "auto"))
                        })
                    }
                },
                fixSideBar: function() {
                    var a = b(".openplatform-3rd-nav");
                    if (a[0]) {
                        var c = parseInt(a.css("margin-top").match(/\d+/)),
                        d = a.offset().top - c;
                        util.getUrlParms().disableScroll || b(window).on("scroll",
                        function() {
                            var c = b(window).scrollTop();
                            c >= d ? a.addClass("fix-pos") : a.removeClass("fix-pos")
                        })
                    }
                },
                autoSuggest: function() {
                    var a = b("#J_openAutoComp");
                    if (a[0]) {
                        var c = b(".J_openType").val(),
                        d = b(".open-icon-search"),
                        e = function(a) {
                            window.location.href = util.env("", "", "") + "?t=" + c + "&q=" + a
                        };
                        a.autocomplete({
                            serviceUrl: util.env("", "", ""),
                            appendTo: ".search-container .inner",
                            dataType: "jsonp",
                            width: 270,
                            params: {
                                t: c
                            },
                            deferRequestBy: 300,
                            triggerSelectOnValidInput: !1,
                            onSelect: function(a) {
                                e(a.value)
                            }
                        }).on("focus",
                        function() {
                            b(this).parent().addClass("autocomplete-focus")
                        }).on("blur",
                        function() {
                            b(this).parent().removeClass("autocomplete-focus")
                        }),
                        d.on("click",
                        function() {
                            e(a.val())
                        })
                    }
                },
                init: function() {
                    this.indecatorEffect(),
                    this.navGroupEffect(),
                    this.autoSuggest(),
                    this.sideBarStuff(),
                    this.fixSideBar()
                }
            }; (b(".open-framework-container")[0] || b(".open-framework-single-container")[0]) && a.init()
        })
    },
    {
        "../common/Util": 1,
        "../common/form-stuff": 3
    }]
},
{},
[4]);
//# sourceMappingURL=framework.min.map
