/**
 * GoogleAuthTrigger — triggers the REAL Google OAuth popup.
 *
 * Not a modal anymore: this component uses @react-oauth/google's
 * useGoogleLogin hook which opens Google's actual account-picker window.
 * The parent (LoginPage / RegisterPage) just calls <GoogleAuthTrigger
 * onAuthenticate={fn} loading={bool} />, or can call triggerGoogleLogin()
 * from a ref-like approach. We export a hook for the cleanest integration.
 */
import { useGoogleLogin } from '@react-oauth/google';
import { useDispatch } from 'react-redux';
import { googleLoginUser } from './authSlice';

/**
 * useRealGoogleAuth — call `triggerLogin()` to open the real Google popup.
 *
 * @param {function} onSuccess  Called with { user, account_status } on success
 * @param {function} onError    Called with error string on failure
 * @returns {{ triggerLogin: function, loading: boolean }}
 */
export function useRealGoogleAuth({ onSuccess, onError }) {
  const dispatch = useDispatch();

  const login = useGoogleLogin({
    // 'implicit' flow: gives us an access_token immediately (no server exchange needed)
    flow: 'implicit',

    onSuccess: async (tokenResponse) => {
      try {
        // Fetch user's profile (email, name) from Google using the access token
        const resp = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });

        if (!resp.ok) {
          onError?.('Could not fetch Google profile. Please try again.');
          return;
        }

        const profile = await resp.json();
        // profile = { sub, email, name, given_name, picture, email_verified }

        // Send to SIMS backend → creates/finds user in PostgreSQL → returns JWT
        const result = await dispatch(
          googleLoginUser({
            credential: tokenResponse.access_token,
            email: profile.email,
            full_name: profile.name,
            google_id: profile.sub,
          })
        );

        if (googleLoginUser.fulfilled.match(result)) {
          onSuccess?.(result.payload);
        } else {
          onError?.(result.payload?.message || 'Google authentication failed. Please try again.');
        }
      } catch (err) {
        onError?.('Network error during Google sign-in. Please try again.');
      }
    },

    onError: (err) => {
      console.error('Google OAuth error:', err);
      onError?.('Google sign-in was cancelled or failed. Please try again.');
    },
  });

  return { triggerLogin: login };
}

// Legacy named export kept for backward compatibility — no longer needed as a modal
export const GoogleAuthModal = ({ isOpen }) => {
  if (!isOpen) return null;
  return null; // Real OAuth: no modal rendered — popup is opened by useRealGoogleAuth
};

export default GoogleAuthModal;
