import { NavLink } from 'react-router-dom'
import styles from './Layout.module.css'

const NAV_ITEMS = [
  { to: '/diary',    label: '旅の日記',   icon: '✦' },
  { to: '/map',      label: '地図',       icon: '◎' },
  { to: '/research', label: 'AI情報収集', icon: '◈' },
]

export default function Layout({ children }) {
  return (
    <div className={styles.root}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.brandTitle}>Tabinoto</span>
          <span className={styles.brandSub}>旅のノート</span>
        </div>

        <nav className={styles.nav}>
          {NAV_ITEMS.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
              }
            >
              <span className={styles.navIcon}>{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <span className={styles.version}>v1.0</span>
        </div>
      </aside>

      <main className={styles.main}>
        {children}
      </main>
    </div>
  )
}