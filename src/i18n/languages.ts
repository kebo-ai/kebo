export const languages = [
  {
    code: "es",
    name: "Español",
  },
  {
    code: "en",
    name: "English",
  },
  {
    code: "pt",
    name: "Português",
  },
  {
    code: "pt-BR",
    name: "Português (Brasil)",
  },
  {
    code: "fr",
    name: "Français",
  },
  {
    code: "it",
    name: "Italiano",
  },
  {
    code: "de",
    name: "Deutsch",
  },
  {
    code: "zh",
    name: "中文",
  },
  {
    code: "hi",
    name: "हिन्दी",
  },
];

export const getLanguageName = (code: string): string => {
  const language = languages.find(lang => lang.code === code);
  return language ? language.name : "English";
}; 