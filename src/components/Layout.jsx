import { NavLink, Outlet } from 'react-router-dom'
import styles from './Layout.module.css'

export default function Layout({ children }) {
  return (
    <div className={styles.root}>
      {/* PCサイドメニュー */}
      <nav className={styles.sidebar}>
        <div className={styles.brand}>
          <h1 className={styles.logoText}>Tabinoto</h1>
          <p className={styles.logoSub}>旅のノート</p>
        </div>
        <ul className={styles.nav}>
          <li>
            <NavLink to="/diary" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}>
              <span className={styles.navIcon}>+</span> 旅の日記
            </NavLink>
          </li>
          <li>
            <NavLink to="/map" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}>
              <span className={styles.navIcon}>○</span> 地図
            </NavLink>
          </li>
          <li>
            <NavLink to="/ai-research" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}>
              <span className={styles.navIcon}>+</span> AI情報収集
            </NavLink>
          </li>
        </ul>
      </nav>

      {/* メインコンテンツ */}
      <main className={styles.main}>
        {children}
      </main>

      {/* スマホ下部タブバー */}
      <nav className={styles.bottomTab}>
        <NavLink to="/diary" className={({ isActive }) => `${styles.tabItem} ${isActive ? styles.tabActive : ''}`}>
          <span className={styles.tabIcon}>📔</span>
          <span className={styles.tabLabel}>日記</span>
        </NavLink>
        <NavLink to="/diary/new" className={({ isActive }) => `${styles.tabItem} ${styles.tabCenter} ${isActive ? styles.tabActive : ''}`}>
          <span className={styles.tabCenterIcon}>＋</span>
        </NavLink>
        <NavLink to="/map" className={({ isActive }) => `${styles.tabItem} ${isActive ? styles.tabActive : ''}`}>
          <span className={styles.tabIcon}>🗺️</span>
          <span className={styles.tabLabel}>地図</span>
        </NavLink>
        <NavLink to="/ai-research" className={({ isActive }) => `${styles.tabItem} ${isActive ? styles.tabActive : ''}`}>
          <span className={styles.tabIcon}>🤖</span>
          <span className={styles.tabLabel}>AI</span>
        </NavLink>
      </nav>
    </div>
  )
}