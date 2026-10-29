import React from 'react'
import { Link } from 'react-router-dom'
import { assets } from '../../assets/assets'
import facebook_icon from '../../assets/facebook_icon.png'
import linkedin_icon from '../../assets/linkedin_icon.png'
import twitter_icon from '../../assets/twitter_icon.png'
import './Footer.css'

const currentYear = new Date().getFullYear()

const Footer = () => {
  return (
    <footer className='footer' id='footer'>
      <div className='footer-content'>
        <div className='footer-about'>
          <Link to='/' aria-label='Food Del home'>
            <img className='footer-logo' src={assets.logo} alt='Food Del' />
          </Link>
          <p>
            Freshly prepared favorites, made with care and delivered straight to
            your door. Find something delicious for every craving.
          </p>
          <div className='footer-socials' aria-label='Social media'>
            <a href='https://facebook.com' aria-label='Facebook'>
              <img src={facebook_icon} alt='' />
            </a>
            <a href='https://twitter.com' aria-label='Twitter'>
              <img src={twitter_icon} alt='' />
            </a>
            <a href='https://linkedin.com' aria-label='LinkedIn'>
              <img src={linkedin_icon} alt='' />
            </a>
          </div>
        </div>

        <div className='footer-links'>
          <h2>Company</h2>
          <Link to='/'>Home</Link>
          <span>About us</span>
          <Link to='/order'>Delivery</Link>
          <span>Privacy policy</span>
        </div>

        <div className='footer-contact'>
          <h2>Get in touch</h2>
          <a href='tel:+12124567890'>+1-212-456-7890</a>
          <a href='mailto:contact@tomato.com'>contact@tomato.com</a>
        </div>
      </div>
      <div className='footer-bottom'>
        <p>Copyright {currentYear} © Food Del - All Rights Reserved.</p>
      </div>
    </footer>
  )
}

export default Footer
