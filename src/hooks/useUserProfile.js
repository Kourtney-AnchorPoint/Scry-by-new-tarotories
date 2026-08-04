import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { auth } from '@/api/auth';
import { UserProfile } from '@/api/entities';
import { stripe } from '@/api/functions/stripe';

export function useUserProfile() {
  const queryClient = useQueryClient();

  const { data: { profiles, user } = { profiles: [], user: null }, isLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      try {
        const me = await auth.me();
        // Amplify's owner-based authorization already scopes list() to just
        // this Cognito user's own records — no explicit filter needed.
        const profiles = await UserProfile.list();
        // Once per day: verify Stripe subscription is still active (demotes canceled subs)
        const p = profiles?.[0];
        if (p?.is_premium && p?.stripe_customer_id) {
          const today = new Date().toDateString();
          if (localStorage.getItem('sub_check_date') !== today) {
            localStorage.setItem('sub_check_date', today);
            try {
              const res = await stripe.checkSubscription({ user_email: me.email });
              if (res.data?.premium === false) p.is_premium = false;
            } catch {
              // check failed — keep current status, retry tomorrow
            }
          }
        }
        return { profiles, user: me };
      } catch {
        return { profiles: [], user: null };
      }
    },
    initialData: { profiles: [], user: null },
  });

  const profile = profiles?.[0] || null;
  // Premium comes ONLY from the is_premium flag (set by Stripe verification or manual DB flag)
  const isPremium = profile?.is_premium === true;

  const createProfile = useMutation({
    mutationFn: (data) => UserProfile.create({ ...data, email: user?.email }),
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ['userProfile'] });
      const previous = queryClient.getQueryData(['userProfile']);
      queryClient.setQueryData(['userProfile'], (old) => ({
        ...old,
        profiles: [{ ...newData, id: '__optimistic__', email: old?.user?.email }],
      }));
      return { previous };
    },
    onError: (_err, _data, ctx) => queryClient.setQueryData(['userProfile'], ctx.previous),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['userProfile'] }),
  });

  const updateProfile = useMutation({
    mutationFn: (data) => UserProfile.update(profile?.id, data),
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ['userProfile'] });
      const previous = queryClient.getQueryData(['userProfile']);
      queryClient.setQueryData(['userProfile'], (old) => ({
        ...old,
        profiles: [{ ...old?.profiles?.[0], ...newData }],
      }));
      return { previous };
    },
    onError: (_err, _data, ctx) => queryClient.setQueryData(['userProfile'], ctx.previous),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['userProfile'] }),
  });

  const saveOrUpdate = (data) => {
    if (profile && profile.id !== '__optimistic__') {
      return updateProfile.mutateAsync(data);
    }
    return createProfile.mutateAsync(data);
  };

  return { profile, user, isLoading, isPremium, saveOrUpdate };
}
