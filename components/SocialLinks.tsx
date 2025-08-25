// components/SocialLinks.tsx
"use client";

export default function SocialLinks() {
  const socials = [
    {
      name: "Instagram",
      href: "https://instagram.com/yourprofile",
      svg: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 24 24"
          className="w-6 h-6"
        >
          <path d="M7.75 2A5.75 5.75 0 0 0 2 7.75v8.5A5.75 5.75 0 0 0 7.75 22h8.5A5.75 5.75 0 0 0 22 16.25v-8.5A5.75 5.75 0 0 0 16.25 2h-8.5Zm0 1.5h8.5c2.356 0 4.25 1.894 4.25 4.25v8.5c0 2.356-1.894 4.25-4.25 4.25h-8.5A4.25 4.25 0 0 1 3.5 16.25v-8.5c0-2.356 1.894-4.25 4.25-4.25Zm8.75 2.25a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5ZM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 1.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7Z" />
        </svg>
      ),
    },
    {
      name: "GitHub",
      href: "https://github.com/yourprofile",
      svg: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 24 24"
          className="w-6 h-6"
        >
          <path d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 0 0 7.85 10.95c.57.1.77-.25.77-.55v-2c-3.19.7-3.87-1.54-3.87-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.97.1-.74.4-1.26.72-1.55-2.55-.29-5.23-1.27-5.23-5.64 0-1.25.45-2.28 1.19-3.08-.12-.3-.52-1.52.11-3.18 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.21-1.49 3.18-1.18 3.18-1.18.63 1.66.23 2.88.11 3.18.74.8 1.19 1.83 1.19 3.08 0 4.38-2.69 5.34-5.25 5.63.42.36.77 1.08.77 2.18v3.23c0 .3.2.65.78.55A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
        </svg>
      ),
    },
    {
      name: "LinkedIn",
      href: "https://linkedin.com/in/yourprofile",
      svg: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 24 24"
          className="w-6 h-6"
        >
          <path d="M20.45 20.45h-3.55v-5.4c0-1.29-.02-2.95-1.8-2.95-1.8 0-2.07 1.4-2.07 2.85v5.5H9.48V9h3.41v1.56h.05c.47-.9 1.62-1.84 3.34-1.84 3.57 0 4.23 2.35 4.23 5.4v6.34ZM5.34 7.43a2.06 2.06 0 1 1 0-4.11 2.06 2.06 0 0 1 0 4.11Zm-1.77 13.02h3.55V9H3.57v11.45ZM22.23 0H1.77C.79 0 0 .77 0 1.73v20.55C0 23.22.79 24 1.77 24h20.46c.98 0 1.77-.78 1.77-1.72V1.73C24 .77 23.21 0 22.23 0Z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex space-x-4 mt-4">
      {socials.map((social) => (
        <a
          key={social.name}
          href={social.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={social.name}
          className="text-gray-400 hover:text-[#302cfc] transition"
        >
          {social.svg}
        </a>
      ))}
    </div>
  );
}