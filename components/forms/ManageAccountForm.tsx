'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { UserCircle, Trash2, LogOut, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';

interface Plan {
  plan: string;
  propertyLimit: number | null;
  status: string;
}

const PLAN_OPTIONS = [
  { id: 'free', name: 'Free', propertyLimit: 1 },
  { id: 'basic', name: 'Basic', propertyLimit: 10 },
  { id: 'pro', name: 'Pro', propertyLimit: 20 },
  { id: 'premium', name: 'Premium', propertyLimit: null },
];

export default function ManageAccountForm() {
  const [expanded, setExpanded] = useState(false);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<'realtor' | 'tenant' | 'company' | null>(null);
  const [currentPlan, setCurrentPlan] = useState<Plan>({
    plan: 'free',
    propertyLimit: 1,
    status: 'none',
  });
  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [userId, setUserId] = useState<string | null>(null);

  // Load user info
  useEffect(() => {
    const loadUserAndProfile = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) return;

      setUserId(user.id);

      // Check realtor
      const { data: realtor } = await supabase.from('realtors').select('name, email, phone, profile_pic').eq('id', user.id).single();
      if (realtor) {
        setRole('realtor');
        setFormValues({ name: realtor.name, email: realtor.email, phone: realtor.phone || '' });
        if (realtor.profile_pic) setProfilePic(realtor.profile_pic);
        return;
      }

      // Check tenant
      const { data: tenant } = await supabase.from('tenants').select('name, email, phone, profile_pic').eq('id', user.id).single();
      if (tenant) {
        setRole('tenant');
        setFormValues({ name: tenant.name, email: tenant.email, phone: tenant.phone || '' });
        if (tenant.profile_pic) setProfilePic(tenant.profile_pic);
        return;
      }

      // Check company
      const { data: company } = await supabase.from('companies').select('name, email, phone, profile_pic').eq('id', user.id).single();
      if (company) {
        setRole('company');
        setFormValues({ name: company.name, email: company.email, phone: company.phone || '' });
        if (company.profile_pic) setProfilePic(company.profile_pic);
      }
    };

    loadUserAndProfile();
  }, []);

  // Fetch plan for realtors only
  useEffect(() => {
    if (!userId || role !== 'realtor') return;

    const fetchPlan = async () => {
      try {
        const res = await fetch(`/api/ziina?user=${userId}`);
        if (!res.ok) throw new Error('Failed to fetch plan');
        const data = await res.json();
        setCurrentPlan({
          plan: data.plan ?? 'free',
          propertyLimit: data.propertyLimit ?? 1,
          status: data.status ?? 'none',
        });
      } catch (err) {
        console.error('Failed to load plan:', err);
      }
    };
    fetchPlan();
  }, [userId, role]);

  // Handle profile pic upload
  const uploadProfilePic = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!userId) return;
      const file = e.target.files?.[0];
      if (!file) return;
      setLoading(true);

      const filePath = `profile-pics/${userId}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from('documents').upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('documents').getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      if (role === 'realtor') await supabase.from('realtors').update({ profile_pic: publicUrl }).eq('id', userId);
      else if (role === 'tenant') await supabase.from('tenants').update({ profile_pic: publicUrl }).eq('id', userId);
      else if (role === 'company') await supabase.from('companies').update({ profile_pic: publicUrl }).eq('id', userId);

      setProfilePic(publicUrl);
    } catch (err) {
      console.error('Upload failed', err);
      alert('Failed to upload profile picture.');
    } finally {
      setLoading(false);
    }
  };

  const deleteProfilePic = async () => {
    try {
      if (!userId || !profilePic) return;
      const fileName = profilePic.split('/').pop();
      if (fileName) await supabase.storage.from('documents').remove([`profile-pics/${fileName}`]);

      if (role === 'realtor') await supabase.from('realtors').update({ profile_pic: null }).eq('id', userId);
      else if (role === 'tenant') await supabase.from('tenants').update({ profile_pic: null }).eq('id', userId);
      else if (role === 'company') await supabase.from('companies').update({ profile_pic: null }).eq('id', userId);

      setProfilePic(null);
    } catch (err) {
      console.error('Delete failed', err);
      alert('Failed to delete profile picture.');
    }
  };

  const handleChangePlan = async (planId: string) => {
    if (!userId || role !== 'realtor') return;
    try {
      const res = await fetch('/api/ziina', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, plan: planId }),
      });
      const data = await res.json();
      if (data.redirectUrl) window.location.href = data.redirectUrl;
    } catch (err) {
      console.error('Failed to change plan:', err);
      alert('Failed to redirect to subscription page.');
    }
  };

  const handleSave = async () => {
    if (!userId || !role) return;
    setLoading(true);
    try {
      const table = role === 'realtor' ? 'realtors' : role === 'tenant' ? 'tenants' : 'companies';
      const { error } = await supabase.from(table).update({
        name: formValues.name,
        email: formValues.email,
        phone: formValues.phone,
        updated_at: new Date().toISOString(),
      }).eq('id', userId);
      if (error) throw error;
      alert('Account updated!');
    } catch (err) {
      console.error('Update failed', err);
      alert('Failed to update account.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!userId || !role) return;
    if (!confirm('Are you sure you want to permanently delete your account?')) return;

    try {
      const table = role === 'realtor' ? 'realtors' : role === 'tenant' ? 'tenants' : 'companies';
      await supabase.from(table).delete().eq('id', userId);
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Delete failed', err);
      alert('Failed to delete account.');
    }
  };

  if (!userId) return null;

  return (
    <div className="bg-white border border-gray-200 text-gray-800 w-full p-4 rounded-md shadow-lg">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full hover:bg-gray-100 p-3 rounded-md transition-all duration-300"
      >
        <div className="flex items-center gap-3">
          {profilePic ? (
            <img src={profilePic} alt="Profile" className="w-12 h-12 rounded-full object-cover border border-gray-300" />
          ) : (
            <UserCircle className="w-12 h-12 text-gray-400" />
          )}
          <span className="font-semibold text-lg truncate">{formValues.name || 'User'}</span>
        </div>
        {expanded ? <ChevronUp /> : <ChevronDown />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="overflow-hidden mt-4 space-y-4"
          >
            <div className="grid gap-3">
              <Input placeholder="Full Name" value={formValues.name} onChange={(e) => setFormValues(prev => ({ ...prev, name: e.target.value }))} />
              <Input placeholder="Email" type="email" value={formValues.email} onChange={(e) => setFormValues(prev => ({ ...prev, email: e.target.value }))} />
              <Input placeholder="Phone" value={formValues.phone} onChange={(e) => setFormValues(prev => ({ ...prev, phone: e.target.value }))} />

              <label className="text-[#302cfc] font-semibold cursor-pointer hover:underline">
                {loading ? 'Uploading...' : 'Upload Photo'}
                <input type="file" accept="image/*" onChange={uploadProfilePic} className="hidden" disabled={loading} />
              </label>
              {profilePic && (
                <button onClick={deleteProfilePic} className="flex items-center gap-1 text-red-500 hover:underline mt-1">
                  <Trash2 className="w-4 h-4" /> Delete Photo
                </button>
              )}

              {role === 'realtor' && (
                <div>
                  <p className="text-[#302cfc] font-semibold">Change Plan:</p>
                  <Select onValueChange={handleChangePlan} defaultValue={currentPlan.plan}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {PLAN_OPTIONS.map(plan => (
                        <SelectItem key={plan.id} value={plan.id} disabled={plan.id === currentPlan.plan}>
                          {plan.name} – {plan.propertyLimit === null ? 'Unlimited' : plan.propertyLimit} Properties
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button onClick={handleSave} className="bg-[#302cfc] hover:bg-[#241fd9] mt-2">{loading ? 'Saving...' : 'Save Changes'}</Button>
              <Button variant="destructive" onClick={handleDeleteAccount} className="w-full mt-2 bg-red-500 hover:bg-red-600 text-white">
                Delete Account
              </Button>
              <Button variant="outline" onClick={() => supabase.auth.signOut()} className="w-full flex items-center justify-center gap-2 border-gray-300 hover:bg-gray-100">
                <LogOut className="w-4 h-4" /> Sign Out
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}