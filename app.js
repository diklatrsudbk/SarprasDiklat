import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'ISI_URL_SUPABASE_KAMU'
const supabaseKey = 'ISI_ANON_KEY_KAMU'

const supabase = createClient(supabaseUrl, supabaseKey)

const form = document.getElementById('formKontak')
const statusText = document.getElementById('status')

form.addEventListener('submit', async (e) => {
  e.preventDefault()

  const nama = document.getElementById('nama').value
  const email = document.getElementById('email').value
  const pesan = document.getElementById('pesan').value

  statusText.innerText = 'Mengirim...'

  const { error } = await supabase
    .from('kontak')
    .insert([
      {
        nama,
        email,
        pesan
      }
    ])

  if (error) {
    console.error(error)

    statusText.innerText = 'Gagal mengirim'
    statusText.style.color = 'red'

    return
  }

  statusText.innerText = 'Berhasil dikirim'
  statusText.style.color = 'green'

  form.reset()
})
