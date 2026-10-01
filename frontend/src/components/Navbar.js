/* ================================================
   JALASENA - Navbar Component (V4 - Elegant)
   ================================================
   Navigasi premium:
   - Logo JALASENA di kiri
   - Clean hamburger icon → elegant dropdown
   - SVG icons instead of emoji
   - Subtle, refined animations
   ================================================ */

'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav
      id="navbar"
      className={`${styles.navbar} ${scrolled ? styles.navbarScrolled : ''}`}
    >
      <div className={styles.navbarInner}>
        {/* Logo JALASENA */}
        <Link href="/" className={styles.logo}>
          <Image
            src="/images/logo.png"
            alt="JALASENA Logo"
            width={36}
            height={36}
            className={styles.logoImage}
          />
          <span className={styles.logoText}>JALASENA</span>
        </Link>

        {/* Menu icon dropdown */}
        <div className={styles.menuWrapper} ref={menuRef}>
          <button
            id="menu-toggle"
            className={`${styles.menuButton} ${menuOpen ? styles.menuButtonOpen : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span className={styles.menuIcon}>
              <span className={styles.menuLine}></span>
              <span className={styles.menuLine}></span>
            </span>
          </button>

          {/* Dropdown menu */}
          <div className={`${styles.dropdown} ${menuOpen ? styles.dropdownOpen : ''}`}>
            <div className={styles.dropdownContent}>
              <Link href="/" className={styles.dropdownItem} onClick={() => setMenuOpen(false)}>
                <svg className={styles.dropdownSvg} viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                </svg>
                <span>Beranda</span>
              </Link>
              <div className={styles.dropdownDivider}></div>
              <Link href="/deteksi" className={styles.dropdownItem} onClick={() => setMenuOpen(false)}>
                <svg className={styles.dropdownSvg} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                </svg>
                <span>Deteksi Ikan</span>
              </Link>
              <div className={styles.dropdownDivider}></div>
              <Link href="/tutorial" className={styles.dropdownItem} onClick={() => setMenuOpen(false)}>
                <svg className={styles.dropdownSvg} viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
                </svg>
                <span>Tutorial</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
