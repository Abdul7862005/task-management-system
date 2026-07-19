import { useState, useEffect } from 'react';
import { getProfile, updateProfile, changePassword } from '../services/profileService';
import MainLayout from '../layouts/MainLayout';

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [profileForm, setProfileForm] = useState({ name: '', email: '' });
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setProfile(data.user);
        setProfileForm({ name: data.user.name, email: data.user.email });
      } catch (err) {
        setProfileError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setSavingProfile(true);

    try {
      const data = await updateProfile(profileForm);
      setProfile(data.user);

      const storedUser = JSON.parse(localStorage.getItem('user'));
      localStorage.setItem('user', JSON.stringify({ ...storedUser, ...data.user }));

      setProfileSuccess('Profile updated successfully');
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    setSavingPassword(true);

    try {
      await changePassword(passwordForm);
      setPasswordSuccess('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <p className="loading-text">Loading profile...</p>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="tasks-header">
        <h2>Profile</h2>
      </div>

      <div className="profile-grid">
        <div className="profile-card">
          <h3>Account Details</h3>

          {profileError && <p className="error-text">{profileError}</p>}
          {profileSuccess && <p className="success-text">{profileSuccess}</p>}

          <form onSubmit={handleProfileSubmit}>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={profileForm.name}
                onChange={handleProfileChange}
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={profileForm.email}
                onChange={handleProfileChange}
              />
            </div>

            <button type="submit" className="btn" disabled={savingProfile}>
              {savingProfile ? 'Saving...' : 'Update Profile'}
            </button>
          </form>
        </div>

        <div className="profile-card">
          <h3>Change Password</h3>

          {passwordError && <p className="error-text">{passwordError}</p>}
          {passwordSuccess && <p className="success-text">{passwordSuccess}</p>}

          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
              />
            </div>

            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
              />
            </div>

            <button type="submit" className="btn" disabled={savingPassword}>
              {savingPassword ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </MainLayout>
  );
}

export default Profile;