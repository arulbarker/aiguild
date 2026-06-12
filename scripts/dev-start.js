import { spawn, spawnSync } from 'child_process'
import { resolve } from 'path'

const SSH_KEY = resolve(process.env.USERPROFILE || process.env.HOME, '.ssh/aiguild_vps')
const VPS = 'root@187.77.122.42'

console.log('🔌 Membuka tunnel SSH ke database VPS...')

// Ambil IP container postgres secara dinamis (spawnSync = no shell, aman dari injection)
let pgIp = '10.0.2.2'
const ipResult = spawnSync('ssh', [
  '-i', SSH_KEY,
  '-o', 'StrictHostKeyChecking=no',
  '-o', 'ConnectTimeout=5',
  VPS,
  "docker inspect aiguild-postgres --format '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}'",
], { encoding: 'utf8', timeout: 8000 })

if (ipResult.status === 0 && ipResult.stdout.trim()) {
  pgIp = ipResult.stdout.trim()
  console.log(`🐘 Postgres IP: ${pgIp}`)
} else {
  console.log(`⚠️  Gagal ambil IP container, pakai default: ${pgIp}`)
}

const tunnel = spawn('ssh', [
  '-N',
  '-L', `5433:${pgIp}:5432`,
  '-i', SSH_KEY,
  '-o', 'StrictHostKeyChecking=no',
  '-o', 'ServerAliveInterval=60',
  VPS,
], { stdio: 'ignore' })

tunnel.on('error', (e) => {
  console.error('❌ Tunnel gagal:', e.message)
  process.exit(1)
})

await new Promise(r => setTimeout(r, 1500))
console.log(`✅ Tunnel aktif: localhost:5433 → ${pgIp}:5432`)
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
