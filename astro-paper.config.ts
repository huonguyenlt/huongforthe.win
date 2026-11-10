import { defineAstroPaperConfig } from "./src/types/config";

export default defineAstroPaperConfig({
  site: {
    // Replace this with the public URL before deploying.
    url: "http://localhost:4321/",
    title: "Huong's Blog",
    description: "I keep my thoughts here.",
    author: "Huong Nguyen",
    lang: "en",
    timezone: "Asia/Ho_Chi_Minh",
    dir: "ltr",
  },
  posts: {
    perPage: 4,
    perIndex: 4,
  },
  features: {
    lightAndDarkMode: true,
    dynamicOgImage: true,
    showArchives: true,
    showBackButton: true,
    editPost: { enabled: false },
    search: "pagefind",
    toc: true,
  },
  socials: [
    {
      name: "github",
      url: "https://github.com/huonguyenlt",
      linkTitle: "Huong Nguyen on GitHub",
    },
    {
      name: "linkedin",
      url: "https://www.linkedin.com/in/huonguyenlt/",
      linkTitle: "Huong Nguyen on LinkedIn",
    },
    {
      name: "youtube",
      url: "https://www.youtube.com/@huonguyenlt",
      linkTitle: "Huong Nguyen on YouTube",
    },
    {
      name: "mail",
      url: "mailto:huonguyenlt@gmail.com",
      linkTitle: "Email Huong Nguyen",
    },
  ],
  shareLinks: [
    { name: "whatsapp", url: "https://wa.me/?text=" },
    { name: "facebook", url: "https://www.facebook.com/sharer.php?u=" },
    { name: "x",        url: "https://x.com/intent/post?url=" },
    { name: "telegram", url: "https://t.me/share/url?url=" },
    { name: "pinterest", url: "https://pinterest.com/pin/create/button/?url=" },
    { name: "mail",     url: "mailto:?subject=See%20this%20post&body=" },
  ],
});