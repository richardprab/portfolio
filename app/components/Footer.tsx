"use client";

import { Linkedin, Github, MessageCircle } from "lucide-react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: "Telegram",
      icon: MessageCircle,
      href: "https://t.me/ltee_es",
      hoverColor: "hover:text-[#0088cc]", 
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      href: "https://linkedin.com/in/richardprab",
      hoverColor: "hover:text-[#0077b5]",
    },
    {
      name: "GitHub",
      icon: Github,
      href: "https://github.com/richardprab",
      hoverColor: "hover:text-[#333]", 
    },
  ];

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
            const Icon = social.icon;
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
          })}
        </div>
      </div>
    </footer>
  );
};

