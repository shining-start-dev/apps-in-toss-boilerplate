import { networkInterfaces } from 'node:os'
import { defineConfig } from '@apps-in-toss/web-framework/config'

function isPrivateIpv4(address: string) {
  if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(address)) {
    return true
  }

  if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(address)) {
    return true
  }

  const matched172Range = address.match(/^172\.(\d{1,3})\.\d{1,3}\.\d{1,3}$/)
  if (matched172Range === null) {
    return false
  }

  const secondOctet = Number(matched172Range[1])
  return secondOctet >= 16 && secondOctet <= 31
}

function resolveWebHost() {
  const configuredHost = process.env.AIT_WEB_HOST?.trim() || process.env.VITE_AIT_WEB_HOST?.trim()
  if (configuredHost) {
    return configuredHost
  }

  const interfaces = networkInterfaces()
  const preferredInterfaceNames = ['en0', 'en1']

  for (const name of preferredInterfaceNames) {
    const details = interfaces[name]
    for (const detail of details ?? []) {
      if (detail.family === 'IPv4' && !detail.internal && isPrivateIpv4(detail.address)) {
        return detail.address
      }
    }
  }

  for (const [name, details] of Object.entries(interfaces)) {
    if (
      name === 'lo0' ||
      name.startsWith('utun') ||
      name.startsWith('awdl') ||
      name.startsWith('llw')
    ) {
      continue
    }

    for (const detail of details ?? []) {
      if (detail.family === 'IPv4' && !detail.internal && isPrivateIpv4(detail.address)) {
        return detail.address
      }
    }
  }

  return 'localhost'
}

const webHost = resolveWebHost()

export default defineConfig({
  appName: 'apps-in-toss-boilerplate',
  brand: {
    displayName: 'AIT Boilerplate',
    primaryColor: '#0064FF',
    icon: 'https://static.toss.im/ml-product/tosst_22367_1_rembg_upscaled.png',
  },
  web: {
    host: webHost,
    port: 5173,
    commands: {
      dev: `vite --host ${webHost} --strictPort --port 5173`,
      build: 'tsc -b && vite build',
    },
  },
  permissions: [],
  outdir: 'dist',
  webViewProps: {
    type: 'partner',
  },
})
