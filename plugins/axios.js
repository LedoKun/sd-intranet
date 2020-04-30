export default function({ $axios, redirect }) {
  $axios.interceptors.request.use(
    function(config) {
      const baseUrl =
        location.protocol +
        '//' +
        location.hostname +
        (location.port ? ':' + location.port : '')
      config.baseURL = baseUrl

      return config
    },
    function(error) {
      return Promise.reject(error)
    }
  )

  // $axios.onError(error => {
  //   const code = parseInt(error.response && error.response.status)
  //   if (code === 400) {
  //     redirect('/400')
  //   }
  // })
}
