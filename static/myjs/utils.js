/*
Utility functions:
*/

function myRound(number, precision) {
  var shift = function (number, precision, reverseShift) {
    if (reverseShift) {
      precision = -precision;
    }
    var numArray = ("" + number).split("e");
    return +(numArray[0] + "e" + (numArray[1] ? (+numArray[1] + precision) : precision));
  };
  return shift(Math.round(shift(number, precision, false)), precision, true);
}


Array.prototype.indexOf = function(obj, start) {
     for (var i = (start || 0), j = this.length; i < j; i++) {
         if (this[i] === obj) { return i; }
     }
     return -1;
}

String.prototype.is_in = function(list){
    return ( list.indexOf(this.toString()) != -1)
}

String.prototype.not_in = function(list){
    return ( list.indexOf(this.toString()) == -1)
}

Array.prototype.remove = function(val, all) {
    var i, new_array = this;
    if (all) {
        for(i = this.length; i--;){
            if (this[i][1] === val) new_array.splice(i, 1);
        }
    }
    else {  //same as before...
        i = this.indexOf(val);
        if(i>-1) new_array.splice(i, 1);
    }
    return new_array;
};

Array.prototype.replace = function(val,new_val, all) {
    var i, new_array = this;
    if (all) {
        for(i = this.length; i--;){
            if (this[i][1] === val) {
                new_array[i] = new_val;
            }
        }
    }
    else {  //same as before...
        i = this.indexOf(val);
        if(i>-1) new_array[i] = new_val;
    }
    return new_array;
};

Array.prototype.sum = function(){
    return this.reduce(function(a, b) { return a + b; }, 0);
}

Array.prototype.mean = function(){
    if (this.length == 0){
        return null;
    }
    var sm = this.reduce(function(a, b) { return a + b; }, 0);
    return myRound(sm / parseFloat(this.length), 4);
}

Array.prototype.median = function() {
    this.sort(function(a,b){
        return a-b;
    });

    if (this.length == 0) {
        return null;
    }
    var half = Math.floor(this.length / 2);

    if (this.length % 2) {
        return this[half];
    }else {
        return myRound((this[half - 1] + this[half]) / 2.0, 4);
    }
}

function compute_stat(val_list, stat){
    if (stat == 'none'){
        return val_list;
    }
    if (stat == 'sum'){
        return [myRound(val_list.sum(), 4)];
    }
    if (stat == 'mean'){
        return [myRound(val_list.mean(), 4)];
    }
    if (stat == 'median'){
        return [myRound(val_list.mean(), 4)];
    }
}

function arange(start, end, size){
    var arr = [],
        step = (end - start) / size,
        s =  start, e = end;
    while (s <= e){
        arr.push(s)
        s += step;
        if (s > e && s != e){
            arr.push(e)
        }
    }
    return arr
}
