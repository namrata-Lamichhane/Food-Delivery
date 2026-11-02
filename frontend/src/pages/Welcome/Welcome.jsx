import React, { useState } from 'react'
import './Welcome.css'
import { food_list, menu_list } from '../../assets/assets'
import heroFood from '../../assets/food_4.png'
import LoginPopup from '../../components/LoginPopup/LoginPopup'

const Welcome = () => {
    const [showLogin, setShowLogin] = useState(false)
    const featuredDishes = ['1', '6', '9', '21']
        .map((id) => food_list.find((item) => item._id === id))
        .filter(Boolean)

    return (
        <>
            {showLogin && <LoginPopup setShowLogin={setShowLogin} />}
            <main className='welcome-landing'>
                <section className='welcome-hero' aria-labelledby='welcome-title'>
                    <div className='welcome-copy'>
                        <span className='welcome-eyebrow'>
                            <span aria-hidden='true' />
                            YOUR NEXT MEAL STARTS HERE
                        </span>
                        <h1 id='welcome-title'>
                            A little joy,
                            <br />
                            <span>delivered.</span>
                        </h1>
                        <p>
                            Explore fresh, flavour-packed favourites and enjoy
                            the comfort of a great meal, delivered to your door.
                        </p>
                        <button
                            className='welcome-cta'
                            type='button'
                            onClick={() => setShowLogin(true)}
                        >
                            Get started
                            <span aria-hidden='true'>→</span>
                        </button>
                        <div className='welcome-highlights' aria-label='Food Del highlights'>
                            <span><i aria-hidden='true'>✓</i> Made fresh</span>
                            <span><i aria-hidden='true'>✓</i> Delivered with care</span>
                        </div>
                    </div>

                    <div className='welcome-visual' aria-label='A freshly prepared meal'>
                        <span className='welcome-visual-orbit welcome-visual-orbit-one' aria-hidden='true' />
                        <span className='welcome-visual-orbit welcome-visual-orbit-two' aria-hidden='true' />
                        <img
                            className='welcome-food-image'
                            src={heroFood}
                            alt='Freshly plated salad with grilled bites'
                        />
                        <span className='welcome-food-note'>Made fresh, just for you</span>
                        <span className='welcome-visual-spark' aria-hidden='true'>✳</span>
                    </div>
                    <a className='welcome-scroll-cue' href='#welcome-categories' aria-label='Scroll to discover categories'>
                        <span className='welcome-scroll-arrow' aria-hidden='true'>↓</span>
                    </a>
                </section>

                <section className='welcome-categories' id='welcome-categories' aria-labelledby='welcome-categories-title'>
                    <div className='welcome-section-heading'>
                        <div>
                            <span className='welcome-section-eyebrow'>SOMETHING FOR EVERY CRAVING</span>
                            <h2 id='welcome-categories-title'>What are you in the mood for?</h2>
                        </div>
                        <p>From fresh and light to a little indulgence, there’s always something good.</p>
                    </div>
                    <div className='welcome-category-list'>
                        {menu_list.map((category, index) => (
                            <button
                                className='welcome-category'
                                key={category.menu_name}
                                type='button'
                                onClick={() => setShowLogin(true)}
                                aria-label={`Sign in to browse ${category.menu_name}`}
                                style={{ '--category-delay': `${index * 45}ms` }}
                            >
                                <span className='welcome-category-image-wrap'>
                                    <img src={category.menu_image} alt='' />
                                    <span className='welcome-category-arrow' aria-hidden='true'>↗</span>
                                </span>
                                <span className='welcome-category-name'>{category.menu_name}</span>
                                <span className='welcome-category-caption'>Explore dishes</span>
                            </button>
                        ))}
                    </div>
                </section>

                <section className='welcome-featured' id='welcome-featured' aria-labelledby='welcome-featured-title'>
                    <div className='welcome-section-heading'>
                        <div>
                            <span className='welcome-section-eyebrow'>A TASTE OF THE MENU</span>
                            <h2 id='welcome-featured-title'>A few delicious places to start</h2>
                        </div>
                        <button className='welcome-text-link' type='button' onClick={() => setShowLogin(true)}>
                            Explore the menu <span aria-hidden='true'>→</span>
                        </button>
                    </div>
                    <div className='welcome-featured-grid'>
                        {featuredDishes.map((dish, index) => (
                            <article className='welcome-dish-card' key={dish._id} style={{ '--dish-delay': `${index * 70}ms` }}>
                                <div className='welcome-dish-image-wrap'>
                                    <img src={dish.image} alt={dish.name} />
                                    <span className='welcome-dish-badge'>{index === 0 ? 'FEATURED' : dish.category}</span>
                                    <span className='welcome-dish-rating'><span aria-hidden='true'>✦</span> Made fresh</span>
                                </div>
                                <div className='welcome-dish-details'>
                                    <div>
                                        <h3>{dish.name}</h3>
                                        <p>{dish.description}</p>
                                    </div>
                                    <strong>Rs. {dish.price}</strong>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                <section className='welcome-how' id='welcome-how' aria-labelledby='welcome-steps-title'>
                    <div className='welcome-how-copy'>
                        <span className='welcome-section-eyebrow'>GOOD FOOD, MADE SIMPLE</span>
                        <h2 id='welcome-steps-title'>Your next meal is only a few steps away.</h2>
                        <p>We make it easy to go from “what should I eat?” to “that was delicious.”</p>
                        <button className='welcome-cta' type='button' onClick={() => setShowLogin(true)}>
                            Start exploring <span aria-hidden='true'>→</span>
                        </button>
                    </div>
                    <div className='welcome-how-list'>
                        <article>
                            <span aria-hidden='true'>01</span>
                            <div><h3>Find your favourite</h3><p>Browse a menu full of fresh, flavour-packed choices.</p></div>
                        </article>
                        <article>
                            <span aria-hidden='true'>02</span>
                            <div><h3>Place your order</h3><p>Choose what you love and let us handle the details.</p></div>
                        </article>
                        <article>
                            <span aria-hidden='true'>03</span>
                            <div><h3>Enjoy a lovely meal</h3><p>Settle in and enjoy something delicious at home.</p></div>
                        </article>
                    </div>
                </section>

                <section className='welcome-final-cta' aria-labelledby='welcome-final-title'>
                    <div>
                        <span className='welcome-section-eyebrow'>YOUR TABLE IS WAITING</span>
                        <h2 id='welcome-final-title'>Make room for something delicious.</h2>
                        <p>Create an account or sign in to explore the full menu and start your order.</p>
                    </div>
                    <button className='welcome-cta welcome-final-button' type='button' onClick={() => setShowLogin(true)}>
                        Sign in to get started <span aria-hidden='true'>→</span>
                    </button>
                    <span className='welcome-final-spark' aria-hidden='true'>✳</span>
                </section>

            </main>
        </>
    )
}

export default Welcome
