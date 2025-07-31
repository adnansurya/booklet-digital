// Variabel global untuk menyimpan daftar vendor
let vendorsList = [];

// Fungsi untuk memuat daftar vendor
function loadVendors() {
    const vendorsRef = database.ref('vendors');
    vendorsRef.on('value', (snapshot) => {
        vendorsList = [];
        snapshot.forEach(childSnapshot => {
            vendorsList.push(childSnapshot.val().name);
        });
        // Hapus duplikat dan sort
        vendorsList = [...new Set(vendorsList)].sort();
    });
}

// Fungsi untuk menampilkan autocomplete
function showAutocomplete(inputElement, results) {
    const containerId = inputElement.id === 'itemVendor' ? 'vendorAutocomplete' : 'editVendorAutocomplete';
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    if (results.length === 0) {
        container.style.display = 'none';
        return;
    }

    results.forEach(vendor => {
        const item = document.createElement('div');
        item.className = 'vendor-autocomplete-item';
        item.textContent = vendor;
        item.addEventListener('click', () => {
            inputElement.value = vendor;
            container.style.display = 'none';
        });
        container.appendChild(item);
    });

    container.style.display = 'block';
}

// Fungsi untuk setup autocomplete
function setupVendorAutocomplete() {
    const vendorInputs = ['itemVendor', 'editItemVendor'];

    vendorInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        const container = document.getElementById(inputId === 'itemVendor' ? 'vendorAutocomplete' : 'editVendorAutocomplete');

        input.addEventListener('input', function (e) {
            const searchTerm = e.target.value.toLowerCase();
            const filteredVendors = vendorsList.filter(vendor =>
                vendor.toLowerCase().includes(searchTerm)
            );
            showAutocomplete(input, filteredVendors);
        });

        input.addEventListener('focus', function () {
            if (this.value === '') {
                showAutocomplete(this, vendorsList.slice(0, 5)); // Tampilkan 5 vendor pertama
            }
        });

        input.addEventListener('blur', function () {
            setTimeout(() => {
                container.style.display = 'none';
            }, 200);
        });
    });

    // Sembunyikan autocomplete saat klik di luar
    document.addEventListener('click', function (e) {
        if (!e.target.classList.contains('form-control') ||
            !e.target.id.includes('Vendor')) {
            document.getElementById('vendorAutocomplete').style.display = 'none';
            document.getElementById('editVendorAutocomplete').style.display = 'none';
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    // Referensi ke Firebase Database
    const itemsRef = database.ref('items');

    // Elemen UI
    const itemsTableBody = document.getElementById('itemsTableBody');
    const addItemForm = document.getElementById('addItemForm');
    const editItemForm = document.getElementById('editItemForm');
    const saveItemBtn = document.getElementById('saveItemBtn');
    const updateItemBtn = document.getElementById('updateItemBtn');
    const searchInput = document.getElementById('searchInput');

    // Modal instances
    const addItemModal = new bootstrap.Modal(document.getElementById('addItemModal'));
    const editItemModal = new bootstrap.Modal(document.getElementById('editItemModal'));

    // Fungsi untuk convert image ke base64
    function convertToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    // Tambah item baru dengan base64 image
    saveItemBtn.addEventListener('click', async () => {
        const name = document.getElementById('itemName').value;
        const vendor = document.getElementById('itemVendor').value;
        const price = parseFloat(document.getElementById('itemPrice').value);
        const desc = document.getElementById('itemDesc').value;
        const imageFile = document.getElementById('itemImage').files[0];

        if (!name || !vendor || !price || !desc) {
            alert('Harap isi semua field yang diperlukan!');
            return;
        }

        let imageBase64 = '';
        if (imageFile) {
            try {
                imageBase64 = await convertToBase64(imageFile);
            } catch (error) {
                console.error('Error converting image:', error);
                alert('Gagal mengkonversi gambar');
                return;
            }
        }

        // Simpan ke Firebase
        itemsRef.push({
            name,
            vendor,
            price,
            desc,
            imageBase64
        }).then(() => {
            alert('Item berhasil ditambahkan!');
            document.getElementById('addItemForm').reset();
            addItemModal.hide();
        }).catch(error => {
            console.error('Error adding item: ', error);
            alert('Gagal menambahkan item');
        });
    });

    // Update item dengan base64 image
    updateItemBtn.addEventListener('click', async () => {
        const itemId = document.getElementById('editItemId').value;
        const name = document.getElementById('editItemName').value;
        const vendor = document.getElementById('editItemVendor').value;
        const price = parseFloat(document.getElementById('editItemPrice').value);
        const desc = document.getElementById('editItemDesc').value;
        const imageFile = document.getElementById('editItemImage').files[0];

        if (!name || !vendor || !price || !desc) {
            alert('Harap isi semua field yang diperlukan!');
            return;
        }

        const updates = {
            name,
            vendor,
            price,
            desc
        };

        if (imageFile) {
            try {
                updates.imageBase64 = await convertToBase64(imageFile);
            } catch (error) {
                console.error('Error converting image:', error);
                alert('Gagal mengkonversi gambar');
                return;
            }
        }

        itemsRef.child(itemId).update(updates)
            .then(() => {
                alert('Item berhasil diupdate!');
                editItemModal.hide();
            })
            .catch(error => {
                console.error('Error updating item: ', error);
                alert('Gagal mengupdate item');
            });
    });

    // Load data dari Firebase
    function loadItems() {
        itemsRef.on('value', (snapshot) => {
            itemsTableBody.innerHTML = '';
            const items = snapshot.val();

            if (items) {
                Object.keys(items).forEach(key => {
                    const item = items[key];
                    const row = document.createElement('tr');

                    // Gunakan base64 image jika ada, atau placeholder jika tidak
                    const imageSrc = item.imageBase64 || 'https://via.placeholder.com/50';

                    row.innerHTML = `
                        <td><img src="${imageSrc}" alt="${item.name}" style="max-width: 50px; max-height: 50px;"></td>
                        <td>${item.name}</td>
                        <td>${item.vendor}</td>
                        <td>Rp ${item.price.toLocaleString('id-ID')}</td>
                        <td class="action-buttons">
                            <button class="btn btn-sm btn-warning edit-btn" data-id="${key}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger delete-btn" data-id="${key}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    `;

                    itemsTableBody.appendChild(row);
                });

                // Tambahkan event listener untuk tombol edit dan delete
                document.querySelectorAll('.edit-btn').forEach(btn => {
                    btn.addEventListener('click', editItem);
                });

                document.querySelectorAll('.delete-btn').forEach(btn => {
                    btn.addEventListener('click', deleteItem);
                });
            } else {
                itemsTableBody.innerHTML = '<tr><td colspan="5" class="text-center">Tidak ada data</td></tr>';
            }
        });
    }

    // Fungsi edit item (tampilkan data di modal)
    function editItem(e) {
        const itemId = e.target.closest('.edit-btn').getAttribute('data-id');

        itemsRef.child(itemId).once('value', (snapshot) => {
            const item = snapshot.val();

            document.getElementById('editItemId').value = itemId;
            document.getElementById('editItemName').value = item.name;
            document.getElementById('editItemVendor').value = item.vendor;
            document.getElementById('editItemPrice').value = item.price;
            document.getElementById('editItemDesc').value = item.desc;

            const currentImageContainer = document.getElementById('currentImageContainer');
            if (item.imageBase64) {
                currentImageContainer.innerHTML = `<img src="${item.imageBase64}" alt="Current Image" style="max-width: 100%; max-height: 150px;">`;
            } else {
                currentImageContainer.innerHTML = '<p>Tidak ada gambar</p>';
            }

            editItemModal.show();
        });
    }

    // Fungsi delete item
    function deleteItem(e) {
        if (confirm('Apakah Anda yakin ingin menghapus item ini?')) {
            const itemId = e.target.closest('.delete-btn').getAttribute('data-id');

            itemsRef.child(itemId).remove()
                .then(() => {
                    alert('Item berhasil dihapus!');
                })
                .catch(error => {
                    console.error('Error removing item: ', error);
                    alert('Gagal menghapus item');
                });
        }
    }

    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();
        const rows = itemsTableBody.querySelectorAll('tr');

        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    });

    // Load data saat halaman dimuat
    loadItems();
    loadVendors();
    setupVendorAutocomplete();

    // Simpan vendor baru saat menyimpan item
    document.getElementById('saveItemBtn').addEventListener('click', function () {
        const vendorName = document.getElementById('itemVendor').value.trim();
        if (vendorName && !vendorsList.includes(vendorName)) {
            database.ref('vendors').push({
                name: vendorName,
                createdAt: firebase.database.ServerValue.TIMESTAMP
            });
        }
    });

    document.getElementById('updateItemBtn').addEventListener('click', function () {
        const vendorName = document.getElementById('editItemVendor').value.trim();
        if (vendorName && !vendorsList.includes(vendorName)) {
            database.ref('vendors').push({
                name: vendorName,
                createdAt: firebase.database.ServerValue.TIMESTAMP
            });
        }
    });

});
