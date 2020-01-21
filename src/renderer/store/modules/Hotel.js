import fs from 'fs'
import moment from 'moment'
import { Log, CheckIn, CheckOut, FetchCheckInList, FetchCheckInServiceList, FetchLastCheckout, ChangeRoom } from '../../services/dataService'
import appSettings from '../../appSettings'
import * as Calculate from '../../services/costCalculatorService'

async function loadState () {
  await Log('global', 'Chạy chương trình')
  const data = JSON.parse(fs.readFileSync(appSettings.userDataPath + 'hotel.json', 'UTF-8'))
  const checkInList = await FetchCheckInList()
  const checkInServices = await FetchCheckInServiceList()
  data.floors.sort((a, b) => ((a.sort + '' + a.displayName) < (b.sort + '' + b.displayName)) ? -1 : 1)
  for (const floor of data.floors) {
    floor.rooms = floor.rooms.filter(x => !x.inactive)
    floor.rooms = floor.rooms.sort((a, b) => (a.sort + '' + a.displayName) < (b.sort + '' + b.displayName) ? -1 : 1)
    for (const room of floor.rooms) {
      room.runtimeStyle = { variant: 'outline-primary' }
      room.roomType = data.roomTypes[0]
      room.rent = null
      room.roomState = data.roomStates[0]
      const checkInData = checkInList.find(x => x.roomName === room.name)

      if (!checkInData) {
        var lastData = (await FetchLastCheckout(room.name) || []).pop()
        if (lastData) {
          room.lastHistoryDescription = 'Lần cuối khách trả phòng ' + lastData.RentTypeName + ' cách đây ' + moment(lastData.CheckOutTime * 1000).fromNow()
        }
      }
      if (checkInData) {
        const roomServices = checkInServices.filter(x => x.roomName === room.name)

        let serviceItems = []
        for (const roomService of roomServices) {
          const sellItem = data.services.filter(x => x.items.some(t => t.name === roomService.itemName))[0].items.filter(x => x.name === roomService.itemName)[0]
          serviceItems.push({ ...sellItem, number: roomService.count, total: roomService.count * sellItem.cost })
        }

        room.roomType = data.roomTypes.find(x => x.name === checkInData.roomTypeId)
        room.roomState = data.roomStates.find(x => x.name === checkInData.roomStateId)
        room.rent = {
          rentCost: 0,
          checkInTime: moment(new Date(checkInData.checkInTime * 1000)),
          rentType: data.rentTypes.find(x => x.name === checkInData.rentTypeId),
          customerName: checkInData.customerName,
          customerIdText: checkInData.customerIdText,
          customerNote: checkInData.customerNote,
          note: checkInData.note,
          totalService: serviceItems.reduce((l, e) => l + e.total, 0),
          serviceItems: serviceItems
        }
        room.roomState = data.roomStates.find(x => x.name === checkInData.roomStateId)
      }
    }
  }

  return data
}
const state = {
  isLoaded: false,
  name: null,
  roomTypes: null,
  floors: null,
  services: null,
  checkInForm: null,
  checkOutForm: null
}
const getters = {
  checkInInfo: state => {
    var keys = Object.keys(state.checkInForm.services)
    var serviceItems = []
    for (var key of keys) {
      var number = state.checkInForm.services[key]
      if (number > 0) {
        var sellItem = state.services.filter(x => x.items.some(t => t.name === key))[0].items.filter(x => x.name === key)[0]
        serviceItems.push({ ...sellItem, number: number, total: number * sellItem.cost })
      }
    }

    var form = state.checkInForm.form

    var roomState = state.roomStates[1]
    var roomType = state.roomTypes.find(x => x.name === form.roomTypeIdSelected)
    var rent = {
      checkInTime: form.checkInTime,
      rentCost: 0,
      rentType: state.rentTypes.find(x => x.name === form.rentTypeIdSelected),
      customerName: form.customerName,
      customerIdText: form.customerIdText,
      note: form.note,
      totalService: serviceItems.reduce((l, e) => l + e.total, 0),
      serviceItems: serviceItems
    }

    return {
      roomName: state.checkInForm.room.name,
      isNewCheckIn: !state.checkInForm.room.rent,
      roomDisplayName: state.checkInForm.room.displayName,
      rent,
      roomState,
      roomType
    }
  }
}
const mutations = {
  INIT_CHECKIN (state, roomName) {
    for (const floor of state.floors) {
      for (const room of floor.rooms) {
        if (room.name === roomName) {
          state.checkInForm = {
            title: 'NHẬN',
            buttonCheckinTitle: 'NHẬN PHÒNG',
            room: room,
            form: {
              rentTypeIdSelected: '1',
              roomTypeIdSelected: '1',
              customerName: '',
              customerIdText: '',
              note: '',
              checkInTime: moment(),
              newHourSelected: 0
            },
            services: state.services.reduce((l, e) => {
              l = [...l, ...e.items]
              return l
            }, []).map(x => x.name).reduce((l, e) => {
              l[e] = 0
              return l
            }, {})
          }

          return
        }
      }
    }
  },
  INIT_UPDATE_CHECKIN (state, roomName) {
    for (const floor of state.floors) {
      for (const room of floor.rooms) {
        if (room.name === roomName) {
          state.checkInForm = {
            title: 'SỬA THUÊ',
            buttonCheckinTitle: 'CẬP NHẬT',
            room: room,
            form: {
              rentTypeIdSelected: room.rent.rentType.name,
              roomTypeIdSelected: room.roomType.name,
              customerName: room.rent.customerName,
              customerIdText: room.rent.customerIdText,
              note: room.rent.note,
              checkInTime: moment(new Date(room.rent.checkInTime.unix() * 1000))
            },
            services: state.services.reduce((l, e) => {
              l = [...l, ...e.items]
              return l
            }, []).map(x => x.name).reduce((l, e) => {
              l[e] = 0
              return l
            }, {})
          }

          for (const serviceItem of room.rent.serviceItems) {
            state.checkInForm.services[serviceItem.name] = serviceItem.number
          }

          return
        }
      }
    }
  },
  ADD_CURRENT_CHECKIN_FORM (state, checkInInfo) {
    var room = state.checkInForm.room
    room.roomState = checkInInfo.roomState
    room.roomType = checkInInfo.roomType
    room.rent = { ...checkInInfo.rent }
    state.checkInForm = null
  },
  UPDATE_CHECKIN_FORM (state, {propName, propValue}) {
    state.checkInForm.form[propName] = propValue
  },
  UPDATE_CHECKOUT_FORM (state, {propName, propValue}) {
    state.checkOutForm[propName] = propValue
    const room = state.checkOutForm.room

    state.checkOutForm.listInfo = [
      {key: 'LOẠI THUÊ', value: room.rent.rentType.displayName},
      {key: 'LOẠI PHÒNG', value: room.roomType.displayName},
      {key: 'NHẬN PHÒNG LÚC', value: room.rent.checkInTime.calendar() + ' (' + room.rent.checkInTime.fromNow() + ')'},
      {key: 'KHÁCH', value: room.rent.customerName},
      {key: 'GHI CHÚ', value: room.rent.note},
      {key: 'DỊCH VỤ SỬ DỤNG', isShowDetailService: true, value: state.checkOutForm.serviceCost.toLocaleString() + 'đ'},
      {key: 'TIỀN PHÒNG', value: state.checkOutForm.rentCost.toLocaleString() + 'đ', showEditRentCost: true},
      {key: 'TỔNG', value: (state.checkOutForm.rentCost + state.checkOutForm.serviceCost).toLocaleString() + 'đ'}
    ]
  },
  CANCEL_CURRENT_CHECKIN (state, roomName) {
    for (const floor of state.floors) {
      for (const room of floor.rooms) {
        if (room.name === roomName) {
          room.rent = null
          room.roomState = state.roomStates[0]
          state.checkInForm = null
          return
        }
      }
    }
  },
  CHANGE_ROOM (state, {fromRoomName, toRoomName}) {
    var fromRoom = state.floors.find(x => x.rooms.some(t => t.name === fromRoomName)).rooms.find(x => x.name === fromRoomName)
    var toRoom = state.floors.find(x => x.rooms.some(t => t.name === toRoomName)).rooms.find(x => x.name === toRoomName)

    toRoom.roomState = fromRoom.roomState
    toRoom.roomType = fromRoom.roomType
    toRoom.rent = { ...fromRoom.rent }

    fromRoom.rent = null
    fromRoom.roomState = state.roomStates[0]
    fromRoom.roomType = state.roomTypes[0]
  },
  INIT_CHECKOUT (state, { roomName, deleteRequest }) {
    for (const floor of state.floors) {
      for (const room of floor.rooms) {
        if (room.name === roomName) {
          var rentCost = room.rent.rentCost || 0
          var serviceCost = room.rent.totalService || 0
          state.checkOutForm = {
            title: deleteRequest ? 'XÓA' : 'TRẢ',
            buttonTitle: deleteRequest ? 'XÓA PHÒNG' : 'TRẢ PHÒNG',
            deleteRequest,
            room: room,
            rent: room.rent,
            newRentCost: 0,
            rentCost,
            originRentCost: rentCost,
            serviceCost,
            rentCostChangedNote: '',
            isUserChangeRentCost: false,
            checkOutTime: moment(new Date()),
            checkOutNote: '',
            listInfo: [
              {key: 'LOẠI THUÊ', value: room.rent.rentType.displayName},
              {key: 'LOẠI PHÒNG', value: room.roomType.displayName},
              {key: 'NHẬN PHÒNG LÚC', isShowEditCheckoutTime: true, value: (room.rent.checkInTime.calendar() + ' (' + room.rent.checkInTime.fromNow() + ')').toUpperCase()},
              {key: 'KHÁCH', value: room.rent.customerName},
              {key: 'GHI CHÚ', value: room.rent.note},
              {key: 'DỊCH VỤ SỬ DỤNG', isShowDetailService: true, value: serviceCost.toLocaleString() + 'đ'},
              {key: 'TIỀN PHÒNG', value: rentCost.toLocaleString() + 'đ', showEditRentCost: true},
              {key: 'TỔNG', value: (rentCost + serviceCost).toLocaleString() + 'đ'}
            ]
          }

          return
        }
      }
    }
  },
  UPDATE_HISTORY_DESCRIPTION (state, {roomName, value}) {
    for (const floor of state.floors) {
      for (const room of floor.rooms) {
        if (room.name === roomName) {
          room.lastHistoryDescription = value
        }
      }
    }
  },
  CANCEL_CURRENT_CHECKOUT (state) { },
  CHECKOUT (state, roomName) {
    const room = state.floors.find(x => x.rooms.some(r => r.name === roomName)).rooms.find(x => x.name === roomName)
    room.checkOutForm = null
    room.checkInForm = null
    room.rent = null
    room.roomState = state.roomStates[0]
    room.roomType = state.roomTypes[0]
  },
  LOAD (state, payload) {
    for (const key of Object.keys(payload)) {
      state[key] = payload[key]
    }
    state.isLoaded = true
  },
  BUY_ITEM (state, itemName) {
    var counter = state.checkInForm.services[itemName] || 0
    state.checkInForm.services[itemName] = counter + 1
  },
  REMOVE_BUY_ITEM (state, itemName) {
    var counter = state.checkInForm.services[itemName] || 0
    if (counter > 0) {
      state.checkInForm.services[itemName] = counter - 1
    }
  },
  UPDATE_CHECKIN_TIME (state, { roomName }) {
    for (const floor of state.floors) {
      for (const room of floor.rooms) {
        if (room.name === roomName) {
          room.rent.rentCost = Calculate.calculateRentCost(room.rent.checkInTime.toDate(), new Date(), room.rent.rentType.name, room.roomType.name, room.roomType.costCalculator)
          room.rent.checkInTime = moment(room.rent.checkInTime)
        }
      }
    }
  }
}

const actions = {
  async loadHotelInfo ({ commit, dispatch }) {
    commit('LOAD', await loadState())
    dispatch('calculateRentCost')
  },
  async doCheckIn ({commit, getters}) {
    var checkInInfo = getters.checkInInfo
    var checkInData = {
      roomName: checkInInfo.roomName,
      checkInTime: checkInInfo.rent.checkInTime.unix(),
      customerName: checkInInfo.rent.customerName,
      customerIdText: checkInInfo.rent.customerIdText,
      customerNote: checkInInfo.rent.customerNote,
      roomTypeId: checkInInfo.roomType.name,
      roomStateId: checkInInfo.roomState.name,
      rentTypeId: checkInInfo.rent.rentType.name,
      note: checkInInfo.rent.note,
      serviceItems: checkInInfo.rent.serviceItems
    }
    await CheckIn(checkInData)
    await Log('check_in', `${checkInInfo.isNewCheckIn ? 'Nhận phòng' : 'Cập nhật'} '${checkInInfo.roomDisplayName}' (${checkInInfo.roomType.displayName}) lúc ${checkInInfo.rent.checkInTime.format('HH:mm DD/MM/YYYY')}, loại '${checkInInfo.rent.rentType.displayName}'${checkInInfo.rent.customerName ? (', đăng kí tên khách: ' + checkInInfo.rent.customerName) : ''} ${checkInInfo.rent.serviceItems && checkInInfo.rent.serviceItems.length ? '.  Khách mua: ' + checkInInfo.rent.serviceItems.map(x => ' x' + x.number + ' ' + x.displayName).join(', ') : ''}`)
    commit('ADD_CURRENT_CHECKIN_FORM', checkInInfo)
  },
  initCheckIn ({commit, state}, { roomName }) {
    const room = state.floors.find(x => x.rooms.some(r => r.name === roomName)).rooms.find(x => x.name === roomName)
    if (room.rent === null) {
      commit('INIT_CHECKIN', roomName)
    } else {
      commit('INIT_UPDATE_CHECKIN', roomName)
    }
  },
  initCheckOut ({commit, state}, {roomName, deleteRequest}) {
    const room = state.floors.find(x => x.rooms.some(r => r.name === roomName)).rooms.find(x => x.name === roomName)
    if (room.rent !== null) {
      commit('INIT_CHECKOUT', {roomName, deleteRequest})
    }
  },
  async doCheckOut ({commit, getters, state}) {
    const room = state.checkOutForm.room
    var checkoutData = {
      RoomId: room.name,
      RoomName: room.displayName,
      CheckInTime: room.rent.checkInTime.unix(),
      CheckInTimeText: room.rent.checkInTime.format('DD/MM/YYYY HH:mm'),
      CheckOutTime: state.checkOutForm.checkOutTime.unix(),
      CheckOutTimeText: state.checkOutForm.checkOutTime.format('DD/MM/YYYY HH:mm'),
      CustomerName: room.rent.customerName,
      CustomerIdText: room.rent.customerIdText,
      CustomerNote: room.rent.customerNote,
      CheckInNote: room.rent.note,
      RoomTypeId: room.roomType.name,
      RoomStateId: room.roomState.name,
      RentTypeId: room.rent.rentType.name,
      RoomTypeName: room.roomType.displayName,
      RoomStateName: room.roomState.displayName,
      RentTypeName: room.rent.rentType.displayName,
      RentCost: state.checkOutForm.isUserChangeRentCost ? state.checkOutForm.newRentCost : state.checkOutForm.rentCost,
      OriginRentCost: state.checkOutForm.originRentCost,
      UpdatedRentCostNote: state.checkOutForm.isUserChangeRentCost ? state.checkOutForm.rentCostChangedNote : '',
      ServiceCost: room.rent.totalService,
      ServiceSummary: JSON.stringify(state.checkOutForm.rent.serviceItems.map(x => { return { serviceId: x.name, serviceName: x.displayName, cost: x.cost, buyNumber: x.number, total: x.total } })),
      TotalCost: state.checkOutForm.rentCost + room.rent.totalService,
      deleteRequest: state.checkOutForm.deleteRequest,
      CheckOutNote: state.checkOutForm.checkOutNote
    }
    await CheckOut(checkoutData)
    await Log('check_in', `Trả phòng '${room.displayName}' (${checkoutData.RoomTypeName}) lúc ${checkoutData.CheckOutTimeText}, vào lúc ${checkoutData.CheckInTimeText}, loại '${checkoutData.RentTypeName}'. Tổng khách trả: ${checkoutData.TotalCost.toLocaleString()}đ, tiền phòng ${checkoutData.RentCost.toLocaleString()}đ'${!checkoutData.CustomerName ? '' : ('. Đăng kí tên khách: ' + checkoutData.CustomerName)}${(state.checkOutForm.rent.serviceItems && state.checkOutForm.rent.serviceItems.length) ? ('.  Khách mua: ' + state.checkOutForm.rent.serviceItems.map(x => ' x' + x.number + ' ' + x.displayName + '(' + x.total.toLocaleString() + 'đ)').join(', ')) : ''} `)
    commit('CHECKOUT', room.name)
  },
  async calculateRentCost ({state, commit}) {
    console.log('interval runner')
    for (const floor of state.floors) {
      for (const room of floor.rooms) {
        if (room.rent !== null) {
          console.log('update room: ' + room.displayName)
          commit('UPDATE_CHECKIN_TIME', { roomName: room.name })
        } else {
          console.log('update last data')
          var lastData = (await FetchLastCheckout(room.name) || []).pop()
          if (lastData) {
            var value = 'Lần cuối khách trả phòng ' + lastData.RentTypeName + ' cách đây ' + moment(lastData.CheckOutTime * 1000).fromNow()
            commit('UPDATE_HISTORY_DESCRIPTION', { roomName: room.name, value: value })
          }
        }
      }
    }
  },
  async changeRoom ({ commit }, { fromRoomName, toRoomName }) {
    await ChangeRoom(fromRoomName, toRoomName)
    await commit('CHANGE_ROOM', {fromRoomName, toRoomName})

    var r1, r2
    for (const floor of state.floors) {
      for (const room of floor.rooms) {
        if (room.name === fromRoomName) {
          r1 = room.displayName
        }
        if (room.name === toRoomName) {
          r2 = room.displayName
        }
      }
    }

    await Log('check_in', `Đổi phòng '${r1}' sang phòng '${r2}'`)
  },
  calculateNewRentCost ({state, commit}, value) {
    commit('UPDATE_CHECKOUT_FORM', { propName: 'isUserChangeRentCost', propValue: true })
    commit('UPDATE_CHECKOUT_FORM', { propName: 'rentCost', propValue: state.checkOutForm.newRentCost })
  },
  cancelCheckIn ({commit}) {
    commit('CANCEL_CURRENT_CHECKIN')
  },
  cancelCheckOut ({commit}) {
    commit('CANCEL_CURRENT_CHECKOUT')
  },
  removeBuy ({commit}, itemName) {
    commit('REMOVE_BUY_ITEM', itemName)
  },
  buy ({commit}, itemName) {
    commit('BUY_ITEM', itemName)
  },
  getHistory ({commit}, {fromDate, toDate, roomName}) {
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
