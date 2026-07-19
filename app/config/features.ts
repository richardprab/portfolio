// Kill switch for the 3D ascent background. Enabled by default;
// set NEXT_PUBLIC_ASCENT=0 to restore the CSS blob background.
export const ASCENT_ENABLED = process.env.NEXT_PUBLIC_ASCENT !== "0";
