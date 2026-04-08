import { useState } from 'react';
import { TextField } from '@mui/material';
import { Button } from './ui/Button';

const muiBrandStyles = {
  '& .MuiOutlinedInput-root': {
    '&.Mui-focused fieldset': { borderColor: '#3a1f1d' },
    '& fieldset': { borderColor: 'rgba(58, 31, 29, 0.2)' },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: '#3a1f1d' },
};

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
      className="section bg-[var(--color-bg-secondary)]"
    >
      <div className="max-w-[800px] mx-auto text-center border-t border-[var(--color-border)] pt-20">
        <h2
          className="text-4xl md:text-5xl italic text-[var(--color-text-primary)] mb-6"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          Stay Connected
        </h2>
        <p className="text-base text-[var(--color-text-secondary)] font-light mb-12 max-w-sm mx-auto leading-relaxed">
          Sign up for early access to new collections and exclusive brand updates.
        </p>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto w-full"
          id="newsletter-form"
        >
          <TextField
            fullWidth
            type="email"
            required
            label="EMAIL ADDRESS"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={muiBrandStyles}
          />
          <Button
            type="submit"
            style={{ backgroundColor: '#3a1f1d', borderColor: '#3a1f1d', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.2em', padding: '1rem 3rem' }}
          >
            Join
          </Button>
        </form>
      </div>
    </section>
  );
};

export default Newsletter;
