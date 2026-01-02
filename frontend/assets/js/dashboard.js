// Ensure auth
if (!api.isAuthenticated()) {
    window.location.href = 'index.html';
}

const user = JSON.parse(localStorage.getItem('user'));
document.getElementById('adminName').textContent = user.username;

// Load Licenses
async function loadLicenses() {
    try {
        const licenses = await api.request('/licenses');
        const tbody = document.getElementById('licenseTableBody');
        tbody.innerHTML = '';
        
        let activeCount = 0;
        let blockedCount = 0;
        let totalDevices = 0; // This would require more data from API ideally, or summing up.

        licenses.forEach(license => {
            if (license.status === 'active') activeCount++;
            if (license.status === 'blocked') blockedCount++;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${license.id}</td>
                <td><code class="text-primary">${license.license_key}</code></td>
                <td>${license.max_devices}</td>
                <td>${license.is_lifetime ? '<span class="badge bg-success">Lifetime</span>' : new Date(license.expire_at).toLocaleDateString()}</td>
                <td><span class="badge bg-${license.status === 'active' ? 'success' : 'danger'}">${license.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="viewDevices(${license.id})">Devices</button>
                    <button class="btn btn-sm btn-warning" onclick="editLicense(${license.id})">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteLicense(${license.id})">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Update stats
        document.getElementById('totalLicenses').textContent = licenses.length;
        document.getElementById('activeLicenses').textContent = activeCount;
        document.getElementById('blockedLicenses').textContent = blockedCount;

    } catch (error) {
        alert('Failed to load licenses: ' + error.message);
    }
}

// Create License
document.getElementById('createLicenseForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const max_devices = document.getElementById('newMaxDevices').value;
    const is_lifetime = document.getElementById('newIsLifetime').checked;
    const expire_at = document.getElementById('newExpireAt').value;

    try {
        await api.request('/licenses', 'POST', {
            max_devices,
            is_lifetime,
            expire_at: is_lifetime ? null : expire_at
        });
        const modal = bootstrap.Modal.getInstance(document.getElementById('createLicenseModal'));
        modal.hide();
        loadLicenses();
        alert('License created successfully!');
    } catch (error) {
        alert('Error: ' + error.message);
    }
});

// View Devices
async function viewDevices(licenseId) {
    try {
        const devices = await api.request(`/licenses/${licenseId}/devices`);
        const list = document.getElementById('deviceList');
        list.innerHTML = '';

        if (devices.length === 0) {
            list.innerHTML = '<li class="list-group-item">No devices connected.</li>';
        } else {
            devices.forEach(device => {
                const li = document.createElement('li');
                li.className = 'list-group-item d-flex justify-content-between align-items-center';
                li.innerHTML = `
                    <div>
                        <strong>ID:</strong> ${device.device_fingerprint}<br>
                        <small class="text-muted">Last seen: ${new Date(device.last_seen_at).toLocaleString()}</small>
                    </div>
                    <button class="btn btn-sm btn-outline-danger" onclick="removeDevice(${licenseId}, ${device.id})">Remove</button>
                `;
                list.appendChild(li);
            });
        }
        
        const modal = new bootstrap.Modal(document.getElementById('devicesModal'));
        modal.show();
    } catch (error) {
        alert('Failed to load devices: ' + error.message);
    }
}

async function removeDevice(licenseId, deviceId) {
    if (!confirm('Are you sure you want to remove this device?')) return;
    try {
        await api.request(`/licenses/${licenseId}/devices/${deviceId}`, 'DELETE');
        viewDevices(licenseId); // Refresh list
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function deleteLicense(id) {
    if (!confirm('Are you sure? This cannot be undone.')) return;
    try {
        await api.request(`/licenses/${id}`, 'DELETE');
        loadLicenses();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// Initial Load
loadLicenses();

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
    api.logout();
});
