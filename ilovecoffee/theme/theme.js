// theme/theme.js
const LOCAL_THEME_KEY = "activeTheme";

export function applySavedThemeOnLoad() {
    const themeId = localStorage.getItem(LOCAL_THEME_KEY);
    if (!themeId) return;

    $("html").attr("data-theme", themeId);
}

applySavedThemeOnLoad();