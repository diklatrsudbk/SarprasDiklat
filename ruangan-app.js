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

// 2. Fungsi Menampilkan ke Tabel
function renderTable(data) {
  tableBody.innerHTML = ''
  data.forEach(item => {
    const row = document.createElement('tr')
    row.innerHTML = `
      <td>
        <strong>${item.nama}</strong><br>
        <small>${item.unit} - ${item.institusi || ''}</small>
      </td>
      <td>${item.ruangan}</td>
      <td><small>${item.tanggal_info}</small></td>
      <td>${item.jam_mulai} - ${item.jam_selesai}</td>
      <td><span class="status-badge status-${item.status.toLowerCase()}">${item.status}</span></td>
      <td>
        ${item.status === 'Request' ? `
          <button class="btn-action btn-approve" onclick="updateStatus('${item.id}', 'Booking')">Approve</button>
          <button class="btn-action btn-cancel" onclick="updateStatus('${item.id}', 'Cancel')">Reject</button>
        ` : `<small>No Action</small>`}
      </td>
    `
    tableBody.appendChild(row)
  })
}

// 3. Fungsi Update Status
window.updateStatus = async (id, newStatus) => {
  const { error } = await supabase
    .from('peminjaman_ruangan')
    .update({ status: newStatus })
    .eq('id', id)

  if (error) {
    alert('Gagal update status')
  } else {
    fetchData() // Refresh tabel
  }
}

// Jalankan saat halaman load
fetchData()
