import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://sghdzubfevfeajigxwaq.supabase.co/'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnaGR6dWJmZXZmZWFqaWd4d2FxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0MTA0NjMsImV4cCI6MjA5Mjk4NjQ2M30.lpO8vjFur4SwasKYiutJX5aW3MbSWxH1d7u3JFzgaXQ'
const supabase = createClient(supabaseUrl, supabaseKey)
const ADMIN_PASSWORD = "diklatrsudbk";

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
  const urlParams = new URLSearchParams(window.location.search);
  const isAdminMode = urlParams.get('mode') === 'admin';

  tableBody.innerHTML = '';
  data.forEach(item => {
    const row = document.createElement('tr');
    const statusClass = item.status ? item.status.toLowerCase() : 'request';
    
    row.innerHTML = `
      <td>
        <strong>${item.nama}</strong><br>
        <small style="color: #64748b;">${item.unit}</small>
      </td>
      <td>${item.ruangan}</td>
      <td><small>${item.tanggal_info}</small></td>
      <td>
        <span class="status-badge status-${statusClass}">${item.status}</span>
      </td>
      <td>
        <div class="action-group">
          ${isAdminMode ? `
            ${item.status === 'Request' ? `
              <button class="btn btn-approve" onclick="updateStatus('${item.id}', 'Booking')">Approve</button>
              <button class="btn btn-reject" onclick="updateStatus('${item.id}', 'Cancel')">Reject</button>
            ` : ''}

            ${item.status === 'Booking' ? `
              <button class="btn" style="background:#0ea5e9; color:white;" onclick="pemicuUpload('${item.id}')">
                <i class="fa-solid fa-camera"></i> Confirm Pemakaian
              </button>
              <button class="btn btn-reject" onclick="updateStatus('${item.id}', 'Cancel')">Cancel</button>
            ` : ''}

            ${(item.status === 'Selesai' || item.status === 'Cancel') ? `
              <small style="color:#94a3b8;">Selesai</small>
            ` : ''}
          ` : `<small style="color:#cbd5e1;">View Only</small>`}
        </div>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

// 3. Fungsi Update Status (Global agar bisa dipanggil tombol)
window.updateStatus = async (id, newStatus) => {
  const inputPass = prompt(`Masukkan Password Admin untuk mengubah status ke ${newStatus}:`);
  
  if (inputPass === null) return; 
  if (inputPass !== ADMIN_PASSWORD) {
    alert("❌ Password Salah!");
    return;
  }

  const { error } = await supabase
    .from('peminjaman_ruangan')
    .update({ status: newStatus })
    .eq('id', id);

  if (error) alert(error.message);
  else fetchData();
};

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
