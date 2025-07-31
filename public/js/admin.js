// js/admin.js
document.addEventListener('DOMContentLoaded', function() {
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
    
    // Load data dari Firebase
    function loadItems() {
        itemsRef.on('value', (snapshot) => {
            itemsTableBody.innerHTML = '';
            const items = snapshot.val();
            
            if (items) {
                Object.keys(items).forEach(key => {
                    const item = items[key];
                    const row = document.createElement('tr');
                    
                    row.innerHTML = `
                        <td><img src="${item.imageUrl || 'https://via.placeholder.com/50'}" alt="${item.name}"></td>
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
    
    // Tambah item baru
    saveItemBtn.addEventListener('click', () => {
        const name = document.getElementById('itemName').value;
        const vendor = document.getElementById('itemVendor').value;
        const price = parseFloat(document.getElementById('itemPrice').value);
        const desc = document.getElementById('itemDesc').value;
        const imageFile = document.getElementById('itemImage').files[0];
        
        if (!name || !vendor || !price || !desc) {
            alert('Harap isi semua field yang diperlukan!');
            return;
        }
        
        // Untuk sederhananya, kita akan simpan URL placeholder
        // Di aplikasi nyata, Anda perlu upload gambar ke Firebase Storage
        const imageUrl = 'https://via.placeholder.com/150?text=' + encodeURIComponent(name);
        
        // Simpan ke Firebase
        itemsRef.push({
            name,
            vendor,
            price,
            desc,
            imageUrl
        }).then(() => {
            alert('Item berhasil ditambahkan!');
            addItemForm.reset();
            addItemModal.hide();
        }).catch(error => {
            console.error('Error adding item: ', error);
            alert('Gagal menambahkan item');
        });
    });
    
    // Edit item
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
            currentImageContainer.innerHTML = `<img src="${item.imageUrl}" alt="Current Image">`;
            
            editItemModal.show();
        });
    }
    
    // Update item
    updateItemBtn.addEventListener('click', () => {
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
        
        // Untuk update gambar, di aplikasi nyata perlu upload ke Firebase Storage
        itemsRef.child(itemId).update({
            name,
            vendor,
            price,
            desc
            // imageUrl akan tetap sama kecuali diupdate
        }).then(() => {
            alert('Item berhasil diupdate!');
            editItemModal.hide();
        }).catch(error => {
            console.error('Error updating item: ', error);
            alert('Gagal mengupdate item');
        });
    });
    
    // Hapus item
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
    
    // Fungsi pencarian
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
});