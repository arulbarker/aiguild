import { spawn } from 'child_process'
import { resolve } from 'path'

const SSH_KEY = resolve(process.env.USERPROFILE || process.env.HOME, '.ssh/aiguild_vps')
const VPS = 'root@187.77.122.42'

console.log('🔌 Membuka tunnel SSH ke database VPS...')

const tunnel = spawn('ssh', [
  '-N',
  '-L', '5433:aiguild-postgres:5432',
  '-i', SSH_KEY,
  '-o', 'StrictHostKeyChecking=no',
  '-o', 'ServerAliveInterval=60',
  VPS,
], { stdio: 'ignore' })

tunnel.on('error', (e) => {
  console.error('❌ Tunnel gagal:', e.message)
  console.error('Pastikan kamu punya SSH key di:', SSH_KEY)
  process.exit(1)
})

// Tunggu tunnel siap
await new Promise(r => setTimeout(r, 1500))
console.log('✅ Tunnel aktif: localhost:5433 → aiguild-postgres:5432')
console.log('🚀 Menjalankan dev server...\n')

const dev = spawn('next', ['dev'], {
  stdio: 'inherit',
  shell: true,
})

function cleanup() {
  tunnel.kill()
  dev.kill()
  process.exit(0)
}

process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)
dev.on('exit', cleanup)
