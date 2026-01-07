/**
 * Portable Text Components Configuration
 * 
 * Use this with @portabletext/react to render Sanity Portable Text content
 * including the custom videoBlock component.
 * 
 * Usage:
 * 
 * import { PortableText } from '@portabletext/react';
 * import { portableTextComponents } from '~/components/portable-text-components';
 * 
 * function MyComponent({ content }) {
 *   return <PortableText value={content} components={portableTextComponents} />;
 * }
 */

import type { PortableTextReactComponents } from "@portabletext/react";
import type { ReactNode } from "react";
import { PortableTextVideo } from "./portable-text-video";

// Sanity image URL builder helper
const sanityImageUrl = (ref: string, projectId = "p9gceue4", dataset = "production") => {
  if (!ref) return "";
  const [, id, dimensions, format] = ref.split("-");
  return `https://cdn.sanity.io/images/${projectId}/${dataset}/${id}-${dimensions}.${format}`;
};

// Type for children prop
type ChildrenProps = { children?: ReactNode };
type ValueProps<T> = { value?: T };
type LinkValue = { href?: string; blank?: boolean };
type ImageValue = { 
  asset?: { _ref?: string }; 
  alt?: string; 
  caption?: string;
};

/**
 * Portable Text Components for rendering Sanity block content
 * 
 * Includes:
 * - Text blocks with headings
 * - Links (internal & external)
 * - Lists (bullet & numbered)
 * - Images with captions
 * - Video blocks (B2 self-hosted & external embeds)
 */
export const portableTextComponents: Partial<PortableTextReactComponents> = {
  // Block-level elements
  block: {
    h2: ({ children }: ChildrenProps) => (
      <h2 className="mt-8 mb-4 text-2xl font-bold tracking-tight text-foreground">
        {children}
      </h2>
    ),
    h3: ({ children }: ChildrenProps) => (
      <h3 className="mt-6 mb-3 text-xl font-semibold text-foreground">
        {children}
      </h3>
    ),
    h4: ({ children }: ChildrenProps) => (
      <h4 className="mt-4 mb-2 text-lg font-semibold text-foreground">
        {children}
      </h4>
    ),
    normal: ({ children }: ChildrenProps) => (
      <p className="mb-4 leading-7 text-foreground/90">{children}</p>
    ),
    blockquote: ({ children }: ChildrenProps) => (
      <blockquote className="my-6 border-l-4 border-primary/50 pl-4 italic text-foreground/80">
        {children}
      </blockquote>
    ),
  },

  // Inline marks/decorators
  marks: {
    strong: ({ children }: ChildrenProps) => (
      <strong className="font-semibold">{children}</strong>
    ),
    em: ({ children }: ChildrenProps) => <em className="italic">{children}</em>,
    underline: ({ children }: ChildrenProps) => <u className="underline">{children}</u>,
    "strike-through": ({ children }: ChildrenProps) => (
      <s className="line-through">{children}</s>
    ),
    code: ({ children }: ChildrenProps) => (
      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">
        {children}
      </code>
    ),
    link: ({ value, children }: ValueProps<LinkValue> & ChildrenProps) => {
      const target = value?.blank ? "_blank" : undefined;
      const rel = value?.blank ? "noopener noreferrer" : undefined;
      return (
        <a
          href={value?.href}
          target={target}
          rel={rel}
          className="text-primary underline decoration-primary/50 underline-offset-2 hover:decoration-primary transition-colors"
        >
          {children}
        </a>
      );
    },
  },

  // List elements
  list: {
    bullet: ({ children }: ChildrenProps) => (
      <ul className="my-4 ml-6 list-disc space-y-2 text-foreground/90">
        {children}
      </ul>
    ),
    number: ({ children }: ChildrenProps) => (
      <ol className="my-4 ml-6 list-decimal space-y-2 text-foreground/90">
        {children}
      </ol>
    ),
  },

  listItem: {
    bullet: ({ children }: ChildrenProps) => <li className="leading-7">{children}</li>,
    number: ({ children }: ChildrenProps) => <li className="leading-7">{children}</li>,
  },

  // Custom block types
  types: {
    // Image block
    image: ({ value }: ValueProps<ImageValue>) => {
      if (!value?.asset?._ref) return null;

      const url = sanityImageUrl(value.asset._ref);

      return (
        <figure className="my-6">
          <img
            src={url}
            alt={value.alt || ""}
            className="w-full rounded-lg"
            loading="lazy"
          />
          {value.caption && (
            <figcaption className="mt-2 text-center text-sm text-muted-foreground">
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },

    // Video block (self-hosted B2 or external embed)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    videoBlock: ({ value }: { value: any }) => <PortableTextVideo value={value} />,
  },
};

export default portableTextComponents;
