<template>
  <b-container fluid id="wrapper">
    <div class="header">
      <h2>QUẢN LÝ PHÒNG</h2>
      <div class="footer2">
        <b-button v-on:click="saveHotelJson()" variant="primary">LƯU LẠI</b-button>
        <b-button class="cancel-btn" v-on:click="cancel()" variant="outline-primary">HỦY</b-button>
        <b-button v-on:click="openCost()" variant="primary">QUẢN LÝ GIÁ PHÒNG</b-button>
      </div>
    </div>
    <b-row class="body">
      <b-container>
        <b-table :items="rooms" :fields="fields" striped responsive="sm">
          <template v-slot:cell(show_details)="row">
            <b-button
              size="sm"
              variant="outline-info"
              @click="row.toggleDetails"
              class="mr-2"
            >SỬA PHÒNG</b-button>
          </template>

          <template v-slot:row-details="row">
            <b-card>
              <b-row class="mb-2">
                <b-col sm="3" class="text-sm-right">
                  <b>TÊN PHÒNG</b>
                </b-col>
                <b-col>
                  <b-form-input
                    :value="row.item.displayName"
                    @change="(e) => setFormData(row.item.name, 'displayName', e)"
                    type="text"
                    required
                  ></b-form-input>
                </b-col>
              </b-row>

              <b-row class="mb-2">
                <b-col sm="3" class="text-sm-right">
                  <b>TẦNG</b>
                </b-col>
                <b-col>
                  <b-form-input
                    :value="row.item.floorDisplayName"
                    @change="(e) => setFormData(row.item.name, 'floorDisplayName', e)"
                    type="text"
                    required
                  ></b-form-input>
                </b-col>
              </b-row>
              <b-row class="mb-2">
                <b-col sm="3" class="text-sm-right">
                  <b>THỨ TỰ</b>
                </b-col>
                <b-col>
                  <b-form-input
                    :value="row.item.sort"
                    @change="(e) => setFormData(row.item.name, 'sort', e)"
                    type="text"
                    required
                  ></b-form-input>
                </b-col>
              </b-row>
              <b-row class="mb-2">
                <b-col sm="3" class="text-sm-right">
                  <b></b>
                </b-col>
          <b-row class="mb-2">
            <b-col>
              <b>{{row.item.inactive ? 'ĐANG TẠM DỪNG HOẠT ĐỘNG': ''}}</b>
              <br/>
              <b-button v-show="!row.item.inactive" size="sm"  @click="(e) => setFormData(row.item.name, 'inactive', true)" variant="outline-danger" class="mr-2">
                DỪNG HOẠT ĐỘNG
              </b-button>
              <b-button v-show="row.item.inactive" size="sm"  @click="(e) => setFormData(row.item.name, 'inactive', false)" variant="outline-success" class="mr-2">
                HOẠT ĐỘNG LẠI
              </b-button>
            </b-col>
          </b-row>
              </b-row>
              <b-button size="sm" @click="row.toggleDetails">ẨN</b-button>
            </b-card>
          </template>
        </b-table>
        <b-button variant="outline-primary" @click="addNewRoom()" class="mr-2">+ THÊM PHÒNG</b-button>
      </b-container>
    </b-row>
  </b-container>
</template>

<script>
import { mapState } from 'vuex'
import path from 'path'
import setting from '../appSettings'
const { dialog } = require('electron').remote

export default {
  name: 'manage-room-page',
  data () {
    return {
      fields: [
        {
          key: 'displayName',
          label: 'TÊN PHÒNG'
        },
        {
          key: 'floorDisplayName',
          label: 'TẦNG'
        },
        {
          key: 'show_details',
          label: 'THÔNG TIN CHI TIẾT'
        }
      ]
    }
  },
  mounted () {
    this.$store.dispatch('Admin/loadHotelJson')
  },
  methods: {
    save () {
    },
    addNewRoom () {
      this.$store.commit('Admin/ADD_EMPTY_ROOM')
    },
    cancel () {
      this.$router.push({ name: 'landing-page' })
    },
    setFormData (roomName, propName, propValue) {
      this.$store.commit('Admin/UPDATE_ROOM', { roomName, propName, propValue })
    },
    saveHotelJson () {
      this.$store.dispatch('Admin/saveHotelJson')
    },
    async openCost () {
      let options = {
        buttons: ['Đồng ý'],
        message: 'Edit file javascript in ' + path.join(setting.userDataPath, 'cost_function.js.')
      }
      await dialog.showMessageBox(options)
    }
  },
  computed: {
    ...mapState({
      isLoaded: state => state.Admin.isLoaded,
      rooms: state => state.Admin.rooms
    })
  }
}
</script>

<style>
.item-name {
  font-size: 16px;
  font-weight: 500;
}
.item-group {
  margin-top: 5px;
}

.item-service {
  font-size: 14px;
}
.items-list {
  border: solid 1px gray;
  padding: 5px;
  border-radius: 5px;
  margin-top: 5px;
}
</style>
