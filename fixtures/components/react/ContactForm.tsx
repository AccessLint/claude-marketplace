import React, { useState } from 'react';

// Issue: Form with multiple accessibility problems

export function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitStatus, setSubmitStatus] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    if (!name) newErrors.name = 'Name is required';
    if (!email) newErrors.email = 'Email is required';
    if (!message) newErrors.message = 'Message is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Issue: No announcement to screen readers about validation errors
      return;
    }

    // Simulate form submission
    setSubmitStatus('Form submitted successfully!');
    // Issue: Success message not announced to screen readers
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Issue: No form title/heading */}

      <div className="form-group">
        {/* Issue: Label not properly associated with input (missing htmlFor/id) */}
        <label>Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          // Issue: Missing aria-required
          // Issue: Missing aria-invalid when error exists
          // Issue: Missing aria-describedby for error message
        />
        {/* Issue: Error message not associated with input */}
        {errors.name && <span className="error">{errors.name}</span>}
      </div>

      <div className="form-group">
        {/* Issue: Using placeholder instead of label */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {errors.email && <span className="error">{errors.email}</span>}
      </div>

      <div className="form-group">
        {/* Issue: Label not descriptive enough, no id association */}
        <label>Message</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          // Issue: No character limit indication
          // Issue: No maxLength for screen readers to know
          maxLength={500}
        />
        {errors.message && <span className="error">{errors.message}</span>}
        {/* Issue: Character count not associated with textarea */}
        <div className="char-count">{message.length}/500</div>
      </div>

      {/* Issue: Checkbox without proper label association */}
      <div className="form-group">
        <input type="checkbox" id="newsletter" />
        {/* Issue: Clicking label text doesn't toggle checkbox (missing htmlFor) */}
        <label>Subscribe to newsletter</label>
      </div>

      {/* Issue: Radio buttons without fieldset/legend */}
      <div className="form-group">
        <div>Preferred contact method:</div>
        <div>
          <input type="radio" name="contact" value="email" />
          <label>Email</label>
        </div>
        <div>
          <input type="radio" name="contact" value="phone" />
          <label>Phone</label>
        </div>
      </div>

      {/* Issue: Required fields not indicated visually or to screen readers */}

      <button type="submit">Submit</button>

      {/* Issue: Status message not in live region */}
      {submitStatus && <div className="status">{submitStatus}</div>}
    </form>
  );
}

// Another example with custom select
export function CustomSelectExample() {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState('');

  return (
    <div className="form-group">
      <label>Country</label>

      {/* Issue: Custom select without proper ARIA attributes */}
      {/* Issue: Not keyboard accessible */}
      {/* Issue: Missing role="combobox" or role="listbox" */}
      <div className="custom-select" onClick={() => setIsOpen(!isOpen)}>
        <div className="select-value">
          {selected || 'Select a country'}
          {/* Issue: Arrow icon not hidden from screen readers */}
          <span>▼</span>
        </div>

        {isOpen && (
          // Issue: Missing role="listbox"
          // Issue: Options missing role="option"
          // Issue: No aria-selected
          <div className="select-options">
            <div onClick={() => { setSelected('USA'); setIsOpen(false); }}>
              USA
            </div>
            <div onClick={() => { setSelected('Canada'); setIsOpen(false); }}>
              Canada
            </div>
            <div onClick={() => { setSelected('Mexico'); setIsOpen(false); }}>
              Mexico
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Date picker example
export function DatePickerExample() {
  const [date, setDate] = useState('');

  return (
    <div className="form-group">
      {/* Issue: Label not associated with input */}
      <label>Birth Date</label>

      {/* Issue: Custom date picker without accessibility support */}
      {/* Issue: No calendar keyboard navigation */}
      {/* Issue: No date format announcement */}
      <div className="date-picker">
        <input
          type="text"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          placeholder="MM/DD/YYYY"
          // Issue: Using placeholder for format instruction instead of aria-describedby
        />

        {/* Issue: Calendar button without label */}
        <button type="button">📅</button>
      </div>
    </div>
  );
}
