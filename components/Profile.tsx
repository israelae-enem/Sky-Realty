'use client';

import { useEffect, useState } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { supabase } from '@/lib/supabaseClient';
import {
  UserCircle,
  Trash2,
  LogOut,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';

interface ZiinaPlan {
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

export default function ProfileSidebar() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  const [expanded, setExpanded] = useState(false);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRealtor, setIsRealtor] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<ZiinaPlan>({
    plan: 'free',
    propertyLimit: 1,
    status: 'none',
  });

  // Load profile picture & role
  useEffect(() => {
    if (!isLoaded || !user) return;

    const loadProfile = async () => {
      const { data: realtor } = await supabase
        .from('realtors')
        .select('profile_pic')
        .eq('id', user.id)
        .single();

      if (realtor) {
        setIsRealtor(true);
        if (realtor.profile_pic) setProfilePic(realtor.profile_pic);
        return;
      }

      const { data: tenant } = await supabase
        .from('tenants')
        .select('profile_pic')
        .eq('id', user.id)
        .single();

      if (tenant) {
        setIsRealtor(false);
        if (tenant.profile_pic) setProfilePic(tenant.profile_pic);
      }
    };

    loadProfile();
  }, [isLoaded, user]);

  // Fetch plan if Realtor
  useEffect(() => {
    if (!user || !isRealtor) return;

    const fetchPlan = async () => {
      try {
        const res = await fetch(`/api/ziina?user=${user.id}`);
        if (!res.ok) throw new Error('Failed to fetch plan');
        const data = await res.json();
        setCurrentPlan({
          plan: data.plan ?? 'free',
          propertyLimit: data.propertyLimit ?? 1,
          status: data.status ?? 'none',
        });
      } catch (err) {
        console.error('Failed to load Ziina plan:', err);
      }
    };

    fetchPlan();
  }, [user, isRealtor]);

  // Upload profile pic
  const uploadProfilePic = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file || !user) return;

      setLoading(true);
      const filePath = `profile-pics/${user.id}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from('documents').getPublicUrl(filePath);

      if (isRealtor) {
        await supabase
          .from('realtors')
          .update({ profile_pic: publicUrl })
          .eq('id', user.id);
      } else {
        await supabase
          .from('tenants')
          .update({ profile_pic: publicUrl })
          .eq('id', user.id);
      }

      setProfilePic(publicUrl);
    } catch (err) {
      console.error('Upload failed', err);
      alert('Failed to upload profile picture.');
    } finally {
      setLoading(false);
    }
  };

  // Delete profile pic
  const deleteProfilePic = async () => {
    try {
      if (!user || !profilePic) return;

      const fileName = profilePic.split('/').pop();
      if (fileName)
        await supabase.storage
          .from('documents')
          .remove([`profile-pics/${fileName}`]);

      if (isRealtor) {
        await supabase
          .from('realtors')
          .update({ profile_pic: null })
          .eq('id', user.id);
      } else {
        await supabase
          .from('tenants')
          .update({ profile_pic: null })
          .eq('id', user.id);
      }

      setProfilePic(null);
    } catch (err) {
      console.error('Delete failed', err);
      alert('Failed to delete profile picture.');
    }
  };

  // Change plan (Realtors only)
  const handleChangePlan = async (planId: string) => {
    if (!user || !isRealtor) return;

    try {
      const res = await fetch('/api/ziina', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, plan: planId }),
      });

      const data = await res.json();
      if (data.redirectUrl) window.open(data.redirectUrl, '_blank');
    } catch (err) {
      console.error('Failed to change plan:', err);
    }
  };

  // Delete account (both roles)
  const handleDeleteAccount = async () => {
    if (!user) return;
    if (!confirm('Are you sure you want to permanently delete your account?'))
      return;

    try {
      await supabase.from('realtors').delete().eq('id', user.id);
      await supabase.from('tenants').delete().eq('id', user.id);
      await signOut();
    } catch (err) {
      console.error('Delete account failed', err);
      alert('Failed to delete account.');
    }
  };

  if (!isLoaded || !user) return null;

  return (
    <div className="bg-white border border-gray-200 text-gray-800 w-full p-4 rounded-md shadow-sm">
      {/* Collapsed Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full hover:bg-gray-100 p-3 rounded-md transition-all duration-300"
      >
        <div className="flex items-center gap-3">
          {profilePic ? (
            <img
              src={profilePic}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover border border-gray-300"
            />
          ) : (
            <UserCircle className="w-10 h-10 text-gray-400" />
          )}
          <span className="font-semibold text-lg truncate">
            {user.firstName || user.fullName || 'User'}
          </span>
        </div>
        {expanded ? <ChevronUp /> : <ChevronDown />}
      </button>

      {/* Expandable Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="overflow-hidden mt-4 space-y-4"
          >
            <div className="text-sm">
              <p className="text-[#302cfc] font-semibold">Email:</p>
              <p>{user.emailAddresses[0]?.emailAddress}</p>
            </div>

            {isRealtor && (
              <div className="text-sm">
                <p className="text-[#302cfc] font-semibold">Plan:</p>
                <p className="capitalize">{currentPlan.plan}</p>
              </div>
            )}

            <div className="text-sm">
              <label className="text-[#302cfc] font-semibold cursor-pointer hover:underline">
                {loading ? 'Uploading...' : 'Upload Photo'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={uploadProfilePic}
                  className="hidden"
                  disabled={loading}
                />
              </label>
              {profilePic && (
                <button
                  onClick={deleteProfilePic}
                  className="flex items-center gap-1 text-red-500 hover:underline mt-1"
                >
                  <Trash2 className="w-4 h-4" /> Delete Photo
                </button>
              )}
            </div>

            {isRealtor && (
              <div>
                <p className="text-[#302cfc] font-semibold">Change Plan:</p>
                <Select
                  onValueChange={handleChangePlan}
                  defaultValue={currentPlan.plan}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {PLAN_OPTIONS.map((plan) => (
                      <SelectItem
                        key={plan.id}
                        value={plan.id}
                        disabled={plan.id === currentPlan.plan}
                      >
                        {plan.name} –{' '}
                        {plan.propertyLimit === null
                          ? 'Unlimited'
                          : plan.propertyLimit}{' '}
                        Properties
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              className="w-full mt-2 bg-red-500 hover:bg-red-600 text-white"
            >
              Delete Account
            </Button>

            <Button
              variant="outline"
              onClick={() => signOut()}
              className="w-full flex items-center justify-center gap-2 border-gray-300 hover:bg-gray-100"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}