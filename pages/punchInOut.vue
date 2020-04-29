<template>
  <v-layout column justify-center align-center>
    <v-flex xs12 sm8 md6>
      <span class="title">ลงเวลาเข้า-ออกงาน</span><br />
      <span class="display-3 font-weight-thin">
        {{ date }}
      </span>
      <br />
      <span class="display-3 font-weight-thin">{{ time }}</span>
      <v-card class="camera-card">
        <v-spacer />
        <v-card-text>
          <v-select
            v-model="deviceId"
            :items="devices"
            item-text="deviceId"
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
          <v-btn color="primary" @click="onCapture">
            บันทึกเวลา
          </v-btn>
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
// import { WebCam } from 'vue-web-cam'

export default {
  components: {
    // 'vue-web-cam': WebCam
  },

  data() {
    return {
      date: null,
      time: null,
      MOMENT_DATE_OUTPUT_FORMAT: 'L',
      MOMENT_TIME_OUTPUT_FORMAT: 'HH:mm:ss',
      // Camera components
      img: null,
      camera: null,
      deviceId: null,
      devices: []
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
  },

  methods: {
    startClock(city) {
      setInterval((_) => {
        this.date = this.$moment().format(this.MOMENT_DATE_OUTPUT_FORMAT)
        this.time = this.$moment().format(this.MOMENT_TIME_OUTPUT_FORMAT)
      }, 1000)
    },
    onCapture() {
      this.img = this.$refs.webcam.capture()
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
    onError(error) {
      if (!this.deviceId) {
        alert('No camera detected!')
      } else {
        alert('Error detected! ', error)
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
    }
  }
}
</script>

<style scoped>
.camera-card {
  margin-top: 1rem;
  margin-bottom: 1rem;
}
</style>
