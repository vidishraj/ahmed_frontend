import React from 'react';
import '../App.css';

interface FooterLink {
  href: string;
  label: string;
}

const footerLinks: FooterLink[] = [
  { href: '#', label: 'Contact Us' },
  { href: '#', label: 'About Us' },
  { href: '#', label: 'Privacy Policy' },
  { href: '#', label: 'Terms' },
];

const Footer: React.FC = () => (
  <footer>
    <div className="footer-nav">
      {footerLinks.map((link) => (
        <a key={link.label} href={link.href}>{link.label}</a>
      ))}
    </div>
  </footer>
);

export default Footer; 