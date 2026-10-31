import React, { useState } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { User, Mail, Phone, FileText, Camera, ShieldCheck, Check } from 'lucide-react';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Name cannot be empty', 'error');
      return;
    }

    try {
      setSaving(true);
      await updateProfile({
        name: name.trim(),
        phone: phone.trim(),
        bio: bio.trim(),
        profileImage: profileImage.trim(),
      });
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8 border-b border-neutral-200 pb-6">
          <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">
            Account Profile
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Manage your personal information, contact numbers, and host bio.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Avatar & Header Profile */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-3xl border border-neutral-200 bg-neutral-50">
            <div className="relative">
              <img
                src={
                  profileImage ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300'
                }
                alt={name}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
              />
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl font-bold text-neutral-900">{user?.name}</h2>
              <p className="text-xs text-neutral-500">{user?.email}</p>
              <div className="mt-2 flex items-center justify-center sm:justify-start gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-full bg-brand-50 text-brand-600 border border-brand-100 uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {user?.role === 'host' ? 'Host Account' : 'Guest Account'}
                </span>
                <span className="text-xs text-neutral-400">
                  Member since {new Date(user?.createdAt || Date.now()).getFullYear()}
                </span>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">
                Full Name *
              </label>
              <div className="flex items-center border border-neutral-300 rounded-2xl p-3 focus-within:border-neutral-900">
                <User className="w-4 h-4 text-neutral-400 mr-2 shrink-0" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-sm font-medium focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">
                Email Address (Read Only)
              </label>
              <div className="flex items-center border border-neutral-200 bg-neutral-100 rounded-2xl p-3 text-neutral-500">
                <Mail className="w-4 h-4 text-neutral-400 mr-2 shrink-0" />
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full text-sm font-medium bg-transparent cursor-not-allowed"
                />
              </div>
              <span className="text-[11px] text-neutral-400 mt-1 block">
                Email address is tied to your account identity.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">
                Phone Number
              </label>
              <div className="flex items-center border border-neutral-300 rounded-2xl p-3 focus-within:border-neutral-900">
                <Phone className="w-4 h-4 text-neutral-400 mr-2 shrink-0" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full text-sm font-medium focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">
                Profile Photo URL
              </label>
              <div className="flex items-center border border-neutral-300 rounded-2xl p-3 focus-within:border-neutral-900">
                <Camera className="w-4 h-4 text-neutral-400 mr-2 shrink-0" />
                <input
                  type="url"
                  value={profileImage}
                  onChange={(e) => setProfileImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full text-sm font-medium focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">
                About You / Host Bio
              </label>
              <textarea
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share a little bit about yourself, travel style, or hosting philosophy..."
                className="w-full text-sm p-3.5 border border-neutral-300 rounded-2xl focus:outline-none focus:border-neutral-900"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-200 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-sm font-bold shadow-md shadow-brand-500/25 transition-all active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
};

export default ProfilePage;
