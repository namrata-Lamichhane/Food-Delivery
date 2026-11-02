import { Link } from 'react-router-dom'
import './Contact.css'

const Contact = () => (
    <main className='contact-page'>
        <header className='contact-page-header'>
            <h1>Contact Us</h1>
            <p>Have a question about our food or your delivery? We’re here to help.</p>
        </header>

        <section className='contact-options' aria-label='Contact options'>
            <article className='contact-option'>
                <span className='contact-option-label'>CALL US</span>
                <h2>Talk to our team</h2>
                <a href='tel:+12124567890'>+1-212-456-7890</a>
            </article>
            <article className='contact-option'>
                <span className='contact-option-label'>EMAIL US</span>
                <h2>Send us a message</h2>
                <a href='mailto:contact@tomato.com'>contact@tomato.com</a>
            </article>
        </section>

        <p className='contact-orders-note'>
            Need help with an order? <Link to='/orders'>View your orders</Link>
        </p>
    </main>
)

export default Contact
