<template>
  <div id="wrapper">
    <div v-bind:key="floor.name" v-for="floor in floors">
      <div class="floor">
        <h5>{{floor.displayName}}</h5>
      </div>
      <div  class="room-list">
          <div v-bind:key="room.name" v-for="room in floor.rooms" class="room-item" >
            <div>
              <div class="room-header">
                <h4>{{room.displayName}}</h4>
                <b-badge v-bind:variant="room.roomType.style" show class="room-type">{{room.roomType.displayName}}</b-badge>
              </div>
              <div class="room-body">
                 <div v-if="room.rent === null">
                   <div><span class="item-header"> TÌNH TRẠNG:</span><span class="item-value">  {{room.roomState.displayName}}</span></div>
                   <div style="font-size: 16px;color: gray;">{{room.lastHistoryDescription}}</div>
                </div>
                <div v-if="room.rent !== null">
                   <div><span class="item-header">VÀO:</span><span class="item-value"> {{room.rent.checkInTime.calendar()}} ({{room.rent.checkInTime.fromNow()}})</span></div>
                  <div v-if="!!room.rent.customerName"><span class="item-header">KHÁCH:</span>> <span class="item-value"> {{room.rent.customerName}} </span> </div>
                   <div><span class="item-header">TIỀN PHÒNG:</span><span class="item-value"> {{room.rent.rentCost.toLocaleString()}}đ</span>
                    <b-badge v-bind:variant="room.rent.rentType.style" class="rent-type">{{room.rent.rentType.displayName}}</b-badge></div>
                   <div><span class="item-header">DỊCH VỤ:</span> <span class="item-value">{{room.rent.totalService.toLocaleString()}}đ</span>

                    <br/><b-badge class="item-service" v-bind:key="item.name" v-for="item in room.rent.serviceItems">{{item.displayName}} x{{item.number}}</b-badge>
                   </div>
                </div>
              </div>
              <div class="room-footer">
                <div v-if="room.rent === null">
                  <b-button :variant="room.runtimeStyle.variant" v-on:click="doCheckIn(room.name)">Nhận phòng</b-button>
                </div>
                <div v-if="room.rent !== null">
                    <b-button variant="outline-danger" v-on:click="doDelete(room.name, true)">Xóa</b-button>
                    <b-dropdown
                      dropright
                      text="Đổi"
                      v-if="true"
                      variant="outline-danger"
                      ref="dropdown"
                      class="m-2">

                      <b-dropdown-item href="#" v-bind:key="'rr' + ar.name" @click="doChangeRoom(room.name, ar.name)" v-for="ar in getAvailableRooms()">{{ar.displayName}}</b-dropdown-item>

                    </b-dropdown>
                    <b-button variant="outline-danger" v-on:click="doCheckIn(room.name)">Cập nhật</b-button>
                    <b-button variant="danger" v-on:click="doCheckOut(room.name)">Trả phòng</b-button>
                </div>
              </div>
            </div>
      </div>
      </div>
      
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
const { dialog } = require('electron').remote
export default {
  name: 'landing-page',
  components: { },
  methods: {
    doCheckIn (roomName) {
      this.$router.push({ name: 'checkin-page', params: { roomName } })
    },
    doCheckOut (roomName) {
      this.$router.push({ name: 'checkout-page', params: { roomName } })
    },
    doDelete (roomName) {
      this.$router.push({ name: 'checkout-page', params: { roomName }, props: { actionRequest: 'delete' }, query: { actionRequest: 'delete' } })
    },
    async doChangeRoom (fromRoomName, toRoomName) {
      let options = {
        buttons: ['Có', 'Không'],
        message: 'Bạn có muốn thay đổi phòng đã nhận không?'
      }
      let response = await dialog.showMessageBox(options)
      if (response.response === 0) {
        this.$store.dispatch('Hotel/changeRoom', {fromRoomName, toRoomName})
      }
    },
    getAvailableRooms () {
      var p = this.floors.reduce((l, f) => {
        l = [...l, ...f.rooms]
        return l
      }, []).filter(x => !x.rent)
      return p
    }
  },
  computed: {
    ...mapState({
      floors: state => state.Hotel.floors,
      hotelName: state => state.Hotel.name
    })
  }
}
</script>

<style>
.item-service {
  margin-left: 3px;
}
.item-header {
  color: #004148;
  font-weight: 700;
}
.item-value {
  font-size: 18px;
}
.room-list {
  display: flex;
}
.room-header {
  position: relative;
  display: flex;
}
.room-footer {
  position: absolute;
    bottom: 10px;
    right: 10px;
}
  .room-type {
    right: 10px;
    position: absolute;
    font-size: 13px;
  }
.floor {
  margin-left: 10px;
  margin-bottom: -5px;
  margin-top: 20px;
}
.hotel-name {
  margin-left: 10px;
  color: orangered
}
.room-item {
  position: relative;
  width: 400px;
  height: 240px;
  margin: 10px;
  padding: 5px;
  border: 1px solid gray;
  border-radius: 10px;
}
</style>
