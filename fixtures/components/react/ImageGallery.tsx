import React from 'react';

// Issue: Image gallery with accessibility problems

interface Image {
  id: string;
  src: string;
  title: string;
}

interface ImageGalleryProps {
  images: Image[];
  onImageClick: (image: Image) => void;
}

export function ImageGallery({ images, onImageClick }: ImageGalleryProps) {
  return (
    <div className="gallery">
      {/* Issue: No heading for the gallery section */}

      <div className="gallery-grid">
        {images.map((image) => (
          // Issue: Div used for clickable item instead of button
          // Issue: No keyboard support
          // Issue: No role or ARIA attributes
          <div
            key={image.id}
            className="gallery-item"
            onClick={() => onImageClick(image)}
          >
            {/* Issue: Alt text uses generic "image" instead of description */}
            {/* Issue: Alt text includes "image of" which is redundant */}
            <img src={image.src} alt={`image of ${image.title}`} />

            {/* Issue: Title not associated with image for screen readers */}
            <div className="image-title">{image.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Another example with different issues:
export function ImageCard({ src, title, description }: { src: string; title: string; description: string }) {
  return (
    <div className="card">
      {/* Issue: Missing alt text entirely */}
      <img src={src} />

      {/* Issue: Wrong heading level (should match context) */}
      <h1>{title}</h1>

      <p>{description}</p>

      {/* Issue: Link without href (should be button) */}
      {/* Issue: Link text not descriptive */}
      <a onClick={() => console.log('View')}>View</a>
    </div>
  );
}

// Decorative image example
export function HeroBanner() {
  return (
    <div className="hero">
      {/* Issue: Decorative image should have alt="" but has descriptive text */}
      <img src="/background.jpg" alt="Beautiful background pattern" className="hero-background" />

      <div className="hero-content">
        <h1>Welcome to Our Site</h1>
        <p>Discover amazing things</p>
      </div>
    </div>
  );
}
