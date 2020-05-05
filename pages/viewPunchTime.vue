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
          <v-date-picker
            v-model="dates"
            full-width
            :landscape="$vuetify.breakpoint.smAndUp"
            class="mt-4"
            locale="th-th"
            color="amber darken-4"
            :show-current="true"
            range
            :loading="loading"
            loading-text="Loading... Please wait"
            @change="getData"
          ></v-date-picker>
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
          <v-data-table :headers="headers" :items="items" class="elevation-1">
            <template v-slot:item.image="{ item }">
              <div class="p-2">
                <v-img :src="item.image" :alt="'รูป'" class="img-table"></v-img>
              </div>
            </template>

            <template v-slot:item.positions="{ item }">
              <div class="p-2">
                <td class="text-start">
                  <em>
                    <span
                      v-for="coordinate in coordinateStr(item.positions)"
                      :key="coordinate"
                    >
                      <small>{{ coordinate }}</small>
                      <br />
                    </span>
                  </em>
                </td>
              </div>
            </template>

            <template v-slot:item.punchTime="{ item }">
              <div class="p-2">
                <td class="text-start">
                  {{ $moment(item.punchTime).format('dddd, DD MMMM YYYY') }}
                  <br />
                  เวลา {{ $moment(item.punchTime).format('hh:mm:ss') }}
                </td>
              </div>
            </template>
          </v-data-table>
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
          text: 'ลงเวลา',
          sortable: true,
          value: 'punchTime'
        }
      ]
    }
  },

  computed: {
    dateRangeText() {
      const dateRange = this.dates.map((date) => {
        return this.$moment(date).format('DD/MM/YYYY')
      })

      return dateRange.join(' - ')
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

    coordinateStr(positions) {
      return positions.map((position) => {
        return '[' + position.lat + ',' + position.lng + ']'
      })
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

<style scoped>
.img-table {
  max-width: 30rem;
  max-height: 30rem;
  width: auto;
  height: auto;
}
</style>
