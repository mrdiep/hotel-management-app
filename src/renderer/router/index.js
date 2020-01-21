import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'landing-page',
      component: require('@/components/LandingPage').default,
      props: (route) => ({ query: route.query.q })
    },
    {
      path: '/checkin-page/:roomName',
      name: 'checkin-page',
      component: require('@/components/CheckInPage').default
    },
    {
      path: '/checkout-page/:roomName',
      name: 'checkout-page',
      component: require('@/components/CheckOutPage').default
    },
    {
      path: '/history-page',
      name: 'history-page',
      component: require('@/components/HistoryPage').default
    },
    {
      path: '/admin-room-page',
      name: 'admin-room-page',
      component: require('@/components/ManageRoomPage').default
    },
    {
      path: '/admin-service-page',
      name: 'admin-service-page',
      component: require('@/components/ManageServicePage').default
    },
    {
      path: '/info-page',
      name: 'info-page',
      component: require('@/components/InfoPage').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
