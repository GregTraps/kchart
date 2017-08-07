//nil
var GLOBAL_VAR = {
    KLineAllData      :  new Object,
    KLineData         :  new Object,
    time_type         :  "2",
    mark_from         :  "11",
    limit             :  "1000",
    // requestParam      :  "marketFrom=11&type=2&limit=1000",
    requestParam      :  "",
    periodMap	      :  null,
    chartMgr          :  null,
    G_HTTP_REQUEST    :  null,
    TimeOutId 		  :  null,
    button_down       :  false,
    //url				  :  "/myapi/klineData.do"
    // url				  :  "/api/klineData.do"
    url				  :  "data.php"
};
String.prototype.toFixed=function(rate){
    return Number(this).toFixed(rate);
}
GLOBAL_VAR.periodMap = {
    "01w" : "4" , "03d" : "15", "01d" : "3" , "12h" : "14",
    "06h" : "13", "04h" : "12", "02h" : "11", "01h" : "10",
    "30m" : "9" , "15m" : "2" , "05m" : "1" , "03m" : "7" ,
    "01m" : "0"
};
GLOBAL_VAR.tagMapPeriod = {
    "1w" : "01w", "3d" : "03d", "1d" : "01d", "12h" : "12h",
    "6h" : "06h", "4h" : "04h", "2h" : "02h", "1h"  : "01h",
    "30m": "30m", "15m": "15m", "5m" : "05m", "3m"  : "03m",
    "1m" : "01m"
};
var classId = 0;
/**
 * Class.
 */
function create_class() {
    var argc = arguments.length;
    var func = function () {};
    var superClass;
    if (argc) {
        superClass = arguments[0];
        for (var k in superClass.prototype)
            func.prototype[k] = superClass.prototype[k];
    }
    for (var i = 1; i < argc; i++) {
        var feature = arguments[i];
        var f = feature.prototype.__construct;
        if (f) {
            if (!func.prototype.__featureConstructors)
                func.prototype.__featureConstructors = [];
            func.prototype.__featureConstructors.push(f);
            delete feature.prototype.__construct;
        }
        for (var k in feature.prototype)
            func.prototype[k] = feature.prototype[k];
        if (f)
            feature.prototype.__construct = f;
    }
    var newClass = function () {
        if (this.__construct)
            this.__construct.apply(this, arguments);
        if (this.__featureConstructors) {
            var a = this.__featureConstructors;
            var i, c = a.length;
            for (i = 0; i < c; i++)
                a[i].apply(this, arguments);
        }
    };
    func.prototype.__classId = classId++;
    if (superClass != undefined) {
        newClass.__super = superClass.prototype;
        func.prototype.__super = superClass;
    }
    newClass.prototype = new func();
    return newClass;
}
function is_instance(obj, clazz) {
    var classId = clazz.prototype.__classId;
    if (obj.__classId == classId)
        return true;
    var __super = obj.__super;
    while (__super != undefined) {
        if (__super.prototype.__classId == classId)
            return true;
        __super = __super.prototype.__super;
    }
    return false;
}
/**
 * Class: MEvent.
 */
var MEvent = create_class();
MEvent.prototype.__construct = function () {
    this._handlers = [];
};
MEvent.prototype.addHandler = function (o, f) {
    if (this._indexOf(o, f) < 0)
        this._handlers.push({obj:o, func:f});
};
MEvent.prototype.removeHandler = function (o, f) {
    var i = this._indexOf(o, f);
    if (i >= 0)
        this._handlers.splice(i, 1);
};
MEvent.prototype.raise = function (s, g) {
    var a = this._handlers;
    var e, i, c = a.length;
    for (i = 0; i < c; i++) {
        e = a[i];
        e.func.call(e.obj, s, g);
    }
};
MEvent.prototype._indexOf = function (o, f) {
    var a = this._handlers;
    var e, i, c = a.length;
    for (i = 0; i < c; i++) {
        e = a[i];
        if (o == e.obj && f == e.func)
            return i;
    }
    return -1;
};
String.fromFloat = function (v, fractionDigits) {
    var text = v.toFixed(fractionDigits);
    for (var i = text.length - 1; i >= 0; i--) {
        if (text[i] == '.')
            return text.substring(0, i);
        if (text[i] != '0')
            return text.substring(0, i + 1);
    }
};
var ExprEnv = create_class();
ExprEnv.get = function() { return ExprEnv.inst; };
ExprEnv.set = function(env) { ExprEnv.inst = env; };
ExprEnv.prototype.getDataSource = function() { return this._ds; };
ExprEnv.prototype.setDataSource = function(ds) { return this._ds = ds; };
ExprEnv.prototype.getFirstIndex = function() { return this._firstIndex; };
ExprEnv.prototype.setFirstIndex = function(n) { return this._firstIndex = n; };
var Expr = create_class();
Expr.prototype.__construct = function () {
    this._rid = 0;
};
Expr.prototype.execute = function (index) {};
Expr.prototype.reserve = function (rid, count) {};
Expr.prototype.clear = function () {};
var OpenExpr = create_class(Expr);
var HighExpr = create_class(Expr);
var LowExpr = create_class(Expr);
var CloseExpr = create_class(Expr);
var VolumeExpr = create_class(Expr);
OpenExpr.prototype.execute = function(index) {
    return ExprEnv.get()._ds.getDataAt(index).open;
};
HighExpr.prototype.execute = function(index) {
    return ExprEnv.get()._ds.getDataAt(index).high;
};
LowExpr.prototype.execute = function(index) {
    return ExprEnv.get()._ds.getDataAt(index).low;
};
CloseExpr.prototype.execute = function(index) {
    return ExprEnv.get()._ds.getDataAt(index).close;
};
VolumeExpr.prototype.execute = function(index) {
    return ExprEnv.get()._ds.getDataAt(index).volume;
};
var ConstExpr = create_class(Expr);
ConstExpr.prototype.__construct = function(v) {
    ConstExpr.__super.__construct.call(this);
    this._value = v;
};
ConstExpr.prototype.execute = function(index) {
    return this._value;
};
var ParameterExpr = create_class(Expr);
ParameterExpr.prototype.__construct = function(name, minValue, maxValue, defaultValue) {
    ParameterExpr.__super.__construct.call(this);
    this._name = name;
    this._minValue = minValue;
    this._maxValue = maxValue;
    this._value = this._defaultValue = defaultValue;
};
ParameterExpr.prototype.execute = function(index) {
    return this._value;
};
ParameterExpr.prototype.getMinValue = function() {
    return this._minValue;
};
ParameterExpr.prototype.getMaxValue = function() {
    return this._maxValue;
};
ParameterExpr.prototype.getDefaultValue = function() {
    return this._defaultValue;
};
ParameterExpr.prototype.getValue = function() {
    return this._value;
};
ParameterExpr.prototype.setValue = function(v) {
    if (v == 0)
        this._value = 0;
    else if (v < this._minValue)
        this._value = this._minValue;
    else if (v > this._maxValue)
        this._value = this._maxValue;
    else
        this._value = v;
};
var OpAExpr = create_class(Expr);
var OpABExpr = create_class(Expr);
var OpABCExpr = create_class(Expr);
var OpABCDExpr = create_class(Expr);
OpAExpr.prototype.__construct = function(a) {
    OpAExpr.__super.__construct.call(this);
    this._exprA = a;
};
OpAExpr.prototype.reserve = function(rid, count) {
    if (this._rid < rid) {
        this._rid = rid;
        this._exprA.reserve(rid, count);
    }
};
OpAExpr.prototype.clear = function() {
    this._exprA.clear();
};
OpABExpr.prototype.__construct = function(a, b) {
    OpABExpr.__super.__construct.call(this);
    this._exprA = a;
    this._exprB = b;
};
OpABExpr.prototype.reserve = function(rid, count) {
    if (this._rid < rid) {
        this._rid = rid;
        this._exprA.reserve(rid, count);
        this._exprB.reserve(rid, count);
    }
};
OpABExpr.prototype.clear = function() {
    this._exprA.clear();
    this._exprB.clear();
};
OpABCExpr.prototype.__construct = function(a, b, c) {
    OpABCExpr.__super.__construct.call(this);
    this._exprA = a;
    this._exprB = b;
    this._exprC = c;
};
OpABCExpr.prototype.reserve = function(rid, count) {
    if (this._rid < rid) {
        this._rid = rid;
        this._exprA.reserve(rid, count);
        this._exprB.reserve(rid, count);
        this._exprC.reserve(rid, count);
    }
};
OpABCExpr.prototype.clear = function() {
    this._exprA.clear();
    this._exprB.clear();
    this._exprC.clear();
};
OpABCDExpr.prototype.__construct = function(a, b, c, d) {
    OpABCDExpr.__super.__construct.call(this);
    this._exprA = a;
    this._exprB = b;
    this._exprC = c;
    this._exprD = d;
};
OpABCDExpr.prototype.reserve = function(rid, count) {
    if (this._rid < rid) {
        this._rid = rid;
        this._exprA.reserve(rid, count);
        this._exprB.reserve(rid, count);
        this._exprC.reserve(rid, count);
        this._exprD.reserve(rid, count);
    }
};
OpABCDExpr.prototype.clear = function() {
    this._exprA.clear();
    this._exprB.clear();
    this._exprC.clear();
    this._exprD.clear();
};
var NegExpr = create_class(OpAExpr);
NegExpr.prototype.__construct = function(a) {
    NegExpr.__super.__construct.call(this, a);
};
NegExpr.prototype.execute = function(index) {
    return -(this._exprA.execute(index));
};
var AddExpr = create_class(OpABExpr);
var SubExpr = create_class(OpABExpr);
var MulExpr = create_class(OpABExpr);
var DivExpr = create_class(OpABExpr);
AddExpr.prototype.__construct = function(a, b) {
    AddExpr.__super.__construct.call(this, a, b);
};
SubExpr.prototype.__construct = function(a, b) {
    SubExpr.__super.__construct.call(this, a, b);
};
MulExpr.prototype.__construct = function(a, b) {
    MulExpr.__super.__construct.call(this, a, b);
};
DivExpr.prototype.__construct = function(a, b) {
    DivExpr.__super.__construct.call(this, a, b);
};
AddExpr.prototype.execute = function(index) {
    return this._exprA.execute(index) + this._exprB.execute(index);
};
SubExpr.prototype.execute = function(index) {
    return this._exprA.execute(index) - this._exprB.execute(index);
};
MulExpr.prototype.execute = function(index) {
    return this._exprA.execute(index) * this._exprB.execute(index);
};
DivExpr.prototype.execute = function(index) {
    var a = this._exprA.execute(index);
    var b = this._exprB.execute(index);
    if (a == 0)
        return a;
    if (b == 0)
        return (a > 0) ? 1000000 : -1000000;
    return a / b;
};
var GtExpr = create_class(OpABExpr);
var GeExpr = create_class(OpABExpr);
var LtExpr = create_class(OpABExpr);
var LeExpr = create_class(OpABExpr);
var EqExpr = create_class(OpABExpr);
GtExpr.prototype.__construct = function(a, b) {
    GtExpr.__super.__construct.call(this, a, b);
};
GeExpr.prototype.__construct = function(a, b) {
    GeExpr.__super.__construct.call(this, a, b);
};
LtExpr.prototype.__construct = function(a, b) {
    LtExpr.__super.__construct.call(this, a, b);
};
LeExpr.prototype.__construct = function(a, b) {
    LeExpr.__super.__construct.call(this, a, b);
};
EqExpr.prototype.__construct = function(a, b) {
    EqExpr.__super.__construct.call(this, a, b);
};
GtExpr.prototype.execute = function(index) {
    return this._exprA.execute(index) > this._exprB.execute(index) ? 1 : 0;
};
GeExpr.prototype.execute = function(index) {
    return this._exprA.execute(index) >= this._exprB.execute(index) ? 1 : 0;
};
LtExpr.prototype.execute = function(index) {
    return this._exprA.execute(index) < this._exprB.execute(index) ? 1 : 0;
};
LeExpr.prototype.execute = function(index) {
    return this._exprA.execute(index) <= this._exprB.execute(index) ? 1 : 0;
};
EqExpr.prototype.execute = function(index) {
    return this._exprA.execute(index) == this._exprB.execute(index) ? 1 : 0;
};
var MaxExpr = create_class(OpABExpr);
MaxExpr.prototype.__construct = function(a, b) {
    MaxExpr.__super.__construct.call(this, a, b);
};
MaxExpr.prototype.execute = function(index) {
    return Math.max(this._exprA.execute(index), this._exprB.execute(index));
};
var AbsExpr = create_class(OpAExpr);
AbsExpr.prototype.__construct = function(a) {
    AbsExpr.__super.__construct.call(this, a);
};
AbsExpr.prototype.execute = function(index) {
    return Math.abs(this._exprA.execute(index));
};
var RefExpr = create_class(OpABExpr);
RefExpr.prototype.__construct = function(a, b) {
    RefExpr.__super.__construct.call(this, a, b);
    this._offset = -1;
};
RefExpr.prototype.execute = function(index) {
    if (this._offset < 0) {
        this._offset = this._exprB.execute(index);
        if (this._offset < 0)
            throw "offset < 0";
    }
    index -= this._offset;
    if (index < 0)
        throw "index < 0";
    var result = this._exprA.execute(index);
    if (isNaN(result))
        throw "NaN";
    return result;
};
var AndExpr = create_class(OpABExpr);
var OrExpr = create_class(OpABExpr);
AndExpr.prototype.__construct = function(a, b) {
    AndExpr.__super.__construct.call(this, a, b);
};
OrExpr.prototype.__construct = function(a, b) {
    OrExpr.__super.__construct.call(this, a, b);
};
AndExpr.prototype.execute = function(index) {
    return (this._exprA.execute(index) != 0) && (this._exprB.execute(index) != 0) ? 1 : 0;
};
OrExpr.prototype.execute = function(index) {
    return (this._exprA.execute(index) != 0) || (this._exprB.execute(index) != 0) ? 1 : 0;
};
var IfExpr = create_class(OpABCExpr);
IfExpr.prototype.__construct = function(a, b, c) {
    IfExpr.__super.__construct.call(this, a, b, c);
};
IfExpr.prototype.execute = function(index) {
    return this._exprA.execute(index) != 0 ? this._exprB.execute(index) : this._exprC.execute(index);
};
var AssignExpr = create_class(OpAExpr);
AssignExpr.prototype.__construct = function(name, a) {
    AssignExpr.__super.__construct.call(this, a);
    this._name = name;
    this._buf = [];
};
AssignExpr.prototype.getName = function() {
    return this._name;
};
AssignExpr.prototype.execute = function(index) {
    return this._buf[index];
};
AssignExpr.prototype.assign = function(index) {
    this._buf[index] = this._exprA.execute(index);
    if (ExprEnv.get()._firstIndex >= 0)
        if (isNaN(this._buf[index]) && !isNaN(this._buf[index - 1]))
            throw this._name + ".assign(" + index + "): NaN";
};
AssignExpr.prototype.reserve = function(rid, count) {
    if (this._rid < rid) {
        for (var c = count; c > 0; c--)
            this._buf.push(NaN);
    }
    AssignExpr.__super.reserve.call(this, rid, count);
};
AssignExpr.prototype.clear = function() {
    AssignExpr.__super.clear.call(this);
    this._buf = [];
};
var OutputStyle = {
    None: 0, Line: 1, VolumeStick: 2, MACDStick: 3, SARPoint: 4
};
var OutputExpr = create_class(AssignExpr);
OutputExpr.prototype.__construct = function(name, a, style, color) {
    OutputExpr.__super.__construct.call(this, name, a);
    this._style = (style === undefined) ? OutputStyle.Line : style;
    this._color = color;
};
OutputExpr.prototype.getStyle = function() {
    return this._style;
};
OutputExpr.prototype.getColor = function() {
    return this._color;
};
var RangeOutputExpr = create_class(OutputExpr);
RangeOutputExpr.prototype.__construct = function(name, a, style, color) {
    RangeOutputExpr.__super.__construct.call(this, name, a, style, color);
};
RangeOutputExpr.prototype.getName = function() {
    return this._name + this._exprA.getRange();
};
var RangeExpr = create_class(OpABExpr);
RangeExpr.prototype.__construct = function(a, b) {
    RangeExpr.__super.__construct.call(this, a, b);
    this._range = -1;
    this._buf = [];
};
RangeExpr.prototype.getRange = function() {
    return this._range;
};
RangeExpr.prototype.initRange = function() {
    this._range = this._exprB.execute(0);
};
RangeExpr.prototype.execute = function(index) {
    if (this._range < 0)
        this.initRange();
    var rA = this._buf[index].resultA = this._exprA.execute(index);
    var r  = this._buf[index].result  = this.calcResult(index, rA);
    return r;
};
RangeExpr.prototype.reserve = function(rid, count) {
    if (this._rid < rid) {
        for (var c = count; c > 0; c--)
            this._buf.push({resultA:NaN, result:NaN});
    }
    RangeExpr.__super.reserve.call(this, rid, count);
};
RangeExpr.prototype.clear = function() {
    RangeExpr.__super.clear.call(this);
    this._range = -1;
    this._buf = [];
};
var HhvExpr = create_class(RangeExpr);
var LlvExpr = create_class(RangeExpr);
HhvExpr.prototype.__construct = function(a, b) {
    HhvExpr.__super.__construct.call(this, a, b);
};
LlvExpr.prototype.__construct = function(a, b) {
    LlvExpr.__super.__construct.call(this, a, b);
};
HhvExpr.prototype.calcResult = function(index, resultA) {
    if (this._range == 0)
        return NaN;
    var first = ExprEnv.get()._firstIndex;
    if (first < 0)
        return resultA;
    if (index > first) {
        var n = this._range;
        var result = resultA;
        var start = index - n + 1;
        var i = Math.max(first, start);
        for (; i < index; i++) {
            var p = this._buf[i];
            if (result < p.resultA)
                result = p.resultA;
        }
        return result;
    } else {
        return resultA;
    }
};
LlvExpr.prototype.calcResult = function(index, resultA) {
    if (this._range == 0)
        return NaN;
    var first = ExprEnv.get()._firstIndex;
    if (first < 0)
        return resultA;
    if (index > first) {
        var n = this._range;
        var result = resultA;
        var start = index - n + 1;
        var i = Math.max(first, start);
        for (; i < index; i++) {
            var p = this._buf[i];
            if (result > p.resultA)
                result = p.resultA;
        }
        return result;
    } else {
        return resultA;
    }
};
var CountExpr = create_class(RangeExpr);
CountExpr.prototype.__construct = function(a, b) {
    CountExpr.__super.__construct.call(this, a, b);
};
CountExpr.prototype.calcResult = function(index, resultA) {
    if (this._range == 0)
        return NaN;
    var first = ExprEnv.get()._firstIndex;
    if (first < 0)
        return 0;
    if (index >= first) {
        var n = this._range - 1;
        if (n > index - first)
            n = index - first;
        var count = 0;
        for (; n >= 0; n--) {
            if (this._buf[index - n].resultA != 0.0)
                count++;
        }
        return count;
    } else {
        return 0;
    }
};
var SumExpr = create_class(RangeExpr);
SumExpr.prototype.__construct = function(a, b) {
    SumExpr.__super.__construct.call(this, a, b);
};
SumExpr.prototype.calcResult = function(index, resultA) {
    var first = ExprEnv.get()._firstIndex;
    if (first < 0)
        return resultA;
    if (index > first) {
        var n = this._range;
        if (n == 0 || n >= index + 1 - first) {
            return this._buf[index - 1].result + resultA;
        }
        return this._buf[index - 1].result + resultA - this._buf[index - n].resultA;
    } else {
        return resultA;
    }
};
var StdExpr = create_class(RangeExpr);
StdExpr.prototype.__construct = function(a, b) {
    StdExpr.__super.__construct.call(this, a, b);
};
StdExpr.prototype.calcResult = function(index, resultA) {
    if (this._range == 0)
        return NaN;
    var stdData = this._stdBuf[index];
    var first = ExprEnv.get()._firstIndex;
    if (first < 0) {
        stdData.resultMA = resultA;
        return 0.0;
    }
    if (index > first) {
        var n = this._range;
        if (n >= index + 1 - first) {
            n = index + 1 - first;
            stdData.resultMA = this._stdBuf[index - 1].resultMA * (1.0 - 1.0 / n) + (resultA / n);
        } else {
            stdData.resultMA = this._stdBuf[index - 1].resultMA + (resultA - this._buf[index - n].resultA) / n;
        }
        var sum = 0;
        for (var i = index - n + 1; i <= index; i++)
            sum += Math.pow(this._buf[i].resultA - stdData.resultMA, 2);
        return Math.sqrt(sum / n);
    }
    stdData.resultMA = resultA;
    return 0.0;
};
StdExpr.prototype.reserve = function(rid, count) {
    if (this._rid < rid) {
        for (var c = count; c > 0; c--)
            this._stdBuf.push({resultMA:NaN});
    }
    StdExpr.__super.reserve.call(this, rid, count);
};
StdExpr.prototype.clear = function() {
    StdExpr.__super.clear.call(this);
    this._stdBuf = [];
};
var MaExpr = create_class(RangeExpr);
MaExpr.prototype.__construct = function(a, b) {
    MaExpr.__super.__construct.call(this, a, b);
};
MaExpr.prototype.calcResult = function(index, resultA) {
    if (this._range == 0)
        return NaN;
    var first = ExprEnv.get()._firstIndex;
    if (first < 0)
        return resultA;
    if (index > first) {
        var n = this._range;
        if (n >= index + 1 - first) {
            n = index + 1 - first;
            return this._buf[index - 1].result * (1.0 - 1.0 / n) + (resultA / n);
        }
        return this._buf[index - 1].result + (resultA - this._buf[index - n].resultA) / n;
    } else {
        return resultA;
    }
};
var EmaExpr = create_class(RangeExpr);
EmaExpr.prototype.__construct = function(a, b) {
    EmaExpr.__super.__construct.call(this, a, b);
};
EmaExpr.prototype.initRange = function() {
    EmaExpr.__super.initRange.call(this);
    this._alpha = 2.0 / (this._range + 1);
};
EmaExpr.prototype.calcResult = function(index, resultA) {
    if (this._range == 0)
        return NaN;
    var first = ExprEnv.get()._firstIndex;
    if (first < 0)
        return resultA;
    if (index > first) {
        var prev = this._buf[index - 1];
        return this._alpha * (resultA - prev.result) + prev.result;
    }
    return resultA;
};
var ExpmemaExpr = create_class(EmaExpr);
ExpmemaExpr.prototype.__construct = function(a, b) {
    ExpmemaExpr.__super.__construct.call(this, a, b);
};
ExpmemaExpr.prototype.calcResult = function(index, resultA) {
    var first = ExprEnv.get()._firstIndex;
    if (first < 0)
        return resultA;
    if (index > first) {
        var n = this._range;
        var prev = this._buf[index - 1];
        if (n >= index + 1 - first) {
            n = index + 1 - first;
            return prev.result * (1.0 - 1.0 / n) + (resultA / n);
        }
        return this._alpha * (resultA - prev.result) + prev.result;
    }
    return resultA;
};
var SmaExpr = create_class(RangeExpr);
SmaExpr.prototype.__construct = function(a, b, c) {
    SmaExpr.__super.__construct.call(this, a, b);
    this._exprC = c;
    this._mul;
};
SmaExpr.prototype.initRange = function() {
    SmaExpr.__super.initRange.call(this);
    this._mul = this._exprC.execute(0);
};
SmaExpr.prototype.calcResult = function(index, resultA) {
    if (this._range == 0)
        return NaN;
    var first = ExprEnv.get()._firstIndex;
    if (first < 0)
        return resultA;
    if (index > first) {
        var n = this._range;
        if (n > index + 1 - first)
            n = index + 1 - first;
        return ((n - 1) * this._buf[index - 1].result + resultA * this._mul) / n;
    }
    return resultA;
};
var SarExpr = create_class(OpABCDExpr);
SarExpr.prototype.__construct = function(a, b, c, d) {
    SarExpr.__super.__construct.call(this, a, b, c, d);
    this._buf = [];
    this._range = -1;
    this._min;
    this._step;
    this._max;
};
SarExpr.prototype.execute = function(index) {
    if (this._range < 0) {
        this._range = this._exprA.execute(0);
        this._min = this._exprB.execute(0) / 100.0;
        this._step = this._exprC.execute(0) / 100.0;
        this._max = this._exprD.execute(0) / 100.0;
    }
    var data = this._buf[index];
    var exprEnv = ExprEnv.get();
    var first = exprEnv._firstIndex;
    if (first < 0) {
        data.longPos = true;
        data.sar = exprEnv._ds.getDataAt(index).low;
        data.ep = exprEnv._ds.getDataAt(index).high;
        data.af = 0.02;
    } else {
        var high = exprEnv._ds.getDataAt(index).high;
        var low = exprEnv._ds.getDataAt(index).low;
        var prev = this._buf[index - 1];
        data.sar = prev.sar + prev.af * (prev.ep - prev.sar);
        if (prev.longPos) {
            data.longPos = true;
            if (high > prev.ep) {
                data.ep = high;
                data.af = Math.min(prev.af + this._step, this._max);
            } else {
                data.ep = prev.ep;
                data.af = prev.af;
            }
            if (data.sar > low) {
                data.longPos = false;
                var i = index - this._range + 1;
                for (i = Math.max(i, first); i < index; i++) {
                    var h = exprEnv._ds.getDataAt(i).high;
                    if (high < h) high = h;
                }
                data.sar = high;
                data.ep = low;
                data.af = 0.02;
            }
        }
        else {
            data.longPos = false;
            if (low < prev.ep) {
                data.ep = low;
                data.af = Math.min(prev.af + this._step, this._max);
            } else {
                data.ep = prev.ep;
                data.af = prev.af;
            }
            if (data.sar < high) {
                data.longPos = true;
                var i = index - this._range + 1;
                for (i = Math.max(i, first); i < index; i++) {
                    var l = exprEnv._ds.getDataAt(i).low;
                    if (low > l) low = l;
                }
                data.sar = low;
                data.ep = high;
                data.af = 0.02;
            }
        }
    }
    return data.sar;
};
SarExpr.prototype.reserve = function(rid, count) {
    if (this._rid < rid) {
        for (var c = count; c > 0; c--)
            this._buf.push({longPos:true, sar:NaN, ep:NaN, af:NaN});
    }
    SarExpr.__super.reserve.call(this, rid, count);
};
SarExpr.prototype.clear = function() {
    SarExpr.__super.clear.call(this);
    this._range = -1;
};
var Indicator = create_class();
Indicator.prototype.__construct = function() {
    this._exprEnv = new ExprEnv();
    this._rid = 0;
    this._params = [];
    this._assigns = [];
    this._outputs = [];
};
Indicator.prototype.addParameter = function(expr) {
    this._params.push(expr);
};
Indicator.prototype.addAssign = function(expr) {
    this._assigns.push(expr);
};
Indicator.prototype.addOutput = function(expr) {
    this._outputs.push(expr);
};
Indicator.prototype.getParameterCount = function() {
    return this._params.length;
};
Indicator.prototype.getParameterAt = function(index) {
    return this._params[index];
};
Indicator.prototype.getOutputCount = function() {
    return this._outputs.length;
};
Indicator.prototype.getOutputAt = function(index) {
    return this._outputs[index];
};
Indicator.prototype.clear = function() {
    this._exprEnv.setFirstIndex(-1);
    var i, cnt;
    cnt = this._assigns.length;
    for (i = 0; i < cnt; i++) {
        this._assigns[i].clear();
    }
    cnt = this._outputs.length;
    for (i = 0; i < cnt; i++) {
        this._outputs[i].clear();
    }
};
Indicator.prototype.reserve = function(count) {
    this._rid++;
    var i, cnt;
    cnt = this._assigns.length;
    for (i = 0; i < cnt; i++) {
        this._assigns[i].reserve(this._rid, count);
    }
    cnt = this._outputs.length;
    for (i = 0; i < cnt; i++) {
        this._outputs[i].reserve(this._rid, count);
    }
};
Indicator.prototype.execute = function(ds, index) {
    if (index < 0)
        return;
    this._exprEnv.setDataSource(ds);
    ExprEnv.set(this._exprEnv);
    try {
        var i, cnt;
        cnt = this._assigns.length;
        for (i = 0; i < cnt; i++) {
            this._assigns[i].assign(index);
        }
        cnt = this._outputs.length;
        for (i = 0; i < cnt; i++) {
            this._outputs[i].assign(index);
        }
        if (this._exprEnv.getFirstIndex() < 0)
            this._exprEnv.setFirstIndex(index);
    } catch (e) {
        if (this._exprEnv.getFirstIndex() >= 0) {
            alert(e);
            throw e;
        }
    }
};
Indicator.prototype.getParameters = function() {
    var params = [];
    var i, cnt = this._params.length;
    for (i = 0; i < cnt; i++)
        params.push(this._params[i].getValue());
    return params;
};
Indicator.prototype.setParameters = function(params) {
    if ((params instanceof Array) && params.length == this._params.length) {
        for (var i in this._params)
            this._params[i].setValue(params[i]);
    }
};
var HLCIndicator = create_class(Indicator);
HLCIndicator.prototype.__construct = function() {
    HLCIndicator.__super.__construct.call(this);
    var M1 = new ParameterExpr("M1", 2, 1000, 60);
    this.addParameter(M1);
    this.addOutput(new OutputExpr("HIGH",
        new HighExpr(),
        OutputStyle.None
    ));
    this.addOutput(new OutputExpr("LOW",
        new LowExpr(),
        OutputStyle.None
    ));
    this.addOutput(new OutputExpr("CLOSE",
        new CloseExpr(),
        OutputStyle.Line,
        Theme.Color.Indicator0
    ));
    this.addOutput(new RangeOutputExpr("MA",
        new MaExpr(new CloseExpr(), M1),
        OutputStyle.Line,
        Theme.Color.Indicator1
    ));
};
HLCIndicator.prototype.getName = function() {
    return "CLOSE";
};
var MAIndicator = create_class(Indicator);
MAIndicator.prototype.__construct = function() {
    MAIndicator.__super.__construct.call(this);
    var M1 = new ParameterExpr("M1", 2, 1000, 7);
    var M2 = new ParameterExpr("M2", 2, 1000, 30);
    var M3 = new ParameterExpr("M3", 2, 1000, 0);
    var M4 = new ParameterExpr("M4", 2, 1000, 0);
    this.addParameter(M1);
    this.addParameter(M2);
    this.addParameter(M3);
    this.addParameter(M4);
    this.addOutput(new RangeOutputExpr("MA",
        new MaExpr(new CloseExpr(), M1)
    ));
    this.addOutput(new RangeOutputExpr("MA",
        new MaExpr(new CloseExpr(), M2)
    ));
    this.addOutput(new RangeOutputExpr("MA",
        new MaExpr(new CloseExpr(), M3)
    ));
    this.addOutput(new RangeOutputExpr("MA",
        new MaExpr(new CloseExpr(), M4)
    ));
};
MAIndicator.prototype.getName = function() {
    return "MA";
};
var EMAIndicator = create_class(Indicator);
EMAIndicator.prototype.__construct = function() {
    EMAIndicator.__super.__construct.call(this);
    var M1 = new ParameterExpr("M1", 2, 1000, 7);
    var M2 = new ParameterExpr("M2", 2, 1000, 30);
    var M3 = new ParameterExpr("M3", 2, 1000, 0);
    var M4 = new ParameterExpr("M4", 2, 1000, 0);
    this.addParameter(M1);
    this.addParameter(M2);
    this.addParameter(M3);
    this.addParameter(M4);
    this.addOutput(new RangeOutputExpr("EMA",
        new EmaExpr(new CloseExpr(), M1)
    ));
    this.addOutput(new RangeOutputExpr("EMA",
        new EmaExpr(new CloseExpr(), M2)
    ));
    this.addOutput(new RangeOutputExpr("EMA",
        new EmaExpr(new CloseExpr(), M3)
    ));
    this.addOutput(new RangeOutputExpr("EMA",
        new EmaExpr(new CloseExpr(), M4)
    ));
};
EMAIndicator.prototype.getName = function() {
    return "EMA";
};
var VOLUMEIndicator = create_class(Indicator);
VOLUMEIndicator.prototype.__construct = function() {
    VOLUMEIndicator.__super.__construct.call(this);
    var M1 = new ParameterExpr("M1", 2, 500, 5);
    var M2 = new ParameterExpr("M2", 2, 500, 10);
    this.addParameter(M1);
    this.addParameter(M2);
    var VOLUME = new OutputExpr("VOLUME",
        new VolumeExpr(),
        OutputStyle.VolumeStick,
        Theme.Color.Text4
    );
    this.addOutput(VOLUME);
    this.addOutput(new RangeOutputExpr("MA",
        new MaExpr(VOLUME, M1),
        OutputStyle.Line,
        Theme.Color.Indicator0
    ));
    this.addOutput(new RangeOutputExpr("MA",
        new MaExpr(VOLUME, M2),
        OutputStyle.Line,
        Theme.Color.Indicator1
    ));
};
VOLUMEIndicator.prototype.getName = function() {
    return "VOLUME";
};
var MACDIndicator = create_class(Indicator);
MACDIndicator.prototype.__construct = function() {
    MACDIndicator.__super.__construct.call(this);
    var SHORT = new ParameterExpr("SHORT", 2, 200, 12);
    var LONG = new ParameterExpr("LONG", 2, 200, 26);
    var MID = new ParameterExpr("MID", 2, 200, 9);
    this.addParameter(SHORT);
    this.addParameter(LONG);
    this.addParameter(MID);
    var DIF = new OutputExpr("DIF",
        new SubExpr(
            new EmaExpr(new CloseExpr(), SHORT),
            new EmaExpr(new CloseExpr(), LONG)
        )
    );
    this.addOutput(DIF);
    var DEA = new OutputExpr("DEA",
        new EmaExpr(DIF, MID)
    );
    this.addOutput(DEA);
    var MACD = new OutputExpr("MACD",
        new MulExpr(
            new SubExpr(DIF, DEA),
            new ConstExpr(2)
        ),
        OutputStyle.MACDStick
    );
    this.addOutput(MACD);
};
MACDIndicator.prototype.getName = function() {
    return "MACD";
};
var DMIIndicator = create_class(Indicator);
DMIIndicator.prototype.__construct = function() {
    DMIIndicator.__super.__construct.call(this);
    var N = new ParameterExpr("N", 2, 90, 14);
    var MM = new ParameterExpr("MM", 2, 60, 6);
    this.addParameter(N);
    this.addParameter(MM);
    var MTR = new AssignExpr("MTR",
        new ExpmemaExpr(
            new MaxExpr(
                new MaxExpr(
                    new SubExpr(new HighExpr(), new LowExpr()),
                    new AbsExpr(
                        new SubExpr(
                            new HighExpr(),
                            new RefExpr(new CloseExpr(), new ConstExpr(1))
                        )
                    )
                ),
                new AbsExpr(
                    new SubExpr(
                        new RefExpr(new CloseExpr(), new ConstExpr(1)),
                        new LowExpr()
                    )
                )
            ),
            N
        )
    );
    this.addAssign(MTR);
    var HD = new AssignExpr("HD",
        new SubExpr(
            new HighExpr(),
            new RefExpr(new HighExpr(), new ConstExpr(1))
        )
    );
    this.addAssign(HD);
    var LD = new AssignExpr("LD",
        new SubExpr(
            new RefExpr(new LowExpr(), new ConstExpr(1)),
            new LowExpr()
        )
    );
    this.addAssign(LD);
    var DMP = new AssignExpr("DMP",
        new ExpmemaExpr(
            new IfExpr(
                new AndExpr(
                    new GtExpr(HD, new ConstExpr(0)),
                    new GtExpr(HD, LD)
                ),
                HD,
                new ConstExpr(0)
            ),
            N
        )
    );
    this.addAssign(DMP);
    var DMM = new AssignExpr("DMM",
        new ExpmemaExpr(
            new IfExpr(
                new AndExpr(
                    new GtExpr(LD, new ConstExpr(0)),
                    new GtExpr(LD, HD)
                ),
                LD,
                new ConstExpr(0)
            ),
            N
        )
    );
    this.addAssign(DMM);
    var PDI = new OutputExpr("PDI",
        new MulExpr(
            new DivExpr(DMP, MTR),
            new ConstExpr(100)
        )
    );
    this.addOutput(PDI);
    var MDI = new OutputExpr("MDI",
        new MulExpr(
            new DivExpr(DMM, MTR),
            new ConstExpr(100)
        )
    );
    this.addOutput(MDI);
    var ADX = new OutputExpr("ADX",
        new ExpmemaExpr(
            new MulExpr(
                new DivExpr(
                    new AbsExpr(
                        new SubExpr(MDI, PDI)
                    ),
                    new AddExpr(MDI, PDI)
                ),
                new ConstExpr(100)
            ),
            MM
        )
    );
    this.addOutput(ADX);
    var ADXR = new OutputExpr("ADXR",
        new ExpmemaExpr(ADX, MM)
    );
    this.addOutput(ADXR);
};
DMIIndicator.prototype.getName = function() {
    return "DMI";
};
var DMAIndicator = create_class(Indicator);
DMAIndicator.prototype.__construct = function() {
    DMAIndicator.__super.__construct.call(this);
    var N1 = new ParameterExpr("N1", 2, 60, 10);
    var N2 = new ParameterExpr("N2", 2, 250, 50);
    var M = new ParameterExpr("M", 2, 100, 10);
    this.addParameter(N1);
    this.addParameter(N2);
    this.addParameter(M);
    var DIF = new OutputExpr("DIF",
        new SubExpr(
            new MaExpr(new CloseExpr(), N1),
            new MaExpr(new CloseExpr(), N2)
        )
    );
    this.addOutput(DIF);
    var DIFMA = new OutputExpr("DIFMA",
        new MaExpr(DIF, M)
    );
    this.addOutput(DIFMA);
};
DMAIndicator.prototype.getName = function() {
    return "DMA";
};
var TRIXIndicator = create_class(Indicator);
TRIXIndicator.prototype.__construct = function() {
    TRIXIndicator.__super.__construct.call(this);
    var N = new ParameterExpr("N", 2, 100, 12);
    var M = new ParameterExpr("M", 2, 100, 9);
    this.addParameter(N);
    this.addParameter(M);
    var MTR = new AssignExpr("MTR",
        new EmaExpr(
            new EmaExpr(
                new EmaExpr(new CloseExpr(), N), N), N)
    );
    this.addAssign(MTR);
    var TRIX = new OutputExpr("TRIX",
        new MulExpr(
            new DivExpr(
                new SubExpr(
                    MTR,
                    new RefExpr(
                        MTR,
                        new ConstExpr(1)
                    )
                ),
                new RefExpr(
                    MTR,
                    new ConstExpr(1)
                )
            ),
            new ConstExpr(100)
        )
    );
    this.addOutput(TRIX);
    var MATRIX = new OutputExpr("MATRIX",
        new MaExpr(TRIX, M)
    );
    this.addOutput(MATRIX);
};
TRIXIndicator.prototype.getName = function() {
    return "TRIX";
};
var BRARIndicator = create_class(Indicator);
BRARIndicator.prototype.__construct = function() {
    BRARIndicator.__super.__construct.call(this);
    var N = new ParameterExpr("N", 2, 120, 26);
    this.addParameter(N);
    var REF_CLOSE_1 = new AssignExpr("REF_CLOSE_1",
        new RefExpr(new CloseExpr(), new ConstExpr(1))
    );
    this.addAssign(REF_CLOSE_1);
    var BR = new OutputExpr("BR",
        new MulExpr(
            new DivExpr(
                new SumExpr(
                    new MaxExpr(
                        new ConstExpr(0),
                        new SubExpr(
                            new HighExpr(),
                            REF_CLOSE_1
                        )
                    ),
                    N
                ),
                new SumExpr(
                    new MaxExpr(
                        new ConstExpr(0),
                        new SubExpr(
                            REF_CLOSE_1,
                            new LowExpr()
                        )
                    ),
                    N
                )
            ),
            new ConstExpr(100)
        )
    );
    this.addOutput(BR);
    var AR = new OutputExpr("AR",
        new MulExpr(
            new DivExpr(
                new SumExpr(
                    new SubExpr(
                        new HighExpr(),
                        new OpenExpr()
                    ),
                    N
                ),
                new SumExpr(
                    new SubExpr(
                        new OpenExpr(),
                        new LowExpr()
                    ),
                    N
                )
            ),
            new ConstExpr(100)
        )
    );
    this.addOutput(AR);
};
BRARIndicator.prototype.getName = function() {
    return "BRAR";
};
var VRIndicator = create_class(Indicator);
VRIndicator.prototype.__construct = function() {
    VRIndicator.__super.__construct.call(this);
    var N = new ParameterExpr("N", 2, 100, 26);
    var M = new ParameterExpr("M", 2, 100, 6);
    this.addParameter(N);
    this.addParameter(M);
    var REF_CLOSE_1 = new AssignExpr("REF_CLOSE_1",
        new RefExpr(new CloseExpr(), new ConstExpr(1))
    );
    this.addAssign(REF_CLOSE_1);
    var TH = new AssignExpr("TH",
        new SumExpr(
            new IfExpr(
                new GtExpr(
                    new CloseExpr(),
                    REF_CLOSE_1
                ),
                new VolumeExpr(),
                new ConstExpr(0)
            ),
            N
        )
    );
    this.addAssign(TH);
    var TL = new AssignExpr("TL",
        new SumExpr(
            new IfExpr(
                new LtExpr(
                    new CloseExpr(),
                    REF_CLOSE_1
                ),
                new VolumeExpr(),
                new ConstExpr(0)
            ),
            N
        )
    );
    this.addAssign(TL);
    var TQ = new AssignExpr("TQ",
        new SumExpr(
            new IfExpr(
                new EqExpr(
                    new CloseExpr(),
                    REF_CLOSE_1
                ),
                new VolumeExpr(),
                new ConstExpr(0)
            ),
            N
        )
    );
    this.addAssign(TQ);
    var VR = new OutputExpr("VR",
        new MulExpr(
            new DivExpr(
                new AddExpr(
                    new MulExpr(
                        TH,
                        new ConstExpr(2)
                    ),
                    TQ
                ),
                new AddExpr(
                    new MulExpr(
                        TL,
                        new ConstExpr(2)
                    ),
                    TQ
                )
            ),
            new ConstExpr(100)
        )
    );
    this.addOutput(VR);
    var MAVR = new OutputExpr("MAVR",
        new MaExpr(VR, M)
    );
    this.addOutput(MAVR);
};
VRIndicator.prototype.getName = function() {
    return "VR";
};
var OBVIndicator = create_class(Indicator);
OBVIndicator.prototype.__construct = function() {
    OBVIndicator.__super.__construct.call(this);
    var M = new ParameterExpr("M", 2, 100, 30);
    this.addParameter(M);
    var REF_CLOSE_1 = new AssignExpr("REF_CLOSE_1",
        new RefExpr(new CloseExpr(), new ConstExpr(1))
    );
    this.addAssign(REF_CLOSE_1);
    var VA = new AssignExpr("VA",
        new IfExpr(
            new GtExpr(new CloseExpr(), REF_CLOSE_1),
            new VolumeExpr(),
            new NegExpr(new VolumeExpr())
        )
    );
    this.addAssign(VA);
    var OBV = new OutputExpr("OBV",
        new SumExpr(
            new IfExpr(
                new EqExpr(new CloseExpr(), REF_CLOSE_1),
                new ConstExpr(0),
                VA
            ),
            new ConstExpr(0)
        )
    );
    this.addOutput(OBV);
    var MAOBV = new OutputExpr("MAOBV",
        new MaExpr(OBV, M)
    );
    this.addOutput(MAOBV);
};
OBVIndicator.prototype.getName = function() {
    return "OBV";
};
var EMVIndicator = create_class(Indicator);
EMVIndicator.prototype.__construct = function() {
    EMVIndicator.__super.__construct.call(this);
    var N = new ParameterExpr("N", 2, 90, 14);
    var M = new ParameterExpr("M", 2, 60, 9);
    this.addParameter(N);
    this.addParameter(M);
    var VOLUME = new AssignExpr("VOLUME",
        new DivExpr(
            new MaExpr(new VolumeExpr(), N),
            new VolumeExpr()
        )
    );
    this.addAssign(VOLUME);
    var MID = new AssignExpr("MID",
        new MulExpr(
            new DivExpr(
                new SubExpr(
                    new AddExpr(new HighExpr(), new LowExpr()),
                    new RefExpr(
                        new AddExpr(new HighExpr(), new LowExpr()),
                        new ConstExpr(1)
                    )
                ),
                new AddExpr(new HighExpr(), new LowExpr())
            ),
            new ConstExpr(100)
        )
    );
    this.addAssign(MID);
    var EMV = new OutputExpr("EMV",
        new MaExpr(
            new DivExpr(
                new MulExpr(
                    MID,
                    new MulExpr(
                        VOLUME,
                        new SubExpr(new HighExpr(), new LowExpr())
                    )
                ),
                new MaExpr(
                    new SubExpr(new HighExpr(), new LowExpr()),
                    N
                )
            ),
            N
        )
    );
    this.addOutput(EMV);
    var MAEMV = new OutputExpr("MAEMV",
        new MaExpr(EMV, M)
    );
    this.addOutput(MAEMV);
};
EMVIndicator.prototype.getName = function() {
    return "EMV";
};
var RSIIndicator = create_class(Indicator);
RSIIndicator.prototype.__construct = function() {
    RSIIndicator.__super.__construct.call(this);
    var N1 = new ParameterExpr("N1", 2, 120, 6);
    var N2 = new ParameterExpr("N2", 2, 250, 12);
    var N3 = new ParameterExpr("N3", 2, 500, 24);
    this.addParameter(N1);
    this.addParameter(N2);
    this.addParameter(N3);
    var LC = new AssignExpr("LC",
        new RefExpr(new CloseExpr(), new ConstExpr(1))
    );
    this.addAssign(LC);
    var CLOSE_LC = new AssignExpr("CLOSE_LC",
        new SubExpr(new CloseExpr(), LC)
    );
    this.addAssign(CLOSE_LC);
    this.addOutput(new OutputExpr("RSI1",
        new MulExpr(
            new DivExpr(
                new SmaExpr(new MaxExpr(CLOSE_LC, new ConstExpr(0)), N1, new ConstExpr(1)),
                new SmaExpr(new AbsExpr(CLOSE_LC), N1, new ConstExpr(1))
            ),
            new ConstExpr(100)
        )
    ));
    this.addOutput(new OutputExpr("RSI2",
        new MulExpr(
            new DivExpr(
                new SmaExpr(new MaxExpr(CLOSE_LC, new ConstExpr(0)), N2, new ConstExpr(1)),
                new SmaExpr(new AbsExpr(CLOSE_LC), N2, new ConstExpr(1))
            ),
            new ConstExpr(100)
        )
    ));
    this.addOutput(new OutputExpr("RSI3",
        new MulExpr(
            new DivExpr(
                new SmaExpr(new MaxExpr(CLOSE_LC, new ConstExpr(0)), N3, new ConstExpr(1)),
                new SmaExpr(new AbsExpr(CLOSE_LC), N3, new ConstExpr(1))
            ),
            new ConstExpr(100)
        )
    ));
};
RSIIndicator.prototype.getName = function() {
    return "RSI";
};
var WRIndicator = create_class(Indicator);
WRIndicator.prototype.__construct = function() {
    WRIndicator.__super.__construct.call(this);
    var N = new ParameterExpr("N", 2, 100, 10);
    var N1 = new ParameterExpr("N1", 2, 100, 6);
    this.addParameter(N);
    this.addParameter(N1);
    var HHV = new AssignExpr("HHV",
        new HhvExpr(new HighExpr(), N)
    );
    this.addAssign(HHV);
    var HHV1 = new AssignExpr("HHV1",
        new HhvExpr(new HighExpr(), N1)
    );
    this.addAssign(HHV1);
    var LLV = new AssignExpr("LLV",
        new LlvExpr(new LowExpr(), N)
    );
    this.addAssign(LLV);
    var LLV1 = new AssignExpr("LLV1",
        new LlvExpr(new LowExpr(), N1)
    );
    this.addAssign(LLV1);
    var WR1 = new OutputExpr("WR1",
        new MulExpr(
            new DivExpr(
                new SubExpr(
                    HHV,
                    new CloseExpr()
                ),
                new SubExpr(
                    HHV,
                    LLV
                )
            ),
            new ConstExpr(100)
        )
    );
    this.addOutput(WR1);
    var WR2 = new OutputExpr("WR2",
        new MulExpr(
            new DivExpr(
                new SubExpr(
                    HHV1,
                    new CloseExpr()
                ),
                new SubExpr(
                    HHV1,
                    LLV1
                )
            ),
            new ConstExpr(100)
        )
    );
    this.addOutput(WR2);
};
WRIndicator.prototype.getName = function() {
    return "WR";
};
var SARIndicator = create_class(Indicator);
SARIndicator.prototype.__construct = function() {
    SARIndicator.__super.__construct.call(this);
    var N = new ConstExpr(4);
    var MIN = new ConstExpr(2);
    var STEP = new ConstExpr(2);
    var MAX = new ConstExpr(20);
    this.addOutput(new OutputExpr("SAR",
        new SarExpr(N, MIN, STEP, MAX),
        OutputStyle.SARPoint
    ));
};
SARIndicator.prototype.getName = function() {
    return "SAR";
};
var KDJIndicator = create_class(Indicator);
KDJIndicator.prototype.__construct = function() {
    KDJIndicator.__super.__construct.call(this);
    var N = new ParameterExpr("N", 2, 90, 9);
    var M1 = new ParameterExpr("M1", 2, 30, 3);
    var M2 = new ParameterExpr("M2", 2, 30, 3);
    this.addParameter(N);
    this.addParameter(M1);
    this.addParameter(M2);
    var HHV = new AssignExpr("HHV",
        new HhvExpr(new HighExpr(), N)
    );
    this.addAssign(HHV);
    var LLV = new AssignExpr("LLV",
        new LlvExpr(new LowExpr(), N)
    );
    this.addAssign(LLV);
    var RSV = new AssignExpr("RSV",
        new MulExpr(
            new DivExpr(
                new SubExpr(
                    new CloseExpr(),
                    LLV
                ),
                new SubExpr(
                    HHV,
                    LLV
                )
            ),
            new ConstExpr(100)
        )
    );
    this.addAssign(RSV);
    var K = new OutputExpr("K",
        new SmaExpr(RSV, M1, new ConstExpr(1))
    );
    this.addOutput(K);
    var D = new OutputExpr("D",
        new SmaExpr(K, M2, new ConstExpr(1))
    );
    this.addOutput(D);
    var J = new OutputExpr("J",
        new SubExpr(
            new MulExpr(
                K,
                new ConstExpr(3)
            ),
            new MulExpr(
                D,
                new ConstExpr(2)
            )
        )
    );
    this.addOutput(J);
};
KDJIndicator.prototype.getName = function() {
    return "KDJ";
};
var ROCIndicator = create_class(Indicator);
ROCIndicator.prototype.__construct = function() {
    ROCIndicator.__super.__construct.call(this);
    var N = new ParameterExpr("N", 2, 120, 12);
    var M = new ParameterExpr("M", 2, 60, 6);
    this.addParameter(N);
    this.addParameter(M);
    var REF_CLOSE_N = new AssignExpr("REF_CLOSE_N",
        new RefExpr(new CloseExpr(), N)
    );
    this.addAssign(REF_CLOSE_N);
    var ROC = new OutputExpr("ROC",
        new MulExpr(
            new DivExpr(
                new SubExpr(
                    new CloseExpr(),
                    REF_CLOSE_N
                ),
                REF_CLOSE_N
            ),
            new ConstExpr(100)
        )
    );
    this.addOutput(ROC);
    var MAROC = new OutputExpr("MAROC",
        new MaExpr(ROC, M)
    );
    this.addOutput(MAROC);
};
ROCIndicator.prototype.getName = function() {
    return "ROC";
};
var MTMIndicator = create_class(Indicator);
MTMIndicator.prototype.__construct = function() {
    MTMIndicator.__super.__construct.call(this);
    var N = new ParameterExpr("N", 2, 120, 12);
    var M = new ParameterExpr("M", 2, 60, 6);
    this.addParameter(N);
    this.addParameter(M);
    var MTM = new OutputExpr("MTM",
        new SubExpr(
            new CloseExpr(),
            new RefExpr(new CloseExpr(), N)
        )
    );
    this.addOutput(MTM);
    var MTMMA = new OutputExpr("MTMMA",
        new MaExpr(MTM, M)
    );
    this.addOutput(MTMMA);
};
MTMIndicator.prototype.getName = function() {
    return "MTM";
};
var BOLLIndicator = create_class(Indicator);
BOLLIndicator.prototype.__construct = function() {
    BOLLIndicator.__super.__construct.call(this);
    var N = new ParameterExpr("N", 2, 120, 20);
    this.addParameter(N);
    var STD_CLOSE_N = new AssignExpr("STD_CLOSE_N",
        new StdExpr(new CloseExpr(), N)
    );
    this.addAssign(STD_CLOSE_N);
    var BOLL = new OutputExpr("BOLL",
        new MaExpr(new CloseExpr(), N)
    );
    this.addOutput(BOLL);
    var UB = new OutputExpr("UB",
        new AddExpr(
            BOLL,
            new MulExpr(
                new ConstExpr(2),
                STD_CLOSE_N
            )
        )
    );
    this.addOutput(UB);
    var LB = new OutputExpr("LB",
        new SubExpr(
            BOLL,
            new MulExpr(
                new ConstExpr(2),
                STD_CLOSE_N
            )
        )
    );
    this.addOutput(LB);
};
BOLLIndicator.prototype.getName = function() {
    return "BOLL";
};
var PSYIndicator = create_class(Indicator);
PSYIndicator.prototype.__construct = function() {
    PSYIndicator.__super.__construct.call(this);
    var N = new ParameterExpr("N", 2, 100, 12);
    var M = new ParameterExpr("M", 2, 100, 6);
    this.addParameter(N);
    this.addParameter(M);
    var PSY = new OutputExpr("PSY",
        new MulExpr(
            new DivExpr(
                new CountExpr(
                    new GtExpr(
                        new CloseExpr(),
                        new RefExpr(new CloseExpr(), new ConstExpr(1))
                    ),
                    N
                ),
                N
            ),
            new ConstExpr(100)
        )
    );
    this.addOutput(PSY);
    var PSYMA = new OutputExpr("PSYMA",
        new MaExpr(PSY, M)
    );
    this.addOutput(PSYMA);
};
PSYIndicator.prototype.getName = function() {
    return "PSY";
};
var STOCHRSIIndicator = create_class(Indicator);
STOCHRSIIndicator.prototype.__construct = function() {
    STOCHRSIIndicator.__super.__construct.call(this);
    var N = new ParameterExpr("N", 3, 100, 14);
    var M = new ParameterExpr("M", 3, 100, 14);
    var P1 = new ParameterExpr("P1", 2, 50, 3);
    var P2 = new ParameterExpr("P2", 2, 50, 3);
    this.addParameter(N);
    this.addParameter(M);
    this.addParameter(P1);
    this.addParameter(P2);
    var LC = new AssignExpr("LC",
        new RefExpr(new CloseExpr(), new ConstExpr(1))
    );
    this.addAssign(LC);
    var CLOSE_LC = new AssignExpr("CLOSE_LC",
        new SubExpr(new CloseExpr(), LC)
    );
    this.addAssign(CLOSE_LC);
    var RSI = new AssignExpr("RSI",
        new MulExpr(
            new DivExpr(
                new SmaExpr(new MaxExpr(CLOSE_LC, new ConstExpr(0)), N, new ConstExpr(1)),
                new SmaExpr(new AbsExpr(CLOSE_LC), N, new ConstExpr(1))
            ),
            new ConstExpr(100)
        )
    );
    this.addAssign(RSI);
    var STOCHRSI = new OutputExpr("STOCHRSI",
        new MulExpr(
            new DivExpr(
                new MaExpr(
                    new SubExpr(
                        RSI,
                        new LlvExpr(RSI, M)
                    ),
                    P1
                ),
                new MaExpr(
                    new SubExpr(
                        new HhvExpr(RSI, M),
                        new LlvExpr(RSI, M)
                    ),
                    P1
                )
            ),
            new ConstExpr(100)
        )
    );
    this.addOutput(STOCHRSI);
    this.addOutput(new RangeOutputExpr("MA",
        new MaExpr(STOCHRSI, P2)
    ));
};
STOCHRSIIndicator.prototype.getName = function() {
    return "StochRSI";
};
/**
 * Created by Administrator on 2015/3/16.
 */
var Pushing = {
    State : { Uninitial : 0, Disable : 1, Enable : 2 },
    state : 0,
    marketFrom : '',
    type : '',
    moneyType : '',
    coinVol : '',
    time : '',
    Response : function(marketFrom, type, coinVol, data) {
        if (Pushing.state != Pushing.State.Enable)
            return;
        if (Pushing.marketFrom != marketFrom ||
            Pushing.type != type ||
            Pushing.coinVol != coinVol)
            return;
        GLOBAL_VAR.KLineData = data;
        if (ChartManager.getInstance().getChart()._money_type == 1) {
            var rate = ChartManager.getInstance().getChart()._usd_cny_rate;
            for (var i in GLOBAL_VAR.KLineData) {
                var e = GLOBAL_VAR.KLineData[i];
                e[1] = parseFloat((e[1] * rate).toFixed(2));
                e[2] = parseFloat((e[2] * rate).toFixed(2));
                e[3] = parseFloat((e[3] * rate).toFixed(2));
                e[4] = parseFloat((e[4] * rate).toFixed(2));
            }
        }
        try {
            if (!GLOBAL_VAR.chartMgr.updateData("frame0.k0", GLOBAL_VAR.KLineData)) {
                Pushing.Switch();
                ChartManager.getInstance().redraw('All', true);
                return;
            }
        } catch ( _ ) {
            Pushing.Switch();
            ChartManager.getInstance().redraw('All', true);
            return;
        }
        clear_refresh_counter();
        ChartManager.getInstance().redraw('All', true);
    },
    Start : function(callback) {
        Pushing.state = Pushing.State.Enable;
        Pushing.PushFrom = callback;
        ChartManager.getInstance().getChart().updateDataAndDisplay2();
    },
    Stop : function() {
        Pushing.state = Pushing.State.Disable;
        ChartManager.getInstance().getChart().updateDataAndDisplay2();
    },
    Switch : function() {
        if (Pushing.state == Pushing.State.Uninitial)
            return;
        if (Pushing.state == Pushing.State.Enable) {
            var chart = ChartManager.getInstance().getChart();
            Pushing.marketFrom = chart._market_from;
            Pushing.type = chart._time;
            Pushing.moneyType = chart._money_type;
            Pushing.coinVol = chart._contract_unit;
            GLOBAL_VAR.mark_from = Pushing.marketFrom;
            GLOBAL_VAR.time_type = Pushing.type;
            var marketString = '';
            if (Pushing.marketFrom == '0') marketString = 'btc_spot';
            else if (Pushing.marketFrom == '3') marketString = 'ltc_spot';
            else if (Pushing.marketFrom == '36') marketString = 'spot_coin';
            else if (Pushing.marketFrom == '17') marketString = 'btc_index';
            else if (Pushing.marketFrom == '18') marketString = 'ltc_index';
            else marketString = Chart.PushNameVar[Pushing.marketFrom];
            var now = 'OKCoin'+'.'+chart._market_from+'.'+chart._time+'.'+chart._money_type+'.'+chart._contract_unit;
            var org = ChartManager.getInstance().getDataSource('frame0.k0').getName();
            if (org != now) {
                chart.setTitle();
                ChartManager.getInstance().setCurrentDataSource('frame0.k0', now);
                ChartManager.getInstance().setNormalMode();
            }
            var f = GLOBAL_VAR.chartMgr.getDataSource("frame0.k0").getLastDate();
            Pushing.time = f;
            if (f != -1) {
                if (!Pushing.PushFrom)
                    return;
                Pushing.PushFrom(marketString, Pushing.marketFrom, Pushing.type, Pushing.coinVol, f);
                if (org != now)
                    clear_refresh_counter();
            } else {
                ChartManager.getInstance().getChart().updateDataAndDisplay2();
            }
        } else {
            ChartManager.getInstance().getChart().updateDataAndDisplay2();
        }
    }
};
/**
 * Created by Administrator on 2014/11/19.
 */
var Chart = create_class();
Chart._future_btc_market_num = new Array('0', '-1', '-1', '-1', '-1');
Chart._future_ltc_market_num = new Array('1', '-1', '-1', '-1', '-1');
Chart.PushNameVar = {};
Chart.PushNameCon = ['spot', 'this_week', 'next_week', 'month', 'quarter'];
Chart.strMarket = {
    'zh-cn': {'01':'当周 BTC ','02':'次周 BTC ','03':'全月 BTC ','04':'季度 BTC ',
        '11':'当周 LTC ','12':'次周 LTC ','13':'全月 LTC ','14':'季度 LTC '},
    'en-us': {'01':'BTC This Week ','02':'BTC Next Week ','03':'BTC Month ','04':'BTC Quarter ',
        '11':'LTC This Week ','12':'LTC Next Week ','13':'LTC Month ','14':'LTC Quarter '},
    'zh-tw': {'01':'當周 BTC ','02':'次周 BTC ','03':'全月 BTC ','04':'季度 BTC ',
        '11':'當周 LTC ','12':'次周 LTC ','13':'全月 LTC ','14':'季度 LTC '}
};
Chart.strPeriod = {
    'zh-cn': {'line':'(分时)','0':'(1分钟)','1':'(5分钟)','2':'(15分钟)','9':'(30分钟)','10':'(1小时)','3':'(日线)','4':'(周线)'
        ,'7':'(3分钟)', '11':'(2小时)','12':'(4小时)','13':'(6小时)','14':'(12小时)','15':'(3天)'},
    'en-us': {'line':'(Line)','0':'(1m)'   ,'1':'(5m)'   ,'2':'(15m)'   ,'9':'(30m)'   ,'10':'(1h)'   ,'3':'(1d)'  ,'4':'(1w)'
        ,'7':'(3m)', '11':'(2h)','12':'(4h)','13':'(6h)','14':'(12h)','15':'(3d)'},
    'zh-tw': {'line':'(分時)','0':'(1分钟)','1':'(5分钟)','2':'(15分钟)','9':'(30分钟)','10':'(1小時)','3':'(日线)','4':'(周线)'
        ,'7':'(3分钟)', '11':'(2小時)','12':'(4小時)','13':'(6小時)','14':'(12小時)','15':'(3天)'}
};
function getCoinType(str) {
    return parseInt(str.toString().charAt(8));
}
Chart.prototype.__construct = function () {
    this._data = null;
    this._charStyle = "CandleStick";
    this._depthData = {
        array : null,
        asks_count : 0,
        bids_count : 0,
        asks_si    : 0,
        asks_ei    : 0,
        bids_si    : 0,
        bids_ei    : 0
    };
    this._time          = '2';
    this._market_from   = '13';
    this._usd_cny_rate  = 1;
    this._money_type    = 0;
    this._contract_unit = 1;
    this.strIsLine = false;
    this.strCurrentMarket = 20141017001;
    this.strCurrentMarketType = 1;
};
Chart.prototype.setTitle = function() {
    var lang = ChartManager.getInstance().getLanguage();
    var str = 'OKCoin ';
    if (this._market_from == "0") {
        str += 'BTC';
    } else if (this._market_from == "3") {
        str += 'LTC';
    } else {
        var _1 = getCoinType(this.strCurrentMarket).toString()+this.strCurrentMarketType.toString();
        str += Chart.strMarket[lang][_1];
        str += this.strCurrentMarket.toString().slice(4,8);
    }
    str += ' ';
    str += this.strIsLine ? Chart.strPeriod[lang]['line'] : Chart.strPeriod[lang][this._time];
    ChartManager.getInstance().setTitle('frame0.k0', str);
};
Chart.prototype.setCurrentList = function() {
};
Chart.prototype.setKlineIndex = function(type) {
    this._market_from = type;
    this.updateDataAndDisplay();
};
Chart.prototype.setCurrentCoin = function(coin) {
    this._market_from = coin.toString();
    this.updateDataAndDisplay();
};
Chart.prototype.setFutureList = function(content) {
    var btc         = $('#chart_symbols_btc').find('span');
    var btc_li      = $('#chart_symbols_btc').find('li');
    this.btc_obj    = {};
    var ltc         = $('#chart_symbols_ltc').find('span');
    var ltc_li      = $('#chart_symbols_ltc').find('li');
    this.ltc_obj    = {};
    for (var i = 1; i <= 4; i++) {
        this.btc_obj[i.toString()] = {};
        this.btc_obj[i.toString()].id = 0;
        this.btc_obj[i.toString()].type = 0;
        this.btc_obj[i.toString()].text = $(btc[2*i-1]);
        this.btc_obj[i.toString()].obj  = $(btc_li[i-1]);
        this.btc_obj[i.toString()].obj.css('display', 'none');
        this.btc_obj[i.toString()].obj.attr('name', '0');
        this.ltc_obj[i.toString()] = {};
        this.ltc_obj[i.toString()].id = 0;
        this.ltc_obj[i.toString()].type = 0;
        this.ltc_obj[i.toString()].text = $(ltc[2*i-1]);
        this.ltc_obj[i.toString()].obj  = $(ltc_li[i-1]);
        this.ltc_obj[i.toString()].obj.css('display', 'none');
        this.ltc_obj[i.toString()].obj.attr('name', '0');
    }
    for (var i = 0; i < content.length; i++) {
        var id = content[i].contractID;
        var type = content[i].type;
        if (getCoinType(id) == 0) {
            this.btc_obj[type].id = id;
            this.btc_obj[type].type = type;
            this.btc_obj[type].text.html(id.toString().slice(4,8));
            this.btc_obj[type].obj.attr('name', id.toString());
            this.btc_obj[type].obj.css('display', 'block');
            Chart._future_btc_market_num[type] = id.toString().slice(id.toString().length-2);
        } else if (getCoinType(id) == 1) {
            this.ltc_obj[type].id = id;
            this.ltc_obj[type].type = type;
            this.ltc_obj[type].text.html(id.toString().slice(4,8));
            this.ltc_obj[type].obj.attr('name', id.toString());
            this.ltc_obj[type].obj.css('display', 'block');
            Chart._future_ltc_market_num[type] = id.toString().slice(id.toString().length-2);
        }
    }
    for (var i = 0; i < Chart._future_btc_market_num.length; i++) {
        var tmp = Chart._future_btc_market_num[i].toString();
        if (tmp != '-1')
            Chart.PushNameVar[tmp] = 'btc_'+Chart.PushNameCon[i];
    }
    for (var i = 0; i < Chart._future_ltc_market_num.length; i++) {
        var tmp = Chart._future_ltc_market_num[i].toString();
        if (tmp != '-1')
            Chart.PushNameVar[tmp] = 'ltc_'+Chart.PushNameCon[i];
    }
};
Chart.prototype.updateDataAndDisplay = function() {
    Pushing.Switch();
    /*
     GLOBAL_VAR.mark_from = this._market_from;
     GLOBAL_VAR.time_type = this._time;
     GLOBAL_VAR.limit = '1000';
     this.setTitle();
     ChartManager.getInstance().setCurrentDataSource('frame0.k0','OKCoin'+'.'+this._market_from+'.'+this._time+'.'+this._money_type+'.'+this._contract_unit);
     ChartManager.getInstance().setNormalMode();
     var f = GLOBAL_VAR.chartMgr.getDataSource("frame0.k0").getLastDate();
     if (f == -1) {
     GLOBAL_VAR.requestParam = setHttpRequestParam(GLOBAL_VAR.mark_from, GLOBAL_VAR.time_type, "1000", null);
     RequestData(true);
     } else {
     GLOBAL_VAR.requestParam = setHttpRequestParam(GLOBAL_VAR.mark_from, GLOBAL_VAR.time_type, null, f.toString());
     RequestData();
     }
     ChartManager.getInstance().redraw('All', false);
     */
};
Chart.prototype.updateDataAndDisplay2 = function() {
    GLOBAL_VAR.mark_from = this._market_from;
    GLOBAL_VAR.time_type = this._time;
    GLOBAL_VAR.limit = '1000';
    this.setTitle();
    ChartManager.getInstance().setCurrentDataSource('frame0.k0','OKCoin'+'.'+this._market_from+'.'+this._time+'.'+this._money_type+'.'+this._contract_unit);
    ChartManager.getInstance().setNormalMode();
    var f = GLOBAL_VAR.chartMgr.getDataSource("frame0.k0").getLastDate();
    if (f == -1) {
        GLOBAL_VAR.requestParam = setHttpRequestParam(GLOBAL_VAR.mark_from, GLOBAL_VAR.time_type, "1000", null);
        RequestData(true);
    } else {
        GLOBAL_VAR.requestParam = setHttpRequestParam(GLOBAL_VAR.mark_from, GLOBAL_VAR.time_type, null, f.toString());
        RequestData();
    }
    ChartManager.getInstance().redraw('All', false);
};
Chart.prototype.setCurrentFutureNoRaise = function(content) {
    $('#chart_dropdown_symbols li a').removeClass('selected');
    var _alias = content;
    var _type = 0;
    var btc_li = $('#chart_symbols_btc').find('li');
    var ltc_li = $('#chart_symbols_ltc').find('li');
    btc_li.each(function(){
        var str = $(this).attr('name');
        if (_alias.toString() == str) {
            $('#chart_dropdown_symbols .chart_dropdown_t').html($(this).html());
            $(this).find('a').addClass('selected');
        }
    });
    ltc_li.each(function(){
        var str = $(this).attr('name');
        if (_alias.toString() == str) {
            $('#chart_dropdown_symbols .chart_dropdown_t').html($(this).html());
            $(this).find('a').addClass('selected');
        }
    });
    for (var i in this.btc_obj) {
        if (this.btc_obj[i].id == _alias) {
            _type = this.ltc_obj[i].type;
            this._market_from = Chart._future_btc_market_num[this.btc_obj[i].type];
            this.strCurrentMarket = _alias;
            this.strCurrentMarketType = this.btc_obj[i].type;
            this.setTitle();
            break;
        }
    }
    for (var i in this.ltc_obj) {
        if (this.ltc_obj[i].id == _alias) {
            _type = this.ltc_obj[i].type;
            this._market_from = Chart._future_ltc_market_num[this.ltc_obj[i].type];
            this.strCurrentMarket = _alias;
            this.strCurrentMarketType = this.ltc_obj[i].type;
            this.setTitle();
            break;
        }
    }
    this.updateDataAndDisplay();
};
Chart.prototype.setCurrentFuture = function(content) {
    $('#chart_dropdown_symbols li a').removeClass('selected');
    var _alias = content;
    var _type = 0;
    var btc_li = $('#chart_symbols_btc').find('li');
    var ltc_li = $('#chart_symbols_ltc').find('li');
    btc_li.each(function(){
        var str = $(this).attr('name');
        if (_alias.toString() == str) {
            $('#chart_dropdown_symbols .chart_dropdown_t').html($(this).html());
            $(this).find('a').addClass('selected');
        }
    });
    ltc_li.each(function(){
        var str = $(this).attr('name');
        if (_alias.toString() == str) {
            $('#chart_dropdown_symbols .chart_dropdown_t').html($(this).html());
            $(this).find('a').addClass('selected');
        }
    });
    for (var i in this.btc_obj) {
        if (this.btc_obj[i].id == _alias) {
            _type = this.ltc_obj[i].type;
            this._market_from = Chart._future_btc_market_num[this.btc_obj[i].type];
            this.strCurrentMarket = _alias;
            this.strCurrentMarketType = this.btc_obj[i].type;
            this.setTitle();
            break;
        }
    }
    for (var i in this.ltc_obj) {
        if (this.ltc_obj[i].id == _alias) {
            _type = this.ltc_obj[i].type;
            this._market_from = Chart._future_ltc_market_num[this.ltc_obj[i].type];
            this.strCurrentMarket = _alias;
            this.strCurrentMarketType = this.ltc_obj[i].type;
            this.setTitle();
            break;
        }
    }
    var a = {};
    a.command = "set current future";
    a.content = _alias;
    $('#chart_output_interface_text').val(JSON.stringify(a));
    $('#chart_output_interface_submit').submit();
    window._current_future_change.raise(_alias, _type);
    this.updateDataAndDisplay();
};
Chart.prototype.setCurrentContractUnit = function(contractUnit) {
    if (contractUnit == 'btc') {
        if (this._contract_unit == 0) return;
        this._contract_unit = 0;
    } else if (contractUnit == 'piece') {
        if (this._contract_unit == 1) return;
        this._contract_unit = 1;
    }
    this.updateDataAndDisplay();
};
Chart.prototype.setCurrentMoneyType = function(moneyType) {
    if (moneyType == 'usd') {
        if (this._money_type == 0)
            return;
        this._money_type = 0;
    } else if (moneyType == 'cny') {
        if (this._money_type == 1)
            return;
        this._money_type = 1;
    }
    this.updateDataAndDisplay();
};
Chart.prototype.setCurrentPeriod = function(period) {
    this._time = GLOBAL_VAR.periodMap[period];
    this.updateDataAndDisplay();
};
Chart.prototype.updateDataSource = function(data) {
    this._data = data;
    ChartManager.getInstance().updateData("frame0.k0", this._data);
};
Chart.prototype.updateDepth = function(array) {
    if (array == null)
        return;
    if (!array.asks || !array.bids)
        return;
    var _data = this._depthData;
    _data.array = [];
    for (var i = 0; i < array.asks.length; i++) {
        var data = {};
        data.rate = array.asks[i][0];
        data.amount = array.asks[i][1];
        _data.array.push(data);
    }
    for (var i = 0; i < array.bids.length; i++) {
        var data = {};
        data.rate = array.bids[i][0];
        data.amount = array.bids[i][1];
        _data.array.push(data);
    }
    _data.asks_count = array.asks.length;
    _data.bids_count = array.bids.length;
    _data.asks_si = _data.asks_count - 1;
    _data.asks_ei = 0;
    _data.bids_si = _data.asks_count;
    _data.bids_ei = _data.asks_count + _data.bids_count - 1;
    for (var i = _data.asks_si; i >= _data.asks_ei; i--) {
        if (i == _data.asks_si) {
            _data.array[i].amounts = _data.array[i].amount;
        } else {
            _data.array[i].amounts = _data.array[i + 1].amounts + _data.array[i].amount;
        }
    }
    for (var i = _data.bids_si; i <= _data.bids_ei; i++) {
        if (i == _data.bids_si) {
            _data.array[i].amounts = _data.array[i].amount;
        } else {
            _data.array[i].amounts = _data.array[i - 1].amounts + _data.array[i].amount;
        }
    }
    ChartManager.getInstance().redraw('All', false);
};
Chart.prototype.setMainIndicator = function(indicName) {
    this._mainIndicator = indicName;
    if (indicName == 'NONE') {
        ChartManager.getInstance().removeMainIndicator('frame0.k0');
    } else {
        ChartManager.getInstance().setMainIndicator('frame0.k0', indicName);
    }
    ChartManager.getInstance().redraw('All', true);
};
Chart.prototype.setIndicator = function(index, indicName) {
    if (indicName == 'NONE') {
        var index = 2;
        if (Template.displayVolume == false)
            index = 1;
        var areaName = ChartManager.getInstance().getIndicatorAreaName('frame0.k0',index);
        if (areaName != '')
            ChartManager.getInstance().removeIndicator(areaName);
    } else {
        var index = 2;
        if (Template.displayVolume == false)
            index = 1;
        var areaName = ChartManager.getInstance().getIndicatorAreaName('frame0.k0',index);
        if (areaName == '') {
            Template.createIndicatorChartComps('frame0.k0', indicName);
        } else {
            ChartManager.getInstance().setIndicator(areaName, indicName);
        }
    }
    ChartManager.getInstance().redraw('All', true);
};
Chart.prototype.addIndicator = function(indicName) {
    ChartManager.getInstance().addIndicator(indicName);
    ChartManager.getInstance().redraw('All', true);
};
Chart.prototype.removeIndicator = function(indicName) {
    var areaName = ChartManager.getInstance().getIndicatorAreaName(2);
    ChartManager.getInstance().removeIndicator(areaName);
    ChartManager.getInstance().redraw('All', true);
};
var CName = create_class();
CName.prototype.__construct = function(name) {
    this._names = [];
    this._comps = [];
    if (name instanceof CName) {
        this._names = name._names;
        this._comps = name._comps;
    }
    else {
        var comps = name.split(".");
        var dotNum = comps.length - 1;
        if (dotNum > 0) {
            this._comps = comps;
            this._names.push(comps[0]);
            for (var i = 1; i <= dotNum; i++) {
                this._names.push(this._names[i - 1] + "." + comps[i]);
            }
        } else {
            this._comps.push(name);
            this._names.push(name);
        }
    }
};
CName.prototype.getCompAt = function(index) {
    if (index >= 0 && index < this._comps.length)
        return this._comps[index];
    return "";
};
CName.prototype.getName = function(index) {
    if (index < 0) {
        if (this._names.length > 0)
            return this._names[this._names.length - 1];
    }
    else if (index < this._names.length) {
        return this._names[index];
    }
    return "";
};
var NamedObject = create_class();
NamedObject.prototype.__construct = function(name) {
    this._name = name;
    this._nameObj = new CName(name);
};
NamedObject.prototype.getFrameName = function() {
    return this._nameObj.getName(0);
};
NamedObject.prototype.getDataSourceName = function() {
    return this._nameObj.getName(1);
};
NamedObject.prototype.getAreaName = function() {
    return this._nameObj.getName(2);
};
NamedObject.prototype.getName = function() {
    return this._nameObj.getName(-1);
};
NamedObject.prototype.getNameObject = function() {
    return this._nameObj;
};
var ChartArea = create_class(NamedObject);
ChartArea.prototype.__construct = function(name) {
    ChartArea.__super.__construct.call(this, name);
    this._left = 0;
    this._top = 0;
    this._right = 0;
    this._bottom = 0;
    this._changed = false;
    this._highlighted = false;
    this._pressed = false;
    this._selected = false;
    this.Measuring = new MEvent();
};
ChartArea.DockStyle = {Left: 0, Top: 1, Right: 2, Bottom: 3, Fill: 4};
ChartArea.prototype.getDockStyle = function() {
    return this._dockStyle;
};
ChartArea.prototype.setDockStyle = function(dockStyle) {
    this._dockStyle = dockStyle;
};
ChartArea.prototype.getLeft = function() {
    return this._left;
};
ChartArea.prototype.getTop = function() {
    return this._top;
};
ChartArea.prototype.setTop = function(v) {
    if (this._top != v) {
        this._top = v;
        this._changed = true;
    }
};
ChartArea.prototype.getRight = function() {
    return this._right;
};
ChartArea.prototype.getBottom = function() {
    return this._bottom;
};
ChartArea.prototype.setBottom = function(v) {
    if (this._bottom != v) {
        this._bottom = v;
        this._changed = true;
    }
};
ChartArea.prototype.getCenter = function() {
    return (this._left + this._right) >> 1;
};
ChartArea.prototype.getMiddle = function() {
    return (this._top + this._bottom) >> 1;
};
ChartArea.prototype.getWidth = function() {
    return this._right - this._left;
};
ChartArea.prototype.getHeight = function() {
    return this._bottom - this._top;
};
ChartArea.prototype.getRect = function() {
    return {
        X: this._left,
        Y: this._top,
        Width: this._right - this._left,
        Height: this._bottom - this._top
    };
};
ChartArea.prototype.contains = function(x, y) {
    if (x >= this._left && x < this._right)
        if (y >= this._top && y < this._bottom)
            return [this];
    return null;
};
ChartArea.prototype.getMeasuredWidth = function() {
    return this._measuredWidth;
};
ChartArea.prototype.getMeasuredHeight = function() {
    return this._measuredHeight;
};
ChartArea.prototype.setMeasuredDimension = function(width, height) {
    this._measuredWidth = width;
    this._measuredHeight = height;
};
ChartArea.prototype.measure = function(context, width, height) {
    this._measuredWidth = 0;
    this._measuredHeight = 0;
    this.Measuring.raise(this, {Width : width, Height : height});
    if (this._measuredWidth == 0 && this._measuredHeight == 0)
        this.setMeasuredDimension(width, height);
};
ChartArea.prototype.layout = function(left, top, right, bottom, forceChange) {
    left <<= 0;
    if (this._left != left) {
        this._left = left;
        this._changed = true;
    }
    top <<= 0;
    if (this._top != top) {
        this._top = top;
        this._changed = true;
    }
    right <<= 0;
    if (this._right != right) {
        this._right = right;
        this._changed = true;
    }
    bottom <<= 0;
    if (this._bottom != bottom) {
        this._bottom = bottom;
        this._changed = true;
    }
    if (forceChange)
        this._changed = true;
};
ChartArea.prototype.isChanged = function () {
    return this._changed;
};
ChartArea.prototype.setChanged = function (v) {
    this._changed = v;
};
ChartArea.prototype.isHighlighted = function () {
    return this._highlighted;
};
ChartArea.prototype.getHighlightedArea = function () {
    return this._highlighted ? this : null;
};
ChartArea.prototype.highlight = function (area) {
    this._highlighted = (this == area);
    return this._highlighted ? this : null;
};
ChartArea.prototype.isPressed = function () {
    return this._pressed;
};
ChartArea.prototype.setPressed = function (v) {
    this._pressed = v;
};
ChartArea.prototype.isSelected = function () {
    return this._selected;
};
ChartArea.prototype.getSelectedArea = function () {
    return this._selected ? this : null;
};
ChartArea.prototype.select = function (area) {
    this._selected = (this == area);
    return this._selected ? this : null;
};
ChartArea.prototype.onMouseMove = function (x, y) { return null; };
ChartArea.prototype.onMouseLeave = function (x, y) {};
ChartArea.prototype.onMouseDown = function (x, y) { return null; };
ChartArea.prototype.onMouseUp = function (x, y) { return null; };
var MainArea = create_class(ChartArea);
MainArea.prototype.__construct = function (name) {
    MainArea.__super.__construct.call(this, name);
    this._dragStarted = false;
    this._oldX = 0;
    this._oldY = 0;
    this._passMoveEventToToolManager = true;
};
MainArea.prototype.onMouseMove = function (x, y) {
    var mgr = ChartManager.getInstance();
    if (mgr._capturingMouseArea == this)
        if (this._dragStarted == false)
            if (Math.abs(this._oldX - x) > 1 || Math.abs(this._oldY - y) > 1)
                this._dragStarted = true;
    if (this._dragStarted) {
        mgr.hideCursor();
        if (mgr.onToolMouseDrag(this.getFrameName(), x, y))
            return this;
        mgr.getTimeline(this.getDataSourceName()).move(x - this._oldX);
        return this;
    }
    if (this._passMoveEventToToolManager && mgr.onToolMouseMove(this.getFrameName(), x, y)) {
        mgr.hideCursor();
        return this;
    }
    switch (mgr._drawingTool) {
        case ChartManager.DrawingTool.Cursor:
            mgr.showCursor();
            break;
        case ChartManager.DrawingTool.CrossCursor:
            if (mgr.showCrossCursor(this, x, y))
                mgr.hideCursor();
            else
                mgr.showCursor();
            break;
        default:
            mgr.hideCursor();
            break;
    }
    return this;
};
MainArea.prototype.onMouseLeave = function (x, y) {
    this._dragStarted = false;
    this._passMoveEventToToolManager = true;
};
MainArea.prototype.onMouseDown = function (x, y) {
    var mgr = ChartManager.getInstance();
    mgr.getTimeline(this.getDataSourceName()).startMove();
    this._oldX = x;
    this._oldY = y;
    this._dragStarted = false;
    if (mgr.onToolMouseDown(this.getFrameName(), x, y))
        this._passMoveEventToToolManager = false;
    return this;
};
MainArea.prototype.onMouseUp = function (x, y) {
    var mgr = ChartManager.getInstance();
    var ret = null;
    if (this._dragStarted) {
        this._dragStarted = false;
        ret = this;
    }
    if (mgr.onToolMouseUp(this.getFrameName(), x, y))
        ret = this;
    this._passMoveEventToToolManager = true;
    return ret;
};
var IndicatorArea = create_class(ChartArea);
IndicatorArea.prototype.__construct = function (name) {
    IndicatorArea.__super.__construct.call(this, name);
    this._dragStarted = false;
    this._oldX = 0;
    this._oldY = 0;
};
IndicatorArea.prototype.onMouseMove = function (x, y) {
    var mgr = ChartManager.getInstance();
    if (mgr._capturingMouseArea == this)
        if (this._dragStarted == false)
            if (this._oldX != x || this._oldY != y)
                this._dragStarted = true;
    if (this._dragStarted) {
        mgr.hideCursor();
        mgr.getTimeline(this.getDataSourceName()).move(x - this._oldX);
        return this;
    }
    switch (mgr._drawingTool) {
        case ChartManager.DrawingTool.CrossCursor:
            if (mgr.showCrossCursor(this, x, y))
                mgr.hideCursor();
            else
                mgr.showCursor();
            break;
        default:
            mgr.showCursor();
            break;
    }
    return this;
};
IndicatorArea.prototype.onMouseLeave = function (x, y) {
    this._dragStarted = false;
};
IndicatorArea.prototype.onMouseDown = function (x, y) {
    var mgr = ChartManager.getInstance();
    mgr.getTimeline(this.getDataSourceName()).startMove();
    this._oldX = x;
    this._oldY = y;
    this._dragStarted = false;
    return this;
};
IndicatorArea.prototype.onMouseUp = function (x, y) {
    if (this._dragStarted) {
        this._dragStarted = false;
        return this;
    }
    return null;
};
var MainRangeArea = create_class(ChartArea);
MainRangeArea.prototype.__construct = function (name) {
    MainRangeArea.__super.__construct.call(this, name);
};
MainRangeArea.prototype.onMouseMove = function (x, y) {
    ChartManager.getInstance().showCursor();
    return this;
};
var IndicatorRangeArea = create_class(ChartArea);
IndicatorRangeArea.prototype.__construct = function (name) {
    IndicatorRangeArea.__super.__construct.call(this, name);
};
IndicatorRangeArea.prototype.onMouseMove = function (x, y) {
    ChartManager.getInstance().showCursor();
    return this;
};
var TimelineArea = create_class(ChartArea);
TimelineArea.prototype.__construct = function (name) {
    TimelineArea.__super.__construct.call(this, name);
};
TimelineArea.prototype.onMouseMove = function (x, y) {
    ChartManager.getInstance().showCursor();
    return this;
};
var ChartAreaGroup = create_class(ChartArea);
ChartAreaGroup.prototype.__construct = function(name) {
    ChartAreaGroup.__super.__construct.call(this, name);
    this._areas = [];
    this._highlightedArea = null;
    this._selectedArea = null;
};
ChartAreaGroup.prototype.contains = function(x, y) {
    var areas;
    var a, i, cnt = this._areas.length;
    for (i = 0; i < cnt; i++) {
        a = this._areas[i];
        areas = a.contains(x, y);
        if (areas != null) {
            areas.push(this);
            return areas;
        }
    }
    return ChartAreaGroup.__super.contains(x, y);
};
ChartAreaGroup.prototype.getAreaCount = function() {
    return this._areas.length;
};
ChartAreaGroup.prototype.getAreaAt = function(index) {
    if (index < 0 || index >= this._areas.length)
        return null;
    return this._areas[index];
};
ChartAreaGroup.prototype.addArea = function(area) {
    this._areas.push(area);
};
ChartAreaGroup.prototype.removeArea = function(area) {
    var i, cnt = this._areas.length;
    for (i = 0; i < cnt; i++) {
        if (area == this._areas[i]) {
            this._areas.splice(i);
            this.setChanged(true);
            break;
        }
    }
};
ChartAreaGroup.prototype.getGridColor = function () {
    return this._gridColor;
};
ChartAreaGroup.prototype.setGridColor = function (c) {
    this._gridColor = c;
};
ChartAreaGroup.prototype.getHighlightedArea = function () {
    if (this._highlightedArea != null)
        return this._highlightedArea.getHighlightedArea();
    return null;
};
ChartAreaGroup.prototype.highlight = function (area) {
    this._highlightedArea = null;
    var e, i, cnt = this._areas.length;
    for (i = 0; i < cnt; i++) {
        e = this._areas[i].highlight(area);
        if (e != null) {
            this._highlightedArea = e;
            return this;
        }
    }
    return null;
};
ChartAreaGroup.prototype.getSelectedArea = function () {
    if (this._selectedArea != null)
        return this._selectedArea.getSelectedArea();
    return null;
};
ChartAreaGroup.prototype.select = function (area) {
    this._selectedArea = null;
    var e, i, cnt = this._areas.length;
    for (i = 0; i < cnt; i++) {
        e = this._areas[i].select(area);
        if (e != null) {
            this._selectedArea = e;
            return this;
        }
    }
    return null;
};
ChartAreaGroup.prototype.onMouseLeave = function (x, y) {
    var i, cnt = this._areas.length;
    for (i = 0; i < cnt; i++)
        this._areas[i].onMouseLeave(x, y);
};
ChartAreaGroup.prototype.onMouseUp = function (x, y) {
    var a, i, cnt = this._areas.length;
    for (i = 0; i < cnt; i++) {
        a = this._areas[i].onMouseUp(x, y);
        if (a != null)
            return a;
    }
    return null;
};
var TableLayout = create_class(ChartAreaGroup);
TableLayout.prototype.__construct = function(name){
    TableLayout.__super.__construct.call(this, name);
    this._nextRowId = 0;
    this._focusedRowIndex = -1;
};
TableLayout.prototype.getNextRowId = function() {
    return this._nextRowId++;
};
TableLayout.prototype.measure = function(context, width, height) {
    this.setMeasuredDimension(width, height);
    var rowH, prevH = 0, totalH = 0;
    var h, rows;
    var rh = [];
    var i, cnt = this._areas.length;
    for (i = 0; i < cnt; i += 2) {
        rowH = this._areas[i].getHeight();
        if (rowH == 0) {
            if (i == 0) {
                rows = (cnt + 1) >> 1;
                var n = (rows * 2) + 5;
                var nh = ((height / n) * 2) << 0;
                h = height;
                for (i = rows - 1; i > 0; i--) {
                    rh.unshift(nh);
                    h -= nh;
                }
                rh.unshift(h);
                break;
            }
            else if (i == 2) {
                rowH = prevH / 3;
            }
            else {
                rowH = prevH;
            }
        }
        totalH += rowH;
        prevH = rowH;
        rh.push(rowH);
    }
    if (totalH > 0) {
        var rate = height / totalH;
        rows = (cnt + 1) >> 1;
        h = height;
        for (i = rows - 1; i > 0; i--) {
            rh[i] *= rate;
            h -= rh[i];
        }
        rh[0] = h;
    }
    var nw = 8;
    var minRW = 64;
    var maxRW = Math.min(240, width >> 1);
    var rw = minRW;
    var mgr = ChartManager.getInstance();
    var timeline = mgr.getTimeline(this.getDataSourceName());
    if (timeline.getFirstIndex() >= 0) {
        var firstIndexes = [];
        for (rw = minRW; rw < maxRW; rw += nw)
            firstIndexes.push(
                timeline.calcFirstIndex(timeline.calcColumnCount(width - rw)));
        var lastIndex = timeline.getLastIndex();
        var dpNames = [".main", ".secondary"];
        var minmaxes = new Array(firstIndexes.length);
        var iArea, iIndex;
        for (iArea = 0, iIndex = 0, rw = minRW;
             iArea < this._areas.length && iIndex < firstIndexes.length;
             iArea += 2)
        {
            var area = this._areas[iArea];
            var plotter = mgr.getPlotter(area.getName() + "Range.main");
            for (var iDp in dpNames) {
                var dp = mgr.getDataProvider(area.getName() + dpNames[iDp]);
                if (dp == undefined)
                    continue;
                dp.calcRange(firstIndexes, lastIndex, minmaxes, null);
                while (iIndex < firstIndexes.length) {
                    var minW = plotter.getRequiredWidth(context, minmaxes[iIndex].min);
                    var maxW = plotter.getRequiredWidth(context, minmaxes[iIndex].max);
                    if (Math.max(minW, maxW) < rw)
                        break;
                    iIndex++;
                    rw += nw;
                }
            }
        }
    }
    for (i = 1; i < this._areas.length; i += 2) {
        this._areas[i].measure(context, rw, rh[i >> 1]);
    }
    var lw = width - rw;
    for (i = 0; i < this._areas.length; i += 2) {
        this._areas[i].measure(context, lw, rh[i >> 1]);
    }
};
TableLayout.prototype.layout = function(left, top, right, bottom, forceChange) {
    TableLayout.__super.layout.call(this, left, top, right, bottom, forceChange);
    if (this._areas.length < 1)
        return;
    var area;
    var center = left + this._areas[0].getMeasuredWidth();
    var t = top, b;
    if (!forceChange)
        forceChange = this.isChanged();
    var i, cnt = this._areas.length;
    for (i = 0; i < cnt; i++) {
        area = this._areas[i];
        b = t + area.getMeasuredHeight();
        area.layout(left, t, center, b, forceChange);
        i++;
        area = this._areas[i];
        area.layout(center, t, this.getRight(), b, forceChange);
        t = b;
    }
    this.setChanged(false);
};
TableLayout.prototype.drawGrid = function(context) {
    if (this._areas.length < 1)
        return;
    var mgr = ChartManager.getInstance();
    var theme = mgr.getTheme(this.getFrameName());
    context.fillStyle = theme.getColor(Theme.Color.Grid1);
    context.fillRect(this._areas[0].getRight(), this.getTop(), 1, this.getHeight());
    var i, cnt = this._areas.length - 2;
    for (i = 0; i < cnt; i += 2)
        context.fillRect(this.getLeft(), this._areas[i].getBottom(), this.getWidth(), 1);
    if (!mgr.getCaptureMouseWheelDirectly()) {
        for (i = 0, cnt += 2; i < cnt; i += 2) {
            if (this._areas[i].isSelected()) {
                context.strokeStyle = theme.getColor(Theme.Color.Indicator1);
                context.strokeRect(
                    this.getLeft() + 0.5, this.getTop() + 0.5,
                    this.getWidth() - 1, this.getHeight() - 1);
                break;
            }
        }
    }
};
TableLayout.prototype.highlight = function (area) {
    this._highlightedArea = null;
    var e, i, cnt = this._areas.length;
    for (i = 0; i < cnt; i++) {
        e = this._areas[i];
        if (e == area) {
            i &= ~1;
            e = this._areas[i];
            e.highlight(e);
            this._highlightedArea = e;
            i++;
            e = this._areas[i];
            e.highlight(null);
            e.highlight(e);
        } else {
            e.highlight(null);
        }
    }
    return this._highlightedArea != null ? this : null;
};
TableLayout.prototype.select = function (area) {
    this._selectedArea = null;
    var e, i, cnt = this._areas.length;
    for (i = 0; i < cnt; i++) {
        e = this._areas[i];
        if (e == area) {
            i &= ~1;
            e = this._areas[i];
            e.select(e);
            this._selectedArea = e;
            i++;
            e = this._areas[i];
            e.select(e);
        } else {
            e.select(null);
        }
    }
    return this._selectedArea != null ? this : null;
};
TableLayout.prototype.onMouseMove = function (x, y) {
    if (this._focusedRowIndex >= 0) {
        var upper = this._areas[this._focusedRowIndex];
        var lower = this._areas[this._focusedRowIndex + 2];
        var d = y - this._oldY;
        if (d == 0)
            return this;
        var upperBottom = this._oldUpperBottom + d;
        var lowerTop = this._oldLowerTop + d;
        if (upperBottom - upper.getTop() >= 60 && lower.getBottom() - lowerTop >= 60) {
            upper.setBottom(upperBottom);
            lower.setTop(lowerTop);
        }
        return this;
    }
    var i, cnt = this._areas.length - 2;
    for (i = 0; i < cnt; i += 2) {
        var b = this._areas[i].getBottom();
        if (y >= b - 4 && y < b + 4) {
            ChartManager.getInstance().showCursor('n-resize');
            return this;
        }
    }
    return null;
};
TableLayout.prototype.onMouseLeave = function (x, y) {
    this._focusedRowIndex = -1;
};
TableLayout.prototype.onMouseDown = function (x, y) {
    var i, cnt = this._areas.length - 2;
    for (i = 0; i < cnt; i += 2) {
        var b = this._areas[i].getBottom();
        if (y >= b - 4 && y < b + 4) {
            this._focusedRowIndex = i;
            this._oldY = y;
            this._oldUpperBottom = b;
            this._oldLowerTop = this._areas[i + 2].getTop();
            return this;
        }
    }
    return null;
};
TableLayout.prototype.onMouseUp = function (x, y) {
    if (this._focusedRowIndex >= 0) {
        this._focusedRowIndex = -1;
        var i, cnt = this._areas.length;
        var height = [];
        for (i = 0; i < cnt; i += 2) {
            height.push(this._areas[i].getHeight());
        }
        ChartSettings.get().charts.areaHeight = height;
        ChartSettings.save();
    }
    return this;
};
var DockableLayout = create_class(ChartAreaGroup);
DockableLayout.prototype.__construct=function(name){
    DockableLayout.__super.__construct.call(this, name);
};
DockableLayout.prototype.measure = function(context, width, height) {
    DockableLayout.__super.measure.call(this, context, width, height);
    width = this.getMeasuredWidth();
    height = this.getMeasuredHeight();
    for (var i in this._areas) {
        var area = this._areas[i];
        area.measure(context, width, height);
        switch (area.getDockStyle()) {
            case ChartArea.DockStyle.left:
            case ChartArea.DockStyle.Right:
                width -= area.getMeasuredWidth();
                break;
            case ChartArea.DockStyle.Top:
            case ChartArea.DockStyle.Bottom:
                height -= area.getMeasuredHeight();
                break;
            case ChartArea.DockStyle.Fill:
                width = 0;
                height = 0;
                break;
        }
    }
};
DockableLayout.prototype.layout = function(left, top, right, bottom, forceChange) {
    DockableLayout.__super.layout.call(this, left, top, right, bottom, forceChange);
    left = this.getLeft();
    top = this.getTop();
    right = this.getRight();
    bottom = this.getBottom();
    var w, h;
    if (!forceChange)
        forceChange = this.isChanged();
    for (var i in this._areas){
        var area = this._areas[i];
        switch (area.getDockStyle()) {
            case ChartArea.DockStyle.left:
                w = area.getMeasuredWidth();
                area.layout(left, top, left + w, bottom, forceChange);
                left += w;
                break;
            case ChartArea.DockStyle.Top:
                h = area.getMeasuredHeight();
                area.layout(left, top, right, top + h, forceChange);
                top += h;
                break;
            case ChartArea.DockStyle.Right:
                w = area.getMeasuredWidth();
                area.layout(right - w, top, right, bottom, forceChange);
                right -= w;
                break;
            case ChartArea.DockStyle.Bottom:
                h = area.getMeasuredHeight();
                area.layout(left, bottom - h, right, bottom, forceChange);
                bottom -= h;
                break;
            case ChartArea.DockStyle.Fill:
                area.layout(left, top, right, bottom, forceChange);
                left = right;
                top = bottom;
                break;
        }
    }
    this.setChanged(false);
};
DockableLayout.prototype.drawGrid = function(context) {
    var mgr = ChartManager.getInstance();
    var theme = mgr.getTheme(this.getFrameName());
    var left = this.getLeft();
    var top = this.getTop();
    var right = this.getRight();
    var bottom = this.getBottom();
    context.fillStyle = theme.getColor(this._gridColor);
    for (var i in this._areas) {
        var area = this._areas[i];
        switch (area.getDockStyle()) {
            case ChartArea.DockStyle.Left:
                context.fillRect(area.getRight(), top, 1, bottom - top);
                left += area.getWidth();
                break;
            case ChartArea.DockStyle.Top:
                context.fillRect(left, area.getBottom(), right - left, 1);
                top += area.getHeight();
                break;
            case ChartArea.DockStyle.Right:
                context.fillRect(area.getLeft(), top, 1, bottom - top);
                right -= area.getWidth();
                break;
            case ChartArea.DockStyle.Bottom:
                context.fillRect(left, area.getTop(), right - left, 1);
                bottom -= area.getHeight();
                break;
        }
    }
};
var ChartManager = create_class();
ChartManager.DrawingTool = {
    Cursor : 0, CrossCursor : 1, DrawLines : 2, DrawFibRetrace : 3, DrawFibFans : 4,
    SegLine : 5, StraightLine : 6, ArrowLine : 7, RayLine : 8,
    HoriStraightLine : 9, HoriRayLine : 10, HoriSegLine : 11, VertiStraightLine : 12,
    PriceLine : 13,
    BiParallelLine : 14, BiParallelRayLine : 15, TriParallelLine : 16,
    BandLine : 17
};
ChartManager._instance = null;
ChartManager.getInstance = function () {
    if (ChartManager._instance == null)
        ChartManager._instance = new ChartManager();
    return ChartManager._instance;
};
ChartManager.prototype.__construct = function () {
    this._dataSources = {};
    this._dataSourceCache = {};
    this._dataProviders = {};
    this._frames = {};
    this._areas = {};
    this._timelines = {};
    this._ranges = {};
    this._plotters = {};
    this._themes = {};
    this._titles = {};
    this._frameMousePos = {};
    this._dsChartStyle = {};
    this._dragStarted = false;
    this._oldX = 0;
    this._fakeIndicators = {};
    this._captureMouseWheelDirectly = true;
    this._chart = {};
    this._chart.defaultFrame = new Chart();
    this._drawingTool = ChartManager.DrawingTool["CrossCursor"];
    this._beforeDrawingTool = this._drawingTool;
    this._language = "zh-cn";
    this._mainCanvas = null;
    this._overlayCanvas = null;
    this._mainContext = null;
    this._overlayContext = null;
};
/**
 * redraw.
 * @param layer
 *   "all", "main", "overlay"
 */
ChartManager.prototype.redraw = function (layer, refresh) {
    if (layer == undefined || refresh)
        layer = "All";
    if (layer == "All" || layer == "MainCanvas") {
        if (refresh){
            this.getFrame("frame0").setChanged(true);
            this._mainContext.clearRect(
                0, 0, this._mainCanvas.width, this._mainCanvas.height);
        }
        this.layout(this._mainContext, "frame0",
            0, 0, this._mainCanvas.width, this._mainCanvas.height);
        this.drawMain("frame0", this._mainContext);
    }
    if (layer == "All" || layer == "OverlayCanvas") {
        this._overlayContext.clearRect(
            0, 0, this._overlayCanvas.width, this._overlayCanvas.height);
        this.drawOverlay("frame0", this._overlayContext);
    }
};
/**
 * bindCanvas.
 * @param layer
 *   "main", "overlay"
 */
ChartManager.prototype.bindCanvas = function(layer, canvas) {
    if (layer == "main") {
        this._mainCanvas = canvas;
        this._mainContext = canvas.getContext("2d");
    }
    else if (layer == "overlay") {
        this._overlayCanvas = canvas;
        this._overlayContext = canvas.getContext("2d");
        if (this._captureMouseWheelDirectly)
            $(this._overlayCanvas).bind('mousewheel', mouseWheel);
    }
};
ChartManager.prototype.getCaptureMouseWheelDirectly = function () {
    return this._captureMouseWheelDirectly;
};
ChartManager.prototype.setCaptureMouseWheelDirectly = function (v) {
    this._captureMouseWheelDirectly = v;
    if (v)
        $(this._overlayCanvas).bind('mousewheel', mouseWheel);
    else
        $(this._overlayCanvas).unbind('mousewheel');
};
ChartManager.prototype.getChart = function(nouseParam) {
    return this._chart["defaultFrame"];
};
ChartManager.prototype.init = function() {
    delete this._ranges['frame0.k0.indic1'];
    delete this._ranges['frame0.k0.indic1Range'];
    delete this._areas['frame0.k0.indic1'];
    delete this._areas['frame0.k0.indic1Range'];
    DefaultTemplate.loadTemplate("frame0.k0","OKCoin","frame0.order","0.order","frame0.trade","0.trade");
    this.redraw('All', true);
};
ChartManager.prototype.setCurrentDrawingTool = function(paramTool) {
    // "Cursor" // "CrossCursor" // "DrawFibRetrace" // "DrawFibFans"
    // "SegLine" // "StraightLine" // "ArrowLine" // "RayLine"
    // "HoriStraightLine" // "HoriRayLine" // "HoriSegLine" // "VertiStraightLine"
    // "BiParallelLine" // "BiParallelRayLine" // "TriParallelLine"
    this._drawingTool = ChartManager.DrawingTool[paramTool];
    this.setRunningMode(this._drawingTool);
};
/**
 * Property: Language.
 * @param lang:
 *     "en-us" "zh-cn" "zh-tw"
 */
ChartManager.prototype.getLanguage = function () {
    return this._language;
};
ChartManager.prototype.setLanguage = function (lang) {
    this._language = lang;
};
/**
 * Property: ThemeName.
 * @param lang:
 *     "Dark" "Light"
 */
ChartManager.prototype.setThemeName = function (frameName, themeName) {
    if (themeName == undefined)
        themeName = "Dark";
    var theme;
    switch (themeName) {
        case "Light":
            theme = new LightTheme();
            break;
        default:
            themeName = "Dark";
            theme = new DarkTheme();
            break;
    }
    this._themeName = themeName;
    this.setTheme(frameName, theme);
    this.getFrame(frameName).setChanged(true);
};
/**
 * Property: ChartStyle.
 * @param style:
 *     "CandleStick" "CandleStickHLC" "OHLC"
 */
ChartManager.prototype.getChartStyle = function (dsName) {
    var chartStyle = this._dsChartStyle[dsName];
    if (chartStyle == undefined)
        return "CandleStick";
    return chartStyle;
};
ChartManager.prototype.setChartStyle = function (dsName, style) {
    if (this._dsChartStyle[dsName] == style)
        return;
    var areaName = dsName + ".main";
    var dpName = areaName + ".main";
    var plotterName = areaName + ".main";
    var dp, plotter;
    switch (style) {
        case "CandleStick":
        case "CandleStickHLC":
        case "OHLC":
            dp = this.getDataProvider(dpName);
            if (dp == undefined || !is_instance(dp, MainDataProvider)) {
                dp = new MainDataProvider(dpName);
                this.setDataProvider(dpName, dp);
                dp.updateData();
            }
            this.setMainIndicator(dsName, ChartSettings.get().charts.mIndic);
            switch (style) {
                case "CandleStick":
                    plotter = new CandlestickPlotter(plotterName);
                    break;
                case "CandleStickHLC":
                    plotter = new CandlestickHLCPlotter(plotterName);
                    break;
                case "OHLC":
                    plotter = new OHLCPlotter(plotterName);
                    break;
            }
            this.setPlotter(plotterName, plotter);
            plotter = new MinMaxPlotter(areaName + ".decoration");
            this.setPlotter(plotter.getName(), plotter);
            break;
        case "Line":
            dp = new IndicatorDataProvider(dpName);
            this.setDataProvider(dp.getName(), dp);
            dp.setIndicator(new HLCIndicator());
            this.removeMainIndicator(dsName);
            plotter = new IndicatorPlotter(plotterName);
            this.setPlotter(plotterName, plotter);
            this.removePlotter(areaName + ".decoration");
            break;
    }
    this.getArea(plotter.getAreaName()).setChanged(true);
    this._dsChartStyle[dsName] = style;
};
ChartManager.prototype.setNormalMode = function() {
    this._drawingTool = this._beforeDrawingTool;
    $(".chart_dropdown_data").removeClass("chart_dropdown-hover");
    $("#chart_toolpanel .chart_toolpanel_button").removeClass("selected");
    $("#chart_CrossCursor").parent().addClass("selected");
    if (this._drawingTool == ChartManager.DrawingTool.Cursor) {
        this.showCursor();
        $("#mode a").removeClass("selected");
        $("#chart_toolpanel .chart_toolpanel_button").removeClass("selected");
        $("#chart_Cursor").parent().addClass("selected");
    } else {
        this.hideCursor();
    }
};
ChartManager.prototype.setRunningMode = function(mode) {
    var pds = this.getDataSource("frame0.k0");
    var curr_o = pds.getCurrentToolObject();
    if (curr_o != null && curr_o.state != CToolObject.state.AfterDraw) {
        pds.delToolObject();
    }
    if (pds.getToolObjectCount() > 10) {
        this.setNormalMode();
        return;
    }
    this._drawingTool = mode;
    if (mode == ChartManager.DrawingTool.Cursor) {
        this.showCursor();
    } else {
    }
    switch (mode) {
        case ChartManager.DrawingTool.Cursor:
        {
            this._beforeDrawingTool = mode;
            break;
        }
        case ChartManager.DrawingTool.ArrowLine:
        {
            pds.addToolObject(new CArrowLineObject("frame0.k0"));
            break;
        }
        case ChartManager.DrawingTool.BandLine:
        {
            pds.addToolObject(new CBandLineObject("frame0.k0"));
            break;
        }
        case ChartManager.DrawingTool.BiParallelLine:
        {
            pds.addToolObject(new CBiParallelLineObject("frame0.k0"));
            break;
        }
        case ChartManager.DrawingTool.BiParallelRayLine:
        {
            pds.addToolObject(new CBiParallelRayLineObject("frame0.k0"));
            break;
        }
        case ChartManager.DrawingTool.CrossCursor:
        {
            this._beforeDrawingTool = mode;
            break;
        }
        case ChartManager.DrawingTool.DrawFibFans:
        {
            pds.addToolObject(new CFibFansObject("frame0.k0"));
            break;
        }
        case ChartManager.DrawingTool.DrawFibRetrace:
        {
            pds.addToolObject(new CFibRetraceObject("frame0.k0"));
            break;
        }
        case ChartManager.DrawingTool.DrawLines:
        {
            pds.addToolObject(new CStraightLineObject("frame0.k0"));
            break;
        }
        case ChartManager.DrawingTool.HoriRayLine:
        {
            pds.addToolObject(new CHoriRayLineObject("frame0.k0"));
            break;
        }
        case ChartManager.DrawingTool.HoriSegLine:
        {
            pds.addToolObject(new CHoriSegLineObject("frame0.k0"));
            break;
        }
        case ChartManager.DrawingTool.HoriStraightLine:
        {
            pds.addToolObject(new CHoriStraightLineObject("frame0.k0"));
            break;
        }
        case ChartManager.DrawingTool.PriceLine:
        {
            pds.addToolObject(new CPriceLineObject("frame0.k0"));
            break;
        }
        case ChartManager.DrawingTool.RayLine:
        {
            pds.addToolObject(new CRayLineObject("frame0.k0"));
            break;
        }
        case ChartManager.DrawingTool.SegLine:
        {
            pds.addToolObject(new CSegLineObject("frame0.k0"));
            break;
        }
        case ChartManager.DrawingTool.StraightLine:
        {
            pds.addToolObject(new CStraightLineObject("frame0.k0"));
            break;
        }
        case ChartManager.DrawingTool.TriParallelLine:
        {
            pds.addToolObject(new CTriParallelLineObject("frame0.k0"));
            break;
        }
        case ChartManager.DrawingTool.VertiStraightLine:
        {
            pds.addToolObject(new CVertiStraightLineObject("frame0.k0"));
            break;
        }
    }
};
ChartManager.prototype.getTitle = function (dsName) {
    return this._titles[dsName];
};
ChartManager.prototype.setTitle = function (dsName, title) {
    this._titles[dsName] = title;
};
ChartManager.prototype.setCurrentDataSource = function(dsName, dsAlias) {
    var cached = this.getCachedDataSource(dsAlias);
    if (cached != null) {
        this.setDataSource(dsName, cached, true);
    }
    else {
        var ds = this.getDataSource(dsName);
        if (ds != null) {
            if (is_instance(ds, MainDataSource)) {
                cached = new MainDataSource(dsAlias);
            }
            else if (is_instance(ds, CLiveOrderDataSource)) {
                cached = new CLiveOrderDataSource(dsAlias);
            }
            else if (is_instance(ds, CLiveTradeDataSource)) {
                cached = new CLiveTradeDataSource(dsAlias);
            }
            this.setDataSource(dsName, cached, true);
            this.setCachedDataSource(dsAlias, cached);
        }
    }
};
ChartManager.prototype.getDataSource = function (name) {
    return this._dataSources[name];
};
ChartManager.prototype.setDataSource = function (name, ds, forceRefresh) {
    this._dataSources[name] = ds;
    if (forceRefresh)
        this.updateData(name, null);
};
ChartManager.prototype.getCachedDataSource = function (name) {
    return this._dataSourceCache[name];
};
ChartManager.prototype.setCachedDataSource = function (name, ds) {
    this._dataSourceCache[name] = ds;
};
ChartManager.prototype.getDataProvider = function (name) {
    return this._dataProviders[name];
};
ChartManager.prototype.setDataProvider = function (name, dp) {
    this._dataProviders[name] = dp;
};
ChartManager.prototype.removeDataProvider = function (name) {
    delete this._dataProviders[name];
};
ChartManager.prototype.getFrame = function (name) {
    return this._frames[name];
};
ChartManager.prototype.setFrame = function(name, frame) {
    this._frames[name] = frame;
};
ChartManager.prototype.removeFrame = function(name) {
    delete this._frames[name];
};
ChartManager.prototype.getArea = function (name) {
    return this._areas[name];
};
ChartManager.prototype.setArea = function (name, area) {
    this._areas[name] = area;
};
ChartManager.prototype.removeArea = function (name) {
    delete this._areas[name];
};
ChartManager.prototype.getTimeline = function (name) {
    return this._timelines[name];
};
ChartManager.prototype.setTimeline = function (name, timeline) {
    this._timelines[name] = timeline;
};
ChartManager.prototype.removeTimeline = function (name) {
    delete this._timelines[name];
};
ChartManager.prototype.getRange = function (name) {
    return this._ranges[name];
};
ChartManager.prototype.setRange = function (name, range) {
    this._ranges[name] = range;
};
ChartManager.prototype.removeRange = function (name) {
    delete this._ranges[name];
};
ChartManager.prototype.getPlotter = function (name) {
    return this._plotters[name];
};
ChartManager.prototype.setPlotter = function(name, plotter) {
    this._plotters[name] = plotter;
};
ChartManager.prototype.removePlotter = function(name) {
    delete this._plotters[name];
};
ChartManager.prototype.getTheme = function (name) {
    return this._themes[name];
};
ChartManager.prototype.setTheme = function (name, theme) {
    this._themes[name] = theme;
};
ChartManager.prototype.getFrameMousePos = function(name, point)
{
    if (this._frameMousePos[name] != undefined){
        point.x = this._frameMousePos[name].x;
        point.y = this._frameMousePos[name].y;
    } else {
        point.x = -1;
        point.y = -1;
    }
};
ChartManager.prototype.setFrameMousePos = function(name, px, py)
{
    this._frameMousePos[name] = { x:px, y:py };
};
ChartManager.prototype.drawArea = function(context, area, plotterNames) {
    var areaName = area.getNameObject().getCompAt(2);
    if (areaName == "timeline") {
        if (area.getHeight() < 20)
            return;
    } else {
        if (area.getHeight() < 30)
            return;
    }
    if (area.getWidth() < 30)
        return;
    areaName = area.getName();
    var plotter;
    var i, cnt = plotterNames.length;
    for (i = 0; i < cnt; i++) {
        plotter = this._plotters[areaName + plotterNames[i]];
        if (plotter != undefined)
            plotter.Draw(context);
    }
};
ChartManager.prototype.drawAreaMain = function(context, area) {
    var ds = this._dataSources[area.getDataSourceName()];
    var plotterNames;
    if (ds.getDataCount() < 1)
        plotterNames = [".background"];
    else
        plotterNames = [".background", ".grid" , ".main" , ".secondary"];
    this.drawArea(context, area, plotterNames);
    area.setChanged(false);
};
ChartManager.prototype.drawAreaOverlay = function(context, area) {
    var ds = this._dataSources[area.getDataSourceName()];
    var plotterNames;
    if (ds.getDataCount() < 1)
        plotterNames = [".selection"];
    else
        plotterNames = [".decoration", ".selection", ".info", ".tool"];
    this.drawArea(context, area, plotterNames);
};
ChartManager.prototype.drawMain=function(frameName, context)
{
    drawn = false;
    /*
     it = m_drawAreas.begin();
     while (it != m_drawAreas.end()) {
     ChartArea* pArea = getArea(*it);
     if (pArea != null && pArea.getFrameName() == frameName) {
     DrawArea(*pArea, g);
     drawn = true;
     it = m_drawAreas.erase(it);
     } else {
     it++;
     }
     }
     it = m_drawDataSources.begin();
     while (it != m_drawDataSources.end()) {
     if ((*it).find(frameName + ".") != 0) {
     it++;
     continue;
     }
     DataSource* pDS = getDataSource(*it);
     if (pDS != null) {
     DrawDataSource(*it, g);
     drawn = true;
     it = m_drawDataSources.erase(it);
     } else {
     it = m_drawDataSources.erase(it);
     return;
     }
     }
     */
    if (!drawn) {
        for(var it in this._areas){
            if (this._areas[it].getFrameName() == frameName && !is_instance(this._areas[it], ChartAreaGroup))
                this.drawAreaMain(context, this._areas[it]);
        }
    }
    var e;
    for (var i in this._timelines) {
        e = this._timelines[i];
        if (e.getFrameName() == frameName)
            e.setUpdated(false);
    }
    for (var i in this._ranges) {
        e = this._ranges[i];
        if (e.getFrameName() == frameName)
            e.setUpdated(false);
    }
    for (var i in this._areas) {
        e = this._areas[i];
        if (e.getFrameName() == frameName)
            e.setChanged(false);
    }
};
ChartManager.prototype.drawOverlay = function(frameName, context)
{
    for (var n in this._areas) {
        var area = this._areas[n];
        if (is_instance(area, ChartAreaGroup))
            if (area.getFrameName() == frameName)
                area.drawGrid(context);
    }
    for (var n in this._areas) {
        var area = this._areas[n];
        if (is_instance(area, ChartAreaGroup) == false)
            if (area.getFrameName() == frameName)
                this.drawAreaOverlay(context, area);
    }
};
ChartManager.prototype.updateData = function (dsName, data) {
    var ds = this.getDataSource(dsName);
    if (ds == undefined)
        return;
    if (data != null) {
        if (!ds.update(data))
            return false;
        if (ds.getUpdateMode() == DataSource.UpdateMode.DoNothing)
            return true;
    } else {
        ds.setUpdateMode(DataSource.UpdateMode.Refresh);
    }
    var timeline = this.getTimeline(dsName);
    if (timeline != undefined)
        timeline.update();
    if (ds.getDataCount() < 1)
        return true;
    var dpNames = [".main", ".secondary"];
    var area, areaName;
    for (var n in this._areas) {
        area = this._areas[n];
        if (is_instance(area, ChartAreaGroup))
            continue;
        if (area.getDataSourceName() != dsName)
            continue;
        areaName = area.getName();
        for (var i = 0; i < dpNames.length; i++) {
            var dp = this.getDataProvider(areaName + dpNames[i]);
            if (dp != undefined)
                dp.updateData();
        }
    }
    return true;
};
ChartManager.prototype.updateRange = function (dsName) {
    var ds = this.getDataSource(dsName);
    if (ds.getDataCount() < 1)
        return;
    var dpNames = [".main", ".secondary"];
    var area, areaName;
    for (var n in this._areas) {
        area = this._areas[n];
        if (is_instance(area, ChartAreaGroup))
            continue;
        if (area.getDataSourceName() != dsName)
            continue;
        areaName = area.getName();
        for (var i = 0; i < dpNames.length; i++) {
            var dp = this.getDataProvider(areaName + dpNames[i]);
            if (dp != undefined)
                dp.updateRange();
        }
        var timeline = this.getTimeline(dsName);
        if (timeline != undefined && timeline.getMaxItemCount() > 0) {
            var range = this.getRange(areaName);
            if (range != undefined)
                range.update();
        }
    }
};
ChartManager.prototype.layout = function(context, frameName, left, top, right, bottom)
{
    var frame = this.getFrame(frameName);
    frame.measure(context, right - left, bottom - top);
    frame.layout(left, top, right, bottom);
    for (var n in this._timelines) {
        var e = this._timelines[n];
        if (e.getFrameName() == frameName)
            e.onLayout();
    }
    for (var n in this._dataSources) {
        if (n.substring(0, frameName.length) == frameName)
            this.updateRange(n);
    }
};
ChartManager.prototype.SelectRange = function(pArea, y) {
    var it;
    for (var ee in this._ranges) {
        var _1 = this._ranges[ee].getAreaName();
        var _2 = pArea.getName();
        if (_1 == _2)
            this._ranges[ee].selectAt(y);
        else
            this._ranges[ee].unselect();
    }
};
ChartManager.prototype.scale = function (s) {
    if (this._highlightedFrame == null)
        return;
    var hiArea = this._highlightedFrame.getHighlightedArea();
    if (this.getRange(hiArea.getName()) != undefined) {
        var dsName = hiArea.getDataSourceName();
        var timeline = this.getTimeline(dsName);
        if (timeline != null) {
            timeline.scale(s);
            this.updateRange(dsName);
        }
    }
};
ChartManager.prototype.showCursor = function (cursor) {
    if (cursor === undefined)
        cursor = 'default';
    this._mainCanvas.style.cursor = cursor;
    this._overlayCanvas.style.cursor = cursor;
};
ChartManager.prototype.hideCursor = function () {
    this._mainCanvas.style.cursor = 'none';
    this._overlayCanvas.style.cursor = 'none';
};
ChartManager.prototype.showCrossCursor = function (area, x, y) {
    var e = this.getRange(area.getName());
    if (e != undefined) {
        e.selectAt(y);
        e = this.getTimeline(area.getDataSourceName());
        if (e != undefined)
            if (e.selectAt(x))
                return true;
    }
    return false;
};
ChartManager.prototype.hideCrossCursor = function (exceptTimeline) {
    if (exceptTimeline != null) {
        for (var n in this._timelines) {
            var e = this._timelines[n];
            if (e != exceptTimeline)
                e.unselect();
        }
    } else {
        for (var n in this._timelines)
            this._timelines[n].unselect();
    }
    for (var n in this._ranges)
        this._ranges[n].unselect();
};
ChartManager.prototype.clearHighlight = function () {
    if (this._highlightedFrame != null) {
        this._highlightedFrame.highlight(null);
        this._highlightedFrame = null;
    }
};
ChartManager.prototype.onToolMouseMove = function(frameName, x, y) {
    var ret = false;
    frameName += ".";
    for (var n in this._dataSources) {
        if (n.indexOf(frameName) == 0) {
            var ds = this._dataSources[n];
            if (is_instance(ds, MainDataSource))
                if (ds.toolManager.acceptMouseMoveEvent(x, y))
                    ret = true;
        }
    }
    return ret;
};
ChartManager.prototype.onToolMouseDown = function(frameName, x, y) {
    var ret = false;
    frameName += ".";
    for (var n in this._dataSources) {
        if (n.indexOf(frameName) == 0) {
            var ds = this._dataSources[n];
            if (is_instance(ds, MainDataSource))
                if (ds.toolManager.acceptMouseDownEvent(x, y))
                    ret = true;
        }
    }
    return ret;
};
ChartManager.prototype.onToolMouseUp = function(frameName, x, y) {
    var ret = false;
    frameName += ".";
    for (var n in this._dataSources) {
        if (n.indexOf(frameName) == 0) {
            var ds = this._dataSources[n];
            if (is_instance(ds, MainDataSource))
                if (ds.toolManager.acceptMouseUpEvent(x, y))
                    ret = true;
        }
    }
    return ret;
};
ChartManager.prototype.onToolMouseDrag = function(frameName, x, y) {
    var ret = false;
    frameName += ".";
    for (var n in this._dataSources) {
        if (n.indexOf(frameName) == 0) {
            var ds = this._dataSources[n];
            if (is_instance(ds, MainDataSource))
                if (ds.toolManager.acceptMouseDownMoveEvent(x, y))
                    ret = true;
        }
    }
    return ret;
};
ChartManager.prototype.onMouseMove = function(frameName, x, y, drag) {
    var frame = this.getFrame(frameName);
    if (frame === undefined)
        return;
    this.setFrameMousePos(frameName, x, y);
    this.hideCrossCursor();
    if (this._highlightedFrame != frame)
        this.clearHighlight();
    if (this._capturingMouseArea != null) {
        this._capturingMouseArea.onMouseMove(x, y);
        return;
    }
    var areas = frame.contains(x, y);
    if (areas == null)
        return;
    var a, i, cnt = areas.length;
    for (i = cnt - 1; i >= 0; i--) {
        a = areas[i];
        a = a.onMouseMove(x, y);
        if (a != null) {
            if (!is_instance(a, ChartAreaGroup)) {
                frame.highlight(a);
                this._highlightedFrame = frame;
            }
            return;
        }
    }
};
ChartManager.prototype.onMouseLeave = function(frameName, x, y, move) {
    var frame = this.getFrame(frameName);
    if (frame == undefined)
        return;
    this.setFrameMousePos(frameName, x, y);
    this.hideCrossCursor();
    this.clearHighlight();
    if (this._capturingMouseArea != null) {
        this._capturingMouseArea.onMouseLeave(x, y);
        this._capturingMouseArea = null;
    }
    this._dragStarted = false;
};
ChartManager.prototype.onMouseDown = function(frameName, x, y) {
    var frame = this.getFrame(frameName);
    if (frame == undefined)
        return;
    var areas = frame.contains(x, y);
    if (areas == null)
        return;
    var a, i, cnt = areas.length;
    for (i = cnt - 1; i >= 0; i--) {
        a = areas[i];
        a = a.onMouseDown(x, y);
        if (a != null) {
            this._capturingMouseArea = a;
            return;
        }
    }
};
ChartManager.prototype.onMouseUp = function(frameName, x, y) {
    var frame = this.getFrame(frameName);
    if (frame == undefined)
        return;
    if (this._capturingMouseArea) {
        if (this._capturingMouseArea.onMouseUp(x, y) == null && this._dragStarted == false) {
            if (this._selectedFrame != null && this._selectedFrame != frame)
                this._selectedFrame.select(null);
            if (this._capturingMouseArea.isSelected()) {
                if (!this._captureMouseWheelDirectly)
                    $(this._overlayCanvas).unbind('mousewheel');
                frame.select(null);
                this._selectedFrame = null;
            } else {
                if (this._selectedFrame != frame)
                    if (!this._captureMouseWheelDirectly)
                        $(this._overlayCanvas).bind('mousewheel', mouseWheel);
                frame.select(this._capturingMouseArea);
                this._selectedFrame = frame;
            }
        }
        this._capturingMouseArea = null;
        this._dragStarted = false;
    }
};
ChartManager.prototype.deleteToolObject = function() {
    var pDPTool = this.getDataSource("frame0.k0");
    var selectObject = pDPTool.getSelectToolObjcet();
    if (selectObject != null)
        pDPTool.delSelectToolObject();
    var currentObject = pDPTool.getCurrentToolObject();
    if (currentObject != null && currentObject.getState() != CToolObject.state.AfterDraw) {
        pDPTool.delToolObject();
    }
    this.setNormalMode();
};
ChartManager.prototype.unloadTemplate = function(frameName) {
    var frame = this.getFrame(frameName);
    if (frame == undefined)
        return;
    for (var n in this._dataSources) {
        if (n.match(frameName + "."))
            delete this._dataSources[n];
    }
    for (var n in this._dataProviders) {
        if (this._dataProviders[n].getFrameName() == frameName)
            delete this._dataProviders[n];
    }
    delete this._frames[frameName];
    for (var n in this._areas) {
        if (this._areas[n].getFrameName() == frameName)
            delete this._areas[n];
    }
    for (var n in this._timelines) {
        if (this._timelines[n].getFrameName() == frameName)
            delete this._timelines[n];
    }
    for (var n in this._ranges) {
        if (this._ranges[n].getFrameName() == frameName)
            delete this._ranges[n];
    }
    for (var n in this._plotters) {
        if (this._plotters[n].getFrameName() == frameName)
            delete this._plotters[n];
    }
    delete this._themes[frameName];
    delete this._frameMousePos[frameName];
};
ChartManager.prototype.createIndicatorAndRange = function (areaName, indicName, notLoadSettings) {
    var indic, range;
    switch (indicName) {
        case "MA":
            indic = new MAIndicator();
            range = new PositiveRange(areaName);
            break;
        case "EMA":
            indic = new EMAIndicator();
            range = new PositiveRange(areaName);
            break;
        case "VOLUME":
            indic = new VOLUMEIndicator();
            range = new ZeroBasedPositiveRange(areaName);
            break;
        case "MACD":
            indic = new MACDIndicator();
            range = new ZeroCenteredRange(areaName);
            break;
        case "DMI":
            indic = new DMIIndicator();
            range = new PercentageRange(areaName);
            break;
        case "DMA":
            indic = new DMAIndicator();
            range = new Range(areaName);
            break;
        case "TRIX":
            indic = new TRIXIndicator();
            range = new Range(areaName);
            break;
        case "BRAR":
            indic = new BRARIndicator();
            range = new Range(areaName);
            break;
        case "VR":
            indic = new VRIndicator();
            range = new Range(areaName);
            break;
        case "OBV":
            indic = new OBVIndicator();
            range = new Range(areaName);
            break;
        case "EMV":
            indic = new EMVIndicator();
            range = new Range(areaName);
            break;
        case "RSI":
            indic = new RSIIndicator();
            range = new PercentageRange(areaName);
            break;
        case "WR":
            indic = new WRIndicator();
            range = new PercentageRange(areaName);
            break;
        case "SAR":
            indic = new SARIndicator();
            range = new PositiveRange(areaName);
            break;
        case "KDJ":
            indic = new KDJIndicator();
            range = new PercentageRange(areaName);
            break;
        case "ROC":
            indic = new ROCIndicator();
            range = new Range(areaName);
            break;
        case "MTM":
            indic = new MTMIndicator();
            range = new Range(areaName);
            break;
        case "BOLL":
            indic = new BOLLIndicator();
            range = new Range(areaName);
            break;
        case "PSY":
            indic = new PSYIndicator();
            range = new Range(areaName);
            break;
        case "StochRSI":
            indic = new STOCHRSIIndicator();
            range = new PercentageRange(areaName);
            break;
        default:
            return null;
    }
    if (!notLoadSettings)
        indic.setParameters(ChartSettings.get().indics[indicName]);
    return {"indic":indic, "range":range};
};
ChartManager.prototype.setMainIndicator = function (dsName, indicName) {
    var areaName = dsName + ".main";
    var dp = this.getDataProvider(areaName + ".main");
    if (dp == undefined || !is_instance(dp, MainDataProvider))
        return false;
    var indic;
    switch (indicName) {
        case "MA":
            indic = new MAIndicator();
            break;
        case "EMA":
            indic = new EMAIndicator();
            break;
        case "BOLL":
            indic = new BOLLIndicator();
            break;
        case "SAR":
            indic = new SARIndicator();
            break;
        default:
            return false;
    }
    indic.setParameters(ChartSettings.get().indics[indicName]);
    var indicDpName = areaName + ".secondary";
    var indicDp = this.getDataProvider(indicDpName);
    if (indicDp == undefined) {
        indicDp = new IndicatorDataProvider(indicDpName);
        this.setDataProvider(indicDp.getName(), indicDp);
    }
    indicDp.setIndicator(indic);
    var plotter = this.getPlotter(indicDpName);
    if (plotter == undefined) {
        plotter = new IndicatorPlotter(indicDpName);
        this.setPlotter(plotter.getName(), plotter);
    }
    this.getArea(areaName).setChanged(true);
    return true;
};
ChartManager.prototype.setIndicator = function (areaName, indicName) {
    var area = this.getArea(areaName);
    if (area == undefined || area.getNameObject().getCompAt(2) == "main")
        return false;
    var dp = this.getDataProvider(areaName + ".secondary");
    if (dp == undefined || !is_instance(dp, IndicatorDataProvider))
        return false;
    var ret = this.createIndicatorAndRange(areaName, indicName);
    if (ret == null)
        return false;
    var indic = ret.indic;
    var range = ret.range;
    this.removeDataProvider(areaName + ".main");
    this.removePlotter(areaName + ".main");
    this.removeRange(areaName);
    this.removePlotter(areaName + "Range.decoration");
    dp.setIndicator(indic);
    this.setRange(areaName, range);
    range.setPaddingTop(20);
    range.setPaddingBottom(4);
    range.setMinInterval(20);
    if (is_instance(indic, VOLUMEIndicator)) {
        var plotter = new LastVolumePlotter(areaName + "Range.decoration");
        this.setPlotter(plotter.getName(), plotter);
    }
    else if (is_instance(indic, BOLLIndicator) || is_instance(indic, SARIndicator)) {
        var dp = new MainDataProvider(areaName + ".main");
        this.setDataProvider(dp.getName(), dp);
        dp.updateData();
        var plotter = new OHLCPlotter(areaName + ".main");
        this.setPlotter(plotter.getName(), plotter);
    }
    return true;
};
ChartManager.prototype.removeMainIndicator = function (dsName) {
    var areaName = dsName + ".main";
    var indicDpName = areaName + ".secondary";
    var indicDp = this.getDataProvider(indicDpName);
    if (indicDp == undefined || !is_instance(indicDp, IndicatorDataProvider))
        return;
    this.removeDataProvider(indicDpName);
    this.removePlotter(indicDpName);
    this.getArea(areaName).setChanged(true);
};
ChartManager.prototype.removeIndicator = function (areaName) {
    var area = this.getArea(areaName);
    if (area == undefined || area.getNameObject().getCompAt(2) == "main")
        return;
    var dp = this.getDataProvider(areaName + ".secondary");
    if (dp == undefined || !is_instance(dp, IndicatorDataProvider))
        return;
    var rangeAreaName = areaName + "Range";
    var rangeArea = this.getArea(rangeAreaName);
    if (rangeArea == undefined)
        return;
    var tableLayout = this.getArea(area.getDataSourceName() + ".charts");
    if (tableLayout == undefined)
        return;
    tableLayout.removeArea(area);
    this.removeArea(areaName);
    tableLayout.removeArea(rangeArea);
    this.removeArea(rangeAreaName);
    for (var n in this._dataProviders) {
        if (this._dataProviders[n].getAreaName() == areaName)
            this.removeDataProvider(n);
    }
    for (var n in this._ranges) {
        if (this._ranges[n].getAreaName() == areaName)
            this.removeRange(n);
    }
    for (var n in this._plotters) {
        if (this._plotters[n].getAreaName() == areaName)
            this.removePlotter(n);
    }
    for (var n in this._plotters) {
        if (this._plotters[n].getAreaName() == rangeAreaName)
            this.removePlotter(n);
    }
};
/**
 * getIndicatorParameters
 *     获取指标的ParamExpr数组
 * @param indicName
 * @returns {*}
 */
ChartManager.prototype.getIndicatorParameters = function (indicName) {
    var indic = this._fakeIndicators[indicName];
    if (indic == undefined) {
        var ret = this.createIndicatorAndRange("", indicName);
        if (ret == null)
            return null;
        this._fakeIndicators[indicName] = indic = ret.indic;
    }
    var params = [];
    var i, cnt = indic.getParameterCount();
    for (i = 0; i < cnt; i++)
        params.push(indic.getParameterAt(i));
    return params;
};
ChartManager.prototype.setIndicatorParameters = function (indicName, params) {
    var n, indic;
    for (n in this._dataProviders) {
        var dp = this._dataProviders[n];
        if (is_instance(dp, IndicatorDataProvider) == false)
            continue;
        indic = dp.getIndicator();
        if (indic.getName() == indicName) {
            indic.setParameters(params);
            dp.refresh();
            this.getArea(dp.getAreaName()).setChanged(true);
        }
    }
    indic = this._fakeIndicators[indicName];
    if (indic == undefined) {
        var ret = this.createIndicatorAndRange("", indicName, true);
        if (ret == null)
            return;
        this._fakeIndicators[indicName] = indic = ret.indic;
    }
    indic.setParameters(params);
};
ChartManager.prototype.getIndicatorAreaName = function (dsName, index) {
    var tableLayout = this.getArea(dsName + ".charts");
    var cnt = tableLayout.getAreaCount() >> 1;
    if (index < 0 || index >= cnt)
        return "";
    return tableLayout.getAreaAt(index << 1).getName();
};
var Timeline = create_class(NamedObject);
Timeline._ItemWidth = [1,3,3,5,5,7,9,11,13,15,17,19,21,23,25,27,29];
Timeline._SpaceWidth = [1,1,2,2,3,3,3,3,3,3,5,5,5,5,7,7,7];
Timeline.PADDING_LEFT = 4;
Timeline.PADDING_RIGHT = 8;
Timeline.prototype.__construct = function(name) {
    Timeline.__super.__construct.call(this, name);
    this._updated = false;
    this._innerLeft = 0;
    this._innerWidth = 0;
    this._firstColumnLeft = 0;
    this._scale = 3;
    this._lastScale = -1;
    this._maxItemCount = 0;
    this._maxIndex = 0;
    this._firstIndex = -1;
    this._selectedIndex = -1;
    this._savedFirstIndex = -1;
};
Timeline.prototype.isLatestShown = function() {
    return this.getLastIndex() == this._maxIndex;
};
Timeline.prototype.isUpdated = function() {
    return this._updated;
};
Timeline.prototype.setUpdated = function(v) {
    this._updated = v;
};
Timeline.prototype.getItemWidth = function() {
    return Timeline._ItemWidth[this._scale];
};
Timeline.prototype.getSpaceWidth = function() {
    return Timeline._SpaceWidth[this._scale];
};
Timeline.prototype.getColumnWidth = function() {
    return this.getSpaceWidth() + this.getItemWidth();
};
Timeline.prototype.getInnerWidth = function() {
    return this._innerWidth;
};
Timeline.prototype.getItemLeftOffset = function() {
    return this.getSpaceWidth();
};
Timeline.prototype.getItemCenterOffset = function() {
    return this.getSpaceWidth() + (this.getItemWidth() >> 1);
};
Timeline.prototype.getFirstColumnLeft = function() {
    return this._firstColumnLeft;
};
Timeline.prototype.getMaxItemCount = function() {
    return this._maxItemCount;
};
Timeline.prototype.getFirstIndex = function() {
    return this._firstIndex;
};
Timeline.prototype.getLastIndex = function() {
    return Math.min(this._firstIndex + this._maxItemCount, this._maxIndex);
};
Timeline.prototype.getSelectedIndex = function() {
    return this._selectedIndex;
};
Timeline.prototype.getMaxIndex = function() {
    return this._maxIndex;
};
Timeline.prototype.calcColumnCount = function(w) {
    return Math.floor(w / this.getColumnWidth()) << 0;
};
Timeline.prototype.calcFirstColumnLeft = function(maxItemCount) {
    return this._innerLeft + this._innerWidth - (this.getColumnWidth() * maxItemCount);
};
Timeline.prototype.calcFirstIndexAlignRight = function(oldFirstIndex, oldMaxItemCount, newMaxItemCount) {
    return Math.max(0, oldFirstIndex + Math.max(oldMaxItemCount, 1) - Math.max(newMaxItemCount, 1));
};
Timeline.prototype.calcFirstIndex = function (newMaxItemCount) {
    return this.validateFirstIndex(
        this.calcFirstIndexAlignRight(this._firstIndex, this._maxItemCount,
            newMaxItemCount), newMaxItemCount);
};
Timeline.prototype.updateMaxItemCount = function() {
    var newMaxItemCount = this.calcColumnCount(this._innerWidth);
    var newFirstIndex;
    if (this._maxItemCount < 1) {
        newFirstIndex = this.calcFirstIndex(newMaxItemCount);
    } else if (this._lastScale == this._scale) {
        newFirstIndex = this.validateFirstIndex(this._firstIndex - (newMaxItemCount - this._maxItemCount));
    } else {
        var focusedIndex = (this._selectedIndex >= 0) ? this._selectedIndex : this.getLastIndex() - 1;
        newFirstIndex = this.validateFirstIndex(focusedIndex -
            Math.round((focusedIndex - this._firstIndex) * newMaxItemCount / this._maxItemCount));
    }
    this._lastScale = this._scale;
    if (this._firstIndex != newFirstIndex) {
        if (this._selectedIndex == this._firstIndex)
            this._selectedIndex = newFirstIndex;
        this._firstIndex = newFirstIndex;
        this._updated = true;
    }
    if (this._maxItemCount != newMaxItemCount) {
        this._maxItemCount = newMaxItemCount;
        this._updated = true;
    }
    this._firstColumnLeft = this.calcFirstColumnLeft(newMaxItemCount);
};
Timeline.prototype.validateFirstIndex = function(firstIndex, maxItemCount) {
    if (this._maxIndex < 1)
        return -1;
    if (firstIndex < 0)
        return 0;
    var lastFirst = Math.max(0, this._maxIndex - 1/*maxItemCount*/);
    if (firstIndex > lastFirst)
        return lastFirst;
    return firstIndex;
};
Timeline.prototype.validateSelectedIndex = function() {
    if (this._selectedIndex < this._firstIndex)
        this._selectedIndex = -1;
    else if (this._selectedIndex >= this.getLastIndex())
        this._selectedIndex = -1;
};
Timeline.prototype.onLayout = function() {
    var mgr = ChartManager.getInstance();
    var area = mgr.getArea(this.getDataSourceName() + ".main");
    if (area != null) {
        this._innerLeft = area.getLeft() + Timeline.PADDING_LEFT;
        var w = Math.max(0, area.getWidth() - (Timeline.PADDING_LEFT + Timeline.PADDING_RIGHT));
        if (this._innerWidth != w) {
            this._innerWidth = w;
            this.updateMaxItemCount();
        }
    }
};
Timeline.prototype.toIndex = function(x) {
    return this._firstIndex + this.calcColumnCount(x - this._firstColumnLeft);
};
Timeline.prototype.toColumnLeft = function(index) {
    return this._firstColumnLeft + (this.getColumnWidth() * (index - this._firstIndex));
};
Timeline.prototype.toItemLeft = function(index) {
    return this.toColumnLeft(index) + this.getItemLeftOffset();
};
Timeline.prototype.toItemCenter = function(index) {
    return this.toColumnLeft(index) + this.getItemCenterOffset();
};
Timeline.prototype.selectAt = function(x) {
    this._selectedIndex = this.toIndex(x);
    this.validateSelectedIndex();
    return (this._selectedIndex >= 0);
};
Timeline.prototype.unselect = function() {
    this._selectedIndex = -1;
};
Timeline.prototype.update = function() {
    var mgr = ChartManager.getInstance();
    var ds = mgr.getDataSource(this.getDataSourceName());
    var oldMaxIndex = this._maxIndex;
    this._maxIndex = ds.getDataCount();
    switch (ds.getUpdateMode()) {
        case DataSource.UpdateMode.Refresh:
            if (this._maxIndex < 1)
                this._firstIndex = -1;
            else
                this._firstIndex = Math.max(this._maxIndex - this._maxItemCount, 0);
            this._selectedIndex = -1;
            this._updated = true;
            break;
        case DataSource.UpdateMode.Append:
            var lastIndex = this.getLastIndex();
            var erasedCount = ds.getErasedCount();
            if (lastIndex < oldMaxIndex) {
                if (erasedCount > 0) {
                    this._firstIndex = Math.max(this._firstIndex - erasedCount, 0);
                    if (this._selectedIndex >= 0) {
                        this._selectedIndex -= erasedCount;
                        this.validateSelectedIndex();
                    }
                    this._updated = true;
                }
            }
            else if (lastIndex == oldMaxIndex) {
                this._firstIndex += (this._maxIndex - oldMaxIndex);
                if (this._selectedIndex >= 0) {
                    this._selectedIndex -= erasedCount;
                    this.validateSelectedIndex();
                }
                this._updated = true;
            }
            break;
    }
};
Timeline.prototype.move = function(x) {
    if (this.isLatestShown())
        ChartManager.getInstance().getArea(
            this.getDataSourceName() + ".mainRange").setChanged(true);
    this._firstIndex = this.validateFirstIndex(
        this._savedFirstIndex - this.calcColumnCount(x), this._maxItemCount);
    this._updated = true;
    if (this._selectedIndex >= 0)
        this.validateSelectedIndex();
};
Timeline.prototype.startMove = function() {
    this._savedFirstIndex = this._firstIndex;
};
Timeline.prototype.scale = function(s) {
    this._scale += s;
    if (this._scale < 0)
        this._scale = 0;
    else if (this._scale >= Timeline._ItemWidth.length)
        this._scale = Timeline._ItemWidth.length - 1;
    this.updateMaxItemCount();
    if (this._selectedIndex >= 0)
        this.validateSelectedIndex();
};
var Range = create_class(NamedObject);
Range.prototype.__construct = function(name) {
    Range.__super.__construct.call(this, name);
    this._updated = true;
    this._minValue = Number.MAX_VALUE;
    this._maxValue = -Number.MAX_VALUE;
    this._outerMinValue = Number.MAX_VALUE;
    this._outerMaxValue = -Number.MAX_VALUE;
    this._ratio = 0;
    this._top = 0;
    this._bottom = 0;
    this._paddingTop = 0;
    this._paddingBottom = 0;
    this._minInterval = 36;
    this._selectedPosition = -1;
    this._selectedValue = -Number.MAX_VALUE;
    this._gradations = [];
};
Range.prototype.isUpdated = function() {
    return this._updated;
};
Range.prototype.setUpdated = function(v) {
    this._updated = v;
};
Range.prototype.getMinValue = function() {
    return this._minValue;
};
Range.prototype.getMaxValue = function() {
    return this._maxValue;
};
Range.prototype.getRange = function() {
    return this._maxValue - this._minValue;
};
Range.prototype.getOuterMinValue = function() {
    return this._outerMinValue;
};
Range.prototype.getOuterMaxValue = function() {
    return this._outerMaxValue;
};
Range.prototype.getOuterRange = function() {
    return this._outerMaxValue - this._outerMinValue;
};
Range.prototype.getHeight = function() {
    return Math.max(0, this._bottom - this._top);
};
Range.prototype.getGradations = function() {
    return this._gradations;
};
Range.prototype.getMinInterval = function() {
    return this._minInterval;
};
Range.prototype.setMinInterval = function(v) {
    this._minInterval = v;
};
Range.prototype.getSelectedPosition = function() {
    if (this._selectedPosition >= 0)
        return this._selectedPosition;
    if (this._selectedValue > -Number.MAX_VALUE)
        return this.toY(this._selectedValue);
    return -1;
};
Range.prototype.getSelectedValue = function() {
    if (this._selectedValue > -Number.MAX_VALUE)
        return this._selectedValue;
    var mgr = ChartManager.getInstance();
    var area = mgr.getArea(this.getAreaName());
    if (area == null)
        return -Number.MAX_VALUE;
    if (this._selectedPosition < area.getTop() + 12 || this._selectedPosition >= area.getBottom() - 4)
        return -Number.MAX_VALUE;
    return this.toValue(this._selectedPosition);
};
Range.prototype.setPaddingTop = function(p) {
    this._paddingTop = p;
};
Range.prototype.setPaddingBottom = function(p) {
    this._paddingBottom = p;
};
Range.prototype.toValue = function(y) {
    return this._maxValue - (y - this._top) / this._ratio;
};
Range.prototype.toY = function(value) {
    if (this._ratio > 0)
        return this._top + Math.floor((this._maxValue - value) * this._ratio + 0.5);
    return this._top;
};
Range.prototype.toHeight = function(value) {
    return Math.floor(value * this._ratio + 1.5);
};
Range.prototype.update = function() {
    var min = Number.MAX_VALUE;
    var max = -Number.MAX_VALUE;
    var mgr = ChartManager.getInstance();
    var dp, dpNames=[".main", ".secondary"];
    for (var i = 0; i < dpNames.length; i++) {
        dp = mgr.getDataProvider(this.getName() + dpNames[i]);
        if (dp != null) {
            min = Math.min(min, dp.getMinValue());
            max = Math.max(max, dp.getMaxValue());
        }
    }
    var r = {"min": min, "max": max};
    this.preSetRange(r);
    this.setRange(r.min, r.max);
};
Range.prototype.select = function(v) {
    this._selectedValue = v;
    this._selectedPosition = -1;
};
Range.prototype.selectAt = function(y) {
    this._selectedPosition = y;
    this._selectedValue = -Number.MAX_VALUE;
};
Range.prototype.unselect = function() {
    this._selectedPosition = -1;
    this._selectedValue = -Number.MAX_VALUE;
};
Range.prototype.preSetRange = function(r) {
    if (r.min == r.max) {
        r.min = -1.0;
        r.max = 1.0;
    }
};
Range.prototype.setRange = function(minValue, maxValue) {
    var mgr = ChartManager.getInstance();
    var area = mgr.getArea(this.getAreaName());
    if (this._minValue == minValue && this._maxValue == maxValue && !area.isChanged())
        return;
    this._updated = true;
    this._minValue = minValue;
    this._maxValue = maxValue;
    this._gradations = [];
    var top = area.getTop() + this._paddingTop;
    var bottom = area.getBottom() - (this._paddingBottom + 1);
    if (top >= bottom) {
        this._minValue = this._maxValue;
        return;
    }
    this._top = top;
    this._bottom = bottom;
    if (this._maxValue > this._minValue)
        this._ratio = (bottom - top) / (this._maxValue - this._minValue);
    else {
        this._ratio = 0;
        throw "data error";
    }
    this._outerMinValue = this.toValue(area.getBottom());
    this._outerMaxValue = this.toValue(area.getTop());
    this.updateGradations();
};
Range.prototype.calcInterval = function() {
    var H = this.getHeight();
    var h = this.getMinInterval();
    if ((H / h) <= 1)
        h = H >> 1;
    var d = this.getRange();
    var i = 0;
    while (i > -2 && Math.floor(d) < d) {
        d *= 10.0;
        i--;
    }
    var m, c;
    for (;; i++) {
        c = Math.pow(10.0, i);
        m = c;
        if (this.toHeight(m) > h)
            break;
        m = 2.0 * c;
        if (this.toHeight(m) > h)
            break;
        m = 5.0 * c;
        if (this.toHeight(m) > h)
            break;
    }
    return m;
};
Range.prototype.updateGradations=function()
{
    this._gradations = [];
    var interval = this.calcInterval();
    if (interval <= 0.0)
        return;
    var v = Math.floor(this.getMaxValue() / interval) * interval;
    do {
        this._gradations.push(v);
        v -= interval;
    } while (v > this.getMinValue());
};
var PositiveRange = create_class(Range);
PositiveRange.prototype.__construct = function(name) {
    PositiveRange.__super.__construct.call(this, name);
};
PositiveRange.prototype.preSetRange = function(r) {
    if (r.min < 0) r.min = 0;
    if (r.max < 0) r.max = 0;
};
var ZeroBasedPositiveRange = create_class(Range);
ZeroBasedPositiveRange.prototype.__construct = function(name) {
    ZeroBasedPositiveRange.__super.__construct.call(this, name);
};
ZeroBasedPositiveRange.prototype.preSetRange = function(r) {
    r.min = 0;
    if (r.max < 0) r.max = 0;
};
var MainRange = create_class(Range);
MainRange.prototype.__construct = function(name) {
    MainRange.__super.__construct.call(this, name);
};
MainRange.prototype.preSetRange = function(r) {
    var mgr = ChartManager.getInstance();
    var timeline = mgr.getTimeline(this.getDataSourceName());
    var dIndex = timeline.getMaxIndex() - timeline.getLastIndex();
    if (dIndex < 25) {
        var ds = mgr.getDataSource(this.getDataSourceName());
        var data = ds.getDataAt(ds.getDataCount() - 1);
        var d = ((r.max - r.min) / 4) * (1 - (dIndex / 25));
        r.min = Math.min(r.min, Math.max(data.low - d, 0));
        r.max = Math.max(r.max, data.high + d);
    }
    if (r.min > 0) {
        var a = r.max / r.min;
        if (a < 1.012) {
            var m = (r.max + r.min) / 2.0;
            r.max = m * 1.006;
            r.min = m * 0.994;
        }
        else if (a < 1.024) {
            var m = (r.max + r.min) / 2.0;
            var c = (a - 1.0);
            r.max = m * (1.0 + c);
            r.min = m * (1.0 - c);
        }
        else if (a < 1.048) {
            var m = (r.max + r.min) / 2.0;
            r.max = m * 1.024;
            r.min = m * 0.976;
        }
    }
    if (r.min < 0) r.min = 0;
    if (r.max < 0) r.max = 0;
};
var ZeroCenteredRange = create_class(Range);
ZeroCenteredRange.prototype.__construct = function(name) {
    ZeroCenteredRange.__super.__construct.call(this, name);
};
ZeroCenteredRange.prototype.calcInterval = function(area) {
    var h = this.getMinInterval();
    if (area.getHeight() / h < 2)
        return 0.0;
    var r = this.getRange();
    var i;
    for (i = 3; ; i+= 2) {
        if (this.toHeight(r / i) <= h)
            break;
    }
    i -= 2;
    return r / i;
};
ZeroCenteredRange.prototype.updateGradations = function() {
    this._gradations = [];
    var mgr = ChartManager.getInstance();
    var area = mgr.getArea(this.getAreaName());
    var interval = this.calcInterval(area);
    if (interval <= 0.0)
        return;
    var v = interval / 2.0;
    do {
        this._gradations.push(v);
        this._gradations.push(-v);
        v += interval;
    } while (v <= this.getMaxValue());
};
ZeroCenteredRange.prototype.preSetRange = function(r) {
    var abs = Math.max(Math.abs(r.min), Math.abs(r.max));
    r.min = -abs;
    r.max = abs;
};
var PercentageRange = create_class(Range);
PercentageRange.prototype.__construct = function(name){
    PercentageRange.__super.__construct.call(this, name);
};
PercentageRange.prototype.updateGradations = function()
{
    this._gradations = [];
    var mgr = ChartManager.getInstance();
    var area = mgr.getArea(this.getAreaName());
    var interval = 10.0;
    var h = Math.floor(this.toHeight(interval));
    if ((h << 2) > area.getHeight())
        return;
    var v = Math.ceil(this.getMinValue() / interval) * interval;
    if (v == 0.0)
        v = 0;
    if ((h << 2) < 24) {
        if ((h << 1) < 8)
            return;
        do {
            if (v == 20.0 || v == 80.0)
                this._gradations.push(v);
            v += interval;
        } while (v < this.getMaxValue());
    } else {
        do {
            if (h < 8) {
                if (v == 20.0 || v == 50.0 || v == 80.0)
                    this._gradations.push(v);
            } else {
                if (v == 0.0 || v == 20.0 || v == 50.0 || v == 80.0 || v == 100.0)
                    this._gradations.push(v);
            }
            v += interval;
        } while (v < this.getMaxValue());
    }
};
var DataSource = create_class(NamedObject);
DataSource.prototype.__construct = function(name) {
    DataSource.__super.__construct.call(this, name);
};
DataSource.UpdateMode = {
    DoNothing: 0, Refresh: 1, Update: 2, Append: 3
};
DataSource.prototype.getUpdateMode = function() {
    return this._updateMode;
};
DataSource.prototype.setUpdateMode = function(mode) {
    this._updateMode = mode;
};
DataSource.prototype.getCacheSize = function() {
    return 0;
};
DataSource.prototype.getDataCount = function() {
    return 0;
};
var MainDataSource = create_class(DataSource);
MainDataSource.prototype.__construct = function (name) {
    MainDataSource.__super.__construct.call(this, name);
    this._erasedCount = 0;
    this._dataItems = [];
    this._decimalDigits = 0;
    this.toolManager = new CToolManager(name);
};
MainDataSource.prototype.getCacheSize = function () {
    return this._dataItems.length;
};
MainDataSource.prototype.getDataCount = function () {
    return this._dataItems.length;
};
MainDataSource.prototype.getUpdatedCount = function () {
    return this._updatedCount;
};
MainDataSource.prototype.getAppendedCount = function () {
    return this._appendedCount;
};
MainDataSource.prototype.getErasedCount = function () {
    return this._erasedCount;
};
MainDataSource.prototype.getDecimalDigits = function () {
    return this._decimalDigits;
}
MainDataSource.prototype.calcDecimalDigits = function (v) {
    var str = "" + v;
    var i = str.indexOf('.');
    if (i < 0)
        return 0;
    return (str.length - 1) - i;
}
MainDataSource.prototype.getLastDate = function () {
    var count = this.getDataCount();
    if (count < 1)
        return -1;
    return this.getDataAt(count - 1).date;
};
MainDataSource.prototype.getDataAt = function (index) {
    return this._dataItems[index];
};
MainDataSource.prototype.update = function (data) {
    this._updatedCount = 0;
    this._appendedCount = 0;
    this._erasedCount = 0;
    var len = this._dataItems.length;
    if (len > 0) {
        var lastIndex = len - 1;
        var lastItem = this._dataItems[lastIndex];
        var e, i, cnt = data.length;
        for (i = 0; i < cnt; i++) {
            e = data[i];
            if (e[0] == lastItem.date) {
                if (lastItem.open == e[1]
                    && lastItem.high == e[2]
                    && lastItem.low == e[3]
                    && lastItem.close == e[4]
                    && lastItem.volume == e[5]) {
                    this.setUpdateMode(DataSource.UpdateMode.DoNothing);
                } else {
                    this.setUpdateMode(DataSource.UpdateMode.Update);
                    this._dataItems[lastIndex] = {
                        date:e[0], open:e[1], high:e[2], low:e[3], close:e[4], volume:e[5]
                    };
                    this._updatedCount++;
                }
                i++;
                if (i < cnt) {
                    this.setUpdateMode(DataSource.UpdateMode.Append);
                    for (; i < cnt; i++, this._appendedCount++) {
                        e = data[i];
                        this._dataItems.push({
                            date:e[0], open:e[1], high:e[2], low:e[3], close:e[4], volume:e[5]
                        });
                    }
                }
                return true;
            }
        }
        if (cnt < 1000) {
            this.setUpdateMode(DataSource.UpdateMode.DoNothing);
            return false;
        }
    }
    this.setUpdateMode(DataSource.UpdateMode.Refresh);
    this._dataItems = [];
    var d, n, e, i, cnt = data.length;
    for (i = 0; i < cnt; i++) {
        e = data[i];
        for (n = 1; n <= 4; n++) {
            d = this.calcDecimalDigits(e[n]);
            if (this._decimalDigits < d)
                this._decimalDigits = d;
        }
        this._dataItems.push({
            date:e[0], open:e[1], high:e[2], low:e[3], close:e[4], volume:e[5]
        });
    }
    return true;
};
MainDataSource.prototype.select = function(id) {
    this.toolManager.selecedObject = id;
};
MainDataSource.prototype.unselect = function() {
    this.toolManager.selecedObject = -1;
};
MainDataSource.prototype.addToolObject = function(toolObject) {
    this.toolManager.addToolObject(toolObject);
};
MainDataSource.prototype.delToolObject = function() {
    this.toolManager.delCurrentObject();
};
MainDataSource.prototype.getToolObject = function(index) {
    return this.toolManager.getToolObject(index);
};
MainDataSource.prototype.getToolObjectCount = function() {
    return this.toolManager.toolObjects.length;
};
MainDataSource.prototype.getCurrentToolObject = function() {
    return this.toolManager.getCurrentObject();
};
MainDataSource.prototype.getSelectToolObjcet = function() {
    return this.toolManager.getSelectedObject();
};
MainDataSource.prototype.delSelectToolObject = function() {
    this.toolManager.delSelectedObject();
};
var DataProvider = create_class(NamedObject);
DataProvider.prototype.__construct = function(name) {
    DataProvider.__super.__construct.call(this, name);
    this._minValue = 0;
    this._maxValue = 0;
    this._minValueIndex = -1;
    this._maxValueIndex = -1;
};
DataProvider.prototype.getMinValue = function() {
    return this._minValue;
};
DataProvider.prototype.getMaxValue = function() {
    return this._maxValue;
};
DataProvider.prototype.getMinValueIndex = function() {
    return this._minValueIndex;
};
DataProvider.prototype.getMaxValueIndex = function() {
    return this._maxValueIndex;
};
DataProvider.prototype.calcRange = function(firstIndexes, lastIndex, minmaxes, indexes) {
    var min = Number.MAX_VALUE;
    var max = -Number.MAX_VALUE;
    var minIndex = -1;
    var maxIndex = -1;
    var minmax = {};
    var i = lastIndex - 1;
    var n = firstIndexes.length - 1;
    for (; n >= 0; n--) {
        var first = firstIndexes[n];
        if (i < first) {
            minmaxes[n] = {"min":min, "max":max};
        } else {
            for (; i >= first; i--) {
                if (this.getMinMaxAt(i, minmax) == false)
                    continue;
                if (min > minmax.min) {
                    min = minmax.min;
                    minIndex = i;
                }
                if (max < minmax.max) {
                    max = minmax.max;
                    maxIndex = i;
                }
            }
            minmaxes[n] = {"min":min, "max":max};
        }
        if (indexes != null) {
            indexes[n] = {"minIndex":minIndex, "maxIndex":maxIndex};
        }
    }
};
DataProvider.prototype.updateRange = function () {
    var mgr = ChartManager.getInstance();
    var timeline = mgr.getTimeline(this.getDataSourceName());
    var firstIndexes = [timeline.getFirstIndex()];
    var minmaxes = [{}];
    var indexes = [{}];
    this.calcRange(firstIndexes, timeline.getLastIndex(), minmaxes, indexes);
    this._minValue = minmaxes[0].min;
    this._maxValue = minmaxes[0].max;
    this._minValueIndex = indexes[0].minIndex;
    this._maxValueIndex = indexes[0].maxIndex;
};
var MainDataProvider = create_class(DataProvider);
MainDataProvider.prototype.__construct = function(name) {
    MainDataProvider.__super.__construct.call(this, name);
    this._candlestickDS = null;
};
MainDataProvider.prototype.updateData = function() {
    var mgr = ChartManager.getInstance();
    var ds = mgr.getDataSource(this.getDataSourceName());
    if (!is_instance(ds, MainDataSource))
        return;
    this._candlestickDS = ds;
};
MainDataProvider.prototype.getMinMaxAt = function(index, minmax) {
    var data = this._candlestickDS.getDataAt(index);
    minmax.min = data.low;
    minmax.max = data.high;
    return true;
};
var IndicatorDataProvider = create_class(DataProvider);
IndicatorDataProvider.prototype.getIndicator = function () {
    return this._indicator;
};
IndicatorDataProvider.prototype.setIndicator = function (v) {
    this._indicator = v;
    this.refresh();
};
IndicatorDataProvider.prototype.refresh = function () {
    var mgr = ChartManager.getInstance();
    var ds = mgr.getDataSource(this.getDataSourceName());
    if (ds.getDataCount() < 1)
        return;
    var indic = this._indicator;
    var i, last = ds.getDataCount();
    indic.clear();
    indic.reserve(last);
    for (i = 0; i < last; i++)
        indic.execute(ds, i);
};
IndicatorDataProvider.prototype.updateData = function () {
    var mgr = ChartManager.getInstance();
    var ds = mgr.getDataSource(this.getDataSourceName());
    if (ds.getDataCount() < 1)
        return;
    var indic = this._indicator;
    var mode = ds.getUpdateMode();
    switch (mode) {
        case DataSource.UpdateMode.Refresh: {
            this.refresh();
            break;
        }
        case DataSource.UpdateMode.Append: {
            indic.reserve(ds.getAppendedCount());
        }
        case DataSource.UpdateMode.Update: {
            var i, last = ds.getDataCount();
            var cnt = ds.getUpdatedCount() + ds.getAppendedCount();
            for (i = last - cnt; i < last; i++)
                indic.execute(ds, i);
            break;
        }
    }
};
IndicatorDataProvider.prototype.getMinMaxAt = function(index, minmax) {
    minmax.min = Number.MAX_VALUE;
    minmax.max = -Number.MAX_VALUE;
    var result, valid = false;
    var i, cnt = this._indicator.getOutputCount();
    for (i = 0; i < cnt; i++) {
        result = this._indicator.getOutputAt(i).execute(index);
        if (isNaN(result) == false) {
            valid = true;
            if (minmax.min > result)
                minmax.min = result;
            if (minmax.max < result)
                minmax.max = result;
        }
    }
    return valid;
};
var theme_color_id = 0;
var theme_font_id = 0;
var Theme = create_class();
Theme.prototype.getColor = function(which) {
    return this._colors[which];
};
Theme.prototype.getFont = function(which) {
    return this._fonts[which];
};
Theme.Color = {
    Positive: theme_color_id++,
    Negative: theme_color_id++,
    PositiveDark: theme_color_id++,
    NegativeDark: theme_color_id++,
    Unchanged: theme_color_id++,
    Background: theme_color_id++,
    Cursor: theme_color_id++,
    RangeMark: theme_color_id++,
    Indicator0: theme_color_id++,
    Indicator1: theme_color_id++,
    Indicator2: theme_color_id++,
    Indicator3: theme_color_id++,
    Grid0: theme_color_id++,
    Grid1: theme_color_id++,
    Grid2: theme_color_id++,
    Grid3: theme_color_id++,
    Grid4: theme_color_id++,
    TextPositive: theme_color_id++,
    TextNegative: theme_color_id++,
    Text0: theme_color_id++,
    Text1: theme_color_id++,
    Text2: theme_color_id++,
    Text3: theme_color_id++,
    Text4: theme_color_id++,
    LineColorNormal		: theme_color_id++,
    LineColorSelected	: theme_color_id++,
    CircleColorFill		: theme_color_id++,
    CircleColorStroke	: theme_color_id++
};
Theme.Font = {
    Default: theme_font_id++
};
var DarkTheme = create_class(Theme);
DarkTheme.prototype.__construct = function() {
    this._colors = [];
    this._colors[Theme.Color.Positive] = "#19b34c";
    this._colors[Theme.Color.Negative] = "#b33120";
    this._colors[Theme.Color.PositiveDark] = "#004718";
    this._colors[Theme.Color.NegativeDark] = "#3b0e08";
    this._colors[Theme.Color.Unchanged] = "#fff";
    this._colors[Theme.Color.Background] = "#0a0a0a";
    this._colors[Theme.Color.Cursor] = "#aaa";
    this._colors[Theme.Color.RangeMark] = "#f9ee30";
    this._colors[Theme.Color.Indicator0] = "#ddd";
    this._colors[Theme.Color.Indicator1] = "#f9ee30";
    this._colors[Theme.Color.Indicator2] = "#f600ff";
    this._colors[Theme.Color.Indicator3] = "#6bf";
    this._colors[Theme.Color.Grid0] = "#333";
    this._colors[Theme.Color.Grid1] = "#444";
    this._colors[Theme.Color.Grid2] = "#666";
    this._colors[Theme.Color.Grid3] = "#888";
    this._colors[Theme.Color.Grid4] = "#aaa";
    this._colors[Theme.Color.TextPositive] = "#1bd357";
    this._colors[Theme.Color.TextNegative] = "#ff6f5e";
    this._colors[Theme.Color.Text0] = "#444";
    this._colors[Theme.Color.Text1] = "#666";
    this._colors[Theme.Color.Text2] = "#888";
    this._colors[Theme.Color.Text3] = "#aaa";
    this._colors[Theme.Color.Text4] = "#ccc";
    this._colors[Theme.Color.LineColorNormal] 		= "#a6a6a6";
    this._colors[Theme.Color.LineColorSelected] 	= "#ffffff";
    this._colors[Theme.Color.CircleColorFill] 		= "#000000";
    this._colors[Theme.Color.CircleColorStroke] 	= "#ffffff";
    this._fonts = [];
    this._fonts[Theme.Font.Default] = "12px Tahoma";
};
var LightTheme = create_class(Theme);
LightTheme.prototype.__construct = function() {
    this._colors = [];
    this._colors[Theme.Color.Positive] = "#53b37b";
    this._colors[Theme.Color.Negative] = "#db5542";
    this._colors[Theme.Color.PositiveDark] = "#66d293";
    this._colors[Theme.Color.NegativeDark] = "#ffadaa";
    this._colors[Theme.Color.Unchanged] = "#fff";
    this._colors[Theme.Color.Background] = "#fff";
    this._colors[Theme.Color.Cursor] = "#aaa";
    this._colors[Theme.Color.RangeMark] = "#f27935";
    this._colors[Theme.Color.Indicator0] = "#2fd2b2";
    this._colors[Theme.Color.Indicator1] = "#ffb400";
    this._colors[Theme.Color.Indicator2] = "#e849b9";
    this._colors[Theme.Color.Indicator3] = "#1478c8";
    this._colors[Theme.Color.Grid0] = "#eee";
    this._colors[Theme.Color.Grid1] = "#afb1b3";
    this._colors[Theme.Color.Grid2] = "#ccc";
    this._colors[Theme.Color.Grid3] = "#bbb";
    this._colors[Theme.Color.Grid4] = "#aaa";
    this._colors[Theme.Color.TextPositive] = "#53b37b";
    this._colors[Theme.Color.TextNegative] = "#db5542";
    this._colors[Theme.Color.Text0] = "#ccc";
    this._colors[Theme.Color.Text1] = "#aaa";
    this._colors[Theme.Color.Text2] = "#888";
    this._colors[Theme.Color.Text3] = "#666";
    this._colors[Theme.Color.Text4] = "#444";
    this._colors[Theme.Color.LineColorNormal] 		= "#8c8c8c";
    this._colors[Theme.Color.LineColorSelected] 	= "#393c40";
    this._colors[Theme.Color.CircleColorFill] 		= "#ffffff";
    this._colors[Theme.Color.CircleColorStroke] 	= "#393c40";
    this._fonts = [];
    this._fonts[Theme.Font.Default] = "12px Tahoma";
};
var TemplateMeasuringHandler = create_class();
TemplateMeasuringHandler.onMeasuring = function(sender, args) {
    var width = args.Width;
    var height = args.Height;
    var areaName = sender.getNameObject().getCompAt(2);
    if (areaName == "timeline")
        sender.setMeasuredDimension(width, 22);
};
var Template = create_class();
Template.displayVolume = true;
Template.createCandlestickDataSource = function(dsAlias) {
    return new MainDataSource(dsAlias);
};
Template.createLiveOrderDataSource = function(dsAlias) {
    return new CLiveOrderDataSource(dsAlias);
};
Template.createLiveTradeDataSource = function(dsAlias) {
    return new CLiveTradeDataSource(dsAlias);
};
Template.createDataSource = function(dsName, dsAlias, createFunc) {
    var mgr = ChartManager.getInstance();
    if (mgr.getCachedDataSource(dsAlias) == null)
        mgr.setCachedDataSource(dsAlias, createFunc(dsAlias));
    mgr.setCurrentDataSource(dsName, dsAlias);
    mgr.updateData(dsName, null);
};
Template.createTableComps = function(dsName) {
    Template.createMainChartComps(dsName);
    if (Template.displayVolume)
        Template.createIndicatorChartComps(dsName, "VOLUME");
    Template.createTimelineComps(dsName);
};
Template.createMainChartComps = function (dsName) {
    var mgr = ChartManager.getInstance();
    var tableLayout = mgr.getArea(dsName + ".charts");
    var areaName = dsName + ".main";
    var rangeAreaName = areaName + "Range";
    var area = new MainArea(areaName);
    mgr.setArea(areaName, area);
    tableLayout.addArea(area);
    var rangeArea = new MainRangeArea(rangeAreaName);
    mgr.setArea(rangeAreaName, rangeArea);
    tableLayout.addArea(rangeArea);
    var dp = new MainDataProvider(areaName + ".main");
    mgr.setDataProvider(dp.getName(), dp);
    mgr.setMainIndicator(dsName, "MA");
    var range = new MainRange(areaName);
    mgr.setRange(range.getName(), range);
    range.setPaddingTop(28);
    range.setPaddingBottom(12);
    var plotter = new MainAreaBackgroundPlotter(areaName + ".background");
    mgr.setPlotter(plotter.getName(), plotter);
    plotter = new CGridPlotter(areaName + ".grid");
    mgr.setPlotter(plotter.getName(), plotter);
    plotter = new CandlestickPlotter(areaName + ".main");
    mgr.setPlotter(plotter.getName(), plotter);
    plotter = new MinMaxPlotter(areaName + ".decoration");
    mgr.setPlotter(plotter.getName(), plotter);
    plotter = new MainInfoPlotter(areaName + ".info");
    mgr.setPlotter(plotter.getName(), plotter);
    plotter = new SelectionPlotter(areaName + ".selection");
    mgr.setPlotter(plotter.getName(), plotter);
    plotter = new CDynamicLinePlotter(areaName + ".tool");
    mgr.setPlotter(plotter.getName(), plotter);
    plotter = new RangeAreaBackgroundPlotter(areaName + "Range.background");
    mgr.setPlotter(plotter.getName(), plotter);
    plotter = new COrderGraphPlotter(areaName + "Range.grid");
    mgr.setPlotter(plotter.getName(), plotter);
    plotter = new RangePlotter(areaName + "Range.main");
    mgr.setPlotter(plotter.getName(), plotter);
    plotter = new RangeSelectionPlotter(areaName + "Range.selection");
    mgr.setPlotter(plotter.getName(), plotter);
    plotter = new LastClosePlotter(areaName + "Range.decoration");
    mgr.setPlotter(plotter.getName(), plotter);
};
Template.createIndicatorChartComps = function (dsName, indicName) {
    var mgr = ChartManager.getInstance();
    var tableLayout = mgr.getArea(dsName + ".charts");
    var areaName = dsName + ".indic" + tableLayout.getNextRowId();
    var rangeAreaName = areaName + "Range";
    var area = new IndicatorArea(areaName);
    mgr.setArea(areaName, area);
    tableLayout.addArea(area);
    var rowIndex = tableLayout.getAreaCount() >> 1;
    var heights = ChartSettings.get().charts.areaHeight;
    if (heights.length > rowIndex) {
        var a, i;
        for (i = 0; i < rowIndex; i++) {
            a = tableLayout.getAreaAt(i << 1);
            a.setTop(0);
            a.setBottom(heights[i]);
        }
        area.setTop(0);
        area.setBottom(heights[rowIndex]);
    }
    var rangeArea = new IndicatorRangeArea(rangeAreaName);
    mgr.setArea(rangeAreaName, rangeArea);
    tableLayout.addArea(rangeArea);
    var dp = new IndicatorDataProvider(areaName + ".secondary");
    mgr.setDataProvider(dp.getName(), dp);
    if (mgr.setIndicator(areaName, indicName) == false) {
        mgr.removeIndicator(areaName);
        return;
    }
    var plotter = new MainAreaBackgroundPlotter(areaName + ".background");
    mgr.setPlotter(plotter.getName(), plotter);
    plotter = new CGridPlotter(areaName + ".grid");
    mgr.setPlotter(plotter.getName(), plotter);
    plotter = new IndicatorPlotter(areaName + ".secondary");
    mgr.setPlotter(plotter.getName(), plotter);
    plotter = new IndicatorInfoPlotter(areaName + ".info");
    mgr.setPlotter(plotter.getName(), plotter);
    plotter = new SelectionPlotter(areaName + ".selection");
    mgr.setPlotter(plotter.getName(), plotter);
    plotter = new RangeAreaBackgroundPlotter(areaName + "Range.background");
    mgr.setPlotter(plotter.getName(), plotter);
    plotter = new RangePlotter(areaName + "Range.main");
    mgr.setPlotter(plotter.getName(), plotter);
    plotter = new RangeSelectionPlotter(areaName + "Range.selection");
    mgr.setPlotter(plotter.getName(), plotter);
};
Template.createTimelineComps = function (dsName) {
    var mgr = ChartManager.getInstance();
    var plotter;
    var timeline = new Timeline(dsName);
    mgr.setTimeline(timeline.getName(), timeline);
    plotter = new TimelineAreaBackgroundPlotter(dsName + ".timeline.background");
    mgr.setPlotter(plotter.getName(), plotter);
    plotter = new TimelinePlotter(dsName + ".timeline.main");
    mgr.setPlotter(plotter.getName(), plotter);
    plotter = new TimelineSelectionPlotter(dsName + ".timeline.selection");
    mgr.setPlotter(plotter.getName(), plotter);
};
Template.createLiveOrderComps = function(dsName) {
    var mgr = ChartManager.getInstance();
    var plotter;
    plotter = new BackgroundPlotter(dsName + ".main.background");
    mgr.setPlotter(plotter.getName(), plotter);
    plotter = new CLiveOrderPlotter(dsName + ".main.main");
    mgr.setPlotter(plotter.getName(), plotter);
};
Template.createLiveTradeComps = function(dsName) {
    var mgr = ChartManager.getInstance();
    var plotter;
    plotter = new BackgroundPlotter(dsName + ".main.background");
    mgr.setPlotter(plotter.getName(), plotter);
    plotter = new CLiveTradePlotter(dsName + ".main.main");
    mgr.setPlotter(plotter.getName(), plotter);
};
var DefaultTemplate = create_class(Template);
DefaultTemplate.loadTemplate = function (
    dsName, dsAlias, dsNameOrder, dsAliasOrder, dsNameTrade, dsAliasTrade)
{
    var mgr = ChartManager.getInstance();
    var settings = ChartSettings.get();
    var frameName = (new CName(dsName)).getCompAt(0);
    mgr.unloadTemplate(frameName);
    Template.createDataSource(dsName, dsAlias, Template.createCandlestickDataSource);
    var frame = new DockableLayout(frameName);
    mgr.setFrame(frame.getName(), frame);
    mgr.setArea(frame.getName(), frame);
    frame.setGridColor(Theme.Color.Grid1);
    var area = new TimelineArea(dsName + ".timeline");
    mgr.setArea(area.getName(), area);
    frame.addArea(area);
    area.setDockStyle(ChartArea.DockStyle.Bottom);
    area.Measuring.addHandler(area, TemplateMeasuringHandler.onMeasuring);
    var tableLayout = new TableLayout(dsName + ".charts");
    mgr.setArea(tableLayout.getName(), tableLayout);
    tableLayout.setDockStyle(ChartArea.DockStyle.Fill);
    frame.addArea(tableLayout);
    Template.createTableComps(dsName);
    mgr.setThemeName(frameName, settings.theme);
    return mgr;
};
var Plotter = create_class(NamedObject);
Plotter.prototype.__construct = function(name){
    Plotter.__super.__construct.call(this, name);
};
Plotter.isChrome = (navigator.userAgent.toLowerCase().match(/chrome/) != null);
Plotter.drawLine = function(context, x1, y1, x2, y2) {
    context.beginPath();
    context.moveTo((x1 << 0) + 0.5, (y1 << 0) + 0.5);
    context.lineTo((x2 << 0) + 0.5, (y2 << 0) + 0.5);
    context.stroke();
};
Plotter.drawLines = function(context, points) {
    var i, cnt = points.length;
    context.beginPath();
    context.moveTo(points[0].x, points[0].y);
    for (i = 1; i < cnt; i++)
        context.lineTo(points[i].x, points[i].y);
    if (Plotter.isChrome) {
        context.moveTo(points[0].x, points[0].y);
        for (i = 1; i < cnt; i++)
            context.lineTo(points[i].x, points[i].y);
    }
    context.stroke();
};
Plotter.drawDashedLine = function(context, x1, y1, x2, y2, dashLen, dashSolid) {
    if (dashLen < 2)
        dashLen = 2;
    var dX = x2 - x1;
    var dY = y2 - y1;
    context.beginPath();
    if (dY == 0) {
        var count = (dX / dashLen + 0.5) << 0;
        for (var i = 0; i < count; i++) {
            context.rect(x1, y1, dashSolid, 1);
            x1 += dashLen;
        }
        context.fill();
    } else {
        var count = (Math.sqrt(dX * dX + dY * dY) / dashLen + 0.5) << 0;
        dX = dX / count;
        dY = dY / count;
        var dashX = dX * dashSolid / dashLen;
        var dashY = dY * dashSolid / dashLen;
        for (var i = 0; i < count; i++) {
            context.moveTo(x1 + 0.5, y1 + 0.5);
            context.lineTo(x1 + 0.5 + dashX, y1 + 0.5 + dashY);
            x1 += dX;
            y1 += dY;
        }
        context.stroke();
    }
};
Plotter.createHorzDashedLine = function(context, x1, x2, y, dashLen, dashSolid) {
    if (dashLen < 2)
        dashLen = 2;
    var dX = x2 - x1;
    var count = (dX / dashLen + 0.5) << 0;
    for (var i = 0; i < count; i++) {
        context.rect(x1, y, dashSolid, 1);
        x1 += dashLen;
    }
};
Plotter.createRectangles = function(context, rects) {
    context.beginPath();
    var e, i, cnt = rects.length;
    for (i = 0; i < cnt; i++) {
        e = rects[i];
        context.rect(e.x, e.y, e.w, e.h);
    }
};
Plotter.createPolygon = function(context, points) {
    context.beginPath();
    context.moveTo(points[0].x + 0.5, points[0].y + 0.5);
    var i, cnt = points.length;
    for (i = 1; i < cnt; i++)
        context.lineTo(points[i].x + 0.5, points[i].y + 0.5);
    context.closePath();
};
Plotter.drawString = function (context, str, rect) {
    var w = context.measureText(str).width;
    if (rect.w < w)
        return false;
    context.fillText(str, rect.x, rect.y);
    rect.x += w;
    rect.w -= w;
    return true;
};
var BackgroundPlotter = create_class(Plotter);
BackgroundPlotter.prototype.__construct = function(name) {
    BackgroundPlotter.__super.__construct.call(this, name);
    this._color = Theme.Color.Background;
};
BackgroundPlotter.prototype.getColor = function() {
    return this._color;
};
BackgroundPlotter.prototype.setColor = function(c) {
    this._color = c;
};
BackgroundPlotter.prototype.Draw = function(context) {
    var mgr = ChartManager.getInstance();
    var area = mgr.getArea(this.getAreaName());
    var theme = mgr.getTheme(this.getFrameName());
    //context.fillStyle = theme.getColor(this._color);
    context.fillStyle = "transparent";
    context.fillRect(area.getLeft(), area.getTop(), area.getWidth(), area.getHeight());
};
var MainAreaBackgroundPlotter = create_class(BackgroundPlotter);
MainAreaBackgroundPlotter.prototype.__construct = function(name) {
    MainAreaBackgroundPlotter.__super.__construct.call(this, name);
};
MainAreaBackgroundPlotter.prototype.Draw = function(context) {
    var mgr = ChartManager.getInstance();
    var area = mgr.getArea(this.getAreaName());
    var timeline = mgr.getTimeline(this.getDataSourceName());
    var range = mgr.getRange(this.getAreaName());
    var theme = mgr.getTheme(this.getFrameName());
    var rect = area.getRect();
    if (!area.isChanged() && !timeline.isUpdated() && !range.isUpdated()) {
        var first = timeline.getFirstIndex();
        var last = timeline.getLastIndex() - 2;
        var start = Math.max(first, last);
        rect.X = timeline.toColumnLeft(start);
        rect.Width = area.getRight() - rect.X;
    }
    //context.fillStyle = theme.getColor(this._color);
    context.fillStyle = "transparent";
    context.fillRect(rect.X, rect.Y , rect.Width, rect.Height);
};
var RangeAreaBackgroundPlotter = create_class(BackgroundPlotter);
RangeAreaBackgroundPlotter.prototype.__construct = function(name) {
    RangeAreaBackgroundPlotter.__super.__construct.call(this, name);
};
RangeAreaBackgroundPlotter.prototype.Draw = function(context) {
    var mgr = ChartManager.getInstance();
    var areaName = this.getAreaName();
    var area = mgr.getArea(areaName);
    var range = mgr.getRange(areaName.substring(0, areaName.lastIndexOf("Range")));
    var isMainRange = range.getNameObject().getCompAt(2) == "main";
    if (isMainRange) {
    } else {
        if (!area.isChanged() && !range.isUpdated())
            return;
    }
    var theme = mgr.getTheme(this.getFrameName());
    context.fillStyle = theme.getColor(this._color);
    context.fillRect(area.getLeft(), area.getTop(), area.getWidth(), area.getHeight());
};
var TimelineAreaBackgroundPlotter = create_class(BackgroundPlotter);
TimelineAreaBackgroundPlotter.prototype.__construct = function(name) {
    TimelineAreaBackgroundPlotter.__super.__construct.call(this, name);
};
TimelineAreaBackgroundPlotter.prototype.Draw = function(context) {
    var mgr = ChartManager.getInstance();
    var area = mgr.getArea(this.getAreaName());
    var timeline = mgr.getTimeline(this.getDataSourceName());
    if (!area.isChanged() && !timeline.isUpdated())
        return;
    var theme = mgr.getTheme(this.getFrameName());
    context.fillStyle = theme.getColor(this._color);
    context.fillRect(area.getLeft(), area.getTop(), area.getWidth(), area.getHeight());
};
var CGridPlotter = create_class(NamedObject);
CGridPlotter.prototype.__construct = function(name) {
    CGridPlotter.__super.__construct.call(this, name);
};
CGridPlotter.prototype.Draw = function(context) {
    var mgr = ChartManager.getInstance();
    var area = mgr.getArea(this.getAreaName());
    var timeline = mgr.getTimeline(this.getDataSourceName());
    var range = mgr.getRange(this.getAreaName());
    var clipped = false;
    if (!area.isChanged() && !timeline.isUpdated() && !range.isUpdated()) {
        var first = timeline.getFirstIndex();
        var last = timeline.getLastIndex();
        var start = Math.max(first, last - 2);
        var left = timeline.toColumnLeft(start);
        context.save();
        context.rect(left, area.getTop(), area.getRight() - left, area.getHeight());
        context.clip();
        clipped = true;
    }
    var theme = mgr.getTheme(this.getFrameName());
    context.fillStyle = theme.getColor(Theme.Color.Grid0);
    context.beginPath();
    var dashLen = 12, dashSolid = 3;
    if (Plotter.isChrome)
    { dashLen = 4; dashSolid = 1; }
    var gradations = range.getGradations();
    for (var n in gradations)
        Plotter.createHorzDashedLine(context,
            area.getLeft(), area.getRight(), range.toY(gradations[n]), dashLen, dashSolid);
    context.fill();
    if (clipped)
        context.restore();
};
var CandlestickPlotter = create_class(NamedObject);
CandlestickPlotter.prototype.__construct = function(name) {
    CandlestickPlotter.__super.__construct.call(this, name);
};
CandlestickPlotter.prototype.Draw = function(context) {
    var mgr = ChartManager.getInstance();
    var ds = mgr.getDataSource(this.getDataSourceName());
    if (ds.getDataCount() < 1)
        return;
    var area = mgr.getArea(this.getAreaName());
    var timeline = mgr.getTimeline(this.getDataSourceName());
    var range = mgr.getRange(this.getAreaName());
    if (range.getRange() == 0.0)
        return;
    var theme = mgr.getTheme(this.getFrameName());
    var dark = is_instance(theme, DarkTheme);
    var first = timeline.getFirstIndex();
    var last = timeline.getLastIndex();
    var start;
    if (area.isChanged() || timeline.isUpdated() || range.isUpdated())
        start = first;
    else
        start = Math.max(first, last - 2);
    var cW = timeline.getColumnWidth();
    var iW = timeline.getItemWidth();
    var left = timeline.toItemLeft(start);
    var center = timeline.toItemCenter(start);
    var strokePosRects = [];
    var fillPosRects = [];
    var fillUchRects = [];
    var fillNegRects = [];
    for (var i = start; i < last; i++) {
        var data = ds.getDataAt(i);
        var high = range.toY(data.high);
        var low = range.toY(data.low);
        var open = data.open;
        var close = data.close;
        if (close > open) {
            var top = range.toY(close);
            var bottom = range.toY(open);
            var iH = Math.max(bottom - top, 1);
            if (iH > 1 && iW > 1 && dark)
                strokePosRects.push({x:left + 0.5, y:top + 0.5, w:iW - 1, h:iH - 1});
            else
                fillPosRects.push({x:left, y:top, w:Math.max(iW, 1), h:Math.max(iH, 1)});
            if (data.high > close) {
                high = Math.min(high, top - 1);
                fillPosRects.push({x:center, y:high, w:1, h:top - high});
            }
            if (open > data.low) {
                low = Math.max(low, bottom + 1);
                fillPosRects.push({x:center, y:bottom, w:1, h:low - bottom});
            }
        }
        else if (close == open) {
            var top = range.toY(close);
            fillUchRects.push({x:left, y:top, w:Math.max(iW, 1), h:1});
            if (data.high > close)
                high = Math.min(high, top - 1);
            if (open > data.low)
                low = Math.max(low, top + 1);
            if (high < low)
                fillUchRects.push({x:center, y:high, w:1, h:low - high});
        }
        else {
            var top = range.toY(open);
            var bottom = range.toY(close);
            var iH = Math.max(bottom - top, 1);
            fillNegRects.push({x:left, y:top, w:Math.max(iW, 1), h:Math.max(iH, 1)});
            if (data.high > open)
                high = Math.min(high, top - 1);
            if (close > data.low)
                low = Math.max(low, bottom + 1);
            if (high < low)
                fillNegRects.push({x:center, y:high, w:1, h:low - high});
        }
        left += cW;
        center += cW;
    }
    if (strokePosRects.length > 0) {
        context.strokeStyle = theme.getColor(Theme.Color.Positive);
        Plotter.createRectangles(context, strokePosRects);
        context.stroke();
    }
    if (fillPosRects.length > 0) {
        context.fillStyle = theme.getColor(Theme.Color.Positive);
        Plotter.createRectangles(context, fillPosRects);
        context.fill();
    }
    if (fillUchRects.length > 0) {
        context.fillStyle = theme.getColor(Theme.Color.Negative);
        Plotter.createRectangles(context, fillUchRects);
        context.fill();
    }
    if (fillNegRects.length > 0) {
        context.fillStyle = theme.getColor(Theme.Color.Negative);
        Plotter.createRectangles(context, fillNegRects);
        context.fill();
    }
};
var CandlestickHLCPlotter = create_class(Plotter);
CandlestickHLCPlotter.prototype.__construct = function(name) {
    CandlestickHLCPlotter.__super.__construct.call(this, name);
};
CandlestickHLCPlotter.prototype.Draw = function(context) {
    var mgr = ChartManager.getInstance();
    var ds = mgr.getDataSource(this.getDataSourceName());
    if (!is_instance(ds, MainDataSource) || ds.getDataCount() < 1)
        return;
    var area = mgr.getArea(this.getAreaName());
    var timeline = mgr.getTimeline(this.getDataSourceName());
    var range = mgr.getRange(this.getAreaName());
    if (range.getRange() == 0.0)
        return;
    var theme = mgr.getTheme(this.getFrameName());
    var dark = is_instance(theme, DarkTheme);
    var first = timeline.getFirstIndex();
    var last = timeline.getLastIndex();
    var start;
    if (area.isChanged() || timeline.isUpdated() || range.isUpdated())
        start = first;
    else
        start = Math.max(first, last - 2);
    var cW = timeline.getColumnWidth();
    var iW = timeline.getItemWidth();
    var left = timeline.toItemLeft(start);
    var center = timeline.toItemCenter(start);
    var strokePosRects = [];
    var fillPosRects = [];
    var fillUchRects = [];
    var fillNegRects = [];
    for (var i = start; i < last; i++) {
        var data = ds.getDataAt(i);
        var high = range.toY(data.high);
        var low = range.toY(data.low);
        var open = data.open;
        if (i > 0)
            open = ds.getDataAt(i - 1).close;
        var close = data.close;
        if (close > open) {
            var top = range.toY(close);
            var bottom = range.toY(open);
            var iH = Math.max(bottom - top, 1);
            if (iH > 1 && iW > 1 && dark)
                strokePosRects.push({x:left + 0.5, y:top + 0.5, w:iW - 1, h:iH - 1});
            else
                fillPosRects.push({x:left, y:top, w:Math.max(iW, 1), h:Math.max(iH, 1)});
            if (data.high > close) {
                high = Math.min(high, top - 1);
                fillPosRects.push({x:center, y:high, w:1, h:top - high});
            }
            if (open > data.low) {
                low = Math.max(low, bottom + 1);
                fillPosRects.push({x:center, y:bottom, w:1, h:low - bottom});
            }
        }
        else if (close == open) {
            var top = range.toY(close);
            fillUchRects.push({x:left, y:top, w:Math.max(iW, 1), h:1});
            if (data.high > close)
                high = Math.min(high, top - 1);
            if (open > data.low)
                low = Math.max(low, top + 1);
            if (high < low)
                fillUchRects.push({x:center, y:high, w:1, h:low - high});
        }
        else {
            var top = range.toY(open);
            var bottom = range.toY(close);
            var iH = Math.max(bottom - top, 1);
            fillNegRects.push({x:left, y:top, w:Math.max(iW, 1), h:Math.max(iH, 1)});
            if (data.high > open)
                high = Math.min(high, top - 1);
            if (close > data.low)
                low = Math.max(low, bottom + 1);
            if (high < low)
                fillNegRects.push({x:center, y:high, w:1, h:low - high});
        }
        left += cW;
        center += cW;
    }
    if (strokePosRects.length > 0) {
        context.strokeStyle = theme.getColor(Theme.Color.Positive);
        Plotter.createRectangles(context, strokePosRects);
        context.stroke();
    }
    if (fillPosRects.length > 0) {
        context.fillStyle = theme.getColor(Theme.Color.Positive);
        Plotter.createRectangles(context, fillPosRects);
        context.fill();
    }
    if (fillUchRects.length > 0) {
        context.fillStyle = theme.getColor(Theme.Color.Negative);
        Plotter.createRectangles(context, fillUchRects);
        context.fill();
    }
    if (fillNegRects.length > 0) {
        context.fillStyle = theme.getColor(Theme.Color.Negative);
        Plotter.createRectangles(context, fillNegRects);
        context.fill();
    }
};
var OHLCPlotter = create_class(Plotter);
OHLCPlotter.prototype.__construct = function(name) {
    OHLCPlotter.__super.__construct.call(this, name);
};
OHLCPlotter.prototype.Draw = function(context) {
    var mgr = ChartManager.getInstance();
    var ds = mgr.getDataSource(this.getDataSourceName());
    if (!is_instance(ds, MainDataSource) || ds.getDataCount() < 1)
        return;
    var area = mgr.getArea(this.getAreaName());
    var timeline = mgr.getTimeline(this.getDataSourceName());
    var range = mgr.getRange(this.getAreaName());
    if (range.getRange() == 0.0)
        return;
    var theme = mgr.getTheme(this.getFrameName());
    var first = timeline.getFirstIndex();
    var last = timeline.getLastIndex();
    var start;
    if (area.isChanged() || timeline.isUpdated() || range.isUpdated())
        start = first;
    else
        start = Math.max(first, last - 2);
    var cW = timeline.getColumnWidth();
    var iW = (timeline.getItemWidth() >> 1) + 1;
    var left = timeline.toItemLeft(start) - 1;
    var center = timeline.toItemCenter(start);
    var right = center + 1;
    var fillPosRects = [];
    var fillUchRects = [];
    var fillNegRects = [];
    for (var i = start; i < last; i++) {
        var data = ds.getDataAt(i);
        var high = range.toY(data.high);
        var low = range.toY(data.low);
        var iH = Math.max(low - high, 1);
        if (data.close > data.open) {
            var top = range.toY(data.close);
            var bottom = range.toY(data.open);
            fillPosRects.push({x:center, y:high, w:1, h:iH});
            fillPosRects.push({x:left, y:bottom, w:iW, h:1});
            fillPosRects.push({x:right, y:top, w:iW, h:1});
        }
        else if (data.close == data.open) {
            var y = range.toY(data.close);
            fillUchRects.push({x:center, y:high, w:1, h:iH});
            fillUchRects.push({x:left, y:y, w:iW, h:1});
            fillUchRects.push({x:right, y:y, w:iW, h:1});
        }
        else {
            var top = range.toY(data.open);
            var bottom = range.toY(data.close);
            fillNegRects.push({x:center, y:high, w:1, h:iH});
            fillNegRects.push({x:left, y:top, w:iW, h:1});
            fillNegRects.push({x:right, y:bottom, w:iW, h:1});
        }
        left += cW;
        center += cW;
        right += cW;
    }
    if (fillPosRects.length > 0) {
        context.fillStyle = theme.getColor(Theme.Color.Positive);
        Plotter.createRectangles(context, fillPosRects);
        context.fill();
    }
    if (fillUchRects.length > 0) {
        context.fillStyle = theme.getColor(Theme.Color.Negative);
        Plotter.createRectangles(context, fillUchRects);
        context.fill();
    }
    if (fillNegRects.length > 0) {
        context.fillStyle = theme.getColor(Theme.Color.Negative);
        Plotter.createRectangles(context, fillNegRects);
        context.fill();
    }
};
var MainInfoPlotter = create_class(Plotter);
MainInfoPlotter._dsAliasToString = {
    "01w" : "周线", "03d" : "3天线", "01d" : "日线", "12h" : "12小时",
    "06h" : "6小时", "04h" : "4小时", "02h" : "2小时", "01h" : "1小时",
    "30m" : "30分钟", "15m" : "15分钟", "05m" : "5分钟", "03m" : "3分钟",
    "01m" : "1分钟"
};
MainInfoPlotter._dsAliasToString2 = {
    "01w" : "1w", "03d" : "3d", "01d" : "1d", "12h" : "12h",
    "06h" : "6h", "04h" : "4h", "02h" : "2h", "01h" : "1h",
    "30m" : "30m", "15m" : "15m", "05m" : "5m", "03m" : "3m",
    "01m" : "1m"
};
MainInfoPlotter._dsAliasToString_zh_tw = {
    "01w" : "周線", "03d" : "3天線", "01d" : "日線", "12h" : "12小時",
    "06h" : "6小時", "04h" : "4小時", "02h" : "2小時", "01h" : "1小時",
    "30m" : "30分鐘", "15m" : "15分鐘", "05m" : "5分鐘", "03m" : "3分鐘",
    "01m" : "1分鐘"
};
MainInfoPlotter.prototype.__construct = function(name) {
    MainInfoPlotter.__super.__construct.call(this, name);
};
function format_time(v) {
    return (v < 10) ? "0" + v.toString() : v.toString();
}
MainInfoPlotter.prototype.Draw = function(context) {
    var mgr = ChartManager.getInstance();
    var area = mgr.getArea(this.getAreaName());
    var timeline = mgr.getTimeline(this.getDataSourceName());
    var ds = mgr.getDataSource(this.getDataSourceName());
    var theme = mgr.getTheme(this.getFrameName());
    context.font = theme.getFont(Theme.Font.Default);
    context.textAlign = "left";
    context.textBaseline = "top";
    context.fillStyle = theme.getColor(Theme.Color.Text4);
    var rect = {
        x: area.getLeft() + 4,
        y: area.getTop() + 2,
        w: area.getWidth() - 8,
        h: 20
    };
    var selIndex = timeline.getSelectedIndex();
    if (selIndex < 0)
        return;
    var data = ds.getDataAt(selIndex);
    var digits = ds.getDecimalDigits();
    var time = new Date(data.date);
    var year = time.getFullYear();
    var month = format_time(time.getMonth() + 1);
    var date = format_time(time.getDate());
    var hour = format_time(time.getHours());
    var minute = format_time(time.getMinutes());
    var lang = mgr.getLanguage();
    if (lang == "zh-cn") {
        if (!Plotter.drawString(context, '时间: ' +
                year + '-' + month + '-' + date + '  ' + hour + ':' + minute, rect))
            return;
        if (!Plotter.drawString(context, '  开: ' + data.open.toFixed(digits), rect))
            return;
        if (!Plotter.drawString(context, '  高: ' + data.high.toFixed(digits), rect))
            return;
        if (!Plotter.drawString(context, '  低: ' + data.low.toFixed(digits), rect))
            return;
        if (!Plotter.drawString(context, '  收: ' + data.close.toFixed(digits), rect))
            return;
    }
    else if (lang == "en-us") {
        if (!Plotter.drawString(context, 'DATE: ' +
                year + '-' + month + '-' + date + '  ' + hour + ':' + minute, rect))
            return;
        if (!Plotter.drawString(context, '  O: ' + data.open.toFixed(digits), rect))
            return;
        if (!Plotter.drawString(context, '  H: ' + data.high.toFixed(digits), rect))
            return;
        if (!Plotter.drawString(context, '  L: ' + data.low.toFixed(digits), rect))
            return;
        if (!Plotter.drawString(context, '  C: ' + data.close.toFixed(digits), rect))
            return;
    }
    else if (lang == "zh-tw") {
        if (!Plotter.drawString(context, '時間: ' +
                year + '-' + month + '-' + date + '  ' + hour + ':' + minute, rect))
            return;
        if (!Plotter.drawString(context, '  開: ' + data.open.toFixed(digits), rect))
            return;
        if (!Plotter.drawString(context, '  高: ' + data.high.toFixed(digits), rect))
            return;
        if (!Plotter.drawString(context, '  低: ' + data.low.toFixed(digits), rect))
            return;
        if (!Plotter.drawString(context, '  收: ' + data.close.toFixed(digits), rect))
            return;
    }
    if (selIndex > 0) {
        if (lang == "zh-cn") {
            if (!Plotter.drawString(context, '  涨幅: ', rect))
                return;
        }
        else if (lang == "en-us") {
            if (!Plotter.drawString(context, '  CHANGE: ', rect))
                return;
        }
        else if (lang == "zh-tw") {
            if (!Plotter.drawString(context, '  漲幅: ', rect))
                return;
        }
        var prev = ds.getDataAt(selIndex - 1);
        var change = (data.close - prev.close) / prev.close * 100.0;
        if (change >= 0) {
            change = ' ' + change.toFixed(2);
            context.fillStyle = theme.getColor(Theme.Color.TextPositive);
        } else {
            change = change.toFixed(2);
            context.fillStyle = theme.getColor(Theme.Color.TextNegative);
        }
        if (!Plotter.drawString(context, change, rect))
            return;
        context.fillStyle = theme.getColor(Theme.Color.Text4);
        if (!Plotter.drawString(context, ' %', rect))
            return;
    }
    var amplitude = (data.high - data.low) / data.low * 100.0;
    if (lang == "zh-cn") {
        if (!Plotter.drawString(context, '  振幅: ' + amplitude.toFixed(2) + ' %', rect))
            return;
        if (!Plotter.drawString(context, '  量: ' + data.volume.toFixed(2), rect))
            return;
    }
    else if (lang == "en-us") {
        if (!Plotter.drawString(context, '  AMPLITUDE: ' + amplitude.toFixed(2) + ' %', rect))
            return;
        if (!Plotter.drawString(context, '  V: ' + data.volume.toFixed(2), rect))
            return;
    }
    else if (lang == "zh-tw") {
        if (!Plotter.drawString(context, '  振幅: ' + amplitude.toFixed(2) + ' %', rect))
            return;
        if (!Plotter.drawString(context, '  量: ' + data.volume.toFixed(2), rect))
            return;
    }
    var dp = mgr.getDataProvider(this.getAreaName() + ".secondary");
    if (dp == undefined)
        return;
    var indic = dp.getIndicator();
    var n, cnt = indic.getOutputCount();
    for (n = 0; n < cnt; n++) {
        var out = indic.getOutputAt(n);
        var v = out.execute(selIndex);
        if (isNaN(v))
            continue;
        var info = "  " + out.getName() + ": " + v.toFixed(digits);
        var color = out.getColor();
        if (color === undefined)
            color = Theme.Color.Indicator0 + n;
        context.fillStyle = theme.getColor(color);
        if (!Plotter.drawString(context, info, rect))
            return;
    }
};
var IndicatorPlotter = create_class(NamedObject);
IndicatorPlotter.prototype.__construct = function (name) {
    IndicatorPlotter.__super.__construct.call(this, name);
};
IndicatorPlotter.prototype.Draw = function (context) {
    var mgr = ChartManager.getInstance();
    var area = mgr.getArea(this.getAreaName());
    var timeline = mgr.getTimeline(this.getDataSourceName());
    var range = mgr.getRange(this.getAreaName());
    if (range.getRange() == 0.0)
        return;
    var dp = mgr.getDataProvider(this.getName());
    if (!is_instance(dp, IndicatorDataProvider))
        return;
    var theme = mgr.getTheme(this.getFrameName());
    var cW = timeline.getColumnWidth();
    var first = timeline.getFirstIndex();
    var last = timeline.getLastIndex();
    var start;
    if (area.isChanged() || timeline.isUpdated() || range.isUpdated())
        start = first;
    else
        start = Math.max(first, last - 2);
    var indic = dp.getIndicator();
    var out, n, outCount = indic.getOutputCount();
    for (n = 0; n < outCount; n++) {
        out = indic.getOutputAt(n);
        var style = out.getStyle();
        if (style == OutputStyle.VolumeStick) {
            this.drawVolumeStick(context, theme,
                mgr.getDataSource(this.getDataSourceName()), start, last,
                timeline.toItemLeft(start), cW, timeline.getItemWidth(), range);
        }
        else if (style == OutputStyle.MACDStick) {
            this.drawMACDStick(context, theme,
                out, start, last,
                timeline.toItemLeft(start), cW, timeline.getItemWidth(), range);
        }
        else if (style == OutputStyle.SARPoint) {
            this.drawSARPoint(context, theme,
                out, start, last,
                timeline.toItemCenter(start), cW, timeline.getItemWidth(), range);
        }
    }
    var left = timeline.toColumnLeft(start);
    var center = timeline.toItemCenter(start);
    context.save();
    context.rect(left, area.getTop(), area.getRight() - left, area.getHeight());
    context.clip();
    context.translate(0.5, 0.5);
    for (n = 0; n < outCount; n++) {
        var x = center;
        out = indic.getOutputAt(n);
        if (out.getStyle() == OutputStyle.Line) {
            var v, points = [];
            if (start > first) {
                v = out.execute(start - 1);
                if (isNaN(v) == false)
                    points.push({"x": x - cW, "y": range.toY(v)});
            }
            for (var i = start; i < last; i++, x += cW) {
                v = out.execute(i);
                if (isNaN(v) == false)
                    points.push({"x": x, "y": range.toY(v)});
            }
            if (points.length > 0) {
                var color = out.getColor();
                if (color == undefined)
                    color = Theme.Color.Indicator0 + n;
                context.strokeStyle = theme.getColor(color);
                Plotter.drawLines(context, points);
            }
        }
    }
    context.restore();
};
IndicatorPlotter.prototype.drawVolumeStick =
    function (context, theme, ds, first, last, startX, cW, iW, range) {
        var dark = is_instance(theme, DarkTheme);
        var left = startX;
        var bottom = range.toY(0);
        var strokePosRects = [];
        var fillPosRects = [];
        var fillNegRects = [];
        for (var i = first; i < last; i++) {
            var data = ds.getDataAt(i);
            var top = range.toY(data.volume);
            var iH = range.toHeight(data.volume);
            if (data.close > data.open) {
                if (iH > 1 && iW > 1 && dark) {
                    strokePosRects.push({x:left + 0.5, y:top + 0.5, w:iW - 1, h:iH - 1});
                } else {
                    fillPosRects.push({x:left, y:top, w:Math.max(iW, 1), h:Math.max(iH, 1)});
                }
            }
            else if (data.close == data.open) {
                if (i > 0 && data.close >= ds.getDataAt(i - 1).close) {
                    if (iH > 1 && iW > 1 && dark) {
                        strokePosRects.push({x:left + 0.5, y:top + 0.5, w:iW - 1, h:iH - 1});
                    } else {
                        fillPosRects.push({x:left, y:top, w:Math.max(iW, 1), h:Math.max(iH, 1)});
                    }
                } else {
                    fillNegRects.push({x:left, y:top, w:Math.max(iW, 1), h:Math.max(iH, 1)});
                }
            }
            else {
                fillNegRects.push({x:left, y:top, w:Math.max(iW, 1), h:Math.max(iH, 1)});
            }
            left += cW;
        }
        if (strokePosRects.length > 0) {
            context.strokeStyle = theme.getColor(Theme.Color.Positive);
            Plotter.createRectangles(context, strokePosRects);
            context.stroke();
        }
        if (fillPosRects.length > 0) {
            context.fillStyle = theme.getColor(Theme.Color.Positive);
            Plotter.createRectangles(context, fillPosRects);
            context.fill();
        }
        if (fillNegRects.length > 0) {
            context.fillStyle = theme.getColor(Theme.Color.Negative);
            Plotter.createRectangles(context, fillNegRects);
            context.fill();
        }
    };
IndicatorPlotter.prototype.drawMACDStick =
    function (context, theme, output, first, last, startX, cW, iW, range) {
        var left = startX;
        var middle = range.toY(0);
        var strokePosRects = [];
        var strokeNegRects = [];
        var fillPosRects = [];
        var fillNegRects = [];
        var prevMACD = (first > 0) ? output.execute(first - 1) : NaN;
        for (var i = first; i < last; i++) {
            var MACD = output.execute(i);
            if (MACD >= 0) {
                var iH = range.toHeight(MACD);
                if ((i == 0 || MACD >= prevMACD) && iH > 1 && iW > 1)
                    strokePosRects.push({x:left + 0.5, y:middle - iH + 0.5, w:iW - 1, h:iH - 1});
                else
                    fillPosRects.push({x:left, y:middle - iH, w:Math.max(iW, 1), h:Math.max(iH, 1)});
            } else {
                var iH = range.toHeight(-MACD);
                if ((i == 0 || MACD >= prevMACD) && iH > 1 && iW > 1)
                    strokeNegRects.push({x:left + 0.5, y:middle + 0.5, w:iW - 1, h:iH - 1});
                else
                    fillNegRects.push({x:left, y:middle, w:Math.max(iW, 1), h:Math.max(iH, 1)});
            }
            prevMACD = MACD;
            left += cW;
        }
        if (strokePosRects.length > 0) {
            context.strokeStyle = theme.getColor(Theme.Color.Positive);
            Plotter.createRectangles(context, strokePosRects);
            context.stroke();
        }
        if (strokeNegRects.length > 0) {
            context.strokeStyle = theme.getColor(Theme.Color.Negative);
            Plotter.createRectangles(context, strokeNegRects);
            context.stroke();
        }
        if (fillPosRects.length > 0) {
            context.fillStyle = theme.getColor(Theme.Color.Positive);
            Plotter.createRectangles(context, fillPosRects);
            context.fill();
        }
        if (fillNegRects.length > 0) {
            context.fillStyle = theme.getColor(Theme.Color.Negative);
            Plotter.createRectangles(context, fillNegRects);
            context.fill();
        }
    };
IndicatorPlotter.prototype.drawSARPoint =
    function (context, theme, output, first, last, startX, cW, iW, range) {
        var r = iW >> 1;
        if (r < 0.5) r = 0.5;
        if (r > 4) r = 4;
        var center = startX;
        var right = center + r;
        var endAngle = 2 * Math.PI;
        context.save();
        context.translate(0.5, 0.5);
        context.strokeStyle = theme.getColor(Theme.Color.Indicator3);
        context.beginPath();
        for (var i = first; i < last; i++) {
            var y = range.toY(output.execute(i));
            context.moveTo(right, y);
            context.arc(center, y, r, 0, endAngle);
            center += cW;
            right += cW;
        }
        context.stroke();
        context.restore();
    };
var IndicatorInfoPlotter = create_class(Plotter);
IndicatorInfoPlotter.prototype.__construct = function (name) {
    IndicatorInfoPlotter.__super.__construct.call(this, name);
};
IndicatorInfoPlotter.prototype.Draw = function (context) {
    var mgr = ChartManager.getInstance();
    var area = mgr.getArea(this.getAreaName());
    var timeline = mgr.getTimeline(this.getDataSourceName());
    var dp = mgr.getDataProvider(this.getAreaName() + ".secondary");
    var theme = mgr.getTheme(this.getFrameName());
    context.font = theme.getFont(Theme.Font.Default);
    context.textAlign = "left";
    context.textBaseline = "top";
    context.fillStyle = theme.getColor(Theme.Color.Text4);
    var rect = {
        x: area.getLeft() + 4,
        y: area.getTop() + 2,
        w: area.getWidth() - 8,
        h: 20
    };
    var indic = dp.getIndicator();
    var title;
    switch (indic.getParameterCount()) {
        case 0:
            title = indic.getName();
            break;
        case 1:
            title = indic.getName() + "("
                + indic.getParameterAt(0).getValue()
                + ")";
            break;
        case 2:
            title = indic.getName() + "("
                + indic.getParameterAt(0).getValue() + ","
                + indic.getParameterAt(1).getValue()
                + ")";
            break;
        case 3:
            title = indic.getName() + "("
                + indic.getParameterAt(0).getValue() + ","
                + indic.getParameterAt(1).getValue() + ","
                + indic.getParameterAt(2).getValue()
                + ")";
            break;
        case 4:
            title = indic.getName() + "("
                + indic.getParameterAt(0).getValue() + ","
                + indic.getParameterAt(1).getValue() + ","
                + indic.getParameterAt(2).getValue() + ","
                + indic.getParameterAt(3).getValue()
                + ")";
            break;
        default:
            return;
    }
    if (!Plotter.drawString(context, title, rect))
        return;
    var selIndex = timeline.getSelectedIndex();
    if (selIndex < 0)
        return;
    var out, v, info, color;
    var n, cnt = indic.getOutputCount();
    for (n = 0; n < cnt; n++) {
        out = indic.getOutputAt(n);
        v = out.execute(selIndex);
        if (isNaN(v))
            continue;
        info = "  " + out.getName() + ": " + v.toFixed(2);
        color = out.getColor();
        if (color === undefined)
            color = Theme.Color.Indicator0 + n;
        context.fillStyle = theme.getColor(color);
        if (!Plotter.drawString(context, info, rect))
            return;
    }
};
var MinMaxPlotter = create_class(NamedObject);
MinMaxPlotter.prototype.__construct = function(name) {
    MinMaxPlotter.__super.__construct.call(this, name);
};
MinMaxPlotter.prototype.Draw = function(context) {
    var mgr = ChartManager.getInstance();
    var ds = mgr.getDataSource(this.getDataSourceName());
    if (ds.getDataCount() < 1)
        return;
    var timeline = mgr.getTimeline(this.getDataSourceName());
    if (timeline.getInnerWidth() < timeline.getColumnWidth())
        return;
    var range = mgr.getRange(this.getAreaName());
    if (range.getRange() == 0)
        return;
    var dp = mgr.getDataProvider(this.getAreaName() + ".main");
    var first = timeline.getFirstIndex();
    var center = (first + timeline.getLastIndex()) >> 1;
    var theme = mgr.getTheme(this.getFrameName());
    context.font = theme.getFont(Theme.Font.Default);
    context.textBaseline = "middle";
    context.fillStyle = theme.getColor(Theme.Color.Text4);
    context.strokeStyle = theme.getColor(Theme.Color.Text4);
    var digits = ds.getDecimalDigits();
    this.drawMark(context, dp.getMinValue(), digits, range.toY(dp.getMinValue()),
        first, center, dp.getMinValueIndex(), timeline);
    this.drawMark(context, dp.getMaxValue(), digits, range.toY(dp.getMaxValue()),
        first, center, dp.getMaxValueIndex(), timeline);
};
MinMaxPlotter.prototype.drawMark = function(context, v, digits, y, first, center, index, timeline)
{
    var arrowStart, arrowStop, _arrowStop;
    var textStart;
    if (index > center) {
        context.textAlign = "right";
        arrowStart = timeline.toItemCenter(index) - 4;
        arrowStop = arrowStart - 7;
        _arrowStop = arrowStart - 3;
        textStart = arrowStop - 4;
    } else {
        context.textAlign = "left";
        arrowStart = timeline.toItemCenter(index) + 4;
        arrowStop = arrowStart + 7;
        _arrowStop = arrowStart + 3;
        textStart = arrowStop + 4;
    }
    Plotter.drawLine(context, arrowStart, y, arrowStop, y);
    Plotter.drawLine(context, arrowStart, y, _arrowStop, y + 2);
    Plotter.drawLine(context, arrowStart, y, _arrowStop, y - 2);
    context.fillText(String.fromFloat(v, digits), textStart, y);
};
var TimelinePlotter = create_class(Plotter);
TimelinePlotter.prototype.__construct = function(name) {
    TimelinePlotter.__super.__construct.call(this, name);
};
TimelinePlotter.TP_MINUTE = 60 * 1000;
TimelinePlotter.TP_HOUR   = 60 * TimelinePlotter.TP_MINUTE;
TimelinePlotter.TP_DAY    = 24 * TimelinePlotter.TP_HOUR;
TimelinePlotter.TIME_INTERVAL = [
    5  * TimelinePlotter.TP_MINUTE,
    10 * TimelinePlotter.TP_MINUTE,
    15 * TimelinePlotter.TP_MINUTE,
    30 * TimelinePlotter.TP_MINUTE,
    TimelinePlotter.TP_HOUR,
    2  * TimelinePlotter.TP_HOUR,
    3  * TimelinePlotter.TP_HOUR,
    6  * TimelinePlotter.TP_HOUR,
    12 * TimelinePlotter.TP_HOUR,
    TimelinePlotter.TP_DAY,
    2  * TimelinePlotter.TP_DAY
];
TimelinePlotter.MonthConvert = {
    1: "Jan.", 2: "Feb.", 3: "Mar.", 4 : "Apr.", 5 : "May.", 6 : "Jun.",
    7: "Jul.", 8: "Aug.", 9: "Sep.", 10: "Oct.", 11: "Nov.", 12: "Dec."
};
TimelinePlotter.prototype.Draw = function(context) {
    var mgr = ChartManager.getInstance();
    var area = mgr.getArea(this.getAreaName());
    var timeline = mgr.getTimeline(this.getDataSourceName());
    if (!area.isChanged() && !timeline.isUpdated())
        return;
    var ds = mgr.getDataSource(this.getDataSourceName());
    if (ds.getDataCount() < 2)
        return;
    var timeInterval = ds.getDataAt(1).date - ds.getDataAt(0).date;
    var n, cnt = TimelinePlotter.TIME_INTERVAL.length;
    for (n = 0; n < cnt; n++) {
        if (timeInterval < TimelinePlotter.TIME_INTERVAL[n])
            break;
    }
    for (; n < cnt; n++) {
        if (TimelinePlotter.TIME_INTERVAL[n] % timeInterval == 0)
            if ((TimelinePlotter.TIME_INTERVAL[n] / timeInterval) * timeline.getColumnWidth() > 60)
                break;
    }
    var first = timeline.getFirstIndex();
    var last = timeline.getLastIndex();
    var d = new Date();
    var local_utc_diff = d.getTimezoneOffset() * 60 * 1000;
    var theme = mgr.getTheme(this.getFrameName());
    context.font = theme.getFont(Theme.Font.Default);
    context.textAlign = "center";
    context.textBaseline = "middle";
    var lang = mgr.getLanguage();
    var gridRects = [];
    var top = area.getTop();
    var middle = area.getMiddle();
    for (var i = first; i < last; i++) {
        var utcDate = ds.getDataAt(i).date;
        var localDate = utcDate - local_utc_diff;
        var time = new Date(utcDate);
        var year = time.getFullYear();
        var month = time.getMonth() + 1;
        var date = time.getDate();
        var hour = time.getHours();
        var minute = time.getMinutes();
        var text = "";
        if (n < cnt) {
            var m = Math.max(
                TimelinePlotter.TP_DAY,
                TimelinePlotter.TIME_INTERVAL[n]);
            if (localDate % m == 0) {
                if (lang == "zh-cn")
                    text = month.toString() + "月" + date.toString() + "日";
                else if (lang == "zh-tw")
                    text = month.toString() + "月" + date.toString() + "日";
                else if (lang == "en-us")
                    text = TimelinePlotter.MonthConvert[month] + " " + date.toString();
                context.fillStyle = theme.getColor(Theme.Color.Text4);
            }
            else if (localDate % TimelinePlotter.TIME_INTERVAL[n] == 0) {
                var strMinute = minute.toString();
                if (minute < 10)
                    strMinute = "0" + strMinute;
                text = hour.toString() + ":" + strMinute;
                context.fillStyle = theme.getColor(Theme.Color.Text2);
            }
        }
        else if (date == 1 && (hour < (timeInterval / TimelinePlotter.TP_HOUR)))
        {
            if (month == 1) {
                text = year.toString();
                if (lang == "zh-cn")
                    text += "年";
                else if (lang == "zh-tw")
                    text += "年";
            }
            else {
                if (lang == "zh-cn")
                    text = month.toString() + "月";
                else if (lang == "zh-tw")
                    text = month.toString() + "月";
                else if (lang == "en-us")
                    text = TimelinePlotter.MonthConvert[month];
            }
            context.fillStyle = theme.getColor(Theme.Color.Text4);
        }
        if (text.length > 0) {
            var x = timeline.toItemCenter(i);
            gridRects.push({x:x, y:top, w:1, h:4});
            context.fillText(text, x, middle);
        }
    }
    if (gridRects.length > 0) {
        context.fillStyle = theme.getColor(Theme.Color.Grid1);
        Plotter.createRectangles(context, gridRects);
        context.fill();
    }
};
var RangePlotter = create_class(NamedObject);
RangePlotter.prototype.__construct = function(name) {
    RangePlotter.__super.__construct.call(this, name);
};
RangePlotter.prototype.getRequiredWidth = function(context, v) {
    var mgr = ChartManager.getInstance();
    var theme = mgr.getTheme(this.getFrameName());
    context.font = theme.getFont(Theme.Font.Default);
    return context.measureText((Math.floor(v) + 0.88).toString()).width + 16;
};
RangePlotter.prototype.Draw = function(context) {
    var mgr = ChartManager.getInstance();
    var areaName = this.getAreaName();
    var area = mgr.getArea(areaName);
    var rangeName = areaName.substring(0, areaName.lastIndexOf("Range"));
    var range = mgr.getRange(rangeName);
    if (range.getRange() == 0.0)
        return;
    var isMainRange = range.getNameObject().getCompAt(2) == "main";
    if (isMainRange) {
    } else {
        if (!area.isChanged() && !range.isUpdated())
            return;
    }
    var gradations = range.getGradations();
    if (gradations.length == 0)
        return;
    var left = area.getLeft();
    var right = area.getRight();
    var center = area.getCenter();
    var theme = mgr.getTheme(this.getFrameName());
    context.font = theme.getFont(Theme.Font.Default);
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = theme.getColor(Theme.Color.Text2);
    var gridRects = [];
    for (var n in gradations) {
        var y = range.toY(gradations[n]);
        gridRects.push({x:left, y:y, w:6, h:1});
        gridRects.push({x:right - 6, y:y, w:6, h:1});
        context.fillText(String.fromFloat(gradations[n], 2), center, y);
    }
    if (gridRects.length > 0) {
        context.fillStyle = theme.getColor(Theme.Color.Grid1);
        Plotter.createRectangles(context, gridRects);
        context.fill();
    }
};
/**
 * Created by Administrator on 2014/10/11.
 */
var COrderGraphPlotter = create_class(NamedObject);
COrderGraphPlotter.prototype.__construct = function(name){
    COrderGraphPlotter.__super.__construct.call(this, name);
};
COrderGraphPlotter.prototype.Draw = function(context) {
    return this._Draw_(context);
};
COrderGraphPlotter.prototype._Draw_ = function(context) {
    if (this.Update() == false) return;
    if (this.updateData() == false) return;
    this.m_top      = this.m_pArea.getTop();
    this.m_bottom   = this.m_pArea.getBottom();
    this.m_left     = this.m_pArea.getLeft();
    this.m_right    = this.m_pArea.getRight();
    context.save();
    context.rect(this.m_left, this.m_top, this.m_right - this.m_left, this.m_bottom - this.m_top);
    context.clip();
    var all = ChartManager.getInstance().getChart()._depthData;
    this.x_offset = 0;
    this.y_offset = 0;
    var ask_tmp = {};
    var bid_tmp = {};
    ask_tmp.x = this.m_left + all.array[this.m_ask_si].amounts * this.m_Step;
    ask_tmp.y = this.m_pRange.toY(all.array[this.m_ask_si].rate);
    bid_tmp.x = this.m_left + all.array[this.m_bid_si].amounts * this.m_Step;
    bid_tmp.y = this.m_pRange.toY(all.array[this.m_bid_si].rate);
    if (Math.abs(ask_tmp.y - bid_tmp.y) < 1) {
        this.y_offset = 1;
    }
    this.x_offset = 1;
    this.DrawBackground(context);
    this.UpdatePoints();
    this.FillBlack(context);
    this.DrawGradations(context);
    this.DrawLine(context);
    context.restore();
};
COrderGraphPlotter.prototype.DrawBackground = function(context) {
    context.fillStyle = this.m_pTheme.getColor(Theme.Color.Background);
    context.fillRect(this.m_left, this.m_top, this.m_right-this.m_left, this.m_bottom-this.m_top);
    var all = ChartManager.getInstance().getChart()._depthData;
    if (this.m_mode == 0) {
        var ask_bottom = this.m_pRange.toY(all.array[this.m_ask_si].rate) - this.y_offset;
        var bid_top = this.m_pRange.toY(all.array[this.m_bid_si].rate) + this.y_offset;
        var ask_gradient = context.createLinearGradient(this.m_left,0,this.m_right,0);
        ask_gradient.addColorStop(0,this.m_pTheme.getColor(Theme.Color.Background));
        ask_gradient.addColorStop(1,this.m_pTheme.getColor(Theme.Color.PositiveDark));
        context.fillStyle = ask_gradient;
        context.fillRect(this.m_left,this.m_top,this.m_right-this.m_left,ask_bottom-this.m_top);
        var bid_gradient = context.createLinearGradient(this.m_left,0,this.m_right,0);
        bid_gradient.addColorStop(0,this.m_pTheme.getColor(Theme.Color.Background));
        bid_gradient.addColorStop(1,this.m_pTheme.getColor(Theme.Color.NegativeDark));
        context.fillStyle = bid_gradient;
        context.fillRect(this.m_left,bid_top,this.m_right-this.m_left,this.m_bottom-bid_top);
    } else if (this.m_mode == 1) {
        var ask_gradient = context.createLinearGradient(this.m_left,0,this.m_right,0);
        ask_gradient.addColorStop(0,this.m_pTheme.getColor(Theme.Color.Background));
        ask_gradient.addColorStop(1,this.m_pTheme.getColor(Theme.Color.PositiveDark));
        context.fillStyle = ask_gradient;
        context.fillRect(this.m_left,this.m_top,this.m_right-this.m_left,this.m_bottom-this.m_top);
    } else if (this.m_mode == 2) {
        var bid_gradient = context.createLinearGradient(this.m_left,0,this.m_right,0);
        bid_gradient.addColorStop(0,this.m_pTheme.getColor(Theme.Color.Background));
        bid_gradient.addColorStop(1,this.m_pTheme.getColor(Theme.Color.NegativeDark));
        context.fillStyle = bid_gradient;
        context.fillRect(this.m_left,this.m_top,this.m_right-this.m_left,this.m_bottom-this.m_top);
    }
};
COrderGraphPlotter.prototype.DrawLine = function(context) {
    if (this.m_mode == 0 || this.m_mode == 1) {
        context.strokeStyle = this.m_pTheme.getColor(Theme.Color.Positive);
        context.beginPath();
        context.moveTo(Math.floor(this.m_ask_points[0].x)+0.5, Math.floor(this.m_ask_points[0].y)+0.5);
        for (var i = 1; i < this.m_ask_points.length; i++) {
            context.lineTo(Math.floor(this.m_ask_points[i].x)+0.5, Math.floor(this.m_ask_points[i].y)+0.5);
        }
        context.stroke();
    }
    if (this.m_mode == 0 || this.m_mode == 2) {
        context.strokeStyle = this.m_pTheme.getColor(Theme.Color.Negative);
        context.beginPath();
        context.moveTo(this.m_bid_points[0].x+0.5, this.m_bid_points[0].y+0.5);
        for (var i = 1; i < this.m_bid_points.length; i++) {
            context.lineTo(this.m_bid_points[i].x+0.5, this.m_bid_points[i].y+0.5);
        }
        context.stroke();
    }
};
COrderGraphPlotter.prototype.UpdatePoints = function() {
    var all = ChartManager.getInstance().getChart()._depthData;
    this.m_ask_points = [];
    var index_ask = {};
    index_ask.x = Math.floor(this.m_left);
    index_ask.y = Math.floor(this.m_pRange.toY(all.array[this.m_ask_si].rate) - this.y_offset);
    this.m_ask_points.push(index_ask);
    var ask_p_i = 0;
    for (var i = this.m_ask_si; i >= this.m_ask_ei; i--) {
        var index0 = {};
        var index1 = {};
        if (i == this.m_ask_si) {
            index0.x = Math.floor(this.m_left + all.array[i].amounts * this.m_Step + this.x_offset);
            index0.y = Math.floor(this.m_pRange.toY(all.array[i].rate) - this.y_offset);
            this.m_ask_points.push(index0);
            ask_p_i = 1;
        } else {
            index0.x = Math.floor(this.m_left + all.array[i].amounts * this.m_Step + this.x_offset);
            index0.y = Math.floor(this.m_ask_points[ask_p_i].y);
            index1.x = Math.floor(index0.x);
            index1.y = Math.floor(this.m_pRange.toY(all.array[i].rate) - this.y_offset);
            this.m_ask_points.push(index0);
            ask_p_i++;
            this.m_ask_points.push(index1);
            ask_p_i++;
        }
    }
    this.m_bid_points = [];
    var index_bid = {};
    index_bid.x = Math.floor(this.m_left);
    index_bid.y = Math.ceil(this.m_pRange.toY(all.array[this.m_bid_si].rate) + this.y_offset);
    this.m_bid_points.push(index_bid);
    var bid_p_i = 0;
    for (var i = this.m_bid_si; i <= this.m_bid_ei; i++) {
        var index0 = {};
        var index1 = {};
        if (i == this.m_bid_si) {
            index0.x = Math.floor(this.m_left + all.array[i].amounts * this.m_Step + this.x_offset);
            index0.y = Math.ceil(this.m_pRange.toY(all.array[i].rate) + this.y_offset);
            this.m_bid_points.push(index0);
            bid_p_i = 1;
        } else {
            index0.x = Math.floor(this.m_left + all.array[i].amounts * this.m_Step + this.x_offset);
            index0.y = Math.ceil(this.m_bid_points[bid_p_i].y);
            index1.x = Math.floor(index0.x);
            index1.y = Math.ceil(this.m_pRange.toY(all.array[i].rate) + this.x_offset);
            this.m_bid_points.push(index0);
            bid_p_i++;
            this.m_bid_points.push(index1);
            bid_p_i++;
        }
    }
};
COrderGraphPlotter.prototype.updateData = function() {
    var all = ChartManager.getInstance().getChart()._depthData;
    if (all.array == null) return false;
    if (all.array.length <= 100) return false;
    var minRange = this.m_pRange.getOuterMinValue();
    var maxRange = this.m_pRange.getOuterMaxValue();
    this.m_ask_si = all.asks_si;
    this.m_ask_ei = all.asks_si;
    for (var i = all.asks_si; i >= all.asks_ei; i--) {
        if (all.array[i].rate < maxRange)
            this.m_ask_ei = i;
        else
            break;
    }
    this.m_bid_si = all.bids_si;
    this.m_bid_ei = all.bids_si;
    for (var i = all.bids_si; i <= all.bids_ei; i++) {
        if (all.array[i].rate > minRange)
            this.m_bid_ei = i;
        else
            break;
    }
    if (this.m_ask_ei == this.m_ask_si)
        this.m_mode = 2;
    else if (this.m_bid_ei == this.m_bid_si)
        this.m_mode = 1;
    else
        this.m_mode = 0;
    this.m_Step = this.m_pArea.getWidth();
    if (this.m_mode == 0) {
        /*
         * View: B     --------    T
         * Data: Lo      -----     Hi
         */
        if (this.m_ask_ei == all.asks_ei && this.m_bid_ei == all.bids_ei) {
            this.m_Step /= Math.min(all.array[this.m_ask_ei].amounts,
                all.array[this.m_bid_ei].amounts);
        }
        /*
         * View: B     --------     T
         * Data: Lo         -----   Hi
         */
        else if (this.m_ask_ei != all.asks_ei && this.m_bid_ei == all.bids_ei) {
            this.m_Step /= all.array[this.m_bid_ei].amounts;
        }
        /*
         * View: B     --------    T
         * Data: Lo  -----         Hi
         */
        else if (this.m_ask_ei == all.asks_ei && this.m_bid_ei != all.bids_ei) {
            this.m_Step /= all.array[this.m_ask_ei].amounts;
        }
        /*
         * View: B     --------    T
         * Data: Lo  ------------  Hi
         */
        else if (this.m_ask_ei != all.asks_ei && this.m_bid_ei != all.bids_ei) {
            this.m_Step /= Math.max(all.array[this.m_ask_ei].amounts,
                all.array[this.m_bid_ei].amounts);
        }
    }
    else if (this.m_mode == 1) {
        this.m_Step /= all.array[this.m_ask_ei].amounts;
    }
    else if (this.m_mode == 2) {
        this.m_Step /= all.array[this.m_bid_ei].amounts;
    }
    return true;
};
COrderGraphPlotter.prototype.Update = function() {
    this.m_pMgr = ChartManager.getInstance();
    var areaName = this.getAreaName();
    this.m_pArea = this.m_pMgr.getArea(areaName);
    if (this.m_pArea == null)
        return false;
    var rangeName = areaName.substring(0, areaName.lastIndexOf("Range"));
    this.m_pRange = this.m_pMgr.getRange(rangeName);
    if (this.m_pRange == null || this.m_pRange.getRange() == 0.0)
        return false;
    this.m_pTheme = this.m_pMgr.getTheme(this.getFrameName());
    if (this.m_pTheme == null)
        return false;
    return true;
};
COrderGraphPlotter.prototype.DrawGradations = function(context) {
    var mgr = ChartManager.getInstance();
    var areaName = this.getAreaName();
    var area = mgr.getArea(areaName);
    var rangeName = areaName.substring(0, areaName.lastIndexOf("Range"));
    var range = mgr.getRange(rangeName);
    if (range.getRange() == 0.0)
        return;
    var gradations = range.getGradations();
    if (gradations.length == 0)
        return;
    var left = area.getLeft();
    var right = area.getRight();
    var gridRects = [];
    for (var n in gradations) {
        var y = range.toY(gradations[n]);
        gridRects.push({x:left, y:y, w:6, h:1});
        gridRects.push({x:right - 6, y:y, w:6, h:1});
    }
    if (gridRects.length > 0) {
        var theme = mgr.getTheme(this.getFrameName());
        context.fillStyle = theme.getColor(Theme.Color.Grid1);
        Plotter.createRectangles(context, gridRects);
        context.fill();
    }
};
COrderGraphPlotter.prototype.FillBlack = function(context) {
    var ask_point = this.m_ask_points;
    var bid_point = this.m_bid_points;
    var ask_first_add = {};
    var ask_last_add = {};
    ask_first_add.x = this.m_right;
    ask_first_add.y = ask_point[0].y;
    ask_last_add.x = this.m_right;
    ask_last_add.y = ask_point[ask_point.length-1].y;
    var bid_first_add = {};
    var bid_last_add = {};
    bid_first_add.x = this.m_right;
    bid_first_add.y = bid_point[0].y-1;
    bid_last_add.x = this.m_right;
    bid_last_add.y = bid_point[bid_point.length-1].y;
    ask_point.unshift(ask_first_add);
    ask_point.push(ask_last_add);
    bid_point.unshift(bid_first_add);
    bid_point.push(bid_last_add);
    context.fillStyle = this.m_pTheme.getColor(Theme.Color.Background);
    context.beginPath();
    context.moveTo(Math.floor(ask_point[0].x)+0.5, Math.floor(ask_point[0].y)+0.5);
    for (var i = 1; i < ask_point.length; i++) {
        context.lineTo(Math.floor(ask_point[i].x)+0.5, Math.floor(ask_point[i].y)+0.5);
    }
    context.fill();
    context.beginPath();
    context.moveTo(Math.floor(bid_point[0].x)+0.5, Math.floor(bid_point[0].y)+0.5);
    for (var i = 1; i < bid_point.length; i++) {
        context.lineTo(Math.floor(bid_point[i].x)+0.5, Math.floor(bid_point[i].y)+0.5);
    }
    context.fill();
    ask_point.shift();
    ask_point.pop();
    bid_point.shift();
    bid_point.pop();
};
COrderGraphPlotter.prototype.DrawTickerGraph = function(context) {
    return;
    var mgr = ChartManager.getInstance();
    var ds = mgr.getDataSource(this.getDataSourceName());
    var ticker = ds._dataItems[ds._dataItems.length-1].close;
    var p1x = this.m_left+1;
    var p1y = this.m_pRange.toY(ticker);
    var p2x = p1x + 5;
    var p2y = p1y + 2.5;
    var p3x = p1x + 5;
    var p3y = p1y - 2.5;
    context.fillStyle = this.m_pTheme.getColor(Theme.Color.Mark);
    context.strokeStyle = this.m_pTheme.getColor(Theme.Color.Mark);
};
var LastVolumePlotter = create_class(Plotter);
LastVolumePlotter.prototype.__construct = function (name) {
    LastVolumePlotter.__super.__construct.call(this, name);
};
LastVolumePlotter.prototype.Draw = function (context) {
    var mgr = ChartManager.getInstance();
    var timeline = mgr.getTimeline(this.getDataSourceName());
    var areaName = this.getAreaName();
    var area = mgr.getArea(areaName);
    var rangeName = areaName.substring(0, areaName.lastIndexOf("Range"));
    var range = mgr.getRange(rangeName);
    if (range.getRange() == 0.0)
        return;
    var ds = mgr.getDataSource(this.getDataSourceName());
    if (ds.getDataCount() < 1)
        return;
    var theme = mgr.getTheme(this.getFrameName());
    context.font = theme.getFont(Theme.Font.Default);
    context.textAlign = "left";
    context.textBaseline = "middle";
    context.fillStyle = theme.getColor(Theme.Color.RangeMark);
    context.strokeStyle = theme.getColor(Theme.Color.RangeMark);
    var v = ds.getDataAt(ds.getDataCount() - 1).volume;
    var y = range.toY(v);
    var left = area.getLeft() + 1;
    Plotter.drawLine(context, left, y, left + 7, y);
    Plotter.drawLine(context, left, y, left + 3, y + 2);
    Plotter.drawLine(context, left, y, left + 3, y - 2);
    context.fillText(String.fromFloat(v, 2), left + 10, y);
};
/**
 * Created by Administrator on 2014/11/28.
 */
var LastClosePlotter = create_class(Plotter);
LastClosePlotter.prototype.__construct = function (name) {
    LastClosePlotter.__super.__construct.call(this, name);
};
LastClosePlotter.prototype.Draw = function (context) {
    var mgr = ChartManager.getInstance();
    var timeline = mgr.getTimeline(this.getDataSourceName());
    var areaName = this.getAreaName();
    var area = mgr.getArea(areaName);
    var rangeName = areaName.substring(0, areaName.lastIndexOf("Range"));
    var range = mgr.getRange(rangeName);
    if (range.getRange() == 0.0)
        return;
    var ds = mgr.getDataSource(this.getDataSourceName());
    if (ds.getDataCount() < 1)
        return;
    var v = ds._dataItems[ds._dataItems.length-1].close;
    if (v <= range.getMinValue() || v >= range.getMaxValue())
        return;
    var theme = mgr.getTheme(this.getFrameName());
    context.font = theme.getFont(Theme.Font.Default);
    context.textAlign = "left";
    context.textBaseline = "middle";
    context.fillStyle = theme.getColor(Theme.Color.RangeMark);
    context.strokeStyle = theme.getColor(Theme.Color.RangeMark);
    var y = range.toY(v);
    var left = area.getLeft() + 1;
    Plotter.drawLine(context, left, y, left + 7, y);
    Plotter.drawLine(context, left, y, left + 3, y + 2);
    Plotter.drawLine(context, left, y, left + 3, y - 2);
    context.fillText(String.fromFloat(v, ds.getDecimalDigits()), left + 10, y);
};
var SelectionPlotter = create_class(Plotter);
SelectionPlotter.prototype.__construct = function(name) {
    SelectionPlotter.__super.__construct.call(this, name);
};
SelectionPlotter.prototype.Draw = function(context) {
    var mgr = ChartManager.getInstance();
    if (mgr._drawingTool != ChartManager.DrawingTool.CrossCursor)
        return;
    var area = mgr.getArea(this.getAreaName());
    var timeline = mgr.getTimeline(this.getDataSourceName());
    if (timeline.getSelectedIndex() < 0) {
        return;
    }
    var range = mgr.getRange(this.getAreaName());
    var theme = mgr.getTheme(this.getFrameName());
    context.strokeStyle = theme.getColor(Theme.Color.Cursor);
    var x = timeline.toItemCenter(timeline.getSelectedIndex());
    Plotter.drawLine(context, x, area.getTop() - 1, x, area.getBottom());
    var pos = range.getSelectedPosition();
    if (pos >= 0)
        Plotter.drawLine(context, area.getLeft(), pos, area.getRight(), pos);
};
var TimelineSelectionPlotter = create_class(NamedObject);
TimelineSelectionPlotter.MonthConvert = {
    1 : "Jan.", 2 : "Feb.", 3 : "Mar.", 4  : "Apr.", 5  : "May.", 6  : "Jun.",
    7 : "Jul.", 8 : "Aug.", 9 : "Sep.", 10 : "Oct.", 11 : "Nov.", 12 : "Dec."
};
TimelineSelectionPlotter.prototype.__construct = function(name) {
    TimelineSelectionPlotter.__super.__construct.call(this, name);
};
TimelineSelectionPlotter.prototype.Draw = function(context) {
    var mgr = ChartManager.getInstance();
    var area = mgr.getArea(this.getAreaName());
    var timeline = mgr.getTimeline(this.getDataSourceName());
    if (timeline.getSelectedIndex() < 0)
        return;
    var ds = mgr.getDataSource(this.getDataSourceName());
    if (!is_instance(ds, MainDataSource))
        return;
    var theme = mgr.getTheme(this.getFrameName());
    var lang = mgr.getLanguage();
    var x = timeline.toItemCenter(timeline.getSelectedIndex());
    context.fillStyle = theme.getColor(Theme.Color.Background);
    context.fillRect(x - 52.5, area.getTop() + 2.5, 106, 18);
    context.strokeStyle = theme.getColor(Theme.Color.Grid3);
    context.strokeRect(x - 52.5, area.getTop() + 2.5, 106, 18);
    context.font = theme.getFont(Theme.Font.Default);
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = theme.getColor(Theme.Color.Text4);
    var time = new Date(ds.getDataAt(timeline.getSelectedIndex()).date);
    var month = time.getMonth() + 1;
    var date = time.getDate();
    var hour = time.getHours();
    var minute = time.getMinutes();
    var strMonth = month.toString();
    var strDate = date.toString();
    var strHour = hour.toString();
    var strMinute = minute.toString();
    if (minute < 10)
        strMinute = "0" + strMinute;
    var text = "";
    if (lang == "zh-cn") {
        text = strMonth + "月" + strDate + "日  "
            + strHour + ":" + strMinute;
    }
    else if (lang == "zh-tw") {
        text = strMonth + "月" + strDate + "日  "
            + strHour + ":" + strMinute;
    }
    else if (lang == "en-us") {
        text = TimelineSelectionPlotter.MonthConvert[month] + " " + strDate + "  "
            + strHour + ":" + strMinute;
    }
    context.fillText(text, x, area.getMiddle());
};
var RangeSelectionPlotter = create_class(NamedObject);
RangeSelectionPlotter.prototype.__construct = function(name) {
    RangeSelectionPlotter.__super.__construct.call(this, name);
};
RangeSelectionPlotter.prototype.Draw = function(context) {
    var mgr = ChartManager.getInstance();
    var areaName = this.getAreaName();
    var area = mgr.getArea(areaName);
    var timeline = mgr.getTimeline(this.getDataSourceName());
    if (timeline.getSelectedIndex() < 0)
        return;
    var rangeName = areaName.substring(0, areaName.lastIndexOf("Range"));
    var range = mgr.getRange(rangeName);
    if (range.getRange() == 0.0 || range.getSelectedPosition() < 0)
        return;
    var v = range.getSelectedValue();
    if (v == -Number.MAX_VALUE)
        return;
    var y = range.getSelectedPosition();
    Plotter.createPolygon(context, [
        {"x": area.getLeft(),      "y": y},
        {"x": area.getLeft() + 5,  "y": y + 10},
        {"x": area.getRight() - 3, "y": y + 10},
        {"x": area.getRight() - 3, "y": y - 10},
        {"x": area.getLeft() + 5,  "y": y - 10}
    ]);
    var theme = mgr.getTheme(this.getFrameName());
    context.fillStyle = theme.getColor(Theme.Color.Background);
    context.fill();
    context.strokeStyle = theme.getColor(Theme.Color.Grid4);
    context.stroke();
    context.font = theme.getFont(Theme.Font.Default);
    context.textAlign="center";
    context.textBaseline="middle";
    context.fillStyle = theme.getColor(Theme.Color.Text3);
    var digits = 2;
    if (range.getNameObject().getCompAt(2) == "main")
        digits = mgr.getDataSource(this.getDataSourceName()).getDecimalDigits();
    context.fillText(String.fromFloat(v, digits), area.getCenter(), y);
};
var ChartSettings = {};
ChartSettings.checkVersion = function() {
    var currentVersion = 1;
    currentVersion = 2;
    if (ChartSettings._data.ver < currentVersion) {
        ChartSettings._data.ver = 2;
        var charts = ChartSettings._data.charts;
        charts.period_weight = {};
        charts.period_weight['line'] = 8;
        charts.period_weight['0'] 	= 7;
        charts.period_weight['1'] 	= 6;
        charts.period_weight['2'] 	= 5;
        charts.period_weight['9'] 	= 4;
        charts.period_weight['10'] 	= 3;
        charts.period_weight['3'] 	= 2;
        charts.period_weight['4'] 	= 1;
        charts.period_weight['7']  	= 0;
        charts.period_weight['11'] 	= 0;
        charts.period_weight['12'] 	= 0;
        charts.period_weight['13'] 	= 0;
        charts.period_weight['14'] 	= 0;
        charts.period_weight['15'] 	= 0;
    }
    currentVersion = 3;
    if (ChartSettings._data.ver < currentVersion) {
        ChartSettings._data.ver = 3;
        var charts = ChartSettings._data.charts;
        charts.areaHeight = [];
    }
}
ChartSettings.get = function () {
    if (ChartSettings._data == undefined) {
        ChartSettings.init();
        ChartSettings.load();
        ChartSettings.checkVersion();
    }
    return ChartSettings._data;
}
ChartSettings.init = function() {
    var _indic_param = {};
    var _name = new Array('MA','EMA','VOLUME','MACD','KDJ','StochRSI','RSI','DMI','OBV','BOLL','DMA','TRIX','BRAR','VR','EMV','WR','ROC','MTM','PSY');
    for (var i = 0; i < _name.length; i++) {
        var _value = ChartManager.getInstance().createIndicatorAndRange('', _name[i], true);
        if (_value == null) continue;
        _indic_param[_name[i]] = [];
        var param = _value.indic.getParameters();
        for (var j = 0; j < param.length; j++) {
            _indic_param[_name[i]].push(param[j]);
        }
    }
    var _chart_style = 'CandleStick';
    var _m_indic = 'MA';
    var _indic = new Array('VOLUME','MACD');
    var _time = '15m';
    var _frame = {};
    _frame.chartStyle = _chart_style;
    _frame.mIndic = _m_indic;
    _frame.indics = _indic;
    _frame.indicsStatus = 'close';
    _frame.period = _time;
    ChartSettings._data = {
        ver: 1,
        charts: _frame,
        indics: _indic_param,
        theme: "Dark"
    };
    ChartSettings.checkVersion();
};
ChartSettings.load = function () {
    if (document.cookie.length <= 0)
        return;
    var start = document.cookie.indexOf("chartSettings=");
    if (start == -1)
        return;
    start += "chartSettings=".length;
    var end = document.cookie.indexOf(";", start);
    if (end == -1)
        end = document.cookie.length;
    var json = unescape(document.cookie.substring(start, end));
    ChartSettings._data = JSON.parse(json);
}
ChartSettings.save = function () {
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + 365);
    document.cookie = "chartSettings=" + escape(JSON.stringify(ChartSettings._data))
        + ";expires=" + exdate.toGMTString();
}
var CPoint = create_class(NamedObject);
CPoint.state = {
    Hide : 0, Show : 1, Highlight : 2
};
CPoint.prototype.__construct = function(name) {
    CPoint.__super.__construct.call(this, name);
    this.pos = { index: -1, value: -1 };
    this.state = CPoint.state.Hide;
};
CPoint.prototype.getChartObjects = function() {
    var ppMgr = ChartManager.getInstance();
    var ppCDS = ppMgr.getDataSource("frame0.k0");
    if (ppCDS == null || !is_instance(ppCDS, MainDataSource))
        return null;
    var ppTimeline = ppMgr.getTimeline("frame0.k0");
    if (ppTimeline == null)
        return null;
    var ppRange = ppMgr.getRange("frame0.k0.main");
    if (ppRange == null)
        return null;
    return { pMgr: ppMgr, pCDS: ppCDS, pTimeline: ppTimeline, pRange: ppRange };
};
CPoint.prototype.setPosXY = function(x, y) {
    var pObj = this.getChartObjects();
    var i = pObj.pTimeline.toIndex(x);
    var v = pObj.pRange.toValue(y);
    var result = this.snapValue(i, v);
    if (result != null)
        v = result;
    this.setPosIV(i, v);
};
CPoint.prototype.setPosXYNoSnap = function(x, y) {
    var pObj = this.getChartObjects();
    var i = pObj.pTimeline.toIndex(x);
    var v = pObj.pRange.toValue(y);
    this.setPosIV(i, v);
};
CPoint.prototype.setPosIV = function(i, v) {
    this.pos = { index: i, value: v };
};
CPoint.prototype.getPosXY = function() {
    var pObj = this.getChartObjects();
    var _x = pObj.pTimeline.toItemCenter(this.pos.index);
    var _y = pObj.pRange.toY(this.pos.value);
    return { x: _x, y: _y };
};
CPoint.prototype.getPosIV = function() {
    return { i: this.pos.index, v: this.pos.value };
};
CPoint.prototype.setState = function(s) {
    this.state = s;
};
CPoint.prototype.getState = function() {
    return this.state;
};
CPoint.prototype.isSelected = function(x, y) {
    var xy = this.getPosXY();
    if (x < xy.x - 4 || x > xy.x + 4 || y < xy.y - 4 || y > xy.y + 4)
        return false;
    this.setState(CPoint.state.Highlight);
    return true;
};
CPoint.prototype.snapValue = function(i, v) {
    var pObj = this.getChartObjects();
    var result = null;
    var first = Math.floor(pObj.pTimeline.getFirstIndex());
    var last = Math.floor(pObj.pTimeline.getLastIndex());
    if (i < first || i > last)
        return result;
    var y = pObj.pRange.toY(v);
    var pData = pObj.pCDS.getDataAt(i);
    if (pData == null || pData == undefined)
        return result;
    var pDataPre = null;
    if (i > 0)
        pDataPre = pObj.pCDS.getDataAt(i - 1);
    else
        pDataPre = pObj.pCDS.getDataAt(i);
    var candleStickStyle = pObj.pMgr.getChartStyle(pObj.pCDS.getFrameName());
    var open = pObj.pRange.toY(pData.open);
    var high = pObj.pRange.toY(pData.high);
    var low = pObj.pRange.toY(pData.low);
    var close = pObj.pRange.toY(pData.close);
    if (candleStickStyle === "CandleStickHLC") {
        open = pObj.pRange.toY(pDataPre.close);
    }
    var dif_open = Math.abs(open - y);
    var dif_high = Math.abs(high - y);
    var dif_low = Math.abs(low - y);
    var dif_close = Math.abs(close - y);
    if (dif_open <= dif_high && dif_open <= dif_low && dif_open <= dif_close) {
        if (dif_open < 6)
            result = pData.open;
    }
    if (dif_high <= dif_open && dif_high <= dif_low && dif_high <= dif_close) {
        if (dif_high < 6)
            result = pData.high;
    }
    if (dif_low <= dif_open && dif_low <= dif_high && dif_low <= dif_close) {
        if (dif_low < 6)
            result = pData.low;
    }
    if (dif_close <= dif_open && dif_close <= dif_high && dif_close <= dif_low) {
        if (dif_close < 6)
            result = pData.close;
    }
    return result;
};
var CToolObject = create_class(NamedObject);
CToolObject.state = {
    BeforeDraw: 0, Draw: 1, AfterDraw: 2
};
CToolObject.prototype.__construct = function(name) {
    CToolObject.__super.__construct.call(this, name);
    this.drawer = null;
    this.state = CToolObject.state.BeforeDraw;
    this.points = [];
    this.step = 0;
};
CToolObject.prototype.getChartObjects = function() {
    var ppMgr = ChartManager.getInstance();
    var ppCDS = ppMgr.getDataSource("frame0.k0");
    if (ppCDS == null || !is_instance(ppCDS, MainDataSource))
        return null;
    var ppTimeline = ppMgr.getTimeline("frame0.k0");
    if (ppTimeline == null)
        return null;
    var ppArea = ppMgr.getArea('frame0.k0.main');
    if (ppArea == null)
        return null;
    var ppRange = ppMgr.getRange("frame0.k0.main");
    if (ppRange == null)
        return null;
    return { pMgr: ppMgr, pCDS: ppCDS, pTimeline: ppTimeline, pArea: ppArea, pRange: ppRange };
};
CToolObject.prototype.isValidMouseXY = function(x, y) {
    var pObj = this.getChartObjects();
    var areaPos = {
        left   : pObj.pArea.getLeft(),
        top    : pObj.pArea.getTop(),
        right  : pObj.pArea.getRight(),
        bottom : pObj.pArea.getBottom()
    };
    if (x < areaPos.left || x > areaPos.right ||
        y < areaPos.top || y > areaPos.bottom)
        return false;
    return true;
};
CToolObject.prototype.getPlotter = function() {
    return this.drawer;
};
CToolObject.prototype.setState = function(s) {
    this.state = s;
};
CToolObject.prototype.getState = function() {
    return this.state;
};
CToolObject.prototype.addPoint = function(point) {
    this.points.push(point);
};
CToolObject.prototype.getPoint = function(i) {
    return this.points[i];
};
CToolObject.prototype.acceptMouseMoveEvent = function(x, y) {
    if (this.isValidMouseXY(x, y) == false)
        return false;
    if (this.state == CToolObject.state.BeforeDraw) {
        this.setBeforeDrawPos(x, y);
    } else if (this.state == CToolObject.state.Draw) {
        this.setDrawPos(x, y);
    } else if (this.state == CToolObject.state.AfterDraw) {
        this.setAfterDrawPos(x, y);
    }
    return true;
};
CToolObject.prototype.acceptMouseDownEvent = function(x, y) {
    if (this.isValidMouseXY(x, y) == false)
        return false;
    if (this.state == CToolObject.state.BeforeDraw) {
        this.setDrawPos(x, y);
        this.setState(CToolObject.state.Draw);
    } else if (this.state == CToolObject.state.Draw) {
        this.setAfterDrawPos(x, y);
        if (this.step == 0)
            this.setState(CToolObject.state.AfterDraw);
    } else if (this.state == CToolObject.state.AfterDraw) {
        if (CToolObject.prototype.isSelected.call(this, x, y)) {
            this.setDrawPos(x, y);
            this.setState(CToolObject.state.Draw);
        } else {
            this.oldx = x;
            this.oldy = y;
        }
    }
    return true;
};
CToolObject.prototype.acceptMouseDownMoveEvent = function(x, y) {
    if (this.isValidMouseXY(x, y) == false)
        return false;
    if (this.state == CToolObject.state.Draw) {
        this.setDrawPos(x, y);
    } else if (this.state == CToolObject.state.AfterDraw) {
        var pObj = this.getChartObjects();
        var _width = pObj.pTimeline.getItemWidth();
        var _height = pObj.pRange;
        if (Math.abs(x - this.oldx) < _width && Math.abs(y - this.oldy) == 0)
            return true;
        var _old_x = pObj.pTimeline.toIndex(this.oldx);
        var _old_y = pObj.pRange.toValue(this.oldy);
        var _new_x = pObj.pTimeline.toIndex(x);
        var _new_y = pObj.pRange.toValue(y);
        this.oldx = x;
        this.oldy = y;
        var _dif_x = _new_x - _old_x;
        var _dif_y = _new_y - _old_y;
        for (var index in this.points) {
            this.points[index].pos.index += _dif_x;
            this.points[index].pos.value += _dif_y;
        }
    }
    return true;
};
CToolObject.prototype.acceptMouseUpEvent = function(x, y) {
    if (this.isValidMouseXY(x, y) == false)
        return false;
    if (this.state == CToolObject.state.Draw) {
        this.setAfterDrawPos(x, y);
        if (this.step == 0)
            this.setState(CToolObject.state.AfterDraw);
        return true;
    }
    return false;
};
CToolObject.prototype.setBeforeDrawPos = function(x, y) {
    for (var index in this.points) {
        this.points[index].setPosXY(x, y);
        this.points[index].setState(CPoint.state.Show);
    }
};
CToolObject.prototype.setDrawPos = function(x, y) {
    for (var index in this.points) {
        if (this.points[index].getState() == CPoint.state.Highlight) {
            this.points[index].setPosXY(x, y);
        }
    }
};
CToolObject.prototype.setAfterDrawPos = function(x, y) {
    if (this.step != 0)
        this.step -= 1;
    for (var index in this.points) {
        this.points[index].setState(CPoint.state.Hide);
    }
    if (this.step == 0) {
        var pObj = this.getChartObjects();
        pObj.pMgr.setNormalMode();
    }
};
CToolObject.prototype.isSelected = function(x, y) {
    var isFind = false;
    for (var index in this.points) {
        if (this.points[index].isSelected(x, y)) {
            this.points[index].setState(CPoint.state.Highlight);
            isFind = true;
            break;
        }
    }
    if (isFind == true) {
        this.select();
        return true;
    }
    return false;
};
CToolObject.prototype.select = function() {
    for (var index in this.points) {
        if (this.points[index].getState() == CPoint.state.Hide) {
            this.points[index].setState(CPoint.state.Show);
        }
    }
};
CToolObject.prototype.unselect = function() {
    for (var index in this.points) {
        if (this.points[index].getState() != CPoint.state.Hide) {
            this.points[index].setState(CPoint.state.Hide);
        }
    }
};
CToolObject.prototype.calcDistance = function(point1, point2, point3) {
    var xa = point1.getPosXY().x;
    var ya = point1.getPosXY().y;
    var xb = point2.getPosXY().x;
    var yb = point2.getPosXY().y;
    var xc = point3.getPosXY().x;
    var yc = point3.getPosXY().y;
    var a1 = xa - xc;
    var a2 = ya - yc;
    var b1 = xb - xc;
    var b2 = yb - yc;
    var area = Math.abs(a1 * b2 - a2 * b1);
    var len = Math.sqrt(Math.pow((xb - xa), 2) + Math.pow((yb - ya), 2));
    return area / len;
};
CToolObject.prototype.calcGap = function(r, x, y) {
    var xa = r.sx;
    var ya = r.sy;
    var xb = r.ex;
    var yb = r.ey;
    var xc = x;
    var yc = y;
    var a1 = xa - xc;
    var a2 = ya - yc;
    var b1 = xb - xc;
    var b2 = yb - yc;
    var area = Math.abs(a1 * b2 - a2 * b1);
    var len = Math.sqrt(Math.pow((xb - xa), 2) + Math.pow((yb - ya), 2));
    return area / len;
};
CToolObject.prototype.isWithRect = function(point1, point2, point3) {
    var sx = point1.getPosXY().x;
    var sy = point1.getPosXY().y;
    var ex = point2.getPosXY().x;
    var ey = point2.getPosXY().y;
    var x = point3.getPosXY().x;
    var y = point3.getPosXY().y;
    if (sx > ex) {
        sx += 4;
        ex -= 4;
    } else {
        sx -= 4;
        ex += 4;
    }
    if (sy > ey) {
        sy += 4;
        ey -= 4;
    } else {
        sy -= 4;
        ey += 4;
    }
    if (sx <= x && ex >= x && sy <= y && ey >= y)
        return true;
    if (sx >= x && ex <= x && sy <= y && ey >= y)
        return true;
    if (sx <= x && ex >= x && sy >= y && ey <= y)
        return true;
    if (sx >= x && ex <= x && sy >= y && ey <= y)
        return true;
    return false;
};
CBiToolObject = create_class(CToolObject);
CBiToolObject.prototype.__construct = function(name) {
    CBiToolObject.__super.__construct.call(this, name);
    this.addPoint(new CPoint(name));
    this.addPoint(new CPoint(name));
};
CBiToolObject.prototype.setBeforeDrawPos = function(x, y) {
    this.step = 1;
    CBiToolObject.__super.setBeforeDrawPos.call(this, x, y);
    this.getPoint(0).setState(CPoint.state.Show);
    this.getPoint(1).setState(CPoint.state.Highlight);
};
CTriToolObject = create_class(CToolObject);
CTriToolObject.prototype.__construct = function(name) {
    CTriToolObject.__super.__construct.call(this, name);
    this.addPoint(new CPoint(name));
    this.addPoint(new CPoint(name));
    this.addPoint(new CPoint(name));
};
CTriToolObject.prototype.setBeforeDrawPos = function(x, y) {
    this.step = 2;
    CBiToolObject.__super.setBeforeDrawPos.call(this, x, y);
    this.getPoint(0).setState(CPoint.state.Show);
    this.getPoint(1).setState(CPoint.state.Show);
    this.getPoint(2).setState(CPoint.state.Highlight);
};
CTriToolObject.prototype.setAfterDrawPos = function(x, y) {
    if (this.step != 0)
        this.step -= 1;
    if (this.step == 0) {
        for (var index in this.points) {
            this.points[index].setState(CPoint.state.Hide);
        }
    } else {
        this.getPoint(0).setState(CPoint.state.Show);
        this.getPoint(1).setState(CPoint.state.Highlight);
        this.getPoint(2).setState(CPoint.state.Show);
    }
    if (this.step == 0) {
        var pObj = this.getChartObjects();
        pObj.pMgr.setNormalMode();
    }
};
var CBandLineObject = create_class(CBiToolObject);
CBandLineObject.prototype.__construct = function(name) {
    CBandLineObject.__super.__construct.call(this, name);
    this.drawer = new DrawBandLinesPlotter(name, this);
};
CBandLineObject.prototype.isSelected = function(x, y) {
    if (CBandLineObject.__super.isSelected.call(this, x, y) == true)
        return true;
    var c = new CPoint("frame0.k0");
    c.setPosXY(x, y);
    var sx = this.getPoint(0).getPosXY().x;
    var sy = this.getPoint(0).getPosXY().y;
    var ex = this.getPoint(1).getPosXY().x;
    var ey = this.getPoint(1).getPosXY().y;
    var fibSequence = [100.0, 87.5, 75.0, 62.5, 50.0, 37.5, 25.0, 12.5, 0.0];
    for (var i = 0; i < fibSequence.length; i++) {
        var stage_y = sy + (100 - fibSequence[i]) / 100 * (ey - sy);
        if (stage_y < y + 4  && stage_y > y - 4) {
            this.select();
            return true;
        }
    }
    return false;
};
var CBiParallelLineObject = create_class(CTriToolObject);
CBiParallelLineObject.prototype.__construct = function(name) {
    CBiParallelLineObject.__super.__construct.call(this, name);
    this.drawer = new DrawBiParallelLinesPlotter(name, this);
};
CBiParallelLineObject.prototype.isSelected = function(x, y) {
    if (CTriParallelLineObject.__super.isSelected.call(this, x, y) == true)
        return true;
    var _0x = this.getPoint(0).getPosXY().x;
    var _0y = this.getPoint(0).getPosXY().y;
    var _1x = this.getPoint(1).getPosXY().x;
    var _1y = this.getPoint(1).getPosXY().y;
    var _2x = this.getPoint(2).getPosXY().x;
    var _2y = this.getPoint(2).getPosXY().y;
    var _a = { x : _0x-_1x, y : _0y-_1y };
    var _b = { x : _0x-_2x, y : _0y-_2y };
    var _c = { x : _a.x+_b.x, y : _a.y+_b.y };
    var _3x = _0x-_c.x;
    var _3y = _0y-_c.y;
    var r1 = {sx:_0x, sy:_0y, ex:_2x, ey:_2y };
    var r2 = {sx:_1x, sy:_1y, ex:_3x, ey:_3y };
    if (this.calcGap(r1, x, y) > 4 && this.calcGap(r2, x, y) > 4)
        return false;
    return true;
};
var CBiParallelRayLineObject = create_class(CTriToolObject);
CBiParallelRayLineObject.prototype.__construct = function(name) {
    CBiParallelRayLineObject.__super.__construct.call(this, name);
    this.drawer = new DrawBiParallelRayLinesPlotter(name, this);
};
CBiParallelRayLineObject.prototype.isSelected = function(x, y) {
    if (CTriParallelLineObject.__super.isSelected.call(this, x, y) == true)
        return true;
    var _0x = this.getPoint(0).getPosXY().x;
    var _0y = this.getPoint(0).getPosXY().y;
    var _1x = this.getPoint(1).getPosXY().x;
    var _1y = this.getPoint(1).getPosXY().y;
    var _2x = this.getPoint(2).getPosXY().x;
    var _2y = this.getPoint(2).getPosXY().y;
    var _a = { x : _0x-_1x, y : _0y-_1y };
    var _b = { x : _0x-_2x, y : _0y-_2y };
    var _c = { x : _a.x+_b.x, y : _a.y+_b.y };
    var _3x = _0x-_c.x;
    var _3y = _0y-_c.y;
    var r1 = {sx:_0x, sy:_0y, ex:_2x, ey:_2y };
    var r2 = {sx:_1x, sy:_1y, ex:_3x, ey:_3y };
    if ((r1.ex > r1.sx && x > r1.sx-4) || (r1.ex < r1.sx && x < r1.sx+4) ||
        (r2.ex > r2.sx && x > r2.sx-4) || (r2.ex < r2.sx && x < r2.sx+4)) {
        if (this.calcGap(r1, x, y) > 4 && this.calcGap(r2, x, y) > 4) {
            return false;
        }
    } else {
        return false;
    }
    this.select();
    return true;
};
var CFibFansObject = create_class(CBiToolObject);
CFibFansObject.prototype.__construct = function(name) {
    CFibFansObject.__super.__construct.call(this, name);
    this.drawer = new DrawFibFansPlotter(name, this);
};
CFibFansObject.prototype.isSelected = function(x, y) {
    if (CFibFansObject.__super.isSelected.call(this, x, y) == true)
        return true;
    var c = new CPoint("frame0.k0");
    c.setPosXY(x, y);
    var sx = this.getPoint(0).getPosXY().x;
    var sy = this.getPoint(0).getPosXY().y;
    var ex = this.getPoint(1).getPosXY().x;
    var ey = this.getPoint(1).getPosXY().y;
    var pObj = this.getChartObjects();
    var areaPos = {
        left   : pObj.pArea.getLeft(),
        top    : pObj.pArea.getTop(),
        right  : pObj.pArea.getRight(),
        bottom : pObj.pArea.getBottom()
    };
    var fibFansSequence = [0, 38.2, 50, 61.8];
    for (var i = 0; i < fibFansSequence.length; i++) {
        var stageY = sy + (100 - fibFansSequence[i]) / 100 * (ey - sy);
        var tempStartPt = {x: sx, y: sy};
        var tempEndPt = {x: ex, y: stageY};
        var crossPt = getRectCrossPt(areaPos, tempStartPt, tempEndPt);
        var lenToStartPt = Math.pow((crossPt[0].x - sx), 2) + Math.pow((crossPt[0].y - sy), 2);
        var lenToEndPt = Math.pow((crossPt[0].x - ex), 2) + Math.pow((crossPt[0].y - ey), 2);
        var tempCrossPt = lenToStartPt > lenToEndPt ? {x: crossPt[0].x, y: crossPt[0].y} : {x: crossPt[1].x, y: crossPt[1].y};
        if (tempCrossPt.x > sx && x < sx)
            continue;
        if (tempCrossPt.x < sx && x > sx)
            continue;
        var a = new CPoint("frame0.k0");
        a.setPosXY(sx, sy);
        var b = new CPoint("frame0.k0");
        b.setPosXY(tempCrossPt.x, tempCrossPt.y);
        if (this.calcDistance(a, b, c) > 4)
            continue;
        this.select();
        return true;
    }
    return false;
};
var CFibRetraceObject = create_class(CBiToolObject);
CFibRetraceObject.prototype.__construct = function(name) {
    CFibRetraceObject.__super.__construct.call(this, name);
    this.drawer = new DrawFibRetracePlotter(name, this);
};
CFibRetraceObject.prototype.isSelected = function(x, y) {
    if (CFibRetraceObject.__super.isSelected.call(this, x, y) == true)
        return true;
    var c = new CPoint("frame0.k0");
    c.setPosXY(x, y);
    var sx = this.getPoint(0).getPosXY().x;
    var sy = this.getPoint(0).getPosXY().y;
    var ex = this.getPoint(1).getPosXY().x;
    var ey = this.getPoint(1).getPosXY().y;
    var fibSequence = [100.0, 78.6, 61.8, 50.0, 38.2, 23.6, 0.0];
    for (var i = 0; i < fibSequence.length; i++) {
        var stage_y = sy + (100 - fibSequence[i]) / 100 * (ey - sy);
        if (stage_y < y + 4 && stage_y > y - 4) {
            this.select();
            return true;
        }
    }
    return false;
};
var CHoriRayLineObject = create_class(CBiToolObject);
CHoriRayLineObject.prototype.__construct = function(name) {
    CHoriRayLineObject.__super.__construct.call(this, name);
    this.drawer = new DrawHoriRayLinesPlotter(name, this);
};
CHoriRayLineObject.prototype.setDrawPos = function(x, y) {
    if (this.points[0].getState() == CPoint.state.Highlight) {
        this.points[0].setPosXY(x, y);
        this.points[1].setPosXYNoSnap(this.points[1].getPosXY().x, this.points[0].getPosXY().y);
        return;
    }
    if (this.points[1].getState() == CPoint.state.Highlight) {
        this.points[1].setPosXY(x, y);
        this.points[0].setPosXYNoSnap(this.points[0].getPosXY().x, this.points[1].getPosXY().y);
    }
};
CHoriRayLineObject.prototype.isSelected = function(x, y) {
    if (CHoriRayLineObject.__super.isSelected.call(this, x, y) == true)
        return true;
    var c = new CPoint("frame0.k0");
    c.setPosXY(x, y);
    var sy = this.getPoint(0).getPosXY().y;
    var sx = this.getPoint(0).getPosXY().x;
    var ex = this.getPoint(1).getPosXY().x;
    if (y > sy + 4 || y < sy - 4)
        return false;
    if (ex > sx && x < sx - 4)
        return false;
    if (ex < sx && x > sx + 4)
        return false;
    this.select();
    return true;
};
var CHoriSegLineObject = create_class(CBiToolObject);
CHoriSegLineObject.prototype.__construct = function(name) {
    CHoriSegLineObject.__super.__construct.call(this, name);
    this.drawer = new DrawHoriSegLinesPlotter(name, this);
};
CHoriSegLineObject.prototype.setDrawPos = function(x, y) {
    if (this.points[0].getState() == CPoint.state.Highlight) {
        this.points[0].setPosXY(x, y);
        this.points[1].setPosXYNoSnap(this.points[1].getPosXY().x, this.points[0].getPosXY().y);
        return;
    }
    if (this.points[1].getState() == CPoint.state.Highlight) {
        this.points[1].setPosXY(x, y);
        this.points[0].setPosXYNoSnap(this.points[0].getPosXY().x, this.points[1].getPosXY().y);
    }
};
CHoriSegLineObject.prototype.isSelected = function(x, y) {
    if (CHoriSegLineObject.__super.isSelected.call(this, x, y) == true)
        return true;
    var c = new CPoint("frame0.k0");
    c.setPosXY(x, y);
    var sy = this.getPoint(0).getPosXY().y;
    var sx = this.getPoint(0).getPosXY().x;
    var ex = this.getPoint(1).getPosXY().x;
    if (y > sy + 4 || y < sy - 4)
        return false;
    if (sx > ex && (x > sx + 4 || x < ex - 4))
        return false;
    if (sx < ex && (x < sx - 4 || x > ex + 4))
        return false;
    this.select();
    return true;
};
var CHoriStraightLineObject = create_class(CBiToolObject);
CHoriStraightLineObject.prototype.__construct = function(name) {
    CHoriStraightLineObject.__super.__construct.call(this, name);
    this.drawer = new DrawHoriStraightLinesPlotter(name, this);
};
CHoriStraightLineObject.prototype.setDrawPos = function(x, y) {
    for (var index in this.points) {
        this.points[index].setPosXY(x, y);
    }
};
CHoriStraightLineObject.prototype.isSelected = function(x, y) {
    if (CHoriStraightLineObject.__super.isSelected.call(this, x, y) == true)
        return true;
    var c = new CPoint("frame0.k0");
    c.setPosXY(x, y);
    var sy = this.getPoint(0).getPosXY().y;
    if (y > sy + 4 || y < sy - 4)
        return false;
    this.select();
    return true;
};
var CRayLineObject = create_class(CBiToolObject);
CRayLineObject.prototype.__construct = function(name) {
    CRayLineObject.__super.__construct.call(this, name);
    this.drawer = new DrawRayLinesPlotter(name, this);
};
CRayLineObject.prototype.isSelected = function(x, y) {
    if (CRayLineObject.__super.isSelected.call(this, x, y) == true)
        return true;
    var c = new CPoint("frame0.k0");
    c.setPosXY(x, y);
    var sx = this.getPoint(0).getPosXY().x;
    var ex = this.getPoint(1).getPosXY().x;
    if (ex > sx && x < sx - 4)
        return false;
    if (ex < sx && x > sx + 4)
        return false;
    if (this.calcDistance(this.getPoint(0), this.getPoint(1), c) < 4) {
        this.select();
        return true;
    }
    return false;
};
var CSegLineObject = create_class(CBiToolObject);
CSegLineObject.prototype.__construct = function(name) {
    CSegLineObject.__super.__construct.call(this, name);
    this.drawer = new DrawSegLinesPlotter(name, this);
};
CSegLineObject.prototype.isSelected = function(x, y) {
    if (CSegLineObject.__super.isSelected.call(this, x, y) == true)
        return true;
    var c = new CPoint("frame0.k0");
    c.setPosXY(x, y);
    if (this.isWithRect(this.getPoint(0), this.getPoint(1), c) == false)
        return false;
    if (this.calcDistance(this.getPoint(0), this.getPoint(1), c) < 4) {
        this.select();
        return true;
    }
    return false;
};
var CStraightLineObject = create_class(CBiToolObject);
CStraightLineObject.prototype.__construct = function(name) {
    CStraightLineObject.__super.__construct.call(this, name);
    this.drawer = new DrawStraightLinesPlotter(name, this);
};
CStraightLineObject.prototype.isSelected = function(x, y) {
    if (CStraightLineObject.__super.isSelected.call(this, x, y) == true)
        return true;
    var c = new CPoint("frame0.k0");
    c.setPosXY(x, y);
    if (this.calcDistance(this.getPoint(0), this.getPoint(1), c) < 4) {
        this.select();
        return true;
    }
    return false;
};
var CTriParallelLineObject = create_class(CTriToolObject);
CTriParallelLineObject.prototype.__construct = function(name) {
    CTriParallelLineObject.__super.__construct.call(this, name);
    this.drawer = new DrawTriParallelLinesPlotter(name, this);
};
CTriParallelLineObject.prototype.isSelected = function(x, y) {
    if (CTriParallelLineObject.__super.isSelected.call(this, x, y) == true)
        return true;
    var pObj = this.getChartObjects();
    var _0x = this.getPoint(0).getPosXY().x;
    var _0y = this.getPoint(0).getPosXY().y;
    var _1x = this.getPoint(1).getPosXY().x;
    var _1y = this.getPoint(1).getPosXY().y;
    var _2x = this.getPoint(2).getPosXY().x;
    var _2y = this.getPoint(2).getPosXY().y;
    var _a = { x : _0x-_1x, y : _0y-_1y };
    var _b = { x : _0x-_2x, y : _0y-_2y };
    var _c = { x : _a.x+_b.x, y : _a.y+_b.y };
    var _3x = _0x-_c.x;
    var _3y = _0y-_c.y;
    var r1 = { sx:_0x, sy:_0y, ex:_2x, ey:_2y };
    var r2 = { sx:_1x, sy:_1y, ex:_3x, ey:_3y };
    var _i = { x : _0x-_1x, y : _0y-_1y };
    var _j = { x : _2x-_3x, y : _2y-_3y };
    var _ri = { x : _1x -_0x, y : _1y-_0y };
    var _rj = { x : _3x -_2x, y : _3y-_2y };
    var _4x = Math.abs(_ri.x - _0x);
    var _4y = Math.abs(_ri.y - _0y);
    var _5x = Math.abs(_rj.x - _2x);
    var _5y = Math.abs(_rj.y - _2y);
    var r3 = { sx:_4x, sy:_4y, ex:_5x, ey:_5y };
    if (this.calcGap(r1, x, y) > 4 &&
        this.calcGap(r2, x, y) > 4 &&
        this.calcGap(r3, x, y) > 4)
        return false;
    this.select();
    return true;
};
var CVertiStraightLineObject = create_class(CBiToolObject);
CVertiStraightLineObject.prototype.__construct = function(name) {
    CVertiStraightLineObject.__super.__construct.call(this, name);
    this.drawer = new DrawVertiStraightLinesPlotter(name, this);
};
CVertiStraightLineObject.prototype.setDrawPos = function(x, y) {
    for (var index in this.points) {
        this.points[index].setPosXY(x, y);
    }
};
CVertiStraightLineObject.prototype.isSelected = function(x, y) {
    if (CVertiStraightLineObject.__super.isSelected.call(this, x, y) == true)
        return true;
    var c = new CPoint("frame0.k0");
    c.setPosXY(x, y);
    var sx = this.getPoint(0).getPosXY().x;
    if (x > sx + 4 || x < sx - 4)
        return false;
    this.select();
    return true;
};
var CPriceLineObject = create_class(CSegLineObject);
CPriceLineObject.prototype.__construct = function(name) {
    CPriceLineObject.__super.__construct.call(this, name);
    this.drawer = new DrawPriceLinesPlotter(name, this);
};
CPriceLineObject.prototype.setDrawPos = function(x, y) {
    for (var index in this.points) {
        this.points[index].setPosXY(x, y);
    }
};
CPriceLineObject.prototype.isSelected = function(x, y) {
    if (CFibRetraceObject.__super.isSelected.call(this, x, y) == true)
        return true;
    var c = new CPoint("frame0.k0");
    c.setPosXY(x, y);
    var sx = this.getPoint(0).getPosXY().x;
    var sy = this.getPoint(0).getPosXY().y;
    var ex = this.getPoint(1).getPosXY().x;
    var ey = this.getPoint(1).getPosXY().y;
    if (x < sx - 4)
        return false;
    if (y >= sy + 4 || y <= sy - 4)
        return false;
    this.select();
    return true;
};
var CArrowLineObject = create_class(CSegLineObject);
CArrowLineObject.prototype.__construct = function(name) {
    CArrowLineObject.__super.__construct.call(this, name);
    this.drawer = new DrawArrowLinesPlotter(name, this);
};
var CToolManager = create_class(NamedObject);
CToolManager.prototype.__construct = function(name) {
    CToolManager.__super.__construct.call(this, name);
    this.selectedObject = -1;
    this.toolObjects = [];
};
CToolManager.prototype.getToolObjectCount = function() {
    return this.toolObjects.length;
};
CToolManager.prototype.addToolObject = function(o) {
    this.toolObjects.push(o);
};
CToolManager.prototype.getToolObject = function(i) {
    if (i < this.toolObjects.length && i >= 0)
        return this.toolObjects[i];
    return null;
};
CToolManager.prototype.getCurrentObject = function() {
    return this.getToolObject(this.getToolObjectCount() - 1);
};
CToolManager.prototype.getSelectedObject = function() {
    return this.getToolObject(this.selectedObject);
};
CToolManager.prototype.delCurrentObject = function() {
    this.toolObjects.splice(this.getToolObjectCount() - 1, 1);
};
CToolManager.prototype.delSelectedObject = function() {
    this.toolObjects.splice(this.selectedObject, 1);
    this.selectedObject = -1;
};
CToolManager.prototype.acceptMouseMoveEvent = function(x, y) {
    if (this.selectedObject == -1) {
        var curr = this.toolObjects[this.getToolObjectCount() - 1];
        if (curr != null && curr.getState() != CToolObject.state.AfterDraw)
            return curr.acceptMouseMoveEvent(x, y);
    } else {
        var sel = this.toolObjects[this.selectedObject];
        if (sel.getState() == CToolObject.state.Draw)
            return sel.acceptMouseMoveEvent(x, y);
        sel.unselect();
        this.selectedObject = -1;
    }
    for (var index in this.toolObjects) {
        if (this.toolObjects[index].isSelected(x, y)) {
            this.selectedObject = index;
            return false;
        }
    }
    return false;
};
CToolManager.prototype.acceptMouseDownEvent = function(x, y) {
    this.mouseDownMove = false;
    if (this.selectedObject == -1) {
        var curr = this.toolObjects[this.getToolObjectCount() - 1];
        if (curr != null && curr.getState() != CToolObject.state.AfterDraw)
            return curr.acceptMouseDownEvent(x, y);
    } else {
        var sel = this.toolObjects[this.selectedObject];
        if (sel.getState() != CToolObject.state.BeforeDraw)
            return sel.acceptMouseDownEvent(x, y);
    }
    return false;
};
CToolManager.prototype.acceptMouseDownMoveEvent = function(x, y) {
    this.mouseDownMove = true;
    if (this.selectedObject == -1) {
        var curr = this.toolObjects[this.getToolObjectCount() - 1];
        if (curr != null && curr.getState() == CToolObject.state.Draw)
            return curr.acceptMouseDownMoveEvent(x, y);
        return false;
    } else {
        var sel = this.toolObjects[this.selectedObject];
        if (sel.getState() != CToolObject.state.BeforeDraw) {
            if (sel.acceptMouseDownMoveEvent(x, y) == true) {
                var point = this.toolObjects[this.selectedObject].points;
                for (var i = 0; i < point.length; i++) {
                    if (point[i].state == CPoint.state.Highlight || point[i].state == CPoint.state.Show) {
                        return true;
                    }
                }
            }
            return true;
        }
    }
};
CToolManager.prototype.acceptMouseUpEvent = function(x, y) {
    if (this.mouseDownMove == true) {
        if (this.selectedObject == -1) {
            var curr = this.toolObjects[this.getToolObjectCount() - 1];
            if (curr != null && curr.getState() == CToolObject.state.Draw)
                return curr.acceptMouseUpEvent(x, y);
            return true;
        } else {
            var sel = this.toolObjects[this.selectedObject];
            if (sel.getState() != CToolObject.state.BeforeDraw)
                return sel.acceptMouseUpEvent(x, y);
        }
    }
    if (this.selectedObject != -1) {
        return true;
    }
    var curr = this.toolObjects[this.getToolObjectCount() - 1];
    if (curr != null) {
        if (curr.getState() == CToolObject.state.Draw)
            return true;
        if (!curr.isValidMouseXY(x, y)) {
            return false;
        }
        if (curr.isSelected(x, y)) {
            return true;
        }
    }
    return false;
};
var CToolPlotter = create_class(NamedObject);
CToolPlotter.prototype.__construct = function(name, toolObject) {
    CToolPlotter.__super.__construct.call(this, name);
    this.toolObject = toolObject;
    var pMgr = ChartManager.getInstance();
    var pArea = pMgr.getArea('frame0.k0.main');
    if (pArea == null) {
        this.areaPos = {
            left : 0,
            top : 0,
            right : 0,
            bottom : 0
        };
        return;
    }
    this.areaPos = {
        left : pArea.getLeft(),
        top : pArea.getTop(),
        right : pArea.getRight(),
        bottom : pArea.getBottom()
    };
    this.crossPt = {};
    this.normalSize = 4;
    this.selectedSize = 6;
    this.cursorLen = 4;
    this.cursorGapLen = 3;
    this.theme = ChartManager.getInstance().getTheme(this.getFrameName());
};
CToolPlotter.prototype.drawCursor = function(context){
    this.drawCrossCursor(context);
};
CToolPlotter.prototype.drawCrossCursor = function(context){
    context.strokeStyle = this.theme.getColor(Theme.Color.LineColorNormal);
    context.fillStyle   = this.theme.getColor(Theme.Color.LineColorNormal);
    var tempPt = this.toolObject.getPoint(0).getPosXY();
    if (tempPt == null){
        return;
    }
    var x = tempPt.x;
    var y = tempPt.y;
    var cursorLen = this.cursorLen;
    var cursorGapLen = this.cursorGapLen;
    context.fillRect( x, y, 1, 1);
    Plotter.drawLine(context, x - cursorLen - cursorGapLen , y, x - cursorGapLen, y);
    Plotter.drawLine(context, x + cursorLen + cursorGapLen , y, x + cursorGapLen, y);
    Plotter.drawLine(context, x , y - cursorLen - cursorGapLen, x , y- cursorGapLen);
    Plotter.drawLine(context, x , y + cursorLen + cursorGapLen, x, y + cursorGapLen);
};
CToolPlotter.prototype.drawCircle = function(context, center, radius){
    var centerX = center.x;
    var centerY = center.y;
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    context.fillStyle = this.theme.getColor(Theme.Color.CircleColorFill);
    context.fill();
    context.stroke();
};
CToolPlotter.prototype.drawCtrlPt = function(context){
    context.strokeStyle = this.theme.getColor(Theme.Color.CircleColorStroke);
    for(var i=0; i<this.ctrlPtsNum; i++){
        this.drawCircle(context, this.ctrlPts[1][i], this.normalSize);
    }
}
CToolPlotter.prototype.highlightCtrlPt = function(context){
    context.strokeStyle = this.theme.getColor(Theme.Color.CircleColorStroke);
    for(var i=0; i<this.ctrlPtsNum; i++){
        if (this.toolObject.getPoint(i).getState() == CPoint.state.Highlight)
            this.drawCircle(context, this.ctrlPts[1][i], this.selectedSize);
    }
}
CToolPlotter.prototype.drawFibRayLines = function(context, startPoint, endPoint) {
    for (var i=0; i < this.fiboFansSequence.length; i++){
        var stageY = startPoint.y + (100 - this.fiboFansSequence[i]) / 100 * (endPoint.y - startPoint.y);
        var tempStartPt = {x : startPoint.x, y : startPoint.y};
        var tempEndPt = {x : endPoint.x, y : stageY};
        this.drawRayLines(context, tempStartPt, tempEndPt);
    }
}
CToolPlotter.prototype.drawRayLines = function(context, startPoint, endPoint){
    this.getAreaPos();
    var tempStartPt = {x : startPoint.x, y : startPoint.y};
    var tempEndPt = {x : endPoint.x, y : endPoint.y};
    var crossPt = getRectCrossPt (this.areaPos, tempStartPt, tempEndPt);
    var tempCrossPt;
    if(endPoint.x == startPoint.x){
        if(endPoint.y == startPoint.y){
            tempCrossPt = endPoint;
        }else{
            tempCrossPt = endPoint.y > startPoint.y ? {x : crossPt[1].x, y : crossPt[1].y} : {x : crossPt[0].x, y : crossPt[0].y}
        }
    } else{
        tempCrossPt = endPoint.x > startPoint.x ? {x : crossPt[1].x, y : crossPt[1].y} : {x : crossPt[0].x, y : crossPt[0].y}
    }
    Plotter.drawLine(context, startPoint.x , startPoint.y, tempCrossPt.x, tempCrossPt.y);
}
CToolPlotter.prototype.lenBetweenPts = function(pt1, pt2){
    return Math.sqrt(Math.pow((pt2.x - pt1.x),2)+Math.pow((pt2.y - pt1.y),2));
}
CToolPlotter.prototype.getCtrlPts = function(){
    for(var i=0; i<this.ctrlPtsNum; i++){
        this.ctrlPts[0][i] = this.toolObject.getPoint(i);
    }
}
CToolPlotter.prototype.updateCtrlPtPos = function(){
    for(var i=0; i<this.ctrlPtsNum; i++){
        this.ctrlPts[1][i] = this.ctrlPts[0][i].getPosXY();
    }
}
CToolPlotter.prototype.getAreaPos = function(){
    var pMgr = ChartManager.getInstance();
    var pArea = pMgr.getArea('frame0.k0.main');
    if (pArea == null) {
        this.areaPos = {
            left : 0,
            top : 0,
            right : 0,
            bottom : 0
        };
        return;
    }
    this.areaPos = {
        left : Math.floor(pArea.getLeft()),
        top : Math.floor(pArea.getTop()),
        right : Math.floor(pArea.getRight()),
        bottom : Math.floor(pArea.getBottom())
    };
}
CToolPlotter.prototype.updateDraw = function(context){
    context.strokeStyle = this.theme.getColor(Theme.Color.LineColorNormal);
    this.draw(context);
    this.drawCtrlPt(context);
}
CToolPlotter.prototype.finishDraw = function(context) {
    context.strokeStyle = this.theme.getColor(Theme.Color.LineColorNormal);
    this.draw(context);
}
CToolPlotter.prototype.highlight = function(context) {
    context.strokeStyle = this.theme.getColor(Theme.Color.LineColorSelected);
    this.draw(context);
    this.drawCtrlPt(context);
    this.highlightCtrlPt(context);
}
var DrawStraightLinesPlotter = create_class(CToolPlotter);
DrawStraightLinesPlotter.prototype.__construct = function(name, toolObject) {
    DrawStraightLinesPlotter.__super.__construct.call(this, name, toolObject);
    this.toolObject = toolObject;
    this.ctrlPtsNum = 2;
    this.ctrlPts = new Array(new Array(this.ctrlPtsNum),new Array(2));
    this.getCtrlPts();
};
DrawStraightLinesPlotter.prototype.draw = function(context) {
    this.updateCtrlPtPos();
    this.getAreaPos();
    this.startPoint = this.ctrlPts[1][0];
    this.endPoint = this.ctrlPts[1][1];
    if (this.startPoint.x == this.endPoint.x && this.startPoint.y == this.endPoint.y){
        Plotter.drawLine(context, this.areaPos.left, this.startPoint.y, this.areaPos.right, this.startPoint.y);
    }else{
        this.crossPt = getRectCrossPt (this.areaPos, this.startPoint, this.endPoint);
        Plotter.drawLine(context, this.crossPt[0].x , this.crossPt[0].y, this.crossPt[1].x, this.crossPt[1].y);
    }
};
var DrawSegLinesPlotter = create_class(CToolPlotter);
DrawSegLinesPlotter.prototype.__construct = function(name, toolObject) {
    DrawSegLinesPlotter.__super.__construct.call(this, name, toolObject);
    this.toolObject = toolObject;
    this.ctrlPtsNum = 2;
    this.ctrlPts = new Array(new Array(this.ctrlPtsNum),new Array(2));
    this.getCtrlPts();
};
DrawSegLinesPlotter.prototype.draw = function(context){
    this.updateCtrlPtPos();
    this.startPoint = this.ctrlPts[1][0];
    this.endPoint = this.ctrlPts[1][1];
    if (this.startPoint.x == this.endPoint.x && this.startPoint.y == this.endPoint.y) {
        this.endPoint.x += 1;
    }
    Plotter.drawLine(context, this.startPoint.x , this.startPoint.y, this.endPoint.x, this.endPoint.y);
}
var DrawRayLinesPlotter = create_class(CToolPlotter);
DrawRayLinesPlotter.prototype.__construct = function(name, toolObject) {
    DrawRayLinesPlotter.__super.__construct.call(this, name);
    this.toolObject = toolObject;
    this.ctrlPtsNum = 2;
    this.ctrlPts = new Array(new Array(this.ctrlPtsNum),new Array(2));
    this.getCtrlPts();
};
DrawRayLinesPlotter.prototype.draw = function(context) {
    this.updateCtrlPtPos();
    this.getAreaPos();
    this.startPoint = this.ctrlPts[1][0];
    this.endPoint = this.ctrlPts[1][1];
    if (this.startPoint.x == this.endPoint.x && this.startPoint.y == this.endPoint.y) {
        this.endPoint.x += 1;
    }
    this.drawRayLines(context, this.startPoint, this.endPoint);
}
var DrawArrowLinesPlotter = create_class(CToolPlotter);
DrawArrowLinesPlotter.prototype.__construct = function(name, toolObject) {
    DrawArrowLinesPlotter.__super.__construct.call(this, name, toolObject);
    this.toolObject = toolObject;
    this.arrowSizeRatio = 0.03;
    this.arrowSize = 4;
    this.crossPt = {x : -1, y : -1};
    this.ctrlPtsNum = 2;
    this.ctrlPts = new Array(new Array(this.ctrlPtsNum),new Array(2));
    this.getCtrlPts();
};
DrawArrowLinesPlotter.prototype.drawArrow = function(context, startPoint, endPoint) {
    var len = this.lenBetweenPts(startPoint,endPoint);
    var vectorA = [endPoint.x - startPoint.x, endPoint.y - startPoint.y];
    this.crossPt.x = startPoint.x + (1 - this.arrowSize/len) * vectorA[0];
    this.crossPt.y = startPoint.y + (1 - this.arrowSize/len) * vectorA[1];
    var vectorAautho = [-vectorA[1], vectorA[0]];
    var Aautho = {x : vectorAautho[0], y : vectorAautho[1]};
    var origin = {x : 0, y : 0};
    vectorAautho[0] = this.arrowSize * Aautho.x / this.lenBetweenPts(Aautho, origin);
    vectorAautho[1] = this.arrowSize * Aautho.y / this.lenBetweenPts(Aautho, origin);
    var arrowEndPt = [this.crossPt.x + vectorAautho[0], this.crossPt.y + vectorAautho[1]];
    Plotter.drawLine(context, endPoint.x, endPoint.y, arrowEndPt[0], arrowEndPt[1]);
    arrowEndPt = [this.crossPt.x - vectorAautho[0], this.crossPt.y - vectorAautho[1]];
    Plotter.drawLine(context, endPoint.x, endPoint.y, arrowEndPt[0], arrowEndPt[1]);
}
DrawArrowLinesPlotter.prototype.draw = function(context){
    this.updateCtrlPtPos();
    this.startPoint = this.ctrlPts[1][0];
    this.endPoint = this.ctrlPts[1][1];
    if (this.startPoint.x == this.endPoint.x && this.startPoint.y == this.endPoint.y) {
        this.endPoint.x += 1;
    }
    Plotter.drawLine(context, this.startPoint.x , this.startPoint.y, this.endPoint.x, this.endPoint.y);
    this.drawArrow(context, this.startPoint, this.endPoint);
}
var DrawHoriStraightLinesPlotter = create_class(CToolPlotter);
DrawHoriStraightLinesPlotter.prototype.__construct = function(name, toolObject) {
    DrawHoriStraightLinesPlotter.__super.__construct.call(this, name);
    this.toolObject = toolObject;
    this.ctrlPtsNum = 1;
    this.ctrlPts = new Array(new Array(this.ctrlPtsNum),new Array(2));
    this.getCtrlPts();
};
DrawHoriStraightLinesPlotter.prototype.draw = function(context) {
    this.updateCtrlPtPos();
    this.getAreaPos();
    this.startPoint = this.ctrlPts[1][0];
    Plotter.drawLine(context, this.areaPos.left, this.startPoint.y, this.areaPos.right, this.startPoint.y);
};
var DrawHoriRayLinesPlotter = create_class(CToolPlotter);
DrawHoriRayLinesPlotter.prototype.__construct = function(name, toolObject) {
    DrawHoriRayLinesPlotter.__super.__construct.call(this, name);
    this.toolObject = toolObject;
    this.ctrlPtsNum = 2;
    this.ctrlPts = new Array(new Array(this.ctrlPtsNum),new Array(2));
    this.getCtrlPts();
};
DrawHoriRayLinesPlotter.prototype.draw = function(context) {
    this.updateCtrlPtPos();
    this.getAreaPos();
    this.startPoint = this.ctrlPts[1][0];
    this.endPoint = this.ctrlPts[1][1];
    if (this.startPoint.x == this.endPoint.x ){
        Plotter.drawLine(context, this.startPoint.x, this.startPoint.y, this.areaPos.right, this.startPoint.y);
    }else{
        var tempEndPt = {x : this.endPoint.x, y : this.startPoint.y};
        this.drawRayLines(context, this.startPoint, tempEndPt);
    }
};
var DrawHoriSegLinesPlotter = create_class(CToolPlotter);
DrawHoriSegLinesPlotter.prototype.__construct = function(name, toolObject) {
    DrawHoriSegLinesPlotter.__super.__construct.call(this, name, toolObject);
    this.toolObject = toolObject;
    this.ctrlPtsNum = 2;
    this.ctrlPts = new Array(new Array(this.ctrlPtsNum),new Array(2));
    this.getCtrlPts();
};
DrawHoriSegLinesPlotter.prototype.draw = function(context) {
    this.updateCtrlPtPos();
    this.startPoint = this.ctrlPts[1][0];
    this.endPoint = this.ctrlPts[1][1];
    this.endPoint.y = this.startPoint.y;
    if (this.startPoint.x == this.endPoint.x && this.startPoint.y == this.endPoint.y) {
        Plotter.drawLine(context, this.startPoint.x, this.startPoint.y, this.endPoint.x+1, this.startPoint.y);
    } else {
        Plotter.drawLine(context, this.startPoint.x , this.startPoint.y, this.endPoint.x, this.startPoint.y);
    }
};
var DrawVertiStraightLinesPlotter = create_class(CToolPlotter);
DrawVertiStraightLinesPlotter.prototype.__construct = function(name, toolObject) {
    DrawVertiStraightLinesPlotter.__super.__construct.call(this, name);
    this.toolObject = toolObject;
    this.ctrlPtsNum = 1;
    this.ctrlPts = new Array(new Array(this.ctrlPtsNum),new Array(2));
    this.getCtrlPts();
};
DrawVertiStraightLinesPlotter.prototype.draw = function(context) {
    this.updateCtrlPtPos();
    this.getAreaPos();
    this.startPoint = this.ctrlPts[1][0];
    Plotter.drawLine(context, this.startPoint.x, this.areaPos.top, this.startPoint.x, this.areaPos.bottom);
};
var DrawPriceLinesPlotter = create_class(CToolPlotter);
DrawPriceLinesPlotter.prototype.__construct = function(name, toolObject) {
    DrawPriceLinesPlotter.__super.__construct.call(this, name);
    this.toolObject = toolObject;
    this.ctrlPtsNum = 1;
    this.ctrlPts = new Array(new Array(this.ctrlPtsNum),new Array(2));
    this.getCtrlPts();
};
DrawPriceLinesPlotter.prototype.draw = function(context) {
    context.font="12px Tahoma";
    context.textAlign="left";
    context.fillStyle = this.theme.getColor(Theme.Color.LineColorNormal);
    this.updateCtrlPtPos();
    this.getAreaPos();
    this.startPoint = this.ctrlPts[1][0];
    var text = this.ctrlPts[0][0].getPosIV().v;
    Plotter.drawLine(context, this.startPoint.x, this.startPoint.y, this.areaPos.right, this.startPoint.y);
    context.fillText(text.toFixed(2), this.startPoint.x + 2, this.startPoint.y - 15);
};
var ParallelLinesPlotter = create_class(CToolPlotter);
ParallelLinesPlotter.prototype.__construct = function(name, toolObject) {
    ParallelLinesPlotter.__super.__construct.call(this, name);
    this.toolObject = toolObject;
};
ParallelLinesPlotter.prototype.getParaPt = function(){
    var vectorA = [];
    vectorA[0] = this.endPoint.x - this.startPoint.x;
    vectorA[1] = this.endPoint.y - this.startPoint.y;
    var vectorB = [];
    vectorB[0] = this.paraStartPoint.x - this.startPoint.x;
    vectorB[1] = this.paraStartPoint.y - this.startPoint.y;
    this.paraEndPoint = {x : -1, y : -1};
    this.paraEndPoint.x = vectorA[0] + vectorB[0] +this.startPoint.x;
    this.paraEndPoint.y = vectorA[1] + vectorB[1] +this.startPoint.y;
}
var DrawBiParallelLinesPlotter = create_class(ParallelLinesPlotter);
DrawBiParallelLinesPlotter.prototype.__construct = function(name, toolObject) {
    DrawBiParallelLinesPlotter.__super.__construct.call(this, name, toolObject);
    this.toolObject = toolObject;
    this.ctrlPtsNum = 3;
    this.ctrlPts = new Array(new Array(this.ctrlPtsNum),new Array(2));
    this.getCtrlPts();
};
DrawBiParallelLinesPlotter.prototype.draw = function(context) {
    this.updateCtrlPtPos();
    this.getAreaPos();
    this.startPoint = this.ctrlPts[1][0];
    this.paraStartPoint = this.ctrlPts[1][1];
    this.endPoint = this.ctrlPts[1][2];
    this.getParaPt();
    this.getAreaPos();
    this.crossPt0 = getRectCrossPt (this.areaPos, this.startPoint, this.endPoint);
    Plotter.drawLine(context, this.crossPt0[0].x , this.crossPt0[0].y, this.crossPt0[1].x, this.crossPt0[1].y);
    this.crossPt1 = getRectCrossPt (this.areaPos, this.paraStartPoint, this.paraEndPoint);
    Plotter.drawLine(context, this.crossPt1[0].x , this.crossPt1[0].y, this.crossPt1[1].x, this.crossPt1[1].y);
};
var DrawBiParallelRayLinesPlotter = create_class(ParallelLinesPlotter);
DrawBiParallelRayLinesPlotter.prototype.__construct = function(name, toolObject) {
    DrawBiParallelRayLinesPlotter.__super.__construct.call(this, name, toolObject);
    this.toolObject = toolObject;
    this.ctrlPtsNum = 3;
    this.ctrlPts = new Array(new Array(this.ctrlPtsNum),new Array(2));
    this.getCtrlPts();
};
DrawBiParallelRayLinesPlotter.prototype.draw = function(context) {
    this.updateCtrlPtPos();
    this.getAreaPos();
    this.startPoint = this.ctrlPts[1][0];
    this.paraStartPoint = this.ctrlPts[1][1];
    this.endPoint = this.ctrlPts[1][2];
    if (this.startPoint.x == this.endPoint.x && this.startPoint.y == this.endPoint.y) {
        this.endPoint.x += 1;
    }
    this.getParaPt();
    this.drawRayLines(context, this.startPoint, this.endPoint);
    this.drawRayLines(context, this.paraStartPoint, this.paraEndPoint);
};
var DrawTriParallelLinesPlotter = create_class(ParallelLinesPlotter);
DrawTriParallelLinesPlotter.prototype.__construct = function(name, toolObject) {
    DrawTriParallelLinesPlotter.__super.__construct.call(this, name, toolObject);
    this.toolObject = toolObject;
    this.ctrlPtsNum = 3;
    this.ctrlPts = new Array(new Array(this.ctrlPtsNum),new Array(2));
    this.getCtrlPts();
};
DrawTriParallelLinesPlotter.prototype.draw = function(context) {
    this.updateCtrlPtPos();
    this.getAreaPos();
    this.startPoint = this.ctrlPts[1][0];
    this.paraStartPoint = this.ctrlPts[1][1];
    this.endPoint = this.ctrlPts[1][2];
    var vectorA = [];
    vectorA[0] = this.endPoint.x - this.startPoint.x;
    vectorA[1] = this.endPoint.y - this.startPoint.y;
    var vectorB = [];
    vectorB[0] = this.paraStartPoint.x - this.startPoint.x;
    vectorB[1] = this.paraStartPoint.y - this.startPoint.y;
    this.para1EndPoint = {x : -1, y : -1};
    this.para2EndPoint = {x : -1, y : -1};
    this.para2StartPoint = {x : -1, y : -1};
    this.para1EndPoint.x = vectorA[0] + vectorB[0] +this.startPoint.x;
    this.para1EndPoint.y = vectorA[1] + vectorB[1] +this.startPoint.y;
    this.para2StartPoint.x = this.startPoint.x - vectorB[0];
    this.para2StartPoint.y = this.startPoint.y - vectorB[1];
    this.para2EndPoint.x = this.endPoint.x - vectorB[0];
    this.para2EndPoint.y = this.endPoint.y - vectorB[1];
    this.getAreaPos();
    this.crossPt0 = getRectCrossPt (this.areaPos, this.startPoint, this.endPoint);
    Plotter.drawLine(context, this.crossPt0[0].x , this.crossPt0[0].y, this.crossPt0[1].x, this.crossPt0[1].y);
    this.crossPt1 = getRectCrossPt (this.areaPos, this.paraStartPoint, this.para1EndPoint);
    Plotter.drawLine(context, this.crossPt1[0].x , this.crossPt1[0].y, this.crossPt1[1].x, this.crossPt1[1].y);
    this.crossPt2 = getRectCrossPt (this.areaPos, this.para2StartPoint, this.para2EndPoint);
    Plotter.drawLine(context, this.crossPt2[0].x , this.crossPt2[0].y, this.crossPt2[1].x, this.crossPt2[1].y);
};
var BandLinesPlotter = create_class(CToolPlotter);
BandLinesPlotter.prototype.__construct = function(name, toolObject) {
    BandLinesPlotter.__super.__construct.call(this, name);
    this.toolObject = toolObject;
    this.ctrlPtsNum = 2;
    this.ctrlPts = new Array(new Array(this.ctrlPtsNum),new Array(2));
    this.getCtrlPts();
};
BandLinesPlotter.prototype.drawLinesAndInfo = function(context, startPoint, endPoint) {
    context.font="12px Tahoma";
    context.textAlign="left";
    context.fillStyle = this.theme.getColor(Theme.Color.LineColorNormal);
    var text;
    if ( this.toolObject.state == CToolObject.state.Draw) {
        this.startPtValue = this.toolObject.getPoint(0).getPosIV().v;
        this.endPtValue = this.toolObject.getPoint(1).getPosIV().v;
    }
    this.getAreaPos();
    for (var i=0; i < this.fiboSequence.length; i++){
        var stageY = startPoint.y + (100 - this.fiboSequence[i]) / 100 * (endPoint.y - startPoint.y);
        if (stageY > this.areaPos.bottom)
            continue;
        var stageYvalue = this.startPtValue + (100 - this.fiboSequence[i]) / 100 * (this.endPtValue - this.startPtValue);
        Plotter.drawLine(context, this.areaPos.left, stageY, this.areaPos.right, stageY);
        text = this.fiboSequence[i].toFixed(1) + '% ' + stageYvalue.toFixed(1);
        context.fillText(text, this.areaPos.left + 2, stageY - 15);
    }
}
BandLinesPlotter.prototype.draw = function(context) {
    this.updateCtrlPtPos();
    this.getAreaPos();
    this.startPoint = this.ctrlPts[1][0];
    this.endPoint = this.ctrlPts[1][1];
    this.drawLinesAndInfo(context, this.startPoint, this.endPoint);
};
var DrawFibRetracePlotter = create_class(BandLinesPlotter);
DrawFibRetracePlotter.prototype.__construct = function(name, toolObject) {
    DrawFibRetracePlotter.__super.__construct.call(this, name, toolObject);
    this.toolObject = toolObject;
    this.fiboSequence = [100.0, 78.6, 61.8, 50.0, 38.2, 23.6, 0.0];
};
var DrawBandLinesPlotter = create_class(BandLinesPlotter);
DrawBandLinesPlotter.prototype.__construct = function(name, toolObject) {
    DrawBandLinesPlotter.__super.__construct.call(this, name, toolObject);
    this.toolObject = toolObject;
    this.fiboSequence = [0, 12.5, 25, 37.5, 50, 62.5, 75, 87.5, 100];
};
var DrawFibFansPlotter = create_class(CToolPlotter);
DrawFibFansPlotter.prototype.__construct = function(name, toolObject) {
    DrawFibFansPlotter.__super.__construct.call(this, name);
    this.toolObject = toolObject;
    this.fiboFansSequence = [0, 38.2, 50, 61.8];
    this.ctrlPtsNum = 2;
    this.ctrlPts = new Array(new Array(this.ctrlPtsNum),new Array(2));
    this.getCtrlPts();
};
DrawFibFansPlotter.prototype.drawLinesAndInfo = function(context, startPoint, endPoint) {
    this.drawFibRayLines(context, startPoint, endPoint);
}
DrawFibFansPlotter.prototype.draw = function(context) {
    this.updateCtrlPtPos();
    this.getAreaPos();
    this.startPoint = this.ctrlPts[1][0];
    this.endPoint = this.ctrlPts[1][1];
    if (this.startPoint.x == this.endPoint.x && this.startPoint.y == this.endPoint.y) {
        this.endPoint.x += 1;
    }
    this.drawLinesAndInfo(context, this.startPoint, this.endPoint);
};
var CDynamicLinePlotter = create_class(NamedObject);
CDynamicLinePlotter.prototype.__construct = function(name) {
    CDynamicLinePlotter.__super.__construct.call(this, name);
    this.flag = true;
    this.context = ChartManager.getInstance()._overlayContext;
};
CDynamicLinePlotter.prototype.getAreaPos = function(){
    var pMgr = ChartManager.getInstance();
    var pArea = pMgr.getArea('frame0.k0.main');
    if (pArea == null) {
        this.areaPos = {
            left : 0,
            top : 0,
            right : 0,
            bottom : 0
        };
        return;
    }
    this.areaPos = {
        left : Math.floor(pArea.getLeft()),
        top : Math.floor(pArea.getTop()),
        right : Math.floor(pArea.getRight()),
        bottom : Math.floor(pArea.getBottom())
    };
};
CDynamicLinePlotter.prototype.Draw = function(context) {
    this.getAreaPos();
    var pMgr = ChartManager.getInstance();
    var pTDP = pMgr.getDataSource(this.getDataSourceName());
    if (pTDP == null || !is_instance(pTDP, MainDataSource))
        return;
    this.context.save();
    this.context.rect(this.areaPos.left, this.areaPos.top, this.areaPos.right - this.areaPos.left, this.areaPos.bottom - this.areaPos.top);
    this.context.clip();
    var count = pTDP.getToolObjectCount();
    for (var i = 0; i < count; i++) {
        var toolObject = pTDP.getToolObject(i);
        var state = toolObject.getState();
        switch (state) {
            case CToolObject.state.BeforeDraw:
                toolObject.getPlotter().theme = ChartManager.getInstance().getTheme(this.getFrameName());
                toolObject.getPlotter().drawCursor(this.context);
                break;
            case CToolObject.state.Draw:
                toolObject.getPlotter().theme = ChartManager.getInstance().getTheme(this.getFrameName());
                toolObject.getPlotter().updateDraw(this.context);
                break;
            case CToolObject.state.AfterDraw:
                toolObject.getPlotter().theme = ChartManager.getInstance().getTheme(this.getFrameName());
                toolObject.getPlotter().finishDraw(this.context);
                break;
            default :
                break;
        }
    }
    var sel = pTDP.getSelectToolObjcet();
    if (sel != null && sel != CToolObject.state.Draw)
        sel.getPlotter().highlight(this.context);
    this.context.restore();
    return;
};
function KLineMouseEvent() {
    $(document).ready(function(){
        function __resize() {
            if (navigator.userAgent.indexOf('Firefox') >= 0) {
                setTimeout(on_size, 200);
            } else {
                on_size();
            }
        }
        __resize();
        $(window).resize(__resize);
        $('#chart_overlayCanvas').bind("contextmenu",function(e){
            e.cancelBubble=true;
            e.returnValue=false;
            e.preventDefault();
            e.stopPropagation();
            return false;
        });
        $('#chart_input_interface').submit(function(e) {
            e.preventDefault();
            var text = $('#chart_input_interface_text').val();
            var json_text = JSON.parse(text);
            var command = json_text.command;
            var content = json_text.content;
            switch (command) {
                case 'set future list':
                    ChartManager.getInstance().getChart().setFutureList(content);
                    break;
                case 'set current depth':
                    ChartManager.getInstance().getChart().updateDepth(content);
                    break;
                case 'set current future':
                    break;
                case 'set current language':
                    chart_switch_language(content);
                    break;
                case 'set current theme':
                    break;
                default:
                    break;
            }
        });
        $('#chart_dropdown_symbols li').click(function(){
            $('#chart_dropdown_symbols li a').removeClass('selected');
            $(this).find('a').addClass('selected');
            $(".chart_dropdown_data").removeClass("chart_dropdown-hover");
            $(".chart_dropdown_t").removeClass("chart_dropdown-hover");
            var content = $(this).attr('name');
            ChartManager.getInstance().getChart().setCurrentFuture(content);
        });
        $("#chart_container .chart_dropdown .chart_dropdown_t")
            .mouseover(function(){
                var container = $("#chart_container");
                var title = $(this);
                var dropdown = title.next();
                var containerLeft = container.offset().left;
                var titleLeft = title.offset().left;
                var containerWidth = container.width();
                var titleWidth = title.width();
                var dropdownWidth = dropdown.width();
                var d = ((dropdownWidth - titleWidth) / 2) << 0;
                if (titleLeft - d < containerLeft + 4) {
                    d = titleLeft - containerLeft - 4;
                }
                else if (titleLeft + titleWidth + d > containerLeft + containerWidth - 4) {
                    d += titleLeft + titleWidth + d - (containerLeft + containerWidth - 4) + 19;
                }
                else {
                    d += 4;
                }
                dropdown.css({"margin-left":-d});
                title.addClass("chart_dropdown-hover");
                dropdown.addClass("chart_dropdown-hover");
            })
            .mouseout(function(){
                $(this).next().removeClass("chart_dropdown-hover");
                $(this).removeClass("chart_dropdown-hover");
            });
        $(".chart_dropdown_data")
            .mouseover(function(){
                $(this).addClass("chart_dropdown-hover");
                $(this).prev().addClass("chart_dropdown-hover");
            })
            .mouseout(function(){
                $(this).prev().removeClass("chart_dropdown-hover");
                $(this).removeClass("chart_dropdown-hover");
            });
        $("#chart_btn_parameter_settings").click(function() {
            $('#chart_parameter_settings').addClass("clicked");
            $(".chart_dropdown_data").removeClass("chart_dropdown-hover");
            $("#chart_parameter_settings").find("th").each(function(){
                var name = $(this).html();
                var index = 0;
                var tmp = ChartSettings.get();
                var value = tmp.indics[name];
                $(this.nextElementSibling).find("input").each(function(){
                    if (value != null && index < value.length) {
                        $(this).val(value[index]);
                    }
                    index++;
                });
            });
        });
        $("#close_settings").click(function(){
            $('#chart_parameter_settings').removeClass("clicked");
        });
        $("#chart_container .chart_toolbar_tabgroup a")
            .click(function() {
                switch_period($(this).parent().attr('name'));
            });
        $("#chart_toolbar_periods_vert ul a").click(function(){
            switch_period($(this).parent().attr('name'));
        });
        $('#chart_show_tools')
            .click(function() {
                if ($(this).hasClass('selected')) {
                    switch_tools('off');
                } else {
                    switch_tools('on');
                }
            });
        $("#chart_toolpanel .chart_toolpanel_button")
            .click(function() {
                $(".chart_dropdown_data").removeClass("chart_dropdown-hover");
                $("#chart_toolpanel .chart_toolpanel_button").removeClass("selected");
                $(this).addClass("selected");
                var name = $(this).children().attr('name');
                GLOBAL_VAR.chartMgr.setRunningMode(ChartManager.DrawingTool[name]);
            });
        $('#chart_show_indicator')
            .click(function(){
                if ($(this).hasClass('selected')) {
                    switch_indic('off');
                } else {
                    switch_indic('on');
                }
            });
        $("#chart_tabbar li a")
            .click(function() {
                $("#chart_tabbar li a").removeClass('selected');
                $(this).addClass('selected');
                var name = $(this).attr('name');
                var tmp = ChartSettings.get();
                tmp.charts.indics[1] = name;
                ChartSettings.save();
                if (Template.displayVolume == false)
                    ChartManager.getInstance().getChart().setIndicator(1, name);
                else
                    ChartManager.getInstance().getChart().setIndicator(2, name);
            });
        $("#chart_select_chart_style a")
            .click(function() {
                $("#chart_select_chart_style a").removeClass('selected');
                $(this).addClass("selected");
                var tmp = ChartSettings.get();
                tmp.charts.chartStyle = $(this)[0].innerHTML;
                ChartSettings.save();
                var mgr = ChartManager.getInstance();
                mgr.setChartStyle("frame0.k0", $(this).html());
                mgr.redraw("All",true);
            });
        $('#chart_dropdown_themes li').click(function(){
            $('#chart_dropdown_themes li a').removeClass('selected');
            var name = $(this).attr('name');
            if (name == 'chart_themes_dark') {
                switch_theme('dark');
            } else if (name == 'chart_themes_light') {
                switch_theme('light');
            }
        });
        $("#chart_select_main_indicator a")
            .click(function(){
                $("#chart_select_main_indicator a").removeClass('selected');
                $(this).addClass("selected");
                var name = $(this).attr('name');
                var tmp = ChartSettings.get();
                tmp.charts.mIndic = name;
                ChartSettings.save();
                var mgr = ChartManager.getInstance();
                if (!mgr.setMainIndicator("frame0.k0", name))
                    mgr.removeMainIndicator("frame0.k0");
                mgr.redraw("All",true);
            });
        $('#chart_toolbar_theme a').click(function(){
            $('#chart_toolbar_theme a').removeClass('selected');
            if ($(this).attr('name') == 'dark') {
                switch_theme('dark');
            } else if ($(this).attr('name') == 'light') {
                switch_theme('light');
            }
        });
        $('#chart_select_theme li a').click(function(){
            $('#chart_select_theme a').removeClass('selected');
            if ($(this).attr('name') == 'dark') {
                switch_theme('dark');
            } else if ($(this).attr('name') == 'light') {
                switch_theme('light');
            }
        });
        $('#chart_enable_tools li a').click(function(){
            $('#chart_enable_tools a').removeClass('selected');
            if ($(this).attr('name') == 'on') {
                switch_tools('on');
            } else if ($(this).attr('name') == 'off') {
                switch_tools('off');
            }
        });
        $('#chart_enable_indicator li a').click(function(){
            $('#chart_enable_indicator a').removeClass('selected');
            if ($(this).attr('name') == 'on') {
                switch_indic('on');
            } else if ($(this).attr('name') == 'off') {
                switch_indic('off');
            }
        });
        $(document).keyup(function(e) {
            if (e.keyCode == 46) {
                ChartManager.getInstance().deleteToolObject();
                ChartManager.getInstance().redraw('OverlayCanvas', false);
            }
        });
        $("#chart_overlayCanvas")
            .mousemove(function(e){
                var r = e.target.getBoundingClientRect();
                var x = e.clientX - r.left;
                var y = e.clientY - r.top;
                var mgr = ChartManager.getInstance();
                if (GLOBAL_VAR.button_down == true) {
                    mgr.onMouseMove("frame0", x, y, true);
                    mgr.redraw("All", true);
                }
                else {
                    mgr.onMouseMove("frame0", x, y, false);
                    mgr.redraw("OverlayCanvas");
                }
            })
            .mouseleave(function(e) {
                var r = e.target.getBoundingClientRect();
                var x = e.clientX - r.left;
                var y = e.clientY - r.top;
                var mgr = ChartManager.getInstance();
                mgr.onMouseLeave("frame0", x, y, false);
                mgr.redraw("OverlayCanvas");
            })
            .mouseup(function(e){
                if (e.which != 1) {
                    return;
                }
                GLOBAL_VAR.button_down = false;
                var r = e.target.getBoundingClientRect();
                var x = e.clientX - r.left;
                var y = e.clientY - r.top;
                var mgr = ChartManager.getInstance();
                mgr.onMouseUp("frame0", x, y);
                mgr.redraw("All",true);
            })
            .mousedown(function(e){
                if (e.which != 1) {
                    ChartManager.getInstance().deleteToolObject();
                    ChartManager.getInstance().redraw('OverlayCanvas', false);
                    return;
                }
                GLOBAL_VAR.button_down = true;
                var r = e.target.getBoundingClientRect();
                var x = e.clientX - r.left;
                var y = e.clientY - r.top;
                ChartManager.getInstance().onMouseDown("frame0", x, y);
            });
        $("#chart_parameter_settings :input").change(function(){
            var name = $(this).attr("name");
            var index = 0;
            var valueArray = [];
            var mgr = ChartManager.getInstance();
            $("#chart_parameter_settings :input").each(function(){
                if ($(this).attr("name") == name) {
                    if ($(this).val() != "" && $(this).val() != null && $(this).val() != undefined) {
                        var i = parseInt($(this).val());
                        valueArray.push(i);
                    }
                    index++;
                }
            });
            if (valueArray.length != 0) {
                mgr.setIndicatorParameters(name, valueArray);
                var value = mgr.getIndicatorParameters(name);
                var cookieArray = [];
                index = 0;
                $("#chart_parameter_settings :input").each(function(){
                    if ($(this).attr("name") == name) {
                        if ($(this).val() != "" && $(this).val() != null && $(this).val() != undefined) {
                            $(this).val(value[index].getValue());
                            cookieArray.push(value[index].getValue());
                        }
                        index++;
                    }
                });
                var tmp = ChartSettings.get();
                tmp.indics[name] = cookieArray;
                ChartSettings.save();
                mgr.redraw('All', true);
            }
        });
        $("#chart_parameter_settings button").click(function(){
            var name = $(this).parents("tr").children("th").html();
            var index = 0;
            var value = ChartManager.getInstance().getIndicatorParameters(name);
            var valueArray = [];
            $(this).parent().prev().children('input').each(function(){
                if (value != null && index < value.length) {
                    $(this).val(value[index].getDefaultValue());
                    valueArray.push(value[index].getDefaultValue());
                }
                index++;
            });
            ChartManager.getInstance().setIndicatorParameters(name, valueArray);
            var tmp = ChartSettings.get();
            tmp.indics[name] = valueArray;
            ChartSettings.save();
            ChartManager.getInstance().redraw('All', false);
        });
    });
}
var refresh_counter = 0;
var refresh_handler = setInterval(refresh_function, 1000);
function refresh_function() {
    refresh_counter++;
    var lang = ChartManager.getInstance().getLanguage();
    if (refresh_counter > 3600) {
        var num = new Number(refresh_counter/3600);
        if (lang == "en-us")  {
            $("#chart_updated_time_text").html(num.toFixed(0)+"h");
        } else {
            $("#chart_updated_time_text").html(num.toFixed(0)+"小时");
        }
    } else if (refresh_counter > 60 && refresh_counter <= 3600) {
        var num = new Number(refresh_counter/60);
        if (lang == "en-us")  {
            $("#chart_updated_time_text").html(num.toFixed(0)+"m");
        } else {
            $("#chart_updated_time_text").html(num.toFixed(0)+"分钟");
        }
    } else if (refresh_counter <= 60) {
        if (lang == "en-us")  {
            $("#chart_updated_time_text").html(refresh_counter+"s");
        } else {
            $("#chart_updated_time_text").html(refresh_counter+"秒");
        }
    }
}
function clear_refresh_counter() {
    window.clearInterval(refresh_handler);
    refresh_counter = 0;
    var lang = ChartManager.getInstance().getLanguage();
    if (lang == "en-us")  {
        $("#chart_updated_time_text").html(refresh_counter+"s");
    } else {
        $("#chart_updated_time_text").html(refresh_counter+"秒");
    }
    refresh_handler = setInterval(refresh_function, 1000);
}
var RequestData = function(showLoading) {
    AbortRequest();
    window.clearTimeout(GLOBAL_VAR.TimeOutId);
    if(showLoading == true) {
        // $("#chart_loading").addClass("activated");
    }
    $(document).ready(function () {
        // GLOBAL_VAR.G_HTTP_REQUEST = $.ajax({
        //     type        : "get",
        //     url         : GLOBAL_VAR.url,
        //     dataType    : 'text',
        //     data        : GLOBAL_VAR.requestParam,
        //     timeout     : 5000,
        //     created     : Date.now(),
        //     beforeSend  : function() {
        //         this.time = GLOBAL_VAR.time_type;
        //         this.market = GLOBAL_VAR.mark_from;
        //     },
        //     success     : function(json) {
        //         if (GLOBAL_VAR.G_HTTP_REQUEST) {
        //             if (this.time != GLOBAL_VAR.time_type || this.market != GLOBAL_VAR.mark_from) {
        //                 GLOBAL_VAR.TimeOutId = setTimeout(RequestData, 2000);
        //                 return;
        //             }
        //             var char1 = json.charAt(0);
        //             var char2 = json.charAt(1);
        //             if (char1 != "[" || char2 != "[") {
        //                 GLOBAL_VAR.TimeOutId = setTimeout(RequestData, 2000);
        //                 return;
        //             }
        //             var array = JSON.parse(json);
        //             GLOBAL_VAR.KLineData = array;
        //             if (ChartManager.getInstance().getChart()._money_type == 1) {
        //                 var rate = ChartManager.getInstance().getChart()._usd_cny_rate;
        //                 for (var i in GLOBAL_VAR.KLineData) {
        //                     var e = GLOBAL_VAR.KLineData[i];
        //                     e[1] = parseFloat((e[1] * rate).toFixed(2));
        //                     e[2] = parseFloat((e[2] * rate).toFixed(2));
        //                     e[3] = parseFloat((e[3] * rate).toFixed(2));
        //                     e[4] = parseFloat((e[4] * rate).toFixed(2));
        //                 }
        //             }
        //             try {
        //                 if (!GLOBAL_VAR.chartMgr.updateData("frame0.k0", GLOBAL_VAR.KLineData)) {
        //                     GLOBAL_VAR.requestParam = setHttpRequestParam(GLOBAL_VAR.mark_from, GLOBAL_VAR.time_type, "1000", null);
        //                     GLOBAL_VAR.TimeOutId = setTimeout(RequestData, 2000);
        //                     return;
        //                 }
        //                 clear_refresh_counter();
        //             } catch (err) {
        //                 if (err == "calcInterval") {
        //                     GLOBAL_VAR.requestParam = setHttpRequestParam(GLOBAL_VAR.mark_from, GLOBAL_VAR.time_type, "1000", null);
        //                     GLOBAL_VAR.TimeOutId = setTimeout(RequestData, 2000);
        //                     return;
        //                 }
        //             }
        //             if (Pushing.state == Pushing.State.Enable) {
        //                 Pushing.Switch();
        //             } else {
        //                 GLOBAL_VAR.TimeOutId = setTimeout(TwoSecondThread, 2000);
        //             }
        //             $("#chart_loading").removeClass("activated");
        //             ChartManager.getInstance().redraw('All', true);
        //         }
        //     },
        //     error : function(xhr, textStatus, errorThrown ) {
        //         GLOBAL_VAR.TimeOutId = setTimeout(function(){
        //             RequestData(true);
        //         }, 10000);
        //     },
        //     complete : function() {
        //         GLOBAL_VAR.G_HTTP_REQUEST = null;
        //     }
        // })

        // var testData =function () {
            console.log('load data');
            // var array = JSON.parse(jsonData);
            var array = [[1499616000000,17762.77,17789.0,17704.0,17707.07,9.528],[1499616900000,17788.0,17789.0,17708.1,17725.0,5.94],[1499617800000,17785.0,17785.0,17630.0,17685.62,75.2],[1499618700000,17749.9,17766.97,17669.0,17766.97,20.232],[1499619600000,17766.97,17766.97,17675.0,17749.77,3.36],[1499620500000,17702.0,17749.77,17659.02,17702.0,8.584],[1499621400000,17680.0,17749.9,17630.1,17749.9,22.305],[1499622300000,17749.9,17749.9,17661.0,17730.0,5.07],[1499623200000,17730.0,17730.0,17677.1,17711.0,12.778],[1499624100000,17711.0,17746.0,17677.1,17677.1,17.993],[1499625000000,17677.1,17677.1,17650.01,17650.01,1.858],[1499625900000,17650.01,17654.0,17650.0,17654.0,138.335],[1499626800000,17654.0,17688.0,17654.0,17688.0,9.077],[1499627700000,17676.49,17688.0,17676.49,17678.3,161.18],[1499628600000,17688.0,17688.0,17688.0,17688.0,0.03],[1499629500000,17650.01,17688.0,17631.21,17687.0,4.763],[1499630400000,17687.0,17687.0,17687.0,17687.0,10.802],[1499631300000,17687.0,17700.0,17644.16,17644.16,179.2],[1499632200000,17644.16,17644.16,17644.16,17644.16,1.043],[1499633100000,17644.16,17644.16,17631.19,17631.19,0.092],[1499634000000,17631.19,17699.97,17631.19,17687.99,0.769],[1499634900000,17631.1,17687.99,17624.0,17667.0,15.398],[1499635800000,17667.0,17679.0,17650.0,17679.0,3.127],[1499636700000,17679.0,17688.0,17647.09,17688.0,8.827],[1499637600000,17688.0,17688.0,17581.0,17590.0,14.52],[1499638500000,17581.0,17590.0,17540.0,17590.0,15.252],[1499639400000,17590.0,17590.0,17549.91,17589.0,42.14],[1499640300000,17550.0,17589.0,17550.0,17589.0,65.63],[1499641200000,17589.0,17589.0,17550.01,17554.0,2.205],[1499642100000,17554.0,17590.0,17554.0,17555.01,28.754],[1499643000000,17588.0,17590.0,17500.0,17500.0,105.319],[1499643900000,17500.0,17584.19,17500.0,17578.0,32.434],[1499644800000,17578.0,17578.0,17505.1,17510.0,12.926],[1499645700000,17510.0,17570.0,17510.0,17510.0,5.651],[1499646600000,17510.0,17544.0,17467.85,17488.0,115.65],[1499647500000,17500.0,17500.0,17266.8,17368.0,311.487],[1499648400000,17368.0,17426.69,17318.0,17420.0,32.795],[1499649300000,17401.0,17460.0,17400.0,17441.42,126.438],[1499650200000,17401.1,17459.0,17365.0,17403.01,207.355],[1499651100000,17403.01,17460.0,17403.01,17431.0,78.841],[1499652000000,17431.0,17460.1,17405.01,17460.1,467.552],[1499652900000,17460.1,17500.0,17415.0,17500.0,59.506],[1499653800000,17410.0,17500.0,17410.0,17500.0,23.586],[1499654700000,17450.1,17502.0,17450.0,17463.0,30.986],[1499655600000,17463.0,17560.0,17460.0,17544.94,158.089],[1499656500000,17461.2,17544.94,17434.0,17453.0,65.756],[1499657400000,17453.0,17500.0,17434.0,17434.01,19.982],[1499658300000,17434.0,17512.56,17350.0,17355.0,120.108],[1499659200000,17361.0,17447.08,17350.0,17399.9,85.418],[1499660100000,17399.9,17413.56,17376.0,17405.5,117.849],[1499661000000,17405.5,17420.9,17380.84,17380.84,43.095],[1499661900000,17380.84,17400.0,17300.0,17400.0,243.864],[1499662800000,17400.0,17441.0,17400.0,17401.0,173.24],[1499663700000,17402.0,17471.74,17401.0,17471.74,82.128],[1499664600000,17471.74,17496.99,17423.01,17490.0,40.434],[1499665500000,17490.0,17544.99,17450.01,17525.61,64.28],[1499666400000,17450.01,17525.61,17450.0,17450.0,338.511],[1499667300000,17450.0,17500.01,17400.1,17453.0,363.578],[1499668200000,17453.74,17501.0,17452.0,17456.74,31.664],[1499669100000,17456.74,17520.0,17452.0,17454.0,15.513],[1499670000000,17500.0,17518.79,17455.0,17510.0,81.732],[1499670900000,17510.0,17549.0,17460.0,17520.0,42.865],[1499671800000,17500.01,17521.8,17467.73,17521.8,78.841],[1499672700000,17521.8,17539.27,17467.73,17467.74,45.555],[1499673600000,17485.73,17513.52,17467.73,17513.51,90.444],[1499674500000,17513.5,17542.5,17513.5,17542.48,121.675],[1499675400000,17542.5,17551.75,17540.0,17551.75,60.794],[1499676300000,17551.0,17580.0,17500.0,17519.34,78.86],[1499677200000,17519.33,17581.74,17510.0,17581.0,96.39],[1499678100000,17581.0,17600.0,17511.0,17600.0,72.311],[1499679000000,17600.0,17600.0,17480.0,17552.0,126.506],[1499679900000,17552.0,17561.75,17502.1,17505.93,96.415],[1499680800000,17505.93,17551.65,17503.14,17545.0,37.906],[1499681700000,17509.1,17549.9,17499.0,17500.01,88.858],[1499682600000,17530.0,17545.0,17383.0,17430.1,167.817],[1499683500000,17430.1,17544.98,17430.1,17517.0,59.741],[1499684400000,17517.0,17517.0,17430.0,17449.91,122.841],[1499685300000,17430.0,17498.0,17420.1,17478.0,72.257],[1499686200000,17478.0,17498.0,17400.0,17486.0,59.301],[1499687100000,17421.0,17486.0,17311.38,17381.0,201.879],[1499688000000,17381.0,17487.14,17350.11,17487.01,93.556],[1499688900000,17487.01,17487.14,17250.1,17368.98,331.449],[1499689800000,17369.0,17487.14,17300.0,17410.0,111.545],[1499690700000,17464.0,17487.02,17315.0,17411.0,237.849],[1499691600000,17411.0,17448.0,17330.0,17443.0,158.124],[1499692500000,17443.0,17447.0,17385.6,17440.0,118.693],[1499693400000,17440.0,17484.0,17390.0,17400.0,208.819],[1499694300000,17400.0,17400.0,17200.0,17270.0,539.745],[1499695200000,17269.0,17448.99,17215.0,17366.0,142.675],[1499696100000,17366.0,17381.73,17250.1,17381.73,442.012],[1499697000000,17381.73,17400.0,17000.0,17098.99,1053.01],[1499697900000,17099.0,17201.72,17051.0,17159.0,295.455],[1499698800000,17139.0,17262.0,17121.0,17150.14,179.993],[1499699700000,17249.99,17275.0,17220.0,17224.43,334.595],[1499700600000,17224.43,17224.44,17130.01,17180.0,118.777],[1499701500000,17180.0,17181.71,17100.0,17117.13,114.708],[1499702400000,17117.13,17208.16,17103.72,17208.16,221.071],[1499703300000,17208.16,17240.32,17194.0,17240.32,350.014],[1499704200000,17240.32,17252.37,17240.32,17252.37,201.186],[1499705100000,17252.37,17275.0,17230.0,17271.72,117.57],[1499706000000,17271.72,17271.72,17232.02,17253.34,79.601],[1499706900000,17253.34,17256.78,17230.0,17233.72,36.209],[1499707800000,17233.72,17233.72,17230.0,17233.72,31.367],[1499708700000,17233.72,17235.44,17230.0,17235.44,30.017],[1499709600000,17235.44,17275.0,17227.87,17275.0,25.92],[1499710500000,17275.0,17289.86,17164.0,17278.0,38.699],[1499711400000,17288.87,17294.0,17172.05,17292.0,28.247],[1499712300000,17291.99,17294.0,17200.1,17294.0,19.385],[1499713200000,17294.0,17350.0,17284.0,17350.0,20.096],[1499714100000,17350.0,17390.0,17300.13,17389.99,65.056],[1499715000000,17390.0,17390.0,17300.1,17310.0,21.933],[1499715900000,17310.0,17389.99,17300.1,17300.1,19.171],[1499716800000,17300.1,17350.0,17210.12,17300.0,36.87],[1499717700000,17300.0,17300.0,17151.0,17199.89,111.365],[1499718600000,17153.02,17248.89,17151.0,17244.36,15.635],[1499719500000,17243.69,17249.9,17152.0,17249.89,30.924],[1499720400000,17249.89,17249.9,17100.0,17100.01,157.309],[1499721300000,17100.01,17150.0,17100.0,17150.0,47.46],[1499722200000,17150.0,17150.0,16999.06,17001.17,288.533],[1499723100000,17119.98,17120.0,16918.87,17087.99,131.113],[1499724000000,16956.55,17087.99,16933.0,16959.0,51.592],[1499724900000,16946.55,17060.0,16946.55,17052.0,25.934],[1499725800000,17052.0,17052.0,16920.0,16940.0,54.811],[1499726700000,16939.0,16977.0,16850.1,16851.19,138.315],[1499727600000,16851.2,16900.1,16721.0,16800.0,333.258],[1499728500000,16801.0,16857.99,16712.0,16720.0,197.673],[1499729400000,16720.0,16880.0,16685.85,16880.0,378.664],[1499730300000,16820.1,17000.0,16818.01,16901.0,134.639],[1499731200000,16901.0,17000.1,16851.0,17000.1,55.516],[1499732100000,17002.01,17078.0,16929.33,17000.0,100.553],[1499733000000,17059.9,17059.9,16931.67,16931.81,48.33],[1499733900000,16931.81,17019.0,16901.02,16915.01,35.023],[1499734800000,16916.0,16916.0,16850.0,16857.0,78.955],[1499735700000,16857.0,16857.0,16717.0,16750.1,152.699],[1499736600000,16750.0,16800.0,16750.0,16799.0,52.274],[1499737500000,16798.99,16846.96,16789.32,16801.0,104.56],[1499738400000,16801.0,16850.0,16725.56,16730.0,62.979],[1499739300000,16731.0,16779.0,16666.0,16679.0,160.681],[1499740200000,16700.0,16749.0,16555.55,16598.99,128.508],[1499741100000,16599.0,16630.0,16560.0,16570.0,195.959],[1499742000000,16570.0,16669.0,16565.0,16570.01,75.643],[1499742900000,16570.01,16599.9,16400.0,16460.0,554.535],[1499743800000,16460.0,16549.0,16450.0,16450.0,117.905],[1499744700000,16451.0,16451.0,16351.0,16440.0,249.522],[1499745600000,16439.35,16488.72,16110.0,16122.0,402.989],[1499746500000,16122.0,16400.0,16122.0,16400.0,181.144],[1499747400000,16399.99,16450.0,16325.04,16377.0,143.498],[1499748300000,16327.87,16499.0,16300.1,16499.0,67.22],[1499749200000,16499.0,16549.9,16350.93,16542.81,135.321],[1499750100000,16509.9,16548.99,16400.0,16548.0,45.669],[1499751000000,16547.99,16548.0,16297.91,16420.0,83.161],[1499751900000,16400.0,16449.99,16270.9,16303.0,55.231],[1499752800000,16355.0,16357.99,16180.0,16200.0,112.856],[1499753700000,16200.01,16398.0,16200.0,16398.0,104.929],[1499754600000,16398.0,16398.0,16300.55,16390.87,132.381],[1499755500000,16390.87,16445.0,16250.11,16299.99,252.661],[1499756400000,16299.99,16666.0,16250.12,16666.0,443.605],[1499757300000,16666.0,16780.0,16581.0,16667.01,284.225],[1499758200000,16771.0,16976.0,16667.01,16976.0,404.355],[1499759100000,16975.99,17060.58,16902.43,16948.99,422.713],[1499760000000,16948.0,17049.9,16751.01,16900.0,265.137],[1499760900000,16900.0,16939.0,16757.05,16939.0,212.802],[1499761800000,16938.0,16939.0,16790.0,16849.9,74.479],[1499762700000,16849.9,16880.32,16767.16,16806.81,41.276],[1499763600000,16834.0,16880.0,16757.0,16875.0,82.341],[1499764500000,16875.0,16950.0,16805.01,16938.0,167.428],[1499765400000,16938.0,16950.0,16900.0,16949.99,176.275],[1499766300000,16921.0,16950.0,16827.24,16937.0,157.56],[1499767200000,16937.0,16965.0,16838.0,16964.99,100.254],[1499768100000,16964.99,16964.99,16721.0,16849.95,84.674],[1499769000000,16849.95,16878.85,16730.94,16820.0,81.142],[1499769900000,16819.99,16900.0,16800.0,16851.0,49.996],[1499770800000,16897.0,16897.0,16750.01,16885.0,94.095],[1499771700000,16885.0,16885.01,16801.0,16849.9,38.403],[1499772600000,16869.7,16869.7,16771.0,16850.0,114.054],[1499773500000,16850.0,16850.0,16785.0,16849.99,20.386],[1499774400000,16847.0,16851.1,16788.0,16851.1,49.621],[1499775300000,16852.0,16898.0,16799.99,16820.0,132.24],[1499776200000,16830.0,16898.0,16780.0,16898.0,51.523],[1499777100000,16898.0,16941.24,16801.0,16941.24,143.978],[1499778000000,16900.1,16948.0,16860.0,16901.0,55.723],[1499778900000,16901.0,16945.0,16900.0,16940.0,52.223],[1499779800000,16940.0,16945.0,16800.01,16878.92,73.115],[1499780700000,16800.12,16878.15,16750.0,16799.98,72.118],[1499781600000,16794.98,16800.0,16701.0,16702.0,59.822],[1499782500000,16702.0,16730.75,16581.01,16630.0,106.598],[1499783400000,16630.0,16630.75,16580.0,16630.75,39.975],[1499784300000,16630.75,16680.0,16549.0,16679.99,110.439],[1499785200000,16679.99,16799.5,16640.0,16793.0,101.683],[1499786100000,16784.18,16793.0,16611.78,16640.0,128.962],[1499787000000,16640.0,16698.0,16585.01,16665.0,131.073],[1499787900000,16601.0,16677.0,16585.0,16645.0,366.807],[1499788800000,16648.0,16775.56,16612.01,16730.0,448.568],[1499789700000,16730.0,16820.67,16670.0,16670.0,296.834],[1499790600000,16715.09,16789.0,16678.55,16780.0,27.935],[1499791500000,16789.0,16789.0,16677.0,16779.0,183.186],[1499792400000,16700.1,16769.0,16670.01,16757.0,16.785],[1499793300000,16757.0,16759.0,16670.0,16749.9,69.906],[1499794200000,16749.99,16750.0,16608.11,16700.0,68.496],[1499795100000,16745.01,16749.98,16641.0,16642.0,94.743],[1499796000000,16641.99,16732.0,16600.0,16650.0,18.924],[1499796900000,16701.19,16714.95,16568.0,16696.0,12.444],[1499797800000,16696.0,16700.0,16696.0,16699.0,1.116],[1499798700000,16699.0,16699.0,16588.0,16599.0,17.221],[1499799600000,16649.9,16700.0,16571.0,16691.34,47.77],[1499800500000,16600.0,16699.97,16550.01,16600.0,43.721],[1499801400000,16600.0,16600.0,16451.64,16550.0,245.008],[1499802300000,16550.0,16595.0,16450.03,16549.9,68.841],[1499803200000,16549.6,16600.0,16400.01,16598.96,48.275],[1499804100000,16597.96,16600.0,16451.4,16599.99,8.887],[1499805000000,16600.0,16600.0,16505.11,16505.11,112.472],[1499805900000,16505.11,16600.0,16451.0,16600.0,46.691],[1499806800000,16600.0,16600.0,16599.99,16600.0,11.763],[1499807700000,16600.0,16649.0,16599.99,16648.99,16.428],[1499808600000,16648.99,16652.0,16603.0,16652.0,117.713],[1499809500000,16652.0,16681.0,16510.59,16536.3,56.769],[1499810400000,16680.85,16722.0,16579.25,16610.25,23.965],[1499811300000,16610.25,16731.99,16610.25,16666.01,40.357],[1499812200000,16700.1,16731.0,16605.91,16608.03,55.77],[1499813100000,16730.99,16731.0,16588.0,16615.01,26.771],[1499814000000,16615.01,16723.91,16514.34,16649.9,73.195],[1499814900000,16539.42,16670.0,16526.18,16571.35,10.195],[1499815800000,16668.83,16668.83,16449.0,16548.98,51.31],[1499816700000,16548.98,16574.85,16380.0,16445.0,54.123],[1499817600000,16445.0,16445.01,16353.05,16414.43,23.032],[1499818500000,16414.0,16499.87,16302.03,16350.0,132.723],[1499819400000,16350.0,16350.01,16250.0,16250.0,227.14],[1499820300000,16249.9,16300.0,16240.2,16292.02,52.702],[1499821200000,16300.0,16416.4,16253.1,16400.01,90.5],[1499822100000,16400.01,16416.4,16258.0,16299.9,92.007],[1499823000000,16299.9,16299.99,16160.0,16199.0,389.572],[1499823900000,16175.62,16259.64,16162.0,16259.64,172.655],[1499824800000,16259.6,16259.64,16160.0,16160.0,162.137],[1499825700000,16160.1,16249.89,16150.0,16153.0,124.385],[1499826600000,16239.99,16240.0,16164.0,16237.99,82.971],[1499827500000,16238.0,16238.0,16201.0,16208.99,52.327],[1499828400000,16209.0,16407.0,16208.01,16399.9,110.443],[1499829300000,16342.01,16451.64,16300.0,16300.0,153.781],[1499830200000,16301.96,16390.17,16296.01,16310.0,33.356],[1499831100000,16310.0,16362.58,16202.01,16340.26,106.481],[1499832000000,16211.29,16480.0,16211.22,16419.24,80.302],[1499832900000,16413.03,16480.0,16350.24,16410.43,50.345],[1499833800000,16411.0,16517.0,16399.18,16450.0,515.772],[1499834700000,16407.05,16550.0,16377.87,16500.0,181.821],[1499835600000,16500.0,16549.01,16351.0,16400.0,95.878],[1499836500000,16352.0,16400.0,16272.09,16330.0,131.549],[1499837400000,16330.0,16330.0,16237.32,16298.0,76.235],[1499838300000,16298.0,16348.0,16240.01,16329.99,103.848],[1499839200000,16329.99,16330.0,16280.55,16330.0,37.993],[1499840100000,16330.0,16399.33,16302.01,16399.0,34.823],[1499841000000,16399.0,16449.67,16365.1,16433.0,67.95],[1499841900000,16428.01,16440.0,16369.0,16398.0,80.295],[1499842800000,16398.0,16399.0,16365.0,16374.99,43.335],[1499843700000,16374.99,16400.0,16365.0,16398.0,139.548],[1499844600000,16398.0,16438.0,16381.0,16438.0,30.929],[1499845500000,16437.0,16438.0,16385.0,16404.99,42.455],[1499846400000,16404.99,16420.0,16385.1,16395.0,60.502],[1499847300000,16394.99,16438.0,16388.0,16438.0,48.984],[1499848200000,16438.0,16487.0,16402.0,16459.99,88.148],[1499849100000,16459.99,16500.0,16459.99,16500.0,105.145],[1499850000000,16500.01,16549.0,16500.0,16501.01,137.052],[1499850900000,16501.0,16501.01,16432.57,16432.57,81.434],[1499851800000,16445.0,16501.01,16418.0,16450.01,54.034],[1499852700000,16452.0,16498.98,16452.0,16460.0,27.514],[1499853600000,16460.0,16488.86,16454.11,16460.0,24.412],[1499854500000,16460.0,16481.0,16400.0,16401.0,26.178],[1499855400000,16401.0,16501.0,16401.0,16496.0,71.613],[1499856300000,16500.0,16520.0,16450.1,16519.0,39.844],[1499857200000,16462.01,16520.0,16460.0,16470.0,45.551],[1499858100000,16500.0,16584.97,16470.0,16584.97,35.098],[1499859000000,16584.97,16713.34,16550.1,16701.0,325.182],[1499859900000,16701.0,16824.0,16683.94,16720.0,317.111],[1499860800000,16715.0,16789.8,16699.0,16717.0,49.412],[1499861700000,16711.64,16771.97,16650.0,16765.0,52.326],[1499862600000,16765.0,16766.0,16650.1,16660.01,36.914],[1499863500000,16729.99,16729.99,16558.04,16594.54,36.331],[1499864400000,16558.42,16665.0,16557.0,16580.21,53.727],[1499865300000,16580.2,16665.0,16580.0,16616.0,58.668],[1499866200000,16616.0,16689.0,16590.0,16616.0,78.118],[1499867100000,16616.0,16616.01,16517.0,16550.99,20.453],[1499868000000,16568.99,16657.98,16500.1,16533.52,76.269],[1499868900000,16572.0,16622.42,16486.4,16486.51,84.756],[1499869800000,16500.1,16610.0,16475.67,16610.0,43.526],[1499870700000,16560.0,16688.0,16560.0,16665.0,91.732],[1499871600000,16665.99,16666.0,16600.0,16600.0,111.605],[1499872500000,16600.0,16750.0,16575.37,16738.0,112.762],[1499873400000,16734.0,16751.0,16690.0,16725.0,76.175],[1499874300000,16725.0,16750.0,16652.0,16705.0,75.748],[1499875200000,16670.0,16800.0,16623.79,16795.0,115.999],[1499876100000,16790.0,16832.87,16770.0,16800.1,94.889],[1499877000000,16832.0,16855.87,16800.0,16844.0,190.545],[1499877900000,16849.0,16855.87,16815.0,16837.0,93.618],[1499878800000,16830.0,16843.9,16720.07,16830.0,200.0688],[1499879700000,16830.0,16845.0,16804.5,16822.0,57.693],[1499880600000,16830.0,16834.0,16721.04,16800.0,76.057],[1499881500000,16800.0,16840.0,16775.0,16781.0,87.999],[1499882400000,16781.0,16810.0,16781.0,16809.0,68.283],[1499883300000,16809.0,16818.8,16781.0,16817.99,70.238],[1499884200000,16818.0,16819.0,16781.0,16798.0,36.043],[1499885100000,16781.0,16843.0,16742.0,16750.0,82.506],[1499886000000,16750.0,16843.0,16750.0,16802.0,20.044],[1499886900000,16843.0,16843.0,16750.1,16808.77,51.094],[1499887800000,16775.05,16840.0,16751.01,16762.2,4.708],[1499888700000,16770.0,16888.99,16770.0,16888.99,73.184],[1499889600000,16888.99,16933.0,16865.01,16880.0,26.408],[1499890500000,16880.0,16900.0,16800.0,16800.0,5.738],[1499891400000,16800.0,16899.0,16782.0,16849.89,65.714],[1499892300000,16849.89,16899.0,16789.0,16899.0,55.965],[1499893200000,16789.01,16899.0,16750.0,16799.9,178.651],[1499894100000,16799.9,16890.0,16710.0,16848.98,74.006],[1499895000000,16733.44,16849.0,16715.01,16720.0,21.562],[1499895900000,16799.89,16800.0,16700.0,16779.0,49.396],[1499896800000,16687.01,16879.99,16687.01,16879.99,35.482],[1499897700000,16879.84,16932.99,16758.63,16800.0,25.722],[1499898600000,16801.0,16849.9,16754.01,16848.0,48.192],[1499899500000,16761.0,16898.97,16761.0,16814.01,34.893],[1499900400000,16814.01,16898.0,16750.1,16849.0,55.799],[1499901300000,16848.99,16864.97,16781.0,16808.0,53.879],[1499902200000,16864.96,16897.87,16810.21,16896.0,64.328],[1499903100000,16890.0,16999.0,16852.0,16998.88,442.651],[1499904000000,16998.8,17042.0,16968.0,17000.0,194.151],[1499904900000,17000.0,17050.0,16921.0,17048.0,218.462],[1499905800000,17001.0,17150.0,17000.0,17111.0,256.455],[1499906700000,17110.0,17160.0,17061.98,17097.0,62.026],[1499907600000,17096.97,17099.9,16976.13,17088.99,92.583],[1499908500000,17000.1,17088.99,16902.1,16920.35,67.112],[1499909400000,16920.35,17007.0,16920.35,17000.0,72.067],[1499910300000,16960.0,17048.99,16921.22,16922.0,45.687],[1499911200000,16922.0,16950.0,16909.01,16910.0,20.231],[1499912100000,16920.0,17000.0,16920.0,16993.0,35.521],[1499913000000,16993.0,17050.0,16993.0,17044.0,111.647],[1499913900000,17024.0,17085.83,16980.0,17021.01,67.453],[1499914800000,17090.0,17099.8,17034.0,17089.0,40.858],[1499915700000,17089.9,17093.9,17015.18,17036.0,79.526],[1499916600000,17016.6,17036.0,16980.0,16980.0,32.279],[1499917500000,17000.0,17031.99,16930.02,16930.02,53.186],[1499918400000,16930.02,16950.0,16850.0,16944.13,67.581],[1499919300000,16943.56,16944.4,16852.1,16880.0,41.083],[1499920200000,16880.01,16949.9,16800.0,16802.1,62.604],[1499921100000,16802.1,16885.0,16691.99,16710.0,78.556],[1499922000000,16709.99,16738.0,16643.09,16651.0,70.447],[1499922900000,16650.99,16738.0,16645.0,16700.0,43.875],[1499923800000,16700.0,16771.99,16660.0,16694.81,53.826],[1499924700000,16698.0,16768.0,16660.0,16660.1,23.43],[1499925600000,16660.12,16767.97,16638.0,16638.0,254.929],[1499926500000,16637.0,16694.51,16550.1,16576.9,171.512],[1499927400000,16570.09,16576.9,16517.78,16520.0,112.35],[1499928300000,16520.0,16545.0,16462.0,16462.0,171.481],[1499929200000,16498.0,16580.0,16440.0,16580.0,54.5],[1499930100000,16601.0,16649.89,16549.68,16601.01,38.864],[1499931000000,16601.0,16601.01,16571.11,16588.0,53.867],[1499931900000,16588.0,16600.0,16571.01,16599.89,63.416],[1499932800000,16580.0,16600.0,16549.9,16600.0,159.905],[1499933700000,16600.0,16729.36,16549.89,16704.42,32.763],[1499934600000,16690.0,16736.5,16650.0,16650.09,28.644],[1499935500000,16700.0,16700.0,16650.0,16700.0,19.515],[1499936400000,16700.0,16700.0,16650.0,16676.0,102.002],[1499937300000,16676.0,16676.0,16651.0,16651.0,69.126],[1499938200000,16657.5,16676.0,16650.0,16655.82,128.345],[1499939100000,16650.0,16674.0,16650.0,16650.0,185.594],[1499940000000,16650.0,16674.0,16600.0,16674.0,224.416],[1499940900000,16674.0,16676.0,16600.21,16650.0,14.275],[1499941800000,16603.2,16700.0,16603.2,16700.0,48.335],[1499942700000,16700.0,16727.0,16661.44,16670.0,4.949],[1499943600000,16670.0,16734.99,16650.0,16667.0,8.957],[1499944500000,16667.01,16734.99,16580.0,16580.09,84.328],[1499945400000,16697.9,16700.0,16580.09,16601.14,6.26],[1499946300000,16601.14,16734.99,16600.1,16734.99,31.258],[1499947200000,16734.99,16750.0,16698.0,16749.0,31.041],[1499948100000,16702.0,16743.0,16671.37,16743.0,19.843],[1499949000000,16743.0,16760.0,16620.0,16625.01,22.139],[1499949900000,16700.0,16700.0,16625.0,16648.62,1.425],[1499950800000,16699.0,16699.0,16632.5,16632.5,17.161],[1499951700000,16632.5,16649.9,16451.0,16455.01,74.909],[1499952600000,16455.01,16500.0,16440.09,16500.0,50.23],[1499953500000,16500.0,16520.0,16466.0,16519.0,31.591],[1499954400000,16519.0,16531.0,16505.0,16529.99,23.663],[1499955300000,16510.0,16529.99,16385.0,16400.0,90.953],[1499956200000,16399.38,16445.0,16399.38,16404.0,63.184],[1499957100000,16444.9,16470.0,16406.0,16460.0,182.711],[1499958000000,16460.0,16463.99,16375.0,16375.0,112.411],[1499958900000,16442.77,16442.77,16368.0,16380.0,119.02],[1499959800000,16380.0,16391.0,16355.0,16371.0,189.344],[1499960700000,16371.0,16400.0,16360.0,16400.0,40.153],[1499961600000,16400.0,16549.9,16389.0,16510.0,41.321],[1499962500000,16510.0,16534.91,16404.59,16410.12,16.37],[1499963400000,16489.99,16548.0,16412.03,16500.0,121.923],[1499964300000,16463.2,16500.0,16449.28,16499.88,36.418],[1499965200000,16499.88,16500.0,16450.0,16451.1,18.475],[1499966100000,16451.1,16480.0,16409.0,16477.9,17.155],[1499967000000,16477.68,16480.0,16355.9,16365.0,22.987],[1499967900000,16365.0,16399.0,16355.55,16364.99,36.747],[1499968800000,16364.99,16395.99,16355.55,16393.22,75.953],[1499969700000,16393.22,16396.0,16355.56,16396.0,102.205],[1499970600000,16396.0,16400.0,16385.0,16400.0,31.241],[1499971500000,16400.0,16400.0,16355.6,16379.55,5.089],[1499972400000,16379.55,16400.0,16360.1,16360.1,26.909],[1499973300000,16399.88,16400.0,16360.0,16400.0,41.874],[1499974200000,16399.0,16400.0,16399.0,16400.0,32.522],[1499975100000,16400.0,16444.0,16400.0,16444.0,11.059],[1499976000000,16444.0,16444.0,16443.99,16444.0,16.733],[1499976900000,16444.0,16444.0,16420.0,16420.5,15.138],[1499977800000,16420.0,16444.0,16400.0,16444.0,4.301],[1499978700000,16444.0,16500.0,16411.18,16500.0,7.99],[1499979600000,16500.0,16576.9,16450.13,16576.0,9.544],[1499980500000,16517.0,16576.9,16450.1,16550.0,79.332],[1499981400000,16550.0,16550.0,16450.0,16450.0,17.646],[1499982300000,16450.01,16522.92,16400.13,16447.59,47.565],[1499983200000,16447.59,16520.0,16447.59,16519.99,7.499],[1499984100000,16519.99,16550.0,16513.0,16528.46,7.632],[1499985000000,16528.46,16600.0,16528.46,16600.0,2.509],[1499985900000,16550.1,16600.0,16550.1,16581.0,6.522],[1499986800000,16563.0,16598.0,16551.0,16555.0,10.926],[1499987700000,16551.0,16648.0,16550.0,16550.1,61.9],[1499988600000,16555.6,16600.1,16550.1,16550.1,35.433],[1499989500000,16550.1,16550.1,16471.0,16471.0,20.815],[1499990400000,16471.0,16549.0,16471.0,16548.0,27.469],[1499991300000,16548.0,16549.0,16400.0,16400.01,205.103],[1499992200000,16400.01,16400.01,16355.0,16355.0,251.335],[1499993100000,16355.0,16400.0,16348.0,16400.0,531.273],[1499994000000,16350.1,16457.92,16347.0,16349.9,197.038],[1499994900000,16349.9,16390.0,16288.0,16299.0,431.447],[1499995800000,16299.0,16299.9,16250.0,16250.0,73.157],[1499996700000,16250.0,16299.0,16238.0,16279.0,29.642],[1499997600000,16279.0,16346.0,16255.0,16286.0,20.04],[1499998500000,16258.58,16315.65,16258.58,16315.0,49.225],[1499999400000,16315.0,16350.0,16262.0,16281.0,21.488],[1500000300000,16280.0,16282.0,16251.0,16251.0,52.512],[1500001200000,16251.0,16279.0,16230.11,16278.0,80.781],[1500002100000,16271.04,16278.0,16230.4,16256.0,85.72],[1500003000000,16256.0,16278.0,16242.56,16243.02,70.623],[1500003900000,16270.0,16277.99,16243.02,16277.0,42.484],[1500004800000,16277.0,16278.0,16266.0,16278.0,34.441],[1500005700000,16278.0,16338.0,16278.0,16329.0,21.65],[1500006600000,16329.0,16345.9,16286.26,16345.9,84.17],[1500007500000,16345.9,16378.95,16301.01,16350.1,18.345],[1500008400000,16341.1,16375.99,16262.0,16345.0,27.914],[1500009300000,16347.8,16349.0,16280.0,16348.0,41.973],[1500010200000,16349.0,16349.0,16329.0,16331.0,17.426],[1500011100000,16345.99,16373.0,16330.01,16330.01,17.082],[1500012000000,16330.0,16373.0,16310.56,16369.0,14.162],[1500012900000,16315.01,16373.0,16314.55,16373.0,32.04],[1500013800000,16372.99,16490.0,16372.99,16400.1,137.867],[1500014700000,16487.99,16549.97,16450.1,16520.0,102.783],[1500015600000,16511.0,16520.0,16460.0,16497.99,15.525],[1500016500000,16497.99,16548.0,16462.0,16530.0,53.694],[1500017400000,16530.0,16546.99,16486.01,16539.0,64.812],[1500018300000,16490.0,16539.0,16450.0,16450.0,42.025],[1500019200000,16496.0,16496.0,16269.0,16299.01,236.617],[1500020100000,16270.0,16459.0,16270.0,16320.01,68.164],[1500021000000,16320.01,16399.99,16268.57,16315.25,30.566],[1500021900000,16314.32,16343.37,16302.0,16302.0,12.825],[1500022800000,16338.0,16339.0,16275.0,16303.0,47.172],[1500023700000,16303.0,16335.0,16225.0,16335.0,54.088],[1500024600000,16335.0,16390.51,16266.01,16343.97,26.004],[1500025500000,16269.0,16368.98,16260.99,16302.44,16.2],[1500026400000,16298.37,16339.74,16225.15,16260.0,24.245],[1500027300000,16299.99,16349.0,16257.55,16258.0,19.658],[1500028200000,16259.0,16335.0,16257.55,16329.0,35.871],[1500029100000,16328.0,16329.0,16280.01,16282.0,66.056],[1500030000000,16282.0,16328.0,16270.01,16289.99,43.377],[1500030900000,16289.99,16328.0,16258.0,16300.0,45.783],[1500031800000,16299.0,16300.0,16257.55,16257.55,62.517],[1500032700000,16280.0,16292.0,16201.0,16201.01,301.136],[1500033600000,16201.0,16201.01,16060.0,16060.0,1806.915],[1500034500000,16060.0,16114.97,16025.0,16095.0,535.14],[1500035400000,16100.0,16100.0,16000.0,16000.0,229.348],[1500036300000,16000.0,16000.01,15762.0,15770.0,359.779],[1500037200000,15773.0,15884.0,15668.0,15884.0,283.085],[1500038100000,15884.0,15993.17,15777.45,15815.01,157.877],[1500039000000,15849.99,15933.0,15800.11,15820.0,60.722],[1500039900000,15820.0,15825.0,15623.0,15644.6,127.858],[1500040800000,15644.6,15766.0,15644.59,15702.0,52.608],[1500041700000,15702.0,15765.0,15702.0,15730.0,37.539],[1500042600000,15720.0,15747.0,15666.0,15709.0,76.155],[1500043500000,15739.0,15765.0,15709.0,15764.0,88.437],[1500044400000,15763.0,15764.0,15708.0,15710.0,133.392],[1500045300000,15710.0,15849.9,15701.0,15848.88,133.86],[1500046200000,15749.09,15861.27,15621.49,15687.99,116.737],[1500047100000,15641.63,15699.9,15616.16,15650.0,63.499],[1500048000000,15680.0,15751.0,15626.0,15720.0,34.762],[1500048900000,15720.0,15755.0,15556.0,15557.0,204.156],[1500049800000,15557.01,15599.78,15524.0,15539.98,86.626],[1500050700000,15539.99,15595.96,15423.0,15444.0,138.057],[1500051600000,15444.0,15450.0,15281.99,15282.0,184.646],[1500052500000,15282.0,15478.17,15280.0,15420.0,132.437],[1500053400000,15420.01,15481.22,15348.46,15351.29,91.663],[1500054300000,15348.46,15440.0,15348.46,15440.0,32.114],[1500055200000,15439.99,15497.97,15397.01,15397.01,102.258],[1500056100000,15397.97,15419.89,15327.02,15419.89,36.169],[1500057000000,15449.0,15450.0,15408.0,15411.0,57.679],[1500057900000,15411.0,15595.54,15411.0,15466.03,76.051],[1500058800000,15500.1,15593.1,15408.0,15408.0,98.116],[1500059700000,15448.0,15450.0,15408.0,15436.43,30.454],[1500060600000,15442.72,15449.0,15396.35,15399.25,46.579],[1500061500000,15396.55,15449.9,15378.46,15397.72,25.171],[1500062400000,15397.03,15443.77,15350.0,15370.34,124.098],[1500063300000,15370.34,15370.34,15275.47,15275.47,75.272],[1500064200000,15275.47,15329.99,15247.57,15329.99,59.29],[1500065100000,15329.99,15330.0,15328.45,15330.0,16.498],[1500066000000,15329.6,15330.0,15255.0,15297.0,28.439],[1500066900000,15297.0,15440.0,15296.93,15435.0,51.161],[1500067800000,15400.0,15438.7,15398.46,15398.46,15.629],[1500068700000,15398.46,15410.0,15291.77,15291.77,69.068],[1500069600000,15291.77,15360.0,15290.0,15290.0,32.178],[1500070500000,15300.1,15316.0,15290.1,15297.04,14.916],[1500071400000,15300.0,15503.0,15297.04,15502.99,62.088],[1500072300000,15502.99,15503.0,15494.44,15499.99,64.902],[1500073200000,15499.99,15676.39,15494.45,15565.0,106.853],[1500074100000,15573.0,15633.9,15550.0,15555.0,50.917],[1500075000000,15619.97,15619.97,15398.46,15398.46,71.397],[1500075900000,15398.46,15506.4,15355.46,15448.55,72.662],[1500076800000,15453.0,15498.0,15350.2,15350.2,50.993],[1500077700000,15350.2,15350.2,15253.47,15260.0,130.268],[1500078600000,15261.0,15298.0,15200.0,15278.96,142.142],[1500079500000,15279.0,15300.0,15188.0,15236.0,108.511],[1500080400000,15236.0,15250.0,15188.0,15200.0,88.635],[1500081300000,15200.0,15200.0,15136.7,15136.7,76.074],[1500082200000,15175.0,15185.0,14961.97,14998.0,734.322],[1500083100000,14975.01,14999.0,14683.53,14800.0,1082.115],[1500084000000,14800.0,14800.0,14595.31,14751.03,407.437],[1500084900000,14690.0,14855.5,14690.0,14800.0,66.863],[1500085800000,14800.0,14849.0,14600.0,14710.52,103.534],[1500086700000,14710.52,14710.53,14528.54,14540.0,239.946],[1500087600000,14529.0,14752.86,14500.0,14700.0,196.297],[1500088500000,14700.0,14730.0,14588.54,14588.55,95.572],[1500089400000,14588.55,14588.55,14350.0,14495.0,357.131],[1500090300000,14496.0,14496.0,14350.0,14381.0,145.043],[1500091200000,14400.0,14450.1,14280.0,14445.09,157.252],[1500092100000,14445.09,14553.51,14445.09,14499.99,409.589],[1500093000000,14500.0,14749.9,14500.0,14600.0,783.213],[1500093900000,14656.0,14699.9,14559.0,14636.0,311.347],[1500094800000,14636.0,14745.0,14550.1,14744.99,246.201],[1500095700000,14744.99,14748.0,14556.0,14592.0,94.621],[1500096600000,14568.01,14692.81,14568.01,14692.81,62.405],[1500097500000,14697.44,14697.44,14500.0,14504.0,94.764],[1500098400000,14504.0,14504.0,14421.0,14499.99,54.172],[1500099300000,14500.0,14555.09,14426.0,14500.0,131.719],[1500100200000,14499.99,14600.0,14451.11,14563.0,354.034],[1500101100000,14563.0,14611.99,14486.25,14486.25,88.924],[1500102000000,14490.0,14584.84,14388.0,14413.0,218.243],[1500102900000,14413.0,14467.0,14299.89,14300.01,87.845],[1500103800000,14299.89,14335.77,14159.01,14212.42,258.378],[1500104700000,14212.41,14329.0,14170.0,14250.13,171.278],[1500105600000,14250.4,14407.99,14250.13,14407.99,186.716],[1500106500000,14407.98,14407.99,14250.1,14255.42,82.988],[1500107400000,14255.42,14261.4,14145.0,14193.16,206.112],[1500108300000,14152.0,14245.45,14150.1,14245.45,114.269],[1500109200000,14245.45,14400.43,14245.45,14400.43,244.911],[1500110100000,14400.42,14406.44,14200.1,14200.11,106.097],[1500111000000,14249.89,14388.0,14172.4,14260.0,161.935],[1500111900000,14250.27,14341.53,14250.27,14317.0,42.872],[1500112800000,14317.0,14458.0,14317.0,14458.0,143.164],[1500113700000,14458.0,14465.0,14406.0,14418.0,46.128],[1500114600000,14406.0,14418.0,14323.0,14323.0,191.038],[1500115500000,14338.0,14338.0,14300.0,14309.76,166.011],[1500116400000,14300.0,14309.76,14200.1,14200.1,118.055],[1500117300000,14200.11,14285.64,14200.01,14217.0,98.224],[1500118200000,14218.19,14218.19,14150.0,14150.01,103.999],[1500119100000,14150.01,14173.86,14060.0,14082.01,151.602],[1500120000000,14149.9,14149.9,13910.0,13949.0,506.775],[1500120900000,13949.0,14062.0,13866.0,14000.0,449.237],[1500121800000,14049.9,14049.9,13800.0,13800.0,784.62],[1500122700000,13800.0,13900.0,13745.0,13900.0,2587.049],[1500123600000,13900.0,14087.0,13900.0,14001.0,506.808],[1500124500000,14001.0,14050.0,13966.0,13966.0,159.794],[1500125400000,13966.0,13994.8,13820.0,13899.0,90.169],[1500126300000,13901.0,13928.99,13711.0,13760.0,106.755],[1500127200000,13789.0,13819.9,13600.0,13678.9,431.34],[1500128100000,13608.1,13679.0,13501.01,13550.0,189.667],[1500129000000,13510.0,13911.39,13501.0,13793.0,324.722],[1500129900000,13793.0,13929.88,13753.01,13858.0,215.031],[1500130800000,13863.38,14022.57,13697.01,13700.0,393.648],[1500131700000,13700.0,13755.83,13580.0,13755.83,1118.914],[1500132600000,13755.83,13934.89,13754.58,13860.0,324.172],[1500133500000,13860.0,13948.28,13719.81,13929.39,152.371],[1500134400000,13870.34,13953.21,13814.38,13953.21,54.343],[1500135300000,13953.21,14500.0,13953.21,14420.0,452.319],[1500136200000,14449.9,14499.0,14200.1,14301.0,297.097],[1500137100000,14301.0,14444.6,14300.0,14302.11,82.358],[1500138000000,14390.0,14399.0,14250.1,14350.0,94.719],[1500138900000,14321.0,14526.0,14300.1,14500.0,230.324],[1500139800000,14500.0,14500.0,14299.89,14350.0,46.0],[1500140700000,14350.0,14377.2,14065.43,14279.81,161.208],[1500141600000,14256.3,14400.0,14150.1,14342.8,121.092],[1500142500000,14345.0,14345.0,14130.66,14195.5,66.326],[1500143400000,14237.95,14237.95,14103.56,14199.9,37.447],[1500144300000,14180.01,14350.0,14180.0,14249.99,27.388],[1500145200000,14249.99,14436.44,14249.99,14350.12,9.532],[1500146100000,14397.0,14449.9,14316.36,14377.41,78.788],[1500147000000,14377.41,14460.0,14300.2,14450.0,30.706],[1500147900000,14450.0,14450.0,14310.0,14310.0,36.983],[1500148800000,14310.0,14349.89,14149.89,14150.0,49.111],[1500149700000,14150.0,14199.83,14050.0,14199.83,43.579],[1500150600000,14100.26,14290.14,14099.9,14148.9,5.04],[1500151500000,14148.9,14159.99,14100.0,14101.0,37.606],[1500152400000,14101.0,14101.0,14050.0,14051.0,26.293],[1500153300000,14051.0,14169.86,13900.01,14054.1,128.512],[1500154200000,14068.21,14195.0,14053.91,14164.0,13.376],[1500155100000,14200.1,14249.0,14126.39,14127.0,17.495],[1500156000000,14127.0,14250.0,14040.0,14250.0,20.989],[1500156900000,14250.0,14252.0,14201.3,14201.3,16.69],[1500157800000,14201.3,14297.0,14188.0,14199.9,93.812],[1500158700000,14199.9,14240.0,14084.67,14084.68,81.988],[1500159600000,14084.68,14200.0,14050.1,14102.0,83.031],[1500160500000,14173.0,14173.0,13856.0,13970.0,145.809],[1500161400000,13970.0,13970.0,13800.0,13850.0,138.055],[1500162300000,13850.0,13901.0,13760.29,13775.43,96.922],[1500163200000,13760.0,13855.0,13663.99,13848.99,140.334],[1500164100000,13840.0,13848.99,13699.99,13716.0,135.012],[1500165000000,13716.01,13716.01,13636.05,13698.0,85.595],[1500165900000,13698.0,13714.0,13500.0,13578.98,221.632],[1500166800000,13579.0,13599.99,13350.1,13401.0,345.401],[1500167700000,13497.97,13749.9,13401.0,13700.1,290.274],[1500168600000,13700.1,13887.99,13650.1,13700.1,168.24],[1500169500000,13700.1,13800.0,13650.1,13746.0,97.761],[1500170400000,13745.0,13989.86,13744.98,13905.0,105.563],[1500171300000,13904.99,14132.0,13900.0,14132.0,118.97],[1500172200000,14132.0,14132.0,14000.0,14038.16,164.389],[1500173100000,14005.01,14038.16,14000.0,14000.0,71.181],[1500174000000,14035.9,14200.0,14000.0,14142.36,59.57],[1500174900000,14136.0,14200.0,14102.99,14200.0,58.973],[1500175800000,14200.0,14346.0,14199.9,14252.0,137.774],[1500176700000,14252.0,14252.01,14102.99,14120.11,56.774],[1500177600000,14159.0,14200.0,14113.0,14114.0,82.477],[1500178500000,14185.43,14185.43,14101.0,14101.0,56.186],[1500179400000,14101.0,14148.0,14000.0,14000.0,144.673],[1500180300000,14001.0,14075.59,13910.0,14056.28,95.252],[1500181200000,14075.0,14190.0,14003.01,14190.0,57.097],[1500182100000,14176.28,14190.0,14015.99,14050.0,44.252],[1500183000000,14050.0,14050.0,14020.0,14030.0,80.46],[1500183900000,14030.0,14030.0,14020.0,14020.0,88.002],[1500184800000,14020.0,14020.01,13800.0,13850.0,154.66],[1500185700000,13850.0,13900.0,13800.0,13858.0,65.611],[1500186600000,13862.0,13899.9,13783.0,13875.0,55.209],[1500187500000,13860.01,14000.0,13826.41,13990.0,134.868],[1500188400000,13999.0,13999.0,13900.01,13925.0,90.532],[1500189300000,13902.0,13960.0,13770.0,13800.0,59.206],[1500190200000,13803.61,13899.9,13702.13,13743.38,77.117],[1500191100000,13743.38,14049.9,13743.0,13999.99,171.72],[1500192000000,13999.99,14100.0,13901.0,13902.01,117.473],[1500192900000,13945.99,13999.99,13755.0,13819.0,141.323],[1500193800000,13761.0,13902.0,13761.0,13901.0,104.683],[1500194700000,13899.9,13990.0,13828.0,13911.0,68.734],[1500195600000,13989.0,13989.0,13711.0,13750.0,127.355],[1500196500000,13789.0,13789.0,13500.0,13639.65,242.168],[1500197400000,13639.65,13728.0,13560.03,13601.0,48.243],[1500198300000,13676.99,13676.99,13501.0,13549.0,85.232],[1500199200000,13549.0,13679.99,13450.0,13650.0,180.952],[1500200100000,13645.0,13724.0,13526.57,13599.9,141.417],[1500201000000,13619.8,13619.8,13450.0,13540.0,130.121],[1500201900000,13540.0,13649.9,13449.9,13449.9,139.379],[1500202800000,13444.23,13550.0,13380.0,13549.75,173.588],[1500203700000,13548.0,13600.0,13423.0,13423.0,127.509],[1500204600000,13423.0,13500.0,13213.0,13247.45,288.017],[1500205500000,13249.91,13300.0,13210.0,13210.0,180.833],[1500206400000,13207.0,13213.0,13087.53,13152.9,412.719],[1500207300000,13148.95,13200.0,13050.0,13100.0,309.001],[1500208200000,13100.0,13198.0,13005.0,13160.0,374.509],[1500209100000,13160.0,13200.0,13109.0,13115.0,220.537],[1500210000000,13115.0,13116.0,12900.1,13115.99,1155.460954],[1500210900000,13116.0,13500.0,13115.99,13349.99,626.191],[1500211800000,13349.99,13620.0,13330.0,13441.0,444.674],[1500212700000,13500.0,13500.0,13351.0,13460.0,166.718],[1500213600000,13460.0,13518.0,13362.0,13405.0,180.101],[1500214500000,13405.0,13420.0,13350.0,13357.0,124.293],[1500215400000,13352.0,13509.0,13289.43,13509.0,271.742],[1500216300000,13509.0,13509.0,13400.0,13450.0,65.91],[1500217200000,13495.98,13699.9,13431.0,13698.7,258.626],[1500218100000,13698.7,13739.0,13660.0,13698.0,138.832],[1500219000000,13738.0,13756.79,13555.05,13557.52,282.986],[1500219900000,13560.0,13648.66,13429.55,13500.0,185.74],[1500220800000,13499.99,13606.36,13464.67,13587.99,341.757],[1500221700000,13580.0,13610.3,13500.1,13593.23,66.537],[1500222600000,13574.55,13736.0,13505.1,13733.0,104.668],[1500223500000,13722.01,13800.0,13664.62,13799.99,171.481],[1500224400000,13799.99,13800.0,13628.0,13737.0,61.563],[1500225300000,13630.11,13788.0,13601.01,13601.01,20.047],[1500226200000,13679.99,13770.0,13550.03,13679.99,57.547],[1500227100000,13620.0,13738.0,13539.21,13636.04,101.86],[1500228000000,13718.81,13718.9,13533.0,13600.0,102.576],[1500228900000,13600.0,13600.24,13418.55,13418.55,141.872],[1500229800000,13418.6,13580.0,13418.55,13418.55,92.305],[1500230700000,13418.55,13560.47,13418.55,13440.12,14.91],[1500231600000,13440.12,13507.08,13300.09,13404.99,50.017],[1500232500000,13300.11,13488.91,13300.11,13300.7,16.482],[1500233400000,13301.43,13431.14,13157.0,13295.75,98.454],[1500234300000,13295.75,13370.0,13156.35,13201.98,47.353],[1500235200000,13331.84,13502.73,13202.37,13486.47,24.17],[1500236100000,13486.47,13599.9,13350.01,13549.89,27.109],[1500237000000,13549.89,13550.77,13305.8,13518.94,120.293],[1500237900000,13518.91,13518.94,13150.0,13283.43,73.969],[1500238800000,13282.35,13300.0,13180.08,13300.0,20.988],[1500239700000,13300.0,13365.87,13153.78,13201.65,94.824],[1500240600000,13336.17,13389.37,13185.46,13359.68,32.896],[1500241500000,13359.68,13400.0,13189.68,13399.93,46.296],[1500242400000,13253.28,13399.93,13200.0,13202.49,30.81],[1500243300000,13202.88,13400.0,13202.88,13300.0,45.376],[1500244200000,13300.01,13472.89,13300.0,13454.66,75.846],[1500245100000,13454.67,13500.0,13320.1,13499.0,61.029],[1500246000000,13499.0,13674.09,13450.07,13457.44,230.966],[1500246900000,13509.74,13576.51,13401.0,13409.34,91.447],[1500247800000,13409.2,13500.0,13350.0,13350.0,61.082],[1500248700000,13310.0,13459.95,13215.55,13350.0,111.664],[1500249600000,13349.99,13568.0,13349.98,13452.98,58.27],[1500250500000,13452.0,13549.9,13410.0,13419.99,108.668],[1500251400000,13419.99,13449.0,13340.0,13400.99,320.272],[1500252300000,13400.99,13760.0,13400.0,13672.0,257.578],[1500253200000,13745.0,13777.0,13630.01,13655.0,152.614],[1500254100000,13695.96,13890.0,13651.0,13890.0,622.932],[1500255000000,13892.5,13967.89,13841.01,13881.0,306.814],[1500255900000,13850.1,13950.0,13821.0,13898.86,103.372],[1500256800000,13898.85,13898.86,13702.3,13810.0,144.494],[1500257700000,13810.0,13848.0,13766.0,13827.0,103.702],[1500258600000,13822.0,13827.0,13620.0,13719.0,181.504],[1500259500000,13719.0,13720.0,13657.06,13720.0,84.081],[1500260400000,13720.0,13722.0,13600.0,13640.0,173.493],[1500261300000,13633.0,13749.95,13615.99,13729.0,46.701],[1500262200000,13700.0,13745.0,13664.32,13740.9,18.646],[1500263100000,13701.0,13801.9,13683.0,13801.9,32.148],[1500264000000,13800.95,13850.0,13744.97,13799.99,51.934],[1500264900000,13800.0,13908.0,13750.02,13900.0,104.97],[1500265800000,13900.0,13958.0,13860.0,13903.0,127.227],[1500266700000,13942.0,13942.0,13808.0,13821.0,53.215],[1500267600000,13821.0,13866.79,13682.0,13780.0,130.215],[1500268500000,13767.62,13800.0,13701.04,13782.75,50.913],[1500269400000,13794.66,13800.0,13730.01,13757.0,51.912],[1500270300000,13780.0,13849.9,13732.0,13801.01,63.742],[1500271200000,13849.9,13941.97,13802.01,13930.0,101.47],[1500272100000,13930.0,14049.99,13900.01,13966.0,374.478],[1500273000000,13972.98,13998.99,13902.4,13917.0,119.36],[1500273900000,13917.0,13996.0,13870.0,13958.0,102.829],[1500274800000,13958.0,14155.0,13958.0,14076.5,150.526],[1500275700000,14080.0,14170.0,14039.0,14170.0,196.487],[1500276600000,14160.0,14280.0,14150.0,14188.51,528.733],[1500277500000,14230.0,14230.0,14150.0,14170.8,125.941],[1500278400000,14170.8,14245.0,14150.0,14236.99,398.778],[1500279300000,14236.99,14356.33,14220.0,14300.0,232.899],[1500280200000,14300.01,14345.0,14205.0,14215.0,108.68],[1500281100000,14215.0,14280.99,14155.0,14155.0,166.971],[1500282000000,14155.0,14155.0,14051.0,14056.01,160.396],[1500282900000,14079.0,14100.0,14000.0,14051.0,211.597],[1500283800000,14099.9,14197.0,14057.0,14197.0,87.026],[1500284700000,14196.99,14245.5,14152.0,14152.0,87.368],[1500285600000,14152.0,14198.87,14060.1,14061.0,67.807],[1500286500000,14099.0,14175.9,14062.0,14070.0,80.038],[1500287400000,14070.0,14110.0,14060.2,14110.0,50.753],[1500288300000,14095.5,14150.1,14004.11,14085.0,69.469],[1500289200000,14083.96,14094.29,13962.12,14000.0,95.008],[1500290100000,13990.0,14000.0,13840.69,13920.0,128.604],[1500291000000,13851.01,13949.97,13851.01,13861.0,82.679],[1500291900000,13861.0,13916.0,13820.0,13889.88,86.59],[1500292800000,13888.99,13889.88,13715.07,13888.0,212.499],[1500293700000,13888.0,13919.0,13752.0,13799.9,50.085],[1500294600000,13799.9,13899.0,13756.46,13837.0,33.4],[1500295500000,13837.0,13850.0,13758.01,13839.0,32.492],[1500296400000,13839.0,13940.3,13830.0,13940.0,46.193],[1500297300000,13940.0,13950.0,13830.0,13867.0,139.156],[1500298200000,13897.28,13900.0,13703.07,13705.0,77.395],[1500299100000,13705.0,13780.0,13682.0,13745.0,263.984],[1500300000000,13745.0,13895.69,13701.37,13815.33,446.959],[1500300900000,13815.34,13948.0,13815.33,13940.0,52.518],[1500301800000,13939.0,14030.0,13900.0,13970.0,320.673],[1500302700000,13970.0,14180.0,13970.0,14150.0,195.19],[1500303600000,14131.33,14250.0,14131.33,14180.0,172.748],[1500304500000,14180.0,14281.0,14129.0,14280.0,203.373],[1500305400000,14280.0,14400.0,14250.0,14399.9,204.657],[1500306300000,14399.88,14400.0,14151.0,14238.0,135.485],[1500307200000,14261.0,14356.0,14165.02,14350.0,111.451],[1500308100000,14353.0,14390.06,14300.57,14300.57,121.557],[1500309000000,14300.57,14346.0,14250.01,14329.99,92.91],[1500309900000,14290.18,14329.99,14261.01,14323.99,156.478],[1500310800000,14323.0,14390.0,14265.0,14390.0,745.289],[1500311700000,14350.0,14549.8,14345.0,14485.0,764.316],[1500312600000,14490.0,14550.0,14485.0,14550.0,127.816],[1500313500000,14550.0,14630.0,14508.01,14508.01,283.642],[1500314400000,14508.01,14630.0,14465.75,14515.05,118.931],[1500315300000,14515.05,14580.0,14480.0,14560.0,39.496],[1500316200000,14560.0,14650.0,14451.0,14650.0,62.061],[1500317100000,14649.97,14673.89,14586.22,14656.01,115.907],[1500318000000,14656.01,14715.83,14559.0,14560.0,83.509],[1500318900000,14560.0,14589.0,14500.1,14550.0,61.144],[1500319800000,14550.0,14551.0,14451.0,14465.0,13.879],[1500320700000,14465.0,14549.9,14400.0,14466.04,43.462],[1500321600000,14514.99,14692.97,14500.71,14641.46,35.795],[1500322500000,14641.46,14730.0,14641.46,14728.0,27.264],[1500323400000,14727.96,14749.96,14627.9,14700.1,117.517],[1500324300000,14696.0,14770.9,14608.0,14663.0,74.453],[1500325200000,14663.0,14749.87,14608.0,14744.3,26.54],[1500326100000,14746.0,14790.0,14657.68,14657.68,80.538],[1500327000000,14699.0,14699.9,14550.0,14650.1,46.445],[1500327900000,14693.0,14752.43,14626.0,14626.0,35.434],[1500328800000,14626.0,14750.0,14626.0,14749.0,57.909],[1500329700000,14749.99,14787.0,14699.0,14700.0,62.391],[1500330600000,14700.0,14796.0,14662.0,14796.0,149.957],[1500331500000,14796.0,14950.0,14796.0,14912.0,276.149],[1500332400000,14912.0,15150.0,14912.0,15145.0,408.821],[1500333300000,15150.0,15150.0,14930.0,14980.0,434.227],[1500334200000,14980.0,14995.0,14915.0,14991.0,117.72],[1500335100000,14960.0,15146.0,14960.0,15119.99,157.549],[1500336000000,15096.0,15139.0,15050.0,15060.0,97.514],[1500336900000,15061.0,15106.1,15040.0,15040.0,227.218],[1500337800000,15040.0,15099.99,14901.0,15083.0,183.061],[1500338700000,15050.1,15099.0,14861.0,14880.0,135.412],[1500339600000,14899.99,14948.0,14803.0,14803.0,138.643],[1500340500000,14803.0,14894.0,14801.0,14861.8,269.826],[1500341400000,14851.0,14949.0,14839.0,14948.99,67.339],[1500342300000,14902.01,15080.0,14896.03,15050.0,54.48],[1500343200000,15011.1,15089.0,14898.99,14905.06,88.212],[1500344100000,14906.01,15000.0,14900.0,15000.0,53.493],[1500345000000,14999.0,15045.0,14952.0,15000.0,86.062],[1500345900000,15000.0,15053.01,14970.0,15047.07,101.137],[1500346800000,15053.01,15090.99,15011.04,15033.0,52.758],[1500347700000,15031.0,15033.0,15001.0,15001.0,119.057],[1500348600000,15001.0,15001.0,14900.0,14902.6,123.897],[1500349500000,14902.6,14924.4,14838.35,14900.0,193.511],[1500350400000,14900.0,14942.03,14889.0,14901.0,368.368],[1500351300000,14901.0,14901.0,14800.0,14840.0,616.514],[1500352200000,14840.0,15078.5,14800.0,15047.9,886.458],[1500353100000,15047.9,15200.0,15000.0,15159.99,806.631],[1500354000000,15100.0,15247.97,15080.0,15100.01,214.933],[1500354900000,15100.1,15159.0,15100.0,15139.0,85.759],[1500355800000,15136.0,15162.29,15102.11,15148.0,50.104],[1500356700000,15140.0,15295.0,15110.91,15260.0,172.912],[1500357600000,15260.0,15295.0,15188.88,15210.0,271.509],[1500358500000,15210.0,15350.0,15190.0,15350.0,334.113],[1500359400000,15345.0,15422.54,15299.0,15402.72,344.398],[1500360300000,15402.72,15405.0,15322.3,15399.98,255.894],[1500361200000,15391.53,15490.0,15390.0,15457.6,240.231],[1500362100000,15490.0,15492.0,15361.02,15440.54,292.955],[1500363000000,15440.54,15649.87,15440.54,15625.56,523.839],[1500363900000,15612.0,15649.0,15381.12,15400.0,353.826],[1500364800000,15401.0,15499.99,15300.0,15421.0,324.007],[1500365700000,15402.72,15540.0,15346.0,15346.0,342.061],[1500366600000,15346.0,15461.69,15340.79,15425.0,79.845],[1500367500000,15430.0,15433.0,15330.0,15330.0,320.756],[1500368400000,15329.0,15330.0,15200.0,15204.01,277.651],[1500369300000,15204.62,15392.03,15189.0,15271.52,211.038],[1500370200000,15271.52,15298.0,15240.0,15281.52,68.369],[1500371100000,15300.0,15351.53,15300.0,15351.53,83.806],[1500372000000,15351.53,15463.0,15350.0,15350.0,182.263],[1500372900000,15350.01,15350.01,15250.0,15266.0,40.62],[1500373800000,15293.0,15300.0,15241.2,15299.99,53.039],[1500374700000,15300.0,15363.0,15300.0,15360.0,24.194],[1500375600000,15361.88,15375.0,15330.0,15330.01,46.502],[1500376500000,15375.0,15596.55,15375.0,15596.0,242.374],[1500377400000,15571.01,15648.0,15571.01,15640.01,249.429],[1500378300000,15643.99,15679.0,15500.1,15570.0,238.219],[1500379200000,15569.0,15647.56,15560.0,15601.56,110.549],[1500380100000,15600.0,15661.56,15581.0,15647.0,100.619],[1500381000000,15647.0,15660.0,15602.0,15614.56,194.147],[1500381900000,15614.56,15660.0,15602.01,15623.0,50.656],[1500382800000,15623.0,15770.57,15620.2,15759.18,254.691],[1500383700000,15758.0,15813.78,15723.0,15813.78,371.631],[1500384600000,15813.78,15875.0,15705.0,15710.0,281.35],[1500385500000,15710.0,15932.89,15710.0,15909.0,534.696],[1500386400000,15883.0,15919.01,15850.0,15899.89,216.331],[1500387300000,15900.0,15901.1,15751.0,15826.0,325.006],[1500388200000,15833.91,15915.0,15825.0,15915.0,147.008],[1500389100000,15910.0,15920.0,15896.0,15908.0,111.824],[1500390000000,15908.0,15958.0,15905.3,15920.0,201.886],[1500390900000,15920.0,15923.0,15750.0,15750.0,323.858],[1500391800000,15734.28,15775.57,15718.28,15755.0,223.086],[1500392700000,15755.0,15932.25,15660.0,15932.25,376.085],[1500393600000,15932.0,15958.0,15837.0,15866.16,257.958],[1500394500000,15866.16,15866.16,15705.0,15795.78,372.907],[1500395400000,15796.0,15812.99,15661.43,15661.43,365.765],[1500396300000,15661.0,15661.43,15612.0,15650.0,137.682],[1500397200000,15649.99,15739.57,15645.0,15704.14,126.336],[1500398100000,15704.14,15800.0,15697.0,15800.0,109.209],[1500399000000,15800.0,15800.0,15750.1,15799.99,87.724],[1500399900000,15799.99,15850.0,15768.0,15849.99,48.0],[1500400800000,15849.99,15850.0,15804.52,15850.0,47.991],[1500401700000,15850.0,15910.0,15849.99,15900.0,80.566],[1500402600000,15900.0,15910.0,15855.98,15900.11,130.903],[1500403500000,15900.11,15910.0,15850.0,15853.54,30.416],[1500404400000,15853.0,15930.0,15850.0,15851.0,71.205],[1500405300000,15851.0,15909.0,15840.79,15858.0,177.6],[1500406200000,15858.0,15906.0,15830.0,15835.0,45.175],[1500407100000,15835.0,15880.0,15800.0,15800.0,48.532],[1500408000000,15800.04,15878.16,15800.0,15864.29,19.414],[1500408900000,15877.58,16000.0,15851.0,15999.99,124.917],[1500409800000,15999.0,16059.69,15950.0,16010.0,288.917],[1500410700000,16010.0,16010.0,15850.0,15899.9,226.0897],[1500411600000,15897.83,15949.9,15850.0,15925.98,156.48],[1500412500000,15929.48,15994.2,15850.0,15994.2,35.419],[1500413400000,15973.0,16053.87,15945.02,16053.87,147.5],[1500414300000,16053.87,16104.83,16046.74,16104.83,177.479],[1500415200000,16104.83,16112.61,16096.75,16112.61,123.493],[1500416100000,16112.61,16150.0,15951.0,15962.45,239.867],[1500417000000,15959.47,15999.9,15858.0,15858.0,107.189],[1500417900000,15856.5,15900.0,15718.18,15750.0,178.478],[1500418800000,15749.0,15850.0,15749.0,15752.01,50.617],[1500419700000,15752.0,15849.9,15630.0,15827.53,96.0395],[1500420600000,15827.53,15860.55,15736.0,15761.0,151.09],[1500421500000,15820.0,15900.0,15750.1,15898.88,73.974],[1500422400000,15850.01,15900.0,15722.03,15749.89,66.609],[1500423300000,15726.0,15749.9,15650.1,15716.25,116.484],[1500424200000,15716.25,15721.0,15496.9,15496.9,173.417],[1500425100000,15496.9,15501.0,15250.0,15360.0,604.771],[1500426000000,15330.0,15361.59,15300.0,15335.0,311.49],[1500426900000,15335.0,15335.0,15200.1,15236.94,159.696],[1500427800000,15225.03,15550.0,15211.0,15550.0,175.666],[1500428700000,15550.01,15649.9,15550.0,15597.0,622.921],[1500429600000,15597.0,15649.9,15549.89,15549.89,248.085],[1500430500000,15549.89,15597.99,15500.66,15557.0,108.368],[1500431400000,15550.0,15557.0,15401.0,15450.0,98.966],[1500432300000,15401.0,15495.0,15347.01,15495.0,177.833],[1500433200000,15495.0,15643.99,15450.1,15643.99,128.484],[1500434100000,15643.99,15885.0,15607.11,15885.0,238.138],[1500435000000,15885.0,15903.6,15753.08,15845.0,187.903],[1500435900000,15840.0,15851.58,15740.14,15851.57,148.669],[1500436800000,15851.57,15949.9,15851.57,15901.47,155.969],[1500437700000,15902.0,15980.0,15868.0,15978.9,178.001],[1500438600000,15978.9,15978.9,15752.0,15754.69,244.139],[1500439500000,15754.68,15899.9,15752.0,15843.0,64.382],[1500440400000,15843.0,15899.88,15700.1,15800.01,79.324],[1500441300000,15800.0,15931.0,15800.0,15901.83,64.135],[1500442200000,15903.95,15949.0,15858.0,15909.01,74.436],[1500443100000,15900.0,15994.59,15900.0,15978.99,160.263],[1500444000000,15994.0,16108.5,15970.0,16108.4,635.477],[1500444900000,16108.4,16150.0,16047.0,16050.0,298.244],[1500445800000,16050.0,16060.1,16000.0,16038.0,58.269],[1500446700000,16038.0,16100.0,16013.0,16099.0,125.14],[1500447600000,16099.01,16130.0,16050.0,16129.49,288.384],[1500448500000,16130.0,16250.0,16129.98,16245.0,618.825],[1500449400000,16245.0,16412.0,16230.0,16412.0,505.342],[1500450300000,16412.0,16499.9,16321.01,16350.0,371.319],[1500451200000,16388.0,16388.0,16240.0,16350.0,229.211],[1500452100000,16360.0,16398.99,16153.0,16211.0,170.408],[1500453000000,16243.9,16349.9,16110.0,16199.9,196.252],[1500453900000,16199.9,16212.0,16066.66,16120.0,182.748],[1500454800000,16119.8,16200.0,16119.8,16199.0,457.941],[1500455700000,16199.0,16200.0,16000.0,16010.0,614.0],[1500456600000,16079.0,16199.9,15888.88,16155.0,188.556],[1500457500000,16188.0,16203.0,16145.0,16170.0,31.603],[1500458400000,16170.0,16398.0,16140.0,16261.0,58.414],[1500459300000,16340.0,16349.99,16211.0,16235.0,81.118],[1500460200000,16235.0,16336.97,16208.0,16208.0,116.025],[1500461100000,16259.99,16259.99,16150.0,16200.0,52.759],[1500462000000,16155.0,16200.0,15950.1,16050.0,177.265],[1500462900000,16050.0,16153.0,16050.0,16090.0,113.85],[1500463800000,16090.0,16191.9,16050.0,16159.0,70.238],[1500464700000,16159.0,16191.9,16050.0,16060.1,64.397],[1500465600000,16110.0,16158.98,15900.13,16000.0,182.612],[1500466500000,16000.0,16044.97,15830.0,15891.0,339.944],[1500467400000,15891.0,16050.0,15870.0,16000.0,353.764],[1500468300000,15950.0,16050.0,15950.0,15963.0,388.979],[1500469200000,15963.0,16038.99,15801.01,15932.02,666.87],[1500470100000,15926.0,15940.0,15800.0,15863.99,187.018],[1500471000000,15863.99,15877.0,15821.02,15860.0,641.11],[1500471900000,15861.58,15893.0,15820.0,15889.0,38.365],[1500472800000,15880.0,16099.68,15820.0,16090.07,156.754],[1500473700000,16095.9,16099.0,15951.0,16000.1,90.742],[1500474600000,16000.1,16100.0,15988.0,16100.0,220.657],[1500475500000,16100.0,16198.99,16060.1,16187.9,136.813],[1500476400000,16187.0,16235.0,16110.0,16235.0,138.217],[1500477300000,16110.15,16235.0,16100.0,16165.0,56.532],[1500478200000,16149.9,16165.0,16000.1,16137.0,99.999],[1500479100000,16137.0,16169.88,16011.0,16034.17,112.614],[1500480000000,16080.0,16090.0,15950.0,15950.0,169.662],[1500480900000,15950.0,15950.0,15701.0,15741.0,267.922],[1500481800000,15748.86,15888.0,15709.0,15887.99,69.987],[1500482700000,15887.99,15974.03,15879.99,15924.42,63.848],[1500483600000,15899.9,15999.0,15838.0,15998.0,47.874],[1500484500000,15998.0,16030.0,15998.0,16000.0,29.375],[1500485400000,16001.0,16001.01,15899.0,15999.9,65.545],[1500486300000,15999.9,15999.9,15850.11,15899.9,35.377],[1500487200000,15899.9,15900.0,15750.0,15888.88,69.696],[1500488100000,15887.9,15998.0,15869.93,15997.0,78.624],[1500489000000,15990.0,16000.1,15931.0,15999.0,66.647],[1500489900000,15999.0,16066.34,15940.0,15957.0,70.612],[1500490800000,16030.0,16079.82,15921.04,15921.04,195.343],[1500491700000,15980.0,15999.91,15800.0,15929.86,383.357],[1500492600000,15850.1,16023.89,15777.81,15777.84,194.762],[1500493500000,15792.03,15960.36,15777.84,15894.0,105.369],[1500494400000,15815.0,15949.87,15799.93,15924.99,94.181],[1500495300000,15924.97,15986.73,15786.39,15986.68,80.856],[1500496200000,15986.66,16048.62,15850.1,15980.0,50.22],[1500497100000,15980.0,16048.71,15882.46,15882.46,69.15],[1500498000000,15876.36,15999.0,15876.36,15900.1,79.027],[1500498900000,15900.12,16200.0,15900.12,16075.0,172.137],[1500499800000,16087.5,16100.0,15975.34,16007.26,17.604],[1500500700000,16049.9,16049.9,15902.0,15949.9,63.316],[1500501600000,15949.9,16090.79,15902.0,16049.0,138.277],[1500502500000,16049.0,16122.0,15953.99,16121.9,68.959],[1500503400000,16121.9,16149.9,16002.01,16052.0,49.566],[1500504300000,16066.02,16100.0,15900.1,15935.0,70.803],[1500505200000,15932.99,16000.0,15823.54,15875.8,69.268],[1500506100000,15875.8,15875.8,15777.77,15801.58,149.821],[1500507000000,15807.91,15855.87,15699.22,15811.0,134.6],[1500507900000,15811.0,15990.0,15800.0,15890.0,70.651],[1500508800000,15874.0,15984.0,15820.48,15960.0,81.063],[1500509700000,15960.0,16049.9,15922.31,15924.01,74.009],[1500510600000,15955.25,15997.0,15901.45,15955.97,36.472],[1500511500000,15976.13,15976.13,15878.0,15883.0,86.156],[1500512400000,15883.0,15899.0,15800.82,15847.0,110.916],[1500513300000,15847.0,15900.11,15800.1,15900.0,93.135],[1500514200000,15943.0,15950.0,15802.0,15940.0,51.094],[1500515100000,15940.0,16050.0,15901.01,15983.0,85.203]];
            GLOBAL_VAR.KLineData = array;
            if (ChartManager.getInstance().getChart()._money_type == 1) {
                var rate = ChartManager.getInstance().getChart()._usd_cny_rate;
                for (var i in GLOBAL_VAR.KLineData) {
                    var e = GLOBAL_VAR.KLineData[i];
                    e[1] = parseFloat((e[1] * rate).toFixed(2));
                    e[2] = parseFloat((e[2] * rate).toFixed(2));
                    e[3] = parseFloat((e[3] * rate).toFixed(2));
                    e[4] = parseFloat((e[4] * rate).toFixed(2));
                }
            }
            try {
                if (!GLOBAL_VAR.chartMgr.updateData("frame0.k0", GLOBAL_VAR.KLineData)) {
                    GLOBAL_VAR.requestParam = setHttpRequestParam(GLOBAL_VAR.mark_from, GLOBAL_VAR.time_type, "1000", null);
                    GLOBAL_VAR.TimeOutId = setTimeout(RequestData, 2000);
                    return;
                }
                clear_refresh_counter();
            } catch (err) {
                if (err == "calcInterval") {
                    GLOBAL_VAR.requestParam = setHttpRequestParam(GLOBAL_VAR.mark_from, GLOBAL_VAR.time_type, "1000", null);
                    GLOBAL_VAR.TimeOutId = setTimeout(RequestData, 2000);
                    return;
                }
            }
            if (Pushing.state == Pushing.State.Enable) {
                Pushing.Switch();
            } else {
                GLOBAL_VAR.TimeOutId = setTimeout(TwoSecondThread, 2000);
            }
            $("#chart_loading").removeClass("activated");
            ChartManager.getInstance().redraw('All', true);
        // };
        console.log('load data done');
        }
    );
};
function AbortRequest() {
    if (GLOBAL_VAR.G_HTTP_REQUEST && GLOBAL_VAR.G_HTTP_REQUEST.readyState != 4) {
        GLOBAL_VAR.G_HTTP_REQUEST.abort();
    }
}
function TwoSecondThread() {
    var f = GLOBAL_VAR.chartMgr.getDataSource("frame0.k0").getLastDate();
    if (f == -1) {
        GLOBAL_VAR.requestParam = setHttpRequestParam(GLOBAL_VAR.mark_from, GLOBAL_VAR.time_type, "1000", null);
    } else {
        GLOBAL_VAR.requestParam = setHttpRequestParam(GLOBAL_VAR.mark_from, GLOBAL_VAR.time_type, null, f.toString());
    }
    RequestData();
}
function readCookie() {
    ChartSettings.get();
    ChartSettings.save();
    var tmp = ChartSettings.get();
    ChartManager.getInstance().setChartStyle('frame0.k0', tmp.charts.chartStyle);
    var period = tmp.charts.period;
    switch_period(period);
    $('#chart_period_'+period+'_v a').addClass('selected');
    $('#chart_period_'+period+'_h a').addClass('selected');
    if (tmp.charts.indicsStatus == 'close') {
        switch_indic('off');
    } else if (tmp.charts.indicsStatus == 'open') {
        switch_indic('on');
    }
    var main_indic = $('#chart_select_main_indicator');
    main_indic.find('a').each(function() {
        if ($(this).attr('name') == tmp.charts.mIndic) {
            $(this).addClass('selected');
        }
    });
    var chart_style = $('#chart_select_chart_style');
    chart_style.find('a').each(function(){
        if ($(this)[0].innerHTML == tmp.charts.chartStyle) {
            $(this).addClass('selected');
        }
    });
    ChartManager.getInstance().getChart().setMainIndicator(tmp.charts.mIndic);
    ChartManager.getInstance().setThemeName('frame0', tmp.theme);
    switch_tools('off');
    if (tmp.theme == 'Dark') {
        switch_theme('dark');
    } else if (tmp.theme == 'Light') {
        switch_theme('light');
    }
}
var main = function() {
    window.onPushingStarted = function(callback) {
        Pushing.Start(callback);
    };
    window.onPushingResponse = function(marketFrom, type, coinVol, data) {
        Pushing.Response(marketFrom, type, coinVol, data);
    };
    window.onPushingStop = function() {
        Pushing.Stop();
    };
    window._KlineIndex = function(content) {
        Template.displayVolume = false;
        refreshTemplate();
        readCookie();
        if (content == 0)
            ChartManager.getInstance().getChart().setKlineIndex("17");
        else if (content == 3)
            ChartManager.getInstance().getChart().setKlineIndex("18");
        else
            return;
    };
    window._display_future_list = function() {
        $("#chart_dropdown_symbols")[0].style.display = "block";
    };
    window._set_current_language = function(content) {
        chart_switch_language(content);
    };
    window._set_current_depth = function(content) {
        ChartManager.getInstance().getChart().updateDepth(content);
    };
    window._set_current_coin = function(content) {
        ChartManager.getInstance().getChart().setCurrentCoin(content);
    };
    window._set_current_url = function(content) {
        // GLOBAL_VAR.url = "https://www.okcoin.cn/api/klineData.do";
        GLOBAL_VAR.url = content;
    };
    window._set_future_list = function(content) {
        ChartManager.getInstance().getChart().setFutureList(content);
    };
    window._set_current_future = function(contractID) {
        ChartManager.getInstance().getChart().setCurrentFuture(contractID);
    };
    window._set_init_current_future = function(contractID) {
        ChartManager.getInstance().getChart().setCurrentFutureNoRaise(contractID);
    };
    window._set_current_contract_unit = function(str) {
        ChartManager.getInstance().getChart().setCurrentContractUnit(str);
    };
    window._set_money_type = function(str) {
        ChartManager.getInstance().getChart().setCurrentMoneyType(str);
    };
    window._set_usd_cny_rate = function(rate) {
        ChartManager.getInstance().getChart()._usd_cny_rate = rate;
    };
    window._setCaptureMouseWheelDirectly = function(b) {
        ChartManager.getInstance().setCaptureMouseWheelDirectly(b);
    };
    window._current_future_change = new MEvent();
    window._current_theme_change = new MEvent();
    /*
     window._current_future_change.addHandler(o, func);
     window._current_theme_change.addHandler(o, func);
     window._current_future_change.raise(content);
     window._current_theme_change.raise(content);
     */
    chart_switch_language('en-us');
    KLineMouseEvent();
    ChartManager.getInstance().bindCanvas("main", document.getElementById("chart_mainCanvas"));
    ChartManager.getInstance().bindCanvas("overlay", document.getElementById("chart_overlayCanvas"));
    GLOBAL_VAR.requestParam = "marketFrom=13"+"&type=2"+"&limit=1000";
    GLOBAL_VAR.mark_from = '13';
    GLOBAL_VAR.time_type = '2';
    GLOBAL_VAR.limit = '1000';
    refreshTemplate();
    on_size();
    readCookie();
    $('#chart_container').css({visibility:"visible"});
}();
function setHttpRequestParam(mark_from, time_type, limit, since){
    var str = "marketFrom=" + mark_from + "&type=" + time_type;
    if (limit != null)
        str += "&limit=" + limit;
    else
        str += "&since=" + since;
    switch (ChartManager.getInstance().getChart().  _contract_unit) {
        case 0:
            str += "&coinVol=1";
            break;
        case 1:
            str += "&coinVol=0";
            break;
    }
    return str;
}
function refreshTemplate() {
    GLOBAL_VAR.chartMgr = DefaultTemplate.loadTemplate(
        "frame0.k0", "OKCoin"+GLOBAL_VAR.mark_from+GLOBAL_VAR.time_type,
        "frame0.order", "0.order",
        "frame0.trade", "0.trade");
    ChartManager.getInstance().redraw('All', true);
}
function getRectCrossPt (rect, startPt, endPt){
    var crossPt;
    var firstPt = {x: -1, y: -1};
    var secondPt = {x: -1, y: -1};
    var xdiff = endPt.x - startPt.x;
    var ydiff = endPt.y - startPt.y;
    if (Math.abs(xdiff) < 2){
        firstPt = {x : startPt.x, y : rect.top};
        secondPt = {x : endPt.x, y : rect.bottom};
        crossPt = [firstPt, secondPt];
        return crossPt;
    }
    var k = ydiff/xdiff;
    secondPt.x = rect.right;
    secondPt.y = startPt.y + (rect.right - startPt.x) * k;
    firstPt.x = rect.left;
    firstPt.y = startPt.y + (rect.left - startPt.x) * k;
    crossPt = [firstPt, secondPt];
    return crossPt;
}
function chart_switch_language(lang) {
    var tmp = lang.replace(/-/, '_');
    $('#chart_language_switch_tmp').find('span').each(function(){
        var name = $(this).attr('name');
        var attr = $(this).attr(tmp);
        name = '.' + name;
        var obj = $(name)[0];
        if (!obj)
            return;
        $(name).each(function() {
            $(this)[0].innerHTML = attr;
        });
    });
    ChartManager.getInstance().setLanguage(lang);
    ChartManager.getInstance().getChart().setTitle();
}
function on_size() {
    var width = window.innerWidth;
    var height = window.innerHeight;
    var container = $('#chart_container');
    container.css({
        width: width + 'px',
        height: height + 'px'
    });
    var toolBar = $('#chart_toolbar');
    var toolPanel = $('#chart_toolpanel');
    var canvasGroup = $('#chart_canvasGroup');
    var tabBar = $('#chart_tabbar');
    var toolPanelShown = toolPanel[0].style.display != 'inline' ? false : true;
    var tabBarShown = tabBar[0].style.display != 'block' ? false : true;
    var toolBarRect = {};
    toolBarRect.x = 0;
    toolBarRect.y = 0;
    toolBarRect.w = width;
    toolBarRect.h = 29/*parseInt(toolBar.css("height"))*/;
    var toolPanelRect = {};
    toolPanelRect.x = 0;
    toolPanelRect.y = toolBarRect.h + 1/*parseInt(toolBar.css("border-bottom-width"))*/;
    toolPanelRect.w = toolPanelShown ? 32/*parseInt(toolPanel.css("width"))*/ : 0;
    toolPanelRect.h = height - toolPanelRect.y;
    var tabBarRect = {};
    tabBarRect.w = toolPanelShown ? width - (toolPanelRect.w + 1/*parseInt(toolPanel.css("border-right-width"))*/) : width;
    tabBarRect.h = tabBarShown ? 22/*parseInt(tabBar.css("height"))*/ : -1/*parseInt(tabBar.css("border-top-width"))*/;
    tabBarRect.x = width - tabBarRect.w;
    tabBarRect.y = height - (tabBarRect.h + 1/*parseInt(tabBar.css("border-top-width"))*/);
    var canvasGroupRect = {};
    canvasGroupRect.x = tabBarRect.x;
    canvasGroupRect.y = toolPanelRect.y;
    canvasGroupRect.w = tabBarRect.w;
    canvasGroupRect.h = tabBarRect.y - toolPanelRect.y;
    toolBar.css({
        left:   toolBarRect.x + 'px',
        top:    toolBarRect.y + 'px',
        width:  toolBarRect.w + 'px',
        height: toolBarRect.h + 'px'
    });
    if (toolPanelShown) {
        toolPanel.css({
            left:   toolPanelRect.x + 'px',
            top:    toolPanelRect.y + 'px',
            width:  toolPanelRect.w + 'px',
            height: toolPanelRect.h + 'px'
        });
    }
    canvasGroup.css({
        left:   canvasGroupRect.x + 'px',
        top:    canvasGroupRect.y + 'px',
        width:  canvasGroupRect.w + 'px',
        height: canvasGroupRect.h + 'px'
    });
    var mainCanvas = $('#chart_mainCanvas')[0];
    var overlayCanvas = $('#chart_overlayCanvas')[0];
    mainCanvas.width = canvasGroupRect.w;
    mainCanvas.height = canvasGroupRect.h;
    overlayCanvas.width = canvasGroupRect.w;
    overlayCanvas.height = canvasGroupRect.h;
    if (tabBarShown) {
        tabBar.css({
            left:   tabBarRect.x + 'px',
            top:    tabBarRect.y + 'px',
            width:  tabBarRect.w + 'px',
            height: tabBarRect.h + 'px'
        });
    }
    var dlgSettings = $("#chart_parameter_settings");
    dlgSettings.css({
        left: (width - dlgSettings.width()) >> 1,
        top: (height - dlgSettings.height()) >> 1
    });
    var dlgLoading = $("#chart_loading");
    dlgLoading.css({
        left: (width - dlgLoading.width()) >> 1,
        top: (height - dlgLoading.height()) >> 2
    });
    var domElemCache = $('#chart_dom_elem_cache');
    var rowTheme = $('#chart_select_theme')[0];
    var rowTools = $('#chart_enable_tools')[0];
    var rowIndic = $('#chart_enable_indicator')[0];
    var dropDownSymbols = $('#chart_dropdown_symbols');
    var periodsVert = $('#chart_toolbar_periods_vert');
    var periodsHorz = $('#chart_toolbar_periods_horz')[0];
    var showIndic = $('#chart_show_indicator')[0];
    var showTools = $('#chart_show_tools')[0];
    var selectTheme = $('#chart_toolbar_theme')[0];
    var dropDownSettings = $('#chart_dropdown_settings');
    var dropDownSymbolsNW = 4 + dropDownSymbols.find(".chart_dropdown_t")[0].offsetWidth;
    var periodsVertNW = dropDownSymbolsNW + periodsVert[0].offsetWidth;
    var periodsHorzNW = periodsVertNW + periodsHorz.offsetWidth;
    var showIndicNW = periodsHorzNW + showIndic.offsetWidth + 4;
    var showToolsNW = showIndicNW + showTools.offsetWidth + 4;
    var selectThemeNW = showToolsNW + selectTheme.offsetWidth;
    var dropDownSettingsW = dropDownSettings.find(".chart_dropdown_t")[0].offsetWidth + 128;
    dropDownSymbolsNW += dropDownSettingsW;
    periodsVertNW += dropDownSettingsW;
    periodsHorzNW += dropDownSettingsW;
    showIndicNW += dropDownSettingsW;
    showToolsNW += dropDownSettingsW;
    selectThemeNW += dropDownSettingsW;
    if (width < periodsHorzNW) {
        domElemCache.append(periodsHorz);
    } else {
        periodsVert.after(periodsHorz);
    }
    if (width < showIndicNW) {
        domElemCache.append(showIndic);
        rowIndic.style.display = "";
    } else {
        dropDownSettings.before(showIndic);
        rowIndic.style.display = "none";
    }
    if (width < showToolsNW) {
        domElemCache.append(showTools);
        rowTools.style.display = "";
    } else {
        dropDownSettings.before(showTools);
        rowTools.style.display = "none";
    }
    if (width < selectThemeNW) {
        domElemCache.append(selectTheme);
        rowTheme.style.display = "";
    } else {
        dropDownSettings.before(selectTheme);
        rowTheme.style.display = "none";
    }
    ChartManager.getInstance().redraw('All', true);
}
function mouseWheel(e, delta) {
    ChartManager.getInstance().scale(delta > 0 ? 1 : -1);
    ChartManager.getInstance().redraw("All", true);
    return false;
}
function switch_theme(name) {
    $('#chart_toolbar_theme a').removeClass('selected');
    $('#chart_select_theme a').removeClass('selected');
    if (name == 'dark') {
        $('#chart_toolbar_theme').find('a').each(function(){
            if ($(this).attr('name') == 'dark') {
                $(this).addClass('selected');
            }
        });
        $('#chart_select_theme a').each(function(){
            if ($(this).attr('name') == 'dark') {
                $(this).addClass('selected');
            }
        });
        $('#chart_container').attr('class', 'dark');
        $('#kline_logo').removeClass('kline_logo_weight');
        $('#kline_logo').addClass('kline_logo_black');
        ChartManager.getInstance().setThemeName('frame0', 'Dark');
        var tmp = ChartSettings.get();
        tmp.theme = 'Dark';
        ChartSettings.save();
        $('#chart_canvasGroup').removeClass("chart_canvasGroup_whiteLogo");
        $('#chart_canvasGroup').addClass("chart_canvasGroup_blackLogo");
    } else if (name == 'light') {
        $('#chart_toolbar_theme').find('a').each(function() {
            if ($(this).attr('name') == 'light') {
                $(this).addClass('selected');
            }
        });
        $('#chart_select_theme a').each(function(){
            if ($(this).attr('name') == 'light') {
                $(this).addClass('selected');
            }
        });
        $('#chart_container').attr('class', 'light');
        $('#kline_logo').removeClass('kline_logo_black');
        $('#kline_logo').addClass('kline_logo_weight');

        ChartManager.getInstance().setThemeName('frame0', 'Light');
        var tmp = ChartSettings.get();
        tmp.theme = 'Light';
        ChartSettings.save();
        $('#chart_canvasGroup').removeClass("chart_canvasGroup_blackLogo");
        $('#chart_canvasGroup').addClass("chart_canvasGroup_whiteLogo");
    }
    var a = {};
    a.command = "set current theme";
    a.content = name;
    $('#chart_output_interface_text').val(JSON.stringify(a));
    $('#chart_output_interface_submit').submit();
    window._current_theme_change.raise(name);
    ChartManager.getInstance().redraw();
}
function switch_tools(name) {
    $(".chart_dropdown_data").removeClass("chart_dropdown-hover");
    $("#chart_toolpanel .chart_toolpanel_button").removeClass("selected");
    $('#chart_enable_tools a').removeClass('selected');
    if (name == 'on') {
        $('#chart_show_tools').addClass('selected');
        $('#chart_enable_tools a').each(function(){
            if ($(this).attr('name') == 'on') {
                $(this).addClass('selected');
            }
        });
        $('#chart_toolpanel')[0].style.display = 'inline';
        if (ChartManager.getInstance()._drawingTool == ChartManager.DrawingTool.Cursor) {
            $('#chart_Cursor').parent().addClass('selected');
        } else if (ChartManager.getInstance()._drawingTool == ChartManager.DrawingTool.CrossCursor) {
            $('#chart_CrossCursor').parent().addClass('selected');
        }
    } else if (name == 'off') {
        $('#chart_show_tools').removeClass('selected');
        $('#chart_enable_tools a').each(function(){
            if ($(this).attr('name') == 'off') {
                $(this).addClass('selected');
            }
        });
        $('#chart_toolpanel')[0].style.display = 'none';
        ChartManager.getInstance().setRunningMode(ChartManager.getInstance()._beforeDrawingTool);
        ChartManager.getInstance().redraw("All", true);
    }
    on_size();
}
function switch_indic(name) {
    $('#chart_enable_indicator a').removeClass('selected');
    if (name == 'on') {
        $('#chart_enable_indicator a').each(function(){
            if ($(this).attr('name') == 'on') {
                $(this).addClass('selected');
            }
        });
        $('#chart_show_indicator').addClass('selected');
        var tmp = ChartSettings.get();
        tmp.charts.indicsStatus = 'open';
        ChartSettings.save();
        var value = tmp.charts.indics[1];
        if (Template.displayVolume == false)
            ChartManager.getInstance().getChart().setIndicator(2, value);
        else
            ChartManager.getInstance().getChart().setIndicator(2, value);
        $("#chart_tabbar").find('a').each(function(){
            if ($(this).attr('name') == value)
                $(this).addClass('selected');
        });
        $('#chart_tabbar')[0].style.display = 'block';
    } else if (name == 'off') {
        $('#chart_enable_indicator a').each(function(){
            if ($(this).attr('name') == 'off') {
                $(this).addClass('selected');
            }
        });
        $('#chart_show_indicator').removeClass('selected');
        ChartManager.getInstance().getChart().setIndicator(2, 'NONE');
        var tmp = ChartSettings.get();
        tmp.charts.indicsStatus = 'close';
        ChartSettings.save();
        $('#chart_tabbar')[0].style.display = 'none';
        $("#chart_tabbar a").removeClass("selected");
    }
    on_size();
}
function switch_period(name) {
    $("#chart_container .chart_toolbar_tabgroup a").removeClass("selected");
    $("#chart_toolbar_periods_vert ul a").removeClass("selected");
    $("#chart_container .chart_toolbar_tabgroup a").each(function(){
        if ($(this).parent().attr('name') == name) {
            $(this).addClass('selected');
        }
    });
    $("#chart_toolbar_periods_vert ul a").each(function(){
        if ($(this).parent().attr('name') == name) {
            $(this).addClass('selected');
        }
    });
    ChartManager.getInstance().showCursor();
    calcPeriodWeight(name);
    if (name == 'line') {
        ChartManager.getInstance().getChart().strIsLine = true;
        ChartManager.getInstance().setChartStyle('frame0.k0','Line');
        ChartManager.getInstance().getChart().setCurrentPeriod('01m');
        var settings = ChartSettings.get();
        settings.charts.period = name;
        ChartSettings.save();
        return;
    }
    ChartManager.getInstance().getChart().strIsLine = false;
    var p = GLOBAL_VAR.tagMapPeriod[name];
    ChartManager.getInstance().setChartStyle('frame0.k0', ChartSettings.get().charts.chartStyle);
    ChartManager.getInstance().getChart().setCurrentPeriod(p);
    var settings = ChartSettings.get();
    settings.charts.period = name;
    ChartSettings.save();
    ChartManager.getInstance().redraw("All",true);
}
function IsSupportedBrowers() {
    function isCanvasSupported(){
        var elem = document.createElement('canvas');
        return !!(elem.getContext && elem.getContext('2d'));
    }
    if (!isCanvasSupported())
        return false;
    return true;
}
function calcPeriodWeight(period) {
    var index = period;
    if (period != 'line')
        index = GLOBAL_VAR.periodMap[GLOBAL_VAR.tagMapPeriod[period]];
    var period_weight = ChartSettings.get().charts.period_weight;
    for (var i in period_weight) {
        if (period_weight[i] > period_weight[index]) {
            period_weight[i] -= 1;
        }
    }
    period_weight[index] = 8;
    ChartSettings.save();
    $('#chart_toolbar_periods_horz').find('li').each(function() {
        var a = $(this).attr('name');
        var i = a;
        if (a != 'line')
            i = GLOBAL_VAR.periodMap[GLOBAL_VAR.tagMapPeriod[a]];
        if (period_weight[i] == 0) {
            $(this).css('display', 'none');
        } else {
            $(this).css('display', 'inline-block');
        }
    });
}
