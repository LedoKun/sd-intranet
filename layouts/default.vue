<template>
  <v-app dark>
    <v-navigation-drawer
      v-model="drawer"
      :mini-variant="miniVariant"
      :clipped="clipped"
      fixed
      app
    >
      <v-list>
        <v-list-item
          v-for="(item, i) in items"
          :key="i"
          :to="item.to"
          router
          exact
        >
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-text="item.title" />
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar :clipped-left="clipped" fixed app>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-btn icon @click.stop="miniVariant = !miniVariant">
        <v-icon>mdi-{{ `chevron-${miniVariant ? 'right' : 'left'}` }}</v-icon>
      </v-btn>
      <v-btn icon @click.stop="clipped = !clipped">
        <v-icon>mdi-application</v-icon>
      </v-btn>
      <v-toolbar-title v-text="title" />
      <v-spacer />
    </v-app-bar>
    <v-content>
      <v-container>
        <nuxt />
      </v-container>
    </v-content>
    <v-footer :fixed="fixed" padless>
      <v-card class="flex" flat tile>
        <v-card-text class="py-2 white--text text-center">
          &copy; S.D. Machinery (Southeast Asia) Co., Ltd.
          {{ new Date().getFullYear() }} — By <strong>Ledo Kun</strong><br />
        </v-card-text>
      </v-card>
    </v-footer>
  </v-app>
</template>

<script>
export default {
  data() {
    return {
      clipped: false,
      drawer: false,
      fixed: false,
      items: [
        {
          icon: 'mdi-apps',
          title: 'หน้าแรก',
          to: '/'
        },
        {
          icon: 'mdi-calendar-clock',
          title: 'ลงเวลาเข้า-ออกงาน',
          to: '/punchInOut'
        },
        {
          icon: 'mdi-book-open',
          title: 'บันทึกเวลาเข้า-ออกงาน',
          to: '/viewPunchTime'
        }
      ],
      miniVariant: false,
      right: true,
      title: 'S.D. Machinery (Southeast Asia)'
    }
  }
}
</script>
