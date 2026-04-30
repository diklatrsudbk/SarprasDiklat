import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://sghdzubfevfeajigxwaq.supabase.co/'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnaGR6dWJmZXZmZWFqaWd4d2FxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0MTA0NjMsImV4cCI6MjA5Mjk4NjQ2M30.lpO8vjFur4SwasKYiutJX5aW3MbSWxH1d7u3JFzgaXQ'
const supabase = createClient(supabaseUrl, supabaseKey)

const tableBody = document.getElementById('table-body')

// 1. Fungsi Mengambil Data
async function fetchData() {
  const { data, error } = await supabase
    .from('peminjaman_ruangan')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetch:', error)
    return
  }

  renderTable(data)
}

// 2. Fungsi Menampilkan ke Tabel (Diselaraskan dengan UI Baru)
function renderTable(data) {
  tableBody.innerHTML = ''
  data.forEach(item => {
    const row = document.createElement('tr')
    
    // Logika warna badge status
    const statusClass = item.status ? item.status.toLowerCase() : 'request';
    
    row.innerHTML = `
      <td>
        <strong>${item.nama}</strong><br>
        <small style="color: #64748b;">${item.unit} ${item.institusi ? ' - ' + item.institusi : ''}</small>
      </td>
      <td><span style="font-weight: 500;">${item.ruangan}</span></td>
      <td><small>${item.tanggal_info}</small></td>
      <td>${item.jam_mulai.substring(0,5)} - ${item.jam_selesai.substring(0,5)}</td>
      <td>
        <span class="status-badge status-${statusClass}">${item.status}</span>
      </td>
      <td>
        <div class="action-group">
          ${item.status === 'Request' ? `
            <button class="btn btn-approve" onclick="updateStatus('${item.id}', 'Booking')" title="Approve">
              <i class="fa-solid fa-check"></i>
            </button>
            <button class="btn btn-reject" onclick="updateStatus('${item.id}', 'Cancel')" title="Reject">
              <i class="fa-solid fa-xmark"></i>
            </button>
          ` : `<small style="color: #cbd5e1;">Selesai</small>`}
        </div>
      </td>
    `
    tableBody.appendChild(row)
  })
}

// 3. Fungsi Update Status (Global agar bisa dipanggil tombol)
window.updateStatus = async (id, newStatus) => {
  // Konfirmasi sederhana sebelum eksekusi
  const konfirmasi = confirm(`Ubah status menjadi ${newStatus}?`);
  if (!konfirmasi) return;

  const { error } = await supabase
    .from('peminjaman_ruangan')
    .update({ status: newStatus })
    .eq('id', id)

  if (error) {
    alert('Gagal update status: ' + error.message)
  } else {
    // Tidak perlu panggil fetchData manual jika Real-time aktif, 
    // tapi untuk amannya tetap panggil jika koneksi lambat.
    fetchData() 
  }
}

// 4. FITUR REAL-TIME: Update otomatis jika ada data baru/berubah
supabase
  .channel('perubahan-data')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'peminjaman_ruangan' }, () => {
    console.log('Ada perubahan data di database, menyegarkan tabel...');
    fetchData();
  })
  .subscribe()

// Jalankan saat halaman pertama kali dibuka
fetchData()
