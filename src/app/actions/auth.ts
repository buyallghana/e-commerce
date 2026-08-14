'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Full name is required'),
  phone: z.string().optional(),
});

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const addressSchema = z.object({
  recipientName: z.string().min(2, 'Recipient name is required'),
  phoneNumber: z.string().min(9, 'Valid phone number is required'),
  streetAddress: z.string().min(3, 'Street address is required'),
  city: z.string().min(2, 'City/Town is required'),
  region: z.string().min(2, 'Region is required'),
  digitalAddress: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export async function signUpAction(prevState: unknown, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const fullName = formData.get('fullName') as string;
  const phone = formData.get('phone') as string;

  const parsed = signUpSchema.safeParse({ email, password, fullName, phone });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Validation failed' };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
        phone_number: parsed.data.phone || '',
        role: 'customer',
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // If email confirmation is disabled or automatic session is created
  if (data.session) {
    redirect('/account');
  }

  return { success: 'Account created successfully! You can now log in.' };
}

export async function signInAction(prevState: unknown, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const next = (formData.get('next') as string) || '/account';

  const parsed = signInSchema.safeParse({ email, password });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Validation failed' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  redirect(next);
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}

export async function updateProfileAction(prevState: unknown, formData: FormData) {
  const fullName = formData.get('fullName') as string;
  const phone = formData.get('phone') as string;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in to update your profile.' };
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: fullName,
      phone_number: phone,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/account');
  return { success: 'Profile updated successfully.' };
}

export async function addAddressAction(prevState: unknown, formData: FormData) {
  const recipientName = formData.get('recipientName') as string;
  const phoneNumber = formData.get('phoneNumber') as string;
  const streetAddress = formData.get('streetAddress') as string;
  const city = formData.get('city') as string;
  const region = formData.get('region') as string;
  const digitalAddress = formData.get('digitalAddress') as string;
  const isDefault = formData.get('isDefault') === 'on' || formData.get('isDefault') === 'true';

  const parsed = addressSchema.safeParse({
    recipientName,
    phoneNumber,
    streetAddress,
    city,
    region,
    digitalAddress,
    isDefault,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid address data' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Authentication required' };
  }

  if (parsed.data.isDefault) {
    // Reset all previous defaults
    await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', user.id);
  }

  const { error } = await supabase.from('addresses').insert({
    user_id: user.id,
    recipient_name: parsed.data.recipientName,
    phone_number: parsed.data.phoneNumber,
    street_address: parsed.data.streetAddress,
    city: parsed.data.city,
    region: parsed.data.region,
    digital_address: parsed.data.digitalAddress || null,
    is_default: parsed.data.isDefault || false,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/account');
  revalidatePath('/checkout');
  return { success: 'Address saved.' };
}

export async function deleteAddressAction(addressId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  const { error } = await supabase
    .from('addresses')
    .delete()
    .eq('id', addressId)
    .eq('user_id', user.id);

  if (error) return { error: error.message };

  revalidatePath('/account');
  return { success: true };
}
