'use client';

import { GoogleOAuthProvider as GoogleOAuthProviderComponent } from '@react-oauth/google';

export const GoogleOAuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <GoogleOAuthProviderComponent
      clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}
    >
      {children}
    </GoogleOAuthProviderComponent>
  );
};
