import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  const payload = await req.json()
  const record = payload.record

  const email: string = record?.email
  const fullName: string = record?.raw_user_meta_data?.full_name ?? ''

  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
  const RESEND_AUDIENCE_ID = Deno.env.get('RESEND_AUDIENCE_ID')

  if (!email || !RESEND_API_KEY || !RESEND_AUDIENCE_ID) {
    return new Response('Missing data', { status: 400 })
  }

  const nameParts = fullName.trim().split(' ')
  const firstName = nameParts[0] ?? ''
  const lastName = nameParts.slice(1).join(' ') ?? ''

  const res = await fetch(
    `https://api.resend.com/audiences/${RESEND_AUDIENCE_ID}/contacts`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        first_name: firstName,
        last_name: lastName,
        unsubscribed: false,
      }),
    }
  )

  // 409 = contact already exists — treat as success
  if (!res.ok && res.status !== 409) {
    console.error('Resend Audiences error:', res.status, await res.text())
    return new Response('Resend error', { status: 500 })
  }

  return new Response('OK', { status: 200 })
})
