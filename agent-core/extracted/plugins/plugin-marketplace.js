    att();
    e7();
    tat();
    tun();
    pHr();
    mHr();
    sun();
    ljs = (0, CHr.promisify)(IHr.execFile), mOe = "known_marketplaces.json", dun = "installed_plugins.json", wat = "marketplace.json", F0e = "claude-plugins-official", EHr = "icon-sources.json", pun = "https://cdn-zcode.z.ai/zcode/official-plugin/assets/", ujs = `${pun}${EHr}`, djs = 10 * 1024 * 1024, pjs = 5, fjs = 18e4, yHr = new Set, mjs = (0, $u.join)(".claude-plugin", "marketplace.json"), hjs = (0, $u.join)(".zcode-plugin", "plugin.json"), gjs = (0, $u.join)(".claude-plugin", "plugin.json"), _js = (0, $u.join)(".codex-plugin", "plugin.json"), hOe = "0.0.0", vHr = 3, yjs = 9e4, vjs = 1e3, bHr = 3e4, bjs = /^[a-z0-9][a-z0-9._-]{0,127}$/, fun = /^[a-z0-9][a-z0-9._-]{0,127}$/, AHr = /^[a-f0-9]{64}$/u, Sjs = ["channels", "lspServers", "outputStyles", "settings"];
    r(wjs, "buildMarketplaceGitEnv");
    r(Xx, "throwIfPluginOperationAborted");
    r(aun, "createPluginOperationCancelledError");
    r(kjs, "createMarketplaceOperationSignalScope");
    r(kat, "parseMarketplaceSourceInput");
    r(x1, "loadKnownMarketplacesSync");
    r(W7, "ensureDefaultPluginMarketplaces");
    r(B0e, "ensureMarketplaceManifestAvailable");
    r(fre, "addMarketplace");
    r(cun, "parsePluginIconSources");
    r(mun, "applyClaudePluginIcons");
    r(hun, "enrichCachedClaudeMarketplaceIcons");
    r(xjs, "isSafePluginIconPath");
    r(PHr, "loadClaudePluginIconSources");
    r(RHr, "requestMarketplaceJson");
    r(Tjs, "isMarketplaceJsonRedirectStatus");
    r(gun, "updateMarketplace");
    r(_un, "removeMarketplace");
    r(Lk, "loadMarketplaceManifestSync");
    r(xat, "loadInstalledPluginsSync");
    r(DHr, "saveInstalledPlugins");
    r(V7, "listInstalledPluginRecords");
    r(yun, "resolveInstalledPluginRoot");
    r(vun, "installMarketplacePlugin");
    r(bun, "uninstallMarketplacePlugin");
    r(Tat, "validateMarketplacePlugin");
    r(Sun, "describeMarketplacePlugin");
    r(SHr, "readComponentsAtRoot");
    r(Ijs, "toManifestDisplayMetadata");
    r(gOe, "validateMarketplaceSource");
    r(wun, "validateLocalPluginPath");
    r(Cjs, "resolveManifestRootFromFile");
    r($7, "getMarketplaceManifestPath");
    r(OHr, "resolveDependencyClosure");
    r(Ejs, "cacheMarketplacePlugin");
    r(Iat, "resolvePluginSourceRoot");
    r(z7, "readPluginSourceIdentityPin");
    r(MHr, "readRequiredZipPluginSourceSha256");
    r(dre, "readRequiredPluginSourceString");
    r(NHr, "readOptionalZipPluginSourcePath");
    r(LHr, "readOptionalZipPluginSourceStripRoot");
    r(FHr, "readPluginSourceHeaders");
    r(Ajs, "resolveGitPluginSource");
    r(yat, "resolveRepositoryPluginSource");
    r(Pjs, "clonePluginSource");
    r(Rjs, "normalizeGitUrl");
    r(Djs, "resolveMarketplacePluginBaseDir");
    r(wHr, "ensureMarketplaceEntryManifest");
    r(Ojs, "assertZipPluginInstallRoot");
    r(kun, "createManifestFromMarketplaceEntry");
    r(jHr, "loadMarketplaceFromSource");
    r(kHr, "resolveRepositoryMarketplaceSource");
    r(Mjs, "cloneMarketplaceSource");
    r(BHr, "execGitCloneWithRetry");
    r(xun, "execGitCommand");
    r(Njs, "isRetryableGitCloneError");
    r(Ljs, "getErrorOutput");
    r(Fjs, "delay");
    r(vat, "stageMarketplaceDirectoryPlugins");
    r(jjs, "stageMarketplaceManifest");
    r(Bjs, "writeMarketplaceManifest");
    r(Ujs, "upsertKnownMarketplace");
    r(zjs, "persistMarketplaceRefreshFailure");
    r(Sat, "writeKnownMarketplaces");
    r($js, "writeKnownMarketplacesSync");
    r(qjs, "defaultMarketplaceSourceFromString");
    r(Wjs, "normalizeInstalledPluginsState");
    r(Vjs, "normalizeInstalledPluginRecordFromMap");
    r(pre, "parseRequiredMarketplaceManifest");
    r(UHr, "parseMarketplaceManifest");
    r(zHr, "normalizeMarketplaceManifest");
    r(_Oe, "parseEntryStoreListing");
    r(yOe, "normalizeAuthorValue");
    r(Hjs, "normalizeDependencyRef");
    r(bat, "findMarketplaceManifestPath");
    r(Cat, "findPluginManifestPath");
    r(Gjs, "resolveInstalledPluginVersion");
    r(Tun, "readPluginManifestFromRoot");
    r(Iun, "validatePluginRoot");
    r($Hr, "pushManifestCompatibilityDiagnostics");
    r(Jjs, "pushMcpValidationDiagnostics");
    r(qHr, "containsMcpBundleSource");
    r(Kjs, "validateMarketplaceEntryShape");
    r(lun, "pushEntryCompatibilityDiagnostics");
    r(Zjs, "getMarketplaceSourceValidationDeferral");
    r(Yjs, "pushDependencyDiagnosticsFromManifest");
    r(Xjs, "resolveDependencyClosureFromManifest");
    r(Qjs, "pushDependencyDiagnostics");
    r(q7, "toValidationDiagnostic");
    j0e = class extends Error {
        static {
            r(this, "UnsupportedMarketplaceSourceError")
        }
        constructor(t) {
            super(`Marketplace source is recognized but not supported in this runtime: ${t}`)
        }
    }, fOe = class extends Error {
        static {
            r(this, "UnsupportedPluginSourceError")
        }
        constructor(t) {
            super(`Plugin source is recognized but not supported in this runtime: ${t}`)
        }
    };
    r(e3s, "isPluginMarketplaceManifest");
    r(Eat, "readJsonFileSync");
    r(mre, "writeJsonFile");
    r(Cun, "getPluginCacheDir");
    r(Aat, "getPluginDataDir");
    r(xHr, "isKnownMarketplaceRecord");
    r(t3s, "isInstalledPluginRecord");
    r(Pat, "parsePluginId");
    r(WHr, "qualifyDependency");
    r(n3s, "resolvePathInput");
    r(THr, "splitRef");
    r(VHr, "splitGitHubShorthand");
    r(r3s, "isGitSshUrl");
    r(o3s, "tryParseUrl")
});
var vOe = At((oml, HHr) => {
    "use strict";
    var i3s = "2.0.0",
        s3s = Number.MAX_SAFE_INTEGER || 9007199254740991,
        a3s = 16,
        c3s = 250,
        l3s = ["major", "premajor", "minor", "preminor", "patch", "prepatch", "prerelease"];
    HHr.exports = {
        MAX_LENGTH: 256,
        MAX_SAFE_COMPONENT_LENGTH: a3s,
        MAX_SAFE_BUILD_LENGTH: c3s,
        MAX_SAFE_INTEGER: s3s,
        RELEASE_TYPES: l3s,
        SEMVER_SPEC_VERSION: i3s,
        FLAG_INCLUDE_PRERELEASE: 1,
        FLAG_LOOSE: 2
    }
});
var bOe = At((iml, GHr) => {
    "use strict";
    var u3s = typeof process == "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...e) => console.error("SEMVER", ...e) : () => {};
    GHr.exports = u3s
});
var U0e = At((oB, JHr) => {
    "use strict";
    var {
        MAX_SAFE_COMPONENT_LENGTH: Aun,
        MAX_SAFE_BUILD_LENGTH: d3s,
        MAX_LENGTH: p3s
    } = vOe(), f3s = bOe();
    oB = JHr.exports = {};
    var m3s = oB.re = [],
        h3s = oB.safeRe = [],
        sl = oB.src = [],
        g3s = oB.safeSrc = [],
        al = oB.t = {},
        _3s = 0,
        Pun = "[a-zA-Z0-9-]",
        y3s = [
            ["\\s", 1],
            ["\\d", p3s],
            [Pun, d3s]
        ],
        v3s = r(e => {
            for (let [t, n] of y3s) e = e.split(`${t}*`).join(`${t}{0,${n}}`).split(`${t}+`).join(`${t}{1,${n}}`);
            return e
        }, "makeSafeRegex"),
        ap = r((e, t, n) => {
            let o = v3s(t),
                s = _3s++;
            f3s(e, s, t), al[e] = s, sl[s] = t, g3s[s] = o, m3s[s] = new RegExp(t, n ? "g" : void 0), h3s[s] = new RegExp(o, n ? "g" : void 0)
        }, "createToken");
    ap("NUMERICIDENTIFIER", "0|[1-9]\\d*");
    ap("NUMERICIDENTIFIERLOOSE", "\\d+");
    ap("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${Pun}*`);
    ap("MAINVERSION", `(${sl[al.NUMERICIDENTIFIER]})\\.(${sl[al.NUMERICIDENTIFIER]})\\.(${sl[al.NUMERICIDENTIFIER]})`);
    ap("MAINVERSIONLOOSE", `(${sl[al.NUMERICIDENTIFIERLOOSE]})\\.(${sl[al.NUMERICIDENTIFIERLOOSE]})\\.(${sl[al.NUMERICIDENTIFIERLOOSE]})`);
    ap("PRERELEASEIDENTIFIER", `(?:${sl[al.NONNUMERICIDENTIFIER]}|${sl[al.NUMERICIDENTIFIER]})`);
    ap("PRERELEASEIDENTIFIERLOOSE", `(?:${sl[al.NONNUMERICIDENTIFIER]}|${sl[al.NUMERICIDENTIFIERLOOSE]})`);
    ap("PRERELEASE", `(?:-(${sl[al.PRERELEASEIDENTIFIER]}(?:\\.${sl[al.PRERELEASEIDENTIFIER]})*))`);
    ap("PRERELEASELOOSE", `(?:-?(${sl[al.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${sl[al.PRERELEASEIDENTIFIERLOOSE]})*))`);
    ap("BUILDIDENTIFIER", `${Pun}+`);
    ap("BUILD", `(?:\\+(${sl[al.BUILDIDENTIFIER]}(?:\\.${sl[al.BUILDIDENTIFIER]})*))`);
    ap("FULLPLAIN", `v?${sl[al.MAINVERSION]}${sl[al.PRERELEASE]}?${sl[al.BUILD]}?`);
    ap("FULL", `^${sl[al.FULLPLAIN]}$`);
    ap("LOOSEPLAIN", `[v=\\s]*${sl[al.MAINVERSIONLOOSE]}${sl[al.PRERELEASELOOSE]}?${sl[al.BUILD]}?`);
    ap("LOOSE", `^${sl[al.LOOSEPLAIN]}$`);
    ap("GTLT", "((?:<|>)?=?)");
    ap("XRANGEIDENTIFIERLOOSE", `${sl[al.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`);
    ap("XRANGEIDENTIFIER", `${sl[al.NUMERICIDENTIFIER]}|x|X|\\*`);
    ap("XRANGEPLAIN", `[v=\\s]*(${sl[al.XRANGEIDENTIFIER]})(?:\\.(${sl[al.XRANGEIDENTIFIER]})(?:\\.(${sl[al.XRANGEIDENTIFIER]})(?:${sl[al.PRERELEASE]})?${sl[al.BUILD]}?)?)?`);
    ap("XRANGEPLAINLOOSE", `[v=\\s]*(${sl[al.XRANGEIDENTIFIERLOOSE]})(?:\\.(${sl[al.XRANGEIDENTIFIERLOOSE]})(?:\\.(${sl[al.XRANGEIDENTIFIERLOOSE]})(?:${sl[al.PRERELEASELOOSE]})?${sl[al.BUILD]}?)?)?`);
    ap("XRANGE", `^${sl[al.GTLT]}\\s*${sl[al.XRANGEPLAIN]}$`);
    ap("XRANGELOOSE", `^${sl[al.GTLT]}\\s*${sl[al.XRANGEPLAINLOOSE]}$`);
    ap("COERCEPLAIN", `(^|[^\\d])(\\d{1,${Aun}})(?:\\.(\\d{1,${Aun}}))?(?:\\.(\\d{1,${Aun}}))?`);
    ap("COERCE", `${sl[al.COERCEPLAIN]}(?:$|[^\\d])`);
    ap("COERCEFULL", sl[al.COERCEPLAIN] + `(?:${sl[al.PRERELEASE]})?(?:${sl[al.BUILD]})?(?:$|[^\\d])`);
    ap("COERCERTL", sl[al.COERCE], !0);
    ap("COERCERTLFULL", sl[al.COERCEFULL], !0);
    ap("LONETILDE", "(?:~>?)");
    ap("TILDETRIM", `(\\s*)${sl[al.LONETILDE]}\\s+`, !0);
    oB.tildeTrimReplace = "$1~";
    ap("TILDE", `^${sl[al.LONETILDE]}${sl[al.XRANGEPLAIN]}$`);
    ap("TILDELOOSE", `^${sl[al.LONETILDE]}${sl[al.XRANGEPLAINLOOSE]}$`);
    ap("LONECARET", "(?:\\^)");
    ap("CARETTRIM", `(\\s*)${sl[al.LONECARET]}\\s+`, !0);
    oB.caretTrimReplace = "$1^";
    ap("CARET", `^${sl[al.LONECARET]}${sl[al.XRANGEPLAIN]}$`);
    ap("CARETLOOSE", `^${sl[al.LONECARET]}${sl[al.XRANGEPLAINLOOSE]}$`);
    ap("COMPARATORLOOSE", `^${sl[al.GTLT]}\\s*(${sl[al.LOOSEPLAIN]})$|^$`);
    ap("COMPARATOR", `^${sl[al.GTLT]}\\s*(${sl[al.FULLPLAIN]})$|^$`);
    ap("COMPARATORTRIM", `(\\s*)${sl[al.GTLT]}\\s*(${sl[al.LOOSEPLAIN]}|${sl[al.XRANGEPLAIN]})`, !0);
    oB.comparatorTrimReplace = "$1$2$3";
    ap("HYPHENRANGE", `^\\s*(${sl[al.XRANGEPLAIN]})\\s+-\\s+(${sl[al.XRANGEPLAIN]})\\s*$`);
    ap("HYPHENRANGELOOSE", `^\\s*(${sl[al.XRANGEPLAINLOOSE]})\\s+-\\s+(${sl[al.XRANGEPLAINLOOSE]})\\s*$`);
    ap("STAR", "(<|>)?=?\\s*\\*");
    ap("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$");
    ap("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$")
});
var Rat = At((aml, KHr) => {
    "use strict";
    var b3s = Object.freeze({
            loose: !0
        }),
        S3s = Object.freeze({}),
        w3s = r(e => e ? typeof e != "object" ? b3s : e : S3s, "parseOptions");
    KHr.exports = w3s
});
var Run = At((lml, XHr) => {
    "use strict";
    var ZHr = /^[0-9]+$/,
        YHr = r((e, t) => {
            if (typeof e == "number" && typeof t == "number") return e === t ? 0 : e < t ? -1 : 1;
            let n = ZHr.test(e),
                o = ZHr.test(t);
            return n && o && (e = +e, t = +t), e === t ? 0 : n && !o ? -1 : o && !n ? 1 : e < t ? -1 : 1
        }, "compareIdentifiers"),
        k3s = r((e, t) => YHr(t, e), "rcompareIdentifiers");
    XHr.exports = {
        compareIdentifiers: YHr,
        rcompareIdentifiers: k3s
    }
});
var T1 = At((dml, eGr) => {
    "use strict";
    var Dat = bOe(),
        {
            MAX_LENGTH: QHr,
            MAX_SAFE_INTEGER: Oat
        } = vOe(),
        {
            safeRe: Mat,
            t: Nat
        } = U0e(),
        x3s = Rat(),
        {
            compareIdentifiers: Dun
        } = Run(),
        Oun = class e {
            static {
                r(this, "SemVer")
            }
            constructor(t, n) {
                if (n = x3s(n), t instanceof e) {
                    if (t.loose === !!n.loose && t.includePrerelease === !!n.includePrerelease) return t;
                    t = t.version
                } else if (typeof t != "string") throw new TypeError(`Invalid version. Must be a string. Got type "${typeof t}".`);
                if (t.length > QHr) throw new TypeError(`version is longer than ${QHr} characters`);
                Dat("SemVer", t, n), this.options = n, this.loose = !!n.loose, this.includePrerelease = !!n.includePrerelease;
                let o = t.trim().match(n.loose ? Mat[Nat.LOOSE] : Mat[Nat.FULL]);
                if (!o) throw new TypeError(`Invalid Version: ${t}`);
                if (this.raw = t, this.major = +o[1], this.minor = +o[2], this.patch = +o[3], this.major > Oat || this.major < 0) throw new TypeError("Invalid major version");
                if (this.minor > Oat || this.minor < 0) throw new TypeError("Invalid minor version");
                if (this.patch > Oat || this.patch < 0) throw new TypeError("Invalid patch version");
                o[4] ? this.prerelease = o[4].split(".").map(s => {
                    if (/^[0-9]+$/.test(s)) {
                        let a = +s;
                        if (a >= 0 && a < Oat) return a
                    }
                    return s
                }) : this.prerelease = [], this.build = o[5] ? o[5].split(".") : [], this.format()
            }
            format() {
                return this.version = `${this.major}.${this.minor}.${this.patch}`, this.prerelease.length && (this.version += `-${this.prerelease.join(".")}`), this.version
            }
            toString() {
                return this.version
            }
            compare(t) {
                if (Dat("SemVer.compare", this.version, this.options, t), !(t instanceof e)) {
                    if (typeof t == "string" && t === this.version) return 0;
                    t = new e(t, this.options)
                }
                return t.version === this.version ? 0 : this.compareMain(t) || this.comparePre(t)
            }
            compareMain(t) {
                return t instanceof e || (t = new e(t, this.options)), this.major < t.major ? -1 : this.major > t.major ? 1 : this.minor < t.minor ? -1 : this.minor > t.minor ? 1 : this.patch < t.patch ? -1 : this.patch > t.patch ? 1 : 0
            }
            comparePre(t) {
                if (t instanceof e || (t = new e(t, this.options)), this.prerelease.length && !t.prerelease.length) return -1;
                if (!this.prerelease.length && t.prerelease.length) return 1;
                if (!this.prerelease.length && !t.prerelease.length) return 0;
                let n = 0;
                do {
                    let o = this.prerelease[n],
                        s = t.prerelease[n];
                    if (Dat("prerelease compare", n, o, s), o === void 0 && s === void 0) return 0;
                    if (s === void 0) return 1;
                    if (o === void 0) return -1;
                    if (o === s) continue;
                    return Dun(o, s)
                } while (++n)
            }
            compareBuild(t) {
                t instanceof e || (t = new e(t, this.options));
                let n = 0;
                do {
                    let o = this.build[n],
                        s = t.build[n];
                    if (Dat("build compare", n, o, s), o === void 0 && s === void 0) return 0;
                    if (s === void 0) return 1;
                    if (o === void 0) return -1;
                    if (o === s) continue;
                    return Dun(o, s)
                } while (++n)
            }
            inc(t, n, o) {
                if (t.startsWith("pre")) {
                    if (!n && o === !1) throw new Error("invalid increment argument: identifier is empty");
                    if (n) {
                        let s = `-${n}`.match(this.options.loose ? Mat[Nat.PRERELEASELOOSE] : Mat[Nat.PRERELEASE]);
                        if (!s || s[1] !== n) throw new Error(`invalid identifier: ${n}`)
                    }
                }
                switch (t) {
                    case "premajor":
                        this.prerelease.length = 0, this.patch = 0, this.minor = 0, this.major++, this.inc("pre", n, o);
                        break;
                    case "preminor":
                        this.prerelease.length = 0, this.patch = 0, this.minor++, this.inc("pre", n, o);
                        break;
                    case "prepatch":
                        this.prerelease.length = 0, this.inc("patch", n, o), this.inc("pre", n, o);
                        break;
                    case "prerelease":
                        this.prerelease.length === 0 && this.inc("patch", n, o), this.inc("pre", n, o);
                        break;
                    case "release":
                        if (this.prerelease.length === 0) throw new Error(`version ${this.raw} is not a prerelease`);
                        this.prerelease.length = 0;
                        break;
                    case "major":
                        (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) && this.major++, this.minor = 0, this.patch = 0, this.prerelease = [];
                        break;
                    case "minor":
                        (this.patch !== 0 || this.prerelease.length === 0) && this.minor++, this.patch = 0, this.prerelease = [];
                        break;
                    case "patch":
                        this.prerelease.length === 0 && this.patch++, this.prerelease = [];
                        break;
                    case "pre": {
                        let s = Number(o) ? 1 : 0;
                        if (this.prerelease.length === 0) this.prerelease = [s];
                        else {
                            let a = this.prerelease.length;
                            for (; --a >= 0;) typeof this.prerelease[a] == "number" && (this.prerelease[a]++, a = -2);
                            if (a === -1) {
                                if (n === this.prerelease.join(".") && o === !1) throw new Error("invalid increment argument: identifier already exists");
                                this.prerelease.push(s)
                            }
                        }
                        if (n) {
                            let a = [n, s];
                            o === !1 && (a = [n]), Dun(this.prerelease[0], n) === 0 ? isNaN(this.prerelease[1]) && (this.prerelease = a) : this.prerelease = a
                        }
                        break
                    }
                    default:
                        throw new Error(`invalid increment argument: ${t}`)
                }
                return this.raw = this.format(), this.build.length && (this.raw += `+${this.build.join(".")}`), this
            }
        };
    eGr.exports = Oun
});
var hre = At((fml, nGr) => {
    "use strict";
    var tGr = T1(),
        T3s = r((e, t, n = !1) => {
            if (e instanceof tGr) return e;
            try {
                return new tGr(e, t)
            } catch (o) {
                if (!n) return null;
                throw o
            }
        }, "parse");
    nGr.exports = T3s
});
var oGr = At((hml, rGr) => {
    "use strict";
    var I3s = hre(),
        C3s = r((e, t) => {
            let n = I3s(e, t);
            return n ? n.version : null
        }, "valid");
    rGr.exports = C3s
});
var sGr = At((_ml, iGr) => {
    "use strict";
    var E3s = hre(),
        A3s = r((e, t) => {
            let n = E3s(e.trim().replace(/^[=v]+/, ""), t);
            return n ? n.version : null
        }, "clean");
    iGr.exports = A3s
});
var lGr = At((vml, cGr) => {
    "use strict";
    var aGr = T1(),
        P3s = r((e, t, n, o, s) => {
            typeof n == "string" && (s = o, o = n, n = void 0);
            try {
                return new aGr(e instanceof aGr ? e.version : e, n).inc(t, o, s).version
            } catch {
                return null
            }
        }, "inc");
    cGr.exports = P3s
});
var pGr = At((Sml, dGr) => {
    "use strict";
    var uGr = hre(),
        R3s = r((e, t) => {
            let n = uGr(e, null, !0),
                o = uGr(t, null, !0),
                s = n.compare(o);
            if (s === 0) return null;
            let a = s > 0,
                l = a ? n : o,
                u = a ? o : n,
                f = !!l.prerelease.length;
            if (!!u.prerelease.length && !f) {
                if (!u.patch && !u.minor) return "major";
                if (u.compareMain(l) === 0) return u.minor && !u.patch ? "minor" : "patch"
            }
            let _ = f ? "pre" : "";
            return n.major !== o.major ? _ + "major" : n.minor !== o.minor ? _ + "minor" : n.patch !== o.patch ? _ + "patch" : "prerelease"
        }, "diff");
    dGr.exports = R3s
});
var mGr = At((kml, fGr) => {
    "use strict";
    var D3s = T1(),
        O3s = r((e, t) => new D3s(e, t).major, "major");
    fGr.exports = O3s
});
var gGr = At((Tml, hGr) => {
    "use strict";
    var M3s = T1(),
        N3s = r((e, t) => new M3s(e, t).minor, "minor");
    hGr.exports = N3s
});
var yGr = At((Cml, _Gr) => {
    "use strict";
    var L3s = T1(),
        F3s = r((e, t) => new L3s(e, t).patch, "patch");
    _Gr.exports = F3s
});
var bGr = At((Aml, vGr) => {
    "use strict";
    var j3s = hre(),
        B3s = r((e, t) => {
            let n = j3s(e, t);
            return n && n.prerelease.length ? n.prerelease : null
        }, "prerelease");
    vGr.exports = B3s
});
var EM = At((Rml, wGr) => {
    "use strict";
    var SGr = T1(),
        U3s = r((e, t, n) => new SGr(e, n).compare(new SGr(t, n)), "compare");
    wGr.exports = U3s
});
var xGr = At((Oml, kGr) => {
    "use strict";
    var z3s = EM(),
        $3s = r((e, t, n) => z3s(t, e, n), "rcompare");
    kGr.exports = $3s
});
var IGr = At((Nml, TGr) => {
    "use strict";
    var q3s = EM(),
        W3s = r((e, t) => q3s(e, t, !0), "compareLoose");
    TGr.exports = W3s
});
var Lat = At((Fml, EGr) => {
    "use strict";
    var CGr = T1(),
        V3s = r((e, t, n) => {
            let o = new CGr(e, n),
                s = new CGr(t, n);
            return o.compare(s) || o.compareBuild(s)
        }, "compareBuild");
    EGr.exports = V3s
});
var PGr = At((Bml, AGr) => {
    "use strict";
    var H3s = Lat(),
        G3s = r((e, t) => e.sort((n, o) => H3s(n, o, t)), "sort");
    AGr.exports = G3s
});
var DGr = At((zml, RGr) => {
    "use strict";
    var J3s = Lat(),
        K3s = r((e, t) => e.sort((n, o) => J3s(o, n, t)), "rsort");
    RGr.exports = K3s
});
var SOe = At((qml, OGr) => {
    "use strict";
    var Z3s = EM(),
        Y3s = r((e, t, n) => Z3s(e, t, n) > 0, "gt");
    OGr.exports = Y3s
});
var Fat = At((Vml, MGr) => {
    "use strict";
    var X3s = EM(),
        Q3s = r((e, t, n) => X3s(e, t, n) < 0, "lt");
    MGr.exports = Q3s
});
var Mun = At((Gml, NGr) => {
    "use strict";
    var eBs = EM(),
        tBs = r((e, t, n) => eBs(e, t, n) === 0, "eq");
    NGr.exports = tBs
});
var Nun = At((Kml, LGr) => {
    "use strict";
    var nBs = EM(),
        rBs = r((e, t, n) => nBs(e, t, n) !== 0, "neq");
    LGr.exports = rBs
});
var jat = At((Yml, FGr) => {
    "use strict";
    var oBs = EM(),
        iBs = r((e, t, n) => oBs(e, t, n) >= 0, "gte");
    FGr.exports = iBs
});
var Bat = At((Qml, jGr) => {
    "use strict";
    var sBs = EM(),
        aBs = r((e, t, n) => sBs(e, t, n) <= 0, "lte");
    jGr.exports = aBs
});
var Lun = At((thl, BGr) => {
    "use strict";
    var cBs = Mun(),
        lBs = Nun(),
        uBs = SOe(),
        dBs = jat(),
        pBs = Fat(),
        fBs = Bat(),
        mBs = r((e, t, n, o) => {
            switch (t) {
                case "===":
                    return typeof e == "object" && (e = e.version), typeof n == "object" && (n = n.version), e === n;
                case "!==":
                    return typeof e == "object" && (e = e.version), typeof n == "object" && (n = n.version), e !== n;
                case "":
                case "=":
                case "==":
                    return cBs(e, n, o);
                case "!=":
                    return lBs(e, n, o);
                case ">":
                    return uBs(e, n, o);
                case ">=":
                    return dBs(e, n, o);
                case "<":
                    return pBs(e, n, o);
                case "<=":
                    return fBs(e, n, o);
                default:
                    throw new TypeError(`Invalid operator: ${t}`)
            }
        }, "cmp");
    BGr.exports = mBs
});
var zGr = At((rhl, UGr) => {
    "use strict";
    var hBs = T1(),
        gBs = hre(),
        {
            safeRe: Uat,
            t: zat
        } = U0e(),
        _Bs = r((e, t) => {
            if (e instanceof hBs) return e;
            if (typeof e == "number" && (e = String(e)), typeof e != "string") return null;
            t = t || {};
            let n = null;
            if (!t.rtl) n = e.match(t.includePrerelease ? Uat[zat.COERCEFULL] : Uat[zat.COERCE]);
            else {
                let f = t.includePrerelease ? Uat[zat.COERCERTLFULL] : Uat[zat.COERCERTL],
                    g;
                for (;
                    (g = f.exec(e)) && (!n || n.index + n[0].length !== e.length);)(!n || g.index + g[0].length !== n.index + n[0].length) && (n = g), f.lastIndex = g.index + g[1].length + g[2].length;
                f.lastIndex = -1
            }
            if (n === null) return null;
            let o = n[2],
                s = n[3] || "0",
                a = n[4] || "0",
                l = t.includePrerelease && n[5] ? `-${n[5]}` : "",
                u = t.includePrerelease && n[6] ? `+${n[6]}` : "";
            return gBs(`${o}.${s}.${a}${l}${u}`, t)
        }, "coerce");
    UGr.exports = _Bs
});
var qGr = At((ihl, $Gr) => {
    "use strict";
    var Fun = class {
        static {
            r(this, "LRUCache")
        }
        constructor() {
            this.max = 1e3, this.map = new Map
        }
        get(t) {
            let n = this.map.get(t);
            if (n !== void 0) return this.map.delete(t), this.map.set(t, n), n
        }
        delete(t) {
            return this.map.delete(t)
        }
        set(t, n) {
            if (!this.delete(t) && n !== void 0) {
                if (this.map.size >= this.max) {
                    let s = this.map.keys().next().value;
                    this.delete(s)
                }
                this.map.set(t, n)
            }
            return this
        }
    };
    $Gr.exports = Fun
});
var AM = At((ahl, GGr) => {
    "use strict";
    var yBs = /\s+/g,
        jun = class e {
            static {
                r(this, "Range")
            }
            constructor(t, n) {
                if (n = bBs(n), t instanceof e) return t.loose === !!n.loose && t.includePrerelease === !!n.includePrerelease ? t : new e(t.raw, n);
                if (t instanceof Bun) return this.raw = t.value, this.set = [
                    [t]
                ], this.formatted = void 0, this;
                if (this.options = n, this.loose = !!n.loose, this.includePrerelease = !!n.includePrerelease, this.raw = t.trim().replace(yBs, " "), this.set = this.raw.split("||").map(o => this.parseRange(o.trim())).filter(o => o.length), !this.set.length) throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
                if (this.set.length > 1) {
                    let o = this.set[0];
                    if (this.set = this.set.filter(s => !VGr(s[0])), this.set.length === 0) this.set = [o];
                    else if (this.set.length > 1) {
                        for (let s of this.set)
                            if (s.length === 1 && CBs(s[0])) {
                                this.set = [s];
                                break
                            }
                    }
                }
                this.formatted = void 0
            }
            get range() {
                if (this.formatted === void 0) {
                    this.formatted = "";
                    for (let t = 0; t < this.set.length; t++) {
                        t > 0 && (this.formatted += "||");
                        let n = this.set[t];
                        for (let o = 0; o < n.length; o++) o > 0 && (this.formatted += " "), this.formatted += n[o].toString().trim()
                    }
                }
                return this.formatted
            }
            format() {
                return this.range
            }
            toString() {
                return this.range
            }
            parseRange(t) {
                let o = ((this.options.includePrerelease && TBs) | (this.options.loose && IBs)) + ":" + t,
                    s = WGr.get(o);
                if (s) return s;
                let a = this.options.loose,
                    l = a ? CC[I1.HYPHENRANGELOOSE] : CC[I1.HYPHENRANGE];
                t = t.replace(l, FBs(this.options.includePrerelease)), D_("hyphen replace", t), t = t.replace(CC[I1.COMPARATORTRIM], wBs), D_("comparator trim", t), t = t.replace(CC[I1.TILDETRIM], kBs), D_("tilde trim", t), t = t.replace(CC[I1.CARETTRIM], xBs), D_("caret trim", t);
                let u = t.split(" ").map(b => EBs(b, this.options)).join(" ").split(/\s+/).map(b => LBs(b, this.options));
                a && (u = u.filter(b => (D_("loose invalid filter", b, this.options), !!b.match(CC[I1.COMPARATORLOOSE])))), D_("range list", u);
                let f = new Map,
                    g = u.map(b => new Bun(b, this.options));
                for (let b of g) {
                    if (VGr(b)) return [b];
                    f.set(b.value, b)
                }
                f.size > 1 && f.has("") && f.delete("");
                let _ = [...f.values()];
                return WGr.set(o, _), _
            }
            intersects(t, n) {
                if (!(t instanceof e)) throw new TypeError("a Range is required");
                return this.set.some(o => HGr(o, n) && t.set.some(s => HGr(s, n) && o.every(a => s.every(l => a.intersects(l, n)))))
            }
            test(t) {
                if (!t) return !1;
                if (typeof t == "string") try {
                    t = new SBs(t, this.options)
                } catch {
                    return !1
                }
                for (let n = 0; n < this.set.length; n++)
                    if (jBs(this.set[n], t, this.options)) return !0;
                return !1
            }
        };
    GGr.exports = jun;
    var vBs = qGr(),
        WGr = new vBs,
        bBs = Rat(),
        Bun = wOe(),
        D_ = bOe(),
        SBs = T1(),
        {
            safeRe: CC,
            t: I1,
            comparatorTrimReplace: wBs,
            tildeTrimReplace: kBs,
            caretTrimReplace: xBs
        } = U0e(),
        {
            FLAG_INCLUDE_PRERELEASE: TBs,
            FLAG_LOOSE: IBs
        } = vOe(),
        VGr = r(e => e.value === "<0.0.0-0", "isNullSet"),
        CBs = r(e => e.value === "", "isAny"),
        HGr = r((e, t) => {
            let n = !0,
                o = e.slice(),
                s = o.pop();
            for (; n && o.length;) n = o.every(a => s.intersects(a, t)), s = o.pop();
            return n
        }, "isSatisfiable"),
        EBs = r((e, t) => (e = e.replace(CC[I1.BUILD], ""), D_("comp", e, t), e = RBs(e, t), D_("caret", e), e = ABs(e, t), D_("tildes", e), e = OBs(e, t), D_("xrange", e), e = NBs(e, t), D_("stars", e), e), "parseComparator"),
        EC = r(e => !e || e.toLowerCase() === "x" || e === "*", "isX"),
        ABs = r((e, t) => e.trim().split(/\s+/).map(n => PBs(n, t)).join(" "), "replaceTildes"),
        PBs = r((e, t) => {
            let n = t.loose ? CC[I1.TILDELOOSE] : CC[I1.TILDE];
            return e.replace(n, (o, s, a, l, u) => {
                D_("tilde", e, o, s, a, l, u);
                let f;
                return EC(s) ? f = "" : EC(a) ? f = `>=${s}.0.0 <${+s+1}.0.0-0` : EC(l) ? f = `>=${s}.${a}.0 <${s}.${+a+1}.0-0` : u ? (D_("replaceTilde pr", u), f = `>=${s}.${a}.${l}-${u} <${s}.${+a+1}.0-0`) : f = `>=${s}.${a}.${l} <${s}.${+a+1}.0-0`, D_("tilde return", f), f
            })
        }, "replaceTilde"),
        RBs = r((e, t) => e.trim().split(/\s+/).map(n => DBs(n, t)).join(" "), "replaceCarets"),
        DBs = r((e, t) => {
            D_("caret", e, t);
            let n = t.loose ? CC[I1.CARETLOOSE] : CC[I1.CARET],
                o = t.includePrerelease ? "-0" : "";
            return e.replace(n, (s, a, l, u, f) => {
                D_("caret", e, s, a, l, u, f);
                let g;
                return EC(a) ? g = "" : EC(l) ? g = `>=${a}.0.0${o} <${+a+1}.0.0-0` : EC(u) ? a === "0" ? g = `>=${a}.${l}.0${o} <${a}.${+l+1}.0-0` : g = `>=${a}.${l}.0${o} <${+a+1}.0.0-0` : f ? (D_("replaceCaret pr", f), a === "0" ? l === "0" ? g = `>=${a}.${l}.${u}-${f} <${a}.${l}.${+u+1}-0` : g = `>=${a}.${l}.${u}-${f} <${a}.${+l+1}.0-0` : g = `>=${a}.${l}.${u}-${f} <${+a+1}.0.0-0`) : (D_("no pr"), a === "0" ? l === "0" ? g = `>=${a}.${l}.${u}${o} <${a}.${l}.${+u+1}-0` : g = `>=${a}.${l}.${u}${o} <${a}.${+l+1}.0-0` : g = `>=${a}.${l}.${u} <${+a+1}.0.0-0`), D_("caret return", g), g
            })
        }, "replaceCaret"),
        OBs = r((e, t) => (D_("replaceXRanges", e, t), e.split(/\s+/).map(n => MBs(n, t)).join(" ")), "replaceXRanges"),
        MBs = r((e, t) => {
            e = e.trim();
            let n = t.loose ? CC[I1.XRANGELOOSE] : CC[I1.XRANGE];
            return e.replace(n, (o, s, a, l, u, f) => {
                D_("xRange", e, o, s, a, l, u, f);
                let g = EC(a),
                    _ = g || EC(l),
                    b = _ || EC(u),
                    w = b;
                return s === "=" && w && (s = ""), f = t.includePrerelease ? "-0" : "", g ? s === ">" || s === "<" ? o = "<0.0.0-0" : o = "*" : s && w ? (_ && (l = 0), u = 0, s === ">" ? (s = ">=", _ ? (a = +a + 1, l = 0, u = 0) : (l = +l + 1, u = 0)) : s === "<=" && (s = "<", _ ? a = +a + 1 : l = +l + 1), s === "<" && (f = "-0"), o = `${s+a}.${l}.${u}${f}`) : _ ? o = `>=${a}.0.0${f} <${+a+1}.0.0-0` : b && (o = `>=${a}.${l}.0${f} <${a}.${+l+1}.0-0`), D_("xRange return", o), o
            })
        }, "replaceXRange"),
        NBs = r((e, t) => (D_("replaceStars", e, t), e.trim().replace(CC[I1.STAR], "")), "replaceStars"),
        LBs = r((e, t) => (D_("replaceGTE0", e, t), e.trim().replace(CC[t.includePrerelease ? I1.GTE0PRE : I1.GTE0], "")), "replaceGTE0"),
        FBs = r(e => (t, n, o, s, a, l, u, f, g, _, b, w) => (EC(o) ? n = "" : EC(s) ? n = `>=${o}.0.0${e?"-0":""}` : EC(a) ? n = `>=${o}.${s}.0${e?"-0":""}` : l ? n = `>=${n}` : n = `>=${n}${e?"-0":""}`, EC(g) ? f = "" : EC(_) ? f = `<${+g+1}.0.0-0` : EC(b) ? f = `<${g}.${+_+1}.0-0` : w ? f = `<=${g}.${_}.${b}-${w}` : e ? f = `<${g}.${_}.${+b+1}-0` : f = `<=${f}`, `${n} ${f}`.trim()), "hyphenReplace"),
        jBs = r((e, t, n) => {
            for (let o = 0; o < e.length; o++)
                if (!e[o].test(t)) return !1;
            if (t.prerelease.length && !n.includePrerelease) {
                for (let o = 0; o < e.length; o++)
                    if (D_(e[o].semver), e[o].semver !== Bun.ANY && e[o].semver.prerelease.length > 0) {
                        let s = e[o].semver;
                        if (s.major === t.major && s.minor === t.minor && s.patch === t.patch) return !0
                    } return !1
            }
            return !0
        }, "testSet")
});
var wOe = At((lhl, QGr) => {
    "use strict";
    var kOe = Symbol("SemVer ANY"),
        $un = class e {
            static {
                r(this, "Comparator")
            }
            static get ANY() {
                return kOe
            }
            constructor(t, n) {
                if (n = JGr(n), t instanceof e) {
                    if (t.loose === !!n.loose) return t;
                    t = t.value
                }
                t = t.trim().split(/\s+/).join(" "), zun("comparator", t, n), this.options = n, this.loose = !!n.loose, this.parse(t), this.semver === kOe ? this.value = "" : this.value = this.operator + this.semver.version, zun("comp", this)
            }
            parse(t) {
                let n = this.options.loose ? KGr[ZGr.COMPARATORLOOSE] : KGr[ZGr.COMPARATOR],
                    o = t.match(n);
                if (!o) throw new TypeError(`Invalid comparator: ${t}`);
                this.operator = o[1] !== void 0 ? o[1] : "", this.operator === "=" && (this.operator = ""), o[2] ? this.semver = new YGr(o[2], this.options.loose) : this.semver = kOe
            }
            toString() {
                return this.value
            }
            test(t) {
                if (zun("Comparator.test", t, this.options.loose), this.semver === kOe || t === kOe) return !0;
                if (typeof t == "string") try {
                    t = new YGr(t, this.options)
                } catch {
                    return !1
                }
                return Uun(t, this.operator, this.semver, this.options)
            }
            intersects(t, n) {
                if (!(t instanceof e)) throw new TypeError("a Comparator is required");
                return this.operator === "" ? this.value === "" ? !0 : new XGr(t.value, n).test(this.value) : t.operator === "" ? t.value === "" ? !0 : new XGr(this.value, n).test(t.semver) : (n = JGr(n), n.includePrerelease && (this.value === "<0.0.0-0" || t.value === "<0.0.0-0") || !n.includePrerelease && (this.value.startsWith("<0.0.0") || t.value.startsWith("<0.0.0")) ? !1 : !!(this.operator.startsWith(">") && t.operator.startsWith(">") || this.operator.startsWith("<") && t.operator.startsWith("<") || this.semver.version === t.semver.version && this.operator.includes("=") && t.operator.includes("=") || Uun(this.semver, "<", t.semver, n) && this.operator.startsWith(">") && t.operator.startsWith("<") || Uun(this.semver, ">", t.semver, n) && this.operator.startsWith("<") && t.operator.startsWith(">")))
            }
        };
    QGr.exports = $un;
    var JGr = Rat(),
        {
            safeRe: KGr,
            t: ZGr
        } = U0e(),
        Uun = Lun(),
        zun = bOe(),
        YGr = T1(),
        XGr = AM()
});
var xOe = At((dhl, eJr) => {
    "use strict";
    var BBs = AM(),
        UBs = r((e, t, n) => {
            try {
                t = new BBs(t, n)
            } catch {
                return !1
            }
            return t.test(e)
        }, "satisfies");
    eJr.exports = UBs
});
var nJr = At((fhl, tJr) => {
    "use strict";
    var zBs = AM(),
        $Bs = r((e, t) => new zBs(e, t).set.map(n => n.map(o => o.value).join(" ").trim().split(" ")), "toComparators");
    tJr.exports = $Bs
});
var oJr = At((hhl, rJr) => {
    "use strict";
    var qBs = T1(),
        WBs = AM(),
        VBs = r((e, t, n) => {
            let o = null,
                s = null,
                a = null;
            try {
                a = new WBs(t, n)
            } catch {
                return null
            }
            return e.forEach(l => {
                a.test(l) && (!o || s.compare(l) === -1) && (o = l, s = new qBs(o, n))
            }), o
        }, "maxSatisfying");
    rJr.exports = VBs
});
var sJr = At((_hl, iJr) => {
    "use strict";
    var HBs = T1(),
        GBs = AM(),
        JBs = r((e, t, n) => {
            let o = null,
                s = null,
                a = null;
            try {
                a = new GBs(t, n)
            } catch {
                return null
            }
            return e.forEach(l => {
                a.test(l) && (!o || s.compare(l) === 1) && (o = l, s = new HBs(o, n))
            }), o
        }, "minSatisfying");
    iJr.exports = JBs
});
var lJr = At((vhl, cJr) => {
    "use strict";
    var qun = T1(),
        KBs = AM(),
        aJr = SOe(),
        ZBs = r((e, t) => {
            e = new KBs(e, t);
            let n = new qun("0.0.0");
            if (e.test(n) || (n = new qun("0.0.0-0"), e.test(n))) return n;
            n = null;
            for (let o = 0; o < e.set.length; ++o) {
                let s = e.set[o],
                    a = null;
                s.forEach(l => {
                    let u = new qun(l.semver.version);
                    switch (l.operator) {
                        case ">":
                            u.prerelease.length === 0 ? u.patch++ : u.prerelease.push(0), u.raw = u.format();
                        case "":
                        case ">=":
                            (!a || aJr(u, a)) && (a = u);
                            break;
                        case "<":
                        case "<=":
                            break;
                        default:
                            throw new Error(`Unexpected operation: ${l.operator}`)
                    }
                }), a && (!n || aJr(n, a)) && (n = a)
            }
            return n && e.test(n) ? n : null
        }, "minVersion");
    cJr.exports = ZBs
});
var dJr = At((Shl, uJr) => {
    "use strict";
    var YBs = AM(),
        XBs = r((e, t) => {
            try {
                return new YBs(e, t).range || "*"
            } catch {
                return null
            }
        }, "validRange");
    uJr.exports = XBs
});
var $at = At((khl, hJr) => {
    "use strict";
    var QBs = T1(),
        mJr = wOe(),
        {
            ANY: e8s
        } = mJr,
        t8s = AM(),
        n8s = xOe(),
        pJr = SOe(),
        fJr = Fat(),
        r8s = Bat(),
        o8s = jat(),
        i8s = r((e, t, n, o) => {
            e = new QBs(e, o), t = new t8s(t, o);
            let s, a, l, u, f;
            switch (n) {
                case ">":
                    s = pJr, a = r8s, l = fJr, u = ">", f = ">=";
                    break;
                case "<":
                    s = fJr, a = o8s, l = pJr, u = "<", f = "<=";
                    break;
                default:
                    throw new TypeError('Must provide a hilo val of "<" or ">"')
            }
            if (n8s(e, t, o)) return !1;
            for (let g = 0; g < t.set.length; ++g) {
                let _ = t.set[g],
                    b = null,
                    w = null;
                if (_.forEach(T => {
                        T.semver === e8s && (T = new mJr(">=0.0.0")), b = b || T, w = w || T, s(T.semver, b.semver, o) ? b = T : l(T.semver, w.semver, o) && (w = T)
                    }), b.operator === u || b.operator === f || (!w.operator || w.operator === u) && a(e, w.semver)) return !1;
                if (w.operator === f && l(e, w.semver)) return !1
            }
            return !0
        }, "outside");
    hJr.exports = i8s
});
var _Jr = At((Thl, gJr) => {
    "use strict";
    var s8s = $at(),
        a8s = r((e, t, n) => s8s(e, t, ">", n), "gtr");
    gJr.exports = a8s
});
var vJr = At((Chl, yJr) => {
    "use strict";
    var c8s = $at(),
        l8s = r((e, t, n) => c8s(e, t, "<", n), "ltr");
    yJr.exports = l8s
});
var wJr = At((Ahl, SJr) => {
    "use strict";
    var bJr = AM(),
        u8s = r((e, t, n) => (e = new bJr(e, n), t = new bJr(t, n), e.intersects(t, n)), "intersects");
    SJr.exports = u8s
});
var xJr = At((Rhl, kJr) => {
    "use strict";
    var d8s = xOe(),
        p8s = EM();
    kJr.exports = (e, t, n) => {
        let o = [],
            s = null,
            a = null,
            l = e.sort((_, b) => p8s(_, b, n));
        for (let _ of l) d8s(_, t, n) ? (a = _, s || (s = _)) : (a && o.push([s, a]), a = null, s = null);
        s && o.push([s, null]);
        let u = [];
        for (let [_, b] of o) _ === b ? u.push(_) : !b && _ === l[0] ? u.push("*") : b ? _ === l[0] ? u.push(`<=${b}`) : u.push(`${_} - ${b}`) : u.push(`>=${_}`);
        let f = u.join(" || "),
            g = typeof t.raw == "string" ? t.raw : String(t);
        return f.length < g.length ? f : t
    }
});
var PJr = At((Dhl, AJr) => {
    "use strict";
    var TJr = AM(),
        Vun = wOe(),
        {
            ANY: Wun
        } = Vun,
        TOe = xOe(),
        Hun = EM(),
        f8s = r((e, t, n = {}) => {
            if (e === t) return !0;
            e = new TJr(e, n), t = new TJr(t, n);
            let o = !1;
            e: for (let s of e.set) {
                for (let a of t.set) {
                    let l = h8s(s, a, n);
                    if (o = o || l !== null, l) continue e
                }
                if (o) return !1
            }
            return !0
        }, "subset"),
        m8s = [new Vun(">=0.0.0-0")],
        IJr = [new Vun(">=0.0.0")],
        h8s = r((e, t, n) => {
            if (e === t) return !0;
            if (e.length === 1 && e[0].semver === Wun) {
                if (t.length === 1 && t[0].semver === Wun) return !0;
                n.includePrerelease ? e = m8s : e = IJr
            }
            if (t.length === 1 && t[0].semver === Wun) {
                if (n.includePrerelease) return !0;
                t = IJr
            }
            let o = new Set,
                s, a;
            for (let T of e) T.operator === ">" || T.operator === ">=" ? s = CJr(s, T, n) : T.operator === "<" || T.operator === "<=" ? a = EJr(a, T, n) : o.add(T.semver);
            if (o.size > 1) return null;
            let l;
            if (s && a) {
                if (l = Hun(s.semver, a.semver, n), l > 0) return null;
                if (l === 0 && (s.operator !== ">=" || a.operator !== "<=")) return null
            }
            for (let T of o) {
                if (s && !TOe(T, String(s), n) || a && !TOe(T, String(a), n)) return null;
                for (let I of t)
                    if (!TOe(T, String(I), n)) return !1;
                return !0
            }
            let u, f, g, _, b = a && !n.includePrerelease && a.semver.prerelease.length ? a.semver : !1,
                w = s && !n.includePrerelease && s.semver.prerelease.length ? s.semver : !1;
            b && b.prerelease.length === 1 && a.operator === "<" && b.prerelease[0] === 0 && (b = !1);
            for (let T of t) {
                if (_ = _ || T.operator === ">" || T.operator === ">=", g = g || T.operator === "<" || T.operator === "<=", s) {
                    if (w && T.semver.prerelease && T.semver.prerelease.length && T.semver.major === w.major && T.semver.minor === w.minor && T.semver.patch === w.patch && (w = !1), T.operator === ">" || T.operator === ">=") {
                        if (u = CJr(s, T, n), u === T && u !== s) return !1
                    } else if (s.operator === ">=" && !TOe(s.semver, String(T), n)) return !1
                }
                if (a) {
                    if (b && T.semver.prerelease && T.semver.prerelease.length && T.semver.major === b.major && T.semver.minor === b.minor && T.semver.patch === b.patch && (b = !1), T.operator === "<" || T.operator === "<=") {
                        if (f = EJr(a, T, n), f === T && f !== a) return !1
                    } else if (a.operator === "<=" && !TOe(a.semver, String(T), n)) return !1
                }
                if (!T.operator && (a || s) && l !== 0) return !1
            }
            return !(s && g && !a && l !== 0 || a && _ && !s && l !== 0 || w || b)
        }, "simpleSubset"),
        CJr = r((e, t, n) => {
            if (!e) return t;
            let o = Hun(e.semver, t.semver, n);
            return o > 0 ? e : o < 0 || t.operator === ">" && e.operator === ">=" ? t : e
        }, "higherGT"),
        EJr = r((e, t, n) => {
            if (!e) return t;
            let o = Hun(e.semver, t.semver, n);
            return o < 0 ? e : o > 0 || t.operator === "<" && e.operator === "<=" ? t : e
        }, "lowerLT");
    AJr.exports = f8s
});
var MJr = At((Mhl, OJr) => {
    "use strict";
    var Gun = U0e(),
        RJr = vOe(),
        g8s = T1(),
        DJr = Run(),
        _8s = hre(),
        y8s = oGr(),
        v8s = sGr(),
        b8s = lGr(),
        S8s = pGr(),
        w8s = mGr(),
        k8s = gGr(),
        x8s = yGr(),
        T8s = bGr(),
        I8s = EM(),
        C8s = xGr(),
        E8s = IGr(),
        A8s = Lat(),
        P8s = PGr(),
        R8s = DGr(),
        D8s = SOe(),
        O8s = Fat(),
        M8s = Mun(),
        N8s = Nun(),
        L8s = jat(),
        F8s = Bat(),
        j8s = Lun(),
        B8s = zGr(),
        U8s = wOe(),
        z8s = AM(),
        $8s = xOe(),
        q8s = nJr(),
        W8s = oJr(),
        V8s = sJr(),
        H8s = lJr(),
        G8s = dJr(),
        J8s = $at(),
        K8s = _Jr(),
        Z8s = vJr(),
        Y8s = wJr(),
        X8s = xJr(),
        Q8s = PJr();
    OJr.exports = {
        parse: _8s,
        valid: y8s,
        clean: v8s,
        inc: b8s,
        diff: S8s,
        major: w8s,
        minor: k8s,
        patch: x8s,
        prerelease: T8s,
        compare: I8s,
        rcompare: C8s,
        compareLoose: E8s,
        compareBuild: A8s,
        sort: P8s,
        rsort: R8s,
        gt: D8s,
        lt: O8s,
        eq: M8s,
        neq: N8s,
        gte: L8s,
        lte: F8s,
        cmp: j8s,
        coerce: B8s,
        Comparator: U8s,
        Range: z8s,
        satisfies: $8s,
        toComparators: q8s,
        maxSatisfying: W8s,
        minSatisfying: V8s,
        minVersion: H8s,
        validRange: G8s,
        outside: J8s,
        gtr: K8s,
        ltr: Z8s,
        intersects: Y8s,
        simplifyRange: X8s,
        subset: Q8s,
        SemVer: g8s,
        re: Gun.re,
        src: Gun.src,
        tokens: Gun.t,
        SEMVER_SPEC_VERSION: RJr.SEMVER_SPEC_VERSION,
        RELEASE_TYPES: RJr.RELEASE_TYPES,
        compareIdentifiers: DJr.compareIdentifiers,
        rcompareIdentifiers: DJr.rcompareIdentifiers
    }
});

function NJr(e) {
    let {
        installed: t,
        latest: n
    } = e;
    if (!t || !n) return "none";
    let o = z0e.default.valid(z0e.default.coerce(t) ?? t),
        s = z0e.default.valid(z0e.default.coerce(n) ?? n);
    return o && s ? z0e.default.gt(s, o) ? "update-available" : "none" : t === n ? "none" : "version-changed"
}

function Jun(e) {
    let {
        installedVersion: t,
        installedSha: n,
        latestVersion: o,
        latestSha: s
    } = e;
    return o ? NJr({
        installed: t,
        latest: o
    }) : s ? n ? n === s ? "none" : "update-available" : "version-changed" : "none"
}
var z0e, LJr = Y(() => {
    "use strict";
    z0e = Ii(MJr(), 1);
    r(NJr, "comparePluginVersions");
    r(Jun, "comparePluginUpdate")
});

function l5s(e) {
    return new Kun(e)
}

function qat(e, t) {
    return l5s({
        storageRoot: e.storageRoot
    }).discoverPluginsSync(e, t)
}

function u5s(e, t, n, o, s, a) {
    let l = yOe(e.manifest.author),
        u = typeof e.manifest.homepage == "string" && e.manifest.homepage.trim().length > 0 ? e.manifest.homepage : void 0;
    return {
        ...l?.name ? {
            author: l.name
        } : {},
        ...l?.url ? {
            authorUrl: l.url
        } : {},
        ...u ? {
            homepage: u
        } : {},
        commandRootCount: t.commandRoots.length,
        components: eat(e.rootPath, e.manifest, {
            loaded: e
        }),
        configuredOptions: a,
        dataPath: n,
        declaredMcpServerNames: s,
        description: e.manifest.description,
        enabled: o,
        id: e.id,
        manifestPath: e.manifestPath,
        marketplace: e.marketplace,
        mcpServerNames: Object.keys(t.mcpServers),
        name: e.manifest.name,
        hookDetails: t.hookDetails,
        rootPath: e.rootPath,
        skillCount: t.skillCount,
        skillRootCount: t.skillRoots.length,
        source: e.source,
        userConfig: e.manifest.userConfig,
        version: e.manifest.version
    }
}

function d5s(e) {
    (0, MF.mkdirSync)(e.dataPath, {
        recursive: !0
    });
    let t = m5s(e, e.priority);
    return {
        commandRoots: g5s(e, e.priority + 1),
        hooks: e.hookEvents,
        hookDetails: e.hookDetails,
        mcpServers: Yst({
            ...e,
            definitions: e.mcpServerDefinitions
        }),
        skillCount: w5s(t),
        skillRoots: t
    }
}

function p5s(e) {
    return !0
}

function f5s(e, t) {
    for (let n of a5s) n in e.manifest && t.push({
        code: "plugin_unsupported_component",
        message: `Plugin component is diagnostic-only in this ZCode runtime: ${n}`,
        path: e.manifestPath,
        pluginId: e.id,
        severity: "warning"
    })
}

function m5s(e, t) {
    return h5s(e), BJr("skills", e, t)
}

function h5s(e) {
    let t = Eln(e.loaded.manifest.skills);
    if (t.length === 0) return;
    let n = new Set;
    for (let o of t) {
        let s = Yx(e.loaded.rootPath, o);
        if (!s || n.has(s)) continue;
        if (n.add(s), oVr(s)) {
            e.diagnostics.push({
                code: "plugin_skill_root_empty",
                message: `Plugin skills path does not exist: ${o}`,
                path: s,
                pluginId: e.loaded.id,
                severity: "warning"
            });
            continue
        }
        let a;
        try {
            a = rOe(s, {
                followSymbolicLinks: !1
            })
        } catch {
            continue
        }
        a.length > 0 || e.diagnostics.push({
            code: "plugin_skill_root_empty",
            message: `Plugin skills path does not contain any skills: ${o}`,
            path: s,
            pluginId: e.loaded.id,
            severity: "warning"
        })
    }
}

function g5s(e, t) {
    let n = BJr("commands", e, t, Zun(e.loaded, e.dataPath)),
        o = k5s(e, t + 1);
    return o && n.push(o), n
}

function _5s(e) {
    let t = jJr();
    for (let n of Rln({
            diagnostics: e.diagnostics,
            loaded: e.loaded
        })) {
        let o = y5s({
            diagnostics: e.diagnostics,
            loaded: e.loaded,
            pluginDataPath: e.dataPath,
            rawHooks: n.rawHooks,
            runnable: e.runnable,
            sourcePath: n.sourcePath,
            wrapper: n.wrapper
        });
        S5s(t, o)
    }
    return t
}

function y5s(e) {
    let t = e.wrapper ? fu(e.rawHooks) ? e.rawHooks.hooks : void 0 : e.rawHooks,
        n = jJr();
    if (!fu(t)) return e.diagnostics.push({
        code: "plugin_hook_invalid",
        message: e.wrapper ? "Plugin hooks file must contain a hooks object" : "Plugin manifest hooks entry must be an object, a path, or an array",
        path: e.sourcePath,
        pluginId: e.loaded.id,
        severity: "error"
    }), n;
    let o = Zun(e.loaded, e.pluginDataPath, e.sourcePath);
    for (let [s, a] of Object.entries(t)) {
        if (!c5s.has(s)) {
            e.diagnostics.push({
                code: "plugin_hook_unsupported_event",
                message: `Plugin hook event is not supported by this ZCode runtime: ${s}`,
                path: e.sourcePath,
                pluginId: e.loaded.id,
                severity: "warning"
            });
            continue
        }
        if (!Array.isArray(a)) {
            e.diagnostics.push({
                code: "plugin_hook_invalid",
                message: `Plugin hook event must be an array: ${s}`,
                path: e.sourcePath,
                pluginId: e.loaded.id,
                severity: "error"
            });
            continue
        }
        let l = s;
        for (let u of a) {
            let f = Nz.safeParse(u);
            if (!f.success) {
                e.diagnostics.push({
                    code: "plugin_hook_invalid",
                    message: `Invalid plugin hook matcher for ${s}: ${f.error.issues.map(_=>`${_.path.join(".")}: ${_.message}`).join("; ")}`,
                    path: e.sourcePath,
                    pluginId: e.loaded.id,
                    severity: "error"
                });
                continue
            }
            let g = {
                ...f.data,
                hooks: f.data.hooks.map(_ => b5s(_, o))
            };
            (n.events[l] ??= []).push(g);
            for (let _ of f.data.hooks) n.details.push(v5s({
                event: l,
                hook: _,
                ...f.data.matcher !== void 0 ? {
                    matcher: f.data.matcher
                } : {},
                runnable: e.runnable,
                sourcePath: e.sourcePath
            }))
        }
    }
    return n
}

function v5s(e) {
    let t = {
        command: e.hook.command,
        event: e.event,
        runnable: e.runnable,
        sourcePath: e.sourcePath,
        type: e.hook.type
    };
    return e.matcher !== void 0 && (t.matcher = e.matcher), e.hook.statusMessage !== void 0 && (t.statusMessage = e.hook.statusMessage), e.hook.timeoutMs !== void 0 && (t.timeoutMs = e.hook.timeoutMs), e.hook.type === "process" ? (e.hook.args !== void 0 && (t.args = e.hook.args), t) : (e.hook.async !== void 0 && (t.async = e.hook.async), e.hook.shell !== void 0 && (t.shell = e.hook.shell), e.hook.timeout !== void 0 && (t.timeout = e.hook.timeout), t)
}

function Zun(e, t, n) {
    return {
        dataPath: t,
        id: e.id,
        name: e.manifest.name,
        rootPath: e.rootPath,
        ...n ? {
            sourcePath: n
        } : {}
    }
}

function b5s(e, t) {
    return {
        ...e,
        plugin: t
    }
}

function FJr(e, t) {
    for (let [n, o] of Object.entries(t)) o.length > 0 && (e[n] ??= []).push(...o)
}

function S5s(e, t) {
    FJr(e.events, t.events), e.details.push(...t.details)
}

function jJr() {
    return {
        details: [],
        events: {}
    }
}

function w5s(e) {
    let t = new Set;
    for (let n of e) try {
        for (let o of rOe(n.path, {
                followSymbolicLinks: n.source !== "plugin"
            })) t.add(o)
    } catch {}
    return t.size
}

function BJr(e, t, n, o) {
    let s = Eln(t.loaded.manifest[e]),
        a = (0, Fk.join)(t.loaded.rootPath, e);
    $v(a) && s.unshift(e);
    let l = [],
        u = new Set;
    for (let f of s) {
        let g = Yx(t.loaded.rootPath, f);
        if (!g) {
            t.diagnostics.push({
                code: "plugin_component_path_invalid",
                message: `Plugin ${e} path escapes plugin root: ${f}`,
                path: t.loaded.manifestPath,
                pluginId: t.loaded.id,
                severity: "error"
            });
            continue
        }
        u.has(g) || (u.add(g), l.push({
            path: g,
            ...o ? {
                plugin: o
            } : {},
            ...e === "skills" ? {
                pluginId: t.loaded.id
            } : {},
            priority: n,
            scope: t.loaded.source === "official" ? "system" : "user",
            source: "plugin"
        }))
    }
    return l
}

function k5s(e, t) {
    let n = e.loaded.manifest.commands;
    if (!fu(n)) return null;
    let o = (0, Fk.join)(e.dataPath, "generated-commands"),
        s = !1;
    (0, MF.mkdirSync)(o, {
        recursive: !0
    });
    for (let [a, l] of Object.entries(n)) {
        if (!fu(l)) {
            e.diagnostics.push({
                code: "plugin_manifest_invalid",
                message: `Plugin command metadata must be an object: ${a}`,
                path: e.loaded.manifestPath,
                pluginId: e.loaded.id,
                severity: "error"
            });
            continue
        }
        let u = x5s(a);
        if (!u) {
            e.diagnostics.push({
                code: "plugin_manifest_invalid",
                message: `Invalid plugin command name: ${a}`,
                path: e.loaded.manifestPath,
                pluginId: e.loaded.id,
                severity: "error"
            });
            continue
        }
        let f = typeof l.source == "string" ? l.source : void 0,
            g = typeof l.content == "string" ? l.content : void 0;
        if (f && g || !f && !g) {
            e.diagnostics.push({
                code: "plugin_manifest_invalid",
                message: `Plugin command '${a}' must provide exactly one of source or content`,
                path: e.loaded.manifestPath,
                pluginId: e.loaded.id,
                severity: "error"
            });
            continue
        }
        let _ = g;
        if (f) {
            let b = Yx(e.loaded.rootPath, T5s(f));
            if (!b) {
                e.diagnostics.push({
                    code: "plugin_component_path_invalid",
                    message: `Plugin command source escapes plugin root: ${f}`,
                    path: e.loaded.manifestPath,
                    pluginId: e.loaded.id,
                    severity: "error"
                });
                continue
            }
            if (!vw(b)) {
                e.diagnostics.push({
                    code: "plugin_component_path_invalid",
                    message: `Plugin command source file not found: ${f}`,
                    path: b,
                    pluginId: e.loaded.id,
                    severity: "error"
                });
                continue
            }
            _ = (0, MF.readFileSync)(b, "utf8")
        }
        _ !== void 0 && ((0, MF.writeFileSync)((0, Fk.join)(o, `${u}.md`), I5s(_, l), "utf8"), s = !0)
    }
    return s ? {
        path: o,
        plugin: Zun(e.loaded, e.dataPath),
        priority: t,
        scope: e.loaded.source === "official" ? "system" : "user",
        source: "plugin"
    } : null
}

function x5s(e) {
    let t = e.trim().replace(/^\/+/, "").toLowerCase();
    return /^[a-z0-9][a-z0-9_:-]{0,63}$/.test(t) ? t : null
}

function T5s(e) {
    return e.replace(/^\.\//, "")
}

function I5s(e, t) {
    let n = new Map;
    if (typeof t.description == "string" && t.description.trim() && n.set("description", t.description.trim()), typeof t.argumentHint == "string" && t.argumentHint.trim() && n.set("argument-hint", t.argumentHint.trim()), typeof t.model == "string" && t.model.trim() && n.set("model", t.model.trim()), Array.isArray(t.allowedTools)) {
        let s = t.allowedTools.filter(a => typeof a == "string" && a.trim().length > 0).map(a => a.trim());
        s.length > 0 && n.set("allowed-tools", s.join(", "))
    }
    if (n.size === 0) return e;
    let o = C5s(e).trimStart();
    return `---
${Array.from(n,([s,a])=>`${s}: ${a}`).join(`
`)}
---

${o}`
}

function C5s(e) {
    let t = e.replace(/^\uFEFF/, "");
    if (!t.startsWith("---")) return e;
    let n = t.split(/\r?\n/);
    if (n[0]?.trim() !== "---") return e;
    let o = n.findIndex((s, a) => a > 0 && s.trim() === "---");
    return o > 0 ? n.slice(o + 1).join(`
`) : e
}

function E5s(e, t, n) {
    let o = TVr(e);
    if (o !== void 0) {
        for (let a of o) Kst(n);
        return o
    }
    let s = (0, Fk.join)(e, "cache", Yp);
    try {
        let a = [];
        for (let l of (0, MF.readdirSync)(s, {
                withFileTypes: !0
            })) {
            if (Kst(n), !l.isDirectory()) continue;
            let u = (0, Fk.join)(s, l.name);
            for (let f of (0, MF.readdirSync)(u, {
                    withFileTypes: !0
                })) f.isDirectory() && a.push((0, Fk.join)(u, f.name))
        }
        return a
    } catch (a) {
        return Jst(a) ? [] : (t.push({
            code: "plugin_root_not_found",
            message: a instanceof Error ? a.message : `Failed to scan ${s}`,
            path: s,
            severity: "warning"
        }), [])
    }
}

function A5s(e, t) {
    if (!$v(e.rootPath)) return t.push({
        code: "plugin_root_not_found",
        message: `Plugin root does not exist: ${e.rootPath}`,
        path: e.rootPath,
        severity: "warning"
    }), null;
    let n = P5s(e.rootPath);
    if (!n) return t.push({
        code: "plugin_manifest_not_found",
        message: `Plugin manifest not found: ${e.rootPath}`,
        path: e.rootPath,
        severity: "error"
    }), null;
    let o = R5s(n, t);
    return o ? {
        id: `${o.name}@${e.marketplace}`,
        manifest: o,
        manifestPath: n,
        marketplace: e.marketplace,
        rootPath: e.rootPath,
        source: e.source
    } : null
}

function P5s(e) {
    let t = (0, Fk.join)(e, e5s);
    if (vw(t)) return t;
    let n = (0, Fk.join)(e, t5s);
    if (vw(n)) return n;
    let o = (0, Fk.join)(e, n5s);
    return vw(o) ? o : null
}

function R5s(e, t) {
    try {
        let n = JSON.parse((0, MF.readFileSync)(e, "utf8"));
        if (!fu(n)) throw new Error("Manifest must be a JSON object");
        let o = typeof n.name == "string" ? n.name.trim() : "";
        if (!s5s.test(o)) throw new Error(`Invalid plugin name: ${o}`);
        return {
            ...n,
            name: o,
            version: typeof n.version == "string" ? n.version : r5s
        }
    } catch (n) {
        return t.push({
            code: "plugin_manifest_invalid",
            message: n instanceof Error ? n.message : `Invalid plugin manifest: ${e}`,
            path: e,
            severity: "error"
        }), null
    }
}

function D5s() {
    return {
        commandRoots: [],
        diagnostics: [],
        hooks: {},
        mcpServers: {},
        plugins: [],
        skillRoots: []
    }
}

function O5s(e = []) {
    return {
        commandRoots: [],
        hooks: {},
        hookDetails: e,
        mcpServers: {},
        skillCount: 0,
        skillRoots: []
    }
}

function M5s(e, t, n) {
    return e.enabledPlugins[t] ?? n
}
var MF, Fk, e5s, t5s, n5s, r5s, o5s, i5s, s5s, a5s, c5s, Kun, IOe = Y(() => {
    "use strict";
    MF = require("node:fs"), Fk = require("node:path");
    ar();
    L7();
    Wst();
    Xst();
    Dln();
    Mln();
    Eun();
    tat();
    Eun();
    tat();
    sun();
    LJr();
    e5s = (0, Fk.join)(".zcode-plugin", "plugin.json"), t5s = (0, Fk.join)(".claude-plugin", "plugin.json"), n5s = (0, Fk.join)(".codex-plugin", "plugin.json"), r5s = "0.0.0", o5s = 1e3, i5s = 10, s5s = /^[a-z0-9][a-z0-9._-]{0,127}$/, a5s = ["channels", "lspServers", "outputStyles", "settings"], c5s = new Set(Object.values(xl)), Kun = class {
        static {
            r(this, "NodePluginAdapter")
        }
        options;
        constructor(t) {
            this.options = t
        }
        async discoverPlugins(t, n) {
            return this.discoverPluginsSync(t, n)
        }
        discoverPluginsSync(t, n) {
            if (!t.config.enabled) return D5s();
            let o = [],
                s = (0, Fk.join)(t.storageRoot || this.options.storageRoot, "data"),
                a = this.resolveCandidates(t, o, n),
                l = [],
                u = {},
                f = {},
                g = [],
                _ = new Set,
                b = [],
                w = o5s;
            for (let T of a) {
                Kst(n);
                let I = A5s(T, o);
                if (!I || I.source === "official" && t.config.suppressedBuiltins.includes(I.id)) continue;
                if (_.has(I.id)) {
                    o.push({
                        code: "plugin_duplicate_id",
                        message: `Duplicate plugin ignored: ${I.id}`,
                        path: I.rootPath,
                        pluginId: I.id,
                        severity: "warning"
                    });
                    continue
                }
                _.add(I.id), f5s(I, o);
                let A = T.defaultEnabled || (t.officialPluginsEnabledByDefault?.has(I.id) ?? !1),
                    R = M5s(t.config, I.id, A),
                    L = (0, Fk.join)(s, N7(I.id)),
                    U = ore({
                        diagnostics: o,
                        loaded: I
                    }),
                    j = p5s(I),
                    z = _5s({
                        dataPath: L,
                        diagnostics: o,
                        loaded: I,
                        runnable: j
                    }),
                    $ = R ? d5s({
                        dataPath: L,
                        diagnostics: o,
                        env: t.env ?? {},
                        hookEvents: j ? z.events : {},
                        hookDetails: z.details,
                        loaded: I,
                        mcpServerDefinitions: U,
                        options: t.config.options[I.id] ?? {},
                        priority: w,
                        workingDirectory: t.workingDirectory
                    }) : O5s(z.details);
                w += i5s, Object.assign(f, $.mcpServers), FJr(u, $.hooks), b.push(...$.skillRoots), l.push(...$.commandRoots), g.push(u5s(I, $, L, R, Object.keys(U), t.config.options[I.id] ?? {}))
            }
            return {
                commandRoots: l,
                diagnostics: o,
                hooks: u,
                mcpServers: f,
                plugins: g,
                skillRoots: b
            }
        }
        resolveCandidates(t, n, o) {
            let s = [];
            for (let a of t.config.dirs) s.push({
                defaultEnabled: !0,
                marketplace: wKn,
                rootPath: (0, Fk.resolve)(a),
                source: "inline"
            });
            for (let a of t.officialPluginRoots ?? []) s.push({
                defaultEnabled: !1,
                marketplace: Yp,
                rootPath: (0, Fk.resolve)(a),
                source: "official"
            });
            s.push(...E5s(t.storageRoot, n, o).map(a => ({
                defaultEnabled: !1,
                marketplace: Yp,
                rootPath: a,
                source: "official"
            })));
            for (let a of V7(t.storageRoot)) s.push({
                defaultEnabled: !1,
                marketplace: a.marketplace,
                rootPath: yun(t.storageRoot, a),
                source: "cache"
            });
            return s
        }
    };
    r(l5s, "createNodePluginAdapter");
    r(qat, "discoverNodePluginsSync");
    r(u5s, "createPluginMetadata");
    r(d5s, "resolveEnabledComponents");
    r(p5s, "canRunPluginHooks");
    r(f5s, "warnUnsupportedComponents");
    r(m5s, "resolveSkillRoots");
    r(h5s, "warnEmptyDeclaredSkillRoots");
    r(g5s, "resolveCommandRoots");
    r(_5s, "inspectPluginHooks");
    r(y5s, "parsePluginHookEvents");
    r(v5s, "toPluginHookDetail");
    r(Zun, "createHookPluginContext");
    r(b5s, "attachPluginToHook");
    r(FJr, "mergeHookEvents");
    r(S5s, "mergeHookInspection");
    r(jJr, "emptyHookInspection");
    r(w5s, "countSkillFiles");
    r(BJr, "resolveComponentRoots");
    r(k5s, "materializeCommandMetadataRoot");
    r(x5s, "normalizeGeneratedCommandName");
    r(T5s, "trimRelativePrefix");
    r(I5s, "applyCommandMetadataFrontmatter");
    r(C5s, "stripMarkdownFrontmatter");
    r(E5s, "scanOfficialCache");
    r(A5s, "loadPlugin");
    r(P5s, "findManifest");
    r(R5s, "readManifest");
    r(D5s, "emptyOutcome");
    r(O5s, "emptyComponents");
    r(M5s, "resolveEnabled")
});

function zJr(e) {
    let t = e.appId ?? F5s,
        n = e.appSecret?.trim() ?? "",
        o = e.authorizeUrl ?? Rpe(process.env, N5s),
        s = e.tokenUrl ?? Rpe(process.env, L5s);
    return {
        buildAuthorizeUrl(a) {
            let l = new URLSearchParams({
                appId: t,
                redirect: a.redirectUri,
                state: a.state
            });
            return `${o}?${l.toString()}`
        },
        async exchangeCode(a, l) {
            if (!n) throw new Wat("BigModel OAuth appSecret is required.");
            let u = await e.httpClient.request({
                    body: new TextEncoder().encode(JSON.stringify({
                        appId: t,
                        appSecret: n,
                        authCode: a.code
                    })),
                    headers: {
                        "Content-Type": B5s
                    },
                    maxResponseBytes: 64 * 1024,
                    method: "POST",
                    trace: e.trace,
                    url: s
                }, l),
                f = JSON.parse(new TextDecoder().decode(u.body)),
                g = f.data?.accessToken?.trim() ?? "";
            if (!g) throw new Wat(f.msg ?? "BigModel token response is missing accessToken.");
            return {
                accessToken: g,
                ...f.data?.refreshToken ? {
                    refreshToken: f.data.refreshToken
                } : {}
            }
        }
    }
}

function $Jr() {
    return (0, UJr.randomBytes)(j5s).toString("hex")
}
var UJr, N5s, L5s, F5s, j5s, B5s, Wat, qJr = Y(() => {
    "use strict";
    UJr = require("node:crypto");
    gs();
    N5s = "/login", L5s = "/api/auth/tokenByAuthCode", F5s = "zcode", j5s = 32, B5s = "application/json", Wat = class extends Error {
        static {
            r(this, "BigmodelOAuthError")
        }
        constructor(t, n = {}) {
            super(t, n), this.name = "BigmodelOAuthError"
        }
    };
    r(zJr, "createBigmodelOAuthClient");
    r($Jr, "createBigmodelOAuthState")
});
async function Yun(e, t = {}) {
    let n = t.platform ?? process.platform,
        o = z5s(n, e),
        s = t.spawnProcess ?? WJr.spawn;
    try {
        let a = s(o.executable, o.args, {
            detached: !0,
            stdio: "ignore",
            windowsHide: !0
        });
        return await $5s(a, o.executable, t.timeoutMs)
    } catch (a) {
        return {
            command: o.executable,
            opened: !1,
            reason: a instanceof Error ? a.message : String(a)
        }
    }
}

function z5s(e, t) {
    return e === "darwin" ? {
        executable: "open",
        args: [t]
    } : e === "win32" ? {
        executable: "cmd.exe",
        args: ["/c", "start", "", t]
    } : {
        executable: "xdg-open",
        args: [t]
    }
}

function $5s(e, t, n = U5s) {
    return new Promise(o => {
        let s = !1,
            a, l = r(u => {
                s || (s = !0, clearTimeout(a), e.removeAllListeners("error"), e.removeAllListeners("spawn"), u.opened && e.unref(), o(u))
            }, "settle");
        a = setTimeout(() => {
            l({
                command: t,
                opened: !0
            })
        }, n), e.once("spawn", () => {
            l({
                command: t,
                opened: !0
            })
        }), e.once("error", u => {
            l({
                command: t,
                opened: !1,
                reason: u.message
            })
        })
    })
}
var WJr, U5s, VJr = Y(() => {
    "use strict";
    WJr = require("node:child_process"), U5s = 1e3;
    r(Yun, "openUrlInBrowser");
    r(z5s, "browserOpenCommand");
    r($5s, "waitForBrowserSpawn")
});

function ZJr(e) {
    return {
        async resolve(t, n) {
            let o = t.accessToken.trim();
            if (!o) throw new lG("OAuth access token is required.");
            if (t.family === "bigmodel") return GJr({
                authorization: o,
                host: NAe(process.env),
                httpClient: e.httpClient,
                trace: e.trace
            }, n);
            let s = await V5s(e, o, n);
            return GJr({
                authorization: `Bearer ${s}`,
                host: JJr,
                httpClient: e.httpClient,
                requireSecretKey: !0,
                trace: e.trace
            }, n)
        }
    }
}
async function V5s(e, t, n) {
    let o = await COe(e.httpClient, {
            body: new TextEncoder().encode(JSON.stringify({
                token: t
            })),
            headers: {
                "Content-Type": KJr
            },
            method: "POST",
            trace: e.trace,
            url: `${JJr}/api/auth/z/login`
        }, n),
        s = o?.access_token?.trim() ?? o?.accessToken?.trim() ?? "";
    if (!s) throw new lG("Z.AI biz token response is missing access_token.");
    return s
}
async function GJr(e, t) {
    let n = await COe(e.httpClient, {
            headers: Vat(e.authorization),
            method: "GET",
            trace: e.trace,
            url: `${e.host}/api/biz/customer/getCustomerInfo`
        }, t),
        o = H5s(n);
    if (!o) throw new lG("Unable to resolve organization and project.");
    let s = `${e.host}/api/biz/v1/organization/${o.organizationId}/projects/${o.projectId}/api_keys`,
        u = ((await COe(e.httpClient, {
            headers: Vat(e.authorization),
            method: "GET",
            trace: e.trace,
            url: s
        }, t) ?? []).find(_ => _.name === HJr) ?? await COe(e.httpClient, {
            body: new TextEncoder().encode(JSON.stringify({
                name: HJr
            })),
            headers: Vat(e.authorization),
            method: "POST",
            trace: e.trace,
            url: s
        }, t))?.apiKey?.trim() ?? "";
    if (!u) throw new lG("API key response is missing apiKey.");
    let g = (await COe(e.httpClient, {
        headers: Vat(e.authorization),
        method: "GET",
        trace: e.trace,
        url: `${s}/copy/${encodeURIComponent(u)}`
    }, t))?.secretKey?.trim() ?? "";
    if (!g) {
        if (e.requireSecretKey) throw new lG("API key copy response is missing secretKey.");
        return u
    }
    return `${u}.${g}`
}
async function COe(e, t, n) {
    let o = await e.request({
            maxResponseBytes: 65536,
            ...t
        }, n),
        s = JSON.parse(new TextDecoder().decode(o.body));
    if (!G5s(s.code)) throw new lG(s.msg ?? `Remote business error ${s.code}`);
    return s.data ?? null
}

function Vat(e) {
    return {
        Authorization: e,
        "Content-Type": KJr
    }
}

function H5s(e) {
    let t = e?.organizations ?? [],
        n = t.find(a => a.organizationName?.includes(q5s)) ?? t[0],
        o = n?.projects ?? [],
        s = o.find(a => a.projectName?.includes(W5s)) ?? o[0];
    return !n?.organizationId || !s?.projectId ? null : {
        organizationId: n.organizationId,
        projectId: s.projectId
    }
}

function G5s(e) {
    return e == null || e === 0 || e === 200 || e === "0" || e === "200"
}
var JJr, KJr, HJr, q5s, W5s, lG, YJr = Y(() => {
    "use strict";
    gs();
    JJr = "https://api.z.ai", KJr = "application/json", HJr = "zcode-api-key", q5s = "\u9ED8\u8BA4\u673A\u6784", W5s = "\u9ED8\u8BA4\u9879\u76EE", lG = class extends Error {
        static {
            r(this, "CodingPlanApiKeyError")
        }
        constructor(t, n = {}) {
            super(t, n), this.name = "CodingPlanApiKeyError"
        }
    };
    r(ZJr, "createCodingPlanApiKeyResolver");
    r(V5s, "resolveZaiBizToken");
    r(GJr, "resolveBizApiKey");
    r(COe, "requestRemoteData");
    r(Vat, "createBizAuthHeaders");
    r(H5s, "pickOrgAndProject");
    r(G5s, "isSuccessfulRemoteCode")
});

function Xun(e) {
    let t = X5s(e.baseUrl ?? J5s),
        n = new TextEncoder;
    return {
        async init(o, s) {
            let a = await XJr(e.httpClient, {
                body: n.encode(JSON.stringify({
                    provider: K5s
                })),
                headers: {
                    Authorization: `Bearer ${o.pollToken}`,
                    "Content-Type": Y5s
                },
                method: "POST",
                trace: e.trace,
                url: `${t}/oauth/cli/init`
            }, s);
            return Q5s(a.data)
        },
        async poll(o, s) {
            let a = encodeURIComponent(o.flowId),
                l = await XJr(e.httpClient, {
                    headers: {
                        Authorization: `Bearer ${o.pollToken}`
                    },
                    method: "GET",
                    trace: e.trace,
                    url: `${t}/oauth/cli/poll/${a}`
                }, s);
            return eUs(l.data)
        }
    }
}

function eKr() {
    return (0, QJr.randomBytes)(Z5s).toString("hex")
}

function X5s(e) {
    return e.replace(/\/+$/u, "")
}
async function XJr(e, t, n) {
    let o = await e.request({
            maxResponseBytes: 65536,
            ...t
        }, n),
        s = new TextDecoder().decode(o.body),
        a = nUs(s),
        l = EOe(a);
    if (!l || typeof l.code != "number") throw new H7("Invalid OAuth response envelope", {
        httpStatus: o.status
    });
    let u = typeof l.msg == "string" ? l.msg : void 0;
    if (o.status < 200 || o.status >= 300) throw new H7(u ?? `OAuth HTTP error ${o.status}`, {
        businessCode: l.code,
