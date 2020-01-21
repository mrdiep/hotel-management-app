import fs from 'fs'
import appSettings from '../appSettings'

export function calculateRentCost (timeIn, timeOut, type, roomType, settings) {
  var costFunction = fs.readFileSync(appSettings.userDataPath + '\\cost_function.js', 'UTF-8')
  var wrap = s => '{ return ' + s + ' };'

  /* eslint no-new-func: off */
  var func = new Function(wrap(costFunction))

  /* eslint no-useless-call: off */
  var cost = func.call(null).call(null, timeIn, timeOut, type, roomType, settings) // invoke the function using arguments
  return cost
}
