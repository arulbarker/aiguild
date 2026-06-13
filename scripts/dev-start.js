import { spawn, spawnSync } from 'child_process'

// Pastikan container postgres lokal jalan
console.log('🐘 Memastikan database lokal aktif...')
spawnSync('docker', ['start', 'aiguild-postgres-dev'], { stdio: 'ignore' })
console.log('✅ Database siap\n')

console.log('🚀 Menjalankan dev server...\n')

const dev = spawn('next', ['dev'], {
  stdio: 'inherit',
  shell: true,
})

process.on('SIGINT', () => { dev.kill(); process.exit(0) })
process.on('SIGTERM', () => { dev.kill(); process.exit(0) })
dev.on('exit', (code) => process.exit(code))
