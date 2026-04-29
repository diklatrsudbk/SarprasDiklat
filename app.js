import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://sghdzubfevfeajigxwaq.supabase.co/'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnaGR6dWJmZXZmZWFqaWd4d2FxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0MTA0NjMsImV4cCI6MjA5Mjk4NjQ2M30.lpO8vjFur4SwasKYiutJX5aW3MbSWxH1d7u3JFzgaXQ'
const supabase = createClient(supabaseUrl, supabaseKey)

const form = document.getElementById('formPinjam')
const statusText = document.getElementById('status-message')
const displayDurasi = document.getElementById('val_durasi')

// 1. Inisialisasi Flatpickr (Multi-Date)
flatpickr("#tanggal_info", {
    mode: "multiple",
    dateFormat: "d-m-Y",
    conjunction: ", ",
    locale: "id", // Pastikan sudah panggil script ID di HTML
    onChange: function(selectedDates, dateStr, instance) {
        // Bagian preview tanggal opsional jika kamu ingin pakai tag visual
        console.log("Tanggal terpilih:", dateStr);
    }
});

// 2. Fungsi Hitung Durasi
function hitungDurasi() {
    const mulai = document.getElementById('jam_mulai').value
    const selesai = document.getElementById('jam_selesai').value

    if (mulai && selesai) {
        const t1 = new Date(`2026-01-01T${mulai}`)
        const t2 = new Date(`2026-01-01T${selesai}`)
        
        if (t2 > t1) {
            const diffMs = t2 - t1
            const diffHrs = Math.floor(diffMs / 3600000)
            const diffMins = Math.round(((diffMs % 3600000) / 60000))
            const hasil = `${diffHrs} Jam ${diffMins} Menit`
            displayDurasi.innerText = hasil
            return hasil
        } else {
            displayDurasi.innerText = "Jam tidak valid"
            return "0 Jam 0 Menit"
        }
    }
    return "-"
}

// Event listener jam
document.getElementById('jam_mulai').addEventListener('change', hitungDurasi)
document.getElementById('jam_selesai').addEventListener('change', hitungDurasi)

// 3. Submit Form
form.addEventListener('submit', async (e) => {
    e.preventDefault()
    
    // Animasi tombol sedang loading (opsional)
    const btn = document.getElementById('btnKirim');
    btn.disabled = true;
    btn.innerText = 'Mengirim...';

    const durasiFinal = hitungDurasi()

    const payload = {
        unit: document.getElementById('unit').value,
        nama: document.getElementById('nama').value,
        identitas: document.getElementById('identitas').value,
        institusi: document.getElementById('institusi').value,
        jurusan_divisi: document.getElementById('jurusan_divisi').value,
        nomor_telp: document.getElementById('nomor_telp').value,
        judul_acara: document.getElementById('judul_acara').value,
        jumlah_peserta: parseInt(document.getElementById('jumlah_peserta').value),
        ruangan: document.getElementById('ruangan').value,
        tanggal_info: document.getElementById('tanggal_info').value,
        jam_mulai: document.getElementById('jam_mulai').value,
        jam_selesai: document.getElementById('jam_selesai').value,
        durasi: durasiFinal,
        status: 'Request'
    }

    const { error } = await supabase
        .from('peminjaman_ruangan')
        .insert([payload])

    if (error) {
        statusText.innerText = '❌ Gagal: ' + error.message
        statusText.style.color = '#dc2626'
        btn.disabled = false;
        btn.innerText = 'Kirim Permohonan';
    } else {
        statusText.innerText = '✅ Berhasil Terkirim! Admin akan segera memproses.'
        statusText.style.color = '#16a34a'
        form.reset()
        displayDurasi.innerText = "-"
        btn.disabled = false;
        btn.innerHTML = '<span>Kirim Permohonan</span> <i class="fa-solid fa-paper-plane"></i>';
    }
})
