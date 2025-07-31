// Di admin.html
// firebase.auth().onAuthStateChanged(function(user) {
//     if (!user) {
//         // Jika belum login, redirect ke index
//         window.location.href = 'index.html';
//     }
// });

// Referensi ke Firebase Database
const vendorsRef = database.ref('vendors');

// Elemen UI
const vendorForm = document.getElementById('vendorForm');
const vendorNameInput = document.getElementById('vendorName');
const vendorIdInput = document.getElementById('vendorId');
const saveVendorBtn = document.getElementById('saveVendorBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const vendorSearchInput = document.getElementById('vendorSearchInput');
const vendorsTableBody = document.getElementById('vendorsTableBody');
const formTitle = document.getElementById('formTitle');

// Mode edit
let isEditMode = false;

// Load data vendor
function loadVendors(searchTerm = '') {
    vendorsRef.on('value', (snapshot) => {
        vendorsTableBody.innerHTML = '';
        const vendors = [];
        
        snapshot.forEach(childSnapshot => {
            vendors.push({
                id: childSnapshot.key,
                ...childSnapshot.val()
            });
        });

        // Filter berdasarkan search term
        const filteredVendors = vendors.filter(vendor => 
            vendor.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (filteredVendors.length === 0) {
            vendorsTableBody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center py-4">Tidak ada data vendor</td>
                </tr>
            `;
            return;
        }

        // Urutkan berdasarkan tanggal dibuat (terbaru pertama)
        filteredVendors.sort((a, b) => b.createdAt - a.createdAt);

        // Tampilkan di tabel
        filteredVendors.forEach((vendor, index) => {
            const row = document.createElement('tr');
            const date = new Date(vendor.createdAt);
            const formattedDate = date.toLocaleDateString('id-ID', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });

            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${vendor.name}</td>
                <td>${formattedDate}</td>
                <td class="action-buttons">
                    <button class="btn btn-sm btn-warning edit-btn" data-id="${vendor.id}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-danger delete-btn" data-id="${vendor.id}">
                        <i class="fas fa-trash"></i> Hapus
                    </button>
                </td>
            `;

            vendorsTableBody.appendChild(row);

            // Tambahkan event listener untuk tombol edit dan delete
            row.querySelector('.edit-btn').addEventListener('click', () => editVendor(vendor.id));
            row.querySelector('.delete-btn').addEventListener('click', () => deleteVendor(vendor.id));
        });
    });
}

// Tambah/edit vendor
vendorForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = vendorNameInput.value.trim();
    const id = vendorIdInput.value;

    if (!name) {
        alert('Nama vendor tidak boleh kosong!');
        return;
    }

    const vendorData = {
        name,
        createdAt: id ? firebase.database.ServerValue.TIMESTAMP : firebase.database.ServerValue.TIMESTAMP
    };

    if (isEditMode) {
        // Update vendor
        vendorsRef.child(id).update(vendorData)
            .then(() => {
                alert('Vendor berhasil diupdate!');
                resetForm();
            })
            .catch(error => {
                console.error('Error updating vendor:', error);
                alert('Gagal mengupdate vendor');
            });
    } else {
        // Tambah vendor baru
        vendorsRef.push(vendorData)
            .then(() => {
                alert('Vendor berhasil ditambahkan!');
                resetForm();
            })
            .catch(error => {
                console.error('Error adding vendor:', error);
                alert('Gagal menambahkan vendor');
            });
    }
});

// Edit vendor
function editVendor(id) {
    vendorsRef.child(id).once('value', (snapshot) => {
        const vendor = snapshot.val();
        
        // Set form ke mode edit
        isEditMode = true;
        formTitle.textContent = 'Edit Vendor';
        vendorIdInput.value = id;
        vendorNameInput.value = vendor.name;
        saveVendorBtn.innerHTML = '<i class="fas fa-save"></i> Update';
        cancelEditBtn.style.display = 'inline-block';
        
        // Scroll ke form
        vendorNameInput.focus();
    });
}

// Hapus vendor
function deleteVendor(id) {
    if (confirm('Apakah Anda yakin ingin menghapus vendor ini?\nItem yang menggunakan vendor ini akan tetap ada.')) {
        vendorsRef.child(id).remove()
            .then(() => {
                alert('Vendor berhasil dihapus!');
            })
            .catch(error => {
                console.error('Error deleting vendor:', error);
                alert('Gagal menghapus vendor');
            });
    }
}

// Reset form
function resetForm() {
    isEditMode = false;
    vendorForm.reset();
    vendorIdInput.value = '';
    formTitle.textContent = 'Tambah Vendor Baru';
    saveVendorBtn.innerHTML = '<i class="fas fa-save"></i> Simpan';
    cancelEditBtn.style.display = 'none';
}

// Batalkan edit
cancelEditBtn.addEventListener('click', resetForm);

// Pencarian vendor
vendorSearchInput.addEventListener('input', (e) => {
    loadVendors(e.target.value);
});

// Load data saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    loadVendors();
});