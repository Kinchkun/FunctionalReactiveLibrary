class Cell<ValueType> {

  public get value(): ValueType { return this._value}
  public set value(newValue: ValueType) { this._value = newValue}

  constructor(private _value: ValueType) { }
}

function lift<T>(value: T): Cell<T>  {
  return new Cell(value);
}

function curry<VT1, VT2, RT>(vs: ValueStream<VT2>, binaryFn: (v1: VT1, v2: VT2) => RT): (v1: VT1) => RT {
    var unaryStream = vs.map(v2 => (v1: VT1) => binaryFn(v1, v2))
    return (v1: VT1) => unaryStream.value(v1);
}

function combine<VT1, VT2, RT>(vs1: ValueStream<VT1>, vs2: ValueStream<VT2>, accumulatorFn: (v1: VT1, v2: VT2) => RT): ValueStream<RT> {
  return vs1.map(curry(vs2, accumulatorFn));
}


// class UnidirectionalValueStream
// class BidirectionalValueStream

class ValueStream<ValueType> {

  constructor(private cell: Cell<ValueType>) { }

  public get value(): ValueType { return this.cell.value}
  public set value(newValue: ValueType) { this.cell.value = newValue}

  public map = <MappedValueType>(mapFn: (value: ValueType) => MappedValueType): ValueStream<MappedValueType> => {
    return new ValueStream(lift(mapFn(this.value)));
  }
}


// ====================================================
// primitves

var independenVar1 = new ValueStream(lift(1));
var independenVar2 = new ValueStream(lift(1));

var dependendVar = combine(independenVar1, independenVar2, (x,y) => x + y);


console.log(dependendVar.value);
independenVar1.value = 5;
console.log(dependendVar.value);
independenVar2.value = -5;
console.log(dependendVar.value);

// ====================================================
// complex

var independenObj1 = new ValueStream(lift({property: "value"}))
var dependendObj   = combine(independenObj1, dependendVar, (obj, val) => ({
  myProperty: obj.property.toUpperCase(),
  myAnotherProperty: val + 1
}));

console.log(dependendObj.value);
independenObj1.value = {property: "value", anotherProperty: "another value"}
console.log(dependendObj.value);
