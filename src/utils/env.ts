export const isProduction = Boolean(import.meta.env.PROD ?? false);
export const isDevelopment = Boolean(import.meta.env.DEV ?? false);
export const isDebug = Boolean('Sxk7g9MDjfCE' === localStorage.getItem('__DEBUG_MODE__'));
// export const isProduction = true;
// export const isDevelopment = false;
