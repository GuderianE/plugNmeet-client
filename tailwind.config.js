module.exports = {
  darkMode: 'class',
  content: [
    './src/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    './src/**/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      boxShadow: {
        footer: '0 -4px 52px rgba(0, 0, 0, 0.15)',
        header: '0 4px 52px rgba(0, 0, 0, 0.15)',
        panel: '0 0 10px -7px rgb(0, 0, 0)',
        box1: '0px 16px 34px 0px #002B4008',
        box2: '0px 62px 62px 0px #002B4008',
        box3: '0px 140px 84px 0px #002B4005',
        box4: '0px 250px 100px 0px #002B4000',
        box5: '0px 390px 109px 0px #002B4000',
        IconBox: '0px 1px 2px 0px #002B400D',
        shadowXS: '0px 1px 2px 0px rgba(26, 84, 142, 0.05)',
        buttonShadow: '0px 2px 2px 0px rgba(255, 255, 255, 0.3) inset',
        virtualPOP: '0px 32px 64px -12px rgba(0, 43, 64, 0.14)',
        virtualItem: '0px 24px 9px 0px rgba(12, 19, 26, 0.01)',
        dropdownMenu: '0px 12px 16px -4px rgba(0, 43, 64, 0.08)',
        input: '0px 1px 2px 0px rgba(0, 43, 64, 0.05)',
        inputFocus: '0px 0px 0px 4px rgba(124, 206, 247, 0.25)',
        videoName: '0px 1px 4px 0px rgba(0, 0, 0, 0.25)',
      },
      colors: {
        primaryColor: '#004D90',
        secondaryColor: '#24AEF7',
        brandRed: '#ED2139',
        darkPrimary: '#01102B',
        darkSecondary: '#001222',
        darkSecondary2: '#0B2D65',
        darkSecondary3: '#031A3E',
        darkText: '#A7CCED',
        Blue: '#00A1F2',
        DarkBlue: '#069',
        Gray: {
          25: '#FAFCFF',
          50: '#F0F6FC',
          100: '#E1EDFA',
          200: '#D3E5F7',
          300: '#C2DAF2',
          500: 'rgba(143, 173, 204, 1)',
          600: '#7493B2',
          700: '#4D6680',
          800: '#233240',
          900: '#131d26',
          950: '#0C131A',
        },
        Red: {
          25: '#FFFAFA',
          50: '#FCF0F0',
          100: 'rgba(250, 225, 225, 1)',
          200: '#F7BABA',
          400: '#FA3232',
          600: '#CC0000',
        },
      },
      borderRadius: {
        tlblD: '0 0 20px 20px',
        trbrD: '20px 20px 0 0',
        MSG: '0 15px 15px',
        MSGME: '15px 0 15px 15px',
      },
      screens: {
        '3xl': '1640px',
      },
    },
  },
  plugins: [],
};
