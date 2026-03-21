const API_URL = 'http://localhost:5000/api';

const runTests = async () => {
  try {
    console.log('--- Starting Authentication Tests ---');

    // 1. Register User (Normal)
    console.log('\nTesting Signup (Normal)...');
    const registerRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Test User',
        username: 'testuser_' + Date.now(),
        email: 'test_' + Date.now() + '@example.com',
        password: 'password123',
      }),
    });
    const registerData = await registerRes.json();
    if (!registerRes.ok) throw new Error(registerData.message);
    console.log('Signup Successful:', registerData.username);
    const token = registerData.token;

    // 2. Login User
    console.log('\nTesting Login...');
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: registerData.username,
        password: 'password123',
      }),
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok) throw new Error(loginData.message);
    console.log('Login Successful:', loginData.username);

    // 3. Get Profile
    console.log('\nTesting Protected Profile Route...');
    const profileRes = await fetch(`${API_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const profileData = await profileRes.json();
    if (!profileRes.ok) throw new Error(profileData.message);
    console.log('Profile Retreived:', profileData.fullName);

    // 4. Test RBAC (Admin) - expect failure
    console.log('\nTesting RBAC (Admin-only route with Normal User)...');
    const adminVerifyFailRes = await fetch(`${API_URL}/admin/verify`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (adminVerifyFailRes.status === 403 || adminVerifyFailRes.status === 401) {
      console.log('Success: Access Denied for Normal User (as expected)');
    } else {
      console.log('ERROR: Normal user accessed/errored admin route unexpected response code:', adminVerifyFailRes.status);
    }

    // 5. Register Admin
    console.log('\nTesting Admin Signup...');
    const adminRegisterRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Admin User',
        username: 'adminuser_' + Date.now(),
        email: 'admin_' + Date.now() + '@example.com',
        password: 'adminpassword',
        role: 'admin',
      }),
    });
    const adminRegisterData = await adminRegisterRes.json();
    if (!adminRegisterRes.ok) throw new Error(adminRegisterData.message);
    const adminToken = adminRegisterData.token;
    console.log('Admin Signup Successful:', adminRegisterData.username);

    // 6. Test RBAC (Admin-only route with Admin User)
    console.log('\nTesting RBAC (Admin-only route with Admin User)...');
    const adminVerifyRes = await fetch(`${API_URL}/admin/verify`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminVerifyData = await adminVerifyRes.json();
    if (!adminVerifyRes.ok) throw new Error(adminVerifyData.message);
    console.log('Success:', adminVerifyData.message);

    console.log('\n--- All Tests Passed Successfully! ---');
  } catch (error) {
    console.error('Test Failed:', error.message);
  }
};

runTests();
