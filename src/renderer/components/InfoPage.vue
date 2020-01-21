<template>
  <b-container fluid>
     <b-table-simple small caption-top stacked v-if="showSystemEnv">
      <caption>Phần mềm quản lý khách sạn.</caption>
      <colgroup><col><col></colgroup>
      <colgroup><col><col><col></colgroup>
      <colgroup><col><col></colgroup>
      <b-tbody>
        <b-tr>
          <b-td v-for="item in items" v-bind:key="item[0]" v-bind:stacked-heading="item[0]">{{item[1]}}</b-td>
        </b-tr>
      </b-tbody>
    </b-table-simple>
    <div v-if="!showSystemEnv">
      <span>Log thông tin</span>
      <div v-for="log in logs" v-bind:key="log.id">
        <span style="font-size:13px;color:gray">{{log.whenInText}}</span> <span style="font-size:15px;color:black">{{log.message}}</span>
        </div>
        <b-button v-on:click="preLog()" v-if="page > 0" variant="outline-info">QUAY LẠI TRANG</b-button>
      <b-button v-on:click="nextLog()" v-if="logs.length === pageSize" variant="outline-info">XEM TIẾP</b-button>
    </div>
  </b-container>
</template>

<script>
import { LoadLogs } from '../services/dataService'
export default {
  name: 'info-page',
  data () {
    return {
      page: 0,
      pageSize: 50,
      items: Object.entries(process.env),
      showSystemEnv: false,
      logs: []
    }
  },
  async mounted () {
    this.logs = await LoadLogs(0, this.pageSize)
  },
  methods: {
    async nextLog () {
      this.page = this.page + 1
      this.logs = await LoadLogs(this.page, this.pageSize)
    },
    async preLog () {
      this.page = this.page - 1
      this.logs = await LoadLogs(this.page, this.pageSize)
    }
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
