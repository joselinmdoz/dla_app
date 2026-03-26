import { useState, useEffect } from 'react'

interface Referrer {
  id: string
  name: string
  email: string
}

interface Referral {
  id: string
  name: string
  email: string
  phone: string
  createdAt: string
}

interface ReferralStats {
  totalReferrals: number
}

interface ClientReferralData {
  client: {
    id: string
    name: string
    email: string
    referralCode: string | null
  }
  referrer: Referrer | null
  referrals: Referral[]
  stats: ReferralStats
}

export function useReferrals(clientId: string | null) {
  const [data, setData] = useState<ClientReferralData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!clientId) return

    const fetchReferrals = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/clients/${clientId}/referrals`)
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Error al cargar referidos')
        }

        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    fetchReferrals()
  }, [clientId])

  const generateReferralLink = (referralCode: string | null) => {
    if (!referralCode) return ''
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    return `${baseUrl}/register?ref=${referralCode}`
  }

  const copyReferralLink = async (referralCode: string | null) => {
    const link = generateReferralLink(referralCode)
    if (!link) return false

    try {
      await navigator.clipboard.writeText(link)
      return true
    } catch {
      return false
    }
  }

  return {
    data,
    loading,
    error,
    referralCode: data?.client.referralCode,
    referrals: data?.referrals || [],
    referrer: data?.referrer,
    stats: data?.stats,
    generateReferralLink,
    copyReferralLink,
  }
}

// Hook para verificar código de referido antes del registro
export function useVerifyReferralCode() {
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const verifyCode = async (code: string) => {
    if (!code) return { valid: false, error: 'Código requerido' }

    setVerifying(true)
    setError(null)

    try {
      const response = await fetch(`/api/clients/verify-referral-code?code=${encodeURIComponent(code)}`)
      const result = await response.json()

      if (!response.ok) {
        return { valid: false, error: result.error || 'Código inválido' }
      }

      return { valid: true, client: result.client }
    } catch (err) {
      return { valid: false, error: 'Error al verificar código' }
    } finally {
      setVerifying(false)
    }
  }

  return { verifyCode, verifying, error }
}
