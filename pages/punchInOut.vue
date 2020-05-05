<template>
  <v-layout column justify-center align-center>
    <v-flex xs12 sm8 md6>
      <v-card>
        <v-card-title class="headline">
          <span class="title">ลงเวลาเข้า-ออกงาน</span>
        </v-card-title>
        <v-card-text>
          <span v-if="date && lat" class="display-2 font-weight-thin">
            {{ date }}
            <br />
            {{ time }}
          </span>
          <br />
          <small v-if="date && lat">
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
          <div class="webcam-container">
            <vue-web-cam
              id="webcam"
              ref="webcam"
              :device-id="deviceId"
              height="400px"
              width="300px"
              @started="onStarted"
              @stopped="onStopped"
              @error="onError"
              @cameras="onCameras"
              @camera-change="onCameraChange"
            />
            <canvas id="overlay" />
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            :loading="!isPayloadValid()"
            :disabled="!isPayloadValid() || isPunched"
            :block="true"
            @click="onCapture"
            >บันทึกเวลา</v-btn
          >
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
import * as faceapi from 'face-api.js'

export default {
  components: {},

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

      faceDetectionScore: 0,

      // GPS data
      positions: [],
      lat: null,
      lng: null,

      // intervals, watch
      timeUpdateInterval: null,
      faceDetectionInterval: null,
      gpsWatch: null,

      // form control
      isPunched: false
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

  async beforeMount() {
    await faceapi.loadTinyFaceDetectorModel('/weights')
  },

  mounted() {
    this.startClock()
    this.getGeolocation()
    this.startFaceDetection()
  },

  methods: {
    isPayloadValid() {
      return this.faceDetectionScore > 0.5 && this.positions.length > 9
    },

    startClock() {
      this.timeUpdateInterval = setInterval(() => {
        this.date = this.$moment().format(this.MOMENT_DATE_OUTPUT_FORMAT)
        this.time = this.$moment().format(this.MOMENT_TIME_OUTPUT_FORMAT)
      }, 500)
    },

    startFaceDetection() {
      const video = document.getElementById('webcam')

      video.addEventListener('play', () => {
        const canvas = document.getElementById('overlay')
        const displaySize = { width: video.width, height: video.height }
        faceapi.matchDimensions(canvas, displaySize)

        this.faceDetectionInterval = setInterval(async () => {
          const detection = await faceapi.detectSingleFace(
            video,
            new faceapi.TinyFaceDetectorOptions()
          )

          this.faceDetectionScore = detection.score

          const resizedDetections = faceapi.resizeResults(
            detection,
            displaySize
          )
          canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
          faceapi.draw.drawDetections(canvas, resizedDetections)
        }, 500)
      })
    },

    onCapture() {
      this.img = this.$refs.webcam.capture()
      this.$refs.webcam.pause()

      const url = '/api/punchInOut'
      const payload = {
        positions: this.positions,
        image: this.img
      }

      navigator.geolocation.clearWatch(this.gpsWatch)
      clearInterval(this.timeUpdateInterval)
      clearInterval(this.faceDetectionInterval)

      const self = this

      this.$axios
        .post(url, payload)
        .then(function(response) {
          self.onSubmitSuccess()
        })
        .catch(function(error) {
          self.onSubmitFailure(error)
        })
    },

    onSubmitSuccess() {
      this.isPunched = true
      alert('บันทึกเวลาสำเร็จ')
    },

    onSubmitFailure(error) {
      alert('กรุณาลองอีกครั้ง')

      console.error(error) // eslint-disable-line no-console

      this.$refs.webcam.resume()

      this.isPunched = false
      this.startClock()
      this.getGeolocation()
      this.startFaceDetection()
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
        this.gpsWatch = navigator.geolocation.watchPosition(
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

      if (this.positions.length > 10) {
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
.webcam-container {
  display: grid;
}
#webcam,
#overlay {
  grid-area: 1 / 1;
}
#overlay {
  z-index: 100;
  width: 300px;
  height: 400px;
}
</style>
