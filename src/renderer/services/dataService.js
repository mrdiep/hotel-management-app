import appSettings from '../appSettings'
import moment from 'moment'

function serialize () {
  return new Promise((resolve, reject) => {
    var sqlite3 = require('sqlite3').verbose()
    var db = new sqlite3.Database(appSettings.userDataPath + 'database.db')
    db.serialize(function () {
      resolve(db)
    })
  })
}

export async function CheckIn ({ roomName, checkInTime, customerName, customerIdText, customerNote, roomTypeId, roomStateId, rentTypeId, note, serviceItems }) {
  var db = await serialize()

  db.run('DELETE FROM checkin WHERE roomName="' + roomName + '"')
  db.run('DELETE FROM checkin_services WHERE roomName="' + roomName + '"')

  var stmt = db.prepare('INSERT INTO checkin(roomName, checkInTime, customerName, customerIdText, customerNote, roomTypeId, roomStateId, rentTypeId, note) VALUES (?,?,?,?,?,?,?,?,?)')
  stmt.run([roomName, checkInTime, customerName, customerIdText, customerNote, roomTypeId, roomStateId, rentTypeId, note])
  stmt.finalize()

  var stmtService = db.prepare('INSERT INTO checkin_services(roomName, itemName, count) VALUES (?,?,?)')
  for (var item of serviceItems) {
    stmtService.run([roomName, item.name, item.number])
  }
  stmtService.finalize()

  db.close()
}

export async function Log (section, message) {
  var db = await serialize()
  var stmt = db.prepare('INSERT INTO log(`when`, `whenInText`, `section`, `message`) VALUES (?,?,?,?)')
  stmt.run([Math.floor(new Date().getTime() / 1000), moment(new Date()).format('YYYY-MM-DD HH:mm'), section, message])
  stmt.finalize()
  db.close()
}

export async function CheckOut ({ RoomId, RoomName, CheckInTime, CheckInTimeText, CheckOutTime, CheckOutTimeText, CheckInNote, CustomerName, CustomerIdText, CustomerNote, RoomTypeId, RoomStateId, RentTypeId, RoomTypeName, RoomStateName, RentTypeName, RentCost, OriginRentCost, UpdatedRentCostNote, ServiceCost, TotalCost, CheckOutNote, ServiceSummary, deleteRequest }) {
  var db = await serialize()

  db.run('DELETE FROM checkin WHERE roomName="' + RoomId + '"')
  db.run('DELETE FROM checkin_services WHERE roomName="' + RoomId + '"')

  var stmt = db.prepare('INSERT INTO history(RoomId,RoomName,CheckInTime, CheckInTimeText, CheckOutTime, CheckOutTimeText, CheckInNote, CustomerName,CustomerIdText,CustomerNote,RoomTypeId,RoomStateId,RentTypeId,RoomTypeName,RoomStateName,RentTypeName,RentCost,OriginRentCost,UpdatedRentCostNote,ServiceCost, ServiceSummary, TotalCost, CheckOutNote, IsUserDeleted) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
  stmt.run([RoomId, RoomName, CheckInTime, CheckInTimeText, CheckOutTime, CheckOutTimeText, CheckInNote, CustomerName, CustomerIdText, CustomerNote, RoomTypeId, RoomStateId, RentTypeId, RoomTypeName, RoomStateName, RentTypeName, RentCost, OriginRentCost, UpdatedRentCostNote, ServiceCost, ServiceSummary, TotalCost, CheckOutNote, deleteRequest ? 1 : 0])
  stmt.finalize()

  db.close()
}

export function FetchCheckInList () {
  return new Promise((resolve, reject) => {
    serialize().then(db => {
      db.all('select * from checkIn', function (err, rows) {
        db.close()
        if (!err) {
          resolve(rows)
        }
      })
    }).catch(err => {
      console.error(err)
    })
  })
}

export function FetchCheckInServiceList () {
  return new Promise((resolve, reject) => {
    serialize().then(db => {
      db.all('select * from checkin_services', function (err, rows) {
        db.close()
        if (!err) {
          resolve(rows)
        }
      })
    }).catch(err => {
      console.error(err)
    })
  })
}

export function FetchLastCheckout (roomName) {
  return new Promise((resolve, reject) => {
    serialize().then(db => {
      db.all('select * from history where RoomId=? order by CheckOutTime desc limit 1', [roomName], function (err, rows) {
        db.close()
        if (!err) {
          resolve(rows)
        }
      })
    }).catch(err => {
      console.error(err)
    })
  })
}

export async function ChangeRoom (fromRoomName, toRoomName) {
  var db = await serialize()
  db.run('UPDATE checkin set roomName="' + toRoomName + '" WHERE roomName="' + fromRoomName + '"')
  db.run('UPDATE checkin_services set roomName="' + toRoomName + '" WHERE roomName="' + fromRoomName + '"')
  db.close()
}

export function LoadHistory ({fromDate, toDate, roomName}) {
  return new Promise((resolve, reject) => {
    serialize().then(db => {
      console.log('filter from ', fromDate.format('DD/MM/YYYYY HH:mm'), ' to ', toDate.format('DD/MM/YYYYY HH:mm'))
      db.all('select * from history where ? <= checkouttime and checkouttime <= ?  order by checkouttime desc', [fromDate.unix(), toDate.unix()], function (err, rows) {
        db.close()
        if (!err) {
          resolve(rows)
        }
      })
    }).catch(err => {
      console.error(err)
    })
  })
}

export function LoadLogs (index, pageSize) {
  return new Promise((resolve, reject) => {
    serialize().then(db => {
      db.all('select * from log where section <> "global" order by `when` desc limit ' + pageSize + ' offset ' + (index * pageSize), function (err, rows) {
        db.close()
        if (!err) {
          resolve(rows)
        }
      })
    }).catch(err => {
      console.error(err)
    })
  })
}
