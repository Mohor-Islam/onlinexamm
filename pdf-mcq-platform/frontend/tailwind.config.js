/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class", // "class" ব্যবহার করা হয়েছে যাতে আমরা ম্যানুয়ালি Dark Mode টগল করতে পারি
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#4f46e5",
          dark: "#4338ca",
        },
      },
    },
  },
  plugins: [],
};
