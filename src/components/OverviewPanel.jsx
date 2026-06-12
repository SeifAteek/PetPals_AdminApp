import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { OVERVIEW_STATS } from '../config/navigation'
import * as Icons from 'lucide-react'

const OverviewPanel = ({ onNavigate }) => {
  const [stats, setStats] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const results = await Promise.all(
        OVERVIEW_STATS.map(async ({ table, label, icon, description }) => {
          const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true })
          return { table, label, icon, description, count: error ? '—' : count ?? 0 }
        })
      )
      setStats(results)
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h3 className="text-xl font-bold" style={{ color: 'var(--pp-text-primary)' }}>
            Platform Overview
          </h3>
          <p className="text-sm mt-1" style={{ color: 'var(--pp-text-secondary)' }}>
            Real-time metrics across users, partners, animals, commerce, and community.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-28 animate-pulse"
                style={{ borderRadius: 16, background: 'var(--pp-card-border)' }}
              />
            ))
          : stats.map(({ table, label, icon, description, count }) => {
              const Icon = Icons[icon] || Icons.Box
              return (
                <button
                  key={table}
                  type="button"
                  onClick={() => onNavigate(table)}
                  className="text-left p-5 transition-all group"
                  style={{
                    borderRadius: 16,
                    background: 'var(--pp-card-bg)',
                    border: '1px solid var(--pp-card-border)',
                    boxShadow: 'var(--pp-shadow-resting)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--pp-primary)'
                    e.currentTarget.style.boxShadow = 'var(--pp-shadow-raised)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--pp-card-border)'
                    e.currentTarget.style.boxShadow = 'var(--pp-shadow-resting)'
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className="w-10 h-10 flex items-center justify-center"
                      style={{
                        borderRadius: 12,
                        background: 'var(--pp-primary-light)',
                      }}
                    >
                      <Icon className="w-5 h-5" style={{ color: 'var(--pp-primary)' }} />
                    </div>
                    <span className="text-2xl font-bold" style={{ color: 'var(--pp-text-primary)' }}>
                      {count}
                    </span>
                  </div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--pp-text-primary)' }}>
                    {label}
                  </p>
                  {description && (
                    <p className="text-xs mt-1" style={{ color: 'var(--pp-text-muted)' }}>
                      {description}
                    </p>
                  )}
                </button>
              )
            })}
      </div>

      <div
        className="p-8"
        style={{
          borderRadius: 16,
          background: 'var(--pp-accent-banner-bg)',
          color: 'var(--pp-accent-banner-text)',
        }}
      >
        <h3 className="text-xl font-bold mb-2">PetPals Administration</h3>
        <p className="text-sm max-w-2xl leading-relaxed" style={{ color: 'var(--pp-accent-banner-text-muted)' }}>
          Manage the full PetPals platform — users, veterinary partners, animal shelters, retail shops,
          adoption workflows, clinical records, e-commerce, fundraising campaigns, and community
          engagement. Select any section from the sidebar to view and manage records.
        </p>
      </div>
    </div>
  )
}

export default OverviewPanel
