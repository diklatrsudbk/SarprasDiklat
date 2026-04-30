import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://sghdzubfevfeajigxwaq.supabase.co/'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnaGR6dWJmZXZmZWFqaWd4d2FxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0MTA0NjMsImV4cCI6MjA5Mjk4NjQ2M30.lpO8vjFur4SwasKYiutJX5aW3MbSWxH1d7u3JFzgaXQ'
const supabase = createClient(supabaseUrl, supabaseKey)

const ADMIN_PASSWORD = "diklatrsudbk";
const tableBody = document.getElementById('table-body')
let activeId = null;

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

// 2. Fungsi Menampilkan ke Tabel (Sudah diperbaiki urutan kolomnya)
function renderTable(data) {
  tableBody.innerHTML = '';
  
  data.forEach(item => {
    const row = document.createElement('tr');
    const statusClass = item.status ? item.status.toLowerCase() : 'request';
    
    // Format Jam agar rapi (HH:mm)
    const jamMulai = item.jam_mulai ? item.jam_mulai.substring(0, 5) : '--:--';
    const jamSelesai = item.jam_selesai ? item.jam_selesai.substring(0, 5) : '--:--';

    row.innerHTML = `
      <td>
        <strong>${item.nama}</strong><br>
        <small style="color: #64748b;">${item.unit}</small>
      </td>
      <td>${item.ruangan}</td>
      <td><small>${item.tanggal_info}</small></td>
      <td>${jamMulai} - ${jamSelesai}</td> <td>
        <span class="status-badge status-${statusClass}">${item.status}</span>
      </td>
      <td>
        <div class="action-group">
          ${item.status === 'Request' ? `
            <button class="btn btn-approve" onclick="updateStatus('${item.id}', 'Booking')">Approve</button>
            <button class="btn btn-reject" onclick="updateStatus('${item.id}', 'Cancel')">Reject</button>
          ` : ''}

          ${item.status === 'Booking' ? `
            <button class="btn" style="background:#0ea5e9; color:white;" onclick="pemicuUpload('${item.id}')">
              <i class="fa-solid fa-camera"></i> Confirm
            </button>
            <button class="btn btn-reject" onclick="updateStatus('${item.id}', 'Cancel')">Cancel</button>
          ` : ''}

          ${(item.status === 'Selesai' || item.status === 'Cancel') ? `
            <small style="color:#94a3b8;">Terarsip</small>
          ` : ''}
        </div>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

// 3. Fungsi Update Status (Approve/Reject/Cancel)
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

// 4. Fungsi Pemicu Kamera (Confirm Pemakaian)
window.pemicuUpload = (id) => {
  const inputPass = prompt("Masukkan Password Admin untuk Konfirmasi Pemakaian (Kamera):");
  
  if (inputPass === null) return;
  if (inputPass !== ADMIN_PASSWORD) {
    alert("❌ Password Salah!");
    return;
  }

  activeId = id; 
  document.getElementById('fileInput').click(); 
};

// 5. Logika Upload Foto (Setelah Kamera diambil)
const fileInput = document.getElementById('fileInput');
if(fileInput) {
  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file || !activeId) return;

    // Optional: Munculkan loading jika kamu sudah buat elemennya
    console.log("Sedang mengunggah...");

    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${activeId}_${Date.now()}.${fileExt}`;
        const filePath = `bukti/${fileName}`;

        // Upload ke Bucket Storage 'bukti_foto'
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('bukti_foto')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Ambil URL Foto
        const { data: urlData } = supabase.storage
            .from('bukti_foto')
            .getPublicUrl(filePath);

        // Update status ke Selesai
        const { error: updateError } = await supabase
            .from('peminjaman_ruangan')
            .update({ 
                status: 'Selesai',
                bukti_foto: urlData.publicUrl 
            })
            .eq('id', activeId);

        if (updateError) throw updateError;

        alert("Pemakaian Berhasil Dikonfirmasi!");
        fetchData();

    } catch (err) {
        alert("Gagal: " + err.message);
    }
  });
}

// 6. FITUR REAL-TIME
supabase
  .channel('perubahan-data')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'peminjaman_ruangan' }, () => {
    fetchData();
  })
  .subscribe()

fetchData();
