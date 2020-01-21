<template>
    <b-container fluid id="wrapper" >
      <div class="header">
        <h2>LỊCH SỬ {{timeTitle}}</h2>
      </div>
      <div class="history-body">
        Lọc dữ liệu theo
        <div>
          <b-button-toolbar key-nav>
            <b-button-group class="mx-1">
            <b-button v-on:click="setFilter('day')">HÔM NAY</b-button>
            <b-button v-on:click="setFilter('month')">THÁNG</b-button>
            <b-button v-on:click="setFilter('year')">NĂM</b-button>
            </b-button-group>
            <b-button-group class="mx-1">
              <b-button v-on:click="setNext('pre')">{{preText.toUpperCase()}}</b-button>
              <b-button v-on:click="setNext('next')" v-if='!!nextText'>{{nextText.toUpperCase()}}</b-button>
            </b-button-group>
          </b-button-toolbar>
        </div>
      <div style="margin-top:20px">
        <div v-if='summary.serviceSummary.length'>
          <h4>LỊCH SỬ BÁN DỊCH VỤ</h4>
          <b-table class="table-data" striped hover :items="summary.serviceSummary" :fields="fieldsService">
            <template v-slot:cell(total)="data">
              <div>
                {{data.value.toLocaleString()}}đ
              </div>
            </template>
          </b-table>
        </div>

        <h4>LỊCH SỬ THUÊ PHÒNG</h4>
        <p>LƯỢT THUÊ: {{summary.count.toLocaleString()}}</p>
        <p>TỔNG THU NHẬP: {{summary.totalCost.toLocaleString()}}đ</p>
          <b-table selectable select-mode="single" @row-selected="onRowSelected" class="table-data" striped hover :items="list" :fields="fields" v-if="list && list.length">
            <template v-slot:cell(ServiceSummary)="data">
              <div style="width:400px">
                <b-badge class="history-service-item" v-for="s in data.value" v-bind:key="s.serviceId">x{{s.buyNumber}} {{s.serviceName}} {{s.total.toLocaleString()}}đ</b-badge> 
              </div>
            </template>
            <template v-slot:row-details="row">
              <b-card>
                <b-row class="mb-2">
                  <b-col sm="3" class="text-sm-right"><b>NHẬN PHÒNG:</b></b-col>
                  <b-col>{{ row.item.CheckInTimeText }}</b-col>
                </b-row>
                <b-row class="mb-2" v-if="row.item.CheckInNote">
                  <b-col sm="3" class="text-sm-right"><b>GHI CHÚ LÚC NHẬN PHÒNG:</b></b-col>
                  <b-col>{{ row.item.CheckInNote }}</b-col>
                </b-row>

                <b-row class="mb-2">
                  <b-col sm="3" class="text-sm-right"><b>TRẢ PHÒNG:</b></b-col>
                  <b-col>{{ row.item.CheckOutTimeText }}</b-col>
                </b-row>
                <b-row class="mb-2" v-if="row.item.CheckOutNote">
                  <b-col sm="3" class="text-sm-right"><b>GHI CHÚ LÚC TRẢ PHÒNG:</b></b-col>
                  <b-col>{{ row.item.CheckOutNote }}</b-col>
                </b-row>
                <b-row class="mb-2">
                  <b-col sm="3" class="text-sm-right"><b>KHÁCH:</b></b-col>
                  <b-col>{{ row.item.CustomerName ? row.item.CustomerName : "#Khách vãng lai" }}</b-col>
                </b-row>

                <b-row class="mb-2" v-if="row.item.CustomerIdText">
                  <b-col sm="3" class="text-sm-right"><b>CMND/BLX/THẺ:</b></b-col>
                  <b-col>{{ row.item.CustomerIdText }}</b-col>
                </b-row>

                <b-row class="mb-2">
                  <b-col sm="3" class="text-sm-right"><b>LOẠI PHÒNG:</b></b-col>
                  <b-col>{{ row.item.RoomTypeName }}</b-col>
                </b-row>

                <b-row class="mb-2">
                  <b-col sm="3" class="text-sm-right"><b>LOẠI THUÊ:</b></b-col>
                  <b-col>{{ row.item.RentTypeName }}</b-col>
                </b-row>

                <b-row class="mb-2" v-if="row.item.CustomerNote">
                  <b-col sm="3" class="text-sm-right"><b>GHI CHÚ KHÁCH HÀNG:</b></b-col>
                  <b-col>{{ row.item.CustomerNote }}</b-col>
                </b-row>

                <b-row class="mb-2" v-if="row.item.OriginRentCost !== row.item.RentCost">
                  <b-col sm="3" class="text-sm-right"><b>GIÁ PHÒNG (TÍNH TỰ ĐỘNG)</b></b-col>
                  <b-col>{{ row.item.OriginRentCost.toLocaleString() }}đ</b-col>
                </b-row>

                <b-row class="mb-2" v-if="row.item.UpdatedRentCostNote">
                  <b-col sm="3" class="text-sm-right"><b>GHI CHÚ LÚC ĐỔI GIÁ TIỀN PHÒNG</b></b-col>
                  <b-col>{{ row.item.UpdatedRentCostNote }}</b-col>
                </b-row>

                <b-row class="mb-2">
                  <b-col sm="3" class="text-sm-right"><b>TIỀN PHÒNG:</b></b-col>
                  <b-col>{{ row.item.RentCost.toLocaleString() + 'đ' }}</b-col>
                </b-row>
                <b-row class="mb-2">
                  <b-col sm="3" class="text-sm-right"><b>TIỀN DỊCH VỤ:</b></b-col>
                  <b-col>{{ row.item.ServiceCost.toLocaleString() + 'đ' }}</b-col>
                </b-row>
                <b-row class="mb-2" v-if="row.item.ServiceSummary && row.item.ServiceSummary.length">
                  <b-col sm="3" class="text-sm-right"><b>DỊCH VỤ SỬ DỤNG:</b></b-col>
                  <b-col>
                    <b-badge class="history-service-item" v-for="s in row.item.ServiceSummary" v-bind:key="s.serviceId">x{{s.buyNumber}} {{s.serviceName}} {{s.total.toLocaleString()}}đ</b-badge> 
                  </b-col>
                </b-row>
                <b-button size="sm" @click="row.toggleDetails">Đóng</b-button>
              </b-card>
            </template>
          </b-table>
        </div>
      </div>
    </b-container>
</template>

<script>
  import { mapState } from 'vuex'
  import { LoadHistory } from '../services/dataService'
  import moment from 'moment'

  export default {
    name: 'checkout-page',
    data () {
      return {
        type: 'day',
        preText: 'NGÀY HÔM QUA',
        nextText: '',
        filterValue: '',
        timeTitle: '',
        summary: {
          count: 0,
          serviceSummary: [],
          totalCost: 0
        },
        fieldsService: [
          {
            key: 'serviceName',
            label: 'TÊN DỊCH VỤ'
          },
          {
            key: 'count',
            label: 'ĐÃ BÁN'
          },
          {
            key: 'total',
            label: 'TỔNG TIỀN'
          }
        ],
        fields: [
          {
            key: 'RoomName',
            label: 'PHÒNG'
          },
          {
            key: 'RoomTypeName',
            label: 'LOẠI PHÒNG'
          },
          {
            key: 'CheckInTimeText',
            label: 'GIỜ NHẬN PHÒNG'
          },
          {
            key: 'CheckOutTimeText',
            label: 'GIỜ TRẢ PHÒNG'
          },
          {
            key: 'RentTypeName',
            label: 'LOẠI THUÊ'
          },
          {
            key: 'TotalCost',
            label: 'TỔNG TIỀN',
            variant: 'danger',
            formatter: (value, key, item) => {
              return item.TotalCost.toLocaleString() + 'đ'
            }
          }
          // {
          //   key: 'RentCost',
          //   label: 'TIỀN PHÒNG',
          //   formatter: (value, key, item) => {
          //     return item.RentCost.toLocaleString() + 'đ'
          //   }
          // },
          // {
          //   key: 'ServiceCost',
          //   label: 'TIỀN DỊCH VỤ',
          //   formatter: (value, key, item) => {
          //     return item.ServiceCost.toLocaleString() + 'đ'
          //   }
          // },
          // {
          //   key: 'ServiceSummary',
          //   label: 'DỊCH VỤ'
          // }
        ],
        list: []
      }
    },
    props: ['actionRequest'],
    async mounted () {
      if (!this.isLoaded) {
        this.$router.push({ name: 'landing-page' })
        return
      }

      this.setFilter('day')
    },
    methods: {
      onRowSelected (row) {
        row[0]._showDetails = true
      },
      setFilter (type) {
        this.type = type
        var beginOfToday = moment(new Date()).set({hour: 0, minute: 0, second: 0})
        switch (this.type) {
          case 'day':
            var fromDate = beginOfToday.clone()
            var toDate = fromDate.clone().add('day', 1)

            this.filterValue = fromDate.clone()

            this.loadHistory({fromDate, toDate, roomName: null})
            this.preText = 'HÔM QUA'
            this.nextText = ''
            this.timeTitle = this.filterValue.calendar().split('lúc')[0].toUpperCase()
            break
          case 'month':
            fromDate = moment(new Date(beginOfToday.get('year'), beginOfToday.get('month'), 1))
            toDate = beginOfToday.clone().add('day', 1)

            this.filterValue = fromDate
            this.loadHistory({fromDate, toDate, roomName: null})

            var preMonth = fromDate.clone().add('month', -1)
            this.preText = 'THÁNG ' + (preMonth.get('month') + 1) + '/' + preMonth.get('year')
            this.nextText = ''
            this.timeTitle = 'THÁNG ' + (this.filterValue.get('month') + 1) + ' NĂM ' + this.filterValue.get('year')
            break
          case 'year':
            fromDate = moment(new Date(beginOfToday.get('year'), 0, 1))
            toDate = fromDate.clone().add('year', 1)

            this.filterValue = fromDate
            this.loadHistory({fromDate, toDate, roomName: null})

            var preYear = fromDate.clone().add('year', -1)
            this.preText = 'NĂM ' + preYear.get('year')
            this.nextText = ''
            this.timeTitle = 'NĂM ' + this.filterValue.get('year')
            break
        }
      },
      setNext (value) {
        let prePeriodTime, nextPeriodTime
        switch (this.type) {
          case 'day':
            if (value === 'pre') {
              var fromDate = this.filterValue.clone().add('day', -1)
              var toDate = this.filterValue.clone()
            } else if (value === 'next') {
              fromDate = this.filterValue.clone().add('day', 1)
              toDate = this.filterValue.clone().add('day', 2)
            }
            this.filterValue = fromDate.clone()
            this.timeTitle = this.filterValue.calendar().split('lúc')[0].toUpperCase()

            prePeriodTime = this.filterValue.clone().add('day', -1)
            nextPeriodTime = this.filterValue.clone().add('day', 1)
            this.preText = prePeriodTime.calendar().split('lúc')[0]
            this.nextText = nextPeriodTime.calendar().split('lúc')[0]
            if (nextPeriodTime.isAfter(new Date())) {
              this.nextText = ''
            }

            break
          case 'month':
            if (value === 'pre') {
              fromDate = this.filterValue.clone().add('month', -1)
              toDate = this.filterValue.clone()
            } else if (value === 'next') {
              fromDate = this.filterValue.clone().add('month', 1)
              toDate = this.filterValue.clone().add('month', 2)
            }

            this.filterValue = fromDate.clone()
            this.timeTitle = 'THÁNG ' + (this.filterValue.get('month') + 1) + ' NĂM ' + this.filterValue.get('year')

            prePeriodTime = this.filterValue.clone().add('month', -1)
            nextPeriodTime = this.filterValue.clone().add('month', 1)
            this.preText = 'THÁNG ' + (prePeriodTime.get('month') + 1) + '/' + prePeriodTime.get('year')
            this.nextText = 'THÁNG ' + (nextPeriodTime.get('month') + 1) + '/' + nextPeriodTime.get('year')

            if (parseInt(nextPeriodTime.format('YYYYMM')) > parseInt(moment().format('YYYYMM'))) {
              this.nextText = ''
            }
            break
          case 'year':
            if (value === 'pre') {
              fromDate = this.filterValue.clone().add('year', -1)
              toDate = this.filterValue.clone()
            } else if (value === 'next') {
              fromDate = this.filterValue.clone().add('year', 1)
              toDate = this.filterValue.clone().add('year', 2)
            }

            this.filterValue = fromDate.clone()
            this.timeTitle = ' NĂM ' + this.filterValue.get('year')

            prePeriodTime = this.filterValue.clone().add('year', -1)
            nextPeriodTime = this.filterValue.clone().add('year', 1)
            this.preText = 'NĂM ' + prePeriodTime.get('year')
            this.nextText = 'NĂM ' + nextPeriodTime.get('year')

            if (nextPeriodTime.get('year') > new Date().getFullYear()) {
              this.nextText = ''
            }
            break
        }
        this.loadHistory({fromDate, toDate, roomName: null})
      },
      async loadHistory (filter) {
        var list = await LoadHistory(filter)
        for (var item of list) {
          item._showDetails = false
          item.ServiceSummary = JSON.parse(item.ServiceSummary)
          item.TotalCost = item.RentCost + item.ServiceCost
          item.CheckOutTimeText = item.CheckOutTimeText + ' (' + moment(new Date(item.CheckInTime * 1000)).from(moment(new Date(item.CheckOutTime * 1000)), true) + ')'
        }

        this.list = list
        var serviceSummary = Object.entries(list
          .map(x => x.ServiceSummary)
          .reduce((l, e) => [...l, ...e], [])
          .reduce((l, e) => {
            const item = l[e.serviceName] || { serviceName: e.serviceName, count: 0, total: 0 }
            item.count += e.buyNumber
            item.total += e.total
            l[e.serviceName] = item
            return l
          }, {}))
          .reduce((l, e) => {
            l.push(e[1])
            return l
          }, [])
          .sort((a, b) => b.count - a.count)

        this.summary = {
          count: list.length,
          totalCost: list.reduce((a, b) => a + b.TotalCost, 0),
          serviceTotal: serviceSummary.reduce((a, b) => a + b.total, 0),
          serviceSummary
        }

        for (const fielService of this.fieldsService) {
          if (fielService.key === 'total') {
            fielService.label = 'TỔNG TIỀN (' + this.summary.serviceTotal.toLocaleString() + 'đ)'
          }

          if (fielService.key === 'count') {
            fielService.label = 'ĐÃ BÁN (' + serviceSummary.reduce((a, b) => a + b.count, 0).toLocaleString() + ')'
          }
        }

        for (const fielService of this.fields) {
          if (fielService.key === 'TotalCost') {
            fielService.label = 'TỔNG TIỀN (' + this.summary.totalCost.toLocaleString() + 'đ)'
          }
          if (fielService.key === 'RentCost') {
            fielService.label = 'TIỀN THUÊ PHÒNG (' + list.reduce((a, b) => a + b.RentCost, 0).toLocaleString() + 'đ)'
          }
          if (fielService.key === 'ServiceCost') {
            fielService.label = 'TIỀN DỊCH VỤ (' + list.reduce((a, b) => a + b.ServiceCost, 0).toLocaleString() + 'đ)'
          }
        }
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
.history-body {
  margin-top:80px;
}
.history-service-item {
  margin-right: 10px;
}

.table-data {
  margin-top: 15px;
}
</style>
