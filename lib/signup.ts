import { auth } from '@/lib/firebase'
import { createUserWithEmailAndPassword } from 'firebase/auth'

export async function signupWithRole(email: string, password: string, role: 'tenant' | 'realtor') {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  const user = userCredential.user

  // Call API to set role
  await fetch('/api/setRole', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uid: user.uid, role })
  })

  return user
}