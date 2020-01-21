var fs = require('fs');
var cost_function = fs.readFileSync('./cost_function.js', 'UTF-8');
var wrap = s => "{ return " + s + " };"
var func = new Function(wrap(cost_function));

var cost = func.call(null).call(null, new Date(2010, 1, 1, 0, 0, 0), new Date(2010, 1, 1, 5, 25, 0), '1', '1'); //invoke the function using arguments

console.log(cost)