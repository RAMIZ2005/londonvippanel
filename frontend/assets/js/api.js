const API_URL = 'http://localhost:3000';

class ApiService {
    constructor() {
        this.accessToken = localStorage.getItem('accessToken');
        this.refreshToken = localStorage.getItem('refreshToken');
    }

    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        if (this.accessToken) {
            headers['Authorization'] = `Bearer ${this.accessToken}`;
        }
        return headers;
    }

    async request(endpoint, method = 'GET', body = null) {
        const options = {
            method,
            headers: this.getHeaders()
        };
        if (body) {
            options.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(`${API_URL}${endpoint}`, options);
            
            if (response.status === 401 || response.status === 403) {
                // Token might be expired. Handle logout for now.
                // In a real app, implement refresh token flow here.
                this.logout();
                return null;
            }

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong');
            }
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    async login(username, password) {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            this.accessToken = data.accessToken;
            this.refreshToken = data.refreshToken;
            localStorage.setItem('accessToken', this.accessToken);
            localStorage.setItem('refreshToken', this.refreshToken);
            localStorage.setItem('user', JSON.stringify(data.user));
            return data;
        } catch (error) {
            throw error;
        }
    }

    logout() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    }

    isAuthenticated() {
        return !!this.accessToken;
    }
}

const api = new ApiService();
