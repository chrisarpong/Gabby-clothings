import { useState } from 'react';

const Newsletter = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder for newsletter sign up
    alert(`Thank you for subscribing with: ${email}`);
    setEmail('');
  };

  return (
    <section
      id="contact"
      className="section bg-[var(--color-black-soft)] border-t border-[var(--color-gold)]/10"
    >
      <div className="max-w-[700px] mx-auto text-center">
        <h2
          className="text-3xl md:text-4xl italic text-[var(--color-white)] mb-4"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          Join the List
        </h2>
        <p className="text-sm text-[var(--color-white-soft)] font-light mb-10 max-w-sm mx-auto">
          Sign up to receive updates on new arrivals, exclusive collections,
          and special events.
        </p>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          id="newsletter-form"
        >
          <input
            type="email"
            required
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 bg-transparent border border-[var(--color-white-soft)]/30 text-[var(--color-white)] text-sm px-5 py-3.5 tracking-wide placeholder:text-[var(--color-white-soft)]/50 focus:outline-none focus:border-[var(--color-gold)] transition-colors duration-300"
            id="newsletter-email-input"
          />
          <button
            type="submit"
            className="bg-[var(--color-gold)] text-[var(--color-black-deep)] text-xs uppercase tracking-[0.3em] font-medium px-8 py-3.5 hover:bg-[var(--color-gold-light)] transition-colors duration-300 cursor-pointer"
            id="newsletter-submit-btn"
          >
            Join
          </button>
        </form>
      </div>
    </section>
  );
};

export default Newsletter;
