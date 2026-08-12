import connectDB from '@/config/database';
import User from '@/models/User';

import GoogleProvider from 'next-auth/providers/google';

export const authOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user: oauthUser }) {
      if (oauthUser?.email) {
        try {
          await connectDB();
          const mongoUser = await User.findOne({ email: oauthUser.email }).lean();
          if (mongoUser) {
            token.role = mongoUser.role;
            token.id = mongoUser._id.toString();
            console.log('[auth:jwt] Set token.id:', token.id, 'token.role:', token.role);
          } else {
            console.error('[auth:jwt] CRITICAL: User not found for email:', oauthUser.email);
          }
        } catch (err) {
          console.error('[auth:jwt] Error querying user:', err);
        }
      } else {
        // Token refresh (no oauthUser) — validate existing token.id still matches DB
        if (token.id) {
          try {
            await connectDB();
            const mongoUser = await User.findById(token.id).lean();
            if (!mongoUser) {
              console.error('[auth:jwt] CRITICAL: Token user no longer in DB, id:', token.id);
            }
          } catch (err) {
            console.error('[auth:jwt] Error during refresh validation:', err);
          }
        }
      }
      return token;
    },
    async signIn({ profile }) {
      await connectDB();
      const userExists = await User.findOne({ email: profile.email });
      if (!userExists) {
        const username = profile.name.slice(0, 20);
        await User.create({
          email: profile.email,
          username,
          image: profile.picture,
          role: 'client',
        });
        console.log('[auth:signIn] Created new user:', profile.email);
      }
      return true;
    },
    async session({ session }) {
      try {
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
          console.error('[auth:session] CRITICAL: User not found for email:', session.user.email);
          return session;
        }
        session.user.id = user._id.toString();
        session.user.role = user.role;
        session.user.name = user.agentName || user.username || session.user.name || '';
      } catch (err) {
        console.error('[auth:session] Error:', err);
      }
      return session;
    },
  },
};
