<template>
  <v-layout column justify-center align-center>
    <v-container xs12 sm8 md6>
      <v-row>
        <v-col>
          <span class="title">บันทึกเวลาเข้า-ออกงาน</span>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-text-field
            v-model="dateRangeText"
            label="แสดงช่วงเวลา"
            readonly
          ></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-date-picker
            v-model="dates"
            full-width
            :landscape="$vuetify.breakpoint.smAndUp"
            class="mt-4"
            locale="th-th"
            color="amber darken-4"
            :show-current="true"
            range
            @change="getData"
            :loading="loading"
            loading-text="Loading... Please wait"
          ></v-date-picker>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-data-table :headers="headers" :items="items" class="elevation-1" />
        </v-col>
      </v-row>
    </v-container>
  </v-layout>
</template>

<script>
export default {
  components: {},

  data() {
    return {
      dates: [],
      items: [],
      loading: false,
      headers: [
        {
          text: 'รูป',
          sortable: false,
          value: 'image'
        },
        {
          text: 'ตำแหน่ง',
          sortable: false,
          value: 'positions'
        },
        {
          text: 'punchTime',
          sortable: true,
          value: 'ลงเวลา'
        }
      ]
    }
  },

  computed: {
    dateRangeText() {
      return this.dates.join(' ~ ')
    }
  },

  beforeMount() {
    this.initDate()
    this.getData()
  },

  methods: {
    initDate() {
      const startDate = this.$moment()
        .subtract(1, 'months')
        .format('YYYY-MM-DD')
      const stopDate = this.$moment().format('YYYY-MM-DD')

      this.dates = [startDate, stopDate]
    },

    async getData() {
      this.loading = true

      try {
        const payload = await this.$axios.get('/api/punchInOut', {
          params: {
            startDate: this.dates[0],
            stopDate: this.dates[1]
          }
        })

        this.items = payload.data
      } catch (error) {
        alert(JSON.stringify(error))
        this.items = []
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped></style>
