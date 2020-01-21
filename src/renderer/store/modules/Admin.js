import fs from 'fs'
import appSettings from '../../appSettings'
import uuidv4 from 'uuid/v4'
import { remote } from 'electron'
import { Log } from '../../services/dataService'

const state = {
  isLoaded: false,
  name: null,
  roomTypes: null,
  floors: null,
  rooms: null,
  services: null,
  checkInForm: null,
  checkOutForm: null
}
const mutations = {
  LOAD (state, payload) {
    for (const key of Object.keys(payload)) {
      state[key] = payload[key]
    }
    state.isLoaded = true
  },
  UPDATE_SERVICE (state, { serviceName, propName, propValue }) {
    state.services.find(x => x.name === serviceName)[propName] = propValue
  },
  ADD_EMPTY_SERVICE () {
    state.services.push({ _rowVariant: 'success', name: uuidv4(), show_details: true, inactive: false, displayName: 'DỊCH VỤ MỚI', cost: 10000, imagePath: '', sort: 0, groupDisplayName: 'NHÓM MỚI THÊM' })
  },
  UPDATE_ROOM (state, { roomName, propName, propValue }) {
    state.rooms.find(x => x.name === roomName)[propName] = propValue
  },
  ADD_EMPTY_ROOM (state) {
    state.rooms.push({ isNew: true, _rowVariant: 'success', name: uuidv4(), displayName: 'PHÒNG MỚI', floorDisplayName: 'TẦNG MỚI', sort: 0 })
  }
}

const actions = {
  loadHotelJson ({ commit }) {
    const data = JSON.parse(fs.readFileSync(appSettings.userDataPath + 'hotel.json', 'UTF-8'))
    data.floors.sort((a, b) => ((a.sort + '' + a.displayName) < (b.sort + '' + b.displayName)) ? -1 : 1)
    for (const floor of data.floors) {
      floor.rooms.sort((a, b) => (a.sort + '' + a.displayName) < (b.sort + '' + b.displayName) ? -1 : 1)
    }
    data.rooms = data.floors.reduce((l, e) => [...l, ...e.rooms.map(t => ({show_details: false, inactive: t.inactive || false, name: t.name, displayName: t.displayName, sort: t.sort, floorDisplayName: e.displayName}))], [])
    data.services = data.services.reduce((l, e) => [...l, ...e.items.map(t => ({show_details: false, inactive: t.inactive || false, name: t.name, displayName: t.displayName, cost: t.cost, imagePath: t.imagePath, sort: t.sort, groupDisplayName: e.displayName}))], [])

    commit('LOAD', data)
  },
  async saveHotelJson ({ state, commit }) {
    var newFloorData = state.rooms.reduce((l, room) => {
      var floor = l.find(x => x.displayName === room.floorDisplayName)
      if (!floor) {
        floor = { name: uuidv4(), displayName: room.floorDisplayName, sort: 0, rooms: [] }
        l.push(floor)
      }

      floor.rooms.push({ name: room.name, displayName: room.displayName, sort: room.sort, inactive: room.inactive || false })
      return l
    }, [])

    const data = JSON.parse(fs.readFileSync(appSettings.userDataPath + 'hotel.json', 'UTF-8'))
    data.floors = newFloorData
    fs.writeFileSync(appSettings.userDataPath + 'hotel.json', JSON.stringify(data, null, 2))

    let options = {
      buttons: ['Đồng ý'],
      message: 'Yêu cầu khởi động lại chương trình!'
    }
    await Log('admin', 'Admin chỉnh sửa phòng')
    await remote.dialog.showMessageBox(options)
    remote.app.exit()
  },
  async saveServiceJson ({ state, commit }) {
    var newData = state.services.reduce((l, service) => {
      var group = l.find(x => x.displayName === service.groupDisplayName)
      if (!group) {
        group = { name: uuidv4(), displayName: service.groupDisplayName, sort: 0, items: [] }
        l.push(group)
      }

      group.items.push({ name: service.name, displayName: service.displayName, sort: service.sort, cost: service.cost, imagePath: service.imagePath, inactive: service.inactive || false })
      return l
    }, [])

    const data = JSON.parse(fs.readFileSync(appSettings.userDataPath + 'hotel.json', 'UTF-8'))
    data.services = newData
    fs.writeFileSync(appSettings.userDataPath + 'hotel.json', JSON.stringify(data, null, 2))

    let options = {
      buttons: ['Đồng ý'],
      message: 'Yêu cầu khởi động lại chương trình!'
    }
    await Log('admin', 'Admin chỉnh sửa giá dịch vụ/ dịch vụ')
    await remote.dialog.showMessageBox(options)
    remote.app.exit()
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
