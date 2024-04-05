import { useRouter } from 'next/router';
import { useEffect, useState } from 'react'
import { useLocalStorage } from 'usehooks-ts';
import { SpotifyApi, AuthorizationCodeWithPKCEStrategy, AccessToken } from "@spotify/web-api-ts-sdk"
import to from 'await-to-js';

export default function useSpotify() {
  const { query: { code }, replace } = useRouter();
  const [sdk, setSdk] = useState<SpotifyApi | null>(null);
  const [accessToken, setAccessToken] = useLocalStorage<AccessToken | null>('accessToken', null)

  useEffect(() => {
    if (!code) return

    login();
  }, [code]);

  const login = async () => {
    const auth = new AuthorizationCodeWithPKCEStrategy(
      process.env.NEXT_PUBLIC_SPTFY_CLIENT_ID as string,
      `${process.env.NEXT_PUBLIC_SPTFY_REDIRECT_URI}`,
      [
        'user-read-email',
        'user-top-read',
        'playlist-modify-public',
        'playlist-modify-private'
      ]
    );

    const internalSdk = new SpotifyApi(auth, {});

    const [authError, authSuccess] = await to(internalSdk.authenticate());

    if (authError) {
      if (authError && authError.message && authError.message.includes("No verifier found in cache") && process?.env?.NODE_ENV === 'development') {
        console.warn('The following error is caused because of strict mode, authentication should be working.')
        console.error(authError);
      } else {
        console.error(authError);
      }
    }

    if (authSuccess?.authenticated) {
      setAccessToken(authSuccess.accessToken)
      setSdk(() => internalSdk);
      replace('/who')
    }
  }

  const logout = () => {
    sdk?.logOut();
    setSdk(null);
    setAccessToken(null);
    replace('/');
  }

  return {
    sdk,
    accessToken,
    login,
    logout
  };
}
