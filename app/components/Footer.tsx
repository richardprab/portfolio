"use client";

import { siTelegram, siGithub } from "simple-icons/icons";
import { Linkedin } from "lucide-react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: "Telegram",
      icon: siTelegram,
      href: "https://t.me/ltee_es",
      hoverColor: "hover:text-[#0088cc]",
      isSimpleIcon: true,
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      href: "https://linkedin.com/in/richardprab",
      hoverColor: "hover:text-[#0077b5]",
      isSimpleIcon: false,
    },
    {
      name: "GitHub",
      icon: siGithub,
      href: "https://github.com/richardprab",
      hoverColor: "hover:text-[#333]",
      isSimpleIcon: true,
    },
  ] as const;

  return (
    <footer className="border-t border-gray-200 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-8 lg:px-16 xl:px-24">
        {/* Left side - Copyright */}
        <p className="text-gray-600 text-sm sm:text-base">
          © {currentYear} Richard Prabowo. All rights reserved
        </p>

        {/* Right side - Social Media */}
        <div className="flex items-center gap-4">
          {socialLinks.map((social) => {
            if (social.isSimpleIcon && 'path' in social.icon) {
              return (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className={`text-gray-600 ${social.hoverColor} transition-colors duration-200`}
                >
                  <svg
                    role="img"
                    viewBox="0 0 24 24"
                    className="w-5 h-5 sm:w-6 sm:h-6 fill-current"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d={social.icon.path} />
                  </svg>
                </a>
              );
            } else {
              const Icon = social.icon as typeof Linkedin;
              return (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className={`text-gray-600 ${social.hoverColor} transition-colors duration-200`}
                >
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </a>
              );
            }
          })}
        </div>
      </div>
    </footer>
  );
};

