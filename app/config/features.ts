// Kill switch for the 3D ascent background. Enabled by default;
// set NEXT_PUBLIC_ASCENT=0 to restore the CSS blob background.
export const ASCENT_ENABLED = process.env.NEXT_PUBLIC_ASCENT !== "0";

// Survey revision, shown on the splash: settles "am I looking at the
// current build?" in one glance. Bump on notable changes.
export const ASCENT_BUILD = "rev 07-19J";
