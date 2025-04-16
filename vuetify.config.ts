import { defineVuetifyConfiguration } from 'vuetify-nuxt-module/custom-configuration'

export default defineVuetifyConfiguration({
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        dark: false,
        colors: {
          primary: '#1867C0',
          secondary: '#5CBBF6',
          accent: '#FF4081',
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FB8C00',
          background: '#F5F5F5'
        }
      },
      dark: {
        dark: true,
        colors: {
          primary: '#2196F3',
          secondary: '#424242',
          accent: '#FF4081',
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FB8C00',
          background: '#121212'
        }
      }
    }
  },
  icons: {
    defaultSet: 'mdi'
  },
  defaults: {
    VBtn: {
      rounded: 'lg',
      transition: 'scale-transition'
    },
    VCard: {
      rounded: 'lg'
    },
    VChip: {
      rounded: 'lg'
    },
    VTextField: {
      variant: 'outlined',
      rounded: 'lg'
    }
  }
})