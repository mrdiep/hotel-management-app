<template>
  <b-container fluid id="wrapper" v-if="checkInForm !== null">
    <div class="header">
      <h2>{{checkInForm.title}} {{checkInForm.room.displayName}}</h2>

      <div class="footer2">
        <b-button
          class="checkin-btn"
          v-on:click="checkIn()"
          variant="primary"
        >{{checkInForm.buttonCheckinTitle}}</b-button>
        <b-button class="cancel-btn" v-on:click="cancel()" variant="outline-primary">HỦY</b-button>
      </div>
    </div>
    <b-row class="body">
      <b-col class="body-column">
        <b-form>
          <b-form-group label="LOẠI THUÊ" label-cols-sm="3" label-class="font-weight-bold pt-0">
            <b-form-radio-group
              :checked="form.rentTypeIdSelected"
              :options="rentTypeList"
              @input="(e) => setFormData('rentTypeIdSelected', e)"
              buttons
              button-variant="outline-info"
            ></b-form-radio-group>
          </b-form-group>

          <b-form-group label="LOẠI PHÒNG" label-cols-sm="3" label-class="font-weight-bold pt-0">
            <b-form-radio-group
              :checked="form.roomTypeIdSelected"
              :options="roomTypeList"
              @input="(e) => setFormData('roomTypeIdSelected', e)"
              buttons
              button-variant="outline-info"
            ></b-form-radio-group>
          </b-form-group>

          <b-form-group
            id="input-checkin-time-group"
            label="GIỜ VÀO"
            label-class="font-weight-bold pt-0"
            label-for="input-checkin-time"
            label-cols-sm="3"
            description="Nhập đúng định dạng dd/MM/yyyy HH:mm. ví dụ: 31/01/2020 17:05"
          >
            <b-input-group>
              <b-form-input
                id="input-checkin-time"
                :state="inputTimeState"
                v-if="show_edit_time"
                :value="form.checkInTime.format('DD/MM/YYYY HH:mm')"
                @change="(e) => newTime=e"
                type="text"
                required
                placeholder="Giờ vào"
              ></b-form-input>
              <b-form-input
                id="input-checkin-time"
                v-if="!show_edit_time"
                :value="form.checkInTime.calendar()"
                readonly
                type="text"
                required
                placeholder="Giờ vào"
              ></b-form-input>

              <b-input-group-append>
                <b-button
                  v-on:click="e => show_edit_time ? changeTime(e) : openEditTime()"
                  variant="outline-danger"
                >{{!show_edit_time ? 'ĐỔI GIỜ KHÁC' : 'ÁP DỤNG NGAY' }}</b-button>
                <b-button
                  v-if="show_edit_time"
                  v-on:click="show_edit_time=false"
                  variant="outline-danger"
                >HỦY</b-button>
              </b-input-group-append>
            </b-input-group>
          </b-form-group>

          <b-form-group
            id="input-customer-name"
            label-class="font-weight-bold pt-0"
            label="TÊN KHÁCH"
            label-cols-sm="3"
            label-for="input-customer-name"
          >
            <b-form-input
              id="input-customer-name"
              :value="form.customerName"
              @change="(e) => setFormData('customerName', e)"
              type="text"
              required
              placeholder="Vui lòng nhập tên khách"
            ></b-form-input>
          </b-form-group>

          <b-form-group
            id="input-customer-id-group"
            label="MÃ THẺ CÔNG DÂN"
            label-class="font-weight-bold pt-0"
            label-cols-sm="3"
            label-for="input-customer-id"
            description="Nhập số chứng minh nhân dân/Thẻ căn cước/Bằng lái xe/Hộ chiếu..."
          >
            <b-form-input
              id="input-customer-id"
              :value="form.customerIdText"
              @change="(e) => setFormData('customerIdText', e)"
              type="text"
              required
              placeholder="Mã thẻ công dân"
            ></b-form-input>
          </b-form-group>

          <b-form-group
            label-cols-sm="3"
            id="input-note-group"
            label-class="font-weight-bold pt-0"
            label="GHI CHÚ"
            label-for="input-note"
            description
          >
            <b-form-textarea
              id="input-note"
              :value="form.note"
              @change="(e) => setFormData('note', e)"
              type="text"
              required
              placeholder="Tùy chọn ghi chú"
            ></b-form-textarea>
          </b-form-group>

          <b-form-group
            label-cols-sm="3"
            id="input-service-group"
            label-class="font-weight-bold pt-0"
            label="DỊCH VỤ SỬ DỤNG"
            label-for="input-note"
            description
          >
            <div>
              <div>
                TỔNG
                <b-badge variant="primary">{{checkInInfo.rent.totalService.toLocaleString()}}đ</b-badge>
              </div>
              <p v-for="(item, index)  in checkInInfo.rent.serviceItems" v-bind:key="item.name">
                {{index +1}}. {{item.displayName}}
                <b>x{{item.number}}</b>
                <b-badge variant="light">{{item.total.toLocaleString()}}đ</b-badge>
              </p>
            </div>
          </b-form-group>
        </b-form>
        <div></div>
      </b-col>
      <b-col>
        <div v-bind:key="s.name" v-for="s in services" class="body-column">
          <h5 class="item-group-name">{{s.displayName}}</h5>
          <b-list-group class="items">
            <b-list-group-item
              class="d-flex justify-content-between align-items-center"
              v-bind:key="item.name"
              v-for="item in s.items"
            >
            
            <div style="display:flex">
               <img v-if='item.imagePath' style="width: 65px;
                  height: 65px;
                  position: absolute;
                  top: 0px;
                  left: 10px;" v-bind:src="item.imagePath">
              <div style="margin-left:85px">
                <div class="item-name">
                  {{item.displayName}}
                  <b-badge
                    v-if="checkInForm.services[item.name]"
                    variant="primary"
                  >x{{checkInForm.services[item.name] || 0}}</b-badge>
                </div>
                <div style="color:red">{{item.inactive ? '(Đang tạm dừng bán, vào admin để bán trở lại)': ''}}</div>
                <span>GIÁ: {{item.cost.toLocaleString()}} đ</span>
              </div>
            </div>
              <div>
                <b-button
                  v-if="checkInForm.services[item.name]"
                  v-on:click="removeBuy(item.name)"
                  variant="outline-danger"
                >BỎ -1</b-button>
                <span style="margin-left:10px; margin-right:10px;font-size:18px; font-weight:700">{{checkInForm.services[item.name] || ''}}</span>
                <b-button v-show="!item.inactive" v-on:click="buy(item.name)" variant="outline-info">MUA +1</b-button>
              </div>
            </b-list-group-item>
          </b-list-group>
        </div>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import moment from 'moment'

export default {
  name: 'checkin-page',
  data () {
    return {
      show_edit_time: false,
      newTime: null,
      inputTimeState: null
    }
  },
  mounted () {
    if (!this.isLoaded) {
      this.$router.push({ name: 'landing-page' })
      return
    }

    this.$store.dispatch('Hotel/initCheckIn', {
      roomName: this.$route.params.roomName
    })
  },
  methods: {
    checkIn () {
      this.$store.dispatch('Hotel/doCheckIn')
      this.$router.push({ name: 'landing-page' })
    },
    cancel () {
      this.$store.dispatch('Hotel/cancelCheckIn')
      this.$router.push({ name: 'landing-page' })
    },
    removeBuy (itemName) {
      this.$store.dispatch('Hotel/removeBuy', itemName)
    },
    buy (itemName) {
      this.$store.dispatch('Hotel/buy', itemName)
    },
    setFormData (propName, propValue) {
      this.$store.commit('Hotel/UPDATE_CHECKIN_FORM', { propName: propName, propValue: propValue })
    },
    openEditTime () {
      this.show_edit_time = true
      this.inputTimeState = null
      this.newTime = this.form.checkInTime.format('DD/MM/YYYY HH:mm')
    },
    changeTime () {
      var m = moment(this.newTime, 'DD/MM/YYYY HH:mm')
      if (!m.isValid()) {
        this.inputTimeState = false
        return
      }
      this.inputTimeState = null
      this.show_edit_time = false
      this.$store.commit('Hotel/UPDATE_CHECKIN_FORM', { propName: 'checkInTime', propValue: m })
    }
  },
  computed: {
    ...mapState({
      checkInForm: state => state.Hotel.checkInForm,
      masterVariables: state => state.Hotel.masterVariables,
      form: state => state.Hotel.checkInForm.form,
      rentTypeList: state => state.Hotel.rentTypes.map(x => ({text: x.displayName, value: x.name})),
      roomTypeList: state => state.Hotel.roomTypes.map(x => ({text: x.displayName, value: x.name})),
      isLoaded: state => state.Hotel.isLoaded,
      services: state => state.Hotel.services
    }),
    ...mapGetters('Hotel', ['checkInInfo'])
  }
}
</script>

<style>
.body-column {
  padding-top: 20px;
}

.items {
  margin-top: 5px;
}
.body {
  padding: 10px;
  padding-top: 85px;
}
.header {
  border-bottom: 1px solid gainsboro;
  width: 99%;
  padding: 10px;
  height: 80px;
  display: flex;
  position: fixed;
  background-color: white;
  font-size: 13px;
  color: darkgray;
  z-index: 100;
}
.footer2 {
  bottom: 10px;
  display: flex;
  padding: 10px;
  right: 0px;
  position: absolute;
  top: 10px;
}
.item-name {
  font-size: 16px;
  font-weight: 500;
}
.item-group-name {
  font-size: 16px;
  font-weight: 700;
}
.checkin-btn {
  margin-right: 10px;
  width: 150px;
}
.cancel-btn {
  width: 150px;
}
</style>
