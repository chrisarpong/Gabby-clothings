import { useState } from 'react';

const Newsletter = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Subscribed: ${email}`);
    setEmail('');
  };

  return (
    <section
      id="contact"
      className="section bg-[var(--color-bg-primary)]"
    >
      <div className="max-w-[800px] mx-auto text-center border-t border-[var(--color-border)] pt-20">
        <h2
          className="text-4xl md:text-5xl italic text-[var(--color-text-primary)] mb-6"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          Join the List
        </h2>
        <p className="text-base text-[var(--color-text-secondary)] font-light mb-12 max-w-sm mx-auto leading-relaxed">
          Sign up for early access to new collections and exclusive brand updates.
        </p>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-0 max-w-lg mx-auto border-b border-[var(--color-text-primary)]"
          id="newsletter-form"
        >
          <input
            type="email"
            required
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 bg-transparent text-[var(--color-text-primary)] text-sm px-0 py-4 placeholder:text-[var(--color-text-secondary)]/50 focus:outline-none transition-all duration-300"
            id="newsletter-email-input"
          />
          <button
            type="submit"
            className="text-xs uppercase tracking-[0.4em] font-medium px-8 py-4 hover:opacity-70 transition-opacity cursor-pointer text-[var(--color-text-primary)]"
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
