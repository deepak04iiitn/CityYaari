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
        occupationType: 'student',
        country: 'India',
        state: 'Karnataka',
        city: 'Bengaluru',
        securityQuestion: 'What is my favorite school subject?',
        securityAnswer: 'maths',
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

    // 4. Update profile
    console.log('\nTesting Profile Update...');
    const updatedUsername = 'updateduser_' + Date.now();
    const updatedEmail = 'updated_' + Date.now() + '@example.com';
    const updateProfileRes = await fetch(`${API_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        fullName: 'Updated Test User',
        username: updatedUsername,
        email: updatedEmail,
        occupationType: 'working_professional',
        country: 'India',
        state: 'Delhi',
        city: 'New Delhi',
      }),
    });
    const updateProfileData = await updateProfileRes.json();
    if (!updateProfileRes.ok) throw new Error(updateProfileData.message);
    console.log('Profile Updated:', updateProfileData.user.username);
    console.log('Updated Occupation:', updateProfileData.user.occupationType);
    console.log('Updated Location:', `${updateProfileData.user.city}, ${updateProfileData.user.state}, ${updateProfileData.user.country}`);

    // 5. Test RBAC (Admin) - expect failure
    console.log('\nTesting RBAC (Admin-only route with Normal User)...');
    const adminVerifyFailRes = await fetch(`${API_URL}/admin/verify`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (adminVerifyFailRes.status === 403 || adminVerifyFailRes.status === 401) {
      console.log('Success: Access Denied for Normal User (as expected)');
    } else {
      console.log('ERROR: Normal user accessed/errored admin route unexpected response code:', adminVerifyFailRes.status);
    }

    // 6. Verify login with updated username
    console.log('\nTesting Login With Updated Username...');
    const updatedLoginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: updatedUsername,
        password: 'password123',
      }),
    });
    const updatedLoginData = await updatedLoginRes.json();
    if (!updatedLoginRes.ok) throw new Error(updatedLoginData.message);
    console.log('Updated Username Login Successful:', updatedLoginData.username);

    // 7. Register Admin
    console.log('\nTesting Admin Signup...');
    const adminRegisterRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Admin User',
        username: 'adminuser_' + Date.now(),
        email: 'admin_' + Date.now() + '@example.com',
        password: 'adminpassword',
        occupationType: 'working_professional',
        country: 'India',
        state: 'Maharashtra',
        city: 'Pune',
        securityQuestion: 'Which city did I start my first job in?',
        securityAnswer: 'Bangalore',
        role: 'admin',
      }),
    });
    const adminRegisterData = await adminRegisterRes.json();
    if (!adminRegisterRes.ok) throw new Error(adminRegisterData.message);
    const adminToken = adminRegisterData.token;
    console.log('Admin Signup Successful:', adminRegisterData.username);

    // 8. Test RBAC (Admin-only route with Admin User)
    console.log('\nTesting RBAC (Admin-only route with Admin User)...');
    const adminVerifyRes = await fetch(`${API_URL}/admin/verify`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminVerifyData = await adminVerifyRes.json();
    if (!adminVerifyRes.ok) throw new Error(adminVerifyData.message);
    console.log('Success:', adminVerifyData.message);

    // 9. Forgot password flow
    console.log('\nTesting Forgot Password Question...');
    const forgotQuestionRes = await fetch(`${API_URL}/auth/forgot-password/question`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: updatedUsername }),
    });
    const forgotQuestionData = await forgotQuestionRes.json();
    if (!forgotQuestionRes.ok) throw new Error(forgotQuestionData.message);
    console.log('Security Question Loaded:', forgotQuestionData.securityQuestion);

    console.log('\nTesting Security Answer Verification...');
    const verifyAnswerRes = await fetch(`${API_URL}/auth/forgot-password/verify-answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: updatedUsername,
        securityAnswer: 'Maths',
      }),
    });
    const verifyAnswerData = await verifyAnswerRes.json();
    if (!verifyAnswerRes.ok) throw new Error(verifyAnswerData.message);
    console.log('Security Answer Verified');

    console.log('\nTesting Password Reset...');
    const resetPasswordRes = await fetch(`${API_URL}/auth/forgot-password/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resetToken: verifyAnswerData.resetToken,
        newPassword: 'updatedPass123',
      }),
    });
    const resetPasswordData = await resetPasswordRes.json();
    if (!resetPasswordRes.ok) throw new Error(resetPasswordData.message);
    console.log('Password Reset Successful');

    console.log('\nTesting Login With Updated Password...');
    const reloginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: updatedUsername,
        password: 'updatedPass123',
      }),
    });
    const reloginData = await reloginRes.json();
    if (!reloginRes.ok) throw new Error(reloginData.message);
    console.log('Login With Updated Password Successful:', reloginData.username);

    // 10. Delete user account with password confirmation
    console.log('\nTesting Account Deletion...');
    const deleteRes = await fetch(`${API_URL}/auth/account`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${reloginData.token}`,
      },
      body: JSON.stringify({
        password: 'updatedPass123',
      }),
    });
    const deleteData = await deleteRes.json();
    if (!deleteRes.ok) throw new Error(deleteData.message);
    console.log('Account Soft Deleted:', deleteData.deletedUserId);
    console.log('Permanent Deletion Scheduled For:', deleteData.permanentDeletionAt);

    // 11. Verify deleted account can no longer access profile
    console.log('\nVerifying Deleted Account Access is Blocked...');
    const deletedProfileRes = await fetch(`${API_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${reloginData.token}` },
    });
    if (deletedProfileRes.status === 401) {
      console.log('Success: Deleted account token no longer resolves to a user');
    } else {
      console.log('ERROR: Deleted account token unexpectedly retained access:', deletedProfileRes.status);
    }

    console.log('\nVerifying Soft Deleted Account Cannot Log In...');
    const deletedLoginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: updatedUsername,
        password: 'updatedPass123',
      }),
    });
    const deletedLoginData = await deletedLoginRes.json();
    if (deletedLoginRes.status === 403) {
      console.log('Success:', deletedLoginData.message);
    } else {
      console.log('ERROR: Soft deleted account unexpectedly logged in:', deletedLoginRes.status);
    }

    console.log('\n--- All Tests Passed Successfully! ---');
  } catch (error) {
    console.error('Test Failed:', error.message);
  }
};

runTests();
