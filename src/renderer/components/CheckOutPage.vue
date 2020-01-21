<template>
  <b-container fluid id="wrapper" v-if="checkOutForm !== null">
    <div class="header">
      <h2>{{checkOutForm.title}} {{checkOutForm.room.displayName}}</h2>

      <div class="footer2">
        <b-button
          class="checkin-btn"
          v-on:click="checkOut()"
          variant="primary"
        >{{checkOutForm.buttonTitle}}</b-button>
        <b-button class="cancel-btn" v-on:click="cancel()" variant="outline-primary">HỦY</b-button>
      </div>
    </div>
    <b-row class="body">
      <b-container>
        <b-row
          v-bind:key="keyValue.key"
          v-for="keyValue in checkOutForm.listInfo.filter(x => !!x.value || x.value === 0)"
          class="item-group"
        >
          <b-col sm="3">
            <div class="item-name">{{keyValue.key}}</div>
          </b-col>
          <b-col sm="9">
            {{keyValue.value}}

            <div v-if="keyValue.isShowDetailService && checkOutForm.rent.serviceItems.length > 0" class="items-list">
              <div
                class="item-service"
                v-bind:key="item.name"
                v-for="(item, index) in checkOutForm.rent.serviceItems"
              >{{index + 1}}. {{item.displayName}} (x{{item.number.toLocaleString()}}) {{item.total.toLocaleString()}}đ</div>
            </div>

            <span v-if="keyValue.showEditRentCost && !checkOutForm.deleteRequest">
              <b-dropdown
                id="dropdown-form"
                text="TÍNH LẠI GIÁ KHÁC"
                v-if="true"
                variant="outline-danger"
                ref="dropdown"
                class="m-2"
              >
                <b-container style="width:450px">
                  <b-form-group
                    label="GIÁ TIỀN MỚI"
                    label-cols-sm="5"
                    label-class="font-weight-bold pt-0"
                  >
                    <b-form-input
                      type="number"
                      :value="checkOutForm.newRentCost"
                      @change="(e) => setFormData('newRentCost', parseInt(e))"
                      placeholder="Nhập giá phòng mới"
                    ></b-form-input>
                  </b-form-group>
                  <b-form-group
                    label="LÝ DO THAY ĐỔI"
                    description="Lý do thay đổi giá, ví dụ: phụ thu gửi xe, phụ thu ngày lễ..."
                    label-class="font-weight-bold pt-0"
                  >
                    <b-form-textarea
                      :value="checkOutForm.rentCostChangedNote"
                      @change="(e) => setFormData('rentCostChangedNote', e)"
                      placeholder="Lý do thay đổi"
                    ></b-form-textarea>
                  </b-form-group>

                  <b-button variant="primary" v-on:click="setNewCost()">THAY ĐỔI</b-button>
                  <p>Nhấn chuột ra bên ngoài để tắt của sổ</p>
                </b-container>
              </b-dropdown>
            </span>
          </b-col>
        </b-row>
        <b-row class="item-group">
          <b-col sm="3">
            <div class="item-name">{{checkOutForm.deleteRequest ? 'LÝ DO XÓA *' : 'GHI CHÚ'}}</div>
          </b-col>
          <b-col sm="9">
            <b-form-textarea
              :value="checkOutForm.checkOutNote"
              @change="(e) => setFormData('checkOutNote', e)"
            ></b-form-textarea>
          </b-col>
        </b-row>
      </b-container>
    </b-row>
  </b-container>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'checkout-page',
  props: ['actionRequest'],
  mounted () {
    if (!this.isLoaded) {
      this.$router.push({ name: 'landing-page' })
      return
    }
    this.$store.dispatch('Hotel/initCheckOut', {
      roomName: this.$route.params.roomName,
      deleteRequest: this.$route.query.actionRequest === 'delete'
    })
  },
  methods: {
    checkOut () {
      this.$store.dispatch('Hotel/doCheckOut')
      this.$router.push({ name: 'landing-page' })
    },
    cancel () {
      this.$store.dispatch('Hotel/cancelCheckOut')
      this.$router.push({ name: 'landing-page' })
    },
    setFormData (propName, propValue) {
      this.$store.commit('Hotel/UPDATE_CHECKOUT_FORM', { propName: propName, propValue: propValue })
    },
    setNewCost () {
      this.$store.dispatch('Hotel/calculateNewRentCost')
    }
  },
  computed: {
    ...mapState({
      checkOutForm: state => state.Hotel.checkOutForm,
      isLoaded: state => state.Hotel.isLoaded,
      services: state => state.Hotel.services
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
