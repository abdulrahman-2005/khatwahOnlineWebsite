import { PortableText as BasePortableText } from '@portabletext/react';
import { SanityImage } from './SanityImage';

/**
 * Custom Ad Banner component for Portable Text
 */
function AdBanner({ value }) {
  const { adText, buttonText, buttonUrl, backgroundColor = 'blue' } = value;
  
  const bgColors = {
    blue: 'bg-blue-100 border-blue-300',
    green: 'bg-green-100 border-green-300',
    gray: 'bg-gray-100 border-gray-300'
  };

  return (
    <div className={`p-6 rounded-lg border-2 my-8 ${bgColors[backgroundColor]}`}>
      <div className="text-center">
        {adText && (
          <p className="text-lg font-medium mb-4 text-gray-800">
            {adText}
          </p>
        )}
        {buttonText && buttonUrl && (
          <a
            href={buttonUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            {buttonText}
          </a>
        )}
      </div>
    </div>
  );
}

/**
 * Custom Image component for Portable Text
 */
function PortableTextImage({ value }) {
  return (
    <div className="my-8">
      <SanityImage
        value={value}
        width={800}
        className="w-full h-auto rounded-lg"
        sizes="(max-width: 768px) 100vw, 800px"
      />
    </div>
  );
}

/**
 * Portable Text components configuration
 */
const components = {
  types: {
    image: PortableTextImage,
    adBanner: AdBanner,
  },
  block: {
    // Custom block styles
    h1: ({ children }) => (
      <h1 className="text-4xl font-bold mb-6 text-gray-900">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-3xl font-bold mb-4 text-gray-900">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-2xl font-bold mb-3 text-gray-900">{children}</h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-xl font-bold mb-2 text-gray-900">{children}</h4>
    ),
    normal: ({ children }) => (
      <p className="mb-4 text-gray-700 leading-relaxed">{children}</p>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-blue-500 pl-6 my-6 italic text-gray-600">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc list-inside mb-4 space-y-2 text-gray-700">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-700">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li>{children}</li>,
    number: ({ children }) => <li>{children}</li>,
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-bold text-gray-900">{children}</strong>
    ),
    em: ({ children }) => (
      <em className="italic">{children}</em>
    ),
    link: ({ children, value }) => (
      <a
        href={value.href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 underline"
      >
        {children}
      </a>
    ),
  },
};

/**
 * Enhanced Portable Text component with custom blocks and styling
 * 
 * @param {Object} props
 * @param {Array} props.value - Portable Text content array
 * @param {string} props.className - Additional CSS classes
 */
export function PortableText({ value, className = '' }) {
  if (!value || !Array.isArray(value)) return null;

  return (
    <div className={`prose prose-lg max-w-none ${className}`}>
      <BasePortableText
        value={value}
        components={components}
      />
    </div>
  );
}