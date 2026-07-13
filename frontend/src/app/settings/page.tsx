'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  ArrowLeft,
  LogOut,
  User,
  Trash2,
  Check,
  AlertTriangle,
  Loader2,
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useSession, signOut } from '@/lib/auth-client'
import { api } from '@/lib/api'

// ─── Card wrapper ─────────────────────────────────────────────────────────────
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-gray-200 bg-white p-6 ${className}`}>
      {children}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-400">
      {children}
    </h2>
  )
}

// ─── Delete confirmation dialog ───────────────────────────────────────────────
function DeleteAccountDialog({
  open,
  onClose,
  onConfirm,
  loading,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  loading: boolean
}) {
  const [confirm, setConfirm] = useState('')
  const PHRASE = 'delete my account'

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <DialogTitle className="text-left text-base font-semibold text-gray-900">
            Delete your account?
          </DialogTitle>
          <DialogDescription className="text-left">
            This permanently deletes your account and <strong>all your diagrams</strong>.
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-3 space-y-4">
          <div>
            <p className="mb-1.5 text-sm text-gray-600">
              Type <span className="font-mono font-medium text-gray-900">{PHRASE}</span> to confirm:
            </p>
            <Input
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder={PHRASE}
              className="font-mono text-sm"
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              disabled={confirm !== PHRASE || loading}
              className="flex-1 bg-red-600 text-white hover:bg-red-700"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete account'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Settings page ────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const router = useRouter()
  const { data: session, isPending } = useSession()

  // Name editing
  const [name, setName] = useState('')
  const [nameSaved, setNameSaved] = useState(false)
  const [nameSaving, setNameSaving] = useState(false)
  const nameInputRef = useRef<HTMLInputElement>(null)

  // Delete account
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Page title
  useEffect(() => { document.title = 'Settings — LLDCanvas' }, [])

  // Auth guard + hydrate name
  useEffect(() => {
    if (!isPending && !session) router.replace('/')
  }, [isPending, session, router])

  useEffect(() => {
    if (session?.user.name) setName(session.user.name)
  }, [session])

  async function handleSaveName() {
    if (!name.trim() || name === session?.user.name) return
    setNameSaving(true)
    try {
      await api.account.updateName(name.trim())
      setNameSaved(true)
      toast.success('Display name updated')
      setTimeout(() => setNameSaved(false), 2000)
    } catch {
      toast.error('Failed to update name')
    } finally {
      setNameSaving(false)
    }
  }

  async function handleSignOut() {
    await signOut()
    router.push('/')
  }

  async function handleDeleteAccount() {
    setDeleteLoading(true)
    try {
      await api.account.deleteAccount()
      await signOut()
      toast.success('Account deleted')
      router.push('/')
    } catch {
      toast.error('Failed to delete account. Please try again.')
    } finally {
      setDeleteLoading(false)
      setDeleteOpen(false)
    }
  }

  if (isPending) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8F8F8]">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
      </div>
    )
  }

  if (!session) return null

  const { user } = session

  return (
    <div className="min-h-screen bg-[#F8F8F8] px-4 py-8">
      <div className="mx-auto max-w-xl">
        {/* Back link */}
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Dashboard
        </Link>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 text-2xl font-bold text-gray-900"
        >
          Account Settings
        </motion.h1>

        <div className="space-y-4">
          {/* ── Profile ──────────────────────────────────────────────────── */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Card>
              <SectionTitle>Profile</SectionTitle>

              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="relative h-16 w-16 shrink-0">
                  {user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.image}
                      alt={user.name}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-indigo-100">
                      <User className="h-8 w-8 text-indigo-400" />
                    </div>
                  )}
                </div>

                {/* Name + email */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <label className="mb-1 block text-xs font-medium text-gray-500">
                        Display name
                      </label>
                      <Input
                        ref={nameInputRef}
                        value={name}
                        onChange={e => { setName(e.target.value); setNameSaved(false) }}
                        onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                        className="h-9 text-sm"
                      />
                    </div>
                    <Button
                      size="sm"
                      onClick={handleSaveName}
                      disabled={nameSaving || !name.trim() || name === user.name}
                      className="h-9 shrink-0 bg-indigo-600 hover:bg-indigo-700"
                    >
                      {nameSaving ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : nameSaved ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        'Save'
                      )}
                    </Button>
                  </div>
                  <p className="mt-2 text-xs text-gray-400">
                    {user.email}
                    <span className="ml-1.5 text-gray-300">· read-only</span>
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* ── Session ───────────────────────────────────────────────────── */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <SectionTitle>Session</SectionTitle>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">Sign out of LLDCanvas</p>
                  <p className="text-xs text-gray-400">You'll be returned to the home page.</p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleSignOut}
                  className="gap-2 text-gray-600"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* ── Danger zone ───────────────────────────────────────────────── */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card className="border-red-100">
              <SectionTitle>Danger Zone</SectionTitle>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">Delete account</p>
                  <p className="text-xs text-gray-400">
                    Permanently delete your account and all diagrams. Cannot be undone.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setDeleteOpen(true)}
                  className="gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete account
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      <DeleteAccountDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteAccount}
        loading={deleteLoading}
      />
    </div>
  )
}
