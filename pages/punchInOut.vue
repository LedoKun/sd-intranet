<template>
  <v-layout column justify-center align-center>
    <v-flex xs12 sm8 md6>
      <v-card>
        <v-card-title class="headline">
          <span class="title">ลงเวลาเข้า-ออกงาน</span>
        </v-card-title>
        <v-card-text>
          <span class="display-2 font-weight-thin">
            {{ date }}
            <br />
            {{ time }}
          </span>
          <br />
          <small>
            <em>Location tag: {{ lat }}, {{ lng }}</em>
          </small>
          <v-spacer />
          <v-select
            v-model="deviceId"
            class="select-camera-card"
            :items="devices"
            item-text="label"
            item-value="deviceId"
            label="กล้อง"
            dense
          ></v-select>
          <vue-web-cam
            ref="webcam"
            :device-id="deviceId"
            width="100%"
            @started="onStarted"
            @stopped="onStopped"
            @error="onError"
            @cameras="onCameras"
            @camera-change="onCameraChange"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" @click="onCapture">บันทึกเวลา</v-btn>
        </v-card-actions>
      </v-card>
      <footer>
        <small>
          <em>ใช้ในกรณีที่ไม่สามารถบันทึกเวลาเข้า-ออกด้วยลายนิ้วมือเท่านั้น</em>
        </small>
      </footer>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  components: {
    // 'vue-web-cam': WebCam
  },

  data() {
    return {
      MOMENT_DATE_OUTPUT_FORMAT: 'L',
      MOMENT_TIME_OUTPUT_FORMAT: 'HH:mm:ss',
      date: null,
      time: null,

      // Camera components
      img: null,
      camera: null,
      deviceId: null,
      devices: [],

      // GPS data
      positions: [],
      lat: null,
      lng: null
    }
  },

  computed: {
    device() {
      return this.devices.find((n) => n.deviceId === this.deviceId)
    }
  },

  watch: {
    camera(id) {
      this.deviceId = id
    },

    devices() {
      // Once we have a list select the first one
      const camDevices = this.devices
      if (camDevices[0]) {
        this.camera = camDevices[0].deviceId
        this.deviceId = camDevices[0].deviceId
      }
    }
  },

  mounted() {
    this.startClock()
    this.getGeolocation()
  },

  methods: {
    startClock(city) {
      setInterval((_) => {
        this.date = this.$moment().format(this.MOMENT_DATE_OUTPUT_FORMAT)
        this.time = this.$moment().format(this.MOMENT_TIME_OUTPUT_FORMAT)
      }, 1000)
    },

    // https://blog.lichter.io/posts/emails-through-nuxtjs/
    onCapture() {
      this.img = this.$refs.webcam.capture()
      this.onStop()

      const url = '/api/punchInOut'
      const payload = {
        datetimeUtc: this.$moment()
          .utc()
          .toDate(),
        positions: this.positions,
        image: this.img
      }

      this.$axios
        .post(url, payload)
        .then(function(response) {
          alert(response.data)
        })
        .catch(function(error) {
          alert(error)
          this.onStart()
        })
    },

    onStarted(stream) {
      // console.log("On Started Event", stream);
    },

    onStopped(stream) {
      // console.log("On Stopped Event", stream);
    },

    onStop() {
      this.$refs.webcam.stop()
    },

    onStart() {
      this.$refs.webcam.start()
    },

    onError(err) {
      if (!this.deviceId) {
        alert('No camera detected!')
      } else {
        alert('Error Code: ' + err.code + ' Error Message: ' + err.message)
      }
    },

    onCameras(cameras) {
      this.devices = cameras
      // console.log('On Cameras Event', cameras)
    },

    onCameraChange(deviceId) {
      this.deviceId = deviceId
      this.camera = deviceId
      // console.log('On Camera Change Event', deviceId)
    },

    getGeolocation() {
      if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
          this.successPosition,
          this.failurePosition,
          {
            enableHighAccuracy: true,
            timeout: 1000,
            maximumAge: 0
          }
        )
      } else {
        alert(`Browser doesn't support Geolocation`)
      }
    },

    successPosition(position) {
      this.positions.push({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      })

      if (this.positions.length >= 5) {
        this.positions.shift()
      }

      this.lat = position.coords.latitude
      this.lng = position.coords.longitude
    },

    failurePosition(err) {
      alert('Error Code: ' + err.code + ' Error Message: ' + err.message)
    }
  }
}
</script>

<style scoped>
.select-camera-card {
  margin-top: 1.5rem;
}
</style>
