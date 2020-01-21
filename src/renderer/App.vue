<template>
  <div id="app">
    <div class="menu" style="-webkit-app-region: drag">
      <h4 style="margin-top:10px;margin-left:20px">{{hotelName}}</h4>
      <div class="menu-item">
        <router-link :to="{ path: 'landing-page' }">
          <b-button class="menu-btn" variant="outline-link">LỄ TÂN</b-button>
        </router-link>
      </div>
      <div class="menu-item">
        <router-link :to="{ path: 'history-page' }">
          <b-button class="menu-btn" variant="outline-link">LỊCH SỬ</b-button>
        </router-link>
      </div>
      <div class="menu-item">
        <router-link :to="{ path: 'admin-room-page' }">
          <b-button class="menu-btn" variant="outline-link">PHÒNG</b-button>
        </router-link>
      </div>
      <div class="menu-item">
        <router-link :to="{ path: 'admin-service-page' }">
          <b-button class="menu-btn" variant="outline-link">DỊCH VỤ</b-button>
        </router-link>
      </div>
      <div class="menu-item">
        <router-link :to="{ path: 'info-page' }">
          <b-button class="menu-btn" variant="outline-link">THÔNG TIN</b-button>
        </router-link>
      </div>
    </div>
    <router-view style="padding-top:55px"></router-view>
  </div>
</template>

<script>
import store from './store'
import { mapState } from 'vuex'

const { app } = require('electron').remote

export default {
  name: 'hotel-app',
  store,
  mounted: async function () {
    console.log(process.env)
    this.$store.dispatch('Hotel/loadHotelInfo')
    this.intervalid1 = setInterval(function () {
      this.$store.dispatch('Hotel/calculateRentCost')
    }.bind(this), 10000)
  },
  methods: {
    closeApp () {
      app.exit()
    }
  },
  computed: {
    ...mapState({
      hotelName: state => state.Hotel.name
    })
  }
}
</script>


<style>
.menu {
  background: rgb(231, 231, 231);
  border: solid 1px gray;
  height: 55px;
  display: flex;
  width: 100%;
  position: fixed;
  z-index: 100000;
}

.menu-item {
  color: black;
  width: auto;
  font-size: 26px;
  margin-left: 10px;
}
</style>
